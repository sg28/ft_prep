// primitive type
let isDone: boolean = true;
let age: number = 22;
let userName: string = "Tim";

// Arrays
let ages: number[] = [1, 3, 4, 5, 6];
let names: string[] = ["tim", "jim"];

// Type Annotations on Functions

// specify parameter and reurn types
function greet(name: string): string {
    return `${name}`;
}

// optional parameters
function log(msg: string, userId: number) {
    return msg + userId;
}

// default parameters
function multiply(a: number, b: number = 5): number {
    return a * b;
}

// Object Types
function printCoord(pt: { x: number; y: number }) { }

// optional properties
function printName(
    obj:{
        first:string;
        last?:string
    })
{

}

// union types
function printId(id: number | string){
    return id;
}

// Type Aliases
type PointA = {
    x: number; 
    y : number
};
function printPoint(pt: PointA){
    return pt.x + pt.y;
}

// Interface
interface PointB{
    x: number;
    y: number
}
function drawPoint(pt: PointB){
    return pt.x + pt.y;
}


// interface extended
interface Animal {
    name: string
}

interface Dog extends Animal{
    age: number
}

function getMeAnimal(tommy: Dog){
    return tommy.name + tommy.age;
}


// literal Types
let direction = "left" | "right" | "Top";
direction = "right";  // [ OK ]
direction =  "botom"; // [ Not Ok ]


