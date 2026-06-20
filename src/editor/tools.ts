import type { MapObjectKind, PathKind, ResourceKind, ShapeKind, TerrainKind, ToolMode } from "../domain/mapTypes";

export interface BrushDefinition {
  id: string;
  label: string;
  terrain?: TerrainKind;
  resource?: ResourceKind;
  mode: "terrain" | "raise" | "lower" | "resource";
}

export const terrainBrushes: BrushDefinition[] = [
  { id: "raise", label: "Raise", mode: "raise" },
  { id: "lower", label: "Lower", mode: "lower" },
  { id: "sea", label: "Sea", mode: "terrain", terrain: "sea" },
  { id: "river", label: "River", mode: "terrain", terrain: "river" },
  { id: "mountain", label: "Mountain", mode: "terrain", terrain: "mountain" },
  { id: "desert", label: "Desert", mode: "terrain", terrain: "desert" },
  { id: "forest", label: "Forest", mode: "terrain", terrain: "forest" },
  { id: "marsh", label: "Marsh", mode: "terrain", terrain: "marsh" },
  { id: "grass", label: "Grass", mode: "terrain", terrain: "grass" },
  { id: "hills", label: "Hills", mode: "terrain", terrain: "hills" },
  { id: "resource-ore", label: "Ore", mode: "resource", terrain: "resource", resource: "ore" },
  { id: "resource-wood", label: "Wood", mode: "resource", terrain: "resource", resource: "wood" },
  { id: "resource-fish", label: "Fish", mode: "resource", terrain: "resource", resource: "fish" }
];

export const objectKinds: MapObjectKind[] = [
  "city",
  "castle",
  "tower",
  "village",
  "bridge",
  "port",
  "ruins",
  "road",
  "monster",
  "landmark"
];

export const pathKinds: PathKind[] = ["river", "road", "border", "wall"];
export const shapeKinds: ShapeKind[] = ["region", "lake", "forest", "marsh", "desert", "custom"];
export const toolModes: ToolMode[] = ["brush", "object", "label", "line", "shape", "pan"];
