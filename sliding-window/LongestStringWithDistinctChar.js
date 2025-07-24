/*
    Given a string s, return the length of the longest 
    substring that contains at most two distinct characters.

    Example 1:

    Input: s = "eceba"
    Output: 3
    Explanation: The substring is "ece" which its length is 3.
*/

function lengthOfLongestSubstringTwoDistinct(s) {
  let left = 0;
  let maxLen = 0;
  let map = {};

  for (let right = 0; right < s.length; right++) {
    let char = s[right];
    map[char] = (map[char] || 0) + 1;

    while (Object.keys(map).length > 2) {
      let leftChar = s[left];
      map[leftChar]--;
      if (map[leftChar] === 0) {
        delete map[leftChar];
      }
      left++;
    }

    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

console.log(lengthOfLongestSubstringTwoDistinct("eceba")); // Output: 3
