
//  kaden's algorithm

function kaden(
    nums
){
    let maxSum = nums[0];
    let curSum = 0;
    let start, end = 0;
    let left = 0;

    for(let right = 0; right < nums.length; right++){

        if(curSum < 0){
            curSum = 0;
            left = right;
        }

        curSum += nums[right];
        if(curSum > maxSum){
            maxSum = curSum;
            start = left;
            end = right;
        }
    }
    return {maxSum, subArray:[start,end]};

}