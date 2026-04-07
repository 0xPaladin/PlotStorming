# Frontier

A client-side web application for creative writing and AI-assisted content management, called "Frontier" (also referred to as PlotStorming internally).

## Architecture

- **Pure static frontend** — no build step, no bundler, no npm packages
- **ES Modules** loaded directly via CDN (Preact/HTM, marked.js) and local files
- **Node.js static file server** (`server.js`) serves files on port 5000
- **Local storage / localforage** for client-side data persistence (IndexedDB)
- **OpenRouter API** for AI model access (user-provided API key)

## Project Structure

```
/
├── index.html          # Main HTML entry point
├── app.js              # Main Preact component (App class)
├── server.js           # Simple Node.js HTTP static file server
├── src/
│   ├── contentManager.js  # Content data management (CRUD, localforage DB)
│   ├── userManager.js     # User settings, AI API calls, OpenRouter integration
│   └── main.css           # Application styles
└── lib/
    ├── iziToast.min.js    # Toast notification library
    ├── iziToast.min.css
    └── localforage.min.js # IndexedDB wrapper
```

## Running

The app is served by a simple Node.js HTTP server:

```bash
node server.js
```

Runs on port 5000 at `0.0.0.0`.

## Key Design Patterns

- `window.app` — global reference to the main App component instance
- `App.ContentManager` — static reference to the ContentManager instance
- `App.UserManager` — static reference to the UserManager instance
- `app.html` — HTM tagged template literal function, shared with modules
- Data stored in localforage (IndexedDB) under "PlotStorming" database

## Deployment

Configured as autoscale deployment running `node server.js`.
