
import { PhysicsEngine } from "../../systems/physics/PhysicsEngine.js"
import { Component, Transformable } from "../../types/components.js"
import { Acceleration, Position, Velocity } from "../../types/components/physics/transformType.js"
import { Entity } from "../../types/Entity.js"
import { System } from "../../types/system.js"

export class Transform implements Transformable {
    pos: Position
    vel: Velocity
    accel: Acceleration
    entity: number
    componentId?: number
    visible: boolean = true
    alive: boolean = true
    system!: System<Component>
    readonly engineTag: string = "PHYSICS"
    constructor(
                entity: number,
                pos: Position={x:0, y: 0, z: 0},
                vel: Velocity={x:0, y: 0, z: 0},
                accel: Acceleration={x:0,y:0,z:0}
                ) 
        {
            
        this.entity = entity
        this.pos = pos
        this.vel = vel
        this.accel = accel


    }
    copy(transform: Transform): void {
        
        this.pos.x = transform.pos.x
        this.pos.y = transform.pos.y
        this.pos.z = transform.pos.z

        this.vel.x = transform.vel.x
        this.vel.y = transform.vel.y
        this.vel.z = transform.vel.z

        this.accel.x = transform.accel.x
        this.accel.y = transform.accel.y
        this.accel.z = transform.accel.z

        this.entity = transform.entity
        this.componentId = transform.componentId
        this.visible = transform.visible
        this.alive = transform.alive
        
    }
    
    
    update(dt: number): void {
        console.log("Position is: " + this.pos.x + " and " + this.pos.y)
        this.vel.x = this.vel.x  + this.accel.x * dt
        this.vel.y = this.vel.y  + this.accel.y * dt
        this.vel.z = this.vel.z  + this.accel.z * dt

        this.pos.x = this.pos.x  + this.vel.x * dt
        this.pos.y = this.pos.y  + this.vel.y * dt
        this.pos.z = this.pos.z  + this.vel.z * dt
    }
    toJSON() {
        return {
            pos: this.pos,
            vel: this.vel,
            accel: this.accel,
            entity: this.entity,
            componentId: this.componentId,
            visible:  this.visible,
            alive: this.alive,
            engineTag: "PHYSICS"
        }
    }
    
}
