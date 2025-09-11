
## 1. Classic Array Methods
### push()
Add element(s) to the end.
- **Example**: [1,2].push(3) → [1,2,3]

### pop()
Remove last element.
- **Example**: [1,2,3].pop() → 3, array becomes [1,2]

### shift()
Remove first element.
- **Example**: [1,2,3].shift() → 1, array becomes [2,3]

### unshift()
Add element(s) to the start.
- **Example**: [2,3].unshift(1) → [1,2,3]

### slice()
Return shallow copy of part of array.
- **Example**: [1,2,3,4].slice(1,3) → [2,3]

### splice()
Add/remove elements at index.
- **Example**: [1,2,3].splice(1,1,9) → [2], array becomes [1,9,3]

### map()
Transform elements with callback.
- **Example**: [1,2,3].map(x=>x*2) → [2,4,6]

### filter()
Keep elements passing test.
- **Example**: [1,2,3].filter(x=>x>1) → [2,3]

### reduce()
Accumulate values.
- **Example**: [1,2,3].reduce((a,b)=>a+b,0) → 6

### forEach()
Run callback on each element.
- **Example**: [1,2,3].forEach(x=>console.log(x))

### find()
Return first element matching condition.
- **Example**: [1,2,3].find(x=>x>1) → 2

### findIndex()
Return index of first match.
- **Example**: [1,2,3].findIndex(x=>x>1) → 1

### every()
Check if all elements pass test.
- **Example**: [1,2,3].every(x=>x>0) → true

### some()
Check if any element passes test.
- **Example**: [1,2,3].some(x=>x>2) → true

### sort()
Sort array (mutates).
- **Example**: [3,1,2].sort() → [1,2,3]

### reverse()
Reverse array (mutates).
- **Example**: [1,2,3].reverse() → [3,2,1]

### join()
Join elements into string.
- **Example**: [1,2,3].join('-') → "1-2-3"

### includes()
Check if array includes element.
- **Example**: [1,2,3].includes(2) → true

### indexOf()
Find first index of element.
- **Example**: [1,2,3].indexOf(2) → 1

### lastIndexOf()
Find last index of element.
- **Example**: [1,2,3,2].lastIndexOf(2) → 3

---

## 2. Modern Additions (ES2015 → ES2022)
### Array.of()
Create array from args.
- **Example**: Array.of(1,2,3) → [1,2,3]

### Array.from()
Create array from iterable.
- **Example**: Array.from("abc") → ["a","b","c"]

### flat()
Flatten nested arrays.
- **Example**: [1,[2,[3]]].flat(2) → [1,2,3]

### flatMap()
Map + flatten one level.
- **Example**: [1,2].flatMap(x=>[x,x*2]) → [1,2,2,4]

### at()
Access by index (supports negative).
- **Example**: [1,2,3].at(-1) → 3

---

## 3. Latest Additions (ES2023 → ES2025)
### findLast()
Find last element matching condition.
- **Example**: [1,2,3,2].findLast(x=>x===2) → 2 (last one)

### findLastIndex()
Find index of last match.
- **Example**: [1,2,3,2].findLastIndex(x=>x===2) → 3

### toReversed()
Return reversed copy (non-mutating).
- **Example**: [1,2,3].toReversed() → [3,2,1]

### toSorted()
Return sorted copy (non-mutating).
- **Example**: [3,1,2].toSorted() → [1,2,3]

### toSpliced()
Return new array with splice applied (non-mutating).
- **Example**: [1,2,3].toSpliced(1,1,9) → [1,9,3]

### with()
Return copy with element replaced at index.
- **Example**: [1,2,3].with(1,9) → [1,9,3]
