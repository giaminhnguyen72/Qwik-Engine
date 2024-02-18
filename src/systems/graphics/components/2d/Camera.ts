import { ContextInfo } from "../../../../core/context.js";
import { GraphicsEngine } from "../../GraphicEngine.js";
import { Component, Renderable } from "../../../../types/components.js";
import { Rectangle } from "../../../../types/components/collision/shape.js";
import { Position, Vector3 } from "../../../../types/components/physics/transformType.js";
import { Entity } from "../../../../types/Entity.js";
import { System } from "../../../../types/system.js";
import { Transform } from "../../../physics/components/transform.js";

export class Camera implements Renderable {
    context!: ContextInfo;
    
    system!: GraphicsEngine;
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

    constructor(width: number=-1, height: number = -1, curr: Position={x:0,y:0,z:-1} , scale: {x: number, y: number} = {x: 1, y: 1}) {
        this.height = height
        this.width = width
        this.pos= curr
        this.transform = {x: 0, y: 0,z: 0}
        
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
    rendered: boolean = false;
    copy<T>(camera: Camera): void {
        this.entity = camera.entity
        this.pos.x = camera.pos.x
        this.pos.y = camera.pos.y
        this.pos.z = camera.pos.z

        this.componentId = camera.componentId
        this.width =camera.width
        this.height =camera.height
        this.visible = camera.visible
        this.alive = camera.alive
        this.scale.x = camera.scale.x
        this.scale.y = camera.scale.y
        this.rendered = camera.rendered
    }
    bindPos(element: {pos: Vector3}) {

        this.pos = element.pos

    }

    initialize(graphics: GraphicsEngine): void {
        graphics.addCamera(this) 
        if (this.height < 0) {
            this.height = this.height * -1 * this.context.canvas.height
        }
        if (this.width < 0) {
            this.width = this.width * -1 * this.context.canvas.width
        }
        if (this.visible) {


            this.scale.x = this.context.ctx.canvas.width/ this.width
            this.scale.y = this.context.ctx.canvas.height / this.height



        }
    }
    update(dt: number): void {
        let context = this.context.ctx

        let x = this.pos.x - this.width/ 2
        let y = this.pos.y  - this.height / 2
        this.transform.x = this.scale.x* (0 +  x)  
        this.transform.y = this.scale.y * (0 +  y ) 
        
        
        


        
        
    }
    render(): void {
        
    }
    renderCamera(array: Renderable[]): void {
        if (this.visible) {



            

            
            let items = array
            items = items.sort((a, b) => {
                return b.pos.z - a.pos.z
            })
            
            for (let i of items) {
                if (i != this) {
                    i.render(this)
            }

            
        }
        //console.log("Camera is rendered " + items.length + "elements")

        
        }
        
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
            pos: this.pos,


        }
    }
    
}