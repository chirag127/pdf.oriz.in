interface ProgressBarProps {
	progress: number;
	label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
	const clampedProgress = Math.min(100, Math.max(0, progress));

	return (
		<div className="w-full">
			{label && (
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">
						{label}
					</span>
					<span className="text-sm text-gray-500">
						{Math.round(clampedProgress)}%
					</span>
				</div>
			)}
			<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
				<div
					className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
					style={{ width: `${clampedProgress}%` }}
				/>
			</div>
		</div>
	);
}
