const w : number = window.innerWidth 
const h : number = window.innerHeight 
const lines : number = 5 
const scGap : number = 0.02 / ((lines + 1) / 2) 
const strokeFactor : number = 90
const sizeFactor : number = 11.2 
const delay : number = 20 
const colors : Array<string> = ["#3F51B5", "#F44336", "#009688", "#2196F3", "#FF5722"]
const backColor : string = "#BDBDBD"
const hSizeFactor : number = 7
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
        const gap : number = w / (lines + 2)
        const r : number = gap / sizeFactor 
        const hSize : number = h / hSizeFactor 
        for (var j = 0; j < lines; j++) {
            const i : number = Math.abs(j - (lines / 2))
            const sfi : number = ScaleUtil.divideScale(sf, i, (lines + 1) / 2)
            const sfi1 : number = ScaleUtil.divideScale(sfi, 0, 2)
            const sfi2 : number = ScaleUtil.divideScale(sfi, 1, 2)
            const hGap : number = hSize * ((lines / 2) - i) * sfi1
            context.save()
            context.translate(gap * i + gap / 2, h)
            DrawingUtil.drawLine(context, 0, -hGap, 0, 0)
            DrawingUtil.drawCircle(context, 0, 0, r * sfi2)
            context.restore()
        }
    }

    static drawETFMNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = backColor 
        DrawingUtil.drawExpandToFromMid(context, scale)
    }
}