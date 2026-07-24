# Chapter 2: Object-Oriented Programming

## Section 1: Fundamentals of Object-Oriented Programming

Object-Oriented Programming (OOP) is a fundamental programming paradigm you'll encounter throughout your software engineering career and, crucially, in coding interviews. Interviewers use OOP-related questions to assess your ability to structure code logically, create reusable and modular components, and model problems effectively.

This chapter is designed to provide you with a solid foundation in the core principles of OOP and how to implement them in JavaScript. We'll start with the essential concepts—what classes and objects are, how to define them, and how to use features like encapsulation, inheritance, polymorphism, and abstraction at a practical level. We will explore each concept with clear explanations and illustrative examples. Following this, "Solved Problems" will show these principles in action through concrete code. Finally, a set of exercises will provide you with opportunities to apply what you've learned and hone your OOP implementation skills.

## Section 1: Core OOP Principles
Let's dive into the essential building blocks of Object-Oriented Programming.

### Classes and Objects

A class serves as a blueprint for objects, encapsulating attributes (data) and methods (functions) that operate on that data. JavaScript's [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) syntax (ES2015+) gives us a clean way to express this. Consider the `Cat` class as an example:

```javascript
class Cat {
  static species = "Felis catus"; // Class (static) attribute

  constructor(name, age) {
    this.name = name; // Instance attribute
    this.age = age;
  }

  description() {
    return `${this.name} is ${this.age} years old`;
  }

  speak(sound) {
    return `${this.name} says ${sound}`;
  }
}
```

Instantiation and interaction with a Cat object:

```javascript
const myCat = new Cat("Cookie", 8);
console.log(myCat.description()); // Output: Cookie is 8 years old
console.log(myCat.speak("meow")); // Output: Cookie says meow
```

### Inheritance: Enhancing Reusability and Hierarchy

Inheritance is a fundamental principle of object-oriented programming that enables a class to derive or inherit attributes and behaviors (methods) from another class. This mechanism promotes code reusability and establishes a natural hierarchy among classes.

In the following example, the `Persian` class inherits from the `Cat` class using [`extends`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends). This means that a `Persian` cat is a specialized form of `Cat` that retains general `Cat` behaviors while also defining behaviors specific to Persian cats.

```javascript
class Persian extends Cat {
  speak(sound = "purr") {
    return super.speak(sound);
  }
}
```

In this code:

- The `Persian` class extends `Cat`, meaning it inherits `Cat`'s attributes and methods.
- The `speak` method in the `Persian` class overrides the same method in the `Cat` class, providing a specific behavior for Persian cats. The [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) keyword is used to call the parent class's method, allowing the `Persian` class to extend or modify its behavior.

### Encapsulation: Data Integrity

Encapsulation promotes data integrity by restricting direct access to an object's attributes. It's not just about making attributes private; it's about providing controlled access through public methods. JavaScript supports true [private class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) using the `#` prefix—these are only accessible from inside the class body.

