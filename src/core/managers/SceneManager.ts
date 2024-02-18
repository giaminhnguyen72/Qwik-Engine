import { Component } from "../../types/components.js";
import { EngineConfig, SceneConfig } from "../config.js";
import { Entity } from "../../types/Entity.js";
import { Scene, Stage } from "../scene.js";
import { System } from "../../types/system.js";
import { EngineType } from "../../constants/engineType.js";
import { SocketManager } from "../../systems/MultiplayerClient/SocketManager.js";
import { Engine } from "../engine.js";
import { SocketServerManager } from "../../systems/MultiplayerServer/SocketServerManager.js";
import e from "express";


export class SceneManager {
    currScene: Scene
    scenes: Map<string, Scene> = new Map()
    sceneConfigs: Scene[]=[]
    currentIdx: string
    id: number = 0
    componentId = 0
    static EngineType:EngineType = EngineType.CLIENTONLY

    systems: Map<string, System<Component>>
    engineConfig: EngineConfig

    constructor(engineConfig: EngineConfig,  systems: System<Component>[]) {
        
        this.systems = new Map<string, System<Component>>()

        this.engineConfig = engineConfig
        let engineType = engineConfig.engineType
        if (engineType == EngineType.SOCKETCLIENT) {

            SceneManager.EngineType = EngineType.SOCKETCLIENT
                
        } else if (engineType == EngineType.SOCKETSERVER){

            SceneManager.EngineType = EngineType.SOCKETSERVER
            //systems.push(new SocketServerManager(this))
        } else {
            SceneManager.EngineType = EngineType.CLIENTONLY
        }
        if ( this.engineConfig.sceneConfig) {
            for (let i = 0; i < this.engineConfig.sceneConfig.length; i++) {
                let newConfig:Scene = this.engineConfig.sceneConfig[i]
                let newScene = newConfig
                newScene.sceneManager = this

    
                
                
                console.log("In Scene Manager")
    
                
                this.scenes.set(newScene.name, newScene)
    
                
            }
            
        }
        this.currScene = (this.engineConfig.sceneConfig[0])
        this.sceneConfigs = this.engineConfig.sceneConfig
        this.currentIdx = this.sceneConfigs[0].name


        
        
        

    }
    initialize(systems: System<Component>[]) {
        for (let sys of systems) {
            sys.sceneManager = this
        }
    }
    queryEngine<T extends System<Component>>(engineTag: string, type: {new(...args: any[]) : T}) {
        let engine = this.systems.get(engineTag)
        if (engine && engine instanceof type) {
            return engine
        } else {
            return undefined
        }

    }
    switchScenes(key: string) {
        let scene : Scene | undefined= this.scenes.get(key)
        if (scene) {
            for (var sys of this.systems) {
                

                
            }
        }
        
    }
    getCurrentScene(): Scene {
        return  this.currScene
        
    }
    setScene(idx: string) {
        let scene = this.scenes.get(idx)
        if (scene) {
            this.currScene = scene
            this.currentIdx = idx
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


