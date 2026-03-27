import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { rotateAllPages, rotatePages } from "../lib/pdf/rotate";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";
import type { RotationAngle } from "../lib/pdf/rotate";

export default function RotatePDF() {
	const [file, setFile] = useState<File | null>(null);
	const [angle, setAngle] = useState<RotationAngle>(90);
	const [scope, setScope] = useState<"all" | "specific">("all");
	const [pageNumbers, setPageNumbers] = useState("");
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

	const handleRotate = async () => {
		if (!file) return;

		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const progressInterval = setInterval(() => {
				setProgress((p) => Math.min(p + 10, 90));
			}, 100);

			let rotated: Uint8Array;

			if (scope === "all") {
				rotated = await rotateAllPages(file, angle);
			} else {
				const pages = pageNumbers
					.split(",")
					.map((s) => Number.parseInt(s.trim(), 10))
					.filter((n) => !Number.isNaN(n));

				if (pages.length === 0) {
					throw new Error(
						"Please enter valid page numbers (e.g., 1,3,5)",
					);
				}

				rotated = await rotatePages(file, pages, angle);
			}

			clearInterval(progressInterval);
			setProgress(100);
			setResult(rotated);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to rotate PDF",
			);
		} finally {
			setProcessing(false);
		}
	};

	const handleDownload = () => {
		if (result) {
			downloadBytes(result, "rotated.pdf");
		}
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

					{/* Rotation Angle */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">
							Rotation Angle
						</label>
						<div className="grid grid-cols-3 gap-3">
							{([90, 180, 270] as const).map((a) => (
								<button
									key={a}
									type="button"
									onClick={() => setAngle(a)}
									className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
										angle === a
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 text-gray-700 hover:border-gray-300"
									}`}
								>
									{a}&deg;
								</button>
							))}
						</div>
					</div>

					{/* Scope */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-gray-900">
							Pages to Rotate
						</label>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setScope("all")}
								className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
									scope === "all"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 text-gray-700 hover:border-gray-300"
								}`}
							>
								All pages
							</button>
							<button
								type="button"
								onClick={() => setScope("specific")}
								className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
									scope === "specific"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-200 text-gray-700 hover:border-gray-300"
								}`}
							>
								Specific pages
							</button>
						</div>
						{scope === "specific" && (
							<input
								type="text"
								placeholder="e.g., 1,3,5"
								value={pageNumbers}
								onChange={(e) =>
									setPageNumbers(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
							/>
						)}
					</div>

					{processing && (
						<ProgressBar
							progress={progress}
							label="Rotating PDF..."
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
								onClick={handleRotate}
								disabled={processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing
									? "Rotating..."
									: "Rotate PDF"}
							</button>
						) : (
							<DownloadButton
								filename="rotated.pdf"
								onClick={handleDownload}
								label="Download Rotated"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
