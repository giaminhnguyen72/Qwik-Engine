import { GRAPHICS_TAG } from "../../../../constants/componentType.js";

import { GraphicsEngine } from "../../GraphicEngine.js";




import { Component, Renderable,  } from "../../../../types/components.js";
import { Entity } from "../../../../types/Entity.js";
import { Scene } from "../../../../core/scene.js";
import { Transform } from "../../../physics/components/transform";

import { ContextInfo } from "../../../../core/context.js";
import { getTopX, getTopY, Rectangle } from "../../../..../../../types/components/collision/shape.js";

import { Camera } from "./Camera.js";
import { Position } from "../../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../../engine/src/types/system.js";

export class TimedSpriteSheet implements Renderable {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: GraphicsEngine;
    path: string 
    image!:HTMLImageElement
    delay:number
    column:number = 0
    row: number= 0
    time:number = 0
    length: number
    numOfStates: number[] 
    constructor(path: string, rectangle: Rectangle, delay:number, imageLength: number, numOfStates: number[] = []) {
        
        this.path = path
        this.pos = rectangle.pos
        this.shape = rectangle
        this.delay = delay
        this.length = imageLength
        
        this.numOfStates = numOfStates
        
    }
    switchImage(path: string) {
        let image = this.system.images.get(path)
        if (image) {
            this.image = image
        } else {
            this.image = new Image()
            this.image.src = path
            this.system.images.set(path, this.image)
        }
    }
    unmount(): void {
        throw new Error("Method not implemented.");
    }
    context!: ContextInfo;
    rendered: boolean= false;
    pos: Position;
    shape:Rectangle
    render(cam: Camera): void {
        if (this.context.ctx) {
            let x = getTopX(this.shape)

            let y = getTopY(this.shape)
            let screenX = cam.scale.x * (x ) - cam.transform.x 
            let screemY = cam.scale.y* (y) - cam.transform.y
            this.context.ctx.drawImage(this.image, this.shape.dim.length * this.column, this.shape.dim.height * this.row, this.shape.dim.length, this.shape.dim.height,
              screenX, screemY , this.shape.dim.length * cam.scale.x, this.shape.dim.height * cam.scale.y)
        } else {

        }
    }
    initialize(graphics: GraphicsEngine): void {
        
        let resource = graphics.images.get(this.path)
        if (resource) {
            this.image = resource
        } else {
            this.image = new Image()
            this.image.src = this.path

        }
        
        this.column = 0
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        this.time += dt

        if (this.time > this.delay) {
            let stateChange = Math.floor(this.time / this.delay)
            
            let numStates;
            if (this.row >= 0 && this.row < this.numOfStates.length) {
                numStates = this.numOfStates[this.row]
            } else {
                numStates = 1
            }
            this.column = (1 + this.column) % numStates
            this.time = this.time % this.delay

        }
    }
    bindPos(element: {pos: Position}) {
        this.shape.pos = element.pos
    }
    bind(element: {shape: Rectangle}) {
        this.shape = element.shape
        this.pos = element.shape.pos
    }
    getRectangle() {
        return this.shape
    }
    copy(component: TimedSpriteSheet): void {
        this.entity = component.entity
        this.visible = component.visible
        this.alive = component.alive
        this.componentId = component.componentId

        this.delay = component.delay
        
        this.rendered = component.rendered

        this.pos.x = component.pos.x
        this.pos.y = component.pos.y
        
        this.pos.z = component.pos.z

        


    }
    toJSON() {
        return {

                entity: this.entity,
                componentId: this.componentId,
                
                pos: {x: Math.floor(this.pos.x),y: Math.floor(this.pos.y), z: Math.floor(this.pos.z)},
                visible: this.visible,
                alive: this.alive,

                delay: this.delay,
                column: this.column,
                rendered: this.rendered
        }
    }

}