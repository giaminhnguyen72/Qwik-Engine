import { ContextInfo } from "../../../../core/context.js";
import { GraphicsEngine } from "../../GraphicEngine.js";
import { Component, Renderable } from "../../../../types/components.js";
import { Rectangle } from "../../../../types/components/collision/shape.js";
import { Position, Vector3 } from "../../../../types/components/physics/transformType.js";
import { Entity } from "../../../../types/Entity.js";
import { System } from "../../../../types/system.js";
import { Transform } from "../../../physics/components/transform.js";
import { OrthographicCamera, Scene } from "three";

export class OrthographicCamera3d implements Renderable {
    context!: ContextInfo;
    
    system!: GraphicsEngine;
    entity!: number;
    visible: boolean = false;
    alive: boolean = true;
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;
    transform: Position
    scale: {x: number, y
        : number}
    pos: Position
    height: number
    width:number

    component: OrthographicCamera
    constructor(width: number=-1, height: number = -1, curr: Position={x:0,y:0,z:-1} , scale: {x: number, y: number} = {x: 1, y: 1}) {
        this.height = height
        this.width = width
        this.pos= curr
        this.transform = {x: 0, y: 0,z: 0}
        let left = this.pos.x - this.width / 2
        let right = this.pos.x + this.width / 2
        let top = this.pos.y + this.height / 2
        let bottom = this.pos.y - this.height / 2
        
        this.component = new OrthographicCamera(left, right, top, bottom,0, 100 )
        
        this.scale = scale
    }
    unmount(): void {
        this.component.parent?.remove(this.component)
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
    copy<T>(camera: OrthographicCamera3d): void {
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
        if (this.visible) {} 
        graphics.sceneGraph.add(this.component)
        
        if (this.height < 0) {
            this.height = this.height * -1 * this.context.canvas.height
        }
        if (this.width < 0) {
            this.width = this.width * -1 * this.context.canvas.width
        }

    }
    update(dt: number): void {


        
        
        
            this.component.position.set(this.pos.x, this.pos.y, this.pos.z)
            this.component.scale.set(this.scale.x , this.scale.y, 1)
    
        


        
        
    }
    render(): void {
        
    }
    renderCamera(array: Renderable[]): void {
        if (this.visible) {
            console.log("rendering orthographic")
            
            this.system.renderer.render(this.system.sceneGraph, this.component)
        //console.log("Camera is rendered " + items.length + "elements")

        
        }
        
    }
    makeCurrentCamera() {
        this.system.mainCamera = this
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