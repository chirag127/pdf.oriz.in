import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { compressPDF, getCompressionEstimate } from "../lib/pdf/compress";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";
import type { CompressionLevel } from "../lib/pdf/compress";

export default function CompressPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [level, setLevel] = useState<CompressionLevel>("medium");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [originalSize, setOriginalSize] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) {
			const f = files[0]!;
			setFile(f);
			setOriginalSize(f.size);
			setResult(null);
			setError(null);
		}
	}, []);

	const handleCompress = async () => {
		if (!file) return;

		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const progressInterval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);

			const compressed = await compressPDF(file, level);

			clearInterval(progressInterval);
			setProgress(100);
			setResult(compressed);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to compress PDF",
			);
		} finally {
			setProcessing(false);
		}
	};

	const handleDownload = () => {
		if (result) {
			downloadBytes(result, "compressed.pdf");
		}
	};

	const savings = result
		? getCompressionEstimate(originalSize, result.length)
		: 0;

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone
					accept={[".pdf"]}
					onFiles={handleFiles}
					title="Drop your PDF here"
					subtitle="or click to browse"
				/>
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{file.name}
							</p>
							<p className="text-xs text-gray-500">
								{formatBytes(file.size)}
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setFile(null);
								setResult(null);
							}}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{/* Compression Level */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">
							Compression Level
						</label>
						<div className="grid grid-cols-3 gap-3">
							{(["low", "medium", "high"] as const).map(
								(l) => (
									<button
										key={l}
										type="button"
										onClick={() => setLevel(l)}
										className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize transition-all ${
											level === l
												? "border-blue-500 bg-blue-50 text-blue-700"
												: "border-gray-200 text-gray-700 hover:border-gray-300"
										}`}
									>
										{l}
									</button>
								),
							)}
						</div>
						<p className="text-xs text-gray-500">
							{level === "low" &&
								"Minimal compression, best quality"}
							{level === "medium" &&
								"Balanced compression and quality"}
							{level === "high" &&
								"Maximum compression, slightly reduced quality"}
						</p>
					</div>

					{processing && (
						<ProgressBar
							progress={progress}
							label="Compressing PDF..."
						/>
					)}

					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					{result && (
						<div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-sm text-green-800">
								<strong>Compressed!</strong> New size:{" "}
								{formatBytes(result.length)}
								{savings > 0 && (
									<span className="text-green-600">
										{" "}
										({savings}% smaller)
									</span>
								)}
							</p>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button
								type="button"
								onClick={handleCompress}
								disabled={processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing
									? "Compressing..."
									: "Compress PDF"}
							</button>
						) : (
							<DownloadButton
								filename="compressed.pdf"
								onClick={handleDownload}
								label="Download Compressed"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
