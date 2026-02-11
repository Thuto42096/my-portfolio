# 💾 Thuto R — Windows 98 Portfolio

A retro **Windows 98-themed** personal portfolio built with vanilla HTML, CSS, and JavaScript.
Everything runs in the browser — no frameworks, no build step.

> **Live:** [https://thuto-r.vercel.app](https://thuto-r.vercel.app)

![Windows 98 Portfolio Screenshot](assets/photo.jpg)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Boot Screen** | Animated Windows 98 startup with progress bar |
| **Desktop Icons** | Clickable shortcuts that open draggable, resizable windows |
| **Start Menu** | Classic Start menu with submenus and a shut-down sequence |
| **User Properties** | Tabbed dialog with bio, experience, education, skills & projects |
| **My Projects** | Explorer-style folder view — double-click to open project details |
| **Recycle Bin** | Older / hackathon projects stored as "deleted" files |
| **My Documents** | Photo viewer and video player |
| **Notepad** | Editable notepad with an intro message |
| **Internet Explorer** | Links page with GitHub, LinkedIn, email & quick links |
| **MS-DOS Prompt** | Interactive terminal — type `help` for commands |
| **Resume** | Word-document-style CV with a print button |
| **Games** | Minesweeper and a playable DOOM embed |
| **Shutdown** | Authentic "It's now safe to turn off your computer" screen |

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — Semantic markup & styling
- **[98.css](https://jdan.github.io/98.css/)** — Faithful Windows 98 UI components
- **Vanilla JavaScript** — All interactivity, no framework
- **[interact.js](https://interactjs.io/)** — Drag & resize for windows

---

## 📁 Project Structure

```
my-portfolio/
├── index.html              # Main desktop page
├── style.css               # All styles (imports 98.css)
├── js/
│   └── main.js             # Boot sequence, windows, menus, games
├── assets/
│   ├── photo.jpg           # Profile photo
│   ├── video.mp4           # Intro video
│   └── doom.png            # DOOM icon
├── doom/
│   └── doom.html           # Embedded DOOM game
├── user.html               # User Properties (tabbed dialog)
├── projects.html           # My Projects (explorer view)
├── trash.html              # Recycle Bin (older projects)
├── my-documents.html       # Photo & video viewer
├── notepad.html            # Notepad
├── internet-explorer.html  # Links & socials
├── msdos.html              # MS-DOS Prompt
├── resume.html             # Resume / CV
├── minesweeper.html        # Minesweeper game
└── doom-game.html          # DOOM wrapper
```

---

## 🚀 Getting Started

No build tools required — just open in a browser.

```bash
# Clone the repository
git clone https://github.com/Thuto42096/my-portfolio.git
cd my-portfolio

# Open in your browser
# Option 1: double-click index.html
# Option 2: use a local server (recommended for fetch to work)
npx serve .
```

> **Note:** A local server is recommended because the portfolio uses `fetch()` to load window content. Opening `index.html` directly via `file://` may block these requests in some browsers.

---

## 📬 Contact

- **Email:** [thuto42096@gmail.com](mailto:thuto42096@gmail.com)
- **GitHub:** [github.com/Thuto42096](https://github.com/Thuto42096)
- **LinkedIn:** [linkedin.com/in/thuto-ratlhahane0101](https://www.linkedin.com/in/thuto-ratlhahane0101/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

