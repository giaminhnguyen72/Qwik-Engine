
import { Transform } from "../systems/physics/components/transform.js"
import { EngineType } from "../constants/engineType.js"
import { ContextInfo } from "../core/context.js"
import { CollisionSystem } from "../systems/Collision/CollisionSystem.js"
import { EventHandler } from "../systems/events/EventHandler.js"
import { GraphicsEngine } from "../systems/graphics/GraphicEngine.js"
import { PhysicsEngine } from "../systems/physics/PhysicsEngine.js"
import { Shape, Rectangle } from "./components/collision/shape.js"
import { Acceleration, Force, Position, Vector3, Velocity } from "./components/physics/transformType.js"
import { Entity} from "./Entity.js"
import { EventSystem, System } from "./system.js"
import { Camera } from "../systems/graphics/components/2d/Camera.js"


export interface Component {
    
    entity?: number
    visible: boolean
    alive: boolean
    engineTag: string
    componentId?: number
    system: System<Component>
    

    copy(component: Component):void
    
    
}
export interface Renderable extends Component {
    context: ContextInfo
    rendered: boolean
    pos: Position
    render(camera: Camera): void
    initialize: ((graphicsEngine: GraphicsEngine)=>  void  )
    update(dt: number, ctx?: CanvasRenderingContext2D): void
    getRectangle(): Rectangle
    unmount(): void
    
}

/**
 * Entity 
 *      Component[] -> updated by system
 *      Renderable[] -> updated by graphics - has render method
 *      
 */


 export interface Collideable extends Component{
    collideType: string
    shape: Shape
    boundingBox: Rectangle
    collides(collider: Collideable): void
    checkCollision(collider: Collideable):boolean
    update(dt: number, ctx?: CanvasRenderingContext2D): void
    getRectangle(): Rectangle
    
}
export interface Listenable extends Component{

    initialize(system: System<Component>): void
    getEventType(): string
    update(dt: number, ctx?: CanvasRenderingContext2D): void
}
export interface Listener<T extends EngineEvent> extends Listenable {
    initialize(system: EventSystem<T>): void
    execute(event: T): void
    getEvents(): Map<string, (evnt: T)=> void>
}
export interface SocketListener<T extends EngineEvent> extends Listenable {
    entityTag: string
    index: number
    initialize(system: EventSystem<T>): void
    execute(event: T): void
    getEvents(): Map<string, (evnt: T)=> void>
    clone(): SocketListener<T>
}
export interface Emitter<T extends EngineEvent> extends Listenable {
    
    initialize(system: EventSystem<T>): void
    addListener(component: Listener<T>):void 

    update(dt: number): void
    removeListener(id: number): void
    getListeners(): Iterable<Listener<T>>
}
export interface EngineEvent {

}
export interface Transformable extends Component {
    pos:Vector3
    vel:Vector3
    
    accel:Vector3
    update(dt: number, ctx?: CanvasRenderingContext2D): void
}
export interface Forceable extends Transformable {
    mass: number
    force: Force
}
export interface DomElement extends Renderable {
    style: string
    element: HTMLElement
    unmount():void 
}
