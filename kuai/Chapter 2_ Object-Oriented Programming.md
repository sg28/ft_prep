# Chapter 2: Object-Oriented Programming

## Section 1: Fundamentals of Object-Oriented Programming

Object-Oriented Programming (OOP) is a fundamental programming paradigm you'll encounter throughout your software engineering career and, crucially, in coding interviews. Interviewers use OOP-related questions to assess your ability to structure code logically, create reusable and modular components, and model problems effectively.

This chapter is designed to provide you with a solid foundation in the core principles of OOP and how to implement them in Python. We'll start with the essential concepts—what classes and objects are, how to define them, and how to use features like encapsulation, inheritance, polymorphism, and abstraction at a practical level. We will explore each concept with clear explanations and illustrative examples. Following this, "Solved Problems" will show these principles in action through concrete code. Finally, a set of exercises will provide you with opportunities to apply what you've learned and hone your OOP implementation skills.

## Section 1: Core OOP Principles
Let's dive into the essential building blocks of Object-Oriented Programming.

### Classes and Objects

A class serves as a blueprint for objects, encapsulating attributes (data) and methods (functions) that operate on that data. Consider the `Cat` class as an example:

```python
class Cat:
    species = "Felis catus"  # Class attribute

    def __init__(self, name, age):
        self.name = name  # Instance attribute
        self.age = age

    def description(self):
        return f"{self.name} is {self.age} years old"

    def speak(self, sound):
        return f"{self.name} says {sound}"
```

Instantiation and interaction with a Cat object:

```python
my_cat = Cat("Cookie", 8)
print(my_cat.description())  # Output: Cookie is 8 years old
print(my_cat.speak("meow"))  # Output: Cookie says meow
```

### Inheritance: Enhancing Reusability and Hierarchy

Inheritance is a fundamental principle of object-oriented programming that enables a class to derive or inherit attributes and behaviors (methods) from another class. This mechanism promotes code reusability and establishes a natural hierarchy among classes.

In the following example, the `Persian` class inherits from the `Cat` class. This means that a `Persian` cat is a specialized form of `Cat` that retains general `Cat` behaviors while also defining behaviors specific to Persian cats.

```python
class Persian(Cat):
    def speak(self, sound="purr"):
        return super().speak(sound)
```

In this code:

- The `Persian` class extends `Cat`, meaning it inherits `Cat`'s attributes and methods.
- The `speak` method in the `Persian` class overrides the same method in the `Cat` class, providing a specific behavior for Persian cats. The `super()` function is used to call the parent class's method, allowing the `Persian` class to extend or modify its behavior.

### Encapsulation: Data Integrity

Encapsulation promotes data integrity by restricting direct access to an object's attributes. It's not just about making attributes private; it's about providing controlled access through public methods.

```python
class Cat:
    def __init__(self, name, age):
        self.__name = name  # Private attribute
        self.__age = age    # Private attribute

    # Getter and setter methods for name
    def get_name(self):
        return self.__name

    def set_name(self, name):
        self.__name = name

    # Getter and setter methods for age
    def get_age(self):
        return self.__age

    def set_age(self, age):
        if age < 0:
            raise ValueError("Age cannot be negative.")
        else:
            self.__age = age
```

Usage:

```python
my_cat = Cat("Whiskers", 5)
my_cat.set_name("Mr. Whiskers")
my_cat.set_age(-1)  # Raises Error
my_cat.set_age(6)
print(my_cat.description())  # Output: Mr. Whiskers is 6 years old
```

### Polymorphism: Interface Flexibility

Polymorphism allows objects of different classes to be treated through a common interface.

```python
class Siamese(Cat):
    def speak(self, sound="meezer"):
        return super().speak(sound)

def cat_speak(cat: Cat):
    print(cat.speak())

siamese = Siamese("Luna", 3)
persian = Persian("Ginger", 5)

cat_speak(siamese)  # Output: Luna says meezer
cat_speak(persian)  # Output: Ginger says purr
```

## Section 2: Solved Problems

### Problem 1: Simple Banking System

Design and implement an in-memory banking system that supports:
    1.  Creating accounts
    2.  Depositing money
    3.  Withdrawing (paying) money
    4.  Querying balance
    5.  Retrieving a transaction statement

All operations are tagged with a strictly increasing integer timestamp.

### Problem 2: Course Registration System

Design and implement a system to manage course offerings and student enrollments. This exercise will involve creating multiple interacting classes, managing collections of objects, and implementing business logic like credit limits and preventing duplicate registrations.

**Detailed Requirements:**

1.  **`Course` Class:**
      * Attributes: `course_id` (str, unique), `name` (str), `credits` (int, positive).
      * Methods: `__init__`, `__str__`, `__repr__`, `__eq__`, `__hash__`.
