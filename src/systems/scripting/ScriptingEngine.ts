import { Script, ScriptObject } from "./components/Script.js";
import { EngineType } from "../../constants/engineType.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { System } from "../../types/system.js";
import { ScriptingConfig } from "../../core/config.js";
export class ScriptingEngine implements System<ScriptObject> {
    tag: string ="SCRIPTING"  ;
    components: Map<number, Script>;
    deleted: ScriptObject[] = []
    engineType: EngineType
    sceneManager!: SceneManager
    objectDB: Map<string, Set<Script>> = new Map()
    updateSystems:Map<number, Script> = new Map()
    constructor(sceneManager: SceneManager, engineType: ScriptingConfig) {
        this.components = new Map<number, Script>()
        this.engineType = engineType.engineType
        this.sceneManager = sceneManager
    }
    addSuperClass(script:Script, superclass:string) {
        let objectSet = this.objectDB.get(superclass)
        if (objectSet) {
            objectSet.add(script)
        } else {
            let set:Set<Script> = new Set()
            set.add(script)
            this.objectDB.set(superclass,set)
        }
    }
    addSuperClasses(script:Script, ...superclasses: string[]) {
        for (let superclass of superclasses) {
            this.addSuperClass(script, superclass)
        }
        script.destroy = () => {
            for (let i of superclasses) {
                this.removeSuperClass(script, i)
            }
        }
    }
    removeSuperClass(script:Script, superclass:string) {
        let objectSet = this.objectDB.get(superclass)
        if (objectSet) {
            objectSet.delete(script)
        } else {

        }
    }
    queryClass(className :string) {
        let item = this.objectDB.get(className);
        if (item) {
            
            return item
        } else {
            return undefined
        }

    }


    

    register(comp: Script, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {
            
            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
            
        }  else {

            comp.system = this
            this.components.set(comp.componentId, comp)
        }
        let list = this.objectDB.get(comp.className)
        if (list) {
            list.add(comp)
        } else {
            let set: Set<Script> = new Set()
            set.add(comp)
            this.objectDB.set(comp.className, set)
        }

        if (comp.callback) {
            this.updateSystems.set(comp.componentId, comp)
        }
        this.initialize(comp)

        
    }
    
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
            if (deleted.callback) {
                this.updateSystems.delete(comp)
            }
            if (deleted.destroy) {
                deleted.destroy()
            }
            let set = this.objectDB.get(deleted.className)
            if (set) {
                set.delete(deleted)
            }

       }
    
    }
    initialize(comp: Script) {
        if (comp.init) {
            comp.init(this)
        }

    }
    update(dt: number): void {
        //console.log("Scripting engine running")
        //console.log("Scripting Components: " + this.components.size)
        for (let comp of this.updateSystems) {
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