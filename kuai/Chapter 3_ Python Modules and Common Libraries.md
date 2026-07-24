# Chapter 3: Python Modules and Common Libraries

## Section 1: Standard Library and Third-Party Modules

Python's comprehensive standard library, alongside a plethora of third-party modules, significantly enhances programming productivity and code readability.

### Importing Modules

Utilize `import` statement to integrate various modules into your code.

```python
import math
from collections import deque
import numpy as np
```

### Essential Libraries

#### [collections](https://docs.python.org/3/library/collections.html)
The `collections` module offers specialized container datatypes.
    
- **[Counter](https://docs.python.org/3/library/collections.html#collections.Counter)**: A dictionary subclass designed for counting hashable objects. It's an unordered collection where elements are stored as dictionary keys, and their counts are stored as dictionary values.

    ```python
    from collections import Counter

    # Count the occurrences of each character in a string
    character_counts = Counter('mississippi')
    print(character_counts)  # Output: Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})

    # Find the two most common elements
    print(character_counts.most_common(2))  # Output: [('i', 4), ('s', 4)]
    
    # Increment the count with additional characters
    character_counts.update("state")
    assert character_counts["s"] == 5
    ```

- **[deque](https://docs.python.org/3/library/collections.html#collections.deque)**: Pronounced "deck", it stands for "double-ended queue." A deque is a list-like container that allows fast appends and pops from both ends.
    ```python
    from collections import deque

    # Creating a deque
    dq = deque(['a', 'b', 'c'])

    # Appending and popping from either end
    dq.append('d')        # Add to the right end
    dq.appendleft('z')    # Add to the left end
    print(dq)             # Output: deque(['z', 'a', 'b', 'c', 'd'])

    dq.pop()              # Remove from the right end
    dq.popleft()          # Remove from the left end
    print(dq)             # Output: deque(['a', 'b', 'c'])
    ```

- **[namedtuple](https://docs.python.org/3/library/collections.html#collections.namedtuple)**: A factory function for creating tuple subclasses with named fields. `namedtuple` can be used to create well-defined, readable, and self-documenting tuple-like objects.

    ```python
    from collections import namedtuple

    # Creating a namedtuple for a point in 2D space
    Point = namedtuple('Point', ['x', 'y'])

    # Instantiating a Point object
    p = Point(11, y=22)

    # Accessing the elements
    print(p[0] + p[1])  # Output: 33
    print(p.x + p.y)    # Output: 33

    # Namedtuples are still immutable
    # p.x = 33  # This would raise an error
    ```

- **[defaultdict](https://docs.python.org/3/library/collections.html#collections.defaultdict)**: A dictionary subclass that calls a factory function to supply missing values. Useful for automatic handling of missing keys in dictionaries.

    ```python
    from collections import defaultdict

    # Creating a defaultdict with list as the default factory function
    dd = defaultdict(list)

    # Adding elements to a list based on the key
    dd['fruits'].append('apple')
    dd['fruits'].append('banana')
    dd['veggies'].append('carrot')

    print(dd)  # Output: defaultdict(<class 'list'>, {'fruits': ['apple', 'banana'], 'veggies': ['carrot']})
    ```

#### [itertools](https://docs.python.org/3/library/itertools.html)
Offers a collection of tools for efficient looping, including combinatorial functions like permutations and combinations.

```python
import itertools

# Generate permutations of 'ABCD' with length 2
for permutation in itertools.permutations('ABCD', 2):
    print(permutation)

# Generate combinations of 'ABCDE' with length 3
for combination in itertools.combinations('ABCDE', 3):
    print(combination)
```

#### [functools](https://docs.python.org/3/library/functools.html)
A module critical for higher-order functions and functional-style programming, providing functionality like decorators and partials.

```python
from functools import reduce, lru_cache

# Use reduce to calculate the product of list elements
product = reduce(lambda x, y: x * y, [1, 2, 3, 4])
print(product)  # Output: 24

# Use lru_cache as a decorator for efficient recursive function caching
@lru_cache(maxsize=1000)
def fibonacci(n):
    if n in [0, 1]:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

#### [math](https://docs.python.org/3/library/math.html)
Facilitates mathematical operations, offering functions for square roots, trigonometry, logarithms, and more.

```python
import math

print(math.factorial(5))
print(math.hypot(3, 4))
print(math.floor(3 / 2))
print(math.ceil(3 / 2))
print(math.sqrt(2))
print(math.pow(2, 3))  # Output: 8
print(math.comb(6, 2))  # Output: 15
print(math.gcd(15, 25))  # Output: 5
print(f"The area of a unit circle is {math.pi}")
```

#### [heapq](https://docs.python.org/3/library/heapq.html)
Implements a priority queue algorithm.

```python
import heapq

# Create a min heap
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.heapify(numbers)
print(f"Min heap: {numbers}")

# Add an element and pop the smallest
heapq.heappush(numbers, 7)
# Pop the smallest element
smallest = heapq.heappop(numbers)
print(f"Smallest element: {smallest}")
print(f"Min heap: {numbers}")
```

#### [random](https://docs.python.org/3/library/random.html)
Offers tools for generating random numbers, selecting random elements from a sequence, or shuffling a sequence.

```python
import random

print(random.randint(1, 100))  # Random integer between 1 and 100
print(random.choice(['apple', 'banana', 'cherry']))  # Random element from a list

# Shuffle a list
numbers = [1, 2, 3, 4, 5]
random.shuffle(numbers)
print(f"Shuffled list: {numbers}")
```

#### [sortedcontainers](https://grantjenks.com/docs/sortedcontainers/)
A third-party module providing efficient, sorted collection types.

```python
from sortedcontainers import SortedList, SortedDict, SortedSet

sl = SortedList([4, 1, 5, 2])
sl.add(3)
print(sl)  # Output: [1, 2, 3, 4, 5]

sd = SortedDict({'c': 3, 'a': 1, 'b': 2})
sd['d'] = 4
print(sd)  # Output: {'a': 1, 'b': 2, 'c': 3, 'd': 4}

ss = SortedSet([3, 1, 2, 5, 4])
ss.add(6)
print(ss)  # Output: [1, 2, 3, 4, 5, 6]
```

## Section 2: Solved Problems

### Problem 1: Square Triangular Numbers

**Problem Statement**: A **square triangular number** is a positive integer that is both a [square number](https://en.wikipedia.org/wiki/Square_number) and a [triangular number](https://en.wikipedia.org/wiki/Triangular_number).

- A **triangular number** T(n) is the sum of the first n positive integers: T($n$) = $1 + 2 + 3 + ... + n$ = $n(n+1)/2$
- A **square number** is an integer that can be expressed as $k^2$ for some integer $k$

Write a function that finds the first `count` square triangular numbers.

For example, the first 4 square triangular numbers are `[1, 36, 1225, 41616]`.

**Solution:**

The idea is to generate triangular numbers and check if they're perfect squares.

```python=
import math

def find_square_triangular_numbers(count: int) -> list[int]:
    result = []
    n = 1
    
    while len(result) < count:
        triangular = n * (n + 1) // 2
        
        if is_perfect_square(triangular):
            result.append(triangular)
        
        n += 1

    return result

def is_perfect_square(n):
    root = int(math.sqrt(n))
    return root * root == n
```

### Problem 2: Integer Arrangements

**Problem Statement**: Find the number of unique 5-digit integers that can be formed from the digits 1, 2, 3, 4, and 5, ensuring the digit 1 is always to the left of 2.

**Solution:**

The total permutations of the digits 1, 2, 3, 4, and 5 are `5!` (factorial of 5). In half of these permutations, 1 will be to the left of 2, and in the other half, 1 will be to the right of 2. Hence, the solution is simply half of all the permutations: `5! / 2 = 60`.

```python
from itertools import permutations

count = 0
for p in permutations([1, 2, 3, 4, 5]):
    if p.index(1) < p.index(2):
        count += 1

print(f"Total numbers where 1 is left of 2: {count}")
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

```python
import math

def approx_s(N: int) -> float:
    s = 0.0
    prev = 1.0
    for n in range(N):
        prev /= (2*n + 1)
        s += prev
    return s

def approx_c(N: int) -> float:
    val = 0.0
    for k in reversed(range(N)):
        val = (k or 1) / (1 + val)
    return val

def main():
    N = 1000
    approx = approx_s(N) + approx_c(N)
    true_val = math.sqrt(math.pi * math.e / 2)
    assert math.isclose(true_val, approx)
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

```python
from itertools import product

def count():
    res = 0
    for perm in product(range(1, 10), repeat=5):
        a, b, c, d, e = sorted(perm)
        if (
            a < b == c < d == e or a == b < c < d == e or
            a == b < c == d < e
        ):
            res += 1
    return res

# Test the function
assert count() == 7560
```

### Problem 5: [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)

**Problem Statement:** Implement a class that continuously adds numbers to a collection and can return the median at any point.

**Solution:**

```python
from sortedcontainers import SortedList

class MedianFinder:
    def __init__(self):
        self.data = SortedList()

    def add_num(self, num):
        self.data.add(num)

    def find_median(self):
        n = len(self.data)
        if n % 2 == 0:
            return (self.data[n // 2 - 1] + self.data[n // 2]) / 2.0
        return self.data[n // 2]

# Test the class
mf = MedianFinder()
mf.add_num(1)
mf.add_num(3)
print(f"Current median: {mf.find_median()}")
mf.add_num(2)
print(f"Updated median: {mf.find_median()}")
```

### Problem 6: [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)

**Problem Statement:** Given a non-empty array of integers, return the k most frequent elements.

**Solution:**

```python
from collections import Counter

def top_k_Frequent(nums, k):
    count = Counter(nums)
    return [item[0] for item in count.most_common(k)]

# Test the function
nums = [1,1,1,2,2,3]
k = 2
print(top_k_Frequent(nums, k))  # Output: [1, 2]
```

### Problem 7: String Matches

**Problem Statement**: Given two strings `s1` and `s2`, calculate the matches of `s1` and `s2`, where a match is defined as the number of `(i, j)` pairs such that `0 <= i < len(s1)`, `0 <= j < len(s2)`, and `s1[i] == s2[j]`.

**Solution:**

```python
from collections import Counter

def getMatches(s1: str, s2: str) -> int:
    s1_counts = Counter(s1)
    s2_counts = Counter(s2)
    return sum(count1 * s2_counts[char] for char, count1 in s1_counts.items())
```

### Problem 8: [Redistribute Characters to Make All Strings Equal](https://leetcode.com/problems/redistribute-characters-to-make-all-strings-equal/)

**Problem Statement**: Determine if it is possible to redistribute characters in such a way that all strings are equal. A redistribution means rearranging characters such that every string becomes the same.

**Solution**:

```python
from collections import Counter

def can_make_equal(words: List[str]) -> bool:
    counts = Counter()
    for word in words:
        counts.update(word)
    return all(count % len(words) == 0 for count in counts.values())
```

**Explanation**:
This function first counts the occurrences of each character across all strings using Python's `Counter` class. It then checks whether the total occurrences of each character can be evenly distributed among all the strings by checking if each character count modulo the number of strings (`len(words)`) is zero. If every character meets this condition, the strings can be redistributed equally.

The time complexity is O(N * L) where N is the number of words and L is the average length of the words, due to iterating over each character in each word to build the character count. Checking the conditions for redistribution runs in O(K), where K is the number of unique characters, making the total time complexity O(N * L + K).

### Problem 9: [Generate Random Point in a Circle](https://leetcode.com/problems/generate-random-point-in-a-circle/)

**Problem Statement**: Given the radius and x, y positions of the center of a circle, write a function to generate a random point inside the circle. Each point generated must be uniformly distributed within the circle.

**Solution 1: [Rejection Sampling](https://en.wikipedia.org/wiki/Rejection_sampling)**

You generate a point in the square that bounds the circle and then check if the point is inside the circle. If it's not, you reject it and generate another point.

```python
import random

class Solution:

    def __init__(self, radius: float, x_center: float, y_center: float):
        self.radius = radius
        self.x_center = x_center
        self.y_center = y_center

    def randPoint(self) -> [float, float]:
        while True:
            # Generate a random point in the bounding square
            x = random.uniform(self.x_center - self.radius, self.x_center + self.radius)
            y = random.uniform(self.y_center - self.radius, self.y_center + self.radius)

            # Check if the point is inside the circle
            if (x - self.x_center)**2 + (y - self.y_center)**2 <= self.radius**2:
                return [x, y]
```

**Solution 2: [Polar Coordinates](https://en.wikipedia.org/wiki/Polar_coordinate_system#Converting_between_polar_and_Cartesian_coordinates)**

This method utilizes polar coordinates to ensure every generated point is inside the circle, leveraging the uniform distribution of angles and the square root trick for radius to ensure uniform distribution within the circle's area.

```python
import random
import math

class Solution:

    def __init__(self, radius: float, x_center: float, y_center: float):
        self.radius = radius
        self.x_center = x_center
        self.y_center = y_center

    def randPoint(self) -> [float, float]:
        # Generate a random angle and distance
        angle = random.uniform(0, 2 * math.pi)
        sqrt_r = math.sqrt(random.uniform(0, 1)) * self.radius
        
        # Calculate x and y coordinates
        x = self.x_center + sqrt_r * math.cos(angle)
        y = self.y_center + sqrt_r * math.sin(angle)
        
        return [x, y]
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