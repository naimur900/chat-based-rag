---
title: SOLID Principles
category: design-principles
---

# SOLID Principles

SOLID is an acronym for five object-oriented design principles that make software more maintainable, flexible, and scalable. They were introduced by Robert C. Martin (Uncle Bob).

## Single Responsibility Principle (SRP)

A class should have only one reason to change. Each class or module should be responsible for a single part of the system's functionality.

### Why It Matters

When a class handles multiple responsibilities, a change in one area risks breaking unrelated behavior. SRP leads to smaller, more cohesive units that are easier to test and maintain.

### Example

Bad: A `User` class that handles authentication, profile updates, and email notifications.

Good: Separate classes — `AuthService`, `UserProfileService`, and `NotificationService` — each handling one concern.

### Signs of Violation

- A class has methods that change for different reasons
- The class has many unrelated instance variables
- The class is hard to name because it does too many things

## Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification. You should be able to add new behavior without changing existing, tested code.

### Why It Matters

Modifying existing code risks introducing bugs in working functionality. OCP encourages designing systems where new features are added by writing new code, not editing old code.

### How to Apply

Use abstractions — interfaces or abstract classes — to define stable contracts. Concrete implementations can extend behavior without touching the contract.

### Example

Instead of adding `if/else` blocks to a payment processor for each new payment method, define a `PaymentProvider` interface. Each provider implements it independently.

### Signs of Violation

- Adding a new feature requires modifying multiple existing classes
- Long if-else or switch chains that grow with every new type

## Liskov Substitution Principle (LSP)

Objects of a subclass should be substitutable for objects of the superclass without altering the correctness of the program.

### Why It Matters

Violating LSP breaks polymorphism. If a subclass cannot fully honor the contract of its parent, callers must add type checks, defeating the purpose of inheritance.

### Rules to Follow

- Subtypes must accept all inputs the parent accepts
- Subtypes must produce outputs compatible with the parent's postconditions
- Subtypes must not throw exceptions the parent does not throw
- Subtypes must not strengthen preconditions

### Classic Violation

The `Square extends Rectangle` example: setting width on a `Square` also sets height, which breaks callers expecting independent dimensions on a `Rectangle`.

## Interface Segregation Principle (ISP)

Clients should not be forced to depend on interfaces they do not use. Prefer many small, focused interfaces over one large general-purpose interface.

### Why It Matters

Fat interfaces force implementors to provide stub or empty implementations for methods they don't need, creating fragile coupling.

### How to Apply

Split interfaces by role. A `Printable` interface, a `Serializable` interface, and a `Loggable` interface are more flexible than a single `Document` interface that requires all three.

### Signs of Violation

- Classes implement an interface but leave some methods empty or throwing `NotImplementedException`
- Changing one method of an interface forces unrelated classes to recompile or change

## Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

### Why It Matters

Direct dependencies on concrete implementations make code hard to test and change. DIP decouples layers, enabling dependency injection and easier mocking in tests.

### How to Apply

Define interfaces in the high-level module. Low-level modules implement those interfaces. Wire dependencies from the outside (constructor injection, DI containers).

### Example

A `ReportGenerator` should depend on a `DataSource` interface, not directly on `PostgresDatabase`. This allows swapping to a mock in tests or a different database without touching `ReportGenerator`.

### Signs of Violation

- `new` keyword used to instantiate dependencies inside a class
- High-level business logic imports concrete infrastructure classes
