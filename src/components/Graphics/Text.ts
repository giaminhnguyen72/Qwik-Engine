import { ContextInfo } from "../../core/context.js";
import { Component, Renderable } from "../../types/components.js";
import { Position } from "../../types/components/physics/transformType.js";
import { Entity } from "../../types/Entity.js";
import { System } from "../../types/system.js";
import { Transform } from "../Physics/transform.js";

export class Text implements Renderable {
    entity!: number;
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;
    text: string
    visible: boolean = true;
    alive: boolean = true;
    system!: System<Component>;
    transform: Position
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

    }
    
    constructor(text: string) {
        this.transform = {x:100, y:100, z:0}
        this.text = text
    }
    unmount(): void {
        
    }

    rendered: boolean = false;
    copy<T>(text: Text): void {
        this.componentId = text.componentId
        this.entity = text.entity
        this.text = text.text
        this.transform.x = this.transform.x
        this.transform.y = this.transform.y

    }
    context!: ContextInfo;
    render(): void {
        if (this.context) {
            this.context.ctx.fillText(this.text, this.transform.x, this.transform.y)
        }
    }
    initialize() {


    }
    getRectangle() {
        return {
            pos: this.transform,
            dim: {length: 0, height: 0},
            rot: 0
        }
    }
    toJson() {
        return {
            entity: this.entity,
            engineTag: this.engineTag,
            componentId: this.componentId,
            text: this.text,
            visible: this.visible,
            alive: this.alive,
            transform: this.transform
        }
    }
    
    
}