
import { PhysicsEngine } from "../PhysicsEngine.js"
import { Component, Transformable } from "../../../types/components.js"
import { Vector3 } from "../../../types/components/physics/transformType.js"
import { Entity } from "../../../types/Entity.js"
import { System } from "../../../types/system.js"

export class Transform implements Transformable {
    pos: Vector3
    vel: Vector3
    accel: Vector3
    entity!: number
    componentId?: number
    visible: boolean = true
    alive: boolean = true
    system!: System<Component>
    readonly engineTag: string = "PHYSICS"
    constructor(

                pos: Vector3={x:0, y: 0, z: 0},
                vel: Vector3={x:0, y: 0, z: 0},
                accel: Vector3={x:0,y:0,z:0}
                ) 
        {
            

        this.pos = pos
        this.vel = vel
        this.accel = accel


    }
    moveTowards(targetPosition: Vector3, dt: number, speed: number, radius: number = 0) {
        
        let velNorm = {
            x: targetPosition.x - this.pos.x,
            y: targetPosition.y - this.pos.y,
            z: 0
        }
        // Distance
        let normalPos = Math.sqrt(velNorm.x* velNorm.x +velNorm.y*velNorm.y)
        if (normalPos >= radius ) {
            if (normalPos > 0) {
                velNorm.x /= normalPos
                velNorm.y /= normalPos
            } else {
                velNorm.x = 0
                velNorm.y = 0
            }
            
    
            velNorm.x *= speed
            velNorm.y *= speed
    
            this.pos.x += velNorm.x *dt
            this.pos.y += velNorm.y *dt
            return velNorm
        } else {
            return this.pos
        }

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
        if (this.vel.x > 0 || this.vel.x < 0) {
            console.log("updatinh " + this.componentId)
        }
        this.vel.x = this.vel.x  + this.accel.x * dt
        this.vel.y = this.vel.y  + this.accel.y * dt
        this.vel.z = this.vel.z  + this.accel.z * dt

        this.pos.x = this.pos.x  + this.vel.x * dt
        this.pos.y = this.pos.y  + this.vel.y * dt
        this.pos.z = this.pos.z  + this.vel.z * dt
    }
    toJSON() {

        return {
            pos: {x: Math.floor(this.pos.x),y: Math.floor(this.pos.y), z: Math.floor(this.pos.z)},
            vel: this.vel,
            accel: this.accel,
            entity: this.entity,
            componentId: this.componentId,
            visible:  this.visible,
            alive: this.alive
        }
    }
    
}
