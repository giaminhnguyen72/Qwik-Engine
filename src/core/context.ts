import { GraphicsConfig } from "./config"

export class ContextInfo {
    ctx!:  OffscreenCanvasRenderingContext2D 
    canvas: OffscreenCanvas
    div: HTMLDivElement
    graphicsConfig: GraphicsConfig
    realCanvas: HTMLCanvasElement

    constructor(graphicsConfig: GraphicsConfig) {
        this.graphicsConfig = graphicsConfig
        this.graphicsConfig = graphicsConfig
        
        document.documentElement.style.height = '100%'
        document.documentElement.style.width = '100%'
        document.body.style.height = "100%"
        document.body.style.width = "100%"
        document.body.style.margin = "0"
        this.setup()
        this.realCanvas = this.generateCanvas() as HTMLCanvasElement
        this.realCanvas.height = 1000
        this.realCanvas.width = 2000
        this.canvas = new OffscreenCanvas(1000, 500)
        
        
        //this.ctx =this.canvas.getContext("2d") as OffscreenCanvasRenderingContext2D
        this.div = this.generateDiv(this.graphicsConfig.parent) ;
    }
        
    generateDiv(parent: string) {
        let div: HTMLDivElement = document.createElement('div')
        div.id = parent

        div.style.height = "100%" 
        div.style.width = "100%"
        div.style.zIndex = "0"
        div.style.display = "flex"
        div.style.justifyContent = "center"
        div.appendChild(this.realCanvas)
        document.body.appendChild(div)

        console.log("test")
        return div
    }
    generateCanvas(): HTMLElement {
        let canvas = document.createElement("CANVAS")
        canvas.id = this.graphicsConfig.canvasID
        console.log(this.parseStyle(this.graphicsConfig.style))
        console.log("Before")
        canvas.setAttribute('style', this.parseStyle(this.graphicsConfig.style))
        

        return canvas
    }
    getCtx() {
        let canvas = this.getCanvas()
        return canvas.getContext("2d")
    }
    getCanvas(): HTMLCanvasElement {
        let canvas = document.getElementById(this.graphicsConfig.canvasID)
        if (canvas instanceof HTMLCanvasElement) {
            return canvas
        } else {
            throw Error("engineCanvas should be a reserved id for DOM Components")
        }
        
    }
    parseStyle(styleObject: Object):  string {
        let cssArray: string[] = Object.entries(styleObject).map(([k,v]) => k + ":" + v + ";")
        console.log(this.graphicsConfig.parent)
        return cssArray.join(" ")
    }
    setup() {
        
        if (this.graphicsConfig.background) {
            let image = new Image()
            image.src = this.graphicsConfig.background
            image.style.position ="absolute"
            image.style.zIndex = "-1"
            image.style.width = "100%"
            image.style.height= "100%"

            document.body.appendChild(image)

        }
    }
}