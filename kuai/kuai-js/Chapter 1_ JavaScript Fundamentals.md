# Chapter 1: JavaScript Fundamentals
This chapter lays the groundwork for your JavaScript journey, focusing on the fundamental building blocks essential for writing effective and idiomatic code. We'll explore how JavaScript handles data, organizes code into reusable blocks, and controls the flow of execution. Understanding these core concepts is crucial, especially for software engineering interviews where a solid grasp of language fundamentals is expected. JavaScript is renowned for its ubiquity and flexibility, and we'll touch upon some aspects that contribute to writing clean, modern code.

## Section 1: Variables

JavaScript variables are dynamically typed, which means you don't have to explicitly define their data type. The type is automatically determined based on the value assigned. Modern JavaScript uses two keywords to declare variables: `let` for values that can be reassigned, and `const` for values that never get reassigned. Prefer `const` by default, and reach for `let` only when you actually need to reassign. (The older `var` keyword still works but is avoided in modern code because of its confusing scoping rules.)

```javascript
let n = 0; // n is a number
console.log(n);

n = "abc"; // n now holds a string
console.log(n);

n = null; // Represents the intentional absence of a value
console.log(n);
```

JavaScript community style (as encoded by tools like [ESLint](https://eslint.org/) and Prettier) recommends using `camelCase` (first word lowercase, later words capitalized) for variable and function names (e.g., `myVariable`, `calculateSum`). Adhering to a consistent style improves code readability across projects.

### Destructuring and Rest Elements

JavaScript allows assigning several variables at once from an array by using destructuring:

```javascript
const [x, y] = [10, "hello"];
console.log(x, y); // Output: 10 hello

// Using '...' (the rest element) to capture extra values
const [first, second, ...others] = [1, 2, 3, 4, 5];
console.log(first, second, others); // Output: 1 2 [ 3, 4, 5 ]
```

### Swapping Values
Swapping two variables in JavaScript is concise via array destructuring and doesn't require a temporary variable:

```javascript
let a = 100;
let b = 200;
[a, b] = [b, a];
console.log(a, b); // Output: 200 100
```

### Compound Assignment Operators

Compound operators combine arithmetic operations with assignment:

```javascript
let x = 10;
x += 5; // Equivalent to x = x + 5
console.log(x); // Output: 15
```

## Section 2: Data Types

Before diving into specific data types, it's important to understand the concept of **mutability** and **immutability**. Mutable values can be changed after they are created, while immutable values cannot. In JavaScript, the primitive types (numbers, strings, booleans, `null`, `undefined`, symbols, and BigInts) are immutable, while objects and arrays are mutable. This distinction has significant implications for how you use and manage data, affecting aspects like assignment, function arguments, and how values compare.

JavaScript provides several built-in data types, each designed to handle different kinds of data efficiently. This section is an overview of the most commonly used types.

### Booleans and Logical Expressions

- **[Booleans (`boolean`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**: Booleans are represented by `true` and `false`.

    ```javascript
    console.log(10 > 5); // true
    console.log(Boolean(0)); // Zero is falsy, outputs false
    ```

- **[Truthy and Falsy Values](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)**: In JavaScript, values are considered "truthy" or "falsy" in a Boolean context. Most values are truthy except for a handful, considered falsy: `false`, `0`, `-0`, `0n` (BigInt zero), `""` (empty string), `null`, `undefined`, and `NaN`. Note that, unlike some languages, empty arrays (`[]`) and empty objects (`{}`) are **truthy** in JavaScript.

    ```javascript
    // Truthy and Falsy examples
    if ("hello") { // Non-empty string is truthy
        console.log("This is truthy");
    }
    if ("") { // Empty string is falsy
        console.log("This won't print");
    }
    ```

- **[Boolean Operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators)**: Understanding `&&` (and), `||` (or), and `!` (not) is essential for constructing complex logical conditions.
  **Operator Precedence**:
    * `!` has the highest precedence.
    * `&&` comes next.
    * `||` has the lowest precedence.

    ```javascript
    const isEditor = true;
    const isLocked = false;
    const userRole = "viewer";

    // Access granted if (user is editor AND document is not locked) OR userRole is "admin"
    if (userRole === "admin" || (isEditor && !isLocked)) {
        console.log("Access granted.");
    } else {
        console.log("Access denied.");
    }
    ```

### Binary and Hexadecimal Systems

- **Binary System**: The binary system (base-2) is integral to computing, representing all data at the machine level.
    ```javascript
    console.log(0b1011); // Output: 11
    ```

- **Hexadecimal System**: The hexadecimal system (base-16) is often used to simplify binary representations.
    ```javascript
    console.log(0xFF5733); // Output: 16744115
    ```

- **Conversions and Applications**: Converting between decimal, binary, and hexadecimal is a frequent requirement in programming. Use [`Number.prototype.toString(radix)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString) to produce a string in a given base, and [`parseInt(str, radix)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt) to parse one back.
    ```javascript
    const dec = 255;
    console.log(dec.toString(2)); // '11111111' - binary representation
    console.log(dec.toString(16)); // 'ff' - hexadecimal representation
    console.log("0b" + dec.toString(2)); // '0b11111111' - with a prefix, if desired
    console.log("0x" + dec.toString(16)); // '0xff'
    ```

### Numeric Types

- **[Numbers (`number`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)**: Unlike many languages, JavaScript has a single `number` type for both integers and reals. Every number is a 64-bit IEEE 754 double-precision float. This means integers are only exact up to `Number.MAX_SAFE_INTEGER` (2^53 − 1). Numbers support basic arithmetic and comparisons.

    ```javascript
    const x = 3;
    const y = 4;

    console.log(x + y); // Output: 7 (addition)
    console.log(x - y); // Output: -1 (subtraction)
    console.log(x * y); // Output: 12 (multiplication)
    console.log(Math.floor(x / y)); // Output: 0 (integer division via Math.floor)
    console.log(x / y); // Output: 0.75 (regular division)
    console.log(x % y); // Output: 3 (modulus)
    ```

- **[BigInt (`bigint`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)**: When you need whole numbers larger than `Number.MAX_SAFE_INTEGER` without losing precision, use `BigInt`. BigInts are **arbitrary-precision** integers: they can grow as large as memory allows without overflow. Write a BigInt literal by appending `n` to an integer, or call `BigInt(...)`. You cannot mix `BigInt` and `number` in the same arithmetic expression.

    ```javascript
    const big = 9007199254740991n; // Number.MAX_SAFE_INTEGER as a BigInt
    console.log(big + 1n); // Output: 9007199254740992n
    console.log(big + 2n); // Output: 9007199254740993n (exact — a regular number would lose this)
    console.log(2n ** 100n); // Output: 1267650600228229401496703205376n
    ```

    [Bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) manipulate individual bits of integers, enabling efficient arithmetic and data processing. These operations are useful in tasks like flag manipulation, masking, and low-level programming. In JavaScript, bitwise operators coerce their operands to 32-bit signed integers.

    ```javascript
    const a = 12; // binary: 1100
    const b = 5;  // binary: 0101

    // Bitwise AND
    console.log(a & b); // Output: 4 (binary: 0100)
    // Bitwise OR
    console.log(a | b); // Output: 13 (binary: 1101)
    // Bitwise XOR
    console.log(a ^ b); // Output: 9 (binary: 1001)
    // Bitwise NOT
    console.log(~a); // Output: -13 (binary: ...11110011)
    // Bitwise LEFT SHIFT
    console.log(a << 2); // Output: 48 (binary: 110000)
    // Bitwise RIGHT SHIFT
    console.log(a >> 2); // Output: 3 (binary: 0011)
    ```

- **Floating-point numbers**: Since every `number` is an IEEE 754 double, real numbers share the same type as integers. The [IEEE 754 standard](https://en.wikipedia.org/wiki/IEEE_754) offers significant range and precision but introduces potential rounding errors. When precision is critical, such as in financial calculations or currency representations, avoid relying on raw floating-point arithmetic. Even small rounding errors can lead to inaccuracies. Consider working in integer units (e.g., cents) or using a decimal library for such cases.

    ```javascript
    // Floating-point precision
    const p = 0.1;
    const q = 0.2;
    console.log(p + q); // Might not result exactly in 0.3 due to precision (e.g., 0.30000000000000004)

    // Scientific notation
    const c = 1.5e2; // Equivalent to 1.5 * 10^2 or 150
    console.log(c);

    // Rounding to 2 decimal places
    console.log(Math.round(3.14159 * 100) / 100); // Output: 3.14
    console.log(Number(3.14159.toFixed(2))); // Output: 3.14 (toFixed returns a string)

    // Infinity
    console.log(Infinity); // Positive infinity
    console.log(-Infinity); // Negative infinity
    ```

### Arrays

[Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) are mutable, ordered sequences, capable of storing heterogeneous elements.

- **Array Operations**: Arrays support various operations such as indexing, slicing, appending, and removing elements.
    ```javascript
    // Creating and initializing an array
    const fruits = ["apple", "banana", "cherry", "date", "elderberry"];
    console.log(fruits[0]); // "apple"
    const [fruit1, fruit2, , fruit3] = fruits; // Skip an element with an empty slot
    console.log(fruit1, fruit2, fruit3); // Output: apple banana date
    fruits.push("orange"); // Adding an element to the end
    console.log(fruits); // ['apple', 'banana', 'cherry', 'date', 'elderberry', 'orange']
    fruits.splice(1, 1); // Removing 1 element at index 1 ("banana")
    console.log(fruits); // ['apple', 'cherry', 'date', 'elderberry', 'orange']
    console.log(fruits.slice(0, 2)); // Slicing (elements at index 0 and 1) ['apple', 'cherry']
    ```

- **Iterating over Arrays**: Iteration over arrays is fundamental, allowing the execution of operations on each element.
    ```javascript
    for (const fruit of fruits) {
        console.log(fruit);
    }
    ```

- **Size of an array**: Use the `.length` property to obtain the number of items in an array.
    ```javascript
    console.log([1, 2, 3].length); // Output: 3
    ```

- **Building arrays functionally**: Where Python uses list comprehensions, JavaScript uses `map`, `filter`, and `Array.from` to create arrays from existing iterables:
    ```javascript
    // Create an array of squares from 0 to 4
    const squares = Array.from({ length: 5 }, (_, x) => x ** 2);
    console.log(squares); // Output: [ 0, 1, 4, 9, 16 ]

    // Create an array of even numbers from another array
    const numbers = [1, 2, 3, 4, 5, 6];
    const evens = numbers.filter((x) => x % 2 === 0);
    console.log(evens); // Output: [ 2, 4, 6 ]
    ```

- **Generators**: JavaScript doesn't have generator *expressions*, but it has generator *functions* (declared with `function*`), which produce values one at a time and only when requested via `yield`. This makes them memory-efficient for large sequences:

    ```javascript
    function* squaresGenerator(n) {
        for (let x = 0; x < n; x++) {
            yield x ** 2;
        }
    }

    const gen = squaresGenerator(5);
    console.log(gen); // Output: Object [Generator] {}
    for (const square of squaresGenerator(5)) {
        process.stdout.write(square + " "); // Output: 0 1 4 9 16
    }
    console.log();

    // Combine with a reducer to sum lazily-produced values
    let total = 0;
    for (const sq of squaresGenerator(5)) total += sq; // 0+1+4+9+16
    console.log(total); // Output: 30
    ```

### Strings

[Strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) are immutable sequences of characters. Once a string is created, its characters cannot be changed directly.

- **Accessing Characters**: Strings support indexing and slicing to access subsets of the string. Note that since strings are immutable, operations like replacing or modifying characters return a new string.
    ```javascript
    const phrase = "JavaScript programming";
    console.log(phrase[0]); // 'J'

    console.log(phrase.slice(11)); // 'programming'
    console.log([...phrase].reverse().join("")); // Reverse the string: 'gnimmargorp tpircSavaJ'

    console.log("test".length); // Output: 4
    ```

- **String Methods**: JavaScript strings come with numerous methods that allow for advanced manipulation without altering the original string.
    ```javascript
    const phrase = "JavaScript programming";
    console.log(phrase.toUpperCase()); // Convert to uppercase: 'JAVASCRIPT PROGRAMMING'
    console.log(phrase.replace("JavaScript", "C++")); // Replace substring: 'C++ programming'

    const csvLine = "apple,banana,cherry";
    const items = csvLine.split(","); // Split string by a delimiter
    console.log(items); // Output: [ 'apple', 'banana', 'cherry' ]

    const sentence = "This is a sentence.";
    const words = sentence.split(/\s+/); // Split on runs of whitespace
    console.log(words); // Output: [ 'This', 'is', 'a', 'sentence.' ]
    ```

- **Concatenation**: Strings can be joined using the `+` operator or the `join()` method (on an array of strings) for combining many strings. The `join()` method is convenient and efficient for joining many strings.
    ```javascript
    let s = "abc";
    s += "def"; // s becomes 'abcdef'
    console.log(s);
    console.log(["ab", "cd", "ef"].join("")); // 'abcdef'
    ```

- **Formatting**: JavaScript's template literals (backtick strings) provide a clean, readable way to interpolate values.
    ```javascript
    const name = "Alice"; // Define name for the example
    console.log(`Hello, ${name}!`); // Output: Hello, Alice!

    // Template literals can embed any expression
    const errorCode = 404;
    const message = `Error: ${errorCode} - Page not found`;
    console.log(message); // Output: Error: 404 - Page not found
    ```

- **Conversion between Types**: Convert strings to numbers and vice versa, which is useful in various computational contexts.
    ```javascript
    const numericString = "123";
    console.log(numericString.repeat(2)); // Output: "123123" (string repetition)
    console.log(Number(numericString) * 2); // Converts to number and doubles it: 246
    console.log(String(1234)); // Converts number 1234 to "1234"
    ```

- **Character Code Values**: Sometimes, the [ASCII code](https://en.wikipedia.org/wiki/ASCII) (or more broadly, the UTF-16 code unit) of a character is needed for algorithms.
    ```javascript
    console.log("a".charCodeAt(0)); // Code value of 'a': 97
    console.log(String.fromCharCode(97)); // Character from code value 97: 'a'
    ```

### Sets

[Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) are mutable collections that store unique elements in insertion order. They are useful for membership testing, removing duplicates, and mathematical set operations.

- **Initialization**: Create a set with the `Set` constructor, optionally passing any iterable (such as an array) to convert it into a set.
    ```javascript
    const numbers = new Set([1, 2, 3, 4, 5]);
    console.log(numbers); // Output: Set(5) { 1, 2, 3, 4, 5 }
    const emptySet = new Set();
    console.log(emptySet); // Output: Set(0) {}
    const arrToSet = new Set([1, 2, 2, 3]);
    console.log(arrToSet); // Output: Set(3) { 1, 2, 3 }
    ```

- **Adding Elements**: Use the `add()` method to add individual elements to a set.
    ```javascript
    const numbers = new Set([1, 2, 3]);
    numbers.add(3); // Adding an existing element does nothing
    numbers.add(4);
    console.log(numbers); // Output: Set(4) { 1, 2, 3, 4 }
    ```

- **Removing Elements**: Use the `delete()` method to remove a specific element; it returns `true` if the element was present and `false` otherwise (it never throws). Membership is tested with `has()`.
    ```javascript
    const numbers = new Set([1, 2, 3, 4, 5, 6]);
    numbers.delete(1);
    console.log(numbers); // Output: Set(5) { 2, 3, 4, 5, 6 }
    console.log(numbers.delete(10)); // false — nothing to remove, no error
    numbers.delete(2);
    console.log(numbers); // Output: Set(4) { 3, 4, 5, 6 }
    ```

- **Union**: Combines elements from multiple sets without duplication. Modern engines support the ES2024 `Set.prototype.union` method, but here is a portable version:
    ```javascript
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    const union = new Set([...set1, ...set2]);
    console.log(union); // Output: Set(5) { 1, 2, 3, 4, 5 }
    ```

- **Intersection**: Finds common elements between sets (ES2024 provides `Set.prototype.intersection`; portable version below).
    ```javascript
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    console.log(intersection); // Output: Set(1) { 3 }
    ```

- **Difference**: Identifies elements present in the first set but not in the others (ES2024 provides `Set.prototype.difference`; portable version below).
    ```javascript
    const difference = new Set([...set1].filter((x) => !set2.has(x)));
    console.log(difference); // Output: Set(2) { 1, 2 }
    ```

### Maps and Objects

For key-value collections, JavaScript offers two tools. A plain **object** (`{}`) is the classic choice for string keys, while a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) is a purpose-built collection that accepts keys of any type, remembers insertion order, and exposes a clean API with a `.size` property. Both are backed by [hash tables](https://en.wikipedia.org/wiki/Hash_table) designed for fast retrieval. Use a `Map` when keys are dynamic, numeric, or non-string; use an object for fixed, string-keyed records.

- **Creating and Initializing**:
    ```javascript
    // Plain object
    const person = { name: "John", age: 30, city: "New York" };
    console.log(person.name); // Accesses value by key, output: John
    const emptyObj = {};
    const anotherObj = { name: "Jane", age: 25 };
    console.log(anotherObj); // Output: { name: 'Jane', age: 25 }

    // Map
    const personMap = new Map([
        ["name", "John"],
        ["age", 30],
    ]);
    console.log(personMap.get("name")); // Output: John
    ```
    Both plain objects (for string keys) and `Map`s preserve insertion order when iterated.

- **Adding and Updating Entries**: For objects, assign a value to a key. For maps, use `set()`.
    ```javascript
    const person = { name: "John", age: 30 };
    person.age = 31; // Updates the age
    person.profession = "Engineer"; // Adds a new key-value pair
    console.log(person); // Output: { name: 'John', age: 31, profession: 'Engineer' }

    const m = new Map();
    m.set("age", 31);
    m.set("profession", "Engineer");
    ```

- **Removing Entries**: Use `delete` (operator) for objects, or `delete()` (method) for maps.
    ```javascript
    const person = { name: "John", age: 35, profession: "Engineer", city: "Los Angeles" };
    delete person.city; // Deletes the key 'city' along with its value

    const m = new Map([["profession", "Engineer"]]);
    const profession = m.get("profession"); // Read before removing
    m.delete("profession"); // Removes the entry
    ```

- **Keys, Values, and Entries**: Iterate over keys, values, or key-value pairs. Objects use `Object.keys()`, `Object.values()`, and `Object.entries()`; maps expose `.keys()`, `.values()`, and `.entries()` (and are directly iterable).
    ```javascript
    const person = { name: "John", age: 30 };
    for (const key of Object.keys(person)) { // Or: for (const key in person)
        console.log(key);
    }

    for (const value of Object.values(person)) {
        console.log(value);
    }

    for (const [key, value] of Object.entries(person)) {
        console.log(`${key}: ${value}`);
    }
    ```

- **Checking for Key Existence**: Use the `in` operator (or `hasOwnProperty`) for objects, and `has()` for maps, to check for a key without causing an error:
    ```javascript
    const person = { name: "John", age: 30 };
    if ("name" in person) {
        console.log("Name found!");
    }
    if (!("occupation" in person)) {
        console.log("Occupation not found.");
    }
    ```

- **Reading with a default**: Accessing a missing object property yields `undefined` rather than throwing. Combine that with the nullish-coalescing operator `??` to supply a fallback. A `Map` behaves the same way via `get()`.
    ```javascript
    const person = { name: "John", age: 30 };
    console.log(person.age ?? -1); // Output: 30
    console.log(person.occupation); // Output: undefined
    console.log(person.occupation ?? "N/A"); // Output: N/A

    const m = new Map([["age", 30]]);
    console.log(m.get("age") ?? -1); // Output: 30
    console.log(m.get("occupation") ?? "N/A"); // Output: N/A
    ```

### Frozen Objects and Composite Keys

JavaScript has no dedicated tuple type; a fixed sequence is just an array. Where Python relies on tuples for two things — immutable fixed-size records and hashable composite keys — JavaScript uses different tools.

- **Immutability**: To make an array or object read-only, use [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze). Attempts to modify a frozen value are silently ignored (or throw in strict mode).
    ```javascript
    const tup = Object.freeze([1, 2, 3]);
    console.log(tup); // Output: [ 1, 2, 3 ]
    console.log(tup[0]); // Access the first element: 1
    console.log(tup[tup.length - 1]); // Access the last element: 3
    // tup[0] = 100; // Ignored (or throws in strict mode) — the array is frozen
    ```

- **Composite keys**: This is a crucial difference from Python. JavaScript `Map`s and `Set`s compare object/array keys by **reference**, not by value, so two different arrays with the same contents are treated as distinct keys. When you need a composite key (e.g., grid coordinates `(i, j)`), use a **string** key like `` `${i},${j}` `` instead.
    ```javascript
    const myMap = new Map();
    myMap.set("1,2", "point");
    myMap.set("3,4", "another point");
    console.log(myMap.get("1,2")); // Output: "point"

    const mySet = new Set();
    mySet.add("1,2");
    mySet.add("1,2"); // Adding the same string key again has no effect
    console.log(mySet.has("1,2")); // Output: true
    console.log(mySet); // Output: Set(1) { '1,2' }
    ```

## Section 3: Functions and Scope

Functions make JavaScript code modular, reusable, and readable.

### Functions as First-Class Citizens

In JavaScript, functions are values—they can be assigned to variables, passed as arguments to other functions, or returned from them.

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}

const welcome = greet;
console.log(welcome("Alice")); // Output: Hello, Alice!

function applyFunc(func, value) {
    return func(value);
}

console.log(applyFunc(greet, "Bob")); // Output: Hello, Bob!
```

### Function Parameters

Default values simplify function calls:

```javascript
// Function with a default parameter
function power(base, exponent = 2) {
    // Raise base to the power of exponent.
    return base ** exponent;
}

console.log(power(3)); // Output: 9 (exponent defaults to 2)
console.log(power(3, 3)); // Output: 27
```

JavaScript does not have Python-style keyword arguments, but the common idiom is to pass a single **options object** and destructure it with defaults. This gives the same readability and lets callers pass arguments in any order and omit optional ones:

```javascript
// Register a user with given details, using an options object.
function register(name, { role = "User", department = "General" } = {}) {
    console.log(`${name} registered as ${role} in ${department}`);
}

register("Bob"); // Output: Bob registered as User in General
register("Alice", { department: "HR" }); // Output: Alice registered as User in HR
register("Charlie", { role: "Admin" }); // Output: Charlie registered as Admin in General
```

### Variable-Length Arguments: Rest Parameters

Functions can accept a flexible number of arguments using a **rest parameter** (`...args`), which gathers extra positional arguments into a real array:

```javascript
// ...args: gathers extra positional arguments into an array
function sumNumbers(...args) {
    // Return the sum of all provided numbers.
    console.log(Array.isArray(args)); // true — it's a genuine array
    return args.reduce((acc, n) => acc + n, 0);
}

console.log(sumNumbers(1, 2, 3)); // Output: 6
console.log(sumNumbers(10, 20, 30, 40)); // Output: 100
```

JavaScript has no direct equivalent of Python's `**kwargs`. The idiomatic way to accept an open-ended set of named values is to pass an object and iterate over its entries:

```javascript
// Accept arbitrary named values via a single object.
function userProfile(details) {
    console.log(typeof details); // 'object'
    for (const [key, value] of Object.entries(details)) {
        console.log(`${key}: ${value}`);
    }
}

userProfile({ name: "Alice", age: 30, city: "New York" });
// Output:
// name: Alice
// age: 30
// city: New York
```

### Type Annotations

JavaScript itself is dynamically typed and has no built-in type annotations. The ecosystem's answer is [TypeScript](https://www.typescriptlang.org/), a superset of JavaScript that adds optional static types. Annotations do not change runtime behavior (TypeScript compiles to plain JavaScript), but they are very useful for:

- Improving code readability and understanding.
- Enabling static analysis to catch type errors before runtime.
- Enhancing IDE autocompletion and suggestions.

For reference, the same function looks like this in TypeScript:

```typescript
function greetTyped(name: string): string {
    // Greets a person with their name.
    return `Hello, ${name}!`;
}

// This function expects 'name' to be a string and is declared to return a string.
console.log(greetTyped("World"));
```

In this book we use plain JavaScript, but the type intent is described in the surrounding prose.

### Arrow Functions

Arrow functions are a short syntax for writing functions, especially handy for small, anonymous functions passed to higher-order functions. A single-expression arrow returns that expression implicitly.

```javascript
const square = (x) => x ** 2;
console.log(square(4)); // Output: 16

// Useful with higher-order methods like map(), filter(), sort()
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map((n) => n ** 2);
console.log(squares); // Output: [ 1, 4, 9, 16, 25 ]

const evens = numbers.filter((n) => n % 2 === 0);
console.log(evens); // Output: [ 2, 4 ]
```

### Variable Scope

JavaScript determines a variable's scope (visibility) by where it is declared ([lexical scoping](https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scope)). Variables declared with `let` and `const` are **block-scoped**—they are visible only within the `{ ... }` block where they are declared.

* **Local (block) variables:** declared inside a function or block; accessible only there.

    ```javascript
    function example() {
        const localVar = "I'm local";
        console.log(localVar);
    }

    example();
    // console.log(localVar); // Would throw ReferenceError: localVar is not defined
    ```

* **Module/global variables:** declared at the top level; accessible throughout the module.

    ```javascript
    const globalVar = "I'm global";

    function accessGlobal() {
        console.log(globalVar); // Accessing globalVar
    }

    accessGlobal(); // Output: I'm global
    ```

    Unlike Python, JavaScript needs no special keyword to **modify** an outer variable from inside a function—closures capture the variable itself, so you can reassign it directly (as long as it was declared with `let`):

    ```javascript
    let counter = 0;

    function increment() {
        counter += 1; // Reassigns the enclosing 'counter'
    }

    increment();
    console.log(counter); // Output: 1
    increment();
    console.log(counter); // Output: 2
    ```

* **Nested-function scope (closures):** A nested function can read and modify variables from its enclosing function's scope directly—this is the essence of a closure. There is no `nonlocal` keyword; it just works.

    ```javascript
    function outer() {
        let count = 0; // Enclosing scope variable

        function inner() {
            count += 1; // Refers to the 'count' in the enclosing scope
            return count;
        }

        console.log(`Inner call 1 returns: ${inner()}`); // Output: Inner call 1 returns: 1
        console.log(`Inner call 2 returns: ${inner()}`); // Output: Inner call 2 returns: 2
        return count; // Returns the modified count from the outer function
    }

    console.log(`Outer function returns: ${outer()}`); // Output: Outer function returns: 2
    ```

## Section 4: Control Flow

This section covers the essentials of control flow, including conditional statements, loops, and control flow mechanisms.

### Conditional Statements: `if`, `else if`, `else`

- **Basic [`if` Statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)**: The `if` statement evaluates a condition, executing the subsequent block only if the condition is truthy.
    ```javascript
    const temperature = 30;
    if (temperature > 25) {
        console.log("It's a hot day");
    }
    ```

- **Branching with `else` and `else if`**: Extend the `if` statement with `else if` for multiple conditions, and `else` when no conditions are met.
    ```javascript
    const age = 20;
    if (age < 13) {
        console.log("You are a child.");
    } else if (age < 18) {
        console.log("You are a teenager.");
    } else {
        console.log("You are an adult."); // Output: You are an adult.
    }
    ```

- **Ternary Operator**: It allows for quick decisions in a single line. Syntax: `condition ? valueIfTrue : valueIfFalse`:
    ```javascript
    const age = 20;
    const status = age >= 18 ? "adult" : "minor";
    console.log(status); // Output: adult
    ```

- **Nested `if` Statements**: Nesting `if` statements allows for checking multiple levels of conditions. However, deep nesting can reduce code readability. Limit nesting where possible and consider refactoring deeply nested conditions using helper functions or different logic structures.
    ```javascript
    const age = 25;
    const hasLicense = true;
    if (age >= 18) {
        console.log("Adult.");
        if (hasLicense) {
            console.log("Can drive.");
        } else {
            console.log("Cannot drive yet (no license).");
        }
    } else {
        console.log("Minor.");
    }
    ```

### Loops: `for` and `while`

- **[`for`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) Loops**: The classic C-style `for` loop is ideal for executing a block a certain number of times. To iterate over the elements of an iterable (array, string, Set, Map), use `for...of`.

    ```javascript
    for (const char of "hello") {
        console.log(char);
    }
    // Output:
    // h
    // e
    // l
    // l
    // o

    // A counting for loop lets you control the start, stop, and step.
    for (let i = 0; i < 5; i++) { // Looping from i = 0 to i = 4
        process.stdout.write(i + " "); // Output: 0 1 2 3 4
    }
    console.log();

    for (let i = 2; i < 6; i++) { // Looping from i = 2 to i = 5
        process.stdout.write(i + " "); // Output: 2 3 4 5
    }
    console.log();

    for (let i = 5; i > 1; i--) { // Looping from i = 5 down to i = 2 (step is -1)
        process.stdout.write(i + " "); // Output: 5 4 3 2
    }
    console.log();
    ```

- **[`while`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) Loops**: A `while` loop continues to execute as long as the given condition is truthy. It's useful when the number of iterations isn't known before the loop starts.

    ```javascript
    let count = 0;
    while (count < 5) {
        process.stdout.write(count + " ");
        count += 1; // Crucial to update the condition variable to avoid an infinite loop
    }
    console.log(); // Output: 0 1 2 3 4
    ```

### Loop Control: `break` and `continue`

- **Using [`break`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break)**: The `break` statement immediately exits the innermost `for` or `while` loop, providing a way to terminate the loop prematurely.

    ```javascript
    for (let i = 0; i < 10; i++) {
        if (i === 5) {
            break; // Exit the loop when i is 5
        }
        process.stdout.write(i + " "); // Output: 0 1 2 3 4
    }
    console.log();
    ```

- **Using [`continue`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue)**: The `continue` statement skips the rest of the code inside the loop for the current iteration and proceeds to the next iteration, allowing for selective execution.

    ```javascript
    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) { // If i is even
            continue; // Skip even numbers
        }
        process.stdout.write(i + " "); // Output: 1 3 5 7 9
    }
    console.log();
    ```

### Assertions

JavaScript's `console.assert(condition, message)` is a debugging aid that tests a condition. If the condition is truthy, it does nothing. If the condition is falsy, it prints an assertion-failed message (with the optional message) to the console without stopping execution. For a hard failure that throws, you can write a small helper that throws an `Error`. Throughout this chapter we use a tiny `assert` helper:

```javascript
function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}

function divide(a, b) {
    assert(b !== 0, "Denominator cannot be zero");
    return a / b;
}

console.log(divide(10, 2)); // Output: 5
// divide(10, 0); // Throws Error: Denominator cannot be zero
```

## Section 5: Error Handling and Exceptions

Error handling is a critical aspect of writing robust and reliable JavaScript code. JavaScript provides a comprehensive mechanism for detecting, handling, and throwing exceptions to manage runtime errors gracefully.

### Understanding Exceptions

An exception is an event that occurs during program execution that disrupts the normal flow of instructions. When an error occurs, JavaScript throws an `Error` object (or a subclass) that contains information about the error (a `name`, a `message`, and a `stack` trace). If an exception is not caught, the program terminates.

#### Common Built-in Error Types

JavaScript has several [built-in error types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) for different kinds of failures. Note that JavaScript is far more permissive than Python: many operations that would raise in Python instead produce `NaN` or `undefined` here, so exceptions are thrown in fewer situations.

```javascript
// TypeError: an operation was performed on a value of an inappropriate type.
try {
    null.foo; // Reading a property of null
} catch (e) {
    console.log(`${e.name}: ${e.message}`); // Output: TypeError: Cannot read properties of null (reading 'foo')
}

// RangeError: a value is outside the allowed range.
try {
    const arr = new Array(-1); // Invalid array length
} catch (e) {
    console.log(`${e.name}: ${e.message}`); // Output: RangeError: Invalid array length
}

// Division by zero does NOT throw in JavaScript — it yields Infinity.
console.log(10 / 0); // Output: Infinity

// Out-of-range array access does NOT throw — it yields undefined.
const myArr = [1, 2, 3];
console.log(myArr[5]); // Output: undefined

// Accessing a missing object key does NOT throw — it yields undefined.
const myObj = { a: 1, b: 2 };
console.log(myObj.c); // Output: undefined

// SyntaxError / others can be thrown by APIs like JSON.parse:
try {
    JSON.parse("not json");
} catch (e) {
    console.log(`${e.name}: ${e.message}`); // Output: SyntaxError: Unexpected token ...
}
```

### Basic Exception Handling

The `try`/`catch` block allows you to catch and handle exceptions, preventing your program from crashing. JavaScript has a single `catch` clause that receives whatever was thrown, so you branch inside it (for example, by checking the error's type with `instanceof`) to handle different errors differently.

```javascript
function parseAndDivide(input) {
    try {
        const x = Number(input);
        if (Number.isNaN(x)) {
            throw new TypeError("Invalid input. Please enter a valid number.");
        }
        if (x === 0) {
            throw new RangeError("Cannot divide by zero!");
        }
        const result = 10 / x;
        console.log(`10 / ${x} = ${result}`);
    } catch (e) {
        // Branch on the error type to handle each case differently
        if (e instanceof TypeError) {
            console.log(e.message);
        } else if (e instanceof RangeError) {
            console.log(e.message);
        } else {
            throw e; // Re-throw anything we didn't expect
        }
    }
}

parseAndDivide("abc"); // Output: Invalid input. Please enter a valid number.
parseAndDivide("0"); // Output: Cannot divide by zero!
parseAndDivide("2"); // Output: 10 / 2 = 5
```

### The `finally` Clause

JavaScript has no `else` clause on `try` (code that should run only when no error occurred simply goes at the end of the `try` block). It does have `finally`:

- Code at the end of the `try` block runs only if no earlier statement threw.
- `finally`: The `finally` block, if present, is always executed before leaving the `try` statement, whether an exception has occurred or not. This is useful for cleanup actions (e.g., releasing resources).

```javascript
function divideTen(input) {
    try {
        const x = Number(input);
        if (Number.isNaN(x)) {
            throw new TypeError("Invalid input: Not a valid number.");
        }
        if (x === 0) {
            throw new RangeError("Cannot divide by zero!");
        }
        const result = 10 / x;
        // This runs only if no exception occurred above
        console.log(`Division successful! 10 / ${x} = ${result}`);
    } catch (e) {
        console.log(e.message);
    } finally {
        // This always runs, regardless of exceptions
        console.log("Execution of the try-catch-finally block is complete.");
    }
}

divideTen("5");
```

### "Check First" vs. "Try and Catch"

Just as Python weighs LBYL ("Look Before You Leap") against EAFP ("Easier to Ask for Forgiveness than Permission"), JavaScript offers the same two styles.

- **Check first (LBYL):** You explicitly check conditions before an operation.
    ```javascript
    // Check-first example
    const myObj = { key: "value" };
    if ("key" in myObj) { // Look before you leap
        console.log(myObj.key);
    } else {
        console.log("Key not found");
    }
    ```
- **Try and catch:** You assume the operation will work and handle exceptions if it doesn't.
    ```javascript
    // Try-and-catch example
    const data = '{"key": "value"}';
    try {
        const parsed = JSON.parse(data); // Assume it's valid JSON
        console.log(parsed.key);
    } catch (e) {
        console.log("Invalid data");
    }
    ```

In JavaScript, because missing properties and out-of-range indexes return `undefined` instead of throwing, the "check first" style (often expressed with optional chaining `?.` and nullish coalescing `??`) is very common and reads cleanly. Reserve `try`/`catch` for operations that genuinely throw, such as `JSON.parse`, network calls, or explicit validation.

### Throwing Exceptions

You can throw exceptions manually using the `throw` keyword. This is useful when you detect an error condition in your code or want to re-throw an exception.

```javascript
function validateAge(age) {
    if (typeof age !== "number" || !Number.isInteger(age)) {
        throw new TypeError("Age must be an integer.");
    }
    if (age < 0) {
        throw new RangeError("Age cannot be negative.");
    }
    console.log(`Age ${age} is valid.`);
    return age;
}

try {
    // validateAge("twenty"); // Throws TypeError
    validateAge(-5); // Throws RangeError
} catch (e) {
    if (e instanceof RangeError) {
        console.log(`Caught RangeError: ${e.message}`);
    } else if (e instanceof TypeError) {
        console.log(`Caught TypeError: ${e.message}`);
    }
}

// Example of re-throwing an exception
try {
    const num = Number("text");
    if (Number.isNaN(num)) {
        throw new Error("Not a number");
    }
} catch (e) {
    console.log(`Logging error: ${e.message}`);
    throw e; // Re-throws the original error
}
```

## Section 6: Built-in Helpers

JavaScript comes with many built-in functions and array/object methods that simplify tasks, enhance readability, and boost efficiency, making them especially useful for coding interviews. This section explores several key helpers. Where Python has standalone built-ins like `any`, `all`, and `sum`, JavaScript typically expresses the same ideas as **array methods** (`some`, `every`, `reduce`, etc.).

- **[`Array.prototype.some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)** (like Python's `any`): Returns `true` if at least one element satisfies the predicate. To mimic Python's `any(iterable)` (truthiness check), pass `Boolean` as the predicate. On an empty array it returns `false`.
    ```javascript
    const values = [0, false, "", null, 5];
    console.log(values.some(Boolean)); // Output: true, because 5 is truthy
    console.log([].some(Boolean)); // Output: false
    ```

- **[`Array.prototype.every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)** (like Python's `all`): Returns `true` only if every element satisfies the predicate. It's ideal for validating a set of conditions. On an empty array it returns `true`.
    ```javascript
    const flags1 = [true, true, false];
    console.log(flags1.every(Boolean)); // Output: false, due to one falsy value
    const flags2 = [true, "hello", 1];
    console.log(flags2.every(Boolean)); // Output: true
    console.log([].every(Boolean)); // Output: true
    ```

- **`divmod` equivalent**: JavaScript has no `divmod`, but you can compute the quotient and remainder together. Note that `%` in JavaScript is the *remainder* operator; for non-negative operands it matches Python's modulo.
    ```javascript
    function divmod(a, b) {
        return [Math.floor(a / b), a % b];
    }
    const [quotient, remainder] = divmod(10, 3);
    console.log(`Quotient: ${quotient}`); // Output: Quotient: 3
    console.log(`Remainder: ${remainder}`); // Output: Remainder: 1
    console.log(divmod(10.5, 3)); // Output: [ 3, 1.5 ]
    ```

- **Exponentiation and modular power**: Use the `**` operator (or [`Math.pow`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow)) to raise a number to a power. JavaScript has no built-in three-argument modular exponentiation, so here is a compact, efficient implementation (fast exponentiation) that stays exact for large exponents by using `BigInt`.
    ```javascript
    console.log(2 ** 10); // 2 to the power of 10: 1024
    console.log(Math.pow(2, 10)); // Same using Math.pow: 1024

    function modPow(base, exp, mod) {
        base = BigInt(base) % BigInt(mod);
        exp = BigInt(exp);
        mod = BigInt(mod);
        let result = 1n;
        while (exp > 0n) {
            if (exp & 1n) result = (result * base) % mod;
            base = (base * base) % mod;
            exp >>= 1n;
        }
        return result;
    }
    console.log(modPow(2, 10, 1000)); // (2^10) % 1000: 24n
    ```

- **[`Math.min`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min) and [`Math.max`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max)**: These functions find the smallest and largest of their numeric arguments. To use them on an array, spread it. They can be incredibly handy for problems that require you to find extreme values.
    ```javascript
    const numbers = [10, 20, 30, 40, 5];
    console.log(Math.min(...numbers)); // Output: 5
    console.log(Math.max(...numbers)); // Output: 40
    console.log(Math.min(10, 2, 100)); // Output: 2
    ```
  For "min/max by a key," combine `reduce` with a comparison, or map to the key first:
    ```javascript
    const names = ["Alice", "Bob", "Charlie", "Al"]; // Bob (3), Al (2), Alice (5), Charlie (7)
    const shortest = names.reduce((a, b) => (b.length < a.length ? b : a));
    const longest = names.reduce((a, b) => (b.length > a.length ? b : a));
    console.log(shortest); // Output: Al (shortest name)
    console.log(longest); // Output: Charlie (longest name)
    ```
  **Handling empty arrays**: `Math.max()` with no arguments returns `-Infinity` and `Math.min()` returns `Infinity` (it never throws). If you want an explicit fallback for an empty array, check the length first:
    ```javascript
    const emptyNumbers = [];
    console.log(Math.max(...emptyNumbers)); // Output: -Infinity

    // To supply a fallback value:
    const safeMax = emptyNumbers.length ? Math.max(...emptyNumbers) : "No numbers";
    console.log(safeMax); // Output: No numbers
    const safeMin = emptyNumbers.length ? Math.min(...emptyNumbers) : -1;
    console.log(safeMin); // Output: -1
    ```
    Providing a fallback ensures your code handles empty arrays gracefully and avoids surprising `Infinity` results, especially with dynamic or user-driven inputs.

- **[`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)** (like Python's `sum`): Folds an array into a single value. To sum an array, add elements starting from an initial value.

    ```javascript
    console.log([1, 2, 3, 4].reduce((acc, n) => acc + n, 0)); // Output: 10
    console.log([1, 2, 3, 4].reduce((acc, n) => acc + n, 10)); // Output: 20 (10 + 1+2+3+4)
    ```

- **`zip` equivalent**: JavaScript has no built-in `zip`. To combine multiple arrays element-wise, index into them up to the length of the shortest. Here is a small helper.

    ```javascript
    function zip(...arrays) {
        const minLen = Math.min(...arrays.map((a) => a.length));
        const result = [];
        for (let i = 0; i < minLen; i++) {
            result.push(arrays.map((a) => a[i]));
        }
        return result;
    }

    const names = ["Alice", "Bob", "Charlie"];
    const ages = [30, 25, 35];
    const cities = ["New York", "London"]; // Shorter array
    for (const [name, age] of zip(names, ages)) {
        console.log(`${name} is ${age} years old.`);
    }
    // Output:
    // Alice is 30 years old.
    // Bob is 25 years old.
    // Charlie is 35 years old.

    for (const [name, age, city] of zip(names, ages, cities)) { // Stops when 'cities' is exhausted
        console.log(`${name} (${age}) lives in ${city}.`);
    }
    // Output:
    // Alice (30) lives in New York.
    // Bob (25) lives in London.
    ```

- **[`Math.abs`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs)**: Returns the absolute value of a number.
    ```javascript
    console.log(Math.abs(-5)); // Output: 5
    console.log(Math.abs(5.5)); // Output: 5.5
    ```

- **[`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)**: Applies a given function to each item of an array and returns a new array.
    ```javascript
    const numbers = ["1", "2", "3", "4"];
    // Convert an array of strings to an array of numbers
    const intNumbers = numbers.map(Number);
    console.log(intNumbers); // Output: [ 1, 2, 3, 4 ]

    function square(n) {
        return n * n;
    }
    const nums = [1, 2, 3];
    const squaredNums = nums.map(square);
    console.log(squaredNums); // Output: [ 1, 4, 9 ]
    ```

## Section 7: Solved Problems

### Problem 1: [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture)

**Problem Statement:** Determine the number of steps it takes for a given natural number to reach 1 by repeatedly applying the following transformations: if the number is even, divide it by 2; if it's odd, multiply by 3 and add 1.

**Example 1**:

* **Input:** x = 3
* **Output:** 7 (Sequence: 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1)

**Example 2**:

* **Input:** x = 7
* **Output:** 16 (Sequence: 7 → 22 → 11 → 34 → 17 → 52 → 26 → 13 → 40 → 20 → 10 → 5 → 16 → 8 → 4 → 2 → 1)

**Solution:**

```javascript
function collatz(x) {
    let steps = 0;
    while (x !== 1) {
        x = x % 2 === 0 ? Math.floor(x / 2) : 3 * x + 1;
        steps += 1;
    }
    return steps;
}

console.assert(collatz(3) === 7);
console.assert(collatz(7) === 16);
console.assert(collatz(13) === 9);
console.assert(collatz(20) === 7);
```

### Problem 2: [Prime Number](https://en.wikipedia.org/wiki/Prime_number) Checker

**Problem Statement:** Create a function that determines if a number is prime. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

**Solution:**

```javascript
function isPrime(num) {
    if (num <= 1) {
        return false;
    }
    for (let i = 2; i <= Math.floor(num ** 0.5); i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}
```

We can simplify `isPrime(num)` using [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) with [`every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every):

```javascript
function isPrime(num) {
    const limit = Math.floor(num ** 0.5);
    return (
        num > 1 &&
        Array.from({ length: limit - 1 }, (_, k) => k + 2).every((i) => num % i !== 0)
    );
}
```

### Problem 3: [Fibonacci Number](https://en.wikipedia.org/wiki/Fibonacci_sequence)

**Problem Statement:** Implement a function that returns the n-th (1-based index) Fibonacci number. The Fibonacci sequence starts with 1, 1, 2, 3, 5, 8, ...

**Solution:**

```javascript
function fibonacci(n) {
    let fib1 = 1;
    let fib2 = 1;
    for (let i = 3; i <= n; i++) {
        [fib1, fib2] = [fib2, fib1 + fib2];
    }
    return fib2;
}

console.assert(fibonacci(5) === 5);
console.assert(fibonacci(8) === 21);
```

### Problem 4: Find Specific Integer

**Problem Statement:** Find a five-digit integer `N` such that if `N = abcde` (where `a,b,c,d,e` are its digits), then:

- `a = N % 2`
- `b = N % 3`
- `c = N % 4`
- `d = N % 5`
- `e = N % 6`

**Solution:**

```javascript
function findSpecificInteger() {
    for (let n = 10000; n < 100000; n++) { // Iterate through all five-digit integers
        const [a, b, c, d, e] = String(n);
        if (
            [
                n % 2 === Number(a),
                n % 3 === Number(b),
                n % 4 === Number(c),
                n % 5 === Number(d),
                n % 6 === Number(e),
            ].every(Boolean)
        ) {
            return n;
        }
    }
    return null; // Should not be reached if the problem guarantees a solution
}

console.assert(findSpecificInteger() === 11311);
```

### Problem 5: [Three Consecutive Odds](https://leetcode.com/problems/three-consecutive-odds/)

**Problem Statement:** Given an array of integers, determine whether it contains at least three odd numbers consecutively.

**Solution 1: Iterative Counting**

```javascript
function threeConsecutiveOdds(arr) {
    if (arr.length < 3) {
        return false;
    }

    let consecutiveOddsCount = 0;
    for (const num of arr) {
        if (num % 2 !== 0) { // num is odd
            consecutiveOddsCount += 1;
            if (consecutiveOddsCount === 3) {
                return true;
            }
        } else { // num is even
            consecutiveOddsCount = 0; // Reset count
        }
    }
    return false;
}
```

**Solution 2: Bitwise Operation**

```javascript
function threeConsecutiveOdds(arr) {
    for (let i = 1; i < arr.length - 1; i++) {
        if (arr[i - 1] & arr[i] & arr[i + 1] & 1) {
            return true;
        }
    }
    return false;
}
```

**Explanation:** The expression `arr[i-1] & arr[i] & arr[i+1] & 1` hinges on the fact that an integer is odd if and only if its least significant bit (LSB) is 1.

### Problem 6: [Add Digits](https://leetcode.com/problems/add-digits/)

**Problem Statement:** The digital root is the single-digit value obtained by recursively summing the digits of a non-negative number until a single digit is reached. Create a function that calculates the digital root of a non-negative number.

**Solution 1: Iterative Summation**
```javascript
function addDigits(num) {
    while (num >= 10) {
        let digitSum = 0;
        while (num > 0) {
            const digit = num % 10;
            num = Math.floor(num / 10);
            digitSum += digit;
        }
        num = digitSum;
    }
    return num;
}
```

**Solution 2: Congruence Formula**

The digital root of a positive integer `n` can be calculated as:

- `0` if `n = 0`
- `9` if `n % 9 === 0` (and `n !== 0`)
- `n % 9` if `n % 9 !== 0`

This can be simplified to `1 + (n - 1) % 9` for `n > 0`.

```javascript
function addDigits(num) {
    return num > 0 ? 1 + ((num - 1) % 9) : 0;
}
```

### Problem 7: [Add Strings](https://leetcode.com/problems/add-strings/)

**Problem Statement:** Implement a function to add two numbers represented as strings.

**Solution:**
```javascript
function addStrings(num1, num2) {
    let i = num1.length - 1;
    let j = num2.length - 1;
    let carry = 0;
    const res = [];
    while (i >= 0 || j >= 0 || carry > 0) {
        const x = i >= 0 ? Number(num1[i]) : 0;
        const y = j >= 0 ? Number(num2[j]) : 0;
        const sum = x + y + carry;
        carry = Math.floor(sum / 10);
        res.push(String(sum % 10));
        i -= 1;
        j -= 1;
    }
    res.reverse();
    return res.join("");
}
```

### Problem 8: [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

**Problem Statement:** Given an integer array `nums`, return `true` if any value appears at least twice in the array, and `false` if every element is distinct.

**Solution 1: Using a Set for Tracking Seen Elements**

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

**Solution 2: Comparing Lengths**
```javascript
function containsDuplicate(nums) {
    return nums.length !== new Set(nums).size;
}
```

### Problem 9: [Valid Anagram](https://leetcode.com/problems/valid-anagram/)

**Problem Statement:** Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An [anagram](https://en.wikipedia.org/wiki/Anagram) is a word formed by rearranging the letters of another word using all the original letters exactly once.

**Solution 1: Two Maps**
```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const sCounts = new Map();
    const tCounts = new Map();

    for (const charS of s) {
        sCounts.set(charS, (sCounts.get(charS) ?? 0) + 1);
    }

    for (const charT of t) {
        tCounts.set(charT, (tCounts.get(charT) ?? 0) + 1);
    }

    // Compare two maps by size and entries
    if (sCounts.size !== tCounts.size) {
        return false;
    }
    for (const [char, count] of sCounts) {
        if (tCounts.get(char) !== count) {
            return false;
        }
    }
    return true;
}
```

**Solution 2: One Map**

```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const counts = new Map();
    for (const charS of s) {
        counts.set(charS, (counts.get(charS) ?? 0) + 1);
    }

    for (const charT of t) {
        if (!counts.has(charT)) {
            return false;
        }
        counts.set(charT, counts.get(charT) - 1);
        if (counts.get(charT) < 0) { // More occurrences in t than in s
            return false;
        }
    }

    return true;
}
```

### Problem 10: Score Parser

**Problem Statement:** You are given an array of strings, where each string is supposed to represent a player's score in the format `"PlayerName:Score"` (e.g., `"Alice:100"`). Write a function `parseScores` that takes this array and returns a `Map` from player names to their integer scores.
However, some strings might be malformed:

- They might not contain a colon.
- The part after the colon might not be a valid integer.

If a string is malformed in any of these ways, your function should ignore that string and continue processing the rest.

**Solution:**
```javascript
function parseScores(scoreStrings) {
    const playerScores = new Map();
    for (const entry of scoreStrings) {
        const parts = entry.split(":");
        // Malformed if it doesn't split into exactly a name and a score
        if (parts.length !== 2) {
            continue;
        }
        const [name, score] = parts;
        // Malformed if the score is not a valid, trimmed integer
        if (score.trim() === "" || !/^\d+$/.test(score.trim())) {
            continue;
        }
        playerScores.set(name, Number(score.trim()));
    }
    return playerScores;
}

const scoreData = [
    "Alice:100", "Bob:85", "Charlie:N/A",
    "David: 92", "Eve:", ":Mallory:70", "Frank:",
];
const result = parseScores(scoreData);
console.assert(result.size === 3);
console.assert(result.get("Alice") === 100);
console.assert(result.get("Bob") === 85);
console.assert(result.get("David") === 92);
```

> Note: unlike Python's `int(score)`, which rejects the surrounding whitespace in `"David: 92"` unless trimmed, `Number(" 92")` accepts it. We trim and validate with a regular expression so that only well-formed integers are kept, matching the intended behavior (`Alice`, `Bob`, and `David` are valid).

### Problem 11: Process User Commands
**Problem Statement:** Write a function `processCommands(commands)` that simulates processing an array of user commands.

- Each command is a string.
- If a command is `"EXIT"`, the function should immediately stop processing and return an array of all "VALID" commands processed before "EXIT".
- If a command is `"SKIP"`, the function should ignore this command and move to the next one.
- Any other command is considered "VALID".
- The function should also return the total count of "VALID" commands processed.

Return a pair: `[arrayOfValidCommandsBeforeExit, countOfValidCommands]`.

**Solution**

```javascript
function processCommands(commands) {
    const validCommandsProcessed = [];
    let validCommandCount = 0;

    for (const cmd of commands) {
        if (cmd === "EXIT") {
            break;
        } else if (cmd === "SKIP") {
            continue;
        } else {
            validCommandsProcessed.push(cmd);
            validCommandCount += 1;
        }
    }

    return [validCommandsProcessed, validCommandCount];
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

let [cmds, count] = processCommands(["LOGIN", "SKIP", "SAVE", "EXIT", "LOGOUT"]);
console.assert(arraysEqual(cmds, ["LOGIN", "SAVE"]) && count === 2);
[cmds, count] = processCommands(["EXIT", "LOGIN"]);
console.assert(arraysEqual(cmds, []) && count === 0);
[cmds, count] = processCommands(["SKIP", "SKIP", "SKIP"]);
console.assert(arraysEqual(cmds, []) && count === 0);
```

## Section 8: Exercises

### Problem 1: [Distribute Candies Among Children](https://leetcode.com/problems/distribute-candies-among-children-i/)

**Problem Statement:** There are `n` identical candies and three distinct children. Count the number of ways to give each child a non‐negative number of candies so that the total is exactly `n` and no child receives more than `limit` candies.

**Solution**

```javascript
function distributeCandies(n, limit) {
    // 1) If total exceeds what three children can hold, no valid way
    if (n > 3 * limit) {
        return 0;
    }

    let count = 0;
    // 2) Try every possible amount for child A: 0 to min(n, limit)
    for (let a = 0; a <= Math.min(n, limit); a++) {
        // 3) For each a, try every possible for child B: 0 to min(n - a, limit)
        for (let b = 0; b <= Math.min(n - a, limit); b++) {
            // 4) Child C gets whatever remains
            const c = n - a - b;
            // 5) If C is within the limit, we've found a valid distribution
            if (c <= limit) {
                count += 1;
            }
        }
    }

    // 6) Return the total number of valid ways
    return count;
}
```

### Problem 2: Find N-th Element

**Problem Statement:** Write a function to find the n-th element of the sequence where each integer `m` appears `m` times, e.g., 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ...

**Solution:**

```javascript
function findNthElement(n) {
    let m = 1;
    while (n > m) {
        n -= m;
        m += 1;
    }
    return m;
}
```

### Problem 3: [Add Binary](https://leetcode.com/problems/add-binary/)

**Problem Statement:** Implement a function that adds two binary strings and returns their sum as a binary string.

**Solution:**
```javascript
function addBinary(a, b) {
    let i = a.length - 1;
    let j = b.length - 1;
    let carry = 0;
    const res = [];
    while (i >= 0 || j >= 0) {
        const aBit = i >= 0 ? Number(a[i]) : 0;
        const bBit = j >= 0 ? Number(b[j]) : 0;
        const sum = carry + aBit + bBit;
        carry = Math.floor(sum / 2);
        res.push(String(sum % 2));
        i -= 1;
        j -= 1;
    }
    if (carry) {
        res.push(String(carry));
    }
    res.reverse();
    return res.join("");
}

console.assert(addBinary("11", "1") === "100");
console.assert(addBinary("1010", "1011") === "10101");
```

### Problem 4: [Maximum Height of a Triangle](https://leetcode.com/problems/maximum-height-of-a-triangle/description/)

**Problem Statement:** You are given `red` and `blue` blocks. You want to build the tallest possible triangle. The triangle must have a top row of 1 block, and each subsequent row must have one more block than the row above it. The colors of adjacent rows must be different. Determine the maximum height achievable.

**Solution:**
```javascript
function maxHeight(red, blue) {
    return Math.max(getHeight(red, blue), getHeight(blue, red));
}

function getHeight(x, y) {
    let height = 0;
    while (x >= 0 && y >= 0) {
        height += 1;
        if (height % 2) {
            x -= height;
        } else {
            y -= height;
        }
    }
    return height - 1;
}
```

### Problem 5: Balanced Halves

**Problem Statement:** Given a non-negative integer `x`, implement a function which returns `true` if and only if `x` has an **even** length and the sum of its first half equals the sum of its second half.

**Solution**

```javascript
function isBalanced(x) {
    // 1) Count total digits
    let length = 0;
    let temp = x;
    while (temp) {
        length += 1;
        temp = Math.floor(temp / 10);
    }

    // 2) Must be even-length
    if (length % 2 !== 0) {
        return false;
    }

    const half = Math.floor(length / 2);
    let sumLast = 0; // sum of least-significant half
    let sumFirst = 0; // sum of most-significant half
    temp = x;

    // 3) Peel off digits one by one
    for (let i = 0; i < length; i++) {
        const digit = temp % 10;
        temp = Math.floor(temp / 10);
        if (i < half) {
            sumLast += digit;
        } else {
            sumFirst += digit;
        }
    }

    // 4) Compare
    return sumFirst === sumLast;
}

console.assert(isBalanced(123330) === true);
console.assert(isBalanced(123421) === false);
console.assert(isBalanced(0) === false);
console.assert(isBalanced(10) === false);
console.assert(isBalanced(51624) === false);
```

### Problem 6: [Number of Days Between Two Days](https://leetcode.com/problems/number-of-days-between-two-dates/description/)

**Problem Statement**: Given two dates `date1` and `date2`, each in the format `"YYYY-MM-DD"`, compute the absolute number of days between them.

**Solution**:

```javascript
function isLeapYear(year) {
    // Return true if `year` is a Gregorian leap year.
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function monthLength(year, month) {
    // Return the number of days in the given month of `year`.
    if (month === 2) {
        return isLeapYear(year) ? 29 : 28;
    }
    // April, June, Sept, Nov have 30 days; the rest have 31
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function daysSince1971(year, month, day) {
    // Count days from 1971-01-01 up to (including) the given date.
    let days = 0;
    // full years
    for (let y = 1971; y < year; y++) {
        days += 365 + (isLeapYear(y) ? 1 : 0);
    }
    // full months this year
    for (let m = 1; m < month; m++) {
        days += monthLength(year, m);
    }
    // days in final month
    days += day;
    return days;
}

function daysBetweenDatesManual(date1, date2) {
    // Return the absolute number of days between date1 and date2,
    // each in 'YYYY-MM-DD' format.
    const [y1, m1, d1] = date1.split("-").map(Number);
    const [y2, m2, d2] = date2.split("-").map(Number);
    const ds1 = daysSince1971(y1, m1, d1);
    const ds2 = daysSince1971(y2, m2, d2);
    return Math.abs(ds2 - ds1);
}
```

### Problem 7: Validate Credit Card
The Luhn algorithm is a checksum formula used to validate credit card numbers.

The checksum of `ccNo`, a credit card number represented as a string, is computed as follows:

1. Reverse the order of the digits in `ccNo` and name it `ccNoReversed`.
2. Add up `ccNoReversed[0]`, `ccNoReversed[2]`, ... and every other even index digit to form the partial sum `s1`
3. Taking `ccNoReversed[1]`, `ccNoReversed[3]`, ... and every other odd index digit:

* Multiply each digit by 2. If doubling a digit results in a two digit number, add those digits together to produce a single digit number
* Sum the partial sums of the even digits to form `s2`

The checksum is `s1 + s2`. The Luhn algorithm determines `ccNo` is valid when the checksum ends in zero.

**Example**

    If the credit card number is 49927398716:

    1. Reverse the digits: 61789372994
    2. Sum the even index digits: s1 = 6 + 7 + 9 + 7 + 9 + 4 = 42
    3. The odd index digits: 1,  8,  3,  2,  9
      * Multiply each of them by 2: 2, 16,  6,  4, 18
      * Sum the digits of each multiplication: 2,  7,  6,  4,  9
      * s2 = 2 + 7 + 6 + 4 + 9 = 28

    The checksum is s1 + s2 = 70 which ends in zero. So, 49927398716 is valid.

Your task is to implement the Luhn algorithm.

```javascript
function isValidCc(ccNo) {
    // Your code here.
}
```

#### Solution

```javascript
function luhnChecksum(digits) {
    digits.reverse();
    let checksum = 0;
    for (const [i, digit] of digits.entries()) {
        if (i % 2 === 0) {
            checksum += Number(digit);
        } else {
            const doubled = Number(digit) * 2;
            checksum += doubled < 10 ? doubled : doubled - 9;
        }
    }
    return checksum;
}

function isValidCc(ccNo) {
    return luhnChecksum([...ccNo]) % 10 === 0;
}
```


### Problem 8: [Multiply Strings](https://leetcode.com/problems/multiply-strings/)

Given two non-negative integers `num1` and `num2` represented as strings, return the product of `num1` and `num2` represented as a string without using any library or converting the inputs to integers directly.

#### Solution

```javascript
function multiply(num1, num2) {
    if (num1 === "0" || num2 === "0") {
        return "0";
    }
    let res = "0";
    for (let i = num2.length - 1; i >= 0; i--) {
        const operand =
            singleDigitMultiply(num1, num2[i]) + "0".repeat(num2.length - i - 1);
        res = addStrings(res, operand);
    }
    return res;
}

function singleDigitMultiply(num, digit) {
    const d = Number(digit);
    let carry = 0;
    const res = [];
    for (let k = num.length - 1; k >= 0; k--) {
        const product = Number(num[k]) * d + carry;
        carry = Math.floor(product / 10);
        res.push(String(product % 10));
    }
    if (carry > 0) {
        res.push(String(carry));
    }
    res.reverse();
    return res.join("");
}

function addStrings(num1, num2) {
    let i = num1.length - 1;
    let j = num2.length - 1;
    let carry = 0;
    const res = [];
    while (i >= 0 || j >= 0 || carry > 0) {
        const x = i >= 0 ? Number(num1[i]) : 0;
        const y = j >= 0 ? Number(num2[j]) : 0;
        const sum = x + y + carry;
        carry = Math.floor(sum / 10);
        res.push(String(sum % 10));
        i -= 1;
        j -= 1;
    }
    res.reverse();
    return res.join("");
}
```
</content>
</invoke>
