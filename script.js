//setup the canvas
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

/**make the canvas always fill the screen**/;
(function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    window.onresize = resize
})()

//for this code (as in code before this line), I almost always use the same stuff, so its going to stay here

//create the list
let list = JSON.parse(localStorage.getItem('list')) ?? []

// set the offset
let offset = 0

//add scrolling
function scroll(i) {
    offset += i
    //cap the offset
    offset = Math.max(offset, -((list.length + 1) * rowHeight - canvas.height))
    offset = Math.min(offset, 0)
}
let lastY
document.addEventListener('wheel', e => {
    const direction = e.deltaY > 0 ? -1 : 1
    scroll(canvas.height / 25 * direction)
})
document.addEventListener('touchend', e => lastY = undefined)
document.addEventListener('touchmove', e => {
    const touch = e.changedTouches[e.changedTouches.length - 1]
    if (lastY != undefined) {
        scroll(touch.pageY - lastY)
    }
    lastY = touch.pageY
})

//store the clicks
let clicks = 0

//store the mode
let removeMode = false

//update and store the list, then reload the page
function saveFromElement() {
    //set the new list, and reload
    const name = document.getElementById('textInput').value
    let included = false
    for (const item of list) if (item.name == name) { item.time = Date.now(); included = true }
    if (!included) list.push({ name, time: Date.now() })
    localStorage.setItem('list', JSON.stringify(list))
    window.location.reload()
}

//run all the click functions
document.addEventListener('click', e => {
    if (textOpen) {
        clicks++
        setTimeout(() => clicks--, 1000)
        if (clicks >= 2) saveFromElement()
    } else {

        const item = list[Math.floor((e.y - offset) / rowHeight) - 1]
        if (item != undefined) {
            if (!removeMode) item.time = Date.now()
            else {
                list.splice(Math.floor((e.y - offset) / rowHeight) - 1, 1)
                removeMode = false
            }
            localStorage.setItem('list', JSON.stringify(list))
        }
        if (e.y < rowHeight - padding + offset) {
            if (removeMode) removeMode = false
            else
                if (e.x < canvas.width / 2) {
                    textOpen = true

                    //create a text element
                    const newInput = document.createElement('input')
                    newInput.value = 'add food here'
                    newInput.type = 'text'
                    newInput.id = 'textInput'

                    //style the input to fill the screen and appear above the canvas
                    newInput.style.position = 'absolute'
                    newInput.style.top = '0'
                    newInput.style.left = '0'
                    newInput.style.width = '100%'
                    newInput.style.height = '100%'
                    newInput.style.zIndex = '999'

                    //set the theme
                    newInput.style.backgroundColor = 'black'
                    newInput.style.color = 'darkgreen'
                    newInput.style.fontSize = '24px'
                    newInput.style.textAlign = 'center'

                    //add it
                    document.body.appendChild(newInput)

                }
                else removeMode = true
        }
    }
})

//remember if the element is open
let textOpen = false

//listen for keys
document.addEventListener('keypress', e => {
    //if the text box is open and the key is enter
    if (textOpen && e.key == 'Enter') {
        saveFromElement()
    }
})

//find out how many days ago it was
function getDays(time) {
    return Math.floor((Date.now() - time) / 1000 / 60 / 60 / 24)
}

//some temp vars
let rowHeight = canvas.width / 10
let padding = rowHeight * .1

    //the render loop
    ;
(function render() {
    //clear the screen
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    //sort the list
    list.sort((a, b) => b.time - a.time)

    //create the grads
    const redGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    const greenGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    redGrad.addColorStop(0, 'rgb(100,0,0)')
    redGrad.addColorStop(.5, 'rgb(255,0,0)')
    redGrad.addColorStop(1, 'rgb(100,0,0)')
    greenGrad.addColorStop(0, 'rgb(0,100,0)')
    greenGrad.addColorStop(.5, 'rgb(0,255,0)')
    greenGrad.addColorStop(1, 'rgb(0,100,0)')


    if (removeMode) {
        //add the nevermind button
        ctx.fillStyle = redGrad
        ctx.fillRect(0, padding + offset, canvas.width, rowHeight - padding * 2)

        //and the text for it
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillText('Never Mind', canvas.width / 2, padding + offset)
    }
    else {
        //add the add button
        ctx.fillStyle = greenGrad
        ctx.fillRect(0, padding + offset, canvas.width / 2, rowHeight - padding * 2)
        ctx.fillStyle = redGrad
        ctx.fillRect(canvas.width / 2, padding + offset, canvas.width / 2, rowHeight - padding * 2)

        //and the text for them
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillText('Add food', 0, padding + offset)

        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        ctx.fillText('Remove Food', canvas.width, padding + offset)
    }

    //loop over each item in the list
    for (let index = 1; index < list.length + 1; index++) {
        const grad = ctx.createRadialGradient((index * 10 % (list.length + 1)) / (list.length + 1) * canvas.width, rowHeight * (index + .5) + offset, 0, (index * 10 % (list.length + 1)) / (list.length + 1) * canvas.width, rowHeight * (index + .5) + offset, canvas.width / 2)
        grad.addColorStop(0, 'rgb(0,0,0)')
        grad.addColorStop(1, 'rgb(0,150,0)')
        const item = list[index - 1]
        ctx.fillStyle = grad
        ctx.fillRect(0, rowHeight * index + padding + offset, canvas.width, rowHeight - padding * 2)

        //render the text
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        ctx.fillStyle = 'rgb(0,255,0)'
        ctx.fillText(`'${item.name}'`, 0, rowHeight * index + padding + offset)

        //render the last time the food was eaten
        ctx.textBaseline = 'bottom'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        let days = getDays(item.time)
        let text
        if (days == 0) text = 'eaten today'
        if (days == 1) text = 'eaten 1 day ago'
        if (days > 1) text = `eaten ${days} days ago`
        ctx.fillText(text, 0, rowHeight * index + rowHeight - padding + offset)

        //render the foods index
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.font = `${(rowHeight - padding * 2) / 2}px arial`
        ctx.fillStyle = 'rgb(0,255,0)'
        ctx.fillText(`#${(index)}`, canvas.width, rowHeight * index + padding + offset)
    }
    requestAnimationFrame(render)
})()