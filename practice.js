

Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]

function moveZeros(list){

    for(let i = 0; i< list.length; i++){
        if(list[i] === 0){
            let tempList= list.slice(i+1, list.length);
            tempList.push(list[i]);
        }
    }
}