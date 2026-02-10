const userIcon = document.getElementById('user-icon');
const projectsIcon = document.getElementById('projects-icon');
const trashIcon = document.getElementById('trash-icon');
const mydocsIcon = document.getElementById('mydocs-icon');
const notepadIcon = document.getElementById('notepad-icon');
const ieIcon = document.getElementById('ie-icon');
const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

// ── Boot Sequence ──

const bootScreen = document.getElementById('boot-screen');
const bootProgressBar = document.getElementById('boot-progress-bar');

(function runBootSequence() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Hold at 100% briefly, then fade out
            setTimeout(() => {
                bootScreen.classList.add('fade-out');
                // Remove from DOM after fade
                setTimeout(() => {
                    bootScreen.remove();
                }, 800);
            }, 400);
        }
        bootProgressBar.style.width = progress + '%';
    }, 300);
})();

// ── Taskbar Clock ──

const clockEl = document.getElementById('clock-time');

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const mins = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clockEl.textContent = hours + ':' + mins + ' ' + ampm;
}

updateClock();
setInterval(updateClock, 1000);

function openWindow(url) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';

    const titleBarText = document.createElement('div');
    titleBarText.className = 'title-bar-text';

    const titleBarControls = document.createElement('div');
    titleBarControls.className = 'title-bar-controls';

    const minimizeButton = document.createElement('button');
    minimizeButton.setAttribute('aria-label', 'Minimize');

    const maximizeButton = document.createElement('button');
    maximizeButton.setAttribute('aria-label', 'Maximize');

    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => {
        windowDiv.remove();
    });

    titleBarControls.appendChild(minimizeButton);
    titleBarControls.appendChild(maximizeButton);
    titleBarControls.appendChild(closeButton);

    titleBar.appendChild(titleBarText);
    titleBar.appendChild(titleBarControls);

    const windowBody = document.createElement('div');
    windowBody.className = 'window-body';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const title = doc.querySelector('title').innerText;
            const sourceBody = doc.querySelector('.window-body');
            const body = sourceBody.innerHTML;

            titleBarText.innerText = title;
            windowBody.innerHTML = body;

            // Copy inline style from source (e.g. padding:0)
            if (sourceBody.getAttribute('style')) {
                windowBody.setAttribute('style', sourceBody.getAttribute('style'));
            }

            // If this page has tabs, wire up tab switching
            initTabs(windowBody);

            // Resize the window to fit the properties dialog
            if (windowBody.querySelector('.tabs-container')) {
                windowDiv.style.width = '480px';
                windowDiv.style.height = '460px';
            }

            // If this page has project folders, wire up double-click to open detail windows
            initProjectFolders(windowBody);

            // If this page has trash files, wire up double-click to open detail windows
            initTrashFiles(windowBody);

            // If this page has a DOS terminal, wire up command input
            initDosTerminal(windowBody);

            // If this page has document files, wire up double-click to open viewers
            initDocFiles(windowBody);

            // If this page has a minesweeper board, initialize the game
            initMinesweeper(windowBody);
        });

    windowDiv.appendChild(titleBar);
    windowDiv.appendChild(windowBody);

    const x = Math.random() * (window.innerWidth - 480);
    const y = Math.random() * (window.innerHeight - 460);

    windowDiv.style.left = x + 'px';
    windowDiv.style.top = y + 'px';

    document.body.appendChild(windowDiv);

    interact(windowDiv)
        .draggable({
            // enable inertial throwing
            inertia: true,
            // keep the element within the area of it's parent
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            // enable autoScroll
            autoScroll: true,

            listeners: {
                // call this function on every dragmove event
                move: dragMoveListener,
            }
        })
        .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: true, top: true },

            listeners: {
                move (event) {
                    let x = (parseFloat(event.target.getAttribute('data-x')) || 0)
                    let y = (parseFloat(event.target.getAttribute('data-y')) || 0)

                    // update the element's style
                    event.target.style.width = event.rect.width + 'px'
                    event.target.style.height = event.rect.height + 'px'

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    event.target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

                    event.target.setAttribute('data-x', x)
                    event.target.setAttribute('data-y', y)
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 50 }
                })
            ],

            inertia: true
        });
}

