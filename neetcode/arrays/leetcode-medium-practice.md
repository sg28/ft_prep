## 1. Maximum Subarray
Find the contiguous subarray with the largest sum and return that sum.
Example: Input: [-2,1,-3,4,-1,2,1,-5,4] → Output: 6 ([4,-1,2,1])

## 2. Maximum Sum Circular Subarray
Like Maximum Subarray, but the array is circular, so a subarray can wrap around from the end back to the start.
Example: Input: [5,-3,5] → Output: 10 ([5,5] wrapping around)

## 3. Maximum Product Subarray
Find the contiguous subarray with the largest product and return that product.
Example: Input: [2,3,-2,4] → Output: 6 ([2,3])

## 4. House Robber
Given amounts of money in houses in a row, find the max sum you can rob without robbing two adjacent houses.
Example: Input: [1,2,3,1] → Output: 4 (rob house 1 and house 3)

## 5. House Robber II
Same as House Robber, but the houses are arranged in a circle (first and last are adjacent).
Example: Input: [2,3,2] → Output: 3 (robbing houses 1 and 3 isn't allowed since they're adjacent)

## 6. Best Time to Buy and Sell Stock II
Given daily stock prices, find the max profit allowing multiple buy/sell transactions (must sell before buying again).
Example: Input: [7,1,5,3,6,4] → Output: 7 (buy at 1, sell at 5; buy at 3, sell at 6)

## 7. Permutation in String
Determine if any permutation of string s1 exists as a contiguous substring of s2.
Example: Input: s1="ab", s2="eidbaooo" → Output: true ("ba" is a permutation of "ab")

## 8. Find All Anagrams in a String
Return the starting indices of all substrings in s that are anagrams of p.
Example: Input: s="cbaebabacd", p="abc" → Output: [0,6]

## 9. Maximum Number of Vowels in a Substring of Given Length
Find the maximum number of vowels in any substring of the given length k.
Example: Input: s="abciiidef", k=3 → Output: 3 ("iii")

## 10. Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold
Count subarrays of size k whose average is >= threshold.
Example: Input: arr=[2,2,2,2,5,5,5,8], k=3, threshold=4 → Output: 3

## 11. Maximum Points You Can Obtain from Cards
You can take cards from either end of the array, k times total. Maximize the sum of the cards taken.
Example: Input: cardPoints=[1,2,3,4,5,6,1], k=3 → Output: 12 (take last 3 cards)

## 12. Frequency of the Most Frequent Element
You can increment elements of the array up to k times total; return the max possible frequency of any element.
Example: Input: nums=[1,4,8,13], k=5 → Output: 2

## 13. Grumpy Bookstore Owner
The owner is grumpy on some days (customers unsatisfied). Using a technique to make them satisfied for X consecutive days, maximize total satisfied customers.
Example: Input: customers=[1,0,1,2,1,2,1,0,1,1], grumpy=[0,1,0,1,0,1,0,1,0,1], X=3 → Output: 16

## 14. Longest Substring Without Repeating Characters
Find the length of the longest substring without repeating characters.
Example: Input: s="abcabcbb" → Output: 3 ("abc")

## 15. Longest Repeating Character Replacement
You can replace up to k characters in the string; find the length of the longest substring of a single repeating character achievable.
Example: Input: s="AABABBA", k=1 → Output: 4

## 16. Fruit Into Baskets
You have two baskets, each can only hold one type of fruit. Find the max length of a contiguous subarray with at most 2 distinct fruit types.
Example: Input: fruits=[1,2,1] → Output: 3

## 17. Max Consecutive Ones III
Given a binary array, find the max number of consecutive 1s if you can flip at most k 0s to 1s.
Example: Input: nums=[1,1,1,0,0,0,1,1,1,1,0], k=2 → Output: 6

## 18. Minimum Size Subarray Sum
Find the length of the shortest contiguous subarray whose sum is >= target.
Example: Input: target=7, nums=[2,3,1,2,4,3] → Output: 2 ([4,3])

## 19. Subarray Product Less Than K
Count the number of contiguous subarrays where the product of all elements is less than k.
Example: Input: nums=[10,5,2,6], k=100 → Output: 8

## 20. Longest Turbulent Subarray
Find the length of the longest subarray where the comparison sign between consecutive elements alternates.
Example: Input: arr=[9,4,2,10,7,8,8,1,9] → Output: 5

## 21. Count Number of Nice Subarrays
Count subarrays with exactly k odd numbers.
Example: Input: nums=[1,1,2,1,1], k=3 → Output: 2

## 22. Binary Subarrays With Sum
Count the number of subarrays with sum equal to goal, in a binary array.
Example: Input: nums=[1,0,1,0,1], goal=2 → Output: 4

## 23. Longest Subarray of 1's After Deleting One Element
Given a binary array, find the length of the longest subarray of 1s after deleting at most one element.
Example: Input: nums=[1,1,0,1] → Output: 3

## 24. Two Sum II - Input Array Is Sorted
Given a sorted array, find the indices of two numbers that add up to a target.
Example: Input: numbers=[2,7,11,15], target=9 → Output: [1,2]

