import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { QuadTree } from "../../../../../engine/src/structs/Quadtree.js";
import { Renderable } from "../../components.js";
import { Rectangle } from "../collision/shape.js";
import { RenderStrategy } from "./RenderingStrategy.js";

export class QuadTreeStrategy implements RenderStrategy {
    quadtree: QuadTree<Renderable>
    registeredElements: Map<number, Renderable> = new Map()
    
    constructor(graphicsEngine: GraphicsEngine,size: Rectangle) {
        this.quadtree = new QuadTree(size)

    }
    registerStrategy(component: Renderable): void {
        this.registeredElements.set(component.componentId as number, component)
        
    }
    deregisterStrategy(component: Renderable): void {
        this.registeredElements.delete(component.componentId as number)
    }
    render(renderingArr: Renderable[]): void { 
        for (let i of this.registeredElements.values()) {
            this.quadtree.insert(i)
            //console.log("THis element is mapped: " + i.componentId)
        }
        for (let i of renderingArr) {
            let query = i.getRectangle()
            let items = this.quadtree.query(query)
            i.render(items)
        }

        this.quadtree.clear()
    }
    clear(): void {
        
    }
} 