```javascript
class Cat {
  #name; // Private field
  #age;  // Private field

  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }

  // Getter and setter methods for name
  getName() {
    return this.#name;
  }

  setName(name) {
    this.#name = name;
  }

  // Getter and setter methods for age
  getAge() {
    return this.#age;
  }

  setAge(age) {
    if (age < 0) {
      throw new RangeError("Age cannot be negative.");
    } else {
      this.#age = age;
    }
  }

  description() {
    return `${this.#name} is ${this.#age} years old`;
  }
}
```

Usage:

```javascript
const myCat = new Cat("Whiskers", 5);
myCat.setName("Mr. Whiskers");
try {
  myCat.setAge(-1); // Throws Error
} catch (e) {
  console.log(e.message); // Age cannot be negative.
}
myCat.setAge(6);
console.log(myCat.description()); // Output: Mr. Whiskers is 6 years old
```

> **Note:** JavaScript also offers [`get`/`set` accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get), which let callers write `myCat.name = "..."` while still running validation logic. For example, `set age(value) { if (value < 0) throw ...; this.#age = value; }` combines the ergonomics of a plain property with the safety of a setter. We use explicit `getX`/`setX` methods here to mirror the original example closely.

### Polymorphism: Interface Flexibility

Polymorphism allows objects of different classes to be treated through a common interface. In JavaScript this falls out naturally from dynamic dispatch: any object exposing a `speak()` method can be passed to `catSpeak`.

```javascript
class Siamese extends Cat {
  speak(sound = "meezer") {
    return super.speak(sound);
  }
}

function catSpeak(cat) {
  console.log(cat.speak());
}

const siamese = new Siamese("Luna", 3);
const persian = new Persian("Ginger", 5);

catSpeak(siamese); // Output: Luna says meezer
catSpeak(persian); // Output: Ginger says purr
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
      * Attributes: `courseId` (string, unique), `name` (string), `credits` (number, positive integer).
      * Methods: `constructor`, `toString`, `repr`, `equals`, plus a stable string key (`courseId`) used when storing in collections.
2.  **`Student` Class:**
      * Attributes: `studentId` (string, unique), `name` (string), `#registeredCourses` (`Map<string, Course>`), `#currentCreditsTaken` (number).
      * Methods: `constructor`, `registerCourse(course, maxCreditsAllowed) -> boolean`, `dropCourse(courseId) -> boolean`, `getTotalCredits() -> number`, `viewSchedule() -> string[]`, `toString`, `repr`.
3.  **`RegistrationSystem` Class:**
      * Attributes: `#coursesAvailable` (`Map<string, Course>`), `#studentsEnrolled` (`Map<string, Student>`), `maxCreditsPerStudent` (number, default 24).
      * Methods: `constructor`, `addCourseToSystem(...) -> boolean`, `getCourse(...) -> Course | null`, `addStudentToSystem(...) -> Student | null`, `getStudent(...) -> Student | null`, `enrollStudentInCourse(...) -> boolean`, `dropStudentFromCourse(...) -> boolean`, `displayStudentSchedule(...)`, `displayAvailableCourses()`.

**Task:** Implement the `Course`, `Student`, and `RegistrationSystem` classes with all specified attributes and methods. Include robust error handling using the custom error classes and log statements to indicate the outcome of operations. Write example usage code to demonstrate all functionalities, including successful operations and error conditions.

> **Note on `__eq__`/`__hash__`:** Python overrides `__eq__` and `__hash__` so that `Course` objects compare equal by `courseId` and can be used as dictionary/set keys. JavaScript `Map`/`Set` use reference (identity) equality for objects, so instead of relying on hashing we key our collections directly by the `courseId` string. We still expose an `equals(other)` helper to mirror the intent.

#### Solution

```javascript
class RegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = "RegistrationError";
  }
}

class CourseValidationError extends RegistrationError {
  constructor(message) {
    super(message);
    this.name = "CourseValidationError";
  }
}

class StudentValidationError extends RegistrationError {
  constructor(message) {
    super(message);
    this.name = "StudentValidationError";
  }
}

class EnrollmentError extends RegistrationError {
  constructor(message) {
    super(message);
    this.name = "EnrollmentError";
  }
}

class Course {
  constructor(courseId, name, credits) {
    if (!courseId || typeof courseId !== "string") {
      throw new CourseValidationError("Course ID must be a non-empty string.");
    }
    if (!name || typeof name !== "string") {
      throw new CourseValidationError("Course name must be a non-empty string.");
    }
    if (!Number.isInteger(credits) || credits <= 0) {
      throw new CourseValidationError("Credits must be a positive integer.");
    }

    this.courseId = courseId;
    this.name = name;
    this.credits = credits;
  }

  toString() {
    return `${this.courseId}: ${this.name} (${this.credits} credits)`;
  }

  repr() {
    return `Course(id='${this.courseId}', name='${this.name}', credits=${this.credits})`;
  }

  equals(other) {
    if (!(other instanceof Course)) return false;
    return this.courseId === other.courseId;
  }
}

class Student {
  #registeredCourses;
  #currentCreditsTaken;

  constructor(studentId, name) {
    if (!studentId || typeof studentId !== "string") {
      throw new StudentValidationError("Student ID must be a non-empty string.");
    }
    if (!name || typeof name !== "string") {
      throw new StudentValidationError("Student name must be a non-empty string.");
    }

    this.studentId = studentId;
    this.name = name;
    this.#registeredCourses = new Map(); // courseId -> Course
    this.#currentCreditsTaken = 0;
    console.log(`Student '${this.name}' (ID: ${this.studentId}) created.`);
  }

  registerCourse(course, maxCreditsAllowed) {
    if (!(course instanceof Course)) {
      throw new EnrollmentError("Invalid course object provided for registration.");
    }
    if (this.#registeredCourses.has(course.courseId)) {
      console.log(`Student ${this.studentId} already registered for ${course.courseId}.`);
      return false;
    }

    if (this.#currentCreditsTaken + course.credits > maxCreditsAllowed) {
      console.log(
        `Student ${this.studentId} cannot register for ${course.courseId}. ` +
          `Exceeds credit limit of ${maxCreditsAllowed}. ` +
          `Current credits: ${this.#currentCreditsTaken}, Course credits: ${course.credits}.`
      );
      return false;
    }

    this.#registeredCourses.set(course.courseId, course);
    this.#currentCreditsTaken += course.credits;
    console.log(
      `Student ${this.studentId} successfully registered for ${course.courseId}. ` +
        `Total credits: ${this.#currentCreditsTaken}.`
    );
    return true;
  }

  dropCourse(courseId) {
    const courseToDrop = this.#registeredCourses.get(courseId);
    if (!courseToDrop) {
      console.log(`Student ${this.studentId} is not registered for course ${courseId} to drop.`);
      return false;
    }

    this.#currentCreditsTaken -= courseToDrop.credits;
    this.#registeredCourses.delete(courseId);
    console.log(
      `Student ${this.studentId} dropped course ${courseId}. ` +
        `Total credits: ${this.#currentCreditsTaken}.`
    );
    return true;
  }

  getTotalCredits() {
    return this.#currentCreditsTaken;
  }

  viewSchedule() {
    if (this.#registeredCourses.size === 0) {
      return ["Schedule is empty. No courses registered."];
    }
    return [...this.#registeredCourses.values()].map((course) => course.toString());
  }

  toString() {
    return `Student: ${this.name} (ID: ${this.studentId}, Credits: ${this.#currentCreditsTaken})`;
  }

  repr() {
    return `Student(id='${this.studentId}', name='${this.name}')`;
  }
}

class RegistrationSystem {
  static DEFAULT_MAX_CREDITS = 24;

  #coursesAvailable;
  #studentsEnrolled;

