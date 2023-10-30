
import { EngineType } from "../../constants/engineType.js";
import { Engine } from "../../core/engine.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { SocketManager } from "../../core/managers/SocketManager.js";
import { Scene } from "../../core/scene.js";
import { serverAdd } from "../../core/sceneUtils.js";
import { Component, Emitter, EngineEvent, Listener } from "../../types/components.js";
import { Entity, EntityPacket } from "../../types/Entity.js";
import { EventSystem, System } from "../../types/system.js";

export class SocketClient implements Emitter<SocketEvent>, Listener<SocketEvent> {

    emissionQueue: SocketEvent[] = []
    listenQueue: Map<string, SocketEvent>= new Map()
    listenerLock: boolean = false
    socketMap: {[key:string]:(data: any)=>void}
    events: Map<string, (data: any) => void>;
    //{[key:string]:{[event:string]:(click: SocketEvent)=>void}}
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "EVENTHANDLER";
    componentId?: number | undefined;
    system!: System<Component>;
    snapShots: EntityPacket[] = [] 
    socketConfig: {engineType: EngineType, entityGeneratorMap: Map<string,() => Entity>}
    time: number= 0
    constructor(socketMap: {[key:string]:(data: any)=>void}, socketConfig: {engineType: EngineType, entityGeneratorMap: Map<string,() => Entity>}) {
        this.socketMap = socketMap
        
        this.events = new Map()
        this.socketConfig = socketConfig

    }
    
    initialize(system: EventSystem): void {
        system.registerEmitter(this)
        system.registerListener(this)
        Object.entries(this.socketMap).map(([k, v]) => {
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
        })
        this.events.set("update", (serverData: {timestamp: number, data: EntityPacket[], time: number}) => {
            let scene = SceneManager.currScene 
            
            console.log( "Client Time Difference " + (serverData.time - Engine.time))
            if (scene){
                
                for (let entitySent of serverData.data) { 
                    let getScene = scene
                    if (getScene) {
                        let queriedEntity = getScene.entities.get(entitySent.id)
                        if (queriedEntity) {
                            for (let i = 0; i < entitySent.components.length; i++) {
                                let engine = getScene.engineComponents.get(entitySent.components[i].engineTag)
                                let comp = engine?.get(entitySent.components[i].componentId as number)
                                if (comp) {
                                    comp.copy(entitySent.components[i])
                                } 
                            }
                        } else {
                            console.log("Adding new Entity")
                                    let entityFactory = this.socketConfig.entityGeneratorMap.get(entitySent.entityClass)
                                    if (entityFactory) {
                                        let entity = entityFactory()
                                        entity.id = entitySent.id
                                        entity.scene = getScene as Scene
                                        for (let j = 0; j < entity.components.length; j++) {
                                            entity.components[j].copy(entitySent.components[j])
                                        }
                                        serverAdd(getScene, entity)
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
                console.log("On update " + (serverData.timestamp - Engine.time))
                if (!this.listenerLock) {

                    this.listenQueue.set("update", {
                        event: "update",
                        data: serverData
                    })
                }
            
            
            
            
        })
        

        
        
    }
    addListener(component: Listener<SocketEvent>): void {
        let events = component.getEvents()
        for (let event of events) {
            SocketManager.getInstance().on(event[0],event[1])
        }
    }

    emit(event: SocketEvent): void {
        SocketManager.getInstance().emit(event.event, event.data)
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
        return "SocketServer"
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