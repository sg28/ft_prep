/*
Given a string s, return all the palindromic permutations (without duplicates) 
of it.
You may return the answer in any order. 
If s has no palindromic permutation, return an empty list.

Example 1:
    Input: s = "aabb"
    Output: ["abba","baab"]
Example 2:
    Input: s = "abc"
    Output: []
*/

function palindromPermutation(s){
    let str = s.split("").sort((a,b)=> a-b);
    let res = new Set();
    let used = new Array(str.length).fill(false);

    // check for palindrom
     function isPalindrome(arr) {
        for (let i = 0, j = arr.length - 1; i < j; i++, j--) {
            if (arr[i] !== arr[j]) return false;
        }
        return true;
    }

    // backtrack / helper function
    function helper(sub_list){
        
        if(sub_list.length === str.length){
            if(isPalindrome(sub_list)){
                res.add(sub_list.join(''));
            }
            return;
        }

        for(let i = 0;i < str.length;i++){
            if(used[i]) continue;
            if(i > 0 &&
               str[i] === str[i-1] &&
               !used[i-1]
            ) continue;

            used[i] = true;
            sub_list.push(str[i]);
            helper(sub_list);
            sub_list.pop();
            used[i] = false;
        }

    }
    helper([]);
    console.log(res)
    return Array.from(res);
}
let result = palindromPermutation("aabb");


/* Time limit exceeded. */