/**
 * User-friendly error messages for PDF operations
 */
export const errorMessages = {
	invalidPdf: "The file is not a valid PDF document.",
	corruptedPdf:
		"This PDF appears to be corrupted and cannot be processed.",
	passwordRequired:
		"This PDF is password protected. Please enter the password.",
	wrongPassword: "The password you entered is incorrect.",
	emptyFile: "The file is empty. Please select a valid file.",
	fileTooLarge: (max: string) =>
		`File is too large. Maximum allowed size is ${max}.`,
	noPages: "The PDF has no pages to process.",
	mergeRequiresTwo: "Please select at least two PDF files to merge.",
	splitInvalidRange:
		"Invalid page range. Please check your input.",
	unsupportedFormat: "This file format is not supported.",
	processingFailed:
		"An error occurred while processing your file. Please try again.",
	ocrFailed:
		"OCR processing failed. The image quality may be too low.",
	conversionFailed: (from: string, to: string) =>
		`Failed to convert ${from} to ${to}. Please try a different file.`,
	networkError:
		"A network error occurred. Please check your connection.",
} as const;
