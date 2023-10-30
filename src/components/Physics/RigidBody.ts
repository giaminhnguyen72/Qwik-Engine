import { PhysicsEngine } from "../../systems/physics/PhysicsEngine.js";
import { Component, Forceable, Transformable } from "../../types/components.js"
import { Acceleration, Force, Position, Velocity } from "../../types/components/physics/transformType.js";
import { Entity } from "../../types/Entity.js";
import { System } from "../../types/system.js";
class RigidBody implements Forceable {
    system!: System<Component>
    pos: Position;
    vel:Velocity
    accel:Acceleration
    entity: number;
    engineTag: string = "PHYSICS";
    componentId?: number | undefined;
    force:Force = {x:0, y:0, z:0}
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
    copy<T>(): void {
        throw new Error("Method not implemented.");
    }
    visible: boolean = true;
    alive: boolean = true;
    
    applyForce(force: Force) {
        this.force.x += force.x
        this.force.y += force.y
        this.force.z += force.z
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        this.accel.x = this.accel.x / this.mass
        this.accel.y = this.accel.y / this.mass
        this.accel.z = this.accel.z / this.mass

        this.vel.x = this.vel.x  + this.accel.x * dt
        this.vel.y = this.vel.y  + this.accel.y * dt
        this.vel.z = this.vel.z  + this.accel.z * dt

        this.pos.x = this.pos.x  + this.vel.x * dt
        this.pos.y = this.pos.y  + this.vel.y * dt
        this.pos.z = this.pos.z  + this.vel.z * dt
    } 

}
