import { useCallback, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function PowerPointToPDF() {
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
			const JSZip = (await import("jszip")).default;
			const { jsPDF } = await import("jspdf");

			const zip = await JSZip.loadAsync(await file.arrayBuffer());
			setProgress(10);

			const slideFiles = Object.keys(zip.files)
				.filter((k) => k.startsWith("ppt/slides/slide") && k.endsWith(".xml"))
				.sort((a, b) => {
					const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0");
					const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0");
					return numA - numB;
				});

			const mediaMap = new Map<string, string>();
			const mediaKeys = Object.keys(zip.files).filter(
				(k) =>
					k.startsWith("ppt/media/") &&
					/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(k),
			);

			for (const key of mediaKeys) {
				const ext = key.split(".").pop()?.toLowerCase() || "png";
				const mime =
					ext === "jpg" || ext === "jpeg"
						? "image/jpeg"
						: ext === "gif"
							? "image/gif"
							: ext === "webp"
								? "image/webp"
								: "image/png";
				const blob = await zip.files[key]!.async("blob");
				const dataUrl = await new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.readAsDataURL(blob);
				});
				const fileName = key.split("/").pop()!;
				mediaMap.set(fileName, dataUrl);
			}

			setProgress(30);

			const parsedSlides: string[] = [];
			for (const sf of slideFiles) {
				const xml = await zip.files[sf]!.async("text");
				const parser = new DOMParser();
				const doc = parser.parseFromString(xml, "application/xml");
				const blipEls = doc.querySelectorAll("a\\:blip, blip");
				const imageDataUrls: string[] = [];

				for (const blip of blipEls) {
					const embedId = blip.getAttribute("r:embed");
					if (!embedId) continue;
					const relsKey = `ppt/slides/_rels/${sf.split("/").pop()}.rels`;
					const relsFile = zip.files[relsKey];
					if (!relsFile) continue;
					const relsXml = await relsFile.async("text");
					const relsDoc = parser.parseFromString(relsXml, "application/xml");
					const relEls = relsDoc.querySelectorAll("Relationship");
					for (const rel of Array.from(relEls)) {
						if (rel.getAttribute("Id") === embedId) {
							const target = rel.getAttribute("Target") || "";
							const mediaName = target.split("/").pop()!;
							if (mediaMap.has(mediaName)) {
								imageDataUrls.push(mediaMap.get(mediaName)!);
							}
							break;
						}
					}
				}

				if (imageDataUrls.length === 0) {
					const textEls = doc.querySelectorAll("a\\:t, t");
					let slideText = "";
					for (const t of Array.from(textEls)) {
						slideText += t.textContent + " ";
					}
					if (slideText.trim()) {
						const canvas = document.createElement("canvas");
						canvas.width = 960;
						canvas.height = 540;
						const ctx = canvas.getContext("2d")!;
						ctx.fillStyle = "#ffffff";
						ctx.fillRect(0, 0, 960, 540);
						ctx.fillStyle = "#333333";
						ctx.font = "24px Arial";
						const words = slideText.trim().split(/\s+/);
						let line = "";
						let y = 60;
						for (const word of words) {
							const test = line + word + " ";
							if (ctx.measureText(test).width > 900) {
								ctx.fillText(line, 30, y);
								line = word + " ";
								y += 32;
								if (y > 500) break;
							} else {
								line = test;
							}
						}
						if (line.trim() && y <= 500) ctx.fillText(line, 30, y);
						parsedSlides.push(canvas.toDataURL("image/jpeg", 0.92));
					}
				} else {
					parsedSlides.push(...imageDataUrls);
				}
			}

			setProgress(50);

			if (parsedSlides.length === 0) {
				throw new Error(
					"No slides found in the presentation. The file may be empty or use an unsupported format.",
				);
			}

			const loadImg = (src: string) =>
				new Promise<HTMLImageElement>((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = reject;
					img.src = src;
				});

			let doc: InstanceType<typeof jsPDF> | null = null;
			for (let i = 0; i < parsedSlides.length; i++) {
				const img = await loadImg(parsedSlides[i]!);
				const orientation = img.width > img.height ? "landscape" : "portrait";
				if (!doc) {
					doc = new jsPDF({
						orientation,
						unit: "pt",
						format: [img.width, img.height],
					});
				} else {
					doc.addPage([img.width, img.height], orientation);
				}
				doc.addImage(img, "JPEG", 0, 0, img.width, img.height);
				setProgress(50 + Math.round(((i + 1) / parsedSlides.length) * 45));
			}

			const bytes = new Uint8Array(doc!.output("arraybuffer"));
			setProgress(100);
			setResult(bytes);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to convert PowerPoint to PDF",
			);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone
					accept={[".pptx"]}
					onFiles={handleFiles}
					title="Drop your PowerPoint file here"
					subtitle="or click to browse — .pptx files only"
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
						<ProgressBar progress={progress} label="Converting to PDF..." />
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
								{processing ? "Converting..." : "Convert to PDF"}
							</button>
						) : (
							<DownloadButton
								filename="converted.pdf"
								onClick={() => result && downloadBytes(result, "converted.pdf")}
								label="Download PDF"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
