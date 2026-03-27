import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { cropPDF } from "../lib/pdf/crop";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function CropPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [x, setX] = useState("50");
	const [y, setY] = useState("50");
	const [width, setWidth] = useState("500");
	const [height, setHeight] = useState("700");
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
			const cropped = await cropPDF(file, { pages: [], x: Number(x), y: Number(y), width: Number(width), height: Number(height) });
			clearInterval(interval); setProgress(100); setResult(cropped);
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to crop PDF"); } finally { setProcessing(false); }
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

					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">Crop Box (points)</label>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<div><label className="block text-xs text-gray-500 mb-1">X</label><input type="number" min="0" value={x} onChange={(e) => setX(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
							<div><label className="block text-xs text-gray-500 mb-1">Y</label><input type="number" min="0" value={y} onChange={(e) => setY(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
							<div><label className="block text-xs text-gray-500 mb-1">Width</label><input type="number" min="1" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
							<div><label className="block text-xs text-gray-500 mb-1">Height</label><input type="number" min="1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
						</div>
						<p className="text-xs text-gray-500">Tip: Standard A4 is 595 x 842 points. US Letter is 612 x 792 points.</p>
					</div>

					{processing && <ProgressBar progress={progress} label="Cropping PDF..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Cropping..." : "Crop PDF"}</button>
						) : (
							<DownloadButton filename="cropped.pdf" onClick={() => result && downloadBytes(result, "cropped.pdf")} label="Download" />
						)}
					</div>
				</>
			)}
		</div>
	);
}
