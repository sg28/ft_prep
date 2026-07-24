# Chapter 3: JavaScript Modules and Common Libraries

## Section 1: Built-in Objects and Third-Party Modules

JavaScript ships with a small but powerful set of built-in objects (`Math`, `Map`, `Set`, `Array`, `Object`, `JSON`, etc.), and the npm ecosystem provides a vast collection of third-party packages. Unlike Python, JavaScript does *not* have a large "batteries-included" standard library — many data structures that Python provides out of the box (a heap, a deque, a sorted list) have to be emulated with the primitives you already have, or pulled in from a library. This chapter shows the idiomatic JavaScript equivalents.

### Importing Modules

Modern JavaScript uses ES module syntax to pull in code. Built-in objects like `Math`, `Map`, and `Set` are always available globally with no import at all.

```javascript
// No import needed for built-ins:
Math.sqrt(2);
const m = new Map();
const s = new Set();

// ES module imports for third-party or local modules:
import { MinHeap } from "./heap.js";
import _ from "lodash";
```

In Node.js you may also see the older CommonJS style: `const _ = require("lodash");`.

### Essential Tools

#### collections → built-ins + small helpers

Python's [`collections`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) module offers specialized container datatypes. JavaScript has no direct equivalent module, but its built-in `Map`, `Set`, and `Array`, plus a few tiny helpers, cover the same ground.

- **Counter** (count occurrences): Python's `Counter` is a dictionary subclass for counting hashable objects. In JavaScript, count into a `Map`.

    ```javascript
    // Count the occurrences of each character in a string
    function counter(iterable) {
      const counts = new Map();
      for (const item of iterable) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
      return counts;
    }

    const characterCounts = counter("mississippi");
    console.log(characterCounts);
    // Map(4) { 'm' => 1, 'i' => 4, 's' => 4, 'p' => 2 }

    // Find the two most common elements (like Counter.most_common(2))
    function mostCommon(counts, n) {
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
    }
    console.log(mostCommon(characterCounts, 2)); // [ [ 'i', 4 ], [ 's', 4 ] ]

    // Increment the count with additional characters (like Counter.update)
    for (const ch of "state") {
      characterCounts.set(ch, (characterCounts.get(ch) ?? 0) + 1);
    }
    console.assert(characterCounts.get("s") === 5);
    ```

- **deque** (double-ended queue): Python's `deque` allows fast appends and pops from both ends. JavaScript has no built-in deque. A plain array supports `push`/`pop` at the right end in O(1), and `unshift`/`shift` at the left end — but `unshift`/`shift` are O(n) because every other element must be re-indexed. For short examples that is fine; for performance-sensitive queues (like BFS) prefer an index-pointer over an array (see the queue chapter).

    ```javascript
    // Using a plain array as a deque (shift/unshift are O(n) — note the tradeoff)
    const dq = ["a", "b", "c"];

    dq.push("d");        // Add to the right end
    dq.unshift("z");     // Add to the left end
    console.log(dq);     // [ 'z', 'a', 'b', 'c', 'd' ]

    dq.pop();            // Remove from the right end -> 'd'
    dq.shift();          // Remove from the left end -> 'z'
    console.log(dq);     // [ 'a', 'b', 'c' ]
    ```

- **namedtuple** (tuple with named fields): Python's `namedtuple` creates readable, self-documenting tuple-like objects. JavaScript reaches for a plain object (or a small class) instead. Objects give you named fields directly; use `Object.freeze` to make them immutable.

    ```javascript
    // A "point in 2D space" — a plain object with named fields
    function Point(x, y) {
      return Object.freeze({ x, y });
    }

    const p = Point(11, 22);

    // Accessing the elements by name
    console.log(p.x + p.y); // 33

    // Object.freeze makes it immutable:
    // p.x = 33; // silently ignored (throws in strict mode)
    ```

