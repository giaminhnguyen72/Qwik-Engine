interface DataNode<T> {
    data: T
    priority: number
}
export class PriorityQueue<T> {

    items: DataNode<T>[] = [];
    size: number = 0
  clear() {
    this.items = []
    this.size = 0
  }
    swap(idx1: number, idx2: number) {
        var tmp = this.items[idx1]
        this.items[idx1] = this.items[idx2]
        this.items[idx2] = tmp
    }
    // Add an item to the queue
    enqueue(item: T, priority: number) {
      this.items.push({
        data: item,
        priority: priority
      });
      let idx: number = this.items.length - 1
      var parentIdx = Math.floor((idx-1)/2)
      while (idx > 0 && this.items[idx].priority > this.items[parentIdx].priority) {
        this.swap(idx, parentIdx)
        idx = parentIdx
        parentIdx = Math.floor((idx-1)/2)
      }
      this.size++
      
    }
  
    // Remove and return the highest priority item from the queue
    dequeue(): T | undefined {
      if (this.size == 0) {
          return undefined
      }
      if (this.size == 1) {
        this.size--
        let data = this.items[0].data
        this.items.pop()
        return data
      }
      console.log(this.items)
      let popped = this.items[0]
      this.size--
      console.log("Unpopped " + this.size)
      let last = this.items.pop()
      console.log("Popped " + this.size)
      console.log(last )
      console.log()
      if (last) {
        this.items[0] = last
        for (let i = 0; i < this.items.length; i++){
            //console.log("Inlast" + this.items[i].data)
        }
        
      } 
     console.log("Size is" + this.size) 
      
      let idx = 0
      while (idx <= this.size - 1) {
          let left = 2 * idx + 1
          let right = 2 * idx + 2

          if (left <= this.size - 1 && right <= this.size - 1) {

              let childIdx = this.items[left].priority > this.items[right].priority ? left : right
              if (this.items[childIdx].priority > this.items[idx].priority) {

                this.swap(idx, childIdx)
                idx = childIdx
              } else {
                //console.log("first break")
                break
              }

          } else if (left <= this.size -1) {

              if (this.items[left].priority > this.items[idx].priority) {

                this.swap(idx, left)
                idx = left
                
              } else {
                 //console.log("Second break")
                break
              }
          } else {
             //console.log("Third break")
            break
          }

      }

      return popped.data
    }

  }