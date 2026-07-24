# Chapter 7: Strings

## Section 1: Introduction to Strings

A string is a sequence of characters enclosed within single quotes (`' '`), double quotes (`" "`), or triple quotes (`""" """` or `''' '''`) for multiline strings. Strings are widely used to represent and manipulate text, such as single characters, sentences, paragraphs.

### Immutable Nature of Strings

Strings are immutable, which means that once a string is created, its content cannot be altered. Any operation that appears to modify a string will instead create a new string. This immutability is crucial for several reasons:

- **Hashing**: Since strings can be hashed (i.e., converted into a unique integer), they can be used as keys in [dictionaries](https://docs.python.org/3/tutorial/datastructures.html#dictionaries).
- **Safety**: Immutable objects are thread-safe. Multiple threads can access them simultaneously without risk of data corruption or unexpected side effects.

#### Example

```python
text = "Hello"
text[0] = "J"  # This will raise a TypeError, as strings cannot be modified
```

## Section 2: Common String Operations

Here are some essential operations and methods to manipulate strings:

### Length of a String

The `len()` function returns the number of characters in a string, operating in constant time `O(1)` because the length is stored internally.

```python
message = "Python"
print(len(message))  # Output: 6
```

### Indexing and Slicing

Strings support indexing and slicing to access individual characters or substrings. Python uses zero-based indexing and supports negative indices to access elements from the end.

```python
text = "hello"
print(text[0])    # Output: 'h'
print(text[-1])   # Output: 'o'
print(text[1:4])  # Output: 'ell'
```

### Checking for Substrings

You can check for the presence of a substring within a string using the `in` keyword:

```python
phrase = "Python is fun"
print("fun" in phrase)  # Output: True
```

### String Concatenation

#### Using the `+` Operator

The `+` operator allows you to combine two or more strings:

```python
greeting = "Hello"
name = "Alice"
message = greeting + ", " + name + "!"
print(message)  # Output: 'Hello, Alice!'
```

#### Using the `join()` Method

The `join()` method is more efficient for concatenating multiple strings, especially within loops:

```python
words = ['Python', 'is', 'fun']
sentence = ' '.join(words)
print(sentence)  # Output: 'Python is fun'
```

#### Performance Considerations

Using the `+` operator repeatedly in a loop leads to quadratic time complexity. Use `join()` for efficient concatenation:

```python
# Inefficient way
result = ""
for word in ["This", "is", "a", "test"]:
    result += word + " "

# Efficient way
result = " ".join(["This", "is", "a", "test"])
```

### Splitting Strings

The `split()` method breaks a string into a list of substrings based on a delimiter:

```python
data = 'Python,is,awesome'
items = data.split(',')
print(items)  # Output: ['Python', 'is', 'awesome']
```

### Replacing Substrings

The `replace()` method replaces occurrences of a substring with another:

```python
modified = 'Python is everywhere'.replace('everywhere', 'awesome')
print(modified)  # Output: 'Python is awesome'
```

### Stripping Whitespaces

The `strip()` method removes leading and trailing whitespaces or specified characters:

```python
noisy = '   hello world   '
clean = noisy.strip()
print(clean)  # Output: 'hello world'
```

### String Formatting

Introduced in Python 3.6, [f-strings](https://docs.python.org/3/reference/lexical_analysis.html#f-strings) provide a concise and readable way to embed expressions inside string literals:

```python
name = "Alice"
age = 30
print(f"{name} is {age} years old.")  # Output: 'Alice is 30 years old.'
```

## Section 3: Solved Problems

### Problem 1: [Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/)

**Problem Statement**: Given an input string `s`, reverse the order of the words.

**Solution**:

```python
def reverseWords(s: str) -> str:
    return ' '.join(reversed(s.split()))
```

**Explanation**: The `split()` function breaks the string into words and removes any extra spaces. `reversed()` reverses the order of these words, and `' '.join()` combines them into a single string with a space separator.


### Problem 2: [Rotate String](https://leetcode.com/problems/rotate-string/)

**Problem Statement**: Given two strings, `s` and `goal`, return `true` if and only if `s` can become `goal` after some number of shifts on `s`.

**Solution**:

```python
def rotateString(s: str, goal: str) -> bool:
    return len(s) == len(goal) and goal in (s + s)
```

### Problem 3: [Repeated String Match](https://leetcode.com/problems/repeated-string-match/)

**Problem Statement**: Given two strings `a` and `b`, return the minimum number of times you should repeat string `a` so that string `b` is a substring of it.

**Solution**:

```python
from math import ceil

def repeatedStringMatch(a: str, b: str) -> int:
    multiples = ceil(len(b) / len(a))
    if b in a * multiples:
        return multiples
    elif b in a * (multiples + 1):
        return multiples + 1
    return -1
```

**Explanation**: Calculate the minimum repetitions needed to exceed the length of `b`. Check the current repeat count and one more, since `b` might straddle the boundary of `a` repeated.

### Problem 4: [Decoded String at Index](https://leetcode.com/problems/decoded-string-at-index/)

**Problem Statement**: Given an encoded string and an index `k`, find and return the `k`-th letter (1-indexed) in the decoded string.

**Solution**:

```python
def decodeAtIndex(s: str, k: int) -> str:
    size = 0
    for char in s:
        if char.isdigit():
            size *= int(char)
        else:
            size += 1
    for char in reversed(s):
        k %= size
        if k == 0 and char.isalpha():
            return char
        if char.isdigit():
            size //= int(char)
        else:
            size -= 1
```

**Explanation**: Calculate the size of the decoded string without actually decoding it, then work backwards to determine the character that would appear at the `k`-th position.

## Section 4: Exercises

1. **[Repeated Substring Pattern](https://leetcode.com/problems/repeated-substring-pattern/)**
2. **[Sort Vowels in a String](https://leetcode.com/problems/sort-vowels-in-a-string/)**
3. **[Is Subsequence](https://leetcode.com/problems/is-subsequence/)**
4. **[Check if Binary String Has At Most One Segment of Ones](https://leetcode.com/problems/check-if-binary-string-has-at-most-one-segment-of-ones/)**
5. **[Valid Word Abbreviation](https://www.lintcode.com/problem/637/)**
6. **[Backspace String Compare](https://leetcode.com/problems/backspace-string-compare/)**
7. **[Replace All Digits with Characters](https://leetcode.com/problems/replace-all-digits-with-characters/)**
8. **[Check If String Is a Prefix of Array](https://leetcode.com/problems/check-if-string-is-a-prefix-of-array/)**
9. **[Detect Pattern of Length M Repeated K or More Times](https://leetcode.com/problems/detect-pattern-of-length-m-repeated-k-or-more-times/)**
10. **[String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi/)**
11. **[Multiply Strings](https://leetcode.com/problems/multiply-strings/)**
12. **[Shifting Letters](https://leetcode.com/problems/shifting-letters/)**
13. **[Reverse String](https://leetcode.com/problems/reverse-string/)**
14. **[Reverse String II](https://leetcode.com/problems/reverse-string-ii/)**
15. **[Reverse Vowels of a String](https://leetcode.com/problems/reverse-vowels-of-a-string/)**
16. **[Words Within Two Edits of Dictionary](https://leetcode.com/problems/words-within-two-edits-of-dictionary/)**
17. **[Longest Balanced Substring I](https://leetcode.com/problems/longest-balanced-substring-i/)**
