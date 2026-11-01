---
title: "Matching POC Radios and SIMs Across Vendor Portals"
excerpt: "How I turned a slow, tab-switching audit of push-to-talk radios and their data SIMs into a repeatable, minutes-long check with clean Excel reports."
date: "2026-10-28"
category: "PoC Radio and Telecommunications"
tags: ["POC radio", "SIM management", "Automation", "Python", "Excel", "Data matching"]
cover: "/images/projects/poc-sim-operations-center.jpg"
coverStyle: "signal"
featured: true
---

Push-to-talk-over-cellular (POC) radios need two things to work: a **licence** on the radio platform and an **active data SIM** on the carrier. Those two records live in different vendor portals, owned by different companies, with different formats. When they drift apart, customers lose service or keep paying for SIMs nobody uses.

## The problem

For each customer account I had to:

1. Open the radio platform, find the company and list every device (including offline ones).
2. Open the carrier portal, search the same company and list every SIM.
3. Compare the ICCIDs one by one.

By hand that is slow, and it is easy to miss the cases that matter: a SIM under the wrong customer, a radio name that doesn't match the SIM's device ID, or a deactivated SIM still attached to a live radio.

## The approach

**1. Normalise first.** The radio platform stores ICCIDs with a trailing `f`; the carrier doesn't. Spaces and trailing commas creep in from exports. Most "mismatches" disappeared once identifiers were cleaned.

**2. Match on one key.** Every device is joined on ICCID, then checked on three rules:

- the ICCID exists on both sides,
- the carrier's customer equals the radio platform's company,
- the counts are equal.

**3. Stop on any mismatch.** If anything disagrees, nothing is filed. The report lists each problem with a reason — *missing on carrier*, *wrong customer*, *name differs*, *SIM deactivated* — so the record can be fixed first and the check re-run.

**4. Only then, export.** When everything matches, two workbooks are produced — `dd-mm-yyyy Company (POC).xlsx` and `dd-mm-yyyy Company (SIM).xlsx` — and filed in the shared drive under the customer's folder.

## Formatting that saves the next person time

Excel loves to turn a 20-digit ICCID into `8.9E+18`. Every cell is written as text, headers are bold on a dark fill, panes are frozen, filters are on and column widths fit the data. Small details, but they are what make a report usable.

## From script to operations center

Once the matching logic was reliable, I wrapped it in a dashboard: a licence/SIM matrix, idle-SIM cost estimates, a what-if calculator for plan changes, fleet maps and role-based access for admins, managers, viewers and field agents.

## Takeaways

- Clean identifiers before you compare them.
- Make the tool refuse to file anything until the data agrees.
- Formatting is part of the deliverable.

See the full project: [POC & SIM Operations Center](/projects/poc-sim-operations-center).
