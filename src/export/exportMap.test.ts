import { describe, expect, it } from "vitest";
import type { ExportFormat } from "../domain/mapTypes";
import { exportExtension } from "./exportMap";

describe("export formats", () => {
  it("documents the supported export formats", () => {
    const formats: ExportFormat[] = ["png", "jpeg", "pdf"];
    expect(formats).toEqual(["png", "jpeg", "pdf"]);
  });

  it("uses user-friendly file extensions", () => {
    expect(exportExtension("png")).toBe("png");
    expect(exportExtension("jpeg")).toBe("jpg");
    expect(exportExtension("pdf")).toBe("pdf");
  });
});
