# Chapter 15: Sorted Sets and Sorted Dictionaries

Unlike Java, which includes built-in [`TreeMap`](https://docs.oracle.com/en%2Fjava%2Fjavase%2F11%2Fdocs%2Fapi%2F%2F/java.base/java/util/TreeMap.html) and [`TreeSet`](https://docs.oracle.com/en%2Fjava%2Fjavase%2F11%2Fdocs%2Fapi%2F%2F/java.base/java/util/TreeSet.html) for maintaining sorted collections, JavaScript does not come with sorted collections in its standard library either. Its built-in `Set` and `Map` preserve *insertion* order, not sorted order, and they provide no way to look up an element by rank or to find the nearest neighbor of a value.

Because there is no equivalent of Java's `TreeSet`/`TreeMap` (or of a third-party helper like Python's `sortedcontainers`), we implement the behavior ourselves. The simplest correct approach is a **sorted array** paired with **binary-search helpers** (`bisectLeft` / `bisectRight`). Inserting keeps the array sorted, and binary search gives O(log n) lookups. Insertion and deletion cost O(n) because of the `splice` shift, which is fine for interview-sized inputs. Production code that needs true O(log n) mutation would reach for a balanced binary-search tree (a self-balancing BST such as a red-black or AVL tree) or a well-tested library.

## Section 0: Building Blocks

The two binary-search helpers below are the foundation for everything in this chapter. They operate on an already-sorted array.

```javascript
// Index of the first element >= target (leftmost insertion point).
function bisectLeft(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Index of the first element > target (rightmost insertion point).
function bisectRight(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
```

A small `SortedSet` class wraps these helpers to mirror the sorted-collection API we need:

```javascript
class SortedSet {
  constructor(iterable = []) {
    this.arr = [];
    for (const x of iterable) this.add(x);
  }

  add(value) {
    const idx = bisectLeft(this.arr, value);
    if (this.arr[idx] === value) return; // already present, keep it a set
    this.arr.splice(idx, 0, value);
  }

  has(value) {
    const idx = bisectLeft(this.arr, value);
    return this.arr[idx] === value;
  }

  // Remove and return the element at position idx (negative indexes allowed).
  popAt(idx = -1) {
    if (idx < 0) idx += this.arr.length;
    return this.arr.splice(idx, 1)[0];
  }

  bisectLeft(value) {
    return bisectLeft(this.arr, value);
  }

  bisectRight(value) {
    return bisectRight(this.arr, value);
  }

  at(idx) {
    // Supports negative indexing like arr[-1] in Python.
    return idx < 0 ? this.arr[this.arr.length + idx] : this.arr[idx];
  }

  get size() {
    return this.arr.length;
  }

  toString() {
    return `SortedSet([${this.arr.join(", ")}])`;
  }
}
```

## Section 1: Introduction to Sorted Collections

### SortedSet

A `SortedSet` behaves similarly to a standard `Set` but maintains its elements in a sorted order:

```javascript
const ss = new SortedSet([9, 8, 7, 6]);
console.log(ss.toString()); // Output: SortedSet([6, 7, 8, 9])

ss.add(1);
console.log(ss.toString()); // Output: SortedSet([1, 6, 7, 8, 9])
```

### SortedDict

There is no built-in sorted map either. We can build a `SortedDict` on top of the same idea: keep the keys in a sorted array (using the `bisect` helpers) and store the values in a plain `Map`. It behaves like a regular map but keeps its keys sorted:

```javascript
class SortedDict {
  constructor(entries = []) {
    this.keys = [];          // sorted array of keys
    this.map = new Map();    // key -> value
    for (const [k, v] of entries) this.set(k, v);
  }

  set(key, value) {
    if (!this.map.has(key)) {
      const idx = bisectLeft(this.keys, key);
      this.keys.splice(idx, 0, key);
    }
    this.map.set(key, value);
  }

  get(key) {
    return this.map.get(key);
  }

  has(key) {
    return this.map.has(key);
  }

  bisectRight(key) {
    return bisectRight(this.keys, key);
  }

  bisectLeft(key) {
    return bisectLeft(this.keys, key);
  }

  // Return [key, value] at position idx (negative indexes allowed).
  peekitem(idx = -1) {
    if (idx < 0) idx += this.keys.length;
    const key = this.keys[idx];
    return [key, this.map.get(key)];
  }

  get size() {
    return this.keys.length;
  }

  toString() {
    const body = this.keys.map((k) => `${k}: ${this.map.get(k)}`).join(", ");
    return `SortedDict({${body}})`;
  }
}
```

```javascript
const sd = new SortedDict([[9, 40], [8, 30], [7, 20], [6, 10]]);
console.log(sd.toString()); // Output: SortedDict({6: 10, 7: 20, 8: 30, 9: 40})

sd.set(1, 100);
console.log(sd.toString()); // Output: SortedDict({1: 100, 6: 10, 7: 20, 8: 30, 9: 40})
```

## Section 2: Common Operations

