/*
Given a collection of numbers, nums, 
that might contain duplicates, 
return all possible unique permutations in any order.

Example 1:
Input: nums = [1,1,2]
Output:
[[1,1,2],
 [1,2,1],
 [2,1,1]]

Example 2:
Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
*/

let nums = [1,1,2];
function generatePermutation(){
    let res = [];
    let sub_list = [];
    nums.sort((a,b)=> (a-b));
    let used = new Array(nums.length).fill(false);

    function helper(){
        // base case
        if(sub_list.length === nums.length){
            res.push([...sub_list]);
            return;
        }

        // looping the list
        for(let i = 0; i< nums.length;i++){
            /*
                1. element id exists in the used list.
                2. current element is equal to the previous element.
                3. previous element is not in the used list.
            */
            if(used[i]) continue;
            if( i > 0 && nums[i] === nums[i - 1] && !used[i-1])continue
            
            used[i] = true;
            sub_list.push(nums[i]);
            helper(sub_list);
            sub_list.pop();
            used[i] = false;
        }

    }
    helper()
    return res;
}
let result = generatePermutation();
console.log(result)