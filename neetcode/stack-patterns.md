# Stack Patterns

## 1. Matching / Pairing (Valid Parentheses)
```js
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (!(c in map)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}
```

## 2. Monotonic Stack (Next Greater Element)
```js
function nextGreaterElement(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; // indices, values decreasing bottom->top
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res;
}
```

## 3. Expression Evaluation (RPN)
```js
function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (!'+-*/'.includes(t)) { stack.push(Number(t)); continue; }
    const b = stack.pop(), a = stack.pop();
    if (t === '+') stack.push(a + b);
    else if (t === '-') stack.push(a - b);
    else if (t === '*') stack.push(a * b);
    else stack.push(Math.trunc(a / b));
  }
  return stack.pop();
}
```

## 4. Nested-Structure Unwinding (Decode String)
```js
function decodeString(s) {
  const stack = [];
  let curStr = '', curNum = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') curNum = curNum * 10 + Number(c);
    else if (c === '[') {
      stack.push([curStr, curNum]);
      curStr = ''; curNum = 0;
    } else if (c === ']') {
      const [prevStr, num] = stack.pop();
      curStr = prevStr + curStr.repeat(num);
    } else curStr += c;
  }
  return curStr;
}
```

## 5. Auxiliary Stack for O(1) State (Min Stack)
```js
class MinStack {
  constructor() { this.stack = []; this.minStack = []; }
  push(x) {
    this.stack.push(x);
    const min = this.minStack.length ? Math.min(x, this.minStack[this.minStack.length - 1]) : x;
    this.minStack.push(min);
  }
  pop() { this.stack.pop(); this.minStack.pop(); }
  top() { return this.stack[this.stack.length - 1]; }
  getMin() { return this.minStack[this.minStack.length - 1]; }
}
```

## 6. Stack as Explicit Call Stack (Iterative DFS)
```js
function iterativeDFS(root) {
  if (!root) return [];
  const stack = [root], res = [];
  while (stack.length) {
    const node = stack.pop();
    res.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return res;
}
```
