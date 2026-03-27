import { Download } from "lucide-react";

interface DownloadButtonProps {
	filename: string;
	onClick: () => void;
	disabled?: boolean;
	processing?: boolean;
	label?: string;
}

export function DownloadButton({
	filename,
	onClick,
	disabled = false,
	processing = false,
	label = "Download",
}: DownloadButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled || processing}
			className={`
				inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
				transition-all duration-200
				${
					disabled
						? "bg-gray-200 text-gray-500 cursor-not-allowed"
						: processing
							? "bg-blue-400 text-white cursor-wait"
							: "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-px hover:shadow-lg"
				}
			`}
		>
			{processing ? (
				<svg
					className="size-4 animate-spin"
					viewBox="0 0 24 24"
					fill="none"
				>
					<circle
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="3"
						className="opacity-25"
					/>
					<path
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						fill="currentColor"
						className="opacity-75"
					/>
				</svg>
			) : (
				<Download className="size-4" />
			)}
			{processing ? "Processing..." : `${label}: ${filename}`}
		</button>
	);
}
