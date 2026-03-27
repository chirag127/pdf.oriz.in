interface FAQItem {
	question: string;
	answer: string;
}

interface ToolFAQProps {
	items: FAQItem[];
	toolName: string;
}

export function ToolFAQ({ items, toolName }: ToolFAQProps) {
	if (items.length === 0) return null;

	const schema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.answer,
			},
		})),
	};

	return (
		<section className="mt-12 pt-10 border-t border-gray-200">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
				dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
			/>
			<h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
				Frequently Asked Questions
			</h2>
			<div className="space-y-4">
				{items.map((item, index) => (
					<details
						key={index}
						className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
					>
						<summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
							<span className="text-sm font-semibold text-gray-900 pr-4">
								{item.question}
							</span>
							<svg
								className="size-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</summary>
						<div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
							{item.answer}
						</div>
					</details>
				))}
			</div>
		</section>
	);
}
