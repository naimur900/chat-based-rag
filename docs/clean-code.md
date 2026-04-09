---
title: Clean Code Practices
category: clean-code
---

# Clean Code Practices

Clean code is code that is easy to read, understand, and change. It minimizes cognitive load for the next engineer — which is often future you. These practices are drawn from Robert C. Martin's *Clean Code*, Martin Fowler's *Refactoring*, and industry consensus.

## Naming

Good names are the most impactful thing you can do for readability. Names should reveal intent.

### Use Intention-Revealing Names

A name should tell you why something exists, what it does, and how it is used. If a name requires a comment, the name is not revealing enough.

Bad: `int d; // elapsed time in days`
Good: `int elapsedTimeInDays;`

### Avoid Disinformation

Don't use names that mislead. Don't call something a `List` if it isn't one. Don't use `l`, `O`, or `I` as variable names — they look like `1` and `0`.

### Use Searchable Names

Single-character names and numeric constants are not searchable. `MAX_CLASSES_PER_STUDENT` is far easier to find than the number `7` scattered throughout the codebase.

### Name Functions as Verbs, Classes as Nouns

Functions do things — name them with verbs: `calculateTotal`, `sendEmail`, `parseConfig`. Classes are things — name them with nouns: `UserAccount`, `OrderProcessor`, `PaymentGateway`.

## Functions

Functions should be small, focused, and do one thing well.

### Do One Thing

A function should do one thing, do it well, and do it only. If a function does more than one thing, extract the secondary concern into its own function.

A useful test: can you describe what a function does without using the word "and"? If not, it probably does too much.

### Keep Functions Small

Functions should rarely exceed 20 lines. If a function is scrolling off screen, it is doing too much. Small functions are easier to name, test, and reason about.

### Prefer Fewer Arguments

The ideal number of arguments is zero. One is fine. Two is manageable. Three requires justification. More than three should be refactored — consider grouping related args into a parameter object.

### Avoid Side Effects

A function should do what its name says and nothing else. A function named `checkPassword` should not also initialize a session. Side effects are lies in your function's name.

### Command Query Separation

Functions should either do something (command) or return something (query) — not both. `save()` should save; `isValid()` should return a boolean. Mixing them creates confusion.

## Code Structure and Formatting

### Vertical Distance

Concepts that are closely related should be vertically close. Caller functions should be above the functions they call. Variable declarations should be close to their usage.

### One Level of Abstraction per Function

Don't mix high-level logic with low-level details in the same function. A function reading a file and also parsing bytes and also updating UI state is operating at multiple levels of abstraction at once.

### Avoid Deep Nesting

More than two or three levels of nesting is a sign of complexity. Use early returns (guard clauses) to reduce nesting and make the happy path clear.

Bad:
```
if (user != null) {
  if (user.isActive()) {
    if (user.hasPermission("edit")) {
      // do the thing
    }
  }
}
```

Good:
```
if (user == null) return;
if (!user.isActive()) return;
if (!user.hasPermission("edit")) return;
// do the thing
```

## Comments

### Comments Are a Last Resort

A comment is an admission that you couldn't express something in code. Good code is self-documenting. Before writing a comment, try to refactor the code to make it clear.

### Good Comments

Some comments add genuine value: legal notices, intent explanations for non-obvious decisions, warnings of consequences, and TODO markers for known incomplete work.

### Bad Comments

- Redundant comments that just restate the code
- Misleading comments that are out of date
- Commented-out code (delete it; use version control)
- Noise comments like `// default constructor`

## Error Handling

### Use Exceptions, Not Return Codes

Return codes clutter callers with error-checking logic. Exceptions allow the happy path to remain clean and errors to be handled at the appropriate level.

### Don't Return Null

Returning null forces every caller to do a null check. Consider returning an empty collection, an Optional, or a Null Object instead. Null is the "billion-dollar mistake."

### Don't Pass Null

If null is passed to a method, it usually indicates a design problem. Design APIs that don't accept null. Use Optional or fail-fast with precondition checks at system boundaries.

### Provide Context with Exceptions

Exceptions should include enough context to understand what operation failed and why. A stack trace alone is often insufficient. Include the input, the operation, and the expectation that was violated.

## DRY — Don't Repeat Yourself

Every piece of knowledge should have a single, unambiguous, authoritative representation within a system. Duplication is the root of many maintenance problems.

### Types of Duplication

- **Code duplication:** the same logic copy-pasted in multiple places
- **Data duplication:** the same information stored in multiple forms
- **Documentation duplication:** comments that restate what the code already says

### When Not to Apply DRY

Premature deduplication creates wrong abstractions. Two pieces of code that look similar but represent different concepts should stay separate. The rule of three is useful: wait until you have three instances before abstracting.