- **defaultdict** (dictionary with default factory): Python's `defaultdict` supplies a default value for missing keys automatically. In JavaScript, use a `Map` with a get-or-initialize pattern.

    ```javascript
    // Emulating defaultdict(list): initialize an empty array on first access
    const dd = new Map();

    function getOrInit(map, key, factory) {
      if (!map.has(key)) map.set(key, factory());
      return map.get(key);
    }

    getOrInit(dd, "fruits", () => []).push("apple");
    getOrInit(dd, "fruits", () => []).push("banana");
    getOrInit(dd, "veggies", () => []).push("carrot");

    console.log(dd);
    // Map(2) { 'fruits' => [ 'apple', 'banana' ], 'veggies' => [ 'carrot' ] }
    ```

#### itertools → generators

Python's [`itertools`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) provides combinatorial tools like permutations and combinations. JavaScript has no equivalent, but generator functions make it easy to write lazy, memory-efficient versions.

```javascript
// Generate permutations of length r from an iterable (like itertools.permutations)
function* permutations(iterable, r) {
  const pool = [...iterable];
  const n = pool.length;
  r = r === undefined ? n : r;
  if (r > n) return;

  const indices = [...Array(n).keys()];
  const cycles = [];
  for (let i = n; i > n - r; i--) cycles.push(i);

  yield indices.slice(0, r).map((i) => pool[i]);

  while (n > 0) {
    let done = true;
    for (let i = r - 1; i >= 0; i--) {
      cycles[i] -= 1;
      if (cycles[i] === 0) {
        const first = indices[i];
        for (let j = i; j < n - 1; j++) indices[j] = indices[j + 1];
        indices[n - 1] = first;
        cycles[i] = n - i;
      } else {
        const j = n - cycles[i];
        [indices[i], indices[j]] = [indices[j], indices[i]];
        yield indices.slice(0, r).map((k) => pool[k]);
        done = false;
        break;
      }
    }
    if (done) return;
  }
}

// Generate combinations of length r (like itertools.combinations)
function* combinations(iterable, r) {
  const pool = [...iterable];
  const n = pool.length;
  if (r > n) return;

  const indices = [...Array(r).keys()];
  yield indices.map((i) => pool[i]);

  while (true) {
    let i;
    for (i = r - 1; i >= 0; i--) {
      if (indices[i] !== i + n - r) break;
    }
    if (i < 0) return;
    indices[i] += 1;
    for (let j = i + 1; j < r; j++) indices[j] = indices[j - 1] + 1;
    yield indices.map((k) => pool[k]);
  }
}

// Permutations of 'ABCD' with length 2
for (const permutation of permutations("ABCD", 2)) {
  console.log(permutation.join(""));
}

// Combinations of 'ABCDE' with length 3
for (const combination of combinations("ABCDE", 3)) {
  console.log(combination.join(""));
}
```

#### functools → higher-order functions and memoization

Python's [`functools`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) provides tools for functional-style programming, such as `reduce` and the `lru_cache` decorator. In JavaScript, `Array.prototype.reduce` is built in, and caching is done with a wrapper function backed by a `Map`.

```javascript
// Array.prototype.reduce is built in — product of list elements
const product = [1, 2, 3, 4].reduce((x, y) => x * y);
console.log(product); // 24

// Emulate lru_cache: a memoizing wrapper backed by a Map
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Efficient recursive Fibonacci with memoization
const fibonacci = memoize(function fib(n) {
  if (n === 0 || n === 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(50)); // 12586269025
```

Note that the recursive calls must go through the memoized reference (`fibonacci`), not the inner name, so that each subproblem hits the cache.

#### Math

JavaScript's built-in [`Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) object covers square roots, trigonometry, logarithms, and more. A few of Python's `math` functions have no direct equivalent (`factorial`, `hypot` in older environments, `comb`, `gcd`), so we write small helpers.

```javascript
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function comb(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

console.log(factorial(5));       // 120
console.log(Math.hypot(3, 4));   // 5
console.log(Math.floor(3 / 2));  // 1
console.log(Math.ceil(3 / 2));   // 2
console.log(Math.sqrt(2));       // 1.4142135623730951
console.log(2 ** 3);             // 8
console.log(comb(6, 2));         // 15
console.log(gcd(15, 25));        // 5
console.log(`The area of a unit circle is ${Math.PI}`);
```

