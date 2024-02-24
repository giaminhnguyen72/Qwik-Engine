import { EventSystem, SocketEventSystem, System } from "../../../../../engine/src/types/system.js";
import { Component, EngineEvent, Listener, SocketListener } from "../../../../../engine/src/types/components.js";
import { Entity } from "../../../../../engine/src/types/Entity.js";
import { Engine } from "../../../../../engine/src/core/engine.js";
import { EngineType } from "../../../../../engine/src/constants/engineType.js";
interface SocketEvent extends EngineEvent{
    event: string,
    data: {
        timestamp: number,
        data: any
    }
}
// TODO: make the Syncronizer on the Server side emit Only necessary data

 export class MultiplayerSyncronizer<T extends Entity, Data> implements SocketListener<SocketEvent> {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "SOCKET";
    componentId?: number | undefined;
    system!: SocketEventSystem<SocketEvent>
    entityTag: string
    // Use in client to copy data to entity
    copyFunc: (data: Data) => void
    // Use in server to decide which data to send
    returnData: () => Data
    // update item mostly for interpolation
    updateFunc?: (dt: number) => void
    // Store previous data
    data?: Data
    index: number = -1
    currEntity:Entity
    // Time store previous time stamp
    time: number = 0
    constructor(entity: Entity, copyFunc: (data: Data) => void, returnData: () => Data, updateFunc?: (dt: number) => void ) {
        this.entityTag = entity.className
        //Only use in client
        this.currEntity = entity
        this.copyFunc = copyFunc
        this.returnData = returnData
        this.updateFunc = updateFunc

    }
    interpolateData(timestamp: number,data: SocketListener<EngineEvent> ): void {
        // if the diffrence between the current time and the timestamp given is within a 0.001 ms of time it is considered the same time
        // this is because time for sycronizers is storing the past time


    }
    initialize(system: EventSystem<SocketEvent>): void {
        this.system = system
        system.registerListener(this)
        if (this.index == -1) {
            for (let c = 0; c <  this.currEntity.components.length; c++) {
                if (this.currEntity.components[c] == this) {
                    this.index = c
                }
            }
        }
        if (this.index == -1) {
            throw new Error("Cannot find Sycronizer")
        }

    }
    //Used for lag compnesation probably
    clone() {
        let entity = new MultiplayerSyncronizer<T, Data>(this.currEntity, this.copyFunc, this.returnData)
        entity.componentId = this.componentId
        entity.entity = this.entity
        entity.index = this.index
        entity.visible = this.visible
        entity.alive = this.alive
        entity.engineTag = this.engineTag
        entity.system = this.system
        entity.currEntity = this.currEntity
        entity.engineTag = this.entityTag
        return entity

    }
    // Execute should be called to update data by adding it into buffer?
    execute(event: SocketEvent): void {

        event.data.data.push(this.toJSON())

    }
    getEvents(): Map<string, (evnt: SocketEvent) => void> {
        throw new Error("Method not implemented.");
    }
    
    getEventType(): string {
        return "Socket"
    }
    // Used for clients to update for interpolation
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        if (this.updateFunc) {
            this.updateFunc(dt)
        }
    }
    //Copies Data over to component
    // Copies data from server to correct components using functions
    copy(component: MultiplayerSyncronizer<T, Data>): void {
        if (Engine.engineConfig.engineType == EngineType.SOCKETSERVER) {

        } else if (Engine.engineConfig.engineType == EngineType.SOCKETCLIENT) {
            let c = component
            if (c.data) {
                this.copyFunc(c.data)
            }
            
        }
        
    }
    toJSON() {
        return {
            componentId: this.componentId,
            data: this.returnData(),
            entityTag: this.entityTag,
            entity: this.entity,
            index: this.index
        }
    }
    getSnapshot() {

    }
    
}