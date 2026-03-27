/**
 * PDF watermark functionality using pdf-lib
 */
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export interface WatermarkOptions {
	text?: string;
	fontSize?: number;
	opacity?: number;
	rotation?: number;
	color?: { r: number; g: number; b: number };
	position?: "center" | "diagonal" | "top-left" | "bottom-right";
}

const defaultOptions: Required<WatermarkOptions> = {
	text: "WATERMARK",
	fontSize: 48,
	opacity: 0.3,
	rotation: -45,
	color: { r: 0.5, g: 0.5, b: 0.5 },
	position: "center",
};

/**
 * Adds a text watermark to all pages of a PDF.
 * @param file - The PDF file
 * @param options - Watermark formatting options
 * @returns Modified PDF as Uint8Array
 */
export async function addWatermark(
	file: File,
	options: WatermarkOptions = {},
): Promise<Uint8Array> {
	const opts = { ...defaultOptions, ...options };
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const pages = pdfDoc.getPages();

	for (const page of pages) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
		const textHeight = opts.fontSize;

		let x: number;
		let y: number;

		switch (opts.position) {
			case "top-left":
				x = 40;
				y = height - 80;
				break;
			case "bottom-right":
				x = width - textWidth - 40;
				y = 40;
				break;
			case "diagonal":
			case "center":
			default:
				x = (width - textWidth) / 2;
				y = (height - textHeight) / 2;
				break;
		}

		page.drawText(opts.text, {
			x,
			y,
			size: opts.fontSize,
			font,
			color: rgb(opts.color.r, opts.color.g, opts.color.b),
			opacity: opts.opacity,
			rotate: degrees(opts.rotation),
		});
	}

	return pdfDoc.save();
}
