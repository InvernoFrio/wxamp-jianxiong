# AGENTS.md

This file guides coding agents working in this repository.

## Project Overview

`钴光拾遗` is a native WeChat Mini Program digital memorial for physicist Wu Jianxiong. It uses the standard WeChat page/component file model, WeChat Cloud Development, and mostly CommonJS modules.

- App ID: `wx84ae682b385a7702`
- Cloud environment: `cloud1-d1g022q9nafce6169`
- Mini Program base library: `3.15.1`
- Project type: `miniprogram`
- Primary language for comments and copy: Chinese

## Working With The Project

Open the repository root in WeChat DevTools. Compilation, preview, ES6 conversion, PostCSS, and WXML/WXSS minification are handled by DevTools according to `project.config.json`.

There is no general CLI build, lint, or test command in the root project. The root `package.json` currently only declares `@rojer/katex-mini`; `project.config.json` has `nodeModules` disabled, so confirm DevTools npm settings before relying on packaged npm modules in the Mini Program.

Cloud function dependencies are managed separately under `cloudfunctions/chatWithWu/`.

Useful commands:

```bash
node scripts/process-chapters.js
node scripts/reprocess-chapters.js
node scripts/generate-chapter-js.js
node scripts/clean-chapter-data.js
```

Run these scripts only when regenerating chapter data from source text. Treat generated chapter modules as derived files.

## Repository Layout

- `app.js`, `app.json`, `app.wxss`: Mini Program entry, routing, global components, and global styles.
- `pages/`: Page implementations. Each page should keep the WeChat quartet: `.js`, `.json`, `.wxml`, `.wxss`.
- `components/`: Reusable Mini Program components, also using the standard quartet.
- `data/`: Static app data, including timeline, quotes, map data, and generated chapter data.
- `data/chapters/`: Generated chapter JSON/JS modules. Prefer changing source text and scripts over manual edits here.
- `utils/`: Shared utilities such as storage wrappers and WXS filters.
- `cloudfunctions/chatWithWu/`: Tencent Cloud function for AI chat, using `wx-server-sdk`, `axios`, and the `DEEPSEEK_API_KEY` environment variable.
- `scripts/`: Node.js maintenance and data-processing scripts that run outside the Mini Program runtime.
- `assets/`: Icons, textures, and other static visual assets.
- `versions/`: Archived planning/version documents.

## Architecture Notes

Routing is defined in `app.json`. The first page is the launch page. The tab bar contains:

- `pages/home/home`
- `pages/reader/reader`
- `pages/timeline/timeline`
- `pages/physics/index`
- `pages/multimedia/multimedia`

Other pages are reached with `wx.navigateTo()`.

Global components registered in `app.json`:

- `glass-button`
- `book-cover`

Common local components include:

- `glass-card`
- `map-canvas`
- `reader-view`
- `timeline-item`

State and data flow:

- Theme constants live in `app.globalData.theme`.
- Reading progress, settings, notes, highlights, and bookmarks use `wx.setStorageSync` / `wx.getStorageSync` through `utils/storage.js`.
- Static content is imported with `require()` from `data/`.
- Media collections are read from the cloud database with `wx.cloud.database().collection(name)`.
- Page and component state belongs in `Page.data` or `Component.data`.

## Code Style

- Use CommonJS: `require()` and `module.exports`.
- Use 2-space indentation, matching `project.config.json`.
- Follow native WeChat Mini Program APIs and patterns; do not introduce React, Vue, or a bundler.
- Keep page/component files colocated and named consistently with their directory.
- Prefix private helper methods with `_` when that matches nearby code.
- Use standard Mini Program lifecycle names such as `onLoad`, `onShow`, `onReady`, `onHide`, and `onUnload`.
- Use event handler names like `onTap`, `onScroll`, and `onLongPress`.
- Keep user-facing text and comments in Chinese unless an existing file clearly uses English.
- Avoid broad refactors while making feature or bug-fix changes.

## Styling Guidelines

The app uses a book-inspired visual system with paper tones, vermilion accents, gold, slate, serif titles, and glassmorphism.

- Prefer existing classes and variables in `app.wxss`.
- Preserve the reading/book metaphor and calm memorial tone.
- WXSS uses rpx-based sizing; check mobile layouts in DevTools.
- Canvas-based interactions are used in physics pages and the grid-walking map.
- When adding controls, keep them usable on real mobile devices and avoid dense desktop-only layouts.

## Cloud Development

The Mini Program initializes cloud in `app.js` with:

```js
wx.cloud.init({
  env: 'cloud1-d1g022q9nafce6169',
  traceUser: true,
});
```

Known cloud database collections used by the app include:

- `comic`
- `gallery`
- `video`
- `music`

The AI chat cloud function calls DeepSeek through `cloudfunctions/chatWithWu/index.js`. Do not hardcode secrets. Configure `DEEPSEEK_API_KEY` in the cloud function environment.

Before changing cloud behavior, verify both the Mini Program caller and the cloud function contract.

## Generated Data And Large Content

Large source content such as `吴健雄传.txt` feeds the chapter-processing scripts. Generated files in `data/chapters/` should stay consistent with the scripts.

When touching generated data:

1. Update the source text or script.
2. Regenerate the data.
3. Review the generated diff for accidental encoding, ordering, or truncation issues.

## Verification

Because this project has no test framework, verify changes with the most relevant available method:

- Open in WeChat DevTools and compile.
- Check affected pages in the simulator.
- Preview on a real device for touch, canvas, and audio/video behavior.
- For data-processing script changes, run the relevant `node scripts/...` command and inspect the generated files.
- For cloud function changes, install dependencies inside the cloud function directory if needed, then test through DevTools/cloud invocation.

## Git And Safety

- Do not revert user changes unless explicitly asked.
- Check `git status --short` before and after meaningful edits.
- Keep generated, asset, and source-text changes intentional and easy to explain.
- `project.private.config.json` is local DevTools state; avoid editing it unless the task specifically requires local configuration changes.
- Treat `map.jpg` and other large binary assets carefully; do not replace or recompress them without a clear request.
