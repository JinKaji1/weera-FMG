import { createDefaultProject } from "../domain/defaultProject";
import type {
  GeneratorSettings,
  MapLabel,
  MapObject,
  MapProject,
  PathFeature,
  Point,
  ResourceKind,
  TerrainCell,
  TerrainKind
} from "../domain/mapTypes";
import { createPrng } from "./prng";

const realmNames = [
  "Eldervale",
  "Mournreach",
  "Asterfen",
  "Highmere",
  "Redwake",
  "Brackenfall",
  "Oathmere",
  "Saltspire",
  "Veyrholm",
  "Greybarrow"
];

const mountainNames = ["Frosthaul Peaks", "Kingsward Mountains", "Blackspine", "The White Teeth", "Stormwall"];
const forestNames = ["Silverpine Forest", "Whispering Woods", "Mossfen", "Briarwild", "The Greenroud"];
const seaNames = ["Greywater Gulf", "The Gilded Bay", "The Shivering Sea", "Saltmere", "Dawnwater"];

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function hashNoise(seed: string, x: number, y: number, salt: string) {
  const prng = createPrng(`${seed}:${salt}:${x}:${y}`);
  return prng.next();
}

function smoothNoise(seed: string, x: number, y: number, salt: string) {
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const fx = x - baseX;
  const fy = y - baseY;
  const a = hashNoise(seed, baseX, baseY, salt);
  const b = hashNoise(seed, baseX + 1, baseY, salt);
  const c = hashNoise(seed, baseX, baseY + 1, salt);
  const d = hashNoise(seed, baseX + 1, baseY + 1, salt);
  const top = a * (1 - fx) + b * fx;
  const bottom = c * (1 - fx) + d * fx;
  return top * (1 - fy) + bottom * fy;
}

function landShape(seed: string, x: number, y: number, settings: GeneratorSettings) {
  const cx = (settings.width - 1) / 2;
  const cy = (settings.height - 1) / 2;
  const nx = (x - cx) / Math.max(1, cx);
  const ny = (y - cy) / Math.max(1, cy);
  const central = 1 - clamp(Math.hypot(nx * 0.92, ny * 1.08));

  if (settings.landmass === "continent") return central * 0.54;

  const prng = createPrng(`${seed}:land-centers:${settings.landmass}`);
  const centerCount = settings.landmass === "islands" ? 4 : 8;
  let islands = 0;

  for (let i = 0; i < centerCount; i += 1) {
    const centerX = prng.next() * settings.width;
    const centerY = prng.next() * settings.height;
    const radius = (settings.landmass === "islands" ? 9 : 5) + prng.next() * 8;
    islands = Math.max(islands, 1 - Math.hypot(x - centerX, y - centerY) / radius);
  }

  return clamp(islands) * (settings.landmass === "islands" ? 0.62 : 0.5) + central * 0.16;
}

function terrainFor(cell: Omit<TerrainCell, "terrain">, settings: GeneratorSettings): TerrainKind {
  if (cell.elevation < settings.seaLevel) return "sea";
  if (cell.elevation > 1 - settings.mountainDensity * 0.38) return "mountain";
  if (cell.moisture > 0.72 && cell.elevation < 0.58) return "marsh";
  if (cell.temperature > 0.68 && cell.moisture < 0.42 + settings.biomeBias * 0.12) return "desert";
  if (cell.moisture > 1 - settings.forestDensity * 0.62) return "forest";
  if (cell.elevation > 0.68) return "hills";
  if (cell.temperature < 0.2 && cell.elevation > settings.seaLevel + 0.08) return "tundra";
  return "grass";
}

function resourceFor(cell: TerrainCell, seed: string): ResourceKind | undefined {
  const noise = hashNoise(seed, cell.x, cell.y, "resource");
  if (cell.terrain === "sea" && noise > 0.94) return "fish";
  if (cell.terrain === "mountain" && noise > 0.78) return noise > 0.94 ? "gems" : "ore";
  if (cell.terrain === "forest" && noise > 0.86) return "wood";
  if ((cell.terrain === "marsh" || cell.terrain === "grass") && noise > 0.96) return "herbs";
  return undefined;
}

