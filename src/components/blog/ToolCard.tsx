import { tools } from "../data/tools";

const iconMap: Record<string, string> = {
  merge: "🔀", split: "✂️", "trash-2": "🗑️", "file-output": "📄",
  "layout-grid": "📐", scan: "📷", archive: "📦", zap: "⚡",
  wrench: "🔧", search: "🔍", image: "🖼️", "file-text": "📝",
  presentation: "📊", table: "📊", code: "</>", "shield-check": "🛡️",
  "rotate-cw": "🔄", hash: "#️⃣", stamp: "⬛", scissors: "✂️",
  unlock: "🔓", lock: "🔒", "pen-tool": "✍️", "eye-off": "👁️",
  columns: "📄📄", sparkles: "✨",
};

interface ToolCardProps {
  slug: string;
  className?: string;
}

export function ToolCard({ slug, className = "" }: ToolCardProps) {
  const tool = tools.find(t => t.slug === slug);
  if (!tool) return null;

  return (
    <a
      href={`/tools/${tool.slug}`}
      className={`block p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white group ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: tool.bgColor }}
        >
          {iconMap[tool.icon] || "📄"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {tool.description}
          </p>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

export function ToolCardGrid({ slugs }: { slugs: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 not-prose">
      {slugs.map(slug => (
        <ToolCard key={slug} slug={slug} />
      ))}
    </div>
  );
}