2.  **`Student` Class:**
      * Attributes: `student_id` (str, unique), `name` (str), `_registered_courses` (Dict[str, Course]), `_current_credits_taken` (int).
      * Methods: `__init__`, `register_course(course, max_credits_allowed) -> bool`, `drop_course(course_id) -> bool`, `get_total_credits() -> int`, `view_schedule() -> List[str]`, `__str__`, `__repr__`.
3.  **`RegistrationSystem` Class:**
      * Attributes: `_courses_available` (Dict[str, Course]), `_students_enrolled` (Dict[str, Student]), `MAX_CREDITS_PER_STUDENT` (int, default 24).
      * Methods: `__init__`, `add_course_to_system(...) -> bool`, `get_course(...) -> Optional[Course]`, `add_student_to_system(...) -> Optional[Student]`, `get_student(...) -> Optional[Student]`, `enroll_student_in_course(...) -> bool`, `drop_student_from_course(...) -> bool`, `display_student_schedule(...)`, `display_available_courses()`.

**Task:** Implement the `Course`, `Student`, and `RegistrationSystem` classes with all specified attributes and methods. Include robust error handling using the custom exceptions and print statements to indicate the outcome of operations. Write example usage code to demonstrate all functionalities, including successful operations and error conditions.

#### Solution

