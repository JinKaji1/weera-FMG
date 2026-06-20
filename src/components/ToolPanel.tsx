import type { MapObjectKind, PathKind, ShapeKind, ToolMode } from "../domain/mapTypes";
import type { BrushDefinition } from "../editor/tools";
import { objectKinds, pathKinds, shapeKinds, terrainBrushes, toolModes } from "../editor/tools";

interface ToolPanelProps {
  mode: ToolMode;
  brush: BrushDefinition;
  brushSize: number;
  objectKind: MapObjectKind;
  pathKind: PathKind;
  shapeKind: ShapeKind;
  hasPendingPathStart: boolean;
  onModeChange: (mode: ToolMode) => void;
  onBrushChange: (brush: BrushDefinition) => void;
  onBrushSizeChange: (size: number) => void;
  onObjectKindChange: (kind: MapObjectKind) => void;
  onPathKindChange: (kind: PathKind) => void;
  onShapeKindChange: (kind: ShapeKind) => void;
  onClearPendingPath: () => void;
}

export function ToolPanel({
  mode,
  brush,
  brushSize,
  objectKind,
  pathKind,
  shapeKind,
  hasPendingPathStart,
  onModeChange,
  onBrushChange,
  onBrushSizeChange,
  onObjectKindChange,
  onPathKindChange,
  onShapeKindChange,
  onClearPendingPath
}: ToolPanelProps) {
  return (
    <aside className="panel tool-panel" aria-label="Tools">
      <div className="panel-section">
        <h2>Tools</h2>
        <div className="segmented">
          {toolModes.map((toolMode) => (
            <button key={toolMode} className={mode === toolMode ? "is-active" : ""} onClick={() => onModeChange(toolMode)}>
              {toolMode}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h2>Brushes</h2>
        <div className="tool-grid">
          {terrainBrushes.map((candidate) => (
            <button key={candidate.id} className={brush.id === candidate.id ? "is-active" : ""} onClick={() => onBrushChange(candidate)}>
              {candidate.label}
            </button>
          ))}
        </div>
        <label className="control-row">
          <span>Brush size</span>
          <input min={1} max={8} type="range" value={brushSize} onChange={(event) => onBrushSizeChange(Number(event.target.value))} />
          <strong>{brushSize}</strong>
        </label>
      </div>

      <div className="panel-section">
        <h2>Stamps</h2>
        <select value={objectKind} onChange={(event) => onObjectKindChange(event.target.value as MapObjectKind)}>
          {objectKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>

      <div className="panel-section">
        <h2>Lines</h2>
        <select value={pathKind} onChange={(event) => onPathKindChange(event.target.value as PathKind)}>
          {pathKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
        <p className="tool-hint">{hasPendingPathStart ? "Click an end point to finish the line." : "Click once for start, again for end."}</p>
        {hasPendingPathStart && <button onClick={onClearPendingPath}>Cancel line</button>}
      </div>

      <div className="panel-section">
        <h2>Shapes</h2>
        <select value={shapeKind} onChange={(event) => onShapeKindChange(event.target.value as ShapeKind)}>
          {shapeKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
