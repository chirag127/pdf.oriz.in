/**
 * PDF merge functionality using pdf-lib
 */
import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single PDF document.
 * @param files - Array of PDF File objects
 * @returns Merged PDF as Uint8Array
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
	if (files.length === 0) {
		throw new Error("No files provided for merging");
	}

	if (files.length === 1) {
		const bytes = new Uint8Array(await files[0].arrayBuffer());
		return bytes;
	}

	const mergedPdf = await PDFDocument.create();

	for (const file of files) {
		const bytes = new Uint8Array(await file.arrayBuffer());
		const pdf = await PDFDocument.load(bytes);
		const copiedPages = await mergedPdf.copyPages(
			pdf,
			pdf.getPageIndices(),
		);
		for (const page of copiedPages) {
			mergedPdf.addPage(page);
		}
	}

	return mergedPdf.save();
}
