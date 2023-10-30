import { ContextInfo } from "./../../../../../engine/src/core/context.js";
import { Position } from "./../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../engine/src/types/system.js";
import { Component, DomElement, Renderable } from "../../../types/components.js";
import { GRAPHICS_TAG } from "../../../../../engine/src/constants/componentType.js";
import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { Stage } from "../../../../../engine/src/core/scene.js";

export class Div implements DomElement {
    context!: ContextInfo;
    rendered: boolean = true;
    transform: Position = {x: 0, y: 0, z:0};
    entity!: number;
    element!: HTMLDivElement
    visible: boolean = false;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    id: string
    componentId!: number;
    system!: GraphicsEngine;
    style: string
    scene: Stage
    children: DomElement[]
    constructor(id: string, style:string, scene: Stage, ...children: DomElement[]) {
        this.id = id
        this.style= style
        this.children = children
        this.scene = scene


    }
    getRectangle() {
        return {
            pos: this.transform,
            rot: 0,

            dim: {
                length: 0,
                height: 0
            }
        }
    }
    unmount(): void {
        this.element.remove()
        this.system.unregister(this.componentId)
        for (let i = 0; i < this.children.length; i ++) {
            if (this.children[i].componentId) {
                
                this.system.unregister(this.children[i].componentId as number)

            } else {
                throw new Error()
            }
            
        }

        
    }
    render(strategyArr: Iterable<any>): void {
        
        if (!this.visible) {
            this.context.div.appendChild(this.element)
            this.visible = true
        }
    }
    initialize(): void {
        this.element = document.createElement('div');
        this.element.style.cssText =  this.style
        this.element.id = this.id
    
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].entity = this.entity
            this.children[i].visible = true

            this.system.register(this.children[i], this.scene.getUniqueComponentId())

            this.element.appendChild(this.children[i].element)
        }
    }
    
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        if (this.alive == false) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].alive = false
            }
        }
    }
    copy(component: Component): void {
        throw new Error("Method not implemented.");
    }
    
}