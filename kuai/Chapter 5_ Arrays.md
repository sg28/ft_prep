# Chapter 5: Arrays

## Section 1: Lists

Python lists are arrays that are mutable and can hold mixed data types.

### Creating and Accessing Lists

- **Initialization**: Lists can be created with square brackets `[]`, holding any combination of data types.

  ```python
  my_list = [1, 'hello', 3.14]
  ```

- **Element Access**: Elements are accessed via their index. Python supports negative indexing, where `-1` corresponds to the last item. Accessing an element is an O(1) operation.

  ```python
  first_element = my_list[0]
  last_element = my_list[-1]
  ```

- **Finding Elements**: Use the `index()` method to find the first occurrence of an element in a list. If the element is not found, a `ValueError` is raised.

  ```python
    position = my_list.index('hello')  # Returns the index of 'hello'
    print(f"'hello' is at position {position}")  # Output: 'hello' is at position 1

    try:
        position = my_list.index('goodbye')
        print(f"'goodbye' is at position {position}")
    except ValueError:
        print("'goodbye' is not in the list")
  ```

### Iteration

Iterate over lists using `for` loops:

```python
for value in my_list:
    print(value)
```
Use `enumerate()` when you need both index and value:

```python
for index, value in enumerate(my_list):
    print(f"Index: {index}, Value: {value}")
```

