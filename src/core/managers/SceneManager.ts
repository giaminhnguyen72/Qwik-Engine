import { Component } from "../../types/components.js";
import { EngineConfig, SceneConfig } from "../config.js";
import { Entity } from "../../types/Entity.js";
import { Scene, Stage } from "../scene.js";
import { System } from "../../types/system.js";
import { EngineType } from "../../constants/engineType.js";
import { SocketManager } from "./SocketManager.js";
import { Engine } from "../engine.js";
import { SocketServerManager } from "./SocketServerManager.js";
import e from "express";

export class SceneManager {
    static currScene: Scene
    scenes: Map<string, Stage> = new Map()
    sceneConfigs: Stage[]
    static currentIdx: string
    id: number = 0
    componentId = 0
    static EngineType:EngineType = EngineType.CLIENTONLY
    systems: System<Component>[]
    systemTag: Map<string, System<Component>>
    engineConfig: EngineConfig

    constructor(engineConfig: EngineConfig, scenes:Stage[]=[], systems: System<Component>[]) {
        this.systems = systems
        this.systemTag = new Map<string, System<Component>>()

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

        for (let i = 0; i < scenes.length; i++) {
            let newConfig:Stage = scenes[i]
            let newScene = newConfig
            newScene.sceneManager = this
            newScene.engineComponents = new Map()

            
            
            console.log("In Scene Manager")

            
            this.scenes.set(newScene.name, newScene)

            
        }
        this.setScene(scenes[0].name)
        this.sceneConfigs = scenes
        SceneManager.currentIdx = this.sceneConfigs[0].name
        this.systems = systems
    }
    switchScenes(key: string) {
        let scene : Scene | undefined= this.scenes.get(key)
        if (scene) {
            for (var sys of this.systems) {
                var comp = scene.engineComponents.get(sys.tag)
                if (comp) {
                   
    
                } else {
                    throw Error("error in start method")
                }
                
            }
        }
        
    }
    getCurrentScene(): Stage {
        let curr = this.scenes.get(SceneManager.currentIdx)
        if (curr) {
            return  curr
        } else {
            throw Error("Cant get current scene")
        }
        
    }
    setScene(idx: string) {
        let scene = this.scenes.get(idx)
        if (scene) {
            SceneManager.currScene = scene
            SceneManager.currentIdx = idx
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


