> **Series:** [Pipeline Under Pressure · Automation That Doesn't Break Things · Measuring Delivery Engineering] — **Part [n]**
>
> **TL;DR:** [The workflow in one sentence. What happened when it failed, in one sentence. What the improvement fixed, and what it still doesn't, in one sentence.]
>
> **Context:** [A real project, anonymized where needed / A small reproducible pipeline built for this post] · **Tools:** [e.g. GitHub Actions · Docker · Terraform]

## The question

[The workflow] had been running for [weeks / months] and every run was green. I trusted it the way you trust anything that has never failed in front of you. Then [the moment trust broke: a broken release, a slow build, a drifted environment, a script that did the wrong thing].

> **[The deployment succeeded, but was the application healthy? / Can I make this pipeline faster without losing confidence? / Is this script safe to run twice?]**

My bet before changing anything: **[your prediction, e.g. "a readiness check will catch most broken releases"]**.

## The workflow

```text
[The pipeline as it was, e.g.

  push ──▶ install ──▶ lint ──▶ test ──▶ build image ──▶ push to registry ──▶ deploy ──▶ ✅]
```

| Stage | What it does | Duration | What it proves | What it does **not** prove |
|---|---|---|---|---|
| [install] | [...] | | [...] | [...] |
| [test] | [...] | | [e.g. the code passes its unit tests] | [e.g. the app starts with production config] |
| [build] | [...] | | [...] | [...] |
| [deploy] | [...] | | [e.g. the new container was scheduled] | [e.g. it can reach its database] |

**Triggered by:** [push to main / tag / manual approval]

**Environments:** [e.g. local → staging → production]

**Manual steps that still exist:** [e.g. running migrations by hand, editing an env var in the console]

## The failure

### What happened

[The concrete event: what changed, what broke, and who noticed first. If it was a user, say so.]

```text
[The log, pipeline output or error that showed it]
```

### The misleading signal

| What the automation reported | What was actually true |
|---|---|
| [e.g. ✅ Deploy succeeded] | [e.g. every request returned 500] |
| [e.g. ✅ Health check passing] | [e.g. /health didn't touch the database] |
| [...] | [...] |

### Why nothing caught it

[Walk through the stages again. Which check was missing, which was too shallow, and which assumption did every stage share?]

> **The pipeline verified that [the procedure ran]. Nothing verified that [the application worked].**

## The first solution

[The smallest change that addresses the problem. Resist building a platform here.]

```yaml
# [The relevant pipeline change: the new stage, check or gate]
```

```bash
# [The script behind it, if any]
```

### Treating the automation as software

| | How this change handles it |
|---|---|
| **Inputs validated** | [...] |
| **Fails loudly, with a useful message** | [e.g. set -euo pipefail, explicit exit codes] |
| **Safe to run twice** | [...] |
| **Dry-run mode** | [...] |
| **Timeouts** | [...] |
| **Permissions and credentials** | [what it can touch, and nothing more] |
| **Logs and visibility** | [...] |
| **Tested** | [how you know the automation itself works] |
| **Owner** | [who fixes it when it breaks] |

## The failure test

A pipeline that only works when everything goes right hasn't been tested yet.

| Failure injected | What the pipeline did | State of the system afterwards | Signal raised | Recovery | Manual steps |
|---|---|---|---|---|---|
| A test fails | | | | | |
| A dependency or registry is unavailable | | | | | |
| Bad configuration is deployed | | | | | |
| A credential has expired | | | | | |
| The deployment is interrupted halfway | | | | | |
| Two deployments run at the same time | | | | | |
| The verification step itself fails | | | | | |
| The rollback is triggered | | | | | |

[The row that worried you most, and why.]

## Can it be undone?

Rolling back code is usually easy. Rolling back everything else is where it gets interesting.

| What changed in a release | Rolls back cleanly? | How, and what's left behind |
|---|---|---|
| Application binary / image | | |
| Configuration and secrets | | |
| Database schema | | |
| Data transformed by the new version | | |
| Infrastructure | | |
| External side effects (emails sent, payments, webhooks) | | |

## The measurements

I measured outcomes, not tool usage.

| Metric | Before | After |
|---|---|---|
| Pipeline duration (median / p95) | | |
| Time from push to first failure signal | | |
| Time to detect a broken release | | |
| Time to recover from a broken release | | |
| Releases that needed manual intervention | | |
| Change failure rate over [period] | | |
| Reruns caused by flaky steps | | |
| Runner minutes or CI cost | | |
| Lines of pipeline code to maintain | | |

**How I measured:** [number of runs, period, how failures were injected and counted]

## The new failure cases

Every safety mechanism can fail too.

- **If the verification is wrong:** [e.g. a smoke test that passes against a cached response]
- **If the verification is flaky:** [e.g. healthy releases get rolled back]
- **If the rollback is unsafe:** [e.g. the old version can't read data written by the new one]
- **[Other]:** [...]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my bet right?

I expected **[restate the bet]**. It turned out **[right / wrong / partly right]**: [what the failure test and the measurements showed].

## What this doesn't solve

- **[Failure mode still uncovered]:** [why]
- **Scale:** [what changes with more services, more people or more deploys per day]
- **Context:** [what's specific to this tool, team or project]

## Verdict

The improvement is worth its complexity **[when / only when]** [the condition, tied to the measurements].

**What I'd automate:** [...]

**What should stay visible to a human:** [the decisions that deserve a manual approval or at least a person reading the output, and why]

**I'd decide differently if:** [the change in team size, deploy frequency or risk that would flip it]

**The rule of thumb I'm taking away:** [one sentence, with the conditions under which it holds]

## Next experiment

Next I want to break **[the next part of the workflow, e.g. the database migration step / concurrent deploys]**. My prediction: [what you expect to happen].

[Invite readers to share the failure that taught them to distrust a green pipeline.]

---

*Pipeline definitions, scripts and the failure-injection setup: [link to the repository].*
