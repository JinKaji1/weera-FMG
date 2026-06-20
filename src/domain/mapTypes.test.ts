import { describe, expect, it } from "vitest";
import { createDefaultProject } from "./defaultProject";

describe("createDefaultProject", () => {
  it("creates a visible editable square-ish map project", () => {
    const project = createDefaultProject({ seed: "alpha", width: 12, height: 10 });

    expect(project.id).toBe("project-alpha");
    expect(project.layers.terrain).toBe(true);
    expect(project.layers.objects).toBe(true);
    expect(project.layers.labels).toBe(true);
    expect(project.stylePreset).toBe("parchment");
    expect(project.terrain).toHaveLength(120);
    expect(project.objects).toEqual([]);
    expect(project.labels).toEqual([]);
    expect(project.paths).toEqual([]);
  });
});
