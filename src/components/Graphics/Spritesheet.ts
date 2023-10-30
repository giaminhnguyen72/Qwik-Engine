import { GRAPHICS_TAG } from "../../constants/componentType.js";
import { ContextInfo } from "../../core/context.js";
import { Component, Renderable } from "../../types/components.js";
import { getTopX, getTopY, Rectangle, rectangleCopy } from "../../types/components/collision/shape.js";
import { Position } from "../../types/components/physics/transformType.js";
import { System } from "../../types/system.js";

export class TimedSpriteSheet implements Renderable {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: System<Component>;
    path: string 
    image!:HTMLImageElement
    delay:number
    state:number = 0
    time:number = 0
    constructor(path: string, rectangle: Rectangle, delay:number, length: number) {
        
        this.path = path
        this.transform = rectangle.pos
        this.shape = rectangle
        this.delay = delay
        
    }
    unmount(): void {
        throw new Error("Method not implemented.");
    }
    context!: ContextInfo;
    rendered: boolean= false;
    transform: Position;
    shape:Rectangle
    render(): void {
        if (this.context.ctx) {
            let x = getTopX(this.shape)
            console.log("Drawn with State " + this.state)
            let y = getTopY(this.shape)

            this.context.ctx.drawImage(this.image, this.shape.dim.length * this.state, 0, this.shape.dim.length, this.shape.dim.height, x, y, this.shape.dim.length, this.shape.dim.height)
        } else {
            console.log("Context is not injected")
        }
    }
    initialize(): void {
        this.image = new Image()
        this.image.src = this.path
        this.state = 0
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        this.time += dt
        console.log("Updating Spritesheet")
        if (this.time > this.delay) {
            console.log("Time is greater than delay")
            let stateChange = Math.floor(this.time / this.delay)
            let numStates = Math.floor(this.image.width / this.shape.dim.length)
            console.log("Image width is " + this.image.width)
            console.log("State change is " + stateChange)
            this.state = (1 + this.state) % numStates
            this.time = this.time % this.delay

        }
    }
    getRectangle() {
        return this.shape
    }
    copy(component: TimedSpriteSheet): void {
        this.entity = component.entity
        this.visible = component.visible
        this.alive = component.alive
        this.componentId = component.componentId

        this.path = component.path
        this.delay = component.delay
        
        this.rendered = component.rendered

        this.transform.x = component.transform.x
        this.transform.y = component.transform.y
        this.transform.z = component.transform.z

        rectangleCopy(this.shape, component.shape)


    }
    toJSON() {
        return {

                entity: this.entity,
                componentId: this.componentId,
                engineTag: this.engineTag,
                transform: this.transform,
                visible: this.visible,
                alive: this.alive,
                src: this.path,
                shape:this.shape,
                delay: this.delay,
                state: this.state,
                time: this.time,
                path: this.path,
                rendered: this.rendered
        }
    }

}