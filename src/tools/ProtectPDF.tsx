import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { protectPDF } from "../lib/pdf/protect";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function ProtectPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [userPassword, setUserPassword] = useState("");
	const [ownerPassword, setOwnerPassword] = useState("");
	const [allowPrinting, setAllowPrinting] = useState(true);
	const [allowCopying, setAllowCopying] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setResult(null); setError(null); }
	}, []);

	const handleProcess = async () => {
		if (!file || !userPassword) { setError("Please enter a password."); return; }
		setProcessing(true); setProgress(0); setError(null);
		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 10, 90)), 100);
			const protected_ = await protectPDF(file, {
				userPassword,
				ownerPassword: ownerPassword || undefined,
				allowPrinting,
				allowCopying,
			});
			clearInterval(interval); setProgress(100); setResult(protected_);
		} catch (err) { setError(err instanceof Error ? err.message : "Failed to protect PDF"); } finally { setProcessing(false); }
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

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">User Password (required)</label>
							<input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Password to open the PDF" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Owner Password (optional)</label>
							<input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Password for full permissions" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
						</div>
						<div className="flex gap-6">
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input type="checkbox" checked={allowPrinting} onChange={(e) => setAllowPrinting(e.target.checked)} className="rounded" /> Allow printing
							</label>
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input type="checkbox" checked={allowCopying} onChange={(e) => setAllowCopying(e.target.checked)} className="rounded" /> Allow copying
							</label>
						</div>
					</div>

					{processing && <ProgressBar progress={progress} label="Protecting PDF..." />}
					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button type="button" onClick={handleProcess} disabled={processing || !userPassword} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">{processing ? "Protecting..." : "Protect PDF"}</button>
						) : (
							<DownloadButton filename="protected.pdf" onClick={() => result && downloadBytes(result, "protected.pdf")} label="Download" />
						)}
					</div>
				</>
			)}
		</div>
	);
}
