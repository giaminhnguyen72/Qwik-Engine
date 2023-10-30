


import { GRAPHICS_TAG } from "../../constants/componentType.js"
import { Component, Listenable, Renderable } from "../../types/components.js"
import { GraphicsConfig } from "../../core/config.js"
import { ContextInfo } from "../../core/context.js"
import { Entity } from "../../types/Entity.js"

import { System } from "../../types/system.js"
import { Scene } from "../../core/scene.js"
import { SceneManager } from "../../core/managers/SceneManager.js"
import { PriorityQueue } from "../../structs/PriorityQueue.js"
import { PainterStrategy, RenderStrategy } from "../../types/components/graphics/RenderingStrategy.js"
import { QuadTreeStrategy } from "../../types/components/graphics/QuadTreeRendering.js"
export class GraphicsEngine implements System<Renderable>{
    tag: string = GRAPHICS_TAG
    components: Map<number, Renderable>
    renderStrategy: RenderStrategy
    graphicsConfig: GraphicsConfig
    contextInfo: ContextInfo
    deleted: Component[]
    rendering: Renderable[] = []
    constructor(graphicsConfig: GraphicsConfig, context: ContextInfo) {
        this.graphicsConfig = graphicsConfig
        this.components = new Map<number, Renderable>()
        this.deleted = []
        document.documentElement.style.height = '100%'
        document.documentElement.style.width = '100%'
        document.body.style.height = "100%"
        document.body.style.width = "100%"
        document.body.style.margin = "0"
        this.contextInfo = context
        let size = {
            pos: {
                x:0,
                y: 0,
                z: 0
            },
            rot: 0,
            dim: {
                length: this.contextInfo.getCanvas().width,
                height: this.contextInfo.getCanvas().height
            }

        }
        this.renderStrategy = new QuadTreeStrategy(this, size)

        
    }
    register(comp: Renderable, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {
            console.log("Registering undefined id in Ggraphics")

            comp.componentId = id
            comp.system = this
            
            comp.context = this.contextInfo
            if (comp.rendered == true) {
                this.rendering.push(comp)
                console.log("Pushing to rendering")
            } else {
                
            }
            comp.initialize(this)
            this.components.set(id, comp)
        } else {
            console.log("Graphics Registering id" + comp.componentId)
            comp.system = this
            comp.context = this.contextInfo
            if (comp.rendered == true) {
                this.rendering.push(comp)

                console.log("Pushing to rendering")
                
            } else {
                if (comp.rendered == false) {
                    this.renderStrategy.registerStrategy(comp)
                    console.log("Registered Strategy")
                }
            }
            comp.initialize(this)
            this.components.set(comp.componentId, comp)
        }
    }
    unregister(id: number): void {

        let deleted = this.components.get(id)
        if (deleted) {
                deleted.alive = false
                
                this.deleted.push(deleted)
                this.components.delete(id)
                this.renderStrategy.deregisterStrategy(deleted)
                console.log(deleted.entity+ " s Component with id " +  deleted.componentId + "is popped")
            }
        }
    
    
    
    update(dt: number) {
        let ctx = this.contextInfo.ctx

        console.log("Graphics engine running")
        console.log("Graphics Components: " + this.components.size)
        for (let c of this.components) {
            let comp = c[1]

            
            comp.update(dt)
            
           
            


        }
        console.log("Rendering Components: " + this.rendering.length)
        this.renderStrategy.render(this.rendering)



        while (this.deleted.length > 0 ) {
            let comp = this.deleted.pop()
            
            this.components.delete(comp?.componentId as number)
        }


        
        
    }
    setScene(scene: Scene): void {
        let get = scene.engineComponents.get(this.tag)
        if(get) {

        }
    }
    registerDomElements(): void {
        
    }

    

}