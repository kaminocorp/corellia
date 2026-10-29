// Package builtin registers Corellia's built-in tools: time, geocoding and
// weather (Open-Meteo, keyless), memory, reminders (gated), directions
// (gated, OSRM public router with a straight-line fallback) and show_ui.
package builtin

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/hejijunhao/corellia/backend/internal/runtime"
	"github.com/hejijunhao/corellia/backend/internal/tools"
)

// MemoryStore is what the memory tools need (Phase 9 provides the
// file-backed implementation; InMemory is the default).
type MemoryStore interface {
	Remember(ctx context.Context, text string, tags []string) (Note, error)
	Recall(ctx context.Context, query string, limit int) ([]Note, error)
	Forget(ctx context.Context, id string) (bool, error)
}

// Note is one memory entry.
type Note struct {
	ID   string    `json:"id"`
	Text string    `json:"text"`
	Tags []string  `json:"tags,omitempty"`
	At   time.Time `json:"at"`
}

// ReminderStore is what set_reminder needs.
type ReminderStore interface {
	Add(ctx context.Context, r Reminder) (Reminder, error)
}

// Reminder is a scheduled reminder.
type Reminder struct {
	ID   string    `json:"id"`
	Text string    `json:"text"`
	At   time.Time `json:"at"`
}

// Options configures the built-ins. Zero values are production defaults.
type Options struct {
	HTTP        *http.Client
	GeocodeURL  string // default https://geocoding-api.open-meteo.com/v1/search
	ForecastURL string // default https://api.open-meteo.com/v1/forecast
	OSRMURL     string // default https://router.project-osrm.org
	Now         func() time.Time
	Location    *time.Location
	Memory      MemoryStore
	Reminders   ReminderStore
	// UICheck validates a show_ui batch before it is reported to the
	// model and returns one message per rejected op (nil: no checking;
	// the session still validates every op before it reaches the screen).
	UICheck func(ops []json.RawMessage) []string
}

func (o *Options) defaults() {
	if o.HTTP == nil {
		o.HTTP = &http.Client{Timeout: 8 * time.Second}
	}
	if o.GeocodeURL == "" {
		o.GeocodeURL = "https://geocoding-api.open-meteo.com/v1/search"
	}
	if o.ForecastURL == "" {
		o.ForecastURL = "https://api.open-meteo.com/v1/forecast"
	}
	if o.OSRMURL == "" {
		o.OSRMURL = "https://router.project-osrm.org"
	}
	if o.Now == nil {
		o.Now = time.Now
	}
	if o.Location == nil {
		o.Location = time.Local
	}
	if o.Memory == nil {
		o.Memory = NewInMemory()
	}
	if o.Reminders == nil {
		o.Reminders = NewInMemory()
	}
}

// Register adds every built-in tool to the registry.
func Register(r *tools.Registry, o Options) {
	o.defaults()
	r.Register(timeTool(o))
	r.Register(geocodeTool(o))
	r.Register(weatherTool(o))
	r.Register(rememberTool(o))
	r.Register(recallTool(o))
	r.Register(forgetTool(o))
	r.Register(reminderTool(o))
	r.Register(directionsTool(o))
	r.Register(showUITool(o))
}

type m = map[string]any

func schema(s string) json.RawMessage { return json.RawMessage(s) }

func result(content string, data any, ops ...m) (runtime.ToolResult, error) {
	res := runtime.ToolResult{Content: content}
	if data != nil {
		raw, err := json.Marshal(data)
		if err != nil {
			return res, err
		}
		res.Data = raw
	}
	for _, op := range ops {
		raw, err := json.Marshal(op)
		if err != nil {
			return res, err
		}
		res.Ops = append(res.Ops, raw)
	}
	return res, nil
}

// --- time -------------------------------------------------------------

func timeTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "get_time",
		Description: "Current date and time. Optional IANA timezone (default: the display's local time).",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"properties":{"timezone":{"type":"string","maxLength":64}}}`),
		Run: func(_ context.Context, args map[string]any) (runtime.ToolResult, error) {
			loc := o.Location
			if tz, _ := args["timezone"].(string); tz != "" {
				l, err := time.LoadLocation(tz)
				if err != nil {
					return runtime.ToolResult{}, fmt.Errorf("unknown timezone %q", tz)
				}
				loc = l
			}
			now := o.Now().In(loc)
			return result(now.Format("15:04 on Monday 2 January 2006 (MST)"), m{
				"time": now.Format("15:04"), "date": now.Format("Mon 2 Jan"), "iso": now.Format(time.RFC3339),
				"weekday": now.Weekday().String(), "timezone": loc.String(),
			})
		},
	}
}

// --- geocode ----------------------------------------------------------

type place struct {
	Name     string  `json:"name"`
	Country  string  `json:"country"`
	Admin1   string  `json:"admin1,omitempty"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
	Timezone string  `json:"timezone,omitempty"`
}

