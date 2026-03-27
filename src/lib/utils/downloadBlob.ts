/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

/**
 * Downloads a Uint8Array as a file
 */
export function downloadBytes(bytes: Uint8Array, filename: string): void {
	const blob = new Blob([bytes], { type: "application/pdf" });
	downloadBlob(blob, filename);
}
