import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { applyBrush } from "./applyBrush";
import { terrainBrushes } from "./tools";

describe("applyBrush", () => {
  it("paints a terrain cell without mutating the project", () => {
    const project = createDefaultProject({ width: 6, height: 6 });
    const sea = terrainBrushes.find((brush) => brush.id === "sea");
    if (!sea) throw new Error("missing brush");

    const next = applyBrush(project, sea, { x: 2.5, y: 2.5 }, 1);

    expect(project.terrain.find((cell) => cell.x === 2 && cell.y === 2)?.terrain).toBe("grass");
    expect(next.terrain.find((cell) => cell.x === 2 && cell.y === 2)?.terrain).toBe("sea");
  });

  it("raises and lowers elevation", () => {
    const project = createDefaultProject({ width: 3, height: 3 });
    const raise = terrainBrushes.find((brush) => brush.id === "raise");
    const lower = terrainBrushes.find((brush) => brush.id === "lower");
    if (!raise || !lower) throw new Error("missing brush");

    const raised = applyBrush(project, raise, { x: 1.5, y: 1.5 }, 1);
    const lowered = applyBrush(raised, lower, { x: 1.5, y: 1.5 }, 1);

    expect(raised.terrain[4].elevation).toBeGreaterThan(project.terrain[4].elevation);
    expect(lowered.terrain[4].elevation).toBe(project.terrain[4].elevation);
  });
});
