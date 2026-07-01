# JavaScript Variable Declarations: var, let, const

## Let Declaration Examples

### Reassignment (Allowed)

```js
// [ Allowed ]. This is reassignment.
let a = 10;
a = 20;
```

### Re-declaration (Not Allowed)

```js
// [ Not Allowed ]. This is re-declaration.
// SyntaxError: Identifier 'a' has already been declared
let a = 10;
let a = 20;
```

## Const Declaration Examples

### Reassignment (Not Allowed)

```js
// [ Not Allowed ]. Reassignment and re-declaration in the same scope are not allowed.
// TypeError: Assignment to constant variable.
const z = 30;
z = 40;
```

### Re-declaration (Not Allowed)

```js
// [ Not Allowed ]
// SyntaxError: Identifier 'z' has already been declared
const z = 30;
const z = 40;
```

## Scope Examples

### Let in Different Scopes

```js
// Application in Function.
function letDifferentScopeExample() {
    let z = 10; // Outer scope
    z = 12;     // Allowed (reassignment)
    {
        let z = 20; // Inner block scope (shadows outer z)
        console.log(z); // Output: 20
    }
    console.log(z); // Output: 12
}
letDifferentScopeExample();
```

### Const in Different Scopes

```js
function constDifferentScopeExample() {
    const z = 10;   // Outer block scope
    {
        const z = 20; // Inner block scope (different scope)
        console.log(z); // Output: 20
    }
    console.log(z); // Output: 10
}
constDifferentScopeExample();
```

## Summary

| Declaration | Reassignment | Re-declaration | Block Scoped |
|-------------|--------------|----------------|--------------|
| `var`       | ✅ Allowed    | ✅ Allowed      | ❌ Function   |
| `let`       | ✅ Allowed    | ❌ Not Allowed  | ✅ Block      |
| `const`     | ❌ Not Allowed| ❌ Not Allowed  | ✅ Block      |

### Key Points:
- **let**: Can be reassigned but not re-declared in the same scope
- **const**: Cannot be reassigned or re-declared in the same scope
- Both **let** and **const** are block-scoped
- Variables with the same name can exist in different scopes
