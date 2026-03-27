import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function PDFtoJPG() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [imageCount, setImageCount] = useState(0);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setError(null); setImageCount(0); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs`;

			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const count = pdf.numPages;
			setImageCount(count);

			for (let i = 1; i <= count; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 2 });
				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext("2d")!;
				await page.render({ canvasContext: ctx, viewport }).promise;

				const blob = await new Promise<Blob>((resolve) =>
					canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
				);
				downloadBlob(blob, `page-${i}.jpg`);
				setProgress(Math.round((i / count) * 100));
				await new Promise((r) => setTimeout(r, 300));
			}
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to convert PDF to images"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your PDF here" subtitle="or click to browse" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setImageCount(0); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					{processing && <ProgressBar progress={progress} label={`Converting pages to JPG... (${imageCount} pages)`} />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Converting..." : "Convert to JPG"}</button>
					</div>
				</>
			)}
		</div>
	);
}
