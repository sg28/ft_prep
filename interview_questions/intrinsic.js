/*
Write a function that returns the index of the "much larger" number in an array.
A number is considered "much larger" if it is more than twice as large as every other number in the array.
Return the index of that number.
Return -1 if there is no such number.


[1, 6, 19, 9]         ➝ 2    (19 is more than twice all others)
[1, 6, 19, 19]        ➝ -1   (19 is not more than twice 19)
[]                   ➝ -1   (empty array)
[1, 6, 19, 19, 6]     ➝ -1   (19 is not more than twice 19)
[0]                  ➝ 0    (single number → return index 0)



*/

function dominateIndex(nums: number[]): number {
    if (nums.length === 0) return -1;
    if (nums.length === 1) return 0;

    let max = -1, secondMax = -1, index = -1;

    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > max) {
            secondMax = max;
            max = nums[i];
            index = i;
        } else if (nums[i] > secondMax) {
            secondMax = nums[i];
        }
    }

    return max > 2 * secondMax ? index : -1;
}
