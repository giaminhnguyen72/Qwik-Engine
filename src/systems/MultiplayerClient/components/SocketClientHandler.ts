
import { EngineType } from "../../../constants/engineType.js";
import { Engine } from "../../../core/engine.js";
import { SceneManager } from "../../../core/managers/SceneManager.js";
import { SocketManager } from "../SocketManager.js";
import { Scene, Stage } from "../../../core/scene.js";
import { Component, Emitter, EngineEvent, Listener, SocketListener } from "../../../types/components.js";
import { Entity, EntityPacket } from "../../../types/Entity.js";
import { EventSystem, System } from "../../../types/system.js";
import { MultiplayerSyncronizer } from "./Syncronizer.js";

interface SocketEvent extends EngineEvent{
    event: string,
    data: any
}
export class SocketClient implements Emitter<SocketEvent>, Listener<SocketEvent> {

    emissionQueue: SocketEvent[] = []
    listenQueue: Map<string, SocketEvent>= new Map()
    listenerLock: boolean = false
    socketMap: Map<string, (data:any)=> void>
    listeners: Map<string, Listener<SocketEvent>> = new Map()
    events: Map<string, (data: any) => void>;
    //{[key:string]:{[event:string]:(click: SocketEvent)=>void}}
    stage: Stage
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "SOCKET";
    componentId?: number | undefined;
    system!: System<Component>;
    //TODO Implement Snapshots
    snapShots: EntityPacket[] = [] 
    socketConfig: {engineType: EngineType, entityGeneratorMap?: Map<string,() => Entity>}
    entityGenerator: Map<string, () => Entity> = new Map()
    time: number= 0
    constructor(multiplayerStage: Stage, socketMap: {[key:string]:(data: any)=>void}, socketConfig: {engineType: EngineType, entityGeneratorMap?: Map<string,() => Entity>}) {

        this.stage = multiplayerStage
        this.events = new Map()
        this.socketConfig = socketConfig
        if (socketConfig.entityGeneratorMap) {
            for (let [label, factoryMethod] of socketConfig.entityGeneratorMap) {
                this.entityGenerator.set(label, factoryMethod)
            }
        }
        this.socketMap = new Map()
        Object.entries(socketMap).map(([k, v]) => {
            this.socketMap.set(k, v)
        })

    }
    addEvent(event:string, callback: (data: any) => void) {
        this.socketMap.set(event, callback)
    }
    addClass<T extends Entity>(className: string, type: {new(): T}) {
        let callback = () => {
            return new type()
        }
        
        this.entityGenerator.set(className, callback)
        
    }
    addClassConfig(config: {[entityTag: string] : {new(): Entity}}) {
        Object.entries(config).map(([entityTag,Obj]) => {
            
            this.addClass<Entity>(entityTag, Obj)


        })
    }
    initialize(system: EventSystem<SocketEvent>): void {
        console.log("Socket Client initialization")
        system.registerEmitter(this)
        system.registerListener(this)
        for (let [k, v] of this.socketMap) {
            this.events.set(k, v)
            SocketManager.getInstance().on(k, (data: any) => {
                let func = this.events.get(k)
                if (func && !this.listenerLock) {
                    this.listenQueue.set(k, {
                        event: k,
                        data: data
                    })
                }
            })
        }

        this.events.set("deleted", (data: number[]) => {
            console.log("Nothing has been removed so far")

            for (let i of data) {
                let currScene = this.stage
                let entity = currScene.entities.get(i)
                if (entity) {
                    currScene.removeEntity(entity.id as number)
                    console.log("Entity " + entity.id + " has been removed")

                } 
            }

        })

        // this.events.set("update", (serverData: {timestamp: number, data: SocketListener<SocketEvent>[]}) => {
        //     for (let listener of serverData.data) {
        //         // Checks if entity exists or not by checking whether its component exists or not
        //         let component = this.system.components.get(listener.componentId as number)
        //         if (component) {
        //             component.copy(listener)
        //         } else {
        //             let entityFactory = this.entityGenerator.get(listener.entityTag)
        //             if (entityFactory) {
        //                 let entity = entityFactory()
        //                 if (listener.index >= 0 && listener.index < entity.components.length ) {
        //                     entity.components[listener.index].copy(listener)
        //                     this.stage.addServerEntity(entity)
        //                 }
                        
        //             }
        //         }

        //     }
        // })



        this.events.set("update", (serverData: {timestamp: number, data: EntityPacket[]}) => {
            let scene = this.stage
            

            if (scene){
                // Loop through Entity packets
                for (let entitySent of serverData.data) { 
                    let getScene = scene
                    if (getScene) {
                        // Checks whether Entity exists or not 
                        let queriedEntity = getScene.entities.get(entitySent.id)
                        if (queriedEntity) {
                            //if exists loop through all components and copy the components data from server 
                            for (let i = 0; i < entitySent.components.length; i++) {
                                // This retrieves the system from the hashmap and the queries the system for the component
                                // Perhaps we should just update from the components of entities?
                                queriedEntity.components[i].copy(entitySent.components[i])
                                /**
                                 * 
                                 * let engine = this.stage.querySys(entitySent.components[i].engineTag)
                                if (engine) {
                                    let comp = engine.components.get(entitySent.components[i].componentId as number)
                                    if (comp) {
                                        comp.copy(entitySent.components[i])
                                    } 
                                } 
                                 * 
                                 * 
                                 */


                                
                                
                            }
                        } else {
                                // IF entity is not found, this must mean it has just been created. Thus, we will allocate some memory for it.
                                // We look for the appropriate Generator function in the Socket client to get our Entity
                                // Generator functions are created through the entity generatormap or the addClass function

                                let entityFactory = this.entityGenerator.get(entitySent.entityClass)
                                if (entityFactory) {
                                    // If exists, we add the entity by calling the generator function and copy the data in all the components over 
                                    
                                    let entity = entityFactory()
                                    entity.id = entitySent.id
                                    entity.scene = getScene as Scene
                                    for (let j = 0; j < entity.components.length; j++) {
                                        entity.components[j].copy(entitySent.components[j])
                                    }
                                    this.stage.addServerEntity(entity)
                                } 
                        }                        
                    } else {
                        throw new Error("Scene not found")
                    }
                }

        }
        })
        SocketManager.getInstance().on("update", (serverData: {timestamp: number, entities: EntityPacket[], time: number}) => {
            let func = this.events.get("update")
                
                if (!this.listenerLock) {

                    this.listenQueue.set("update", {
                        event: "update",
                        data: serverData
                    })
                }
            
            
            
            
        })
        SocketManager.getInstance().on("deleted", (data: number[]) => {
            let func = this.events.get("deleted")
            this.listenQueue.set("deleted", {
                event: "deleted",
                data: data
            })

            
            
            
            
        })

        

        
        
    }
    addListener(component: Listener<SocketEvent>): void {

    }

