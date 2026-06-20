import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateMap } from "../generation/generateMap";
import { renderApp } from "../test/render";
import { MapCanvas } from "./MapCanvas";

describe("MapCanvas", () => {
  it("renders map layers and respects hidden layers", () => {
    const project = generateMap({ seed: "canvas", width: 8, height: 6 });
    project.layers.labels = false;

    renderApp(<MapCanvas project={project} onCanvasPoint={vi.fn()} onObjectSelect={vi.fn()} />);

    expect(screen.getByLabelText("Editable fantasy map")).toBeInTheDocument();
    expect(document.querySelector('[data-layer="terrain"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layer="objects"]')).toBeInTheDocument();
    expect(document.querySelector('[data-layer="labels"]')).not.toBeInTheDocument();
  });
});
