

// Step 1: Build prefix sum array
let prefix = new Array(nums.length + 1).fill(0);
for (let i = 0; i < nums.length; i++) {
  prefix[i + 1] = prefix[i] + nums[i];
}

// Step 2: To get sum from index i to j
let sum = prefix[j + 1] - prefix[i];