func geocode(ctx context.Context, o Options, query string) (place, error) {
	u := o.GeocodeURL + "?" + url.Values{"name": {query}, "count": {"1"}, "language": {"en"}, "format": {"json"}}.Encode()
	var body struct {
		Results []struct {
			Name      string  `json:"name"`
			Country   string  `json:"country"`
			Admin1    string  `json:"admin1"`
			Latitude  float64 `json:"latitude"`
			Longitude float64 `json:"longitude"`
			Timezone  string  `json:"timezone"`
		} `json:"results"`
	}
	if err := getJSON(ctx, o.HTTP, u, &body); err != nil {
		return place{}, err
	}
	if len(body.Results) == 0 {
		return place{}, fmt.Errorf("no place found for %q", query)
	}
	r := body.Results[0]
	return place{Name: r.Name, Country: r.Country, Admin1: r.Admin1, Lat: r.Latitude, Lng: r.Longitude, Timezone: r.Timezone}, nil
}

func geocodeTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "geocode",
		Description: "Find the coordinates of a place by name (city, town, landmark). Returns name, country, lat, lng.",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"required":["query"],"properties":{"query":{"type":"string","minLength":1,"maxLength":120}}}`),
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			p, err := geocode(ctx, o, args["query"].(string))
			if err != nil {
				return runtime.ToolResult{}, err
			}
			return result(fmt.Sprintf("%s, %s is at %.4f, %.4f", p.Name, p.Country, p.Lat, p.Lng), p)
		},
	}
}

// --- weather ----------------------------------------------------------

var wmo = map[int]string{
	0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "rime fog",
	51: "light drizzle", 53: "drizzle", 55: "dense drizzle", 61: "light rain", 63: "rain", 65: "heavy rain",
	71: "light snow", 73: "snow", 75: "heavy snow", 80: "rain showers", 81: "rain showers", 82: "violent rain showers",
	95: "thunderstorm", 96: "thunderstorm with hail", 99: "thunderstorm with hail",
}

func describeWMO(code int) string {
	if d, ok := wmo[code]; ok {
		return d
	}
	return "unknown conditions"
}

func weatherTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "get_weather",
		Description: "Current weather and a 3-day outlook for a place name or coordinates.",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"properties":{"place":{"type":"string","maxLength":120},"latitude":{"type":"number"},"longitude":{"type":"number"}},"anyOf":[{"required":["place"]},{"required":["latitude","longitude"]}]}`),
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			lat, lng := 0.0, 0.0
			name := ""
			if p, _ := args["place"].(string); p != "" {
				pl, err := geocode(ctx, o, p)
				if err != nil {
					return runtime.ToolResult{}, err
				}
				lat, lng, name = pl.Lat, pl.Lng, pl.Name
			} else {
				lat, _ = args["latitude"].(float64)
				lng, _ = args["longitude"].(float64)
				name = fmt.Sprintf("%.2f, %.2f", lat, lng)
			}
			u := o.ForecastURL + "?" + url.Values{
				"latitude": {fmt.Sprint(lat)}, "longitude": {fmt.Sprint(lng)},
				"current":  {"temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m"},
				"daily":    {"temperature_2m_max,temperature_2m_min,weather_code"},
				"timezone": {"auto"}, "forecast_days": {"3"},
			}.Encode()
			var body struct {
				Current struct {
					Temperature float64 `json:"temperature_2m"`
					Code        int     `json:"weather_code"`
					Wind        float64 `json:"wind_speed_10m"`
					Humidity    float64 `json:"relative_humidity_2m"`
				} `json:"current"`
				Daily struct {
					Time []string  `json:"time"`
					Max  []float64 `json:"temperature_2m_max"`
					Min  []float64 `json:"temperature_2m_min"`
					Code []int     `json:"weather_code"`
				} `json:"daily"`
			}
			if err := getJSON(ctx, o.HTTP, u, &body); err != nil {
				return runtime.ToolResult{}, err
			}
			var days []m
			for i := range body.Daily.Time {
				d := m{"date": body.Daily.Time[i]}
				if i < len(body.Daily.Max) {
					d["max"] = body.Daily.Max[i]
				}
				if i < len(body.Daily.Min) {
					d["min"] = body.Daily.Min[i]
				}
				if i < len(body.Daily.Code) {
					d["conditions"] = describeWMO(body.Daily.Code[i])
				}
				days = append(days, d)
			}
			desc := describeWMO(body.Current.Code)
			data := m{"place": name, "temperature": body.Current.Temperature, "conditions": desc, "wind_kmh": body.Current.Wind, "humidity": body.Current.Humidity, "daily": days}
			content := fmt.Sprintf("%s: %.0f°C, %s, wind %.0f km/h, humidity %.0f%%", name, body.Current.Temperature, desc, body.Current.Wind, body.Current.Humidity)
			return result(content, data)
		},
	}
}

