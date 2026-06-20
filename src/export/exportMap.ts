import { jsPDF } from "jspdf";
import { toBlob } from "html-to-image";
import type { ExportFormat } from "../domain/mapTypes";

export interface ExportRequest {
  node: HTMLElement;
  filename: string;
  format: ExportFormat;
  pixelRatio: number;
  backgroundColor?: string;
}

export async function exportMapBlob(request: ExportRequest): Promise<Blob> {
  const blob = await toBlob(request.node, {
    pixelRatio: request.pixelRatio,
    backgroundColor: request.backgroundColor,
    cacheBust: true
  });

  if (!blob) throw new Error("Map export failed");
  if (request.format === "png") return new Blob([blob], { type: "image/png" });
  if (request.format === "jpeg") return new Blob([blob], { type: "image/jpeg" });

  const dataUrl = await blobToDataUrl(blob);
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [request.node.clientWidth, request.node.clientHeight] });
  pdf.addImage(dataUrl, "PNG", 0, 0, request.node.clientWidth, request.node.clientHeight);
  return pdf.output("blob");
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
