import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_LAYERS,
  type ExportFormat,
  type GeneratorSettings,
  type MapObject,
  type MapObjectKind,
  type MapProject,
  type PathKind,
  type Point,
  type ShapeKind,
  type ToolMode
} from "./domain/mapTypes";
import { applyBrush } from "./editor/applyBrush";
import { addLabel, addMapObject, addPath, addShape, moveMapObject, removeMapObject, updateMapObject } from "./editor/objectEditing";
import { terrainBrushes, type BrushDefinition } from "./editor/tools";
import { downloadBlob, exportExtension, exportMapBlob } from "./export/exportMap";
import { generateMap } from "./generation/generateMap";
import { createProjectFile, downloadText, loadProject, parseProject, projectFilename, saveProject, serializeProject } from "./persistence/projectStorage";
import { ExportDialog } from "./components/ExportDialog";
import { GeneratorPanel } from "./components/GeneratorPanel";
import { LayerPanel } from "./components/LayerPanel";
import { MapCanvas } from "./components/MapCanvas";
import { Toolbar } from "./components/Toolbar";
import { ToolPanel } from "./components/ToolPanel";
import "./styles.css";

function initialProject() {
  try {
    return loadProject() ?? generateMap();
  } catch {
    return generateMap();
  }
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

export default function App() {
  const [project, setProject] = useState<MapProject>(() => initialProject());
  const [pastProjects, setPastProjects] = useState<MapProject[]>([]);
  const [futureProjects, setFutureProjects] = useState<MapProject[]>([]);
  const [mode, setMode] = useState<ToolMode>("brush");
  const [brush, setBrush] = useState<BrushDefinition>(terrainBrushes[0]);
  const [brushSize, setBrushSize] = useState(2);
  const [objectKind, setObjectKind] = useState<MapObjectKind>("city");
  const [pathKind, setPathKind] = useState<PathKind>("road");
  const [shapeKind, setShapeKind] = useState<ShapeKind>("region");
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [status, setStatus] = useState("Ready");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState(2);
  const [exportQuality, setExportQuality] = useState(0.92);
  const [transparent, setTransparent] = useState(false);
  const [pendingPathStart, setPendingPathStart] = useState<Point>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const selectedObject = useMemo(
    () => project.objects.find((object) => object.id === selectedObjectId),
    [project.objects, selectedObjectId]
  );

  function updateProject(next: MapProject, message: string) {
    setPastProjects((past) => [...past.slice(-24), project]);
    setFutureProjects([]);
    setProject(next);
    setStatus(message);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
      const isRedo =
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") ||
        ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "z");

      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (isRedo) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key === "Escape") {
        setPendingPathStart(undefined);
        setSelectedObjectId(undefined);
        setStatus("Selection cleared");
        return;
      }

      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!selectedObjectId) return;
      event.preventDefault();
      updateProject(removeMapObject(project, selectedObjectId), "Deleted selected object");
      setSelectedObjectId(undefined);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [futureProjects, pastProjects, project, selectedObjectId]);

  function handleUndo() {
    setPastProjects((past) => {
      const previous = past.at(-1);
      if (!previous) return past;
      setFutureProjects((future) => [project, ...future.slice(0, 24)]);
      setProject(previous);
      setSelectedObjectId(undefined);
      setPendingPathStart(undefined);
      setStatus("Undo");
      return past.slice(0, -1);
    });
  }

  function handleRedo() {
    setFutureProjects((future) => {
      const next = future[0];
      if (!next) return future;
      setPastProjects((past) => [...past.slice(-24), project]);
      setProject(next);
      setSelectedObjectId(undefined);
      setPendingPathStart(undefined);
      setStatus("Redo");
      return future.slice(1);
    });
  }

  function handleNewProject() {
    const seed = `realm-${Date.now().toString(36)}`;
    const next = generateMap({ ...project.generator, seed });
    updateProject({ ...next, title: "Untitled Realm" }, "New map created");
    setSelectedObjectId(undefined);
    setPendingPathStart(undefined);
  }

  function handleGenerate() {
    updateProject(generateMap(project.generator), "Generated from seed");
    setSelectedObjectId(undefined);
  }

  function handleRegenerateBiomes() {
    const generated = generateMap(project.generator);
    updateProject(
      {
        ...project,
        terrain: generated.terrain,
        paths: [...project.paths.filter((path) => path.source === "manual"), ...generated.paths],
        labels: [...project.labels.filter((label) => label.source === "manual"), ...generated.labels],
        objects: [...project.objects.filter((object) => object.source === "manual"), ...generated.objects]
      },
      "Regenerated editable map systems"
    );
  }

  function handleCanvasPoint(point: Point) {
    if (mode === "brush") updateProject(applyBrush(project, brush, point, brushSize), `Painted ${brush.label}`);
    if (mode === "object") updateProject(addMapObject(project, objectKind, point, objectKind), `Placed ${objectKind}`);
    if (mode === "label") {
      const text = window.prompt("Label text", "New Place");
      if (text) updateProject(addLabel(project, point, text), "Added label");
    }
    if (mode === "line") {
      if (!pendingPathStart) {
        setPendingPathStart(point);
        setStatus("Path start set");
        return;
      }
      updateProject(addPath(project, pathKind, [pendingPathStart, point]), `Added ${pathKind}`);
      setPendingPathStart(undefined);
    }
    if (mode === "shape") {
      updateProject(
        addShape(project, shapeKind, [
          point,
          { x: point.x + 4, y: point.y },
          { x: point.x + 3, y: point.y + 3 },
          { x: point.x - 1, y: point.y + 2 }
        ]),
        `Added ${shapeKind}`
      );
    }
  }

  function handleObjectSelect(object: MapObject) {
    setSelectedObjectId(object.id);
    setStatus(`Selected ${object.name}`);
  }

  function handleObjectMove(object: MapObject, point: Point) {
    setSelectedObjectId(object.id);
    setProject((current) => moveMapObject(current, object.id, point));
    setStatus(`Moved ${object.name}`);
  }

  function handleSave() {
    saveProject(project);
    setStatus("Saved locally");
  }

  function handleDownloadProject() {
    downloadText(projectFilename(project), serializeProject(project));
    setStatus("Project downloaded");
  }

  async function handleShareProject() {
    const file = createProjectFile(project);

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: project.title,
          text: "Fantasy Map Maker project",
          files: [file]
        });
        setStatus("Project shared");
        return;
      }

      downloadText(file.name, serializeProject(project), file.type);
      setStatus("Sharing unavailable; project downloaded");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Share cancelled");
        return;
      }
      setStatus(error instanceof Error ? error.message : "Share failed");
    }
  }

  async function handleImportProject(file: File) {
    try {
      const imported = parseProject(await file.text());
      saveProject(imported);
      setSelectedObjectId(undefined);
      updateProject(imported, "Project opened and saved locally");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not open project");
    }
  }

  async function handleExport() {
    const node = exportRef.current?.querySelector("[data-export-node]") as HTMLElement | null;
    if (!node) return;
    setStatus("Exporting map");
    try {
      const blob = await exportMapBlob({
        node,
        filename: project.title,
        format: exportFormat,
        pixelRatio: exportScale,
        quality: exportQuality,
        backgroundColor: transparent && exportFormat === "png" ? undefined : "#d8bf83"
      });
      const slug = project.title.replace(/\W+/g, "-").toLowerCase() || "fantasy-map";
      downloadBlob(`${slug}.${exportExtension(exportFormat)}`, blob);
      setExportOpen(false);
      setStatus(`Exported ${exportFormat.toUpperCase()}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Export failed");
    }
  }

  return (
    <main className="app-shell">
      <Toolbar
        title={project.title}
        status={status}
        onTitleChange={(title) => setProject({ ...project, title, updatedAt: new Date().toISOString() })}
        onGenerate={handleGenerate}
        onNewProject={handleNewProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={pastProjects.length > 0}
        canRedo={futureProjects.length > 0}
        onSave={handleSave}
        onDownloadProject={handleDownloadProject}
        onShareProject={() => void handleShareProject()}
        onOpenProject={() => fileInputRef.current?.click()}
        onDeleteSelected={() => {
          if (!selectedObjectId) return;
          updateProject(removeMapObject(project, selectedObjectId), "Deleted selected object");
          setSelectedObjectId(undefined);
        }}
        onExport={() => setExportOpen(true)}
      />

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept=".json,.fmg.json,application/json"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void handleImportProject(file);
        }}
      />

      <div className="workspace">
        <ToolPanel
          mode={mode}
          brush={brush}
          brushSize={brushSize}
          objectKind={objectKind}
          pathKind={pathKind}
          shapeKind={shapeKind}
          hasPendingPathStart={Boolean(pendingPathStart)}
          onModeChange={setMode}
          onBrushChange={setBrush}
          onBrushSizeChange={setBrushSize}
          onObjectKindChange={setObjectKind}
          onPathKindChange={setPathKind}
          onShapeKindChange={setShapeKind}
          onClearPendingPath={() => {
            setPendingPathStart(undefined);
            setStatus("Line cancelled");
          }}
        />
        <section className="canvas-column" ref={exportRef}>
          <MapCanvas
            project={project}
            selectedObjectId={selectedObjectId}
            onCanvasPoint={handleCanvasPoint}
            onObjectSelect={handleObjectSelect}
            onObjectMove={handleObjectMove}
          />
          <div className="canvas-footer">
            <span>{project.generator.width} x {project.generator.height}</span>
            <span>{selectedObject ? `Selected: ${selectedObject.name}` : "Click the map to edit"}</span>
          </div>
        </section>
        <aside className="panel inspector-panel">
          <GeneratorPanel
            settings={project.generator}
            onSettingsChange={(generator: GeneratorSettings) => setProject({ ...project, generator })}
            onGenerate={handleGenerate}
            onRegenerateBiomes={handleRegenerateBiomes}
          />
          <LayerPanel
            layers={project.layers}
            stylePreset={project.stylePreset}
            onLayersChange={(layers) => setProject({ ...project, layers })}
            onStylePresetChange={(stylePreset) => setProject({ ...project, stylePreset })}
          />
          {selectedObject && (
            <section className="panel-section" aria-label="Selected object">
              <h2>Selected Object</h2>
              <label className="field">
                <span>Name</span>
                <input
                  value={selectedObject.name}
                  onChange={(event) =>
                    setProject((current) => updateMapObject(current, selectedObject.id, { name: event.target.value }))
                  }
                />
              </label>
              <label className="control-row">
                <span>Scale</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={selectedObject.scale}
                  onChange={(event) =>
                    setProject((current) => updateMapObject(current, selectedObject.id, { scale: Number(event.target.value) }))
                  }
                />
                <strong>{selectedObject.scale.toFixed(2)}</strong>
              </label>
              <label className="control-row">
                <span>Rotate</span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selectedObject.rotation}
                  onChange={(event) =>
                    setProject((current) => updateMapObject(current, selectedObject.id, { rotation: Number(event.target.value) }))
                  }
                />
                <strong>{selectedObject.rotation}</strong>
              </label>
              <button
                onClick={() => {
                  updateProject(removeMapObject(project, selectedObject.id), "Deleted selected object");
                  setSelectedObjectId(undefined);
                }}
              >
                Delete selected
              </button>
            </section>
          )}
          <section className="panel-section">
            <h2>Export</h2>
            <div className="button-row">
              <button onClick={() => setExportOpen(true)}>PNG/JPEG/PDF</button>
              <button onClick={() => setProject({ ...project, layers: { ...DEFAULT_LAYERS } })}>Reset layers</button>
            </div>
          </section>
        </aside>
      </div>

      <ExportDialog
        isOpen={exportOpen}
        format={exportFormat}
        scale={exportScale}
        transparent={transparent}
        onFormatChange={setExportFormat}
        onScaleChange={setExportScale}
        quality={exportQuality}
        onQualityChange={setExportQuality}
        onTransparentChange={setTransparent}
        onClose={() => setExportOpen(false)}
        onExport={() => void handleExport()}
      />
    </main>
  );
}
