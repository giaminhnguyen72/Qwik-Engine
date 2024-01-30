import { GRAPHICS_TAG } from "../../../constants/componentType.js";
import { ContextInfo } from "../../../core/context.js";
import { GraphicsEngine } from "../GraphicEngine.js";
import { Component, Renderable } from "../../../types/components.js";
import { getTopX, getTopY, Rectangle, rectangleCopy } from "../../../types/components/collision/shape.js";
import { Position } from "../../../types/components/physics/transformType.js";
import { System } from "../../../types/system.js";

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
    length: number
    constructor(path: string, rectangle: Rectangle, delay:number, length: number) {
        
        this.path = path
        this.pos = rectangle.pos
        this.shape = rectangle
        this.delay = delay
        this.length = length
        
    }
    unmount(): void {
        throw new Error("Method not implemented.");
    }
    context!: ContextInfo;
    rendered: boolean= false;
    pos: Position;
    shape:Rectangle
    render(): void {
        if (this.context.ctx) {
            let x = getTopX(this.shape)

            let y = getTopY(this.shape)

            this.context.ctx.drawImage(this.image, this.shape.dim.length * this.state, 0, this.shape.dim.length, this.shape.dim.height, x, y, this.shape.dim.length, this.shape.dim.height)
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
        
        this.state = 0
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        this.time += dt

        if (this.time > this.delay) {
            let stateChange = Math.floor(this.time / this.delay)
            let numStates = Math.floor(this.image.width / this.shape.dim.length)
            this.state = (1 + this.state) % numStates
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

        this.path = component.path
        this.delay = component.delay
        
        this.rendered = component.rendered

        this.pos.x = component.pos.x
        this.pos.y = component.pos.y
        this.pos.z = component.pos.z

        rectangleCopy(this.shape, component.shape)


    }
    toJSON() {
        return {

                entity: this.entity,
                componentId: this.componentId,
                engineTag: this.engineTag,
                pos: this.pos,
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