## 25. 3Sum
Find all unique triplets in the array that sum to zero.
Example: Input: nums=[-1,0,1,2,-1,-4] → Output: [[-1,-1,2],[-1,0,1]]

## 26. 3Sum Closest
Find the sum of three integers in the array that is closest to the target.
Example: Input: nums=[-1,2,1,-4], target=1 → Output: 2 (-1+2+1)

## 27. Container With Most Water
Given heights at each index, find two lines that together with the x-axis form a container holding the most water.
Example: Input: height=[1,8,6,2,5,4,8,3,7] → Output: 49

## 28. Sort Colors
Sort an array of 0s, 1s, and 2s in place so equal elements are adjacent, in order (Dutch national flag problem).
Example: Input: nums=[2,0,2,1,1,0] → Output: [0,0,1,1,2,2]

## 29. Remove Duplicates from Sorted Array II
Remove duplicates in a sorted array in place so each element appears at most twice, return the new length.
Example: Input: nums=[1,1,1,2,2,3] → Output: 5, nums=[1,1,2,2,3,...]

## 30. Boats to Save People
Each boat can carry at most 2 people with combined weight <= limit. Find the minimum number of boats needed.
Example: Input: people=[3,2,2,1], limit=3 → Output: 3

## 31. 4Sum
Find all unique quadruplets in the array that sum to the target.
Example: Input: nums=[1,0,-1,0,-2,2], target=0 → Output: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]

## 32. Partition Labels
Partition a string into as many parts as possible so each letter appears in at most one part.
Example: Input: s="ababcbacadefegdehijhklij" → Output: [9,7,8]

## 33. Interval List Intersections
Given two lists of sorted, disjoint intervals, return their intersection.
Example: Input: firstList=[[0,2],[5,10]], secondList=[[1,5],[8,12]] → Output: [[1,2],[5,5],[8,10]]

## 34. Product of Array Except Self
Return an array where each element is the product of all other elements, without using division.
Example: Input: nums=[1,2,3,4] → Output: [24,12,8,6]

## 35. Subarray Sum Equals K
Count the number of subarrays whose sum equals k.
Example: Input: nums=[1,1,1], k=2 → Output: 2

## 36. Contiguous Array
Find the length of the longest contiguous subarray with an equal number of 0s and 1s.
Example: Input: nums=[0,1,0] → Output: 2

## 37. Range Sum Query 2D - Immutable
Design a data structure to quickly compute the sum of elements inside a rectangle of a 2D matrix.
Example: Input: matrix, sumRegion(2,1,4,3) → Output: 8

## 38. Continuous Subarray Sum
Determine if the array has a contiguous subarray of size at least 2 whose sum is a multiple of k.
Example: Input: nums=[23,2,4,6,7], k=6 → Output: true ([2,4] sums to 6)

## 39. Minimum Operations to Reduce X to Zero
You can remove elements from either end of the array; find the minimum number of removals so the removed elements sum to x.
Example: Input: nums=[1,1,4,2,3], x=5 → Output: 2

## 40. Number of Ways to Split Array
Count the ways to split the array into two parts so the sum of the left part is >= sum of the right part.
Example: Input: nums=[10,4,-8,7] → Output: 2

## 41. Corporate Flight Bookings
Given booking ranges with seat counts, return the total seats booked for each flight number.
Example: Input: bookings=[[1,2,10],[2,3,20],[2,5,25]], n=5 → Output: [10,55,45,25,25]

## 42. Daily Temperatures
For each day, find how many days you'd have to wait until a warmer temperature.
Example: Input: temperatures=[73,74,75,71,69,72,76,73] → Output: [1,1,4,2,1,1,0,0]

## 43. Evaluate Reverse Polish Notation
Evaluate the value of an arithmetic expression given in Reverse Polish Notation.
Example: Input: tokens=["2","1","+","3","*"] → Output: 9

## 44. Next Greater Element II
Given a circular array, return the next greater element for every element.
Example: Input: nums=[1,2,1] → Output: [2,-1,2]

## 45. Online Stock Span
Design an algorithm that collects daily stock price spans (number of consecutive prior days with price <= today's).
Example: Input: prices=[100,80,60,70,60,75,85] → Output spans: [1,1,1,2,1,4,6]

## 46. Asteroid Collision
Given asteroids moving in a line, simulate collisions and return the state after all collisions.
Example: Input: asteroids=[5,10,-5] → Output: [5,10]

## 47. Decode String
Decode a string encoded with the pattern k[encoded_string], where the encoded string is repeated k times.
Example: Input: s="3[a2[c]]" → Output: "accaccacc"

## 48. Simplify Path
Given an absolute Unix-style file path, simplify it to its canonical form.
Example: Input: path="/a/./b/../../c/" → Output: "/c"

## 49. Remove K Digits
Remove k digits from a number string to make it the smallest possible number.
Example: Input: num="1432219", k=3 → Output: "1219"

## 50. Car Fleet
Given positions and speeds of cars heading to the same destination, count how many car fleets will arrive.
Example: Input: target=12, position=[10,8,0,5,3], speed=[2,4,1,1,3] → Output: 3
