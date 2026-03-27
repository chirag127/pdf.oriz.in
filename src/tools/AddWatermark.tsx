import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { addWatermark } from "../lib/pdf/watermark";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function AddWatermark() {
	const [file, setFile] = useState<File | null>(null);
	const [text, setText] = useState("CONFIDENTIAL");
	const [fontSize, setFontSize] = useState("48");
	const [opacity, setOpacity] = useState("0.3");
	const [rotation, setRotation] = useState("-45");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) {
			setFile(files[0]!);
			setResult(null);
			setError(null);
		}
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true);
		setProgress(0);
		setError(null);
		try {
			const interval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);
			const watermarked = await addWatermark(file, {
				text,
				fontSize: Number(fontSize),
				opacity: Number(opacity),
				rotation: Number(rotation),
			});
			clearInterval(interval);
			setProgress(100);
			setResult(watermarked);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add watermark");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your PDF here" subtitle="or click to browse" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
							<p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
						</div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Watermark Text</label>
							<input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">Font Size</label>
								<input type="number" min="10" max="100" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">Opacity (0-1)</label>
								<input type="number" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">Rotation (°)</label>
								<input type="number" value={rotation} onChange={(e) => setRotation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
							</div>
						</div>
					</div>

					{processing && <ProgressBar progress={progress} label="Adding watermark..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">
								{processing ? "Adding..." : "Add Watermark"}
							</button>
						) : (
							<DownloadButton filename="watermarked.pdf" onClick={() => result && downloadBytes(result, "watermarked.pdf")} label="Download" />
						)}
					</div>
				</>
			)}
		</div>
	);
}
