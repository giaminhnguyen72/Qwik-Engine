
import { EventHandler } from "../systems/events/EventHandler.js";
import { GraphicsEngine } from "../systems/graphics/GraphicEngine.js";
import { PhysicsEngine } from "../systems/physics/PhysicsEngine.js";
import { ScriptingEngine } from "../systems/scripting/ScriptingEngine.js";
import { Component } from "../types/components.js";
import { EngineConfig } from "./config.js";
import { ContextInfo } from "./context.js";
import { System } from "../types/system.js";
import { SceneManager } from "./managers/SceneManager.js";
import { CollisionSystem } from "../systems/Collision/CollisionSystem.js";
import { EngineType } from "../constants/engineType.js";
import { Server } from "socket.io";

export class Engine {
    engineConfig: EngineConfig;
    canvasID: string = "engineCanvas"
    static updateTime = 0
    running:boolean
    sceneManager: SceneManager
    systems: System<Component>[] = []
    static time: number = 0
    graphics?: GraphicsEngine
    serverTime = 0n;
    clientTime = 0
    contextInfo?: ContextInfo
    constructor(gameConfig: EngineConfig = {
        engineType: EngineType.CLIENTONLY,

    }, systems?: System<Component>[]) {
        this.engineConfig = gameConfig
        if (gameConfig.graphicsConfig) {
            this.contextInfo = new ContextInfo(gameConfig.graphicsConfig)
        }
        if (this.engineConfig.eventConfig && this.contextInfo) {
            this.systems.push(new EventHandler(this.engineConfig.eventConfig)) 
        }
        
        if (this.engineConfig.physicsConfig) {
            this.systems.push(new PhysicsEngine(this.engineConfig.physicsConfig))
        }
        if (this.engineConfig.scriptingConfig) {
            this.systems.push( new ScriptingEngine(this.engineConfig.engineType))
        }
        
        if (systems) {
            for (let sys of systems) {
                this.systems.push(sys)
            }
        }
        if (this.engineConfig.collisionConfig) {
            this.systems.push(new CollisionSystem(this.engineConfig.collisionConfig))
        }
        
        if (this.engineConfig.graphicsConfig && this.contextInfo) {

            this.graphics = new GraphicsEngine(this.engineConfig.graphicsConfig, this.contextInfo)
            this.systems.push(this.graphics)
        }
        if (systems) {
            for (let sys of systems) {
                this.systems.push(sys)
            }
        }
        this.sceneManager = new SceneManager(this.engineConfig,this.engineConfig.sceneConfig, this.systems)
        this.running = true
        

        this.running = false

        /**
         * 
         
        document.documentElement.style.height = '100%'
        document.documentElement.style.width = '100%'
        document.body.style.height = "100%"
        document.body.style.width = "100%"
        document.body.style.margin = "0"
        this.setup()
        this.div = this.generateDiv(this.engineConfig.parent) ;
        this.running = false
        */
        
    }
    /**
    parseStyle(styleObject: Object):  string {
        let cssArray: string[] = Object.entries(styleObject).map(([k,v]) => k + ":" + v + ";")
        console.log(this.engineConfig.parent)
        return cssArray.join(" ")
    }
    */
    /**
    generateDiv(parent: string) {
        let div: HTMLDivElement = document.createElement('div')
        div.id = parent
        div.style.position = "absolute"
        div.style.height = "100%" 
        div.style.width = "100%"
        div.style.zIndex = "1"
        div.style.backgroundImage = "/images/test.jpg"
        div.appendChild(this.generateCanvas())
        document.body.appendChild(div)

        console.log("test")
        return div
    }
    generateCanvas(): HTMLElement {
        let canvas = document.createElement("CANVAS")
        canvas.id = this.canvasID
        console.log(this.parseStyle(this.engineConfig.style))
        console.log("Before")
        canvas.setAttribute('style', this.parseStyle(this.engineConfig.style))
        return canvas
    }
    getCtx() {
        let canvas = this.getCanvas()
        return canvas.getContext("2d")
    }
    getCanvas(): HTMLCanvasElement {
        let canvas = document.getElementById(this.canvasID)
        if (canvas instanceof HTMLCanvasElement) {
            return canvas
        } else {
            throw Error("engineCanvas should be a reserved id for DOM Components")
        }
        
    }
    
     * 
     
    setup() {
        let config = this.engineConfig
        if (true) {
            let image = new Image()
            image.src = "/images/test.jpg"
            image.style.position ="absolute"
            image.style.zIndex = "-1"
            image.style.width = "100%"
            image.style.height= "100%"

            document.body.appendChild(image)

        }
    }
    */
   
    start(dt: number): void {
        this.running = true
        console.log("Startng Engin ")
        let curr = this.sceneManager.getCurrentScene()
        
        for (let sys of this.systems) {


            let comp = this.sceneManager.getCurrentScene().engineComponents.set(sys.tag, sys.components)
            curr.engineComponents.set(sys.tag, sys.components)
            this.sceneManager.systemTag.set(sys.tag, sys)
            if (comp) {
                
 
            } else { 
                throw Error("error in start method")
            }
            
        }
            let config = curr.getSceneConfig()
            let entities = config.entities.length   
            for (let i = 0; i < entities; i++) {
                curr.addEntity(curr, config.entities[i])
            }

        if (this.engineConfig.engineType == EngineType.CLIENTONLY || this.engineConfig.engineType == EngineType.SOCKETCLIENT) {

            
            
            window.requestAnimationFrame((timestamp:number) => {
                
                
                let deltaTime = 0
                this.update(deltaTime)
                Engine.time += deltaTime 
                this.clientTime = timestamp
                
            })
        } else {
            
            setTimeout(() => {
                
                if (this.running) {
                    this.serverUpdate(0, dt)
                    this.serverTime = process.hrtime.bigint()
                }
                console.log("Timeout runout")

            }, dt)
            

        }
        
    }
    update(dt: number) {
            if (dt > 0 ) {
                
                for (let sys of this.systems) {
                    sys.update(dt)
                }
      
                
                console.log(dt)

                window.requestAnimationFrame((timestamp:number) => {
                
                    let currTime = timestamp
                    let deltaTime = currTime - this.clientTime
                    this.update(deltaTime)
                    Engine.time += deltaTime 
                    this.clientTime = currTime
                    
                })
            } else {
                window.requestAnimationFrame((timestamp:number) => {
                
                    let currTime = timestamp
                    let deltaTime = currTime - this.clientTime
                    this.update(deltaTime)
                    Engine.time += deltaTime 
                    this.clientTime = currTime
                    
                })
            }
            
            
    }
    serverUpdate(dt: number, timeout: number) {
        if (dt > 0) {
            console.log("updating")
            
            
            
            for (let sys of this.systems) {
                sys.update(dt)
            }
            
            
            
            setTimeout(() => {
                if (this.running) {
                    let currTime = process.hrtime.bigint()
                    let realDelta =  Number(currTime - this.serverTime) / 1000000
                    this.serverUpdate(Number(realDelta), timeout)
                    Engine.time += Number(realDelta)
                    this.serverTime = currTime
                    console.log(Engine.time) 
                }

            }, timeout)
             
        } else {
            setTimeout(() => { 
                if (this.running) {
                    let currTime = process.hrtime.bigint()
                    let realDelta =  (currTime - this.serverTime) / 1000000n
                    this.serverUpdate(Number(realDelta), timeout)
                    
                    Engine.time += Number(realDelta)
                    this.serverTime = currTime
                     
                }

            }, timeout)
        }
            
    }



}