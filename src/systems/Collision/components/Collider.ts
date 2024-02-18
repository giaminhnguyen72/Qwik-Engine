'use strict'
import { CollisionSystem } from "../CollisionSystem.js";
import { Collideable, Component } from "../../../types/components.js";
import { Shape, Rectangle } from "../../../types/components/collision/shape.js";
import { Position, Vector3 } from "../../../types/components/physics/transformType.js";
import { Entity } from "../../../types/Entity.js";

import { Transform } from "../../physics/components/transform.js";


export class BoxCollider implements Collideable {
    entity!: number;
    engineTag: string = "COLLISION";
    componentId?: number | undefined;
    prev: Position
    collideType: string;
    shape: Rectangle
    system!: CollisionSystem;
    boundingBox: Rectangle
    onCollision: (otherCollider: Collideable) => void
    constructor( shape: Rectangle= {pos:{x:0, y:0, z:0}, dim: {length: 0, height: 0}, rot: 0}, onCollision: (otherCollider: Collideable) => void) {

        this.collideType = "Box"
        this.shape = shape
        this.prev = {
            x: shape.pos.x,
            y: shape.pos.y,
            z: shape.pos.z
        }
        this.boundingBox= this.shape
        this.onCollision = onCollision
    }
    getRectangle(): Rectangle {
        return this.boundingBox
    }
    copy<T>(collider: BoxCollider): void {
        if (collider.entity) {
            this.entity = collider.entity
        }


        this.alive = collider.alive
        this.collideType = collider.collideType
        this.componentId = this.componentId
        this.engineTag = this.engineTag
        this.shape.dim.height = collider.shape.dim.height
        this.shape.dim.length = collider.shape.dim.length
        
        this.shape.pos.x = collider.shape.pos.x
        this.shape.pos.y = collider.shape.pos.y
        this.shape.pos.z = collider.shape.pos.z
        this.shape.rot = collider.shape.rot
        this.visible =  collider.visible
        
        
        
    }
    visible: boolean = true;
    alive: boolean = true;

    bind(element: {shape: Rectangle}, posOffset: {x: number, y: number, z: 0}, dimOffset: {x:number }) {
        this.shape = element.shape
    }
    bindPos(element: {pos: Vector3}) {
        this.shape.pos = element.pos
    }
    checkCollision(collider: Collideable): boolean {

        let doesCollide = false
        let ret: boolean = false
        if (collider instanceof BoxCollider) {
            

            let rect = collider.shape
            let rectangle = this.shape
            if (rect.rot == 0 && rectangle.rot == 0) {
                let rectX = rect.pos.x - rect.dim.length / 2
                let rectY = rect.pos.y - rect.dim.height / 2

                let rectangleX = rectangle.pos.x - rectangle.dim.length / 2
                let rectangleY = rectangle.pos.y - rectangle.dim.height / 2
                if (
                    rectX + rect.dim.length > rectangleX &&
                    rectX <  rectangleX + rectangle.dim.length &&
                    rectY + rect.dim.height > rectangleY &&
                    rectY < rectangleY + rectangle.dim.height 
        
                ) {
                    return true
                } else {
                    return false
                }
            } else {

            }
            
            
        } else {

        }
        return ret
    }

    collides(collider: Collideable): void {
        
        this.onCollision(collider)
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

        this.prev.x = this.shape.pos.x
        this.prev.y = this.shape.pos.y
        this.prev.z = this.shape.pos.z

        
    }
    toJSON() {
        return {
            entity: this.entity,
            engineTag: this.engineTag,
            componentId: this.componentId,
            prev: this.prev,
            collideType: this.collideType,
            shape: this.shape,
            boundingBox: this.boundingBox,
            visible: this.visible,
            alive: this.alive,
        }
    }


    
}
function Copy(curr:BoxCollider, next: BoxCollider) {
    curr.prev= next.prev
}
export class CircleCollider implements Collideable {
    entity: number = -1
    engineTag: string = "COLLISION";
    componentId?: number | undefined;
    collideType: string;
    shape: Rectangle
    system!: CollisionSystem
    boundingBox: Rectangle
    onCollision: (otherCollider: Collideable) => void
    constructor(entity: number,  pos: Position, onCollision: (otherCollider: Collideable) => void) {
        this.entity = entity

        this.collideType = "Box"
        this.shape = {
            pos: pos,
            dim: { length: 20, height: 20},
            rot: 0
        }
        this.boundingBox = this.shape
        this.onCollision = onCollision
        this.boundingBox = this.shape
    }
    getRectangle(): Rectangle {
        return this.boundingBox
    }
    copy<T>(): void {
        throw new Error("Method not implemented.");
    }
    visible: boolean = true;
    alive: boolean = true;
    
    checkCollision(collider: Collideable): boolean {
        var doesCollide = false
        return false
    }
    collides(collider: Collideable): void {
        this.onCollision(collider)
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        
    }


    
}