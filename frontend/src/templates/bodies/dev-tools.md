> **Series:** [Developer Experience Lab · Open Source From the Inside · Small Tools, Big Leverage] — **Part [n]**
>
> **TL;DR:** [The friction in one sentence. What I tried in one sentence. Whether it was worth it, maintenance included, in one sentence.]
>
> **At a glance:** saves [n] min a week · took [n] h to build · pays for itself after [n] weeks, or never
>
> **Context:** [My own daily workflow / A contribution to [project] / An evaluation of [tool or dependency]] · **Tested for:** [how long, in real work]

## The friction

[Open on the annoyance itself, step by tedious step. e.g. Find the failed job. Copy the commit hash. Switch to the terminal. Paste it. Typo. Again. Fourteen times a day.]

[The real problem, before any tool enters the story: a repetitive task, a slow feedback loop, a confusing repository, a dependency you're not sure you can trust.]

Every [day / week], I [the repetitive task or the frustrating moment]. It's small: [how long it takes]. But it [what it costs beyond the seconds: breaks focus, is easy to get wrong, means remembering a sequence of steps].

> **[Is this annoyance worth a tool? / Can I contribute to this project without knowing its codebase? / Would I trust this dependency if I had to maintain it myself?]**

My bet: **[your prediction, e.g. "the tool will pay for itself within a month"]**.

## What it costs today

Before changing anything, I tracked the current workflow for [period].

| | |
|---|---|
| **How often it happens** | [times per day or week] |
| **Time per occurrence** | [...] |
| **Total per week** | [...] |
| **Steps involved** | [...] |
| **Mistakes or retries** | [...] |
| **Interruptions caused** | [context switches, waiting, lost focus] |

```text
[The current workflow, step by step, e.g.
1. open the CI page in the browser and find the failed job
2. copy the commit SHA
3. switch to the terminal and check out the commit
4. ...]
```

## The existing solutions

[What's already available, and why it doesn't fully fit. Be fair: the existing tool may well be better than anything you'll build.]

| Option | What it does well | Why it doesn't fit | Cost to adopt |
|---|---|---|---|
| Do nothing | | | |
| [Existing tool] | | | |
| [Shell alias or script] | | | |
| Build my own | | | |

## The experiment

[What you changed: built a small tool, switched to a different workflow, contributed a fix, or evaluated a dependency.]

### The interface

How it's used, what it prints and how it fails, designed before the implementation.

```bash
$ [tool] [arguments]
[expected output]

$ [tool] [bad input]
[the error message, written for someone in a hurry]

$ echo $?
[exit code]
```

### The same task, before and after

```bash
# Before
[the five commands, two context switches and one copy-paste it used to take]

# After
$ [tool] [arguments]
```

### Design decisions

| Decision | Choice | Why |
|---|---|---|
| **Defaults** | | |
| **Configuration** | [what's configurable, and what deliberately isn't] | |
| **Input and output** | [stdin, stdout, stderr, machine-readable output] | |
| **Exit codes** | | |
| **Error messages** | | |
| **Dependencies** | | |

### The implementation

```python
# [Only the lines that carry the idea. Link the full source.]
```

## The contribution

[For open-source posts; remove otherwise.]

### Getting into the repository

| Step | What I did | What helped | What was confusing |
|---|---|---|---|
| Choosing an issue | | | |
| Setting up the project | | | |
| Reproducing the behavior | | | |
| Finding the relevant code | | | |
| Running the tests | | | |
| Talking to the maintainers | | | |

**Time from cloning to a first working change:** [...]

### The pull request

[What you proposed, how it was received, and what the review taught you about the project's design, scope, compatibility promises or maintenance capacity.]

> [The review comment that changed your understanding, paraphrased or quoted with permission]

### Dependency health check

[For dependency evaluations; remove otherwise.]

| Signal | What I found | Concern |
|---|---|---|
| Release history | | [low / medium / high] |
| Issue and PR response times | | |
| Active maintainers (bus factor) | | |
| Tests and CI | | |
| Documentation | | |
| Compatibility and breaking-change policy | | |
| Security response | | |
| Could I understand and patch it myself? | | |

## The real-world test

I used it for [period] in real work, not just in a demo.

| What happened | How often | What I did about it |
|---|---|---|
| It worked as intended | | |
| [Edge case] | | |
| [Awkward interaction] | | |
| [Missing feature I wanted] | | [added it / resisted adding it, and why] |
| [It broke] | | |

## The evidence

| | Before | After |
|---|---|---|
| Time per occurrence | | |
| Time per week | | |
| Steps | | |
| Mistakes | | |
| Interruptions | | |
| How it felt | [subjective, and labelled as such] | |

"Less annoying" is a real benefit, but it isn't the same claim as "faster". I've kept the measured results apart from the felt ones.

## The maintenance bill

| | Effort |
|---|---|
| First working version | |
| Edge cases fixed since | |
| Tests | |
| Documentation | |
| Dependency and platform updates | |
| Helping other people use it | |
| **Total so far** | |
| **Expected per year** | |

**Break-even:** [time saved per week] × [weeks of use] against [total effort]: [when it pays for itself, if ever].

## The trade-offs

- **Better:** [...]
- **Worse:** [...]
- **New responsibilities:** [the tool now needs an owner, documentation and updates]
- **New dependencies:** [what you now rely on: this tool, this editor, this workflow]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

| I predicted | What happened | Verdict |
|---|---|---|
| [restate the bet] | [what the evidence and the maintenance bill showed] | [right / wrong / partly right] |
| [e.g. where the benefit would come from] | | |

[Where the real benefit turned out to be, if it wasn't where you expected.]

## Verdict

[Was it worth it? Two or three sentences.]

**Who would benefit:** [the kind of developer, team or project]

**Who shouldn't bother:** [...]

> **If you remember one thing:** [the threshold you'll use next time, e.g. "build a tool when a task happens more than n times a week and is easy to get wrong, not just slow"]

## Try it yourself

One day, one sheet of paper:

- **Tally it:** [every time you do the same small thing twice, add a mark next to it]
- **Next morning:** [look at the item with the most marks]
- **Decide:** [an alias, a script, an existing tool, or leave it alone, and write down why]

## Next experiment

Next I want to try **[the next friction, tool or project]**. My prediction: [what you expect to find].

[Invite readers to share the tiny tool, or the contribution, that changed how they work.]

## Gear

My development setup, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | [model · CPU · RAM · OS] | |
| **Editor or IDE** | [and the extensions that matter here] | |
| **Terminal and shell** | | |
| **Keyboard and monitors** | [optional] | |

---

*Source code, setup notes and measurements: [link to the repository].*
