# JavaScript Array Methods

### push()

Add element(s) to the end.

```js
[1,2].push(3) → [1,2,3]
```

### pop()

Remove last element.

```js
[1,2,3].pop() → 3, array becomes [1,2]
```

### shift()

Remove first element.

```js
[1,2,3].shift() → 1, array becomes [2,3]
```

### unshift()

Add element(s) to the start.

```js
[2,3].unshift(1) → [1,2,3]
```

### slice()

Extracts a portion of an array without modifying the original.
Return shallow copy of part of array.
slice(start, end) - start: inclusive, end: exclusive

```js
[1,2,3,4].slice(1,3) → [2,3]
```

### splice()

Add/remove elements at index.
splice(index, numberOfElements, addItems)

```js
[1,2,3].splice(1,1,9) → [2], array becomes [1,9,3]

let list = [1,3,4,5];
list.splice(1, 2, 8,9) // [ 1, 8, 9, 5 ]
```

### map()

Transform elements with callback.
map(callback) - callback: function to transform each element

```js
[1,2,3].map(x=>x*2) → [2,4,6]
```

### filter()

Keep elements passing test.
filter(callback) - callback: function that returns true/false to keep/remove elements

```js
let list = [1,2,3,4,2,1,1];
let res = list.filter((e, i)=>{
    return e > 2;
});

console.log(res) // [ 3, 4 ]
```

### reduce()

Accumulate values.
reduce(callback, initialValue) - callback: accumulator function, initialValue: starting value

```js
let list = [1,2,3,4,2,1,1];
let res = list.reduce((acc, elem) =>{
    return acc + elem;
}, 0)

console.log(res) // 14

[1,2,3,4].reduce((a,b)=>a*b,1) → 24 (multiplication)
['a','b','c'].reduce((a,b)=>a+b,'') → 'abc' (string concatenation)
[{x:1},{x:2},{x:3}].reduce((a,b)=>a+b.x,0) → 6 (sum object property)
[1,5,3,9,2].reduce((a,b)=>Math.max(a,b)) → 9 (find maximum)
```

### forEach()

Run callback on each element.
forEach(callback) - callback: function to execute for each element

```js
[1,2,3].forEach(x=>console.log(x))
```

### find()

Return first element matching condition.
find(callback) - callback: function that returns true for the element you want

```js
[1,2,3].find(x=>x>1) → 2
```

### findIndex()

Return index of first match.
findIndex(callback) - callback: function that returns true for the element you want

```js
[1,2,3].findIndex(x=>x>1) → 1
```

### every()

Check if all elements pass test.
every(callback) - callback: function that must return true for ALL elements

```js
[1,2,3].every(x=>x>0) → true
```

### some()

Check if any element passes test.
some(callback) - callback: function that returns true for ANY element

```js
[1,2,3].some(x=>x>2) → true
```

### sort()

Sort array (mutates).
sort(compareFunction) - compareFunction: optional function to define sort order

```js
[3,1,2].sort() → [1,2,3]
[3,1,2].sort((a,b)=>a-b) → [1,2,3] (ascending)
[3,1,2].sort((a,b)=>b-a) → [3,2,1] (descending)
['banana','apple','cherry'].sort() → ['apple','banana','cherry']
```

### reverse()

Reverse array (mutates).
reverse() - no parameters

```js
[1,2,3].reverse() → [3,2,1]
```

### join()

Join elements into string.
join(separator) - separator: string to put between elements

```js
[1,2,3].join('-') → "1-2-3"
[1,2,3].join() → "1,2,3" (default comma)
[1,2,3].join('') → "123" (no separator)
['Hello','World'].join(' ') → "Hello World"
['apple','banana','cherry'].join(' | ') → "apple | banana | cherry"
```

### includes()

Check if array includes element.
includes(searchElement, fromIndex) - searchElement: what to look for, fromIndex: optional start position

```js
[1,2,3].includes(2) → true
```

### indexOf()

Find first index of element.
indexOf(searchElement, fromIndex) - searchElement: what to find, fromIndex: optional start position

```js
[1,2,3].indexOf(2) → 1
[1,2,3].indexOf(5) → -1 (not found)
[1,2,3,2].indexOf(2,2) → 3 (search from index 2)
```

### lastIndexOf()

Find last index of element.
lastIndexOf(searchElement, fromIndex) - searchElement: what to find, fromIndex: optional start position from end

```js
[1,2,3,2].lastIndexOf(2) → 3
```

### Array.of()

Create array from args.
Array.of(...elements) - elements: any number of values to put in the array

```js
Array.of(1,2,3) → [1,2,3]
```

### Array.from()

Create array from iterable.
Array.from(arrayLike, mapFn) - arrayLike: iterable object, mapFn: optional transform function

```js
Array.from("abc") → ["a","b","c"]
```

### flat()

Flatten nested arrays.
flat(depth) - depth: how many levels deep to flatten (default 1)

```js
[1,[2,[3]]].flat(2) → [1,2,3]
```

### flatMap()

Map + flatten one level.
flatMap(callback) - callback: function to transform each element, then flattens result

```js
[1,2].flatMap(x=>[x,x*2]) → [1,2,2,4]
```

### at()

Access by index (supports negative).
at(index) - index: position to access (negative counts from end)

```js
[1,2,3].at(-1) → 3
```

### findLast()

Find last element matching condition.
findLast(callback) - callback: function that returns true for the element you want

```js
[1,2,3,2].findLast(x=>x===2) → 2 (last one)
```

### findLastIndex()

Find index of last match.
findLastIndex(callback) - callback: function that returns true for the element you want

```js
[1,2,3,2].findLastIndex(x=>x===2) → 3
```

### toReversed()

Return reversed copy (non-mutating).
toReversed() - no parameters

```js
[1,2,3].toReversed() → [3,2,1]
```

### toSorted()

Return sorted copy (non-mutating).
toSorted(compareFunction) - compareFunction: optional function to define sort order

```js
[3,1,2].toSorted() → [1,2,3]
```

### toSpliced()

Return new array with splice applied (non-mutating).
toSpliced(start, deleteCount, ...items) - start: index, deleteCount: how many to remove, items: what to add

```js
[1,2,3].toSpliced(1,1,9) → [1,9,3]
```

### with()

Return copy with element replaced at index.
with(index, value) - index: position to replace, value: new value to put there

```js
[1,2,3].with(1,9) → [1,9,3]
```
