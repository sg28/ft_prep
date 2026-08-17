// 443. String Compression
//
// Given an array of characters chars, compress it using the following algorithm:
//
// Begin with an empty string s. For each group of consecutive repeating characters in chars:
// - If the group's length is 1, append the character to s.
// - Otherwise, append the character followed by the group's length.
//
// The compressed string s should not be returned separately, but instead, be stored
// in the input character array chars. Note that group lengths that are 10 or longer
// will be split into multiple characters in chars.
//
// After you are done modifying the input array, return the new length of the array.
//
// You must write an algorithm that uses only constant extra space.
//
// Note: The characters in the array beyond the returned length do not matter and
// should be ignored.
//
// Example 1:
// Input: chars = ["a","a","b","b","c","c","c"]
// Output: 6
// Explanation: The groups are "aa", "bb", and "ccc". This compresses to "a2b2c3".
// After modifying the input array in-place, the first 6 characters of chars should be
// ["a","2","b","2","c","3"].


function compressString(s) {
    let stack = [];

    for(let i = 0; i < s.length; i++){
        if(stack.length){
            let stackTop = stack[stack.length-1][0];
            
            if(stackTop === s[i]){
                stack[stack.length-1][1]++;
            }
            else{
                stack.push([s[i],1]);    
            }
        }else{
            stack.push([s[i],1]);
        }
    }
    return stack.map(([char,count]) => char + count ).join('');

}