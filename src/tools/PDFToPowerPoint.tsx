import { useCallback, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

async function buildPptxFromImages(
	images: { dataUrl: string; width: number; height: number }[],
): Promise<Uint8Array> {
	const JSZip = (await import("jszip")).default;
	const zip = new JSZip();

	zip.file(
		"[Content_Types].xml",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${images.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("\n  ")}
</Types>`,
	);

	zip.file(
		"_rels/.rels",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`,
	);

	zip.folder("ppt")?.folder("_rels");

	const presRels = images
		.map(
			(_, i) =>
				`<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
		)
		.join("\n  ");

	zip.file(
		"ppt/_rels/presentation.xml.rels",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`,
	);

	const sldIdLst = images
		.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`)
		.join("\n        ");

	zip.file(
		"ppt/presentation.xml",
		`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    ${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`,
	);

	for (let i = 0; i < images.length; i++) {
		const img = images[i]!;
		const isJpeg = img.dataUrl.startsWith("data:image/jpeg");
		const ext = isJpeg ? "jpeg" : "png";
		const b64 = img.dataUrl.split(",")[1]!;
		const binaryStr = atob(b64);
		const bytes = new Uint8Array(binaryStr.length);
		for (let j = 0; j < binaryStr.length; j++)
			bytes[j] = binaryStr.charCodeAt(j);

		zip.file(`ppt/media/image${i + 1}.${ext}`, bytes);

		const emuX = 0;
		const emuY = 0;
		const emuW = 9144000;
		const emuH = 6858000;

		zip.file(
			`ppt/slides/slide${i + 1}.xml`,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Picture"/>
          <p:cNvPicPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="${emuX}" y="${emuY}"/>
            <a:ext cx="${emuW}" cy="${emuH}"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
        </p:spPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`,
		);

		zip.file(
			`ppt/slides/_rels/slide${i + 1}.xml.rels`,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.${ext}"/>
</Relationships>`,
		);
	}

	return zip.generateAsync({ type: "uint8array" });
}

export default function PDFToPowerPoint() {
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
			const images: { dataUrl: string; width: number; height: number }[] = [];

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 2 });
				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext("2d")!;
				await page.render({ canvasContext: ctx, viewport }).promise;
				images.push({
					dataUrl: canvas.toDataURL("image/jpeg", 0.92),
					width: viewport.width,
					height: viewport.height,
				});
				setProgress(Math.round((i / pdf.numPages) * 70));
			}

			const pptxBytes = await buildPptxFromImages(images);
			setProgress(100);
			setResult(pptxBytes);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to convert PDF to PowerPoint",
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
							label="Rendering pages and building presentation..."
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
								{processing ? "Converting..." : "Convert to PowerPoint"}
							</button>
						) : (
							<DownloadButton
								filename="converted.pptx"
								onClick={() =>
									result &&
									downloadBlob(
										new Blob([result], {
											type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
										}),
										"converted.pptx",
									)
								}
								label="Download PowerPoint"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
