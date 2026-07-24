# Chapter 15: Sorted Sets and Sorted Dictionaries

Unlike Java, which includes built-in [`TreeMap`](https://docs.oracle.com/en%2Fjava%2Fjavase%2F11%2Fdocs%2Fapi%2F%2F/java.base/java/util/TreeMap.html) and [`TreeSet`](https://docs.oracle.com/en%2Fjava%2Fjavase%2F11%2Fdocs%2Fapi%2F%2F/java.base/java/util/TreeSet.html) for maintaining sorted collections, Python does not come with built-in sorted collections in its standard library. However, these functionalities can be efficiently implemented using the [`sortedcontainers`](https://grantjenks.com/docs/sortedcontainers/) library.

## Section 1: Introduction to Sorted Collections

### SortedSet

A `SortedSet` behaves similarly to a standard set but maintains its elements in a sorted order:

```python
from sortedcontainers import SortedSet

ss = SortedSet([9, 8, 7, 6])
print(ss)  # Output: SortedSet([6, 7, 8, 9])

ss.add(1)
print(ss)  # Output: SortedSet([1, 6, 7, 8, 9])
```

### SortedDict

`SortedDict` functions like a regular dictionary but keeps its keys sorted:

```python
from sortedcontainers import SortedDict

sd = SortedDict({9: 40, 8: 30, 7: 20, 6: 10})
print(sd)  # Output: SortedDict({6: 10, 7: 20, 8: 30, 9: 40})

sd[1] = 100
print(sd)  # Output: SortedDict({1: 100, 6: 10, 7: 20, 8: 30, 9: 40})
```

## Section 2: Common Operations

Both `SortedSet` and `SortedDict` from the `sortedcontainers` library provide additional functionalities that are crucial for efficiently handling sorted data. Thanks to their underlying [balanced tree structure](https://en.wikipedia.org/wiki/Self-balancing_binary_search_tree), all primary operations, including membership checking and value assignment, have a time complexity of O(log n).

### SortedSet Operations

- **Accessing Elements by Index**: Unlike regular sets, `SortedSet` maintains its elements in a sorted order, allowing you to access the smallest, largest, or any element at a specific index directly.

  ```python
  ss = SortedSet([20, 30, 40, 50, 15, 5])
  
  smallest = ss[0]  # Retrieves the smallest item, which is 5
  largest = ss[-1]  # Retrieves the largest item, which is 50
  middle_item = ss[3]  # Retrieves the fourth smallest item, which is 30
  ```

- **Bisect Left**: Position of the first item greater than or equal to the element.

  ```python
  ss = SortedSet([10, 27, 9, 6, 3])
  print(ss)  # Output: SortedSet([3, 6, 9, 10, 27])

  idx = ss.bisect_left(10)
  assert ss[idx] == 10  # The smallest item that's at least 10 is 10.
  ```

- **Bisect Right**: Position of the first item greater than the element.

  ```python
  ss = SortedSet([10, 27, 9, 6, 3])
  print(ss)  # Output: SortedSet([3, 6, 9, 10, 27])

  idx = ss.bisect_right(10)
  assert ss[idx] == 27  # The smallest item that's greater than 10 is 27.
  ```

### SortedDict Operations

- **Peek Items**: Retrieves an item by its position.

  ```python
  sd = SortedDict({3: "Mar", 2: "Feb", 1: "Jan"})
  smallest_key, val_1 = sd.peekitem(0)
  largest_key, val_2 = sd.peekitem(-1)

  assert val_1 == "Jan"
  assert val_2 == "Mar"
  ```

## Section 3: Solved Problems

### Problem 1: [Smallest Number in Infinite Set](https://leetcode.com/problems/smallest-number-in-infinite-set/description/)

**Problem Statement**: Design a class to manage an initially infinite set of positive integers, allowing for the retrieval and removal of the smallest integer, and the addition of new integers to the set.

**Solution**:

```python
from sortedcontainers import SortedSet

class SmallestInfiniteSet:
    def __init__(self):
        self.added_backs = SortedSet()
        self.min = 1

    def popSmallest(self) -> int:
        if self.added_backs:
            ans = self.added_backs.pop(0)
        else:
            ans = self.min
            self.min += 1
        return ans

    def addBack(self, num: int) -> None:
        if num < self.min:
            self.added_backs.add(num)
```

**Explanation**:

- **`__init__`**: Initializes a `SortedSet` to keep track of numbers added back to the set and a `min` counter for the next smallest number.
- **`popSmallest`**: Returns the smallest number from the set. If `added_backs` is not empty, it returns and removes the smallest number. Otherwise, it uses and increments the `min` counter.
- **`addBack`**: Adds a number back into the set only if it is less than the current minimum, ensuring that all returned numbers are managed correctly.

### Problem 2: [My Calendar I](https://leetcode.com/problems/my-calendar-i/)

**Problem Statement**: Implement a class that stores event intervals. The class should ensure that no two events overlap.

**Solution**:

```python
from sortedcontainers import SortedDict

class MyCalendar:
    def __init__(self):
        # Use a SortedDict to maintain ordered events by start times
        self.events = SortedDict()

    def book(self, start: int, end: int) -> bool:
        # Find the position where the new event should be placed
        curr_idx = self.events.bisect_right(start)

        # Check the previous event for overlap
        if curr_idx > 0:
            _, prev_end = self.events.peekitem(curr_idx - 1)
            if prev_end > start:
                return False  # Overlaps with the previous event

        # Check the next event for overlap
        if curr_idx < len(self.events):
            next_start, _ = self.events.peekitem(curr_idx)
            if end > next_start:
                return False  # Overlaps with the next event

        # If no overlap, add to events
        self.events[start] = end
        return True
```

**Explanation**:

- The `MyCalendar` class uses a `SortedDict` to maintain a sorted order of events by their start times.
- The `book` method checks if a new event can be added without overlapping with existing events. It does this by locating where the new event should be inserted (`bisect_right`) and checking against the nearest events.
- `peekitem` is used to access items by index to compare the new event's times with the closest events already in the calendar.


## Section 4: Exercises

1. **[My Calendar II](https://leetcode.com/problems/my-calendar-ii/description/)**
2. **[Stock Price Fluctuation](https://leetcode.com/problems/stock-price-fluctuation)**
