import { EngineType } from "../../../constants/engineType.js";

import { SocketServerManager } from "../SocketServerManager.js";
import { Component, Emitter, EngineEvent, Listener } from "../../../types/components.js";
import { EventSystem, System } from "../../../types/system.js";
import { Entity } from "../../../types/Entity.js";
import { Socket } from "socket.io";
interface SocketEvent extends EngineEvent {

    event: string
    data: any
}

interface ReceiverEvent extends SocketEvent {
    socketId: string
    event: string
    data: any
}
type Test = {event: string,  callback: (data:any)=> void}
export class SocketServer implements Listener<SocketEvent>, Emitter<SocketEvent> {
    static isInitialized = false
    static ServerHandler: SocketServer
    static SocketServerMap: Map<string, SocketServer>
    // maps socket id to events from players
    playerEvents: Map<string,  ReceiverEvent[]> = new Map() 
    //maps socket id to entity
    playerCharacter: Map<string, Entity> = new Map()
    maxEvent: number = 5
    deleted: number[] = []
    listenerLock: boolean = false
    eventsMap: Map<string, (data: ReceiverEvent) => void> = new Map();
    // When store eventNames to callback
    
    emissionQueue: SocketEvent[] = []
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "SOCKET";
    componentId?: number | undefined;
    system!: SocketServerManager;
    type: EngineType
    
    entityGenerator: Map<string, () => Entity> = new Map()
    events: Map<string, Map<string, (data: ReceiverEvent)=>void>> = new Map()
    socketCallback: Map<string, (socket: Socket) => void> = new Map()
    constructor(socketCallback: {[connectionString:string]:(socket:Socket) => void}, events: {[connectionString:string]:{[socketString:string]:(data: any)=>void}}, type: EngineType) {
        
        this.type = type
        Object.entries(socketCallback).map(([connectionString, callback]) => {
                this.socketCallback.set(connectionString, callback)
        })
        // Object.entries(events).map(([connectionString, eventMap]) => {
        //     let map = new Map<string,(socket:Socket) => void>()
        //     Object.entries(eventMap).map(([eventString, callback]) => {
        //         map.set(eventString, callback)
        //     })
        //     this.events.set(connectionString, map)

        // })
        if (!SocketServer.SocketServerMap) {
            SocketServer.SocketServerMap = new Map()
        }
    }
    static  getInstance(type: EngineType,socketCallback: {[connectionString:string]:(socket:Socket) => void} = {}, events: {[connectionString:string]:{[socketString:string]:(data: any)=>void}} ={}) : SocketServer {
        if (SocketServer.ServerHandler ==undefined ||SocketServer.ServerHandler ==null ) {
            SocketServer.ServerHandler = new SocketServer(socketCallback, events, type)
            return SocketServer.ServerHandler
        } else {
            return SocketServer.ServerHandler
        }
    }
    addPlayer(socket: string, entity: Entity) {
            this.playerCharacter.set(socket, entity)
            SocketServer.SocketServerMap.set(socket, this)
            let scene = this.system.sceneManager.getCurrentScene()
            scene.addEntity(entity)
        
    }
    removePlayer(socket: string) {
        let i = this.playerCharacter.get(socket)
        if (i) {
            let scene = this.system.sceneManager.getCurrentScene()
            scene.removeEntity(i.id as number)
        }
    }
    initializeSocketCallback(socketCallback: {[connectionString:string]:(socket:Socket) => void}) {
        Object.entries(socketCallback).map(([connectionString, callback]) => {
            this.socketCallback.set(connectionString, callback)
        })
    }
    initializeEventCallback(events: {[connectionString:string]:{[socketString:string]:(data: ReceiverEvent)=>void}}) {
        Object.entries(events).map(([connectionString, eventMap]) => {
            let map = new Map() 
            Object.entries(eventMap).map(([eventString, callback]) => {
                map.set(eventString, callback)
            })
            this.events.set(connectionString, map)

        })
    
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

        if (!SocketServer.isInitialized) {
            console.log("Socket server is " + SocketServer.isInitialized)


            for (let [connectionString, callback] of this.socketCallback) {
                SocketServerManager.socket.on(connectionString, callback)
            }
          
            for (let [connectionString, v] of this.events) {
                
                SocketServerManager.socket.on(connectionString, (socket:Socket) => {
                    if (connectionString == "connection") {
                        SocketServer.SocketServerMap.set(socket.id, this)
                    }
                    let playerSocket  = SocketServer.SocketServerMap.get(socket.id)
                    if (!playerSocket) {
                        throw new Error("Socket not found")
                    }
                    let events = playerSocket.playerEvents.get(socket.id)
                    if (!events) {
                        events = []

                        playerSocket.playerEvents.set(socket.id, events)
                    }
                    for (let [socketString, func] of v) {
                        playerSocket.eventsMap.set(socketString, func)

                        socket.on(socketString, (data: any) => {
                            //this.listenQueue.set()
                            let playerSocket  = SocketServer.SocketServerMap.get(socket.id)
                            if (!playerSocket) {
                                throw new Error("Socket not found")
                            }
                            let playerEvents = playerSocket.playerEvents.get(socket.id)
                            if (!playerEvents) {
                                playerEvents = [] 
                                playerSocket.playerEvents.set(socket.id, playerEvents)
                            }
                            if (!this.listenerLock)  {
                                console.log("Adding player event")
                                playerEvents.push({
                                    socketId: socket.id,
                                    event: socketString,
                                    data: data
                                })
                            }
                            
                        })
                    }
                })
            }

         
            SocketServer.isInitialized = true
        }
        
        
    }
    addSocketCallback(connectionString: string,callback: (socket:Socket) => void) {
        SocketServerManager.socket.on(connectionString, callback)
    }

    
    addClass<T extends Entity>(className: string, type: {new(): T}) {
        let callback = () => {
            return new type()
        }
        this.entityGenerator.set(className, callback)
        
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

    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        //console.log("Server Hndler is updating")
        for (let i = this.emissionQueue.length - 1; i >= 0; i--) {
            this.emit(this.emissionQueue[i])
            this.emissionQueue.pop()
        }
        //Listeners portion
        this.listenerLock = true
        for (let [socket, events] of this.playerEvents) {
            for (let i = events.length - 1; i >= 0; i--) {
                let e = events[i]
                let func = this.eventsMap.get(e.event) 
                if (func) {
                    console.log("This event has been called: " + e.event)
                    func(e)
                } else {
                    //throw new Error()
                }
                events.pop()
            }
            
             
            
        }

        this.listenerLock = false
        if (this.deleted.length > 0 ) {


            this.emit({
                event: "deleted",
                data: this.deleted
            }) 
            this.deleted.length = 0
        }
    }
    emit(event: SocketEvent): void {
        console.log("Room id is " + this.system.roomID)
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
