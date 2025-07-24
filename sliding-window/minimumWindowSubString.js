/* Have to review this code, for understanding
Given two strings s and t of lengths m and n 
respectively, return the minimum window substring 
of s such that every character in t (including duplicates) 
is included in the window. If there is no such substring, return the empty string "".
The testcases will be generated such that the answer is unique.

Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.

*/ 

function minimumWindowSubStr(s, t) {
    if (!s || !t || s.length < t.length) return "";

    // Count characters in t
    const tCount = {};
    for (let char of t) tCount[char] = (tCount[char] || 0) + 1;

    let left = 0, right = 0;
    let minLen = Infinity, minStart = 0;
    let required = Object.keys(tCount).length;
    let formed = 0;
    const windowCount = {};

    while (right < s.length) {
        let char = s[right];
        windowCount[char] = (windowCount[char] || 0) + 1;

        if (tCount[char] && windowCount[char] === tCount[char]) {
            formed++;
        }

        // Try to shrink the window from the left
        while (left <= right && formed === required) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            let leftChar = s[left];
            windowCount[leftChar]--;
            if (tCount[leftChar] && windowCount[leftChar] < tCount[leftChar]) {
                formed--;
            }
            left++;
        }
        right++;
    }

    return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}

let s = "ADOBECODEBANC";
let t = "ABC";
console.log(minimumWindowSubStr(s, t)); // Output: "BANC"
