> **Series:** [Engineering Friction Lab · Better Feedback Loops · Productivity Experiments] — **Part [n]**
>
> **TL;DR:** [The friction in one sentence. What the evidence showed, in one sentence. What the change improved, and what it cost, in one sentence.]
>
> **Context:** [A personal case study / My team's workflow, anonymized and shared with consent] · **Period:** [dates] · **Work:** [role, and the kind of work during the period]

## The friction

[The recurring problem, in concrete terms. e.g. Most days ended with the feeling that I'd been busy all day and finished nothing.]

My explanation was [your theory: too many meetings, slow builds, unclear requirements, review delays]. It felt obvious, but I'd never actually checked it.

> **[Where does my engineering time actually go? / How much does waiting for code review really cost? / What happens if I stop starting new tasks?]**

My bet: **[your hypothesis, e.g. "meetings take at least a third of my week"]**.

## What I assumed

Before measuring anything, I wrote down where I thought my time went.

| Activity | My estimate |
|---|---|
| Implementing | [%] |
| Debugging | [%] |
| Reviewing code | [%] |
| Meetings | [%] |
| Waiting (builds, reviews, answers) | [%] |
| Reading and understanding code | [%] |
| Interruptions and support | [%] |
| Planning and coordination | [%] |

## The method

The tracking had to be light enough not to become a productivity problem of its own.

- **What I recorded:** [e.g. my main activity in 30-minute blocks, every interruption, every switch between tasks]
- **How:** [e.g. a plain text file with one timestamped line per change / a spreadsheet / a timer]
- **What I deliberately didn't record:** [e.g. anything about colleagues, the content of meetings, minute-by-minute detail]
- **Cost of tracking:** [how many minutes a day the tracking itself took]
- **Template:** [link to the format, so readers can copy it]

## The baseline

### Where the time went

| Activity | Hours | Share | My estimate | Difference |
|---|---|---|---|---|
| Implementing | | | | |
| Debugging | | | | |
| Reviewing code | | | | |
| Meetings | | | | |
| Waiting | | | | |
| Reading and understanding code | | | | |
| Interruptions and support | | | | |
| Planning and coordination | | | | |
| **Total** | | 100% | | |

### How the work flowed

| | Baseline |
|---|---|
| Interruptions per day | |
| Longest uninterrupted block (median) | |
| Time to get back into a task after an interruption | |
| Tasks in progress at the same time | |
| Cycle time, from starting a task to finishing it | |
| Share of cycle time spent waiting | |
| Rework: changes reopened or redone | |

## The real bottleneck

[The pattern that surprised you. Often it isn't the biggest bar in the chart, but the thing that made everything else slower.]

```text
[How it spreads, e.g.
slow build (6 min)
  → switch to another task while waiting
  → lose the context of the first one
  → batch several changes together to avoid waiting again
  → bigger pull requests
  → slower reviews and more review rounds]
```

> **The problem wasn't [the obvious suspect]. It was [the actual bottleneck].**

## The intervention

I changed one thing and kept everything else as it was.

- **The change:** [e.g. a limit of two tasks in progress / a 20-second local check before pushing / a three-line context summary on every review request]
- **Why this one:** [how it targets the bottleneck above]
- **Duration:** [how long it ran]
- **What stayed the same:** [project, team, kind of work, tracking method]

## The evidence

### Outcomes

| | Before | After |
|---|---|---|
| Cycle time (median) | | |
| Share of time spent waiting | | |
| Interruptions per day | | |
| Time to get back into a task | | |
| Tasks in progress at the same time | | |
| Review rounds per change | | |
| Bugs or rework caused by my changes | | |

### Activity, for context only

Activity isn't progress. These numbers help explain the outcomes above; they don't measure them.

| | Before | After |
|---|---|---|
| Commits | | |
| Pull requests | | |
| Hours worked | | |

### How it felt

[Focus, energy, stress and satisfaction at the end of the day. Subjective, and labelled as such, but still part of the result.]

## The hidden costs

- **Work that moved instead of disappearing:** [e.g. fewer interruptions for me, more waiting for a colleague]
- **New coordination:** [...]
- **Maintenance:** [anything that now needs upkeep]
- **Quality:** [whether the speed came with more mistakes, shortcuts or rework]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

I expected **[restate the hypothesis]**. The data showed **[what it actually showed]**.

[What you'll pay attention to now that you know where the time really goes.]

## What this doesn't prove

- **Sample:** [one person / one team, over [period]]
- **Timing:** [the project phase, the time of year, the kind of work that dominated]
- **Observation effect:** [tracking your work changes how you work]
- **Self-reporting:** [what manual logging tends to miss or distort]

## Verdict

[What improved and what didn't, in two or three sentences.]

**This change helps when:**

- [...]
- [...]

**It won't help when:**

- [...]
- [...]

**The rule of thumb I'm taking away:** [one sentence, with the conditions under which it holds]

## Next experiment

Next I want to look at **[the next source of friction]**. My prediction: [what you expect to find].

[Invite readers to keep the same log for two weeks and share what surprised them.]

---

*The tracking template and anonymized data: [link].*
