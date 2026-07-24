# Chapter 14: Priority Queues and Heaps

## Section 1: Introduction to Priority Queues

Priority queues manage elements based on priority rather than the order of insertion. This behavior is essential for algorithms that require efficient and orderly access to the most critical elements, such as in task scheduling, where tasks with higher urgency are given precedence over others entered later.

## Section 2: Heaps as Priority Queue Implementations

Heaps are [complete binary trees](https://en.wikipedia.org/wiki/Binary_tree#complete) where each parent node's value is either greater than or equal to (max-heap) or less than or equal to (min-heap) its children's values, making them ideal for implementing priority queues.

Python’s [`heapq`](https://docs.python.org/3/library/heapq.html#module-heapq) module provides a simple way to use heaps as min-heaps.

### Min-Heap Implementation

```python
import heapq

# Creating a min-heap
heap = []
heapq.heappush(heap, 10)
heapq.heappush(heap, 1)
heapq.heappush(heap, 5)
smallest = heapq.heappop(heap)  # Returns 1
```

### Max-Heap Workaround

Python's `heapq` module naturally supports min-heaps. To implement a max-heap, invert the values:

```python
# Simulating a max-heap by inverting values
heap = []
heapq.heappush(heap, -10)
heapq.heappush(heap, -1)
heapq.heappush(heap, -5)
largest = -heapq.heappop(heap)  # Returns 10
```

### Heap Operations

- **Heapify ([heapify](https://docs.python.org/3/library/heapq.html#heapq.heapify))**: Converts a list into a heap in linear time, O(n), ensuring the heap property is maintained efficiently.
- **Insertion ([heappush](https://docs.python.org/3/library/heapq.html#heapq.heappush))** and **Deletion ([heappop](https://docs.python.org/3/library/heapq.html#heapq.heappop))**: Both operations run in logarithmic time, O(log n), due to the tree-based nature of heaps.
- **Peek**: Accessing the root element is constant time, O(1), since it's always at the beginning of the list.
- **Replace ([heapreplace](https://docs.python.org/3/library/heapq.html#heapq.heapreplace))** and **Push-Pop ([heappushpop](https://docs.python.org/3/library/heapq.html#heapq.heappushpop))**: These combined operations are optimized to run faster than separate push and pop operations.

```python
current_min = heap[0]  # Peek at the smallest item without removal

replaced_item = heapq.heapreplace(heap, 5)  # Efficiently replace the smallest item
result = heapq.heappushpop(heap, 3)  # Push new item and pop the smallest
```

## Section 3: Solved Problems

### Problem 1: [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)

**Problem Statement**: You have a collection of stones, each stone has a positive integer weight. Each turn, you choose the two heaviest stones and smash them together. Suppose the stones have weights `x` and `y` with `x <= y`. The result of this smash is:
- If `x == y`, both stones are destroyed;
- If `x != y`, the stone of weight `x` is destroyed, and the stone of weight `y` has new weight `y-x`.
Repeat this until there is one stone left or none. Return the weight of the last remaining stone, or `0` if there are no stones left.

**Solution**:

```python
import heapq

def lastStoneWeight(stones):
    # Create a max-heap using negative values because Python heapq is a min-heap by default
    max_heap = [-stone for stone in stones]
    heapq.heapify(max_heap)
    while len(max_heap) > 1:
        first = -heapq.heappop(max_heap)
        second = -heapq.heappop(max_heap)
        if first != second:
            heapq.heappush(max_heap, -(first - second))
    return -max_heap[0] if max_heap else 0
```

**Explanation**:
This function uses a max-heap to simulate the process of smashing stones. By negating the weights, the min-heap (default in Python) acts as a max-heap. In each iteration, the two largest stones are popped from the heap, smashed, and the resulting stone (if any) is pushed back into the heap. This process repeats until there is only one stone left or none. The time complexity is O(n log n), where `n` is the number of stones, because each insert and extract operation is logarithmic in the size of the heap.

### Problem 2: [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)

**Problem Statement**: Design a class to find the k-th largest element in a stream. The class should have methods to add numbers and find the k-th largest element.

**Solution**:

```python
import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = nums
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
```

**Explanation**:
This class maintains a min-heap with the `k` largest elements encountered so far. The smallest of these `k` elements, located at the root of the heap, is the k-th largest element in the stream. When a new number is added, it's pushed to the heap, and if the heap exceeds size `k`, the smallest is removed, ensuring only the `k` largest elements are kept.

### Problem 3: [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)

**Problem Statement**: Given a non-empty array of integers, return the `k` most frequent elements.

**Max-Heap Solution**:

```python
import heapq
from collections import Counter

def topKFrequent(nums, k):
    count = Counter(nums)
    heap = []
    for num, freq in count.items():
        heapq.heappush(heap, (-freq, num))
    return [heapq.heappop(heap)[1] for _ in range(k)]
```

**Min-Heap Solution**:

```python
import heapq
from collections import Counter

def topKFrequent(nums, k):
    count = Counter(nums)
    heap = []
    for num, freq in count.items():
        heapq.heappush(heap, (freq, num))
        if len(heap) > k:
            heapq.heappop(heap)  # Keep the heap size to k
    return [num for _, num in heap]
```

### Problem 4: [Find Subsequence of Length K With the Largest Sum](https://leetcode.com/problems/find-subsequence-of-length-k-with-the-largest-sum/)

**Problem Statement**: Given an integer array `nums` and an integer `k`, find the subsequence of length `k` which has the largest sum. The subsequence should be returned in the order it appears in the original array.

**Solution**:

```python
import heapq

def maxSubsequence(nums, k):
    heap = []
    # Iterate through the array, using a heap to store the k largest elements
    for i, num in enumerate(nums):
        if len(heap) < k:
            heapq.heappush(heap, (num, i))
        elif num > heap[0][0]:
            heapq.heapreplace(heap, (num, i))
    # Sort the heap based on the original indices to maintain the order
    heap.sort(key=lambda x: x[1])
    # Extract the elements, discarding the indices
    return [x for x, _ in heap]
```

**Explanation**:
This implementation maintains a heap of the `k` largest elements encountered so far, along with their indices. The heap ensures that we can efficiently compare each new element to the smallest element in the heap (i.e., `heap[0]`). If the new element is larger, it replaces the smallest one, which maintains the heap's property of storing only the largest elements seen so far. After processing all elements, the heap is sorted based on the indices to ensure the result reflects the order in the original array. The solution runs in O(n log k) time, where `n` is the number of elements in `nums`, due to the heap operations.

### Problem 5: [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/)

**Problem Statement**: Given a `n x n` matrix where each of the rows and columns are sorted in ascending order, find the kth smallest element in the matrix.

**Solution**:

```python
import heapq

def kthSmallest(matrix, k):
    n = len(matrix)
    min_heap = [(matrix[i][0], i, 0) for i in range(n)]
    heapq.heapify(min_heap)
    
    while k:
        element, r, c = heapq.heappop(min_heap)
        if c < n - 1:
            heapq.heappush(min_heap, (matrix[r][c+1], r, c+1))
        k -= 1
    
    return element
```

**Explanation**:
The solution uses a min-heap initialized with the first element of each row. Each time an element is extracted (the smallest available), the next element in the same row is pushed into the heap. This maintains the heap's property and ensures that each element extracted is the next smallest element in the matrix. This continues until the kth smallest element is extracted.

### Problem 6: [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)

**Problem Statement**: Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer `k`, return the `k` closest points to the origin (0, 0).

**Solution**:


```python
import heapq

def kClosest(points, k):
    h = []
    for x, y in points:
        dist = x**2 + y**2
        # Push the first k elements with negative distance to form a max-heap
        if len(h) < k:
            heapq.heappush(h, (-dist, (x, y)))
        # If the current distance is smaller than the largest in the heap, replace it
        elif dist < -h[0][0]:
            heapq.heapreplace(h, (-dist, (x, y)))
    # Extract the points from the heap
    return [coords for _, coords in h]
```

**Explanation**:
This solution leverages a max-heap to maintain the k closest points efficiently. By storing the negative of the distances, the Python min-heap simulates a max-heap behavior. For each point, if the heap hasn't reached the desired size of k, it adds the point. If the heap is full and the current point is closer than the farthest point in the heap (which is at the root due to the max-heap simulation), it replaces that farthest point with the current one. This ensures that, after processing all points, the heap contains the k closest points to the origin. The space complexity is O(k) due to the heap, and the time complexity is O(n log k) because each of the n insertions into the heap (in the worst case, when the heap is full and needs rebalancing) takes logarithmic time in the size of the heap.

### Problem 7: [Find K Pairs with Smallest Sums](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/)

**Problem Statement**: Given two integer arrays `nums1` and `nums2` sorted in ascending order and an integer `k`, create a list of the pairs `(u,v)` which consists of the first `k` pairs with the smallest sums.

**Solution**:

```python
import heapq

def kSmallestPairs(nums1, nums2, k):
    if not nums1 or not nums2:
        return []
    
    min_heap = [(nums1[i] + nums2[0], i, 0) for i in range(min(k, len(nums1)))]
    heapq.heapify(min_heap)
    result = []
    
    while k > 0 and min_heap:
        _, i, j = heapq.heappop(min_heap)
        result.append((nums1[i], nums2[j]))
        if j + 1 < len(nums2):
            heapq.heappush(min_heap, (nums1[i] + nums2[j + 1], i, j + 1))
        k -= 1
    
    return result
```

**Explanation**:
This solution leverages a min-heap to store pairs based on their sum, initializing the heap with the smallest possible pair from each index of `nums1`. The heap ensures that we always pop the pair with the smallest sum, and then push the next pair involving the next element from `nums2`. This process repeats until `k` pairs are formed or all possible pairs are considered.
