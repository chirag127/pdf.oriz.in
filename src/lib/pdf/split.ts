/**
 * PDF split functionality using pdf-lib
 */
import { PDFDocument } from "pdf-lib";

export interface SplitRange {
	start: number;
	end: number;
}

/**
 * Splits a PDF into multiple PDFs by page ranges.
 * @param file - The PDF file to split
 * @param ranges - Array of page ranges (1-indexed)
 * @returns Array of split PDFs as Uint8Array
 */
export async function splitPDFByRanges(
	file: File,
	ranges: SplitRange[],
): Promise<Uint8Array[]> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const srcDoc = await PDFDocument.load(bytes);
	const totalPages = srcDoc.getPageCount();
	const results: Uint8Array[] = [];

	for (const range of ranges) {
		if (range.start < 1 || range.end > totalPages || range.start > range.end) {
			throw new Error(
				`Invalid page range: ${range.start}-${range.end}. Document has ${totalPages} pages.`,
			);
		}

		const newDoc = await PDFDocument.create();
		const pageIndices = [];
		for (let i = range.start - 1; i < range.end; i++) {
			pageIndices.push(i);
		}
		const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
		for (const page of copiedPages) {
			newDoc.addPage(page);
		}
		results.push(await newDoc.save());
	}

	return results;
}

/**
 * Splits a PDF into individual pages.
 * @param file - The PDF file to split
 * @returns Array of single-page PDFs as Uint8Array
 */
export async function splitPDFToPages(
	file: File,
): Promise<Uint8Array[]> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const srcDoc = await PDFDocument.load(bytes);
	const totalPages = srcDoc.getPageCount();
	const results: Uint8Array[] = [];

	for (let i = 0; i < totalPages; i++) {
		const newDoc = await PDFDocument.create();
		const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
		newDoc.addPage(copiedPage);
		results.push(await newDoc.save());
	}

	return results;
}

/**
 * Splits a PDF every N pages.
 * @param file - The PDF file to split
 * @param n - Number of pages per split
 * @returns Array of split PDFs as Uint8Array
 */
export async function splitPDFEveryN(
	file: File,
	n: number,
): Promise<Uint8Array[]> {
	if (n < 1) throw new Error("Split count must be at least 1");

	const bytes = new Uint8Array(await file.arrayBuffer());
	const srcDoc = await PDFDocument.load(bytes);
	const totalPages = srcDoc.getPageCount();
	const ranges: SplitRange[] = [];

	for (let start = 1; start <= totalPages; start += n) {
		const end = Math.min(start + n - 1, totalPages);
		ranges.push({ start, end });
	}

	return splitPDFByRanges(file, ranges);
}
