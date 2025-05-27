/*
    Largest Rectangle in Histogram.

    Given an array of integers heights representing 
    the histogram's bar height where the width of each 
    bar is 1, return the area of the largest rectangle 
    in the histogram.

    Input: heights = [2,1,5,6,2,3]
    Output: 10
    Explanation: The above is a histogram where width of each bar is 1.
    The largest rectangle is shown in the red area, which has an area = 10 units.

*/

// Monotonic Stack
function largestRectangleArea(heights) {
    let stack = [];
    let maxArea = 0;

    for (let i = 0; i < heights.length; i++) {
        /*  stack is not empty.
            Current bar is shorter than the Bar at the top of the Stack.

        */
        while (stack.length && heights[i] < heights[stack[stack.length - 1]]) {
            let height = heights[stack.pop()];
            let width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }

    // Process any remaining bars in the stack
    while (stack.length) {
        let height = heights[stack.pop()];
        let width;
        if(stack.length === 0){
            width = heights.length;
        }else{
            width = heights.length - stack[stack.length - 1] - 1;
        }
        maxArea = Math.max(maxArea, height * width);
    }

    return maxArea;
}

let res = largestRectangleArea([2,1,5,6,2,3])
console.log(" res ", res)