function initTabs(container) {
    const tabs = container.querySelectorAll('.tab');
    const tabContents = container.querySelectorAll('.tab-content');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            container.querySelector('#' + tabId).classList.add('active');
        });
    });
}

function initProjectFolders(container) {
    const folders = container.querySelectorAll('.folder-icon');
    if (!folders.length) return;

    folders.forEach(folder => {
        folder.addEventListener('dblclick', () => {
            const projectId = folder.getAttribute('data-project');
            const detail = container.querySelector('#' + projectId);
            if (!detail) return;

            const projectName = folder.querySelector('span').textContent;
            openProjectDetail(projectName, detail.innerHTML);
        });
    });
}

function initTrashFiles(container) {
    const files = container.querySelectorAll('[data-trash]');
    if (!files.length) return;

    files.forEach(file => {
        file.addEventListener('dblclick', () => {
            const trashId = file.getAttribute('data-trash');
            const detail = container.querySelector('#' + trashId);
            if (!detail) return;

            const fileName = file.querySelector('span').textContent;
            openProjectDetail(fileName, detail.innerHTML);
        });
    });
}

function initDocFiles(container) {
    const files = container.querySelectorAll('[data-doc]');
    if (!files.length) return;

    files.forEach(file => {
        file.addEventListener('dblclick', () => {
            const docId = file.getAttribute('data-doc');
            const detail = container.querySelector('#' + docId);
            if (!detail) return;

            const fileName = file.querySelector('span').textContent;
            openProjectDetail(fileName, detail.innerHTML);
        });
    });
}

function initMinesweeper(container) {
    const board = container.querySelector('#mine-board');
    if (!board) return;

    const ROWS = 9, COLS = 9, MINES = 10;
    let cells = [], mineSet = new Set(), revealed = 0, gameOver = false, firstClick = true;
    let timerInterval = null, seconds = 0;
    const faceBtn = container.querySelector('#mine-face');
    const mineCounter = container.querySelector('#mine-count');
    const timerDisplay = container.querySelector('#mine-timer');
    let flagCount = 0;

    function pad3(n) { return String(n).padStart(3, '0'); }

    function placeMines(excludeR, excludeC) {
        mineSet.clear();
        while (mineSet.size < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (r === excludeR && c === excludeC) continue;
            mineSet.add(r * COLS + c);
        }
    }

    function countAdj(r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && mineSet.has(nr * COLS + nc)) count++;
            }
        }
        return count;
    }

    function reveal(r, c) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const cell = cells[r][c];
        if (cell.revealed || cell.flagged) return;
        cell.revealed = true;
        cell.el.classList.add('revealed');
        revealed++;
        const adj = countAdj(r, c);
        if (mineSet.has(r * COLS + c)) {
            cell.el.textContent = '💣';
            cell.el.classList.add('mine-hit');
            return;
        }
        if (adj > 0) {
            cell.el.textContent = adj;
            cell.el.setAttribute('data-num', adj);
        } else {
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++)
                    if (dr !== 0 || dc !== 0) reveal(r + dr, c + dc);
        }
    }

    function endGame(won) {
        gameOver = true;
        clearInterval(timerInterval);
        faceBtn.textContent = won ? '😎' : '😵';
        if (!won) {
            mineSet.forEach(idx => {
                const r = Math.floor(idx / COLS), c = idx % COLS;
                if (!cells[r][c].revealed) {
                    cells[r][c].el.textContent = '💣';
                    cells[r][c].el.classList.add('revealed');
                }
            });
        }
    }

    function buildBoard() {
        board.innerHTML = '';
        cells = [];
        revealed = 0; gameOver = false; firstClick = true; flagCount = 0;
        clearInterval(timerInterval); seconds = 0;
        timerDisplay.textContent = '000';
        mineCounter.textContent = pad3(MINES);
        faceBtn.textContent = '🙂';

        for (let r = 0; r < ROWS; r++) {
            cells[r] = [];
            for (let c = 0; c < COLS; c++) {
                const el = document.createElement('div');
                el.className = 'mine-cell';
                const cellObj = { el, revealed: false, flagged: false };
                cells[r][c] = cellObj;

                el.addEventListener('click', () => {
                    if (gameOver || cellObj.flagged) return;
                    if (firstClick) {
                        firstClick = false;
                        placeMines(r, c);
                        timerInterval = setInterval(() => {
                            seconds++;
                            timerDisplay.textContent = pad3(Math.min(seconds, 999));
                        }, 1000);
                    }
                    if (mineSet.has(r * COLS + c)) {
                        reveal(r, c);
                        endGame(false);
                    } else {
                        reveal(r, c);
                        if (revealed === ROWS * COLS - MINES) endGame(true);
                    }
                });

                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (gameOver || cellObj.revealed) return;
                    cellObj.flagged = !cellObj.flagged;
                    el.textContent = cellObj.flagged ? '🚩' : '';
                    flagCount += cellObj.flagged ? 1 : -1;
                    mineCounter.textContent = pad3(MINES - flagCount);
                });

                board.appendChild(el);
            }
        }
    }

    faceBtn.addEventListener('click', buildBoard);
    buildBoard();
}

