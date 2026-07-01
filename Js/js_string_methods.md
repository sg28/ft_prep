## 1. Classic String Methods

### charAt()

Get character at specific index. charAt(index) - index: position of character to return

```js
"hello".charAt(1) → "e"
"hello".charAt(10) → "" (out of bounds returns empty string)
```

### charCodeAt()

Get Unicode value of character at index. charCodeAt(index) - index: position of character

```js
"hello".charCodeAt(1) → 101 (Unicode for 'e')
```

### concat()

Join strings together. concat(...strings) - strings: one or more strings to concatenate

```js
"hello".concat(" ", "world") → "hello world"
"a".concat("b", "c", "d") → "abcd"
```

### indexOf()

Find first occurrence of substring. indexOf(searchString, fromIndex) - searchString: what to find, fromIndex: optional start position

```js
"hello world".indexOf("o") → 4
"hello world".indexOf("o", 5) → 7 (search from index 5)
"hello world".indexOf("xyz") → -1 (not found)
```

### lastIndexOf()

Find last occurrence of substring. lastIndexOf(searchString, fromIndex) - searchString: what to find, fromIndex: optional start position from end

```js
"hello world".lastIndexOf("o") → 7
"hello world".lastIndexOf("o", 5) → 4 (search backwards from index 5)
```

### slice()

Extract portion of string. slice(start, end) - start: inclusive, end: exclusive

```js
"hello world".slice(0, 5) → "hello"
"hello world".slice(6) → "world"
"hello world".slice(-5) → "world" (negative counts from end)
```

### substring()

Extract substring between two indices. substring(start, end) - start: inclusive, end: exclusive (swaps if start &gt; end)

```js
"hello world".substring(0, 5) → "hello"
"hello world".substring(5, 0) → "hello" (automatically swaps)
```

### substr()

Extract substring starting at index. substr(start, length) - start: starting index, length: number of characters

```js
"hello world".substr(6, 5) → "world"
"hello world".substr(-5, 3) → "wor"
```

### toLowerCase()

Convert to lowercase. toLowerCase() - no parameters

```js
"HELLO WORLD".toLowerCase() → "hello world"
```

### toUpperCase()

Convert to uppercase. toUpperCase() - no parameters

```js
"hello world".toUpperCase() → "HELLO WORLD"
```

### replace()

Replace first occurrence of pattern. replace(searchValue, replaceValue) - searchValue: what to replace, replaceValue: replacement

```js
"hello world".replace("world", "JavaScript") → "hello JavaScript"
"hello world".replace(/o/g, "0") → "hell0 w0rld" (regex for all occurrences)
```

### split()

Split string into array. split(separator, limit) - separator: where to split, limit: optional max array length

```js
"hello,world,test".split(",") → ["hello", "world", "test"]
"hello world".split(" ") → ["hello", "world"]
"hello".split("") → ["h", "e", "l", "l", "o"]
"a,b,c,d".split(",", 2) → ["a", "b"] (limit to 2 elements)
```

### trim()

Remove whitespace from both ends. trim() - no parameters

```js
"  hello world  ".trim() → "hello world"
```

---

## 2. Modern Additions (ES2015 → ES2020)

### startsWith()

Check if string starts with substring. startsWith(searchString, position) - searchString: what to check, position: optional start position

```js
"hello world".startsWith("hello") → true
"hello world".startsWith("world", 6) → true
```

### endsWith()

Check if string ends with substring. endsWith(searchString, length) - searchString: what to check, length: optional string length to consider

```js
"hello world".endsWith("world") → true
"hello world".endsWith("hello", 5) → true
```

### includes()

Check if string contains substring. includes(searchString, position) - searchString: what to find, position: optional start position

```js
"hello world".includes("world") → true
"hello world".includes("xyz") → false
```

### repeat()

Repeat string specified number of times. repeat(count) - count: number of repetitions

```js
"ha".repeat(3) → "hahaha"
"*".repeat(5) → "*****"
```

### padStart()

Pad string at beginning to target length. padStart(targetLength, padString) - targetLength: desired length, padString: optional padding character

