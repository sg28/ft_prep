# JavaScript Closures

A closure is a function that **remembers the variables from its enclosing scope**, even after that outer scope has finished executing. It's a direct consequence of [lexical scope](scope.md) — a function keeps access to the environment it was defined in, no matter where it's later called from.

## Basic Example: A Private Counter

```js
function countAge() {
    let count = 0;
    return function () {
        return count++;
    };
}

let res = countAge();
console.log(res()); // 0
console.log(res()); // 1
console.log(res()); // 2
```

`countAge()` runs and returns, but the inner function still has access to `count` — it "closes over" that variable. Each call to `countAge()` creates a **new, independent** `count`:

```js
let res1 = countAge();
let res2 = countAge();
console.log(res1(), res2(), res1()); // 0 0 1 — res1 and res2 don't share state
```

Note the `let count = 0;` — without a declaration keyword, `count` would become an accidental global shared by every call to `countAge()`, breaking the independence shown above. Closures rely on the variable being scoped to the outer function, not the global scope.

## Example: Function Factory

```js
function multiplier(x) {
    return function (y) {
        return x * y;
    };
}

let double = multiplier(2);
console.log(double(5));  // 10
console.log(double(10)); // 20

let triple = multiplier(3);
console.log(triple(4)); // 12
```

`double` and `triple` are both instances of the inner function, but each closes over its *own* `x` (`2` and `3` respectively) from the call that created it.

## Example: Encapsulating Private State

Closures are the standard way to fake "private" variables in JavaScript — the outer variable is only reachable through the functions returned alongside it.

```js
function makeCounter() {
    let count = 0;
    return {
        increment() { return ++count; },
        reset() { count = 0; return count; }
    };
}

const counter = makeCounter();
console.log(counter.increment(), counter.increment(), counter.increment()); // 1 2 3
console.log(counter.reset()); // 0
```

There's no way to read or set `count` directly from outside — only through `increment()`/`reset()`, which both close over the same `count`.

## The Classic Gotcha: `var` in Loops

This is a common interview question. With `var` (function-scoped), every iteration's callback shares the *same* variable, which has already reached its final value by the time the callbacks run:

```js
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log("var i:", i), 0);
}
// var i: 3
// var i: 3
// var i: 3
```

With `let` (block-scoped), each iteration gets its **own** binding of `j`, so each closure captures a different value:

```js
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log("let j:", j), 0);
}
// let j: 0
// let j: 1
// let j: 2
```

## Key Points

- A closure forms whenever a function is defined inside another function and references the outer function's variables
- The outer function's variables stay alive in memory as long as any closure still references them, even after the outer function has returned
- Each call to the outer function creates a fresh set of variables — closures don't share state across separate invocations, only within the same one
- Must use `let`/`const`/`var` to actually create the closed-over binding — an undeclared assignment leaks to global instead
- Common uses: private state/encapsulation, function factories, memoization, and capturing per-iteration values in loops (`let` vs `var`)
