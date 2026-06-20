import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { createProjectFile, parseProject, projectFilename, serializeProject } from "./projectStorage";

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

  it("creates portable project filenames", () => {
    expect(projectFilename({ title: "The Broken Coast!" })).toBe("the-broken-coast.fmg.json");
    expect(projectFilename({ title: "   " })).toBe("fantasy-map.fmg.json");
  });

  it("creates shareable project files", async () => {
    const project = createDefaultProject({ seed: "share" });
    project.title = "Share Realm";
    const file = createProjectFile(project);

    expect(file.name).toBe("share-realm.fmg.json");
    expect(file.type).toBe("application/json");
    expect(parseProject(await file.text()).generator.seed).toBe("share");
  });
});