// --- memory -----------------------------------------------------------

func rememberTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "remember",
		Description: "Store a fact or preference to recall in later conversations.",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"required":["text"],"properties":{"text":{"type":"string","minLength":1,"maxLength":1000},"tags":{"type":"array","maxItems":8,"items":{"type":"string","maxLength":32}}}}`),
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			var tags []string
			if raw, ok := args["tags"].([]any); ok {
				for _, t := range raw {
					if s, ok := t.(string); ok {
						tags = append(tags, s)
					}
				}
			}
			n, err := o.Memory.Remember(ctx, args["text"].(string), tags)
			if err != nil {
				return runtime.ToolResult{}, err
			}
			return result("Remembered: "+n.Text, n)
		},
	}
}

func recallTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "recall",
		Description: "Search stored memories. Empty query lists the most recent.",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"properties":{"query":{"type":"string","maxLength":200},"limit":{"type":"integer","minimum":1,"maximum":50}}}`),
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			q, _ := args["query"].(string)
			limit := 10
			if l, ok := args["limit"].(float64); ok {
				limit = int(l)
			}
			notes, err := o.Memory.Recall(ctx, q, limit)
			if err != nil {
				return runtime.ToolResult{}, err
			}
			if len(notes) == 0 {
				return result("No memories match.", []Note{})
			}
			var lines []string
			for _, n := range notes {
				lines = append(lines, fmt.Sprintf("- [%s] %s", n.ID, n.Text))
			}
			return result(strings.Join(lines, "\n"), notes)
		},
	}
}

func forgetTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:            "forget",
		Description:     "Delete a stored memory by id.",
		InputSchema:     schema(`{"type":"object","additionalProperties":false,"required":["id"],"properties":{"id":{"type":"string","minLength":1,"maxLength":64}}}`),
		RequiresConfirm: true,
		Risk:            "low",
		Label:           func(a map[string]any) string { return "Forget memory " + fmt.Sprint(a["id"]) },
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			ok, err := o.Memory.Forget(ctx, args["id"].(string))
			if err != nil {
				return runtime.ToolResult{}, err
			}
			if !ok {
				return result("No such memory.", nil)
			}
			return result("Forgotten.", nil)
		},
	}
}

// --- reminders --------------------------------------------------------

// ParseWhen resolves `at` ("HH:MM" today or tomorrow if past, or RFC3339)
// or `in_minutes` relative to now.
func ParseWhen(now time.Time, at string, inMinutes float64) (time.Time, error) {
	if inMinutes > 0 {
		return now.Add(time.Duration(inMinutes * float64(time.Minute))), nil
	}
	if t, err := time.Parse(time.RFC3339, at); err == nil {
		return t, nil
	}
	if t, err := time.ParseInLocation("15:04", at, now.Location()); err == nil {
		when := time.Date(now.Year(), now.Month(), now.Day(), t.Hour(), t.Minute(), 0, 0, now.Location())
		if !when.After(now) {
			when = when.Add(24 * time.Hour)
		}
		return when, nil
	}
	return time.Time{}, fmt.Errorf("cannot parse time %q (use HH:MM, RFC3339 or in_minutes)", at)
}

