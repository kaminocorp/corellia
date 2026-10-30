// Package store is the file-backed persistence under CORELLIA_DATA_DIR:
// atomic JSON documents and append-only JSONL logs. Single process,
// single user; a mutex per store is enough.
package store

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Store is a directory of documents.
type Store struct {
	dir string
	mu  sync.Mutex
	// lastErr is the most recent write failure, cleared by the next
	// successful write. /healthz reports it: a store that cannot write
	// (the Docker volume owned by root, a full disk) used to log once per
	// turn while the session served as if nothing was wrong, and memory,
	// reminders and the transcript were lost on restart (review 2026-10-30
	// round 5).
	lastErr   error
	lastErrAt time.Time
}

// New creates the directory if needed and proves it is writable: a store
// that boots on a read-only directory would silently forget everything.
func New(dir string) (*Store, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("store: %w", err)
	}
	if err := probeWritable(dir); err != nil {
		return nil, fmt.Errorf("store: %s is not writable: %w (fix the owner or mode of the data directory; in Docker the /data volume must belong to the corellia user)", dir, err)
	}
	return &Store{dir: dir}, nil
}

// probeWritable creates and removes an empty file in dir.
func probeWritable(dir string) error {
	f, err := os.CreateTemp(dir, ".write-probe.*")
	if err != nil {
		return err
	}
	name := f.Name()
	f.Close()
	return os.Remove(name)
}

// Dir returns the directory.
func (s *Store) Dir() string { return s.dir }

// Err returns the last write failure and when it happened, or nil when the
// most recent write succeeded (or none has been attempted).
func (s *Store) Err() (error, time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.lastErr, s.lastErrAt
}

// Healthy reports whether the last write succeeded.
func (s *Store) Healthy() bool {
	err, _ := s.Err()
	return err == nil
}

// record notes the outcome of a write (called with the lock held).
func (s *Store) record(err error) error {
	if err != nil {
		s.lastErr = err
		s.lastErrAt = time.Now()
	} else {
		s.lastErr = nil
	}
	return err
}

func (s *Store) path(name string) string { return filepath.Join(s.dir, name) }

// WriteJSON atomically replaces name with v (temp file + rename).
func (s *Store) WriteJSON(name string, v any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	raw, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return s.record(s.writeAtomic(name, raw))
}

func (s *Store) writeAtomic(name string, raw []byte) error {
	tmp, err := os.CreateTemp(s.dir, name+".*.tmp")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	if _, err := tmp.Write(append(raw, '\n')); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return err
	}
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpName)
		return err
	}
	return os.Rename(tmpName, s.path(name))
}

// ReadJSON decodes name into v. A missing file leaves v untouched and
// returns nil.
func (s *Store) ReadJSON(name string, v any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	raw, err := os.ReadFile(s.path(name))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, v)
}

// AppendJSONL appends one JSON line.
func (s *Store) AppendJSONL(name string, v any) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	raw, err := json.Marshal(v)
	if err != nil {
		return err
	}
	f, err := os.OpenFile(s.path(name), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
	if err != nil {
		return s.record(err)
	}
	defer f.Close()
	_, err = f.Write(append(raw, '\n'))
	return s.record(err)
}

// ReadJSONL calls fn for every line (malformed lines are skipped). A
// missing file is not an error.
func (s *Store) ReadJSONL(name string, fn func(raw []byte) error) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	f, err := os.Open(s.path(name))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
	for sc.Scan() {
		line := sc.Bytes()
		if len(line) == 0 {
			continue
		}
		if err := fn(append([]byte(nil), line...)); err != nil {
			return err
		}
	}
	return sc.Err()
}
