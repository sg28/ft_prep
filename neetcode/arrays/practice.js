
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