  constructor(maxCreditsPerStudent = RegistrationSystem.DEFAULT_MAX_CREDITS) {
    if (!Number.isInteger(maxCreditsPerStudent) || maxCreditsPerStudent <= 0) {
      throw new RangeError("Max credits per student must be a positive integer.");
    }
    this.#coursesAvailable = new Map();
    this.#studentsEnrolled = new Map();
    this.maxCreditsPerStudent = maxCreditsPerStudent;
    console.log(
      `Registration System initialized. Max credits per student: ${this.maxCreditsPerStudent}.`
    );
  }

  addCourseToSystem(courseId, name, credits) {
    if (this.#coursesAvailable.has(courseId)) {
      console.log(`Error: Course with ID '${courseId}' already exists in the system.`);
      return false;
    }
    try {
      const course = new Course(courseId, name, credits);
      this.#coursesAvailable.set(courseId, course);
      console.log(`Course '${name}' (${courseId}) with ${credits} credits added to system.`);
      return true;
    } catch (e) {
      if (e instanceof CourseValidationError) {
        console.log(`Error adding course ${courseId} to system: ${e.message}`);
        return false;
      }
      throw e;
    }
  }

  getCourse(courseId) {
    const course = this.#coursesAvailable.get(courseId);
    if (!course) console.log(`Info: Course ${courseId} not found in system.`);
    return course ?? null;
  }

  addStudentToSystem(studentId, studentName) {
    if (this.#studentsEnrolled.has(studentId)) {
      const existing = this.#studentsEnrolled.get(studentId);
      console.log(`Info: Student with ID '${studentId}' (${existing.name}) already in system.`);
      return existing;
    }
    try {
      const student = new Student(studentId, studentName);
      this.#studentsEnrolled.set(studentId, student);
      return student;
    } catch (e) {
      if (e instanceof StudentValidationError) {
        console.log(`Error adding student ${studentId} to system: ${e.message}`);
        return null;
      }
      throw e;
    }
  }

  getStudent(studentId) {
    const student = this.#studentsEnrolled.get(studentId);
    if (!student) console.log(`Info: Student ${studentId} not found in system.`);
    return student ?? null;
  }

  enrollStudentInCourse(studentId, courseId) {
    const student = this.getStudent(studentId);
    const course = this.getCourse(courseId);

    if (!student) return false; // getStudent already prints if not found
    if (!course) return false; // getCourse already prints if not found

    console.log(`\nAttempting to enroll Student '${student.name}' in Course '${course.name}'...`);
    try {
      const success = student.registerCourse(course, this.maxCreditsPerStudent);
      if (success) {
        console.log(`Overall enrollment of '${student.name}' in '${course.name}' successful.`);
      } else {
        console.log(
          `Overall enrollment of '${student.name}' in '${course.name}' failed (see student messages).`
        );
      }
      return success;
    } catch (e) {
      if (e instanceof EnrollmentError) {
        console.log(`Enrollment Error for student ${studentId} in course ${courseId}: ${e.message}`);
        return false;
      }
      throw e;
    }
  }

  dropStudentFromCourse(studentId, courseId) {
    const student = this.getStudent(studentId);
    if (!student) return false; // getStudent already prints

    console.log(`\nAttempting to drop Course '${courseId}' for Student '${student.name}'...`);
    // Student.dropCourse prints its own success/failure.
    return student.dropCourse(courseId);
  }

  displayStudentSchedule(studentId) {
    const student = this.getStudent(studentId);
    if (!student) return; // getStudent already prints

    console.log(`\n--- Schedule for ${student.name} (ID: ${student.studentId}) ---`);
    console.log(`Total Credits Registered: ${student.getTotalCredits()}`);
    for (const item of student.viewSchedule()) {
      console.log(`  - ${item}`);
    }
    console.log("--------------------------------------");
  }

