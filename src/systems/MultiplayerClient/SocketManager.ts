import { io, Socket } from "socket.io-client";
import { EventHandler } from "../events/EventHandler.js";
import { Component, Emitter, EngineEvent, Listenable, Listener, Renderable, SocketListener } from "../../types/components.js";
import { EventSystem, SocketEventSystem, System } from "../../types/system.js";
import { EventConfig, SocketClientConfig } from "../../core/config.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import parser from 'socket.io-msgpack-parser'
interface SocketEvent extends EngineEvent{
    event: string
    data: string
}
export class SocketManager implements SocketEventSystem<SocketEvent>{
    static socket: Socket

    sceneManager: SceneManager
    tag: string = "SOCKET";
    components: Map<number, Listenable>;
    emitters: Map<string, Emitter<SocketEvent>> = new Map()

    listeners: Listener<SocketEvent>[] = []
    config: SocketClientConfig
    deleted: Listenable[] = []
    static getInstance(): Socket {
        if (SocketManager.socket == undefined || SocketManager.socket == null) {
            this.socket = io({
                parser: parser
            })
        }
        return SocketManager.socket
    }
    constructor(sceneManager: SceneManager, config: SocketClientConfig) {
        this.components = new Map<number, Listenable>()
        this.config = config

        this.sceneManager = sceneManager
        


        
    }
    getConfig() {
        return this.config
    }
    registerListener(component: Listener<SocketEvent>): void {
        let emitter = this.emitters.get(component.getEventType())
        if (emitter) {
            emitter.addListener(component)
        } else {
            this.listeners.push(component)
        }
    }
    
    registerEmitter(component: Emitter<EngineEvent>): void {
        this.emitters.set(component.getEventType(), component)
        
    }
    register(comp: SocketListener<SocketEvent>): void {
        if (comp.componentId == undefined || comp.componentId == null) {

            let id = this.sceneManager.getUniqueComponentId()
            comp.componentId = id
            comp.system = this
            comp.initialize(this)
            this.components.set(id, comp)
        } else {
            comp.system = this
            this.components.set(comp.componentId, comp)
            comp.initialize(this)
        }
        console.log("Socket Manager registered")
    }
    unregister(comp: number): void {
       let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            
       }
       
    }
    
   
    update(dt: number): void {
        //console.log("Client Socket Handler")
        //console.log("Client Socket Handler Components:"+this.components.size)

        for (let emitter of this.emitters) {
            emitter[1].update(dt)
        }
        for (let i = this.listeners.length - 1; i >= 0; i--) {
            let emitter = this.emitters.get(this.listeners[i].getEventType())
            if (emitter) {
                emitter.addListener(this.listeners[i])
                this.listeners[i] = this.listeners[this.listeners.length - 1]
                this.listeners.pop() 
            }
        }
        while (this.deleted.length > 0) {
            let comp = this.deleted.pop()
            
            this.components.delete(comp?.componentId as number)
            if (comp) {
                let emitterComponent = this.emitters.get(comp.getEventType())
                if (emitterComponent && emitterComponent.componentId == comp.componentId) {
                    this.emitters.delete(comp.getEventType())
                    let components = emitterComponent.getListeners()
                    for (let i of components) {
                        this.listeners.push(i)
                    }
                } else if (emitterComponent) {
                    emitterComponent.removeListener(comp.componentId as number)
                } 
                
            }
        }

    }
    
}