export type TerrainKind =
  | "sea"
  | "river"
  | "mountain"
  | "desert"
  | "forest"
  | "marsh"
  | "grass"
  | "hills"
  | "tundra"
  | "resource";

export type ResourceKind = "wood" | "ore" | "gems" | "herbs" | "fish";

export type MapObjectKind =
  | "city"
  | "castle"
  | "tower"
  | "village"
  | "bridge"
  | "port"
  | "ruins"
  | "road"
  | "monster"
  | "landmark";

export type PathKind = "river" | "road" | "border" | "wall";
export type ShapeKind = "region" | "lake" | "forest" | "marsh" | "desert" | "custom";
export type StylePreset = "parchment" | "atlas" | "biome" | "ink";
export type ToolMode = "brush" | "object" | "label" | "line" | "shape" | "pan";
export type ExportFormat = "png" | "jpeg" | "pdf";

export interface Point {
  x: number;
  y: number;
}

export interface TerrainCell extends Point {
  terrain: TerrainKind;
  elevation: number;
  moisture: number;
  temperature: number;
  resource?: ResourceKind;
}

export interface MapLayers {
  terrain: boolean;
  resources: boolean;
  objects: boolean;
  labels: boolean;
  roads: boolean;
  rivers: boolean;
  grid: boolean;
  decorations: boolean;
}

export interface GeneratorSettings {
  seed: string;
  width: number;
  height: number;
  landmass: "islands" | "continent" | "archipelago";
  seaLevel: number;
  biomeBias: number;
  mountainDensity: number;
  forestDensity: number;
  settlementDensity: number;
  riverDensity: number;
  roadDensity: number;
}

export interface MapObject {
  id: string;
  kind: MapObjectKind;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  source: "generated" | "manual";
}

export interface MapLabel {
  id: string;
  text: string;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  source: "generated" | "manual";
}

export interface PathFeature {
  id: string;
  kind: PathKind;
  name: string;
  points: Point[];
  source: "generated" | "manual";
}

export interface ShapeFeature {
  id: string;
  kind: ShapeKind;
  name: string;
  points: Point[];
  source: "generated" | "manual";
}

export interface ExportSettings {
  format: ExportFormat;
  scale: number;
  transparentBackground: boolean;
  visibleLayers: MapLayers;
  stylePreset: StylePreset;
}

export interface MapProject {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  cellSize: number;
  generator: GeneratorSettings;
  stylePreset: StylePreset;
  layers: MapLayers;
  terrain: TerrainCell[];
  objects: MapObject[];
  labels: MapLabel[];
  paths: PathFeature[];
  shapes: ShapeFeature[];
}

export const DEFAULT_LAYERS: MapLayers = {
  terrain: true,
  resources: true,
  objects: true,
  labels: true,
  roads: true,
  rivers: true,
  grid: false,
  decorations: true
};

export const DEFAULT_GENERATOR: GeneratorSettings = {
  seed: "weera",
  width: 48,
  height: 36,
  landmass: "continent",
  seaLevel: 0.42,
  biomeBias: 0.5,
  mountainDensity: 0.28,
  forestDensity: 0.36,
  settlementDensity: 0.22,
  riverDensity: 0.22,
  roadDensity: 0.28
};

export function projectWidth(project: Pick<MapProject, "generator" | "cellSize">) {
  return project.generator.width * project.cellSize;
}

export function projectHeight(project: Pick<MapProject, "generator" | "cellSize">) {
  return project.generator.height * project.cellSize;
}
