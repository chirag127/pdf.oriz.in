import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { formatBytes } from "../lib/utils/fileValidation";

interface PlaceholderToolProps {
	toolName: string;
	acceptFormats: string[];
	description: string;
	multiple?: boolean;
}

export default function PlaceholderTool({ toolName, acceptFormats, description, multiple }: PlaceholderToolProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState("");

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFiles(multiple ? files : [files[0]!]); setError(null); setMessage(""); }
	}, [multiple]);

	const handleProcess = async () => {
		if (files.length === 0) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			await new Promise((r) => setTimeout(r, 2000));
			clearInterval(interval); setProgress(100);
			setMessage(`${toolName} completed successfully. The processed file would download automatically.`);
		} catch (err) { setError(err instanceof Error ? err.message : "Processing failed"); } finally { setProcessing(false); }
	};

	const hasFile = files.length > 0;

	return (
		<div className="space-y-6">
			{!hasFile ? (
				<FileDropzone accept={acceptFormats} onFiles={handleFiles} multiple={multiple} title={multiple ? "Drop your files here" : "Drop your file here"} subtitle="or click to browse" />
			) : (
				<>
					<div className="space-y-2">
						{files.map((file, i) => (
							<div key={i} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
								<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
								<button type="button" onClick={() => { setFiles([]); setMessage(""); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
							</div>
						))}
					</div>

					{processing && <ProgressBar progress={progress} label="Processing..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
					{message && <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">{message}</div>}

					<div className="flex flex-wrap items-center gap-3">
						<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Processing..." : toolName}</button>
					</div>

					<div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
						<strong>Note:</strong> {description}
					</div>
				</>
			)}
		</div>
	);
}
