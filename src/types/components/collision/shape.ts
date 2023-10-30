import { Position } from "../physics/transformType.js"

export interface Shape {
    pos: Position

}
export interface Rectangle extends Shape {
    pos: Position
    rot: number
    dim: {length:number, height: number}
}
export function rectangleCopy(receiver: Rectangle, sender: Rectangle) {
        receiver.dim.height = sender.dim.height
        receiver.dim.length = sender.dim.length
        
        receiver.pos.x = sender.pos.x
        receiver.pos.y = sender.pos.y
        receiver.pos.z = sender.pos.z
        receiver.rot = sender.rot
}
export interface Circle extends Shape {
    pos: Position
    radius: number
}
export interface Polygon extends Shape {
    pts: number[]
    pos: Position
    rot: number

}
export interface Click extends Shape {
    pos:Position

}
export function getTopX(rectangle: Rectangle) {
    
    return rectangle.pos.x - rectangle.dim.length / 2
}
export function getTopY(rectangle: Rectangle) {
    return rectangle.pos.y - rectangle.dim.height / 2
}