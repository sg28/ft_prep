# Chapter 8: Stacks

## Section 1: Introduction to Stacks

Stacks are a fundamental data structure in computer science, adhering to the Last In, First Out (LIFO) principle.

### Core Stack Operations:

- **Push**: Add an element to the top of the stack, expanding its size.
- **Pop**: Remove and return the top element, reducing the stack's size.
- **Peek**: Retrieve the top element without modifying the stack.
- **IsEmpty**: Verify whether the stack has no elements.

### Implementing Stacks Using JavaScript Arrays

JavaScript's array serves as an excellent stack with its end-based operations being efficiently managed.

**Creating a Stack**

You can initialize a stack as an empty array:

```javascript
const stack = [];
```

**Push Operation**

The `push()` method adds an element at the end of the array, effectively the top of the stack:

```javascript
stack.push('apple');
stack.push('banana');  // The stack is now ['apple', 'banana']
```

**Pop Operation**

The `pop()` method removes the last element. Make sure the stack isn't empty first (popping an empty array returns `undefined` rather than throwing):

```javascript
if (stack.length > 0) {
  const topElement = stack.pop();  // Removes and returns 'banana'
}
```

**Peek Operation**

Access the top element (the last in the array) without removing it:

```javascript
if (stack.length > 0) {
  const topElement = stack[stack.length - 1];  // Accesses 'apple' without removing it
}
```

**IsEmpty Check**

A simple length check tells if the stack is empty:

```javascript
const isEmpty = stack.length === 0;  // Returns true if the stack is empty
```

### Time Complexity Analysis

Stack operations are efficient:

- **Push**: O(1) - Adding to the end of an array is a constant-time operation.
- **Pop**: O(1) - Removing the last element is also constant-time.
- **Peek**: O(1) - Accessing the last element is immediate in an array.
- **IsEmpty**: O(1) - Checking for emptiness is a straightforward length comparison.

## Section 2: Solved Problems

### Problem 1: [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)

**Problem Statement**: Given a string containing just the characters `'(', ')', '{', '}', '['`, and `']'`, determine if the input string is valid.

**Solution**:

```javascript
function isValid(s) {
  const stack = [];
  const mapping = { ")": "(", "}": "{", "]": "[" };

  for (const char of s) {
    if (!(char in mapping)) {
      stack.push(char);
    } else if (stack.length === 0 || mapping[char] !== stack.pop()) {
      return false;
    }
  }

  return stack.length === 0;
}
```

### Problem 2: [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)

**Problem Statement**: Evaluate arithmetic expressions in Reverse Polish Notation.

**Solution**:

```javascript
function evalRPN(tokens) {
  const stack = [];
  const operators = new Set(["+", "-", "*", "/"]);
  for (const token of tokens) {
    if (!operators.has(token)) {
      stack.push(parseInt(token, 10));
      continue;
    }
    const a = stack.pop();
    const b = stack.pop();
    if (token === "+") {
      stack.push(a + b);
    } else if (token === "-") {
      stack.push(b - a);
    } else if (token === "*") {
      stack.push(a * b);
    } else if (token === "/") {
      stack.push(Math.trunc(b / a));  // Truncate toward zero, matching integer division
    }
  }
  return stack.pop();
}
```

Note: JavaScript has no separate integer type, so `Math.trunc(b / a)` reproduces the truncate-toward-zero behavior of the original integer division.

### Problem 3: [Reverse Substrings Between Each Pair of Parentheses](https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/)

**Problem Statement**: Reverse the substrings contained within each pair of parentheses.

**Solution**:

```javascript
function reverseParentheses(s) {
  const stack = [];
  for (const char of s) {
    if (char === ")") {
      const temp = [];
      while (stack[stack.length - 1] !== "(") {
        temp.push(stack.pop());
      }
      stack.pop();  // Remove the '('
      stack.push(...temp);
    } else {
      stack.push(char);
    }
  }
  return stack.join("");
}
```

### Problem 4: [Min Stack](https://leetcode.com/problems/min-stack/)

**Problem Statement**: Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

**Solution**:

```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  push(x) {
    this.stack.push(x);
    const minVal = Math.min(
      x,
      this.minStack.length > 0 ? this.minStack[this.minStack.length - 1] : x
    );
    this.minStack.push(minVal);
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}
```

### Problem 5: [Design a Stack with Increment Operation](https://leetcode.com/problems/design-a-stack-with-increment-operation/)

**Problem Statement**: Design a stack that includes a function `increment(k, val)` which increments the bottom `k` elements of the stack by `val`.

**Solution**:

```javascript
class CustomStack {
  constructor(maxSize) {
    this.capacity = maxSize;
    this.stack = [];
    this.increments = [];  // Named `increments` so it doesn't collide with the increment() method
  }

  push(x) {
    if (this.stack.length < this.capacity) {
      this.stack.push(x);
      this.increments.push(0);
    }
  }

  pop() {
    if (this.stack.length === 0) {
      return -1;
    }
    if (this.increments.length > 1) {
      this.increments[this.increments.length - 2] +=
        this.increments[this.increments.length - 1];  // Transfer increment to next element
    }
    return this.stack.pop() + this.increments.pop();  // Apply increment to popped element
  }

  increment(k, val) {
    if (this.stack.length > 0) {
      const idx = Math.min(k, this.stack.length) - 1;  // Adjust k to the length of the stack
      this.increments[idx] += val;
    }
  }
}
```