The [zip](https://docs.python.org/3/library/functions.html#zip) function allows you to iterate over more than one lists simultaneously:

```python
nums1 = [1, 3, 5]
nums2 = [2, 4, 6]
for n1, n2 in zip(nums1, nums2):
    print(n1, n2)
```

### [List Comprehensions](https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions)

Create new lists succinctly through comprehensions: `[expression for item in iterable if condition]`. They're more concise and often faster than equivalent loop constructs.

```python
squares = [x ** 2 for x in range(10)]
odd_squares = [x ** 2 for x in range(10) if x % 2 == 0]

# Nested list comprehension
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
flattened_matrix = [element for row in matrix for element in row]
```

### Utility Functions

- **`min()` and `max()`**: Retrieve the smallest and largest elements, respectively, both running in O(n) time across the list.

  ```python
  print(min(my_list))
  print(max(my_list))
  ```

- **`sum()`**: Calculates the total of elements, assuming they are numeric, in O(n) time.

  ```python
  numbers = [10, 20, 30]
  print(sum(numbers))  # Output: 60
  ```

- **`count()`**: Counts occurrences of an element in O(n) time.

  ```python
  print(my_list.count('hello'))
  ```

### List Slicing

List slicing creates new lists from existing lists using the syntax `my_list[start:stop:step]`.

- **Basic Slicing**: Slice a list to create a new sublist without modifying the original list. The `start` index is inclusive, while the `stop` index is exclusive. If `step` is omitted, it defaults to 1, meaning it takes every element within the slice.

  ```python
  my_list = ['a', 'b', 'c', 'd', 'e']
  sublist = my_list[1:4]  # Elements from index 1 to 3
  print(sublist)  # Output: ['b', 'c', 'd']
    
  first_three_items = my_list[:3]  # Gets the first three elements
  print(first_three_items)  # Output: ['a', 'b', 'c']

  last_three_items = my_list[-3:]  # Gets the last three elements
  print(last_three_items)  # Output: ['c', 'd', 'e']
  ```

- **Copying Lists**: Use slicing to make a [shallow copy](https://docs.python.org/3/library/copy.html) of the list with the slice operator `[:]`.

  ```python
  list_copy = my_list[:]  # Creates a copy of my_list
  print(list_copy)  # Output: ['a', 'b', 'c', 'd', 'e']
  ```

- **Reverse Slicing**: Reverse a list using the slice operator with a step of `-1`.

  ```python
  reversed_list = my_list[::-1]
  print(reversed_list)  # Output: ['e', 'd', 'c', 'b', 'a']
  ```

- **Skipping Elements**: The `step` value can be used to skip elements within the range. For example, a step of `2` takes every second element.

  ```python
  every_second_item = my_list[::2]
  print(every_second_item)  # Output: ['a', 'c', 'e']
  ```

- **Memory Considerations**: While slicing is a powerful tool, it's important to remember that slicing a list creates a new list and therefore uses additional memory.

### Sorting and Reversing

#### Sorting Lists

Sorting a list with `sort()` modifies it in place, while `sorted()` returns a new sorted list. Both approaches have a time complexity of O(n log n).

```python
arr = ['banana', 'apple', 'cherry']
arr.sort()  # Sorts arr in alphabetical order
print(arr)  # Output: ['apple', 'banana', 'cherry']

arr.sort(reverse=True)  # Sorts arr in descending alphabetical order
print(arr)  # Output: ['cherry', 'banana', 'apple']

arr.sort(key=len)  # Sorts arr by the length of the strings
print(arr)  # Output: ['apple', 'banana', 'cherry']

nums = [10, 3, 2, 8, 3, 1, 10]
sorted_nums = sorted(nums)  # Returns a new sorted list
print(sorted_nums)  # Output: [1, 2, 3, 3, 8, 10, 10]

sorted_nums_desc = sorted(nums, reverse=True)
print(sorted_nums_desc)  # Output: [10, 10, 8, 3, 3, 2, 1]
```

#### Reversing Lists

Reversing the list in place with `reverse()`:

```python
arr = ['apple', 'banana', 'cherry']
arr.reverse()
print(arr)  # Output: ['cherry', 'banana', 'apple']
```

Unlike `reverse()`, `reversed()` does not modify the list but instead returns an iterator that can be used to loop over the list in reverse order:

```python
arr = ['apple', 'banana', 'cherry']
arr.reverse()
print(arr)  # Output: ['cherry', 'banana', 'apple']

arr = ['apple', 'banana', 'cherry']
for item in reversed(arr):
    print(item)  # Prints 'cherry', 'banana', 'apple'
```

### Modifying Lists

- **Updating Elements**: Direct assignment changes an element without affecting others, an O(1) operation.

  ```python
  scores = [85, 90, 78]
  scores[2] = 95
  print(scores)  # Output: [85, 90, 95]
  ```

- **Appending**: Add an element to the end of the list with `append()`, a constant time operation:

  ```python
  my_list.append('new item')
  ```

- **Extending**: Use `extend()` to add multiple elements from another iterable. The time complexity is O(k), where k is the length of the iterable being added.

  ```python
  my_list.extend([2, 4, 6])
  ```

- **Inserting**: Inserting an element at a specific position with `insert(index, value)` is more costly. If you insert at the beginning or somewhere in the middle of the list, it requires shifting all subsequent elements one position to the right. This operation has a time complexity of O(n - k), where k is the index of insertion because all elements after the index need to be moved.

  ```python
  primes = [2, 3, 7, 11]
  primes.insert(2, 5)
  print(primes)  # Output: [2, 3, 5, 7, 11]
  ```

- **Popping by Index**: The `pop(index)` method removes the element at the specified position and returns it. If no index is specified, `pop()` removes the last item. Removing an item from the end of the list is O(1), as it does not require element shifting. However, popping an intermediate element has a time complexity of O(n - k) because it necessitates moving all elements after the specified index one slot to the left to fill the gap.

  ```python
  numbers = [1, 2, 3, 4]
  last_item = numbers.pop()  # Pops the last item, O(1)
  print(last_item)  # Output: 4
  print(numbers)  # Output: [1, 2, 3]

  first_item = numbers.pop(0)  # Pops the first item, O(n - 1)
  print(first_item)  # Output: 1
  print(numbers)  # Output: [2, 3]
  ```

- **Removing by Value**: The `remove(value)` method finds the *first* occurrence of the specified value and removes it, which can require shifting elements just like the `pop(index)` method.

  ```python
  numbers = [2, 10, 3, 10]
  numbers.remove(10)
  print(numbers)  # Output: [2, 3]
  ```
## Section 2: Handling List Mutability with Care

Mutability in lists enables dynamic adjustments to list contents, which is performant but also error-prone if not managed carefully.

### Modifying Lists in Functions

When mutable objects (e.g. lists) are passed to functions, they are passed by reference, not by value. This means that modifications within the function affect the original list, potentially leading to bugs if such changes are not intended.

```python
def find_median(arr):
    arr.sort()  # Sorts the list in-place, affecting the original list
    middle = len(arr) // 2
    return arr[middle] if len(arr) % 2 != 0 else (arr[middle - 1] + arr[middle]) / 2

data = [5, 3, 8, 2, 5]
median = find_median(data)
print(data)  # Output: [2, 3, 5, 5, 8]
```

To preserve the original data, make a copy of the list before modifying it:

```python
def find_median(arr):
    local_copy = sorted(arr)  # Sorts a copy of the list, preserving the original
    middle = len(local_copy) // 2
    return local_copy[middle] if len(local_copy) % 2 != 0 else (local_copy[middle - 1] + local_copy[middle]) / 2

data = [5, 3, 8, 2, 5]
median = find_median(data)
print(data)  # Output: [5, 3, 8, 2, 5]
```

### Avoiding Shared References

Creating multiple references to the same list can lead to errors if the list is modified unexpectedly through one of the references. 

```python
a = [1, 2, 3]
b = a  # Both `a` and `b` point to the same list
b.append(4)
print("List A:", a)  # Output: [1, 2, 3, 4]
```

To ensure that variables have separate lists, make explicit copies:

```python
a = [1, 2, 3]
b = list(a)  # `b` is now a separate copy of `a`
b.append(4)
print("List A:", a)  # Output: [1, 2, 3]
print("List B:", b)  # Output: [1, 2, 3, 4]
```

### Mutable Default Arguments: A Common Pitfall

Using mutable types as default arguments in functions can lead to the default argument accumulating changes with each function call.

Consider a function designed to maintain a list of processed items:

```python
# The default argument (i.e. the empty list) is initiated
# only once in the function declaration
def process_item(new_item, processed_items=[]):
    processed_items.append(new_item)
    return processed_items

print(process_item('apple'))  # Output: ['apple']
print(process_item('banana'))  # Output: ['apple', 'banana']
```

This behavior is often unintended. To prevent it, use `None` as a default value and initialize the list within the function:

```python
def process_item(new_item, processed_items=None):
    if processed_items is None:
        processed_items = []
    processed_items.append(new_item)
    return processed_items

print(process_item('apple'))  # Output: ['apple']
print(process_item('banana'))  # Output: ['banana']
```

## Section 3: Solved Problems

### Problem 1: Verify Derangement of an Array

**Problem Statement**: Determine if `arr2` is a valid [derangement](https://en.wikipedia.org/wiki/Derangement) of `arr1`. A derangement means that no element of `arr1` appears in the same index in `arr2`.

**Solution**:

```python
from collections import Counter

def is_derangement(arr1, arr2):
    # 1) same length
    if len(arr1) != len(arr2):
        return False

    # 2) same elements (check as permutations via sorting)
    if sorted(arr1) != sorted(arr2):
        return False

    # 3) no fixed points
    return all(a != b for a, b in zip(arr1, arr2))
```

### Problem 2: Find the Second-Largest Element in an Array

**Problem Statement**: Develop a program that efficiently finds the second-largest element present in an array of integers.

**Solution**:

```python
def find_second_largest(nums):
    first = second = float('-inf')
    for num in nums:
        if num > first:
            first, second = num, first
        elif first > num > second:
            second = num
    return second if second != float('-inf') else None

assert find_second_largest([12, 35, 1, 10, 34, 1]) == 34
assert find_second_largest([100, 50, 100]) == 100
```

### Problem 3: Merge Two Sorted Lists

**Problem Statement**: Write a function that merges two sorted lists into a single sorted list.

**Solution**:

```python
def merge_sorted_lists(list1, list2):
    result = []
    i, j = 0, 0

    while i < len(list1) and j < len(list2):
        if list1[i] < list2[j]:
            result.append(list1[i])
            i += 1
        else:
            result.append(list2[j])
            j += 1

    while i < len(list1):
        result.append(list1[i])
        i += 1

    while j < len(list2):
        result.append(list2[j])
        j += 1

    return result
```

**Explanation**: The function iteratively compares elements from both lists, appending the smaller one to the result list. After exhausting one list, it appends the remaining elements from the other list.

### Problem 4: [Rotate List](https://leetcode.com/problems/rotate-array/)

**Problem Statement**: Rotate a given integer array to the right by `k` steps.

**Solution 1: Linear Space Complexity**

```python
def rotate_list(lst, k):
    k = k % len(lst)  # Handle rotations greater than the list length
    return lst[-k:] + lst[:-k]
```

**Explanation**: The function splits the list at the `k`th position from the end and concatenates the two parts in reversed order, achieving the rotation.

**Related Problem**: How to determine if one string is a rotation of another? For example, if you have two strings, `s1 = "abcde"` and `s2 = "cdeab"`, you can see that `s2` is a rotation of `s1`. The key idea is that if `s2` is a rotation of `s1`, then `s2` will be a substring of `s1` concatenated with itself `(s1 + s1)`. For example, for `s1 = "abcde"` and `s2 = "cdeab"`, we see that `s2` is a substring of `"abcdeabcde"`.

**Solution 2: Constant Space Complexity**

```python
def rotate(nums: list[int], k: int) -> None:
    k %= len(nums)  # Normalize k to prevent unnecessary rotations
    if k:
        reverse(nums, 0, len(nums) - 1)  # Reverse the entire list
        reverse(nums, 0, k - 1)          # Reverse the first part
        reverse(nums, k, len(nums) - 1)  # Reverse the second part

def reverse(nums: list[int], start: int, end: int) -> None:
    """
    Reverses elements from index `start` to `end` in the list `nums`.
    """
    while start < end:
        nums[start], nums[end] = nums[end], nums[start]
        start += 1
        end -= 1
```

This method does not use extra space for another array, making it space-efficient with an O(1) space complexity. The time complexity remains O(n).

### Problem 5: [Minimum Operations to Make the Array Increasing](https://leetcode.com/problems/minimum-operations-to-make-the-array-increasing/)

**Problem Statement**: You are given an integer array `nums`. In one operation, you can choose an element of the array and increment it by 1. Determine the minimum number of operations needed to make the array strictly increasing.

**Solution**:

```python
def minOperations(nums):
    operations = 0
    
    for i in range(1, len(nums)):
        if nums[i] <= nums[i - 1]:
            increment = nums[i - 1] - nums[i] + 1
            nums[i] += increment
            operations += increment
    
    return operations
```

**Explanation**: Iterate through the array, comparing each element to its predecessor. If an element is not greater than its predecessor, increment it just enough to make the sequence strictly increasing, and count the operations.


### Problem 6: [Count Number of Teams](https://leetcode.com/problems/count-number-of-teams/)

**Problem Statement**: You are given an array of soldier ratings. A team of 3 soldiers is considered increasing if their ratings are ordered such that `rating[i] < rating[j] < rating[k]` and `i < j < k`. Similarly, a team is considered decreasing if `rating[i] > rating[j] > rating[k]` and `i < j < k`. A team can be formed if it's either increasing or decreasing. Your task is to return the number of teams you can form given the ratings.

**Solution**:

```python
def numTeams(ratings: list[int]) -> int:
    count = 0
    n = len(ratings)
    for i in range(n):
        less_left, more_left, less_right, more_right = 0, 0, 0, 0
        for j in range(i):
            if ratings[j] < ratings[i]:
                less_left += 1
            if ratings[j] > ratings[i]:
                more_left += 1
        for j in range(i+1, n):
            if ratings[j] < ratings[i]:
                less_right += 1
            if ratings[j] > ratings[i]:
                more_right += 1
        count += less_left * more_right + more_left * less_right
    return count
```

**Explanation**: For each soldier, count the number of soldiers with a higher rating on the right (potential successors) and the number of soldiers with a lower rating on the left (potential predecessors). Multiply these counts to get the number of teams the soldier can form in both increasing and decreasing order.

### Problem 7: [Summary Ranges](https://leetcode.com/problems/summary-ranges/description/)

**Problem Statement**: Given a sorted unique integer array nums, return the smallest sorted list of ranges that cover all the numbers in the array exactly. Each range is represented as a string in the format "start->end".

**Solution**:

```python
def summaryRanges(nums):
    if not nums:
        return []
    
    ranges, start = [], nums[0]
    
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1] + 1:
            ranges.append(f"{start}->{nums[i - 1]}" if start != nums[i - 1] else f"{start}")
            start = nums[i]
    ranges.append(f"{start}->{nums[-1]}" if start != nums[-1] else f"{start}")
    
    return ranges
```
**Explanation**: Iterate through the array, tracking the start of the current range. When you detect a break in the sequence (current number is not one more than the previous), close the current range and start a new one.

### Problem 8: [Missing Ranges](https://www.lintcode.com/problem/641/)

**Problem Statement**: Given a sorted integer array nums, where the range of elements are in the inclusive range [lower, upper], return its missing ranges.

**Solution**:

```python
def findMissingRanges(nums, lower, upper):
    result = []
    prev = lower - 1
    
    for i in range(len(nums) + 1):
        curr = nums[i] if i < len(nums) else upper + 1
        if prev + 1 <= curr - 1:
            result.append(f"{prev + 1}->{curr - 1}" if prev + 1 < curr - 1 else f"{prev + 1}")
        prev = curr
    
    return result
```

**Explanation**: Compare adjacent elements to find gaps. For each gap, add the missing range to the result. Pay special attention to the boundaries, defined by `lower` and `upper`.

### Problem 9: [Majority Element](https://leetcode.com/problems/majority-element)

**Problem Statement**: Given an array `nums` of size `n`, find the majority element. The majority element is the element that appears more than `n/2` times. You may assume that the majority element always exists in the array.

**Solution**:

```python
def majorityElement(nums):
    count = 0
    candidate = None

    for num in nums:
        if count == 0:
            candidate = num
        count += (1 if num == candidate else -1)

    return candidate
```
**Explanation**: [The Boyer–Moore algorithm](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore_majority_vote_algorithm) is a clever method that leverages the property of the majority element to efficiently find it in linear time and constant space. It maintains a count and a candidate element. Iterating through the array, it adjusts the count based on whether the current element is the same as the candidate. If the count reaches zero, it chooses a new candidate.

### Problem 10: [Majority Element II](https://leetcode.com/problems/majority-element-ii)

**Problem Statement**: Given an integer array of size `n`, find all elements that appear more than `n/3` times.

**Solution**:

```python
def majorityElementII(nums):
    if not nums:
        return []

    # Potential candidates for majority element
    candidate1, candidate2, count1, count2 = None, None, 0, 0

    for num in nums:
        if candidate1 == num:
            count1 += 1
        elif candidate2 == num:
            count2 += 1
        elif count1 == 0:
            candidate1, count1 = num, 1
        elif count2 == 0:
            candidate2, count2 = num, 1
        else:
            count1, count2 = count1 - 1, count2 - 1

    # Verification step
    return [n for n in (candidate1, candidate2) if nums.count(n) > len(nums) // 3]
```
**Explanation**: Since there can be at most two elements in the array that appear more than `n/3` times, you can modify the Boyer-Moore algorithm to maintain two candidates and their counts.

### Problem 11: [Global and Local Inversions](https://leetcode.com/problems/global-and-local-inversions/)

**Problem Statement**: You are given an integer array `A` of size `N`. A global inversion occurs when `i < j` and `A[i] > A[j]`. A local inversion occurs when `i < j` and `A[i] > A[j]` for `j = i + 1`. The task is to determine if the number of global inversions is equal to the number of local inversions.

**Solution**:

```python
def isIdealPermutation(A):
    max_so_far = -1
    for i in range(2, len(A)):
        max_so_far = max(max_so_far, A[i - 2])
        if max_so_far > A[i]:
            return False
    return True
```

**Explanation**: Observe that a local inversion is always a global inversion, but the reverse isn't always true. We can check for the presence of non-local global inversions by comparing elements against the running maximum up to two positions prior.

### Problem 12: [Find All Numbers Disappeared in an Array](https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array)

**Problem Statement**: Given an array `nums` of `n` integers where `nums[i]` is in the range `[1, n]`, return an array of all the integers in the range `[1, n]` that do not appear in `nums`.

**Solution**:

```python
def findDisappearedNumbers(nums):
    for i in range(len(nums)):
        index = abs(nums[i]) - 1
        nums[index] = -abs(nums[index])

    return [i + 1 for i in range(len(nums)) if nums[i] > 0]
```
**Explanation**: Iterate over the array, and for each value `val` encountered, mark the position `nums[val - 1]` as visited by making it negative (if it's not already). Iterate through the modified array. The indices of positive values correspond to the missing numbers.

### Problem 13: [Maximum Length of Subarray With Positive Product](https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/)

**Problem Statement**: Given an array of integers `nums`, find the maximum length of a subarray where the product of all its elements is positive.

**Solution**:

```python
def getMaxLen(nums):
    positive, negative, max_len = 0, 0, 0
    
    for num in nums:
        if num > 0:
            positive, negative = positive + 1, negative + 1 if negative else 0
        elif num < 0:
            positive, negative = negative + 1 if negative else 0, positive + 1
        else:
            positive, negative = 0, 0
        max_len = max(max_len, positive)

    return max_len
```

**Explanation**: Maintain counters for the lengths of the latest subarrays with a positive and negative product. Update these lengths as you iterate through the array, resetting or swapping based on the sign of the current element. Update the maximum length of a subarray with a positive product at each step.

### Problem 14: [Partition Array into Disjoint Intervals](https://leetcode.com/problems/partition-array-into-disjoint-intervals/)

**Problem Statement**: Given an array `nums`, partition it into two subarrays `left` and `right` so that:

- Every element in `left` is less than or equal to every element in `right`, unless `right` is empty.
- `left` is non-empty.
- `left` has the smallest possible size.

Return the length of `left` after such a partitioning.

**Solution**:

```python
def partitionDisjoint(nums: list[int]) -> int:
    left_max, max_so_far, partition_idx = nums[0], nums[0], 0
    for i, num in enumerate(nums):
        max_so_far = max(max_so_far, num)
        if num < left_max:
            left_max = max_so_far
            partition_idx = i
    return partition_idx + 1
```

**Explanation**: Iterate through the array, tracking the maximum value in the left partition and the maximum value seen so far. When the current value is less than the maximum of the left partition, update the partition boundary.

## Section 4: Exercises

1. **[Reverse a String](https://leetcode.com/problems/reverse-string/)**
2. **[Check if Array is Good](https://leetcode.com/problems/check-if-array-is-good/)**
3. **[Transformed Array](https://leetcode.com/problems/transformed-array/description/)**
4. **[Concatenation of Array](https://leetcode.com/problems/concatenation-of-array/)**
5. **[Running Sum of 1D Array](https://leetcode.com/problems/running-sum-of-1d-array)**
6. **[Missing Number](https://leetcode.com/problems/missing-number)**
7. **[Plus One](https://leetcode.com/problems/plus-one/)**
8. **[Self-Dividing Numbers](https://leetcode.com/problems/self-dividing-numbers/)**
9. **[Palindrome Number](https://leetcode.com/problems/palindrome-number/)**
10. **[Remove Element](https://leetcode.com/problems/remove-element/)**
11. **[Find All K-Distant Indices in an Array](https://leetcode.com/problems/find-all-k-distant-indices-in-an-array/)**
12. **[Find Polygon with the Largest Perimeter](https://leetcode.com/problems/find-polygon-with-the-largest-perimeter/)**
13. **[Minimum Processing Time](https://leetcode.com/problems/minimum-processing-time/)**
14. **[Move Zeroes](https://leetcode.com/problems/move-zeroes/)**
15. **[Two Sum](https://leetcode.com/problems/two-sum/)**
16. **[Two Sum II](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)**
17. **[Array Nesting](https://leetcode.com/problems/array-nesting/)**
18. **[Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)**
19. **[Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)**
20. **[Minimum Removals to Balance Array](https://leetcode.com/problems/minimum-removals-to-balance-array/)**
