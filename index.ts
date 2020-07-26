const w : number = window.innerWidth
const h : number = window.innerHeight
const bars : number = 5
const scGap : number = 0.02 / bars
const delay : number = 20
const backColor : string = "#BDBDBD"
const colors : Array<String> = ["#9C27B0", "#4CAF50", "#F44336", "#FFEB3B", "#03A9F4"]

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
