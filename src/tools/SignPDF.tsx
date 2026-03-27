import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { formatBytes } from "../lib/utils/fileValidation";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export default function SignPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [signatureText, setSignatureText] = useState("");
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setResult(null); setError(null); }
	}, []);

	const handleProcess = async () => {
		if (!file || !signatureText.trim()) { setError("Please enter your signature text."); return; }
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdfDoc = await PDFDocument.load(bytes);
			const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
			const pages = pdfDoc.getPages();
			const lastPage = pages[pages.length - 1]!;
			const { height } = lastPage.getSize();
			lastPage.drawText(signatureText, { x: 50, y: height - 100, size: 24, font, color: rgb(0, 0, 0.8) });
			clearInterval(interval); setProgress(100);
			setResult(await pdfDoc.save());
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to sign PDF"); } finally { setProcessing(false); }
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your PDF here" subtitle="or click to browse" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Your Signature</label>
						<input type="text" value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="Type your name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
						<p className="text-xs text-gray-500 mt-1">Your typed signature will be added to the last page</p>
					</div>

					{processing && <ProgressBar progress={progress} label="Adding signature..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing || !signatureText.trim()} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Signing..." : "Sign PDF"}</button>
						) : (
							<button type="button" onClick={() => result && downloadBytes(result, "signed.pdf")} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm">Download Signed PDF</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
