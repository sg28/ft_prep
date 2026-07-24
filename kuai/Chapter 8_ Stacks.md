# Chapter 8: Stacks

## Section 1: Introduction to Stacks

Stacks are a fundamental data structure in computer science, adhering to the Last In, First Out (LIFO) principle.

### Core Stack Operations:

- **Push**: Add an element to the top of the stack, expanding its size.
- **Pop**: Remove and return the top element, reducing the stack's size.
- **Peek**: Retrieve the top element without modifying the stack.
- **IsEmpty**: Verify whether the stack has no elements.

### Implementing Stacks Using Python Lists

Python's list serves as an excellent stack with its end-based operations being efficiently managed.

**Creating a Stack**

You can initialize a stack as an empty list:

```python
stack = []
```

**Push Operation**

`append()` method adds an element at the end of the list, effectively the top of the stack:

```python
stack.append('apple')
stack.append('banana')  # The stack is now ['apple', 'banana']
```

**Pop Operation**

`pop()` method removes the last element, ensuring the stack isn't empty to avoid an exception:

```python
if stack:
    top_element = stack.pop()  # Removes and returns 'banana'
```

**Peek Operation**

Access the top element (the last in the list) without removing it:

```python
if stack:
    top_element = stack[-1]  # Accesses 'apple' without removing it
```

**IsEmpty Check**

A simple boolean check tells if the stack is empty:

```python
is_empty = not stack  # Returns True if the stack is empty
```

### Time Complexity Analysis

Stack operations are efficient:

- **Push (append)**: O(1) - Adding to the end of a list is a constant-time operation.
- **Pop**: O(1) - Removing the last element is also constant-time.
- **Peek**: O(1) - Accessing the last element is immediate in a list.
- **IsEmpty**: O(1) - Checking for emptiness is a straightforward boolean operation.

## Section 2: Solved Problems

### Problem 1: [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)

**Problem Statement**: Given a string containing just the characters `'(', ')', '{', '}', '['`, and `']'`, determine if the input string is valid.

**Solution**:

```python
def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char not in mapping:
            stack.append(char)
        elif not stack or mapping[char] != stack.pop():
            return False
    
    return not stack
```

### Problem 2: [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)

**Problem Statement**: Evaluate arithmetic expressions in Reverse Polish Notation.

**Solution**:

```python
def evalRPN(tokens):
    stack = []
    for token in tokens:
        if token not in "+-*/":
            stack.append(int(token))
            continue
        a, b = stack.pop(), stack.pop()
        if token == '+':
            stack.append(a + b)
        elif token == '-':
            stack.append(b - a)
        elif token == '*':
            stack.append(a * b)
        elif token == '/':
            stack.append(int(b / a))
    return stack.pop()
```

### Problem 3: [Reverse Substrings Between Each Pair of Parentheses](https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/)

**Problem Statement**: Reverse the substrings contained within each pair of parentheses.

**Solution**:

```python
def reverseParentheses(s):
    stack = []
    for char in s:
        if char == ')':
            temp = []
            while stack[-1] != '(':
                temp.append(stack.pop())
            stack.pop()  # Remove the '('
            stack.extend(temp)
        else:
            stack.append(char)
    return ''.join(stack)
```

### Problem 4: [Min Stack](https://leetcode.com/problems/min-stack/)

**Problem Statement**: Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

**Solution**:

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x: int):
        self.stack.append(x)
        min_val = min(x, self.min_stack[-1] if self.min_stack else x)
        self.min_stack.append(min_val)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]
```

### Problem 5: [Design a Stack with Increment Operation](https://leetcode.com/problems/design-a-stack-with-increment-operation/)

**Problem Statement**: Design a stack that includes a function `increment(k, val)` which increments the bottom `k` elements of the stack by `val`.

**Solution**:

```python
class CustomStack:
    def __init__(self, maxSize: int):
        self.capacity = maxSize
        self.stack = []
        self.increment = []

    def push(self, x: int) -> None:
        if len(self.stack) < self.capacity:
            self.stack.append(x)
            self.increment.append(0)

    def pop(self) -> int:
        if not self.stack:
            return -1
        if len(self.increment) > 1:
            self.increment[-2] += self.increment[-1]  # Transfer increment to next element
        return self.stack.pop() + self.increment.pop()  # Apply increment to popped element

    def increment(self, k: int, val: int) -> None:
        if self.stack:
            k = min(k, len(self.stack)) - 1  # Adjust k to the length of the stack
            self.increment[k] += val