  displayAvailableCourses() {
    console.log("\n--- Available Courses in System ---");
    if (this.#coursesAvailable.size === 0) {
      console.log("No courses have been added to the system yet.");
      return;
    }
    for (const courseId of [...this.#coursesAvailable.keys()].sort()) {
      // Display sorted by ID
      console.log(`  - ${this.#coursesAvailable.get(courseId).toString()}`);
    }
    console.log("-----------------------------------");
  }
}

// Example Usage for Course Registration System:
// console.log("\n--- Course Registration System Example ---");
// const regSystem = new RegistrationSystem(7); // Low limit for testing
//
// // Add courses
// regSystem.addCourseToSystem("CS101", "Intro to JavaScript", 3);
// regSystem.addCourseToSystem("MA202", "Linear Algebra", 4);
// regSystem.addCourseToSystem("EN100", "English Composition", 3);
// regSystem.addCourseToSystem("CS101", "Intro to JavaScript (Repeat)", 3); // Test duplicate add
// regSystem.addCourseToSystem("PHY200", "Physics Mechanics", 0); // Test invalid credits
//
// regSystem.displayAvailableCourses();
//
// // Add students
// const studentAlice = regSystem.addStudentToSystem("S1001", "Alice Smith");
// const studentBob = regSystem.addStudentToSystem("S1002", "Bob Johnson");
//
// // Enroll Alice
// if (studentAlice) {
//   regSystem.enrollStudentInCourse("S1001", "CS101"); // 3 credits
//   regSystem.enrollStudentInCourse("S1001", "MA202"); // 4 credits (total 7)
//   regSystem.enrollStudentInCourse("S1001", "CS101"); // Try duplicate enrollment
//   regSystem.enrollStudentInCourse("S1001", "EN100"); // Should fail (3 more credits -> 10 > 7)
//   regSystem.displayStudentSchedule("S1001");
// }
//
// // Alice drops MA202 and tries EN100 again
// if (studentAlice) {
//   regSystem.dropStudentFromCourse("S1001", "MA202"); // Credits become 3
//   regSystem.enrollStudentInCourse("S1001", "EN100"); // Should succeed now (3+3=6 <= 7)
//   regSystem.displayStudentSchedule("S1001");
// }
//
// // Enroll Bob
// if (studentBob) {
//   regSystem.enrollStudentInCourse("S1002", "MA202");
//   regSystem.displayStudentSchedule("S1002");
//   regSystem.enrollStudentInCourse("S1002", "CS999"); // Non-existent course
// }
```

### Problem 3: Recording Storage Service

Implement a recording storage service. Each recording is stored under a path:

```
{clientId}/{date}/{recordingName}
```

where `date` is in the format `YYYY-MM-DD`. Every recording has:

* a **size** (integer bytes)

* a **time-to-live** (`ttlDays`, integer) counted from its upload date

* an **expiration date** = upload date + `ttlDays`

* an implicit **“today”** (for testing you must be able to override the current date)

Your service must support these operations:

1. **STORE\_RECORDING**

   ```javascript
   storeRecording(clientId,        // string
                  recordingName,   // string
                  date,            // "YYYY-MM-DD"
                  size,            // number
                  ttlDays)         // number -> void
   ```

   * Store a new recording at the given path with computed expiration.

   * If the _exact_ path already exists (same client, date, name), throw\
     `new Error("recording path already exists")`.

2. **GET\_RECORDING**

   ```javascript
   getRecording(clientId,          // string
                recordingName,     // string
                date)              // string -> [size, remainingTtlDays] | null
   ```

   * If the recording exists and has **not** expired, return\
     `[size, remainingTtlDays]`

   * Otherwise return `null`.

3. **COPY\_RECORDING**

   ```javascript
   copyRecording(sourcePath,       // string
                 destPath)         // string -> void
   ```

   * Copy metadata (size + original expiration) from `sourcePath` to `destPath`.

   * Paths are of form `"clientId/date/recordingName"`.

   * If source is missing or expired, throw\
     `new Error("source recording doesn't exist or is expired")`.

   * If `destPath` already exists, overwrite it.

4. **GET\_RECORDING\_OWNERSHIP**

   ```javascript
   getRecordingOwnership(recordingName)  // string -> [clientId, date]
   ```

   * Among _all_ non-expired instances of that `recordingName`, return the\
     `[clientId, date]` with the **earliest** `date`.

   * If never stored: throw `RecordingNotFoundException("recording not found")`.

   * If all copies expired: throw `ExpiredRecordingException("recording is expired")`.


## JavaScript Solution

JavaScript has no `datetime`/`timedelta` module; we use the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object instead. Parsing a `"YYYY-MM-DD"` string as `` `${d}T00:00:00Z` `` (UTC) keeps date arithmetic free of local time-zone surprises, and one day is `86_400_000` milliseconds.

```javascript
const MS_PER_DAY = 86_400_000;

class RecordingNotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "RecordingNotFoundException";
  }
}

class ExpiredRecordingException extends Error {
  constructor(message) {
    super(message);
    this.name = "ExpiredRecordingException";
  }
}

class StorageService {
  #storage; // Map<clientId, Map<date, Map<recordingName, [size, expiresAt: Date]>>>
  #index; // Map<recordingName, Array<[clientId, date, expiresAt: Date]>>
  #today; // Date used for TTL calculations (default = actual today)

  constructor() {
    this.#storage = new Map();
    this.#index = new Map();
    this.#today = this.#stripTime(new Date());
  }

