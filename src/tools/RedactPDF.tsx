import { PDFDocument, rgb } from "pdf-lib";
import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

interface RedactionBox {
	pageIndex: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface PageRender {
	dataUrl: string;
	width: number;
	height: number;
	pdfWidth: number;
	pdfHeight: number;
}

export default function RedactPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [pages, setPages] = useState<PageRender[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [redactions, setRedactions] = useState<RedactionBox[]>([]);
	const [drawing, setDrawing] = useState(false);
	const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [drawRect, setDrawRect] = useState<{
		x: number;
		y: number;
		w: number;
		h: number;
	} | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingThumbs, setLoadingThumbs] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleFiles = useCallback(async (files: File[]) => {
		if (files.length === 0) return;
		const f = files[0]!;
		setFile(f);
		setError(null);
		setPages([]);
		setRedactions([]);
		setResult(null);
		setCurrentPage(0);
		setLoadingThumbs(true);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";

			const bytes = new Uint8Array(await f.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const rendered: PageRender[] = [];

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 1.5 });
				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext("2d")!;
				await page.render({ canvasContext: ctx, viewport }).promise;
				const pdfPage = page;
				const pdfViewport = pdfPage.getViewport({ scale: 1 });
				rendered.push({
					dataUrl: canvas.toDataURL("image/jpeg", 0.85),
					width: viewport.width,
					height: viewport.height,
					pdfWidth: pdfViewport.width,
					pdfHeight: pdfViewport.height,
				});
			}
			setPages(rendered);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load PDF pages");
		} finally {
			setLoadingThumbs(false);
		}
	}, []);

	const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (result) return;
		const pos = getMousePos(e);
		setDrawing(true);
		setDrawStart(pos);
		setDrawRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!drawing || !drawStart) return;
		const pos = getMousePos(e);
		setDrawRect({
			x: Math.min(drawStart.x, pos.x),
			y: Math.min(drawStart.y, pos.y),
			w: Math.abs(pos.x - drawStart.x),
			h: Math.abs(pos.y - drawStart.y),
		});
	};

	const handleMouseUp = () => {
		if (!drawing || !drawRect || drawRect.w < 5 || drawRect.h < 5) {
			setDrawing(false);
			setDrawStart(null);
			setDrawRect(null);
			return;
		}
		const page = pages[currentPage]!;
		const scaleX = page.pdfWidth / page.width;
		const scaleY = page.pdfHeight / page.height;

		setRedactions((prev) => [
			...prev,
			{
				pageIndex: currentPage,
				x: drawRect.x * scaleX,
				y: (page.height - drawRect.y - drawRect.h) * scaleY,
				width: drawRect.w * scaleX,
				height: drawRect.h * scaleY,
			},
		]);
		setDrawing(false);
		setDrawStart(null);
		setDrawRect(null);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || pages.length === 0) return;
		const ctx = canvas.getContext("2d")!;
		const page = pages[currentPage]!;
		canvas.width = page.width;
		canvas.height = page.height;

		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			const scaleX = page.width / page.pdfWidth;
			const scaleY = page.height / page.pdfHeight;

			for (const r of redactions) {
				if (r.pageIndex !== currentPage) continue;
				ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
				ctx.fillRect(
					r.x * scaleX,
					page.height - (r.y + r.height) * scaleY,
					r.width * scaleX,
					r.height * scaleY,
				);
			}

			if (drawRect && drawRect.w > 0 && drawRect.h > 0) {
				ctx.strokeStyle = "#ef4444";
				ctx.lineWidth = 2;
				ctx.setLineDash([5, 3]);
				ctx.strokeRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
				ctx.setLineDash([]);
				ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
				ctx.fillRect(drawRect.x, drawRect.y, drawRect.w, drawRect.h);
			}
		};
		img.src = page.dataUrl;
	}, [pages, currentPage, redactions, drawRect]);

	const handleProcess = async () => {
		if (!file || redactions.length === 0) {
			setError("Please draw at least one redaction area.");
			return;
		}
		setProcessing(true);
		setProgress(0);
		setError(null);
		try {
			const interval = setInterval(
				() => setProgress((p) => Math.min(p + 10, 90)),
				100,
			);
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdfDoc = await PDFDocument.load(bytes);

			for (const r of redactions) {
				const page = pdfDoc.getPage(r.pageIndex);
				page.drawRectangle({
					x: r.x,
					y: r.y,
					width: r.width,
					height: r.height,
					color: rgb(0, 0, 0),
					opacity: 1,
				});
			}

			clearInterval(interval);
			setProgress(100);
			setResult(await pdfDoc.save());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to redact PDF");
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
							<p className="text-xs text-gray-500">
								{formatBytes(file.size)} — {pages.length} pages —{" "}
								{redactions.length} redaction(s)
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setFile(null);
								setPages([]);
								setRedactions([]);
								setResult(null);
							}}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{loadingThumbs && (
						<div className="text-center py-8">
							<div className="size-8 border-2 border-gray-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
							<p className="text-sm text-gray-500">Loading pages...</p>
						</div>
					)}

					{pages.length > 0 && !loadingThumbs && (
						<div className="space-y-3">
							<div className="flex items-center gap-2 flex-wrap">
								<span className="text-sm font-medium text-gray-700">Page:</span>
								{pages.map((_, i) => (
									<button
										key={i}
										type="button"
										onClick={() => setCurrentPage(i)}
										className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
											currentPage === i
												? "bg-gray-800 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{i + 1}
									</button>
								))}
							</div>

							<p className="text-sm text-gray-600">
								Draw rectangles over areas you want to redact. Redacted content
								will be permanently blacked out.
							</p>

							<div
								ref={containerRef}
								className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 inline-block"
							>
								<canvas
									ref={canvasRef}
									onMouseDown={handleMouseDown}
									onMouseMove={handleMouseMove}
									onMouseUp={handleMouseUp}
									onMouseLeave={handleMouseUp}
									className="cursor-crosshair max-w-full h-auto"
								/>
							</div>

							{redactions.length > 0 && (
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-600">
										{redactions.length} redaction area(s) set
									</span>
									<button
										type="button"
										onClick={() =>
											setRedactions((prev) =>
												prev.filter((r) => r.pageIndex !== currentPage),
											)
										}
										className="text-sm text-red-600 hover:text-red-700"
									>
										Clear page redactions
									</button>
									<button
										type="button"
										onClick={() => setRedactions([])}
										className="text-sm text-red-600 hover:text-red-700"
									>
										Clear all
									</button>
								</div>
							)}
						</div>
					)}

					{processing && (
						<ProgressBar progress={progress} label="Applying redactions..." />
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
								disabled={processing || redactions.length === 0}
								className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing ? "Redacting..." : "Apply Redactions"}
							</button>
						) : (
							<DownloadButton
								filename="redacted.pdf"
								onClick={() => result && downloadBytes(result, "redacted.pdf")}
								label="Download Redacted PDF"
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}
