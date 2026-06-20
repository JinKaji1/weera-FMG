import { useMemo, useRef, useState } from "react";
import { DEFAULT_LAYERS, type ExportFormat, type GeneratorSettings, type MapObject, type MapObjectKind, type MapProject, type Point, type ToolMode } from "./domain/mapTypes";
import { applyBrush } from "./editor/applyBrush";
import { addLabel, addMapObject, addPath, addShape, removeMapObject } from "./editor/objectEditing";
import { terrainBrushes, type BrushDefinition } from "./editor/tools";
import { downloadBlob, exportMapBlob } from "./export/exportMap";
import { generateMap } from "./generation/generateMap";
import { downloadText, loadProject, parseProject, saveProject, serializeProject } from "./persistence/projectStorage";
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

export default function App() {
  const [project, setProject] = useState<MapProject>(() => initialProject());
  const [mode, setMode] = useState<ToolMode>("brush");
  const [brush, setBrush] = useState<BrushDefinition>(terrainBrushes[0]);
  const [brushSize, setBrushSize] = useState(2);
  const [objectKind, setObjectKind] = useState<MapObjectKind>("city");
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [status, setStatus] = useState("Ready");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState(2);
  const [transparent, setTransparent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const selectedObject = useMemo(
    () => project.objects.find((object) => object.id === selectedObjectId),
    [project.objects, selectedObjectId]
  );

  function updateProject(next: MapProject, message: string) {
    setProject(next);
    setStatus(message);
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
    if (mode === "line") updateProject(addPath(project, brush.id === "river" ? "river" : "road", [point, { x: point.x + 4, y: point.y + 2 }]), "Added path");
    if (mode === "shape") {
      updateProject(
        addShape(project, "region", [
          point,
          { x: point.x + 4, y: point.y },
          { x: point.x + 3, y: point.y + 3 },
          { x: point.x - 1, y: point.y + 2 }
        ]),
        "Added region"
      );
    }
  }

  function handleObjectSelect(object: MapObject) {
    setSelectedObjectId(object.id);
    setStatus(`Selected ${object.name}`);
  }

  function handleSave() {
    saveProject(project);
    setStatus("Saved locally");
  }

  function handleDownloadProject() {
    downloadText(`${project.title.replace(/\W+/g, "-").toLowerCase() || "fantasy-map"}.fmg.json`, serializeProject(project));
    setStatus("Project downloaded");
  }

  async function handleImportProject(file: File) {
    try {
      updateProject(parseProject(await file.text()), "Project opened");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not open project");
    }
  }

  async function handleExport() {
    const node = exportRef.current?.querySelector("[data-export-node]") as HTMLElement | null;
    if (!node) return;
    setStatus("Exporting map");
    const blob = await exportMapBlob({
      node,
      filename: project.title,
      format: exportFormat,
      pixelRatio: exportScale,
      backgroundColor: transparent && exportFormat === "png" ? undefined : "#d8bf83"
    });
    downloadBlob(`${project.title.replace(/\W+/g, "-").toLowerCase() || "fantasy-map"}.${exportFormat}`, blob);
    setExportOpen(false);
    setStatus(`Exported ${exportFormat.toUpperCase()}`);
  }

  return (
    <main className="app-shell">
      <Toolbar
        title={project.title}
        status={status}
        onTitleChange={(title) => setProject({ ...project, title, updatedAt: new Date().toISOString() })}
        onGenerate={handleGenerate}
        onSave={handleSave}
        onDownloadProject={handleDownloadProject}
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
          onModeChange={setMode}
          onBrushChange={setBrush}
          onBrushSizeChange={setBrushSize}
          onObjectKindChange={setObjectKind}
        />
        <section className="canvas-column" ref={exportRef}>
          <MapCanvas project={project} selectedObjectId={selectedObjectId} onCanvasPoint={handleCanvasPoint} onObjectSelect={handleObjectSelect} />
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
        onTransparentChange={setTransparent}
        onClose={() => setExportOpen(false)}
        onExport={() => void handleExport()}
      />
    </main>
  );
}
