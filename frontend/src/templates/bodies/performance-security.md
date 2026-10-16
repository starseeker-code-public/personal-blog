> **Series:** [Performance Lab · Breaking Assumptions · Security and Performance Trade-offs] — **Part [n]**
>
> **TL;DR:** [The symptom or the assumption in one sentence. The mechanism behind it in one sentence. The fix and its trade-off in one sentence.]
>
> **Context:** [A small reproducible application built for this post / A real system, anonymized] · **Scope:** [All experiments ran locally, in an isolated environment, against software I own]

## The question

[The measurable problem or the security assumption, stated concretely. e.g. Generating the monthly report takes 14 seconds, and users expect it in under 2. / Every endpoint checks that the user is logged in, but does every endpoint check that the user may see *this* record?]

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
| **Hardware** | [CPU, cores, RAM] |
| **OS and runtime** | [e.g. Ubuntu 24.04 · Python 3.12] |
| **Workload** | [input size, data distribution, request mix, concurrency] |
| **Measured with** | [e.g. hyperfine · py-spy · cProfile · memray · k6] |
| **Existing safeguards** | [authentication, authorization, validation, rate limits, encryption] |
| **Code** | [link to the repository] |

### Baseline numbers

| Metric | Value |
|---|---|
| Wall-clock time (median of [N] runs) | |
| Latency p50 / p99 | |
| Throughput | |
| Peak memory | |
| CPU utilization | |
| Allocations / GC time | |

## The first attempt

[Performance: the optimization your hypothesis pointed to. Security: the control you assumed was enough.]

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
- **Noise control:** [same machine, background processes stopped, CPU frequency pinned]
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

I suspected **[restate the hypothesis]**. The evidence showed **[what it actually showed]**.

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

**The rule of thumb I'm taking away:** [one sentence, with the conditions under which it holds]

## Next experiment

Next I want to test **[the next assumption, e.g. how the result changes with ten times the data / whether the fix holds under concurrent load]**. My prediction: [what you expect to find].

[Invite readers to rerun the benchmark on their own hardware, or to point out a flaw in the method.]

---

*Code, benchmark scripts, profiler output and raw measurements: [link to the repository].*
