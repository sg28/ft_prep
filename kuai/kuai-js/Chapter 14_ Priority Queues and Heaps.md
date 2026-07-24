# Chapter 14: Priority Queues and Heaps

## Section 1: Introduction to Priority Queues

Priority queues manage elements based on priority rather than the order of insertion. This behavior is essential for algorithms that require efficient and orderly access to the most critical elements, such as in task scheduling, where tasks with higher urgency are given precedence over others entered later.

## Section 2: Heaps as Priority Queue Implementations

Heaps are [complete binary trees](https://en.wikipedia.org/wiki/Binary_tree#complete) where each parent node's value is either greater than or equal to (max-heap) or less than or equal to (min-heap) its children's values, making them ideal for implementing priority queues.

Unlike Python, which ships a [`heapq`](https://docs.python.org/3/library/heapq.html#module-heapq) module for using arrays as min-heaps, JavaScript has **no built-in heap**. So the first thing we need is a compact, correct `MinHeap` class that we can reuse throughout this chapter. It supports `push`, `pop`, `peek`, `size`, building from an existing array (`heapify`), and it accepts an optional **comparator** so we can store tuple-like entries (JavaScript arrays such as `[freq, num]`).

### A reusable `MinHeap` class

```javascript
class MinHeap {
  // `compare(a, b)` returns a negative number if a should come out before b.
  // The default comparator works for numbers AND for tuple-like arrays
  // (e.g. [freq, num]), comparing element by element (lexicographically),
  // which mirrors how Python compares tuples in heapq.
  constructor(compare = MinHeap.defaultCompare, items = []) {
    this.compare = compare;
    this.data = [];
    if (items.length) this.heapify(items);
  }

  static defaultCompare(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
      }
      return a.length - b.length;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }

  get length() {
    return this.data.length;
  }

  size() {
    return this.data.length;
  }

  peek() {
    return this.data.length ? this.data[0] : undefined;
  }

  push(item) {
    this.data.push(item);
    this._siftUp(this.data.length - 1);
    return this.length;
  }

  pop() {
    const data = this.data;
    if (data.length === 0) return undefined;
    const top = data[0];
    const last = data.pop();
    if (data.length > 0) {
      data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  // Build a heap from an array in O(n) time.
  heapify(items) {
    this.data = items.slice();
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) {
      this._siftDown(i);
    }
    return this;
  }

  // Pop the smallest, then push `item`: faster than a separate pop + push
  // (equivalent to Python's heapq.heapreplace).
  replace(item) {
    const top = this.data[0];
    this.data[0] = item;
    this._siftDown(0);
    return top;
  }

  // Push `item`, then pop the smallest (equivalent to Python's heapq.heappushpop).
  pushpop(item) {
    if (this.data.length && this.compare(this.data[0], item) < 0) {
      const top = this.data[0];
      this.data[0] = item;
      this._siftDown(0);
      return top;
    }
    return item;
  }

  _siftUp(i) {
    const { data, compare } = this;
    const item = data[i];
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (compare(item, data[parent]) >= 0) break;
      data[i] = data[parent];
      i = parent;
    }
    data[i] = item;
  }

  _siftDown(i) {
    const { data, compare } = this;
    const n = data.length;
    const item = data[i];
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && compare(data[left], data[smallest]) < 0) smallest = left;
      if (right < n && compare(data[right], data[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      data[i] = data[smallest];
      i = smallest;
    }
    data[i] = item;
  }
}
```

### Min-Heap usage

```javascript
// Creating a min-heap
const heap = new MinHeap();
heap.push(10);
heap.push(1);
heap.push(5);
const smallest = heap.pop(); // Returns 1
```

### Max-Heap Workaround

Our `MinHeap` is, as the name says, a min-heap. There are two common ways to get max-heap behavior:

1. **Negate the values** (mirrors the classic Python `heapq` trick):

```javascript
// Simulating a max-heap by inverting values
const heap = new MinHeap();
heap.push(-10);
heap.push(-1);
heap.push(-5);
const largest = -heap.pop(); // Returns 10
```

2. **Pass a reversed comparator** so the largest element is treated as "smallest":

```javascript
// A true max-heap via a custom comparator
const maxHeap = new MinHeap((a, b) => b - a);
maxHeap.push(10);
maxHeap.push(1);
maxHeap.push(5);
const largest = maxHeap.pop(); // Returns 10
```

### Heap Operations

- **Heapify (`heapify`)**: Converts an array into a heap in linear time, O(n), ensuring the heap property is maintained efficiently. Pass the array to the constructor or call `heap.heapify(array)`.
- **Insertion (`push`)** and **Deletion (`pop`)**: Both operations run in logarithmic time, O(log n), due to the tree-based nature of heaps.
- **Peek**: Accessing the root element is constant time, O(1), since it's always at the beginning of the array.
- **Replace (`replace`)** and **Push-Pop (`pushpop`)**: These combined operations are optimized to run faster than separate push and pop operations, matching Python's `heapreplace` and `heappushpop`.

```javascript
const currentMin = heap.peek(); // Peek at the smallest item without removal

const replacedItem = heap.replace(5); // Efficiently replace the smallest item
const result = heap.pushpop(3); // Push new item and pop the smallest
```

## Section 3: Solved Problems

### Problem 1: [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)

**Problem Statement**: You have a collection of stones, each stone has a positive integer weight. Each turn, you choose the two heaviest stones and smash them together. Suppose the stones have weights `x` and `y` with `x <= y`. The result of this smash is:
- If `x == y`, both stones are destroyed;
- If `x != y`, the stone of weight `x` is destroyed, and the stone of weight `y` has new weight `y-x`.
Repeat this until there is one stone left or none. Return the weight of the last remaining stone, or `0` if there are no stones left.

**Solution**:

```javascript
function lastStoneWeight(stones) {
  // Create a max-heap using negative values because our MinHeap is a min-heap
  const maxHeap = new MinHeap(MinHeap.defaultCompare, stones.map((s) => -s));
  while (maxHeap.size() > 1) {
    const first = -maxHeap.pop();
    const second = -maxHeap.pop();
    if (first !== second) {
      maxHeap.push(-(first - second));
    }
  }
  return maxHeap.size() ? -maxHeap.peek() : 0;
}
```

**Explanation**:
This function uses a max-heap to simulate the process of smashing stones. By negating the weights, the min-heap acts as a max-heap. In each iteration, the two largest stones are popped from the heap, smashed, and the resulting stone (if any) is pushed back into the heap. This process repeats until there is only one stone left or none. The time complexity is O(n log n), where `n` is the number of stones, because each insert and extract operation is logarithmic in the size of the heap.

### Problem 2: [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)

**Problem Statement**: Design a class to find the k-th largest element in a stream. The class should have methods to add numbers and find the k-th largest element.

**Solution**:

```javascript
class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap(MinHeap.defaultCompare, nums);
    while (this.heap.size() > k) {
      this.heap.pop();
    }
  }

  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) {
      this.heap.pop();
    }
    return this.heap.peek();
  }
}
```

**Explanation**:
This class maintains a min-heap with the `k` largest elements encountered so far. The smallest of these `k` elements, located at the root of the heap, is the k-th largest element in the stream. When a new number is added, it's pushed to the heap, and if the heap exceeds size `k`, the smallest is removed, ensuring only the `k` largest elements are kept.

### Problem 3: [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)

**Problem Statement**: Given a non-empty array of integers, return the `k` most frequent elements.

**Max-Heap Solution**:

```javascript
function topKFrequent(nums, k) {
  // Count frequencies into a Map (JavaScript has no Counter).
  const count = new Map();
  for (const num of nums) {
    count.set(num, (count.get(num) ?? 0) + 1);
  }
  // Store [-freq, num] so the min-heap behaves like a max-heap on frequency.
  const heap = new MinHeap();
  for (const [num, freq] of count) {
    heap.push([-freq, num]);
  }
  const result = [];
  for (let i = 0; i < k; i++) {
    result.push(heap.pop()[1]);
  }
  return result;
}
```

**Min-Heap Solution**:

```javascript
function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) {
    count.set(num, (count.get(num) ?? 0) + 1);
  }
  // Keep only the k most frequent by evicting the smallest frequency.
  const heap = new MinHeap();
  for (const [num, freq] of count) {
    heap.push([freq, num]);
    if (heap.size() > k) {
      heap.pop(); // Keep the heap size to k
    }
  }
  return heap.data.map(([, num]) => num);
}
```

### Problem 4: [Find Subsequence of Length K With the Largest Sum](https://leetcode.com/problems/find-subsequence-of-length-k-with-the-largest-sum/)

**Problem Statement**: Given an integer array `nums` and an integer `k`, find the subsequence of length `k` which has the largest sum. The subsequence should be returned in the order it appears in the original array.

**Solution**:

```javascript
function maxSubsequence(nums, k) {
  const heap = new MinHeap();
  // Iterate through the array, using a heap to store the k largest elements.
  // Entries are [num, i]; the default comparator orders by num first.
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (heap.size() < k) {
      heap.push([num, i]);
    } else if (num > heap.peek()[0]) {
      heap.replace([num, i]);
    }
  }
  // Sort the remaining entries by their original indices to maintain order.
  const kept = heap.data.slice().sort((a, b) => a[1] - b[1]);
  // Extract the elements, discarding the indices.
  return kept.map(([num]) => num);
}
```

**Explanation**:
This implementation maintains a heap of the `k` largest elements encountered so far, along with their indices. The heap ensures that we can efficiently compare each new element to the smallest element in the heap (i.e., `heap.peek()`). If the new element is larger, it replaces the smallest one, which maintains the heap's property of storing only the largest elements seen so far. After processing all elements, the kept entries are sorted based on the indices to ensure the result reflects the order in the original array. The solution runs in O(n log k) time, where `n` is the number of elements in `nums`, due to the heap operations.

### Problem 5: [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/)

**Problem Statement**: Given a `n x n` matrix where each of the rows and columns are sorted in ascending order, find the kth smallest element in the matrix.

**Solution**:

```javascript
function kthSmallest(matrix, k) {
  const n = matrix.length;
  // Each entry is [value, row, col]; the comparator orders by value first.
  const minHeap = new MinHeap(
    MinHeap.defaultCompare,
    Array.from({ length: n }, (_, i) => [matrix[i][0], i, 0])
  );

  let element;
  while (k > 0) {
    const [value, r, c] = minHeap.pop();
    element = value;
    if (c < n - 1) {
      minHeap.push([matrix[r][c + 1], r, c + 1]);
    }
    k -= 1;
  }

  return element;
}
```

**Explanation**:
The solution uses a min-heap initialized with the first element of each row. Each time an element is extracted (the smallest available), the next element in the same row is pushed into the heap. This maintains the heap's property and ensures that each element extracted is the next smallest element in the matrix. This continues until the kth smallest element is extracted.

### Problem 6: [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

**Problem Statement**: Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer `k`, return the `k` closest points to the origin (0, 0).

**Solution**:

```javascript
function kClosest(points, k) {
  // Compare only by the first element (negated distance) so the coordinate
  // arrays never need to be compared. This forms a max-heap on distance.
  const h = new MinHeap((a, b) => a[0] - b[0]);
  for (const [x, y] of points) {
    const dist = x ** 2 + y ** 2;
    // Push the first k elements with negative distance to form a max-heap.
    if (h.size() < k) {
      h.push([-dist, [x, y]]);
    // If the current distance is smaller than the largest in the heap, replace it.
    } else if (dist < -h.peek()[0]) {
      h.replace([-dist, [x, y]]);
    }
  }
  // Extract the points from the heap.
  return h.data.map(([, coords]) => coords);
}
```

**Explanation**:
This solution leverages a max-heap to maintain the k closest points efficiently. By storing the negative of the distances, the min-heap simulates a max-heap behavior. For each point, if the heap hasn't reached the desired size of k, it adds the point. If the heap is full and the current point is closer than the farthest point in the heap (which is at the root due to the max-heap simulation), it replaces that farthest point with the current one. This ensures that, after processing all points, the heap contains the k closest points to the origin. The space complexity is O(k) due to the heap, and the time complexity is O(n log k) because each of the n insertions into the heap (in the worst case, when the heap is full and needs rebalancing) takes logarithmic time in the size of the heap.

### Problem 7: [Find K Pairs with Smallest Sums](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/)

**Problem Statement**: Given two integer arrays `nums1` and `nums2` sorted in ascending order and an integer `k`, create a list of the pairs `(u,v)` which consists of the first `k` pairs with the smallest sums.

**Solution**:

```javascript
function kSmallestPairs(nums1, nums2, k) {
  if (nums1.length === 0 || nums2.length === 0) {
    return [];
  }

  // Each entry is [sum, i, j]; the comparator orders by sum first.
  const limit = Math.min(k, nums1.length);
  const minHeap = new MinHeap(
    MinHeap.defaultCompare,
    Array.from({ length: limit }, (_, i) => [nums1[i] + nums2[0], i, 0])
  );
  const result = [];

  while (k > 0 && minHeap.size() > 0) {
    const [, i, j] = minHeap.pop();
    result.push([nums1[i], nums2[j]]);
    if (j + 1 < nums2.length) {
      minHeap.push([nums1[i] + nums2[j + 1], i, j + 1]);
    }
    k -= 1;
  }

  return result;
}
```

**Explanation**:
This solution leverages a min-heap to store pairs based on their sum, initializing the heap with the smallest possible pair from each index of `nums1`. The heap ensures that we always pop the pair with the smallest sum, and then push the next pair involving the next element from `nums2`. This process repeats until `k` pairs are formed or all possible pairs are considered.
</content>
</invoke>
