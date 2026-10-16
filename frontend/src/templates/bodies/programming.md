> **Series:** [Programming Lab · Same Problem, Different Language · Thinking in Code] — **Part [n]**
>
> **TL;DR:** [One sentence with the question. One sentence with the answer. One sentence with the catch.]
>
> **At a glance:** [n] implementations · [n] lines each · fastest: [which] · easiest to change: [which]

## The question

[Open on the moment that made you doubt something: a number, an error message, a line of code. e.g. The Rust version was 40 times faster. I was delighted for about ten minutes, until I noticed the Python version spent 90% of its time reading the file.]

I've always assumed that [common belief about a language, a pattern or a practice]. It sounds reasonable: [why people, including me, believe it]. But while [what you were building or fixing], I noticed [the detail that didn't fit].

So this post asks one question:

> **[Is X really worth Y? / Can X replace Y? / What happens when X?]**

Before running anything, here's my bet: **[your prediction, and the reasoning behind it]**. Keep it in mind. By the end we'll know whether it survived.

## Why it matters

[Who runs into this decision, and what does getting it wrong cost them? Time, bugs, rewrites, money, sleep. Two or three sentences.]

## The rules of the experiment

### What I'm optimizing for

| Priority | Criterion | Why it matters here |
|---|---|---|
| 1 | [e.g. Ease of change] | [reason] |
| 2 | [e.g. Development time] | [reason] |
| 3 | [e.g. Runtime and memory] | [reason] |

### What I'm deliberately ignoring

- [e.g. Ecosystem size: irrelevant for a program this small]
- [e.g. Team familiarity: this is a solo experiment]
- [anything a reader might expect you to measure, and why you didn't]

### The setup

| | |
|---|---|
| **Problem** | [one-sentence description of the program] |
| **Input** | [size, shape and origin of the data] |
| **Languages** | [e.g. Python 3.12 · Go 1.23 · Rust 1.82] |
| **Tools** | [benchmark and profiling tools, e.g. hyperfine, /usr/bin/time -v] |
| **Code** | [link to the repository] |

The computer everything ran on is listed under Gear, at the end.

### Fairness rules

- Every implementation solves exactly the same problem, reads the same input and produces the same output.
- Every implementation gets the same effort: [idiomatic code, no heroic optimizations / one optimization pass each].
- [any other rule that keeps the comparison honest]

## The problem

[Describe the program precisely enough that a reader could implement it without your code. Example: read a log file, keep only warnings and errors, group them by event type, and print the count and the p95 latency per type.]

**Input sample**

```text
[a few representative lines of input]
```

**Expected output**

```text
[exactly what the program should print for that input]
```

**Edge cases every implementation must handle**

- [empty input]
- [malformed line]
- [a very large file]

## Implementation 1: [Language or approach]

[The design this language or approach pushed you toward, and why. One or two sentences.]

```python
# [Only the lines that carry the idea. Link the full file in the repository.]
```

- **The line that sums it up:** `[the single line that best shows how this language thinks]`
- **What it made easy:** [...]
- **What it made hard:** [...]
- **Where I had to fight it:** [...]
- **Time to a working version:** [...]

## Implementation 2: [Language or approach]

[The design this language or approach pushed you toward, and why.]

```go
// [Only the lines that carry the idea.]
```

- **The line that sums it up:** `[...]`
- **What it made easy:** [...]
- **What it made hard:** [...]
- **Where I had to fight it:** [...]
- **Time to a working version:** [...]

## Implementation 3: [Language or approach]

[The design this language or approach pushed you toward, and why.]

```rust
// [Only the lines that carry the idea.]
```

- **The line that sums it up:** `[...]`
- **What it made easy:** [...]
- **What it made hard:** [...]
- **Where I had to fight it:** [...]
- **Time to a working version:** [...]

## The evidence

### Measurements

| | [Implementation 1] | [Implementation 2] | [Implementation 3] |
|---|---|---|---|
| Time to a working version | | | |
| Lines of code (excluding tests) | | | |
| Third-party dependencies | | | |
| Runtime, median of [N] runs | | | |
| Runtime spread (min – max) | | | |
| Peak memory | | | |
| Build or deployment artifact size | | | |

**How I measured:** [tool, number of warm-up runs, number of measured runs, input size, anything running in the background]

### The change test

Once every version worked, I added a new requirement: **[e.g. also report the 10 slowest events per type]**. How much each implementation resisted the change says more about maintainability than any line count.

| | [Implementation 1] | [Implementation 2] | [Implementation 3] |
|---|---|---|---|
| Files touched | | | |
| Lines changed | | | |
| Time to implement | | | |
| Bugs introduced along the way | | | |

### Correctness under pressure

| | [Implementation 1] | [Implementation 2] | [Implementation 3] |
|---|---|---|---|
| Empty input | | | |
| Malformed line | | | |
| Very large input | | | |
| Problem caught at | [compile time / runtime / never] | | |

## The plot twist

[The most valuable section of the post: the failed attempt, the number that made no sense, the trade-off nobody warns you about.]

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

| I predicted | What happened | Verdict |
|---|---|---|
| [restate the bet] | [the result] | [right / wrong / right for the wrong reasons] |
| [a smaller prediction you made along the way] | | |

[What changed in how you think about the problem. This is where the reader sees your judgment move, which is the real takeaway of the post.]

## What this doesn't prove

- **Scale:** [why these results may not hold for much larger or much smaller inputs]
- **Fluency:** [which language I know best, and how that likely skewed the development times]
- **Workload:** [how a CPU-bound, I/O-bound or concurrent workload could change the picture]
- **[Other assumption]:** [what would flip the result if it changed]

## Verdict

[Your position in two or three sentences: one you could defend in a code review with a skeptical colleague.]

**Reach for [option A] when:**

- [situation]
- [situation]

**Reach for [option B] when:**

- [situation]
- [situation]

**What I'd tell myself before starting:** [one sentence]

> **If you remember one thing:** [the one sentence a reader should take away, with the conditions under which it holds]

## Try it yourself

A version of this experiment you can run in an evening.

- **You'll need:** [a small program you've already written, and a second language you're curious about]
- **Do this:** [rewrite only the core loop, time both with hyperfine, then add one new requirement to each]
- **Look for:** [not just which is faster, but which one fought the new requirement harder]

## Next experiment

This left me with one open question: **[the question]**. That's the next part of the series.

[Invite readers to suggest a variation, a better implementation, or a flaw in the method.]

## Gear

What I used, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | [model · CPU and cores · RAM · storage] | |
| **Operating system** | | |
| **Editor and terminal** | | |

---

*Code, raw measurements and the scripts that produced them: [link to the repository].*
