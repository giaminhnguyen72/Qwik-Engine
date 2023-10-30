

import { SceneManager } from "./managers/SceneManager.js"
import { Component } from "../types/components.js"
import { SceneConfig } from "./config.js"
import { Entity} from "../types/Entity.js"
import { System } from "../types/system.js"
import { EntityManager } from "./managers/EntityManager.js"
import { EngineType } from "../constants/engineType.js"

export interface Scene {
    name: string
    newEntityQueue?: Map<number, Entity>
    sceneManager: SceneManager
    background?: string
    time: number
    entities: Map<number, Entity>
    engineComponents: Map<string, Map<number, Component>>
    addEntity: (scene: Scene, entity: Entity) => Entity
    getSceneConfig() : SceneConfig
    getUniqueId(): number
    getUniqueComponentId(): number
}
export class Stage implements Scene, Entity {
    components: Component[] = []
    scene?: Scene = this
    className: string = "STAGE"
    name: string 
    time: number = 0
    entities: Map<number, Entity> = new Map()
    sceneManager!: SceneManager
    engineComponents: Map<string, Map<number, Component>> = new Map()
    id: number = 0
    componentId = 0
    constructor(stageName: string, ...components: Component[]) {
        this.name = stageName
        this.components = components
    }
    getSceneConfig(): SceneConfig {
        return {
            entities: [this]
        }
    }

    addEntity(scene:Scene, entity: Entity): Entity {
        let uniqueId = this.sceneManager.getUniqueId()

    entity.id = uniqueId
    entity.scene = this

    this.entities.set(uniqueId, entity)
    
    for (let comp of entity.components) {
        let compList = this.engineComponents.get(comp.engineTag)
        comp.entity = entity.id
        if (compList) {
            let system: System<Component> | undefined= this.sceneManager.systemTag.get(comp.engineTag)
            if (system) {

                system.register(comp, this.getUniqueComponentId())
            } 


            
        } else {
            console.log(comp.engineTag + "does not exist")
            comp.componentId = this.sceneManager.getUniqueComponentId()
            
        }
    }
    console.log("successfully added entity")
    
    return entity
    }
    removeEntity(id: number) {
        let entity : Entity | undefined = this.entities.get(id)
    
    if (entity) {
        this.entities.delete(id)
        for (let c of entity.components) {
            console.log("Component")
            console.log(c)
            console.log("System")
            console.log(c.system)
            console.log("Component id ")
            console.log(c.componentId)
            c.system.unregister(c.componentId as number)
        }
        
        
    }
    return entity
    }
    addServerEntity(scene:Scene, entity: Entity) {
        if (entity.id == null || entity.id == undefined) {
            throw new Error("Entity id is undefined")
        }
        
        entity.scene = scene
        scene.entities.set(entity.id as number, entity)
        if (scene.newEntityQueue) {
            let isInQueue = scene.newEntityQueue.has(entity.id as number)
            if (!isInQueue) {
                for (let comp of entity.components) {
                    let compList = scene.engineComponents.get(comp.engineTag)
                    if (compList) {
            
                        let system: System<Component> | undefined= scene.sceneManager.systemTag.get(comp.engineTag)
                        if (system) {
                            system.register(comp, this.getUniqueComponentId())
                        } 
            
                        
                    } else {
                        console.log(comp.engineTag + " tagged System is not found")
                        
                    }
                }
                console.log("successfully added entitys")
            }
            
            return entity
        } else {
        
            for (let comp of entity.components) {
                let compList = scene.engineComponents.get(comp.engineTag)
                if (compList) {
        
                    let system: System<Component> | undefined= scene.sceneManager.systemTag.get(comp.engineTag)
                    if (system) {
                        system.register(comp, this.getUniqueComponentId())
                    } 
        
                    
                } else {
                    console.log(comp.engineTag + " tagged System is not found")
                    
                }
            }
            console.log("successfully added entitys")
            return entity
        }
        
    }
    getUniqueId() {
        if (SceneManager.EngineType == EngineType.SOCKETCLIENT) {
            let id = this.id - 1
            this.id--
            return id
        } else {
            let id = this.id  + 1
            this.id++
            return id
        }
        
    }
    getUniqueComponentId() {
        if (SceneManager.EngineType == EngineType.SOCKETCLIENT) {
            let id = this.componentId - 1
            this.componentId--
            return id
        } else {
            let id = this.componentId + 1
            this.componentId++
            return id
        }
        
    }
}
