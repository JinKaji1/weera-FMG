import type { MapLabel, MapObject, MapObjectKind, MapProject, PathFeature, PathKind, Point, ShapeFeature, ShapeKind } from "../domain/mapTypes";

function nextId(prefix: string, existingCount: number) {
  return `${prefix}-${existingCount + 1}-${Date.now().toString(36)}`;
}

export function addMapObject(project: MapProject, kind: MapObjectKind, point: Point, name: string = kind): MapProject {
  const object: MapObject = {
    id: nextId(kind, project.objects.length),
    kind,
    name,
    x: point.x,
    y: point.y,
    rotation: 0,
    scale: 1,
    source: "manual"
  };
  return { ...project, objects: [...project.objects, object], updatedAt: new Date().toISOString() };
}

export function moveMapObject(project: MapProject, id: string, point: Point): MapProject {
  return {
    ...project,
    objects: project.objects.map((object) => (object.id === id ? { ...object, x: point.x, y: point.y } : object)),
    updatedAt: new Date().toISOString()
  };
}

export function removeMapObject(project: MapProject, id: string): MapProject {
  return {
    ...project,
    objects: project.objects.filter((object) => object.id !== id),
    updatedAt: new Date().toISOString()
  };
}

export function addLabel(project: MapProject, point: Point, text: string): MapProject {
  const label: MapLabel = {
    id: nextId("label", project.labels.length),
    text,
    x: point.x,
    y: point.y,
    size: "medium",
    source: "manual"
  };
  return { ...project, labels: [...project.labels, label], updatedAt: new Date().toISOString() };
}

export function addPath(project: MapProject, kind: PathKind, points: Point[], name = kind): MapProject {
  const path: PathFeature = {
    id: nextId(kind, project.paths.length),
    kind,
    name,
    points,
    source: "manual"
  };
  return { ...project, paths: [...project.paths, path], updatedAt: new Date().toISOString() };
}

export function addShape(project: MapProject, kind: ShapeKind, points: Point[], name = kind): MapProject {
  const shape: ShapeFeature = {
    id: nextId(kind, project.shapes.length),
    kind,
    name,
    points,
    source: "manual"
  };
  return { ...project, shapes: [...project.shapes, shape], updatedAt: new Date().toISOString() };
}
