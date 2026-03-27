import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import {
	splitPDFByRanges,
	splitPDFToPages,
	splitPDFEveryN,
} from "../lib/pdf/split";
import { downloadBytes, downloadBlob } from "../lib/utils/downloadBlob";

type SplitMode = "pages" | "range" | "every-n";

export default function SplitPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [mode, setMode] = useState<SplitMode>("pages");
	const [rangeStart, setRangeStart] = useState("1");
	const [rangeEnd, setRangeEnd] = useState("5");
	const [everyN, setEveryN] = useState("2");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [results, setResults] = useState<Uint8Array[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) {
			setFile(files[0]!);
			setResults([]);
			setError(null);
		}
	}, []);

	const handleSplit = async () => {
		if (!file) return;

		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const progressInterval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);

			let splitResults: Uint8Array[];

			switch (mode) {
				case "pages":
					splitResults = await splitPDFToPages(file);
					break;
				case "range":
					splitResults = await splitPDFByRanges(file, [
						{
							start: Number.parseInt(rangeStart, 10),
							end: Number.parseInt(rangeEnd, 10),
						},
					]);
					break;
				case "every-n":
					splitResults = await splitPDFEveryN(
						file,
						Number.parseInt(everyN, 10),
					);
					break;
			}

			clearInterval(progressInterval);
			setProgress(100);
			setResults(splitResults);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to split PDF",
			);
		} finally {
			setProcessing(false);
		}
	};

	const handleDownloadAll = () => {
		results.forEach((bytes, index) => {
			setTimeout(() => {
				downloadBytes(bytes, `split-page-${index + 1}.pdf`);
			}, index * 200);
		});
	};

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
								{(file.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setFile(null);
								setResults([]);
							}}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{/* Split Mode Selection */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">
							Split Mode
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<button
								type="button"
								onClick={() => setMode("pages")}
								className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
									mode === "pages"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 text-gray-700 hover:border-gray-300"
								}`}
							>
								Split into single pages
							</button>
							<button
								type="button"
								onClick={() => setMode("range")}
								className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
									mode === "range"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 text-gray-700 hover:border-gray-300"
								}`}
							>
								Extract page range
							</button>
							<button
								type="button"
								onClick={() => setMode("every-n")}
								className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
									mode === "every-n"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 text-gray-700 hover:border-gray-300"
								}`}
							>
								Split every N pages
							</button>
						</div>
					</div>

					{mode === "range" && (
						<div className="flex items-center gap-4">
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									From page
								</label>
								<input
									type="number"
									min="1"
									value={rangeStart}
									onChange={(e) =>
										setRangeStart(e.target.value)
									}
									className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm text-gray-600 mb-1">
									To page
								</label>
								<input
									type="number"
									min="1"
									value={rangeEnd}
									onChange={(e) =>
										setRangeEnd(e.target.value)
									}
									className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
								/>
							</div>
						</div>
					)}

					{mode === "every-n" && (
						<div>
							<label className="block text-sm text-gray-600 mb-1">
								Pages per split
							</label>
							<input
								type="number"
								min="1"
								value={everyN}
								onChange={(e) => setEveryN(e.target.value)}
								className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
							/>
						</div>
					)}

					{processing && (
						<ProgressBar
							progress={progress}
							label="Splitting PDF..."
						/>
					)}

					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3">
						{results.length === 0 ? (
							<button
								type="button"
								onClick={handleSplit}
								disabled={processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing ? "Splitting..." : "Split PDF"}
							</button>
						) : (
							<>
								<p className="text-sm text-gray-600">
									Created {results.length} file
									{results.length !== 1 ? "s" : ""}
								</p>
								<button
									type="button"
									onClick={handleDownloadAll}
									className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm"
								>
									Download All
								</button>
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
}