// Duration says a number of minutes in words: "1 minute", "5 minutes",
// "1 hour", "1 hour 30 minutes", "2 hours" (review 2026-10-30 round 3:
// "in 1 minutes").
func Duration(minutes float64) string {
	total := int(math.Round(minutes))
	if total < 1 {
		return "under a minute"
	}
	h, m := total/60, total%60
	var parts []string
	if h > 0 {
		parts = append(parts, plural(h, "hour"))
	}
	if m > 0 {
		parts = append(parts, plural(m, "minute"))
	}
	return strings.Join(parts, " ")
}

func plural(n int, unit string) string {
	if n == 1 {
		return "1 " + unit
	}
	return fmt.Sprintf("%d %ss", n, unit)
}

func reminderTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:            "set_reminder",
		Description:     "Schedule a reminder that will be spoken and shown. Give `at` as HH:MM (24h, display's local time) or RFC3339, or `in_minutes`.",
		InputSchema:     schema(`{"type":"object","additionalProperties":false,"required":["text"],"properties":{"text":{"type":"string","minLength":1,"maxLength":300},"at":{"type":"string","maxLength":40},"in_minutes":{"type":"number","minimum":1,"maximum":10080}}}`),
		RequiresConfirm: true,
		Risk:            "low",
		Label: func(a map[string]any) string {
			if at, _ := a["at"].(string); at != "" {
				return fmt.Sprintf("Set a reminder for %s", at)
			}
			if mins, ok := a["in_minutes"].(float64); ok {
				return "Set a reminder in " + Duration(mins)
			}
			return "Set a reminder"
		},
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			at, _ := args["at"].(string)
			mins, _ := args["in_minutes"].(float64)
			when, err := ParseWhen(o.Now().In(o.Location), at, mins)
			if err != nil {
				return runtime.ToolResult{}, err
			}
			r, err := o.Reminders.Add(ctx, Reminder{Text: args["text"].(string), At: when})
			if err != nil {
				return runtime.ToolResult{}, err
			}
			label := when.In(o.Location).Format("15:04")
			if when.Sub(o.Now()) > 20*time.Hour {
				label = when.In(o.Location).Format("Mon 15:04")
			}
			return result(fmt.Sprintf("Reminder set for %s: %s", label, r.Text), r,
				m{"op": "add_node", "id": "status_reminder", "node": m{"type": "Overlay", "props": m{"position": "top_right"}, "slots": m{"content": []string{"status_reminder_text"}}}},
				m{"op": "add_node", "id": "status_reminder_text", "node": m{"type": "Status", "props": m{"level": "ok", "text": fmt.Sprintf("Reminder set for %s", label)}, "ttl_ms": 8000}},
			)
		},
	}
}

// --- directions -------------------------------------------------------

