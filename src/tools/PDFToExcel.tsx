import { useCallback, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function PDFToExcel() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Blob | null>(null);
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
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";
			const XLSX = await import("xlsx");

			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const allRows: string[][] = [];

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				const items = content.items as Array<{
					str: string;
					transform: number[];
					width: number;
				}>;

				items.sort((a, b) => {
					const yDiff = b.transform[5] - a.transform[5];
					if (Math.abs(yDiff) > 3) return yDiff;
					return a.transform[4] - b.transform[4];
				});

				let currentRow: string[] = [];
				let lastY = -9999;
				const tolerance = 3;

				for (const item of items) {
					const y = Math.round(item.transform[5]);
					if (Math.abs(y - lastY) > tolerance) {
						if (currentRow.length > 0 && currentRow.some((c) => c.trim())) {
							allRows.push(currentRow);
						}
						currentRow = [item.str];
						lastY = y;
					} else {
						currentRow.push(item.str);
					}
				}
				if (currentRow.length > 0 && currentRow.some((c) => c.trim())) {
					allRows.push(currentRow);
				}

				setProgress(Math.round((i / pdf.numPages) * 80));
			}

			const maxCols = Math.max(1, ...allRows.map((r) => r.length));
			const normalized = allRows.map((row) => {
				while (row.length < maxCols) row.push("");
				return row;
			});

			const ws = XLSX.utils.aoa_to_sheet(
				normalized.length > 0 ? normalized : [["No data extracted"]],
			);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");

			const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
			setProgress(100);
			setResult(new Blob([wbOut], { type: "application/octet-stream" }));
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to extract tables from PDF",
			);
		} finally {
			setProcessing(false);
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
							<p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
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

					{processing && (
						<ProgressBar progress={progress} label="Extracting table data..." />
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
								{processing ? "Extracting..." : "Extract to Excel"}
							</button>
						) : (
							<DownloadButton
								filename="extracted.xlsx"
								onClick={() => result && downloadBlob(result, "extracted.xlsx")}
								label="Download Excel"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
