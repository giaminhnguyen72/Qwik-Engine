import { GraphicsEngine } from "../../GraphicEngine.js";
import { GRAPHICS_TAG } from "../../../../constants/componentType.js";
import { ContextInfo } from "../../../../core/context.js";
import { Position } from "../../../../types/components/physics/transformType.js";
import { System } from "../../../../types/system.js";
import { Component, DomElement, Renderable } from "../../../../types/components.js";
import { Rectangle } from "../../../../types/components/collision/shape.js";
export class Label implements DomElement {
    style: string;
    element!: HTMLElement;
    htmlTag: string

    id:string
    context!: ContextInfo;
    rendered: boolean = true;
    pos: Position ={x:0, y:0, z:0};
    text: string
    render(): void {
        
        if (!this.visible) {
            this.context.div.appendChild(this.element)
            this.visible = true
        }
    }
    initialize(system: GraphicsEngine): void {
        this.element = document.createElement(this.htmlTag)
        this.element.style.cssText  = this.style
        this.element.id = this.id
        this.element.textContent = this.text
        system.addUIComponent(this)
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
            pos: this.pos,
            dim: {height: parseInt(this.element.style.height), length: parseInt(this.element.style.width)},
            rot: 0
        }
    }
    
}