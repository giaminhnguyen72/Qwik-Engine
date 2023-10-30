import { Component } from "./components"
import { Scene } from "../core/scene"

export interface Drawable {
    depth: number
    draw(): void 
}

export interface Entity {
    components: Component[]
    id?: number
    scene?: Scene
    className: string
    
}
export interface EntityPacket {
    components: Component[]
    id: number
    sceneId: string
    entityClass: string
}




/**
 * 


class Player implements GameObject {
    components: Component[]
    hp = 100
    constructor() {
        this.components = []
    }
    script() {
        if (this.hp < 0) {
            //Get scene to delete
        }
    }

}
class Enemy implements GameObject {
    hp: number = 100
    components: Component[]
    weapon: Image or Weapon class with Renderable Component and Collider
    damage: number = 100
    tag?: string
    constructor() {

        this.components = []
        this.components.add(new Renderable())
        this.components.add(new HPComponent() ) Could do this or could do it as instance variable and script



        this.components.add(new Collider(this, onCollide, tag))
        ALTERNATIVELY IF NO TAG
        this.components.add(new Collider(this, onCollide))
    }
    script(dt ) {
        if  found:
        Spawn Weapon Image With Spawner
        Spawn Collider With OnCollide
        example of collider: collider(otherCollider, onCollide)

        else {
            transform. do something
        }
        if (hp < 0) {
            get Scenes.deleteEntity() somehow
        }
    }
    onCollide(otherCollider2) {
        if WeaponCollider.typeTag = Player {
            Colllider.Entity.HP Component.hp -= weaponDamage


        }
        ALTERNATIVELY 

         if WeaponCollider. = Player {
            Colllider.Entity.HP Component.hp -= weaponDamage


        }

    }




}
*/