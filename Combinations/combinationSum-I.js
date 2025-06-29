
/*
Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.

The same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

The test cases are generated such that the number of unique combinations that sum up to target is less than 150 combinations for the given input.

 

Example 1:

Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation:
2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
7 is a candidate, and 7 = 7.
These are the only two combinations.


*/





var combinationSum = function(candidates, target) {
    var buffer = [];
    var result = [];
    search(0, target);
    return result;

    function search(startIdx, target) {
        // base case 1
        if (target === 0) {
            result.push(buffer.slice());
            return;
        }
        // base case 2
        if (target < 0) return;
        // base case 3
        if (startIdx === candidates.length) return;
        
        buffer.push(candidates[startIdx]);
        search(startIdx, target - candidates[startIdx]);
        buffer.pop();
        search(startIdx + 1, target);
    }
};