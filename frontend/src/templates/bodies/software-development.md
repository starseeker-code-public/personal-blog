> **Series:** [Design Decisions · Software Under Change · Engineering Trade-offs] — **Part [n]**
>
> **TL;DR:** [The situation in one sentence. The decision in one sentence. What it cost, in one sentence.]
>
> **Context:** [A real project, anonymized where needed / A small example built for this post, presented as a case study rather than production experience]

## The situation

[The feature] looked like [an afternoon of work / a small ticket]. The requirement, in the words it reached me:

> [the original requirement, verbatim if possible]

The first version was straightforward: [what you built, and why it looked reasonable at the time]. It shipped, it worked, and for [a while / n weeks] nobody touched it.

Then [what happened: a new requirement, a second use case, a bug report, more users, a new team member].

So this post is about one decision:

> **[Should this logic live in the frontend or the backend? / When should this become its own module? / Is this abstraction still earning its keep?]**

## The constraints

A design decision is only right under certain conditions. These were mine:

| Constraint | Reality in this project |
|---|---|
| **Team** | [how many people touch this code, and how familiar they are with it] |
| **Expected change** | [what was likely to change, and how often] |
| **Deadline** | [the time pressure, honestly] |
| **Users** | [who depends on it, and what breaking it costs them] |
| **Operations** | [how it's deployed, monitored and rolled back] |
| **Existing code** | [conventions, legacy and anything you weren't allowed to change] |

**What I was not optimizing for:** [e.g. maximum reuse, theoretical extensibility, performance beyond "fast enough"]

## How it grew

| Version | What changed | What the code needed | Cost |
|---|---|---|---|
| v1 | [the original requirement] | [the first implementation] | [time / lines] |
| v2 | [the first new requirement] | [what had to be added or bent] | |
| v3 | [the next one] | [...] | |
| v4 | [the change that hurt] | [...] | |

### The first change

[The new requirement, and the weakness in the original design that it exposed.]

```python
# [The code after the first change: the flag, the special case or the extra parameter that crept in]
```

### The growing complexity

[How conditions, dependencies and special cases piled up. Which change should have been local but wasn't?]

A single "small" change ended up touching:

```text
[the files involved, e.g.
api/orders.py
services/pricing.py
services/discounts.py
templates/invoice.html
tests/test_pricing.py]
```

### The turning point

[The moment the real source of the difficulty became clear. Name it precisely: coupling, unclear responsibilities, a hidden assumption, the wrong boundary, or a premature generalization.]

> **The real problem wasn't [the obvious suspect]. It was [the actual cause].**

## The alternatives

I considered [n] ways forward. Each one was plausible, and each one had a price.

### Option A: [name]

[What it is, in two sentences.]

- **Gains:** [...]
- **Costs:** [...]
- **Right when:** [...]

### Option B: [name]

[What it is, in two sentences.]

- **Gains:** [...]
- **Costs:** [...]
- **Right when:** [...]

### Option C: Leave it as it is

[Always a real option. Why it was or wasn't acceptable here.]

- **Gains:** [...]
- **Costs:** [...]
- **Right when:** [...]

### Side by side

| | Option A | Option B | Option C |
|---|---|---|---|
| Effort to implement | | | |
| Risk of the change itself | | | |
| Effort for the next change | | | |
| New concepts a reader must learn | | | |
| Easy to undo? | | | |

## The implementation

I chose **[option]**, because [the reason that tipped it, tied back to the constraints above].

### Before

```text
[directory structure or dependency diagram before the change]
```

```python
# [the code that showed the problem]
```

### After

```text
[directory structure or dependency diagram after the change]
```

```python
# [the same behaviour, after the change]
```

### Making the change safely

1. [e.g. Wrote characterization tests that pinned the current behaviour]
2. [e.g. Introduced a seam so the old and new paths could coexist]
3. [e.g. Moved callers over one at a time, behind a flag]
4. [e.g. Deleted the old path once nothing used it]

## The consequences

### What became easier

- [...]
- [...]

### What became harder

- [the cost of my own solution: every honest refactor has one]
- [...]

### What surprised me

[The thing you didn't predict: a benefit you didn't plan for, a problem that moved somewhere else, a teammate's reaction.]

### Before and after, measured

| | Before | After |
|---|---|---|
| Files touched by a typical change | | |
| Lines of code | | |
| Time to implement the next requirement | | |
| Tests / test suite run time | | |
| Bugs reported in [period] | | |

## Is it actually finished?

Working code isn't the same as shipped software. Here's where this landed:

| Concern | Status |
|---|---|
| Error handling | [...] |
| Logs, metrics and alerts | [...] |
| Tests that would catch a regression | [...] |
| Deployment and rollback | [...] |
| Documentation | [...] |
| Who owns it now | [...] |

## Verdict

Under these constraints, I'd choose **[option]** again. [Why, in two sentences.]

**I'd decide differently if:**

- [e.g. the team were five times larger]
- [e.g. this feature changed every week]
- [...]

**Would I start with this design next time?** [Usually no, and why the simpler first version was still the right call. Or yes, and what signal should have told you earlier.]

**The rule of thumb I'm taking away:** [one sentence, including the condition under which it applies]

## What's next

[The next change on the horizon, or the question this left open. Invite readers to share how they would have structured it.]

---

*[Link to the repository, the pull request or the example project.]*
