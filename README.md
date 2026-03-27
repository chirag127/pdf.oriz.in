# OrizPDF

<div align="center">

[![CI Status](https://github.com/chirag127/orizpdf/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/orizpdf/actions)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-de3402?style=flat&logo=cloudflare)](https://pdf.oriz.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

</div>

> **Every PDF tool you need. Free. Fast. Private.**

OrizPDF is a comprehensive, free, open-source PDF tools platform with 30+ tools for merging, splitting, compressing, converting, editing, and securing PDF files. All processing happens 100% in your browser — your files never leave your device.

## ✨ Features

- **🔒 100% Private** — All PDF processing runs locally in your browser using WebAssembly
- **⚡ Lightning Fast** — Powered by WebAssembly and optimized JavaScript
- **🆓 Always Free** — No account required, no hidden fees
- **🌍 Works Everywhere** — Any browser, any device
- **🤖 AI Powered** — Smart summarization with Puter.js AI

## 🛠️ Tools (30+)

### Organize PDF
- [x] Merge PDF — Combine multiple PDFs
- [x] Split PDF — Extract pages or split into files
- [x] Remove Pages — Delete unwanted pages
- [x] Extract Pages — Pull out specific pages
- [ ] Organize PDF — Drag-drop page reordering
- [x] Scan to PDF — Use camera to scan documents

### Optimize PDF
- [x] Compress PDF — Reduce file size
- [x] Optimize PDF — Clean metadata
- [x] Repair PDF — Fix corrupted files
- [x] OCR PDF — Make scanned PDFs searchable

### Convert to PDF
- [x] JPG to PDF — Convert images to PDF
- [ ] Word to PDF — Convert DOCX files
- [ ] PowerPoint to PDF — Convert PPTX files
- [x] Excel to PDF — Convert XLSX files
- [x] HTML to PDF — Convert HTML to PDF

### Convert from PDF
- [x] PDF to JPG — Convert PDF to images
- [ ] PDF to Word — Convert to DOCX
- [ ] PDF to PowerPoint — Convert to PPTX
- [ ] PDF to Excel — Extract tables
- [ ] PDF to PDF/A — Archival format

### Edit PDF
- [x] Rotate PDF — Rotate pages
- [x] Add Page Numbers — Insert numbers
- [x] Add Watermark — Stamp text
- [x] Crop PDF — Trim margins

### PDF Security
- [x] Unlock PDF — Remove password
- [x] Protect PDF — Add password
- [x] Sign PDF — Add signatures
- [ ] Redact PDF — Black out content
- [ ] Compare PDF — Side-by-side diff

### AI Tools
- [x] AI Summarizer — AI-powered analysis

## 🚀 Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Astro 6 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| PDF Core | pdf-lib, pdfjs-dist |
| OCR | Tesseract.js |
| Conversion | mammoth, xlsx, jsPDF |
| AI | Puter.js |
| Drag & Drop | @dnd-kit |
| Animation | framer-motion |
| Icons | lucide-react |
| Testing | Vitest, Playwright |
| Linting | Biome.js |
| Hosting | Cloudflare Pages |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/chirag127/orizpdf.git
cd orizpdf

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
```

The output will be in the `dist/` directory.

## 📁 Project Structure

```
orizpdf/
├── src/
│   ├── components/       # UI components
│   │   ├── home/        # Homepage sections
│   │   ├── layout/     # Header, Footer
│   │   └── tools/      # Tool components
│   ├── tools/          # React tool implementations
│   ├── lib/             # PDF processing libraries
│   │   ├── pdf/         # pdf-lib operations
│   │   ├── convert/     # File conversions
│   │   └── utils/       # Utilities
│   ├── pages/           # Astro pages
│   │   └── tools/       # Tool pages
│   ├── data/            # Tool metadata
│   └── styles/          # Global CSS
├── public/              # Static assets
├── tests/               # Unit & E2E tests
└── dist/                # Build output
```

## 🔧 Environment Variables

No secrets required for core functionality. The project works entirely client-side.

Optional: Add `.env` for any future integrations.

## 🚢 Deployment

### Cloudflare Pages

1. Fork this repository
2. Connect to Cloudflare Pages
3. Set build command: `pnpm build`
4. Set output directory: `dist`
5. Deploy!

### GitHub Actions

The project includes CI/CD workflows:

- **CI** — Runs on every PR and push to main/develop
- **Deploy** — Auto-deploys to Cloudflare Pages on push to main

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [pdf-lib](https://github.com/Hopding/pdf-lib) — PDF manipulation
- [pdf.js](https://mozilla.github.io/pdf.js/) — PDF rendering
- [Tesseract.js](https://github.com/naptha/tesseract.js) — OCR
- [Puter.js](https://puter.com) — Free AI

---

<div align="center">

Built with ❤️ by [Chirag](https://github.com/chirag127)

[pdf.oriz.in](https://pdf.oriz.in)

</div>
