
import { Server, Socket } from "socket.io"
import { Socket as SocketClient } from "socket.io-client"
import { EngineType } from "../constants/engineType.js"
import { Collideable, Component } from "../types/components.js"
import { Vector3 } from "../types/components/physics/transformType.js"
import { Entity } from "../types/Entity.js"
import { System } from "../types/system.js"
import { SocketManager } from "../systems/MultiplayerClient/SocketManager.js"
import { Scene, Stage } from "./scene.js"

/**
 * Describes the CSS properties of the canvas element
 * 
 */
export class PhysicsConfig {
    gravity: Vector3
    is3d: boolean
    isInfinite: boolean
    worldBorder: {
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number,
        zMin: number,
        zMax: number
    }
    constructor(
        gravity: Vector3 = {x: 0, y: 0, z: 0}, 
        is3d: boolean = true,
        isInfinite: boolean = true,
        worldBorder = {
            xMin: -256,
            xMax: 256,
            yMin: -256,
            yMax: 256,
            zMin: -256,
            zMax: 256
        },
        
    )
    {
        this.gravity = gravity
        this.is3d = is3d
        this.worldBorder = worldBorder
        this.isInfinite = isInfinite
    }
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
    sceneConfig: Scene[]
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
    engineType: EngineType = EngineType.CLIENTONLY
}

export class SocketServerConfig {
    server?: Server
    roomId?: string
    buffer: number = 100
    delay: number = 100
    socketEventMap?: {[key: string ]: (id: string, event: string[], socket: Socket) => void}
    socketPrev?: (event: string[], socket: Server) => void
    
    
}


export interface SocketClientConfig {
    socketEventMap: (socket: SocketClient) => void

}