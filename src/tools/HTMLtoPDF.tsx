import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function HTMLtoPDF() {
	const [htmlContent, setHtmlContent] = useState("");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const handleProcess = async () => {
		if (!htmlContent.trim()) { setError("Please enter some HTML content"); return; }
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const { jsPDF } = await import("jspdf");
			const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = htmlContent;
			tempDiv.style.cssText = "position:absolute;left:-9999px;width:170mm;font-family:sans-serif;font-size:12pt;line-height:1.5;";
			document.body.appendChild(tempDiv);

			await doc.html(tempDiv, { x: 20, y: 20, width: 170, windowWidth: 800 });
			document.body.removeChild(tempDiv);

			clearInterval(interval); setProgress(100);
			const blob = doc.output("blob");
			downloadBlob(blob, "html-to-pdf.pdf");
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to convert HTML to PDF"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
				<textarea
					value={htmlContent}
					onChange={(e) => setHtmlContent(e.target.value)}
					placeholder="Paste your HTML content here..."
					rows={12}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono resize-y"
				/>
			</div>

			{processing && <ProgressBar progress={progress} label="Converting to PDF..." />}
			{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

			<div className="flex flex-wrap items-center gap-3">
				<button type="button" onClick={handleProcess} disabled={processing || !htmlContent.trim()} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Converting..." : "Convert to PDF"}</button>
			</div>
		</div>
	);
}