Both `SortedSet` and `SortedDict` above expose the operations that make sorted data useful. Thanks to binary search over the sorted backing array, lookups such as membership checking and bisecting run in O(log n) time (individual insertions and deletions are O(n) because of the `splice` shift; a [balanced tree structure](https://en.wikipedia.org/wiki/Self-balancing_binary_search_tree) would make those O(log n) as well).

### SortedSet Operations

- **Accessing Elements by Index**: Unlike a regular `Set`, `SortedSet` maintains its elements in sorted order, allowing you to access the smallest, largest, or any element at a specific index directly.

  ```javascript
  const ss = new SortedSet([20, 30, 40, 50, 15, 5]);

  const smallest = ss.at(0);      // Retrieves the smallest item, which is 5
  const largest = ss.at(-1);      // Retrieves the largest item, which is 50
  const middleItem = ss.at(3);    // Retrieves the fourth smallest item, which is 30
  ```

- **Bisect Left**: Position of the first item greater than or equal to the element.

  ```javascript
  const ss = new SortedSet([10, 27, 9, 6, 3]);
  console.log(ss.toString()); // Output: SortedSet([3, 6, 9, 10, 27])

  const idx = ss.bisectLeft(10);
  console.assert(ss.at(idx) === 10); // The smallest item that's at least 10 is 10.
  ```

- **Bisect Right**: Position of the first item greater than the element.

  ```javascript
  const ss = new SortedSet([10, 27, 9, 6, 3]);
  console.log(ss.toString()); // Output: SortedSet([3, 6, 9, 10, 27])

  const idx = ss.bisectRight(10);
  console.assert(ss.at(idx) === 27); // The smallest item that's greater than 10 is 27.
  ```

### SortedDict Operations

- **Peek Items**: Retrieves an item by its position.

  ```javascript
  const sd = new SortedDict([[3, "Mar"], [2, "Feb"], [1, "Jan"]]);
  const [smallestKey, val1] = sd.peekitem(0);
  const [largestKey, val2] = sd.peekitem(-1);

  console.assert(val1 === "Jan");
  console.assert(val2 === "Mar");
  ```

## Section 3: Solved Problems

### Problem 1: [Smallest Number in Infinite Set](https://leetcode.com/problems/smallest-number-in-infinite-set/description/)

**Problem Statement**: Design a class to manage an initially infinite set of positive integers, allowing for the retrieval and removal of the smallest integer, and the addition of new integers to the set.

**Solution**:

```javascript
class SmallestInfiniteSet {
  constructor() {
    this.addedBacks = new SortedSet();
    this.min = 1;
  }

  popSmallest() {
    let ans;
    if (this.addedBacks.size > 0) {
      ans = this.addedBacks.popAt(0);
    } else {
      ans = this.min;
      this.min += 1;
    }
    return ans;
  }

  addBack(num) {
    if (num < this.min) {
      this.addedBacks.add(num);
    }
  }
}
```

**Explanation**:

- **`constructor`**: Initializes a `SortedSet` to keep track of numbers added back to the set and a `min` counter for the next smallest number.
- **`popSmallest`**: Returns the smallest number from the set. If `addedBacks` is not empty, it returns and removes the smallest number. Otherwise, it uses and increments the `min` counter.
- **`addBack`**: Adds a number back into the set only if it is less than the current minimum, ensuring that all returned numbers are managed correctly. Because `SortedSet.add` ignores duplicates, adding the same number twice is harmless.

### Problem 2: [My Calendar I](https://leetcode.com/problems/my-calendar-i/)

**Problem Statement**: Implement a class that stores event intervals. The class should ensure that no two events overlap.

**Solution**:

```javascript
class MyCalendar {
  constructor() {
    // Use a SortedDict to maintain ordered events by start times.
    this.events = new SortedDict();
  }

  book(start, end) {
    // Find the position where the new event should be placed.
    const currIdx = this.events.bisectRight(start);

    // Check the previous event for overlap.
    if (currIdx > 0) {
      const [, prevEnd] = this.events.peekitem(currIdx - 1);
      if (prevEnd > start) {
        return false; // Overlaps with the previous event.
      }
    }

    // Check the next event for overlap.
    if (currIdx < this.events.size) {
      const [nextStart] = this.events.peekitem(currIdx);
      if (end > nextStart) {
        return false; // Overlaps with the next event.
      }
    }

    // If no overlap, add to events.
    this.events.set(start, end);
    return true;
  }
}
```

**Explanation**:

- The `MyCalendar` class uses a `SortedDict` to maintain a sorted order of events by their start times.
- The `book` method checks if a new event can be added without overlapping with existing events. It does this by locating where the new event should be inserted (`bisectRight`) and checking against the nearest events.
- `peekitem` is used to access items by index to compare the new event's times with the closest events already in the calendar.


## Section 4: Exercises

1. **[My Calendar II](https://leetcode.com/problems/my-calendar-ii/description/)**
2. **[Stock Price Fluctuation](https://leetcode.com/problems/stock-price-fluctuation)**
</content>
</invoke>
