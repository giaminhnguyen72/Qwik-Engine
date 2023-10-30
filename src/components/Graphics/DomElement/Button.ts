import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { GRAPHICS_TAG } from "../../../../../engine/src/constants/componentType.js";
import { ContextInfo } from "../../../../../engine/src/core/context.js";
import { Position } from "../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../engine/src/types/system.js";
import { Component, DomElement, Renderable } from "../../../types/components.js";


export class Button implements DomElement {
    style: string;
    element!: HTMLElement;
    unmount(): void {
        throw new Error("Method not implemented.");
    }
    text: string
    context!: ContextInfo;
    rendered: boolean = true;
    transform: Position = {x:0, y:0, z:0};
    id: string
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: GraphicsEngine;
    onClick: ()=> void
    getRectangle() {
        return {
            pos: this.transform,
            dim: {height: parseInt(this.element.style.height), length: parseInt(this.element.style.width)},
            rot: 0
        }
    }
    constructor(id: string, style: string, text: string = "", onclick: () => void = () => {}) {
        this.id = id
        this.style = style
        this.text = text
        this.onClick = onclick

    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

    }
    copy(component: Component): void {
        throw new Error("Method not implemented.");
    }
    render(strategyArr: Iterable<any>): void {

        if (!this.visible) {
            this.context.div.appendChild(this.element)
            this.visible = true
        }
        
    }
    initialize(): void {
        let element = document.createElement("BUTTON");
        this.element = element
        this.element.style.cssText =  this.style
        this.element.innerHTML = this.text
        this.element.onclick = this.onClick
        this.element.id = this.id

        

    }
}
export class ImageButton implements DomElement {
    style: string;
    element!: HTMLElement;
    id:string
    src: string
    context!: ContextInfo;
    rendered: boolean = true;
    transform: Position = {x:0, y:0, z:0};
    childImage!: HTMLImageElement
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: GraphicsEngine;
    onClick: ()=> void
    constructor(id: string, style: string, imageUrl: string = "", onclick: () => void = () => {}) {
        this.id = id
        this.style = style
        this.src = imageUrl
        this.onClick = onclick

    }
    unmount(): void {
        this.system.components.delete(this.componentId as number)
        this.childImage.remove()
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

    }
    getRectangle() {
        return {
            pos: this.transform,
            dim: {height: parseInt(this.element.style.height), length: parseInt(this.element.style.width)},
            rot: 0
        }
    }
    copy(component: Component): void {
        throw new Error("Method not implemented.");
    }
    render(strategyArr: Iterable<any>): void {

        if (!this.visible) {
            this.context.div.appendChild(this.element)
            this.visible = true
        }
        
    }
    initialize(): void {
        let element = document.createElement("BUTTON");
        this.element = element
        this.element.style.cssText =  this.style
        this.element.onclick = this.onClick
        this.element.id = this.id
        this.childImage = new Image()
        this.childImage.src = this.src
        this.element.appendChild(this.childImage)
    }
}