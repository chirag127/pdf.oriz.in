interface TipBoxProps {
  title?: string;
  type?: "tip" | "warning" | "info" | "success";
  children: React.ReactNode;
}

const styles = {
  tip: {
    bg: "bg-amber-50 border-amber-200",
    icon: "💡",
    titleColor: "text-amber-800",
    textColor: "text-amber-700",
  },
  warning: {
    bg: "bg-red-50 border-red-200",
    icon: "⚠️",
    titleColor: "text-red-800",
    textColor: "text-red-700",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "ℹ️",
    titleColor: "text-blue-800",
    textColor: "text-blue-700",
  },
  success: {
    bg: "bg-green-50 border-green-200",
    icon: "✅",
    titleColor: "text-green-800",
    textColor: "text-green-700",
  },
};

export function TipBox({ title, type = "tip", children }: TipBoxProps) {
  const s = styles[type];
  return (
    <div className={`my-6 p-5 rounded-xl border ${s.bg} not-prose`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
        <div>
          {title && (
            <h4 className={`font-semibold ${s.titleColor} mb-2`}>{title}</h4>
          )}
          <div className={`text-sm leading-relaxed ${s.textColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export function CallToAction({ title, description, buttonText, href }: CallToActionProps) {
  return (
    <div className="my-10 p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 text-white not-prose">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-blue-100 mb-6">{description}</p>
      <a
        href={href}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
      >
        {buttonText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

interface ComparisonRow {
  feature: string;
  a: boolean | string;
  b: boolean | string;
}

interface ComparisonTableProps {
  titleA: string;
  titleB: string;
  rows: ComparisonRow[];
}

export function ComparisonTable({ titleA, titleB, rows }: ComparisonTableProps) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="text-green-600 font-medium">✅ Yes</span>
      ) : (
        <span className="text-red-400 font-medium">❌ No</span>
      );
    }
    return <span className="text-gray-700">{value}</span>;
  };

  return (
    <div className="my-8 overflow-x-auto not-prose">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">Feature</th>
            <th className="text-left p-3 font-semibold text-blue-700 border border-gray-200">{titleA}</th>
            <th className="text-left p-3 font-semibold text-gray-700 border border-gray-200">{titleB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              <td className="p-3 border border-gray-200 font-medium text-gray-800">{row.feature}</td>
              <td className="p-3 border border-gray-200">{renderCell(row.a)}</td>
              <td className="p-3 border border-gray-200">{renderCell(row.b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FAQItem {
  q: string;
  a: string;
}

export function BlogFAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="my-10 not-prose">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
              <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-gray-600 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

interface StepByStepProps {
  steps: { title: string; description: string }[];
}

export function StepByStep({ steps }: StepByStepProps) {
  return (
    <div className="my-8 not-prose space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{step.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StatBoxProps {
  value: string;
  label: string;
}

export function StatGrid({ stats }: { stats: StatBoxProps[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8 not-prose">
      {stats.map((stat, i) => (
        <div key={i} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-center border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
