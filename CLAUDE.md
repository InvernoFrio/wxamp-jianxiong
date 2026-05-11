# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**钴光拾遗** — a WeChat Mini Program (微信小程序) digital memorial for physicist Wu Jianxiong (吴健雄). Built with the **native WeChat Mini Program framework** (no React/Vue, no npm dependencies). Uses **WeChat Cloud Development** (腾讯云开发) as a serverless backend.

- **App ID**: `wx84ae682b385a7702`
- **Cloud Environment**: `cloud1-d1g022q9nafce6169`
- **Base Library**: 3.15.1 (min 2.2.3 for cloud, 2.25.0 for `backdrop-filter`)

## Development Workflow

There is no CLI build system, package manager, linter, or test framework. All development happens inside **WeChat DevTools** (微信开发者工具).

- **Open the project**: Point WeChat DevTools at the repo root directory
- **Compilation**: Handled automatically by DevTools (ES6→ES5 transpilation, PostCSS, WXML/WXSS minification)
- **Preview**: Use DevTools' built-in simulator or QR code preview on a real device
- **No tests exist** — this is a student competition project

### Data Processing Scripts

Node.js scripts in `scripts/` run **outside** the mini program (Node.js required) to process source text into chapter data:

```bash
node scripts/process-chapters.js
```

Chapter data in `data/chapters/*.js` is auto-generated — do not edit manually.

## Architecture

### File Pattern

Every page and component uses WeChat's standard quartet:

```
page-name/
├── page-name.js      # Logic: Page() or Component() constructor
├── page-name.json    # Config: page-specific settings, component registration
├── page-name.wxml    # Template: WeChat markup (HTML-like)
└── page-name.wxss    # Styles: subset of CSS
```

### Routing

Defined entirely in `app.json` → `pages` array (order matters — first entry is the launch page). **5 tabBar pages** (home, reader, timeline, physics/index, multimedia) and **7 sub-pages** navigated via `wx.navigateTo()`.

### Data Flow

| Data Type | Mechanism | Location |
|-----------|-----------|----------|
| Theme colors | `app.globalData` | `app.js` |
| User state (progress, highlights, notes, bookmarks, settings) | `wx.setStorageSync/getStorageSync` | `utils/storage.js` |
| Static content (chapters, timeline, quotes, map) | `require()`-d JS modules | `data/` |
| Media content (comics, gallery, video, music) | Cloud DB queries | `wx.cloud.database()` |
| Page/component local state | `Page.data` / `Component.data` | Each file |

### Cloud Database

Four collections accessed via `wx.cloud.database().collection(name)`:
- `comic` — comic/graphic story images
- `gallery` — historical photo gallery
- `video` — video archives
- `music` — background music audio files

All queried with `.orderBy('order').get()`. No cloud functions exist (despite the config declaring a `cloudfunctions/` root).

### Components

Two **globally registered** components (in `app.json`): `glass-button`, `book-cover`
Four **per-page** components: `glass-card`, `map-canvas`, `reader-view`, `timeline-item`

Components communicate via `triggerEvent` (child → parent) and `properties` (parent → child). No cross-component event bus.

### Design System

"Book metaphor" — the app is themed around opening a physical book. Key visual elements:
- **Glassmorphism**: `.glass` utility class (`backdrop-filter: blur(20rpx)`, semi-transparent backgrounds)
- **Color palette** (CSS variables in `app.wxss`): paper white `#F8F6F2`, vermilion red `#A62121`, gold `#D4A574`, slate `#54606B`
- **Typography**: "Noto Serif SC" for titles (`.serif-title`), "PingFang SC" for body
- **Canvas 2D**: Used for physics simulations (exp-parity, exp-diffusion) and the grid-walking map

### Code Conventions

- `require()` / `module.exports` (CommonJS — not ES modules)
- Internal methods prefixed with `_` (e.g., `_openSection`, `_hideTabBar`)
- Lifecycle methods: `onLoad`, `onShow`, `onReady`, `onHide`, `onUnload`
- Event handlers: `onTap`, `onScroll`, `onLongPress`
- Chinese comments and documentation throughout
- Tab size: 2 spaces
