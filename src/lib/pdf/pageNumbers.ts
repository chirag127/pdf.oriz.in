/**
 * Add page numbers to PDF using pdf-lib
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface PageNumberOptions {
	position:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	startNumber: number;
	fontSize: number;
	margin: number;
	format: string; // e.g., "{n}" or "{n}/{total}"
}

const defaultOptions: PageNumberOptions = {
	position: "bottom-center",
	startNumber: 1,
	fontSize: 12,
	margin: 40,
	format: "{n}",
};

/**
 * Adds page numbers to a PDF document.
 * @param file - The PDF file
 * @param options - Page number formatting options
 * @returns Modified PDF as Uint8Array
 */
export async function addPageNumbers(
	file: File,
	options: Partial<PageNumberOptions> = {},
): Promise<Uint8Array> {
	const opts = { ...defaultOptions, ...options };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const pages = pdfDoc.getPages();
	const totalPages = pages.length;

	for (let i = 0; i < totalPages; i++) {
		const page = pages[i];
		const { width, height } = page.getSize();
		const pageNum = opts.startNumber + i;

		const text = opts.format
			.replace("{n}", String(pageNum))
			.replace("{total}", String(totalPages));

		const textWidth = font.widthOfTextAtSize(text, opts.fontSize);
		const { x, y } = calculatePosition(
			opts.position,
			width,
			height,
			textWidth,
			opts.fontSize,
			opts.margin,
		);

		page.drawText(text, {
			x,
			y,
			size: opts.fontSize,
			font,
			color: rgb(0.3, 0.3, 0.3),
		});
	}

	return pdfDoc.save();
}

function calculatePosition(
	position: PageNumberOptions["position"],
	pageWidth: number,
	pageHeight: number,
	textWidth: number,
	fontSize: number,
	margin: number,
): { x: number; y: number } {
	switch (position) {
		case "top-left":
			return { x: margin, y: pageHeight - margin - fontSize };
		case "top-center":
			return {
				x: (pageWidth - textWidth) / 2,
				y: pageHeight - margin - fontSize,
			};
		case "top-right":
			return {
				x: pageWidth - margin - textWidth,
				y: pageHeight - margin - fontSize,
			};
		case "bottom-left":
			return { x: margin, y: margin };
		case "bottom-center":
			return { x: (pageWidth - textWidth) / 2, y: margin };
		case "bottom-right":
			return { x: pageWidth - margin - textWidth, y: margin };
		default:
			return { x: (pageWidth - textWidth) / 2, y: margin };
	}
}
