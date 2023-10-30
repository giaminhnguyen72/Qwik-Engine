
import { Component, Renderable,  } from "../../types/components.js";
import { Entity } from "../../types/Entity.js";
import { Scene } from "../../core/scene.js";
import { Transform } from "../Physics/transform.js";
import { System } from "../../types/system.js";
import { ContextInfo } from "../../core/context.js";
import { getTopX, getTopY, Rectangle } from "../../types/components/collision/shape.js";
import { Position } from "../../types/components/physics/transformType.js";

export class Sprite implements Component, Renderable {
    entity: number;
    componentId?: number;
    engineTag: string = "GRAPHICS"
    shape: Rectangle
    transform: Position;
    context!: ContextInfo
    image!: HTMLImageElement
    src: string
    constructor(entity: number, shape: Rectangle, src:string) {
        this.entity = entity
        


        this.src = src
        this.shape = shape
        this.transform = this.shape.pos
        

    }
    unmount(): void {
        
    }
    rendered: boolean = false;
    
    copy(element:Sprite): void {
        this.componentId = element.componentId
        this.entity = element.entity

        this.shape.dim.height = element.shape.dim.height
        this.shape.dim.length = element.shape.dim.length
        if (element.shape.pos.x != element.transform.x) {
            
            throw new Error()
        }
        if (element.shape.pos.y != element.transform.y) {
            throw new Error()
        }
        if (element.shape.pos.z != element.transform.z) {
            throw new Error()
        }
        this.shape.pos.x = element.shape.pos.x
        this.shape.pos.y = element.shape.pos.y
        this.shape.pos.z = element.shape.pos.z
        this.shape.rot = element.shape.rot
        this.visible =  element.visible
        this.transform.x = element.transform.x
        this.transform.y = element.transform.y
        this.transform.z = element.transform.z


    }
    visit(element: Sprite) {

    }


    visible: boolean = true;
    alive: boolean = true;
    system!: System<Component>;
    getRectangle() {
        return this.shape
    }
    render(): void {
        if (this.context.ctx) {
            let x = getTopX(this.shape)
            let y = getTopY(this.shape)
            this.context.ctx.drawImage(this.image, x, y, this.shape.dim.length, this.shape.dim.height)
        }
        
    }

    update(dt: number): void {

    }
    initialize() {
        this.image = new Image()
        this.image.src = this.src
    }
    setSrc(src:string) {
        console.log("Source changed")
        this.src = src
        this.image.src = src;
    }
    toJSON() {
        return {
            entity: this.entity,
            componentId: this.componentId,
            engineTag: this.engineTag,
            transform: this.transform,
            visible: this.visible,
            alive: this.alive,
            src: this.src,
            shape:this.shape,
            renderred: this.rendered
            
        }
    }
    
}
