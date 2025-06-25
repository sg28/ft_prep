/*
Permutation Sequence	
Return the kth permutation in lexicographic order.

The set [1, 2, 3, ..., n] contains a total of n! unique permutations.
By listing and labeling all of the permutations in order, 
we get the following sequence for n = 3:

"123"
"132"
"213"
"231"
"312"
"321"
Given n and k, return the kth permutation sequence.

Example 1:
    Input: n = 3, k = 3
    Output: "213"
*/

function getKthPermutation(n, k) {
    let count = 0;
    let nums = [];
    let kthPermutation = [];
    let used = new Array(n).fill(false);

    for (let i = 1; i <= n; i++) {
        nums.push(i);
    }

    function helper(sub_list) {
        if (kthPermutation.length) return; // Stop if found

        if (sub_list.length === nums.length) {
            count++;
            if (count === k) {
                kthPermutation = [...sub_list];
            }
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            sub_list.push(nums[i]);
            helper(sub_list);
            used[i] = false;
            sub_list.pop();
        }
    }

    helper([]);
    return kthPermutation.join('');
}

let res = getKthPermutation(3, 3);
console.log(res);