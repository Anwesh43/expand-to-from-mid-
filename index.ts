const w : number = window.innerWidth 
const h : number = window.innerHeight 
const scGap : number = 0.02 
const strokeFactor : number = 90
const sizeFactor : number = 11.2 
const delay : number = 20 
const colors : Array<string> = ["#3F51B5", "#F44336", "#009688", "#2196F3", "#FF5722"]
const backColor : string = "#BDBDBD"

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