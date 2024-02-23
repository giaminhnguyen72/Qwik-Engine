
import { Server, Socket } from "socket.io";
import { SocketServer } from "./components/SocketServerHandler.js";

import { EventHandler } from "../events/EventHandler.js";
import { Component, Emitter, EngineEvent, Listenable, Listener, SocketListener } from "../../types/components.js";
import { Entity, EntityPacket } from "../../types/Entity.js";
import { EventSystem, SocketEventSystem, System } from "../../types/system.js";
import { EventConfig, SocketServerConfig } from "../../core/config.js";
import { Engine } from "../../core/engine.js";
import { Scene } from "../../core/scene.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
interface SocketEvent extends EngineEvent{
    event: string
    data: string
}

export class SocketServerManager implements System<Listenable>, SocketEventSystem<SocketEvent> {
    static socket: Server
    roomID: string
    sceneManager: SceneManager
    tag: string = "SOCKET";
    components: Map<number, Listenable>;
    emitters: Map<string, Emitter<EngineEvent>> = new Map()
    buffer: Map<number, SocketListener<SocketEvent>> = new Map()
    listeners: Listener<EngineEvent>[] = []
    deleted: Listenable[] = []
    config: SocketServerConfig
    time: number = 0
    constructor(sceneManager: SceneManager, config: SocketServerConfig) {
        this.components = new Map<number, Listenable>()
        
        
        this.config = config
        this.sceneManager = sceneManager
        if (config.roomId) {
            this.roomID = config.roomId
        } else {
            throw new Error()
        }
        console.log("new Socket server has been madde " + this.roomID)

        if (!SocketServerManager.socket) {
            
            if (config.server) {
                SocketServerManager.socket = config.server
            
            } else {
                //SocketServerManager.socket = new Server(3000)
            }
            
            
        }

        
        
        
        
        
    }
    register(comp: Listenable): void {
        console.log(" Component has been registered with type Socket Client")
        console.log(comp instanceof SocketServer)
        if (comp.componentId == undefined || comp.componentId == null) {
            console.log(" Component is not defined ")
            let id = this.sceneManager.getUniqueComponentId()
            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
            comp.initialize(this)
        } else {
            console.log(" Component is defined")
            comp.system = this
            this.components.set(comp.componentId, comp)
            comp.initialize(this)
        }
    }
    unregister(comp: number): void {
       let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            
       }
    }
    registerListener(component: SocketListener<EngineEvent>): void {
        console.log("A listener has been registered")
        let emitter = this.emitters.get(component.getEventType())
        if (emitter) {
            console.log("A listener has been added")
            emitter.addListener(component)
        } else {
            console.log("A listener has been pushed to waitlist")
            this.listeners.push(component)
        }
    }
    registerEmitter(component: Emitter<EngineEvent>): void{
        console.log("An emitter has been registered")
        this.emitters.set(component.getEventType(), component)

    }

    update(dt: number): void {

        let len = this.components.size
        this.time += dt

        //console.log("Emitter count " + this.emitters.size)
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

    
        //console.log("RoomId is " + this.roomID)
        
            //console.log("updating room" + this.roomID)


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
    getConfig() {
        return this.config
    }
}
function createServer() {
    return new Server()
}