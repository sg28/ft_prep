/*
Given a string s, you can transform every letter individually to be 
lowercase or uppercase to create another string.
Return a list of all possible strings we could create. 
Return the output in any order.

Example 1:

Input: s = "a1b2"
Output: ["a1b2","a1B2","A1b2","A1B2"]
*/

function letterCasePermutation(str) {
    const res = [];

    function helper(path, idx) {
        if (idx === str.length) {
            res.push(path);
            return;
        }
        const ch = str[idx];
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
            helper(path + ch.toLowerCase(), idx + 1);
            helper(path + ch.toUpperCase(), idx + 1);
        } else {
            helper(path + ch, idx + 1);
        }
    }

    helper('', 0);
    return res;
}

let res = letterCasePermutation("a1b2");
console.log(res); // ["a1b2","a1B2","A1b2","A1B2"]