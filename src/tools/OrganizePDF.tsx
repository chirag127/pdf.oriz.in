import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useEffect, useState } from "react";
import { DownloadButton } from "../components/tools/DownloadButton";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

interface PageThumb {
	id: string;
	index: number;
	dataUrl: string;
	deleted: boolean;
}

function SortablePage({
	page,
	onDelete,
}: {
	page: PageThumb;
	onDelete: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: page.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 10 : 0,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
		>
			<div
				{...attributes}
				{...listeners}
				className="absolute top-1 left-1 cursor-grab active:cursor-grabbing p-1 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
			>
				<GripVertical className="size-4 text-gray-500" />
			</div>
			<button
				type="button"
				onClick={onDelete}
				className="absolute top-1 right-1 p-1 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
			>
				<Trash2 className="size-4 text-red-500" />
			</button>
			<img
				src={page.dataUrl}
				alt={`Page ${page.index + 1}`}
				className="w-full h-auto"
				draggable={false}
			/>
			<div className="text-center text-xs text-gray-500 py-1 bg-gray-50">
				Page {page.index + 1}
			</div>
		</div>
	);
}

export default function OrganizePDF() {
	const [file, setFile] = useState<File | null>(null);
	const [pages, setPages] = useState<PageThumb[]>([]);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [loadingThumbs, setLoadingThumbs] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	const handleFiles = useCallback(async (files: File[]) => {
		if (files.length === 0) return;
		const f = files[0]!;
		setFile(f);
		setError(null);
		setPages([]);
		setLoadingThumbs(true);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";

			const bytes = new Uint8Array(await f.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const thumbs: PageThumb[] = [];

			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const viewport = page.getViewport({ scale: 1 });
				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext("2d")!;
				await page.render({ canvasContext: ctx, viewport }).promise;
				thumbs.push({
					id: `page-${i}`,
					index: i - 1,
					dataUrl: canvas.toDataURL("image/jpeg", 0.7),
					deleted: false,
				});
			}
			setPages(thumbs);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load PDF pages");
		} finally {
			setLoadingThumbs(false);
		}
	}, []);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		setPages((items) => {
			const oldIndex = items.findIndex((p) => p.id === active.id);
			const newIndex = items.findIndex((p) => p.id === over.id);
			return arrayMove(items, oldIndex, newIndex);
		});
	};

	const handleDelete = (id: string) => {
		setPages((prev) => prev.filter((p) => p.id !== id));
	};

	const handleProcess = async () => {
		if (!file) return;
		const activePages = pages.filter((p) => !p.deleted);
		if (activePages.length === 0) {
			setError("No pages remaining to save.");
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
			const srcBytes = new Uint8Array(await file.arrayBuffer());
			const srcDoc = await PDFDocument.load(srcBytes);
			const outDoc = await PDFDocument.create();

			for (let i = 0; i < activePages.length; i++) {
				const originalIndex = parseInt(activePages[i]!.id.split("-")[1]!) - 1;
				const [copiedPage] = await outDoc.copyPages(srcDoc, [originalIndex]);
				outDoc.addPage(copiedPage);
				setProgress(Math.round(((i + 1) / activePages.length) * 90));
			}

			clearInterval(interval);
			setProgress(100);
			const result = await outDoc.save();
			downloadBytes(result, "organized.pdf");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to organize PDF");
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
								{formatBytes(file.size)} — {pages.length} pages
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setFile(null);
								setPages([]);
							}}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{loadingThumbs && (
						<div className="text-center py-8">
							<div className="size-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
							<p className="text-sm text-gray-500">
								Loading page thumbnails...
							</p>
						</div>
					)}

					{pages.length > 0 && !loadingThumbs && (
						<div>
							<p className="text-sm text-gray-600 mb-3">
								Drag pages to reorder. Click the trash icon to remove pages.
							</p>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={pages.filter((p) => !p.deleted).map((p) => p.id)}
									strategy={rectSortingStrategy}
								>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
										{pages
											.filter((p) => !p.deleted)
											.map((page) => (
												<SortablePage
													key={page.id}
													page={page}
													onDelete={() => handleDelete(page.id)}
												/>
											))}
									</div>
								</SortableContext>
							</DndContext>
						</div>
					)}

					{processing && (
						<ProgressBar progress={progress} label="Saving organized PDF..." />
					)}
					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					{pages.filter((p) => !p.deleted).length > 0 && (
						<div className="flex flex-wrap items-center gap-3">
							{!processing ? (
								<button
									type="button"
									onClick={handleProcess}
									className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
								>
									Save Organized PDF
								</button>
							) : (
								<span className="text-sm text-gray-500">Processing...</span>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
