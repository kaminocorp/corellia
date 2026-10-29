package config

import (
	"os"
	"testing"
)

// unsetenv removes a variable for the test's duration and restores it after.
func unsetenv(t *testing.T, key string) {
	t.Helper()
	old, had := os.LookupEnv(key)
	_ = os.Unsetenv(key)
	t.Cleanup(func() {
		if had {
			_ = os.Setenv(key, old)
		}
	})
}
