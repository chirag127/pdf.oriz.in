import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function ExcelToPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setError(null); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const XLSX = await import("xlsx");
			const { jsPDF } = await import("jspdf");

			const arrayBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(arrayBuffer, { type: "array" });
			const sheetName = workbook.SheetNames[0];
			if (!sheetName) throw new Error("No sheets found in the Excel file");
			const sheet = workbook.Sheets[sheetName]!;
			const html = XLSX.utils.sheet_to_html(sheet);

			const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;
			tempDiv.style.cssText = "position:absolute;left:-9999px;font-size:8pt;";
			document.body.appendChild(tempDiv);

			doc.html(tempDiv, { callback: () => {
				document.body.removeChild(tempDiv);
				clearInterval(interval); setProgress(100);
				const blob = doc.output("blob");
				downloadBlob(blob, "converted.pdf");
				setProcessing(false);
			}, x: 10, y: 10, width: 277 });
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to convert Excel to PDF"); setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".xlsx", ".xls"]} onFiles={handleFiles} title="Drop your Excel file here" subtitle="or click to browse — .xlsx, .xls" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => setFile(null)} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					{processing && <ProgressBar progress={progress} label="Converting to PDF..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Converting..." : "Convert to PDF"}</button>
					</div>
				</>
			)}
		</div>
	);
}
