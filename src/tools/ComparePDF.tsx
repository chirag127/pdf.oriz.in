import { useCallback, useState } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { formatBytes } from "../lib/utils/fileValidation";

interface PagePair {
	left: string;
	right: string;
	diffCanvas: string | null;
}

export default function ComparePDF() {
	const [file1, setFile1] = useState<File | null>(null);
	const [file2, setFile2] = useState<File | null>(null);
	const [pages, setPages] = useState<PagePair[]>([]);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [viewMode, setViewMode] = useState<"side-by-side" | "diff">(
		"side-by-side",
	);

	const handleFiles1 = useCallback((files: File[]) => {
		if (files.length > 0) {
			setFile1(files[0]!);
			setPages([]);
			setError(null);
		}
	}, []);

	const handleFiles2 = useCallback((files: File[]) => {
		if (files.length > 0) {
			setFile2(files[0]!);
			setPages([]);
			setError(null);
		}
	}, []);

	const renderPageToDataUrl = async (
		pdf: any,
		pageNum: number,
	): Promise<string> => {
		const page = await pdf.getPage(pageNum);
		const viewport = page.getViewport({ scale: 1.5 });
		const canvas = document.createElement("canvas");
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext("2d")!;
		await page.render({ canvasContext: ctx, viewport }).promise;
		return canvas.toDataURL("image/jpeg", 0.85);
	};

	const computeDiff = (
		leftUrl: string,
		rightUrl: string,
		width: number,
		height: number,
	): Promise<string> => {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d")!;

			const leftImg = new Image();
			const rightImg = new Image();
			let loaded = 0;

			const onLoad = () => {
				loaded++;
				if (loaded < 2) return;

				ctx.drawImage(leftImg, 0, 0, width, height);
				const leftData = ctx.getImageData(0, 0, width, height);
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(rightImg, 0, 0, width, height);
				const rightData = ctx.getImageData(0, 0, width, height);
				const diffData = ctx.createImageData(width, height);

				for (let i = 0; i < leftData.data.length; i += 4) {
					const rDiff = Math.abs(leftData.data[i]! - rightData.data[i]!);
					const gDiff = Math.abs(
						leftData.data[i + 1]! - rightData.data[i + 1]!,
					);
					const bDiff = Math.abs(
						leftData.data[i + 2]! - rightData.data[i + 2]!,
					);
					const totalDiff = rDiff + gDiff + bDiff;

					if (totalDiff > 30) {
						diffData.data[i] = 255;
						diffData.data[i + 1] = 50;
						diffData.data[i + 2] = 50;
						diffData.data[i + 3] = 200;
					} else {
						const gray =
							(leftData.data[i]! +
								leftData.data[i + 1]! +
								leftData.data[i + 2]!) /
							3;
						diffData.data[i] = gray;
						diffData.data[i + 1] = gray;
						diffData.data[i + 2] = gray;
						diffData.data[i + 3] = 255;
					}
				}

				ctx.putImageData(diffData, 0, 0);
				resolve(canvas.toDataURL("image/png"));
			};

			leftImg.onload = onLoad;
			rightImg.onload = onLoad;
			leftImg.src = leftUrl;
			rightImg.src = rightUrl;
		});
	};

	const handleCompare = async () => {
		if (!file1 || !file2) return;
		setProcessing(true);
		setProgress(0);
		setError(null);
		setPages([]);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";

			const bytes1 = new Uint8Array(await file1.arrayBuffer());
			const bytes2 = new Uint8Array(await file2.arrayBuffer());
			const pdf1 = await getDocument({ data: bytes1 }).promise;
			const pdf2 = await getDocument({ data: bytes2 }).promise;

			const maxPages = Math.max(pdf1.numPages, pdf2.numPages);
			const pairs: PagePair[] = [];

			for (let i = 1; i <= maxPages; i++) {
				const left =
					i <= pdf1.numPages ? await renderPageToDataUrl(pdf1, i) : "";
				const right =
					i <= pdf2.numPages ? await renderPageToDataUrl(pdf2, i) : "";

				let diffCanvas: string | null = null;
				if (left && right) {
					const page1 = await pdf1.getPage(Math.min(i, pdf1.numPages));
					const vp1 = page1.getViewport({ scale: 1.5 });
					diffCanvas = await computeDiff(left, right, vp1.width, vp1.height);
				}

				pairs.push({ left, right, diffCanvas });
				setProgress(Math.round((i / maxPages) * 100));
			}

			setPages(pairs);
			setCurrentPage(0);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to compare PDFs");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="space-y-6">
			{(!file1 || !file2) && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className="text-sm font-medium text-gray-700 mb-2">
							Original PDF
						</p>
						{!file1 ? (
							<FileDropzone
								accept={[".pdf"]}
								onFiles={handleFiles1}
								title="Drop first PDF"
								subtitle="original document"
							/>
						) : (
							<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">
										{file1.name}
									</p>
									<p className="text-xs text-gray-500">
										{formatBytes(file1.size)}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setFile1(null)}
									className="text-sm text-blue-600 hover:text-blue-700"
								>
									Change
								</button>
							</div>
						)}
					</div>
					<div>
						<p className="text-sm font-medium text-gray-700 mb-2">
							Modified PDF
						</p>
						{!file2 ? (
							<FileDropzone
								accept={[".pdf"]}
								onFiles={handleFiles2}
								title="Drop second PDF"
								subtitle="modified document"
							/>
						) : (
							<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">
										{file2.name}
									</p>
									<p className="text-xs text-gray-500">
										{formatBytes(file2.size)}
									</p>
								</div>
								<button
									type="button"
									onClick={() => setFile2(null)}
									className="text-sm text-blue-600 hover:text-blue-700"
								>
									Change
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{file1 && file2 && (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900">
								{file1.name} vs {file2.name}
							</p>
							<p className="text-xs text-gray-500">{pages.length} page(s)</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setFile1(null);
								setFile2(null);
								setPages([]);
							}}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{processing && (
						<ProgressBar progress={progress} label="Comparing PDFs..." />
					)}

					{!processing && pages.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center gap-4 flex-wrap">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-700">
										Page:
									</span>
									{pages.map((_, i) => (
										<button
											key={i}
											type="button"
											onClick={() => setCurrentPage(i)}
											className={`px-3 py-1 rounded text-sm font-medium ${
												currentPage === i
													? "bg-cyan-600 text-white"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200"
											}`}
										>
											{i + 1}
										</button>
									))}
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setViewMode("side-by-side")}
										className={`px-3 py-1 rounded text-sm font-medium ${
											viewMode === "side-by-side"
												? "bg-cyan-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										Side by Side
									</button>
									<button
										type="button"
										onClick={() => setViewMode("diff")}
										className={`px-3 py-1 rounded text-sm font-medium ${
											viewMode === "diff"
												? "bg-cyan-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										Diff View
									</button>
								</div>
							</div>

							{viewMode === "side-by-side" ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium text-gray-600 mb-2">
											Original
										</p>
										{pages[currentPage]?.left ? (
											<img
												src={pages[currentPage]!.left}
												alt="Original page"
												className="w-full border border-gray-200 rounded-lg"
											/>
										) : (
											<div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg text-gray-400 text-sm">
												No page in original
											</div>
										)}
									</div>
									<div>
										<p className="text-sm font-medium text-gray-600 mb-2">
											Modified
										</p>
										{pages[currentPage]?.right ? (
											<img
												src={pages[currentPage]!.right}
												alt="Modified page"
												className="w-full border border-gray-200 rounded-lg"
											/>
										) : (
											<div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg text-gray-400 text-sm">
												No page in modified
											</div>
										)}
									</div>
								</div>
							) : (
								<div>
									<p className="text-sm font-medium text-gray-600 mb-2">
										Differences (red highlights changed areas)
									</p>
									{pages[currentPage]?.diffCanvas ? (
										<img
											src={pages[currentPage]!.diffCanvas!}
											alt="Diff view"
											className="w-full border border-gray-200 rounded-lg"
										/>
									) : (
										<div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg text-gray-400 text-sm">
											One or both pages are empty — no diff available
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</>
			)}

			{error && (
				<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					{error}
				</div>
			)}

			{file1 && file2 && pages.length === 0 && !processing && (
				<button
					type="button"
					onClick={handleCompare}
					className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all text-sm"
				>
					Compare PDFs
				</button>
			)}
		</div>
	);
}
