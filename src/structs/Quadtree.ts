interface Rectangle {
    pos: {x: number, y: number}
    dim: {length: number, height: number}

}
interface Rectangular {
    getRectangle(): Rectangle
}
export class QuadTree<T extends Rectangular> {
    parentNode: QuadTreeNode<T>
    getQuad: Map<T, QuadTreeNode<Rectangular>> = new Map()
    constructor(size: Rectangle) {
        this.parentNode = new QuadTreeNode(size)

    }
    query(box: Rectangle): T[] {
        
        return this.parentNode.query(box)

    }
    clear() {
        this.parentNode.clear()
    }
    insert(item: T) {
        let quadNode: QuadTreeNode<T> = this.parentNode.insert(item)
        this.getQuad.set(item, quadNode)
        return quadNode
    }
    //Error
    remove(item: T) {
        let quadNode = this.getQuad.get(item)
        if (quadNode) {
            quadNode.remove(item)
        } else {
            throw new Error()
        }
        this.getQuad.delete(item)
        
    }
    toString() {
        return this.parentNode.toString()
    }
    findAllIntersections() {
        let intersections: T[][] = []
        this.parentNode.findAllIntersections( intersections)
        return intersections

    }

}
class QuadTreeNode<T extends Rectangular> {
    area: Rectangle
    children: QuadTreeNode<T>[] = []
    items: T[] = []
    depth: number = 0
    maxDepth: number = 3
    constructor(size: Rectangle ,depth: number = 0) {
        this.area = size
        this.depth = depth
        this.resize(size)
    }
    findAllIntersections( intersections: T[][]) {
        for (let i = 0; i < this.items.length; i++) {
            for (let j = 0; j < i; j++) {
                let col1 = this.items[i]
                let col2= this.items[j]
                if (collides(col1.getRectangle(), col2.getRectangle())) { 
                    intersections.push([col1,col2])
                }
                //console.log("THis element is mapped: " + i.componentId)
            }
        }
        if (this.children.length > 0 ) {
            for (let c of this.children) {
                for (let v of this.items) {
                    this.findDescendentIntersections(v,intersections)
                }
            }
            for (let c of this.children) {
                c.findAllIntersections(intersections)
            }
        }
    }
    findDescendentIntersections( col: T, intersections: T[][]) {
        for (let v of this.items) {
            if (collides(col.getRectangle(),v.getRectangle())) {
                intersections.push([v, col])
            }
        }
        if (this.children.length > 0 ) {
            for (let c of this.children) {
                c.findDescendentIntersections(col, intersections)
            }
        }
    }
    query(box: Rectangle): T[] {
        let list: T[] = []
        this.queryHelper(box, list)
        return list
    }
    private queryHelper(box: Rectangle, answer: T[]) {

        for (let i = 0; i < this.items.length; i++) {
            if (collides(box, this.items[i].getRectangle())) {
                answer.push(this.items[i])
            }

        }
        for (let i = 0; i < this.children.length; i++) {
            if (contains( box, this.children[i].area)) {
                this.children[i].getItemList(answer)
            } else if (collides(this.children[i].area, box)) {
                this.children[i].queryHelper(box, answer)
            }
        }
    }
    getItemList(list: T[]) {
        for (let i of this.items) {
            list.push(i)
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].getItemList(list)
        }
    }
    remove(item: T): boolean {
        console.log(item)
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i] == item) {
                this.items[i] = this.items[this.items.length - 1]
                this.items.pop()
                return true
            } 
        }

        
        for (let i of this.children) {
            if (i.remove(item)) {
                return true 
            }
        }
        return false
    }
    getRectangle(): Rectangle {
        return this.area
    }
    resize(rectangle: Rectangle):void {
        this.clear()
        this.area = rectangle
        if (this.depth + 1 < this.maxDepth) {
            this.children.push(new QuadTreeNode({pos: {x: rectangle.pos.x - rectangle.dim.length / 4, y: rectangle.pos.y  + rectangle.dim.height / 4},dim: {length: rectangle.dim.length / 2, height: rectangle.dim.height / 2} }, this.depth + 1))
            this.children.push(new QuadTreeNode({pos: {x: rectangle.pos.x - rectangle.dim.length / 4, y: rectangle.pos.y  - rectangle.dim.height / 4},dim: {length: rectangle.dim.length / 2, height: rectangle.dim.height / 2 }}, this.depth + 1))
            this.children.push(new QuadTreeNode({pos: {x: rectangle.pos.x + rectangle.dim.length / 4, y: rectangle.pos.y  + rectangle.dim.height / 4},dim: {length: rectangle.dim.length / 2, height: rectangle.dim.height / 2} }, this.depth + 1))
            this.children.push(new QuadTreeNode({pos: {x: rectangle.pos.x + rectangle.dim.length / 4, y: rectangle.pos.y  - rectangle.dim.height / 4},dim: {length: rectangle.dim.length / 2, height: rectangle.dim.height / 2} }, this.depth + 1))
        }
        
    }
     clear() {
        this.items.length = 0
        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].clear()
            this.children.pop()
        }
     }
    size(): number {
        let count = this.items.length
        for (let i = 0; i < 4; i++) {
            count += this.children[i].size()
        }
        return count
    }
    insert(item: T):QuadTreeNode<T> {
        for (let i = 0; i < this.children.length; i++) {
            if (contains(this.children[i].area, item.getRectangle())) {
                if (this.depth + 1 < this.maxDepth) {

                    return this.children[i].insert(item)
                }
            }
        }
        this.items.push(item)
        return this
    }
    toString() {
        let tabs = ""
        for (let i = 0; i < this.depth; i++) {
            tabs += "     "
        }
        let returned = "" + tabs
        returned += `Quad Position is ${this.area.pos.x},${this.area.pos.y} with area ${this.area.dim.height} x ${this.area.dim.height} \n`
        returned+= tabs
        returned += "Quad has " + this.children.length + " children at depth " + this.depth + "\n"
        returned += tabs
        returned += "Quad has " + this.items.length + " items\n"
        returned += tabs
        for (let i of this.items) {
            returned += JSON.stringify(i)
            returned += "\n"
        }
        for(let i of this.children) {
            returned += tabs + "\n"
            returned += i

        }
        return returned
        
    }
}

