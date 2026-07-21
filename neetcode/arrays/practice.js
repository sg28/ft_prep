
function deleteFromIthPosition(
    list,
    index
){
    for(let i = index; i < list.length - 1; i++){
        list[i] = list[i+1];
    }
    list.length--;
}

function insertAtiThPosition(
    list,
    index
){
    for(let i = list.length; i>index;i--){
        list[i] = list[i-1];
    }
    list.length++;
}

function SlidingWindowFixed(
    nums, k
){
    let window = new Set();
    let leftIndex = 0;

    for(let rightIndex = 0; rightIndex < nums.length; rightIndex++){
        if( rightIndex - leftIndex + 1 >= k){
            window.delete(leftIndex);
            leftIndex++;
        }
        if(window.has(nums[rightIndex])){
            return true;
        }

        window.add(nums[rightIndex]);
    }
    return false;
}


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