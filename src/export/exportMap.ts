import { jsPDF } from "jspdf";
import { toBlob, toJpeg } from "html-to-image";
import type { ExportFormat } from "../domain/mapTypes";

export interface ExportRequest {
  node: HTMLElement;
  filename: string;
  format: ExportFormat;
  pixelRatio: number;
  quality: number;
  backgroundColor?: string;
}

export async function exportMapBlob(request: ExportRequest): Promise<Blob> {
  const baseOptions = {
    pixelRatio: request.pixelRatio,
    backgroundColor: request.backgroundColor,
    cacheBust: true
  };

  if (request.format === "jpeg") {
    const dataUrl = await toJpeg(request.node, {
      ...baseOptions,
      quality: request.quality
    });
    return dataUrlToBlob(dataUrl, "image/jpeg");
  }

  const blob = await toBlob(request.node, baseOptions);

  if (!blob) throw new Error("Map export failed");
  if (request.format === "png") return new Blob([blob], { type: "image/png" });

  const dataUrl = await blobToDataUrl(blob);
  const width = request.node.clientWidth || request.node.getBoundingClientRect().width;
  const height = request.node.clientHeight || request.node.getBoundingClientRect().height;
  const pdf = new jsPDF({
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
    compress: true,
    hotfixes: ["px_scaling"]
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  return pdf.output("blob");
}

export function exportExtension(format: ExportFormat) {
  return format === "jpeg" ? "jpg" : format;
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

function dataUrlToBlob(dataUrl: string, type: string) {
  const [header, payload] = dataUrl.split(",");
  if (!header || !payload) throw new Error("Invalid image data");
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}