function contains(container: Rectangle, contained: Rectangle): boolean {
    let x1 = contained.pos.x - contained.dim.length / 2
    let y1 = contained.pos.y - contained.dim.height / 2
    let x2 = container.pos.x - container.dim.length / 2
    let y2 = container.pos.y - container.dim.height / 2
    if (x1 >= x2 
    &&  x1 + contained.dim.length < x2 + container.dim.length
    &&  y1 >= y2 
    && y1 + contained.dim.height < y2 + container.dim.height
    ) {
        return true
    } else {
        return false
    }
}
function collides(rectangle1: Rectangle, rectangle2: Rectangle): boolean {
    let x1 = rectangle1.pos.x - rectangle1.dim.length / 2
    let y1 = rectangle1.pos.y - rectangle1.dim.height / 2
    let x2 = rectangle2.pos.x - rectangle2.dim.length / 2
    let y2 = rectangle2.pos.y - rectangle2.dim.height / 2
    if (x1 < x2 + rectangle2.dim.length 
    &&  x1 + rectangle1.dim.length > x2
    &&  y1 < y2 + rectangle2.dim.height
    && y1 + rectangle1.dim.height > y2
    ) {
        return true
    } else {
        return false
    }
}


function testChildren<T extends Rectangular>(quad: QuadTreeNode<T>): boolean {
    let bool = true
    for (let child of quad.children) {
        bool = testChildren(child)
        let rectangle = child.area
        if (!bool) {
            return false
        } else if (rectangle.pos.x + rectangle.dim.length / 4 && rectangle.pos.y  + rectangle.dim.height / 4) {
            return true
        } else if (rectangle.pos.x - rectangle.dim.length / 4 && rectangle.pos.y  + rectangle.dim.height / 4) {
            return true
        } else if (rectangle.pos.x + rectangle.dim.length / 4 && rectangle.pos.y  - rectangle.dim.height / 4) {
            return true
        } else if (rectangle.pos.x - rectangle.dim.length / 4 && rectangle.pos.y  - rectangle.dim.height / 4) {
            return true
        }
    }
    
    return bool
}






//console.log(testChildren(quad))