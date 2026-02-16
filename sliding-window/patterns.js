/*
  Sliding Window Patterns (JavaScript)
  Use these templates as a starting point.
*/

// 1) Fixed-size window (e.g., max/avg sum of size k)
function fixedWindowMaxSum(nums, k) {
  if (k <= 0 || k > nums.length) return null;
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;

  for (let right = k; right < nums.length; right++) {
    sum += nums[right];
    sum -= nums[right - k];
    if (sum > best) best = sum;
  }

  return best;
}

// 2) Variable-size window, min length with sum >= target (all positives)
function minLenAtLeastTarget(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      const len = right - left + 1;
      if (len < best) best = len;
      sum -= nums[left];
      left++;
    }
  }

  return best === Infinity ? 0 : best;
}

// 3) Variable-size window, longest with sum <= k (all positives)
function maxLenAtMostSum(k, nums) {
  let left = 0;
  let sum = 0;
  let best = 0;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum > k) {
      sum -= nums[left];
      left++;
    }

    const len = right - left + 1;
    if (len > best) best = len;
  }

  return best;
}

// 4) Longest substring with at most K distinct characters
function longestAtMostKDistinct(s, k) {
  if (k <= 0) return 0;
  const freq = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    freq.set(ch, (freq.get(ch) || 0) + 1);

    while (freq.size > k) {
      const c = s[left];
      freq.set(c, freq.get(c) - 1);
      if (freq.get(c) === 0) freq.delete(c);
      left++;
    }

    const len = right - left + 1;
    if (len > best) best = len;
  }

  return best;
}

// 5) Longest substring with all unique characters
function longestUniqueSubstring(s) {
  const last = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) {
      left = last.get(ch) + 1;
    }
    last.set(ch, right);
    const len = right - left + 1;
    if (len > best) best = len;
  }

  return best;
}

// 6) Count subarrays with exactly K distinct (atMostK trick)
function subarraysWithAtMostKDistinct(nums, k) {
  const freq = new Map();
  let left = 0;
  let count = 0;

  for (let right = 0; right < nums.length; right++) {
    const v = nums[right];
    freq.set(v, (freq.get(v) || 0) + 1);

    while (freq.size > k) {
      const lv = nums[left];
      freq.set(lv, freq.get(lv) - 1);
      if (freq.get(lv) === 0) freq.delete(lv);
      left++;
    }

    count += right - left + 1;
  }

  return count;
}

function subarraysWithExactlyKDistinct(nums, k) {
  if (k <= 0) return 0;
  return (
    subarraysWithAtMostKDistinct(nums, k) -
    subarraysWithAtMostKDistinct(nums, k - 1)
  );
}

// 7) Minimum window substring (classic "need" + "have" pattern)
function minWindowSubstring(s, t) {
  if (!t || !s) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);

  let have = 0;
  const required = need.size;
  const window = new Map();
  let left = 0;
  let best = [0, Infinity];

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) || 0) + 1);

    if (need.has(ch) && window.get(ch) === need.get(ch)) {
      have++;
    }

    while (have === required) {
      if (right - left < best[1] - best[0]) best = [left, right];

      const lc = s[left];
      window.set(lc, window.get(lc) - 1);
      if (need.has(lc) && window.get(lc) < need.get(lc)) {
        have--;
      }
      left++;
    }
  }

  return best[1] === Infinity ? "" : s.slice(best[0], best[1] + 1);
}

// 8) Fixed-size window with condition (e.g., count windows with sum >= target)
function countFixedWindowsWithSumAtLeast(nums, k, target) {
  if (k <= 0 || k > nums.length) return 0;
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let count = sum >= target ? 1 : 0;

  for (let right = k; right < nums.length; right++) {
    sum += nums[right];
    sum -= nums[right - k];
    if (sum >= target) count++;
  }

  return count;
}

// 9) Two-pointer with "at most one" constraint (e.g., replace up to k zeros)
function longestOnesAfterReplace(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;

    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }

    const len = right - left + 1;
    if (len > best) best = len;
  }

  return best;
}

// 10) Notes:
// - Use sliding window when expanding right increases some monotonic measure
//   (sum, count, distinct) and shrinking left decreases it.
// - If values can be negative, many sliding window patterns break.
// - For "exactly K" constraints, use atMost(K) - atMost(K-1).
// - For strings, use a frequency map and manage "have vs need".
