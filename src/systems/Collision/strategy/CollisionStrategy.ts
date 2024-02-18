import { CollisionSystem } from "../CollisionSystem.js";
import { Collideable } from "../../../types/components.js";
import { System } from "../../../types/system.js";
import { Rectangle } from "../../../../../engine/src/types/components/collision/shape.js";

export interface CollisionStrategy {
    system: CollisionSystem
    deleted: Collideable[]
    update(dt: number): void
    registerComponent(component:Collideable): void
    deregisterComponent(component: Collideable): void
    query(rectangle: Rectangle): Collideable[]
}
export class NaiveCollision implements CollisionStrategy {
    system: CollisionSystem
    constructor(system:CollisionSystem) {
        this.system = system
    }
    query(rectangle: Rectangle): Collideable[] {
        throw new Error("Method not implemented.");
    }
    registerComponent(component: Collideable): void {

    }
    deregisterComponent(component: Collideable): void {

    }
    deleted: Collideable[] = [];

    update(dt: number): void {
        for (var [key1, col1] of this.system.components) {

            if (col1.visible) {
                for (var [key2, col2] of this.system.components) {
                    if (col2.visible && col1.checkCollision(col2) && col1 != col2) {
                        col1.collides(col2)
                    } else if (!col2.alive) {
                        this.deleted.push(col2)
                    }
                }
            }

            
        }
    }

}
export class SpatialHashGridStrategy implements CollisionStrategy{
    system: CollisionSystem;
    deleted: Collideable[];
    grid: SpatialHashGrid
    constructor(system: CollisionSystem) {
        this.system = system
        this.deleted = []
        this.system.config.bounds
        this.grid = new SpatialHashGrid(this.system.config.bounds, 5, 5)

    }
    query(rectangle: Rectangle): Collideable[] {
        throw new Error("Method not implemented.");
    }
    deregisterComponent(component: Collideable): void {

    }
    update(dt: number): void {
        
    }
    registerComponent(component: Collideable): void {
        throw new Error("Method not implemented.");
    }

}
class SpatialHashGrid {
    //grid: Collideable[][][]
    gridMap: Map<number, Collideable[]>
    xCell: number
    yCell: number
    bounds: {topX: number, topY:number, bottomX:number, bottomY:number}
    constructor(bounds: {topX: number, topY:number, bottomX:number, bottomY:number} = {topX: 0, topY: 0, bottomX: 100, bottomY: 100}, xCells: number, yCells: number) {
        this.gridMap = new Map<number, Collideable[]>()
        this.xCell = xCells
        this.yCell = yCells
        this.bounds = bounds
        for (let i = 0; i < xCells * yCells; i++) {
            this.gridMap.set(i, [])
        }

    }
    remove(collider: Collideable) {

    }
    update(colliders: Collideable[] ) {
        this.gridMap.clear()
        for (let collider of colliders) {
            this.add(collider)
        }
    }
    add(collider: Collideable) {
        const x = collider.boundingBox.pos.x
        const y =  collider.boundingBox.pos.y

        const len = collider.boundingBox.dim.length
        const height = collider.boundingBox.dim.height



        let cellIndices = this.getCellIndex(collider)
        for (let i of cellIndices) {

        }


    }
    getCellIndex(collider: Collideable) {

        return [1, 2]
    }
}