#### heapq → a MinHeap class

Python's [`heapq`](https://docs.python.org/3/library/heapq.html) implements a priority queue. JavaScript has **no built-in heap**, so we include a compact, correct `MinHeap` class. It supports `push`, `pop`, `peek`, and `size`. For a max-heap, negate the values or pass a custom comparator.

```javascript
class MinHeap {
  constructor(compare = (a, b) => a - b) {
    this.heap = [];
    this.compare = compare;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(value) {
    this.heap.push(value);
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  _siftUp(i) {
    const value = this.heap[i];
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(value, this.heap[parent]) >= 0) break;
      this.heap[i] = this.heap[parent];
      i = parent;
    }
    this.heap[i] = value;
  }

  _siftDown(i) {
    const n = this.heap.length;
    const value = this.heap[i];
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest === i) break;
      this.heap[i] = this.heap[smallest];
      i = smallest;
    }
    this.heap[i] = value;
  }
}

// Build a min heap from a list of numbers
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const heap = new MinHeap();
for (const num of numbers) heap.push(num);

// Add an element and pop the smallest
heap.push(7);
const smallest = heap.pop();
console.log(`Smallest element: ${smallest}`); // 1
console.log(`Heap size: ${heap.size()}`);
```

#### random → Math.random

Python's [`random`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) module offers tools for generating random numbers, picking random elements, and shuffling. In JavaScript, everything is built on [`Math.random()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random), which returns a float in `[0, 1)`.

```javascript
// Random integer between min and max, inclusive (like random.randint)
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random element from an array (like random.choice)
function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// In-place Fisher-Yates shuffle (like random.shuffle)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

console.log(randint(1, 100));
console.log(choice(["apple", "banana", "cherry"]));

const nums = [1, 2, 3, 4, 5];
shuffle(nums);
console.log(`Shuffled list: ${nums}`);
```

#### sortedcontainers → a sorted array with binary search

Python's third-party [`sortedcontainers`](https://grantjenks.com/docs/sortedcontainers/) module provides efficient sorted collection types (`SortedList`, `SortedDict`, `SortedSet`). JavaScript has **no built-in sorted collection**. The straightforward approach is a plain array kept in sorted order, using binary search (`bisectLeft`/`bisectRight`) to find the insertion point and `splice` to insert. Insertion/removal are O(n) because of the `splice` shift; production code that needs O(log n) would reach for a balanced-BST library (for example `js-sdsl` or a `@datastructures-js` package).

```javascript
// Binary search: leftmost index where target can be inserted to keep sorted order
function bisectLeft(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Rightmost insertion point
function bisectRight(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

class SortedList {
  constructor(iterable = []) {
    this.data = [...iterable].sort((a, b) => a - b);
  }
  add(value) {
    this.data.splice(bisectRight(this.data, value), 0, value);
  }
  get length() {
    return this.data.length;
  }
  get(i) {
    return this.data[i];
  }
}

const sl = new SortedList([4, 1, 5, 2]);
sl.add(3);
console.log(sl.data); // [ 1, 2, 3, 4, 5 ]
```

A "sorted dictionary" or "sorted set" can be built the same way: keep the keys/elements in a sorted array and binary-search them, storing values in a companion `Map` when you need key→value lookups.

## Section 2: Solved Problems

### Problem 1: Square Triangular Numbers

