
/*
Container with most water.
    [1,8,6,2,5,4,8,3,7]
*/

let tank = [1,8,6,2,5,4,8,3,7];
function containerWithMostWater(tank){
    let left = 0;
    let right = tank.length-1;
    let area = -1;

    while(left < right){
        let height = Math.min(tank[left], tank[right]);
        let width = right - left;
        if(area < Math.floor(height * width)){
            area = Math.floor(height * width);
        }
        if(tank[left] < tank[right]){
            left++;
        }else{
            right--;
        }
    }
    return area;
}
console.log(containerWithMostWater(tank));