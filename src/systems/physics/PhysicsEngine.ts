
import { Transform } from "../../components/Physics/transform.js";
import { PHYSICS_TAG } from "../../constants/componentType.js";
import { PhysicsConfig } from "../../core/config.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { Component, Transformable } from "../../types/components.js";
import { System } from "../../types/system.js";

export class PhysicsEngine implements System<Transformable>{
    components: Map<number, Transformable>;
    tag: string = PHYSICS_TAG
    config: PhysicsConfig
    deleted: Component[] = []
    constructor(config: PhysicsConfig) {
        this.components = new Map<number, Transformable>()
        this.config = config
    }
    register(comp: Transformable, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {
            comp.system = this
            this.components.set(id, comp)
        } else {
            comp.system = this
            this.components.set(comp.componentId, comp)
        }
    }
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            console.log(deleted.entity + " s Component with id " +  deleted.componentId + "is popped")
       }
    
    }
    
    
    update(dt: number): void {
        console.log("Physics engine running")
        console.log("Physics Components: " + this.components.size)
        for (let comp of this.components) {

            comp[1].update(dt)
            
        }
        while (this.deleted.length > 0 ) {
            let comp = this.deleted.pop()
            this.components.delete(comp?.componentId as number)
        }

    }
    
}