func directionsTool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "open_directions",
		Description: "Show a route on the map. `to` is a place name or [lat, lng]; `from` likewise (default: the office).",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"required":["to"],"properties":{"to":{"anyOf":[{"type":"string","maxLength":120},{"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2}]},"from":{"anyOf":[{"type":"string","maxLength":120},{"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2}]}}}`),
		// Draws on Corellia's own screen and changes nothing outside it, so
		// it runs without confirmation (rule 5; review 2026-10-30).
		RequiresConfirm: false,
		Risk:            "low",
		Label: func(a map[string]any) string {
			if s, ok := a["to"].(string); ok {
				return "Show directions to " + s
			}
			return "Show directions on the map"
		},
		Run: func(ctx context.Context, args map[string]any) (runtime.ToolResult, error) {
			to, toName, err := resolveLatLng(ctx, o, args["to"])
			if err != nil {
				return runtime.ToolResult{}, err
			}
			from, fromName := [2]float64{38.7223, -9.1393}, "Office"
			if args["from"] != nil {
				from, fromName, err = resolveLatLng(ctx, o, args["from"])
				if err != nil {
					return runtime.ToolResult{}, err
				}
			}
			route, distKm, err := osrmRoute(ctx, o, from, to)
			summary := fmt.Sprintf("Route from %s to %s", fromName, toName)
			if err != nil {
				route = [][2]float64{from, to}
				summary += " (straight line; routing unavailable)"
			} else {
				summary += fmt.Sprintf(", %.1f km", distKm)
			}
			center := [2]float64{(from[0] + to[0]) / 2, (from[1] + to[1]) / 2}
			data := m{"from": from, "to": to, "route": route, "distance_km": distKm}
			return result(summary, data,
				m{"op": "clear"},
				m{"op": "set_data", "value": m{"directions": data}},
				m{"op": "add_node", "id": "route_map", "node": m{"type": "Map", "props": m{"center": center, "zoom": 11, "route": m{"bind": "$.directions.route"},
					"markers": []m{{"position": from, "label": fromName}, {"position": to, "label": toName}}}}},
				m{"op": "set_root", "id": "route_map"},
				m{"op": "done"},
			)
		},
	}
}

func resolveLatLng(ctx context.Context, o Options, v any) ([2]float64, string, error) {
	switch x := v.(type) {
	case string:
		p, err := geocode(ctx, o, x)
		if err != nil {
			return [2]float64{}, "", err
		}
		return [2]float64{p.Lat, p.Lng}, p.Name, nil
	case []any:
		if len(x) == 2 {
			lat, ok1 := x[0].(float64)
			lng, ok2 := x[1].(float64)
			if ok1 && ok2 {
				return [2]float64{lat, lng}, fmt.Sprintf("%.3f, %.3f", lat, lng), nil
			}
		}
	}
	return [2]float64{}, "", fmt.Errorf("expected a place name or [lat, lng]")
}

func osrmRoute(ctx context.Context, o Options, from, to [2]float64) ([][2]float64, float64, error) {
	u := fmt.Sprintf("%s/route/v1/driving/%f,%f;%f,%f?overview=simplified&geometries=geojson", o.OSRMURL, from[1], from[0], to[1], to[0])
	var body struct {
		Code   string `json:"code"`
		Routes []struct {
			Distance float64 `json:"distance"`
			Geometry struct {
				Coordinates [][]float64 `json:"coordinates"`
			} `json:"geometry"`
		} `json:"routes"`
	}
	if err := getJSON(ctx, o.HTTP, u, &body); err != nil {
		return nil, 0, err
	}
	if body.Code != "Ok" || len(body.Routes) == 0 {
		return nil, 0, fmt.Errorf("osrm: %s", body.Code)
	}
	var pts [][2]float64
	for _, c := range body.Routes[0].Geometry.Coordinates {
		if len(c) == 2 {
			pts = append(pts, [2]float64{c[1], c[0]})
		}
	}
	return pts, body.Routes[0].Distance / 1000, nil
}

// --- show_ui ----------------------------------------------------------

// showUITool lets a runtime without native op emission put a validated
// spec on screen: its result carries the ops, which the session applies.
func showUITool(o Options) *tools.Tool {
	return &tools.Tool{
		Name:        "show_ui",
		Description: "Put a visual on screen: a list of spec ops (add_node, set_slot, set_data, set_root, done) built from the component catalog. Start with clear when replacing what is shown. The result lists any op that was rejected and why; fix and resend only those.",
		InputSchema: schema(`{"type":"object","additionalProperties":false,"required":["ops"],"properties":{"ops":{"type":"array","minItems":1,"maxItems":200,"items":{"type":"object"}}}}`),
		Run: func(_ context.Context, args map[string]any) (runtime.ToolResult, error) {
			raw, _ := args["ops"].([]any)
			var res runtime.ToolResult
			for _, op := range raw {
				b, err := json.Marshal(op)
				if err != nil {
					return runtime.ToolResult{}, err
				}
				res.Ops = append(res.Ops, b)
			}
			var rejected []string
			if o.UICheck != nil {
				rejected = o.UICheck(res.Ops)
			}
			switch {
			case len(rejected) == 0:
				res.Content = fmt.Sprintf("Displayed %d ops.", len(raw))
			case len(rejected) >= len(raw):
				res.Content = fmt.Sprintf("Nothing was displayed: all %d ops were rejected.\n%s", len(raw), strings.Join(rejected, "\n"))
			default:
				res.Content = fmt.Sprintf("Displayed %d of %d ops. Rejected:\n%s", len(raw)-len(rejected), len(raw), strings.Join(rejected, "\n"))
			}
			return res, nil
		},
	}
}

// --- helpers ----------------------------------------------------------

func getJSON(ctx context.Context, c *http.Client, u string, v any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "corellia/0.15 (+https://github.com/kaminocorp/corellia)")
	resp, err := c.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode/100 != 2 {
		return fmt.Errorf("%s: HTTP %d", req.URL.Host, resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(v)
}
