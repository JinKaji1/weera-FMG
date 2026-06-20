import { describe, expect, it } from "vitest";
import { createDefaultProject } from "../domain/defaultProject";
import { addLabel, addMapObject, addPath, addShape, moveMapObject, removeMapObject, updateMapObject } from "./objectEditing";

describe("object editing helpers", () => {
  it("adds, moves, and removes map objects", () => {
    const withCity = addMapObject(createDefaultProject(), "city", { x: 3, y: 4 }, "Aster");
    const id = withCity.objects[0].id;
    const moved = moveMapObject(withCity, id, { x: 5, y: 6 });
    const removed = removeMapObject(moved, id);

    expect(withCity.objects[0]).toMatchObject({ kind: "city", name: "Aster", source: "manual" });
    expect(moved.objects[0]).toMatchObject({ x: 5, y: 6 });
    expect(removed.objects).toHaveLength(0);
  });

  it("updates map object presentation fields", () => {
    const withCity = addMapObject(createDefaultProject(), "city", { x: 3, y: 4 }, "Aster");
    const updated = updateMapObject(withCity, withCity.objects[0].id, {
      name: "Asterhold",
      rotation: 12,
      scale: 1.4
    });

    expect(updated.objects[0]).toMatchObject({
      name: "Asterhold",
      rotation: 12,
      scale: 1.4
    });
  });

  it("adds labels, paths, and shapes", () => {
    const project = createDefaultProject();
    const labeled = addLabel(project, { x: 1, y: 2 }, "North Sea");
    const pathed = addPath(labeled, "road", [{ x: 0, y: 0 }, { x: 2, y: 2 }]);
    const shaped = addShape(pathed, "region", [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]);

    expect(shaped.labels[0].text).toBe("North Sea");
    expect(shaped.paths[0].kind).toBe("road");
    expect(shaped.shapes[0].kind).toBe("region");
  });
});
