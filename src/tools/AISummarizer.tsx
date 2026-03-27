import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBlob } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

export default function AISummarizer() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<{
		title: string;
		summary: string;
		keyPoints: string[];
		wordCount: number;
		language: string;
	} | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) { setFile(files[0]!); setError(null); setResult(null); }
	}, []);

	const handleProcess = async () => {
		if (!file) return;
		setProcessing(true); setProgress(0); setError(null);
		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs`;

			setProgress(10);
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;

			setProgress(30);
			let fullText = "";
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
			}

			setProgress(50);
			const textPreview = fullText.substring(0, 8000);
			const wordCount = fullText.split(/\s+/).filter((w) => w).length;

			// Use Puter.js for AI summarization
			const puter = (window as any).puter;
			if (!puter?.ai) {
				throw new Error("Puter.js AI is not loaded. Please ensure you have internet access.");
			}

			const prompt = `Analyze this PDF document content and provide a structured summary.
Respond ONLY in JSON format with these exact keys:
- title: A concise title (max 10 words)
- summary: A 2-3 paragraph executive summary
- keyPoints: An array of 5-7 key bullet points (strings)
- language: The detected language name
- wordCount: The approximate word count of the original document

Content:
${textPreview}`;

			const response = await puter.ai.chat(prompt, {
				model: "claude-sonnet-4-5",
			});

			setProgress(90);
			const text = typeof response === "string" ? response : response?.message?.content?.[0]?.text ?? JSON.stringify(response);

			let parsed;
			try {
				const jsonMatch = text.match(/\{[\s\S]*\}/);
				parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
			} catch {
				parsed = {
					title: "Document Summary",
					summary: text.substring(0, 1000),
					keyPoints: ["Analysis completed", "See summary for details"],
					language: "Unknown",
					wordCount,
				};
			}

			setProgress(100);
			setResult({ ...parsed, wordCount });
		} catch (err) {
			setError(err instanceof Error ? err.message : "AI summarization failed");
		} finally { setProcessing(false); }
	};

	const handleDownloadTxt = () => {
		if (!result) return;
		const content = `${result.title}\n${"=".repeat(result.title.length)}\n\nSummary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map((p) => `- ${p}`).join("\n")}\n\nWord Count: ${result.wordCount}\nLanguage: ${result.language}`;
		const blob = new Blob([content], { type: "text/plain" });
		downloadBlob(blob, "summary.txt");
	};

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone accept={[".pdf"]} onFiles={handleFiles} title="Drop your PDF here" subtitle="or click to browse — AI will analyze and summarize" />
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{file.name}</p><p className="text-xs text-gray-500">{formatBytes(file.size)}</p></div>
						<button type="button" onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:text-blue-700">Change</button>
					</div>

					{processing && <ProgressBar progress={progress} label="AI is analyzing your document..." />}

					{error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

					{result ? (
						<div className="space-y-4">
							<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
								<div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-gray-200">
									<h3 className="font-display text-lg font-bold text-gray-900">{result.title}</h3>
									<div className="flex gap-4 mt-2 text-xs text-gray-500">
										<span>{result.wordCount.toLocaleString()} words</span>
										<span>{result.language}</span>
									</div>
								</div>
								<div className="px-6 py-4 space-y-4">
									<div>
										<h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
										<p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-700 mb-2">Key Points</h4>
										<ul className="space-y-1.5">
											{result.keyPoints.map((point, i) => (
												<li key={i} className="flex gap-2 text-sm text-gray-600">
													<span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
													{point}
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>

							<div className="flex gap-3">
								<button type="button" onClick={handleDownloadTxt} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all text-sm">Download as TXT</button>
								<button type="button" onClick={() => { setFile(null); setResult(null); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Analyze Another</button>
							</div>
						</div>
					) : (
						<div className="flex flex-wrap items-center gap-3">
							<button type="button" onClick={handleProcess} disabled={processing} className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm">
								<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>
								{processing ? "Analyzing..." : "Summarize with AI"}
							</button>
						</div>
					)}

					<div className="px-4 py-3 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700">
						<strong>AI-Powered:</strong> This tool uses Puter.js for free AI analysis. You'll need to sign in with a free Puter account when prompted.
					</div>
				</>
			)}
		</div>
	);
}
