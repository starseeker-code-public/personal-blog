> **Series:** [Architecture Under Pressure · Distributed Systems in Practice · Architecture Decisions in Retrospect] — **Part [n]**
>
> **TL;DR:** [The system in one sentence. What broke under pressure, in one sentence. The design that held up, and its price, in one sentence.]
>
> **At a glance:** [n] services · p99 under pressure: [before] → [after] · time to recover: [n] s
>
> **Context:** [A production system, anonymized / A small simulation built for this post: n services, a database and injected failures]

## The problem

[Open on the symptom: the alert that fired, the customer who was charged twice, the graph that went vertical. e.g. The payment went through. The customer saw an error, pressed "Pay" again, and paid twice.]

[The concrete requirement or failure scenario, in plain words. e.g. A client asks a service to charge a card. The charge goes through, but the response never arrives.]

Most explanations of [this pattern / this architecture] stop at the diagram. This post looks at what the system actually does when [the condition] changes.

> **The question:** [What happens when a request succeeds but the client thinks it failed? / What happens when one dependency becomes ten times slower?]

My expectation before testing: **[your prediction about how the system will behave]**.

## The initial design

[The reasonable architecture before any complications, and why it was a sensible starting point.]

```text
[ASCII diagram, e.g.

  client ──HTTP──▶ api ──SQL──▶ postgres
                    │
                    └──HTTP──▶ payments
]
```

| Component | Responsibility | Owns data | Talks to | Style | Timeout |
|---|---|---|---|---|---|
| [api] | [...] | [...] | [payments, postgres] | [sync HTTP] | [2 s] |
| [payments] | [...] | [...] | [...] | [...] | [...] |
| [postgres] | [...] | [...] | — | — | [...] |

### The happy path

```text
[The sequence of a successful request, e.g.
1. client   → api        POST /orders
2. api      → payments   charge(order_id, amount)
3. payments → api        200 OK
4. api      → postgres   INSERT order
5. api      → client     201 Created]
```

### What the design assumes

- [e.g. The network delivers every response]
- [e.g. payments answers within 2 s]
- [e.g. Each request is processed exactly once]

These assumptions are where the interesting failures hide.

## The pressure

One variable changes; everything else stays the same.

| Variable | Baseline | Under pressure |
|---|---|---|
| [e.g. payments latency] | [p99 80 ms] | [p99 3 s] |
| [e.g. load] | [50 req/s] | [50 req/s] |
| [e.g. lost responses] | [0%] | [5%] |

### How I applied it

- **Failure injection:** [e.g. toxiproxy / tc netem / a sleep behind a feature flag]
- **Load generator:** [e.g. k6 / locust / wrk, and the exact scenario]
- **Phases:** [warm-up, steady state, injection, recovery, and how long each lasted]
- **Environment:** [containers and resource limits; the hardware is listed under Gear, at the end]
- **Code:** [link to the repository]

```python
# [The relevant piece: the client call with its timeout and retry policy, or the injected fault]
```

## The behavior

### What the user saw

[Describe it from the outside first: slow pages, duplicate charges, stale data, errors. This is the consequence the architecture is ultimately responsible for.]

### What on-call would have seen

[If this had happened in production at 3 a.m.: the alert that fires first, and whether it points at the cause or only at a symptom.]

```text
[e.g.
[FIRING] api: error rate > 5% for 2m
[FIRING] postgres: connection pool 100% utilised
(nothing fires for payments, the component that actually slowed down)]
```

### What happened inside

[Trace the failure across component boundaries, step by step.]

```text
[A timeline, e.g.
t=0s    payments latency rises to 3 s
t=2s    api requests start timing out; clients retry
t=5s    api worker pool exhausted; unrelated endpoints slow down too
t=9s    postgres connection pool saturated
t=30s   injection stops
t=74s   system fully recovered]
```

```text
[The log lines or trace that proved it]
```

### Measured

| Metric | Baseline | Under pressure | After recovery |
|---|---|---|---|
| Latency p50 | | | |
| Latency p99 | | | |
| Throughput (req/s) | | | |
| Error rate | | | |
| Retries per request | | | |
| Duplicate operations | | | |
| Queue depth / pool usage | | | |
| Time to recover | | | |

