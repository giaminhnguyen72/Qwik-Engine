import { EngineType } from "../../constants/engineType.js";
import { Component, Emitter, EngineEvent, Listenable, Listener } from "../../types/components.js";
import { Entity } from "../../types/Entity.js";
import { EventSystem, System } from "../../types/system.js";

export interface KeyEvent extends EngineEvent{
    eventName: string
    key: string
}
export class KeyboardListener implements Listener<KeyEvent>{
    events: Map<string, (event: KeyEvent) => void>;
    system!: System<Listenable>;
    entity!: number;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string= "EVENTHANDLER";
    componentId?: number | undefined;

    constructor(clickMap: {[key:string]:(event:KeyEvent)=>void}) {
        
        this.events = new Map<string, (eent:KeyEvent)=>void>()
        
        Object.entries(clickMap).map(([k, v]) => {
            this.events.set(k, v)
        })
    }
    getEvents(): Map<string, (event: KeyEvent) => void> {
        return this.events
    }
    eventMap?: Map<string, () => void> | undefined;
    execute(event: KeyEvent): void {
        let event1: KeyEvent = event
        
        let func = this.events.get(event.eventName)
        if (func) {
            func(event)
        }
    }
    getEventType(): string {
        return "KEYBOARD"
    }
    initialize(system: EventSystem): void {
        system.registerListener(this)
    }
    copy<T>(listener: KeyboardListener): void {
        this.entity = listener.entity
        this.alive = listener.alive
        this.visible = listener.visible
        this.componentId = listener.componentId

    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        
    }
    toJSON() {
        return {
            entity: this.entity,
            alive: this.alive,
            visible: this.visible,
            componentId: this.componentId
        }
    }

}
export class KeyBoardEmitter implements Emitter<KeyEvent> {
    listeners: Set<Listener<KeyEvent>> = new Set()
    events: KeyEvent[] = []
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "EVENTHANDLER";
    componentId?: number | undefined;
    system!: System<Component>;
    engineType:EngineType 
    constructor(engine: EngineType) {
        this.engineType = engine
    }
    initialize(system: EventSystem): void {
        system.registerEmitter(this)
        if (this.engineType != EngineType.SOCKETSERVER) {
            window.addEventListener("keydown", (event) => {
                this.events.push({
                    eventName: "keydown",
                    key: event.key
                })
            })
        }
    }
    addListener(component: Listener<KeyEvent>): void {
        this.listeners.add(component)
    }
    emit(event: KeyEvent): void {
        for (let listener of this.listeners) {
            listener.execute(event)
        }
    }
    getEventType(): string {
        return "KEYBOARD"
    }
    
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        for (let i = this.events.length - 1; i >= 0; i--) {
            this.emit(this.events[i])
            this.events.pop()
        }
    }
    copy(component: Component): void {
        this.alive = component.alive
        this.visible = component.alive
    }
    toJSON() {
        return {
            visible: this.visible,
            alive:  this.alive
        }
    }

}