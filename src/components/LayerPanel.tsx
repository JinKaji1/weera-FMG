import type { MapLayers, StylePreset } from "../domain/mapTypes";

interface LayerPanelProps {
  layers: MapLayers;
  stylePreset: StylePreset;
  onLayersChange: (layers: MapLayers) => void;
  onStylePresetChange: (style: StylePreset) => void;
}

const layerLabels: Array<[keyof MapLayers, string]> = [
  ["terrain", "Terrain"],
  ["resources", "Resources"],
  ["objects", "Objects"],
  ["labels", "Labels"],
  ["roads", "Roads"],
  ["rivers", "Rivers"],
  ["grid", "Grid"],
  ["decorations", "Decorations"]
];

export function LayerPanel({ layers, stylePreset, onLayersChange, onStylePresetChange }: LayerPanelProps) {
  return (
    <section className="panel-section" aria-label="Layers">
      <h2>Layers</h2>
      <label className="field">
        <span>Style</span>
        <select value={stylePreset} onChange={(event) => onStylePresetChange(event.target.value as StylePreset)}>
          <option value="parchment">Parchment</option>
          <option value="atlas">Atlas</option>
          <option value="biome">Biome</option>
          <option value="ink">Ink</option>
        </select>
      </label>
      <div className="layer-list">
        {layerLabels.map(([key, label]) => (
          <label className="toggle-row" key={key}>
            <span>{label}</span>
            <input type="checkbox" checked={layers[key]} onChange={(event) => onLayersChange({ ...layers, [key]: event.target.checked })} />
          </label>
        ))}
      </div>
    </section>
  );
}
