package tools

import (
	"crypto/rand"
	"encoding/hex"
)

func randomID(prefix string) string {
	var b [6]byte
	_, _ = rand.Read(b[:])
	return prefix + "_" + hex.EncodeToString(b[:])
}
