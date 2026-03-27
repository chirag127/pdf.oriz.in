import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function OCRPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState("");

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setResult(null); setError(null); setStatus(""); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			const { createWorker } = await import("tesseract.js");
			const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

			GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs`;

			setStatus("Loading PDF...");
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;

			setStatus("Initializing OCR engine...");
			const worker = await createWorker("eng");

			const pdfDoc = await PDFDocument.create();
			const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

			for (let i = 1; i <= pdf.numPages; i++) {
				setStatus(`Processing page ${i} of ${pdf.numPages}...`);
				setProgress(Math.round(((i - 1) / pdf.numPages) * 100));

				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 2 });
				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext("2d")!;
				await page.render({ canvasContext: ctx, viewport }).promise;

				const { data: { text } } = await worker.recognize(canvas);
				const pdfPage = pdfDoc.addPage([viewport.width, viewport.height]);

				const lines = text.split("\n").filter((l) => l.trim());
				let y = viewport.height - 40;
				for (const line of lines) {
					if (y < 40) break;
					pdfPage.drawText(line.trim(), { x: 40, y, size: 12, font, color: rgb(0, 0, 0) });
					y -= 16;
				}
			}

			await worker.terminate();
			setProgress(100); setStatus("Done!");
			setResult(await pdfDoc.save());
		} catch (err) { setError(err instanceof Error ? err.message : "OCR processing failed"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your scanned PDF here" subtitle="or click to browse" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					{processing && <ProgressBar progress={progress} label={status || "Processing..."} />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Running OCR..." : "Run OCR"}</button>
						) : (
							<button type="button" onClick={() => result && downloadBytes(result, "ocr-result.pdf")} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm">Download Searchable PDF</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
