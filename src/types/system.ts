import { SceneManager } from "../core/managers/SceneManager.js"
import { Component, Emitter, EngineEvent, Listenable, Listener, SocketListener } from "./components.js"


export interface System<T extends Component> {
    tag: string
    components: Map<number, T>
    sceneManager: SceneManager
    update(dt: number):void
    register(comp: T, id: number): void
    unregister(comp:number): void


}
export interface EventSystem<T extends EngineEvent> extends System<Listenable> {

    registerListener(component: Listenable): void
    registerEmitter(component: Emitter<T>): void
    getConfig(): {}
}
export interface SocketEventSystem<T extends EngineEvent> extends System<Listenable> {

    registerListener(component: SocketListener<T>): void
    registerEmitter(component: Emitter<T>): void
    getConfig(): {}
}
