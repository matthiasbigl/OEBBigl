# 🚆 ÖBB Cyber Station Control Hub

A retro-futuristic web application for monitoring real-time train departures and planning journeys across Austria's rail network. Built with SvelteKit 5, powered by ÖBB HAFAS API.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://oebbigl.vercel.app/)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-FF3E00?style=flat&logo=svelte)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

### 🔴 Real-time Departures Matrix
- **Live Updates**: Auto-refresh every 60 seconds
- **Smart Filtering**: Filter by platform and transport product type
- **Comprehensive Data**: Platform info, delays, cancellations, and real-time updates
- **Collapsible Interface**: Clean, focused UI with expandable sections

### 🗺️ Journey Planning Console
- **Dual-Station Search**: Smart autocomplete for station names
- **Detailed Itineraries**: View complete journey breakdown with transfers
- **Timeline Visualization**: Cyber-themed timeline showing each leg
- **Product Filtering**: Filter routes by transport type (train, bus, etc.)
- **Pagination Support**: Navigate through multiple journey options

### 🎨 Cyber Aesthetic
- Retro-futuristic design with CRT scanline effects
- Animated grid backgrounds and morphing gradients
- Responsive layout (mobile-first, desktop-optimized)
- Accessibility-first with ARIA live regions and keyboard navigation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or 20+
- **pnpm** (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/matthiasbigl/OEBBigl.git
cd OEBBigl

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open in browser
# Navigate to http://localhost:5173
```

### Build for Production

```bash
# Create optimized production build
pnpm build

# Preview production build locally
pnpm preview
```

## 📁 Project Structure

```
OEBBigl/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── departures/  # Departure-specific components
│   │   │   ├── journeys/    # Journey planner components
│   │   │   ├── search/      # Station search components
│   │   │   ├── station/     # Station info & filters
│   │   │   └── ui/          # Reusable UI components
│   │   ├── server/          # Server-side code
│   │   │   ├── hafas.ts     # HAFAS API integration
│   │   │   └── db/          # Database schema (Drizzle ORM)
│   │   ├── stores/          # Svelte stores (state management)
│   │   └── utils/           # Utility functions & animations
│   ├── routes/              # SvelteKit routes
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +page.svelte     # Homepage
│   │   ├── departures/      # Departures page
│   │   ├── journeys/        # Journey planner page
│   │   └── api/             # API endpoints
│   └── app.css              # Global styles (Tailwind)
├── static/                  # Static assets
├── docs/                    # Documentation
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **[SvelteKit 5](https://kit.svelte.dev/)** - Full-stack meta-framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with runes
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[GSAP](https://greensock.com/gsap/)** - Animation library

### Backend & APIs
- **[HAFAS Client](https://github.com/public-transport/hafas-client)** - ÖBB rail data integration
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database ORM

### Development
- **[Vite](https://vitejs.dev/)** - Build tool & dev server
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

## 🌐 Deployment

The application is deployed on [Vercel](https://vercel.com/) with automatic deployments from the `main` branch.

**Live URL**: [https://oebbigl.vercel.app/](https://oebbigl.vercel.app/)

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/matthiasbigl/OEBBigl)

## 📊 SEO & Accessibility

This project implements comprehensive SEO and accessibility best practices:

- ✅ **Open Graph & Twitter Cards** for rich social media previews
- ✅ **JSON-LD Structured Data** (Schema.org WebApplication)
- ✅ **Dynamic Sitemap** (`/sitemap.xml`)
- ✅ **Canonical URLs** on all pages
- ✅ **ARIA Live Regions** for auto-refreshing content
- ✅ **Keyboard Navigation** support throughout
- ✅ **Mobile-first** responsive design

See [`docs/SEO_CHECKLIST.md`](./docs/SEO_CHECKLIST.md) for detailed implementation.

## 📖 Documentation

- **[SEO Checklist](./docs/SEO_CHECKLIST.md)** - SEO & accessibility implementation status
- **[Code Review](./docs/CODE_REVIEW_AND_FIXES.md)** - Detailed technical fixes applied
- **[Summary of Changes](./docs/SUMMARY_OF_CHANGES.md)** - High-level overview of improvements
- **[Trip Planner Spec](./docs/trip-planner-page-spec.md)** - Journey planner design brief

## 🎯 Key Features Implementation

### Auto-Refresh System
Departures auto-refresh every 60 seconds with visual feedback and throttling to prevent excessive API calls.

### State Management
Centralized state management using Svelte stores with dedicated actions for:
- Search state (`searchStore.ts`)
- Journey planning (`journeyStore.ts`)
- Filtering (`filterStore.ts`)
- Refresh control (`refreshStore.ts`)

### Animation System
Modular animation utilities using GSAP:
- Page animations (`pageAnimations.ts`)
- Component-specific animations (`componentAnimations.ts`)
- Timeline visualizations (`Timeline.svelte`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting (`pnpm lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **ÖBB (Österreichische Bundesbahnen)** for the HAFAS API
- **[public-transport/hafas-client](https://github.com/public-transport/hafas-client)** for the excellent HAFAS integration library
- **Svelte team** for the amazing framework and tooling

## 📧 Contact

**Matthias Bigl** - [@matthiasbigl](https://github.com/matthiasbigl)

**Project Link**: [https://github.com/matthiasbigl/OEBBigl](https://github.com/matthiasbigl/OEBBigl)

---

**Built with 💙 in Austria**
