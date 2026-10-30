package session

import (
	"testing"
	"time"
)

func TestBusReplayAndLive(t *testing.T) {
	b := NewBus(3, func() time.Time { return time.Unix(0, 0) })
	for i := 0; i < 5; i++ {
		b.Publish("heartbeat", nil)
	}
	if b.Seq() != 5 {
		t.Fatalf("seq = %d", b.Seq())
	}
	ch, unsub := b.Subscribe(0, 16)
	defer unsub()
	// Only the last 3 are retained.
	for want := 3; want <= 5; want++ {
		it := <-ch
		if it.Seq != want {
			t.Fatalf("seq = %d, want %d", it.Seq, want)
		}
	}
	b.Publish("heartbeat", nil)
	if it := <-ch; it.Seq != 6 || it.Type != "heartbeat" {
		t.Fatalf("live item = %+v", it)
	}
}

func TestBusDropsSlowSubscriber(t *testing.T) {
	b := NewBus(10, nil)
	ch, unsub := b.Subscribe(0, 16)
	defer unsub()
	for i := 0; i < 100; i++ {
		b.Publish("heartbeat", nil)
	}
	closed := false
	deadline := time.After(2 * time.Second)
	for !closed {
		select {
		case _, ok := <-ch:
			if !ok {
				closed = true
			}
		case <-deadline:
			t.Fatal("slow subscriber not dropped")
		}
	}
}

func TestBusValidateDrops(t *testing.T) {
	b := NewBus(10, nil)
	var got error
	b.Validate = func(ev map[string]any) error {
		if ev["type"] == "bad" {
			return errTest
		}
		return nil
	}
	b.OnInvalid = func(_ map[string]any, err error) { got = err }
	if seq := b.Publish("bad", nil); seq != 0 || got != errTest {
		t.Fatalf("seq = %d, err = %v", seq, got)
	}
	if seq := b.Publish("good", nil); seq != 1 {
		t.Fatalf("seq = %d", seq)
	}
}

type testErr struct{}

func (testErr) Error() string { return "test" }

var errTest error = testErr{}