```js
"5".padStart(3, "0") → "005"
"hello".padStart(8, "*") → "***hello"
```

### padEnd()

Pad string at end to target length. padEnd(targetLength, padString) - targetLength: desired length, padString: optional padding character

```js
"5".padEnd(3, "0") → "500"
"hello".padEnd(8, "*") → "hello***"
```

### trimStart()

Remove whitespace from beginning. trimStart() - no parameters

```js
"  hello world  ".trimStart() → "hello world  "
```

### trimEnd()

Remove whitespace from end. trimEnd() - no parameters

```js
"  hello world  ".trimEnd() → "  hello world"
```

---

## 3. Latest Additions (ES2021 → ES2025)

### replaceAll()

Replace all occurrences of pattern. replaceAll(searchValue, replaceValue) - searchValue: what to replace, replaceValue: replacement

```js
"hello world world".replaceAll("world", "JS") → "hello JS JS"
"aaa".replaceAll("a", "b") → "bbb"
```

### at()

Access character by index (supports negative). at(index) - index: position to access (negative counts from end)

```js
"hello".at(1) → "e"
"hello".at(-1) → "o"
"hello".at(10) → undefined (out of bounds)
```

### codePointAt()

Get Unicode code point at index. codePointAt(index) - index: position of character

```js
"hello".codePointAt(1) → 101
"🚀".codePointAt(0) → 128640
```

### normalize()

Return Unicode normalized form. normalize(form) - form: optional normalization form ("NFC", "NFD", "NFKC", "NFKD")

```js
"café".normalize("NFD") → "café" (decomposed form)
```

### localeCompare()

Compare strings according to locale. localeCompare(compareString, locales, options) - compareString: string to compare

```js
"a".localeCompare("b") → -1 (a comes before b)
"apple".localeCompare("Apple", "en", {sensitivity: "base"}) → 0
```

### match()

Match against regular expression. match(regexp) - regexp: regular expression to match

```js
"hello123".match(/\d+/) → ["123"]
"hello world".match(/\w+/g) → ["hello", "world"]
```

### search()

Search for regular expression match. search(regexp) - regexp: regular expression to search

```js
"hello123".search(/\d/) → 5
"hello".search(/\d/) → -1 (not found)
```

### matchAll()

Return an iterator of all regex matches (regexp must have the `g` flag). matchAll(regexp) - regexp: regular expression with global flag

```js
[..."hello world".matchAll(/o/g)] → matches at index 4 and 7
```

### toLocaleLowerCase() / toLocaleUpperCase()

Convert case using locale-specific rules (differs from toLowerCase/toUpperCase for some locales). toLocaleLowerCase(locale) / toLocaleUpperCase(locale) - locale: optional BCP 47 language tag

```js
"İstanbul".toLocaleLowerCase("tr") → "istanbul" (Turkish dotted İ → dotless i)
"istanbul".toLocaleUpperCase("tr") → "İSTANBUL" (Turkish dotless i → dotted İ)
```

### toString() / valueOf()

Return the primitive string value. toString() / valueOf() - no parameters

```js
"hello".toString() → "hello"
"hello".valueOf() → "hello"
```

### String.fromCharCode() / String.fromCodePoint()

Build a string from UTF-16 code units or Unicode code points (static methods). String.fromCharCode(...codes) / String.fromCodePoint(...codePoints) - codes/codePoints: numbers to convert

```js
String.fromCharCode(104, 105) → "hi"
String.fromCodePoint(128640) → "🚀"
```

### String.raw()

Return the raw (unescaped) string form of a template literal (static method). String.raw(templateStrings, ...substitutions) - used as a tag function for template literals

```js
String.raw`Line1\nLine2` → "Line1\\nLine2" (backslash-n kept literal, not a newline)
```

### isWellFormed() / toWellFormed()

Check for or fix lone (unpaired) UTF-16 surrogates in a string (ES2024). isWellFormed() - no parameters, returns true/false toWellFormed() - no parameters, returns a new string with lone surrogates replaced

```js
"hello".isWellFormed() → true
"\uD800".isWellFormed() → false (lone surrogate)
"\uD800".toWellFormed() → "�" (replaced with U+FFFD)
```