I'm reporting percentiles rather than averages: an average can look fine while one request in a hundred takes thirty seconds.

### The causal chain

1. [The initial trigger]
2. [The first component that amplified it, and why]
3. [How it crossed the next boundary]
4. [The point where the failure became visible to users]

> **The root cause wasn't [the component that failed]. It was [the design decision that let the failure spread].**

## The failure paths

The happy path is one row of this table. The design has to answer every other row.

| What goes wrong | What the system does | What the user sees | Acceptable? |
|---|---|---|---|
| [dependency] is slow | | | |
| [dependency] is down | | | |
| The request is lost | | | |
| The response is lost | | | |
| The same request arrives twice | | | |
| A process crashes mid-operation | | | |
| [component] and [component] disagree about state | | | |

## The alternatives

### Option A: [e.g. Idempotency keys backed by a durable operation record]

```text
[ASCII diagram of the changed design]
```

- **Guarantees:** [what it actually ensures]
- **Assumes:** [what must hold for that guarantee to be true]
- **Costs:** [latency, storage, complexity, operational work]
- **New failure modes:** [what can now go wrong that couldn't before]

### Option B: [e.g. Asynchronous processing through a queue]

```text
[ASCII diagram of the changed design]
```

- **Guarantees:** [...]
- **Assumes:** [...]
- **Costs:** [...]
- **New failure modes:** [...]

### Option C: [e.g. Accept the risk and reconcile afterwards]

- **Guarantees:** [...]
- **Assumes:** [...]
- **Costs:** [...]
- **New failure modes:** [...]

### Under the same pressure

| | Initial design | Option A | Option B | Option C |
|---|---|---|---|---|
| Latency p99 under pressure | | | | |
| Error rate | | | | |
| Duplicate operations | | | | |
| Time to recover | | | | |
| Components added | | | | |
| Hard to reverse later? | | | | |

## Guarantees versus assumptions

Being precise here is the difference between a design and a hope.

| | |
|---|---|
| **Guaranteed** | [what the chosen design ensures, whatever happens] |
| **Best effort** | [what it attempts but can't promise] |
| **Depends on** | [external components or conditions the guarantee relies on] |
| **Out of scope** | [what it explicitly doesn't handle, e.g. keys older than 24 h, concurrent duplicates across regions] |

## The operational cost

An architectural decision keeps costing something long after it's deployed.

| | Added by this design |
|---|---|
| **Deployment** | [new services, pipelines, migrations] |
| **Monitoring and alerts** | [new dashboards, metrics, alert rules] |
| **Debugging** | [how much harder it becomes to follow a single request] |
| **Data ownership** | [who owns the new state, and how long it's kept] |
| **On-call** | [new ways to get paged at 3 a.m.] |

## The failure I didn't predict

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my expectation right?

| I predicted | What happened | Verdict |
|---|---|---|
| [restate the expectation] | [the result] | [right / wrong / partly right] |
| [e.g. which component would fail first] | | |

## Verdict

Under these conditions, I'd choose **[option]**. [Why, in two sentences, tied back to the measurements.]

**I'd choose differently if:**

- [e.g. the operation were naturally idempotent]
- [e.g. latency mattered more than avoiding duplicates]
- [...]

**Evidence that would change my mind:** [the measurement or incident that would make you revisit this decision]

**How hard is this to reverse?** [What it would cost to undo this decision a year from now.]

> **If you remember one thing:** [one sentence, including the conditions under which it holds]

## Try it yourself

You can reproduce the core of this on a laptop in an afternoon:

- **You'll need:** [two small services, a database, and a fault injector such as toxiproxy]
- **Do this:** [add 2 s of latency to one dependency while a load generator runs, with and without client retries]
- **Look for:** [what fails first, which alert would have fired, and how many operations ran twice]

## Next pressure

The next variable I want to change is **[e.g. ten times the load / a database failover / a network partition]**. My prediction: [what you expect to happen, so readers can bet along].

[Invite readers to share how their systems handle the same failure.]

## Gear

What I used, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | [model · CPU and cores · RAM · OS] | |
| **Other hardware** | [e.g. a separate machine for the load generator, a home server] | |

---

*Simulation code, load scripts and raw measurements: [link to the repository].*
