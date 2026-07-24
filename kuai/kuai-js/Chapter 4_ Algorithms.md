# Chapter 4: Algorithms

## Section 1: Introduction to Algorithms

Algorithms are step-by-step procedures for solving problems. They range from basic procedures, like sorting books in a library by title, to analyzing large datasets in machine learning.

## Section 2: Complexity

### Time Complexity

Time complexity measures the time taken by an algorithm to run as a function of the length of the input. It helps in estimating the scalability of an algorithm as the input size grows.

#### Common Time Complexities

- **$O(1)$** - Constant time irrespective of input size. Example: Accessing a specific element in an array.
- **$O(\log n)$** - Logarithmic time. Example: Binary search in a sorted array.
- **$O(n)$** - Linear time. Operations increase linearly with input size. Example: Linear search.
- **$O(n\log n)$** - Log-linear time. Common in efficient sorting algorithms like mergesort and heapsort.
- **$O(n^2)$** - Quadratic time. Often seen in algorithms with nested iterations over the data. Example: Bubble sort.
- **$O(2^n)$** - Exponential time. Examples include certain recursive algorithms solving the subsets problem.

#### [Amortized Analysis](https://en.wikipedia.org/wiki/Amortized_analysis)

Amortized analysis provides insight into the average running time per operation, over a sequence of operations, even if some individual operations might be expensive.

Dynamic array resizing, where additions are fast but occasionally an expensive resizing is required, is a classic example. In JavaScript, `Array.prototype.push` behaves this way: most pushes are $O(1)$, but occasionally the engine reallocates the backing store, giving an amortized $O(1)$ per operation. This approach ensures that the algorithm maintains a good average-case time complexity over a series of operations.

### Space Complexity

Space complexity measures the total amount of memory that an algorithm needs to run according to the size of the input data. This includes the memory required by the input data and any auxiliary space used by the algorithm.

Auxiliary space refers to the extra space or temporary space used by an algorithm outside of the input data. For instance, recursive algorithms often use stack space as a function of recursion depth.

### Trade-offs Between Time and Space

Often, improving an algorithm's time efficiency results in higher space consumption and vice versa. For example, hashing techniques (via a JavaScript `Map` or `Set`) can reduce the time complexity of search operations from O(n) to O(1) by using more memory to store elements in a hash table.

## Section 3: Solved Problems

### Problem 1: Cumulative Summation

**Problem Statement**: Analyze the time complexity of the following algorithm, which increments a sum `s` by increasing integers until `s` exceeds a given number `n`.

**Solution**:

```javascript
function func(n) {
  let i = 0;
  let s = 0;
  while (s <= n) {
    i += 1;
    s += i;
  }
}
```

**Time Complexity Analysis:**

- In each iteration of the while loop, `i` is incremented by 1, and `s` is incremented by `i`.
- The loop continues until the sum `s` exceeds `n`. The value of `s` after `m` iterations is the sum of the first `m` integers, which is $m(m + 1)/2$.
- The loop exits when $m(m + 1)/2 > n$, which happens approximately when $m^2 \approx n$ or $m \approx \sqrt{n}$.
- Therefore, the time complexity is $O(\sqrt{n})$ since the loop iterates approximately $\sqrt{n}$ times before terminating.

### Problem 2: Nested Loops with Variable Increment

**Problem Statement**: Determine the time complexity of the following function, which includes nested loops where the inner loop has a variable increment based on the outer loop's iterator.

**Solution**:

```javascript
function func(n) {
  for (let i = 1; i <= n; i++) {
    let j = 1;
    while (j <= n) {
      j += i;
    }
  }
}
```

**Time Complexity Analysis:**

