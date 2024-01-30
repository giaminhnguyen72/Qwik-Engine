
import { Transform } from "./components/transform.js";
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
    sceneManager!: SceneManager;
    constructor(config: PhysicsConfig) {
        this.components = new Map<number, Transformable>()
        this.config = config
    }
    register(comp: Transformable, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {

            comp.system = this
            comp.componentId = id
            this.components.set(id, comp)
        } else {
            comp.system = this
            this.components.set(comp.componentId, comp)
        }
    }
    query<T extends Transformable>(type: {new(...args: any[]) : T}) {
        let arr: T[] = []
        for (let physComponents of this.components) {
            if (physComponents instanceof type) {
                arr.push(physComponents)
            }
            
        }
        return arr

    }
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            
       }
    
    }
    
    
    update(dt: number): void {
        //console.log("Physics engine running")
        //console.log("Physics Components: " + this.components.size)
        for (let comp of this.components) {


            comp[1].update(dt)
            if (!this.config.isInfinite && comp[1].pos.x < this.config.worldBorder.xMin) {
                comp[1].pos.x = this.config.worldBorder.xMin
            } else if (!this.config.isInfinite && comp[1].pos.x > this.config.worldBorder.xMax) {
                comp[1].pos.x = this.config.worldBorder.xMax
            }
            if (!this.config.isInfinite && comp[1].pos.y < this.config.worldBorder.yMin) {
                comp[1].pos.y = this.config.worldBorder.yMin
            } else if (!this.config.isInfinite && comp[1].pos.y > this.config.worldBorder.yMax) {
                comp[1].pos.y = this.config.worldBorder.yMax
            }
            if (!this.config.isInfinite && comp[1].pos.z < this.config.worldBorder.zMin) {
                comp[1].pos.z = this.config.worldBorder.zMin
            } else if (!this.config.isInfinite && comp[1].pos.z > this.config.worldBorder.zMax) {
                comp[1].pos.z = this.config.worldBorder.zMax   
            }
            
        }
        while (this.deleted.length > 0 ) {
            let comp = this.deleted.pop()
            this.components.delete(comp?.componentId as number)
        }

    }
    getGravity() {
        
        return this.config.gravity
    }

    
}