  #parseDate(d) {
    return new Date(`${d}T00:00:00Z`);
  }

  #formatDate(dt) {
    return dt.toISOString().slice(0, 10);
  }

  #stripTime(dt) {
    return new Date(`${dt.toISOString().slice(0, 10)}T00:00:00Z`);
  }

  #assertNotExpired(expiresAt) {
    if (expiresAt.getTime() < this.#today.getTime()) {
      throw new ExpiredRecordingException("recording is expired");
    }
  }

  #remainingTtl(expiresAt) {
    return Math.max(Math.floor((expiresAt.getTime() - this.#today.getTime()) / MS_PER_DAY), 0);
  }

  setToday(today) {
    // Override 'today' (YYYY-MM-DD) for testing.
    this.#today = this.#parseDate(today);
  }

  storeRecording(clientId, recordingName, date, size, ttlDays) {
    const dt = this.#parseDate(date);
    const expiresAt = new Date(dt.getTime() + ttlDays * MS_PER_DAY);

    // Initialize nested maps
    if (!this.#storage.has(clientId)) this.#storage.set(clientId, new Map());
    const byDate = this.#storage.get(clientId);
    if (!byDate.has(date)) byDate.set(date, new Map());
    const byName = byDate.get(date);

    // Check duplicate
    if (byName.has(recordingName)) {
      throw new Error("recording path already exists");
    }

    // Store
    byName.set(recordingName, [size, expiresAt]);

    // Update index
    if (!this.#index.has(recordingName)) this.#index.set(recordingName, []);
    this.#index.get(recordingName).push([clientId, date, expiresAt]);
  }

  getRecording(clientId, recordingName, date) {
    const rec = this.#storage.get(clientId)?.get(date)?.get(recordingName);
    if (!rec) return null;

    const [size, expiresAt] = rec;
    if (expiresAt.getTime() < this.#today.getTime()) return null;
    return [size, this.#remainingTtl(expiresAt)];
  }

  copyRecording(sourcePath, destPath) {
    const splitPath = (p) => {
      const parts = p.split("/");
      if (parts.length !== 3) throw new Error("invalid path");
      return parts;
    };

    const [srcC, srcD, srcName] = splitPath(sourcePath);
    const [dstC, dstD, dstName] = splitPath(destPath);

    // Lookup source
    const rec = this.#storage.get(srcC)?.get(srcD)?.get(srcName);
    if (!rec) {
      throw new Error("source recording doesn't exist or is expired");
    }

    const [size, expiresAt] = rec;
    if (expiresAt.getTime() < this.#today.getTime()) {
      throw new Error("source recording doesn't exist or is expired");
    }

    // Overwrite destination
    if (!this.#storage.has(dstC)) this.#storage.set(dstC, new Map());
    const byDate = this.#storage.get(dstC);
    if (!byDate.has(dstD)) byDate.set(dstD, new Map());
    byDate.get(dstD).set(dstName, [size, expiresAt]);

    // Update index
    if (!this.#index.has(dstName)) this.#index.set(dstName, []);
    this.#index.get(dstName).push([dstC, dstD, expiresAt]);
  }

  getRecordingOwnership(recordingName) {
    if (!this.#index.has(recordingName)) {
      throw new RecordingNotFoundException("recording not found");
    }

    const candidates = [];
    for (const [clientId, date, expiresAt] of this.#index.get(recordingName)) {
      if (expiresAt.getTime() >= this.#today.getTime()) {
        candidates.push([this.#parseDate(date).getTime(), clientId, date]);
      }
    }

    if (candidates.length === 0) {
      throw new ExpiredRecordingException("recording is expired");
    }

    // Pick earliest date
    let best = candidates[0];
    for (const c of candidates) {
      if (c[0] < best[0]) best = c;
    }
    const [, clientId, date] = best;
    return [clientId, date];
  }
}
```

### Explanation

1. **Storage Layout**

   * `#storage` is a 3-level `Map` keyed by `clientId` → `date` → `recordingName`.

   * Each entry holds `[size, expiresAt]` where `expiresAt` is a `Date`.

2. **Global Index**

   * `#index.get(recordingName)` is an array of all copies ever stored or copied, each with its expiration.

   * This lets `getRecordingOwnership` run in O(k) over that list, not scanning all clients.

3. **TTL & “Today”**

   * By default, `today` is the actual current date (with the time component stripped), but tests can call `setToday("YYYY-MM-DD")`.

   * Remaining TTL = `max(floor((expiresAt − today) / MS_PER_DAY), 0)`.

4. **Error Cases**

   * Duplicate `storeRecording` → `Error`.

   * Missing or expired source in `copyRecording` → `Error`.

   * `getRecording` missing/expired → returns `null`.

   * Ownership lookup when never stored → `RecordingNotFoundException`.

   * Ownership lookup when all expired → `ExpiredRecordingException`.

***

### Basic Unit Tests

```javascript
function assert(cond, msg = "assertion failed") {
  if (!cond) throw new Error(msg);
}

function arraysEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function testPhase1And2() {
  const svc = new StorageService();
  svc.setToday("2025-02-10");

  // Store and retrieve
  svc.storeRecording("c1", "a.mp4", "2025-02-10", 100, 7);
  assert(arraysEqual(svc.getRecording("c1", "a.mp4", "2025-02-10"), [100, 7]));

  // Advance time
  svc.setToday("2025-02-15");
  assert(arraysEqual(svc.getRecording("c1", "a.mp4", "2025-02-10"), [100, 2]));

  // Copy onto new client/date
  svc.copyRecording("c1/2025-02-10/a.mp4", "c2/2025-02-14/a.mp4");
  // original expiration 2025-02-17 → TTL 2 days on 2025-02-15
  assert(arraysEqual(svc.getRecording("c2", "a.mp4", "2025-02-14"), [100, 2]));

  // Ownership: earliest non-expired is c1/2025-02-10
  const owner = svc.getRecordingOwnership("a.mp4");
  assert(arraysEqual(owner, ["c1", "2025-02-10"]));

  // Expire everything
  svc.setToday("2025-03-01");
  assert(svc.getRecording("c1", "a.mp4", "2025-02-10") === null);
  try {
    svc.getRecordingOwnership("a.mp4");
    assert(false, "should have raised");
  } catch (e) {
    assert(e instanceof ExpiredRecordingException);
  }

  // Duplicate store → error
  svc.setToday("2025-02-10");
  svc.storeRecording("c1", "b.mp4", "2025-02-10", 50, 1);
  try {
    svc.storeRecording("c1", "b.mp4", "2025-02-10", 50, 1);
    assert(false);
  } catch (e) {
    assert(e.message === "recording path already exists");
  }
}

testPhase1And2();
console.log("All tests passed!");
```

***

This fully specifies the **concrete coding problem**, and provides a **working JavaScript solution** plus basic tests covering Phases 1 and 2.

### Problem 4: Sales Network

Implement a system to manage a hierarchical organization of sales agents. Each agent in this structure may have a unique manager (except for the root agent, who has no manager) and can have multiple direct reports.

##### Agent Class

- `constructor(agentId)`: Initializes an agent with a specified unique identifier.
- `addReport(report)`: Registers another agent as a direct report, updating the hierarchical structure accordingly.
- `addSales(sales)`: Increments this agent's sales total by the specified amount.
- `assignManager(manager)`: Sets or updates the manager for this agent. This method adjusts the agent's and the manager's records to maintain the structural integrity of the reporting hierarchy.

##### Network Class

- `constructor()`: Initializes the network with an empty map to store agents by their identifiers.
- `addAgent(agentId, managerId = null)`: Inserts a new agent into the network, optionally linking them to an existing agent as their manager.
- `removeAgent(agentId)`: Removes an agent from the network, ensuring that their reports are reassigned to the removed agent's manager, maintaining the structural continuity.
- `assignManager(agentId, managerId)`: Links an agent to a manager within the network, updating the hierarchical links as necessary.
- `addSales(agentId, sales)`: Updates the sales data for a specified agent.

> **Note:** In Python, `Agent` overrides `__eq__`/`__hash__` by `agent_id` so agents can live in a `set`. In JavaScript each `agentId` maps to exactly one `Agent` instance, so a native `Set` of `Agent` objects works correctly under reference equality—no custom hashing needed.

#### Solution:

```javascript
class Agent {
  constructor(agentId) {
    this.agentId = agentId;
    this.reports = new Set();
    this.manager = null;
    this.sales = 0.0;
  }

  equals(other) {
    if (!(other instanceof Agent)) return false;
    return this.agentId === other.agentId;
  }

  toString() {
    return `<Agent ${this.agentId}>`;
  }

  addReport(report) {
    if (!this.reports.has(report)) {
      report.manager = this;
      this.reports.add(report);
    }
  }

  addSales(sales) {
    this.sales += sales;
  }

  assignManager(manager) {
    if (manager === this.manager) {
      return;
    }
    if (this.manager !== null) {
      this.manager.reports.delete(this);
    }
    this.manager = manager;
    if (manager !== null) {
      manager.reports.add(this);
    }
  }
}

class Network {
  constructor() {
    this.agents = new Map();
  }

  addAgent(agentId, managerId = null) {
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ID ${agentId} already exists in the network.`);
    }
    const agent = new Agent(agentId);
    this.agents.set(agentId, agent);
    if (managerId !== null) {
      this.assignManager(agentId, managerId);
    }
  }

  removeAgent(agentId) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ID ${agentId} not found in the network.`);
    }
    const agent = this.agents.get(agentId);
    this.agents.delete(agentId);
    if (agent.manager !== null) {
      agent.manager.reports.delete(agent);
    }
    for (const report of [...agent.reports]) {
      report.assignManager(agent.manager);
    }
  }

  assignManager(agentId, managerId) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ID ${agentId} not found in the network.`);
    }
    if (managerId !== null && !this.agents.has(managerId)) {
      throw new Error(`Manager ID ${managerId} not found in the network.`);
    }
    this.agents.get(agentId).assignManager(managerId !== null ? this.agents.get(managerId) : null);
  }

  addSales(agentId, sales) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ID ${agentId} not found in the network.`);
    }
    this.agents.get(agentId).addSales(sales);
  }
}
```

### Problem 5: File System

Design an **in-memory file system** that supports basic Unix-like file operations. The file system should maintain its structure in memory and allow users to perform the following operations:

### **Operations:**

1. **pwd() → string**

   * Return the current working directory as an absolute path (e.g., `"/a/b"` or `"/"`).

2. **cd(path) → void**

   * Change the current directory to the specified path.

   * Supports absolute (`"/x/y"`) and relative (`"../up"`, `"dir"`) paths.

   * Throws `NotADirectoryError` if the path is not a directory.

   * Throws `FileNotFoundError` if the path does not exist.

3. **ls(path = null) → string[]**

   * List the contents of the specified path. If no path is given, list the contents of the current directory.

   * If the path is a file, return an array with just that file name.

   * If the path is a directory, return its contents in **lexicographic order**.

4. **mkdir(path) → void**

   * Create a directory at the specified path, including any necessary parent directories.

   * Does nothing if the directory already exists.

5. **touch(path) → void**

   * Create an **empty file** at the specified path.

   * If the path already exists as a file, do nothing.

   * If it exists as a directory, throw `IsADirectoryError`.

6. **cat(path) → string**

   * Return the contents of the file at the specified path.

   * Throw `IsADirectoryError` if the path is a directory.

7. **echo(content, path) → void**

   * Write the specified content to the file at the specified path.

   * If the file does not exist, create it.

   * If it exists as a directory, throw `IsADirectoryError`.

> **Note:** JavaScript has no built-in `NotADirectoryError` / `FileNotFoundError` / `IsADirectoryError` exceptions (these are Python's OS-error subclasses), so we define small `Error` subclasses to model them.

### **Example Usage:**

```javascript
const fs = new FileSystem();
fs.mkdir("/a/b");
fs.touch("/a/b/file.txt");
fs.echo("hello, world", "/a/b/file.txt");
console.log(fs.cat("/a/b/file.txt")); // → "hello, world"

fs.cd("/a");
console.log(fs.pwd()); // → "/a"

fs.cd("b");
console.log(fs.pwd()); // → "/a/b"

console.log(fs.ls()); // → ["file.txt"]

fs.cd("..");
console.log(fs.ls()); // → ["b"]
```

Solution

```javascript
class NotADirectoryError extends Error {
  constructor(message = "not a directory") {
    super(message);
    this.name = "NotADirectoryError";
  }
}

class FileNotFoundError extends Error {
  constructor(message = "no such file or directory") {
    super(message);
    this.name = "FileNotFoundError";
  }
}

class IsADirectoryError extends Error {
  constructor(message = "is a directory") {
    super(message);
    this.name = "IsADirectoryError";
  }
}

class Node {
  constructor(name, isDir, parent = null) {
    this.name = name;
    this.isDir = isDir;
    this.parent = parent !== null ? parent : this;
    this.children = isDir ? new Map() : null;
    this.content = isDir ? null : "";
  }
}

class FileSystem {
  constructor() {
    this.root = new Node("", true);
    this.root.parent = this.root;
    this.cwd = this.root;
  }

  pwd() {
    const parts = [];
    let node = this.cwd;
    while (node !== this.root) {
      parts.push(node.name);
      node = node.parent;
    }
    return "/" + parts.reverse().join("/");
  }

  cd(path) {
    const node = this.#traverse(path, false);
    if (!node.isDir) {
      throw new NotADirectoryError();
    }
    this.cwd = node;
  }

  ls(path = null) {
    const node = this.#traverse(path ?? ".", false);
    if (node.isDir) {
      return [...node.children.keys()].sort();
    }
    return [node.name];
  }

  mkdir(path) {
    const parts = path.split("/").filter((p) => p && p !== ".");
    const parentPath = (path.startsWith("/") ? "/" : "") + parts.slice(0, -1).join("/");
    const parent = this.#traverse(parentPath || ".", true);
    const name = parts[parts.length - 1];
    if (!parent.children.has(name)) {
      parent.children.set(name, new Node(name, true, parent));
    }
  }

  touch(path) {
    const parts = path.split("/").filter((p) => p && p !== ".");
    const parentPath = (path.startsWith("/") ? "/" : "") + parts.slice(0, -1).join("/");
    const parent = this.#traverse(parentPath || ".", true);
    const name = parts[parts.length - 1];
    if (!parent.children.has(name)) {
      parent.children.set(name, new Node(name, false, parent));
    }
  }

  cat(path) {
    const node = this.#traverse(path, false);
    if (node.isDir) {
      throw new IsADirectoryError();
    }
    return node.content;
  }

  echo(content, path) {
    const parts = path.split("/").filter((p) => p && p !== ".");
    const parentPath = (path.startsWith("/") ? "/" : "") + parts.slice(0, -1).join("/");
    const parent = this.#traverse(parentPath || ".", true);
    const name = parts[parts.length - 1];
    if (!parent.children.has(name)) {
      parent.children.set(name, new Node(name, false, parent));
    }
    const node = parent.children.get(name);
    if (node.isDir) {
      throw new IsADirectoryError();
    }
    node.content = content;
  }

  #traverse(path, create) {
    const absolute = path.startsWith("/");
    const parts = path.split("/").filter((p) => p && p !== ".");
    let node = absolute ? this.root : this.cwd;
    for (const part of parts) {
      if (part === "..") {
        node = node.parent;
      } else {
        if (!node.isDir) {
          throw new NotADirectoryError();
        }
        if (!node.children.has(part)) {
          if (!create) {
            throw new FileNotFoundError();
          }
          node.children.set(part, new Node(part, true, node));
        }
        node = node.children.get(part);
      }
    }
    return node;
  }
}

// Test harness
(function main() {
  const assert = (cond, msg = "assertion failed") => {
    if (!cond) throw new Error(msg);
  };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const fs = new FileSystem();
  fs.mkdir("/a/b/c");
  assert(fs.pwd() === "/");
  fs.cd("a");
  assert(fs.pwd() === "/a");
  fs.cd("b/c");
  assert(fs.pwd() === "/a/b/c");
  fs.touch("file.txt");
  fs.echo("hello", "file.txt");
  assert(fs.cat("file.txt") === "hello");
  assert(eq(fs.ls(), ["file.txt"]));
  fs.cd("..");
  assert(eq(fs.ls(), ["c"]));
  assert(eq(fs.ls("c"), ["file.txt"]));
  fs.touch("/a/b/c/file.txt");
  fs.echo("world", "/a/b/c/file.txt");
  assert(fs.cat("/a/b/c/file.txt") === "world");
  fs.cd("/");
  assert(eq(fs.ls("a"), ["b"]));
  assert(eq(fs.ls("/a/b"), ["c"]));
  assert(eq(fs.ls("/a/b/c"), ["file.txt"]));
  console.log("All tests passed.");
})();
```

## Section 3: Exercises

### Problem 1:  [Find Consecutive Integers from a Data Stream](https://leetcode.com/problems/find-consecutive-integers-from-a-data-stream/)
For a stream of integers, implement a data structure that checks if the last `k` integers parsed in the stream are **equal** to `value`.

Implement the **DataStream** class:

* `DataStream(value, k)` Initializes the object with an empty integer stream and the two integers `value` and `k`.
* `consec(num)` Adds `num` to the stream of integers. Returns `true` if the last `k` integers are equal to `value`, and `false` otherwise. If there are less than `k` integers, the condition does not hold true, so returns `false`.

#### Solution

```javascript
class DataStream {
  constructor(value, k) {
    this.value = value;
    this.k = k;
    this.consecCount = 0;
  }

  consec(num) {
    if (num === this.value) {
      this.consecCount += 1;
      return this.consecCount >= this.k;
    } else {
      this.consecCount = 0;
      return false;
    }
  }
}
```

### Problem 2: Wallets

A Nium customer can hold multiple currencies in various wallets. For example, in order for a customer to maintain three currencies: USD, INR, and CNY, Nium will create a USD wallet, an INR wallet, and a CNY wallet.

Given a list of supported currencies `supportedCurrencies` and a mapping of exchange rates `rates`, implement an `Account` class with the following methods:

* `Account(supportedCurrencies, rates)`: the constructor
* `load(currency, amount)`: load the specified amount into the corresponding wallet. This method does not return anything.
* `spend(currency, amount)`: deduct the specified amount from the account.
* `summarize()`: prints the balance of every wallet with a positive balance.

Assumptions:

* `supportedCurrencies` contains a list of valid currencies.
* `rates` is an object `{currency1: val1, currency2: val2, ...}` where the keys exist in `supportedCurrencies` and the values are ***relative to USD***. For example `{"AUD":0.672,"CAD":0.763767}` means that 0.672 USD equals 1 AUD, and 0.763767 USD equals 1 CAD.

In this problem, `spend(currency, amount)` attempts to deduct from the wallet corresponding to `currency`. If the corresponding wallet has enough balance, then the operation succeeds and the method returns `true`. Otherwise, no amount is deducted and the method returns `false`.

Example:

```javascript
const SUPPORTED_CURRENCIES = ["USD", "GBP"];
const RATES_USD = { GBP: 1.122, USD: 1.0 };

const account = new Account(SUPPORTED_CURRENCIES, RATES_USD);
account.load("USD", 100.0);
account.load("GBP", 100.0);
console.assert(!account.spend("USD", 200.0));
console.assert(account.spend("GBP", 40.0));
account.summarize(); // { USD: 100, GBP: 60 }
```

#### Solution

We use a `Map` for the wallets so insertion order (the order of `supportedCurrencies`) is preserved—this matters for the follow-up problem.

```javascript
function getExchangeRate(ratesUsd, base, quote) {
  return ratesUsd[base] / ratesUsd[quote];
}

class Account {
  #wallets;
  #rates;

  constructor(supportedCurrencies, rates) {
    this.#wallets = new Map(supportedCurrencies.map((c) => [c, 0.0]));
    this.#rates = rates;
  }

  load(currency, amount) {
    this.#wallets.set(currency, this.#wallets.get(currency) + amount);
  }

  spend(currency, amount) {
    if (this.#wallets.get(currency) < amount) {
      return false;
    }
    this.#wallets.set(currency, this.#wallets.get(currency) - amount);
    return true;
  }

  summarize() {
    const positive = {};
    for (const [c, b] of this.#wallets) {
      if (b > 0) positive[c] = b;
    }
    console.log(positive);
  }
}
```

### Problem 3

Follow up to the previous Wallets problem. In this problem, `spend(currency, amount)` attempts to deduct from the wallet corresponding to `currency`. If the corresponding wallet has enough balance, then the operation succeeds and the method returns `true`. Otherwise, we deduct as much as we can from the corresponding wallet. We then deduct from the other wallets in the order of `supportedCurrencies`. The method returns `true` as long as the total balance of all wallets is greater than or equal to the specified amount.

For example:

```javascript
const SUPPORTED_CURRENCIES = ["USD", "GBP", "CNY", "INR"];
const RATES_USD = { GBP: 1.122, USD: 1.0, CNY: 0.1477825, INR: 0.012288 };
const account = new Account(SUPPORTED_CURRENCIES, RATES_USD);
account.load("USD", 100.0);
account.load("GBP", 100.0);
console.assert(account.spend("USD", 200.0));
account.summarize(); // { GBP: 10.873440285205007 }
console.assert(account.spend("INR", 10.0));
account.summarize(); // { GBP: 10.763921568627467 }
console.assert(account.spend("CNY", 80.0));
account.summarize(); // { GBP: 0.226844919786112 }
```

#### Solution

Only the `spend(currency, amount)` method needs to be modified from the previous problem. Because the `#wallets` `Map` preserves insertion order, iterating it visits the currencies in the order of `supportedCurrencies`:

```javascript
spend(currency, amount) {
  if (this.#wallets.get(currency) >= amount) {
    this.#wallets.set(currency, this.#wallets.get(currency) - amount);
    return true;
  }
  amount -= this.#wallets.get(currency);
  this.#wallets.set(currency, 0);
  for (const [otherCurr, balance] of this.#wallets) {
    if (balance > 0) {
      const exr = getExchangeRate(this.#rates, currency, otherCurr);
      const amountConverted = amount * exr;
      if (amountConverted <= balance) {
        this.#wallets.set(otherCurr, balance - amountConverted);
        return true;
      } else {
        this.#wallets.set(otherCurr, 0);
        amount -= balance / exr;
      }
    }
  }
  return false;
}
```