    emit(event: SocketEvent): void {
        SocketManager.getInstance().emit(event.event, event.data)
    }
    removeListener(id: number): void {
        
    }
    getListeners() {
        
        return [this]
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        this.time += dt
        for (let i = this.emissionQueue.length - 1; i >= 0; i--) {

            this.emit(this.emissionQueue[i])
            this.emissionQueue.pop()
        }
        this.listenerLock = true
        for (let i of this.listenQueue) {
            
            
            
            let func = this.events.get(i[0]) 
            if (func) {


                func(i[1].data)



            } else {
                throw new Error()
            }
            let listener = this.listeners.get(i[0])
            if (listener) {
                
            }
            
            
        }
        this.listenQueue.clear()
        this.listenerLock = false
    }
    queueEvent(event: SocketEvent) {
        this.emissionQueue.push(event)
    }
    copy(component: SocketClient): void {
        this.visible = component.visible
        this.alive = component.alive
        this.socketConfig.engineType = component.socketConfig.engineType
    }
    getEventType(): string {
        return "Socket"
    }
    //Listener portion

    execute(event: SocketEvent): void {
        if (event) {
            let func = this.events.get(event.event) 
            if (func) {
                func(event.data)
            }
        }
    }
    getEvents(): Map<string, (evnt: SocketEvent)=> void> {
        let map = new Map()
        Object.entries(this.socketMap).map(([k, v]) => {
            map.set(k, v)
        })
        return map
    }
    toJSON() {

        let engineType = this.socketConfig.engineType == EngineType.SOCKETCLIENT ? EngineType.SOCKETSERVER : EngineType.SOCKETCLIENT
        
        return {
            visible: this.visible,
            alive: this.alive,
            socketConfig: {
                engineType: engineType
            }
        }
    }

}



interface SocketEvent extends EngineEvent {
    event: string
    data: any
    
}