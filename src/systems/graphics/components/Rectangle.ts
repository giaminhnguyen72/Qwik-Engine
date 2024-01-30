import { ContextInfo } from "../../../core/context.js";
import { Component, Renderable } from "../../../types/components.js";
import { Position } from "../../../types/components/physics/transformType.js";
import { Entity } from "../../../types/Entity.js";
import { System } from "../../../types/system.js";
import { Transform } from "../../physics/components/transform";
import { Rectangle as RectangleCollider } from "../../../types/components/collision/shape.js";
export class Rectangle implements Component, Renderable{
    entity!: number
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;
    pos: Position
    shape: RectangleCollider
    color: string
    borderOutline: number = 0
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

    }
    constructor(rectangle: RectangleCollider, color: string = "#000000" , outline: number = 0) {

        this.shape= rectangle
        this.pos = rectangle.pos
        this.color = color
        this.borderOutline = outline
    }
    bind(element: {shape: RectangleCollider}) {
        this.shape = element.shape
    }
    unmount(): void {
        throw new Error("Method not implemented.");
    }
    rendered: boolean = false;

    copy(rectangle: Rectangle): void {
        this.entity = rectangle.entity
        this.componentId = rectangle.componentId
        this.pos.x = rectangle.pos.x
        this.pos.y = rectangle.pos.y
        this.pos.z = rectangle.pos.z
        this.color = rectangle.color
        this.visible = rectangle.visible
        this.alive = rectangle.alive
    }
    initialize(): void {
        
    }
    context!: ContextInfo;
    visible: boolean = true;
    alive: boolean = true;
    system!: System<Component>;
    render(): void {
        if (this.context.ctx) {
            
            this.context.ctx.fillStyle = this.color
            this.context.ctx.fillRect(this.shape.pos.x - this.shape.dim.length / 2, this.shape.pos.y - this.shape.dim.height / 2,this.shape.dim.length,this.shape.dim.height)
            if (this.borderOutline > 0) {
                this.context.ctx.clearRect(this.shape.pos.x - (this.shape.dim.length - this.borderOutline) / 2, this.shape.pos.y - (this.shape.dim.height - this.borderOutline) / 2,this.shape.dim.length - this.borderOutline,this.shape.dim.height - this.borderOutline)
            }

        }
    }
    getRectangle() {
        return this.shape
    }

}