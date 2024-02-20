


import { GRAPHICS_TAG } from "../../constants/componentType.js"
import { Component, Listenable, Renderable } from "../../types/components.js"
import { GraphicsConfig } from "../../core/config.js"
import { ContextInfo } from "../../core/context.js"
import { Entity } from "../../types/Entity.js"

import { System } from "../../types/system.js"
import { Scene } from "../../core/scene.js"
import { SceneManager } from "../../core/managers/SceneManager.js"
import { PriorityQueue } from "../../structs/PriorityQueue.js"
import { PainterStrategy, RenderStrategy } from "./RenderingStrategy/RenderingStrategy.js"
import { QuadTreeStrategy } from "./RenderingStrategy/QuadTreeRendering.js"
import { Camera } from "./components/2d/Camera.js"
import { Scene as SceneGraph, WebGLRenderer } from "three"
import { Rendering3d } from "./RenderingStrategy/Rendering3d.js"
    function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width  = Math.floor( canvas.clientWidth  * pixelRatio );
      const height = Math.floor( canvas.clientHeight * pixelRatio );
      const needResize = canvas.width !== width || canvas.height !== height;
      renderer.setSize(window.innerWidth, window.innerHeight);
      return needResize;
    }
export class GraphicsEngine implements System<Renderable>{
    tag: string = GRAPHICS_TAG
    components: Map<number, Renderable>
    renderStrategy: RenderStrategy
    graphicsConfig: GraphicsConfig
    images: Map<string, HTMLImageElement> = new Map()
    contextInfo: ContextInfo
    deleted: Component[]
    sceneManager!: SceneManager;
    rendering: Renderable[] = []
    UIComponents: Set<number> = new Set()
    cameras: Map<number, Camera> = new Map()
    mainCamera?: Renderable
    renderer: WebGLRenderer
    sceneGraph: SceneGraph
    constructor(sceneManager: SceneManager, graphicsConfig: GraphicsConfig) {
        this.graphicsConfig = graphicsConfig
        this.components = new Map<number, Renderable>()
        this.deleted = []
        this.sceneManager = sceneManager
        
        this.contextInfo = new ContextInfo(graphicsConfig)
        this.renderer = new WebGLRenderer({antialias: true, canvas: this.contextInfo.realCanvas  })
        window.onresize = () => {
            resizeRendererToDisplaySize(this.renderer)
        }
        this.renderer.setSize(window.innerWidth,window.innerHeight)
        this.renderer.setClearColor( 0xffffff, 0);

        this.sceneGraph = new SceneGraph()
        document.documentElement.style.height = '100%'
        document.documentElement.style.width = '100%'
        document.body.style.height = "100%"
        document.body.style.width = "100%"
        document.body.style.margin = "0"

        let currScene = this.sceneManager.currScene
        let size = {
            pos: {
                x:0,
                y: 0,
                z: 0
            },
            rot: 0,
            dim: {
                length: currScene.worldBounds.xMax - currScene.worldBounds.xMin,
                height: currScene.worldBounds.yMax - currScene.worldBounds.yMin
            }

        }
        this.renderStrategy = new Rendering3d(this)



        
    }
    register(comp: Renderable, id: number): void {
        if (comp.componentId == undefined || comp.componentId == null) {
            //console.log("Registering undefined id in Ggraphics")

            comp.componentId = id
            comp.system = this
            
            comp.context = this.contextInfo
            comp.initialize(this)
            if (this.UIComponents.has(comp.componentId)) {
                
                //console.log("Pushing to rendering")
            } else if (comp.rendered == true) {
                this.rendering.push(comp)
            } else {
                let hasCamera = this.cameras.get(comp.componentId)
                console.log("Assd")
                if (!hasCamera) {
                    this.renderStrategy.registerStrategy(comp)
                }
                
            }
            
            this.components.set(id, comp)
        } else {
            //console.log("Graphics Registering id" + comp.componentId)
            comp.system = this
            comp.context = this.contextInfo
            comp.initialize(this)
            if (this.UIComponents.has(comp.componentId)) {
                
                //console.log("Pushing to rendering")
            } else if (comp.rendered == true) {
                this.rendering.push(comp)
            } else {
                let hasCamera = this.cameras.get(comp.componentId)
                if (!hasCamera) {
                    this.renderStrategy.registerStrategy(comp)
                }
                
            }
            
            this.components.set(comp.componentId, comp)
        }
    }
    unregister(id: number): void {

        let deleted = this.components.get(id)
        if (deleted) {
                deleted.alive = false
                
                this.deleted.push(deleted)
                this.UIComponents.delete(deleted.componentId as number)
                this.cameras.delete(deleted.componentId as number)
                this.renderStrategy.deregisterStrategy(deleted)
                //console.log(deleted.entity+ " s Component with id " +  deleted.componentId + "is popped")
            }
        }
    
    setMainCamera(componentId: number) {
        let camera = this.components.get(componentId)
        this.mainCamera = camera
    }
    addUIComponent(component: Renderable) {
        this.UIComponents.add(component.componentId as number)
    }
    addCamera(camera: Camera) {
        this.cameras.set(camera.componentId as number,camera)
    }

    
    update(dt: number) {
        let ctx = this.contextInfo.ctx
        
        //console.log("Graphics engine running")
        //console.log("Graphics Components: " + this.components.size)
        for (let c of this.components) {
            let comp = c[1]

            
            comp.update(dt)
            
           
            


        }
        //console.log("Rendering Components: " + this.rendering.length
        let cameras = [...this.cameras.values()]
        this.renderStrategy.render(cameras)
        //let bitmapOffScreen = this.contextInfo.canvas.transferToImageBitmap()
        //let canvaRenderer = this.contextInfo.realCanvas.getContext("bitmaprenderer")
        //if (canvaRenderer) {
         //   canvaRenderer.transferFromImageBitmap(bitmapOffScreen)
        //} else {
        //    throw Error(" New wee")
       // }


        while (this.deleted.length > 0 ) {
            let comp = this.deleted.pop()
            
            this.components.delete(comp?.componentId as number)
        }


        
        
    }
    setScene(scene: Scene): void {

        
    }
    registerDomElements(): void {
        
    }

    

}