import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/imalkaweerasundara/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outputDir = new URL("../tmp/smoke/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true
});

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Generate/i }).first().click();
  await page.getByRole("button", { name: /^object$/i }).click();
  await page.locator('aside[aria-label="Tools"] select').selectOption("castle");
  await page.locator(".map-canvas").click({ position: { x: 520, y: 360 } });
  await page.locator(".map-object").last().click();
  await page.getByLabel("Selected object").waitFor();

  const editorScreenshot = await page.screenshot({ fullPage: true });
  await writeFile(new URL("editor.png", outputDir), editorScreenshot);

  await page.getByRole("button", { name: /Export/i }).click();
  await page.getByRole("dialog", { name: /Export map/i }).waitFor();

  const exportScreenshot = await page.screenshot({ fullPage: true });
  await writeFile(new URL("export-dialog.png", outputDir), exportScreenshot);

  const report = {
    title: await page.locator('input[aria-label="Map title"]').inputValue(),
    terrainLayerCount: await page.locator('[data-layer="terrain"]').count(),
    objectLayerCount: await page.locator('[data-layer="objects"]').count(),
    selectedObjectInspectorCount: await page.getByLabel("Selected object").count(),
    exportDialogCount: await page.getByRole("dialog", { name: /Export map/i }).count(),
    status: await page.locator(".status-text").innerText()
  };

  await writeFile(new URL("report.json", outputDir), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
