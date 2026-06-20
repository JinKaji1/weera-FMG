import { describe, expect, it } from "vitest";
import { generateMap } from "./generateMap";

describe("generateMap", () => {
  it("generates identical maps from identical seeds", () => {
    const a = generateMap({ seed: "same-seed", width: 20, height: 14 });
    const b = generateMap({ seed: "same-seed", width: 20, height: 14 });

    expect(a.terrain).toEqual(b.terrain);
    expect(a.objects).toEqual(b.objects);
    expect(a.paths).toEqual(b.paths);
  });

  it("generates different terrain from different seeds", () => {
    const a = generateMap({ seed: "alpha", width: 20, height: 14 });
    const b = generateMap({ seed: "beta", width: 20, height: 14 });

    expect(a.terrain).not.toEqual(b.terrain);
  });

  it("uses density settings to control generated feature counts", () => {
    const sparse = generateMap({ seed: "density", settlementDensity: 0.1, riverDensity: 0.1, roadDensity: 0.1 });
    const dense = generateMap({ seed: "density", settlementDensity: 0.8, riverDensity: 0.8, roadDensity: 0.8 });

    expect(dense.objects.length).toBeGreaterThan(sparse.objects.length);
    expect(dense.paths.length).toBeGreaterThan(sparse.paths.length);
  });

  it("creates substantial editable land on the default continent setting", () => {
    const project = generateMap({ seed: "land-ratio", width: 48, height: 36, landmass: "continent" });
    const landCount = project.terrain.filter((cell) => cell.terrain !== "sea").length;
    const ratio = landCount / project.terrain.length;

    expect(ratio).toBeGreaterThan(0.32);
    expect(project.labels.some((label) => label.text.includes("Sea") || label.text.includes("Bay") || label.text.includes("Gulf"))).toBe(true);
  });
});
