# TypeScript Exercise: PriorityQueue Implementation

## Description
Implement a `PriorityQueue` class in TypeScript. This queue should store elements along with their priority and should always return the element with the highest priority first. If elements have the same priority, they should be returned according to their order in the queue.

### Methods
The `PriorityQueue` class should have the following methods:

- `enqueue(item: T, priority: number)`: Add an element to the queue with a given priority.
- `dequeue()`: Remove and return the element with the highest priority.
- `peek()`: Return the element with the highest priority without removing it from the queue.
- `isEmpty()`: Return `true` if the queue is empty, `false` otherwise.
- `changePriority(item: T, newPriority: number)`: Change the priority of an item in the queue. If the item is not in the queue, do nothing.

## Implementation Guidelines
- Use TypeScript syntax for defining classes, methods, and types.
- Ensure that the PriorityQueue class handles priority correctly and maintains the correct order of elements.
- Write appropriate type annotations for function parameters and return values.
- Include appropriate error handling where necessary.
- Provide clear and concise comments for each method to explain its purpose and functionality.

## Example Usage
```typescript
// Instantiate a new PriorityQueue
const pq = new PriorityQueue<number>();

// Add elements with priority
pq.enqueue(10, 2);
pq.enqueue(20, 1);
pq.enqueue(30, 3);

// Peek the element with the highest priority
console.log(pq.peek()); // Output: 20

// Dequeue the element with the highest priority
console.log(pq.dequeue()); // Output: 20

// Change priority of an item
pq.changePriority(10, 4);

// Check if the queue is empty
console.log(pq.isEmpty()); // Output: false
