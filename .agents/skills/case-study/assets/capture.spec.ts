/**
 * Deterministic case-study capture.
 *
 * Copy into the project as `case-study/capture.spec.ts`, edit SLUG, BASE_URL and SHOTS,
 * then:
 *   npm i -D @playwright/test && npx playwright install chromium
 *   npx playwright test case-study/capture.spec.ts
 *
 * Stills land in case-study/assets/. Videos land in case-study/assets/raw-video/ and need
 * one ffmpeg pass each (see references/capture.md) to trim, scale, and compress.
 *
 * Rules this file exists to enforce:
 *   - the app runs against seeded synthetic data, never a real dataset
 *   - the clock is frozen, so timestamps do not change between runs
 *   - entry animations are disabled for stills, so nothing is caught mid-fade
 *   - the same shot can be re-taken months later when the UI changes
 */

import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const SLUG = "project-slug";
const BASE_URL = process.env.CASE_STUDY_URL ?? "http://localhost:3000";
const OUT = path.join("case-study", "assets");
const FROZEN_TIME = new Date("2026-03-12T10:24:00Z");

type Shot = {
  id: string;                       // "01-hero"
  path: string;                     // route to visit
  wait?: string;                    // selector that means "the page is ready"
  fullPage?: boolean;
  viewport?: { width: number; height: number };
  theme?: "light" | "dark";
  clip?: { x: number; y: number; width: number; height: number };
  setup?: (page: Page) => Promise<void>;   // clicks, filters, form fills before the shot
};

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const SHOTS: Shot[] = [
  {
    id: "01-hero",
    path: "/",
    wait: "main",
  },
  {
    id: "02-the-hard-screen",
    path: "/admin/orders",
    wait: "[data-testid=order-table] tbody tr",
    setup: async (page) => {
      // Drive the app into the state that is actually interesting, do not screenshot an
      // empty default view.
      await page.getByRole("button", { name: "Filters" }).click();
      await page.getByLabel("Status").selectOption("awaiting_dispatch");
      await page.getByRole("button", { name: "Apply" }).click();
      await page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok());
    },
  },
  {
    id: "05-mobile",
    path: "/",
    viewport: MOBILE,
    wait: "main",
  },
  {
    id: "06-dark",
    path: "/",
    theme: "dark",
    wait: "main",
  },
];

/** Kill motion and blinking cursors so two runs produce identical pixels. */
const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
  /* Hide anything that is inherently non-deterministic or unsafe to publish. */
  [data-capture-hide], .intercom-launcher, #hubspot-messages-iframe-container { display: none !important; }
`;

async function prepare(page: Page, shot: Shot) {
  await page.emulateMedia({ colorScheme: shot.theme ?? "light" });
  // page.clock requires Playwright >= 1.45; drop this block on older versions.
  if ("clock" in page) {
    await page.clock.setFixedTime(FROZEN_TIME);
  }
  await page.addStyleTag({ content: FREEZE_CSS });
}

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

for (const shot of SHOTS) {
  test(`still ${shot.id}`, async ({ page }) => {
    await page.setViewportSize(shot.viewport ?? DESKTOP);
    await page.goto(BASE_URL + shot.path, { waitUntil: "networkidle" });
    await prepare(page, shot);

    if (shot.wait) await page.waitForSelector(shot.wait, { state: "visible" });
    if (shot.setup) await shot.setup(page);
    await page.waitForTimeout(300); // let layout settle after setup

    // Guard: fail loudly if a real address slipped into the seeded data.
    const body = await page.textContent("body");
    expect(body ?? "", "a non-example email is visible in this shot").not.toMatch(
      /[a-zA-Z0-9._%+-]+@(?!example\.com)[a-zA-Z0-9.-]+\.[a-z]{2,}/,
    );

    await page.screenshot({
      path: path.join(OUT, `${SLUG}-${shot.id}.png`),
      fullPage: shot.fullPage ?? false,
      clip: shot.clip,
      scale: "device",
    });
  });
}

/**
 * Short recordings. Keep each under about 10 seconds and show one interaction cleanly.
 * Playwright writes webm; convert with ffmpeg afterwards.
 */
test.describe("recordings", () => {
  test.use({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
    video: { mode: "on", size: { width: 1440, height: 900 } },
  });

  test("04-filter-interaction", async ({ page }) => {
    await page.goto(BASE_URL + "/admin/orders", { waitUntil: "networkidle" });
    // No FREEZE_CSS here: the transitions are the point of the clip.
    if ("clock" in page) await page.clock.setFixedTime(FROZEN_TIME);
    await page.waitForSelector("[data-testid=order-table] tbody tr");

    await page.waitForTimeout(700);                       // a beat before the first move
    await page.getByRole("button", { name: "Filters" }).hover();
    await page.waitForTimeout(400);                       // show where the click lands
    await page.getByRole("button", { name: "Filters" }).click();
    await page.waitForTimeout(600);
    await page.getByLabel("Status").selectOption("awaiting_dispatch");
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "Apply" }).click();
    await page.waitForResponse((r) => r.url().includes("/api/orders") && r.ok());
    await page.waitForTimeout(1200);                      // let the reflow finish on screen
  });
});

/*
 * playwright.config.ts additions this file expects:
 *
 *   use: {
 *     baseURL: process.env.CASE_STUDY_URL ?? "http://localhost:3000",
 *     deviceScaleFactor: 2,
 *     colorScheme: "light",
 *     timezoneId: "UTC",
 *     locale: "en-US",
 *   },
 *   outputDir: "case-study/assets/raw-video",
 *   webServer: {                       // so the run is one command
 *     command: "npm run dev",
 *     url: "http://localhost:3000",
 *     reuseExistingServer: true,
 *   },
 *
 * After the run:
 *   ffmpeg -ss 0.5 -to 8.5 -i case-study/assets/raw-video/<...>/video.webm \
 *     -vf "scale=1440:-2,fps=30" -an -c:v libx264 -crf 23 -preset slow -movflags +faststart \
 *     case-study/assets/<slug>-04-filter-interaction.mp4
 *   npx sharp-cli -i case-study/assets/<slug>-01-hero.png -o case-study/assets/<slug>-01-hero.webp \
 *     resize 2400 --withoutEnlargement -f webp -q 85
 *   rm -rf case-study/assets/raw-video case-study/assets/*.png
 */
