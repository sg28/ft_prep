# JavaScript Arrow Functions

Arrow functions (`=>`) are a shorter syntax for writing functions, introduced in ES6. Beyond syntax, they behave differently from regular functions in a few important ways — most notably, they don't have their own `this`.

## Syntax

```js
// Regular function
function add(a, b) { return a + b; }

// Arrow function equivalent
const add = (a, b) => { return a + b; };

// Single parameter — parens optional
const square = x => x * x;

// No parameters — parens required
const greet = () => console.log("Hello!");

// Multiple parameters — parens required
const sum = (a, b, c) => a + b + c;
```

## Implicit vs Explicit Return

**Implicit return** (concise body, no braces) — the expression's value is returned automatically:

```js
const double = x => x * 2;
double(5) → 10
```

**Explicit return** (block body, with braces) — you must use `return`, otherwise the function returns `undefined`:

```js
const double = x => { return x * 2; };
double(5) → 10

const broken = x => { x * 2; }; // no return
broken(5) → undefined
```

**Returning an object literal from an implicit return** needs parentheses, otherwise `{}` is parsed as a block body, not an object:

```js
const makeUser = name => ({ name: name });
makeUser("Alice") → { name: "Alice" }
```

## Lexical `this` (the big difference)

Arrow functions do **not** have their own `this`. They capture `this` from the enclosing lexical scope at the time they're defined — they never rebind it, no matter how they're called.

```js
const obj = {
    name: "Alice",
    regularMethod: function () {
        console.log(this.name); // "Alice" — this = obj, set by how it's called
    },
    arrowMethod: () => {
        console.log(this.name); // undefined — this = enclosing scope, NOT obj
    }
};
obj.regularMethod(); // "Alice"
obj.arrowMethod();   // undefined
```

This is why arrow functions are a common fix for the classic "`this` is lost in a callback" problem:

```js
const obj2 = {
    name: "Bob",
    delayedGreet: function () {
        // Regular function inside would lose `this` when called by setTimeout
        setTimeout(() => {
            console.log(this.name); // "Bob" — arrow inherits this from delayedGreet
        }, 0);
    }
};
obj2.delayedGreet(); // "Bob"
```

**Rule of thumb:** use a regular `function` for object methods (so `this` refers to the object at call time); use an arrow function for callbacks nested inside a method (so `this` stays bound to the object).

## No Own `arguments` Object

Arrow functions don't have their own `arguments` — they see the `arguments` of the nearest enclosing regular function.

```js
function outer() {
    const inner = () => console.log(arguments.length); // uses outer's arguments
    inner();
}
outer(1, 2, 3); // 3
```

Use rest parameters (`...args`) instead if an arrow function needs its own list of arguments:

```js
const sum = (...args) => args.reduce((a, b) => a + b, 0);
sum(1, 2, 3) → 6
```

## Cannot Be Used as Constructors

Arrow functions have no internal `[[Construct]]` behavior and no `prototype` property, so `new` throws:

```js
const Foo = () => {};
new Foo(); // TypeError: Foo is not a constructor
console.log(Foo.prototype); // undefined

function Bar() {}
console.log(typeof Bar.prototype); // "object"
```

## `call()`, `apply()`, `bind()` Don't Change `this`

Since arrow functions don't have their own `this` to rebind, these methods have no effect on it:

```js
const arrowThis = () => this;
const bound = arrowThis.bind({ name: "forced" });
bound() === arrowThis() // true — binding did nothing, this is unchanged
```

## Key Points

- **Concise syntax**: no `function` keyword, optional parens for a single param, implicit return for single expressions
- **Lexical `this`**: inherits `this` from the enclosing scope, never its own — doesn't change based on how it's called
- **No own `arguments`**: use rest parameters (`...args`) instead
- **Not constructible**: no `prototype`, throws with `new`
- **`call`/`apply`/`bind` don't affect `this`** on an arrow function
- Best for: callbacks, array method callbacks (`map`, `filter`, etc.), anything needing the surrounding `this`
- Avoid for: object methods, prototype methods, generator functions (arrow functions can't be generators — no `function*` equivalent)
