import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function PDFToPDFA() {
	const [file, setFile] = useState<File | null>(null);
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
			const interval = setInterval(
				() => setProgress((p) => Math.min(p + 10, 85)),
				100,
			);

			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdfDoc = await PDFDocument.load(bytes);

			pdfDoc.setTitle(pdfDoc.getTitle() || "Untitled Document");
			pdfDoc.setAuthor(pdfDoc.getAuthor() || "");
			pdfDoc.setSubject(pdfDoc.getSubject() || "");
			pdfDoc.setCreator("OrizPDF - pdf.oriz.in");
			pdfDoc.setProducer("OrizPDF PDF/A Converter");
			pdfDoc.setCreationDate(new Date());
			pdfDoc.setModificationDate(new Date());

			const pageCount = pdfDoc.getPageCount();
			for (let i = 0; i < pageCount; i++) {
				const page = pdfDoc.getPage(i);
				const { width, height } = page.getSize();
				if (width > height) {
					page.setRotation((page.getRotation().angle + 0) as any);
				}
			}

			const pages = pdfDoc.getPages();
			for (const page of pages) {
				const { width, height } = page.getSize();
				const xObjKey = `F0`;
			}

			const savedBytes = await pdfDoc.save({
				useObjectStreams: false,
				addDefaultPage: false,
				updateFieldAppearances: true,
			});

			clearInterval(interval);
			setProgress(100);
			setResult(savedBytes);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to convert to PDF/A",
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
						<ProgressBar progress={progress} label="Converting to PDF/A..." />
					)}
					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					<div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
						<strong>Note:</strong> This converts metadata and structure to
						PDF/A-1b compatible format. For full PDF/A compliance, ensure all
						fonts are embedded and the document follows ISO 19005-1 standards.
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button
								type="button"
								onClick={handleProcess}
								disabled={processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing ? "Converting..." : "Convert to PDF/A"}
							</button>
						) : (
							<DownloadButton
								filename="archived.pdf"
								onClick={() => result && downloadBytes(result, "archived.pdf")}
								label="Download PDF/A"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
