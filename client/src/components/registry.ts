import { Chart } from "./Chart";
import { Card, Confirm, Image, List, Markdown, Stat, Status, Table, Timeline } from "./content";
import { Grid, Overlay, Split, Stack } from "./layout";
import { MapView } from "./Map";
import type { ComponentImpl } from "./types";

/**
 * The client component registry: one implementation per catalog entry.
 * registry.test.ts asserts the two sets are identical, so a catalog
 * addition without a component (or the reverse) fails the build.
 */
export const registry: Record<string, ComponentImpl> = {
  Stack,
  Grid,
  Split,
  Overlay,
  Card,
  Markdown,
  Stat,
  List,
  Table,
  Chart,
  Timeline,
  Image,
  Map: MapView,
  Confirm,
  Status,
};
