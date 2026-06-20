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

## Run Locally

Install dependencies:

```bash
npm install --cache .npm-cache
```

Start the development server:

```bash
npm run dev
```

Verify the app:

```bash
npm run verify
```

Run the browser smoke test after the dev server is running:

```bash
npm run smoke:browser
```

The smoke test opens the editor, generates a seeded map, places a castle stamp, opens the export dialog, and writes screenshots to `tmp/smoke/`.

## Docker

Build the self-hostable image:

```bash
docker build -t weera-fmg:dev .
```

Run it:

```bash
docker run --rm -p 8080:80 weera-fmg:dev
```

Then open `http://localhost:8080`.

Or use Docker Compose:

```bash
docker compose up --build
```

The container serves the static Vite build through nginx with SPA fallback, long-lived asset caching, and a root-page healthcheck.

This environment currently does not have Docker available, so Docker runtime verification is limited to source review, production Vite build, and browser smoke testing until Docker is installed locally.

## Current MVP Slice

The first working slice includes:

- Vite + React + TypeScript app shell.
- Deterministic seeded generator.
- SVG map renderer with terrain, resources, objects, labels, rivers, roads, and grid layers.
- Terrain brushes for sea, river, mountain, desert, forest, marsh, grass, hills, and resources.
- Object stamp placement for cities, castles, towers, villages, bridges, ports, ruins, roads, monsters, and landmarks.
- Label, line, and shape creation tools.
- Layer toggles and style presets.
- Local project save/load and project JSON download/upload.
- Export dialog for `PNG`, `JPEG`, and `PDF`.
- Browser smoke test for the primary editor workflow.
- Draggable/selectable stamps with a selected-object inspector for name, scale, rotation, and delete.
- Two-click line creation for roads/rivers.
- Decorated SVG terrain details and coastline styling.
- Explicit line and shape type selectors for roads, rivers, borders, walls, regions, lakes, forests, marshes, deserts, and custom areas.
- Format-aware export handling for `PNG`, `JPG`, and `PDF`, including JPEG quality control.
- New map, undo, and redo controls.
- Keyboard escape clears selection or cancels line placement.
- Browser smoke coverage for new map, undo, redo, object placement, selected-object inspector, and PNG export download.
- Docker Compose self-hosting entrypoint and nginx runtime config.
- Export libraries are lazy-loaded only when exporting, reducing the initial app bundle.

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
