import { ContextInfo } from "../../core/context";
import { Component, Renderable } from "../../types/components";
import { Rectangle } from "../../types/components/collision/shape";
import { Position } from "../../types/components/physics/transformType";
import { Entity } from "../../types/Entity";
import { System } from "../../types/system";
import { Transform } from "../Physics/transform";

class Div implements Renderable{
    context!: ContextInfo;
    system!: System<Component>;
    entity: number;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;
    style: string
    divId: string
    hasId: boolean
    transform: Position
    constructor(entity: number = -1, divId: string, style: string) {
        this.entity = entity
        this.divId = divId
        this.style = style
        this.hasId = false
        this.transform = {x: 20, y:20, z:20}
    }
    getRectangle(): Rectangle {
        throw new Error("Method not implemented.");
    }
    unmount(): void {
        throw new Error("Method not implemented.");
    }

    rendered: boolean = false;
    copy<T>(): void {
        throw new Error("Method not implemented.");
    }
    initialize(): void {
        
    }
    
    update(dt: number): void {
        if (this.hasId) {

        } else {
            if (document.getElementById(this.divId) == null) {
                this.hasId = true
            } else {
                
            }
        }
    }
    render(): void {
        
    }

}