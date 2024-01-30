import { Circle, Rectangle } from "../../../types/components/collision/shape.js"
import { BoxCollider, CircleCollider } from "../components/Collider.js";

export function RectangleRectangleCollisionHandler(boxCollider:BoxCollider, rectangle: Rectangle) {
    var ret: boolean = false
    var rect = boxCollider.shape
    if (rect.rot == 0 && rectangle.rot == 0) {
        if (
            rect.pos.x + rect.dim.length > rectangle.pos.x &&
            rect.pos.x <  rectangle.pos.x +rectangle.dim.length &&
            rect.pos.y + rect.dim.height > rectangle.pos.y &&
            rect.pos.y < rectangle.pos.y + rectangle.dim.height 

        ) {
            return true
        } else {
            return false
        }
    } else {

    }
    return ret
}
export function RectangleCircleCollisionHandler(boxColider: BoxCollider, circle: Circle) {
    
}
export function CircleRectangleCollisionHandler(boxColider:CircleCollider, rectangle: Rectangle) {
    
}
export function CircleCircleCollisionHandler(circleColider: CircleCollider, circle: Circle) {
    
}