```python
from typing import List, Dict, Optional

class RegistrationError(Exception):
    """Base class for registration system errors."""
    pass

class CourseValidationError(RegistrationError):
    """Error related to course data validation."""
    pass

class StudentValidationError(RegistrationError):
    """Error related to student data validation."""
    pass

class EnrollmentError(RegistrationError):
    """Error related to the enrollment process."""
    pass

class Course:
    def __init__(self, course_id: str, name: str, credits: int):
        if not course_id or not isinstance(course_id, str):
            raise CourseValidationError("Course ID must be a non-empty string.")
        if not name or not isinstance(name, str):
            raise CourseValidationError("Course name must be a non-empty string.")
        if not isinstance(credits, int) or credits <= 0:
            raise CourseValidationError("Credits must be a positive integer.")
        
        self.course_id: str = course_id
        self.name: str = name
        self.credits: int = credits

    def __str__(self) -> str:
        return f"{self.course_id}: {self.name} ({self.credits} credits)"

    def __repr__(self) -> str:
        return f"Course(id='{self.course_id}', name='{self.name}', credits={self.credits})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, Course):
            return NotImplemented
        return self.course_id == other.course_id

    def __hash__(self) -> int:
        return hash(self.course_id)

class Student:
    def __init__(self, student_id: str, name: str):
        if not student_id or not isinstance(student_id, str):
            raise StudentValidationError("Student ID must be a non-empty string.")
        if not name or not isinstance(name, str):
            raise StudentValidationError("Student name must be a non-empty string.")
            
        self.student_id: str = student_id
        self.name: str = name
        self._registered_courses: Dict[str, Course] = {} 
        self._current_credits_taken: int = 0
        print(f"Student '{self.name}' (ID: {self.student_id}) created.")

    def register_course(self, course: Course, max_credits_allowed: int) -> bool:
        if not isinstance(course, Course):
            raise EnrollmentError("Invalid course object provided for registration.")
        if course.course_id in self._registered_courses:
            print(f"Student {self.student_id} already registered for {course.course_id}.")
            return False
        
        if self._current_credits_taken + course.credits > max_credits_allowed:
            print(f"Student {self.student_id} cannot register for {course.course_id}. "
                  f"Exceeds credit limit of {max_credits_allowed}. "
                  f"Current credits: {self._current_credits_taken}, Course credits: {course.credits}.")
            return False
        
        self._registered_courses[course.course_id] = course
        self._current_credits_taken += course.credits
        print(f"Student {self.student_id} successfully registered for {course.course_id}. "
              f"Total credits: {self._current_credits_taken}.")
        return True

    def drop_course(self, course_id: str) -> bool:
        course_to_drop = self._registered_courses.get(course_id)
        if not course_to_drop:
            print(f"Student {self.student_id} is not registered for course {course_id} to drop.")
            return False
        
        self._current_credits_taken -= course_to_drop.credits
        del self._registered_courses[course_id]
        print(f"Student {self.student_id} dropped course {course_id}. "
              f"Total credits: {self._current_credits_taken}.")
        return True

    def get_total_credits(self) -> int:
        return self._current_credits_taken

    def view_schedule(self) -> List[str]:
        if not self._registered_courses:
            return ["Schedule is empty. No courses registered."]
        schedule = [str(course) for course in self._registered_courses.values()]
        return schedule

    def __str__(self) -> str:
        return f"Student: {self.name} (ID: {self.student_id}, Credits: {self._current_credits_taken})"

    def __repr__(self) -> str:
        return f"Student(id='{self.student_id}', name='{self.name}')"

class RegistrationSystem:
    DEFAULT_MAX_CREDITS = 24

    def __init__(self, max_credits_per_student: int = DEFAULT_MAX_CREDITS):
        if not isinstance(max_credits_per_student, int) or max_credits_per_student <= 0:
            raise ValueError("Max credits per student must be a positive integer.")
        self._courses_available: Dict[str, Course] = {}
        self._students_enrolled: Dict[str, Student] = {}
        self.MAX_CREDITS_PER_STUDENT: int = max_credits_per_student
        print(f"Registration System initialized. Max credits per student: {self.MAX_CREDITS_PER_STUDENT}.")

    def add_course_to_system(self, course_id: str, name: str, credits: int) -> bool:
        if course_id in self._courses_available:
            print(f"Error: Course with ID '{course_id}' already exists in the system.")
            return False
        try:
            course = Course(course_id, name, credits)
            self._courses_available[course_id] = course
            print(f"Course '{name}' ({course_id}) with {credits} credits added to system.")
            return True
        except CourseValidationError as e:
            print(f"Error adding course {course_id} to system: {e}")
            return False

    def get_course(self, course_id: str) -> Optional[Course]:
        course = self._courses_available.get(course_id)
        if not course: print(f"Info: Course {course_id} not found in system.")
        return course

    def add_student_to_system(self, student_id: str, student_name: str) -> Optional[Student]:
        if student_id in self._students_enrolled:
            print(f"Info: Student with ID '{student_id}' ({self._students_enrolled[student_id].name}) already in system.")
            return self._students_enrolled[student_id]
        try:
            student = Student(student_id, student_name)
            self._students_enrolled[student_id] = student
            return student
        except StudentValidationError as e:
            print(f"Error adding student {student_id} to system: {e}")
            return None
            
    def get_student(self, student_id: str) -> Optional[Student]:
        student = self._students_enrolled.get(student_id)
        if not student: print(f"Info: Student {student_id} not found in system.")
        return student

    def enroll_student_in_course(self, student_id: str, course_id: str) -> bool:
        student = self.get_student(student_id)
        course = self.get_course(course_id)

        if not student: # get_student already prints if not found
            return False
        if not course: # get_course already prints if not found
            return False
        
        print(f"\nAttempting to enroll Student '{student.name}' in Course '{course.name}'...")
        try:
            success = student.register_course(course, self.MAX_CREDITS_PER_STUDENT)
            if success: print(f"Overall enrollment of '{student.name}' in '{course.name}' successful.")
            else: print(f"Overall enrollment of '{student.name}' in '{course.name}' failed (see student messages).")
            return success
        except EnrollmentError as e:
            print(f"Enrollment Error for student {student_id} in course {course_id}: {e}")
            return False


    def drop_student_from_course(self, student_id: str, course_id: str) -> bool:
        student = self.get_student(student_id)
        if not student: # get_student already prints
            return False
        
        print(f"\nAttempting to drop Course '{course_id}' for Student '{student.name}'...")
        success = student.drop_course(course_id)
        # Student.drop_course prints its own success/failure.
        return success

    def display_student_schedule(self, student_id: str):
        student = self.get_student(student_id)
        if not student: # get_student already prints
            return
        
        print(f"\n--- Schedule for {student.name} (ID: {student.student_id}) ---")
        print(f"Total Credits Registered: {student.get_total_credits()}")
        schedule_items = student.view_schedule()
        for item in schedule_items:
            print(f"  - {item}")
        print("--------------------------------------")

    def display_available_courses(self):
        print("\n--- Available Courses in System ---")
        if not self._courses_available:
            print("No courses have been added to the system yet.")
            return
        for course_id in sorted(self._courses_available.keys()): # Display sorted by ID
            print(f"  - {str(self._courses_available[course_id])}")
        print("-----------------------------------")

# Example Usage for Course Registration System:
# print("\n--- Course Registration System Example ---")
# reg_system = RegistrationSystem(max_credits_per_student=7) # Low limit for testing

# # Add courses
# reg_system.add_course_to_system("CS101", "Intro to Python", 3)
# reg_system.add_course_to_system("MA202", "Linear Algebra", 4)
# reg_system.add_course_to_system("EN100", "English Composition", 3)
# reg_system.add_course_to_system("CS101", "Intro to Python (Repeat)", 3) # Test duplicate add
# reg_system.add_course_to_system("PHY200", "Physics Mechanics", 0) # Test invalid credits

# reg_system.display_available_courses()

# # Add students
# student_alice = reg_system.add_student_to_system("S1001", "Alice Smith")
# student_bob = reg_system.add_student_to_system("S1002", "Bob Johnson")

# # Enroll Alice
# if student_alice:
#     reg_system.enroll_student_in_course("S1001", "CS101")  # 3 credits
#     reg_system.enroll_student_in_course("S1001", "MA202")  # 4 credits (total 7)
#     reg_system.enroll_student_in_course("S1001", "CS101")  # Try duplicate enrollment
#     reg_system.enroll_student_in_course("S1001", "EN100")  # Should fail (3 more credits -> 10 > 7)
#     reg_system.display_student_schedule("S1001")

# # Alice drops MA202 and tries EN100 again
# if student_alice:
#     reg_system.drop_student_from_course("S1001", "MA202") # Credits become 3
#     reg_system.enroll_student_in_course("S1001", "EN100") # Should succeed now (3+3=6 <= 7)
#     reg_system.display_student_schedule("S1001")

# # Enroll Bob
# if student_bob:
#     reg_system.enroll_student_in_course("S1002", "MA202")
#     reg_system.display_student_schedule("S1002")
#     reg_system.enroll_student_in_course("S1002", "CS999") # Non-existent course
```

