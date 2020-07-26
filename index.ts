const w : number = window.innerWidth
const h : number = window.innerHeight
const bars : number = 5
const scGap : number = 0.02 / bars
const delay : number = 20
const backColor : string = "#BDBDBD"
const colors : Array<string> = ["#9C27B0", "#4CAF50", "#F44336", "#FFEB3B", "#03A9F4"]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.divideScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {
    static drawColoredBar(context : CanvasRenderingContext2D, i : number, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sfi : number = ScaleUtil.divideScale(sf, i, bars)
        const sj : number = i % 2
        const gap : number = w / bars
        const y : number = h * (1 - sfi) * sj
        context.save()
        context.translate(gap * i, 0)
        context.fillRect(0, y, gap, h * sfi)
        context.restore()
    }

    static drawMCBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        for (var j = 0; j < bars; j++) {
            DrawingUtil.drawColoredBar(context, j, scale)
        }
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}


class MCBNode {

    prev : MCBNode
    next : MCBNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new MCBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawMCBNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : MCBNode {
        var curr : MCBNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class MultiColoredBar {

    curr : MCBNode = new MCBNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    mcb : MultiColoredBar = new MultiColoredBar()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.mcb.draw(context)
    }

    handleTap(cb : Function) {
        this.mcb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.mcb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
