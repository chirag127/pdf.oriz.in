/**
 * PDF rotation functionality using pdf-lib
 */
import { PDFDocument, degrees } from "pdf-lib";

export type RotationAngle = 90 | 180 | 270;

/**
 * Rotates specific pages in a PDF.
 * @param file - The PDF file
 * @param pages - Page numbers to rotate (1-indexed)
 * @param angle - Rotation angle in degrees
 * @returns Modified PDF as Uint8Array
 */
export async function rotatePages(
	file: File,
	pages: number[],
	angle: RotationAngle,
): Promise<Uint8Array> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);
	const pageCount = pdfDoc.getPageCount();

	for (const pageNum of pages) {
		if (pageNum < 1 || pageNum > pageCount) {
			throw new Error(
				`Page ${pageNum} does not exist. Document has ${pageCount} pages.`,
			);
		}
		const page = pdfDoc.getPage(pageNum - 1);
		const currentRotation = page.getRotation().angle;
		page.setRotation(degrees(currentRotation + angle));
	}

	return pdfDoc.save();
}

/**
 * Rotates all pages in a PDF.
 * @param file - The PDF file
 * @param angle - Rotation angle in degrees
 * @returns Modified PDF as Uint8Array
 */
export async function rotateAllPages(
	file: File,
	angle: RotationAngle,
): Promise<Uint8Array> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);
	const pages = pdfDoc.getPages();

	for (const page of pages) {
		const currentRotation = page.getRotation().angle;
		page.setRotation(degrees(currentRotation + angle));
	}

	return pdfDoc.save();
}
