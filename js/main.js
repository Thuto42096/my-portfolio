const userIcon = document.getElementById('user-icon');
const projectsIcon = document.getElementById('projects-icon');
const trashIcon = document.getElementById('trash-icon');
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

// ── Start Menu ──

startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('open');
    startButton.classList.toggle('active');
});

// Menu item clicks open the corresponding window
document.querySelectorAll('.start-menu-item[data-url]').forEach(item => {
    item.addEventListener('click', () => {
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