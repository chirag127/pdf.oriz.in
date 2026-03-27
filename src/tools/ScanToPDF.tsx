import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";
import { PDFDocument } from "pdf-lib";

export default function ScanToPDF() {
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [scans, setScans] = useState<string[]>([]);
	const [cameraActive, setCameraActive] = useState(false);
	const videoRef = useState<HTMLVideoElement | null>(null);

	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
			const video = document.getElementById("camera-video") as HTMLVideoElement;
			if (video) {
				video.srcObject = stream;
				video.play();
				setCameraActive(true);
			}
		} catch { setError("Could not access camera. Please allow camera permissions."); }
	};

	const captureFrame = () => {
		const video = document.getElementById("camera-video") as HTMLVideoElement;
		if (!video) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(video, 0, 0);
		const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
		setScans((prev) => [...prev, dataUrl]);
	};

	const stopCamera = () => {
		const video = document.getElementById("camera-video") as HTMLVideoElement;
		if (video?.srcObject) {
			(video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
			video.srcObject = null;
		}
		setCameraActive(false);
	};

	const handleCreatePDF = async () => {
		if (scans.length === 0) { setError("Please capture at least one scan."); return; }
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const pdfDoc = await PDFDocument.create();
			for (const scan of scans) {
				const response = await fetch(scan);
				const bytes = await response.arrayBuffer();
				const image = await pdfDoc.embedJpg(bytes);
				const page = pdfDoc.addPage([image.width, image.height]);
				page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
			}
			clearInterval(interval); setProgress(100);
			const pdfBytes = await pdfDoc.save();
			downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), "scanned.pdf");
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to create PDF"); } finally { setProcessing(false); }
	};

	const handleFileUpload = async (files: File[]) => {
		for (const file of files) {
			const reader = new FileReader();
			reader.onload = (e) => setScans((prev) => [...prev, e.target?.result as string]);
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="space-y-6">
			{!cameraActive && scans.length === 0 && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<button type="button" onClick={startCamera} className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
							<svg className="size-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
							<span className="text-sm font-semibold text-gray-900">Use Camera</span>
							<span className="text-xs text-gray-500">Scan with your device camera</span>
						</button>
						<div>
							<FileDropzone accept={[".jpg", ".jpeg", ".png"]} multiple onFiles={handleFileUpload} title="Upload Images" subtitle="or click to browse" />
						</div>
					</div>
				</>
			)}

			{cameraActive && (
				<div className="space-y-4">
					<div className="relative rounded-xl overflow-hidden bg-black aspect-video">
						<video id="camera-video" className="w-full h-full object-cover" playsInline muted />
					</div>
					<div className="flex gap-3">
						<button type="button" onClick={captureFrame} className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm">Capture</button>
						<button type="button" onClick={stopCamera} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all text-sm">Done</button>
					</div>
				</div>
			)}

			{scans.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-gray-900">{scans.length} scan{scans.length !== 1 ? "s" : ""} captured</h3>
						<button type="button" onClick={() => setScans([])} className="text-sm text-red-600 hover:text-red-700">Clear All</button>
					</div>
					<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
						{scans.map((scan, i) => (
							<div key={i} className="relative group">
								<img src={scan} alt={`Scan ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200" />
								<button type="button" onClick={() => setScans((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 size-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
							</div>
						))}
					</div>
					{!cameraActive && (
						<div className="flex gap-3">
							<button type="button" onClick={startCamera} className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50">Add More Scans</button>
							<FileDropzone accept={[".jpg", ".jpeg", ".png"]} multiple onFiles={handleFileUpload} title="Add images" subtitle="" />
						</div>
					)}
				</div>
			)}

			{processing && <ProgressBar progress={progress} label="Creating PDF from scans..." />}
			{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

			{scans.length > 0 && (
				<button type="button" onClick={handleCreatePDF} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Creating PDF..." : "Create PDF"}</button>
			)}
		</div>
	);
}
