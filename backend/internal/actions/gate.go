// Package actions is the propose/confirm gate (VISION.md 5.6). Anything
// with side effects becomes a Proposal; nothing executes until Confirm.
package actions

import (
	"context"
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/tools"
)

// Pending is a proposal waiting for a decision.
type Pending struct {
	runtime.Proposal
	TurnID    string
	CreatedAt time.Time
	ExpiresAt time.Time
	seq       int
}

var (
	ErrNotFound = errors.New("actions: proposal not found")
	ErrExpired  = errors.New("actions: proposal expired")
)

// Gate holds pending proposals and executes confirmed ones.
type Gate struct {
	mu       sync.Mutex
	pending  map[string]Pending
	registry *tools.Registry
	ttl      time.Duration
	now      func() time.Time
	seq      int
}

// New creates a gate; proposals expire after ttl.
func New(reg *tools.Registry, ttl time.Duration, now func() time.Time) *Gate {
	if ttl <= 0 {
		ttl = 2 * time.Minute
	}
	if now == nil {
		now = time.Now
	}
	return &Gate{pending: map[string]Pending{}, registry: reg, ttl: ttl, now: now}
}

// Propose records a proposal and returns it with timestamps.
func (g *Gate) Propose(turnID string, p runtime.Proposal) Pending {
	g.mu.Lock()
	defer g.mu.Unlock()
	now := g.now()
	g.seq++
	pd := Pending{Proposal: p, TurnID: turnID, CreatedAt: now, ExpiresAt: now.Add(g.ttl), seq: g.seq}
	if pd.Risk == "" {
		pd.Risk = "low"
	}
	g.pending[p.ID] = pd
	return pd
}

// Pending lists unexpired proposals, newest first.
func (g *Gate) Pending() []Pending {
	g.mu.Lock()
	defer g.mu.Unlock()
	now := g.now()
	var out []Pending
	for _, p := range g.pending {
		if p.ExpiresAt.After(now) {
			out = append(out, p)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].seq > out[j].seq })
	return out
}

// Latest returns the newest pending proposal.
func (g *Gate) Latest() (Pending, bool) {
	p := g.Pending()
	if len(p) == 0 {
		return Pending{}, false
	}
	return p[0], true
}

func (g *Gate) take(id string) (Pending, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	p, ok := g.pending[id]
	if !ok {
		return Pending{}, ErrNotFound
	}
	delete(g.pending, id)
	if !p.ExpiresAt.After(g.now()) {
		return p, ErrExpired
	}
	return p, nil
}

// Confirm executes the proposal's tool and removes it.
func (g *Gate) Confirm(ctx context.Context, id string) (Pending, runtime.ToolResult, error) {
	p, err := g.take(id)
	if err != nil {
		return p, runtime.ToolResult{}, err
	}
	res, err := g.registry.Execute(ctx, p.Tool, p.Args)
	return p, res, err
}

// Reject drops the proposal.
func (g *Gate) Reject(id string) (Pending, error) {
	return g.take(id)
}

// Expire removes proposals past their deadline and returns them.
func (g *Gate) Expire() []Pending {
	g.mu.Lock()
	defer g.mu.Unlock()
	now := g.now()
	var out []Pending
	for id, p := range g.pending {
		if !p.ExpiresAt.After(now) {
			out = append(out, p)
			delete(g.pending, id)
		}
	}
	return out
}
