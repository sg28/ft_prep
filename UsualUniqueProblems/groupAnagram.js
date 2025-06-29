
/*
    Input: strs = ["eat","tea","tan","ate","nat","bat"]

    Output: [["bat"],["nat","tan"],["ate","eat","tea"]]


*/


var groupAnagrams = function(strs) {
    const anagramGroups = {};
    
    for (const str of strs) {
        const key = str.split('').sort().join('');
        if (anagramGroups[key]) anagramGroups[key].push(str);
        else anagramGroups[key] = [str];
    }
    
    return Object.values(anagramGroups);
};