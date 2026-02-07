const userIcon = document.getElementById('user-icon');
const projectsIcon = document.getElementById('projects-icon');
const trashIcon = document.getElementById('trash-icon');

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
            const body = doc.querySelector('.window-body').innerHTML;

            titleBarText.innerText = title;
            windowBody.innerHTML = body;
        });

    windowDiv.appendChild(titleBar);
    windowDiv.appendChild(windowBody);

    const x = Math.random() * (window.innerWidth - 400);
    const y = Math.random() * (window.innerHeight - 300);

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