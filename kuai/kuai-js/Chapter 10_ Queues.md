# Chapter 10: Queues

## Section 1: Introduction to Queues

Queues are essential data structures used in computing that operate on the principle of First In, First Out (FIFO). This fundamental characteristic makes queues highly suitable for scenarios involving sequential processing, such as managing tasks in order of arrival or handling real-time data streams.

### Core Operations of Queues:

- **Enqueue**: Adds an element to the end of the queue, effectively queuing it for processing.
- **Dequeue**: Removes and returns the element at the front of the queue, the one that has been in the queue the longest.
- **Peek/Front**: Provides access to the first element without removing it, allowing inspection of the item due to be processed next.
- **IsEmpty**: Checks whether the queue has any elements, which is crucial for preventing errors from dequeue operations on an empty queue.

JavaScript does not have a built-in queue data structure. The obvious approach is to use a plain array and treat `push()` as enqueue and `shift()` as dequeue. This works and is fine for small inputs, but `Array.prototype.shift()` is **O(n)**: removing the first element forces the engine to reindex every remaining element. For performance-sensitive code (like BFS over a large graph), that turns an otherwise linear algorithm into a quadratic one.

## Section 2: Implementing Queues in JavaScript

Because there is no native queue, we have two practical options.

### Option A: Plain array (simple, but O(n) dequeue)

Good enough for short examples and small inputs; just be aware of the tradeoff.

```javascript
const queue = [];

queue.push('apple');
queue.push('banana');   // queue is now ['apple', 'banana']

const front = queue[0]; // Peek: 'apple'
const removed = queue.shift(); // Dequeue: removes and returns 'apple' — O(n)

const isEmpty = queue.length === 0;
```

### Option B: Index-pointer queue (recommended, O(1) dequeue)

Instead of physically removing the front element, we keep a `head` index that marks where the front currently is. Enqueue pushes onto the end; dequeue reads at `head` and advances the pointer. Nothing is reindexed, so both operations are O(1) (amortized). We can occasionally compact the array to reclaim memory once the consumed prefix grows large.

```javascript
class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  // Enqueue — add to the back
  enqueue(value) {
    this.items.push(value);
  }

  // Dequeue — remove and return the front
  dequeue() {
    if (this.isEmpty()) return undefined;
    const value = this.items[this.head];
    this.head++;
    // Occasionally compact so consumed slots don't grow unbounded
    if (this.head > 32 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return value;
  }

  // Peek — inspect the front without removing it
  peek() {
    return this.items[this.head];
  }

  isEmpty() {
    return this.head >= this.items.length;
  }

  get size() {
    return this.items.length - this.head;
  }
}
```

Usage:

```javascript
const queue = new Queue();
queue.enqueue('apple');
queue.enqueue('banana'); // queue holds ['apple', 'banana']

queue.peek();    // 'apple'
queue.dequeue(); // removes 'apple' in O(1)

if (queue.isEmpty()) {
  console.log('Queue is empty.');
}
```

## Section 3: Time Complexity Analysis

Efficient queue operations are crucial for performance, especially in time-sensitive applications. Here is the time complexity for the primary queue operations.

Using the **index-pointer queue** (Option B):

- **Enqueue (push)**: O(1) — amortized, thanks to dynamic array growth.
- **Dequeue (advance head)**: O(1) — amortized; we only read and move a pointer.
- **Peek (index access)**: O(1) — accessing the front element by index is immediate.
- **IsEmpty**: O(1) — a direct comparison.

Using a **plain array with `shift()`** (Option A):

- **Enqueue (push)**: O(1) amortized.
- **Dequeue (shift)**: O(n) — every remaining element is reindexed.
- **Peek (index access)**: O(1).
- **IsEmpty**: O(1).

For the solved problems below we use whichever style reads most clearly; in each case a plain array is sufficient for the given constraints, but the index-pointer pattern is the drop-in replacement whenever O(1) dequeue matters.

## Section 4: Solved Problems

### Problem 1: [Number of Recent Calls](https://leetcode.com/problems/number-of-recent-calls/)

**Problem Statement**: Implement a `RecentCounter` class to count the number of recent requests within a time frame of 3000 milliseconds before the current call.

**Solution**:

```javascript
class RecentCounter {
  constructor() {
    this.queue = [];
    this.head = 0;
  }

  ping(t) {
    this.queue.push(t);
    while (this.queue[this.head] < t - 3000) {
      this.head++;
    }
    return this.queue.length - this.head;
  }
}
```

