

/*
    General pattern for Binary Search.
*/
// Template A — Exact match (find target index)
function bsExact(nums, target) {
  let lo = 0, hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}


// Template B — Lower Bound (first index with nums[i] >= target)
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length; // hi is exclusive

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] >= target) hi = mid; // keep mid
    else lo = mid + 1;
  }
  return lo; // 0..nums.length
}


// Upper Bound (first index with nums[i] > target) — optional but very useful
function upperBound(nums, target) {
  let lo = 0, hi = nums.length;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] > target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}



// Template C — Binary search on answer (minimum value that “works”)

function minFeasible(lo, hi, ok) { // ok(x): false..false true..true
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (ok(mid)) hi = mid;      // works -> try smaller
    else lo = mid + 1;          // fails -> need bigger
  }
  return lo;
}
