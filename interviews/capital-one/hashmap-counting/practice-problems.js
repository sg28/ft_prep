
const arr = ['a', 'b', 'a', 'c', 'b', 'a'];

function count(arr){
    let freq = {};
    for(let elem of arr){
         freq[elem] = ((freq[elem] || 0) + 1);
    }
    return freq;
}
console.log(count(arr));