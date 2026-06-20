import { Download, FileDown, FolderOpen, Save, Sparkles, Trash2 } from "lucide-react";

interface ToolbarProps {
  title: string;
  status: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onDownloadProject: () => void;
  onOpenProject: () => void;
  onExport: () => void;
  onDeleteSelected: () => void;
  onGenerate: () => void;
}

export function Toolbar({
  title,
  status,
  onTitleChange,
  onSave,
  onDownloadProject,
  onOpenProject,
  onExport,
  onDeleteSelected,
  onGenerate
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand">
        <span className="brand-mark">FM</span>
        <input aria-label="Map title" value={title} onChange={(event) => onTitleChange(event.target.value)} />
      </div>
      <div className="toolbar-actions">
        <button title="Generate map" onClick={onGenerate}>
          <Sparkles size={17} />
          Generate
        </button>
        <button title="Save locally" onClick={onSave}>
          <Save size={17} />
          Save
        </button>
        <button title="Download project" onClick={onDownloadProject}>
          <Download size={17} />
          Project
        </button>
        <button title="Open project" onClick={onOpenProject}>
          <FolderOpen size={17} />
          Open
        </button>
        <button title="Delete selected object" onClick={onDeleteSelected}>
          <Trash2 size={17} />
          Delete
        </button>
        <button className="primary-button" title="Export map" onClick={onExport}>
          <FileDown size={17} />
          Export
        </button>
      </div>
      <p className="status-text">{status}</p>
    </header>
  );
}
