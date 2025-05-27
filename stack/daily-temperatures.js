/*
Given an array of integers temperatures represents 
the daily temperatures, return an array answer such 
that answer[i] is the number of days you have to wait 
after the ith day to get a warmer temperature. If 
\there is no future day for which this is possible, 
keep answer[i] == 0 instead.

Input:
temperatures = [73,74,75,71,69,72,76,73]

Output:
[1,1,4,2,1,1,0,0]

Explanation:

For day 0 (73), the next warmer day is day 1 (74), so answer is 1.
For day 1 (74), the next warmer day is day 2 (75), so answer is 1.
For day 2 (75), the next warmer day is day 6 (76), so answer is 4.
For day 3 (71), the next warmer day is day 5 (72), so answer is 2.
For day 4 (69), the next warmer day is day 5 (72), so answer is 1.
For day 5 (72), the next warmer day is day 6 (76), so answer is 1.
For day 6 (76), there is no warmer day, so answer is 0.
For day 7 (73), there is no warmer day, so answer is 0.
 
*/

function dailyTemperature(temp){
    let res = new Array(temp.length).fill(0);
    let stack = [];

    for(let i = 0; i < temp.length; i++){
        // We start the while loop from the second element.
        while(stack.length && temp[i] > temp[stack[stack.length - 1]]) {
            let prevIndex = stack.pop();
            res[prevIndex] = i - prevIndex;
        }
        stack.push(i);
    }
    return res;
}
let res = dailyTemperature([73,74,75,71,69,72,76,73])

// monotonic decreasing stack