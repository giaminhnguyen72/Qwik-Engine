import { EngineType } from "../../../constants/engineType.js";
import { Engine } from "../../../core/engine.js";
import { EventHandler } from "../EventHandler.js";
import { Component, Emitter, EngineEvent, Listenable, Listener } from "../../../types/components.js";
import { Position } from "../../../types/components/physics/transformType.js";
import { Entity } from "../../../types/Entity.js";
import { EventSystem, System } from "../../../types/system.js";
import { Rectangle } from "../../../../../engine/src/types/components/collision/shape.js";
interface ClickEvent {
    pos: Position
    eventName: string
}
export class UIListener implements Listener<ClickEvent>{
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string =  "EVENTHANDLER";
    componentId?: number | undefined;
    system!: System<Component>;
    boundingBox: Rectangle
    children: UIListener[] = []
    onClick?: (ev:ClickEvent) => void
    constructor(rectangle: Rectangle,callback?: (ev: ClickEvent) => void, ...children: UIListener[]) {
        this.boundingBox = rectangle
        this.onClick = callback
        this.children = children
    }
    
    initialize(system: EventSystem<ClickEvent>): void {
        this.system = system
        system.registerListener(this)

    }

    execute(event: ClickEvent): void {

        if ((this.onClick)) {
            this.onClick(event)
        }

        
    }
    isClicked(event: ClickEvent): boolean {
        let x = (event.pos.x / (window.innerWidth)) * 2 -1
        let y = (event.pos.y / (window.innerHeight)) * -2 + 1
        console.log(x)
        console.log(y)
        let minX = this.boundingBox.pos.x - this.boundingBox.dim.length / 2
        let maxX =  this.boundingBox.pos.x + this.boundingBox.dim.length / 2
        let minY = this.boundingBox.pos.y - this.boundingBox.dim.height / 2
        let maxY =  this.boundingBox.pos.y + this.boundingBox.dim.height / 2
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            let clicked = false
            for (let i of this.children) {
                clicked = clicked || i.isClicked(event)
            }
            if (!clicked) {
                if (this.onClick) {
                    this.onClick(event)
                }
            }
            return true
        } else {
            return false
        }
    }

    getEvents(): Map<string, (evnt: ClickEvent) => void> {
        throw new Error("Method not implemented.");
    }
    getEventType(): string {
        return "MOUSE"
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        throw new Error("Method not implemented.");
    }

    copy(component: Component): void {
        throw new Error("Method not implemented.");
    }

}