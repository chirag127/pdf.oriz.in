import { useState, useCallback } from "react";
import { FileDropzone, FileList } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { PDFDocument } from "pdf-lib";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

type PageSize = "a4" | "letter" | "fit";

export default function JPGtoPDF() {
	const [files, setFiles] = useState<File[]>([]);
	const [pageSize, setPageSize] = useState<PageSize>("a4");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((newFiles: File[]) => {
		setFiles((prev) => [...prev, ...newFiles]);
		setResult(null);
		setError(null);
	}, []);

	const handleRemove = useCallback((index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleProcess = async () => {
		if (files.length === 0) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const pdfDoc = await PDFDocument.create();

			for (const file of files) {
				const bytes = await file.arrayBuffer();
				let image;
				if (file.type === "image/png") {
					image = await pdfDoc.embedPng(bytes);
				} else {
					image = await pdfDoc.embedJpg(bytes);
				}

				let pageWidth: number, pageHeight: number;
				if (pageSize === "a4") { pageWidth = 595; pageHeight = 842; }
				else if (pageSize === "letter") { pageWidth = 612; pageHeight = 792; }
				else { pageWidth = image.width; pageHeight = image.height; }

				const page = pdfDoc.addPage([pageWidth, pageHeight]);
				const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
				const scaledW = image.width * scale;
				const scaledH = image.height * scale;

				page.drawImage(image, {
					x: (pageWidth - scaledW) / 2,
					y: (pageHeight - scaledH) / 2,
					width: scaledW,
					height: scaledH,
				});
			}

			clearInterval(interval); setProgress(100);
			setResult(await pdfDoc.save());
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to convert images"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			<FileDropzone accept={[".jpg", ".jpeg", ".png", ".webp"]} multiple onFiles={handleFiles} title="Drop your images here" subtitle="or click to browse — select multiple" />
			<FileList files={files} onRemove={handleRemove} />

			{files.length > 0 && (
				<div className="space-y-3">
					<label className="text-sm font-medium text-gray-900">Page Size</label>
					<div className="flex gap-3">
						{(["a4", "letter", "fit"] as const).map((s) => (
							<button key={s} type="button" onClick={() => setPageSize(s)} className={`px-4 py-2 rounded-lg border text-sm font-medium uppercase transition-all ${pageSize === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>{s}</button>
						))}
					</div>
				</div>
			)}

			{processing && <ProgressBar progress={progress} label="Converting to PDF..." />}
			{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

			<div className="flex flex-wrap items-center gap-3">
				{!result ? (
					<button type="button" onClick={handleProcess} disabled={files.length === 0 || processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Converting..." : "Convert to PDF"}</button>
				) : (
					<DownloadButton filename="converted.pdf" onClick={() => result && downloadBytes(result, "converted.pdf")} label="Download PDF" />
				)}
			</div>
		</div>
	);
}
