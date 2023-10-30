import { ContextInfo } from "../../core/context.js";
import { Component, Renderable } from "../../types/components.js";
import { Rectangle } from "../../types/components/collision/shape.js";
import { Position } from "../../types/components/physics/transformType.js";
import { Entity } from "../../types/Entity.js";
import { System } from "../../types/system.js";
import { Transform } from "../Physics/transform.js";

export class Camera implements Renderable {
    context!: ContextInfo;
    
    system!: System<Renderable>;
    entity!: number;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;
    transform: Position
    scale: {x: number, y
        : number}
    pos: Position
    height: number
    width:number

    constructor(entity: number = -1, width: number=-1, height: number = -1, curr: Position={x:0,y:0,z:-1} , scale: {x: number, y: number} = {x: 1, y: 1}) {
        this.height = height
        this.width = width
        this.pos= curr
        this.transform = {x: 0, y: 0,z: 0}
        this.entity = entity
        this.scale = scale
    }
    unmount(): void {
        
    }
    getRectangle(): Rectangle {
        return {
            pos: this.pos,
            dim: {
                height: this.height,
                length: this.width,
            },
            rot: 0
        }
    }
    rendered: boolean = true;
    copy<T>(camera: Camera): void {
        this.entity = camera.entity
        
        this.componentId = camera.componentId
        this.width =camera.width
        this.height =camera.height
        this.visible = camera.visible
        this.alive = camera.alive
        this.scale.x = camera.scale.x
        this.scale.y = camera.scale.y
        this.rendered = camera.rendered
    }
    initialize(): void {
        if (this.height < 0) {
            this.height = this.height * -1 * this.context.canvas.height
        }
        if (this.width < 0) {
            this.width = this.width * -1 * this.context.canvas.width
        }
        if (this.rendered) {
            this.context.canvas.height = this.height
            this.context.canvas.width = this.width
        }
    }
    update(dt: number): void {
        let context = this.context.ctx

        this.pos.x += this.transform.x
        this.pos.y += this.transform.y
        
        
        


        
        
    }

    render(array: Renderable[]): void {
        this.context.ctx.translate(this.transform.x, this.transform.y)
        this.context.ctx.clearRect(-1 * this.pos.x,-1 * this.pos.y,this.width, this.height)
        let items = array
        for (let i of items) {
            if (i != this) {
                
                i.render(array)

            }
            
        }
        console.log("Camera is rendered " + items.length + "elements")
        this.transform.x = 0
        this.transform.y = 0
        this.context.ctx.save()
    }
    toJSON() {
        return {
            entity: this.entity,
        
            componentId: this.componentId,
            width: this.width,
            height: this.height,
            visible: this.visible,
            alive: this.alive,
            scale: this.scale,
            rendered: this.rendered,
            pos: this.pos

        }
    }
    
}