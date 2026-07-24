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

Python’s built-in `set` type provides an efficient way to perform these operations, making sets an ideal choice for many algorithmic challenges where quick look-ups, inserts, or deletions are necessary.

## Section 2: Set Operations

Python's built-in [`set`](https://docs.python.org/3/library/stdtypes.html#set) type is implemented using a [hash table](https://en.wikipedia.org/wiki/Hash_table), making it highly optimized for performance and ease of use. This implementation allows for rapid access to data, making operations like addition, deletion, and membership tests very efficient.

### Creating a Set

A set can be created simply by using the `set()` constructor or by defining a set literal with curly braces `{}`:

```python
my_set = set()  # an empty set
number_set = {1, 2, 3, 4, 5}  # a set with initial numbers
primes_less_than_10 = set([2, 3, 5, 7])  # construct a set from a list
```

### Add Operation

Elements are added using the `add()` method:

```python
my_set.add('apple')
my_set.add('banana')  # The set becomes {'apple', 'banana'}
```

The time complexity of the add operation is O(1) on average.

### Remove Operation

In Python, sets provide two methods for element removal: `remove()` and `discard()`. Both methods serve to eliminate elements but handle non-existent entries differently.

- **`remove()`**: This method removes a specified element from the set. If the element is not found, it raises a `KeyError`. This is useful when you need to ensure the element was indeed present in the set.

  ```python
  fruits = {'apple', 'banana', 'cherry'}
  fruits.remove('apple')  # Successfully removes 'apple'
  # fruits.remove('apple')  # Raises KeyError as 'apple' is no longer in the set
  ```

- **`discard()`**: Similar to `remove()`, `discard()` eliminates the specified element from the set but does not raise an error if the element is not found. This makes `discard()` preferable for cases where you want to ensure an element is absent from the set without concerning whether it was part of the set to begin with.

  ```python
  numbers = {1, 2, 3}
  numbers.discard(2)  # Removes '2' from the set
  numbers.discard(2)  # Does nothing, no error raised, since '2' is already removed
  ```

Using `remove()` or `discard()` depends on your specific requirements regarding error handling. If you need to confirm removal or capture errors for elements that aren't present, use `remove()`. If you prefer a fail-safe removal where no error feedback is necessary, `discard()` is the better choice.

The time complexity of the removal operation is typically O(1).

### Membership Checking

The contains operation, utilized with the `in` keyword, checks whether a specified element exists within the set. Due to the underlying hash table implementation, this operation is efficient, typically running in O(1) time.

```python
my_set = {'apple', 'banana', 'cherry'}
print('banana' in my_set)  # Output: True
print('orange' in my_set)  # Output: False
```

### Set-Theoretic Operations

Python sets support various operations that enable you to combine, compare, and contrast the elements of sets in efficient ways. Here are the most commonly used set operations:

#### Union

The union of two sets is a set containing all elements from both sets, without duplicates. You can perform a union using the `.union()` method or the `|` operator.

```python
a = {1, 2, 3}
b = {3, 4, 5}
print(a.union(b))  # Output: {1, 2, 3, 4, 5}
print(a | b)       # Output: {1, 2, 3, 4, 5}
```

The union of two sets has a time complexity of O(len(s) + len(t)), where `s` and `t` are the two sets. This complexity arises because the operation potentially involves iterating through all elements of both sets.

#### Intersection
The intersection of two sets is a set containing only the elements that are common to both sets. You can perform an intersection using the `.intersection()` method or the `&` operator.

```python
print(a.intersection(b))  # Output: {3}
print(a & b)              # Output: {3}
```

This operation requires O(min(len(s), len(t))) time, as it involves iterating through the smaller set and checking for each element's presence in the larger set.


#### Difference
The difference between two sets is a set containing elements that are in the first set but not in the second. This operation can be performed using the `.difference()` method or the `-` operator.

```python
print(a.difference(b))  # Output: {1, 2}
print(a - b)            # Output: {1, 2}
```

The difference between two sets, which involves elements in `s` not in `t`, has a complexity of O(len(s)), assuming the difference is calculated for the first set.

#### Symmetric Difference
The symmetric difference of two sets is a set containing elements that are in either of the sets but not in their intersection. It is performed using the `.symmetric_difference()` method or the `^` operator.

```python
print(a.symmetric_difference(b))  # Output: {1, 2, 4, 5}
print(a ^ b)                      # Output: {1, 2, 4, 5}
```

The symmetric difference, representing elements in either `s` or `t` but not in both, has a complexity of O(len(s)).

#### Subset and Superset
You can check if one set is a subset of another (all elements of the first set are in the second set) using the `.issubset()` method, or if one set is a superset of another (all elements of the second set are in the first set) using the `.issuperset()` method.

```python
c = {1, 2}
c.issubset(a)  # Output: True
c <= a  # Subset check: True, equivalent to c.issubset(a)
a.issuperset(c)  # Output: True
a >= c  # Superset check: True, equivalent to a.issuperset(c)
```