- The outer loop runs `n` times from 1 to `n`.
- For each iteration of `i` in the outer loop, the inner while loop increments `j` by `i`. Hence, for each value of `i`, the inner loop runs approximately `n/i` times.
- Summing over all iterations of the outer loop gives the total number of inner loop iterations as $n/1 + n/2 + n/3 + \cdots + n/n$, which is `n` times a partial sum of the [harmonic series](https://en.wikipedia.org/wiki/Harmonic_series_(mathematics)#Partial_sums).
- The harmonic sum grows logarithmically, so the total is $O(n \log n)$.

### Problem 3: Calculate the Sum of All Odd Positive Integers

**Problem Statement**: Develop a function that computes the sum of all odd positive integers up to and including a specified number `n`. For example, if the input is 5, the function should return 9 (1 + 3 + 5), and for 14, it should return 49.

**Solution 1: Iterative**

```javascript
function sumOfOddNumbers(n) {
  let sum = 0;
  for (let i = 1; i <= n; i += 2) {
    sum += i;
  }
  return sum;
}

console.assert(sumOfOddNumbers(5) === 9);
console.assert(sumOfOddNumbers(14) === 49);
```

The time complexity is O(n) since the loop iterates through half of the numbers from 1 to n, incrementing by 2 each time.

**Solution 2: Analytical**

An efficient way to solve this problem is by realizing that the sum of the first `k` odd numbers is `k^2`. For any integer `n`, the number of odd numbers up to `n` is `Math.floor((n + 1) / 2)`. We can use this to directly calculate the sum without iterating through each odd number.

```javascript
function sumOfOddNumbersAnalytical(n) {
  const k = Math.floor((n + 1) / 2);
  return k * k;
}

console.assert(sumOfOddNumbersAnalytical(5) === 9);
console.assert(sumOfOddNumbersAnalytical(14) === 49);
```

The time complexity is O(1) because it involves a straightforward calculation independent of `n`'s size.

### Problem 4: [Check if a Number is a Palindrome](https://leetcode.com/problems/palindrome-number/)

**Problem Statement**: Determine whether an integer is a palindrome. Negative numbers are not palindromes.

### Solution 1: Using Strings

Convert the integer to a string and check if it reads the same forward and backward.

```javascript
function isPalindrome(x) {
  const strX = String(x);
  return strX === strX.split("").reverse().join("");
}
```

**Time Complexity**: O(n), where n is the number of characters in the string representation of x.
**Space Complexity**: O(n), due to the space used to store the string representation of x.

### Solution 2: Two-Pointer Technique
Using two pointers, one at the beginning and one at the end of the string representation, check for palindrome properties.

```javascript
function isPalindrome(x) {
  const strX = String(x);
  let left = 0;
  let right = strX.length - 1;

  while (left < right) {
    if (strX[left] !== strX[right]) {
      return false;
    }
    left += 1;
    right -= 1;
  }

  return true;
}
```

**Time Complexity**: O(n), where n is the number of characters in the string representation of x.
**Space Complexity**: O(n), because of the space used for the string.

### Solution 3: Reversing the Number

This method involves reversing the digits of the number and then comparing the reversed number to the original.

```javascript
function isPalindrome(x) {
  if (x < 0) {
    return false;
  }

  let reversedNum = 0;
  let temp = x;

  while (temp !== 0) {
    const digit = temp % 10;
    reversedNum = reversedNum * 10 + digit;
    temp = Math.floor(temp / 10);
  }

  return reversedNum === x;
}
```

**Time Complexity**: O(n), where n is the number of digits in x.
**Space Complexity**: O(1), as it uses a fixed amount of space regardless of the input size.


## Section 4: Exercises

1. **[Rectangle Area](https://leetcode.com/problems/rectangle-area/)**
2. **[Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)**
3. **[Count the Digits That Divide a Number](https://leetcode.com/problems/count-the-digits-that-divide-a-number/)**
4. **[Harshad Number](https://leetcode.com/problems/harshad-number/)**
5. **[Subtract the Product and Sum](https://leetcode.com/problems/subtract-the-product-and-sum-of-digits-of-an-integer/)**
6. **[Smith Number](https://en.wikipedia.org/wiki/Smith_number)**
7. **[Minimum Additions to Make Valid String](https://leetcode.com/problems/minimum-additions-to-make-valid-string/)**
