package session

import (
	"encoding/json"
	"sync"
	"time"
)

// Item is one published event: its sequence number, its type and the
// encoded JSON (which already contains seq, ts and type).
type Item struct {
	Seq  int
	Type string
	Data []byte
}

// Bus is the session's event log and fan-out. It keeps the last capacity
// events for replay (SSE Last-Event-ID) and delivers new events to every
// subscriber. A subscriber that falls more than its buffer behind is
// dropped; the client reconnects and replays from its last seq.
type Bus struct {
	mu       sync.Mutex
	seq      int
	ring     []Item
	capacity int
	subs     map[*subscriber]struct{}
	now      func() time.Time
	// Validate, when set, is called with the event map before publishing.
	// A failure is reported through OnInvalid and the event is dropped,
	// which keeps the stream on-contract even if a producer has a bug.
	Validate  func(map[string]any) error
	OnInvalid func(ev map[string]any, err error)
}

type subscriber struct {
	ch   chan Item
	done chan struct{}
	once sync.Once
}

func (s *subscriber) close() {
	s.once.Do(func() { close(s.done) })
}

// NewBus creates a bus that remembers the last capacity events.
func NewBus(capacity int, now func() time.Time) *Bus {
	if capacity < 1 {
		capacity = 1
	}
	if now == nil {
		now = time.Now
	}
	return &Bus{capacity: capacity, subs: map[*subscriber]struct{}{}, now: now}
}

// Seq returns the sequence number of the last published event (0 if none).
func (b *Bus) Seq() int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.seq
}

// Publish stamps seq, ts and type onto ev, appends it to the log and
// delivers it. It returns the assigned seq (0 when dropped as invalid).
func (b *Bus) Publish(typ string, ev map[string]any) int {
	b.mu.Lock()
	defer b.mu.Unlock()
	if ev == nil {
		ev = map[string]any{}
	}
	ev["type"] = typ
	ev["seq"] = b.seq + 1
	ev["ts"] = b.now().UTC().Format(time.RFC3339Nano)
	data, err := json.Marshal(ev)
	if err != nil {
		if b.OnInvalid != nil {
			b.OnInvalid(ev, err)
		}
		return 0
	}
	if b.Validate != nil {
		// Validate the wire form (plain JSON types), not the Go values.
		var generic map[string]any
		verr := json.Unmarshal(data, &generic)
		if verr == nil {
			verr = b.Validate(generic)
		}
		if verr != nil {
			if b.OnInvalid != nil {
				b.OnInvalid(ev, verr)
			}
			return 0
		}
	}
	b.seq++
	item := Item{Seq: b.seq, Type: typ, Data: data}
	b.ring = append(b.ring, item)
	if len(b.ring) > b.capacity {
		b.ring = b.ring[len(b.ring)-b.capacity:]
	}
	for s := range b.subs {
		select {
		case s.ch <- item:
		default:
			// Too slow: drop the subscriber. It will reconnect and replay.
			delete(b.subs, s)
			s.close()
		}
	}
	return b.seq
}

// Subscribe returns a channel that first replays every retained event
// with seq > lastSeq, then streams live events. The returned function
// unsubscribes. When the subscriber is dropped by the bus the channel is
// closed.
func (b *Bus) Subscribe(lastSeq int, buffer int) (<-chan Item, func()) {
	if buffer < 16 {
		buffer = 16
	}
	s := &subscriber{ch: make(chan Item, buffer), done: make(chan struct{})}
	out := make(chan Item, buffer)
	b.mu.Lock()
	var replay []Item
	for _, it := range b.ring {
		if it.Seq > lastSeq {
			replay = append(replay, it)
		}
	}
	b.subs[s] = struct{}{}
	b.mu.Unlock()

	go func() {
		defer close(out)
		for _, it := range replay {
			select {
			case out <- it:
			case <-s.done:
				return
			}
		}
		for {
			select {
			case it := <-s.ch:
				select {
				case out <- it:
				case <-s.done:
					return
				}
			case <-s.done:
				return
			}
		}
	}()
	unsub := func() {
		b.mu.Lock()
		delete(b.subs, s)
		b.mu.Unlock()
		s.close()
	}
	return out, unsub
}
