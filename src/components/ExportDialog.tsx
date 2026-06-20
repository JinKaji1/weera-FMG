import type { ExportFormat } from "../domain/mapTypes";

interface ExportDialogProps {
  isOpen: boolean;
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  onFormatChange: (format: ExportFormat) => void;
  onScaleChange: (scale: number) => void;
  onTransparentChange: (transparent: boolean) => void;
  onClose: () => void;
  onExport: () => void;
}

export function ExportDialog({
  isOpen,
  format,
  scale,
  transparent,
  onFormatChange,
  onScaleChange,
  onTransparentChange,
  onClose,
  onExport
}: ExportDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-label="Export map">
        <h2>Export Map</h2>
        <label className="field">
          <span>Format</span>
          <select value={format} onChange={(event) => onFormatChange(event.target.value as ExportFormat)}>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="pdf">PDF</option>
          </select>
        </label>
        <label className="control-row">
          <span>Resolution</span>
          <input type="range" min={1} max={4} step={1} value={scale} onChange={(event) => onScaleChange(Number(event.target.value))} />
          <strong>{scale}x</strong>
        </label>
        <label className="toggle-row">
          <span>Transparent background</span>
          <input type="checkbox" checked={transparent} disabled={format !== "png"} onChange={(event) => onTransparentChange(event.target.checked)} />
        </label>
        <div className="button-row">
          <button onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={onExport}>
            Download
          </button>
        </div>
      </section>
    </div>
  );
}
