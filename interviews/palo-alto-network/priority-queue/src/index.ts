import PriorityQueue from "./priorityQueue";

// Create a new priority queue.
const pq = new PriorityQueue();

// Check if the queue is empty.
console.log(pq.isEmpty()); // Output: true

// Add items to the queue.
pq.enqueue("Hello", 2);
pq.enqueue("World", 1);
pq.enqueue("!", 3);

// Check if the queue is empty.
console.log(pq.isEmpty()); // Output: false

// Peek at the item with the highest priority.
console.log(pq.peek()); // Output: "World"

// Change the priority of an item.
pq.changePriority("Hello", 0);

// Peek at the item with the highest priority.
console.log(pq.peek()); // Output: "Hello"

// Remove items from the queue.
console.log(pq.dequeue()); // Output: "Hello"
console.log(pq.dequeue()); // Output: "World"
console.log(pq.dequeue()); // Output: "!"
