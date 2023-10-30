import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { QuadTree } from "../../../../../engine/src/structs/Quadtree.js";
import { Renderable } from "../../components.js";
import { Rectangle } from "../collision/shape.js";
import { RenderStrategy } from "./RenderingStrategy.js";

export class QuadTreeStrategy implements RenderStrategy {
    quadtree: QuadTree<Renderable>
    registedElements: Renderable[] = []
    constructor(graphicsEngine: GraphicsEngine,size: Rectangle) {
        this.quadtree = new QuadTree(size)
    }
    registerStrategy(component: Renderable): void {
        this.quadtree.insert(component)
        
    }
    deregisterStrategy(component: Renderable): void {
        this.quadtree.remove(component)
    }
    render(renderingArr: Renderable[]): void {
        
        for (let i of renderingArr) {
            let query = i.getRectangle()
            let items = this.quadtree.query(query)
            i.render(items)
        }
    }
    clear(): void {
        
    }
}