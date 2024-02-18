import { MouseType } from "../../constants/listener.js";
import { Component, Collideable, Listenable, Emitter, EngineEvent, Listener } from "../../types/components.js";
import { EventConfig } from "../../core/config.js";
import { EventSystem, System } from "../../types/system.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { KeyEvent } from "./components/KeyboardHandler.js";
import { Vector3 } from "../../types/components/physics/transformType.js";
interface ClickEvent extends EngineEvent{
    pos: Vector3
    eventName: string
}
export class EventHandler implements System<Listenable>, EventSystem<KeyEvent | ClickEvent> {
    tag: string = "EVENTHANDLER";
    
    sceneManager!: SceneManager
    components: Map<number, Listenable>;
    eventConfig: EventConfig

    deleted: Listenable[] = []
    listeners: Listener<EngineEvent>[] = []
    emitters: Map<string, Emitter<EngineEvent>> = new Map()

    constructor(sceneManager: SceneManager, eventConfig: EventConfig ={
        keyboard: false,
        mouse: false
    }) {
        this.sceneManager = sceneManager
        this.components = new Map<number, Listenable>()

        this.eventConfig = eventConfig




    }
    registerListener(component: Listener<EngineEvent>) : void {
        let emitter = this.emitters.get(component.getEventType())
        if (emitter) {
            emitter.addListener(component)
        } else {
            this.listeners.push(component)
        }
    }
    registerEmitter(component: Emitter<EngineEvent>) : void {
        this.emitters.set(component.getEventType(), component)
        console.log()
        //throw new Error("Emitter is registered")
    }
    getConfig() {
        return this.eventConfig
    }
    register(comp: Listenable, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {

            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
            comp.initialize(this)
        } else {
            comp.system = this
            this.components.set(comp.componentId, comp)
            comp.initialize(this)
        }
        console.log("Event Handler registered")
    }
    unregister(comp: number): void {
       let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            
       }
    }
    

    update(dt: number): void {
        console.log("Event Handler Updating")
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