function findCells(project: MapProject, predicate: (cell: TerrainCell) => boolean) {
  return project.terrain.filter(predicate);
}

function cellToPoint(cell: TerrainCell): Point {
  return { x: cell.x + 0.5, y: cell.y + 0.5 };
}

function nearestLand(project: MapProject, point: Point) {
  return [...project.terrain]
    .filter((cell) => cell.terrain !== "sea" && cell.terrain !== "river")
    .sort((a, b) => {
      const da = Math.hypot(a.x - point.x, a.y - point.y);
      const db = Math.hypot(b.x - point.x, b.y - point.y);
      return da - db;
    })[0];
}

function generateRiver(project: MapProject, start: TerrainCell, index: number): PathFeature {
  const points: Point[] = [cellToPoint(start)];
  let current = start;

  for (let i = 0; i < 18; i += 1) {
    const neighbors = project.terrain.filter(
      (cell) =>
        Math.abs(cell.x - current.x) <= 1 &&
        Math.abs(cell.y - current.y) <= 1 &&
        !(cell.x === current.x && cell.y === current.y)
    );
    const next = neighbors.sort((a, b) => a.elevation - b.elevation)[0];
    if (!next) break;
    points.push(cellToPoint(next));
    current = next;
    if (next.terrain === "sea") break;
  }

  return {
    id: `generated-river-${index}`,
    kind: "river",
    name: `River ${index + 1}`,
    points,
    source: "generated"
  };
}

