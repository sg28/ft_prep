
//  primitives
const personName: string = 'tim';
let age: number = 20;
let isActive: boolean = true;

// Arrays
let nums : number[] = [1,2,3,4,];
let names: string[] = ['tim', 'jim', 'lim'];

// Tuples. Fixed length, ordered arrays with specific types
let person: [string, number];
person = ['alice', 30];


// Enums


// any: opt out of type checking
let data:any = 33;

// unknown: alternative to any. But we need to do type checking for this scenario.
let value:unknown = "helloWorld";

// void: Function that doesn't return anything
function helloWorld(msg):void{
    return msg;
}


//never: represents values that never happen
function fail(msg:string): never {
    throw new Error(msg);
}

