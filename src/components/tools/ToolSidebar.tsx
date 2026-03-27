import { tools, categories } from "../../data/tools";

interface ToolSidebarProps {
	currentSlug: string;
}

export function ToolSidebar({ currentSlug }: ToolSidebarProps) {
	const currentTool = tools.find((t) => t.slug === currentSlug);
	if (!currentTool) return null;

	const relatedTools = tools.filter(
		(t) => t.category === currentTool.category && t.slug !== currentSlug,
	);

	const steps = [
		{ num: 1, text: "Upload your file(s) using drag & drop or click to browse" },
		{ num: 2, text: "Choose your settings and options" },
		{ num: 3, text: 'Click "Process" and download your result' },
	];

	return (
		<aside className="space-y-6">
			{/* Related Tools */}
			<div className="bg-white border border-gray-200 rounded-xl p-5">
				<h3 className="text-sm font-semibold text-gray-900 mb-3">
					Related Tools
				</h3>
				<ul className="space-y-1">
					{relatedTools.map((tool) => (
						<li key={tool.slug}>
							<a
								href={`/tools/${tool.slug}`}
								className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
							>
								<span
									className="size-6 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
									style={{
										backgroundColor: tool.bgColor,
										color: tool.color,
									}}
								>
									{tool.name.charAt(0)}
								</span>
								{tool.name}
							</a>
						</li>
					))}
				</ul>
			</div>

			{/* How to Use */}
			<div className="bg-white border border-gray-200 rounded-xl p-5">
				<h3 className="text-sm font-semibold text-gray-900 mb-3">
					How to Use
				</h3>
				<ol className="space-y-3">
					{steps.map((step) => (
						<li key={step.num} className="flex gap-3">
							<span className="flex items-center justify-center size-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
								{step.num}
							</span>
							<span className="text-sm text-gray-600 leading-relaxed">
								{step.text}
							</span>
						</li>
					))}
				</ol>
			</div>

			{/* Privacy Badge */}
			<div className="bg-green-50 border border-green-200 rounded-xl p-5">
				<div className="flex items-center gap-2 mb-2">
					<svg
						className="size-5 text-green-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
					<span className="text-sm font-semibold text-green-800">
						100% Private
					</span>
				</div>
				<p className="text-xs text-green-700 leading-relaxed">
					Your files never leave your browser. All processing happens
					locally on your device using WebAssembly.
				</p>
			</div>
		</aside>
	);
}