function initDosTerminal(container) {
    const input = container.querySelector('.dos-input');
    const output = container.querySelector('.dos-output');
    if (!input || !output) return;

    const commands = {
        help: 'Available commands:\n  HELP      - Show this help message\n  ABOUT     - About me\n  SKILLS    - My technical skills\n  PROJECTS  - My projects\n  CONTACT   - How to reach me\n  EDUCATION - My education\n  CLS       - Clear screen\n  DIR       - List directory\n  VER       - Show version',
        about: 'Thuto Ratlhahane\n─────────────────────\nFull Stack Developer | Blockchain Enthusiast\n\nSoftware Engineer transitioning into Full Stack\nWeb Development with a strong foundation in OOP\nand backend systems. Expanding into containerization,\nCI/CD pipelines, and blockchain development.\n\nPassionate about building secure, scalable, and\nproduction-ready applications.',
        skills: 'Technical Skills:\n─────────────────────\n• Languages: Python, Java, JavaScript, SQL\n• Frontend: React, React Native, HTML5/CSS3\n• Backend: SQLite3, JDBC, RESTful APIs, ORM\n• DevOps: Docker, GitLab CI, Git, CI/CD\n• Focus: Blockchain, Smart Contracts, Backend Engineering',
        projects: 'My Projects:\n─────────────────────\n📁 Windows 98 Portfolio (This site!)\n📁 Blockchain & Smart Contracts (In Progress)\n📁 Backend & API Systems\n\nDouble-click the My Projects folder\non the desktop for more details.',
        contact: 'Contact Info:\n─────────────────────\n📧 Email: thuto42096@gmail.com\n🔗 GitHub: github.com/Thuto42096\n🔗 LinkedIn: linkedin.com/in/thuto-ratlhahane0101\n📍 Location: Johannesburg, South Africa',
        education: 'Education & Learning:\n─────────────────────\n📚 Software Engineering (Self-Taught & Continuous)\n   • OOP (Python, Java)\n   • Full Stack Web Dev (React, React Native)\n   • DevOps (Docker, GitLab CI)\n\n📈 Currently Learning:\n   • Advanced blockchain development\n   • Smart contract security\n   • Scalable backend architectures',
        cls: '__CLEAR__',
        dir: ' Volume in drive C has no label.\n Volume Serial Number is 1337-CAFE\n\n Directory of C:\\PORTFOLIO\n\n.              <DIR>     02-10-2026  12:00a\n..             <DIR>     02-10-2026  12:00a\nABOUT    TXT         512  02-10-2026  12:00a\nSKILLS   TXT         256  02-10-2026  12:00a\nPROJECTS DIR       4,096  02-10-2026  12:00a\nCONTACT  TXT         128  02-10-2026  12:00a\n        4 file(s)        4,992 bytes\n        2 dir(s)   640,000,000 bytes free',
        ver: '\nWindows 98 [Version 4.10.1998]\nPortfolio Edition'
    };

    input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const cmd = input.value.trim().toLowerCase();
        input.value = '';

        // Echo the command
        const echoLine = document.createElement('div');
        echoLine.textContent = 'C:\\PORTFOLIO>' + cmd;
        output.appendChild(echoLine);

        if (cmd === '') return;

        const response = commands[cmd];
        const responseLine = document.createElement('div');

        if (response === '__CLEAR__') {
            output.innerHTML = '';
        } else if (response) {
            responseLine.textContent = response;
            output.appendChild(responseLine);
        } else {
            responseLine.textContent = "Bad command or file name: '" + cmd + "'\nType 'help' for available commands.";
            output.appendChild(responseLine);
        }

        const blankLine = document.createElement('div');
        blankLine.innerHTML = '&nbsp;';
        output.appendChild(blankLine);

        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    });

    // Focus input when clicking anywhere in the terminal
    container.querySelector('.dos-terminal').addEventListener('click', () => {
        input.focus();
    });
}

