import { useCallback, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

async function buildDocxFromText(pages: string[][]): Promise<Uint8Array> {
	const JSZip = (await import("jszip")).default;
	const zip = new JSZip();

	const bodyParagraphs: string[] = [];
	for (const pageLines of pages) {
		for (const line of pageLines) {
			const escaped = line
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;");
			bodyParagraphs.push(
				`<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`,
			);
		}
		bodyParagraphs.push(`<w:p><w:r><w:t></w:t></w:r></w:p>`);
	}

	zip.file(
		"[Content_Types].xml",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
	);

	zip.file(
		"_rels/.rels",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
	);

	zip.file(
		"word/_rels/document.xml.rels",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`,
	);

	zip.file(
		"word/document.xml",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParagraphs.join("\n    ")}
  </w:body>
</w:document>`,
	);

	return zip.generateAsync({ type: "uint8array" });
}

export default function PDFToWord() {
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
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";

			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const pages: string[][] = [];

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				const items = content.items as Array<{
					str: string;
					transform: number[];
				}>;

				items.sort((a, b) => {
					const yDiff = b.transform[5] - a.transform[5];
					if (Math.abs(yDiff) > 5) return yDiff;
					return a.transform[4] - b.transform[4];
				});

				const lines: string[] = [];
				let currentLine = "";
				let lastY = -9999;

				for (const item of items) {
					const y = item.transform[5];
					if (Math.abs(y - lastY) > 5) {
						if (currentLine.trim()) lines.push(currentLine.trim());
						currentLine = item.str;
						lastY = y;
					} else {
						currentLine += " " + item.str;
					}
				}
				if (currentLine.trim()) lines.push(currentLine.trim());

				pages.push(lines);
				setProgress(Math.round((i / pdf.numPages) * 80));
			}

			const docx = await buildDocxFromText(pages);
			setProgress(100);
			setResult(docx);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to convert PDF to Word",
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
						<ProgressBar
							progress={progress}
							label="Extracting text and building Word document..."
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
								{processing ? "Converting..." : "Convert to Word"}
							</button>
						) : (
							<DownloadButton
								filename="converted.docx"
								onClick={() =>
									result &&
									downloadBlob(
										new Blob([result], {
											type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
										}),
										"converted.docx",
									)
								}
								label="Download Word"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
