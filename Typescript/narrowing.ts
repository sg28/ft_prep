/*
    Type Guards
*/ 

function printId(id: number | string){
    if(typeof id === "string"){
        console.log(id)
    }
    else{
        console.log(id)
    }
}

// Truthiness Narrowing.
function print(msg?: string) {
  if (msg) {
    // Here msg: string
    console.log(msg.toUpperCase());
  } else {
    // Here msg: undefined
    console.log("No message");
  }
}
/*
    msg is an optional parameter.
    ? means the parameter can be present or it can be undefined.
    If the parameter is present then it is expected to be a String.
*/

// Equality Narrowing
function compare(x: string | number, y :string | boolean){
    if(x === y){
        console.log('x and y both are string');
    }else{
        console.log('x and y both are not of same type');
    }
}


// Check if property exixsts in an object

type Fish = {
    swim: ()=> void
};

type Bird = {
    fly: ()=> void
}

function move(animal: Fish | Bird){
    if("swim" in animal){
        animal.swim();
    }
    else{
        animal.fly();
    }
}
