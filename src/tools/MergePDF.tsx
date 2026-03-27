import { useState, useCallback } from "react";
import { FileDropzone, FileList } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { mergePDFs } from "../lib/pdf/merge";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function MergePDF() {
	const [files, setFiles] = useState<File[]>([]);
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
		setResult(null);
	}, []);

	const handleMerge = async () => {
		if (files.length < 2) {
			setError("Please select at least two PDF files to merge.");
			return;
		}

		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			// Simulate progress
			const progressInterval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);

			const merged = await mergePDFs(files);

			clearInterval(progressInterval);
			setProgress(100);
			setResult(merged);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to merge PDFs",
			);
		} finally {
			setProcessing(false);
		}
	};

	const handleDownload = () => {
		if (result) {
			downloadBytes(result, "merged.pdf");
		}
	};

	const totalSize = files.reduce((sum, f) => sum + f.size, 0);

	return (
		<div className="space-y-6">
			<FileDropzone
				accept={[".pdf"]}
				multiple={true}
				onFiles={handleFiles}
				title="Drag & Drop your PDFs here"
				subtitle="or click to browse — select multiple files"
			/>

			<FileList files={files} onRemove={handleRemove} />

			{files.length > 0 && (
				<div className="flex items-center gap-4 text-sm text-gray-500">
					<span>
						{files.length} file{files.length !== 1 ? "s" : ""}{" "}
						selected
					</span>
					<span>Total: {formatBytes(totalSize)}</span>
				</div>
			)}

			{processing && (
				<ProgressBar
					progress={progress}
					label="Merging PDFs..."
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
						onClick={handleMerge}
						disabled={files.length < 2 || processing}
						className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
					>
						{processing ? "Merging..." : "Merge PDFs"}
					</button>
				) : (
					<DownloadButton
						filename="merged.pdf"
						onClick={handleDownload}
						label="Download Merged PDF"
					/>
				)}

				{result && (
					<button
						type="button"
						onClick={() => {
							setFiles([]);
							setResult(null);
							setProgress(0);
						}}
						className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						Start Over
					</button>
				)}
			</div>
		</div>
	);
}
