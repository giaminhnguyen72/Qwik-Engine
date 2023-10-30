import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { GRAPHICS_TAG } from "../../../../../engine/src/constants/componentType.js";
import { ContextInfo } from "../../../../../engine/src/core/context.js";
import { Position } from "../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../engine/src/types/system.js";
import { Component, DomElement, Renderable } from "../../../types/components.js";
import { Rectangle } from "../../../../../engine/src/types/components/collision/shape.js";
export class Label implements DomElement {
    style: string;
    element!: HTMLElement;
    htmlTag: string

    id:string
    context!: ContextInfo;
    rendered: boolean = true;
    transform: Position ={x:0, y:0, z:0};
    text: string
    render(strategyArr: Iterable<any>): void {
        
        if (!this.visible) {
            this.context.div.appendChild(this.element)
            this.visible = true
        }
    }
    initialize(): void {
        this.element = document.createElement(this.htmlTag)
        this.element.style.cssText  = this.style
        this.element.id = this.id
        this.element.textContent = this.text
    }
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: GraphicsEngine;
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

    }
    unmount(): void {
        this.system.components.delete(this.componentId as number)
        this.element.remove()
    }
    copy(component: Component): void {
        throw new Error("Method not implemented.");
    }
    constructor(id: string, style:string, htmlTag: string, text:string = "") {
        this.style = style
        this.id = id
        this.htmlTag = htmlTag
        this.text = text
    }
    getRectangle() {
        return {
            pos: this.transform,
            dim: {height: parseInt(this.element.style.height), length: parseInt(this.element.style.width)},
            rot: 0
        }
    }
    
}