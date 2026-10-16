> **Series:** [Astronomy From First Principles · The Amateur Astronomy Lab · Code, Math & the Cosmos] — **Part [n]**
>
> **TL;DR:** [The question in one sentence. What the calculation, observation or simulation showed, in one sentence. What it establishes, and what it doesn't, in one sentence.]
>
> **At a glance:** target: [object] · [date] · my result versus the reference: [n]% off
>
> **Context:** [Observing location and approximate latitude] · [Dates] · **Data:** [sources] · The telescope, camera and software are listed under Gear, at the end

## The question

[Open under the sky. e.g. 23:40, −2 °C, and Jupiter was exactly where my forty lines of Python said it would be. Saturn wasn't.]

[The phenomenon, observation or apparent contradiction that started this. e.g. Last week [planet] was next to [star]. Tonight it isn't. The stars haven't moved relative to each other, so what did?]

> **[Why does the sky look different every night? / How do we know how far away that is? / How much of this photograph is data, and how much is processing?]**

What I expected: **[your prediction]**.

## What we know, and how we know it

| Claim | Type | Source |
|---|---|---|
| [e.g. Earth rotates once every 23 h 56 min relative to the stars] | [observed / inferred / model / speculation] | [reference] |
| [...] | | |
| [...] | | |

[Briefly: the observations and reasoning behind the accepted explanation, before you test it yourself.]

## The conditions

[For observing posts; remove otherwise.]

| | |
|---|---|
| **Location** | [latitude, horizon, sky brightness] |
| **Date and time** | [local time and UTC] |
| **Moon** | [phase, illumination, position] |
| **Weather** | |
| **Seeing and transparency** | |
| **Targets** | [...] |

### Observing log

| Time (UTC) | Target | Instrument and magnification | What I saw | Notes |
|---|---|---|---|---|
| | | | | |
| | | | | |

## The method

[The approach: a calculation, an observation, a simulation or an analysis of published data, and why it suits the question.]

### Back of the envelope

Before the real calculation, a rough estimate to know what kind of answer to expect.

```text
[e.g.
The Moon orbits once in about 27 days: 360° / 27 ≈ 13° a day.
A fist at arm's length covers about 10° of sky,
so the Moon should drift a bit more than a fist east each night.]
```

### The math

| Symbol | Meaning | Units | Value |
|---|---|---|---|
| [a] | [semi-major axis] | [AU] | |
| [T] | [orbital period] | [years] | |
| [...] | | | |

```text
[The relationship, step by step, e.g.
T² = a³        (Kepler's third law, T in years and a in AU, for bodies orbiting the Sun)
T  = a^(3/2)]
```

### The assumptions

- [e.g. circular orbits]
- [e.g. positions are geocentric; I ignore atmospheric refraction]
- [e.g. the time convention used]

### The code

```python
# [The calculation, simulation or analysis]
```

### The data

[For data posts: the dataset, its version, when it was retrieved, and how it was cleaned.]

## The result

| Quantity | My result | Reference value | Difference | Reference source |
|---|---|---|---|---|
| | | | | |
| | | | | |

```text
[The output, or what the plot shows]
```

**Plot or image:** [link]

### Uncertainty

| Source | Estimated size | Effect on the result |
|---|---|---|
| [e.g. timing of the observation] | | |
| [e.g. simplified orbits] | | |
| [e.g. measurement precision] | | |

## The interpretation

[What the result supports, and which assumptions it depends on.]

- **Observed:** [what was directly measured or seen]
- **Inferred:** [what follows from the observations through the model]
- **Still uncertain:** [what remains open, or speculative]

> **The model explains [what it gets right]. It doesn't explain [where it breaks], because [the simplification responsible].**

## Where the model breaks

[The effects a more complete model would need, and how large an error each one causes.]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my expectation right?

| I expected | What the investigation showed | Verdict |
|---|---|---|
| [restate the prediction] | | [right / wrong / partly right] |
| [e.g. how far off the simple model would be] | | |

## What this doesn't establish

- **Precision:** [why this isn't precision ephemeris or measurement data]
- **Scope:** [the conditions, objects or time range the result applies to]
- **Sources:** [what depends on published values you didn't measure yourself]

## Verdict

[What you learned, and how it changed your understanding of the sky.]

> **If you remember one thing:** [one sentence, with the conditions under which it holds]

## Try it yourself

- **Tonight, with no equipment:** [note where the Moon is relative to a bright star, and look again at the same time tomorrow. It will have moved roughly 13° east, a bit more than a fist at arm's length]
- **With the code:** [change the date or your location and compare the output with a planetarium app]
- **For this post's question:** [the dates, direction and time to look, if readers can see it themselves]

## Next investigation

Next I want to look at **[the next question]**. My prediction: [what you expect].

[Invite readers to run the code for their own location and date, or to point out a flaw in the method.]

## Gear

What I observed, photographed and calculated with, and why.

| Item | Model and specs | Why this one |
|---|---|---|
| **Telescope** | Explore Scientific ED APO 127 FCD-100 · 127 mm aperture · 952 mm focal length · f/7.5 · 7.7 kg | |
| **Mount** | Sky-Watcher HEQ5-R Pro Go-To · German equatorial · belt drive on both axes · 15 kg payload for astrophotography | |
| **Camera** | Canon EOS 2000D · APS-C CMOS sensor, 24.1 MP · attached to the telescope with a T-ring adapter | |
| **Binoculars** | [if used] | |
| **Software** | [planetarium and stacking software, e.g. Stellarium and Siril, which both run on Linux] · darktable and GIMP for final edits | |
| **Computer** | Lenovo IdeaPad Slim 5 Gen 10 · Pop!_OS | |

---

*Code, data and references: [link]. Data and published values verified on [date].*
