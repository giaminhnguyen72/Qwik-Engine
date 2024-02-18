import { GraphicsEngine } from "../GraphicEngine.js";
import { QuadTree } from "../../../structs/Quadtree.js";
import { Renderable } from "../../../types/components.js";
import { Rectangle } from "../../../types/components/collision/shape.js";
import { RenderStrategy } from "./RenderingStrategy.js";
import { Camera } from "../components/2d/Camera.js";
import { ContextInfo } from "../../../core/context.js";

type Graphics ={contextInfo: ContextInfo}
export class Rendering3d implements RenderStrategy {

    registeredElements: Map<number, Renderable> = new Map()
    graphics: Graphics
    constructor(graphicsEngine: Graphics) {
        
        this.graphics = graphicsEngine
    }
    registerStrategy(component: Renderable): void {
        this.registeredElements.set(component.componentId as number, component)
        
    }
    deregisterStrategy(component: Renderable): void {
        this.registeredElements.delete(component.componentId as number)
        component.unmount()
    }
    render(renderingArr: Camera[]): void { 
        for (let i of renderingArr) {
            i.renderCamera([])
        }
    }
    clear(): void {
        
    }
} 