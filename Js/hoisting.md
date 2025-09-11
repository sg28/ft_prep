# JavaScript Hoisting

Hoisting is JavaScript's default behavior of moving declarations to the top of their scope during the compilation phase, before the code is executed.

Only declarations are hoisted, not the initializations or assignments.

## What Gets Hoisted?

Hoisting applies to:
- Variable declarations (var, let, const)
- Function declarations
- Class declarations (introduced in ES6)

## Variable Hoisting with `var`

### Example:
console.log(x);     // undefined
var x = 5;
console.log(x);     // 5

### Behind the Scenes (How JavaScript Interprets It):
var x;          // Declaration is hoisted
console.log(x); // undefined
x = 5;          // Initialization stays in place
console.log(x); // 5

## Variable Hoisting with `let` and `const`

### Example:
console.log(y); // Error: Cannot access 'y' before initialization
let y = 10;

console.log(z); // Error: Cannot access 'z' before initialization
const z = 15;

**Note:** `let` and `const` are hoisted but remain in a "temporal dead zone" until their declaration is reached.

## Function Hoisting

### Function Expressions
greet(); // Error: greet is not a function

var greet = function () {
    console.log("Hello!");
};

### Function Declarations
greet(); // Output: Hello, World!

function greet() {
    console.log("Hello, World!");
}

## Key Points

- **`var`**: Hoisted and initialized with `undefined`
- **`let`/`const`**: Hoisted but not accessible until declaration (temporal dead zone)
- **Function declarations**: Fully hoisted (both declaration and definition)
- **Function expressions**: Only the variable is hoisted, not the function
