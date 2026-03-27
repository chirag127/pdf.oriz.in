import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { addPageNumbers } from "../lib/pdf/pageNumbers";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";
import type { PageNumberOptions } from "../lib/pdf/pageNumbers";

export default function AddPageNumbers() {
	const [file, setFile] = useState<File | null>(null);
	const [position, setPosition] =
		useState<PageNumberOptions["position"]>("bottom-center");
	const [startNum, setStartNum] = useState("1");
	const [fontSize, setFontSize] = useState("12");
	const [format, setFormat] = useState("{n}");
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
			const progressInterval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);

			const numbered = await addPageNumbers(file, {
				position,
				startNumber: Number.parseInt(startNum, 10),
				fontSize: Number.parseInt(fontSize, 10),
				format,
			});

			clearInterval(progressInterval);
			setProgress(100);
			setResult(numbered);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to add page numbers",
			);
		} finally {
			setProcessing(false);
		}
	};

	const handleDownload = () => {
		if (result) {
			downloadBytes(result, "numbered.pdf");
		}
	};

	const positions: { value: PageNumberOptions["position"]; label: string }[] =
		[
			{ value: "top-left", label: "Top Left" },
			{ value: "top-center", label: "Top Center" },
			{ value: "top-right", label: "Top Right" },
			{ value: "bottom-left", label: "Bottom Left" },
			{ value: "bottom-center", label: "Bottom Center" },
			{ value: "bottom-right", label: "Bottom Right" },
		];

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

					{/* Position */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">
							Position
						</label>
						<div className="grid grid-cols-3 gap-2">
							{positions.map((p) => (
								<button
									key={p.value}
									type="button"
									onClick={() => setPosition(p.value)}
									className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
										position === p.value
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 text-gray-700 hover:border-gray-300"
									}`}
								>
									{p.label}
								</button>
							))}
						</div>
					</div>

					{/* Options Row */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Start Number
							</label>
							<input
								type="number"
								min="0"
								value={startNum}
								onChange={(e) => setStartNum(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Font Size
							</label>
							<input
								type="number"
								min="6"
								max="48"
								value={fontSize}
								onChange={(e) => setFontSize(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Format
							</label>
							<select
								value={format}
								onChange={(e) => setFormat(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
							>
								<option value="{n}">Page {1}</option>
								<option value="{n}/{total}">
									Page {1}/{5}
								</option>
								<option value="- {n} -">- Page {1} -</option>
							</select>
						</div>
					</div>

					{processing && (
						<ProgressBar
							progress={progress}
							label="Adding page numbers..."
						/>
					)}

					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button
								type="button"
								onClick={handleProcess}
								disabled={processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing
									? "Adding..."
									: "Add Page Numbers"}
							</button>
						) : (
							<DownloadButton
								filename="numbered.pdf"
								onClick={handleDownload}
								label="Download"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
