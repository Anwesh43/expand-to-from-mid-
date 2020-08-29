const w : number = window.innerWidth 
const h : number = window.innerHeight 
const lines : number = 5 
const scGap : number = 0.02 / (lines + 1) 
const strokeFactor : number = 90
const sizeFactor : number = 4.3
const delay : number = 20 
const colors : Array<string> = ["#3F51B5", "#F44336", "#009688", "#2196F3", "#FF5722"]
const backColor : string = "#BDBDBD"
const hSizeFactor : number = 7
class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawExpandToFromMid(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const gap : number = w / (lines)
        const r : number = gap / sizeFactor 
        const hSize : number = h / hSizeFactor 
        for (var j = 0; j < lines; j++) {
            const i : number = Math.abs(j + 1 - ((lines + 1) / 2))
            const sfi : number = ScaleUtil.divideScale(sf, i, (lines + 1) / 2)
            const sfi1 : number = ScaleUtil.divideScale(sfi, 0, 2)
            const sfi2 : number = ScaleUtil.divideScale(sfi, 1, 2)
            const hGap : number = hSize * (lines - i) * sfi1
            context.save()
            context.translate(gap * j + gap / 2, h)
            DrawingUtil.drawLine(context, 0, -hGap, 0, 0)
            DrawingUtil.drawCircle(context, 0, -hGap, r * sfi2)
            context.restore()
        }
    }

    static drawETFMNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = colors[i] 
        DrawingUtil.drawExpandToFromMid(context, scale)
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
        this.scale += scGap * this.dir 
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

class ETFMNode {

    next : ETFMNode 
    prev : ETFMNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new ETFMNode(this.i + 1)
            this.next.prev = this 
        }
    }
    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawETFMNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }
    
    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : ETFMNode {
        var curr : ETFMNode = new ETFMNode(this.i + 1)
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

class ExpandToFromMid {

    curr : ETFMNode = new ETFMNode(0)
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

    etfm : ExpandToFromMid = new ExpandToFromMid()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.etfm.draw(context)    
    }

    handleTap(cb : Function) {
        this.etfm.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.etfm.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}