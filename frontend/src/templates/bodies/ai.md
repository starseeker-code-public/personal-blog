> **Series:** [AI Engineering Lab · Breaking AI Systems · From AI Demo to Reliable Software] — **Part [n]**
>
> **TL;DR:** [What I built or tested, in one sentence. How it really performed, in one sentence. What made the difference, and what's still unreliable, in one sentence.]
>
> **At a glance:** demo: [n] of [n] · real cases: [n]% · after the fix: [n]% · cost per successful task: [x]
>
> **Context:** Claude [Sonnet / Opus], [exact model IDs] · **Tested on:** [date; models and prices change quickly] · [A small application built for this post / A real feature, anonymized] · [Sandboxed: no real users, data or permissions]

## The question

[Open on the demo that looked perfect, or the one answer that was confidently, spectacularly wrong. e.g. It invented an order number, formatted it beautifully, and apologised for the delay.]

[The concrete problem, hypothesis or surprising behavior. e.g. I built a feature that turns support emails into structured tickets. On the five emails I tried, it was perfect.]

> **[It worked in the demo, but does it work? / Does this feature need a language model at all? / Can a smaller model do this job? / Will the agent stay inside its permissions?]**

My bet before measuring anything: **[your prediction, e.g. "it will handle at least 90% of realistic cases correctly"]**.

## Does this need AI?

Before building, I split the task into parts and asked which ones actually benefit from probabilistic behavior.

| Part of the task | Could plain code do it? | What a model adds | What a model risks |
|---|---|---|---|
| [e.g. detecting the language] | [yes, with a library] | | |
| [e.g. understanding what the customer wants] | [not reliably] | [handles free-form phrasing] | [confident wrong answers] |
| [e.g. formatting the output] | [yes] | | [invalid JSON] |

## The system

The model is one component. What users experience comes from everything around it too.

```text
[The pipeline, e.g.

  input ──▶ preprocessing ──▶ retrieval (top 5) ──▶ model ──▶ schema validation ──▶ output
                                                      │
                                                      └──▶ tools: search_orders, create_ticket]
```

| | |
|---|---|
| **Model** | Claude [Sonnet / Opus] · [exact model ID] · Anthropic API |
| **Parameters** | [temperature, max output tokens, anything else non-default] |
| **Context and retrieval** | [sources, chunking, embedding model, top-k, or "none"] |
| **Tools** | [names, and what each one is allowed to do] |
| **Output format** | [free text / structured, with a schema] |
| **Surrounding code** | [validation, fallbacks, retries, timeouts] |
| **Code, prompts and dataset** | [link to the repository] |

### The prompt

```text
[The system prompt and the prompt template, exactly as used]
```

### The output contract

```json
[The schema, or an example of a valid structured output]
```

## What success means

I defined this before looking at a single result.

| Criterion | Counts as success when | Scored by | Needed to ship |
|---|---|---|---|
| [e.g. Correct category] | [it matches the label exactly] | [code] | [≥ 95%] |
| [e.g. Faithful to the source] | [every claim is supported by the retrieved text] | [rubric, human review] | [100% of sampled cases] |
| [e.g. Abstains when it should] | [it says it doesn't know instead of guessing] | [label] | [...] |
| [e.g. Valid output] | [it parses against the schema] | [code] | [100%] |

## The demo

These are the hand-picked examples that made it look finished.

| Input | Output | Verdict |
|---|---|---|
| [...] | [...] | ✅ |
| [...] | [...] | ✅ |
| [...] | [...] | ✅ |

[Why these looked convincing, and what they had in common that real inputs won't.]

## The evaluation dataset

| Category | Cases | Source | Example |
|---|---|---|---|
| Typical | | [real / synthetic] | |
| Ambiguous | | | |
| Missing information | | | |
| Edge cases | | | |
| Unanswerable from the available information | | | |
| Out of scope or adversarial | | | |
| **Total** | | | |

**How I built it:** [where the cases came from, who labelled them, and how you avoided writing cases that flatter the prompt]

## The first results

| Category | Success rate | Notes |
|---|---|---|
| Typical | | |
| Ambiguous | | |
| Missing information | | |
| Edge cases | | |
| Unanswerable | | |
| Out of scope | | |
| **Overall** | | |

**Consistency:** [each case ran [n] times; how often the same input got a different verdict]

### How it failed

| Failure mode | Cases | Where it originated |
|---|---|---|
| [e.g. invented an order number] | | [model] |
| [e.g. answered from the wrong document] | | [retrieval] |
| [e.g. ignored relevant context] | | [context selection] |
| [e.g. right answer, invalid JSON] | | [output parsing] |
| [e.g. called the wrong tool] | | [tool description] |

### The hall of failures

The three mistakes that taught me the most.

| Input, shortened | What it returned | What it reveals |
|---|---|---|
| [...] | [...] | [e.g. it treats a missing field as permission to guess] |
| [...] | [...] | |
| [...] | [...] | |

### One failure, in full

**Input**

```text
[the input]
```

**Expected**

```text
[what a correct answer looks like]
```

**Actual**

```text
[what the system returned]
```

## The explanation

[Why the failures happened. Trace each important failure mode to a stage of the system instead of stopping at "the model got it wrong".]

> **The problem wasn't [the model's capability / the obvious suspect]. It was [the actual cause: missing evidence, irrelevant context, an ambiguous instruction, a vague tool description, no validation].**

## The improvement

[Address the most important failure modes first, and change one thing at a time where you can.]

```diff
[The prompt change, as a diff]
```

```python
# [The code change: validation, preprocessing, a deterministic step, a fallback]
```

## The regression test

Same dataset and same scoring, before and after the change.

| Category | Before | After | Change |
|---|---|---|---|
| Typical | | | |
| Ambiguous | | | |
| Missing information | | | |
| Edge cases | | | |
| Unanswerable | | | |
| Out of scope | | | |
| **Overall** | | | |

### What got worse

A change that fixes one behavior often breaks another.

| Case | Before | After | Why |
|---|---|---|---|
| [...] | ✅ | ❌ | [...] |
| [...] | ✅ | ❌ | [...] |

## Cost and latency

| | [Variant A] | [Variant B] | [Plain-code alternative] |
|---|---|---|---|
| Success rate | | | |
| Latency p50 / p95 | | | |
| Input / output tokens per request | | | |
| Cost per request | | | |
| Cost per **successful** task | | | |
| Retries per request | | | |

**Pricing:** [published prices as of [date]; say which figures are estimated and which are measured from real usage]

## Agent runs

[For agent posts; remove otherwise.]

| | Over [n] runs |
|---|---|
| Completed correctly | |
| Completed, with extra or unwanted actions | |
| Invalid tool calls | |
| Repeated a failed action | |
| Steps per run (median / max) | |
| Time per run | |
| Cost per run | |

```text
[The trace of a failing run: each step, tool call and result, up to the point where it went wrong]
```

## Abuse and boundaries

[For security posts, and for any system that reads untrusted content; remove otherwise. Run these tests only in a sandbox.]

| Attempt | Expected behavior | What happened | What stopped it |
|---|---|---|---|
| [instructions hidden in a retrieved document] | [treated as data, not as instructions] | | [the model / the application / nothing] |
| [a request for an action outside its permissions] | [refused by the tool layer] | | |
| [a valid tool used for an unintended purpose] | | | |
| [a request for sensitive data] | | | |

**Enforced by the application, not the model:** [the permissions, validations and confirmations that still hold if the model is fooled]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

| I predicted | What the evaluation showed | Verdict |
|---|---|---|
| [restate the bet] | [the result] | [right / wrong / partly right] |
| [e.g. which category would fail most] | | |

[How your sense of "it works" changed once success had a definition.]

## What this doesn't establish

- **Sample size:** [n cases; differences smaller than [x] points are within the noise]
- **Model versions:** [results apply to [models] as of [date]; hosted models can change without notice]
- **Task:** [how specific these results are to this task and this data]
- **Grading:** [the limits of the scoring method, especially automated graders]
- **Real users:** [how real inputs might differ from this dataset]

## Verdict

[Is it reliable enough for what it's meant to do? Two or three sentences.]

**Ready for:** [the uses the evidence supports]

**Not ready for:** [the uses it doesn't support yet, and what would need testing first]

**Where a model is the right tool here:** [...]

**Where plain code does better:** [...]

> **If you remember one thing:** [one sentence, with the conditions under which it holds]

## Try it yourself

Take any prompt you rely on and give it an hour:

- **Write twenty cases:** [twelve typical, five ambiguous, three it shouldn't be able to answer]
- **Run each one three times:** [and count, rather than eyeballing the best answers]
- **Look for:** [the cases where it's wrong with total confidence; they're the ones users will believe]

## Next experiment

Next I want to test **[e.g. a smaller model on the same dataset / the same feature with retrieval / the agent with fewer tools]**. My prediction: [what you expect to find].

[Invite readers to run the dataset against their own models or prompts, or to suggest cases it's missing.]

## Gear

What I used, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Computer** | Lenovo IdeaPad Slim 5 Gen 10 · Intel Core Ultra 9 185H · 32 GB RAM · Pop!_OS | |
| **Graphics and NPU** | Intel Arc graphics (integrated) · Intel AI Boost NPU | |
| **Models** | Claude Sonnet and Opus, through the Anthropic API · [exact model IDs used] | |
| **Local runtime** | [none by default; add it if this post runs a model locally] | |

---

*Code, prompts, the evaluation dataset and raw outputs: [link to the repository].*
