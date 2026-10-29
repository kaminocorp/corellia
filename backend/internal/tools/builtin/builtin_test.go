package builtin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/contract"
	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/tools"
	"github.com/hejijunhao/corellia/backend/internal/uispec"
)

func fakeAPIs(t *testing.T) *httptest.Server {
	t.Helper()
	mux := http.NewServeMux()
	mux.HandleFunc("/geocode", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("name") == "Nowhere" {
			_, _ = w.Write([]byte(`{"results":[]}`))
			return
		}
		_, _ = w.Write([]byte(`{"results":[{"name":"Lisbon","country":"Portugal","latitude":38.72,"longitude":-9.14,"timezone":"Europe/Lisbon"}]}`))
	})
	mux.HandleFunc("/forecast", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"current":{"temperature_2m":24.9,"weather_code":0,"wind_speed_10m":5,"relative_humidity_2m":35},"daily":{"time":["2026-10-29","2026-10-30"],"temperature_2m_max":[25.8,26.3],"temperature_2m_min":[12.5,14.3],"weather_code":[0,3]}}`))
	})
	mux.HandleFunc("/route/v1/driving/", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`{"code":"Ok","routes":[{"distance":12345,"geometry":{"coordinates":[[-9.14,38.72],[-9.10,38.75]]}}]}`))
	})
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv
}

func registry(t *testing.T) (*tools.Registry, *InMemory) {
	t.Helper()
	srv := fakeAPIs(t)
	store := NewInMemory()
	now := time.Date(2026, 10, 29, 14, 0, 0, 0, time.UTC)
	store.Now = func() time.Time { return now }
	r := tools.NewRegistry()
	Register(r, Options{
		HTTP: srv.Client(), GeocodeURL: srv.URL + "/geocode", ForecastURL: srv.URL + "/forecast", OSRMURL: srv.URL,
		Now: func() time.Time { return now }, Location: time.UTC, Memory: store, Reminders: store,
	})
	return r, store
}

func TestRegisteredNames(t *testing.T) {
	r, _ := registry(t)
	want := "forget,geocode,get_time,get_weather,open_directions,recall,remember,set_reminder,show_ui"
	if got := strings.Join(r.Names(), ","); got != want {
		t.Fatalf("names = %s", got)
	}
}

func TestTimeGeocodeWeather(t *testing.T) {
	r, _ := registry(t)
	ctx := context.Background()
	res, err := r.Call(ctx, "get_time", nil)
	if err != nil || !strings.Contains(res.Content, "14:00 on Thursday 29 October 2026") {
		t.Fatalf("time: %+v %v", res, err)
	}
	if _, err := r.Call(ctx, "get_time", map[string]any{"timezone": "Mars/Olympus"}); err == nil {
		t.Fatal("bad timezone accepted")
	}
	res, err = r.Call(ctx, "geocode", map[string]any{"query": "Lisbon"})
	if err != nil || !strings.Contains(res.Content, "38.7200, -9.1400") {
		t.Fatalf("geocode: %+v %v", res, err)
	}
	if _, err := r.Call(ctx, "geocode", map[string]any{"query": "Nowhere"}); err == nil {
		t.Fatal("missing place accepted")
	}
	res, err = r.Call(ctx, "get_weather", map[string]any{"place": "Lisbon"})
	if err != nil || !strings.Contains(res.Content, "25°C, clear sky") {
		t.Fatalf("weather: %+v %v", res, err)
	}
	var data map[string]any
	_ = json.Unmarshal(res.Data, &data)
	if len(data["daily"].([]any)) != 2 {
		t.Fatalf("daily = %v", data["daily"])
	}
	if _, err := r.Call(ctx, "get_weather", map[string]any{}); !errors.Is(err, tools.ErrInvalidArgs) {
		t.Fatalf("weather without location: %v", err)
	}
}

func TestMemoryTools(t *testing.T) {
	r, _ := registry(t)
	ctx := context.Background()
	res, _ := r.Call(ctx, "remember", map[string]any{"text": "Ana prefers oat milk", "tags": []any{"people"}})
	var note Note
	_ = json.Unmarshal(res.Data, &note)
	if note.ID == "" {
		t.Fatal("no note id")
	}
	res, _ = r.Call(ctx, "recall", map[string]any{"query": "oat"})
	if !strings.Contains(res.Content, "oat milk") {
		t.Fatalf("recall: %s", res.Content)
	}
	res, _ = r.Call(ctx, "recall", map[string]any{"query": "people"})
	if !strings.Contains(res.Content, "oat milk") {
		t.Fatalf("recall by tag: %s", res.Content)
	}
	_, err := r.Call(ctx, "forget", map[string]any{"id": note.ID})
	if !errors.Is(err, runtime.ErrRequiresConfirm) {
		t.Fatalf("forget should be gated: %v", err)
	}
	res, err = r.Execute(ctx, "forget", map[string]any{"id": note.ID})
	if err != nil || res.Content != "Forgotten." {
		t.Fatalf("forget: %+v %v", res, err)
	}
	res, _ = r.Call(ctx, "recall", map[string]any{})
	if res.Content != "No memories match." {
		t.Fatalf("after forget: %s", res.Content)
	}
}

func TestReminderAndDirectionsProduceValidOps(t *testing.T) {
	reg, err := contract.Load()
	if err != nil {
		t.Fatal(err)
	}
	v := uispec.NewValidator(reg)
	r, store := registry(t)
	ctx := context.Background()
	res, err := r.Call(ctx, "set_reminder", map[string]any{"text": "call Ana", "at": "17:00"})
	if !errors.Is(err, runtime.ErrRequiresConfirm) || res.Proposal.Label != "Set a reminder for 17:00" {
		t.Fatalf("proposal: %+v %v", res.Proposal, err)
	}
	res, err = r.Execute(ctx, "set_reminder", res.Proposal.Args)
	if err != nil || !strings.Contains(res.Content, "Reminder set for 17:00") {
		t.Fatalf("execute: %+v %v", res, err)
	}
	if rs := store.Reminders(); len(rs) != 1 || rs[0].At.Hour() != 17 {
		t.Fatalf("reminders = %+v", rs)
	}
	checkOps(t, reg, v, res.Ops)

	res, err = r.Execute(ctx, "open_directions", map[string]any{"to": "Lisbon"})
	if err != nil || !strings.Contains(res.Content, "12.3 km") {
		t.Fatalf("directions: %+v %v", res, err)
	}
	checkOps(t, reg, v, res.Ops)
	res, err = r.Execute(ctx, "open_directions", map[string]any{"to": []any{38.0, -9.0}, "from": []any{38.5, -9.2}})
	if err != nil {
		t.Fatal(err)
	}
	checkOps(t, reg, v, res.Ops)
}

func checkOps(t *testing.T, reg *contract.Registry, v *uispec.Validator, ops []json.RawMessage) {
	t.Helper()
	spec := uispec.New()
	for _, raw := range ops {
		op, err := reg.DecodeOp(raw)
		if err != nil {
			t.Fatalf("op %s: %v", raw, err)
		}
		if e := v.CheckOp(&spec, op); e != nil {
			t.Fatalf("op rejected: %v", e)
		}
		if err := uispec.Apply(&spec, op); err != nil {
			t.Fatal(err)
		}
	}
	if issues := v.CheckSpec(&spec); len(issues) != 0 {
		t.Fatalf("issues: %v", issues)
	}
}

func TestParseWhen(t *testing.T) {
	now := time.Date(2026, 10, 29, 14, 0, 0, 0, time.UTC)
	cases := []struct {
		at   string
		mins float64
		want string
		err  bool
	}{
		{"17:00", 0, "2026-10-29T17:00:00Z", false},
		{"09:30", 0, "2026-10-30T09:30:00Z", false},
		{"2026-11-01T08:00:00Z", 0, "2026-11-01T08:00:00Z", false},
		{"", 45, "2026-10-29T14:45:00Z", false},
		{"soon", 0, "", true},
	}
	for _, tc := range cases {
		got, err := ParseWhen(now, tc.at, tc.mins)
		if (err != nil) != tc.err {
			t.Errorf("ParseWhen(%q,%v) err = %v", tc.at, tc.mins, err)
			continue
		}
		if !tc.err && got.Format(time.RFC3339) != tc.want {
			t.Errorf("ParseWhen(%q,%v) = %s, want %s", tc.at, tc.mins, got.Format(time.RFC3339), tc.want)
		}
	}
}

func TestShowUI(t *testing.T) {
	r, _ := registry(t)
	res, err := r.Call(context.Background(), "show_ui", map[string]any{"ops": []any{map[string]any{"op": "clear"}, map[string]any{"op": "done"}}})
	if err != nil || len(res.Ops) != 2 || res.Content != "Displayed 2 ops." {
		t.Fatalf("show_ui: %+v %v", res, err)
	}
}

func TestShowUIReportsRejectedOps(t *testing.T) {
	r := tools.NewRegistry()
	Register(r, Options{UICheck: func(ops []json.RawMessage) []string {
		var out []string
		for i, op := range ops {
			if strings.Contains(string(op), "Iframe") {
				out = append(out, fmt.Sprintf("op %d (unknown_component): Iframe is not in the catalog", i))
			}
		}
		return out
	}})
	ops := []any{map[string]any{"op": "clear"}, map[string]any{"op": "add_node", "id": "x", "node": map[string]any{"type": "Iframe"}}, map[string]any{"op": "done"}}
	res, err := r.Call(context.Background(), "show_ui", map[string]any{"ops": ops})
	if err != nil || len(res.Ops) != 3 {
		t.Fatalf("show_ui: %+v %v", res, err)
	}
	if !strings.HasPrefix(res.Content, "Displayed 2 of 3 ops. Rejected:") || !strings.Contains(res.Content, "unknown_component") {
		t.Fatalf("content = %q", res.Content)
	}
	res, _ = r.Call(context.Background(), "show_ui", map[string]any{"ops": ops[1:2]})
	if !strings.HasPrefix(res.Content, "Nothing was displayed") {
		t.Fatalf("content = %q", res.Content)
	}
}
