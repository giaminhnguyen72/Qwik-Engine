import { GraphicsEngine } from "../../../../../engine/src/systems/graphics/GraphicEngine.js";
import { QuadTree } from "../../../../../engine/src/structs/Quadtree.js";

import { CollisionStrategy } from "./CollisionStrategy.js";
import { Collideable } from "../../../../../engine/src/types/components.js";
import { CollisionSystem } from "../CollisionSystem.js";
import { Rectangle } from "../../../../../engine/src/types/components/collision/shape.js";

export class QuadTreeStrategy implements CollisionStrategy {
    quadtree: QuadTree<Collideable>
    registeredElements: Map<number, Collideable> = new Map()
    system: CollisionSystem;
    deleted: Collideable[] = [];
    constructor(collision: CollisionSystem) {
        this.system = collision
        let currScene = this.system.sceneManager.getCurrentScene()
        let rectangle: Rectangle = {
            pos: {x: 0, y:0, z: 0},
            rot: 0,
            dim: {
                length: currScene.worldBounds.xMax - currScene.worldBounds.xMin,
                height: currScene.worldBounds.yMax - currScene.worldBounds.yMin
            }
        }
        this.quadtree = new QuadTree(rectangle)


    }
    query(rectangle: Rectangle): Collideable[] {
        return this.quadtree.query(rectangle)
    }
    update(dt: number): void {

        for (let i of this.registeredElements.values()) {

            if (i.visible) {
                this.quadtree.insert(i)
            }
            
            //console.log("THis element is mapped: " + i.componentId)
        }
        let arr = [...this.registeredElements.values()]
        if (arr.length < 2) {
            return
        }
        let intersections = this.quadtree.findAllIntersections()
        for (let i of intersections) {
            if (i[0].checkCollision(i[1])) {
                i[0].collides(i[1])
                i[1].collides(i[0])
            }
        }

        this.quadtree.clear()
    }
    registerComponent(component: Collideable): void {
        this.registeredElements.set(component.componentId as number, component)
    }
    deregisterComponent(component: Collideable): void {
        this.registeredElements.delete(component.componentId as number)
    }


    clear(): void {
        this.quadtree.clear()
    }
} 
function intersects( box1: Rectangle, box2: Rectangle): boolean
    {
        let box1Right = box1.pos.x + box1.dim.length / 2
        let box1Left = box1.pos.x - box1.dim.length / 2
        let box1Up = box1.pos.y - box1.dim.height / 2
        let box1Down = box1.pos.y + box1.dim.height / 2


        let box2Right = box2.pos.x + box2.dim.length / 2
        let box2Left = box2.pos.x - box2.dim.length / 2
        let box2Up = box2.pos.y - box2.dim.height / 2
        let box2Down = box2.pos.y + box2.dim.height / 2
        return !(box2Left >= box1Right || box2Right <= box1Left ||
            box2Up <= box1Up || box1Down <= box2Down);
    }
    // box 1 contained in box2
    function contains( box1: Rectangle, box2: Rectangle): boolean
    {
        let box1Right = box1.pos.x + box1.dim.length / 2
        let box1Left = box1.pos.x - box1.dim.length / 2
        let box1Up = box1.pos.y - box1.dim.height / 2
        let box1Down = box1.pos.y + box1.dim.height / 2


        let box2Right = box2.pos.x + box2.dim.length / 2
        let box2Left = box2.pos.x - box2.dim.length / 2
        let box2Up = box2.pos.y - box2.dim.height / 2
        let box2Down = box2.pos.y + box2.dim.height / 2
        return (box2Left <= box1Left && box1Right <= box1Right &&
            box2Up <= box1Up && box2Down <= box1Down);
    }