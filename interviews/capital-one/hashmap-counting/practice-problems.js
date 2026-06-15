
const arr = ['a', 'b', 'a', 'c', 'b', 'a'];


function count(list) {
    let freq = {};
    for (let item of list) {
        freq[item] = (freq[item] ?? 0) + 1;
    }
    return freq;
} 

/*
    1. First Non-Repeating Character
    Find the first character that appears only once.
    Input:  "aabbcdd"
    Output: "c"
*/

function firstNonRepeatingCharacter(str){
    if(str.length <= 0) return 'none';
    if(str.length === 1) return str[0];
    let list = str.split('');
    
    let freq = {};
    for(let elem of list){
        freq[elem] = (freq[elem] ?? 0) + 1;
    }
    for(let elem in freq){
        if(freq[elem] === 1) return elem;
    }

    return 'none';
}
let res = firstNonRepeatingCharacter("aabbcdd");
console.log(res);


/*
Move 1 — Loop input again (first/Nth match)

2. First Unique Number
Same as #1 but with numbers in an array.
Input:  [9, 4, 9, 6, 7, 4]
Output: 6
3. First Letter to Appear Twice
Find the first letter whose second occurrence comes before any other letter's second occurrence.
Input:  "abccbaacz"
Output: "c"
4. First Recurring Character
Find the first character that has appeared before.
Input:  "ABCA"
Output: "A"
5. Append Frequency
Append each character's total frequency next to it.
Input:  "aabbc"
Output: "a2a2b2b2c1"
6. Find the Difference
Two strings — t is s shuffled with one extra letter added. Find the extra letter.
Input:  s = "abcd", t = "abcde"
Output: "e"
7. Uncommon Words from Two Sentences
Words that appear exactly once total across both sentences.
Input:  s1 = "this apple is sweet", s2 = "this apple is sour"
Output: ["sweet", "sour"]
8. Find Common Characters
Characters that appear in every string of the list (with their minimum count).
Input:  ["bella", "label", "roller"]
Output: ["e", "l", "l"]

Move 2 — Loop the map (find all matches)
9. Find All Duplicates in Array
All numbers that appear exactly twice (numbers in range 1 to n).
Input:  [4, 3, 2, 7, 8, 2, 3, 1]
Output: [2, 3]
10. Single Number
Every element appears twice except one. Find that one.
Input:  [4, 1, 2, 1, 2]
Output: 4
11. Intersection of Two Arrays II
Return elements that appear in both arrays, with their min count.
Input:  [1, 2, 2, 1], [2, 2]
Output: [2, 2]
12. Majority Element
The element that appears more than n/2 times (guaranteed to exist).
Input:  [3, 2, 3]
Output: 3
13. Majority Element II
All elements appearing more than n/3 times.
Input:  [3, 2, 3]
Output: [3]
14. Sum of Unique Elements
Sum of all elements that appear exactly once.
Input:  [1, 2, 3, 2]
Output: 4   // 1 + 3
15. Set Mismatch
An array [1..n] had one number duplicated and one missing. Find both.
Input:  [1, 2, 2, 4]
Output: [2, 3]   // 2 is the duplicate, 3 is missing
16. Maximum Number of Balloons
How many copies of "balloon" can you form from the letters in the string?
Input:  "loonbalxballpoon"
Output: 2
17. Ransom Note
Can you construct string a using only letters from string b?
Input:  a = "aa", b = "aab"
Output: true

Move 3 — Sort the map (top K / ranking)
18. Top K Frequent Elements
The K most frequently occurring elements.
Input:  nums = [1, 1, 1, 2, 2, 3], k = 2
Output: [1, 2]
19. Top K Frequent Words
Same but with alphabetical tie-break.
Input:  words = ["i","love","leetcode","i","love","coding"], k = 2
Output: ["i", "love"]
20. Sort Characters by Frequency
Rearrange the string so most frequent characters come first.
Input:  "tree"
Output: "eert"   // e appears twice, then t and r once
21. K Most Frequent Customers (Capital One flavor)
Top K customers by total transaction amount.
Input:  txns = [["alice",100],["bob",50],["alice",200],["carol",75]], k = 2
Output: ["alice", "carol"]
22. Least Number of Unique Integers After K Removals
Remove K elements to minimize the number of unique values.
Input:  arr = [5, 5, 4], k = 1
Output: 1   // remove the 4, only 5s left
23. Sort Array by Increasing Frequency
Sort by frequency ascending; ties broken by value descending.
Input:  [1, 1, 2, 2, 2, 3]
Output: [3, 1, 1, 2, 2, 2]

Move 4 — Compare keys (anagram/equivalence)
24. Valid Anagram
Are two strings anagrams of each other?
Input:  s = "anagram", t = "nagaram"
Output: true
25. Group Anagrams
Group strings that are anagrams of each other.
Input:  ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
26. Find All Anagrams in a String
Return start indices where an anagram of p appears in s.
Input:  s = "cbaebabacd", p = "abc"
Output: [0, 6]
27. Isomorphic Strings
Can characters of s be one-to-one mapped to characters of t?
Input:  s = "egg", t = "add"
Output: true   // e→a, g→d
28. Word Pattern
Does a string follow a pattern? Like regex but for whole words.
Input:  pattern = "abba", s = "dog cat cat dog"
Output: true
29. Permutation in String
Does s2 contain any permutation of s1?
Input:  s1 = "ab", s2 = "eidbaooo"
Output: true   // "ba" is in s2

Bonus — Two-Sum Family (special hashmap pattern)
This isn't pure counting — it's "look up the complement" — but it's the other half of the hashmap toolkit. Master both.
30. Two Sum
Indices of two numbers that add to target.
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
31. Contains Duplicate
Does any value appear at least twice?
Input:  [1, 2, 3, 1]
Output: true
32. Contains Duplicate II
Are there two equal values within K positions of each other?
Input:  nums = [1, 2, 3, 1], k = 3
Output: true
33. Longest Substring Without Repeating Characters
(Bridges into sliding window — Pattern 2.)
Input:  "abcabcbb"
Output: 3   // "abc"

*/