### Problem 3: Recording Storage Service

Implement an recording storage service. Each recording is stored under a path:

```
{client_id}/{date}/{recording_name}
```

where `date` is in the format `YYYY-MM-DD`. Every recording has:

* a **size** (integer bytes)

* a **time-to-live** (`ttl_days`, integer) counted from its upload date

* an **expiration date** = upload date + `ttl_days`

* an implicit **“today”** (for testing you must be able to override the current date)

Your service must support these operations:

1. **STORE\_RECORDING**

   ```python
   store_recording(client_id: str,
                   recording_name: str,
                   date: str,          # "YYYY-MM-DD"
                   size: int,
                   ttl_days: int) -> None
   ```

   * Store a new recording at the given path with computed expiration.

   * If the _exact_ path already exists (same client, date, name), raise\
     `RuntimeError("recording path already exists")`.

2. **GET\_RECORDING**

   ```python
   get_recording(client_id: str,
                 recording_name: str,
                 date: str) -> Optional[Tuple[int,int]]
   ```

   * If the recording exists and has **not** expired, return\
     `(size, remaining_ttl_days)`

   * Otherwise return `None`.

3. **COPY\_RECORDING**

   ```python
   copy_recording(source_path: str,
                  dest_path: str) -> None
   ```

   * Copy metadata (size + original expiration) from `source_path` to `dest_path`.

   * Paths are of form `"clientId/date/recordingName"`.

   * If source is missing or expired, raise\
     `RuntimeError("source recording doesn't exist or is expired")`.

   * If `dest_path` already exists, overwrite it.

4. **GET\_RECORDING\_OWNERSHIP**

   ```python
   get_recording_ownership(recording_name: str) -> Tuple[str,str]
   ```

   * Among _all_ non-expired instances of that `recording_name`, return the\
     `(client_id, date)` with the **earliest** `date`.

   * If never stored: raise `RecordingNotFoundException("recording not found")`.

   * If all copies expired: raise `ExpiredRecordingException("recording is expired")`.


## Python Solution

