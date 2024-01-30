import { EngineType } from "../../../constants/engineType.js";
import { ScriptingEngine } from "../ScriptingEngine.js";
import { Component } from "../../../types/components.js";
import { Entity } from "../../../types/Entity.js";
import { System } from "../../../types/system.js";

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
    system!: ScriptingEngine
    engineType: EngineType
    className!: string 
    properties: Map<string, any> = new Map()
    callback?: (dt: number, data?: any ) => void
    constructor(callback?: (dt: number, data: any ) => void, engineType: EngineType = EngineType.CLIENTONLY) {
        this.callback = callback
        this.engineType = engineType
    }
    copy(script: Script): void {
        this.className = script.className
        this.componentId = script.componentId
        for (const [key, value] of Object.entries(script.properties)) {
            this.properties.set(key, value)
        }



    }
    visible: boolean = true;
    alive: boolean = true;
    initialize() {

    }
    getClasses(classId: string) {
        let classArr = this.system.objectDB.get(classId);
        if (classArr) {
            return classArr
        }
        return []
    }
    
    addProperty(property:string, intialValue?: any ) {
        this.properties.set(property, 0)
    }
    setClass(classID: string) {
        this.className= classID
    }
    setCallBack(func: (dt: number) => void) {
        this.callback = func
    }
    setInit(func: (dt: number) => void) {

    }
    update(dt: number, ctx?: CanvasRenderingContext2D | undefined): void {
        if (this.callback) {
            this.callback(dt)
        }
        
        
    }
    toJSON() {
        return {
            entity: this.entity,
            engineTag: this.engineTag,
            componenId: this.componentId,
            callback: this.callback,
            properties: this.properties
        }
    }
    


}
export interface StatefulScript extends Component {

}