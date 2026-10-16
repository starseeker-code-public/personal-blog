> **Series:** [Embedded Systems Lab · Measurements Don't Lie · From Prototype to Device] — **Part [n]**
>
> **TL;DR:** [The device and the problem, in one sentence. What the measurements revealed, in one sentence. The fix, and the conditions it holds under, in one sentence.]
>
> **At a glance:** failed after [n] min · cause: [one phrase] · uptime after the fix: [n] h · sleep current: [n] µA
>
> **Context:** [Board and microcontroller] · [Key components] · [Low-voltage project] · Instruments are listed under Gear, at the end

## The problem

[Open on the symptom exactly as it appeared. e.g. 10:47:03 was the last line in the serial log. Then nothing. Then the boot banner, again.]

[The behavior you want, or the failure you want to understand. e.g. The sensor logger worked perfectly on my desk. After about ten minutes on its own, it started skipping readings, and after an hour it reset.]

> **[Why does it fail after ten minutes? / How much current does it really draw? / Why does the sensor disagree with the reference?]**

My first suspicion: **[your hypothesis, e.g. "a memory leak in the logging code"]**.

## The device

[What it does, in two or three sentences.]

```text
[Block diagram, e.g.

  USB 5 V ──▶ regulator 3.3 V ──▶ MCU ──I²C──▶ temperature sensor
                                   │
                                   ├──SPI──▶ SD card
                                   └──GPIO──▶ status LED]
```

### Components

| Component | Exact part or board | Role | Key datasheet values |
|---|---|---|---|
| [MCU] | | | [voltage, current in each mode] |
| [Sensor] | | | [range, accuracy, response time] |
| [Regulator] | | | [max current, dropout, quiescent current] |
| [...] | | | |

Similar-looking boards can differ electrically, so these are the exact parts I used.

### Connections

| MCU pin | Connected to | Notes |
|---|---|---|
| [SDA] | [sensor SDA] | [4.7 kΩ pull-up to 3.3 V] |
| [...] | | |

**Schematic:** [link]

## The firmware

[The structure: a simple loop, a state machine, interrupts, an RTOS, and why.]

```cpp
// [The relevant part of the firmware: the main loop, the state machine, the sensor read]
```

## The first tests

[What worked in short tests, and for how long you tested.]

## The failure

| | |
|---|---|
| **Symptom** | [exactly what happens] |
| **When** | [after how long, or under what conditions] |
| **Repeatable?** | [always / sometimes / once] |
| **What makes it better or worse** | [e.g. USB power versus battery, temperature, the actuator turning on] |

```text
[The serial log or output around the failure]
```

## The hypotheses

Every plausible cause, and the test that could tell it apart from the others.

| Hypothesis | Evidence for | Evidence against | Test | Result |
|---|---|---|---|---|
| [Memory growth] | | | [log free memory every minute] | [ruled out / confirmed] |
| [Supply voltage drops] | | | [scope on the 3.3 V rail] | |
| [Timing assumption] | | | | |
| [Sensor or bus timeout] | | | | |
| [Overheating] | | | | |

### The red herring

[The hypothesis that cost the most time: why it looked so convincing, how long you chased it, and the measurement that finally ruled it out.]

## The measurements

### Voltage and current

| Measurement | Expected | Measured | Instrument |
|---|---|---|---|
| Supply voltage, idle | | | |
| Supply voltage, worst moment | | | |
| Current, active | | | |
| Current, sleep | | | |
| Peak current | | | |

### Signals and timing

```text
[What the oscilloscope or logic analyzer showed: rise times, glitches, ripple, bus timing, and how it compared with what the firmware expected]
```

### Long run

| | Value |
|---|---|
| Hours run | |
| Resets | |
| Missed samples | |
| Free memory (start / end) | |
| Communication errors | |

## The cause

[The mechanism, connecting the evidence to the symptom. Show what ruled out the other explanations; correlation alone isn't a root cause.]

> **The problem wasn't [the obvious suspect]. It was [the actual cause], and the [firmware / hardware] made it visible because [how the two interacted].**

## The fix

[The hardware change, the firmware change, or both.]

```cpp
// [The firmware change, if any]
```

**Hardware change:** [e.g. a 100 µF bulk capacitor at the module's supply pins, a shorter ground return, a different regulator]

## Testing it again

| | Before | After |
|---|---|---|
| Time to first failure | | |
| Resets per day | | |
| Missed samples | | |
| Sleep current | | |
| Response time | | |
| Estimated battery life | | |

**How the battery-life estimate was made:** [the measured currents, the duty cycle, the battery capacity, and what the estimate leaves out: temperature, battery ageing, regulator efficiency]

## When things go wrong on purpose

[For From Prototype to Device posts; remove otherwise.]

| Fault introduced | Detected? | Recovered? | Reported? |
|---|---|---|---|
| Sensor disconnected | | | |
| Bus timeout | | | |
| Brief power loss | | | |
| Corrupted configuration | | | |

## The trade-offs

- **Better:** [...]
- **Worse:** [e.g. slower response, fewer samples, longer startup, more complex firmware]
- **Cost and size:** [...]

## Operating limits

[The voltage, current and temperature range the device was tested in, and what it isn't designed for. Batteries, motors, heaters and mains power need specific precautions; this project stays at [voltage].]

## What I didn't expect

### [Surprise 1, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

### [Surprise 2, written as a headline]

[What I saw.] [What I first thought it meant.] [What it actually meant, and how I found out.]

## Was my first suspicion right?

| I suspected | What the measurements showed | Verdict |
|---|---|---|
| [restate the hypothesis] | [the result] | [right / wrong / partly right] |
| [e.g. how much current it drew asleep] | | |

[How this changes the way you'll debug the next device.]

## What this doesn't prove

- **One unit:** [component tolerances vary between boards]
- **Duration:** [tested for [time]; longer runs may reveal other failures]
- **Conditions:** [temperature, supply and environment during the tests]

## Verdict

[What works now, what you would redesign, and the conditions the result applies to.]

> **If you remember one thing:** [one sentence, with the conditions under which it holds]

## Try it yourself

Measure what your own board really draws:

- **You'll need:** [a USB power meter, or a multimeter in series with the supply]
- **Do this:** [measure the current while running, and again in sleep mode]
- **Compare:** [with the datasheet. If sleep current is far higher, look for the power LED, the regulator, or a sensor that never sleeps]

## Next experiment

Next I want to **[the next test, e.g. run it on battery for a week / build a test harness that cycles it through startup and recovery]**. My prediction: [what you expect].

[Invite readers to share the bug that turned out to be electrical, or the other way round.]

## Gear

My bench, and why. [A generic, complete starter bench: replace each item with my own as I get it.]

| Item | Model | Why this one |
|---|---|---|
| **Multimeter** | [Generic: auto-ranging, True RMS, with a continuity beep and a µA current range] | |
| **Oscilloscope** | [Generic: two-channel digital oscilloscope, 50 MHz or more] | |
| **Logic analyzer** | [Generic: 8-channel USB analyser supported by sigrok and PulseView, which run on Linux] | |
| **Current or USB power meter** | [Generic: a USB-C power meter for quick checks, and a meter that reads µA for sleep current] | |
| **Bench power supply** | [Generic: adjustable 0–30 V, 0–5 A, with current limiting] | |
| **Soldering station** | [Generic: temperature-controlled, around 60 W, with fine tips] | |
| **Soldering supplies** | [Generic: solder, flux, desoldering braid, a solder sucker, helping hands] | |
| **Prototyping** | [Generic: solderless breadboards, jumper wires, perfboard] | |
| **Hand tools** | [Generic: wire strippers, flush cutters, precision tweezers, small screwdrivers] | |
| **Development boards** | [Generic: Arduino Uno, ESP32, Raspberry Pi Pico] | |
| **Components** | [Generic: assorted resistors, capacitors, LEDs, transistors and common sensors] | |
| **Safety** | [Generic: safety glasses and fume extraction for soldering] | |
| **Computer and toolchain** | Lenovo IdeaPad Slim 5 Gen 10 · Pop!_OS · VS Code · [toolchain, e.g. PlatformIO or Arduino IDE] | |

---

*Schematic, firmware and raw measurements: [link].*
