import { ContextInfo } from "../../../../core/context.js";
import { GraphicsEngine } from "../../GraphicEngine.js";
import { Component, Renderable } from "../../../../types/components.js";
import { Rectangle } from "../../../../types/components/collision/shape.js";
import { Position, Vector3 } from "../../../../types/components/physics/transformType.js";
import { Entity } from "../../../../types/Entity.js";
import { System } from "../../../../types/system.js";
import { Transform } from "../../../physics/components/transform.js";
import * as THREE from "three";
import { OrthographicCamera3d } from "./OrthographicCamera3d.js";
import { Object3D } from "three";

export class UIComponent implements Renderable {
    context!: ContextInfo;
    
    system!: GraphicsEngine;
    entity!: number;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = "GRAPHICS";
    componentId?: number | undefined;

    pos: Position
    height: number
    width:number
    parent: Renderable & {component: Object3D}
    children: (Renderable & {component: Object3D})[] = []
    plane!: THREE.Mesh
    binded: boolean = false
    alignment: number = 0
    constructor(width: number=-1, height: number = -1, curr: Position={x:0,y:0,z:-1} , camera: Renderable & {component: Object3D}, alignment: number =0 ) {
        
        this.height = height
        this.width = width
        this.pos= curr
        this.pos.z = 0
        let bounds = camera.getRectangle()
        if (alignment == 0) {
            this.pos.y = this.pos.y - bounds.dim.height / 2 + this. height /2
        }
        let boundingWidth = bounds.dim.length
        let boundingHeight = bounds.dim.height
        let left = this.pos.x - this.width / 2
        let right = this.pos.x + this.width / 2
        let top = this.pos.y + this.height / 2
        let bottom = this.pos.y - this.height / 2
        
        this.parent = camera



        
    }
    unmount(): void {
        this.parent.component.parent?.remove(this.parent.component)
    }
    getRectangle(): Rectangle {
        return {
            pos: this.pos,
            dim: {
                height: this.height,
                length: this.width,
            },
            rot: 0
        }
    }
    rendered: boolean = false;
    copy<T>(camera: UIComponent): void {
        this.entity = camera.entity
        this.pos.x = camera.pos.x
        this.pos.y = camera.pos.y
        this.pos.z = camera.pos.z

        this.componentId = camera.componentId
        this.width =camera.width
        this.height =camera.height
        this.visible = camera.visible
        this.alive = camera.alive
        this.rendered = camera.rendered
    }
    bindPos(element: {pos: Vector3}) {

        this.pos = element.pos

    }

    initialize(graphics: GraphicsEngine): void {
        let planeGeo = new THREE.PlaneGeometry(this.width, this.height)
        const material = new THREE.MeshBasicMaterial( {color: 0x42280E, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( planeGeo, material );
        this.plane = plane
        

        
        


    }
    update(dt: number): void {

        if (this.parent && !this.binded) {
            this.parent.component.add(this.plane)
            this.binded = true
        }
        
        
        this.plane.position.set(this.pos.x, this.pos.y, 0)

    
        


        
        
    }
    render(): void {
        
        
    }
    renderCamera(array: Renderable[]): void {
        if (this.visible) {
            console.log("rendering orthographic")
            
            
        //console.log("Camera is rendered " + items.length + "elements")

        
        }
        
    }
    toJSON() {
        return {
            entity: this.entity,
        
            componentId: this.componentId,
            width: this.width,
            height: this.height,
            visible: this.visible,
            alive: this.alive,

            rendered: this.rendered,
            pos: this.pos,


        }
    }
    
}