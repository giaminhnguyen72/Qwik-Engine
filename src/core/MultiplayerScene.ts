import { SceneManager } from "./managers/SceneManager.js"
import { Component } from "../types/components.js"
import { SceneConfig } from "./config.js"
import { Entity} from "../types/Entity.js"
import { System } from "../types/system.js"

import { EngineType } from "../constants/engineType.js"
import { Scene } from "./scene"
import { SocketServer } from "../systems/MultiplayerServer/components/SocketServerHandler.js"

export class MultiplayerStage implements Scene, Entity {
    client: SocketServer = new SocketServer({}, EngineType.SOCKETSERVER)
    components: Component[] = [this.client]
    scene: Scene = this
    className: string = "STAGE"
    name: string 
    time: number = 0
    entities: Map<number, Entity> = new Map()
    classMap: Map<string, Map<number, Entity>>
    sceneConfig: SceneConfig = {entities: []}
    sceneManager!: SceneManager
    id: number = 0
    componentId = 0
    constructor(stageName: string, ...entities: Entity[]) {
        this.name = stageName
        
        this.classMap = new Map()
        for (let i of entities) {
            this.sceneConfig.entities.push(i)
        }
        this.sceneConfig.entities.push(this)
    }


    queryComponent<T extends Component>(type: {new(...args: any[]): T}, entityTag: string) {
        let entityMap = this.classMap.get(entityTag)
        let componentList: T[] = []
        if (entityMap) {
            let i = 0
            let indices = []
            for (let entity of entityMap) {
                if (i == 0 ) {
                    
                    for (let componentIdx = 0; componentIdx < entity[1].components.length; componentIdx++) {
                        if (entity[1].components[componentIdx] instanceof type) {
                            indices.push(componentIdx)
                        }
                    }
                } 
                for (let idx of indices) {
                    let proposedComponent = entity[1].components[idx]
                    if (proposedComponent instanceof type) {
                        componentList.push(proposedComponent)
                    }
                }

                i++
            }
        } 
        return componentList
    }
    querySystem<T extends System<Component>> (type: {new(...args: any[]): T}, engineTag: string) {
        
        let engine = this.sceneManager.queryEngine<T>(engineTag, type)
        if (engine) {
            return engine
        }
        return undefined

    }
    querySys (engineTag: string) {
        let engine = this.sceneManager.systems.get(engineTag)
        if (engine) {
            return engine
        }
        return undefined

    }
    getSceneConfig(): SceneConfig {
        return this.sceneConfig
    }
  
    addEntity( entity: Entity): Entity {
        
        let uniqueId = this.sceneManager.getUniqueId()
        entity.id = uniqueId
        entity.scene = this

        this.entities.set(uniqueId, entity)
        let entityMap = this.classMap.get(entity.className)
        if (entityMap) {
            entityMap.set(entity.id, entity)
        } else {
            let newMap = new Map()
            newMap.set(entity.id, entity)
            this.classMap.set(entity.className, newMap)
        }
        
        for (let comp of entity.components) {

            let compList = this.querySys(comp.engineTag)
            comp.entity = entity.id
            if (compList) {
                let system: System<Component> | undefined= this.sceneManager.systems.get(comp.engineTag)
                if (system) {

                    system.register(comp, this.getUniqueComponentId())
                    
                } 


                
            } else {
                console.log(comp.engineTag + "does not exist")

                comp.componentId = this.getUniqueComponentId()
                
            }
        }
        console.log("successfully added entity")
        
        return entity
    }
    removeEntity(id: number) {
        let entity : Entity | undefined = this.entities.get(id)
        console.log(entity?.className)
        
    if (entity) {
        this.entities.delete(id)
        let entityMap = this.classMap.get(entity.className)
        if (entityMap) {
            entityMap.delete(id)

        } 
        for (let c of entity.components) {
            console.log("Component")
            console.log(c)
            console.log("System")
            console.log(c.system)
            console.log("Component id ")
            console.log(c.componentId)
            if (this.querySys(c.engineTag)) {
                c.system.unregister(c.componentId as number)
            }
            
        }
        this.client.deleted.push(id)

    }
    return entity
    }
    addServerEntity(scene:Scene, entity: Entity) {
        if (entity.id == null || entity.id == undefined) {
            throw new Error("Entity id is undefined")
        }
        
        entity.scene = scene
        scene.entities.set(entity.id as number, entity)
        let entityMap = this.classMap.get(entity.className)
        if (entityMap) {
            entityMap.set(entity.id, entity)
        } else {
            let newMap = new Map()
            newMap.set(entity.id, entity)
            this.classMap.set(entity.className, newMap)
        }
        if (scene.newEntityQueue) {
            let isInQueue = scene.newEntityQueue.has(entity.id as number)
            if (!isInQueue) {
                for (let comp of entity.components) {
                    let compList = this.querySys(comp.engineTag)
                    if (compList) {
            
                        let system: System<Component> | undefined= scene.sceneManager.systems.get(comp.engineTag)
                        if (system) {
                            if (!comp.componentId) {
                                throw Error()
                            }
                            system.register(comp, comp.componentId as number)
                            comp.system = system
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
                let compList = this.querySys(comp.engineTag)
                if (compList) {
        
                    let system: System<Component> | undefined= scene.sceneManager.systems.get(comp.engineTag)
                    if (system) {
                        if (!comp.componentId) {
                            throw Error()
                        }
                        system.register(comp, comp.componentId as number)

                        comp.system = system
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