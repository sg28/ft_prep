/*
    Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
    Output: [[1,6],[8,10],[15,18]]
*/


function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  let result = [];

  for (let interval of intervals) {

    // Case A: If result is empty OR current interval starts after last merged interval ends
    if (result.length === 0 || result[result.length - 1][1] < interval[0]) {
      // → No overlap, so just add this interval as a new one
      result.push(interval);
    } else {
      // Case B: Overlap exists
      // → Merge by updating the end of the last merged interval
      // Take the maximum end between the last interval and the current one
      result[result.length - 1][1] = Math.max(
        result[result.length - 1][1], 
        interval[1]
      );
    }
  }

  return result;
}
