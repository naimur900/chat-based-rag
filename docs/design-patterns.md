---
title: Design Patterns
category: design-patterns
---

# Design Patterns

Design patterns are proven, reusable solutions to commonly occurring problems in software design. They are not code you copy — they are templates for solving problems in a given context. Patterns are grouped into three categories: Creational, Structural, and Behavioral.

## Creational Patterns

Creational patterns deal with object creation mechanisms, aiming to create objects in a manner appropriate to the situation.

### Singleton

Ensures a class has only one instance and provides a global access point to it.

**Use when:** You need exactly one shared resource — a config manager, logger, or connection pool.

**Pitfalls:** Singletons are global state. They make testing harder and can hide dependencies. Prefer dependency injection over singletons where possible.

### Factory Method

Defines an interface for creating an object but lets subclasses decide which class to instantiate.

**Use when:** You need to decouple the creation of objects from their usage, and the exact type may vary by context or configuration.

**Example:** A `NotificationFactory` that returns an `EmailNotification`, `SMSNotification`, or `PushNotification` based on user preferences.

### Abstract Factory

Provides an interface for creating families of related objects without specifying their concrete classes.

**Use when:** Your system must be independent of how its products are created and you need to enforce consistency among related products.

**Example:** A UI toolkit factory that produces `Button`, `Checkbox`, and `TextField` — with separate factories for Windows and macOS flavors.

### Builder

Separates the construction of a complex object from its representation, allowing the same construction process to produce different representations.

**Use when:** An object has many optional parameters or requires a specific construction sequence.

**Example:** Building an HTTP request with optional headers, body, timeout, and retry logic. A `RequestBuilder` chains configuration calls and emits the final immutable `Request`.

## Structural Patterns

Structural patterns concern class and object composition, creating larger structures from individual parts.

### Adapter

Converts the interface of a class into another interface clients expect. Lets incompatible interfaces work together.

**Use when:** You want to use an existing class but its interface doesn't match what you need.

**Example:** Wrapping a third-party payment SDK with your internal `PaymentProvider` interface so the rest of your code doesn't know or care which SDK is used.

### Decorator

Attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

**Use when:** You need to add behavior to individual objects without affecting others of the same class, and without creating an explosion of subclasses.

**Example:** Wrapping a `Logger` with a `TimestampLogger` that prepends timestamps, then wrapping that with a `LevelFilterLogger` — composing behavior at runtime.

### Facade

Provides a simplified interface to a complex subsystem.

**Use when:** You want to provide a simple interface to a complex body of code — a library, framework, or set of classes.

**Example:** A `VideoConverter` facade that hides the complexity of codec selection, bitrate handling, and file I/O behind a single `convert(inputFile, format)` method.

### Proxy

Provides a surrogate or placeholder for another object to control access to it.

**Use when:** You need lazy initialization, access control, logging, caching, or remote access to an object.

**Types:** Virtual proxy (lazy load), protection proxy (access control), remote proxy (network resource), caching proxy.

## Behavioral Patterns

Behavioral patterns focus on communication and responsibility between objects.

### Strategy

Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

**Use when:** You have multiple variants of an algorithm and want to switch between them at runtime without conditionals.

**Example:** A `Sorter` that accepts a `SortStrategy` — `QuickSort`, `MergeSort`, or `TimSort` — and delegates sorting to whichever is injected.

### Observer

Defines a one-to-many dependency so that when one object changes state, all its dependents are notified and updated automatically.

**Use when:** A change in one object requires updating others, and you don't know how many objects need to change.

**Example:** An event system where UI components subscribe to a data store and re-render whenever state changes. This is the foundation of reactive programming.

### Command

Encapsulates a request as an object, allowing parameterization of clients with different requests, queuing, logging, and undoable operations.

**Use when:** You need to parameterize actions, support undo/redo, queue operations, or implement transactional behavior.

**Example:** A text editor where each edit (`InsertCommand`, `DeleteCommand`) is an object — enabling undo history by maintaining a stack of executed commands.

### Template Method

Defines the skeleton of an algorithm in a base class, deferring some steps to subclasses. Subclasses can override specific steps without changing the algorithm's structure.

**Use when:** Multiple classes share the same algorithm structure but differ in specific steps.

**Example:** A data pipeline base class with `extract()`, `transform()`, and `load()` steps — subclasses override individual steps for different data sources.

### Chain of Responsibility

Passes a request along a chain of handlers. Each handler decides to process the request or pass it to the next handler.

**Use when:** More than one object may handle a request and the handler isn't known a priori, or you want to issue a request without specifying the receiver explicitly.

**Example:** HTTP middleware pipelines — authentication, rate limiting, logging, and routing are independent handlers chained together.
