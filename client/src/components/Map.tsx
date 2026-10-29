import { useEffect, useRef, useState } from "react";

import { isTileError } from "./mapErrors";
import { Label, Panel } from "./primitives";
import type { ComponentImpl } from "./types";

type LatLng = [number, number];
type Marker = { position: LatLng; label?: string };

/**
 * MapLibre GL over OpenStreetMap raster tiles (keyless), darkened to fit
 * the display. Falls back to a static card when WebGL or the tiles are
 * unavailable (offline box, jsdom). Coordinates are [lat, lng] in the
 * catalog and [lng, lat] for MapLibre.
 */
export const MapView: ComponentImpl = ({ props }) => {
  const center = props.center as LatLng;
  const zoom = Number(props.zoom ?? 12);
  const markers = (props.markers as Marker[]) ?? [];
  const route = (props.route as LatLng[]) ?? [];
  const el = useRef<HTMLDivElement>(null);
  // A failure is tied to the inputs that produced it, so new inputs
  // (a different place, a retry) get a fresh map instead of the fallback.
  const inputsKey = JSON.stringify([center, zoom, markers, route]);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const failed = failure && failure.key === inputsKey ? failure.message : null;
  const setFailed = (message: string) => setFailure({ key: inputsKey, message });

  useEffect(() => {
    let disposed = false;
    let map: { remove(): void } | null = null;
    (async () => {
      try {
        const maplibre = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");
        if (disposed || !el.current) return;
        const m = new maplibre.Map({
          container: el.current,
          center: [center[1], center[0]],
          zoom,
          attributionControl: false,
          interactive: false,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [
              { id: "bg", type: "background", paint: { "background-color": "#000000" } },
              {
                id: "osm",
                type: "raster",
                source: "osm",
                paint: { "raster-saturation": -0.85, "raster-brightness-max": 0.55, "raster-contrast": 0.15 },
              },
            ],
          },
        });
        map = m;
        m.on("error", (e: { error?: Error; tile?: unknown; sourceId?: string }) => {
          // A single tile failing (offline for a moment, a 404) is not a
          // dead map: MapLibre retries and the rest of the map still shows.
          if (isTileError(e)) return;
          if (!disposed) setFailed(e.error?.message ?? "map error");
        });
        m.on("load", () => {
          if (route.length > 1) {
            m.addSource("route", {
              type: "geojson",
              data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.map(([lat, lng]) => [lng, lat]) } },
            });
            m.addLayer({ id: "route", type: "line", source: "route", paint: { "line-color": "#22c55e", "line-width": 3 } });
          }
          for (const mk of markers) {
            const dot = document.createElement("div");
            dot.className = "corellia-marker";
            dot.setAttribute("aria-label", mk.label ?? "marker");
            new maplibre.Marker({ element: dot }).setLngLat([mk.position[1], mk.position[0]]).addTo(m);
          }
        });
      } catch (e) {
        if (!disposed) setFailed(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      disposed = true;
      map?.remove();
    };
    // Re-create the map when the inputs change identity; props are plain JSON.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsKey]);

  if (failed) {
    return (
      <Panel className="h-full">
        <Label>Map unavailable</Label>
        <div className="mt-1 font-mono text-sm text-foreground">
          {center[0].toFixed(4)}, {center[1].toFixed(4)} · zoom {zoom}
        </div>
        {markers.map((m, i) => (
          <div key={i} className="text-sm text-muted-foreground">
            ⌖ {m.label ?? `${m.position[0].toFixed(3)}, ${m.position[1].toFixed(3)}`}
          </div>
        ))}
        <div className="mt-2 text-xs text-muted-foreground">{failed}</div>
      </Panel>
    );
  }
  return <div ref={el} className="h-full min-h-[16rem] w-full border border-border" role="img" aria-label="Map" />;
};
