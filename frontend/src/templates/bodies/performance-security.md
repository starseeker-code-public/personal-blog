> **Series:** [Performance Lab · Breaking Assumptions · Security and Performance Trade-offs] — **Part [n]**
>
> **TL;DR:** [The symptom or the assumption in one sentence. The mechanism behind it in one sentence. The fix and its trade-off in one sentence.]
>
> **At a glance:** [before] → [after] · the real bottleneck: [where] · the price: [one phrase]
>
> **Context:** [A small reproducible application built for this post / A real system, anonymized] · **Scope:** [All experiments ran locally, in an isolated environment, against software I own]

## The question

[Open on the number, or the request that shouldn't have worked. e.g. 14.2 seconds, for a report users expect in under 2. / I changed /invoices/41 to /invoices/42 in the address bar and saw someone else's invoice.]

[The measurable problem or the security assumption, stated concretely. e.g. Every endpoint checks that the user is logged in, but does every endpoint check that the user may see *this* record?]

> **[Why is this slow? / Is this function really the bottleneck? / Can a user reach data that isn't theirs? / What does this security control cost under load?]**

My hypothesis, from reading the code: **[e.g. "the nested loop in `merge_records` is the bottleneck" / "authorization is enforced in one place, so every path is covered"]**.

Intuition is a good way to form a hypothesis and a poor way to confirm one, so everything below is measured.

## The baseline

### The implementation

```python
# [The relevant code, as it was]
```

### The environment

| | |
|---|---|
| **OS and runtime** | Pop!_OS · [runtime and version, e.g. Python 3.12] |
| **Workload** | [input size, data distribution, request mix, concurrency] |
| **Measured with** | [e.g. hyperfine · py-spy · cProfile · memray · k6] |
| **Existing safeguards** | [authentication, authorization, validation, rate limits, encryption] |
| **Code** | [link to the repository] |

The hardware is listed under Gear, at the end.

### Baseline numbers

| Metric | Value |
|---|---|
| Wall-clock time (median of [N] runs) | |
| Latency p50 / p99 | |
| Throughput | |
| Peak memory | |
| CPU utilization | |
| Allocations / GC time | |

## The red herring

[Performance: the optimization your hypothesis pointed to, and why that code looked so guilty. Security: the control you assumed was enough.]

```python
# [The change]
```

| | Baseline | First attempt | Change |
|---|---|---|---|
| [main metric] | | | |
| [second metric] | | | |

[Why the result was disappointing, partial or misleading. If it helped a little, say so: a nuanced result is more useful than a dramatic one.]

## The investigation

### Where the time actually goes

[For performance posts; remove for pure security posts.]

```text
[Profiler output: the top entries by cumulative time, or a summary of the flame graph]
```

| Function or operation | Share of total time | Calls | What I expected |
|---|---|---|---|
| [...] | | | |
| [...] | | | |
| [...] | | | |

### Where the trust boundaries are

[For security posts; remove for pure performance posts.]

```text
[Entry points and trust boundaries, e.g.

  browser ──▶ gateway ──▶ api ──▶ database
  untrusted   authn here  authz here?]
```

| Asset | Entry point | Who should have access | Abuse case | Existing control | Gap |
|---|---|---|---|---|---|
| [e.g. invoices] | [GET /invoices/{id}] | [the owner] | [another user changes the id] | [login required] | [no ownership check] |
| [...] | | | | | |

### The attacker's notebook

[For security posts; remove otherwise. Everything here was tried against my own local copy of the application.]

| Attempt | What I tried | What happened | What stopped it, if anything |
|---|---|---|---|
| 1 | [e.g. another user's invoice id] | | |
| 2 | [e.g. the same request through the mobile API] | | |
| 3 | | | |

### The mechanism

[Explain why, not just where: the cache misses, the allocation pattern, the lock contention, the N+1 query, the false trust assumption, the alternative execution path that skipped the check.]

> **The problem wasn't [the obvious suspect]. It was [the actual mechanism].**

## The experiment

One significant variable changes; everything else stays the same.

| Variable | Baseline | Variant |
|---|---|---|
| [e.g. data structure / algorithm / worker count / cache key / security control on or off] | | |

```python
# [The targeted fix, or the variant under test]
```

### Methodology

- **Warm-up:** [runs discarded before measuring]
- **Runs:** [how many measured runs, and how outliers were handled]
- **Inputs:** [realistic sizes and distributions, including at least one where the result might flip]
- **Noise control:** [plugged in, background processes stopped, CPU frequency pinned]
- **Dead code:** [how you made sure the work wasn't optimized away]

### Results

| Metric | Baseline | First attempt | Targeted fix |
|---|---|---|---|
| Wall-clock time (median) | | | |
| Spread (min – max) | | | |
| Latency p99 | | | |
| Throughput | | | |
| Peak memory | | | |
| Lines of code changed | | | |

### Across input sizes

| Input size | [Implementation A] | [Implementation B] | Faster |
|---|---|---|---|
| [10²] | | | |
| [10⁴] | | | |
| [10⁶] | | | |

[Where the results cross over, and the mechanism that explains it.]

## The trade-offs

| | Effect of the change |
|---|---|
| **Latency** | |
| **Throughput** | |
| **Memory** | |
| **Code complexity** | |
| **Maintainability** | |
| **Attack surface** | [what the speed-up exposes, or what the security control costs] |
| **Usability** | |
| **Under failure or abuse** | [e.g. does the cache, rate limit or check fail open or fail closed?] |

### New risks introduced

- [e.g. the cache key must now include the user's identity, or it will serve one user's data to another]
- [...]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my hypothesis right?

| I suspected | What the evidence showed | Verdict |
|---|---|---|
| [restate the hypothesis] | [what it actually showed] | [right / wrong / partly right] |
| [e.g. how much the fix would gain] | | |

[How this changes the way you'll form the next hypothesis.]

## What this doesn't prove

- **Environment:** [one machine, one runtime version; what might differ elsewhere]
- **Workload:** [how a different data distribution or traffic pattern could change the result]
- **Measurement:** [the noise level, and the smallest difference these numbers can actually distinguish]
- **Security scope:** [what the threat model left out, and which attackers it doesn't consider]

## Verdict

[What the evidence supports, in two or three sentences.]

**Worth doing when:**

- [e.g. the operation is on the hot path and the profile proves it]
- [...]

**Not worth it when:**

- [e.g. the gain is below the measurement noise, or it widens the attack surface]
- [...]

> **If you remember one thing:** [one sentence, with the conditions under which it holds]

## Try it yourself

- **Performance, in ten minutes:** [write down which function you think is slowest, then profile the program; py-spy or cProfile will do. How far off was your guess?]
- **Security, in five minutes:** [log into your own local app as one user and change an id in the address bar to one that belongs to another user]
- **Either way:** [the gap between what you expected and what you measured is the post]

## Next experiment

Next I want to test **[the next assumption, e.g. how the result changes with ten times the data / whether the fix holds under concurrent load]**. My prediction: [what you expect to find].

[Invite readers to rerun the benchmark on their own hardware, or to point out a flaw in the method.]

## Gear

What I used, and why. Benchmark numbers only mean something next to the machine that produced them.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | Lenovo IdeaPad Slim 5 Gen 10 · Intel Core Ultra 9 185H (16 cores, 22 threads) · 32 GB RAM · Intel Arc graphics | |
| **Operating system** | Pop!_OS (Linux) | |

---

*Code, benchmark scripts, profiler output and raw measurements: [link to the repository].*