These operations involve checking every element of the subset or the superset, leading to a time complexity of O(len(s)) for `issubset` and O(len(t)) for `issuperset`.

## Section 3: Solved Problems

### Problem 1: [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

**Problem Statement**: Given an integer array, determine if any value appears at least twice in the array.

**Solution**:

```python
def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False
```

**Explanation**:
Utilize a set to track seen numbers. If a number repeats, it is immediately detected thanks to the set's O(1) lookup time.

Below is a one-liner solution:

```python
def containsDuplicate(nums):
    return len(nums) != len(set(nums))
```

### Problem 2: [Distribute Candies](https://leetcode.com/problems/distribute-candies/)

**Problem Statement**: Given an integer array `candyType` of length `n`, where `candyType[i]` represents the type of the ith candy. You can eat at most `n / 2` candies, and you want to eat the maximum number of different types of candies. Return the maximum number of different types of candies you can eat if you only eat `n / 2` of them.

**Solution**:

```python
def distributeCandies(candyType):
    return min(len(set(candyType)), len(candyType) // 2)
```

**Explanation**:
The strategy is to eat as many different types of candies as possible. Convert the list to a set to get unique candy types and then compare the number of unique candies to the maximum candies you can eat (`n / 2`).

### Problem 3: [Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/)

**Problem Statement**: Given two arrays, write a function to compute their intersection. Each element in the result must be unique.

**Solution**:

```python
def intersection(nums1, nums2):
    return list(set(nums1) & set(nums2))
```

**Explanation**:
Convert both lists to sets and find the intersection using the `&` operator.

### Problem 4: [Jewels and Stones](https://leetcode.com/problems/jewels-and-stones/)

**Problem Statement**: You're given strings `J` representing the types of stones that are jewels, and `S` representing the stones you have. Each character in `S` is a type of stone you have. You want to know how many of the stones you have are also jewels.

**Solution**:

```python
def numJewelsInStones(J, S):
    jewel_set = set(J)
    return sum(stone in jewel_set for stone in S)
```

**Explanation**:
Convert the jewels string `J` into a set to utilize O(1) average-time complexity for membership checks. Then, count how many stones in `S` are also jewels by checking membership in the jewel set.

### Problem 5: [Maximum Number of Words You Can Type](https://leetcode.com/problems/maximum-number-of-words-you-can-type/)

**Problem Statement**: You are given a string `text` of words that are separated by single spaces and a string `brokenLetters` of all distinct letters, which are broken on your keyboard. Return the number of words that can be fully typed using only letters that are not broken.

**Solution**:

```python
def canBeTypedWords(text: str, brokenLetters: str) -> int:
    brokens = frozenset(brokenLetters)
    return sum(
        all(c not in brokens for c in word)
        for word in text.split()
    )
```

**Explanation**:
- **Frozenset Creation**: The solution first converts the string `brokenLetters` into a `frozenset`. Using a `frozenset` is advantageous for membership tests as it is immutable and typically offers faster lookup times compared to a regular set.
- **Text Splitting and Word Checking**: The input string `text` is split by spaces to extract individual words. For each word, the solution uses a generator expression inside `all()` to check if every character `c` in the word does not belong to the `brokens` set.
- **Count Valid Words**: The `sum()` function iteratively counts how many words return `True` from the `all()` check, indicating they do not contain any broken letters and thus can be typed.

**Complexity Analysis**:
- The solution has a time complexity of O(N * M), where `N` is the number of words in the text and `M` is the average length of these words. This accounts for checking each character in each word against the `frozenset` of broken letters.
- Space complexity is O(B), where `B` is the number of broken letters, due to storing these letters in a `frozenset`.


### Problem 6: [Happy Number](https://leetcode.com/problems/happy-number/)

**Problem Statement**: Write an algorithm to determine if a number `n` is "happy". A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits, and repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.

**Solution**:

```python
def isHappy(n):
    seen = set()
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(x) ** 2 for x in str(n))
    return n == 1
```

**Explanation**:
Use a set to track numbers that have already been computed to detect cycles. For each iteration, compute the sum of the squares of its digits. If the number reaches 1, it's happy; if it repeats, it's not.

### Problem 7: [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)

**Problem Statement**: Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. The sequence has to be strictly consecutive, and the array can contain duplicates.

**Solution**:

```python
def longestConsecutive(self, nums):
    nums = frozenset(nums)
    best = 0
    for x in nums:
        if x - 1 not in nums:  # Only start counting when `x` is the beginning of a sequence
            y = x + 1
            while y in nums:
                y += 1
            best = max(best, y - x)
    return best
```

**Explanation**:

The solution first converts the list of numbers into a set to eliminate any duplicates and to take advantage of O(1) average time complexity for checks on membership. It then iterates through each number in the set and checks if it is the start of a sequence (i.e., `x - 1` is not in the set). If it is, it attempts to find the end of this consecutive sequence by incrementally checking for the next number in the set until the sequence breaks. The difference between the start and end of this sequence provides the length of the current consecutive sequence, and the algorithm keeps track of the longest sequence found.

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
