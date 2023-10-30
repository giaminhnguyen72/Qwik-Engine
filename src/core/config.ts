
import { Server, Socket } from "socket.io"
import { Socket as SocketClient } from "socket.io-client"
import { EngineType } from "../constants/engineType.js"
import { Collideable, Component } from "../types/components.js"
import { Entity } from "../types/Entity.js"
import { System } from "../types/system.js"
import { SocketManager } from "./managers/SocketManager.js"
import { Scene, Stage } from "./scene.js"

/**
 * Describes the CSS properties of the canvas element
 * 
 */
export class PhysicsConfig {

}
export class GraphicsConfig {
    parent: string
    style: Object
    background?:string
    canvasID: string
    width: number
    height: number
    constructor(
        parent: string="engineDiv",
        canvasID: string ="engineCanvas",
        style:Object={},
        background?: string,
        width: number=1000,height:number=500 
    ) {
        this.width = width
        this.height = height
        this.parent = parent
        this.canvasID = canvasID
        this.style = style
        this.background = background
    }

}
export interface EngineConfig {

    engineType: EngineType
    graphicsConfig?: GraphicsConfig
    physicsConfig?: PhysicsConfig
    sceneConfig?: Stage[]
    eventConfig?: EventConfig
    collisionConfig?: CollisionConfig
    scriptingConfig?: ScriptingConfig

    socketServerConfig?: SocketServerConfig
    socketClientConfig?: SocketClientConfig
    system?: System<Component>[]

}


export class SceneConfig {
    
    entities: Entity[]

    constructor(entities: Entity[] =[]) {

        this.entities = entities

    }

}
export class EventConfig {
    keyboard: boolean
    mouse: boolean
    constructor(keyboard:boolean, mouse: boolean) {
        this.keyboard = keyboard
        this.mouse = mouse
    }
}
export class CollisionConfig {
    bounds?: {topX: number, topY: number, bottomX: number, bottomY: number, wallCollide: (colider: Collideable) => void}
}
export class ScriptingConfig {
    
}
export class SocketServerConfig {
    server?: Server
    roomId?: string
    socketEventMap?: {[key: string ]: (id: string, event: string[], socket: Socket) => void}
    socketPrev?: (event: string[], socket: Server) => void
    
    
}


export interface SocketClientConfig {
    socketEventMap: (socket: SocketClient) => void
    entityFactoryMap: Map<string, () => Entity>
}