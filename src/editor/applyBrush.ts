import type { MapProject, Point } from "../domain/mapTypes";
import type { BrushDefinition } from "./tools";

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function roundElevation(value: number) {
  return Number(value.toFixed(4));
}

export function applyBrush(project: MapProject, brush: BrushDefinition, point: Point, size: number): MapProject {
  const radius = Math.max(0.5, size / 2);

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    terrain: project.terrain.map((cell) => {
      if (distance({ x: cell.x + 0.5, y: cell.y + 0.5 }, point) > radius) return cell;
      if (brush.mode === "raise") return { ...cell, elevation: roundElevation(Math.min(1, cell.elevation + 0.08)) };
      if (brush.mode === "lower") return { ...cell, elevation: roundElevation(Math.max(0, cell.elevation - 0.08)) };
      if (brush.mode === "resource" && brush.resource) {
        return { ...cell, terrain: brush.terrain ?? cell.terrain, resource: brush.resource };
      }
      if (brush.mode === "terrain" && brush.terrain) {
        return { ...cell, terrain: brush.terrain, resource: undefined };
      }
      return cell;
    })
  };
}
