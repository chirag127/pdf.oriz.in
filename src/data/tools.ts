/**
 * Tool metadata for all 30+ PDF tools.
 * Each tool has a unique slug, name, icon, category, and description.
 */

export interface Tool {
	slug: string;
	name: string;
	description: string;
	category: ToolCategory;
	icon: string;
	color: string;
	bgColor: string;
}

export type ToolCategory =
	| "organize"
	| "optimize"
	| "convert-to-pdf"
	| "convert-from-pdf"
	| "edit"
	| "security"
	| "ai";

export interface CategoryInfo {
	id: ToolCategory;
	label: string;
	description: string;
}

export const categories: CategoryInfo[] = [
	{
		id: "organize",
		label: "Organize PDF",
		description: "Merge, split, reorder, and manage your PDF pages",
	},
	{
		id: "optimize",
		label: "Optimize PDF",
		description: "Compress, repair, and enhance your PDFs",
	},
	{
		id: "convert-to-pdf",
		label: "Convert to PDF",
		description: "Turn any file format into a PDF document",
	},
	{
		id: "convert-from-pdf",
		label: "Convert from PDF",
		description: "Extract content from PDFs into other formats",
	},
	{
		id: "edit",
		label: "Edit PDF",
		description: "Add watermarks, page numbers, crop, and rotate",
	},
	{
		id: "security",
		label: "PDF Security",
		description: "Protect, unlock, sign, and redact sensitive documents",
	},
	{
		id: "ai",
		label: "AI Tools",
		description: "Smart AI-powered PDF analysis and summarization",
	},
];

