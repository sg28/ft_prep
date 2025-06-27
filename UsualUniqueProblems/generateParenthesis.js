/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function(n) {
    const res = [];
    helper(res, '', 0,0,n);
    return res;
};

let helper =(res, curr, open, close, n)=>{

if(curr.length === 2 * n){
    res.push(curr);
    return;
}
if(open < n){
    helper(res, curr+ '(', open+1, close, n);
}
 if (close < open) {
    helper(res, curr+ ')', open, close+1, n)
}
}