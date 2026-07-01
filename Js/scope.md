# JavaScript Scope

Scope determines where a variable is accessible in your code. JavaScript has **four** types of scope: Global, Module, Function, and Block. (Lexical scope isn't a fifth type — it's the underlying rule that governs all of them: visibility is based on where code is *written*, not where it's *called from*. See [lexical scope](this_keyword.md) for how this same rule shapes `this` in arrow functions.)

## 1. Global Scope

Declared outside any function, block, or module — accessible from anywhere in the program.

```js
const globalVar = "accessible everywhere";

function readIt() {
    console.log(globalVar); // works — global scope is visible everywhere
}
readIt();
```

In non-strict mode, assigning to an undeclared variable (no `var`/`let`/`const`) also creates a global implicitly:

```js
function leaky() {
    accidental = "oops, now global"; // no declaration keyword
}
leaky();
console.log(accidental); // "oops, now global" — leaked onto the global object
```

## 2. Module Scope

Each file (in a CommonJS module or an ES module) has its own top-level scope — top-level declarations do **not** become global, even `var`.

```js
// modA.js
var moduleVar = "hello from modA";
console.log(typeof globalThis.moduleVar); // "undefined" — did not leak to global

// modB.js
require('./modA.js');
console.log(typeof moduleVar); // "undefined" — modB can't see modA's top-level variable either
```

This is why you don't see naming collisions across files even though many of them might declare a variable with the same name at the top level.

## 3. Function Scope

`var` is scoped to the nearest enclosing **function**, ignoring any blocks (`if`, `for`, `while`, etc.) inside it.

```js
function fnScope() {
    var v = "function scoped";
    if (true) {
        var v2 = "still function scoped"; // var ignores the if-block
    }
    console.log(v, v2); // both accessible — "function scoped" "still function scoped"
}
fnScope();
```

## 4. Block Scope

`let` and `const` (ES6+) are scoped to the nearest enclosing pair of `{ }` — an `if`, `for`, `while`, or even a standalone block. They are **not** accessible outside it.

```js
function blockScope() {
    if (true) {
        let b = "block scoped";
        console.log(b); // "block scoped" — visible inside the block
    }
    console.log(b); // ReferenceError: b is not defined
}
blockScope();
```

```js
for (let i = 0; i < 3; i++) {}
console.log(i); // ReferenceError: i is not defined — i only exists inside the for-loop's block
```

## The Scope Chain

Nested scopes can see outward, never inward — when a variable isn't found in the current scope, JS looks to the next enclosing scope, and so on up to global.

```js
const a = 1;
function level1() {
    const b = 2;
    function level2() {
        const c = 3;
        console.log(a, b, c); // 1 2 3 — level2 sees its own scope + every enclosing one
    }
    level2();
}
level1();
```

## Summary

| Scope | Created by | Visible where | Example |
|---|---|---|---|
| Global | Top-level declaration (no module system) | Entire program | `const x = 1;` outside any function |
| Module | Top-level declaration in a file | Only within that file | Top-level `var`/`let`/`const` in a `.js`/`.mjs` file |
| Function | `var`, function parameters | Entire enclosing function, ignoring blocks | `var` inside an `if` inside a function |
| Block | `let`, `const`, `class` | Nearest enclosing `{ }` | `let` inside an `if`/`for`/`while`/bare block |

## Key Points

- `var` is function-scoped; `let`/`const`/`class` are block-scoped
- Module scope means top-level variables in one file never collide with or leak into another file
- Scope is resolved lexically — by where code is written, not by how/where it's called from
- The scope chain only flows outward: inner scopes see outer variables, but outer scopes can't see inner ones
