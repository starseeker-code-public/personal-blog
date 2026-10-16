> **Series:** [Design, Print, Improve · The 3D Printing Lab · Print or Buy?] — **Part [n]**
>
> **TL;DR:** [The part and the problem, in one sentence. What the measurements showed, in one sentence. The design change that fixed it, and its trade-off, in one sentence.]
>
> **Context:** [Printer and nozzle] · [Material, brand and colour] · [Slicer and version] · [CAD tool]

## The problem

[The functional requirement, print failure, design constraint or manufacturing question. e.g. I designed a cover for [object]. In CAD it fitted perfectly. In my hand it didn't fit at all.]

> **[Why didn't it fit? / Which setting actually made the difference? / Is printing this better than buying it?]**

My first guess: **[your hypothesis, e.g. "the printer's steps per mm are off"]**.

## What success means

| | |
|---|---|
| **Intended use** | [decorative / dimensional prototype / functional / load-bearing] |
| **Must fit** | [the mating part, and how: press fit, snug, sliding] |
| **Must survive** | [loads, repeated use, heat, sunlight, moisture] |
| **Can't be** | [e.g. heavier than [x] g, longer than [n] hours to print] |

## The design

| Feature | Nominal size (CAD) | Clearance | Why |
|---|---|---|---|
| [Outer width] | | | |
| [Hole for M3 bolt] | | | |
| [Slot for the lid] | | | |

### Design decisions

- **Orientation:** [and how it affects strength and supports]
- **Supports:** [needed or designed out, and why]
- **Split into parts:** [yes / no, and why]
- **Fillets, chamfers and overhangs:** [...]

**Model:** [link to the CAD file]

## The print settings

| Setting | Value |
|---|---|
| Layer height | |
| Walls | |
| Infill (pattern, density) | |
| Nozzle / bed temperature | |
| Speed | |
| Cooling | |
| Supports | |
| Print time | |
| Material used | |

## The first print

| Feature | CAD | Measured (average of [n]) | Deviation |
|---|---|---|---|
| [Outer width] | | | |
| [Hole diameter] | | | |
| [Slot width] | | | |

**Fit:** [what happened when you tried it]

**Measured with:** [calipers, how many measurements, where on the part]

## The experiment

One variable at a time; everything else stays the same.

| | Sample A | Sample B | Sample C |
|---|---|---|---|
| **What changed** | | | |
| **Kept the same** | [material, printer, orientation, other settings] | | |

## The measurements

| | Sample A | Sample B | Sample C |
|---|---|---|---|
| Key dimension | | | |
| Print time | | | |
| Material (g) | | | |
| Visible defects | | | |
| Test result | | | |

**Test method:** [how the parts were tested: the load, the direction, the number of cycles, and how you kept it safe and repeatable]

## The analysis

[What caused the differences, and which variables remain uncertain.]

> **The problem wasn't [the obvious suspect, e.g. printer calibration]. It was [the actual cause, e.g. holes printing smaller than modelled, plus elephant's foot on the first layers].**

## The revised design

[The targeted change, based on the measurements rather than guesswork.]

| Feature | v1 | v2 | Why |
|---|---|---|---|
| | | | |
| | | | |

## The second print

| | v1 | v2 |
|---|---|---|
| Fit | | |
| Key dimension deviation | | |
| Print time | | |
| Material | | |
| Strength or test result | | |

## The trade-offs

- **Better:** [...]
- **Worse:** [e.g. longer print, more material, a visible seam]
- **Depends on the application:** [...]

## What it really cost

| | Cost |
|---|---|
| Material | |
| Electricity | |
| Failed prints | |
| Printer wear | |
| Post-processing | |
| Design time | |
| **Per part** | |
| **Buying it instead** | |

## Clearance reference

[An optional reusable result: which clearances work on this printer with this material.]

| Clearance | Result |
|---|---|
| 0.1 mm | [too tight / press fit / snug / sliding / loose] |
| 0.2 mm | |
| 0.3 mm | |
| 0.4 mm | |

## Limits

[What these tests are, and what they are not. An exploratory test isn't an engineering validation. Say what this part shouldn't be used for, e.g. safety-critical loads, pressure, high temperatures or food contact, and note any material-handling precautions such as ventilation.]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my first guess right?

I suspected **[restate the hypothesis]**. The measurements showed **[the result]**.

## Verdict

[What you learned about designing for this printer and material, in two or three sentences.]

**Print it when:** [...]

**Buy it or make it another way when:** [...]

**The rule of thumb I'm taking away:** [one sentence, with the conditions under which it holds]

## Next experiment

Next I want to test **[the next variable or part]**. My prediction: [what you expect].

[Invite readers to share their clearance results, or a part that taught them something about tolerances.]

---

*CAD model, print files (STL / 3MF), slicer profile and measurements: [link].*
