import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * The three entry points the roadmap names, in a real Chromium against the
 * Go server: the display renders and completes a turn on the local
 * runtime, the gallery renders every component, the debug pane shows the
 * stream. Any console error fails the test: a Content-Security-Policy
 * violation, a React render loop (the blank-display bug of 2026-10-29),
 * an off-contract event.
 */

/** Network noise that is not a client defect (tiles need the internet; headless has no GPU). */
const BENIGN = [/tile\.openstreetmap\.org/, /net::ERR_(INTERNET_DISCONNECTED|NAME_NOT_RESOLVED|CONNECTION|ADDRESS_UNREACHABLE|TIMED_OUT)/, /Failed to load resource: net::/, /WebGL|GPU process|swiftshader/i];

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  const record = (text: string) => {
    if (!BENIGN.some((re) => re.test(text))) errors.push(text);
  };
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") record(msg.text());
  });
  page.on("pageerror", (err) => record(`pageerror: ${err.message}`));
  return errors;
}

test("display renders, connects, and completes a turn on the local runtime", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  const input = page.getByLabel("Message");
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();
  await expect(page.getByTestId("connection")).toHaveText(/online/);
  await expect(page.getByTestId("runtime")).toHaveText("local demo");

  await input.fill("what time is it");
  await input.press("Enter");
  await expect(page.getByRole("list", { name: "Transcript" })).toContainText("what time is it");
  await expect(page.getByTestId("agent-state")).toHaveText("idle", { timeout: 20_000 });
  const agentLines = page.getByRole("list", { name: "Transcript" }).locator("li", { hasText: /^agent/ });
  await expect(agentLines.first()).toBeVisible();
  // Nothing of the 2026-10-29 blank-display bug: the input is still there after a full turn.
  await expect(input).toBeVisible();
  expect(errors).toEqual([]);
});

test("Enter sends a message without confirming the pending proposal", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/");
  const input = page.getByLabel("Message");
  await expect(page.getByTestId("connection")).toHaveText(/online/);

  await input.fill("remind me at 17:00 to call Ana");
  await input.press("Enter");
  const card = page.locator('[data-type="Confirm"]');
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("agent-state")).toHaveText("idle", { timeout: 20_000 });

  // Review item 3: this Enter used to send the message and confirm the card.
  await input.fill("what time is it");
  await input.press("Enter");
  await expect(page.getByRole("list", { name: "Transcript" })).toContainText("what time is it");
  await expect(page.getByTestId("agent-state")).toHaveText("idle", { timeout: 20_000 });
  await expect(card).toBeVisible();

  // Enter on the empty input is the confirmation.
  await expect(input).toHaveValue("");
  await input.press("Enter");
  await expect(card).toBeHidden({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test("gallery renders every content component", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/?gallery=1");
  await expect(page.getByRole("heading", { name: "Component gallery" })).toBeVisible();
  for (const type of ["Card", "Markdown", "Stat", "List", "Table", "Chart", "Timeline", "Image", "Map", "Confirm", "Status"]) {
    await expect(page.locator(`[data-node="ex_${type}"]`).first()).toBeAttached();
  }
  await expect(page.locator("canvas").first()).toBeAttached({ timeout: 20_000 }).catch(() => {
    /* no WebGL in this headless build: the Map falls back to a card, which is also fine */
  });
  expect(errors).toEqual([]);
});

test("debug pane shows the stream and no error is logged", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/?debug=1");
  await expect(page.getByText(/debug · seq \d+ · runtime local/)).toBeVisible();
  await expect(page.getByLabel("Message")).toBeFocused();
  expect(errors).toEqual([]);
});
