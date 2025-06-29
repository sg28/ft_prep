
var insert = function(currentInterval, newInterval) {
    let result = [];
    let i = 0;
    while (i < currentInterval.length && currentInterval[i][1] < newInterval[0]) {
        result.push(currentInterval[i]);
        i++;
    }
    while (i < currentInterval.length && currentInterval[i][0] <= newInterval[1]) {
        newInterval = [
            Math.min(currentInterval[i][0], newInterval[0]),
            Math.max(currentInterval[i][1], newInterval[1])
        ];
        i++;
    }
    result.push(newInterval);
    while (i < currentInterval.length) {
        result.push(currentInterval[i]);
        i++;
    }
    return result;
};