import { EngineType } from "../../constants/engineType.js";
import { ScriptingEngine } from "../../systems/scripting/ScriptingEngine.js";
import { Component } from "../../types/components.js";
import { Entity } from "../../types/Entity.js";
import { System } from "../../types/system.js";

export abstract class ScriptObject implements Component {
    entity?: number | undefined;
    visible: boolean = true;
    alive: boolean = true;
    componentId?: number | undefined;
    system!: System<Component>;
    abstract copy(component: Component): void 
    engineTag: string = "SCRIPTING";
    engineType: EngineType = EngineType.CLIENTONLY
    abstract initialize(system: ScriptingEngine): void 
    abstract update(dt: number): void
}
export class Script implements ScriptObject {
    entity?: number;
    engineTag: string = "SCRIPTING";
    componentId?: number | undefined;
    system!: System<Component>
    engineType: EngineType
    callback: (dt: number ) => void
    constructor(callback: (dt: number ) => void, engineType: EngineType = EngineType.CLIENTONLY) {
        this.callback = callback
        this.engineType = engineType
    }
    copy<Script>(script: Script): void {
        
    }
    visible: boolean = true;
    alive: boolean = true;
    initialize() {

    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {

        this.callback(dt)
        
    }
    toJSON() {
        return {
            entity: this.entity,
            engineTag: this.engineTag,
            componenId: this.componentId,
            callback: this.callback
        }
    }
    


}
export interface StatefulScript extends Component {

}