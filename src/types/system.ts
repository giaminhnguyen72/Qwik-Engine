import { SceneManager } from "../core/managers/SceneManager.js"
import { Component, Emitter, EngineEvent, Listenable, Listener } from "./components.js"


export interface System<T extends Component> {
    tag: string
    components: Map<number, T>
    update(dt: number):void
    register(comp: T, id: number): void
    unregister(comp:number): void

}
export interface EventSystem extends System<Listenable> {

    registerListener(component: Listenable): void
    registerEmitter(component: Emitter<EngineEvent>): void
    getConfig(): {}
}
