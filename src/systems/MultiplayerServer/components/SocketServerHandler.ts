import { EngineType } from "../../../constants/engineType.js";

import { SocketServerManager } from "../SocketServerManager.js";
import { Component, Emitter, EngineEvent, Listener, SocketListener } from "../../../types/components.js";
import { EventSystem, SocketEventSystem, System } from "../../../types/system.js";
import { Entity, EntityPacket } from "../../../types/Entity.js";
import { Socket } from "socket.io";
import { Scene } from "../../../../../engine/src/core/scene.js";
import { Engine } from "../../../../../engine/src/core/engine.js";
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

//Socket Servers are basically Rooms
export class SocketServer implements Emitter<SocketEvent> {
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
    listeners: Map<number, SocketListener<SocketEvent>> = new Map()
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
    entityTag: string = ""
    index: number = -1
    time: number = 0
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
    
    static GetLobby() {
        if (!SocketServer.Lobby) {
            SocketServer.Lobby = new Map()
        }
        return SocketServer.Lobby
    }
    static GetSocketServerMap() {
        if (!SocketServer.SocketServerMap) {
            SocketServer.SocketServerMap = new Map()
        }
        return SocketServer.SocketServerMap
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
    addCharacter(socketID: string, entity: Entity) {
        this.playerCharacter.set(socketID, entity)
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
    interpolateData(timestamp: number, data: any): void {
        
    }
    copy(component: SocketServer): void {
        this.visible = component.visible
        this.alive = component.alive
        this.type = component.type
    } 
    clone() {
        return this
    }
    initialize(system: SocketEventSystem<SocketEvent>): void {
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
        return "Socket"
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
    addListener(component: SocketListener<SocketEvent>): void {
        this.listeners.set(component.componentId as number, component)
    }
    removeListener(id: number): void {
        this.listeners.delete(id)
    }
    copyData() {
        
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        //console.log("Server Hndler is updating")
        this.time += dt
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

                    func(e)
                } else {
                    //throw new Error()
                }
                events.pop()
            }
            
             
            
        }
        this.listenerLock = false
        let newpacket:SocketEvent = {
            event: "update",
            data: {
                timestamp: this.time,
                data: []
            }
        }
        //added true because buffers are not done serverside unless in cases of lag compensation
            if (true || this.system.config.buffer <= 0 ) {       
                this.listenerLock = false

                
                for (let [id, component] of this.listeners) {
                    component.execute(newpacket)

                }
                this.emit(newpacket)
            } else {
                // if ((this.system.config.buffer <= this.system.time)) {
                //     let buffer = this.system.buffer
                //     for (let listener of buffer) {
                //         listener[1].execute(newpacket)
                //     }
                //     for (let [id, component] of this.listeners) {
                //         let bufferedItem = buffer.get(id)
                //         if (bufferedItem) {
                //             bufferedItem.copy(component)
                //         } else {
                //             let bufferedItem = component.clone()
                            
                //             buffer.set(id, bufferedItem)
                //         }
                //     }
                // }
                // this.emit(newpacket)
            }

        
        // 
        //
        // let newpacket: SocketEvent = {
        //     event:"update",
        //     data: []
        // }
        // if (this.system.time >= this.system.config.buffer) {
        //     // First loop through each Syncronizer and add them to buffer to be sent
        //     for (let [id, component] of this.system.buffer) {
        //         newpacket.data.push(component)
        //     }
        //     for (let [id, component] of this.listeners) {
        //         component.execute(newpacket)
        //     }
        //     this.emit(newpacket)
        
        // }




        // let entities: EntityPacket[] = []

        // let ent =  this.system.sceneManager.getCurrentScene().entities
        
        // //console.log(ent.size + " entities have been sent")
        // // We loop through each entity within the scene
        // if (this.system.config.buffer <= 0 ) {
        //     for (let e of  ent){
        //         if (this.system.config.buffer <= 0){
        //             // If there is no buffer we send the current objects
        //             let scene = e[1].scene as Scene
        //             entities.push({
        //                 components: e[1].components,
        //                 id: e[1].id as number,
        //                 sceneId: scene.name,
        //                 entityClass: e[1].className
        //             })
        //         } 
        //     //If there is a buffer 
        //     } 
        // } else {
        //     // We only send the data in the pass ie 100 ms has passed
        //     if (this.system.time  >= this.system.config.buffer) {
        //         // we first send the the items in the buffered queue. This means data in the past
        //         for (let e of  this.system.buffer){
                
        //             // If there is no buffer we send the current objects
                    
        //             entities.push(e[1])
                    
                 
        //         } 
        //          // we then update the queue with the new data from the scene
        //          // buffer must contain new data due to components being references and stuff like that 
        //         let scene = this.system.sceneManager.getCurrentScene()
        //         for (let [id, entityObj] of scene.entities) {

        //             let bufferedItem = this.system.buffer.get(id)
        //             // Entity is already in buffer, copy the data over from entities to buffer
        //             // We only need to copy the components
        //             if  (bufferedItem) {
        //                 for (let i =0;  i < entityObj.components.length; i++) {
        //                     bufferedItem.components[i].copy(entityObj.components[i])
        //                 }
        //             } else {
        //                 //otherwise, create the new entity and copy the data over
        //                 let bufferedItem = entityObj.clone()
        //                 for (let i =0;  i < entityObj.components.length; i++) {
        //                     bufferedItem.components[i].copy(entityObj.components[i])
        //                 }
        //                 // the add the packet to the the buffer
        //                 this.system.buffer.set(id, {
        //                     components: bufferedItem.components,
        //                     id: id,
        //                     sceneId: scene.name,
        //                     entityClass: entityObj.className
        //                 })
                        
        //             }
        //         }
        //     }
            

           

        //     //
        // }
        
        // let packet = {timestamp: this.system.time,data:entities}

        // SocketServerManager.socket.to(this.system.roomID).emit("update", packet)





        if (this.deleted.length > 0 ) {


            this.emit({
                event: "deleted",
                data: this.deleted
            }) 
            this.deleted.length = 0
        }
    }
    emit(event: SocketEvent): void {
        SocketServerManager.socket.to(this.system.roomID).emit(event.event, event.data)
    }
    execute(event: SocketEvent): void {

        event.data.data.push(this.toJSON())
    }
    toJSON() {
        let engineType = this.type == EngineType.SOCKETCLIENT ? EngineType.SOCKETSERVER : EngineType.SOCKETCLIENT
        
        return {
            componentId: this.componentId,
            entity: this.entity,
            data: engineType,
            entityTag: "SOCKET"
        }
    }

}
