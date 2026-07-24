# Chapter 7: Strings

## Section 1: Introduction to Strings

A string is a sequence of characters enclosed within single quotes (`' '`), double quotes (`" "`), or backticks (`` ` ` ``) for [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), which also support multiline strings and embedded expressions. Strings are widely used to represent and manipulate text, such as single characters, sentences, paragraphs.

### Immutable Nature of Strings

Strings are immutable, which means that once a string is created, its content cannot be altered. Any operation that appears to modify a string will instead create a new string. This immutability is crucial for several reasons:

- **Use as object/Map keys**: Since strings are primitive values compared by value, they make reliable keys in plain objects and [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s.
- **Safety**: Immutable values can be shared freely without risk of one part of the program unexpectedly mutating them from under another.

#### Example

```javascript
let text = "Hello";
text[0] = "J";     // Silently ignored (throws in strict mode); strings cannot be modified in place
console.log(text); // Output: 'Hello'
```

## Section 2: Common String Operations

Here are some essential operations and methods to manipulate strings:

### Length of a String

The `.length` property returns the number of characters in a string, and reading it is a constant-time `O(1)` operation because the length is stored internally.

```javascript
const message = "JavaScript";
console.log(message.length); // Output: 10
```

### Indexing and Slicing

Strings support indexing and slicing to access individual characters or substrings. JavaScript uses zero-based indexing. Bracket indexing does not accept negative indices, but `.at()` does, and `.slice()` accepts negative arguments to count from the end.

```javascript
const text = "hello";
console.log(text[0]);       // Output: 'h'
console.log(text.at(-1));   // Output: 'o'
console.log(text.slice(1, 4)); // Output: 'ell'
```

### Checking for Substrings

You can check for the presence of a substring within a string using the `.includes()` method:

```javascript
const phrase = "JavaScript is fun";
console.log(phrase.includes("fun")); // Output: true
```

### String Concatenation

#### Using the `+` Operator

The `+` operator allows you to combine two or more strings:

```javascript
const greeting = "Hello";
const name = "Alice";
const message = greeting + ", " + name + "!";
console.log(message); // Output: 'Hello, Alice!'
```

#### Using `Array.prototype.join()`

The `join()` method on an array is more efficient for concatenating many strings, especially within loops:

```javascript
const words = ['JavaScript', 'is', 'fun'];
const sentence = words.join(' ');
console.log(sentence); // Output: 'JavaScript is fun'
```

#### Performance Considerations

Because strings are immutable, repeatedly using `+=` in a loop can create many intermediate strings. A robust pattern is to push pieces into an array and `join()` once at the end:

```javascript
// Potentially inefficient: builds up a new string on every iteration
let result = "";
for (const word of ["This", "is", "a", "test"]) {
    result += word + " ";
}

// Efficient way: collect parts, then join once
const parts = ["This", "is", "a", "test"];
result = parts.join(" ");
```

### Splitting Strings

The `split()` method breaks a string into an array of substrings based on a delimiter:

```javascript
const data = 'JavaScript,is,awesome';
const items = data.split(',');
console.log(items); // Output: ['JavaScript', 'is', 'awesome']
```

### Replacing Substrings

The `replace()` method replaces the first occurrence of a substring with another, while `replaceAll()` replaces every occurrence:

```javascript
const modified = 'JavaScript is everywhere'.replace('everywhere', 'awesome');
console.log(modified); // Output: 'JavaScript is awesome'
```

### Stripping Whitespaces

The `trim()` method removes leading and trailing whitespace (use `trimStart()` / `trimEnd()` for one side only):

```javascript
const noisy = '   hello world   ';
const clean = noisy.trim();
console.log(clean); // Output: 'hello world'
```

### String Formatting

[Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) (delimited by backticks) provide a concise and readable way to embed expressions inside string literals using `${...}`:

```javascript
const name = "Alice";
const age = 30;
console.log(`${name} is ${age} years old.`); // Output: 'Alice is 30 years old.'
```

## Section 3: Solved Problems

### Problem 1: [Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/)

**Problem Statement**: Given an input string `s`, reverse the order of the words.

**Solution**:

```javascript
function reverseWords(s) {
    return s.trim().split(/\s+/).reverse().join(' ');
}
```

**Explanation**: `trim()` removes leading/trailing spaces and splitting on the regex `/\s+/` breaks the string into words while collapsing any extra internal spaces. `reverse()` reverses the order of these words, and `join(' ')` combines them into a single string with a space separator.


### Problem 2: [Rotate String](https://leetcode.com/problems/rotate-string/)

**Problem Statement**: Given two strings, `s` and `goal`, return `true` if and only if `s` can become `goal` after some number of shifts on `s`.

**Solution**:

```javascript
function rotateString(s, goal) {
    return s.length === goal.length && (s + s).includes(goal);
}
```

### Problem 3: [Repeated String Match](https://leetcode.com/problems/repeated-string-match/)

**Problem Statement**: Given two strings `a` and `b`, return the minimum number of times you should repeat string `a` so that string `b` is a substring of it.

**Solution**:

```javascript
function repeatedStringMatch(a, b) {
    const multiples = Math.ceil(b.length / a.length);
    if (a.repeat(multiples).includes(b)) {
        return multiples;
    } else if (a.repeat(multiples + 1).includes(b)) {
        return multiples + 1;
    }
    return -1;
}
```

**Explanation**: Calculate the minimum repetitions needed to exceed the length of `b`. Check the current repeat count and one more, since `b` might straddle the boundary of `a` repeated.

### Problem 4: [Decoded String at Index](https://leetcode.com/problems/decoded-string-at-index/)

**Problem Statement**: Given an encoded string and an index `k`, find and return the `k`-th letter (1-indexed) in the decoded string.

**Solution**:

```javascript
function decodeAtIndex(s, k) {
    let size = 0;
    for (const char of s) {
        if (char >= '0' && char <= '9') {
            size *= Number(char);
        } else {
            size += 1;
        }
    }
    for (let i = s.length - 1; i >= 0; i--) {
        const char = s[i];
        k %= size;
        if (k === 0 && /[a-zA-Z]/.test(char)) {
            return char;
        }
        if (char >= '0' && char <= '9') {
            size = Math.floor(size / Number(char));
        } else {
            size -= 1;
        }
    }
}
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
