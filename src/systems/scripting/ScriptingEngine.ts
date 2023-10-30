import { Script, ScriptObject } from "../../components/Script/Script.js";
import { EngineType } from "../../constants/engineType.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { System } from "../../types/system.js";
export class ScriptingEngine implements System<ScriptObject> {
    tag: string ="SCRIPTING"  ;
    components: Map<number, ScriptObject>;
    deleted: ScriptObject[] = []
    engineType: EngineType
    constructor(engineType: EngineType) {
        this.components = new Map<number, Script>()
        this.engineType = engineType
    }
    register(comp: Script, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {

            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
        }  else {
            comp.componentId = comp.componentId
            comp.system = this
            this.components.set(comp.componentId, comp)
        }
    }
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)

       }
    
    }
    initialize(comp: Script) {

    }
    update(dt: number): void {
        console.log("Scripting engine running")
        console.log("Scripting Components: " + this.components.size)
        for (let comp of this.components) {
            if (comp[1].engineType == this.engineType) {
                comp[1].update(dt)
            } else if (comp[1].engineType = EngineType.BOTH) {
                comp[1].update(dt)
            }
            
        }
        while (this.deleted.length > 0 ) {
            let comp = this.deleted.pop()
            this.components.delete(comp?.componentId as number)
        }

    }

}