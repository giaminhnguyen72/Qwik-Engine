import { Script, ScriptObject } from "./components/Script.js";
import { EngineType } from "../../constants/engineType.js";
import { SceneManager } from "../../core/managers/SceneManager.js";
import { System } from "../../types/system.js";
export class ScriptingEngine implements System<ScriptObject> {
    tag: string ="SCRIPTING"  ;
    components: Map<number, Script>;
    deleted: ScriptObject[] = []
    engineType: EngineType
    sceneManager!: SceneManager
    objectDB: Map<string, Set<Script>> = new Map()
    fieldDB: Map<string, string[]> = new Map()



    constructor(sceneManager: SceneManager, engineType: EngineType) {
        this.components = new Map<number, Script>()
        this.engineType = engineType
        this.sceneManager = sceneManager
    }
    queryClass(className :string) {
        let item = this.objectDB.get(className);
        if (item) {
            
            return item
        } else {
            return []
        }

    }
    addFieldEntry(field: string, classString:string) {
        let classEntries = this.fieldDB.get(field)
        if (classEntries) {
            for (let i of classEntries) {
                if (i == classString) {
                    return
                }
            }
            classEntries.push(classString)
        } else {
            let arr = []
            arr.push(classString)
            this.fieldDB.set(field, arr)
        }
    }
    queryFields(field: string) {

        let classEntries = this.fieldDB.get(field)
        let scriptObjects: Script[] = []
        if (classEntries){
            for (let i of classEntries) {
                let classes = this.objectDB.get(i)
                if (classes) {
                    for (let c of classes) {
                        scriptObjects.push(c)
                    }
                }
                
            }
            return scriptObjects
        } else {
            return []
        }
    }

    

    register(comp: Script, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {
            
            comp.componentId = id
            comp.system = this
            this.components.set(id, comp)
            
        }  else {
            comp.componentId = id
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

        this.initialize(comp)

        
    }
    
    unregister(comp: number): void {
        let deleted = this.components.get(comp) 
       if (deleted) {
            deleted.alive = false

            this.deleted.push(deleted)
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
        for (let comp of this.components) {
            if (comp[1].engineType == this.engineType) {
                comp[1].update(dt)
            } else if (comp[1].engineType = EngineType.BOTH) {
                comp[1].update(dt)
            }
            
        }
        while (this.deleted.length > 0 ) {
            console.log("Entity i deleted       A         D")
            let comp = this.deleted.pop()
            this.components.delete(comp?.componentId as number)

        }

    }

}