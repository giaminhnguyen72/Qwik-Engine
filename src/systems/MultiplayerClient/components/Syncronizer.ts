import { EventSystem, System } from "../../../../../engine/src/types/system.js";
import { Component, EngineEvent, Listener } from "../../../../../engine/src/types/components.js";
import { Entity } from "../../../../../engine/src/types/Entity.js";
interface SocketEvent extends EngineEvent{
    event: string,
    data: {
        timestamp: number,
        data: any
    }
}
// TODO: make the Syncronizer on the Server side emit Only necessary data

 export class MultiplayerSyncronizer<T extends {new(...args: any[]): Entity}, Data> implements Listener<SocketEvent> {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "SOCKET";
    componentId?: number | undefined;
    system!: EventSystem<SocketEvent>
    entityTag: string
    // Use in client to copy data to entity
    updateFunc: (data: MultiplayerSyncronizer<T, Data>) => void
    returnData: () => Data
    index: number = -1
    currEntity:Entity
    constructor(entity: Entity, updateFunc: (data: MultiplayerSyncronizer<T, Data>) => void, returnData: () => Data ) {
        this.entityTag = entity.className
        //Only use in client
        this.currEntity = entity
        this.updateFunc = updateFunc
        this.returnData = returnData
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
    //Used for buffers serverside
    clone() {
        let entity = new MultiplayerSyncronizer<T, Data>(this.currEntity, this.updateFunc, this.returnData)
    
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
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        throw new Error("Method not implemented.");
    }
    //Copies Data over to component

    copy(component: MultiplayerSyncronizer<T, Data>): void {
        this.updateFunc(component)
    }
    toJSON() {
        return {
            componentId: this.componentId,
            data: this.returnData(),
            entityTag: this.engineTag,
            entity: this.entity,
            index: this.index
        }
    }
    
}