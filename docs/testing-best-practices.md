---
title: Testing Best Practices
category: testing
---

# Testing Best Practices

A good test suite gives you confidence to change code without fear. Tests document behavior, catch regressions, and drive better design. The goal is not 100% coverage — it is a suite you trust.

## The Testing Pyramid

The testing pyramid describes the ideal distribution of test types: many unit tests at the base, fewer integration tests in the middle, and even fewer end-to-end tests at the top.

### Unit Tests

Unit tests verify a single unit of behavior in isolation. They are fast, deterministic, and cheap to write. They form the foundation of any test suite.

A "unit" is not necessarily a single class — it is a single behavior. Test behavior, not implementation.

### Integration Tests

Integration tests verify that multiple units work together correctly. They test the interaction between components — a service and its database, or a controller and its middleware.

Integration tests are slower than unit tests and require more setup. Use them to test contracts between components, not every possible input combination.

### End-to-End Tests

End-to-end (E2E) tests simulate real user workflows through the full stack. They are the most expensive to write, run, and maintain. Use them sparingly for critical user journeys.

## Properties of Good Tests — FIRST

Good unit tests follow the FIRST principles:

### Fast

Tests should run in milliseconds. Slow tests don't get run frequently, and infrequent runs mean late feedback. If tests are slow, look for I/O, network calls, or heavy computation — and mock or eliminate them.

### Independent

Tests should not depend on each other. Running tests in a different order, or running a single test in isolation, should produce the same result. Shared mutable state between tests is a common cause of flaky tests.

### Repeatable

A test should produce the same result every time it runs, regardless of environment, time, or external state. Tests that depend on real clocks, network services, or file system state are fragile.

### Self-Validating

Tests must have a clear pass/fail outcome. A test that requires a human to read output to determine if it passed is not a test — it is a script.

### Timely

Write tests at the same time you write the code they test. Tests written long after the code is harder to write and often miss edge cases.

## Test Structure — Arrange, Act, Assert

Every test should follow the AAA pattern for clarity:

- **Arrange:** Set up the system under test, dependencies, and inputs
- **Act:** Invoke the behavior being tested
- **Assert:** Verify the outcome matches expectations

Keep each section clearly separated, either visually with blank lines or explicitly with comments. A single `// Act` section means the test is testing one thing.

## What to Test

### Test Behavior, Not Implementation

Tests should verify what a unit does, not how it does it. Testing internal implementation details makes tests brittle — they break when you refactor, even when behavior hasn't changed.

### Test Edge Cases and Boundaries

The most valuable tests often cover: empty inputs, null values, minimum and maximum boundary values, error and exception paths, and concurrent or race conditions.

### One Assertion per Test (Mostly)

Each test should ideally verify one specific behavior. Multiple assertions in one test make it hard to identify exactly what failed. Use separate tests for separate behaviors.

## Test Doubles

Test doubles are objects that stand in for real dependencies during testing.

### Mock

A mock verifies that specific methods were called with specific arguments. Use mocks to verify interactions — that a collaborator was notified, called with the right data, or invoked the expected number of times.

### Stub

A stub returns pre-configured answers to calls made during a test. Use stubs when the test needs a dependency to return specific data, but you don't care if or how the dependency was called.

### Fake

A fake has a working implementation, but simplified. An in-memory database is a fake. Fakes are more realistic than stubs but simpler than the real thing.

### When to Avoid Mocks

Over-mocking leads to tests that pass but don't catch real bugs. Avoid mocking the system under test itself, or mocking so many collaborators that the test no longer reflects reality. Prefer integration tests when the interaction with a real dependency is the point.

## Test-Driven Development (TDD)

TDD is a discipline where you write a failing test before writing any production code, then write the minimum code to make it pass, then refactor.

### The Red-Green-Refactor Cycle

1. **Red:** Write a test that fails (the feature doesn't exist yet)
2. **Green:** Write the minimum code to make the test pass
3. **Refactor:** Clean up the code without changing its behavior

### Benefits of TDD

- Forces you to think about the interface before the implementation
- Produces high test coverage naturally
- Catches design problems early — code that is hard to test is often poorly designed
- Builds confidence to refactor continuously

### When TDD is Harder

TDD is less natural for exploratory work, UI development, or when requirements are highly uncertain. In these cases, write tests after you understand the shape of the solution.

## Code Coverage

### Coverage is a Floor, Not a Ceiling

100% code coverage does not mean your tests are good. It means every line was executed — not that every behavior was verified. A test that calls every function but makes no assertions has 100% coverage and catches nothing.

### Aim for Meaningful Coverage

Focus coverage on business logic, edge cases, and error paths. Trivial getters, framework boilerplate, and generated code are lower priority.

### Use Coverage to Find Gaps

Coverage tools are most valuable for finding untested areas, not for measuring test quality. A drop in coverage after a change is a useful signal to investigate.
