// TypeScript Exercise: PriorityQueue Implementation
//
// Implement a PriorityQueue class. This queue should store elements along with
// their priority and should always return the element with the highest priority
// first. If elements have the same priority, they should be returned according
// to their order in the queue (FIFO among equal priorities).
//
// Methods:
// enqueue(item, priority): Add an element to the queue with a given priority.
// dequeue(): Remove and return the element with the highest priority.
// peek(): Return the element with the highest priority without removing it from the queue.
// isEmpty(): Return true if the queue is empty, false otherwise.
// changePriority(item, newPriority): Change the priority of an item in the queue.
//   If the item is not in the queue, do nothing.
//
// Example Usage:
// const pq = new PriorityQueue();
// pq.enqueue(10, 2);
// pq.enqueue(20, 1);
// pq.enqueue(30, 3);
// pq.peek();      // 20 (lower priority number = higher precedence)
// pq.dequeue();    // 20
// pq.changePriority(10, 4);
// pq.isEmpty();    // false


class PQueue{
    constructor(){
        this.heap = [];
    }

    enqueue(item, priority){
        this.heap.push({ item, priority });
        this._bubbleUp(this.heap.length - 1);
    }

    dequeue(){
        if (this.isEmpty()) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }
        return top.item;
    }

    peek(){
        if (this.isEmpty()) return undefined;
        return this.heap[0].item;
    }

    isEmpty(){
        return this.heap.length === 0;
    }

    changePriority(item, newPriority){
        const index = this.heap.findIndex(node => node.item === item);
        if (index === -1) return;
        const oldPriority = this.heap[index].priority;
        this.heap[index].priority = newPriority;
        if (newPriority < oldPriority) {
            this._bubbleUp(index);
        } else if (newPriority > oldPriority) {
            this._bubbleDown(index);
        }
    }

    _bubbleUp(i){
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[i].priority >= this.heap[parent].priority) break;
            [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
            i = parent;
        }
    }

    _bubbleDown(i){
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && this.heap[left].priority < this.heap[smallest].priority) smallest = left;
            if (right < n && this.heap[right].priority < this.heap[smallest].priority) smallest = right;
            if (smallest === i) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
}