function openProjectDetail(name, contentHTML) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.style.width = '350px';
    windowDiv.style.height = '320px';

    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';

    const titleBarText = document.createElement('div');
    titleBarText.className = 'title-bar-text';
    titleBarText.innerText = name;

    const titleBarControls = document.createElement('div');
    titleBarControls.className = 'title-bar-controls';

    const minimizeButton = document.createElement('button');
    minimizeButton.setAttribute('aria-label', 'Minimize');

    const maximizeButton = document.createElement('button');
    maximizeButton.setAttribute('aria-label', 'Maximize');

    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => {
        windowDiv.remove();
    });

    titleBarControls.appendChild(minimizeButton);
    titleBarControls.appendChild(maximizeButton);
    titleBarControls.appendChild(closeButton);

    titleBar.appendChild(titleBarText);
    titleBar.appendChild(titleBarControls);

    const windowBody = document.createElement('div');
    windowBody.className = 'window-body';
    windowBody.innerHTML = contentHTML;

    windowDiv.appendChild(titleBar);
    windowDiv.appendChild(windowBody);

    const x = Math.random() * (window.innerWidth - 350);
    const y = Math.random() * (window.innerHeight - 320);
    windowDiv.style.left = x + 'px';
    windowDiv.style.top = y + 'px';

    document.body.appendChild(windowDiv);

    interact(windowDiv)
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: dragMoveListener,
            }
        })
        .resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move (event) {
                    let x = (parseFloat(event.target.getAttribute('data-x')) || 0)
                    let y = (parseFloat(event.target.getAttribute('data-y')) || 0)
                    event.target.style.width = event.rect.width + 'px'
                    event.target.style.height = event.rect.height + 'px'
                    x += event.deltaRect.left
                    y += event.deltaRect.top
                    event.target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
                    event.target.setAttribute('data-x', x)
                    event.target.setAttribute('data-y', y)
                }
            },
            modifiers: [
                interact.modifiers.restrictEdges({ outer: 'parent' }),
                interact.modifiers.restrictSize({ min: { width: 100, height: 50 } })
            ],
            inertia: true
        });
}

function dragMoveListener (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}

userIcon.addEventListener('click', () => {
    openWindow('user.html');
});

projectsIcon.addEventListener('click', () => {
    openWindow('projects.html');
});

trashIcon.addEventListener('click', () => {
    openWindow('trash.html');
});

notepadIcon.addEventListener('click', () => {
    openWindow('notepad.html');
});

ieIcon.addEventListener('click', () => {
    openWindow('internet-explorer.html');
});

mydocsIcon.addEventListener('click', () => {
    openWindow('my-documents.html');
});

document.getElementById('taskbar-name').addEventListener('click', () => {
    openWindow('user.html');
});

// ── Start Menu ──

startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('open');
    startButton.classList.toggle('active');
});

// Menu item clicks open the corresponding window
document.querySelectorAll('.start-menu-item[data-url]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = item.getAttribute('data-url');
        openWindow(url);
        startMenu.classList.remove('open');
        startButton.classList.remove('active');
    });
});

// Close menu when clicking anywhere else
document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
        startMenu.classList.remove('open');
        startButton.classList.remove('active');
    }
});

// ── Shut Down ──

const shutdownScreen = document.getElementById('shutdown-screen');
const shutdownButton = document.getElementById('start-menu-shutdown');

shutdownButton.addEventListener('click', () => {
    startMenu.classList.remove('open');
    startButton.classList.remove('active');

    // Remove all open windows
    document.querySelectorAll('.window').forEach(w => w.remove());

    // Fade to black then show shutdown message
    document.body.style.transition = 'opacity 0.5s';
    document.body.style.opacity = '0';

    setTimeout(() => {
        shutdownScreen.classList.add('active');
        document.body.style.opacity = '1';
    }, 600);
});

shutdownScreen.addEventListener('click', () => {
    location.reload();
});