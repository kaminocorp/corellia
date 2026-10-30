/**
 * The shared contract files, imported straight from shared/ so the client
 * never carries a copy that can drift. Vite bundles them; vitest reads
 * them from disk.
 */
import uiSpecSchema from "../../../shared/schema/ui-spec.schema.json";
import opsSchema from "../../../shared/schema/ops.schema.json";
import eventsSchema from "../../../shared/schema/events.schema.json";
import apiSchema from "../../../shared/schema/api.schema.json";
import catalogSchema from "../../../shared/schema/catalog.schema.json";
import catalogJson from "../../../shared/catalog/catalog.json";

import type { Catalog } from "./gen/catalog";

export const schemas = {
  uiSpec: uiSpecSchema,
  ops: opsSchema,
  events: eventsSchema,
  api: apiSchema,
  catalog: catalogSchema,
} as const;

export const catalog: Catalog = catalogJson as unknown as Catalog;
