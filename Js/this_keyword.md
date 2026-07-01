# The `this` Keyword in JavaScript

`this` is a special keyword whose value is determined by **how a function is called** (the call-site), not where it's defined. That's the opposite of arrow functions, which use lexical `this` — see [arrow_functions.md](arrow_functions.md).

There are four ways `this` gets bound, in order of precedence (later rules override earlier ones).

## 1. Default Binding

A plain function call, with no object before the dot.

```js
function show() {
    console.log(this);
}
show();
// non-strict mode: the global object (globalThis)
// strict mode ("use strict"): undefined
```

## 2. Implicit Binding

Called as a method on an object — `this` is the object before the dot.

```js
const obj = {
    name: "Alice",
    greet() {
        console.log(this.name);
    }
};
obj.greet(); // "Alice" — this = obj
```

## 3. Explicit Binding

`call()`, `apply()`, or `bind()` force `this` to a specific value.

```js
function greet() {
    console.log(this.name);
}
greet.call({ name: "Bob" });    // "Bob"
greet.apply({ name: "Carol" }); // "Carol"

const bound = greet.bind({ name: "Dave" });
bound(); // "Dave"
```

`call` and `apply` invoke the function immediately with the given `this` (they differ only in how extra arguments are passed — a list vs. an array). `bind` returns a new function permanently bound to that `this`, to be called later.

## 4. `new` Binding

Calling a function with `new` creates a brand-new object and binds `this` to it.

```js
function Person(name) {
    this.name = name;
}
const p = new Person("Eve");
console.log(p.name); // "Eve" — this = the newly created object
```

## Arrow Functions Ignore All Four Rules

Arrow functions have no `this` of their own — they inherit it from the enclosing lexical scope at definition time, permanently. None of the above rules can change it.

```js
const obj2 = {
    name: "Frank",
    delayedGreet() {
        setTimeout(() => {
            console.log(this.name); // "Frank" — inherits this from delayedGreet
        }, 0);
    }
};
obj2.delayedGreet(); // "Frank"
```

## The Classic Gotcha: Losing `this` in a Callback

A regular method's `this` depends entirely on how it's called. Passing it as a callback detaches it from the object — it gets invoked as a plain function, triggering default binding instead of implicit binding.

```js
const obj3 = {
    name: "Frank",
    greet() {
        console.log(this && this.name);
    }
};

setTimeout(obj3.greet, 0);          // undefined — called standalone, this ≠ obj3
setTimeout(() => obj3.greet(), 0);  // "Frank" — wrapped so it's still called as obj3.greet()
```

## Key Points

- `this` is resolved at **call-time**, based on the call-site — not at definition time (except for arrow functions)
- Precedence when multiple rules could apply: `new` binding > explicit binding (`call`/`apply`/`bind`) > implicit binding (method call) > default binding (plain call)
- Default binding is `undefined` in strict mode, the global object otherwise
- Arrow functions never participate in any of this — they always use the `this` from their enclosing scope
- Passing a method as a bare callback (`setTimeout(obj.method, 0)`) loses its `this` — wrap it in an arrow function or use `.bind()` to preserve it
