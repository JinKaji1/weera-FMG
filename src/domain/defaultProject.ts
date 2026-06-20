import {
  DEFAULT_GENERATOR,
  DEFAULT_LAYERS,
  type GeneratorSettings,
  type MapProject,
  type TerrainCell
} from "./mapTypes";

export function createTerrainGrid(settings: GeneratorSettings): TerrainCell[] {
  const cells: TerrainCell[] = [];

  for (let y = 0; y < settings.height; y += 1) {
    for (let x = 0; x < settings.width; x += 1) {
      cells.push({
        x,
        y,
        terrain: "grass",
        elevation: 0.5,
        moisture: 0.5,
        temperature: 0.5
      });
    }
  }

  return cells;
}

export function createDefaultProject(overrides: Partial<GeneratorSettings> = {}): MapProject {
  const generator = { ...DEFAULT_GENERATOR, ...overrides };
  const now = new Date(0).toISOString();

  return {
    schemaVersion: 1,
    id: `project-${generator.seed}`,
    title: "Untitled Realm",
    createdAt: now,
    updatedAt: now,
    cellSize: 18,
    generator,
    stylePreset: "parchment",
    layers: { ...DEFAULT_LAYERS },
    terrain: createTerrainGrid(generator),
    objects: [],
    labels: [],
    paths: [],
    shapes: []
  };
}
