
import { Server, Socket } from "socket.io";

import { EventHandler } from "../../systems/events/EventHandler.js";
import { Component, Emitter, EngineEvent, Listenable, Listener } from "../../types/components.js";
import { EntityPacket } from "../../types/Entity.js";
import { EventSystem, System } from "../../types/system.js";
import { EventConfig, SocketServerConfig } from "../config.js";
import { Engine } from "../engine.js";
import { Scene } from "../scene.js";
import { SceneManager } from "./SceneManager.js";
import { SocketManager } from "./SocketManager.js";

export class SocketServerManager implements System<Listenable>, EventSystem{
    static socket: Server
    roomID?: string
    sceneManager: SceneManager
    tag: string = "EVENTHANDLER";
    components: Map<number, Listenable>;
    emitters: Map<string, Emitter<EngineEvent>> = new Map()
    unregistered: Map<string, Listener<EngineEvent>[]> = new Map()
    listeners: Listener<EngineEvent>[] = []
    events: string[]
    deleted: Component[] = []
    config: SocketServerConfig
    time: number = 0
    constructor(sceneManager: SceneManager, config: SocketServerConfig) {
        this.components = new Map<number, Listenable>()
        this.events = []
        
        this.config = config
        this.sceneManager = sceneManager
        if (config.roomId) {
            this.roomID = config.roomId
        } else {
            throw new Error()
        }
        console.log("new Socket server has been madde " + this.roomID)
        console.log("new Socket server has been madde "+ this.roomID) 
        console.log("new Socket server has been madde " + this.roomID)
        console.log("new Socket server has been madde "+ this.roomID)
        if (!SocketServerManager.socket) {
            
            if (config.server) {
                SocketServerManager.socket = config.server
            
            } else {
                SocketServerManager.socket = new Server(3000)
            }
            
            
        }

        
        
        
        
        
    }
    register(comp: Listenable): void {
        
        if (comp.componentId == undefined || comp.componentId == null) {
            let id = this.sceneManager.getUniqueComponentId()
            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
            comp.initialize(this)
        } else {
            
        }
    }
    unregister(comp: number): void {
       let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            
       }
    }
    registerListener(component: Listener<EngineEvent>): void {
        let emitter = this.emitters.get(component.getEventType())
        if (emitter) {
            emitter.addListener(component)
        } else {
            this.listeners.push(component)
        }
    }
    registerEmitter(component: Emitter<EngineEvent>): void{
        this.emitters.set(component.getEventType(), component)
    }

    update(dt: number): void {

        let len = this.components.size
        this.time += dt
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

    
        console.log("RoomId is " + this.roomID)
        if (this.roomID) {
            console.log("updating room" + this.roomID)
            let entities: EntityPacket[] = []

            let ent =  this.sceneManager.getCurrentScene().entities
            console.log(ent.size + " entities have been sent")
            for (let e of  ent){
                let scene = e[1].scene as Scene
                entities.push({
                    components: e[1].components,
                    id: e[1].id as number,
                    sceneId: scene.name,
                    entityClass: e[1].className
                    
                    
                })


            }
            let packet = {timestamp: this.time,data:entities, time: Engine.time}

            SocketServerManager.socket.to(this.roomID).emit("update", packet)
        }
        
        
    }
    getConfig() {
        return this.config
    }
}
function createServer() {
    return new Server()
}