```python
from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, List


class RecordingNotFoundException(Exception):
    pass

class ExpiredRecordingException(Exception):
    pass


class StorageService:
    def __init__(self):
        # Nested storage:
        # storage[client_id][date][recording_name] = (size, expires_at: date)
        self.storage: Dict[str, Dict[str, Dict[str, Tuple[int, datetime]]]] = {}
        # Index: recording_name → list of (client_id, date, expires_at)
        self.index: Dict[str, List[Tuple[str, str, datetime]]] = {}
        # "Today" for TTL calculations (default = actual today)
        self._today: datetime = datetime.today()

    def _parse_date(self, d: str) -> datetime:
        return datetime.strptime(d, "%Y-%m-%d")

    def _format_date(self, dt: datetime) -> str:
        return dt.strftime("%Y-%m-%d")

    def _assert_not_expired(self, expires_at: datetime):
        if expires_at < self._today:
            raise ExpiredRecordingException("recording is expired")

    def _remaining_ttl(self, expires_at: datetime) -> int:
        return max((expires_at - self._today).days, 0)

    def set_today(self, today: str):
        """Override 'today' (YYYY-MM-DD) for testing."""
        self._today = self._parse_date(today)

    def store_recording(self,
                        client_id: str,
                        recording_name: str,
                        date: str,
                        size: int,
                        ttl_days: int) -> None:
        dt = self._parse_date(date)
        expires_at = dt + timedelta(days=ttl_days)

        # Initialize nested maps
        self.storage.setdefault(client_id, {})
        self.storage[client_id].setdefault(date, {})

        # Check duplicate
        if recording_name in self.storage[client_id][date]:
            raise RuntimeError("recording path already exists")

        # Store
        self.storage[client_id][date][recording_name] = (size, expires_at)

        # Update index
        self.index.setdefault(recording_name, [])
        self.index[recording_name].append((client_id, date, expires_at))

    def get_recording(self,
                      client_id: str,
                      recording_name: str,
                      date: str) -> Optional[Tuple[int,int]]:
        try:
            size, expires_at = self.storage[client_id][date][recording_name]
        except KeyError:
            return None

        if expires_at < self._today:
            return None
        return size, self._remaining_ttl(expires_at)

    def copy_recording(self,
                       source_path: str,
                       dest_path: str) -> None:
        def split_path(p: str) -> Tuple[str,str,str]:
            parts = p.split("/")
            if len(parts) != 3:
                raise ValueError("invalid path")
            return parts[0], parts[1], parts[2]

        src_c, src_d, src_name = split_path(source_path)
        dst_c, dst_d, dst_name = split_path(dest_path)

        # Lookup source
        try:
            size, expires_at = self.storage[src_c][src_d][src_name]
        except KeyError:
            raise RuntimeError("source recording doesn't exist or is expired")

        if expires_at < self._today:
            raise RuntimeError("source recording doesn't exist or is expired")

        # Overwrite destination
        self.storage.setdefault(dst_c, {})
        self.storage[dst_c].setdefault(dst_d, {})
        self.storage[dst_c][dst_d][dst_name] = (size, expires_at)

        # Update index
        self.index.setdefault(dst_name, [])
        self.index[dst_name].append((dst_c, dst_d, expires_at))

    def get_recording_ownership(self, recording_name: str) -> Tuple[str, str]:
        if recording_name not in self.index:
            raise RecordingNotFoundException("recording not found")

        candidates = []
        for client_id, date, expires_at in self.index[recording_name]:
            if expires_at >= self._today:
                candidates.append((self._parse_date(date), client_id, date))

        if not candidates:
            raise ExpiredRecordingException("recording is expired")

        # Pick earliest date
        _, client_id, date = min(candidates, key=lambda x: x[0])
        return client_id, date
```

### Explanation

1. **Storage Layout**

   * `self.storage` is a 3-level dict keyed by `client_id` → `date` → `recording_name`.

   * Each entry holds `(size, expires_at: datetime)`.

2. **Global Index**

   * `self.index[recording_name]` is a list of all copies ever stored or copied, each with its expiration.

   * This lets `get_recording_ownership` run in O(k) over that list, not scanning all clients.

3. **TTL & “Today”**

   * By default, `today = datetime.today()`, but tests can call `set_today("YYYY-MM-DD")`.

   * Remaining TTL = max((expires\_at – today).days, 0).

4. **Error Cases**

   * Duplicate `store_recording` → `RuntimeError`.

   * Missing or expired source in `copy_recording` → `RuntimeError`.

   * `get_recording` missing/expired → returns `None`.

   * Ownership lookup when never stored → `RecordingNotFoundException`.

   * Ownership lookup when all expired → `ExpiredRecordingException`.

***

### Basic Unit Tests

```python
def test_phase1_and_2():
    svc = StorageService()
    svc.set_today("2025-02-10")

    # Store and retrieve
    svc.store_recording("c1", "a.mp4", "2025-02-10", size=100, ttl_days=7)
    assert svc.get_recording("c1","a.mp4","2025-02-10") == (100, 7)

    # Advance time
    svc.set_today("2025-02-15")
    assert svc.get_recording("c1","a.mp4","2025-02-10") == (100, 2)

    # Copy onto new client/date
    svc.copy_recording("c1/2025-02-10/a.mp4",
                       "c2/2025-02-14/a.mp4")
    # original expiration 2025-02-17 → TTL 2 days on 2025-02-15
    assert svc.get_recording("c2","a.mp4","2025-02-14") == (100, 2)

    # Ownership: earliest non-expired is c1/2025-02-10
    owner = svc.get_recording_ownership("a.mp4")
    assert owner == ("c1","2025-02-10")

    # Expire everything
    svc.set_today("2025-03-01")
    assert svc.get_recording("c1","a.mp4","2025-02-10") is None
    try:
        svc.get_recording_ownership("a.mp4")
        assert False, "should have raised"
    except ExpiredRecordingException:
        pass

    # Duplicate store → error
    svc.set_today("2025-02-10")
    svc.store_recording("c1", "b.mp4", "2025-02-10", size=50, ttl_days=1)
    try:
        svc.store_recording("c1", "b.mp4", "2025-02-10", size=50, ttl_days=1)
        assert False
    except RuntimeError:
        pass

test_phase1_and_2()
print("All tests passed!")
```

***

This fully specifies the **concrete coding problem**, and provides a **working Python solution** plus basic tests covering Phases 1 and 2.

