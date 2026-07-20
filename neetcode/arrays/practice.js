
// Delete from the Ith index- shift left.
function deleteFromIthPosition(
    list, 
    index
){
    for(let i = index; i < list.length - 1; i++){
        list[i] = list[i+1];
    }
    list.length--;
}

// Inserting at the iTh Position
function insertAtiThPosition(
    list,
    index
){
    for(let i = list.length; i>index;i--){
        list[i] = list[i-1];
    }
    list.length++;
}

// Sliding window Fixed Size.
function SlidingWindowFixed(
    nums, k
){
    let window = new Set();
    let leftIndex = 0;

    for(let rightIndex = 0; rightIndex < nums.length; rightIndex++){
        // Check if the diff is >= k
        if( rightIndex - leftIndex + 1 >= k){
            window.delete(leftIndex);
            leftIndex++;
        }
        // If element already exists in the window, return true.
        if(window.has(nums[rightIndex])){
            return true;
        }

        // Add nums[rightIndex] to the window.
        window.add(nums[rightIndex]);
    }
    return false;
}


// Sliding Window Variable
// longest subarray with same value
function slidingWindowVariable(
    nums,
){
    let leftIndex = 0;
    let length = 0;
    for(let rightIndex = 0; rightIndex < nums.length; rightIndex++){
        if(nums[leftIndex] !== nums[rightIndex]){
            leftIndex = rightIndex;
        }
        length = Math.max(length , rightIndex - leftIndex + 1);
    }
    return length;
}

// shortest subarray whose total >= target
function shortestWithTotal(
    nums,
    target
){
    let leftIndex = 0;
    let total = 0;
    let length = Infinity;

    for(let rightIndex = 0; rightIndex < nums.length; rightIndex++){
        total = total + nums[rightIndex];
        while(total >= target){
            length = Math.min(length , rightIndex - leftIndex + 1);
            total = total - nums[leftIndex];
            leftIndex++;
        }
    }
    if(length === Infinity) return 0;
    return length;
}