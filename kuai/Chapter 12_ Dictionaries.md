# Chapter 12: Dictionaries

## Section 1: Introduction to Dictionaries

Python dictionaries, denoted by the `dict` type, utilize a [hash table](https://en.wikipedia.org/wiki/Hash_table) to map keys to values efficiently. This structure enables average-time complexity of O(1) for retrieving, inserting, and deleting elements, using unique, immutable keys such as strings, numbers, or tuples.

## Section 2: Dictionary Operations

### Creating Dictionaries

Dictionaries can be declared using curly braces `{}`, the `dict()` constructor, or from sequences of key-value pairs:

```python
# Using curly braces
fruit_prices = {'apple': 3.99, 'banana': 1.99, 'cherry': 6.99}

# Using the dict constructor
user_profile = dict(name="Eric Doe", age=30, email="eric.doe@example.com")

# From a list of tuples
days = dict([(1, 'Monday'), (2, 'Tuesday'), (3, 'Wednesday')])
```

### Modifying Dictionaries

Add or update entries using key indexing or the `update()` method for merging another dictionary:

```python
inventory = {'apple': 1, 'banana': 2}
inventory['apple'] = 4  # Updates the value of the existing key 'apple'
inventory['cherry'] = 3  # Adds a new key 'cherry'

# Using update to merge another dictionary
inventory.update({'mangoes': 22, 'bananas': 25})
print(inventory)  # {'apple': 4, 'banana': 2, 'cherry': 3, 'mangoes': 22, 'bananas': 25}
```

**Time Complexity**:

* Individual add/update: O(1) on average.
* Bulk update with `update()`: O(k), where k is the number of keys added/updated.

### Removing Entries

Use `del` or `pop()` to efficiently remove entries. `pop()` is useful for capturing the removed value:

```python
# Removing an entry with del
del inventory['oranges']

# Removing and capturing with pop
mangoes_count = inventory.pop('mango', 0)  # Removes 'mango', returns value, 0 if not found
```

### Accessing Data

Access individual values by key or use `get()` to handle keys that might not be present:

```python
# Direct access
apple_count = inventory['apple']  # KeyError if 'apple' isn't a key

# Safe access with get
apple_count = inventory.get('apple', 0)  # Returns 0 if 'apple' is not found
```

### Checking Membership

Determine if a key is in the dictionary with the `in` keyword, which is an O(1) operation:

```python
if 'apple' in inventory:
    print("Apple is in the dictionary")
```

### Iterating Over Dictionaries

You can iterate over dictionaries using `keys()`, `values()`, and `items()`, which provide different views of the dictionary's contents:

```python
# Iterating directly over keys (implicitly uses `keys()`)
for fruit in inventory:
    print(fruit, inventory[fruit])

# Explicitly iterating over keys
for fruit in inventory.keys():
    print(fruit)

# Iterating over values
for count in inventory.values():
    print(count)

# Iterating over key-value pairs
for fruit, value in inventory.items():
    print(fruit, value)
```

The `keys()`, `values()`, and `items()` methods return views that are dynamically linked to the dictionary. These views update in real-time to reflect changes in the dictionary:

```python
keys_view = inventory.keys()
print(keys_view)  # Output reflects current state of 'inventory'

inventory['pears'] = 40
print(keys_view)  # Output now includes 'pears'
```

#### Handling Concurrent Modifications

Modifying a dictionary’s size (adding or removing keys) while iterating over it can lead to a `RuntimeError`:

```python
inventory = {'apples': 30, 'bananas': 50, 'oranges': 20}

# Attempting to add or remove items during iteration
for key in inventory:
    if key == 'bananas':
        del inventory[key]  # This will raise a RuntimeError
```

To safely modify a dictionary during iteration, consider the following strategies:

* **Iterate Over a Copy of the Keys**: By iterating over a list of the keys, you separate the iteration process from the dictionary structure itself.

    ```python
    for key in list(inventory.keys()):
        if key == 'bananas':
            del inventory[key]  # Safe because the iteration is over a list copy, not the dictionary itself
    ```

* **Dictionary Comprehensions**: For transformations or reductions, use dictionary comprehensions to create a new dictionary based on the existing one.

    ```python
    inventory = {key: val for key, val in inventory.items() if val > 25}
    ```

### Avoid Subclassing `dict`

Subclassing Python's built-in `dict` is generally discouraged because built-in dictionary methods may bypass subclass methods, causing unpredictable behavior.

Prefer using composition (wrapping a dictionary within a class) or leveraging [`collections.UserDict`](https://docs.python.org/3/library/collections.html#collections.UserDict):

```python
from collections import UserDict

class MyDict(UserDict):
    def __setitem__(self, key, value):
        super().__setitem__(key, value * 2)

md = MyDict()
md['a'] = 3
print(md)  # Output: {'a': 6}
```

## Section 3: Specialized Dictionaries from `collections`

Python's standard library provides powerful dictionary variations in the `collections` module, including `Counter` and `defaultdict`. These specialized dictionaries simplify common patterns and operations.

### `collections.Counter`

A `Counter` is a dictionary subclass designed for counting hashable objects. It automatically handles missing keys by returning zero.

**Example Usage:**

```python
from collections import Counter

colors = ['red', 'blue', 'red', 'green', 'blue', 'blue']
color_count = Counter(colors)

print(color_count)
# Output: Counter({'blue': 3, 'red': 2, 'green': 1})

# Accessing counts directly:
print(color_count['blue'])  # Output: 3
print(color_count['purple'])  # Output: 0 (missing keys return 0 by default)
```

**Common Methods:**

- `most_common(n)`: Returns the `n` most common elements and their counts.

    ```python
    print(color_count.most_common(2))
    # Output: [('blue', 3), ('red', 2)]
    ```

- `total()`: Returns the sum of all counts (available in Python 3.10+).

    ```python
    cnt = Counter(a=3, b=2, c=1)
    assert cnt.total() == 6
    ```

- `elements()`: Returns an iterator over elements repeating as per their count.
    ```python
    list(cnt.elements())
    # Output: ['a', 'a', 'a', 'b', 'b', 'c']
    ```

### `collections.defaultdict`

A `defaultdict` automatically assigns a default value to missing keys, determined by a factory function provided at creation.

**Common Patterns:**
- Counting occurrences: `defaultdict(int)`
- Grouping items: `defaultdict(list)`
- Maintaining unique collections: `defaultdict(set)`
- Nested dictionaries: `defaultdict(dict)`
- Custom defaults: `defaultdict(lambda: 10)`

**Example Usage:**

Counting occurrences:

```python
from collections import defaultdict

word_counts = defaultdict(int)
words = ['apple', 'banana', 'apple']
for word in words:
    word_counts[word] += 1

print(word_counts)
# Output: defaultdict(<class 'int'>, {'apple': 2, 'banana': 1})
```

Grouping items by category:

```python
items_by_category = defaultdict(list)
products = [('fruit', 'apple'), ('vegetable', 'carrot'), ('fruit', 'banana')]

for category, item in products:
    items_by_category[category].append(item)

print(items_by_category)
# Output: defaultdict(<class 'list'>, {'fruit': ['apple', 'banana'], 'vegetable': ['carrot']})
```

Custom default value:

```python
default_ten = defaultdict(lambda: 10)
print(default_ten['unknown_key'])
# Output: 10
```

## Section 4: Solved Problems

### Problem 1: In-Memory Database

Implement a simple **in-memory database** that supports the following operations:

- **`set(key: str, field: str, value: int) -> None`**: Inserts or updates the value associated with the specified `field` in the given `key`. Creates a new record if the `key` does not exist.
- **`get(key: str, field: str) -> int | None`**: Retrieves the value associated with `field` for the given `key`. Returns `None` if either the `key` or the `field` does not exist.
- **`compare_and_set(key: str, field: str, expectedValue: int, newValue: int) -> bool`**: If the current value of `field` at `key` matches `expectedValue`, update it to `newValue` and return `True`. If it doesn't match or doesn't exist, perform no operation and return `False`.
- **`compare_and_delete(key: str, field: str, expectedValue: int) -> bool`**: If the current value of `field` at `key` matches `expectedValue`, remove the `field` and return `True`. If it doesn't match or doesn't exist, perform no operation and return `False`.

**Example:**

```python
db = Database()

db.set("A", "B", 4)
db.set("A", "C", 6)

assert db.compare_and_set("A", "B", 4, 9) is True
assert db.compare_and_set("A", "C", 4, 9) is False
assert db.compare_and_delete("A", "C", 6) is True
assert db.get("A", "C") is None
assert db.get("A", "B") == 9

db.set("a", "a", 1)
db.set("a", "A", 2)

assert db.get("a", "a") == 1
assert db.compare_and_delete("a", "a", 0) is False
assert db.get("a", "a") == 1
assert db.compare_and_delete("a", "a", 1) is True
assert db.get("a", "a") is None
assert db.get("a", "A") == 2
assert db.compare_and_delete("a", "A", 2) is True
```

**Solution**:

```python
from collections import defaultdict


class Database:
    def __init__(self):
        self.entries = defaultdict(dict)

    def set(self, key: str, field: str, val: int) -> None:
        self.entries[key][field] = val

    def get(self, key: str, field: str) -> int | None:
        if key not in self.entries or field not in self.entries[key]:
            return None
        return self.entries[key][field]

    def compare_and_set(
        self, key: str, field: str, expectedVal: int, newVal: int
    ) -> bool:
        if self.get(key, field) == expectedVal:
            self.set(key, field, newVal)
            return expectedVal != newVal
        return False

    def compare_and_delete(self, key: str, field: str, expectedVal: int) -> bool:
        if self.get(key, field) == expectedVal:
            del self.entries[key][field]
            return True
        return False
```

### Problem 2: [Two Sum](https://leetcode.com/problems/two-sum/)

**Problem Statement**: Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

**Solution**:

```python
def twoSum(nums, target):
    num_map = {}
    for index, num in enumerate(nums):
        diff = target - num
        if diff in num_map:
            return [num_map[diff], index]
        num_map[num] = index
```

**Explanation**:

The solution leverages a dictionary to store each number’s index as you iterate through the array. For each element, it checks if the complement (target - current number) already exists in the dictionary. If it does, it returns the pair of indices.

This method ensures an O(n) time complexity, as each lookup and insertion in a dictionary is O(1) on average.

### Problem 3: [Group Anagrams](https://leetcode.com/problems/group-anagrams/)

**Problem Statement**: Given an array of strings, group anagrams together.

**Solution**:

```python
from collections import defaultdict

def groupAnagrams(strs):
    anagrams = defaultdict(list)
    for s in strs:
        sorted_s = tuple(sorted(s))
        anagrams[sorted_s].append(s)
    return list(anagrams.values())
```

**Explanation**:

This function categorizes strings by sorting them and using the sorted string as a key in a dictionary. This ensures that all anagrams will be grouped together since sorted versions of anagrams are identical.

This solution has a O(nk log k) time complexity, where n is the number of strings and k is the maximum length of a string.

### Problem 4: [First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/)

**Problem Statement**: Given a string, find the first non-repeating character in it and return its index. If it doesn't exist, return -1.

**Solution**:

```python
def firstUniqChar(s):
    char_count = {}
    for char in s:
        char_count[char] = char_count.get(char, 0) + 1

    for index, char in enumerate(s):
        if char_count[char] == 1:
            return index
    return -1
```

**Explanation**:
The solution first counts the frequency of each character using a dictionary and then iterates through the string to find the first character with a count of one.

This approach has a time complexity of O(n), where n is the length of the string.

### Problem 5: [Divide Array into Equal Pairs](https://leetcode.com/problems/divide-array-into-equal-pairs/)

**Problem Statement**: You are given an integer array `nums` where the number of elements is even. Write a function to determine whether it's possible to pair every element with another identical element.

**Solution**:

```python
from collections import Counter

def divideArray(nums):
    return all(count % 2 == 0 for count in Counter(nums).values())
```

**Explanation**:

This function first counts the occurrences of each element in the array using `collections.Counter`. It then checks if all elements have an even count by iterating over the values of the counter. If every element appears an even number of times, then it is possible to pair each element with another identical element, allowing the array to be divided into pairs as required.

The function runs in O(n) time complexity, where `n` is the length of the input array.

### Problem 6: [Intersection of Two Arrays II](https://leetcode.com/problems/intersection-of-two-arrays-ii/)

**Problem Statement**: Given two arrays, write a function to compute their intersection, considering the count of elements.

**Solution**:

```python
from collections import Counter

def intersect(nums1, nums2):
    count1 = Counter(nums1)
    count2 = Counter(nums2)
    result = []

    for num in count1:
        if num in count2:
            common_min = min(count1[num], count2[num])
            result.extend([num] * common_min)

    return result
```

**Explanation**:
The function uses `collections.Counter` to count occurrences in both lists. The intersection is found by checking each element in the first count dictionary against the second and adding the minimum occurrence of each common element to the result list.

The time complexity of this approach is O(n + m), where n and m are the lengths of the two arrays.

### Problem 7: [Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/)

**Problem Statement**: Given an array of integers and an integer `k`, find out whether there are two distinct indices `i` and `j` in the array such that `nums[i] = nums[j]` and the absolute difference between `i` and `j` is at most `k`.

**Solution**:

```python
def containsNearbyDuplicate(nums, k):
    num_dict = {}
    for i, num in enumerate(nums):
        if num in num_dict and i - num_dict[num] <= k:
            return True
        num_dict[num] = i
    return False
```

**Explanation**:

The solution involves iterating through the list of numbers and storing each number's index in a dictionary. For each number:

- If the number already exists in the dictionary:
    - Check if the difference between the current index and the stored index (of the same number) is less than or equal to `k`.
    - If true, a duplicate within the range exists, so return `True`.
- Update the dictionary with the current number's latest index, regardless of whether it was found before or not. This ensures that the stored index is always the most recent one.

This approach leverages the efficiency of dictionaries to check and update elements in constant time. By keeping track of the most recent index of each element, the solution quickly assesses whether a valid duplicate exists within the range defined by `k`.

The time complexity of this algorithm is `O(n)`, where `n` is the number of elements in the array.

### Problem 8: [Finding the Users Active Minutes](https://leetcode.com/problems/finding-the-users-active-minutes/)

**Problem Statement**: You are given the logs for users' actions on LeetCode, and each log is represented as a tuple `(id, timestamp)`, where `id` is the user ID and `timestamp` is the time when the user performed an action. You are also given an integer `k`. The task is to return an array `answer`, where `answer[i]` represents the number of users whose User Active Minutes (UAM) count equals `i+1`. UAM is the number of unique minutes in which the user performed an action.

**Solution**:

```python
from collections import defaultdict

def findingUsersActiveMinutes(logs, k):
    user_minutes = defaultdict(set)
    
    # Collect unique minutes per user
    for id, timestamp in logs:
        user_minutes[id].add(timestamp)
    
    # Prepare the result array
    result = [0] * k
    for minutes in user_minutes.values():
        result[len(minutes) - 1] += 1
    
    return result
```

**Explanation**:

- We use a dictionary `user_minutes` to map each user ID to a set of timestamps (minutes) in which they were active. The use of a set ensures that each minute is counted only once per user.
- We loop through each log entry and add the timestamp to the corresponding user's set in the `user_minutes` dictionary.
- After populating the dictionary, we initialize an array `result` of size `k` to store the count of users with active minutes from `1` to `k`.
- We then iterate over each set of minutes in `user_minutes`. For each set, we determine the number of unique minutes (the size of the set) and increment the corresponding index in `result`. This counts how many users have that exact number of active minutes.
- Finally, the `result` array is returned, which contains the number of users whose active minutes count matches each possible count from `1` to `k`.

The function operates in `O(n)` time.

### Problem 9: [Number of Boomerangs](https://leetcode.com/problems/number-of-boomerangs/)

**Problem Statement**: You are given `n` points in the plane that are all pairwise distinct, and a point is represented as a pair of integers `(i, j)`. A "boomerang" is a tuple of points `(i, j, k)` such that the distance between `i` and `j` equals the distance between `i` and `k` (the order of the tuple matters). Find the number of boomerangs.

**Solution**:

```python
def numberOfBoomerangs(points):
    def distance(p1, p2):
        return (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2

    result = 0
    for i in points:
        distances = {}
        for j in points:
            if i != j:
                dist = distance(i, j)
                if dist in distances:
                    distances[dist] += 1
                else:
                    distances[dist] = 1

        for count in distances.values():
            result += count * (count - 1)

    return result
```

**Explanation**:

This problem requires calculating the distance between each pair of points and checking how many pairs have the same distance from a given point. The solution uses a dictionary to count the occurrences of each distance. For each point `i`, calculate the distance to every other point `j`. Use the dictionary to count how many points have the same distance to `i`. For each distance, if there are `n` points with that distance to `i`, then there are `n * (n - 1)` boomerangs. This is because you can arrange `n` points in `n * (n - 1)` ways (order matters).

The time complexity is `O(n^2)`, where `n` is the number of points.

### Problem 10: In Memory DB

Design a class `InMemoryDB` to store and retrieve data in memory. A record consists of a **key** (string) containing multiple **fields** (string), each mapped to a **value** (string). The database must handle **timestamps** (integers) and **Time-To-Live (TTL)** expiration logic: if a field’s expiry time is less than or equal to a given timestamp, that field is considered expired and should be removed.

1. **Basic Set & Get**

    - `set(key, field, value)`:  
        - Store (or overwrite) `field` of `key` with `value` and no expiration.  
    - `get(key, field) -> str | None`:  
        - Return the value of `field` in `key`.  
        - Return `None` if either the key or the field does not exist.

2. **Timestamped Set & Get**

    - `set_at(key, field, value, ts)`:  
        - Store `field` of `key` with `value`, treated as if set at timestamp `ts`, but with no expiration.  
    - `set_at_with_ttl(key, field, value, ts, ttl)`:  
        - Store `field` of `key` with `value`, as if set at time `ts`, expiring at `ts + ttl`.  
    - `get_at(key, field, ts) -> str | None`:  
        - Return the value of `field` in `key` at time `ts`, considering TTL.  
        - If the field is expired or doesn’t exist, return `None`.

3. **Deleting Fields**

    - `delete(key, field) -> bool`:  
        - Remove `field` from `key` immediately.  
        - Return `True` if the field was found and deleted, otherwise `False`.  
    - `delete_at(key, field, ts) -> bool`:  
        - First remove expired fields at or before `ts`, then remove `field` from `key`.  
        - Return `True` if the field was found and deleted, otherwise `False`.

4. **Scanning Fields**

    - `scan(key) -> str`:  
        - Return all fields of `key`, sorted lexicographically by field name, in the format:  
        `field1(value1), field2(value2), ...`  
        - Return `""` if `key` doesn’t exist or has no active fields.  
    - `scan_by_prefix(key, prefix) -> str`:  
        - Same as `scan(key)`, but only include fields whose name starts with `prefix`.  
        - Return `""` if no matching fields.  
    - `scan_at(key, ts) -> str`:  
        - Same as `scan(key)`, but first remove fields expired at or before `ts`.  
    - `scan_by_prefix_at(key, prefix, ts) -> str`:  
        - Same as `scan_by_prefix(key, prefix)`, but first remove fields expired at or before `ts`.

5. **Backups & Restore**  
    - `backup(ts) -> int`:
        - At time `ts`, remove any fields that have expired.
        - Then record a snapshot of the database as it exists after that removal.
        - Return the number of keys that have at least one field in this snapshot.  

    - `restore(ts, ts_to_restore) -> None`:
        - Find the most recent snapshot created at or before `ts_to_restore`.  
        - If no such snapshot exists, do nothing.  
        - Otherwise, restore the database to match that snapshot’s data. Any fields in the snapshot that had time remaining before expiration will continue to expire after the same remaining duration, but starting from the new restore time `ts`.

### Examples:

#### Example 1:

```python
db = InMemoryDB()

# Get non-existent field
assert db.get("user2", "nonexistent") is None

# Delete non-existent field
assert db.delete("user2", "nonexistent") is False

# Scan non-existent key
assert db.scan("user2") == ""

# TTL expiration
db.set_at_with_ttl("user3", "session", "active", 100, 10)
assert db.get_at("user3", "session", 110) is None

# Backup when database is empty
assert db.backup(50) == 0

# Restore to a timestamp before any backup
db.restore(200, 0)
assert db.scan("user3") == ""

db = InMemoryDB()
db.set("user1", "name", "Alice")
assert db.get("user1", "name") == "Alice"

# set with timestamp and TTL
db.set_at_with_ttl("user1", "email", "alice@example.com", 10, 5)
assert db.get_at("user1", "email", 12) == "alice@example.com"
assert db.get_at("user1", "email", 16) is None

# backup and restore
db.backup(15)
db.delete("user1", "name")
assert db.scan("user1") == ""

db.restore(20, 15)
assert db.scan("user1") == "name(Alice)"
```

#### Example 2:

```python
db = InMemoryDB()

db.set("A", "BC", "E")
db.set("A", "BD", "F")
db.set("A", "C", "G")

assert db.scan_by_prefix("A", "B") == "BC(E), BD(F)"
assert db.scan("A") == "BC(E), BD(F), C(G)"
assert db.scan_by_prefix("B", "B") == ""
```

#### Example 3:

```python
db = InMemoryDB()

db.set_at_with_ttl("A", "BC", "E", 1, 9)
db.set_at_with_ttl("A", "BC", "E", 5, 10)
db.set_at("A", "BD", "F", 5)

assert db.scan_by_prefix_at("A", "B", 14) == "BC(E), BD(F)"
assert db.scan_by_prefix_at("A", "B", 15) == "BD(F)"
```

#### Example 4:

```python
db = InMemoryDB()

db.set_at("A", "B", "C", 1)
db.set_at_with_ttl("X", "Y", "Z", 2, 15)

assert db.get_at("X", "Y", 3) == "Z"

db.set_at_with_ttl("A", "D", "E", 4, 10)

assert db.scan_at("A", 13) == "B(C), D(E)"
assert db.scan_at("X", 16) == "Y(Z)"
assert db.scan_at("X", 17) == ""
assert db.delete_at("X", "Y", 20) is False

db.set_at_with_ttl("A", "B", "C", 1, 10)

assert db.backup(3) == 1

db.set_at("A", "D", "E", 4)

assert db.backup(5) == 1
assert db.delete_at("A", "B", 8) is True
assert db.backup(9) == 1

db.restore(10, 7)

assert db.backup(11) == 1
assert db.scan_at("A", 15) == "B(C), D(E)"
assert db.scan_at("A", 16) == "D(E)"
```

#### Example 5:

```python
db = InMemoryDB()

# Get non-existent field
assert db.get("user2", "nonexistent") is None

# Delete non-existent field
assert db.delete("user2", "nonexistent") is False

# Scan non-existent key
assert db.scan("user2") == ""

# TTL expiration
db.set_at_with_ttl("user3", "session", "active", 100, 10)
assert db.get_at("user3", "session", 110) is None

# Backup when database is empty
assert db.backup(50) == 0

# Restore to a timestamp before any backup
db.restore(200, 0)
assert db.scan("user3") == ""
```

## Sample Implementation

```python
from collections import defaultdict


class InMemoryDB:
    def __init__(self):
        # entries[key][field] = (value, expiry or None)
        self.entries = defaultdict(dict)
        # backups[timestamp] = {key: {field: (value, leftover_ttl or None)}}
        self.backups = {}

    def set(self, key, field, val):
        """Set field of key to val with no expiration."""
        self.entries[key][field] = (val, None)

    def set_at(self, key, field, val, ts):
        """Set field of key to val, expiring at ts + infinite leftover => no expiry."""
        self.entries[key][field] = (val, None)

    def set_at_with_ttl(self, key, field, val, ts, ttl):
        """Set field of key to val, expiring at ts + ttl."""
        self.entries[key][field] = (val, ts + ttl)

    def delete(self, key, field):
        """Delete field from key if exists."""
        if key not in self.entries or field not in self.entries[key]:
            return False
        del self.entries[key][field]
        if not self.entries[key]:
            del self.entries[key]
        return True

    def delete_at(self, key, field, ts):
        """Clean up at time 'ts' then delete field from key."""
        self.clean_up(ts)
        return self.delete(key, field)

    def get(self, key, field):
        """Return the value for (key, field), or None if missing."""
        if key not in self.entries or field not in self.entries[key]:
            return None
        return self.entries[key][field][0]

    def get_at(self, key, field, ts):
        """Clean up at time 'ts', then return the value for (key, field)."""
        self.clean_up(ts)
        return self.get(key, field)

    def scan(self, key):
        """Return 'field1(value1), field2(value2), ...' sorted by field name."""
        if key not in self.entries:
            return ""
        fields = sorted(self.entries[key].keys())
        return ", ".join(f"{f}({self.entries[key][f][0]})" for f in fields)

    def scan_at(self, key, ts):
        """Scan after cleaning up at time 'ts'."""
        self.clean_up(ts)
        return self.scan(key)

    def scan_by_prefix(self, key, prefix):
        """Scan fields starting with prefix."""
        if key not in self.entries:
            return ""
        filtered = [f for f in self.entries[key] if f.startswith(prefix)]
        filtered.sort()
        return ", ".join(f"{f}({self.entries[key][f][0]})" for f in filtered)

    def scan_by_prefix_at(self, key, prefix, ts):
        """Scan fields starting with prefix, after cleaning up."""
        self.clean_up(ts)
        return self.scan_by_prefix(key, prefix)

    def backup(self, ts):
        """
        Create a backup of current data at time 'ts'.
        Return # of non-empty keys.
        """
        self.clean_up(ts)
        backed_up = defaultdict(dict)
        count = 0
        for key, field_vals in self.entries.items():
            for field, (val, expiry) in field_vals.items():
                leftover = None if expiry is None else (expiry - ts)
                backed_up[key][field] = (val, leftover)
            count += 1
        self.backups[ts] = backed_up
        return count

    def restore(self, ts, ts_to_restore):
        """
        Restore data from the latest backup <= ts_to_restore.
        Expiry is reset so each field has the same leftover time
        it did at the backup moment.
        """
        best_ts = None
        best_bu = None
        for t, bu in self.backups.items():
            if t <= ts_to_restore and (best_ts is None or t > best_ts):
                best_ts = t
                best_bu = bu
        if best_bu is None:
            return  # no backup found
        new_entries = defaultdict(dict)
        for key, field_vals in best_bu.items():
            for field, (val, leftover) in field_vals.items():
                if leftover is None:
                    new_entries[key][field] = (val, None)
                else:
                    new_entries[key][field] = (val, ts + leftover)
        self.entries = new_entries

    def clean_up(self, ts):
        """Remove or keep fields based on expiration vs current time."""
        for key in list(self.entries.keys()):
            new_field_vals = {}
            for field, (val, expiry) in self.entries[key].items():
                # expiry == None => never expires
                if expiry is None or ts < expiry:
                    new_field_vals[field] = (val, expiry)
            if new_field_vals:
                self.entries[key] = new_field_vals
            else:
                del self.entries[key]
```

### Problem 11: Cloud Storage

Design a simplified cloud storage manager that supports multiple users (each with their own storage limit) and provides the following operations. Focus is on clarity rather than performance optimizations.

1. **`ADD_USER(userId, capacity)`**

    - Creates a new user with storage capacity = `capacity`.  
    - Fails if `userId` already exists.  
    - Returns `True` if successful, `False` otherwise.

2. **`ADD_FILE_BY(userId, name, size)`**

    - Creates a new file `name` (size = `size`) owned by `userId`.  
    - Fails if `userId` doesn’t exist, if `name` already exists, or if adding the file exceeds `userId`’s capacity.  
    - Returns remaining capacity (as an integer or string) if successful, or `None` on failure.

3. **`COPY_FILE(nameFrom, nameTo)`**

    - Copies `nameFrom` → `nameTo`, inheriting the same owner.  
    - Fails if `nameFrom` doesn’t exist, `nameTo` already exists, or if copying exceeds the owner’s capacity.  
    - Returns `True` if successful, `False` otherwise.

4. **`GET_FILE_SIZE(name)`**

    - Returns the size of `name` if it exists, or `None` if it doesn’t.

5. **`FIND_FILE(prefix, suffix)`**

    - Returns a comma‐separated list of files matching:
        - **start** with `prefix`
        - **end** with `suffix`
    - Sort matches in **descending** size, and by **lexicographical** order to break ties.  
    - Each file is listed as `"<fileName>(<size>)"`.  
    - Returns an empty string if no matches.

6. **`UPDATE_CAPACITY(userId, newCapacity)`**

    - Updates the user’s capacity to `newCapacity`.  
    - If the current usage exceeds `newCapacity`, remove the largest files first (breaking ties lexicographically) until usage is ≤ `newCapacity`.  
    - Returns the number of removed files, or `None` if `userId` doesn’t exist.

7. **`COMPRESS_FILE(userId, name)`**

    - Replaces file `name` (owned by `userId`) with `name + ".COMPRESSED"`, halving its size.  
    - Ownership remains with `userId`.  
    - Returns the user’s remaining capacity if successful, or `None` on failure.

8. **`DECOMPRESS_FILE(userId, name)`**

    - Reverts a `.COMPRESSED` file back to its uncompressed form (size is doubled, suffix dropped).  
    - Fails if it would exceed `userId`’s capacity or if the file doesn’t belong to `userId`.  
    - Returns the user’s remaining capacity if successful, or `None` on failure.

## Example Usage

```python
storage = Storage()

# 1) Add two users
print(storage.add_user("user1", 100))   # True
print(storage.add_user("user2", 50))    # True

# 2) Add a file for user1
res = storage.add_file_by("user1", "/dir/file.txt", 40)
print(res)  # 60 (user1 now has 60 bytes left)

# 3) Get file size
print(storage.get_file_size("/dir/file.txt"))  # 40

# 4) Compress the file
res = storage.compress_file("user1", "/dir/file.txt")
print(res)  # 80 (file is now "/dir/file.txt.COMPRESSED", size is 20)

# 5) Copy the compressed file
#   user1 has 80 bytes free, copying a 20-byte file is allowed
print(storage.copy_file("/dir/file.txt.COMPRESSED", "/dir/copy.txt.COMPRESSED"))  # True

# 6) Check FIND_FILE results
print(storage.find_file("/dir", ".COMPRESSED"))  
# Example output: "/dir/copy.txt.COMPRESSED(20), /dir/file.txt.COMPRESSED(20)"

# 7) Decompress the original compressed file
res = storage.decompress_file("user1", "/dir/file.txt.COMPRESSED")
# The file becomes "/dir/file.txt" with size = 40 again
print(res)  # 40 (user1 has 40 bytes left now)

# 8) Update user2’s capacity, forcing file removals if needed
removed = storage.update_capacity("user2", 10)
print(removed)  # 0 if user2 had no large files, or the number of removed files
```

## Sample Implementation

```python
class Storage:
    def __init__(self):
        self.size = {}  # { fileName: int(size) }
        self.owner = {}  # { fileName: userId }
        self.capacity = {}  # { userId: int(capacity) }

    def add_user(self, user_id: str, capacity: int) -> bool:
        if user_id in self.capacity:
            return False
        self.capacity[user_id] = capacity
        return True

    def add_file_by(self, user_id: str, file_name: str, file_size: int):
        if user_id not in self.capacity or file_name in self.size:
            return None

        total_used = 0
        for existing_file, owner_id in self.owner.items():
            if owner_id == user_id:
                total_used += self.size[existing_file]

        if total_used + file_size > self.capacity[user_id]:
            return None

        self.size[file_name] = file_size
        self.owner[file_name] = user_id

        remaining_capacity = self.capacity[user_id] - (total_used + file_size)
        return remaining_capacity

    def copy_file(self, source_name: str, dest_name: str) -> bool:
        if source_name not in self.size:
            return False
        if dest_name in self.size:
            return False

        source_owner = self.owner[source_name]
        source_size = self.size[source_name]

        added_capacity = self.add_file_by(source_owner, dest_name, source_size)
        return added_capacity is not None

    def get_file_size(self, file_name: str):
        return self.size.get(file_name, None)

    def find_file(self, prefix: str, suffix: str) -> str:
        matches = []

        for f_name, f_size in self.size.items():
            if f_name.startswith(prefix) and f_name.endswith(suffix):
                matches.append((f_name, f_size))

        if not matches:
            return ""

        matches.sort(key=lambda x: (-x[1], x[0]))

        return ", ".join(f"{fn}({sz})" for fn, sz in matches)

    def update_capacity(self, user_id: str, new_capacity: int):
        if user_id not in self.capacity:
            return None

        self.capacity[user_id] = new_capacity

        files_for_user = []
        total_used = 0
        for f_name, owner_id in self.owner.items():
            if owner_id == user_id:
                file_size = self.size[f_name]
                files_for_user.append((f_name, file_size))
                total_used += file_size

        if total_used <= new_capacity:
            return 0

        files_for_user.sort(key=lambda x: (-x[1], x[0]))

        removed_count = 0

        for f_name, f_size in files_for_user:
            if total_used <= new_capacity:
                break
            del self.size[f_name]
            del self.owner[f_name]
            total_used -= f_size
            removed_count += 1

        return removed_count

    def compress_file(self, user_id: str, file_name: str):
        if file_name not in self.size or self.owner[file_name] != user_id:
            return None

        original_size = self.size[file_name]
        new_file_name = file_name + ".COMPRESSED"

        del self.size[file_name]
        del self.owner[file_name]

        compressed_size = original_size // 2
        self.size[new_file_name] = compressed_size
        self.owner[new_file_name] = user_id

        total_used = sum(sz for f, sz in self.size.items() if self.owner[f] == user_id)
        remaining_capacity = self.capacity[user_id] - total_used
        return remaining_capacity

    def decompress_file(self, user_id: str, file_name: str):
        if file_name not in self.size or self.owner[file_name] != user_id:
            return None

        compressed_size = self.size[file_name]
        new_file_name = file_name.removesuffix(".COMPRESSED")

        total_used_before = sum(
            sz for f, sz in self.size.items() if self.owner[f] == user_id
        )
        new_size = compressed_size * 2
        used_after = total_used_before - compressed_size + new_size

        if used_after > self.capacity[user_id]:
            return None

        del self.size[file_name]
        del self.owner[file_name]

        self.size[new_file_name] = new_size
        self.owner[new_file_name] = user_id

        remaining_capacity = self.capacity[user_id] - used_after
        return remaining_capacity
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
