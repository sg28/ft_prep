// Function Type Expressions
function greeter(fn:(a:string) => void){
    fn('hello');
}

function printToConsole(s:string){
    console.log(s);
}

greeter(printToConsole);


//  Call Signatures
type DescribableFunction = {
    description: string;
    (someArg: number):boolean
};

function doSomething(fn:DescribableFunction){
    console.log(fn.description + ' - ', fn(5));
}


// Generic Functions
/*
    <T> :   This allows the function to work with any 
            data type—like strings, numbers, or 
            objects—while maintaining type safety.
*/
function firstElement<T>(arr : T[]) : T | undefined {
    return arr[0];
}

let s = firstElement(["a", "v"]);
let n = firstElement([1,2,3,4]);