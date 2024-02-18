import { GraphicsEngine } from "../GraphicEngine.js";
import { QuadTree } from "../../../structs/Quadtree.js";
import { Renderable } from "../../../types/components.js";
import { Rectangle } from "../../../types/components/collision/shape.js";
import { RenderStrategy } from "./RenderingStrategy.js";
import { Camera } from "../components/2d/Camera.js";
import { ContextInfo } from "../../../core/context.js";

type Graphics ={contextInfo: ContextInfo}
export class QuadTreeStrategy implements RenderStrategy {
    quadtree: QuadTree<Renderable>
    registeredElements: Map<number, Renderable> = new Map()
    graphics: Graphics
    constructor(graphicsEngine: Graphics,size: Rectangle) {
        this.quadtree = new QuadTree(size)
        this.graphics = graphicsEngine
    }
    registerStrategy(component: Renderable): void {
        this.registeredElements.set(component.componentId as number, component)
        
    }
    deregisterStrategy(component: Renderable): void {
        this.registeredElements.delete(component.componentId as number)
    }
    render(renderingArr: Camera[]): void { 
        //this.graphics.contextInfo.ctx.save()
        //this.graphics.contextInfo.ctx.setTransform(1,0,0,1,0,0)
        //this.graphics.contextInfo.ctx.clearRect(0,0, this.graphics.contextInfo.canvas.width, this.graphics.contextInfo.canvas.height)
        //this.graphics.contextInfo.ctx.restore()
        for (let i of this.registeredElements.values()) {
            console.log("Registered components")
            this.quadtree.insert(i)
            //console.log("THis element is mapped: " + i.componentId)
        }
        for (let i of renderingArr) {
            let query = i.getRectangle()
            let items = this.quadtree.query(query)
            i.renderCamera(items)
        }

        this.quadtree.clear()
    }
    clear(): void {
        
    }
} 