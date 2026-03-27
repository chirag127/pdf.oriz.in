/**
 * Utility functions for file validation
 */

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const SUPPORTED_PDF_TYPES = ["application/pdf"];
export const SUPPORTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/bmp",
	"image/svg+xml",
];
export const SUPPORTED_DOCX_TYPES = [
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const SUPPORTED_XLSX_TYPES = [
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

/**
 * Validates a file's type and size
 */
export function validateFile(
	file: File,
	acceptedTypes: string[],
	maxSize: number = MAX_FILE_SIZE,
): { valid: boolean; error?: string } {
	if (!acceptedTypes.includes(file.type)) {
		const extensions = acceptedTypes
			.map((t) => mimeToExtension(t))
			.join(", ");
		return {
			valid: false,
			error: `Invalid file type. Accepted: ${extensions}`,
		};
	}

	if (file.size > maxSize) {
		return {
			valid: false,
			error: `File too large. Maximum size: ${formatBytes(maxSize)}`,
		};
	}

	return { valid: true };
}

/**
 * Converts MIME type to file extension
 */
export function mimeToExtension(mime: string): string {
	const map: Record<string, string> = {
		"application/pdf": ".pdf",
		"image/jpeg": ".jpg",
		"image/png": ".png",
		"image/webp": ".webp",
		"image/gif": ".gif",
		"image/bmp": ".bmp",
		"image/svg+xml": ".svg",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			".docx",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			".xlsx",
	};
	return map[mime] ?? mime;
}

/**
 * Formats bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

/**
 * Checks if a file is a PDF by reading its magic bytes
 */
export async function isPDF(file: File): Promise<boolean> {
	const buffer = await file.slice(0, 5).arrayBuffer();
	const bytes = new Uint8Array(buffer);
	const header = String.fromCharCode(...bytes);
	return header === "%PDF-";
}
