---
title: System Design Fundamentals
category: system-design
---

# System Design Fundamentals

System design is the process of defining the architecture, components, modules, interfaces, and data flow of a system to satisfy specified requirements. Good system design balances correctness, scalability, reliability, and maintainability.

## Core Concepts

### Scalability

Scalability is the ability of a system to handle increased load by adding resources.

**Vertical scaling (scale up):** Adding more power to an existing machine — more CPU, RAM, or storage. Simple but has a hard ceiling and creates a single point of failure.

**Horizontal scaling (scale out):** Adding more machines to a pool. More complex but effectively unlimited. Requires stateless services or distributed state management.

**When to scale:** Scale when you have data showing a bottleneck. Premature scaling adds complexity without benefit. Identify the actual constraint first — CPU, I/O, memory, or network.

### Availability and Reliability

**Availability** is the percentage of time a system is operational. "Five nines" (99.999%) allows ~5 minutes downtime per year.

**Reliability** is the probability a system performs correctly over a period. High availability does not imply high reliability — a system can be up but returning wrong results.

**Strategies to improve availability:** redundancy, failover, health checks, circuit breakers, graceful degradation.

### Latency vs. Throughput

**Latency** is the time to complete a single operation. **Throughput** is the number of operations completed per unit time.

These often trade off against each other. Batching increases throughput but increases latency per individual item. Optimizing one without considering the other leads to misaligned systems.

## Data Storage

### Relational Databases

Relational databases (PostgreSQL, MySQL) store data in tables with defined schemas and support ACID transactions. They are the right default for structured data with complex relationships and consistency requirements.

**Use when:** You need transactions, complex queries, relational integrity, or ad-hoc reporting.

**Watch out for:** N+1 query problems, missing indexes, unbounded joins on large tables.

### NoSQL Databases

NoSQL covers a wide range of non-relational databases: document stores (MongoDB), key-value stores (Redis), wide-column stores (Cassandra), and graph databases (Neo4j).

**Use when:** You need flexible schemas, horizontal write scalability, or data models that don't fit tables well.

**Watch out for:** Eventual consistency implications, lack of transactions across documents, query flexibility trade-offs.

### Caching

Caching stores frequently accessed data in a fast storage layer (typically in-memory) to reduce latency and database load.

**Cache strategies:**
- **Cache-aside (lazy loading):** Application checks cache first; on miss, loads from DB and populates cache
- **Write-through:** Writes go to cache and DB simultaneously
- **Write-back:** Writes go to cache first, DB is updated asynchronously

**Cache invalidation** is one of the hardest problems in computer science. Use TTLs, event-driven invalidation, or versioned cache keys.

## API Design

### REST

REST (Representational State Transfer) uses HTTP methods (GET, POST, PUT, DELETE, PATCH) to operate on resources identified by URLs.

**Best practices:**
- Use nouns for resource URLs (`/users`, `/orders`), not verbs
- Use HTTP status codes correctly (200 OK, 201 Created, 404 Not Found, 422 Unprocessable Entity)
- Version your API (`/v1/users`) to allow evolution without breaking clients
- Use pagination for collection endpoints

### GraphQL

GraphQL allows clients to request exactly the data they need in a single request, reducing over-fetching and under-fetching.

**Use when:** Multiple clients with different data needs consume the same API, or you want to aggregate multiple data sources behind a single endpoint.

**Trade-offs:** More complex caching, potential for expensive queries, steeper learning curve.

## Distributed Systems Concepts

### CAP Theorem

The CAP theorem states that a distributed system can guarantee at most two of three properties: **Consistency** (all nodes see the same data), **Availability** (every request gets a response), and **Partition tolerance** (the system operates despite network failures).

In practice, partition tolerance is non-negotiable in distributed systems. The real choice is between consistency and availability during a partition: CP systems (strong consistency, may reject requests) or AP systems (always respond, may return stale data).

### Eventual Consistency

In an eventually consistent system, updates will propagate to all nodes eventually, but there may be a window where different nodes return different values.

Eventual consistency is appropriate for systems where high availability and low latency matter more than strict consistency — product catalog, user preferences, social feeds.

### Message Queues

Message queues (Kafka, RabbitMQ, SQS) decouple producers and consumers, enabling asynchronous processing, load leveling, and retry logic.

**Use when:** Work items can be processed independently and asynchronously, you need to smooth out traffic spikes, or you want to decouple services from each other.

**Key concepts:** at-least-once vs exactly-once delivery, consumer groups, dead-letter queues for handling failures.

## Service Architecture

### Monolith

A monolith is a single deployable unit containing all application logic. It is the right starting point for most applications.

**Advantages:** Simple to develop, test, deploy, and debug. No network overhead between components. Easy to do cross-cutting changes.

**When to reconsider:** When independent teams are blocked on each other, when parts of the system have very different scaling needs, or when a component's failure should not take down the whole system.

### Microservices

Microservices decompose an application into small, independently deployable services, each owning its own data.

**Advantages:** Independent scaling and deployment, team autonomy, technology flexibility, fault isolation.

**Costs:** Distributed systems complexity, network latency, data consistency challenges, operational overhead (logging, tracing, service discovery).

**Rule of thumb:** Don't start with microservices. Extract services from a monolith when you have clear seams and a demonstrated need. Premature decomposition creates a distributed monolith — the worst of both worlds.

## Observability

A system you can't observe is a system you can't debug or trust.

### The Three Pillars

**Logs:** Timestamped records of events. Use structured logging (JSON) for machine parseability. Log at appropriate levels (DEBUG, INFO, WARN, ERROR) and avoid logging sensitive data.

**Metrics:** Numeric measurements over time — request rate, error rate, latency (p50, p95, p99), saturation. Use the RED method (Rate, Errors, Duration) for services and the USE method (Utilization, Saturation, Errors) for resources.

**Traces:** End-to-end records of a request as it flows through multiple services. Traces show where time is spent and where failures occur in a distributed system.

### Alerting

Alert on symptoms, not causes. Alert on user-visible impact (high error rate, high latency) rather than internal signals (CPU at 70%) that may not affect users. Every alert should be actionable.
