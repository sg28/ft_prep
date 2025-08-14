function countKDistinctSubstrings(s, k) {
    let count = 0;
    let left = 0, right = 0;
    let map = {};
    let distinct = 0;

    while (left < s.length) {
        // Expand window to the right
        while (right < s.length && distinct <= k) {
            if (!map[s[right]]) {
                distinct++;
            }
            map[s[right]] = (map[s[right]] || 0) + 1;
            if (distinct === k) count++;
            if (distinct > k) break;
            right++;
        }
        // Shrink window from the left
        map[s[left]]--;
        if (map[s[left]] === 0) {
            delete map[s[left]];
            distinct--;
        }
        left++;
        // Reset right if it falls behind left
        if (right < left) right = left;
    }
    return count;
}

// Example usage:
console.log(countKDistinctSubstrings("abc", 2)); // Output: 2