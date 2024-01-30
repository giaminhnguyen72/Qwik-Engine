import { EngineType } from "../../../constants/engineType.js";
import { Component, Emitter, EngineEvent, Listenable, Listener } from "../../../types/components.js";
import { Entity } from "../../../types/Entity.js";
import { EventSystem, System } from "../../../types/system.js";

interface CustomEvent {
    eventName: string
}
export class CustomEventListener<T extends CustomEvent> implements Listener<T>{
    events: Map<string, (event: T) => void>;
    system!: System<Listenable>;
    entity!: number;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string= "EVENTHANDLER";
    componentId?: number | undefined;
    eventType: string
    constructor(eventType: string, clickMap: {[key:string]:(event:T)=>void}) {
        
        this.events = new Map<string, (event:T)=>void>()
        this.eventType = eventType
        Object.entries(clickMap).map(([k, v]) => {
            this.events.set(k, v)
        })
    }
    getEvents(): Map<string, (event: T) => void> {
        return this.events
    }
    
    execute(event: T): void {
        let event1: T = event
        
        let func = this.events.get(event.eventName)
        if (func) {
            func(event)
        }
    }
    getEventType(): string {
        return this.eventType
    }
    initialize(system: EventSystem<T>): void {
        system.registerListener(this)
    }
    copy(listener: CustomEventListener<CustomEvent>): void {
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
export class CustomEventEmitter<T extends CustomEvent> implements Emitter<T> {
    listeners: Map<number, Listener<T>> = new Map()
    events: T[] = []
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "EVENTHANDLER";
    componentId?: number | undefined;
    system!: System<Component>;

    eventType: string
    constructor(eventType: string) {
        this.eventType = eventType
    }
    initialize(system: EventSystem<T>): void {
        system.registerEmitter(this)

    }
    addListener(component: Listener<T>): void {
        this.listeners.set(component.componentId as number, component)
    }
    emit(event: T): void {
        for (let listener of this.listeners) {
            listener[1].execute(event)
        }
    }
    getEventType(): string {
        return this.eventType
    }
    removeListener(id: number): void {
        this.listeners.delete(id)
    }
    getListeners() {
        return this.listeners.values()
    }
    queueEvent(data: T) {
        this.events.push(data)
    }
    
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        for (let i = this.events.length - 1; i >= 0; i--) {
            this.emit(this.events[i])
            this.events.pop()
        }
        
    }
    copy(component: Component): void {
        this.alive = component.alive
        this.visible = component.visible
    }
    toJSON() {
        return {
            visible: this.visible,
            alive:  this.alive
        }
    }

}