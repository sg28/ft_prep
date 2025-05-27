/*
Given a circular integer array nums (i.e., the next element of nums[nums.length - 1]
is nums[0]), return the next greater number for every element in nums.
The next greater number of a number x is the first greater number to 
its traversing-order next in the array, which means you could search 
circularly to find its next greater number. If it doesn't exist, 
return -1 for this number.

 

Example 1:

Input: nums = [1,2,1]
Output: [2,-1,2]
Explanation: The first 1's next greater number is 2; 
The number 2 can't find next greater number. 
The second 1's next greater number needs to search circularly, which is also 2.
*/

function nextGreaterElements(nums) {
    const n = nums.length;
    const res = new Array(n).fill(-1);
    const stack = [];

    // Traverse the array twice to simulate circularity
    for (let i = 0; i < 2 * n; i++) {
        let current_num = nums[i % n];
        while (stack.length && current_num > nums[stack[stack.length - 1]]) {
            let idx = stack.pop();
            res[idx] = current_num;
        }
        if (i < n) stack.push(i);
    }
    return res;
}

// Example usage:
console.log(nextGreaterElements([1,2,1])); // [2, -1, 2]
console.log(nextGreaterElements([1,2,3,4,3])); // [2,3,4,-1,4]

// monotonic decreasing stack