import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { splitPDFByRanges } from "../lib/pdf/split";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function ExtractPages() {
	const [file, setFile] = useState<File | null>(null);
	const [rangeStart, setRangeStart] = useState("1");
	const [rangeEnd, setRangeEnd] = useState("3");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setResult(null); setError(null); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const results = await splitPDFByRanges(file, [{ start: Number(rangeStart), end: Number(rangeEnd) }]);
			clearInterval(interval); setProgress(100);
			setResult(results[0] ?? null);
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to extract pages"); } finally { setProcessing(false); }
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

					<div className="flex items-end gap-4">
						<div><label className="block text-sm text-gray-600 mb-1">From page</label><input type="number" min="1" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
						<div><label className="block text-sm text-gray-600 mb-1">To page</label><input type="number" min="1" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
					</div>

					{processing && <ProgressBar progress={progress} label="Extracting pages..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Extracting..." : "Extract Pages"}</button>
						) : (
							<button type="button" onClick={() => result && downloadBytes(result, "extracted.pdf")} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm">Download Extracted PDF</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
