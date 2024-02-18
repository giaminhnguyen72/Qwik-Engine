import { CollisionConfig } from "../../core/config.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { Collideable } from "../../types/components.js";
import { Rectangle } from "../../types/components/collision/shape.js";
import { System } from "../../types/system.js";
import { CollisionStrategy, NaiveCollision } from "./strategy/CollisionStrategy.js";
import { QuadTreeStrategy } from "./strategy/QuadTreeStrategy.js";
export class CollisionSystem implements System<Collideable> {
    tag: string = "COLLISION";
    components: Map<number, Collideable>;
    config: CollisionConfig
    deleted: Collideable[]
    sceneManager!: SceneManager;
    collisionStrategy: CollisionStrategy 
    bounds?: {topX: number, topY: number, bottomX: number, bottomY: number, wallCollide: (colider:Collideable)=>void}
    constructor(sceneManager: SceneManager, config: CollisionConfig) {
        this.components = new Map<number, Collideable>()
        this.config = config
        this.deleted = []
        this.sceneManager = sceneManager
        if (config.bounds) {
            this.bounds = config.bounds
        }
        this.collisionStrategy = new QuadTreeStrategy(this)
        
    }
    register(comp: Collideable,id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {

            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
        } else {
            comp.system = this
            this.components.set(comp.componentId, comp)
        }
        this.collisionStrategy.registerComponent(comp)
        
    }
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
       }
    
    
    }
    
    update(dt: number): void {
        //console.log("Collision System Running")
        //console.log("Collision Components: " + this.components.size)
        this.collisionStrategy.update(dt)
        
        while (this.deleted.length > 0) {
            let popped = this.deleted.pop()
            if (popped) {
                this.deleteComponent(popped)
                this.collisionStrategy.deregisterComponent(popped)
            }
            
        }

    }
    deleteComponent(col: Collideable) {
        if (col.componentId) {
            this.components.delete(col.componentId)
        }


    }
    collisionQuery(rect: Rectangle) {
        
    }

}