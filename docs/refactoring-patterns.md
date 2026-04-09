---
title: Refactoring Patterns
category: refactoring
---

# Refactoring Patterns

Refactoring is the process of restructuring existing code without changing its external behavior. The goal is to improve readability, reduce complexity, and make future changes easier. Refactoring is most safe when done with a test suite as a safety net.

## When to Refactor

### The Rule of Three

The first time you write something, just do it. The second time you do something similar, notice the duplication. The third time you do something similar, refactor.

### Boy Scout Rule

Leave the code cleaner than you found it. Small, continuous improvements prevent code rot. You don't need a dedicated refactoring sprint if you improve a little with every change.

### Before Adding a Feature

If the current structure makes the new feature hard to add, refactor first — then add the feature. This keeps commits focused: one commit to refactor, one commit to add the feature.

## Code Smells

Code smells are surface indicators of deeper design problems. They are not bugs, but they make code harder to change.

### Long Method

Methods that are too long are hard to name, hard to understand, and hard to test. Break long methods into smaller ones, each with a clear name. The best methods are so short and well-named that their body is almost unnecessary to read.

### Large Class

A class that has too many responsibilities will have too many instance variables and too many methods. Apply the Single Responsibility Principle — identify distinct responsibilities and extract them into separate classes.

### Long Parameter List

More than three or four parameters makes a function hard to call and understand. Group related parameters into a parameter object. Consider whether some parameters could be provided by the object's own state.

### Duplicate Code

The same or very similar code in multiple places is the most common smell. Every piece of duplication is a maintenance liability — a bug fix must be applied everywhere the code is duplicated.

### Feature Envy

A method that uses data from another class more than its own class is envying that class. Move the method closer to the data it uses.

### Data Clumps

Groups of data that always appear together (e.g., a street, city, and zip code) should be grouped into their own class or struct.

### Primitive Obsession

Using primitive types (strings, integers) for domain concepts that deserve their own type. An `EmailAddress` type is safer and more expressive than a raw `string`. A `Money` type handles currency correctly where `float` does not.

### Switch Statements

Long switch or if-else chains that check types are often a sign that polymorphism would be cleaner. Each time the type list changes, every switch must be updated.

### Divergent Change

When one class is changed for many different reasons, it has multiple responsibilities. Split the class by the reason it changes.

### Shotgun Surgery

When a single change requires making many small changes across many classes, the responsibility is scattered. Consolidate it.

### Comments That Explain What, Not Why

Comments that explain what code does (rather than why a non-obvious decision was made) are a smell that the code itself isn't clear. Refactor the code until the comment is unnecessary.

## Core Refactoring Techniques

### Extract Method

Take a code fragment and turn it into a method whose name explains its purpose.

**Before:** A 50-line method with a block that validates email.
**After:** The same 50-line method, now calling a `validateEmail()` method.

This is the most fundamental and commonly applied refactoring.

### Extract Class

When a class does the work of two classes, extract the second set of responsibilities into a new class.

### Move Method / Move Field

If a method or field is used more by another class than by its own class, move it.

### Replace Conditional with Polymorphism

Replace a switch or if-else that switches on type with polymorphism. Create a subclass or strategy for each branch. The calling code becomes simpler — it just calls the method, unaware of which implementation executes.

### Introduce Parameter Object

Replace a group of parameters that naturally go together with an object.

**Before:** `createEvent(startDate, endDate, startTime, endTime)`
**After:** `createEvent(dateTimeRange: DateTimeRange)`

### Replace Magic Number with Symbolic Constant

Replace a raw numeric or string literal with a named constant that explains its meaning.

**Before:** `if (status == 4)`
**After:** `if (status == STATUS_CANCELLED)`

### Inline Variable / Inline Method

Sometimes a variable or method is so small or obvious that it adds indirection without adding clarity. Inline it.

### Decompose Conditional

Complex conditional logic can be extracted into well-named methods: `if (isEligibleForDiscount())` is clearer than the raw boolean expression inline.

## Safe Refactoring Process

### Always Have Tests Before Refactoring

Never refactor without a safety net. If the code you're changing lacks tests, write characterization tests first — tests that document the current behavior, whatever it is.

### Make Small, Atomic Steps

Each refactoring step should be small enough that if something breaks, you know exactly what caused it. Commit frequently. Use your IDE's automated refactoring tools (rename, extract method) which are safer than manual editing.

### Run Tests After Every Step

Don't batch up refactorings and run tests at the end. Run after every individual change. Catching a regression immediately tells you exactly which step introduced it.

### Separate Refactoring from Feature Work

Don't refactor and add a new feature in the same commit. Mixing them makes code review harder and makes it impossible to bisect a regression. Refactor first, commit, then add the feature.