**Problem Statement**: A **square triangular number** is a positive integer that is both a [square number](https://en.wikipedia.org/wiki/Square_number) and a [triangular number](https://en.wikipedia.org/wiki/Triangular_number).

- A **triangular number** T(n) is the sum of the first n positive integers: T($n$) = $1 + 2 + 3 + ... + n$ = $n(n+1)/2$
- A **square number** is an integer that can be expressed as $k^2$ for some integer $k$

Write a function that finds the first `count` square triangular numbers.

For example, the first 4 square triangular numbers are `[1, 36, 1225, 41616]`.

**Solution:**

The idea is to generate triangular numbers and check if they're perfect squares.

```javascript
function isPerfectSquare(n) {
  const root = Math.floor(Math.sqrt(n));
  return root * root === n;
}

function findSquareTriangularNumbers(count) {
  const result = [];
  let n = 1;

  while (result.length < count) {
    const triangular = Math.floor((n * (n + 1)) / 2);

    if (isPerfectSquare(triangular)) {
      result.push(triangular);
    }

    n += 1;
  }

  return result;
}

console.log(findSquareTriangularNumbers(4)); // [ 1, 36, 1225, 41616 ]
```

### Problem 2: Integer Arrangements

**Problem Statement**: Find the number of unique 5-digit integers that can be formed from the digits 1, 2, 3, 4, and 5, ensuring the digit 1 is always to the left of 2.

**Solution:**

The total permutations of the digits 1, 2, 3, 4, and 5 are `5!` (factorial of 5). In half of these permutations, 1 will be to the left of 2, and in the other half, 1 will be to the right of 2. Hence, the solution is simply half of all the permutations: `5! / 2 = 60`.

```javascript
// Reuses the permutations generator from Section 1
let count = 0;
for (const p of permutations([1, 2, 3, 4, 5])) {
  if (p.indexOf(1) < p.indexOf(2)) {
    count += 1;
  }
}

console.log(`Total numbers where 1 is left of 2: ${count}`); // 60
```

### Problem 3: Validate Ramanujan's equation

Write a program to verify

$$
\sqrt{\frac{\pi e}{2}} = S + C
$$
where 
   $$
     S = \frac{1}{1} + \frac{1}{1 \cdot 3} + \frac{1}{1 \cdot 3 \cdot 5} + \frac{1}{1 \cdot 3 \cdot 5 \cdot 7} + \cdots
   $$
and
   $$
     C = \cfrac{1}{1 + \cfrac{1}{1 + \cfrac{2}{1 + \cfrac{3}{1 + \cfrac{4}{1 + \ddots}}}}}.
   $$

## Solution

JavaScript's `Math` object exposes `Math.PI` and `Math.E`. There is no built-in "is close" helper, so we compare within a small tolerance.

```javascript
function approxS(N) {
  let s = 0.0;
  let prev = 1.0;
  for (let n = 0; n < N; n++) {
    prev /= 2 * n + 1;
    s += prev;
  }
  return s;
}

function approxC(N) {
  let val = 0.0;
  for (let k = N - 1; k >= 0; k--) {
    val = (k || 1) / (1 + val);
  }
  return val;
}

function isClose(a, b, relTol = 1e-9) {
  return Math.abs(a - b) <= relTol * Math.max(Math.abs(a), Math.abs(b));
}

function main() {
  const N = 1000;
  const approx = approxS(N) + approxC(N);
  const trueVal = Math.sqrt((Math.PI * Math.E) / 2);
  console.assert(isClose(trueVal, approx));
}

main();
```

### Problem 4: Counting Special Five-Digit Numbers

**Problem Statement**: Calculate the number of distinct five-digit numbers that can be formed using the digits 1 through 9, with the condition that one digit appears exactly once and two other digits each appear exactly twice in the number.

**Solution:**

Calculating combinations:

- Choose the single digit: 9 ways.
- Choose two digits that appear twice: $\binom{8}{2} = 28$ ways.

To arrange, we have five slots:

- Place the first set of duplicates: $\binom{5}{2} = 10$ ways.
- Place the second set of duplicates: $\binom{3}{2} = 3$ ways.
- Place the single digit: 1 way.

Total: $9 \times 28 \times 10 \times 3 = 7560$.

Python's `itertools.product(range(1, 10), repeat=5)` iterates over the Cartesian product of the digits 1–9 taken 5 at a time. We write a small `product` generator to do the same.

```javascript
// Cartesian product of `pool` repeated `repeat` times (like itertools.product)
function* product(pool, repeat) {
  const n = pool.length;
  const indices = new Array(repeat).fill(0);
  while (true) {
    yield indices.map((i) => pool[i]);
    let i = repeat - 1;
    while (i >= 0) {
      indices[i] += 1;
      if (indices[i] < n) break;
      indices[i] = 0;
      i -= 1;
    }
    if (i < 0) return;
  }
}

function count() {
  let res = 0;
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const perm of product(digits, 5)) {
    const [a, b, c, d, e] = [...perm].sort((x, y) => x - y);
    if (
      (a < b && b === c && c < d && d === e) ||
      (a === b && b < c && c < d && d === e) ||
      (a === b && b < c && c === d && d < e)
    ) {
      res += 1;
    }
  }
  return res;
}

console.assert(count() === 7560);
```

### Problem 5: [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)

**Problem Statement:** Implement a class that continuously adds numbers to a collection and can return the median at any point.

**Solution:**

Since JavaScript has no sorted collection, we keep a sorted array and use binary search (`bisectRight` from Section 1) to insert each number in order. This makes `addNum` O(n) but `findMedian` O(1).

```javascript
function bisectRight(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

class MedianFinder {
  constructor() {
    this.data = [];
  }

  addNum(num) {
    this.data.splice(bisectRight(this.data, num), 0, num);
  }

  findMedian() {
    const n = this.data.length;
    if (n % 2 === 0) {
      return (this.data[n / 2 - 1] + this.data[n / 2]) / 2.0;
    }
    return this.data[Math.floor(n / 2)];
  }
}

const mf = new MedianFinder();
mf.addNum(1);
mf.addNum(3);
console.log(`Current median: ${mf.findMedian()}`); // 2
mf.addNum(2);
console.log(`Updated median: ${mf.findMedian()}`); // 2
```

A more scalable O(log n) solution uses two heaps (a max-heap for the lower half and a min-heap for the upper half) — see the priority queue chapter for that approach, built on the `MinHeap` class above.

### Problem 6: [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)

**Problem Statement:** Given a non-empty array of integers, return the k most frequent elements.

**Solution:**

We count frequencies into a `Map`, then sort the entries by count and take the top k.

```javascript
function topKFrequent(nums, k) {
  const count = new Map();
  for (const num of nums) {
    count.set(num, (count.get(num) ?? 0) + 1);
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map((entry) => entry[0]);
}

const nums = [1, 1, 1, 2, 2, 3];
const k = 2;
console.log(topKFrequent(nums, k)); // [ 1, 2 ]
```

### Problem 7: String Matches

**Problem Statement**: Given two strings `s1` and `s2`, calculate the matches of `s1` and `s2`, where a match is defined as the number of `(i, j)` pairs such that `0 <= i < s1.length`, `0 <= j < s2.length`, and `s1[i] === s2[j]`.

**Solution:**

Count the characters of each string, then for every character in `s1` multiply its count by the same character's count in `s2` and sum.

```javascript
function counter(str) {
  const counts = new Map();
  for (const ch of str) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return counts;
}

function getMatches(s1, s2) {
  const s1Counts = counter(s1);
  const s2Counts = counter(s2);
  let total = 0;
  for (const [char, count1] of s1Counts) {
    total += count1 * (s2Counts.get(char) ?? 0);
  }
  return total;
}

console.log(getMatches("abc", "bcd")); // 2
```

### Problem 8: [Redistribute Characters to Make All Strings Equal](https://leetcode.com/problems/redistribute-characters-to-make-all-strings-equal/)

**Problem Statement**: Determine if it is possible to redistribute characters in such a way that all strings are equal. A redistribution means rearranging characters such that every string becomes the same.

**Solution**:

```javascript
function canMakeEqual(words) {
  const counts = new Map();
  for (const word of words) {
    for (const ch of word) {
      counts.set(ch, (counts.get(ch) ?? 0) + 1);
    }
  }
  return [...counts.values()].every((count) => count % words.length === 0);
}

console.log(canMakeEqual(["abc", "aabc", "bc"])); // true
```

**Explanation**:
This function first counts the occurrences of each character across all strings by accumulating into a `Map`. It then checks whether the total occurrences of each character can be evenly distributed among all the strings by checking if each character count modulo the number of strings (`words.length`) is zero. If every character meets this condition, the strings can be redistributed equally.

The time complexity is O(N * L) where N is the number of words and L is the average length of the words, due to iterating over each character in each word to build the character count. Checking the conditions for redistribution runs in O(K), where K is the number of unique characters, making the total time complexity O(N * L + K).

### Problem 9: [Generate Random Point in a Circle](https://leetcode.com/problems/generate-random-point-in-a-circle/)

**Problem Statement**: Given the radius and x, y positions of the center of a circle, write a function to generate a random point inside the circle. Each point generated must be uniformly distributed within the circle.

**Solution 1: [Rejection Sampling](https://en.wikipedia.org/wiki/Rejection_sampling)**

You generate a point in the square that bounds the circle and then check if the point is inside the circle. If it's not, you reject it and generate another point. Python's `random.uniform(a, b)` returns a float in `[a, b]`; we build the same with `Math.random()`.

```javascript
function uniform(a, b) {
  return a + Math.random() * (b - a);
}

class Solution {
  constructor(radius, xCenter, yCenter) {
    this.radius = radius;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
  }

  randPoint() {
    while (true) {
      // Generate a random point in the bounding square
      const x = uniform(this.xCenter - this.radius, this.xCenter + this.radius);
      const y = uniform(this.yCenter - this.radius, this.yCenter + this.radius);

      // Check if the point is inside the circle
      if ((x - this.xCenter) ** 2 + (y - this.yCenter) ** 2 <= this.radius ** 2) {
        return [x, y];
      }
    }
  }
}
```

**Solution 2: [Polar Coordinates](https://en.wikipedia.org/wiki/Polar_coordinate_system#Converting_between_polar_and_Cartesian_coordinates)**

This method utilizes polar coordinates to ensure every generated point is inside the circle, leveraging the uniform distribution of angles and the square root trick for radius to ensure uniform distribution within the circle's area.

```javascript
class Solution {
  constructor(radius, xCenter, yCenter) {
    this.radius = radius;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
  }

  randPoint() {
    // Generate a random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const sqrtR = Math.sqrt(Math.random()) * this.radius;

    // Calculate x and y coordinates
    const x = this.xCenter + sqrtR * Math.cos(angle);
    const y = this.yCenter + sqrtR * Math.sin(angle);

    return [x, y];
  }
}
```

**Explanation:**

1. **Calculating Cartesian Coordinates:** The polar coordinates (r, θ) are transformed into Cartesian coordinates (x, y) using the trigonometric relationships $x = r \cos(θ)$ and $y = r \sin(θ)$, adjusted for the circle's center.
2. **Random Angle Generation:** A random angle θ is picked from the interval $[0, 2\pi)$, which corresponds to a full rotation around the circle.
3. **Radius Distribution Correction:** To choose a point uniformly within a circle of radius $R$, we need to adjust the distribution of the radius values to compensate for the increased area at larger radii. This is done using a probability density function (PDF) and cumulative distribution function (CDF) for the distance $R$ from the center, as follows:

    The PDF reflects the need for more points at larger radii to maintain uniformity:
    $$
      f_R(r) = \frac{2r}{R^2} \quad \text{for} \quad 0 \leq r \leq R
    $$

    The CDF is derived by integrating the PDF:
    $$
      F_R(r) = \int_0^r \frac{2t}{R^2} \, dt = \frac{r^2}{R^2} \quad \text{for} \quad 0 \leq r \leq R 
    $$
    This function gives the probability that the distance from the center is less than or equal to $r$.

    To sample a point uniformly, we use the inverse of the CDF:
    $$
      r = R \sqrt{u} \quad \text{for} \quad u \in [0,1]
    $$
   
    Here, $u$ is a uniformly generated number between 0 and 1. The square root transformation corrects the distribution, ensuring uniformity across the circle.