```

**Explanation**: In our solution for the "Design a Stack with Increment Operation" problem, we employ an auxiliary list, `increment`, alongside the main stack, `stack`. Each index in `increment` aligns with `stack` and stores the total increment for that element and all elements below it.

### Problem 6: Reconstruct Jumbled Array

**Problem Statement**: Given a sequence represented as an array of signs where each sign indicates whether the current number is larger (`'+'`) or smaller (`'-'`) than the previous number, reconstruct an array consistent with these signs. The array should be a permutation of `[0, 1, ..., n]`. For example, the input `[None, '+', '+', '-', '+']` might correspond to a valid output like `[0, 1, 3, 2, 4]`.

**Solution 1: Stack**

```python
def reconstruct(signs):
    answer = []
    stack = []
    n = len(signs) - 1
    
    for i in range(n):
        if signs[i + 1] == '-':
            stack.append(i)  # Store index to reverse later
        else:
            answer.append(i)
            while stack:
                answer.append(stack.pop())  # Reverse the sequence when '+' is found
    
    # Always append the last element after processing all signs
    answer.append(n)
    # Reverse any remaining elements in the stack
    while stack:
        answer.append(stack.pop())

    return answer
```

**Explanation**:
This approach uses a stack to handle runs of decreasing numbers (`'-'`). As we traverse the array of signs:
- For a `'+'`, we directly add the current index to the `answer` list and pop from the stack to reverse the order of any preceding `'-'` indices, creating a decreasing sequence.
- For a `'-'`, we push the index onto the stack to reverse it later when the run ends or when a `'+'` is encountered.

Finally, we flush the stack to ensure that all indices are included in the result, especially when the signs end with a `'-'`.

**Complexity Analysis**:

- **Time Complexity**: O(n)
- **Space Complexity**: O(n)

**Solution 2: Reverse In-Place Without a Stack**

```python
def reconstruct(signs):
    n = len(signs)
    last_plus = None
    answer = list(range(n))
    for r, sign in enumerate(signs):
        if sign == '-':
            if r == len(signs) - 1 or signs[r+1] == '+':
                reverse(answer, last_plus, r)
        else:
            last_plus = r
    return answer

def reverse(nums, begin, end):
    while begin < end:
        nums[begin], nums[end] = nums[end], nums[begin]
        begin += 1
        end -= 1
```

**Explanation**:
This method also looks for segments to reverse based on runs of `'-'`, but it does so without using a stack. Instead, it directly reverses parts of the list in place whenever it encounters a `'+'` following a `'-'`.

**Complexity Analysis**:

- **Time Complexity**: O(n)
- **Space Complexity**: O(1)

**Solution 3: Increment/Decrement**

```python
def reconstruct(signs):
    max_seen = 0  # Tracks the largest number
    min_seen = 0  # Tracks the smallest number

    result = [0]

    for i in range(1, len(signs)):
        sign = signs[i]
        if sign == '+':
            max_seen += 1  # increment the largest number seen so far
            result.append(max_seen)
        elif sign == '-':
            min_seen -= 1  # decrement the smallest number seen so far
            result.append(min_seen)

    # Normalize the result so it starts from 0 and covers all integers up to n.
    # The offset to adjust all elements is -min_seen, making the smallest element 0.
    return [num - min_seen for num in result]
```

**Explanation**:

Starting with an initial number, arbitrarily chosen to be zero, we build out the sequence one at a time:

- **For a `+` sign:** We anticipate that the sequence should increase, so we increment our current maximum value by one and append it to our results list. This helps us gradually build an increasing sequence from the starting point.

- **For a `-` sign:** Conversely, when we encounter a `-` sign, we need the sequence to decrease. To achieve this, we decrement our current minimum value by one and add this to our list. This step ensures we are also constructing a decreasing sequence simultaneously.

The key to this method is how it combines these two sequences by adjusting only the extremes of our current known values, ensuring every new number placed either extends the sequence upward from the maximum or downward from the minimum. After processing all signs, the list is adjusted to ensure all elements start from zero. 

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
