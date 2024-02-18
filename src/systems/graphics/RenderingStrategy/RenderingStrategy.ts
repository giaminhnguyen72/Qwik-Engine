import { GraphicsEngine } from "../GraphicEngine.js";
import { PriorityQueue } from "../../../structs/PriorityQueue.js";
import { Component, Renderable } from "../../../types/components.js";
import { Camera } from "../components/2d/Camera.js";

export interface RenderStrategy {
    registerStrategy(component:Renderable): void
    deregisterStrategy(component: Renderable): void
    render(renderingArr: Camera[]): void
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
            this.graphicsEngine.contextInfo.ctx.save()
            this.graphicsEngine.contextInfo.ctx.setTransform(1,0,0,1,0,0)
            this.graphicsEngine.contextInfo.ctx.clearRect(0,0, this.graphicsEngine.contextInfo.ctx.canvas.width, this.graphicsEngine.contextInfo.ctx.canvas.height)
            this.graphicsEngine.contextInfo.ctx.restore()
        for ( let i of this.graphicsEngine.components.values()) {
            if (i.rendered == false) {
                this.queue.enqueue(i, i.pos.z)
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

                //console.log("Size is " + this.queue.size)

                //camera.render(camera.pos )
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
        
        //console.log("Cleared queue length is " + this.queue.size)
    }
    

}