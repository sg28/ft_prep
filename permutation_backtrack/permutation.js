/*
    Generate all permutations of distinct numbers.
    Given an array nums of distinct integers, 
    return all the possible permutations. 
    You can return the answer in any order.

    Example 1:

    Input: nums = [1,2,3]
    Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
*/

let nums = [1,2,3];
function generatePermutation(){
    let res = [];
    let sub_res = [];

    function helper(sub_res){
        // base case
        if(sub_res.length === nums.length){
            res.push([...sub_res]);
            return;
        }

        for(let i = 0;i< nums.length; i++ ){
            if(!sub_res.includes(nums[i])){
                sub_res.push(nums[i]);
                helper(sub_res);
                sub_res.pop();
            }
        }

    }
    helper(sub_res)
    return res;
}

let result = generatePermutation();
console.log('result ', result)
