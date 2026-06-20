import type { MapProject } from "../domain/mapTypes";

const STORAGE_KEY = "weera-fmg-project";

export function serializeProject(project: MapProject): string {
  return JSON.stringify(project, null, 2);
}

export function parseProject(json: string): MapProject {
  const parsed = JSON.parse(json) as Partial<MapProject>;
  if (parsed.schemaVersion !== 1 || !parsed.generator || !Array.isArray(parsed.terrain)) {
    throw new Error("Invalid Fantasy Map Maker project file");
  }
  return parsed as MapProject;
}

export function saveProject(project: MapProject, storage: Storage = window.localStorage) {
  storage.setItem(STORAGE_KEY, serializeProject(project));
}

export function loadProject(storage: Storage = window.localStorage): MapProject | null {
  const json = storage.getItem(STORAGE_KEY);
  return json ? parseProject(json) : null;
}

export function downloadText(filename: string, text: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
