# JavaScript String Methods (Classic → Latest)

## 1. Classic String Methods

### charAt()
Get character at specific index.
charAt(index) - index: position of character to return
"hello".charAt(1) → "e"
"hello".charAt(10) → "" (out of bounds returns empty string)

### charCodeAt()
Get Unicode value of character at index.
charCodeAt(index) - index: position of character
"hello".charCodeAt(1) → 101 (Unicode for 'e')

### concat()
Join strings together.
concat(...strings) - strings: one or more strings to concatenate
"hello".concat(" ", "world") → "hello world"
"a".concat("b", "c", "d") → "abcd"

### indexOf()
Find first occurrence of substring.
indexOf(searchString, fromIndex) - searchString: what to find, fromIndex: optional start position
"hello world".indexOf("o") → 4
"hello world".indexOf("o", 5) → 7 (search from index 5)
"hello world".indexOf("xyz") → -1 (not found)

### lastIndexOf()
Find last occurrence of substring.
lastIndexOf(searchString, fromIndex) - searchString: what to find, fromIndex: optional start position from end
"hello world".lastIndexOf("o") → 7
"hello world".lastIndexOf("o", 5) → 4 (search backwards from index 5)

### slice()
Extract portion of string.
slice(start, end) - start: inclusive, end: exclusive
"hello world".slice(0, 5) → "hello"
"hello world".slice(6) → "world"
"hello world".slice(-5) → "world" (negative counts from end)

### substring()
Extract substring between two indices.
substring(start, end) - start: inclusive, end: exclusive (swaps if start > end)
"hello world".substring(0, 5) → "hello"
"hello world".substring(5, 0) → "hello" (automatically swaps)

### substr()
Extract substring starting at index.
substr(start, length) - start: starting index, length: number of characters
"hello world".substr(6, 5) → "world"
"hello world".substr(-5, 3) → "wor"

### toLowerCase()
Convert to lowercase.
toLowerCase() - no parameters
"HELLO WORLD".toLowerCase() → "hello world"

### toUpperCase()
Convert to uppercase.
toUpperCase() - no parameters
"hello world".toUpperCase() → "HELLO WORLD"

### replace()
Replace first occurrence of pattern.
replace(searchValue, replaceValue) - searchValue: what to replace, replaceValue: replacement
"hello world".replace("world", "JavaScript") → "hello JavaScript"
"hello world".replace(/o/g, "0") → "hell0 w0rld" (regex for all occurrences)

### split()
Split string into array.
split(separator, limit) - separator: where to split, limit: optional max array length
"hello,world,test".split(",") → ["hello", "world", "test"]
"hello world".split(" ") → ["hello", "world"]
"hello".split("") → ["h", "e", "l", "l", "o"]
"a,b,c,d".split(",", 2) → ["a", "b"] (limit to 2 elements)

### trim()
Remove whitespace from both ends.
trim() - no parameters
"  hello world  ".trim() → "hello world"

---

## 2. Modern Additions (ES2015 → ES2020)

### startsWith()
Check if string starts with substring.
startsWith(searchString, position) - searchString: what to check, position: optional start position
"hello world".startsWith("hello") → true
"hello world".startsWith("world", 6) → true

### endsWith()
Check if string ends with substring.
endsWith(searchString, length) - searchString: what to check, length: optional string length to consider
"hello world".endsWith("world") → true
"hello world".endsWith("hello", 5) → true

### includes()
Check if string contains substring.
includes(searchString, position) - searchString: what to find, position: optional start position
"hello world".includes("world") → true
"hello world".includes("xyz") → false

### repeat()
Repeat string specified number of times.
repeat(count) - count: number of repetitions
"ha".repeat(3) → "hahaha"
"*".repeat(5) → "*****"

### padStart()
Pad string at beginning to target length.
padStart(targetLength, padString) - targetLength: desired length, padString: optional padding character
"5".padStart(3, "0") → "005"
"hello".padStart(8, "*") → "***hello"

### padEnd()
Pad string at end to target length.
padEnd(targetLength, padString) - targetLength: desired length, padString: optional padding character
"5".padEnd(3, "0") → "500"
"hello".padEnd(8, "*") → "hello***"

### trimStart()
Remove whitespace from beginning.
trimStart() - no parameters
"  hello world  ".trimStart() → "hello world  "

### trimEnd()
Remove whitespace from end.
trimEnd() - no parameters
"  hello world  ".trimEnd() → "  hello world"

---

## 3. Latest Additions (ES2021 → ES2025)

### replaceAll()
Replace all occurrences of pattern.
replaceAll(searchValue, replaceValue) - searchValue: what to replace, replaceValue: replacement
"hello world world".replaceAll("world", "JS") → "hello JS JS"
"aaa".replaceAll("a", "b") → "bbb"

### at()
Access character by index (supports negative).
at(index) - index: position to access (negative counts from end)
"hello".at(1) → "e"
"hello".at(-1) → "o"
"hello".at(10) → undefined (out of bounds)

### codePointAt()
Get Unicode code point at index.
codePointAt(index) - index: position of character
"hello".codePointAt(1) → 101
"🚀".codePointAt(0) → 128640

### normalize()
Return Unicode normalized form.
normalize(form) - form: optional normalization form ("NFC", "NFD", "NFKC", "NFKD")
"café".normalize("NFD") → "café" (decomposed form)

### localeCompare()
Compare strings according to locale.
localeCompare(compareString, locales, options) - compareString: string to compare
"a".localeCompare("b") → -1 (a comes before b)
"apple".localeCompare("Apple", "en", {sensitivity: "base"}) → 0

### match()
Match against regular expression.
match(regexp) - regexp: regular expression to match
"hello123".match(/\d+/) → ["123"]
"hello world".match(/\w+/g) → ["hello", "world"]

### search()
Search for regular expression match.
search(regexp) - regexp: regular expression to search
"hello123".search(/\d/) → 5
"hello".search(/\d/) → -1 (not found)
