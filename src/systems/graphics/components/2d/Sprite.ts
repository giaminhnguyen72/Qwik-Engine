
import { Component, Renderable,  } from "../../../../types/components.js";
import { Entity } from "../../../../types/Entity.js";
import { Scene } from "../../../../core/scene.js";
import { Transform } from "../../../physics/components/transform";

import { ContextInfo } from "../../../../core/context.js";
import { getTopX, getTopY, Rectangle } from "../../../..../../../types/components/collision/shape.js";

import { Camera } from "./Camera.js";
import { Position } from "../../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../../engine/src/types/system.js";

export class Sprite implements Component, Renderable {
    entity!: number;
    componentId?: number;
    engineTag: string = "GRAPHICS"
    shape: Rectangle
    pos: Position;
    context!: ContextInfo
    image!: HTMLImageElement
    src: string
    constructor(shape: Rectangle = {pos:{x:0, y:0, z:0}, dim: {height: 0, length: 0}, rot: 0}, src:string = "") {
        
        


        this.src = src
        this.shape = shape
        this.pos = this.shape.pos
        

    }
    unmount(): void {
        
    }
    rendered: boolean = false;
    
    copy(element:Sprite): void {
        this.componentId = element.componentId
        this.entity = element.entity

        this.shape.dim.height = element.shape.dim.height
        this.shape.dim.length = element.shape.dim.length
        if (element.shape.pos.x != element.pos.x) {
            
            throw new Error()
        }
        if (element.shape.pos.y != element.pos.y) {
            throw new Error()
        }
        if (element.shape.pos.z != element.pos.z) {
            throw new Error()
        }
        this.shape.pos.x = element.shape.pos.x
        this.shape.pos.y = element.shape.pos.y
        this.shape.pos.z = element.shape.pos.z
        this.shape.rot = element.shape.rot
        this.visible =  element.visible
        this.pos.x = element.pos.x
        this.pos.y = element.pos.y
        this.pos.z = element.pos.z


    }
    bindPos(element: {pos: Position}) {
        this.shape.pos = element.pos
    }
    bind(element: {shape: Rectangle}) {
        this.shape = element.shape
        this.pos = element.shape.pos
    }


    visible: boolean = true;
    alive: boolean = true;
    system!: System<Component>;
    getRectangle() {
        return this.shape
    }
    render(cam:Camera): void {
        let x = getTopX(this.shape)
            let y = getTopY(this.shape)

            let screenX = cam.scale.x * (x ) - cam.transform.x 
            let screemY = cam.scale.y* (y) - cam.transform.y
            this.context.ctx.drawImage(this.image,screenX, screemY , this.shape.dim.length * cam.scale.x, this.shape.dim.height * cam.scale.y)


        
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
            pos: this.pos,
            visible: this.visible,
            alive: this.alive,
            src: this.src,
            shape:this.shape,
            renderred: this.rendered
            
        }
    }
    
}
