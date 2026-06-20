import type { PointerEvent } from "react";
import { projectHeight, projectWidth, type MapObject, type MapProject, type Point, type StylePreset } from "../domain/mapTypes";

const terrainColors: Record<string, string> = {
  sea: "#6ea5b8",
  river: "#4c91b0",
  mountain: "#8a8270",
  desert: "#d4b56f",
  forest: "#50764b",
  marsh: "#718957",
  grass: "#94a964",
  hills: "#a4955f",
  tundra: "#c8d2c4",
  resource: "#b98d42"
};

const objectGlyphs: Record<string, string> = {
  city: "◆",
  castle: "♜",
  tower: "▲",
  village: "●",
  bridge: "=",
  port: "⚓",
  ruins: "⌁",
  road: "·",
  monster: "!",
  landmark: "✦"
};

const styleBackground: Record<StylePreset, string> = {
  parchment: "#d8bf83",
  atlas: "#dfe6dd",
  biome: "#cad0a0",
  ink: "#ded8c8"
};

interface MapCanvasProps {
  project: MapProject;
  selectedObjectId?: string;
  onCanvasPoint: (point: Point, event: PointerEvent<SVGSVGElement>) => void;
  onObjectSelect: (object: MapObject) => void;
}

function pointsToString(points: Point[], cellSize: number) {
  return points.map((point) => `${point.x * cellSize},${point.y * cellSize}`).join(" ");
}

export function MapCanvas({ project, selectedObjectId, onCanvasPoint, onObjectSelect }: MapCanvasProps) {
  const width = projectWidth(project);
  const height = projectHeight(project);

  function toMapPoint(event: PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * project.generator.width,
      y: ((event.clientY - rect.top) / rect.height) * project.generator.height
    };
  }

  return (
    <div className="map-stage" data-testid="map-stage">
      <svg
        aria-label="Editable fantasy map"
        className={`map-canvas map-canvas--${project.stylePreset}`}
        data-export-node="true"
        viewBox={`0 0 ${width} ${height}`}
        onPointerDown={(event) => onCanvasPoint(toMapPoint(event), event)}
      >
        <rect width={width} height={height} fill={styleBackground[project.stylePreset]} />
        {project.layers.terrain && (
          <g data-layer="terrain">
            {project.terrain.map((cell) => (
              <rect
                key={`${cell.x}-${cell.y}`}
                x={cell.x * project.cellSize}
                y={cell.y * project.cellSize}
                width={project.cellSize + 0.5}
                height={project.cellSize + 0.5}
                fill={terrainColors[cell.terrain]}
                opacity={0.82 + cell.elevation * 0.14}
              />
            ))}
          </g>
        )}
        {project.layers.rivers && (
          <g data-layer="rivers">
            {project.paths
              .filter((path) => path.kind === "river")
              .map((path) => (
                <polyline
                  key={path.id}
                  points={pointsToString(path.points, project.cellSize)}
                  fill="none"
                  stroke="#3f86a1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={project.cellSize * 0.22}
                />
              ))}
          </g>
        )}
        {project.layers.roads && (
          <g data-layer="roads">
            {project.paths
              .filter((path) => path.kind === "road")
              .map((path) => (
                <polyline
                  key={path.id}
                  points={pointsToString(path.points, project.cellSize)}
                  fill="none"
                  stroke="#6e5431"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={project.cellSize * 0.13}
                />
              ))}
          </g>
        )}
        {project.shapes.map((shape) => (
          <polygon
            key={shape.id}
            points={pointsToString(shape.points, project.cellSize)}
            fill="#9b7f4a33"
            stroke="#654f2b"
            strokeWidth={1.2}
          />
        ))}
        {project.layers.resources && (
          <g data-layer="resources">
            {project.terrain
              .filter((cell) => cell.resource)
              .map((cell) => (
                <text
                  key={`resource-${cell.x}-${cell.y}`}
                  x={(cell.x + 0.5) * project.cellSize}
                  y={(cell.y + 0.62) * project.cellSize}
                  className="map-resource"
                  textAnchor="middle"
                >
                  {cell.resource === "fish" ? "~" : cell.resource === "wood" ? "♣" : cell.resource === "herbs" ? "✣" : "◆"}
                </text>
              ))}
          </g>
        )}
        {project.layers.objects && (
          <g data-layer="objects">
            {project.objects.map((object) => (
              <g
                key={object.id}
                className={object.id === selectedObjectId ? "map-object map-object--selected" : "map-object"}
                transform={`translate(${object.x * project.cellSize} ${object.y * project.cellSize}) rotate(${object.rotation}) scale(${object.scale})`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onObjectSelect(object);
                }}
              >
                <circle r={project.cellSize * 0.42} />
                <text y={project.cellSize * 0.16} textAnchor="middle">
                  {objectGlyphs[object.kind]}
                </text>
              </g>
            ))}
          </g>
        )}
        {project.layers.labels && (
          <g data-layer="labels">
            {project.labels.map((label) => (
              <text
                key={label.id}
                x={label.x * project.cellSize}
                y={label.y * project.cellSize}
                className={`map-label map-label--${label.size}`}
                textAnchor="middle"
              >
                {label.text}
              </text>
            ))}
          </g>
        )}
        {project.layers.grid && (
          <g data-layer="grid" opacity="0.22">
            {Array.from({ length: project.generator.width + 1 }, (_, x) => (
              <line key={`x-${x}`} x1={x * project.cellSize} y1={0} x2={x * project.cellSize} y2={height} stroke="#433621" />
            ))}
            {Array.from({ length: project.generator.height + 1 }, (_, y) => (
              <line key={`y-${y}`} x1={0} y1={y * project.cellSize} x2={width} y2={y * project.cellSize} stroke="#433621" />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