**Explanation**: In our solution for the "Design a Stack with Increment Operation" problem, we employ an auxiliary array, `increments`, alongside the main stack, `stack`. Each index in `increments` aligns with `stack` and stores the total increment for that element and all elements below it. (Note: unlike Python, JavaScript methods and instance fields share the same namespace on an object, so we deliberately name the field `increments` to avoid shadowing the `increment(k, val)` method.)

### Problem 6: Reconstruct Jumbled Array

**Problem Statement**: Given a sequence represented as an array of signs where each sign indicates whether the current number is larger (`'+'`) or smaller (`'-'`) than the previous number, reconstruct an array consistent with these signs. The array should be a permutation of `[0, 1, ..., n]`. For example, the input `[null, '+', '+', '-', '+']` might correspond to a valid output like `[0, 1, 3, 2, 4]`.

**Solution 1: Stack**

```javascript
function reconstruct(signs) {
  const answer = [];
  const stack = [];
  const n = signs.length - 1;

  for (let i = 0; i < n; i++) {
    if (signs[i + 1] === "-") {
      stack.push(i);  // Store index to reverse later
    } else {
      answer.push(i);
      while (stack.length > 0) {
        answer.push(stack.pop());  // Reverse the sequence when '+' is found
      }
    }
  }

  // Always append the last element after processing all signs
  answer.push(n);
  // Reverse any remaining elements in the stack
  while (stack.length > 0) {
    answer.push(stack.pop());
  }

  return answer;
}
```

**Explanation**:
This approach uses a stack to handle runs of decreasing numbers (`'-'`). As we traverse the array of signs:
- For a `'+'`, we directly add the current index to the `answer` array and pop from the stack to reverse the order of any preceding `'-'` indices, creating a decreasing sequence.
- For a `'-'`, we push the index onto the stack to reverse it later when the run ends or when a `'+'` is encountered.

Finally, we flush the stack to ensure that all indices are included in the result, especially when the signs end with a `'-'`.

**Complexity Analysis**:

- **Time Complexity**: O(n)
- **Space Complexity**: O(n)

**Solution 2: Reverse In-Place Without a Stack**

```javascript
function reconstruct(signs) {
  const n = signs.length;
  let lastPlus = 0;
  const answer = Array.from({ length: n }, (_, i) => i);
  for (let r = 0; r < signs.length; r++) {
    const sign = signs[r];
    if (sign === "-") {
      if (r === signs.length - 1 || signs[r + 1] === "+") {
        reverse(answer, lastPlus, r);
      }
    } else {
      lastPlus = r;
    }
  }
  return answer;
}

function reverse(nums, begin, end) {
  while (begin < end) {
    [nums[begin], nums[end]] = [nums[end], nums[begin]];
    begin++;
    end--;
  }
}
```

**Explanation**:
This method also looks for segments to reverse based on runs of `'-'`, but it does so without using a stack. Instead, it directly reverses parts of the array in place whenever it encounters a `'+'` following a `'-'`.

**Complexity Analysis**:

- **Time Complexity**: O(n)
- **Space Complexity**: O(1)

**Solution 3: Increment/Decrement**

```javascript
function reconstruct(signs) {
  let maxSeen = 0;  // Tracks the largest number
  let minSeen = 0;  // Tracks the smallest number

  const result = [0];

  for (let i = 1; i < signs.length; i++) {
    const sign = signs[i];
    if (sign === "+") {
      maxSeen += 1;  // increment the largest number seen so far
      result.push(maxSeen);
    } else if (sign === "-") {
      minSeen -= 1;  // decrement the smallest number seen so far
      result.push(minSeen);
    }
  }

  // Normalize the result so it starts from 0 and covers all integers up to n.
  // The offset to adjust all elements is -minSeen, making the smallest element 0.
  return result.map((num) => num - minSeen);
}
```

**Explanation**:

Starting with an initial number, arbitrarily chosen to be zero, we build out the sequence one at a time:

- **For a `+` sign:** We anticipate that the sequence should increase, so we increment our current maximum value by one and append it to our results array. This helps us gradually build an increasing sequence from the starting point.

- **For a `-` sign:** Conversely, when we encounter a `-` sign, we need the sequence to decrease. To achieve this, we decrement our current minimum value by one and add this to our array. This step ensures we are also constructing a decreasing sequence simultaneously.

The key to this method is how it combines these two sequences by adjusting only the extremes of our current known values, ensuring every new number placed either extends the sequence upward from the maximum or downward from the minimum. After processing all signs, the array is adjusted to ensure all elements start from zero.

**Complexity Analysis**:

- **Time Complexity**: O(n)
- **Space Complexity**: O(1)

## Section 3: Exercises

1. **[Remove All Adjacent Duplicates In String](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/)**
2. **[Minimum Add to Make Parentheses Valid](https://leetcode.com/problems/minimum-add-to-make-parentheses-valid/)**
3. **[Removing Stars From a String](https://leetcode.com/problems/removing-stars-from-a-string/description/)**
4. **[Validate Stack Sequences](https://leetcode.com/problems/validate-stack-sequences/)**
5. **[Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string/)**
6. **[Minimum Number of Swaps to Make the String Balanced](https://leetcode.com/problems/minimum-number-of-swaps-to-make-the-string-balanced/)**
7. **[Remove All Occurrences of a Substring](https://leetcode.com/problems/remove-all-occurrences-of-a-substring/)**
8. **[Simplify Path](https://leetcode.com/problems/simplify-path/)**
9. **[Score of Parentheses](https://leetcode.com/problems/score-of-parentheses/)**
10. **[Baseball Game](https://leetcode.com/problems/baseball-game/)**
</content>
</invoke>
