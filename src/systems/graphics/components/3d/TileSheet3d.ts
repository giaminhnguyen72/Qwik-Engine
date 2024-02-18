import { GRAPHICS_TAG } from "../../../../constants/componentType.js";

import { GraphicsEngine } from "../../GraphicEngine.js";


import { OrthographicCamera3d } from "./OrthographicCamera3d.js";


import { Component, Renderable,  } from "../../../../types/components.js";
import { Entity } from "../../../../types/Entity.js";
import { Scene } from "../../../../core/scene.js";
import { Transform } from "../../../physics/components/transform";

import { ContextInfo } from "../../../../core/context.js";
import { getTopX, getTopY, Rectangle } from "../../../..../../../types/components/collision/shape.js";


import { Position } from "../../../../../../engine/src/types/components/physics/transformType.js";
import { System } from "../../../../../../engine/src/types/system.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import { SpriteMaterial } from "three/src/materials/SpriteMaterial.js";
import { NearestFilter, RepeatWrapping, Sprite } from "three";

export class TileSheet3d implements Renderable {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    engineTag: string = GRAPHICS_TAG;
    componentId?: number | undefined;
    system!: GraphicsEngine;
    path: string 
    
    imageLength: number
    // Array of number of columns in each row
    // To get number of rows use numOfStates.length 

    constructor(path: string, rectangle: Rectangle,  imageLength: number) {
        
        this.path = path
        this.pos = rectangle.pos
        this.shape = rectangle

        this.imageLength = imageLength

        
        
    }

    unmount(): void {
        this.sprite.parent?.remove(this.sprite)
    }
    loaded: boolean  = false
    context!: ContextInfo;
    rendered: boolean= false;
    pos: Position;
    shape:Rectangle
    sprite!: Sprite
    material!:SpriteMaterial
    render(cam: OrthographicCamera3d): void {

    }
    create(path: string) {
        let loader =  new TextureLoader()
        let loaded = loader.load(this.path, (data) => {
            data.repeat.set(1/this.imageLength, 1)
            data.wrapS = RepeatWrapping
            data.wrapT = RepeatWrapping
            data.magFilter = NearestFilter
            let material = new SpriteMaterial({map: data})
            this.material = material

            let sprite = new Sprite(material)
            this.sprite = sprite
            this.loaded = true
            sprite.scale.set(this.shape.dim.length, this.shape.dim.height, 1)
            this.system.sceneGraph.add(sprite)
            

            
            //let box = new BoxGeometry(64,64,1)
            //let BoxMaterial = new MeshBasicMaterial({
            //    map: data
            //})
            //let mesh = new Mesh(box,BoxMaterial)

            //graphics.sceneGraph.add(mesh)


        
        }, () => {
            console.log("progressing")
        }, () => {
            throw new Error("Picture failed to load")
        })

    } 
    initialize(graphics: GraphicsEngine): void {
        
        this.create(this.path)




        
        //this.sprite.position.set(this.pos.x, this.shape.pos.y, this.shape.pos.z)


        //graphics.sceneGraph.add( cube );
        

        this.system = graphics
        
        
    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        if (this.loaded) {
            this.sprite.scale.set(this.shape.dim.length, this.shape.dim.height, 1)
        }
        
    }
    bindPos(element: {pos: Position}) {
        this.shape.pos = element.pos
    }
    bind(element: {shape: Rectangle}) {
        this.shape = element.shape
        this.pos = element.shape.pos
    }
    getRectangle() {
        return this.shape
    }
    copy(component: TileSheet3d): void {
        this.entity = component.entity
        this.visible = component.visible
        this.alive = component.alive
        this.componentId = component.componentId

        
        this.rendered = component.rendered

        this.pos.x = component.pos.x
        this.pos.y = component.pos.y
        
        this.pos.z = component.pos.z

        


    }
    toJSON() {
        return {

                entity: this.entity,
                componentId: this.componentId,
                
                pos: {x: Math.floor(this.pos.x),y: Math.floor(this.pos.y), z: Math.floor(this.pos.z)},
                visible: this.visible,
                alive: this.alive,
                rendered: this.rendered
        }
    }

}