export const tools: Tool[] = [
	// ── Organize PDF ──────────────────────────────────────────
	{
		slug: "merge-pdf",
		name: "Merge PDF",
		description: "Combine multiple PDFs into a single document",
		category: "organize",
		icon: "merge",
		color: "#3b82f6",
		bgColor: "#eff6ff",
	},
	{
		slug: "split-pdf",
		name: "Split PDF",
		description: "Extract pages or split into multiple files",
		category: "organize",
		icon: "split",
		color: "#8b5cf6",
		bgColor: "#f5f3ff",
	},
	{
		slug: "remove-pages",
		name: "Remove Pages",
		description: "Delete unwanted pages from your PDF",
		category: "organize",
		icon: "trash-2",
		color: "#ef4444",
		bgColor: "#fef2f2",
	},
	{
		slug: "extract-pages",
		name: "Extract Pages",
		description: "Pull out specific pages as a new PDF",
		category: "organize",
		icon: "file-output",
		color: "#06b6d4",
		bgColor: "#ecfeff",
	},
	{
		slug: "organize-pdf",
		name: "Organize PDF",
		description: "Drag and drop to reorder PDF pages",
		category: "organize",
		icon: "layout-grid",
		color: "#10b981",
		bgColor: "#ecfdf5",
	},
	{
		slug: "scan-to-pdf",
		name: "Scan to PDF",
		description: "Use your camera to scan documents into PDF",
		category: "organize",
		icon: "scan",
		color: "#f59e0b",
		bgColor: "#fffbeb",
	},

	// ── Optimize PDF ──────────────────────────────────────────
	{
		slug: "compress-pdf",
		name: "Compress PDF",
		description: "Reduce file size while preserving quality",
		category: "optimize",
		icon: "archive",
		color: "#f97316",
		bgColor: "#fff7ed",
	},
	{
		slug: "optimize-pdf",
		name: "Optimize PDF",
		description: "Clean metadata and optimize PDF structure",
		category: "optimize",
		icon: "zap",
		color: "#eab308",
		bgColor: "#fefce8",
	},
	{
		slug: "repair-pdf",
		name: "Repair PDF",
		description: "Fix corrupted or damaged PDF files",
		category: "optimize",
		icon: "wrench",
		color: "#6366f1",
		bgColor: "#eef2ff",
	},
	{
		slug: "ocr-pdf",
		name: "OCR PDF",
		description: "Make scanned documents searchable with OCR",
		category: "optimize",
		icon: "search",
		color: "#14b8a6",
		bgColor: "#f0fdfa",
	},

	// ── Convert to PDF ────────────────────────────────────────
	{
		slug: "jpg-to-pdf",
		name: "JPG to PDF",
		description: "Convert images to PDF with custom layout",
		category: "convert-to-pdf",
		icon: "image",
		color: "#ec4899",
		bgColor: "#fdf2f8",
	},
	{
		slug: "word-to-pdf",
		name: "Word to PDF",
		description: "Convert DOCX documents to PDF format",
		category: "convert-to-pdf",
		icon: "file-text",
		color: "#2563eb",
		bgColor: "#eff6ff",
	},
	{
		slug: "powerpoint-to-pdf",
		name: "PowerPoint to PDF",
		description: "Convert presentations to PDF documents",
		category: "convert-to-pdf",
		icon: "presentation",
		color: "#dc2626",
		bgColor: "#fef2f2",
	},
	{
		slug: "excel-to-pdf",
		name: "Excel to PDF",
		description: "Convert spreadsheets to PDF format",
		category: "convert-to-pdf",
		icon: "table",
		color: "#16a34a",
		bgColor: "#f0fdf4",
	},
	{
		slug: "html-to-pdf",
		name: "HTML to PDF",
		description: "Convert HTML content to PDF documents",
		category: "convert-to-pdf",
		icon: "code",
		color: "#f97316",
		bgColor: "#fff7ed",
	},

	// ── Convert from PDF ──────────────────────────────────────
	{
		slug: "pdf-to-jpg",
		name: "PDF to JPG",
		description: "Convert PDF pages to high-quality images",
		category: "convert-from-pdf",
		icon: "image",
		color: "#a855f7",
		bgColor: "#faf5ff",
	},
	{
		slug: "pdf-to-word",
		name: "PDF to Word",
		description: "Extract text and convert to DOCX format",
		category: "convert-from-pdf",
		icon: "file-text",
		color: "#0ea5e9",
		bgColor: "#f0f9ff",
	},
	{
		slug: "pdf-to-powerpoint",
		name: "PDF to PowerPoint",
		description: "Convert PDF pages to presentation slides",
		category: "convert-from-pdf",
		icon: "presentation",
		color: "#f43f5e",
		bgColor: "#fff1f2",
	},
	{
		slug: "pdf-to-excel",
		name: "PDF to Excel",
		description: "Extract tables from PDF to spreadsheets",
		category: "convert-from-pdf",
		icon: "table",
		color: "#22c55e",
		bgColor: "#f0fdf4",
	},
	{
		slug: "pdf-to-pdfa",
		name: "PDF to PDF/A",
		description: "Convert to archival PDF/A format",
		category: "convert-from-pdf",
		icon: "shield-check",
		color: "#78716c",
		bgColor: "#fafaf9",
	},

	// ── Edit PDF ──────────────────────────────────────────────
	{
		slug: "rotate-pdf",
		name: "Rotate PDF",
		description: "Rotate pages clockwise or counterclockwise",
		category: "edit",
		icon: "rotate-cw",
		color: "#0d9488",
		bgColor: "#f0fdfa",
	},
	{
		slug: "add-page-numbers",
		name: "Add Page Numbers",
		description: "Insert customizable page numbers",
		category: "edit",
		icon: "hash",
		color: "#7c3aed",
		bgColor: "#f5f3ff",
	},
	{
		slug: "add-watermark",
		name: "Add Watermark",
		description: "Stamp text or image watermarks on pages",
		category: "edit",
		icon: "stamp",
		color: "#0284c7",
		bgColor: "#f0f9ff",
	},
	{
		slug: "crop-pdf",
		name: "Crop PDF",
		description: "Trim page margins and crop content",
		category: "edit",
		icon: "scissors",
		color: "#d97706",
		bgColor: "#fffbeb",
	},

	// ── PDF Security ──────────────────────────────────────────
	{
		slug: "unlock-pdf",
		name: "Unlock PDF",
		description: "Remove password protection from PDFs",
		category: "security",
		icon: "unlock",
		color: "#16a34a",
		bgColor: "#f0fdf4",
	},
	{
		slug: "protect-pdf",
		name: "Protect PDF",
		description: "Add password and permission restrictions",
		category: "security",
		icon: "lock",
		color: "#dc2626",
		bgColor: "#fef2f2",
	},
	{
		slug: "sign-pdf",
		name: "Sign PDF",
		description: "Add digital signatures to documents",
		category: "security",
		icon: "pen-tool",
		color: "#4f46e5",
		bgColor: "#eef2ff",
	},
	{
		slug: "redact-pdf",
		name: "Redact PDF",
		description: "Permanently black out sensitive content",
		category: "security",
		icon: "eye-off",
		color: "#1f2937",
		bgColor: "#f9fafb",
	},
	{
		slug: "compare-pdf",
		name: "Compare PDF",
		description: "Side-by-side comparison with highlights",
		category: "security",
		icon: "columns",
		color: "#0891b2",
		bgColor: "#ecfeff",
	},

	// ── AI Tools ──────────────────────────────────────────────
	{
		slug: "ai-summarizer",
		name: "AI Summarizer",
		description: "AI-powered PDF analysis and summarization",
		category: "ai",
		icon: "sparkles",
		color: "#8b5cf6",
		bgColor: "#f5f3ff",
	},
];

/**
 * Get all tools in a specific category
 */
export function getToolsByCategory(category: ToolCategory): Tool[] {
	return tools.filter((t) => t.category === category);
}

/**
 * Get a single tool by its slug
 */
export function getToolBySlug(slug: string): Tool | undefined {
	return tools.find((t) => t.slug === slug);
}

/**
 * Get related tools (same category, excluding the current tool)
 */
export function getRelatedTools(slug: string, limit = 4): Tool[] {
	const tool = getToolBySlug(slug);
	if (!tool) return [];
	return tools
		.filter((t) => t.category === tool.category && t.slug !== slug)
		.slice(0, limit);
}
