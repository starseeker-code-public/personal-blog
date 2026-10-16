> **Series:** [Cloud Under Load · The Real Cost of Cloud · Infrastructure Failure Laboratory] — **Part [n]**
>
> **TL;DR:** [The workload in one sentence. What the infrastructure really cost, in one sentence. The layer that was or wasn't worth it, in one sentence.]
>
> **Context:** [Provider and region] · [Deployed and measured / Modelled from public pricing on [date]] · [Measurement period]

## The question

The usual advice is [common recommendation, e.g. "use a managed database" / "always deploy across three availability zones" / "serverless is cheaper for small apps"]. It's convenient, and for many teams it's right. But for [your workload], I wanted to know what it actually buys, and what it costs in money, performance, reliability, security and operational effort.

> **[How much infrastructure does a small application actually need? / Why did this get more expensive in the cloud? / What actually happens when an availability zone fails?]**

My estimate before building anything: **[e.g. about $40/month, and the managed database will be the biggest line item]**.

## The workload

Infrastructure only makes sense relative to what it has to carry.

| | |
|---|---|
| **What it does** | [e.g. a REST API backed by PostgreSQL] |
| **Traffic** | [average and peak requests per second] |
| **Traffic pattern** | [steady / daily peaks / unpredictable bursts] |
| **Data stored** | [size today, growth per month] |
| **Data transferred out** | [GB per month, and where it goes] |
| **Latency target** | [e.g. p99 under 300 ms] |
| **Availability target** | [e.g. 99.5%, and what downtime costs] |
| **Recovery targets** | [RTO: how long it may be down · RPO: how much data it may lose] |
| **Security requirements** | [personal data, compliance, who needs access] |
| **Who operates it** | [e.g. one person, in their spare time] |

## The infrastructure choices

| Layer | Options considered | Ruled out, and why |
|---|---|---|
| **Compute** | [VM / containers / serverless] | [...] |
| **Database** | [self-hosted / managed] | [...] |
| **Storage** | [object / block / file] | [...] |
| **Networking** | [public endpoint / private network / load balancer] | [...] |
| **Redundancy** | [single zone / multi-zone / multi-region] | [...] |
| **Backups** | [snapshots / managed backups / external copies] | [...] |

## The setup

```text
[ASCII diagram of the deployment, e.g.

  internet ──▶ load balancer ──▶ api (2 × containers, zones a/b)
                                   │
                                   ▼
                            managed postgres (primary + standby)
                                   │
                                   ▼
                            daily snapshots ──▶ object storage]
```

| | |
|---|---|
| **Provider and region** | [...] |
| **Resources** | [instance types, sizes, counts] |
| **Provisioning** | [Terraform / Pulumi / console / CLI] |
| **Load generator** | [e.g. k6, with the exact scenario] |
| **Code and infrastructure definitions** | [link to the repository] |

```bash
# [The commands used to deploy, load-test or break the setup]
```

## Layer by layer

I started with the smallest deployment that works, then added one layer at a time.

| Step | Layer added | Monthly cost | Protects against | Does **not** protect against | Effort to run |
|---|---|---|---|---|---|
| 0 | [minimal: one VM + database on the same host] | | | | |
| 1 | [automated backups] | | | | |
| 2 | [managed database] | | | | |
| 3 | [load balancer + second instance] | | | | |
| 4 | [private networking] | | | | |
| 5 | [monitoring and alerting] | | | | |

## The cost model

| Line item | Basis (unit price × quantity) | Estimated / month | Measured / month |
|---|---|---|---|
| Compute | | | |
| Database | | | |
| Storage | | | |
| Data transfer out | | | |
| Cross-zone / cross-region traffic | | | |
| Load balancer | | | |
| NAT gateway / private endpoints | | | |
| Backups and snapshots | | | |
| Logs and monitoring | | | |
| Idle capacity | | | |
| **Total** | | | |
| **Cost per [1,000 requests / user / GB served]** | | | |

**Assumptions:** [region, pricing date, currency, whether free tiers, discounts, taxes and support plans are included]

**Where the estimate was wrong:** [the line item that surprised you, and the assumption behind the mistake]

## Under load

| Metric | [Option A] | [Option B] | [Option C] |
|---|---|---|---|
| Latency p50 | | | |
| Latency p99 | | | |
| Max sustained throughput | | | |
| Cold start / time to first request | | | |
| Time to scale out | | | |
| Saturation point | | | |
| First resource to run out | [CPU / memory / disk I/O / network / connections] | | |

[What the numbers mean. Which resource was the real bottleneck, and was it the one the instance specifications suggested?]

## Under failure

A redundant resource is only useful if the application actually survives without its twin.

| Failure injected | What broke | What stayed up | Time to recover | Data lost | Manual steps needed |
|---|---|---|---|---|---|
| [an instance is terminated] | | | | | |
| [a zone becomes unavailable] | | | | | |
| [the database fails over] | | | | | |
| [DNS stops resolving] | | | | | |
| [a service quota is reached] | | | | | |
| [restore from backup into a fresh environment] | | | | | |

### Hidden dependencies I found

- [e.g. the restore needed credentials stored only on the instance that was gone]
- [e.g. both "redundant" instances depended on a NAT gateway in a single zone]
- [...]

## Security and isolation

| Question | Answer in this setup |
|---|---|
| What is reachable from the internet? | [...] |
| Which identities can read or delete the data? | [...] |
| Where do secrets live, and who can read them? | [...] |
| What's the blast radius of a leaked credential? | [...] |
| What would an accidentally public bucket expose? | [...] |
| What did the extra controls cost in usability? | [...] |

## The operational overhead

| | [Option A] | [Option B] | [Option C] |
|---|---|---|---|
| Initial setup time | | | |
| Routine maintenance per month | | | |
| Patching and upgrades | | | |
| Monitoring to set up | | | |
| Expertise required | | | |
| Control given up | | | |
| Effort to move to another provider | | | |

## Promised versus needed

| The service promises | What this application actually needed |
|---|---|
| [e.g. 99.99% availability for the database] | [e.g. 99.5%, which a single instance with tested backups already met] |
| [e.g. automatic scaling] | [...] |
| [e.g. zero-maintenance operations] | [...] |

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my estimate right?

I predicted **[restate the estimate]**. The real figure was **[the measured or modelled result]**.

[What you misjudged, and what you'd now check first when estimating a similar setup.]

## What this doesn't prove

- **Pricing:** [prices change and vary by region; these are from [date] in [region]]
- **Scale:** [what would change at ten or a hundred times the traffic]
- **Provider:** [how much of this is specific to [provider]]
- **Workload:** [how a bursty, storage-heavy or latency-critical workload would differ]

## Verdict

For this workload, the right amount of infrastructure is **[the step or option you'd choose]**. [Why, in two sentences, tied to the cost and failure tables.]

**Each extra layer is justified when:**

- **[Layer]:** [the requirement that justifies it, e.g. "when an hour of downtime costs more than the standby's monthly price"]
- **[Layer]:** [...]
- **[Layer]:** [...]

**I'd choose differently if:** [the change in traffic, team, budget or recovery targets that would flip the decision]

**The rule of thumb I'm taking away:** [one sentence, including the conditions under which it holds]

## Next experiment

Next I want to test **[e.g. what happens when traffic suddenly increases tenfold / whether a cross-region restore meets the RTO]**. My prediction: [what you expect, so readers can bet along].

[Invite readers to share their own bills, setups or recovery stories.]

---

*Infrastructure definitions, load scripts, cost spreadsheet and raw measurements: [link to the repository].*
