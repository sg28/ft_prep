# JavaScript Variable Declarations: var, let, const

## Let Declaration Examples

### Reassignment (Allowed)
// [ Allowed ]. This is reassignment.
let a = 10;
a = 20

### Re-declaration (Not Allowed)
// [ Not Allowed ]. This is re declaration.
let a = 10;
let a = 20

## Const Declaration Examples

### Reassignment (Not Allowed)
// Not Allowed. Reassign and Redeclaration in the same scope not allowed.
// [ Not Allowed ]

const z = 30;
z = 40;

### Re-declaration (Not Allowed)
// [ Not Allowed ]
const z = 30;
const z = 40;

## Scope Examples

### Let in Different Scopes
// Application in Function.
function letDifferentScopeExample() {
    let z = 10; // Outer block scope.
    let z = 11; // Not allowed.
    z = 12      // Allowed.
    {
        let z = 20; // Inner block scope (different scope)
        console.log(z); // Output: 20
    }
    console.log(z); // Output: 10
}
letDifferentScopeExample();

### Const in Different Scopes
function constDifferentScopeExample() {
    const z = 10;   // Outer block scope
    z = 11;         // Error.
    {
        const z = 20; // Inner block scope (different scope)
        console.log(z); // Output: 20
    }
    console.log(z); // Output: 10
}
constDifferentScopeExample();

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
