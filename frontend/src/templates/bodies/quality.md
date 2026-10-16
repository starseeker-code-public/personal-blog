> **Series:** [Breaking My Own Code · Reliability Laboratory · Debugging From Evidence] — **Part [n]**
>
> **TL;DR:** [What I believed in one sentence. What the evidence showed in one sentence. How much confidence the fix really adds, in one sentence.]
>
> **At a glance:** [n] tests, all green · defects caught: [before] → [after] of [n] · mutation score: [before] → [after]
>
> **Context:** [A controlled experiment on a small example built for this post / A real incident, anonymized] · **Tools:** [e.g. pytest · Hypothesis · mutmut · OpenTelemetry]

## The assumption

[Open on the bug report, not the code: e.g. "Your app charged me −€4." Every test was green.]

I believed **[the assumption, e.g. "this function handles every valid input" / "the service is healthy when it returns 200" / "our tests would catch a reversed comparison"]**. The evidence agreed with me: [green test suite, 94% coverage, healthy dashboard, no alerts].

It seemed reasonable because [why the assumption looked safe].

> **[My tests passed. Was the software right? / Would my tests notice if I broke this on purpose? / Can I find this bug using only what production tells me?]**

My bet before challenging it: **[your prediction, e.g. "the suite will catch at least 80% of the defects I introduce"]**.

## The example

[A small implementation, simple enough that readers can hold all of it in their head, but realistic enough that the defect is plausible.]

```python
# [The implementation under test]
```

**Before you scroll:** the bug is in the code above, and [n] tests missed it. See if you can find it first.

### What correct means

[The specification, in plain words.]

**Rules that must always hold:**

- [e.g. The output is always sorted]
- [e.g. Applying a discount never produces a negative total]
- [e.g. Every accepted order is persisted exactly once]

## The safety net

```python
# [The existing tests: the ones that all pass]
```

| | |
|---|---|
| **Tests** | [count] |
| **Coverage** | [line / branch %] |
| **Run time** | [...] |
| **Status** | ✅ all green |
| **Monitoring** | [what the dashboards and alerts watch, if relevant] |

**What this suite was meant to guarantee:** [...]

## The challenge

[What you introduced: an unexpected input, a deliberate defect, a timing issue, a slow dependency or a failure condition.]

```python
# [The minimal reproduction: the input, the mutation or the injected fault]
```

| | Expected | Actual |
|---|---|---|
| [input or scenario] | | |
| [input or scenario] | | |

The tests: **[still green / one failure out of n]**.

## The evidence

| Signal | What it showed | What it missed |
|---|---|---|
| Unit tests | | |
| Integration tests | | |
| Coverage report | | |
| Logs | | |
| Metrics | | |
| Traces | | |
| Health checks and alerts | | |

```text
[The log lines, trace or output that told the real story, or the silence where it should have been]
```

### The investigation

| Question I asked | Where I looked | What it told me | Time spent |
|---|---|---|---|
| [e.g. Is it the input or the state?] | [...] | [...] | |
| [...] | [...] | [...] | |
| [...] | [...] | [...] | |

## Why it was missed

**The bug, in one sentence:** [e.g. a discount applied twice when the cart contains exactly one item]

[The missing assumption, stated precisely. Every test was an example the author already thought of; which case did nobody think of, and why?]

> **The tests checked [what they actually verified]. The bug lived in [the combination, boundary or condition they never reached].**

## The improvement

### The regression test

```python
# [The test that fails on the defect and passes on the fix]
```

### The technique that would have found it earlier

[Property-based testing / mutation testing / fuzzing / differential testing / metamorphic testing / better telemetry: which one, and why it fits this kind of defect.]

```python
# [e.g. the property, the mutation run or the new metric]
```

### The fix

```python
# [The change to the implementation, if any]
```

## Measuring detection

Activity isn't confidence. Test count and coverage go in the table, but the row that matters is how many defects the suite catches.

| | Before | After |
|---|---|---|
| Deliberate defects caught (out of [n]) | | |
| Mutation score | | |
| Time to detect the defect | | |
| Tests | | |
| Coverage | | |
| Suite run time | | |
| Tests that broke on a harmless refactor | | |

### The survivors

The deliberate defects the improved suite still doesn't catch.

| Defect | Why the suite misses it | Worth catching? |
|---|---|---|
| [e.g. `<` changed to `<=` in the pagination check] | [...] | [yes / no, and why] |
| [...] | [...] | [...] |

## Under failure

[For reliability experiments; remove for pure testing posts.]

| Failure injected | Recovered automatically? | Needed intervention? | Left incorrect state? | Detected by |
|---|---|---|---|---|
| [process restart] | | | | |
| [dependency 10× slower] | | | | |
| [lost connection mid-operation] | | | | |
| [corrupted input] | | | | |

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

| I predicted | What happened | Verdict |
|---|---|---|
| [restate the bet] | [the number or outcome] | [right / wrong / partly right] |
| [e.g. which kind of defect would survive] | | |

[How your sense of what "tested" means changed.]

## What I can and can't claim now

| | |
|---|---|
| **Now detected** | [the defects and conditions the improved suite or telemetry catches] |
| **Still not detected** | [what it misses, known and named] |
| **Cannot be guaranteed by testing** | [what would need a different kind of evidence: proofs, production monitoring, review] |
| **Cost of the extra confidence** | [run time, maintenance, complexity, false alarms] |

## Verdict

[Your position in two or three sentences. How much confidence is enough for this code, given what a failure would cost?]

**This approach is worth it when:**

- [e.g. the code has a rule you can state but too many inputs to enumerate]
- [...]

**It isn't worth it when:**

- [e.g. the logic is trivial and a failure is cheap and visible]
- [...]

> **If you remember one thing:** [one sentence, with the conditions under which it holds]

## Try it yourself

Ten minutes, any codebase with tests:

- **Do this:** [pick a well-tested function and flip one comparison, `<` to `<=`]
- **Run the suite:** [if it stays green, you've found a gap]
- **Go further:** [let a mutation tool such as mutmut run for ten minutes and read the survivors]

## Next experiment

Next I want to break **[the next assumption]**. My prediction: [what you expect to find].

[Invite readers to share the bug that hid behind their greenest test suite.]

## Gear

What I used, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | Lenovo IdeaPad Slim 5 Gen 10 · Intel Core Ultra 9 185H · 32 GB RAM · Pop!_OS | |

---

*Code, tests, mutation reports and the failure-injection setup: [link to the repository].*
