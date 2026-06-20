import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { parseProject, serializeProject } from "./projectStorage";

describe("project storage", () => {
  it("serializes and parses project JSON", () => {
    const project = createDefaultProject({ seed: "storage" });
    const restored = parseProject(serializeProject(project));

    expect(restored.id).toBe(project.id);
    expect(restored.schemaVersion).toBe(1);
  });

  it("rejects invalid project JSON", () => {
    expect(() => parseProject("{\"schemaVersion\":2}")).toThrow("Invalid Fantasy Map Maker project file");
  });
});
