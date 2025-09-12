function countAge(){
    count = 0;
    return function(){
        return count++;
    }
}

let res = countAge();
console.log(res()) // 0
console.log(res()) // 1
console.log(res()) // 2


function multiplier(x) {
  return function(y) {
    return x * y;
  }
}

let double = multiplier(2);
console.log(double(5)); // 10
console.log(double(10)); // 20

let triple = multiplier(3);
console.log(triple(4)); // 12
