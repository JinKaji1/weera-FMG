# Fantasy Map Maker

Fantasy Map Maker is a self-hostable map creation app focused on producing finished fantasy maps as image or document exports.

## MVP Goal

Build a map creator, not a game editor. The MVP should let a user paint, decorate, generate, save, and export a fantasy map as `PNG`, `JPEG`, or `PDF`.

## First Iteration

The first implementation target is a Dockerized web app:

- Single-container self-hosted app.
- Browser-based editor.
- Deterministic seeded map generation.
- Editable project files.
- Final exports as image or document files.

## MVP Features

### Inspiration Sources

- Inkarnate-inspired workflow:
  - Polished fantasy art direction by default.
  - Stamp-style placement for landmarks, settlements, ruins, monsters, and decorations.
  - Line and shape tools for roads, borders, walls, rivers, coast embellishments, and region outlines.
  - High-resolution export as a first-class feature, not an afterthought.
  - Reusable or cloneable map templates once sharing exists.
- Azgaar-inspired workflow:
  - Seeded procedural generation that creates a coherent editable starting map.
  - Layer-based controls for terrain, biomes, rivers, roads/routes, icons, labels, grids, scale bars, and decorative overlays.
  - Style presets such as parchment, political, physical, biome, and clean atlas views.
  - Regenerate selected map systems without destroying the whole project, such as rivers, labels, settlements, or routes.
  - Editable generated data: users should be able to revise the generated map by hand.

### Canvas And Terrain

- Tile or terrain painting on a map canvas.
- Adjustable brush size and brush mode.
- Layer visibility controls for terrain, objects, labels, roads, rivers, grid, and decorations.
- Style presets for the rendered map.
- Terrain brushes:
  - Raise/lower
  - Sea
  - River
  - Mountain
  - Desert
  - Forest
  - Marsh
  - Grass
  - Other biomes
  - Resources

### Object Placement

- Place, move, and remove map objects.
- Stamp/object palette with search and categories.
- Label tool for places, regions, landmarks, seas, rivers, and roads.
- Line tool for roads, rivers, borders, walls, and coast details.
- Shape tool for regions, lakes, districts, forests, marshes, deserts, and custom areas.
- Object types:
  - Cities
  - Castles
  - Towers
  - Villages
  - Bridges
  - Ports/docks
  - Ruins
  - Roads
  - Monsters
  - Landmarks

### Generation

- Generate a random map from a user-provided seed.
- Reusing the same seed should reproduce the same base map.
- Generated maps should remain editable with all terrain and object tools.
- Generator controls:
  - Map size
  - Landmass style
  - Sea level
  - Biome distribution
  - Mountain density
  - Forest density
  - Settlement density
  - River density
  - Road density
- Regenerate individual layers where possible, starting with labels, rivers, roads, settlements, and biomes.

### Save, Export, Share

- Save editable map projects.
- Export final maps as:
  - `PNG`
  - `JPEG`
  - `PDF`
- Export controls:
  - Resolution
  - Format
  - Background or transparent background where supported
  - Visible layers
  - Paper/style preset
- Share exported maps or share a project file/link, depending on the first deployment model.

## Non-Goals For MVP

- No playable RTS rules.
- No unit scripting or trigger system.
- No AI opponent/editor.
- No campaign editor.
- No custom game logic.
- No political, military, religion, economy, population, or trade simulation in the MVP.
- No mobile/macOS native app yet.

## Product Direction

The first version should feel like a practical cartography tool: fast to paint, easy to decorate, deterministic when generating from a seed, and reliable at producing polished exports.
