/**
 * PDF compression functionality using pdf-lib
 */
import { PDFDocument } from "pdf-lib";

export type CompressionLevel = "low" | "medium" | "high";

/**
 * Compresses a PDF by optimizing its internal structure.
 * Note: True image compression requires WASM tools not available
 * in pure JS. This implementation optimizes what pdf-lib can handle.
 * @param file - The PDF file to compress
 * @param level - Compression level
 * @returns Compressed PDF as Uint8Array
 */
export async function compressPDF(
	file: File,
	level: CompressionLevel = "medium",
): Promise<Uint8Array> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);

	// Remove metadata to reduce size
	pdfDoc.setTitle("");
	pdfDoc.setAuthor("");
	pdfDoc.setSubject("");
	pdfDoc.setKeywords([]);
	pdfDoc.setProducer("OrizPDF");
	pdfDoc.setCreator("OrizPDF Compressor");

	// Save with different compression settings
	const useObjectStreams = level !== "low";
	const addDefaultPage = false;

	return pdfDoc.save({
		useObjectStreams,
		addDefaultPage,
	});
}

/**
 * Gets the estimated size reduction percentage
 */
export function getCompressionEstimate(
	originalSize: number,
	compressedSize: number,
): number {
	if (originalSize === 0) return 0;
	return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
