/**
 * PDF protection/encryption functionality using pdf-lib
 */
import { PDFDocument } from "pdf-lib";

export interface ProtectOptions {
	userPassword: string;
	ownerPassword?: string;
	allowPrinting?: boolean;
	allowModifying?: boolean;
	allowCopying?: boolean;
	allowAnnotating?: boolean;
}

/**
 * Adds password protection to a PDF.
 * @param file - The PDF file
 * @param options - Protection options
 * @returns Protected PDF as Uint8Array
 */
export async function protectPDF(
	file: File,
	options: ProtectOptions,
): Promise<Uint8Array> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const pdfDoc = await PDFDocument.load(bytes);

	// pdf-lib supports basic encryption
	await pdfDoc.encrypt({
		userPassword: options.userPassword,
		ownerPassword: options.ownerPassword ?? options.userPassword,
		permissions: {
			printing: options.allowPrinting !== false ? "highResolution" : "none",
			modifying: options.allowModifying !== false,
			copying: options.allowCopying !== false,
			annotating: options.allowAnnotating !== false,
			contentAccessibility: true,
			documentAssembly: true,
		},
	});

	return pdfDoc.save();
}
