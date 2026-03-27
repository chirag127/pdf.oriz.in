import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function WordtoPDF() {
	const [file, setFile] = useState<File | null>(null);
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
			const mammoth = await import("mammoth");
			const arrayBuffer = await file.arrayBuffer();
			const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

			const { jsPDF } = await import("jspdf");
			const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;
			tempDiv.style.cssText = "position:absolute;left:-9999px;width:170mm;font-family:serif;font-size:12pt;line-height:1.5;";
			document.body.appendChild(tempDiv);

			const pageWidth = 170;
			const pageHeight = 257;
			const margin = 20;
			let y = margin;

			const walk = (node: Node) => {
				if (y > pageHeight) { doc.addPage(); y = margin; }
				if (node.nodeType === Node.TEXT_NODE) {
					const text = node.textContent?.trim();
					if (text) {
						const lines = doc.splitTextToSize(text, pageWidth);
						for (const line of lines) {
							if (y > pageHeight) { doc.addPage(); y = margin; }
							doc.text(line, margin, y);
							y += 6;
						}
					}
				}
				for (const child of Array.from(node.childNodes)) walk(child);
				if (node.nodeName === "P") y += 4;
			};
			walk(tempDiv);
			document.body.removeChild(tempDiv);

			clearInterval(interval); setProgress(100);
			const bytes = doc.output("arraybuffer");
			setResult(new Uint8Array(bytes));
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to convert Word to PDF"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".docx"]} onFiles={handleFiles} title="Drop your Word document here" subtitle="or click to browse — .docx files only" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					{processing && <ProgressBar progress={progress} label="Converting to PDF..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Converting..." : "Convert to PDF"}</button>
						) : (
							<DownloadButton filename="converted.pdf" onClick={() => result && downloadBytes(result, "converted.pdf")} label="Download PDF" />
						)}
					</div>
				</>
			)}
		</div>
	);
}