### Problem 4: Sales Network

Implement a system to manage a hierarchical organization of sales agents. Each agent in this structure may have a unique manager (except for the root agent, who has no manager) and can have multiple direct reports.

##### Agent Class

- `__init__(self, agent_id: int)`: Initializes an agent with a specified unique identifier.
- `add_report(self, report: 'Agent')`: Registers another agent as a direct report, updating the hierarchical structure accordingly.
- `add_sales(self, sales: float)`: Increments this agent's sales total by the specified amount.
- `assign_manager(self, manager: Optional['Agent'])`: Sets or updates the manager for this agent. This method adjusts the agent's and the manager's records to maintain the structural integrity of the reporting hierarchy.

##### Network Class

- `__init__(self)`: Initializes the network with an empty dictionary to store agents by their identifiers.
- `add_agent(self, agent_id: int, manager_id: Optional[int] = None)`: Inserts a new agent into the network, optionally linking them to an existing agent as their manager.
- `remove_agent(self, agent_id: int)`: Removes an agent from the network, ensuring that their reports are reassigned to the removed agent's manager, maintaining the structural continuity.
- `assign_manager(self, agent_id: int, manager_id: Optional[int])`: Links an agent to a manager within the network, updating the hierarchical links as necessary.
- `add_sales(self, agent_id: int, sales: float)`: Updates the sales data for a specified agent.

#### Solution:

```python
from typing import Optional

class Agent:
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.reports = set()
        self.manager = None
        self.sales = 0.0

    def __eq__(self, other):
        if not isinstance(other, Agent):
            return NotImplemented
        return self.agent_id == other.agent_id

    def __hash__(self):
        return hash(self.agent_id)

    def __repr__(self):
        return f"<Agent {self.agent_id}>"

    def add_report(self, report: "Agent"):
        if report not in self.reports:
            report.manager = self
            self.reports.add(report)

    def add_sales(self, sales: float):
        self.sales += sales

    def assign_manager(self, manager: Optional["Agent"]):
        if manager == self.manager:
            return
        if self.manager is not None:
            self.manager.reports.discard(self)
        self.manager = manager
        if manager is not None:
            manager.reports.add(self)

class Network:
    def __init__(self):
        self.agents = {}

    def add_agent(self, agent_id: int, manager_id: Optional[int] = None):
        if agent_id in self.agents:
            raise ValueError(f"Agent ID {agent_id} already exists in the network.")
        agent = Agent(agent_id)
        self.agents[agent_id] = agent
        if manager_id is not None:
            self.assign_manager(agent_id, manager_id)

    def remove_agent(self, agent_id: int):
        if agent_id not in self.agents:
            raise ValueError(f"Agent ID {agent_id} not found in the network.")
        agent = self.agents.pop(agent_id)
        if agent.manager is not None:
            agent.manager.reports.remove(agent)
        for report in list(agent.reports):
            report.assign_manager(agent.manager)

    def assign_manager(self, agent_id: int, manager_id: Optional[int]):
        if agent_id not in self.agents:
            raise ValueError(f"Agent ID {agent_id} not found in the network.")
        if manager_id is not None and manager_id not in self.agents:
            raise ValueError(f"Manager ID {manager_id} not found in the network.")
        self.agents[agent_id].assign_manager(self.agents.get(manager_id))

    def add_sales(self, agent_id: int, sales: float):
        if agent_id not in self.agents:
            raise ValueError(f"Agent ID {agent_id} not found in the network.")
        self.agents[agent_id].add_sales(sales)
```

### Problem 5: File System

Design an **in-memory file system** that supports basic Unix-like file operations. The file system should maintain its structure in memory and allow users to perform the following operations:

### **Operations:**

1. **pwd() → str**

   * Return the current working directory as an absolute path (e.g., `"/a/b"` or `"/"`).

2. **cd(path: str) → None**

   * Change the current directory to the specified path.

   * Supports absolute (`"/x/y"`) and relative (`"../up"`, `"dir"`) paths.

   * Raises `NotADirectoryError` if the path is not a directory.

   * Raises `FileNotFoundError` if the path does not exist.

3. **ls(path: Optional\[str] = None) → List\[str]**

   * List the contents of the specified path. If no path is given, list the contents of the current directory.

   * If the path is a file, return a list with just that file name.

   * If the path is a directory, return its contents in **lexicographic order**.

4. **mkdir(path: str) → None**

   * Create a directory at the specified path, including any necessary parent directories.

   * Does nothing if the directory already exists.

5. **touch(path: str) → None**

   * Create an **empty file** at the specified path.

   * If the path already exists as a file, do nothing.

   * If it exists as a directory, raise `IsADirectoryError`.