export function generateMap(settings: Partial<GeneratorSettings> = {}): MapProject {
  const project = createDefaultProject(settings);
  const { generator } = project;
  const prng = createPrng(generator.seed);
  project.terrain = project.terrain.map((cell) => {
    const cx = (generator.width - 1) / 2;
    const cy = (generator.height - 1) / 2;
    const maxDistance = Math.hypot(cx, cy);
    const distance = Math.hypot(cell.x - cx, cell.y - cy) / maxDistance;
    const edgeDistance = Math.min(cell.x, cell.y, generator.width - 1 - cell.x, generator.height - 1 - cell.y);
    const oceanRim = (1 - clamp(edgeDistance / 5)) * (generator.landmass === "continent" ? 0.3 : 0.42);
    const edgeFalloff = Math.pow(distance, 1.65) * (generator.landmass === "continent" ? 0.28 : 0.34);
    const elevation = clamp(
      0.12 +
        landShape(generator.seed, cell.x, cell.y, generator) +
        smoothNoise(generator.seed, cell.x / 5, cell.y / 5, "elevation") * 0.28 +
        smoothNoise(generator.seed, cell.x / 13, cell.y / 13, "large") * 0.22 -
        edgeFalloff -
        oceanRim
    );
    const moisture = clamp(
      smoothNoise(generator.seed, cell.x / 8, cell.y / 8, "moisture") * 0.72 +
        (1 - distance) * 0.18
    );
    const temperature = clamp(
      1 - cell.y / Math.max(1, generator.height - 1) + smoothNoise(generator.seed, cell.x / 11, cell.y / 11, "temp") * 0.26
    );
    const baseCell = { ...cell, elevation, moisture, temperature };
    const terrain = terrainFor(baseCell, generator);
    const terrainCell = { ...baseCell, terrain };
    return { ...terrainCell, resource: resourceFor(terrainCell, generator.seed) };
  });

  const land = findCells(project, (cell) => cell.terrain !== "sea");
  if (land.length === 0) return project;
  const mountains = findCells(project, (cell) => cell.terrain === "mountain");
  const coasts = findCells(project, (cell) => {
    if (cell.terrain === "sea") return false;
    return project.terrain.some(
      (candidate) =>
        candidate.terrain === "sea" &&
        Math.abs(candidate.x - cell.x) <= 1 &&
        Math.abs(candidate.y - cell.y) <= 1
    );
  });

  const settlementCount = Math.max(3, Math.round(generator.settlementDensity * 18));
  const objects: MapObject[] = [];
  const labels: MapLabel[] = [];

  for (let i = 0; i < settlementCount; i += 1) {
    const cell = prng.pick(land);
    const kind = i % 5 === 0 ? "city" : i % 4 === 0 ? "castle" : "village";
    const name = prng.pick(realmNames);
    objects.push({
      id: `generated-${kind}-${i}`,
      kind,
      name,
      x: cell.x + 0.5,
      y: cell.y + 0.5,
      rotation: 0,
      scale: kind === "city" ? 1.2 : 1,
      source: "generated"
    });
    labels.push({
      id: `generated-label-${i}`,
      text: name,
      x: cell.x + 0.5,
      y: cell.y - 0.2,
      size: kind === "city" ? "large" : "medium",
      source: "generated"
    });
  }

  coasts.slice(0, Math.round(generator.settlementDensity * 6)).forEach((cell, index) => {
    if (!prng.chance(0.42)) return;
    objects.push({
      id: `generated-port-${index}`,
      kind: "port",
      name: `Harbor ${index + 1}`,
      x: cell.x + 0.5,
      y: cell.y + 0.5,
      rotation: 0,
      scale: 1,
      source: "generated"
    });
  });

  for (let i = 0; i < Math.max(4, Math.round(generator.settlementDensity * 14)); i += 1) {
    const cell = prng.pick(land);
    objects.push({
      id: `generated-site-${i}`,
      kind: prng.pick(["ruins", "tower", "monster", "landmark"] as const),
      name: `Site ${i + 1}`,
      x: cell.x + 0.5,
      y: cell.y + 0.5,
      rotation: prng.int(-16, 16),
      scale: 0.9,
      source: "generated"
    });
  }

  const rivers = mountains
    .sort((a, b) => b.elevation - a.elevation)
    .slice(0, Math.max(1, Math.round(generator.riverDensity * 8)))
    .map((cell, index) => generateRiver(project, cell, index));

  const roads: PathFeature[] = objects
    .filter((object) => object.kind === "city" || object.kind === "village" || object.kind === "castle")
    .slice(1)
    .map((object, index) => {
      const previous = objects[index];
      return {
        id: `generated-road-${index}`,
        kind: "road" as const,
        name: `Road ${index + 1}`,
        points: [
          { x: previous.x, y: previous.y },
          { x: (previous.x + object.x) / 2 + prng.next() * 2 - 1, y: (previous.y + object.y) / 2 + prng.next() * 2 - 1 },
          { x: object.x, y: object.y }
        ],
        source: "generated" as const
      };
    })
    .slice(0, Math.max(2, Math.round(generator.roadDensity * 16)));

  const compassCell = nearestLand(project, { x: generator.width * 0.72, y: generator.height * 0.2 });
  if (compassCell) {
    labels.push({
      id: "generated-region-label",
      text: `${prng.pick(realmNames)} Reach`,
      x: compassCell.x,
      y: compassCell.y,
      size: "large",
      source: "generated"
    });
  }

  const mountainCell = mountains[0];
  if (mountainCell) {
    labels.push({
      id: "generated-mountain-label",
      text: prng.pick(mountainNames),
      x: mountainCell.x,
      y: mountainCell.y,
      size: "medium",
      source: "generated"
    });
  }

  const forestCell = findCells(project, (cell) => cell.terrain === "forest")[0];
  if (forestCell) {
    labels.push({
      id: "generated-forest-label",
      text: prng.pick(forestNames),
      x: forestCell.x,
      y: forestCell.y,
      size: "medium",
      source: "generated"
    });
  }

  const seaCell = findCells(project, (cell) => cell.terrain === "sea")[0];
  if (seaCell) {
    labels.push({
      id: "generated-sea-label",
      text: prng.pick(seaNames),
      x: Math.max(3, seaCell.x + 4),
      y: Math.max(3, seaCell.y + 4),
      size: "large",
      source: "generated"
    });
  }

  return {
    ...project,
    title: `${prng.pick(realmNames)} Map`,
    terrain: project.terrain,
    objects,
    labels,
    paths: [...rivers, ...roads],
    updatedAt: new Date(0).toISOString()
  };
}
