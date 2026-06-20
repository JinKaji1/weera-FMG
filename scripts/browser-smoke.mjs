import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const outputDir = new URL("../tmp/smoke/", import.meta.url);
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:5173/";
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true
});

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const initialTitle = await page.locator('input[aria-label="Map title"]').inputValue();
  await page.getByRole("button", { name: /^New$/i }).click();
  const newTitle = await page.locator('input[aria-label="Map title"]').inputValue();
  await page.getByRole("button", { name: /^Undo$/i }).click();
  const undoTitle = await page.locator('input[aria-label="Map title"]').inputValue();

  await page.getByRole("button", { name: /Generate/i }).first().click();
  await page.getByRole("button", { name: /^object$/i }).click();
  await page.getByLabel("Stamp type").selectOption("castle");
  const objectCountBeforePlacement = await page.locator(".map-object").count();
  await page.locator(".map-canvas").click({ position: { x: 520, y: 360 } });
  const objectCountAfterPlacement = await page.locator(".map-object").count();
  await page.getByRole("button", { name: /^Undo$/i }).click();
  const objectCountAfterUndo = await page.locator(".map-object").count();
  await page.getByRole("button", { name: /^Redo$/i }).click();
  await page.locator(".map-object").last().click();
  await page.getByLabel("Selected object").waitFor();

  const editorScreenshot = await page.screenshot({ fullPage: true });
  await writeFile(new URL("editor.png", outputDir), editorScreenshot);

  const pngExport = await downloadExport(page, "png");
  const jpegExport = await downloadExport(page, "jpeg");
  const pdfExport = await downloadExport(page, "pdf");

  const report = {
    initialTitle,
    newTitle,
    undoTitle,
    title: await page.locator('input[aria-label="Map title"]').inputValue(),
    terrainLayerCount: await page.locator('[data-layer="terrain"]').count(),
    objectLayerCount: await page.locator('[data-layer="objects"]').count(),
    selectedObjectInspectorCount: await page.getByLabel("Selected object").count(),
    objectCountBeforePlacement,
    objectCountAfterPlacement,
    objectCountAfterUndo,
    exports: {
      png: pngExport,
      jpeg: jpegExport,
      pdf: pdfExport
    },
    status: await page.locator(".status-text").innerText()
  };

  await writeFile(new URL("report.json", outputDir), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}

async function downloadExport(page, format) {
  await page.getByRole("button", { name: /Export/i }).click();
  await page.getByRole("dialog", { name: /Export map/i }).waitFor();
  await page.getByLabel("Format").selectOption(format);

  if (format === "png") {
    const exportScreenshot = await page.screenshot({ fullPage: true });
    await writeFile(new URL("export-dialog.png", outputDir), exportScreenshot);
  }

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download/i }).click();
  const download = await downloadPromise;
  const extension = format === "jpeg" ? "jpg" : format;
  const exportPath = fileURLToPath(new URL(`export.${extension}`, outputDir));
  await download.saveAs(exportPath);
  const exportStats = await stat(exportPath);

  return {
    filename: download.suggestedFilename(),
    bytes: exportStats.size
  };
}
