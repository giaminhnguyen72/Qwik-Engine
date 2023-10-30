import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { PriorityQueue } from "../../../../../engine/src/structs/PriorityQueue.js";
import { Component, Renderable } from "../../components.js";

export interface RenderStrategy {
    registerStrategy(component:Renderable): void
    deregisterStrategy(component: Renderable): void
    render(renderingArr: Renderable[]): void
    clear(): void

}
export class PainterStrategy implements RenderStrategy {
    queue: PriorityQueue<Renderable> = new PriorityQueue()
    graphicsEngine: GraphicsEngine
    constructor(graphicsEngine: GraphicsEngine) {
        this.graphicsEngine = graphicsEngine
    }
    render(renderingArr: Renderable[]): void {
        let list = []
        
        for ( let i of this.graphicsEngine.components.values()) {
            if (i.rendered == false) {
                this.queue.enqueue(i, i.transform.z)
            }
            
        }
        let size = this.queue.size
        for (let i = 0 ; i < size; i++) {
            let j = 0
            let dequeued = this.queue.dequeue() as Renderable
            list.push(dequeued)


        }
        for (let i = renderingArr.length - 1; i >= 0; i--) {
            if (!renderingArr[i].alive ) {
                let item = renderingArr[i]
                renderingArr[i] = renderingArr[renderingArr.length - 1]
                renderingArr.pop()
                item.unmount()

            } else {
                let camera = renderingArr[i]

                console.log("Size is " + this.queue.size)

                camera.render(list)
            }
            
            
        }
        this.clear()
    }
    deregisterStrategy(component: Renderable): void {
        this.clear()
    }
    registerStrategy(component: Renderable): void {
        
        


    }
    clear() { 

        this.queue.clear()
        
        console.log("Cleared queue length is " + this.queue.size)
    }
    

}