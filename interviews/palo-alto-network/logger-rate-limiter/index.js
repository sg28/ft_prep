/*
DESCRIPTION
Design a logger system that enforces a 10-second rate limit per unique message. The shouldPrintMessage(timestamp, message) method should return true if the message hasn't been printed in the last 10 seconds, otherwise false. For example, if "foo" is logged at timestamp 1, it can't be logged again until timestamp 11 or later.

Input:

shouldPrintMessage(1, "foo") → true
shouldPrintMessage(2, "bar") → true
shouldPrintMessage(3, "foo") → false
shouldPrintMessage(8, "bar") → false
shouldPrintMessage(10, "foo") → false
shouldPrintMessage(11, "foo") → true
Output:

true, true, false, false, false, true

Explanation: "foo" at timestamp 1 blocks until 11. "bar" at timestamp 2 blocks until 12. Requests within the 10-second window return false.

Constraints:

Timestamps are in seconds and arrive in chronological order
Multiple unique messages can be tracked simultaneously
Each message has an independent 10-second window

*/

let map = new Map();
function shouldPrintMessage(t, m) {
  // If the message exists in the map.
  if (map.has(m)) {
    let diff = Math.floor(t - map.get(m));
    if (diff < 10) return false;
    else {
      map.set(m, t);
      return true;
    }
  }
  // If the message does not exists in the map.
  else {
    map.set(m, t);
  }
  return true;
}

// Test cases

const calls = [[1, "foo"], [2, "bar"], [3, "foo"], [8, "bar"], [10, "foo"], [11, "foo"]];
const expected = [true, true, false, false, false, true];
const actual = calls.map(([t, m]) => shouldPrintMessage(t, m));
console.log("example:", JSON.stringify(actual) === JSON.stringify(expected) ? "PASS" : "FAIL", actual);

map.clear();
console.log(shouldPrintMessage(0, "baz") === true ? "PASS" : "FAIL", "first print at t=0");
console.log(shouldPrintMessage(1, "baz") === false ? "PASS" : "FAIL", "blocked 1s later");
console.log(shouldPrintMessage(10, "baz") === true ? "PASS" : "FAIL", "allowed again at diff=10");
