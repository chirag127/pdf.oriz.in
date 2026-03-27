import { useState, useCallback } from "react";
import { FileDropzone, FileList } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { PDFDocument } from "pdf-lib";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function RemovePages() {
	const [file, setFile] = useState<File | null>(null);
	const [pagesToRemove, setPagesToRemove] = useState("");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setResult(null); setError(null); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		const pages = pagesToRemove.split(",").map((s) => Number.parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
		if (pages.length === 0) { setError("Please enter valid page numbers (e.g., 1,3,5)"); return; }

		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdfDoc = await PDFDocument.load(bytes);
			const pageCount = pdfDoc.getPageCount();

			const pagesToRemove0 = pages.filter((p) => p >= 1 && p <= pageCount).map((p) => p - 1).sort((a, b) => b - a);
			for (const idx of pagesToRemove0) { pdfDoc.removePage(idx); }

			clearInterval(interval); setProgress(100);
			setResult(await pdfDoc.save());
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to remove pages"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your PDF here" subtitle="or click to browse" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Pages to Remove</label>
						<input type="text" value={pagesToRemove} onChange={(e) => setPagesToRemove(e.target.value)} placeholder="e.g., 1,3,5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
						<p className="text-xs text-gray-500 mt-1">Enter page numbers separated by commas</p>
					</div>

					{processing && <ProgressBar progress={progress} label="Removing pages..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Removing..." : "Remove Pages"}</button>
						) : (
							<DownloadButton filename="pages-removed.pdf" onClick={() => result && downloadBytes(result, "pages-removed.pdf")} label="Download" />
						)}
					</div>
				</>
			)}
		</div>
	);
}
