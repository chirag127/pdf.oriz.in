/**
 * PDF crop functionality using pdf-lib
 */
import { PDFDocument } from "pdf-lib";

export interface CropOptions {
	pages: number[]; // 1-indexed page numbers, empty = all pages
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Crops pages in a PDF to the specified region.
 * @param file - The PDF file
 * @param options - Crop box options
 * @returns Cropped PDF as Uint8Array
 */
export async function cropPDF(
	file: File,
	options: CropOptions,
): Promise<Uint8Array> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);
	const allPages = pdfDoc.getPages();
	const pageCount = allPages.length;

	const targetPages =
		options.pages.length > 0
			? options.pages
			: Array.from({ length: pageCount }, (_, i) => i + 1);

	for (const pageNum of targetPages) {
		if (pageNum < 1 || pageNum > pageCount) {
			throw new Error(
				`Page ${pageNum} does not exist. Document has ${pageCount} pages.`,
			);
		}
		const page = allPages[pageNum - 1];
		page.setCropBox(options.x, options.y, options.width, options.height);
	}

	return pdfDoc.save();
}
