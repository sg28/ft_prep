# Chapter 10: Queues

## Section 1: Introduction to Queues

Queues are essential data structures used in computing that operate on the principle of First In, First Out (FIFO). This fundamental characteristic makes queues highly suitable for scenarios involving sequential processing, such as managing tasks in order of arrival or handling real-time data streams.

### Core Operations of Queues:

- **Enqueue**: Adds an element to the end of the queue, effectively queuing it for processing.
- **Dequeue**: Removes and returns the element at the front of the queue, the one that has been in the queue the longest.
- **Peek/Front**: Provides access to the first element without removing it, allowing inspection of the item due to be processed next.
- **IsEmpty**: Checks whether the queue has any elements, which is crucial for preventing errors from dequeue operations on an empty queue.

While Python does not have a built-in queue data structure that supports all queue operations efficiently, the `collections.deque` module provides a double-ended queue with fast appends and pops from both ends, making it ideal for queue implementations.

## Section 2: Implementing Queues with `collections.deque`

Python’s `collections.deque`, part of the `collections` module, offers an optimal way to implement queues thanks to its ability to handle operations at both ends efficiently.

### Creating a Queue

A queue can be created simply by initializing a `deque` object:

```python
from collections import deque

queue = deque()
```

### Enqueue Operation

Elements are added to the back of the queue using the `append()` method:

```python
queue.append('apple')
queue.append('banana')  # The queue becomes deque(['apple', 'banana'])
```

### Dequeue Operation

The front item is removed and returned using the `popleft()` method, adhering to the FIFO principle:

```python
if queue:
    front_element = queue.popleft()  # Removes 'apple' from the queue
```

### Peek Operation

To inspect the element at the front without removing it, simply access the first item using indexing:

```python
if queue:
    front_element = queue[0]  # Accesses 'banana'
```

### IsEmpty Check

The emptiness of the queue can be checked straightforwardly:

```python
if not queue:
    print("Queue is empty.")
```

## Section 3: Time Complexity Analysis

Efficient queue operations are crucial for performance, especially in time-sensitive applications. Here’s the time complexity for the primary queue operations using `collections.deque`:

- **Enqueue (append)**: O(1) — Appending to the deque is a constant time operation.
- **Dequeue (popleft)**: O(1) — Popping from the front is also constant time, as `deque` is optimized for such operations.
- **Peek (index access)**: O(1) — Accessing the front element by index is immediate.
- **IsEmpty**: O(1) — Checking for emptiness is a direct operation.

## Section 4: Solved Problems

### Problem 1: [Number of Recent Calls](https://leetcode.com/problems/number-of-recent-calls/)

**Problem Statement**: Implement a `RecentCounter` class to count the number of recent requests within a time frame of 3000 milliseconds before the current call.

**Solution**:

```python
from collections import deque

class RecentCounter:
    def __init__(self):
        self.queue = deque()
    
    def ping(self, t: int) -> int:
        self.queue.append(t)
        while self.queue[0] < t - 3000:
            self.queue.popleft()
        return len(self.queue)
```

**Explanation**:
Use a queue to store call timestamps. When a new call time is recorded, enqueue it. Then, remove all calls from the front of the queue that happened more than 3000 milliseconds before the current call. The size of the queue represents the number of recent calls.

### Problem 2: [Number of Students Unable to Eat Lunch](https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/)

**Problem Statement**: The school cafeteria offers circular and square sandwiches, placed in a stack. At lunchtime, each student can take either the top sandwich or leave it in the stack and go to the end of the line. Students sit in a queue and are initially given a preference list indicating which type of sandwich each prefers. The problem is to determine how many students are unable to eat after all possibilities have been exhausted.

**Solution 1: Simulation**

```python
from collections import deque

def countStudents(students, sandwiches):
    student_queue = deque(students)
    sandwiches.reverse()
    
    attempts = 0

    while sandwiches and student_queue:
        first_student = student_queue.popleft()
        if first_student == sandwiches[-1]:
            sandwiches.pop()
            attempts = 0
        else:
            student_queue.append(first_student)
            attempts += 1
            if attempts == len(student_queue):
                break

    return len(student_queue)
```

**Explanation**  
This solution models the students as a queue and sandwiches as a stack. Students sequentially check the top sandwich. If it matches their preference, they take it and leave the line; otherwise, they go to the back of the line. The `attempts` counter tracks if we've cycled through all students without being able to serve any, indicating a deadlock where no further sandwiches can be served. The loop exits either when all sandwiches are taken or no student can eat the sandwich at the top of the stack.

**Complexity Analysis**:

* Time: O(n^2)
* Space: O(n)

**Solution 2: Counting**

```python
from collections import Counter

def countStudents(students, sandwiches):
    count = Counter(students)
    for sandwich in sandwiches:
        if count[sandwich] > 0:
            count[sandwich] -= 1
        else:
            break
    return count.total()
```

**Explanation:**  
This approach uses a `Counter` to keep track of the number of students preferring each type of sandwich. It iterates over the sandwich stack, decrementing the count of the corresponding sandwich type each time a sandwich is taken. The loop stops when a sandwich cannot be taken (i.e., when there are no students wanting the current sandwich). The function returns the sum of the remaining counts, which represents the number of students who couldn't eat.

**Complexity Analysis**:

* Time: O(n)
* Space: O(1)

### Problem 3: [Implement Stack Using Queues](https://leetcode.com/problems/implement-stack-using-queues/)

**Problem Statement**: Implement a stack using two queues.

**Solution**:

```python
from collections import deque

class MyStack:
    def __init__(self):
        self.main_queue = deque()
        self.aux_queue = deque()
    
    def push(self, x: int):
        self.main_queue.append(x)
    
    def pop(self) -> int:
        while len(self.main_queue) > 1:
            self.aux_queue.append(self.main_queue.popleft())
        popped = self.main_queue.popleft()
        self.main_queue, self.aux_queue = self.aux_queue, self.main_queue
        return popped
    
    def top(self) -> int:
        while len(self.main_queue) > 1:
            self.aux_queue.append(self.main_queue.popleft())
        top = self.main_queue[0]
        self.aux_queue.append(self.main_queue.popleft())
        self.main_queue, self.aux_queue = self.aux_queue, self.main_queue
        return top
    
    def empty(self) -> bool:
        return not self.main_queue
```

**Explanation**:
Maintain two queues, using one as the main storage and the other for operations that require reversing the order (like `pop` and `top`). For `push`, enqueue in the main queue. For `pop` or `top`, dequeue all elements except the last from the main queue to the auxiliary queue, retrieve the last element, and swap the roles of the two queues.

## Section 5: Exercises

1. **[Design Front Middle Back Queue](https://leetcode.com/problems/design-front-middle-back-queue/)**
2. **[Implement Queue Using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)**
3. **[Design Circular Queue](https://leetcode.com/problems/design-circular-queue/)**
4. **[Design Circular Deque](https://leetcode.com/problems/design-circular-deque/)**
5. **[Design Snake Game](https://www.lintcode.com/problem/3656/)**

