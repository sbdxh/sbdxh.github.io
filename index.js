window.onload = () => {
    document.getElementById("giveup").onclick = () => {
        gameover()
    }
    document.getElementById("restart").onclick = () => {
        restart()
    }

    drag_sensitivity = 0.01
    total_deltaY = 0
    dragging_cnt = false

    cnt = document.getElementById("cnt")
    cnt.addEventListener('mousedown', () => {
        cnt.requestPointerLock()
        dragging_cnt = true
    })
    cnt.addEventListener('mousemove', event => {
        if (!dragging_cnt) {
            return
        }
        let previous_cnt = Math.round(color_cnt + total_deltaY * drag_sensitivity)
        let previous_delta = total_deltaY
        total_deltaY -= event.movementY
        new_cnt = Math.round(color_cnt + total_deltaY * drag_sensitivity)
        // 若超过范围就clamp,且不累计无用拖拽到totalDeltaY中
        if (new_cnt < 2) {
            new_cnt = 2
            total_deltaY = previous_delta
        }
        else if (new_cnt > 11) {
            new_cnt = 11
            total_deltaY = previous_delta
        }
        if (new_cnt != previous_cnt) {
            update_color_cnt(new_cnt)
        }
    })
    cnt.addEventListener('mouseup', event => {
        if (!dragging_cnt) {
            return
        }
        document.exitPointerLock()
        dragging_cnt = false
    })
    window.addEventListener("blur", event => {
        // 拖拽中被切屏
        document.exitPointerLock()
        dragging_cnt = false
    })

    update_color_cnt(color_cnt)
}

color_cnt = 6
function update_color_cnt(color_cnt) {
    cnt.innerText = "个数 " + color_cnt.toString()
    ans_colors = all_colors.slice(0, color_cnt)
    restart()
}

function restart() {
    Array.prototype.forEach.call(panel.children, c => {
        circle = c.children[0]
        circle.update_select(false)
        circle.style.pointerEvents = "auto"
    })
    answer.style.visibility = "hidden"
    step_cnt = -1
    shuffle(ans_colors)
    panel_colors = structuredClone(ans_colors)
    while (count_pairs() == ans_colors.length) {
        shuffle(panel_colors)
    }
    selects = new Array(ans_colors.length).fill(false)
    panel = document.getElementById("panel")
    answer = document.getElementById("answer")
    steps = document.getElementById("steps")
    pairs = document.getElementById("pairs")
    init_panels()
}

function count_pairs() {
    pair_cnt = 0
    for (let i = 0; i < ans_colors.length; i++) {
        if (ans_colors[i] == panel_colors[i]) {
            pair_cnt += 1
        }
    }
    return pair_cnt
}

step_cnt = -1
function update_dat() {
    step_cnt += 1
    let pair_cnt = count_pairs()
    steps.innerText = "步数 " + step_cnt.toString()
    pairs.innerText = "配对 " + pair_cnt.toString()
    if (pair_cnt == ans_colors.length) {
        gameover()
    }
}

function update_panel() {
    i = null
    j = null
    for (let k = 0; k < selects.length; k++) {
        if (selects[k]) {
            if (i == null) {
                i = k
            }
            else {
                j = k
            }
        }
    }
    if (j == null) {
        return
    }
    let temp = panel_colors[i]
    panel_colors[i] = panel_colors[j]
    panel_colors[j] = temp

    let circle_i = panel.children[i].children[0]
    let circle_j = panel.children[j].children[0]

    circle_i.update_color(panel_colors[i])
    circle_j.update_color(panel_colors[j])

    circle_i.update_select(false)
    circle_j.update_select(false)
    selects.fill(false)

    update_dat()
}

function clicked(div) {
    let i = 0
    for (i = 0; i < panel.children.length; i++) {
        if (div == panel.children[i]) {
            break
        }
    }
    selects[i] = !selects[i]
    panel.children[i].children[0].update_select(selects[i])
    update_panel()
}

all_colors = ['#00b894', '#3867d6', '#9b59b6', '#ff9ff3', '#7bed9f',
    '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#c1d3e3', '#676c66']

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

function gameover() {
    Array.prototype.forEach.call(panel.children, c => {
        circle = c.children[0]
        circle.update_select(false)
        circle.style.pointerEvents = "none"
    })
    answer.style.visibility = "visible"
}

function create_circle(parentDiv, color) {
    circle = document.createElement("div")
    circle.classList.add("circle")
    circle.update_color = function (color) {
        this.style.backgroundColor = color
    }
    circle.update_color(color)
    circle.update_select = function (selected) {
        if (selected) {
            this.classList.add("selected")
        }
        else {
            this.classList.remove("selected")
        }
    }
    circle.onclick = function () {
        clicked(this.parentNode)
    }

    circle_container = document.createElement("div")
    circle_container.classList.add("circle_container")
    circle_container.appendChild(circle)

    parentDiv.appendChild(circle_container)
}

function init_panels() {
    while (panel.firstChild) {
        panel.removeChild(panel.firstChild)
        answer.removeChild(answer.firstChild)
    }
    panel_colors.forEach(color => {
        create_circle(panel, color)
    })
    ans_colors.forEach(color => {
        create_circle(answer, color)
    })
    update_dat()
}