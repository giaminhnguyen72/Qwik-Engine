import { EngineType } from "../../../constants/engineType.js";

import { SocketServerManager } from "../SocketServerManager.js";
import { Component, Emitter, EngineEvent, Listener } from "../../../types/components.js";
import { EventSystem, System } from "../../../types/system.js";
interface SocketEvent extends EngineEvent{

}
export class SocketServer implements Listener<SocketEvent>, Emitter<SocketEvent> {
    eventsMap: Map<string, (click: SocketEvent) => void> = new Map()
    deleted: number[] = []
    listenerLock: boolean = false
    listenQueue: Map<string, SocketEvent> = new Map()
    emissionQueue: SocketEvent[] = []
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "SOCKET";
    componentId?: number | undefined;
    system!: System<Component>;
    type: EngineType
    events: {[key:string]:{[event:string]:(click: SocketEvent)=>void}}

    constructor(events: {[key:string]:{[event:string]:(click: SocketEvent)=>void}}, type: EngineType) {
        this.events = events
        this.type = type
    }
 
    copy(component: SocketServer): void {
        this.visible = component.visible
        this.alive = component.alive
        this.type = component.type
    } 
    initialize(system: EventSystem<SocketEvent>): void {
        console.log("Socket Server initializing")
        system.registerEmitter(this)
        system.registerListener(this)
        Object.entries(this.events).map(([k, v]) => {
            Object.entries(v).map(([event, func]) => {
                this.eventsMap.set(event, func)
                SocketServerManager.socket.on(k, (data: any) => {
                    let callback = this.eventsMap.get(event)
                    if (callback && !this.listenerLock) {
                        this.listenQueue.set(k, {
                            event: event,
                            data: data
                        })
                    }
                })
            })
            
        })
        
    }
    removeListener(id: number): void {
        
    }
    getListeners() {
        return [this]
    }
    getEventType(): string {
        return "SocketClient"
    }
    getEvents(): Map<string, (evnt: SocketEvent) => void> {
        let map = new Map()
        Object.entries(this.events).map(([k, v]) => {
            Object.entries(v).map(([eventString, func]) => {
                map.set(eventString, func)
            })
            
        })
        return map
    }

    //Emitter
    addListener(component: Listener<SocketEvent>): void {
        let events = component.getEvents()
        for (let event of events) {
            SocketServerManager.socket.on(event[0],event[1])
        }
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        console.log("Server Hndler is updating")
        for (let i = this.emissionQueue.length - 1; i >= 0; i--) {
            this.emit(this.emissionQueue[i])
            this.emissionQueue.pop()
        }
        this.listenerLock = true
        for (let i of this.listenQueue) {
            
            
            
            let func = this.eventsMap.get(i[0]) 
            if (func) {
                func(i[1].data)
            } else {
                //throw new Error()
            }
            
        }
        this.listenQueue.clear()
        this.listenerLock = false
        if (this.deleted.length > 0 ) {
            console.log("Deleted " + this.deleted)

            this.emit({
                event: "deleted",
                data: this.deleted
            })
            this.deleted.length = 0
        }
    }
    emit(event: SocketEvent): void {
        SocketServerManager.socket.emit(event.event, event.data)
    }
    execute(event: SocketEvent): void {
        if (event) {
            let func = this.eventsMap.get(event.event) 
            if (func) {
                func(event.data)
            }
        }
    }
    toJSON() {
        let engineType = this.type == EngineType.SOCKETCLIENT ? EngineType.SOCKETSERVER : EngineType.SOCKETCLIENT
        
        return {
            visible: this.visible,
            alive: this.alive,
            type: engineType
        }
    }

}
interface SocketEvent extends EngineEvent {
    event: string
    data: any
}