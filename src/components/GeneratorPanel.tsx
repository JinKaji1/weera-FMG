import type { GeneratorSettings } from "../domain/mapTypes";

interface GeneratorPanelProps {
  settings: GeneratorSettings;
  onSettingsChange: (settings: GeneratorSettings) => void;
  onGenerate: () => void;
  onRegenerateBiomes: () => void;
}

export function GeneratorPanel({ settings, onSettingsChange, onGenerate, onRegenerateBiomes }: GeneratorPanelProps) {
  function update<K extends keyof GeneratorSettings>(key: K, value: GeneratorSettings[K]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  return (
    <section className="panel-section" aria-label="Generator">
      <h2>Generator</h2>
      <label className="field">
        <span>Seed</span>
        <input value={settings.seed} onChange={(event) => update("seed", event.target.value)} />
      </label>
      <label className="field">
        <span>Landmass</span>
        <select value={settings.landmass} onChange={(event) => update("landmass", event.target.value as GeneratorSettings["landmass"])}>
          <option value="continent">Continent</option>
          <option value="islands">Islands</option>
          <option value="archipelago">Archipelago</option>
        </select>
      </label>
      {[
        ["Sea", "seaLevel"],
        ["Mountains", "mountainDensity"],
        ["Forests", "forestDensity"],
        ["Settlements", "settlementDensity"],
        ["Rivers", "riverDensity"],
        ["Roads", "roadDensity"]
      ].map(([label, key]) => (
        <label className="control-row" key={key}>
          <span>{label}</span>
          <input
            type="range"
            min={0.05}
            max={0.9}
            step={0.01}
            value={settings[key as keyof GeneratorSettings] as number}
            onChange={(event) => update(key as keyof GeneratorSettings, Number(event.target.value) as never)}
          />
        </label>
      ))}
      <div className="button-row">
        <button className="primary-button" onClick={onGenerate}>
          Generate
        </button>
        <button onClick={onRegenerateBiomes}>Biomes</button>
      </div>
    </section>
  );
}
