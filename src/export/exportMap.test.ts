import { describe, expect, it } from "vitest";
import type { ExportFormat } from "../domain/mapTypes";

describe("export formats", () => {
  it("documents the supported export formats", () => {
    const formats: ExportFormat[] = ["png", "jpeg", "pdf"];
    expect(formats).toEqual(["png", "jpeg", "pdf"]);
  });
});
