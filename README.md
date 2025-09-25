# Section Styler MVP

A web app where users upload HTML/CSS/JS sections, preview them live in a sandboxed iframe, auto-extract editable CSS properties (colors, spacing, typography) using PostCSS, tweak them via a dynamic control panel, and export the modified section (separate files, single file, or ZIP). Basic versioning for token snapshots is included.

## Tech Stack

- Frontend: React + Vite (TypeScript)
- CSS Parsing: PostCSS (client-side)
- Preview: sandboxed iframe + postMessage
- Backend: Node.js (Express) for uploads, exports, and version storage
- Export: jszip (server-side ZIP packaging)

## Monorepo Structure

- `client/` - Vite React app (UI, parsing, live preview)
- `server/` - Express API (uploads, exports, versions)

## Getting Started

1. Install dependencies (root helper script):

   ```bash
   npm run install:all
   ```

   Or install per project:

   ```bash
   cd client && npm i
   cd ../server && npm i
   ```

2. Run the app (concurrently):

   ```bash
   npm run dev
   ```

   - Client dev server: http://localhost:5173
   - API server: http://localhost:3001

3. Usage Flow

- Use `FileUpload` to upload/paste your section's HTML/CSS/JS.
- Click `Parse CSS` to auto-extract tokens (colors, spacing, typography).
- Adjust values in the `ControlPanel`; changes apply live in the iframe preview via postMessage.
- Use `ExportManager` to download:
  - Separate files (client saves individually)
  - Single-file HTML (server combines)
  - ZIP with `manifest.json` (server packages using jszip)
- Save/load token snapshots in `VersionHistory`.

## Notes & Limitations (MVP)

- CSS tokenization focuses on common properties:
  - Colors: `color`, `background-color`, `border-color`, `outline-color`, `fill`, `stroke`
  - Spacing: `margin`, `padding`, `gap`, `row-gap`, `column-gap`, `border-radius` (single values only)
  - Typography: `font-size`, `font-family`
- If a declaration already uses a CSS variable, it is surfaced as a token when we find its definition under `:root`.
- For complex shorthands (e.g., `margin: 10px 20px`), MVP skips auto-tokenization.
- The iframe is sandboxed with `allow-scripts`. Use at your discretion when loading third-party JS.

## Scripts

Root helper scripts:

- `npm run install:all` - Install client + server deps
- `npm run dev` - Run client and server concurrently

Client (in `client/`):

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

Server (in `server/`):

- `npm run dev` - Start API in watch mode (nodemon)
- `npm start` - Start API

## License

MIT
