// 155. Min Stack
//
// Design a stack that supports push, pop, top, and retrieving the minimum
// element in constant time.
//
// Implement the MinStack class:
// - MinStack() initializes the stack object.
// - void push(int value) pushes the element value onto the stack.
// - void pop() removes the element on the top of the stack.
// - int top() gets the top element of the stack.
// - int getMin() retrieves the minimum element in the stack.
//
// You must implement a solution with O(1) time complexity for each function.
//
// Example 1:
// Input
// ["MinStack","push","push","push","getMin","pop","top","getMin"]
// [[],[-2],[0],[-3],[],[],[],[]]
//
// Output
// [null,null,null,null,-3,null,0,-2]
//
// Explanation
// MinStack minStack = new MinStack();
// minStack.push(-2);
// minStack.push(0);
// minStack.push(-3);
// minStack.getMin(); // return -3
// minStack.pop();
// minStack.top();    // return 0
// minStack.getMin(); // return -2
//
// Constraints:
// -2^31 <= val <= 2^31 - 1
// Methods pop, top and getMin operations will always be called on non-empty stacks.
// At most 3 * 10^4 calls will be made to push, pop, top, and getMin.

class MinStack {
  constructor() {
    this.mainStack = [];
    this.minStack = [];
  }

  push(value) {
    this.mainStack.push(value);
    // logic for the minStack
    if (this.minStack.length) {
      let minStackTop = this.minStack[this.minStack.length - 1];
      if (value < minStackTop) {
        this.minStack.push(value);
      } else {
        this.minStack.push(minStackTop);
      }
    } else {
      this.minStack.push(value);
    }
  }

  pop() {
    this.mainStack.pop();
    this.minStack.pop();
  }

  top() {
    if (this.mainStack.length) return this.mainStack[this.mainStack.length - 1];
    return undefined;
  }

  getMin() {
    if (this.minStack.length) return this.minStack[this.minStack.length - 1];
    else return undefined;
  }
}
