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
    // Room IDs to SocketServer instances
    static SocketServerMap: Map<string, SocketServer>
    // Cliennt IDs to socket connections
    static Lobby: Map<string, Socket>
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
    system!: SocketServerManager
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
        if (!SocketServer.Lobby) {
            SocketServer.Lobby = new Map()
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
    static removeRoom(roomID: string) {
        SocketServer.SocketServerMap.delete(roomID)
    }
    static addPlayerToRoom(playerSocket: Socket, roomID: string) {
        let player = SocketServer.Lobby.get(playerSocket.id)
        let room = SocketServer.SocketServerMap.get(roomID)

        if (player && room) {
            SocketServer.Lobby.delete(playerSocket.id)

            room.addPlayer(player)
        } else {
            
        }
    }
    addPlayer(player: Socket) {
        let SocketHandler = this.events.get("connection")
        if (SocketHandler) {
            this.applySocketConnection(player, SocketHandler)
        }
        
        
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
        SocketServer.SocketServerMap.set(this.system.roomID, this)
        if (!SocketServer.isInitialized) {
            console.log("Socket server is " + SocketServer.isInitialized)

            SocketServerManager.socket.on("connection", (socket: Socket) => {
                // Add to lobby to look for players
                SocketServer.Lobby.set(socket.id, socket)
                // Remove from lobby if disconnected before added to correct Room
                socket.on('disconnect', () => {
                    SocketServer.Lobby.delete(socket.id)
                })
            })
            // allows you to manipulate the socket connection directly
            for (let [connectionString, callback] of this.socketCallback) {
                SocketServerManager.socket.on(connectionString, callback)
            }
            // allows you to send and receive events with out caring about the socket connection -
            // for (let [connectionString, v] of this.events) {
                
            //     SocketServerManager.socket.on(connectionString, (socket:Socket) => {
            //         this.applySocketConnection(socket, v)
            //     })
            // }

         
            SocketServer.isInitialized = true
        }
         
        
    }

    
    addClass<T extends Entity>(className: string, type: {new(): T}) {
        let callback = () => {
            return new type()
        }
        this.entityGenerator.set(className, callback)
        
    }
    removeListener(id: number): void {
        
    }
    applySocketConnection(socket: Socket, v: Map<string, (r: ReceiverEvent) => void>) {

        let playerSocket: SocketServer  = this
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
                let playerSocket  = this
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
        // This listens to any events coming from clients
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