6. **cat(path: str) → str**

   * Return the contents of the file at the specified path.

   * Raise `IsADirectoryError` if the path is a directory.

7. **echo(content: str, path: str) → None**

   * Write the specified content to the file at the specified path.

   * If the file does not exist, create it.

   * If it exists as a directory, raise `IsADirectoryError`.

### **Example Usage:**

```python
fs = FileSystem()
fs.mkdir('/a/b')
fs.touch('/a/b/file.txt')
fs.echo('hello, world', '/a/b/file.txt')
print(fs.cat('/a/b/file.txt'))      # → "hello, world"

fs.cd('/a')
print(fs.pwd())                     # → "/a"

fs.cd('b')
print(fs.pwd())                     # → "/a/b"

print(fs.ls())                      # → ["file.txt"]

fs.cd('..')
print(fs.ls())                      # → ["b"]
```

Solution

```python
class Node:
    def __init__(self, name: str, is_dir: bool, parent=None):
        self.name = name
        self.is_dir = is_dir
        self.parent = parent if parent is not None else self
        self.children = {} if is_dir else None
        self.content = '' if not is_dir else None

class FileSystem:
    def __init__(self):
        self.root = Node('', True)
        self.root.parent = self.root
        self.cwd = self.root

    def pwd(self):
        parts = []
        node = self.cwd
        while node is not self.root:
            parts.append(node.name)
            node = node.parent
        return '/' + '/'.join(reversed(parts))

    def cd(self, path):
        node = self._traverse(path, create=False)
        if not node.is_dir:
            raise NotADirectoryError
        self.cwd = node

    def ls(self, path=None):
        node = self._traverse(path or '.', create=False)
        if node.is_dir:
            return sorted(node.children.keys())
        return [node.name]

    def mkdir(self, path):
        parts = [p for p in path.split('/') if p and p != '.']
        parent_path = ('/' if path.startswith('/') else '') + '/'.join(parts[:-1])
        parent = self._traverse(parent_path or '.', create=True)
        name = parts[-1]
        if name not in parent.children:
            parent.children[name] = Node(name, True, parent)

    def touch(self, path):
        parts = [p for p in path.split('/') if p and p != '.']
        parent_path = ('/' if path.startswith('/') else '') + '/'.join(parts[:-1])
        parent = self._traverse(parent_path or '.', create=True)
        name = parts[-1]
        if name not in parent.children:
            parent.children[name] = Node(name, False, parent)

    def cat(self, path):
        node = self._traverse(path, create=False)
        if node.is_dir:
            raise IsADirectoryError
        return node.content

    def echo(self, content, path):
        parts = [p for p in path.split('/') if p and p != '.']
        parent_path = ('/' if path.startswith('/') else '') + '/'.join(parts[:-1])
        parent = self._traverse(parent_path or '.', create=True)
        name = parts[-1]
        if name not in parent.children:
            parent.children[name] = Node(name, False, parent)
        node = parent.children[name]
        if node.is_dir:
            raise IsADirectoryError
        node.content = content

    def _traverse(self, path, create):
        absolute = path.startswith('/')
        parts = [p for p in path.split('/') if p and p != '.']
        node = self.root if absolute else self.cwd
        for part in parts:
            if part == '..':
                node = node.parent
            else:
                if not node.is_dir:
                    raise NotADirectoryError
                if part not in node.children:
                    if not create:
                        raise FileNotFoundError
                    node.children[part] = Node(part, True, node)
                node = node.children[part]
        return node

if __name__ == '__main__':
    fs = FileSystem()
    fs.mkdir('/a/b/c')
    assert fs.pwd() == '/'
    fs.cd('a')
    assert fs.pwd() == '/a'
    fs.cd('b/c')
    assert fs.pwd() == '/a/b/c'
    fs.touch('file.txt')
    fs.echo('hello', 'file.txt')
    assert fs.cat('file.txt') == 'hello'
    assert fs.ls() == ['file.txt']
    fs.cd('..')
    assert fs.ls() == ['c']
    assert fs.ls('c') == ['file.txt']
    fs.touch('/a/b/c/file.txt')
    fs.echo('world', '/a/b/c/file.txt')
    assert fs.cat('/a/b/c/file.txt') == 'world'
    fs.cd('/')
    assert fs.ls('a') == ['b']
    assert fs.ls('/a/b') == ['c']
    assert fs.ls('/a/b/c') == ['file.txt']
    print('All tests passed.')
```

## Section 3: Exercises

### Problem 1:  [Find Consecutive Integers from a Data Stream](https://leetcode.com/problems/find-consecutive-integers-from-a-data-stream/)
For a stream of integers, implement a data structure that checks if the last `k` integers parsed in the stream are **equal** to `value`.

Implement the **DataStream** class:

* `DataStream(int value, int k)` Initializes the object with an empty integer stream and the two integers `value` and `k`.
* `boolean consec(int num)` Adds `num` to the stream of integers. Returns `true` if the last `k` integers are equal to `value`, and `false` otherwise. If there are less than `k` integers, the condition does not hold true, so returns `false`.

#### Solution

```python
class DataStream:
    def __init__(self, value: int, k: int):
        self.value = value
        self.k = k
        self.consec_count = 0

    def consec(self, num: int) -> bool:
        if num == self.value:
            self.consec_count += 1
            return self.consec_count >= self.k
        else:
            self.consec_count = 0
            return False
```

### Problem 2: Wallets

A Nium customer can hold multiple currencies in various wallets. For example, in order for a customer to maintain three currencies: USD, INR, and CNY, Nium will create a USD wallet, an INR wallet, and a CNY wallet.

Given a list of supported currencies `supported_currencies` and a mapping of exchange rates `rates`, implement an `Account` class with the following methods:

* `Account(supported_currencies, rates)`: the constructor
* `load(currency, amount)`: load the specified amount into the corresponding wallet. This method does not return anything.
* `spend(currency, amount)`: deduct the specified amount from the account.
* `summarize()`: prints the balance of every wallet with a positive balance.

Assumptions:

* `supported_currencies` contains a list of valid currencies.
* `rates` is a dictionary `{currency1: val1, currency2: val2, ...}` where the keys exist in `supported_currencies` and the values are ***relative to USD***. For example `{"AUD":0.672,"CAD":0.763767}` means that 0.672 USD equals 1 AUD, and 0.763767 USD equals 1 CAD.

In this problem, `spend(currency, amount)` attempts to deduct from the wallet corresponding to `currency`. If the corresponding wallet has enough balance, then the operation succeeds and the method returns `True`. Otherwise, no amount is deducted and the method returns false.

Example:

```python
SUPPORTED_CURRENCIES = ["USD", "GBP"]
RATES_USD = {"GBP": 1.122, "USD": 1.0}

account = Account(SUPPORTED_CURRENCIES, RATES_USD)
account.load("USD", 100.0)
account.load("GBP", 100.0)
assert not account.spend("USD", 200.0)
assert account.spend("GBP", 40.0)
account.summarize()  # {'USD': 100.0, 'GBP': 60.0}
```

#### Solution

```python
def get_exchange_rate(rates_usd: dict[str, float], base: str, quote: str) -> float:
    return rates_usd[base] / rates_usd[quote]

class Account:
    def __init__(self, supported_currencies: list[str], rates: dict[str, float]):
        self._wallets = {c: 0.0 for c in supported_currencies}
        self._rates = rates

    def load(self, currency: str, amount: float) -> None:
        self._wallets[currency] += amount

    def spend(self, currency: str, amount: float) -> bool:
        if self._wallets[currency] < amount:
            return False
        self._wallets[currency] -= amount
        return True

    def summarize(self) -> None:
        print({c: b for c, b in self._wallets.items() if b > 0})
```

### Problem 3

Follow up to the previous Wallets problem. In this problem, `spend(currency, amount)` attempts to deduct from the wallet corresponding to `currency`. If the corresponding wallet has enough balance, then the operation succeeds and the method returns true. Otherwise, we deduct as much as we can from the corresponding wallet. We then deduct from the other wallets in the order of `supported_currencies`. The method returns true as long as the total balace of all wallets is greater than or equal to the specified amount.

For example:

```python
SUPPORTED_CURRENCIES = ["USD", "GBP", "CNY", "INR"]
RATES_USD = {"GBP": 1.122, "USD": 1.0, "CNY": 0.1477825, "INR": 0.012288}
account = Account(SUPPORTED_CURRENCIES, RATES_USD)
account.load("USD", 100.0)
account.load("GBP", 100.0)
assert account.spend("USD", 200.0)
account.summarize()  # {'GBP': 10.873440285205007}
assert account.spend("INR", 10.0)
account.summarize()  # {'GBP': 10.763921568627467}
assert account.spend("CNY", 80.0)
account.summarize()  # {'GBP': 0.226844919786112}
```

#### Solution

Only the `spend(currency, amount)` method needs to be modified from the previous problem:

```python
def spend(self, currency: str, amount: float) -> bool:
    if self._wallets[currency] >= amount:
        self._wallets[currency] -= amount
        return True
    amount -= self._wallets[currency]
    self._wallets[currency] = 0
    for other_curr, balance in self._wallets.items():
        if balance > 0:
            exr = get_exchange_rate(self._rates, currency, other_curr)
            amount_converted = amount * exr
            if amount_converted <= balance:
                self._wallets[other_curr] -= amount_converted
                return True
            else:
                self._wallets[other_curr] = 0
                amount -= balance / exr
    return False
```
