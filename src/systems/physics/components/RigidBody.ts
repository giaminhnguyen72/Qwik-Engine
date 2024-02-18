import { PhysicsEngine } from "../PhysicsEngine.js";
import { Component, Forceable, Transformable } from "../../../types/components.js"
import { Acceleration, Force, Position, Vector3, Velocity } from "../../../types/components/physics/transformType.js";
import { Entity } from "../../../types/Entity.js";
import { System } from "../../../types/system.js";
class RigidBody implements Forceable {
    system!: PhysicsEngine
    pos: Vector3
    vel:Vector3
    accel:Vector3
    entity: number;
    engineTag: string = "PHYSICS";
    componentId?: number | undefined;
    force:Vector3 = {x:0, y:0, z:0}
    mass: number
    constructor(entity: number, mass: number,
        pos: Position={x:0, y: 0, z: 0},
        vel: Velocity={x:0, y: 0, z: 0},
        accel: Acceleration={x:0,y:0,z:0}) {
        if (mass < 0) {
            this.mass = 1
        } else {
            this.mass = mass
        }
        this.entity = entity
        this.pos = pos
        this.vel = vel
        this.accel = accel

    }
    copy(component: RigidBody): void {
        this.componentId = component.componentId
        this.entity = component.entity
        this.mass = component.mass

        this.force.x = component.force.x
        this.force.y = component.force.y
        this.force.z = component.force.z
        
        this.accel.x = component.accel.x
        this.accel.y = component.accel.y
        this.accel.z = component.accel.z

        this.vel.x = component.vel.x
        this.vel.y = component.vel.y
        this.vel.z = component.vel.z
        this.visible = component.visible
        this.alive = component.alive
    }
    visible: boolean = true;
    alive: boolean = true;
    
    applyForce(force: Force) {
        this.force.x += force.x
        this.force.y += force.y
        this.force.z += force.z
    }
    lerp(targetPos: Vector3, dt: number) {
        
    }
    moveTowards(targetPosition: Vector3, dt: number, speed: number, radius: number = 0.05) {
        
        let velNorm = {
            x: targetPosition.x - this.pos.x,
            y: targetPosition.y - this.pos.y,
            z: targetPosition.z
        }
        let normalPos = Math.sqrt(velNorm.x**2 +velNorm.y**2)
        velNorm.x /= normalPos
        velNorm.y /= normalPos

        velNorm.x *= speed
        velNorm.y *= speed

        this.pos.x += velNorm.x *dt
        this.pos.y += velNorm.y *dt
        return velNorm
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        

        this.accel.x = this.force.x / this.mass
        this.accel.y = this.force.y / this.mass
        this.accel.z = this.force.z / this.mass

        this.vel.x = this.vel.x  + this.accel.x * dt
        this.vel.y = this.vel.y  + this.accel.y * dt
        this.vel.z = this.vel.z  + this.accel.z * dt

        this.pos.x = this.pos.x  + this.vel.x * dt
        this.pos.y = this.pos.y  + this.vel.y * dt
        this.pos.z = this.pos.z  + this.vel.z * dt

        this.force.x = 0
        this.force.y = 0
        this.force.z = 0
    } 

}
