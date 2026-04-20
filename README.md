# 🎵 BeatFlow — Web Music Player

BeatFlow is a minimalist, web-based music player that lets users search millions of tracks via the iTunes API, listen to 30-second previews, and maintain a persistent "Recently Played" history. It is built entirely with vanilla HTML, CSS, and JavaScript — no frameworks required.

---

## 📸 Overview

The interface uses a **wheel-style control layout** centered around a play/pause button, with surrounding controls for shuffle, previous, next, and volume. The player is designed to feel clean and focused, keeping the music front and center.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 iTunes Search | Real-time search across millions of tracks and artists |
| ▶️ Audio Previews | Streams 30-second previews directly from iTunes |
| 🔀 Shuffle | Randomly picks a track from your current search results |
| ⏮⏭ Next / Previous | Navigate through your search results seamlessly |
| 🔊 Volume Control | Toggle a vertical volume slider on demand |
| 🕘 Recently Played | Sidebar history of every track you've played this session |
| 💾 Session Persistence | Current song and search list survive page refreshes via `localStorage` |
| 🌐 GitHub Pages Ready | Falls back to `localStorage` when no local server is available |

---

## 🛠️ Built With

- **HTML5** — Semantic structure and audio engine
- **CSS3** — Custom wheel UI, transitions, and responsive layout
- **JavaScript (ES6+)** — Vanilla JS for DOM manipulation, API calls, and state management
- **iTunes Search API** — Free, no-auth API providing track metadata and preview URLs
- **JSON Server** — Lightweight mock backend for local development history persistence

---

## 📁 Project Structure

```
MP4-PLAYER/
├── index.html          # Main player page
├── playlist.html       # Recently played page
├── style.css           # All styles
├── script.js           # All application logic
├── db.json             # JSON Server database (recently played)
└── image/              # UI icons (play, pause, shuffle, etc.)
```

---

## 📦 Prerequisites

Make sure you have the following installed before running the project locally:

- [Node.js](https://nodejs.org/) — required for JSON Server
- [JSON Server](https://github.com/typicode/json-server) — mock REST API for recently played history
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) — VS Code extension for serving the app locally

---

## 🔧 Local Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/DevBrigid/MP4-PLAYER.git
cd MP4-PLAYER
```

### 2. Install JSON Server

```bash
npm install -g json-server
```

### 3. Start the database server

Open a terminal in the project folder and run:

```bash
json-server --watch db.json
```

> The server will start at `http://localhost:3000`. Keep this terminal open while using the app.

### 4. Launch the app

Open `index.html` in VS Code, right-click it, and select **Open with Live Server**.

> The app will open at `http://127.0.0.1:5500` (or similar).

---

## 🚀 Deploying to GitHub Pages

BeatFlow supports deployment to GitHub Pages out of the box. Since GitHub Pages only serves static files, the JSON Server will not be available — the app automatically detects this and falls back to `localStorage` for the recently played history.

**To deploy:**

1. Push your project to a GitHub repository
2. Go to **Settings → Pages**
3. Set the source branch to `main` and the folder to `/ (root)`
4. GitHub will provide a live URL for your app

> No configuration changes are needed — the fallback is handled automatically in `script.js`.

---

## 📖 How to Use

1. **Search** — Type an artist or song name in the search bar and press Enter or click Search
2. **Play** — The first result plays automatically; the player UI updates with cover art, title, and artist
3. **Navigate** — Use the Previous and Next buttons to move through your search results
4. **Shuffle** — Click Shuffle to jump to a random track from the current results
5. **Volume** — Click the volume button to toggle the vertical slider; click anywhere outside to dismiss it
6. **History** — Every track you play is added to the Recently Played sidebar automatically

---

## ⚙️ Technical Notes

### State persistence
The app stores two keys in `localStorage`:

| Key | Purpose |
|---|---|
| `currentSong` | Restores the currently playing song after a page refresh |
| `lastSearchResult` | Restores the search results list so Next/Previous keep working after refresh |

### Recently played — dual storage strategy
When running locally with JSON Server, recently played tracks are saved to `db.json` via a `POST` request and loaded via `GET`. When JSON Server is unavailable (e.g. on GitHub Pages), the app falls back silently to a `recentSongs` key in `localStorage`. Both paths feed into the same `renderPlaylist()` function, so the UI behaves identically in both environments.

### Audio playback
The player uses the `canplay` event with `{ once: true }` to ensure audio only starts after the source has loaded. This prevents double-play issues when switching tracks quickly during shuffle or search.

### Volume toggle
The volume slider is hidden by default (`opacity: 0; pointer-events: none`) and revealed by toggling a `.show-vol` class. A `document` click listener dismisses it automatically when the user clicks anywhere outside the slider or volume button.

---

## 🔌 API Reference

**iTunes Search API**

```
GET https://itunes.apple.com/search?term={query}&entity=song&limit=20
```

No API key required. Returns up to 20 track results with metadata including `trackName`, `artistName`, `artworkUrl100`, and `previewUrl`.

---

## 🐛 Known Limitations

- iTunes previews are capped at **30 seconds** — this is an iTunes API restriction, not a bug
- Recently played history is **session-based** on GitHub Pages (clears when `localStorage` is cleared)
- `appearance: slider-vertical` for the volume slider may not render correctly in all browsers — Firefox in particular may require a `-webkit` prefix or a CSS workaround

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙋‍♀️ Author

**Brigid** — [@DevBrigid](https://github.com/DevBrigid)