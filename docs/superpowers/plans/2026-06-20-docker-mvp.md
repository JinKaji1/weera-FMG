# Docker MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Dockerized Fantasy Map Maker web app that can generate, edit, save, and export fantasy maps as `PNG`, `JPEG`, and `PDF`.

**Architecture:** Use a static Vite + React + TypeScript app served from a production Docker image. Keep the core map model, deterministic generation, editing tools, and export logic in pure TypeScript modules so they can later be reused by a hosted web app and native clients. Render the editable map with SVG-first layers for crisp export, with canvas conversion only at export time.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, SVG rendering, `seedrandom` or an equivalent deterministic PRNG, `html-to-image` or direct SVG serialization for raster export, `jspdf` for PDF export, Docker multi-stage build, nginx static serving.

---

## Source Notes

- Vite docs confirm the standard scripts: `dev` runs `vite`, `build` runs `vite build`, and `preview` runs `vite preview`.
- Vite docs confirm `vite build` outputs static production assets suitable for static hosting.
- The Docker image should build the Vite app in a Node stage and serve `dist/` from nginx in the runtime stage.

## File Structure

- Create `package.json`: scripts, runtime dependencies, dev dependencies, and project metadata.
- Create `index.html`: Vite HTML entry point.
- Create `vite.config.ts`: React plugin and test configuration.
- Create `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript compiler settings.
- Create `vitest.config.ts`: unit test config if not kept inside `vite.config.ts`.
- Create `Dockerfile`: multi-stage Docker build and static runtime image.
- Create `.dockerignore`: exclude dependencies, git data, and local build output.
- Create `src/main.tsx`: React root bootstrap.
- Create `src/App.tsx`: shell layout for toolbar, side panels, and map canvas.
- Create `src/styles.css`: global app layout and map editor styling.
- Create `src/domain/mapTypes.ts`: canonical project, layer, terrain, object, line, label, and export types.
- Create `src/domain/defaultProject.ts`: default empty project factory.
- Create `src/generation/prng.ts`: deterministic PRNG wrapper.
- Create `src/generation/generateMap.ts`: seeded base map generator.
- Create `src/editor/tools.ts`: tool definitions and brush/object metadata.
- Create `src/editor/applyBrush.ts`: pure terrain painting mutation helpers.
- Create `src/editor/objectEditing.ts`: pure object add, move, update, and delete helpers.
- Create `src/export/exportMap.ts`: `PNG`, `JPEG`, and `PDF` export helpers.
- Create `src/persistence/projectStorage.ts`: local save/load and project file import/export helpers.
- Create `src/components/Toolbar.tsx`: selected tool, undo/redo, save, and export actions.
- Create `src/components/LayerPanel.tsx`: layer visibility and style preset controls.
- Create `src/components/ToolPanel.tsx`: brush, object, line, shape, and label controls.
- Create `src/components/GeneratorPanel.tsx`: seed and generator controls.
- Create `src/components/MapCanvas.tsx`: editable SVG map renderer and pointer event routing.
- Create `src/components/ExportDialog.tsx`: export format, resolution, visible layer, and style choices.
- Create `src/test/render.tsx`: Testing Library helper.
- Create `src/test/setup.ts`: Vitest DOM matcher setup.
- Create tests beside modules as `*.test.ts` or `*.test.tsx`.

## Task 1: Scaffold Dockerized Vite App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create the package manifest**

Use this initial `package.json`:

```json
{
  "name": "weera-fmg",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "verify": "npm run test && npm run build"
  },
  "dependencies": {
    "html-to-image": "latest",
    "jspdf": "latest",
    "lucide-react": "latest",
    "react": "latest",
    "react-dom": "latest",
    "seedrandom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/seedrandom": "latest",
    "@vitejs/plugin-react": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Create the Vite config**

Use this `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
```

- [ ] **Step 3: Create TypeScript configs**

Use this `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

Use this `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

Use this `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create the initial app shell**

Use `index.html`, `src/main.tsx`, `src/App.tsx`, and `src/styles.css` to render a full-screen editor layout with a top toolbar, left tool panel, center map surface, and right layer/generator panel.

- [ ] **Step 5: Add Docker build**

Use this `Dockerfile`:

```Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Use this `.dockerignore`:

```text
.git
node_modules
dist
coverage
.DS_Store
*.log
```

- [ ] **Step 6: Verify scaffold**

Run:

```bash
npm install
npm run verify
docker build -t weera-fmg:dev .
```

Expected: tests pass, Vite build succeeds, Docker image builds.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig*.json src Dockerfile .dockerignore
git commit -m "feat: scaffold dockerized map maker app"
```

## Task 2: Define Map Project Domain

**Files:**
- Create: `src/domain/mapTypes.ts`
- Create: `src/domain/defaultProject.ts`
- Create: `src/domain/mapTypes.test.ts`

- [ ] **Step 1: Add failing domain tests**

Test that a new project has deterministic IDs, visible default layers, a square map size, and empty object collections.

- [ ] **Step 2: Implement map types**

Define terrain cells, terrain kind, elevation, resources, map objects, labels, paths, layer visibility, style preset, generator settings, and export settings.

- [ ] **Step 3: Implement default project factory**

Create `createDefaultProject()` returning a valid empty project with grass terrain, visible core layers, parchment style, and no placed objects.

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/domain/mapTypes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat: define editable map project model"
```

## Task 3: Seeded Base Map Generation

**Files:**
- Create: `src/generation/prng.ts`
- Create: `src/generation/generateMap.ts`
- Create: `src/generation/generateMap.test.ts`
- Modify: `src/domain/mapTypes.ts`

- [ ] **Step 1: Add failing generator tests**

Test that identical seeds produce identical terrain, different seeds produce different terrain, and generator settings affect sea, mountain, forest, river, road, and settlement density.

- [ ] **Step 2: Implement PRNG wrapper**

Expose `createPrng(seed: string)` with `next()`, `int(min, max)`, `pick(items)`, and `chance(probability)` helpers.

- [ ] **Step 3: Implement landmass generation**

Generate a grid from seeded noise-like layered random fields. Assign `sea`, `grass`, `mountain`, `forest`, `desert`, `marsh`, and resource cells based on elevation, moisture, and temperature approximations.

- [ ] **Step 4: Implement generated objects and paths**

Generate settlements, ports, ruins, landmarks, rivers, and roads as editable objects and line features. Keep all output in the same project model used by manual editing.

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/generation/generateMap.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/generation src/domain
git commit -m "feat: add deterministic map generation"
```

## Task 4: SVG Map Renderer

**Files:**
- Create: `src/components/MapCanvas.tsx`
- Create: `src/components/MapCanvas.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add renderer tests**

Test that terrain cells render by biome, object icons render on the object layer, labels render on the label layer, and hidden layers are omitted.

- [ ] **Step 2: Implement SVG layers**

Render groups in stable order: paper background, terrain, rivers, roads, regions/shapes, resources, objects, labels, grid, scale/decorations.

- [ ] **Step 3: Implement viewport basics**

Support fit-to-screen sizing, pan, zoom, and grid overlay without changing project data.

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/components/MapCanvas.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/MapCanvas.tsx src/components/MapCanvas.test.tsx src/App.tsx src/styles.css
git commit -m "feat: render layered fantasy map canvas"
```

## Task 5: Terrain Brush Editing

**Files:**
- Create: `src/editor/tools.ts`
- Create: `src/editor/applyBrush.ts`
- Create: `src/editor/applyBrush.test.ts`
- Create: `src/components/ToolPanel.tsx`
- Modify: `src/components/MapCanvas.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add brush tests**

Test painting one cell, painting with a larger brush, raise/lower elevation, and preserving unrelated cells.

- [ ] **Step 2: Implement brush metadata**

Define terrain brush IDs for raise, lower, sea, river, mountain, desert, forest, marsh, grass, other biomes, and resources.

- [ ] **Step 3: Implement pure brush application**

Create `applyBrush(project, brush, point, size)` returning a new project without mutating the original.

- [ ] **Step 4: Wire pointer painting**

Map pointer location to grid cell and apply the active brush while dragging.

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/editor/applyBrush.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/editor src/components src/App.tsx
git commit -m "feat: add terrain brush editing"
```

## Task 6: Object, Label, Line, And Shape Tools

**Files:**
- Create: `src/editor/objectEditing.ts`
- Create: `src/editor/objectEditing.test.ts`
- Modify: `src/components/ToolPanel.tsx`
- Modify: `src/components/MapCanvas.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add object editing tests**

Test adding, moving, updating, and removing cities, castles, towers, villages, bridges, ports, ruins, roads, monsters, landmarks, labels, lines, and shapes.

- [ ] **Step 2: Implement object helpers**

Create pure helpers for `addMapObject`, `moveMapObject`, `updateMapObject`, `removeMapObject`, `addLabel`, `addPath`, and `addShape`.

- [ ] **Step 3: Add object palette**

Group palette entries into settlements, structures, travel, danger, and landmarks.

- [ ] **Step 4: Wire map interactions**

Click places objects, drag moves selected objects, delete removes selected objects, and text input updates labels.

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/editor/objectEditing.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/editor src/components src/App.tsx
git commit -m "feat: add map object and annotation tools"
```

## Task 7: Generator And Layer Panels

**Files:**
- Create: `src/components/GeneratorPanel.tsx`
- Create: `src/components/LayerPanel.tsx`
- Create: `src/components/GeneratorPanel.test.tsx`
- Create: `src/components/LayerPanel.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add panel tests**

Test seed changes, map generation, style preset changes, layer toggles, and selective regeneration buttons.

- [ ] **Step 2: Implement generator controls**

Expose seed, map size, landmass style, sea level, biome distribution, mountain density, forest density, settlement density, river density, and road density.

- [ ] **Step 3: Implement layer controls**

Expose terrain, objects, labels, roads, rivers, grid, and decorations visibility toggles plus style preset selection.

- [ ] **Step 4: Implement selective regeneration**

Support regenerating labels, rivers, roads, settlements, and biomes while preserving user-created objects that are marked as manual.

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/components/GeneratorPanel.test.tsx src/components/LayerPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components src/App.tsx src/generation
git commit -m "feat: add generator and layer controls"
```

## Task 8: Project Save, Load, Import, And Export

**Files:**
- Create: `src/persistence/projectStorage.ts`
- Create: `src/persistence/projectStorage.test.ts`
- Create: `src/export/exportMap.ts`
- Create: `src/export/exportMap.test.ts`
- Create: `src/components/ExportDialog.tsx`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add persistence tests**

Test serializing a project, restoring a project, rejecting invalid project JSON, and preserving map version metadata.

- [ ] **Step 2: Add export tests**

Test that export helpers accept `PNG`, `JPEG`, and `PDF` settings and produce a downloadable blob with the expected MIME type.

- [ ] **Step 3: Implement project storage**

Use browser local storage for autosave and explicit project JSON download/upload for portable saves.

- [ ] **Step 4: Implement export dialog**

Support format, resolution, transparent background where valid, visible layers, and style preset selection.

- [ ] **Step 5: Implement export helpers**

Serialize SVG for crisp rendering, rasterize to `PNG` or `JPEG` for image export, and embed the rasterized map into `PDF`.

- [ ] **Step 6: Run tests**

```bash
npm run test -- src/persistence/projectStorage.test.ts src/export/exportMap.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/persistence src/export src/components src/App.tsx
git commit -m "feat: add project save load and export"
```

## Task 9: UX Polish And Verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `README.md`

- [ ] **Step 1: Add empty, loading, and error states**

Show clear states for generation in progress, failed import, failed export, and successful export.

- [ ] **Step 2: Add keyboard shortcuts**

Add undo, redo, delete selected object, save project, and export dialog shortcuts.

- [ ] **Step 3: Add README run instructions**

Document local development, Docker build, Docker run, project save/load, and export workflow.

- [ ] **Step 4: Run full verification**

```bash
npm run verify
docker build -t weera-fmg:dev .
docker run --rm -p 8080:80 weera-fmg:dev
```

Expected: app serves at `http://localhost:8080`, editor loads, generated maps are editable, and exports download.

- [ ] **Step 5: Commit**

```bash
git add src README.md
git commit -m "chore: polish docker mvp workflow"
```

## Execution Policy

- Keep commits small and task-scoped.
- Run the task-specific tests before each commit.
- Run `npm run verify` before pushing.
- Push to `main` only for documentation and bootstrap work until development branches are introduced.
- For implementation work after this plan, prefer feature branches named `codex/docker-mvp-<task>`.

## Self-Review

- Spec coverage: terrain painting, brushes, object placement, seeded generation, save/export/share, Inkarnate-style editing, and Azgaar-style layers/generation are covered by Tasks 2 through 9.
- Non-goals remain excluded: no RTS rules, no triggers, no AI opponent, no campaign editor, no political/economy/military/religion/trade simulation, no native apps.
- The first Docker iteration is covered by Tasks 1 and 9.
- The plan contains no `TBD` or open-ended placeholder steps.
