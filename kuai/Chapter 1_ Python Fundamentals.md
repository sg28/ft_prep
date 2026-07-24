# Chapter 1: Python Fundamentals
This chapter lays the groundwork for your Python journey, focusing on the fundamental building blocks essential for writing effective and Pythonic code. We'll explore how Python handles data, organizes code into reusable blocks, and controls the flow of execution. Understanding these core concepts is crucial, especially for software engineering interviews where a solid grasp of language fundamentals is expected. Python is renowned for its readability and simplicity, and we'll touch upon some aspects that contribute to this.

## Section 1: Variables

Python variables are dynamically typed, which means you don't have to explicitly define their data type. The type is automatically determined based on the value assigned:

```python
n = 0  # n is an integer
print(n)

n = "abc"  # n now holds a string
print(n)

n = None  # Represents the absence of a value
print(n)
```

Python has a style guide called [PEP 8](https://peps.python.org/pep-0008/), which recommends using `snake_case` (all lowercase with underscores) for variable and function names (e.g., `my_variable`, `calculate_sum`). Adhering to PEP 8 improves code readability and consistency across Python projects.

### Parallel Assignment and Unpacking

Python allows assigning multiple variables at once, called parallel assignment:

```python
x, y = 10, "hello"
print(x, y)  # Output: 10 hello

# Using '*' to capture extra values
first, second, *others = [1, 2, 3, 4, 5]
print(first, second, others)  # Output: 1 2 [3, 4, 5]
```

### Swapping Values
Swapping two variables in Python is concise and doesn't require a temporary variable:

```python
a, b = 100, 200
a, b = b, a
print(a, b)  # Output: 200 100
```

### Compound Assignment Operators

Compound operators combine arithmetic operations with assignment:

```python
x = 10
x += 5  # Equivalent to x = x + 5
print(x)  # Output: 15
```

## Section 2: Data Types

Before diving into specific data types, it's important to understand the concept of **mutability** and **immutability**. Mutable objects can be changed after they are created, while immutable objects cannot. This distinction has significant implications for how you use and manage data in Python, affecting aspects like assignment, function arguments, and whether an object can be used as a key in a dictionary.

Python provides several built-in data types, each designed to handle different kinds of data efficiently. This section is an overview of the most commonly used types.

### Booleans and Logical Expressions

- **[Booleans (`bool`)](https://docs.python.org/3/library/stdtypes.html#typebool)**: Booleans are represented by `True` and `False`.

    ```python
    print(10 > 5)  # True
    print(bool(0))  # Zero is falsy, outputs False
    ```

- **[Truthy and Falsy Values](https://docs.python.org/3/library/stdtypes.html#truth-value-testing)**: In Python, values are considered "truthy" or "falsy" in a Boolean context. Most values are truthy except for a few, considered falsy, such as `None`, `False`, `0`, and empty sequences/collections (`''`, `[]`, `{}`).

    ```python
    # Truthy and Falsy examples
    if "hello":  # Non-empty string is truthy
        print("This is truthy")
    if []:  # Empty list is falsy
        print("This won't print")
    ```

- **[Boolean Operations](https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not)**: Understanding `and`, `or`, and `not` is essential for constructing complex logical conditions.
  **Operator Precedence**:
    * `not` has the highest precedence.
    * `and` comes next.
    * `or` has the lowest precedence.

    ```python
    is_editor = True
    is_locked = False
    user_role = "viewer"

    # Access granted if (user is editor AND document is not locked) OR user_role is "admin"
    if user_role == "admin" or is_editor and not is_locked:
        print("Access granted.")
    else:
        print("Access denied.")
    ```

### Binary and Hexadecimal Systems

- **Binary System**: The binary system (base-2) is integral to computing, representing all data at the machine level.
    ```python
    print(0b1011)  # Output: 11
    ```

- **Hexadecimal System**: The hexadecimal system (base-16) is often used to simplify binary representations.
    ```python
    print(0xFF5733)  # Output: 16744115
    ```

- **Conversions and Applications**: Converting between decimal, [binary](https://docs.python.org/3/library/functions.html#bin), and [hexadecimal](https://docs.python.org/3/library/functions.html#hex) is a frequent requirement in programming.
    ```python
    dec = 255
    print(bin(dec))  # '0b11111111' - binary representation
    print(hex(dec))  # '0xff' - hexadecimal representation
    ```

### Numeric Types

- **[Integers (`int`)](https://docs.python.org/3/library/functions.html#int)**: Integers represent whole numbers and support basic arithmetic, comparisons, and advanced operations. Python integers are **arbitrary-precision**, meaning they can grow as large as memory allows without overflow.

    ```python
    x = 3
    y = 4

    print(x + y)  # Output: 7 (addition)
    print(x - y)  # Output: -1 (subtraction)
    print(x * y)  # Output: 12 (multiplication)
    print(x // y)  # Output: 0 (integer division)
    print(x / y)  # Output: 0.75 (float division)
    print(x % y)  # Output: 3 (modulus)
    ```

    [Bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation) manipulate individual bits of integers, enabling efficient arithmetic and data processing. These operations are useful in tasks like flag manipulation, masking, and low-level programming.

    ```python
    x = 12  # binary: 1100
    y = 5   # binary: 0101

    # Bitwise AND
    print(x & y)  # Output: 4 (binary: 0100)
    # Bitwise OR
    print(x | y)  # Output: 13 (binary: 1101)
    # Bitwise XOR
    print(x ^ y)  # Output: 9 (binary: 1001)
    # Bitwise NOT
    print(~x)     # Output: -13 (binary: ...11110011)
    # Bitwise LEFT SHIFT
    print(x << 2) # Output: 48 (binary: 110000)
    # Bitwise RIGHT SHIFT
    print(x >> 2) # Output: 3 (binary: 0011)
    ```

- **[Floats (`float`)](https://docs.python.org/3/library/functions.html#float)**: Floats represent real numbers. Python uses the [IEEE 754 standard](https://en.wikipedia.org/wiki/IEEE_754) for floating-point numbers, which offers significant range and precision but introduces potential rounding errors. When precision is critical, such as in financial calculations or currency representations, avoid using `float`. Even small rounding errors can lead to inaccuracies. Consider using the [`Decimal` module](https://docs.python.org/3/library/decimal.html#module-decimal) for such cases.
    
    ```python
    # Floating-point precision
    a = 0.1
    b = 0.2
    print(a + b)  # Might not result exactly in 0.3 due to precision (e.g., 0.30000000000000004)
    
    # Scientific notation
    c = 1.5e2  # Equivalent to 1.5 * 10^2 or 150.0
    print(c)

    # Rounding
    print(round(3.14159, 2))  # Output: 3.14

    # Max / Min
    print(float("inf"))   # Positive infinity
    print(float("-inf"))  # Negative infinity
    ```

### Lists

[Lists](https://docs.python.org/3/library/stdtypes.html#typesseq-list) are mutable sequences, capable of storing heterogeneous elements.

- **List Operations**: Lists support various operations such as indexing, slicing, appending, and removing elements.
    ```python
    # Creating and initializing a list
    fruits = ["apple", "banana", "cherry", "date", "elderberry"]
    print(fruits[0])  # "apple"
    fruit1, fruit2, _, fruit3, _ = fruits  # '_' is a convention for a throwaway variable
    print(fruit1, fruit2, fruit3)  # Output: apple banana date
    fruits.append("orange")  # Adding an element
    print(fruits)  # ['apple', 'banana', 'cherry', 'date', 'elderberry', 'orange']
    fruits.pop(1)  # Removing the element at index 1 ("banana")
    print(fruits)  # ['apple', 'cherry', 'date', 'elderberry', 'orange']
    print(fruits[0:2])  # Slicing the list (elements at index 0 and 1) ['apple','cherry']
    ```

- **Iterating over Lists**: Iteration over lists is fundamental in Python, allowing the execution of operations on each element.
    ```python
    for fruit in fruits:
        print(fruit)
    ```
  
- **Size of a list**: Use `len()` to obtain the number of items in a list.
    ```python
    print(len([1, 2, 3]))  # Output: 3
    ```

- **List Comprehensions** offer a compact syntax to create lists based on existing iterables:
    ```python
    # Create a list of squares from 0 to 4
    squares = [x**2 for x in range(5)]
    print(squares)  # Output: [0, 1, 4, 9, 16]
    
    # Create a list of even numbers from another list
    numbers = [1, 2, 3, 4, 5, 6]
    evens = [x for x in numbers if x % 2 == 0]
    print(evens)  # Output: [2, 4, 6]
    ```

- **Generator Expressions** are similar to list comprehensions but create a generator object. Generators produce items one at a time and only when requested, making them memory-efficient for large sequences. They use parentheses instead of square brackets:

    ```python
    squares_generator = (x**2 for x in range(5))
    print(squares_generator)  # Output: <generator object <genexpr> at 0x...>
    for square in squares_generator:
        print(square, end=" ")  # Output: 0 1 4 9 16
    
    # Used with functions like sum(), all(), any()
    total = sum(x**2 for x in range(5))  # Sum of 0+1+4+9+16
    print(total)  # Output: 30
    ```

### Strings

[Strings](https://docs.python.org/3/library/stdtypes.html#textseq) are immutable sequences of Unicode characters. Once a string is created, its characters cannot be changed directly.

- **Accessing Characters**: Like lists, strings support indexing and slicing to access subsets of the string. Note that since strings are immutable, operations like replacing or modifying characters return a new string.  
    ```python
    phrase = "Python programming"
    print(phrase[0])        # 'P'

    print(phrase[7:])       # 'programming'
    print(phrase[::-1])     # Reverse the string: 'gnimmargorp nohtyP'

    print(len("test"))      # Output: 4
    ```

- **String Methods**: Python strings come with numerous methods that allow for advanced manipulation without altering the original string.
    ```python
    phrase = "Python programming"
    print(phrase.upper())         # Convert to uppercase: 'PYTHON PROGRAMMING'
    print(phrase.replace("Python", "C++"))  # Replace substring: 'C++ programming'

    csv_line = "apple,banana,cherry"
    items = csv_line.split(',')  # Split string by a delimiter
    print(items)  # Output: ['apple', 'banana', 'cherry']

    sentence = "This is a sentence."
    words = sentence.split()  # Default delimiter is whitespace
    print(words)  # Output: ['This', 'is', 'a', 'sentence.']
    ```

- **Concatenation**: Strings can be joined using the `+` operator or the `join()` method for combining multiple strings. The `join()` method is more efficient for joining many strings.
    ```python
    s = "abc"
    s += "def"  # s becomes 'abcdef'
    print(s)
    print("".join(["ab", "cd", "ef"]))  # 'abcdef'
    ```

- **Formatting**: Python provides several ways to format strings cleanly and efficiently.
    ```python
    name = "Alice" # Define name for the example
    print("Hello, {}!".format(name)) # Output: Hello, Alice!

    # F-string (Python 3.6+) - Recommended for modern Python
    error_code = 404
    message = f"Error: {error_code} - Page not found"
    print(message) # Output: Error: 404 - Page not found
    ```

- **Conversion between Types**: Convert strings to numbers and vice versa, which is useful in various computational contexts.
    ```python
    numeric_string = "123"
    print(numeric_string * 2)  # Output: "123123" (string repetition)
    print(int(numeric_string) * 2)  # Converts to integer and doubles it: 246
    print(str(1234))  # Converts integer 1234 to "1234"
    ```

- **Character ASCII Values**: Sometimes, the [ASCII code](https://en.wikipedia.org/wiki/ASCII) (or more broadly, Unicode code point) of a character is needed for algorithms.
    ```python
    print(ord("a"))  # ASCII/Unicode value of 'a': 97
    print(chr(97))   # Character from ASCII/Unicode value 97: 'a'
    ```

### Sets

[Sets](https://docs.python.org/3/library/stdtypes.html#set) are mutable collections that store unordered, unique elements. They are useful for membership testing, removing duplicates, and mathematical set operations.

- **Initialization**: Create a set using curly braces `{}` (but not for an empty set, as `{}` creates an empty dictionary) or the `set()` function, which is especially useful for converting other iterable types to a set or creating an empty set.
    ```python
    numbers = {1, 2, 3, 4, 5}
    print(numbers)  # Output: {1, 2, 3, 4, 5} (order may vary)
    empty_set = set()
    print(empty_set) # Output: set()
    list_to_set = set([1, 2, 2, 3])
    print(list_to_set) # Output: {1, 2, 3}
    ```

- **Adding Elements**: Use the `add()` method to add individual elements to a set.
    ```python
    numbers = {1, 2, 3}
    numbers.add(3) # Adding an existing element does nothing
    numbers.add(4)
    print(numbers)  # Output: {1, 2, 3, 4} (order may vary)
    ```

- **Removing Elements**: Use the `remove()` method to remove specific elements; this method will raise a `KeyError` if the element is not present. Use `discard()` to remove an element if it is present, without raising an error if it's not.
    ```python
    numbers = {1, 2, 3, 4, 5, 6}
    numbers.remove(1)
    print(numbers)  # Output: {2, 3, 4, 5, 6} (order may vary)
    # numbers.remove(10) # This would raise a KeyError
    numbers.discard(10) # Does nothing, no error
    numbers.discard(2)
    print(numbers) # Output: {3, 4, 5, 6} (order may vary)
    ```

- **Union**: Combines elements from multiple sets without duplication (operator `|`).
    ```python
    set1 = {1, 2, 3}
    set2 = {3, 4, 5}
    print(set1.union(set2))  # Output: {1, 2, 3, 4, 5}
    print(set1 | set2)       # Same using operator
    ```

- **Intersection**: Finds common elements between sets (operator `&`).
    ```python
    print(set1.intersection(set2))  # Output: {3}
    print(set1 & set2)            # Same using operator
    ```

- **Difference**: Identifies elements present in the first set but not in the others (operator `-`).
    ```python
    print(set1.difference(set2))  # Output: {1, 2}
    print(set1 - set2)           # Same using operator
    ```

### Dictionaries

[Dictionaries](https://docs.python.org/3/library/stdtypes.html#mapping-types-dict) are mutable collections that store data as key-value pairs. They are implemented as [Hash tables](https://en.wikipedia.org/wiki/Hash_table), designed for fast retrieval of data based on a unique key. Keys must be of an immutable type.

- **Creating and Initializing Dictionaries**:
    ```python
    person = {"name": "John", "age": 30, "city": "New York"}
    print(person["name"])  # Accesses value by key, output: John
    empty_dict = {}
    another_dict = dict(name="Jane", age=25)
    print(another_dict) # Output: {'name': 'Jane', 'age': 25}
    ```
    Since Python 3.7, dictionaries preserve insertion order. This means that when you iterate over a dictionary, the items will be returned in the order they were added.

- **Adding and Updating Entries**: Add or update entries simply by assigning a value to a key.
    ```python
    person = {"name": "John", "age": 30}
    person["age"] = 31  # Updates the age
    person["profession"] = "Engineer"  # Adds a new key-value pair
    print(person) # Output: {'name': 'John', 'age': 31, 'profession': 'Engineer'}
    ```

- **Removing Entries**: Use `del` to remove a key-value pair or `pop()` to remove and return the value.
    ```python
    person = {"name": "John", "age": 35, "profession": "Engineer", "city": "Los Angeles"}
    del person["city"] # Deletes the key 'city' along with its value
    profession = person.pop("profession") # Removes 'profession' and stores the value
    ```

- **Keys, Values, and Items**: Iterate over keys, values, or key-value pairs using `.keys()`, `.values()`, and `.items()` methods respectively. These methods return dictionary views, which are dynamic.
    ```python
    person = {"name": "John", "age": 30}
    for key in person.keys(): # Or simply: for key in person:
        print(key)

    for value in person.values():
        print(value)

    for key, value in person.items():
        print(f"{key}: {value}")
    ```

- **Checking for Key Existence**: Use the `in` keyword to check whether a key exists in the dictionary without causing an error:
    ```python
    person = {"name": "John", "age": 30}
    if "name" in person:
        print("Name found!")
    if "occupation" not in person:
        print("Occupation not found.")
    ```

- **Using `get()` Method**: The `get()` method returns the value for a key if it exists, otherwise a default value (which is `None` if not specified). This avoids `KeyError` exceptions.
    ```python
    person = {"name": "John", "age": 30}
    print(person.get("age", -1))      # Output: 30
    print(person.get("occupation"))   # Output: None
    print(person.get("occupation", "N/A")) # Output: N/A
    ```

### Tuples

[Tuples](https://docs.python.org/3/library/stdtypes.html#tuple) are similar to lists but with a crucial distinction—they are immutable. This immutability makes tuples a preferred choice for fixed data sequences and allows them to be used as keys in dictionaries or elements in sets, where mutable types like lists cannot.

- **Creating and Accessing Tuples**: Tuples are defined by enclosing elements in parentheses `()` and support similar indexing and slicing operations as lists.
    ```python
    tup = (1, 2, 3)
    print(tup)        # Output: (1, 2, 3)
    print(tup[0])     # Access the first element: 1
    print(tup[-1])    # Access the last element: 3

    empty_tuple = ()
    single_item_tuple = ("abc",)  # Note the trailing comma for a single item tuple
    also_single_item_tuple = "abc", # Parentheses are optional in many cases for tuple creation
    print(single_item_tuple) # Output: ('abc',)
    ```

- **Immutability**: Once a tuple is created, its elements cannot be changed, added, or removed, which enhances the integrity of the data.
    ```python
    tup = (1, 2, 3)
    # Attempting to modify a tuple will raise an error
    # tup[0] = 100  # TypeError: 'tuple' object doesn't support item assignment
    # tup.append(4) # AttributeError: 'tuple' object has no attribute 'append'
    ```

- **Tuples in Dictionaries**: The immutability of tuples allows them to be used as keys in dictionaries, which is not possible with lists.
    ```python
    myMap = {(1, 2): "point", (3, 4): "another point"}
    print(myMap[(1, 2)])  # Output: "point"
    # myMap[[1,2]] = "error" # This would raise TypeError: unhashable type: 'list'
    ```

- **Tuples in Sets**: Similarly, tuples can be added to sets while lists cannot.  
    ```python
    mySet = set()
    mySet.add((1, 2))
    mySet.add((1, 2)) # Adding the same tuple again has no effect
    print((1, 2) in mySet)  # Output: True
    # mySet.add([1, 2]) # This would raise TypeError: unhashable type: 'list'
    print(mySet) # Output: {(1, 2)}
    ```

## Section 3: Functions and Scope

Functions make Python code modular, reusable, and readable.

### Functions as First-Class Citizens

In Python, functions can be treated like any other object—assigned to variables, passed as arguments to other functions, or returned from them.

```python
def greet(name):
    return f"Hello, {name}!"

welcome = greet
print(welcome("Alice"))  # Output: Hello, Alice!

def apply_func(func, value):
    return func(value)

print(apply_func(greet, "Bob")) # Output: Hello, Bob!
```

### Function Parameters

Default values simplify function calls. Keyword arguments enhance readability:

```python
# Function with default parameters
def power(base, exponent=2):
    """Raise base to the power of exponent."""
    return base ** exponent

print(power(3))      # Output: 9 (exponent defaults to 2)
print(power(3, 3))   # Output: 27

# Keyword arguments enhance readability and allow passing arguments out of order
def register(name, role="User", department="General"):
    """Register a user with given details."""
    print(f"{name} registered as {role} in {department}")

register("Bob") # Output: Bob registered as User in General
register("Alice", department="HR") # Output: Alice registered as User in HR
register(role="Admin", name="Charlie") # Output: Charlie registered as Admin in General
```

### Variable-Length Arguments: `*args` and `**kwargs`

Functions can accept a flexible number of arguments using `*args` for positional arguments and `**kwargs` for keyword arguments:

```python
# *args: gathers extra positional arguments into a tuple
def sum_numbers(*args):
    """Return the sum of all provided numbers."""
    print(type(args)) # <class 'tuple'>
    return sum(args)

print(sum_numbers(1, 2, 3))  # Output: 6
print(sum_numbers(10, 20, 30, 40)) # Output: 100

# **kwargs: gathers extra keyword arguments into a dictionary
def user_profile(**kwargs):
    """Print user profile details."""
    print(type(kwargs)) # <class 'dict'>
    for key, value in kwargs.items():
        print(f"{key}: {value}")

user_profile(name="Alice", age=30, city="New York")
# Output:
# name: Alice
# age: 30
# city: New York
```

### Type Hints

Python is dynamically typed, but it supports optional type hints (introduced in [PEP 484](https://peps.python.org/pep-0484/)). Type hints allow you to indicate the expected types for variables, function parameters, and return values. They do not make Python statically typed (i.e., they are not enforced at runtime by default), but they are very useful for:

- Improving code readability and understanding.
- Enabling static analysis tools (like [MyPy](https://mypy-lang.org/)) to catch type errors before runtime.
- Enhancing IDE autocompletion and suggestions.

You will see type hints used in many of the function signatures in this book, like so:

```python
def greet_typed(name: str) -> str:
    """Greets a person with their name."""
    return f"Hello, {name}!"

# This function expects 'name' to be a string and is declared to return a string.
print(greet_typed("World"))
```

### Lambda Functions

Lambdas are short, anonymous functions defined with the `lambda` keyword. They are restricted to a single expression. They are often used for simple functions that are passed as arguments to higher-order functions.

```python
square = lambda x: x ** 2
print(square(4))  # Output: 16

# Useful with built-in functions like map(), filter(), sorted()
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda n: n**2, numbers))
print(squares)  # Output: [1, 4, 9, 16, 25]

evens = list(filter(lambda n: n % 2 == 0, numbers))
print(evens) # Output: [2, 4]
```

### Variable Scope

Python determines a variable's scope (visibility) by where it is defined ([lexical scoping](https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scope)):

* **Local variables:** defined inside functions; accessible only within that function.

    ```python
    def example():
        local_var = "I’m local"
        print(local_var)

    example()
    # print(local_var)  # Would raise NameError: name 'local_var' is not defined
    ```

* **Global variables:** defined outside functions (at the top level of a module); accessible throughout the module.

    ```python
    global_var = "I’m global"
    
    def access_global():
        print(global_var) # Accessing global_var
    
    access_global()  # Output: I’m global
    
    def try_modify_global():
        # global_var = "Trying to modify" # This would create a NEW local_var if 'global' keyword is not used
        # To modify a global variable from inside a function, you must use the 'global' keyword.
        pass
    ```
    
    To modify global variables inside a function, declare them explicitly with `global`:
    
    ```python
    counter = 0
    
    def increment():
        global counter # Declare that we are using the global variable 'counter'
        counter += 1
    
    increment()
    print(counter)  # Output: 1
    increment()
    print(counter)  # Output: 2
    ```

* **Nonlocal variables:** For nested functions, `nonlocal` allows modification of variables from an outer (enclosing) function's scope, but not the global scope.

    ```python
    def outer():
        count = 0 # Enclosing scope variable
    
        def inner():
            nonlocal count # Declare that 'count' refers to the 'count' in the enclosing scope
            count += 1
            return count
    
        print(f"Inner call 1 returns: {inner()}") # Output: Inner call 1 returns: 1
        print(f"Inner call 2 returns: {inner()}") # Output: Inner call 2 returns: 2
        return count # Returns the modified count from the outer function
    
    print(f"Outer function returns: {outer()}")  # Output: Outer function returns: 2
    ```

## Section 4: Control Flow

This section covers the essentials of control flow, including conditional statements, loops, and control flow mechanisms.

### Conditional Statements: `if`, `elif`, `else`

- **Basic [`if` Statements](https://docs.python.org/3/reference/compound_stmts.html#the-if-statement)**: The `if` statement evaluates a condition, executing the subsequent block only if the condition is `True`.
    ```python
    temperature = 30
    if temperature > 25:
        print("It's a hot day")
    ```

- **Branching with `else` and `elif`**: Extend the `if` statement with `elif` (else if) for multiple conditions, and `else` when no conditions are met.
    ```python
    age = 20
    if age < 13:
      print("You are a child.")
    elif age < 18:
      print("You are a teenager.")
    else:
      print("You are an adult.")  # Output: You are an adult.
    ```

- **Ternary Operator**: It allows for quick decisions in a single line. Syntax: `value_if_true if condition else value_if_false`:
    ```python
    age = 20
    status = "adult" if age >= 18 else "minor"
    print(status) # Output: adult
    ```

- **Nested `if` Statements**: Nesting `if` statements allow for checking multiple levels of conditions. However, deep nesting can reduce code readability. Limit nesting where possible and consider refactoring deeply nested conditions using helper functions or different logic structures.
    ```python
    age = 25
    has_license = True
    if age >= 18:
        print("Adult.")
        if has_license:
            print("Can drive.")
        else:
            print("Cannot drive yet (no license).")
    else:
        print("Minor.")
    ```

### Loops: `for` and `while`

- **[`for`](https://docs.python.org/3/reference/compound_stmts.html#for) Loops**: Use `for` loops to iterate over a sequence (like a list, tuple, or string) or any iterable object. They're ideal for executing a block of code a certain number of times or iterating over elements.

    ```python
    for char in "hello":
        print(char)
    # Output:
    # h
    # e
    # l
    # l
    # o

    # `range()` generates a sequence of numbers and supports
    # various forms to control the start, stop (exclusive), and step of
    # the sequence.
    for i in range(5):  # Looping from i = 0 to i = 4
        print(i, end=" ") # Output: 0 1 2 3 4
      
    for i in range(2, 6):  # Looping from i = 2 to i = 5
        print(i, end=" ") # Output: 2 3 4 5

    for i in range(5, 1, -1):  # Looping from i = 5 down to i = 2 (step is -1)
        print(i, end=" ") # Output: 5 4 3 2
    ```

- **[`while`](https://docs.python.org/3/reference/compound_stmts.html#the-while-statement) Loops**: A `while` loop continues to execute as long as the given condition is `True`. It's useful when the number of iterations isn't known before the loop starts.

    ```python
    count = 0
    while count < 5:
        print(count, end=" ")
        count += 1 # Crucial to update the condition variable to avoid infinite loop
    print() # Output: 0 1 2 3 4
    ```

### Loop Control: `break` and `continue`

- **Using [`break`](https://docs.python.org/3/reference/simple_stmts.html#the-break-statement)**: The `break` statement immediately exits the innermost `for` or `while` loop, providing a way to terminate the loop prematurely.

    ```python
    for i in range(10):
        if i == 5:
            break  # Exit the loop when i is 5
        print(i, end=" ")  # Output: 0 1 2 3 4
    ```

- **Using [`continue`](https://docs.python.org/3/reference/simple_stmts.html#the-continue-statement)**:The `continue` statement skips the rest of the code inside the loop for the current iteration and proceeds to the next iteration, allowing for selective execution.

    ```python
    for i in range(10):
        if i % 2 == 0: # If i is even
            continue  # Skip for even numbers
        print(i, end=" ")  # Output: 1 3 5 7 9
    ```

### Assertions

The `assert` statement is a debugging aid that tests a condition. If the condition is `True`, it does nothing. If the condition is `False`, it raises an `AssertionError` with an optional message. Assertions are used to check for internal errors or violated assumptions during development.

```python
def divide(a, b):
    assert b != 0, "Denominator cannot be zero"
    return a / b

print(divide(10, 2))  # Output: 5.0
# print(divide(10, 0))  # Raises AssertionError: Denominator cannot be zero
```

## Section 5: Error Handling and Exceptions

Error handling is a critical aspect of writing robust and reliable Python code. Python provides a comprehensive mechanism for detecting, handling, and raising exceptions to manage runtime errors gracefully.

### Understanding Exceptions

An exception is an event that occurs during program execution that disrupts the normal flow of instructions. When an error occurs, Python creates an exception object that contains information about the error (type of error, traceback, etc.). If an exception is not handled, the program terminates.

#### Common Built-in Exceptions

Python has numerous [built-in exceptions](https://docs.python.org/3/library/exceptions.html) to handle different types of errors:

```python
# TypeError: Occurs when an operation or function is applied to an object of inappropriate type.
try:
    x = '5' + 5
except TypeError as e:
    print(f"TypeError: {e}") # Output: TypeError: can only concatenate str (not "int") to str

# ValueError: Raised when a function receives an argument of the correct type but an inappropriate value.
try:
    x = int('abc')
except ValueError as e:
    print(f"ValueError: {e}") # Output: ValueError: invalid literal for int() with base 10: 'abc'

# ZeroDivisionError: Occurs when dividing by zero.
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"ZeroDivisionError: {e}") # Output: ZeroDivisionError: division by zero

# IndexError: Raised when trying to access an index that doesn't exist in a sequence (list, tuple, etc.).
my_list = [1, 2, 3]
try:
    print(my_list[5])
except IndexError as e:
    print(f"IndexError: {e}") # Output: IndexError: list index out of range

# KeyError: Occurs when trying to access a dictionary key that doesn't exist.
my_dict = {'a': 1, 'b': 2}
try:
    print(my_dict['c'])
except KeyError as e:
    print(f"KeyError: {e}") # Output: KeyError: 'c'
```

### Basic Exception Handling

The `try`-`except` block allows you to catch and handle exceptions, preventing your program from crashing. You can handle multiple specific exceptions in a single `except` block by passing them as a tuple, or have multiple `except` clauses. Using multiple except clauses is clearer if the handling logic for each exception type is different.

```python
try:
    x_str = input("Enter a number: ")
    x = int(x_str)
    result = 10 / x
    print(f"10 / {x} = {result}")
except ValueError:
    print("Invalid input. Please enter a whole number.")
except ZeroDivisionError:
    print("Cannot divide by zero!")

try:
    value_str = input("Enter a number for division: ")
    value = int(value_str)
    result = 100 / value
    print(f"Result is {result}")
except (ValueError, ZeroDivisionError) as e: # Catch either ValueError or ZeroDivisionError
    print(f"An error occurred: {e}. Please enter a valid non-zero number.")
```

### The `else` and `finally` Clauses

- `else`: The `else` block, if present, is executed only if the `try` clause does not raise an exception.
- `finally`: The `finally` block, if present, is always executed before leaving the `try` statement, whether an exception has occurred or not. This is useful for cleanup actions (e.g., closing files).

```python
try:
    x_str = input("Enter a number to divide 10 by: ")
    x = int(x_str)
    result = 10 / x
except ValueError:
    print("Invalid input: Not a valid integer.")
except ZeroDivisionError:
    print("Cannot divide by zero!")
else:
    # This runs only if no exception occurred in the try block
    print(f"Division successful! 10 / {x} = {result}")
finally:
    # This always runs, regardless of exceptions
    print("Execution of the try-except-else-finally block is complete.")
```

### EAFP vs. LBYL

Python culture often favors an approach called EAFP ("Easier to Ask for Forgiveness than Permission") over LBYL ("Look Before You Leap").

- **LBYL:** You explicitly check conditions before an operation.
    ```python
    # LBYL example
    my_dict = {"key": "value"}
    if "key" in my_dict: # Look before you leap
        print(my_dict["key"])
    else:
        print("Key not found")
    ```
- **EAFP:** You assume the operation will work and handle exceptions if it doesn't.
    ```python
    # EAFP example
    my_dict = {"key": "value"}
    try:
        print(my_dict["key"]) # Assume key exists
    except KeyError: # Ask for forgiveness if it doesn't
        print("Key not found")
    ```

For many scenarios, EAFP can lead to cleaner and more readable code, especially when dealing with potential errors that are not easily predictable or when checks themselves are cumbersome (e.g., checking file permissions before opening). However, LBYL is still appropriate in many situations, especially for simple, direct checks.

### Raising Exceptions

You can raise exceptions manually using the `raise` keyword. This is useful when you detect an error condition in your code or want to re-raise an exception.

```python
def validate_age(age: int):
    if not isinstance(age, int):
        raise TypeError("Age must be an integer.")
    if age < 0:
        raise ValueError("Age cannot be negative.")
    print(f"Age {age} is valid.")
    return age

try:
    # validate_age("twenty") # Raises TypeError
    validate_age(-5)    # Raises ValueError
except ValueError as e:
    print(f"Caught ValueError: {e}")
except TypeError as e:
    print(f"Caught TypeError: {e}")

# Example of re-raising an exception
try:
    # some risky operation
    num = int("text")
except ValueError as e:
    print(f"Logging error: {e}")
    raise # Re-raises the original ValueError
```

## Section 6: Built-in Functions

Python comes equipped with many [built-in functions](https://docs.python.org/3/library/functions.html) that simplify tasks, enhance readability, and boost efficiency, making them especially useful for coding interviews. This section explores several key functions.

- **[`any()`](https://docs.python.org/3/library/functions.html#any)**: The `any()` function returns `True` if at least one element of an iterable is truthy. It's incredibly useful when you need to check for the presence of truthy values in a collection. If the iterable is empty, it returns `False`.
    ```python
    values = [0, False, '', None, 5]
    print(any(values))  # Output: True, because 5 is truthy
    print(any([])) # Output: False
    ```

- **[`all()`](https://docs.python.org/3/library/functions.html#all)**: Conversely, `all()` returns `True` only if all elements in an iterable are truthy. It's ideal for validating a set of conditions. If the iterable is empty, it returns `True`.
    ```python
    flags1 = [True, True, False]
    print(all(flags1))  # Output: False, due to one False value
    flags2 = [True, "hello", 1]
    print(all(flags2)) # Output: True
    print(all([])) # Output: True
    ```

- **[`divmod()`](https://docs.python.org/3/library/functions.html#divmod)**: This utility takes two numbers as arguments and returns a pair of numbers consisting of their quotient and remainder when using integer division.
    ```python
    quotient, remainder = divmod(10, 3)
    print(f"Quotient: {quotient}")  # Output: Quotient: 3
    print(f"Remainder: {remainder}")  # Output: Remainder: 1
    print(divmod(10.5, 3)) # Output: (3.0, 1.5)
    ```

- **[`pow()`](https://docs.python.org/3/library/functions.html#pow)**: The `pow()` function raises a number to the power of another, and can optionally take a modulo argument for power computations under modulo operation. It can optionally take a third argument for modulo: `pow(base, exp, mod)`, which is equivalent to `(base ** exp) % mod` but can be more efficient for large numbers.
    ```python
    print(pow(2, 10))  # 2 to the power of 10: 1024
    print(2**10)       # Same using operator: 1024
    print(pow(2, 10, 1000))  # (2^10) % 1000: 24
    ```

- **[`min()`](https://docs.python.org/3/library/functions.html#min) and [`max()`](https://docs.python.org/3/library/functions.html#max)**: These functions are used to find the smallest and largest items in an iterable or among two or more arguments. They can be incredibly handy for problems that require you to find extreme values.
    ```python
    numbers = [10, 20, 30, 40, 5]
    print(min(numbers))  # Output: 5
    print(max(numbers))  # Output: 40
    print(min(10, 2, 100)) # Output: 2
    ```
  They can also be used with a `key` function for more complex structures:
    ```python
    names = ["Alice", "Bob", "Charlie", "Al"] # Bob (3), Al (2), Alice (5), Charlie (7)
    print(min(names, key=len))  # Output: Al (shortest name)
    print(max(names, key=len))  # Output: Charlie (longest name)
    ```
  **Handling empty iterables**: If the input iterable is empty, calling `min()` or `max()` without a default parameter (introduced in Python 3.8) will raise a `ValueError`:
    ```python
    empty_numbers = []
    try:
        max(empty_numbers)
    except ValueError as e:
        print(e) # Output: max() arg is an empty sequence

    # To avoid this, use the `default` parameter (Python 3.8+)
    # to provide a fallback value:
    print(max(empty_numbers, default="No numbers"))  # Output: No numbers
    print(min(empty_numbers, default=-1))  # Output: -1
    ```
    Setting a default ensures your code handles empty iterables gracefully and avoids runtime errors, especially in dynamic or user-driven inputs.

- **[`sum()`](https://docs.python.org/3/library/functions.html#sum)**: This function returns the total of the items in an iterable. It can also take an optional `start` argument, which is added to the total.

    ```python
    print(sum([1, 2, 3, 4]))  # Output: 10
    print(sum([1, 2, 3, 4], 10)) # Output: 20 (10 + 1+2+3+4)
    ```

- **[`zip()`](https://docs.python.org/3/library/functions.html#zip)**: The `zip()` function is used to combine multiple iterables element-wise. It creates an iterator that aggregates elements from each of the iterables. If the iterables are of different lengths, `zip()` stops when the shortest iterable is exhausted.

    ```python
    names = ["Alice", "Bob", "Charlie"]
    ages = [30, 25, 35]
    cities = ["New York", "London"] # Shorter iterable
    for name, age in zip(names, ages):
        print(f"{name} is {age} years old.")
    # Output:
    # Alice is 30 years old.
    # Bob is 25 years old.
    # Charlie is 35 years old.

    for name, age, city in zip(names, ages, cities): # Stops when 'cities' is exhausted
        print(f"{name} ({age}) lives in {city}.")
    # Output:
    # Alice (30) lives in New York.
    # Bob (25) lives in London.
    ```

- **[`abs()`](https://docs.python.org/3/library/functions.html#abs)**: Returns the absolute value of a number.
    ```python
    print(abs(-5))    # Output: 5
    print(abs(5.5))   # Output: 5.5
    ```

- **[`map()`](https://docs.python.org/3/library/functions.html#map)**: Applies a given function to each item of an iterable (e.g., list, tuple) and returns a map object (an iterator).
    ```python
    numbers = ["1", "2", "3", "4"]
    # Convert list of strings to list of integers
    int_numbers = list(map(int, numbers))
    print(int_numbers)  # Output: [1, 2, 3, 4]

    def square(n):
        return n * n
    nums = [1, 2, 3]
    squared_nums = list(map(square, nums))
    print(squared_nums) # Output: [1, 4, 9]
    ```

## Section 7: Solved Problems

### Problem 1: [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture)

**Problem Statement:** Determine the number of steps it takes for a given natural number to reach 1 by repeatedly applying the following transformations: if the number is even, divide it by 2; if it's odd, multiply by 3 and add 1.

**Example 1**:

* **Input:** x = 3
* **Output:** 7 (Sequence: 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1)

**Example 2**:

* **Input:** x = 7
* **Output:** 16 (Sequence: 7 → 22 → 11 → 34 → 17 → 52 → 26 → 13 → 40 → 20 → 10 → 5 → 16 → 8 → 4 → 2 → 1)

**Solution:**

```python
def collatz(x: int) -> int:
    steps = 0
    while x != 1:
        x = x // 2 if x % 2 == 0 else 3 * x + 1
        steps += 1
    return steps

assert collatz(3) == 7
assert collatz(7) == 16
assert collatz(13) == 9
assert collatz(20) == 7
```

### Problem 2: [Prime Number](https://en.wikipedia.org/wiki/Prime_number) Checker

**Problem Statement:** Create a function that determines if a number is prime. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

**Solution:**

```python
def is_prime(num: int) -> bool:
    if num <= 1:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True
```

We can simplify `is_prime(num)` using [`all`](https://docs.python.org/3/library/functions.html#all) and a generator expression:

```python
def is_prime(num: int) -> bool:
    return num > 1 and all(num % i != 0 for i in range(2, int(num ** 0.5) + 1))
```

### Problem 3: [Fibonacci Number](https://en.wikipedia.org/wiki/Fibonacci_sequence)

**Problem Statement:** Implement a function that returns the n-th (1-based index) Fibonacci number. The Fibonacci sequence starts with 1, 1, 2, 3, 5, 8, ...

**Solution:**

```python
def fibonacci(n: int) -> int:
    fib_1, fib_2 = 1, 1
    for _ in range(3, n + 1):
        fib_1, fib_2 = fib_2, fib_1 + fib_2
    return fib_2

assert fibonacci(5) == 5
assert fibonacci(8) == 21
```

### Problem 4: Find Specific Integer

**Problem Statement:** Find a five-digit integer `N` such that if `N = abcde` (where `a,b,c,d,e` are its digits), then:

- `a = N % 2`
- `b = N % 3`
- `c = N % 4`
- `d = N % 5`
- `e = N % 6`

**Solution:**

```python
def find_specific_integer():
    for n in range(10000, 100000):  # Iterate through all five-digit integers
        a, b, c, d, e = str(n)
        if all(
            [
                n % 2 == int(a),
                n % 3 == int(b),
                n % 4 == int(c),
                n % 5 == int(d),
                n % 6 == int(e),
            ]
        ):
            return n
    return None # Should not be reached if problem guarantees a solution

assert find_specific_integer() == 11311
```

### Problem 5: [Three Consecutive Odds](https://leetcode.com/problems/three-consecutive-odds/)

**Problem Statement:** Given a list of integers, determine whether it contains at least three odd numbers consecutively.

**Solution 1: Iterative Counting**

```python
def three_consecutive_odds(arr):
    if len(arr) < 3:
        return False
        
    consecutive_odds_count = 0
    for num in arr:
        if num % 2 != 0:  # num is odd
            consecutive_odds_count += 1
            if consecutive_odds_count == 3:
                return True
        else:  # num is even
            consecutive_odds_count = 0 # Reset count
    return False
```

**Solution 2: Bitwise Operation**

```python
def three_consecutive_odds(arr):
    return any(
        arr[i - 1] & arr[i] & arr[i + 1] & 1
        for i in range(1, len(arr) - 1)
    )
```

**Explanation:** The expression `arr[i-1] & arr[i] & arr[i+1] & 1` hinges on the fact that an integer is odd if and only if its least significant bit (LSB) is 1.

### Problem 6: [Add Digits](https://leetcode.com/problems/add-digits/)

**Problem Statement:** The digital root is the single-digit value obtained by recursively summing the digits of a non-negative number until a single digit is reached. Create a function that calculates the digital root of a non-negative number.

**Solution 1: Iterative Summation**
```python
def add_digits(num: int) -> int:
    while num >= 10:
        digit_sum = 0
        while num > 0:
            num, digit = divmod(num, 10)
            digit_sum += digit
        num = digit_sum
    return num
```

**Solution 2: Congruence Formula**

The digital root of a positive integer `n` can be calculated as:

- `0` if `n = 0`
- `9` if `n % 9 == 0` (and `n != 0`)
- `n % 9` if `n % 9 != 0`

This can be simplified to `1 + (n - 1) % 9` for `n > 0`.

```python
def add_digits(num: int) -> int:
    return 1 + (num - 1) % 9 if num > 0 else 0
```

### Problem 7: [Add Strings](https://leetcode.com/problems/add-strings/)

**Problem Statement:** Implement a function to add two numbers represented as strings.

**Solution:**
```python
def add_strings(num1: str, num2: str) -> str:
    i = len(num1) - 1
    j = len(num2) - 1
    carry = 0
    res = []
    while i >= 0 or j >= 0 or carry > 0:
        x = int(num1[i]) if i >= 0 else 0
        y = int(num2[j]) if j >= 0 else 0
        carry, digit = divmod(x + y + carry, 10)
        res.append(str(digit))
        i -= 1
        j -= 1
    res.reverse()
    return ''.join(res)
```

### Problem 8: [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

**Problem Statement:** Given an integer array `nums`, return `True` if any value appears at least twice in the array, and `False` if every element is distinct.

**Solution 1: Using a Set for Tracking Seen Elements**

```python
def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False
```

**Solution 2: Comparing Lengths**
```python
def contains_duplicate(nums: list[int]) -> bool:
    return len(nums) != len(set(nums))
```

### Problem 9: [Valid Anagram](https://leetcode.com/problems/valid-anagram/)

**Problem Statement:** Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, and `False` otherwise. An [anagram](https://en.wikipedia.org/wiki/Anagram) is a word formed by rearranging the letters of another word using all the original letters exactly once.

**Solution 1: Two Dictionaries**
```python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    
    s_counts: dict[str, int] = {}
    t_counts: dict[str, int] = {}
    
    for char_s in s:
        s_counts[char_s] = s_counts.get(char_s, 0) + 1
    
    for char_t in t:
        t_counts[char_t] = t_counts.get(char_t, 0) + 1

    return s_counts == t_counts
```

**Solution 2: One Dictionary**

```python

def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    
    counts: dict[str, int] = {}
    for char_s in s:
        counts[char_s] = counts.get(char_s, 0) + 1
    
    for char_t in t:
        if char_t not in counts:
            return False
        counts[char_t] -= 1
        if counts[char_t] < 0: # More occurrences in t than in s
            return False

    return True
```

### Problem 10: Score Parser

**Problem Statement:** You are given a list of strings, where each string is supposed to represent a player's score in the format `"PlayerName:Score"` (e.g., `"Alice:100"`). Write a function `parse_scores` that takes this list and returns a dictionary mapping player names to their integer scores.  
However, some strings might be malformed:

- They might not contain a colon.
- The part after the colon might not be a valid integer.

If a string is malformed in any of these ways, your function should ignore that string and continue processing the rest.

**Solution:**
```python
def parse_scores(score_strings: list[str]) -> dict[str, int]:
    player_scores = {}
    for entry in score_strings:
        try:
            name, score = entry.split(':')
            player_scores[name] = int(score)
        except ValueError:
            # Malformed: score is not a valid integer, so skip this entry
            continue 

    return player_scores

score_data = [
    "Alice:100", "Bob:85", "Charlie:N/A",
    "David: 92", "Eve:", ":Mallory:70", "Frank:"
]
assert parse_scores(score_data) == {"Alice": 100, "Bob": 85, "David": 92}
```

### Problem 11: Process User Commands
**Problem Statement:** Write a function `process_commands(commands: list[str])` that simulates processing a list of user commands.

- Each command is a string.
- If a command is `"EXIT"`, the function should immediately stop processing and return a list of all "VALID" commands processed before "EXIT".
- If a command is `"SKIP"`, the function should ignore this command and move to the next one.
- Any other command is considered "VALID".
- The function should also return the total count of "VALID" commands processed.

Return a tuple: `(list_of_valid_commands_before_exit, count_of_valid_commands)`.

**Solution**

```python
def process_commands(commands: list[str]) -> tuple[list[str], int]:
    valid_commands_processed: list[str] = []
    valid_command_count = 0
    
    for cmd in commands:
        if cmd == "EXIT":
            break
        elif cmd == "SKIP":
            continue
        else:
            valid_commands_processed.append(cmd)
            valid_command_count += 1
            
    return (valid_commands_processed, valid_command_count)

assert process_commands(["LOGIN", "SKIP", "SAVE", "EXIT", "LOGOUT"]) == (["LOGIN", "SAVE"], 2)
assert process_commands(["EXIT", "LOGIN"]) == ([], 0)
assert process_commands( ["SKIP", "SKIP", "SKIP"]) == ([], 0)
```

## Section 8: Exercises

### Problem 1: [Distribute Candies Among Children](https://leetcode.com/problems/distribute-candies-among-children-i/)

**Problem Statement:** There are `n` identical candies and three distinct children. Count the number of ways to give each child a non‐negative number of candies so that the total is exactly `n` and no child receives more than `limit` candies.

**Solution**

```python
def distribute_candies(n, limit):
    # 1) If total exceeds what three children can hold, no valid way
    if n > 3 * limit:
        return 0

    count = 0
    # 2) Try every possible amount for child A: 0 to min(n, limit)
    for a in range(min(n, limit) + 1):
        # 3) For each a, try every possible for child B: 0 to min(n – a, limit)
        for b in range(min(n - a, limit) + 1):
            # 4) Child C gets whatever remains
            c = n - a - b
            # 5) If C is within the limit, we’ve found a valid distribution
            if c <= limit:
                count += 1

    # 6) Return the total number of valid ways
    return count
```

### Problem 2: Find N-th Element

**Problem Statement:** Write a function to find the n-th element of the sequence where each integer `m` appears `m` times, e.g., 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ...

**Solution:**

```python
def find_n_th_element(n):
    m = 1
    while n > m:
        n -= m
        m += 1
    return m
```

### Problem 3: [Add Binary](https://leetcode.com/problems/add-binary/)

**Problem Statement:** Implement a function that adds two binary strings and returns their sum as a binary string.

**Solution:**
```python
def add_binary(a: str, b: str) -> str:
    i = len(a) - 1
    j = len(b) - 1
    carry = 0
    res = []
    while i >= 0 or j >= 0:
        a_bit = int(a[i]) if i >= 0 else 0
        b_bit = int(b[j]) if j >= 0 else 0
        carry, current = divmod(carry + a_bit + b_bit, 2)
        res.append(str(current))
        i -= 1
        j -= 1
    if carry:
        res.append(str(carry))
    res.reverse()
    return ''.join(res)


assert add_binary("11", "1") == "100"
assert add_binary("1010", "1011") == "10101"
```

### Problem 4: [Maximum Height of a Triangle](https://leetcode.com/problems/maximum-height-of-a-triangle/description/)

**Problem Statement:** You are given `red` and `blue` blocks. You want to build the tallest possible triangle. The triangle must have a top row of 1 block, and each subsequent row must have one more block than the row above it. The colors of adjacent rows must be different. Determine the maximum height achievable.

**Solution:**
```python
def max_height(red: int, blue: int) -> int:
    return max(get_height(red, blue), get_height(blue, red))

def get_height(x: int, y: int) -> int:
    height = 0
    while x >= 0 and y >= 0:
        height += 1
        if height % 2:
            x -= height
        else:
            y -= height
    return height - 1
```

### Problem 5: Balanced Halves

**Problem Statement:** Given a non-negative integer `x`, implement a function which returns `True` if and only if `x` has an **even** length and the sum of its first half equals the sum of its second half.

**Solution**

```python
def is_balanced(x: int) -> bool:
    # 1) Count total digits
    length = 0
    temp = x
    while temp:
        length += 1
        temp //= 10

    # 2) Must be even-length
    if length % 2 != 0:
        return False

    half = length // 2
    sum_last = 0   # sum of least-significant half
    sum_first = 0  # sum of most-significant half
    temp = x

    # 3) Peel off digits one by one
    for i in range(length):
        temp, digit = divmod(temp, 10)
        if i < half:
            sum_last += digit
        else:
            sum_first += digit

    # 4) Compare
    return sum_first == sum_last


assert is_balanced(123330) is True
assert is_balanced(123421) is False
assert is_balanced(0) is False
assert is_balanced(10) is False
assert is_balanced(51624) is False
```

### Problem 6: [Number of Days Between Two Days](https://leetcode.com/problems/number-of-days-between-two-dates/description/)

**Problem Statement**: Given two dates `date1` and `date2`, each in the format `"YYYY-MM-DD"`, compute the absolute number of days between them.

**Solution**:

```python
def is_leap_year(year: int) -> bool:
    """Return True if `year` is a Gregorian leap year."""
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

def month_length(year: int, month: int) -> int:
    """Return the number of days in the given month of `year`."""
    if month == 2:
        return 29 if is_leap_year(year) else 28
    # April, June, Sept, Nov have 30 days; the rest have 31
    return 30 if month in {4, 6, 9, 11} else 31

def days_since_1971(year: int, month: int, day: int) -> int:
    """
    Count days from 1971-01-01 up to (including) the given date.
    """
    days = 0
    # full years
    for y in range(1971, year):
        days += 365 + is_leap_year(y)
    # full months this year
    for m in range(1, month):
        days += month_length(year, m)
    # days in final month
    days += day
    return days

def days_between_dates_manual(date1: str, date2: str) -> int:
    """
    Return the absolute number of days between date1 and date2,
    each in 'YYYY-MM-DD' format.
    """
    y1, m1, d1 = map(int, date1.split('-'))
    y2, m2, d2 = map(int, date2.split('-'))
    ds1 = days_since_1971(y1, m1, d1)
    ds2 = days_since_1971(y2, m2, d2)
    return abs(ds2 - ds1)
```

### Problem 7: Validate Credit Card
The Luhn algorithm is a checksum formula used to validate credit card numbers.

The checksum of `cc_no`, a credit card number represented as a string, is computed as follows:

1. Reverse the order of the digits in `cc_no` and name it `cc_no_reversed`.
2. Add up `cc_no_reversed[0]`, `cc_no_reversed[2]`, ... and every other even index digit to form the partial sum `s1`
3. Taking `cc_no_reversed[1]`, `cc_no_reversed[3]`, ... and every other odd index digit:

* Multiply each digit by 2. If doubling a digit results in a two digit number, add those digits together to produce a single digit number
* Sum the partial sums of the even digits to form `s2`

The checksum is `s1 + s2`. Luhn algorithm determines `cc_no` is valid when the checksum ends in zero.

**Example**

    If the credit card number is 49927398716:
    
    1. Reverse the digits: 61789372994
    2. Sum the even index digits: s1 = 6 + 7 + 9 + 7 + 9 + 4 = 42
    3. The odd index digits: 1,  8,  3,  2,  9
      * Multiply each of them by 2: 2, 16,  6,  4, 18
      * Sum the digits of each multiplication: 2,  7,  6,  4,  9
      * s2 = 2 + 7 + 6 + 4 + 9 = 28
    
    The checksum is s1 + s2 = 70 which ends in zero. So, 49927398716 is valid.

Your task is to implement the Luhn algorithm.

```python
def is_valid_cc(cc_no: str) -> bool:
    """Your code here."""
```

#### Solution

```python
def luhn_checksum(cc_no: list[str]) -> int:
    cc_no.reverse()
    checksum = 0
    for i, digit in enumerate(cc_no):
        if i % 2 == 0:
            checksum += int(digit)
        else:
            doubled = int(digit) * 2
            checksum += doubled if doubled < 10 else doubled - 9
    return checksum

def is_valid_cc(cc_no: str) -> bool:
    return luhn_checksum(list(cc_no)) % 10 == 0
```


### Problem 8: [Multiply Strings](https://leetcode.com/problems/multiply-strings/)

Given two non-negative integers `num1` and `num2` represented as strings, return the product of `num1` and `num2` represented as a string without using any library or converting the inputs to integers directly.

#### Solution

```python
def multiply(num1: str, num2: str) -> str:
    if num1 == "0" or num2 == "0":
        return "0"
    res = "0"
    for i in range(len(num2) - 1, -1, -1):
        operand = single_digit_multiply(num1, num2[i]) + "0" * (len(num2) - i - 1)
        res = add_strings(res, operand)
    return res

def single_digit_multiply(num: str, digit: str) -> str:
    d = int(digit)
    carry = 0
    res = []
    for n in reversed(num):
        carry, curr = divmod(int(n) * d + carry, 10)
        res.append(str(curr))
    if carry > 0:
        res.append(str(carry))
    res.reverse()
    return "".join(res)

def add_strings(num1: str, num2: str) -> str:
    i = len(num1) - 1
    j = len(num2) - 1
    carry = 0
    res = []
    while i >= 0 or j >= 0 or carry > 0:
        x = int(num1[i]) if i >= 0 else 0
        y = int(num2[j]) if j >= 0 else 0
        carry, digit = divmod(x + y + carry, 10)
        res.append(str(digit))
        i -= 1
        j -= 1
    res.reverse()
    return "".join(res)
```
