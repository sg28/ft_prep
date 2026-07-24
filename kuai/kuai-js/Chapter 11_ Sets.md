# Chapter 11: Sets

## Section 1: Introduction to Sets

Sets are a powerful and versatile data structure primarily used for storing unique elements. They are particularly useful in solving problems where the focus is on element uniqueness or set operations like unions, intersections, and differences.

### Core Operations of Sets:

- **Add**: Adds an element to the set.
- **Remove**: Removes an element from the set.
- **Contains**: Checks whether an element is in the set.
- **Union**: Combines two sets, keeping only unique elements.
- **Intersection**: Returns common elements between two sets.
- **Difference**: Identifies elements present in one set but not in the other.

JavaScript's built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) type provides an efficient way to perform these operations, making sets an ideal choice for many algorithmic challenges where quick look-ups, inserts, or deletions are necessary.

## Section 2: Set Operations

JavaScript's built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) type is implemented using a [hash table](https://en.wikipedia.org/wiki/Hash_table), making it highly optimized for performance and ease of use. This implementation allows for rapid access to data, making operations like addition, deletion, and membership tests very efficient.

One important detail: a JavaScript `Set` uses [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Equality_comparisons_and_sameness#same-value-zero_equality) equality, which behaves like `===` for primitives (numbers, strings, booleans). Objects and arrays, however, are compared by reference — two distinct arrays with the same contents are treated as different elements. When you need to key on a compound value (like grid coordinates `(i, j)`), use a string key such as `` `${i},${j}` `` instead of an array.

### Creating a Set

A set can be created by using the `new Set()` constructor. Passing an iterable (such as an array) initializes it with those values, automatically discarding duplicates:

```javascript
const mySet = new Set();                       // an empty set
const numberSet = new Set([1, 2, 3, 4, 5]);    // a set with initial numbers
const primesLessThan10 = new Set([2, 3, 5, 7]); // construct a set from an array
```

### Add Operation

Elements are added using the `add()` method, which returns the set itself (so calls can be chained):

```javascript
mySet.add('apple');
mySet.add('banana');  // The set becomes {'apple', 'banana'}
```

The time complexity of the add operation is O(1) on average.

### Remove Operation

Unlike Python — which offers two distinct methods, `remove()` (raises a `KeyError` if the element is missing) and `discard()` (silently does nothing) — JavaScript provides a single method: `delete()`.

- **`delete()`**: This method removes a specified element from the set. It **never throws** an error if the element is absent. Instead, it **returns a boolean**: `true` if the element was present and removed, and `false` if it was not in the set. This return value gives you the best of both worlds — you can safely delete without guarding against errors, and you can still detect whether the element was actually there.

  ```javascript
  const fruits = new Set(['apple', 'banana', 'cherry']);
  fruits.delete('apple');   // returns true, successfully removes 'apple'
  fruits.delete('apple');   // returns false, does nothing (already gone), no error raised
  ```

  So JavaScript's single `delete()` covers both Python use cases:
  - Where Python's `discard()` is desired (fail-safe removal), just call `delete()` and ignore the return value.
  - Where Python's `remove()` is desired (confirm the element was present), inspect the boolean return value and act on it yourself.

  ```javascript
  const numbers = new Set([1, 2, 3]);
  numbers.delete(2);  // returns true, removes 2 from the set
  numbers.delete(2);  // returns false, does nothing, no error raised, since 2 is already removed

  // Emulating Python's remove() (throw when absent):
  if (!numbers.delete(42)) {
    throw new Error('42 not in set');
  }
  ```

The time complexity of the removal operation is typically O(1).

### Membership Checking

The contains operation, performed with the `has()` method, checks whether a specified element exists within the set. Due to the underlying hash table implementation, this operation is efficient, typically running in O(1) time.

```javascript
const mySet = new Set(['apple', 'banana', 'cherry']);
console.log(mySet.has('banana'));  // Output: true
console.log(mySet.has('orange'));  // Output: false
```

### Set-Theoretic Operations

Python sets support operators (`|`, `&`, `-`, `^`) and methods (`.union()`, `.intersection()`, etc.) for combining, comparing, and contrasting sets. As of **ES2024**, JavaScript `Set` instances also gained built-in methods for these operations: [`union`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union), [`intersection`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection), [`difference`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference), [`symmetricDifference`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference), [`isSubsetOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf), and [`isSupersetOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSupersetOf).

Because these methods are relatively new and may not be available in every runtime, the examples below implement portable helper versions that run everywhere. The equivalent native method is noted in each section.

#### Union

The union of two sets is a set containing all elements from both sets, without duplicates.

```javascript
function union(s, t) {
  const result = new Set(s);
  for (const x of t) {
    result.add(x);
  }
  return result;
}

const a = new Set([1, 2, 3]);
const b = new Set([3, 4, 5]);
console.log(union(a, b));  // Output: Set(5) {1, 2, 3, 4, 5}

// ES2024 native equivalent:
// a.union(b)
```

The union of two sets has a time complexity of O(len(s) + len(t)), where `s` and `t` are the two sets. This complexity arises because the operation potentially involves iterating through all elements of both sets.

#### Intersection

The intersection of two sets is a set containing only the elements that are common to both sets.

```javascript
function intersection(s, t) {
  // Iterate over the smaller set for efficiency.
  const [small, large] = s.size <= t.size ? [s, t] : [t, s];
  const result = new Set();
  for (const x of small) {
    if (large.has(x)) {
      result.add(x);
    }
  }
  return result;
}

console.log(intersection(a, b));  // Output: Set(1) {3}

// ES2024 native equivalent:
// a.intersection(b)
```

This operation requires O(min(len(s), len(t))) time, as it involves iterating through the smaller set and checking for each element's presence in the larger set.

#### Difference

The difference between two sets is a set containing elements that are in the first set but not in the second.

```javascript
function difference(s, t) {
  const result = new Set();
  for (const x of s) {
    if (!t.has(x)) {
      result.add(x);
    }
  }
  return result;
}

console.log(difference(a, b));  // Output: Set(2) {1, 2}

// ES2024 native equivalent:
// a.difference(b)
```

The difference between two sets, which involves elements in `s` not in `t`, has a complexity of O(len(s)), assuming the difference is calculated for the first set.

#### Symmetric Difference

The symmetric difference of two sets is a set containing elements that are in either of the sets but not in their intersection.

```javascript
function symmetricDifference(s, t) {
  const result = new Set(s);
  for (const x of t) {
    if (result.has(x)) {
      result.delete(x);  // in both -> remove
    } else {
      result.add(x);     // only in t -> add
    }
  }
  return result;
}

console.log(symmetricDifference(a, b));  // Output: Set(4) {1, 2, 4, 5}

// ES2024 native equivalent:
// a.symmetricDifference(b)
```

The symmetric difference, representing elements in either `s` or `t` but not in both, has a complexity of O(len(s) + len(t)).

#### Subset and Superset

You can check if one set is a subset of another (all elements of the first set are in the second set), or if one set is a superset of another (all elements of the second set are in the first set).

```javascript
function isSubset(s, t) {
  if (s.size > t.size) return false;
  for (const x of s) {
    if (!t.has(x)) return false;
  }
  return true;
}

function isSuperset(s, t) {
  return isSubset(t, s);
}

const c = new Set([1, 2]);
console.log(isSubset(c, a));    // Output: true  (equivalent to Python's c.issubset(a))
console.log(isSuperset(a, c));  // Output: true  (equivalent to Python's a.issuperset(c))

// ES2024 native equivalents:
// c.isSubsetOf(a)
// a.isSupersetOf(c)
```

These operations involve checking every element of the subset, leading to a time complexity of O(len(s)) for `isSubset` and O(len(t)) for `isSuperset`.

## Section 3: Solved Problems

### Problem 1: [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

**Problem Statement**: Given an integer array, determine if any value appears at least twice in the array.

**Solution**:

```javascript
function containsDuplicate(nums) {
  const seen = new Set();
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
}
```

**Explanation**:
Utilize a set to track seen numbers. If a number repeats, it is immediately detected thanks to the set's O(1) lookup time.

Below is a one-liner solution:

```javascript
function containsDuplicate(nums) {
  return nums.length !== new Set(nums).size;
}
```

### Problem 2: [Distribute Candies](https://leetcode.com/problems/distribute-candies/)

**Problem Statement**: Given an integer array `candyType` of length `n`, where `candyType[i]` represents the type of the ith candy. You can eat at most `n / 2` candies, and you want to eat the maximum number of different types of candies. Return the maximum number of different types of candies you can eat if you only eat `n / 2` of them.

**Solution**:

```javascript
function distributeCandies(candyType) {
  return Math.min(new Set(candyType).size, Math.floor(candyType.length / 2));
}
```

**Explanation**:
The strategy is to eat as many different types of candies as possible. Convert the array to a set to get unique candy types and then compare the number of unique candies to the maximum candies you can eat (`n / 2`).

### Problem 3: [Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/)

**Problem Statement**: Given two arrays, write a function to compute their intersection. Each element in the result must be unique.

**Solution**:

```javascript
function intersection(nums1, nums2) {
  const set1 = new Set(nums1);
  const set2 = new Set(nums2);
  return [...set1].filter((x) => set2.has(x));
}
```

**Explanation**:
Convert both arrays to sets, then keep only the elements of the first set that are also present in the second. Using the spread operator `[...set1]` turns the set back into an array so we can `filter` it. (With ES2024 you could write `[...set1.intersection(set2)]` directly.)

### Problem 4: [Jewels and Stones](https://leetcode.com/problems/jewels-and-stones/)

**Problem Statement**: You're given strings `J` representing the types of stones that are jewels, and `S` representing the stones you have. Each character in `S` is a type of stone you have. You want to know how many of the stones you have are also jewels.

**Solution**:

```javascript
function numJewelsInStones(J, S) {
  const jewelSet = new Set(J);
  let count = 0;
  for (const stone of S) {
    if (jewelSet.has(stone)) {
      count += 1;
    }
  }
  return count;
}
```

**Explanation**:
Convert the jewels string `J` into a set to utilize O(1) average-time complexity for membership checks. (Iterating a string with `for...of` yields its individual characters.) Then, count how many stones in `S` are also jewels by checking membership in the jewel set.

### Problem 5: [Maximum Number of Words You Can Type](https://leetcode.com/problems/maximum-number-of-words-you-can-type/)

**Problem Statement**: You are given a string `text` of words that are separated by single spaces and a string `brokenLetters` of all distinct letters, which are broken on your keyboard. Return the number of words that can be fully typed using only letters that are not broken.

**Solution**:

```javascript
function canBeTypedWords(text, brokenLetters) {
  const broken = new Set(brokenLetters);
  return text
    .split(' ')
    .filter((word) => [...word].every((c) => !broken.has(c)))
    .length;
}
```

**Explanation**:
- **Set Creation**: The solution first converts the string `brokenLetters` into a `Set`. JavaScript has no separate immutable "frozen set" type as Python does, but a plain `Set` gives the same fast O(1) membership tests we need here.
- **Text Splitting and Word Checking**: The input string `text` is split by spaces to extract individual words. For each word, `Array.prototype.every` checks whether every character `c` in the word is not in the `broken` set (this is the JavaScript equivalent of Python's `all()`).
- **Count Valid Words**: `filter` keeps only the words that pass the `every` check, and `.length` counts them — the number of words that contain no broken letters and thus can be typed.

**Complexity Analysis**:
- The solution has a time complexity of O(N * M), where `N` is the number of words in the text and `M` is the average length of these words. This accounts for checking each character in each word against the `Set` of broken letters.
- Space complexity is O(B), where `B` is the number of broken letters, due to storing these letters in a `Set`.


### Problem 6: [Happy Number](https://leetcode.com/problems/happy-number/)

**Problem Statement**: Write an algorithm to determine if a number `n` is "happy". A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.

**Solution**:

```javascript
function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = [...String(n)].reduce((sum, x) => sum + Number(x) ** 2, 0);
  }
  return n === 1;
}
```

**Explanation**:
Use a set to track numbers that have already been computed to detect cycles. For each iteration, compute the sum of the squares of its digits (converting the number to a string with `String(n)`, iterating over its digit characters, and reducing them). If the number reaches 1, it's happy; if it repeats, it's not.

### Problem 7: [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)

**Problem Statement**: Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. The sequence has to be strictly consecutive, and the array can contain duplicates.

**Solution**:

```javascript
function longestConsecutive(nums) {
  const numSet = new Set(nums);
  let best = 0;
  for (const x of numSet) {
    if (!numSet.has(x - 1)) {  // Only start counting when `x` is the beginning of a sequence
      let y = x + 1;
      while (numSet.has(y)) {
        y += 1;
      }
      best = Math.max(best, y - x);
    }
  }
  return best;
}
```

**Explanation**:

The solution first converts the array of numbers into a set to eliminate any duplicates and to take advantage of O(1) average time complexity for membership checks. It then iterates through each number in the set and checks if it is the start of a sequence (i.e., `x - 1` is not in the set). If it is, it attempts to find the end of this consecutive sequence by incrementally checking for the next number in the set until the sequence breaks. The difference between the start and end of this sequence provides the length of the current consecutive sequence, and the algorithm keeps track of the longest sequence found.

**Complexity Analysis**:

Although the solution involves a nested loop, each element in the original array is checked exactly twice (once in the outer loop and once in the inner while loop) under the worst-case scenario. Therefore, the time complexity is linear relative to the number of elements in the input array.


## Section 4: Exercises

1. [**Unique Morse Code Words**](https://leetcode.com/problems/unique-morse-code-words/)
2. [**Valid Sudoku**](https://leetcode.com/problems/valid-sudoku/)
3. [**Isomorphic Strings**](https://leetcode.com/problems/isomorphic-strings/)
4. [**Keyboard Row**](https://leetcode.com/problems/keyboard-row/description/)
5. [**Fair Candy Swap**](https://leetcode.com/problems/fair-candy-swap/description/)
6. [**Unique Email Addresses**](https://leetcode.com/problems/unique-email-addresses/)
7. [**Keep Multiplying Found Values by Two**](https://leetcode.com/problems/keep-multiplying-found-values-by-two/)
8. [**Destination City**](https://leetcode.com/problems/destination-city/)
9. [**Number of Different Integers in a String**](https://leetcode.com/problems/number-of-different-integers-in-a-string/)
10. [**Path Crossing**](https://leetcode.com/problems/path-crossing/)
11. [**Maximum Size of a Set After Removals**](https://leetcode.com/problems/maximum-size-of-a-set-after-removals/)
12. [**Partition String**](https://leetcode.com/problems/partition-string/description/)
13. [**Find All Lonely Numbers in the Array**](https://leetcode.com/problems/find-all-lonely-numbers-in-the-array/description/)
