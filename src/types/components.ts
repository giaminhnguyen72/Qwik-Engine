
import { Transform } from "../components/Physics/transform.js"
import { EngineType } from "../constants/engineType.js"
import { ContextInfo } from "../core/context.js"
import { CollisionSystem } from "../systems/Collision/CollisionSystem.js"
import { EventHandler } from "../systems/events/EventHandler.js"
import { GraphicsEngine } from "../systems/graphics/GraphicEngine.js"
import { PhysicsEngine } from "../systems/physics/PhysicsEngine.js"
import { Shape, Rectangle } from "./components/collision/shape.js"
import { Acceleration, Force, Position, Velocity } from "./components/physics/transformType.js"
import { Entity} from "./Entity.js"
import { EventSystem, System } from "./system.js"

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
    transform: Position
    render(strategyArr: Iterable<any>): void
    initialize(graphicsEngine: GraphicsEngine): void
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
    
}
export interface Listenable extends Component{

    eventMap?: Map<string, () => void>
    initialize(system: EventSystem): void
    getEventType(): string
    update(dt: number, ctx?: CanvasRenderingContext2D): void
}
export interface Listener<T extends EngineEvent> extends Listenable {
    initialize(system: EventSystem): void
    execute(event: T): void
    getEventType(): string
    getEvents(): Map<string, (evnt: T)=> void>
}
export interface Emitter<T extends EngineEvent> extends Listenable {
    
    initialize(system: EventSystem): void
    addListener(component: Listener<T>):void
    getEventType(): string
    update(dt: number): void
}
export interface EngineEvent {

}
export interface Transformable extends Component {
    pos:Position
    vel:Velocity
    
    accel:Acceleration
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
