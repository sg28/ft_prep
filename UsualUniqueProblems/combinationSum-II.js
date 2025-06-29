
/*
Given a collection of candidate numbers (candidates) 
and a target number (target), find all unique 
combinations in candidates where the candidate 
numbers sum to target.
Each number in candidates may only be used once 
in the combination.
Note: The solution set must not contain 
duplicate combinations.

Example 1:

Input: candidates = [10,1,2,7,6,1,5], target = 8
Output: 
[
    [1,1,6],
    [1,2,5],
    [1,7],
    [2,6]
]
*/






var combinationSum2 = function (candidates, target) {

    const result = [];
    candidates.sort((a, b) => a - b);
    backtrack([], 0, target);
    return result;

    function backtrack(current, start, target) {
        if (target === 0) {
            let copy = [];
            for (let i = 0; i < current.length; i++) {
                copy.push(current[i]);
            }
            result.push(copy);
            return;
        }

        for (let i = start; i < candidates.length; i++) {
            if (i > start && candidates[i] === candidates[i - 1]) continue;
            if (candidates[i] > target) break;

            current.push(candidates[i]);
            backtrack(current, i + 1, target - candidates[i]);
            current.pop();
        }
    }

};