import { Download, FileDown, FolderOpen, RotateCcw, RotateCw, Save, Share2, Sparkles, Trash2 } from "lucide-react";

interface ToolbarProps {
  title: string;
  status: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onDownloadProject: () => void;
  onShareProject: () => void;
  onOpenProject: () => void;
  onNewProject: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onDeleteSelected: () => void;
  onGenerate: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  title,
  status,
  onTitleChange,
  onSave,
  onDownloadProject,
  onShareProject,
  onOpenProject,
  onNewProject,
  onUndo,
  onRedo,
  onExport,
  onDeleteSelected,
  onGenerate,
  canUndo,
  canRedo
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand">
        <span className="brand-mark">FM</span>
        <input aria-label="Map title" value={title} onChange={(event) => onTitleChange(event.target.value)} />
      </div>
      <div className="toolbar-actions">
        <button title="New map" onClick={onNewProject}>
          <Sparkles size={17} />
          New
        </button>
        <button title="Generate map" onClick={onGenerate}>
          <Sparkles size={17} />
          Generate
        </button>
        <button title="Undo" disabled={!canUndo} onClick={onUndo}>
          <RotateCcw size={17} />
          Undo
        </button>
        <button title="Redo" disabled={!canRedo} onClick={onRedo}>
          <RotateCw size={17} />
          Redo
        </button>
        <button title="Save locally" onClick={onSave}>
          <Save size={17} />
          Save
        </button>
        <button title="Download project" onClick={onDownloadProject}>
          <Download size={17} />
          Project
        </button>
        <button title="Share project" onClick={onShareProject}>
          <Share2 size={17} />
          Share
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
