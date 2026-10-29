/** How the runtime is named in the header; the local runtime is a scripted demo and says so. */
export function runtimeLabel(runtime: string | undefined): string {
  if (!runtime) return "";
  return runtime === "local" ? "local demo" : runtime;
}
