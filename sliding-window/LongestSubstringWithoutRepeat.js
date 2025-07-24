/*
Given a string s, find the length of the longest substring without duplicate characters.

 Example 1:

Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

*/

function code(s){

    let left = 0;
    let set = new Set();
    let substring_res = [];

    for(let right = 0;right < s.length;right++){
        
        while(set.has(s[right])){
            set.delete(s[left]);
            left++;
        }
        set.add(s[right]);
        substring_res.push(s.slice(left, right + 1));
    }
    console.log(substring_res);
}
code("abcabcbb")