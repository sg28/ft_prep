# Chapter 12: Maps and Objects

## Section 1: Introduction to Maps and Objects

JavaScript gives you two natural ways to associate keys with values. The [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object and the plain object (`{}`) both use a [hash table](https://en.wikipedia.org/wiki/Hash_table) under the hood, giving average-time complexity of O(1) for retrieving, inserting, and deleting elements.

The two differ in important ways:

- A **plain object** only accepts strings and symbols as keys (any other value is coerced to a string). It also inherits keys from `Object.prototype` (like `toString` and `constructor`), which can leak into your data.
- A **`Map`** accepts keys of *any* type — strings, numbers, booleans, objects, even functions — and compares them by identity (via the [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) algorithm). It also preserves insertion order and exposes its size directly via `.size`.

For interview problems where keys are arbitrary or numeric, `Map` is usually the better default. When keys are known strings and you want lightweight record-like data, a plain object is fine. This chapter uses `Map` as the primary tool and reaches for objects where they read more naturally.

## Section 2: Map and Object Operations

### Creating Maps and Objects

Objects are declared with curly braces `{}`. Maps are created with the `Map` constructor, optionally seeded from an iterable of `[key, value]` pairs:

```javascript
// Using an object literal (string keys)
const fruitPrices = { apple: 3.99, banana: 1.99, cherry: 6.99 };

// Using an object literal for record-like data
const userProfile = { name: "Eric Doe", age: 30, email: "eric.doe@example.com" };

// Using a Map, seeded from an array of [key, value] pairs (keys can be any type)
const days = new Map([
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
]);
```

### Modifying Maps and Objects

For a `Map`, use `set(key, value)` to add or update entries. For a plain object, use bracket or dot indexing:

```javascript
const inventory = new Map([
  ["apple", 1],
  ["banana", 2],
]);
inventory.set("apple", 4); // Updates the value of the existing key 'apple'
inventory.set("cherry", 3); // Adds a new key 'cherry'

// Merging another set of entries into the Map
for (const [k, v] of new Map([["mangoes", 22], ["bananas", 25]])) {
  inventory.set(k, v);
}
console.log(inventory);
// Map(5) { 'apple' => 4, 'banana' => 2, 'cherry' => 3, 'mangoes' => 22, 'bananas' => 25 }
```

For plain objects, `Object.assign(target, source)` or the spread syntax `{ ...target, ...source }` merges one object into another.

**Time Complexity**:

* Individual add/update: O(1) on average.
* Bulk merge: O(k), where k is the number of keys added/updated.

### Removing Entries

Use `Map.prototype.delete(key)` to remove an entry; it returns `true` if the key existed. For plain objects, use the `delete` operator:

```javascript
// Removing an entry from a Map
inventory.delete("oranges"); // returns false (no such key), Map is unchanged

// Capturing the value before removing it
const mangoesCount = inventory.get("mango") ?? 0; // 0 if not present
inventory.delete("mango");

// Removing a property from a plain object
delete fruitPrices.cherry;
```

### Accessing Data

For a `Map`, read values with `get(key)`, which returns `undefined` for missing keys. Combine it with the nullish coalescing operator `??` to supply a default:

```javascript
// Direct access (undefined if 'apple' isn't a key)
let appleCount = inventory.get("apple");

// Safe access with a default
appleCount = inventory.get("apple") ?? 0; // Returns 0 if 'apple' is not found
```

For a plain object, `obj.key` or `obj["key"]` returns `undefined` when the property is absent.

### Checking Membership

Determine whether a key exists with `Map.prototype.has(key)`, an O(1) operation. Note that `has` distinguishes a missing key from a key whose value is `undefined`, which `get(...) ?? default` cannot:

```javascript
if (inventory.has("apple")) {
  console.log("Apple is in the Map");
}
```

For plain objects, use the `in` operator (`"apple" in fruitPrices`) or, to ignore inherited properties, [`Object.hasOwn(obj, "apple")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn).

### Iterating Over Maps and Objects

A `Map` exposes `keys()`, `values()`, and `entries()`, each returning an iterator. The `Map` object is itself iterable, yielding `[key, value]` pairs, so `for...of` works directly:

```javascript
// Iterating directly over [key, value] pairs (the default iterator)
for (const [fruit, value] of inventory) {
  console.log(fruit, value);
}

// Explicitly iterating over keys
for (const fruit of inventory.keys()) {
  console.log(fruit);
}

// Iterating over values
for (const count of inventory.values()) {
  console.log(count);
}

// Iterating over key-value pairs via entries()
for (const [fruit, value] of inventory.entries()) {
  console.log(fruit, value);
}
```

For a plain object, use `Object.keys(obj)`, `Object.values(obj)`, or `Object.entries(obj)`, each of which returns a **static array** — a snapshot taken at the moment you call it.

The `Map` iterators are lazy and *live*: they reflect changes made to the `Map` before the iterator reaches a given entry.

```javascript
const keysIter = inventory.keys();
inventory.set("pears", 40);
console.log([...keysIter]); // Includes 'pears', because the iterator had not been consumed yet
```

This differs from `Object.keys(obj)`, which materializes an array immediately and does not see later mutations.

#### Handling Concurrent Modifications

Unlike some languages that throw a runtime error when a collection changes size during iteration, JavaScript *permits* mutating a `Map` while iterating over it — but the results can be surprising. Per the spec, entries **deleted** before the iterator reaches them are skipped, and entries **added** during iteration *will* be visited. That last rule makes it easy to write an accidental infinite loop:

```javascript
const inventory = new Map([
  ["apples", 30],
  ["bananas", 50],
  ["oranges", 20],
]);

// Deleting the current key during iteration is allowed and behaves predictably:
for (const key of inventory.keys()) {
  if (key === "bananas") {
    inventory.delete(key); // Safe: 'bananas' is removed, iteration continues
  }
}
```

Even though deletion happens to be safe here, relying on mutation-during-iteration is fragile and hard to read. Prefer these clearer strategies:

* **Iterate Over a Snapshot of the Keys**: Spread the keys into an array first, decoupling iteration from the `Map` itself.

    ```javascript
    for (const key of [...inventory.keys()]) {
      if (key === "bananas") {
        inventory.delete(key); // Safe: iterating over an independent array copy
      }
    }
    ```

* **Build a New Map**: For transformations or filtering, construct a fresh `Map` rather than mutating in place.

    ```javascript
    const filtered = new Map(
      [...inventory].filter(([key, val]) => val > 25)
    );
    ```

### Extending `Map` vs. Composition

You *can* subclass the built-in `Map` in modern JavaScript:

```javascript
class DoublingMap extends Map {
  set(key, value) {
    return super.set(key, value * 2);
  }
}

const md = new DoublingMap();
md.set("a", 3);
console.log(md.get("a")); // 6
```

However, extending built-ins has sharp edges (methods like the constructor may call `set` in ways you did not anticipate, and some tooling handles subclassed built-ins imperfectly). A common alternative is **composition** — wrapping a `Map` inside a class and delegating to it — which keeps behavior explicit.

If you use a plain object as a dictionary instead, guard against inherited keys and prototype pollution by creating it with `Object.create(null)` (an object with no prototype) so keys like `"toString"` or `"__proto__"` behave like ordinary data.

## Section 3: Common Counting and Grouping Patterns

Some languages ship dedicated dictionary variants for counting and grouping (for example, Python's `collections.Counter` and `collections.defaultdict`). JavaScript has no such built-ins, but the same patterns are a few lines with a `Map`.

### Counting with a `Map` (the "Counter" pattern)

To count occurrences, increment a `Map` value, defaulting missing keys to `0` with `??`:

```javascript
const colors = ["red", "blue", "red", "green", "blue", "blue"];

const colorCount = new Map();
for (const color of colors) {
  colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
}

console.log(colorCount);
// Map(3) { 'red' => 2, 'blue' => 3, 'green' => 1 }

// Accessing counts directly:
console.log(colorCount.get("blue")); // 3
console.log(colorCount.get("purple") ?? 0); // 0 (missing key defaults to 0)
```

A small reusable helper captures this "get-or-initialize" idea:

```javascript
function increment(map, key, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}
```

**Common derived operations:**

- **Most common `n` elements** — sort the entries by count descending and take the first `n`:

    ```javascript
    function mostCommon(counter, n) {
      return [...counter.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
    }
    console.log(mostCommon(colorCount, 2)); // [ [ 'blue', 3 ], [ 'red', 2 ] ]
    ```

- **Total** — sum all counts:

    ```javascript
    const cnt = new Map([["a", 3], ["b", 2], ["c", 1]]);
    const total = [...cnt.values()].reduce((sum, v) => sum + v, 0);
    console.assert(total === 6);
    ```

- **Elements** — expand each key by its count:

    ```javascript
    function elements(counter) {
      const out = [];
      for (const [key, count] of counter) {
        for (let i = 0; i < count; i++) out.push(key);
      }
      return out;
    }
    console.log(elements(cnt)); // ['a', 'a', 'a', 'b', 'b', 'c']
    ```

### Grouping with a `Map` (the "defaultdict" pattern)

When you want a `Map` whose values are collections (arrays, sets, nested maps), the challenge is initializing the value the first time a key is seen. The idiomatic JavaScript approach is a get-or-initialize step:

```javascript
function getOrInit(map, key, factory) {
  if (!map.has(key)) map.set(key, factory());
  return map.get(key);
}
```

**Counting occurrences** (values default to `0`):

```javascript
const wordCounts = new Map();
const words = ["apple", "banana", "apple"];
for (const word of words) {
  wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
}

console.log(wordCounts);
// Map(2) { 'apple' => 2, 'banana' => 1 }
```

**Grouping items by category** (values default to an array):

```javascript
const itemsByCategory = new Map();
const products = [
  ["fruit", "apple"],
  ["vegetable", "carrot"],
  ["fruit", "banana"],
];

for (const [category, item] of products) {
  getOrInit(itemsByCategory, category, () => []).push(item);
}

console.log(itemsByCategory);
// Map(2) { 'fruit' => [ 'apple', 'banana' ], 'vegetable' => [ 'carrot' ] }
```

**Maintaining unique collections** uses `() => new Set()` as the factory; **nested maps** use `() => new Map()`; a **custom default** is just any factory such as `() => 10`:

```javascript
const defaultTen = new Map();
console.log(getOrInit(defaultTen, "unknown_key", () => 10)); // 10
```

## Section 4: Solved Problems

### Problem 1: In-Memory Database

Implement a simple **in-memory database** that supports the following operations:

- **`set(key, field, value) -> void`**: Inserts or updates the value associated with the specified `field` in the given `key`. Creates a new record if the `key` does not exist.
- **`get(key, field) -> number | null`**: Retrieves the value associated with `field` for the given `key`. Returns `null` if either the `key` or the `field` does not exist.
- **`compareAndSet(key, field, expectedValue, newValue) -> boolean`**: If the current value of `field` at `key` matches `expectedValue`, update it to `newValue` and return `true`. If it doesn't match or doesn't exist, perform no operation and return `false`.
- **`compareAndDelete(key, field, expectedValue) -> boolean`**: If the current value of `field` at `key` matches `expectedValue`, remove the `field` and return `true`. If it doesn't match or doesn't exist, perform no operation and return `false`.

**Example:**

```javascript
const db = new Database();

db.set("A", "B", 4);
db.set("A", "C", 6);

console.assert(db.compareAndSet("A", "B", 4, 9) === true);
console.assert(db.compareAndSet("A", "C", 4, 9) === false);
console.assert(db.compareAndDelete("A", "C", 6) === true);
console.assert(db.get("A", "C") === null);
console.assert(db.get("A", "B") === 9);

db.set("a", "a", 1);
db.set("a", "A", 2);

console.assert(db.get("a", "a") === 1);
console.assert(db.compareAndDelete("a", "a", 0) === false);
console.assert(db.get("a", "a") === 1);
console.assert(db.compareAndDelete("a", "a", 1) === true);
console.assert(db.get("a", "a") === null);
console.assert(db.get("a", "A") === 2);
console.assert(db.compareAndDelete("a", "A", 2) === true);
```

**Solution**:

```javascript
class Database {
  constructor() {
    // entries: Map<key, Map<field, value>>
    this.entries = new Map();
  }

  set(key, field, val) {
    if (!this.entries.has(key)) this.entries.set(key, new Map());
    this.entries.get(key).set(field, val);
  }

  get(key, field) {
    const record = this.entries.get(key);
    if (!record || !record.has(field)) return null;
    return record.get(field);
  }

  compareAndSet(key, field, expectedVal, newVal) {
    if (this.get(key, field) === expectedVal) {
      this.set(key, field, newVal);
      return expectedVal !== newVal;
    }
    return false;
  }

  compareAndDelete(key, field, expectedVal) {
    if (this.get(key, field) === expectedVal) {
      this.entries.get(key).delete(field);
      return true;
    }
    return false;
  }
}
```

### Problem 2: [Two Sum](https://leetcode.com/problems/two-sum/)

**Problem Statement**: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

**Solution**:

```javascript
function twoSum(nums, target) {
  const numMap = new Map();
  for (let index = 0; index < nums.length; index++) {
    const num = nums[index];
    const diff = target - num;
    if (numMap.has(diff)) {
      return [numMap.get(diff), index];
    }
    numMap.set(num, index);
  }
}
```

**Explanation**:

The solution leverages a `Map` to store each number's index as you iterate through the array. For each element, it checks if the complement (target - current number) already exists in the map. If it does, it returns the pair of indices.

This method ensures an O(n) time complexity, as each lookup and insertion in a `Map` is O(1) on average.

### Problem 3: [Group Anagrams](https://leetcode.com/problems/group-anagrams/)

**Problem Statement**: Given an array of strings, group anagrams together.

**Solution**:

```javascript
function groupAnagrams(strs) {
  const anagrams = new Map();
  for (const s of strs) {
    const sortedS = [...s].sort().join("");
    if (!anagrams.has(sortedS)) anagrams.set(sortedS, []);
    anagrams.get(sortedS).push(s);
  }
  return [...anagrams.values()];
}
```

**Explanation**:

This function categorizes strings by sorting their characters and using the sorted string as a map key. This ensures that all anagrams will be grouped together, since sorted versions of anagrams are identical.

Note that we use a *string* (the joined sorted characters) as the key rather than an array. `Map` compares object and array keys by reference, so two distinct arrays with identical contents would never collide — a joined string gives us the value-based key we want.

This solution has O(nk log k) time complexity, where n is the number of strings and k is the maximum length of a string.

### Problem 4: [First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/)

**Problem Statement**: Given a string, find the first non-repeating character in it and return its index. If it doesn't exist, return -1.

**Solution**:

```javascript
function firstUniqChar(s) {
  const charCount = new Map();
  for (const char of s) {
    charCount.set(char, (charCount.get(char) ?? 0) + 1);
  }

  for (let index = 0; index < s.length; index++) {
    if (charCount.get(s[index]) === 1) {
      return index;
    }
  }
  return -1;
}
```

**Explanation**:
The solution first counts the frequency of each character using a `Map`, then iterates through the string to find the first character with a count of one.

This approach has a time complexity of O(n), where n is the length of the string.

### Problem 5: [Divide Array into Equal Pairs](https://leetcode.com/problems/divide-array-into-equal-pairs/)

**Problem Statement**: You are given an integer array `nums` where the number of elements is even. Write a function to determine whether it's possible to pair every element with another identical element.

**Solution**:

```javascript
function divideArray(nums) {
  const counts = new Map();
  for (const num of nums) {
    counts.set(num, (counts.get(num) ?? 0) + 1);
  }
  return [...counts.values()].every((count) => count % 2 === 0);
}
```

**Explanation**:

This function first counts the occurrences of each element in the array using a `Map` (the counting pattern). It then checks if all elements have an even count with `Array.prototype.every` over the counter's values. If every element appears an even number of times, then it is possible to pair each element with another identical element, allowing the array to be divided into pairs as required.

The function runs in O(n) time complexity, where `n` is the length of the input array.

### Problem 6: [Intersection of Two Arrays II](https://leetcode.com/problems/intersection-of-two-arrays-ii/)

**Problem Statement**: Given two arrays, write a function to compute their intersection, considering the count of elements.

**Solution**:

```javascript
function intersect(nums1, nums2) {
  const count = (arr) => {
    const m = new Map();
    for (const x of arr) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };

  const count1 = count(nums1);
  const count2 = count(nums2);
  const result = [];

  for (const num of count1.keys()) {
    if (count2.has(num)) {
      const commonMin = Math.min(count1.get(num), count2.get(num));
      for (let i = 0; i < commonMin; i++) result.push(num);
    }
  }

  return result;
}
```

**Explanation**:
The function counts occurrences in both arrays with a `Map`. The intersection is found by checking each element in the first counter against the second and adding the minimum occurrence of each common element to the result array.

The time complexity of this approach is O(n + m), where n and m are the lengths of the two arrays.

### Problem 7: [Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/)

**Problem Statement**: Given an array of integers and an integer `k`, find out whether there are two distinct indices `i` and `j` in the array such that `nums[i] = nums[j]` and the absolute difference between `i` and `j` is at most `k`.

**Solution**:

```javascript
function containsNearbyDuplicate(nums, k) {
  const numMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (numMap.has(num) && i - numMap.get(num) <= k) {
      return true;
    }
    numMap.set(num, i);
  }
  return false;
}
```

**Explanation**:

The solution involves iterating through the array of numbers and storing each number's index in a `Map`. For each number:

- If the number already exists in the map:
    - Check if the difference between the current index and the stored index (of the same number) is less than or equal to `k`.
    - If true, a duplicate within the range exists, so return `true`.
- Update the map with the current number's latest index, regardless of whether it was found before or not. This ensures that the stored index is always the most recent one.

This approach leverages the O(1) lookups of a `Map` to check and update elements in constant time. By keeping track of the most recent index of each element, the solution quickly assesses whether a valid duplicate exists within the range defined by `k`.

The time complexity of this algorithm is `O(n)`, where `n` is the number of elements in the array.

### Problem 8: [Finding the Users Active Minutes](https://leetcode.com/problems/finding-the-users-active-minutes/)

**Problem Statement**: You are given the logs for users' actions on LeetCode, and each log is represented as a tuple `(id, timestamp)`, where `id` is the user ID and `timestamp` is the time when the user performed an action. You are also given an integer `k`. The task is to return an array `answer`, where `answer[i]` represents the number of users whose User Active Minutes (UAM) count equals `i+1`. UAM is the number of unique minutes in which the user performed an action.

**Solution**:

```javascript
function findingUsersActiveMinutes(logs, k) {
  const userMinutes = new Map();

  // Collect unique minutes per user (a Set of values per key)
  for (const [id, timestamp] of logs) {
    if (!userMinutes.has(id)) userMinutes.set(id, new Set());
    userMinutes.get(id).add(timestamp);
  }

  // Prepare the result array
  const result = new Array(k).fill(0);
  for (const minutes of userMinutes.values()) {
    result[minutes.size - 1] += 1;
  }

  return result;
}
```

**Explanation**:

- We use a `Map` `userMinutes` to map each user ID to a `Set` of timestamps (minutes) in which they were active. The use of a `Set` ensures that each minute is counted only once per user.
- We loop through each log entry and add the timestamp to the corresponding user's set in the map.
- After populating the map, we initialize an array `result` of size `k` to store the count of users with active minutes from `1` to `k`.
- We then iterate over each set of minutes. For each set, we determine the number of unique minutes (the size of the set) and increment the corresponding index in `result`. This counts how many users have that exact number of active minutes.
- Finally, the `result` array is returned, which contains the number of users whose active minutes count matches each possible count from `1` to `k`.

The function operates in `O(n)` time.

### Problem 9: [Number of Boomerangs](https://leetcode.com/problems/number-of-boomerangs/)

**Problem Statement**: You are given `n` points in the plane that are all pairwise distinct, and a point is represented as a pair of integers `(i, j)`. A "boomerang" is a tuple of points `(i, j, k)` such that the distance between `i` and `j` equals the distance between `i` and `k` (the order of the tuple matters). Find the number of boomerangs.

**Solution**:

```javascript
function numberOfBoomerangs(points) {
  const distance = (p1, p2) =>
    (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;

  let result = 0;
  for (const i of points) {
    const distances = new Map();
    for (const j of points) {
      if (i !== j) {
        const dist = distance(i, j);
        distances.set(dist, (distances.get(dist) ?? 0) + 1);
      }
    }

    for (const count of distances.values()) {
      result += count * (count - 1);
    }
  }

  return result;
}
```

**Explanation**:

This problem requires calculating the distance between each pair of points and checking how many pairs have the same distance from a given point. The solution uses a `Map` to count the occurrences of each distance. For each point `i`, calculate the distance to every other point `j`. Use the map to count how many points have the same distance to `i`. For each distance, if there are `n` points with that distance to `i`, then there are `n * (n - 1)` boomerangs. This is because you can arrange `n` points in `n * (n - 1)` ordered pairs (order matters).

Since the distance value is a plain number, it works directly as a `Map` key. (If we were keying by the coordinate pair itself, we would build a string key like `` `${x},${y}` `` because `Map` compares arrays by reference.)

The time complexity is `O(n^2)`, where `n` is the number of points.

### Problem 10: In Memory DB

Design a class `InMemoryDB` to store and retrieve data in memory. A record consists of a **key** (string) containing multiple **fields** (string), each mapped to a **value** (string). The database must handle **timestamps** (integers) and **Time-To-Live (TTL)** expiration logic: if a field's expiry time is less than or equal to a given timestamp, that field is considered expired and should be removed.

1. **Basic Set & Get**

    - `set(key, field, value)`:  
        - Store (or overwrite) `field` of `key` with `value` and no expiration.  
    - `get(key, field) -> string | null`:  
        - Return the value of `field` in `key`.  
        - Return `null` if either the key or the field does not exist.

2. **Timestamped Set & Get**

    - `setAt(key, field, value, ts)`:  
        - Store `field` of `key` with `value`, treated as if set at timestamp `ts`, but with no expiration.  
    - `setAtWithTtl(key, field, value, ts, ttl)`:  
        - Store `field` of `key` with `value`, as if set at time `ts`, expiring at `ts + ttl`.  
    - `getAt(key, field, ts) -> string | null`:  
        - Return the value of `field` in `key` at time `ts`, considering TTL.  
        - If the field is expired or doesn't exist, return `null`.

3. **Deleting Fields**

    - `delete(key, field) -> boolean`:  
        - Remove `field` from `key` immediately.  
        - Return `true` if the field was found and deleted, otherwise `false`.  
    - `deleteAt(key, field, ts) -> boolean`:  
        - First remove expired fields at or before `ts`, then remove `field` from `key`.  
        - Return `true` if the field was found and deleted, otherwise `false`.

4. **Scanning Fields**

    - `scan(key) -> string`:  
        - Return all fields of `key`, sorted lexicographically by field name, in the format:  
        `field1(value1), field2(value2), ...`  
        - Return `""` if `key` doesn't exist or has no active fields.  
    - `scanByPrefix(key, prefix) -> string`:  
        - Same as `scan(key)`, but only include fields whose name starts with `prefix`.  
        - Return `""` if no matching fields.  
    - `scanAt(key, ts) -> string`:  
        - Same as `scan(key)`, but first remove fields expired at or before `ts`.  
    - `scanByPrefixAt(key, prefix, ts) -> string`:  
        - Same as `scanByPrefix(key, prefix)`, but first remove fields expired at or before `ts`.

5. **Backups & Restore**  
    - `backup(ts) -> number`:
        - At time `ts`, remove any fields that have expired.
        - Then record a snapshot of the database as it exists after that removal.
        - Return the number of keys that have at least one field in this snapshot.  

    - `restore(ts, tsToRestore) -> void`:
        - Find the most recent snapshot created at or before `tsToRestore`.  
        - If no such snapshot exists, do nothing.  
        - Otherwise, restore the database to match that snapshot's data. Any fields in the snapshot that had time remaining before expiration will continue to expire after the same remaining duration, but starting from the new restore time `ts`.

### Examples:

#### Example 1:

```javascript
let db = new InMemoryDB();

// Get non-existent field
console.assert(db.get("user2", "nonexistent") === null);

// Delete non-existent field
console.assert(db.delete("user2", "nonexistent") === false);

// Scan non-existent key
console.assert(db.scan("user2") === "");

// TTL expiration
db.setAtWithTtl("user3", "session", "active", 100, 10);
console.assert(db.getAt("user3", "session", 110) === null);

// Backup when database is empty
console.assert(db.backup(50) === 0);

// Restore to a timestamp before any backup
db.restore(200, 0);
console.assert(db.scan("user3") === "");

db = new InMemoryDB();
db.set("user1", "name", "Alice");
console.assert(db.get("user1", "name") === "Alice");

// set with timestamp and TTL
db.setAtWithTtl("user1", "email", "alice@example.com", 10, 5);
console.assert(db.getAt("user1", "email", 12) === "alice@example.com");
console.assert(db.getAt("user1", "email", 16) === null);

// backup and restore
db.backup(15);
db.delete("user1", "name");
console.assert(db.scan("user1") === "");

db.restore(20, 15);
console.assert(db.scan("user1") === "name(Alice)");
```

#### Example 2:

```javascript
const db = new InMemoryDB();

db.set("A", "BC", "E");
db.set("A", "BD", "F");
db.set("A", "C", "G");

console.assert(db.scanByPrefix("A", "B") === "BC(E), BD(F)");
console.assert(db.scan("A") === "BC(E), BD(F), C(G)");
console.assert(db.scanByPrefix("B", "B") === "");
```

#### Example 3:

```javascript
const db = new InMemoryDB();

db.setAtWithTtl("A", "BC", "E", 1, 9);
db.setAtWithTtl("A", "BC", "E", 5, 10);
db.setAt("A", "BD", "F", 5);

console.assert(db.scanByPrefixAt("A", "B", 14) === "BC(E), BD(F)");
console.assert(db.scanByPrefixAt("A", "B", 15) === "BD(F)");
```

#### Example 4:

```javascript
const db = new InMemoryDB();

db.setAt("A", "B", "C", 1);
db.setAtWithTtl("X", "Y", "Z", 2, 15);

console.assert(db.getAt("X", "Y", 3) === "Z");

db.setAtWithTtl("A", "D", "E", 4, 10);

console.assert(db.scanAt("A", 13) === "B(C), D(E)");
console.assert(db.scanAt("X", 16) === "Y(Z)");
console.assert(db.scanAt("X", 17) === "");
console.assert(db.deleteAt("X", "Y", 20) === false);

db.setAtWithTtl("A", "B", "C", 1, 10);

console.assert(db.backup(3) === 1);

db.setAt("A", "D", "E", 4);

console.assert(db.backup(5) === 1);
console.assert(db.deleteAt("A", "B", 8) === true);
console.assert(db.backup(9) === 1);

db.restore(10, 7);

console.assert(db.backup(11) === 1);
console.assert(db.scanAt("A", 15) === "B(C), D(E)");
console.assert(db.scanAt("A", 16) === "D(E)");
```

#### Example 5:

```javascript
const db = new InMemoryDB();

// Get non-existent field
console.assert(db.get("user2", "nonexistent") === null);

// Delete non-existent field
console.assert(db.delete("user2", "nonexistent") === false);

// Scan non-existent key
console.assert(db.scan("user2") === "");

// TTL expiration
db.setAtWithTtl("user3", "session", "active", 100, 10);
console.assert(db.getAt("user3", "session", 110) === null);

// Backup when database is empty
console.assert(db.backup(50) === 0);

// Restore to a timestamp before any backup
db.restore(200, 0);
console.assert(db.scan("user3") === "");
```

## Sample Implementation

We model the store as a `Map` of keys to inner `Map`s of fields, where each field value is a small object `{ val, expiry }` (`expiry` is `null` for fields that never expire). Backups are a `Map` from timestamp to a deep snapshot, where each field stores leftover TTL instead of an absolute expiry.

```javascript
class InMemoryDB {
  constructor() {
    // entries: Map<key, Map<field, { val, expiry|null }>>
    this.entries = new Map();
    // backups: Map<ts, Map<key, Map<field, { val, leftover|null }>>>
    this.backups = new Map();
  }

  #record(key) {
    if (!this.entries.has(key)) this.entries.set(key, new Map());
    return this.entries.get(key);
  }

  set(key, field, val) {
    // Set field of key to val with no expiration.
    this.#record(key).set(field, { val, expiry: null });
  }

  setAt(key, field, val, ts) {
    // Set field of key to val, with no expiry.
    this.#record(key).set(field, { val, expiry: null });
  }

  setAtWithTtl(key, field, val, ts, ttl) {
    // Set field of key to val, expiring at ts + ttl.
    this.#record(key).set(field, { val, expiry: ts + ttl });
  }

  delete(key, field) {
    // Delete field from key if it exists.
    const record = this.entries.get(key);
    if (!record || !record.has(field)) return false;
    record.delete(field);
    if (record.size === 0) this.entries.delete(key);
    return true;
  }

  deleteAt(key, field, ts) {
    // Clean up at time 'ts' then delete field from key.
    this.#cleanUp(ts);
    return this.delete(key, field);
  }

  get(key, field) {
    // Return the value for (key, field), or null if missing.
    const record = this.entries.get(key);
    if (!record || !record.has(field)) return null;
    return record.get(field).val;
  }

  getAt(key, field, ts) {
    // Clean up at time 'ts', then return the value for (key, field).
    this.#cleanUp(ts);
    return this.get(key, field);
  }

  scan(key) {
    // Return 'field1(value1), field2(value2), ...' sorted by field name.
    const record = this.entries.get(key);
    if (!record) return "";
    const fields = [...record.keys()].sort();
    return fields.map((f) => `${f}(${record.get(f).val})`).join(", ");
  }

  scanAt(key, ts) {
    // Scan after cleaning up at time 'ts'.
    this.#cleanUp(ts);
    return this.scan(key);
  }

  scanByPrefix(key, prefix) {
    // Scan fields starting with prefix.
    const record = this.entries.get(key);
    if (!record) return "";
    const filtered = [...record.keys()]
      .filter((f) => f.startsWith(prefix))
      .sort();
    return filtered.map((f) => `${f}(${record.get(f).val})`).join(", ");
  }

  scanByPrefixAt(key, prefix, ts) {
    // Scan fields starting with prefix, after cleaning up.
    this.#cleanUp(ts);
    return this.scanByPrefix(key, prefix);
  }

  backup(ts) {
    // Create a backup of current data at time 'ts'. Return # of non-empty keys.
    this.#cleanUp(ts);
    const backedUp = new Map();
    let count = 0;
    for (const [key, fieldVals] of this.entries) {
      const snapshot = new Map();
      for (const [field, { val, expiry }] of fieldVals) {
        const leftover = expiry === null ? null : expiry - ts;
        snapshot.set(field, { val, leftover });
      }
      backedUp.set(key, snapshot);
      count += 1;
    }
    this.backups.set(ts, backedUp);
    return count;
  }

  restore(ts, tsToRestore) {
    // Restore data from the latest backup <= tsToRestore. Expiry is reset so
    // each field keeps the same leftover time it had at the backup moment.
    let bestTs = null;
    let bestBu = null;
    for (const [t, bu] of this.backups) {
      if (t <= tsToRestore && (bestTs === null || t > bestTs)) {
        bestTs = t;
        bestBu = bu;
      }
    }
    if (bestBu === null) return; // no backup found

    const newEntries = new Map();
    for (const [key, fieldVals] of bestBu) {
      const record = new Map();
      for (const [field, { val, leftover }] of fieldVals) {
        record.set(field, {
          val,
          expiry: leftover === null ? null : ts + leftover,
        });
      }
      newEntries.set(key, record);
    }
    this.entries = newEntries;
  }

  #cleanUp(ts) {
    // Remove or keep fields based on expiration vs current time.
    for (const key of [...this.entries.keys()]) {
      const record = this.entries.get(key);
      const kept = new Map();
      for (const [field, { val, expiry }] of record) {
        // expiry === null => never expires
        if (expiry === null || ts < expiry) {
          kept.set(field, { val, expiry });
        }
      }
      if (kept.size > 0) {
        this.entries.set(key, kept);
      } else {
        this.entries.delete(key);
      }
    }
  }
}
```

### Problem 11: Cloud Storage

Design a simplified cloud storage manager that supports multiple users (each with their own storage limit) and provides the following operations. Focus is on clarity rather than performance optimizations.

1. **`ADD_USER(userId, capacity)`**

    - Creates a new user with storage capacity = `capacity`.  
    - Fails if `userId` already exists.  
    - Returns `true` if successful, `false` otherwise.

2. **`ADD_FILE_BY(userId, name, size)`**

    - Creates a new file `name` (size = `size`) owned by `userId`.  
    - Fails if `userId` doesn't exist, if `name` already exists, or if adding the file exceeds `userId`'s capacity.  
    - Returns remaining capacity (as a number) if successful, or `null` on failure.

3. **`COPY_FILE(nameFrom, nameTo)`**

    - Copies `nameFrom` → `nameTo`, inheriting the same owner.  
    - Fails if `nameFrom` doesn't exist, `nameTo` already exists, or if copying exceeds the owner's capacity.  
    - Returns `true` if successful, `false` otherwise.

4. **`GET_FILE_SIZE(name)`**

    - Returns the size of `name` if it exists, or `null` if it doesn't.

5. **`FIND_FILE(prefix, suffix)`**

    - Returns a comma‐separated list of files matching:
        - **start** with `prefix`
        - **end** with `suffix`
    - Sort matches in **descending** size, and by **lexicographical** order to break ties.  
    - Each file is listed as `"<fileName>(<size>)"`.  
    - Returns an empty string if no matches.

6. **`UPDATE_CAPACITY(userId, newCapacity)`**

    - Updates the user's capacity to `newCapacity`.  
    - If the current usage exceeds `newCapacity`, remove the largest files first (breaking ties lexicographically) until usage is ≤ `newCapacity`.  
    - Returns the number of removed files, or `null` if `userId` doesn't exist.

7. **`COMPRESS_FILE(userId, name)`**

    - Replaces file `name` (owned by `userId`) with `name + ".COMPRESSED"`, halving its size.  
    - Ownership remains with `userId`.  
    - Returns the user's remaining capacity if successful, or `null` on failure.

8. **`DECOMPRESS_FILE(userId, name)`**

    - Reverts a `.COMPRESSED` file back to its uncompressed form (size is doubled, suffix dropped).  
    - Fails if it would exceed `userId`'s capacity or if the file doesn't belong to `userId`.  
    - Returns the user's remaining capacity if successful, or `null` on failure.

## Example Usage

```javascript
const storage = new Storage();

// 1) Add two users
console.log(storage.addUser("user1", 100)); // true
console.log(storage.addUser("user2", 50)); // true

// 2) Add a file for user1
let res = storage.addFileBy("user1", "/dir/file.txt", 40);
console.log(res); // 60 (user1 now has 60 bytes left)

// 3) Get file size
console.log(storage.getFileSize("/dir/file.txt")); // 40

// 4) Compress the file
res = storage.compressFile("user1", "/dir/file.txt");
console.log(res); // 80 (file is now "/dir/file.txt.COMPRESSED", size is 20)

// 5) Copy the compressed file
//   user1 has 80 bytes free, copying a 20-byte file is allowed
console.log(storage.copyFile("/dir/file.txt.COMPRESSED", "/dir/copy.txt.COMPRESSED")); // true

// 6) Check FIND_FILE results
console.log(storage.findFile("/dir", ".COMPRESSED"));
// Example output: "/dir/copy.txt.COMPRESSED(20), /dir/file.txt.COMPRESSED(20)"

// 7) Decompress the original compressed file
res = storage.decompressFile("user1", "/dir/file.txt.COMPRESSED");
// The file becomes "/dir/file.txt" with size = 40 again
console.log(res); // 40 (user1 has 40 bytes left now)

// 8) Update user2's capacity, forcing file removals if needed
const removed = storage.updateCapacity("user2", 10);
console.log(removed); // 0 if user2 had no large files, or the number of removed files
```

## Sample Implementation

```javascript
class Storage {
  constructor() {
    this.size = new Map(); // Map<fileName, number>
    this.owner = new Map(); // Map<fileName, userId>
    this.capacity = new Map(); // Map<userId, number>
  }

  addUser(userId, capacity) {
    if (this.capacity.has(userId)) {
      return false;
    }
    this.capacity.set(userId, capacity);
    return true;
  }

  addFileBy(userId, fileName, fileSize) {
    if (!this.capacity.has(userId) || this.size.has(fileName)) {
      return null;
    }

    let totalUsed = 0;
    for (const [existingFile, ownerId] of this.owner) {
      if (ownerId === userId) {
        totalUsed += this.size.get(existingFile);
      }
    }

    if (totalUsed + fileSize > this.capacity.get(userId)) {
      return null;
    }

    this.size.set(fileName, fileSize);
    this.owner.set(fileName, userId);

    return this.capacity.get(userId) - (totalUsed + fileSize);
  }

  copyFile(sourceName, destName) {
    if (!this.size.has(sourceName)) {
      return false;
    }
    if (this.size.has(destName)) {
      return false;
    }

    const sourceOwner = this.owner.get(sourceName);
    const sourceSize = this.size.get(sourceName);

    const addedCapacity = this.addFileBy(sourceOwner, destName, sourceSize);
    return addedCapacity !== null;
  }

  getFileSize(fileName) {
    return this.size.get(fileName) ?? null;
  }

  findFile(prefix, suffix) {
    const matches = [];

    for (const [fName, fSize] of this.size) {
      if (fName.startsWith(prefix) && fName.endsWith(suffix)) {
        matches.push([fName, fSize]);
      }
    }

    if (matches.length === 0) {
      return "";
    }

    // Descending size, then lexicographical order to break ties.
    matches.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

    return matches.map(([fn, sz]) => `${fn}(${sz})`).join(", ");
  }

  updateCapacity(userId, newCapacity) {
    if (!this.capacity.has(userId)) {
      return null;
    }

    this.capacity.set(userId, newCapacity);

    const filesForUser = [];
    let totalUsed = 0;
    for (const [fName, ownerId] of this.owner) {
      if (ownerId === userId) {
        const fileSize = this.size.get(fName);
        filesForUser.push([fName, fileSize]);
        totalUsed += fileSize;
      }
    }

    if (totalUsed <= newCapacity) {
      return 0;
    }

    filesForUser.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

    let removedCount = 0;

    for (const [fName, fSize] of filesForUser) {
      if (totalUsed <= newCapacity) {
        break;
      }
      this.size.delete(fName);
      this.owner.delete(fName);
      totalUsed -= fSize;
      removedCount += 1;
    }

    return removedCount;
  }

  compressFile(userId, fileName) {
    if (!this.size.has(fileName) || this.owner.get(fileName) !== userId) {
      return null;
    }

    const originalSize = this.size.get(fileName);
    const newFileName = fileName + ".COMPRESSED";

    this.size.delete(fileName);
    this.owner.delete(fileName);

    const compressedSize = Math.floor(originalSize / 2);
    this.size.set(newFileName, compressedSize);
    this.owner.set(newFileName, userId);

    let totalUsed = 0;
    for (const [f, sz] of this.size) {
      if (this.owner.get(f) === userId) totalUsed += sz;
    }
    return this.capacity.get(userId) - totalUsed;
  }

  decompressFile(userId, fileName) {
    if (!this.size.has(fileName) || this.owner.get(fileName) !== userId) {
      return null;
    }

    const compressedSize = this.size.get(fileName);
    const newFileName = fileName.endsWith(".COMPRESSED")
      ? fileName.slice(0, -".COMPRESSED".length)
      : fileName;

    let totalUsedBefore = 0;
    for (const [f, sz] of this.size) {
      if (this.owner.get(f) === userId) totalUsedBefore += sz;
    }
    const newSize = compressedSize * 2;
    const usedAfter = totalUsedBefore - compressedSize + newSize;

    if (usedAfter > this.capacity.get(userId)) {
      return null;
    }

    this.size.delete(fileName);
    this.owner.delete(fileName);

    this.size.set(newFileName, newSize);
    this.owner.set(newFileName, userId);

    return this.capacity.get(userId) - usedAfter;
  }
}
```

## Section 5: Exercises

1. [**Valid Anagram**](https://leetcode.com/problems/valid-anagram/)
2. [**Copy List with Random Pointer**](https://leetcode.com/problems/copy-list-with-random-pointer/)
3. [**Unique Number of Occurrences**](https://leetcode.com/problems/unique-number-of-occurrences/)
4. [**Number of Equivalent Domino Pairs**](https://leetcode.com/problems/number-of-equivalent-domino-pairs/)
5. [**Ransom Note**](https://leetcode.com/problems/ransom-note/)
6. [**Finding Pairs With a Certain Sum**](https://leetcode.com/problems/finding-pairs-with-a-certain-sum/)
7. [**Word Pattern**](https://leetcode.com/problems/word-pattern/)
8. [**Longest Palindrome**](https://leetcode.com/problems/longest-palindrome/)
9. [**Longest Harmonious Subsequence**](https://leetcode.com/problems/longest-harmonious-subsequence/)
10. [**Minimum Index Sum of Two Lists**](https://leetcode.com/problems/minimum-index-sum-of-two-lists/description/)
11. [**Degree of an Array**](https://leetcode.com/problems/degree-of-an-array/)
12. [**Uncommon Words from Two Sentences**](https://leetcode.com/problems/uncommon-words-from-two-sentences/)
13. [**Verifying an Alien Dictionary**](https://leetcode.com/problems/verifying-an-alien-dictionary/)
14. [**Find Common Characters**](https://leetcode.com/problems/find-common-characters/)
15. [**Find Words That Can Be Formed by Characters**](https://leetcode.com/problems/find-words-that-can-be-formed-by-characters/)
16. [**Maximum Number of Balloons**](https://leetcode.com/problems/maximum-number-of-balloons/)
17. [**Check If N and Its Double Exist**](https://leetcode.com/problems/check-if-n-and-its-double-exist/)
18. [**Increasing Decreasing String**](https://leetcode.com/problems/increasing-decreasing-string/)
19. [**Count Largest Group**](https://leetcode.com/problems/count-largest-group/)
20. [**Find Lucky Integer in an Array**](https://leetcode.com/problems/find-lucky-integer-in-an-array/)
21. [**Make Two Arrays Equal by Reversing Subarrays**](https://leetcode.com/problems/make-two-arrays-equal-by-reversing-subarrays/)
22. [**Number of Good Pairs**](https://leetcode.com/problems/number-of-good-pairs/)
23. [**Check If All Characters Have Equal Number of Occurrences**](https://leetcode.com/problems/check-if-all-characters-have-equal-number-of-occurrences/)
24. [**Count Number of Pairs With Absolute Difference K**](https://leetcode.com/problems/count-number-of-pairs-with-absolute-difference-k/)
25. [**Count Special Quadruplets**](https://leetcode.com/problems/count-special-quadruplets/)
26. [**Count the Number of Special Characters II**](https://leetcode.com/problems/count-the-number-of-special-characters-ii/)
27. [**Frequency Tracker**](https://leetcode.com/problems/frequency-tracker)
28. [**Count Covered Buildings**](https://leetcode.com/problems/count-covered-buildings/)
29. [**Check if Strings Can Be Made Equal With Operations II**](https://leetcode.com/problems/check-if-strings-can-be-made-equal-with-operations-ii/)
</content>
</invoke>
