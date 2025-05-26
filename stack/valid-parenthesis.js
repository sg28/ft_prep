/*
    Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

    An input string is valid if:
    Open brackets must be closed by the same type of brackets.
    Open brackets must be closed in the correct order.
    Every close bracket has a corresponding open bracket of the same type.
    
    Example 1:

    Input: s = "()"
    Output: true

    Example 2:
    Input: s = "()[]{}"

*/

function validParenthesis(s){
    if((s.length % 2 !== 0)) return false;
    let map = {
        ")":"(",
        "}":"{",
        "[":"]"
    }
    let stack = [];
    for(let c of s){
        if(s[c] === '(' ||s[c] === '{' || s[c] === '[' ){
            stack.push(s[c]);
        }else if(s[c] === ')' ||s[c] === '}' || s[c] === ']' ){
            if(stack.pop() !== map[c]) return false;
        }
    }
    return true;

}

let res = validParenthesis("{[()]}");
console.log(" res ", res)

/*
    The approach is.
    why we need the map.
    All we checking if we get closing parenthesis, 
    we need to see if it exists in the map, otherwise it is not a valid parenthesis.

*/