**Explanation**:
Use a queue to store call timestamps. When a new call time is recorded, enqueue it. Then, remove all calls from the front of the queue that happened more than 3000 milliseconds before the current call. Here we dequeue by advancing a `head` pointer (O(1)) instead of calling `shift()` (O(n)). The number of live elements — `queue.length - head` — represents the number of recent calls.

### Problem 2: [Number of Students Unable to Eat Lunch](https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/)

**Problem Statement**: The school cafeteria offers circular and square sandwiches, placed in a stack. At lunchtime, each student can take either the top sandwich or leave it in the stack and go to the end of the line. Students sit in a queue and are initially given a preference list indicating which type of sandwich each prefers. The problem is to determine how many students are unable to eat after all possibilities have been exhausted.

**Solution 1: Simulation**

```javascript
function countStudents(students, sandwiches) {
  const studentQueue = [...students];
  let head = 0;
  sandwiches.reverse();

  let attempts = 0;

  while (sandwiches.length > 0 && head < studentQueue.length) {
    const firstStudent = studentQueue[head];
    head++;
    if (firstStudent === sandwiches[sandwiches.length - 1]) {
      sandwiches.pop();
      attempts = 0;
    } else {
      studentQueue.push(firstStudent);
      attempts += 1;
      if (attempts === studentQueue.length - head) {
        break;
      }
    }
  }

  return studentQueue.length - head;
}
```

**Explanation**
This solution models the students as a queue and sandwiches as a stack. Students sequentially check the top sandwich. If it matches their preference, they take it and leave the line; otherwise, they go to the back of the line. We dequeue with an index pointer (`head`) so removing the front student stays O(1). The `attempts` counter tracks if we have cycled through all remaining students without being able to serve any, indicating a deadlock where no further sandwiches can be served. The loop exits either when all sandwiches are taken or no student can eat the sandwich at the top of the stack.

**Complexity Analysis**:

* Time: O(n^2)
* Space: O(n)

**Solution 2: Counting**

```javascript
function countStudents(students, sandwiches) {
  const count = new Map();
  for (const student of students) {
    count.set(student, (count.get(student) ?? 0) + 1);
  }

  for (const sandwich of sandwiches) {
    if ((count.get(sandwich) ?? 0) > 0) {
      count.set(sandwich, count.get(sandwich) - 1);
    } else {
      break;
    }
  }

  let total = 0;
  for (const remaining of count.values()) {
    total += remaining;
  }
  return total;
}
```

**Explanation:**
This approach uses a `Map` as a counter to keep track of the number of students preferring each type of sandwich (0 and 1). It iterates over the sandwich stack, decrementing the count of the corresponding sandwich type each time a sandwich is taken. The loop stops when a sandwich cannot be taken (i.e., when there are no students wanting the current sandwich). The function returns the sum of the remaining counts, which represents the number of students who could not eat.

**Complexity Analysis**:

* Time: O(n)
* Space: O(1)

### Problem 3: [Implement Stack Using Queues](https://leetcode.com/problems/implement-stack-using-queues/)

**Problem Statement**: Implement a stack using two queues.

**Solution**:

```javascript
class MyStack {
  constructor() {
    this.mainQueue = [];
    this.auxQueue = [];
  }

  push(x) {
    this.mainQueue.push(x);
  }

  pop() {
    while (this.mainQueue.length > 1) {
      this.auxQueue.push(this.mainQueue.shift());
    }
    const popped = this.mainQueue.shift();
    [this.mainQueue, this.auxQueue] = [this.auxQueue, this.mainQueue];
    return popped;
  }

  top() {
    while (this.mainQueue.length > 1) {
      this.auxQueue.push(this.mainQueue.shift());
    }
    const top = this.mainQueue[0];
    this.auxQueue.push(this.mainQueue.shift());
    [this.mainQueue, this.auxQueue] = [this.auxQueue, this.mainQueue];
    return top;
  }

  empty() {
    return this.mainQueue.length === 0;
  }
}
```

**Explanation**:
Maintain two queues, using one as the main storage and the other for operations that require reversing the order (like `pop` and `top`). For `push`, enqueue in the main queue. For `pop` or `top`, dequeue all elements except the last from the main queue into the auxiliary queue, retrieve the last element, and swap the roles of the two queues using array destructuring. (The queues here stay small during each operation, so `shift()` is fine; you could swap in the index-pointer queue from Section 2 if you wanted strict O(1) dequeues.)

## Section 5: Exercises

1. **[Design Front Middle Back Queue](https://leetcode.com/problems/design-front-middle-back-queue/)**
2. **[Implement Queue Using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)**
3. **[Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)**
4. **[Design Circular Deque](https://leetcode.com/problems/design-circular-deque/)**
5. **[Design Snake Game](https://www.lintcode.com/problem/3656/)**
