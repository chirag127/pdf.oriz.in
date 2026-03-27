import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { formatBytes, MAX_FILE_SIZE } from "../../lib/utils/fileValidation";

interface FileDropzoneProps {
	accept: string[];
	multiple?: boolean;
	maxSize?: number;
	onFiles: (files: File[]) => void;
	title?: string;
	subtitle?: string;
}

export function FileDropzone({
	accept,
	multiple = false,
	maxSize = MAX_FILE_SIZE,
	onFiles,
	title = "Drag & Drop your files here",
	subtitle = "or click to browse",
}: FileDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const acceptString = accept.join(",");

	const handleFiles = useCallback(
		(fileList: FileList | null) => {
			if (!fileList) return;
			const files = Array.from(fileList);

			for (const file of files) {
				if (file.size > maxSize) {
					setError(
						`File too large. Maximum size: ${formatBytes(maxSize)}`,
					);
					return;
				}
			}

			setError(null);
			onFiles(files);
		},
		[maxSize, onFiles],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles],
	);

	const handleClick = () => inputRef.current?.click();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFiles(e.target.files);
	};

	return (
		<div className="w-full">
			<button
				type="button"
				className={`
					relative w-full min-h-[200px] sm:min-h-[240px] rounded-xl border-2 border-dashed
					flex flex-col items-center justify-center gap-3 p-8
					cursor-pointer transition-all duration-200 outline-none
					${
						isDragging
							? "border-blue-500 bg-blue-50/80"
							: "border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30"
					}
					focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
				`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
				aria-label="Upload files"
			>
				<div
					className={`
					flex items-center justify-center size-14 rounded-full transition-all duration-200
					${isDragging ? "bg-blue-100 scale-110" : "bg-blue-50"}
				`}
				>
					<Upload
						className={`size-6 transition-colors ${
							isDragging ? "text-blue-600" : "text-blue-500"
						}`}
					/>
				</div>
				<div className="text-center">
					<p className="text-base font-semibold text-gray-900">
						{title}
					</p>
					<p className="text-sm text-gray-500 mt-1">{subtitle}</p>
				</div>
				<p className="text-xs text-gray-400 mt-2">
					Supported: {accept.join(", ")} — Max{" "}
					{formatBytes(maxSize)}
				</p>
			</button>

			<input
				ref={inputRef}
				type="file"
				accept={acceptString}
				multiple={multiple}
				onChange={handleChange}
				className="hidden"
			/>

			{error && (
				<div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					{error}
				</div>
			)}
		</div>
	);
}

interface FileListProps {
	files: File[];
	onRemove: (index: number) => void;
	onReorder?: (from: number, to: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
	if (files.length === 0) return null;

	return (
		<div className="w-full mt-4 space-y-2">
			{files.map((file, index) => (
				<div
					key={`${file.name}-${index}`}
					className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
				>
					<div className="flex items-center justify-center size-10 rounded-lg bg-red-50 shrink-0">
						<FileText className="size-5 text-red-500" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-gray-900 truncate">
							{file.name}
						</p>
						<p className="text-xs text-gray-500">
							{formatBytes(file.size)}
						</p>
					</div>
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="shrink-0 flex items-center justify-center size-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
						aria-label={`Remove ${file.name}`}
					>
						<X className="size-4" />
					</button>
				</div>
			))}
		</div>
	);
}
