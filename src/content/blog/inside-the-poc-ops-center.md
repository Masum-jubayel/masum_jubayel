---
title: "Inside the POC Ops Center: One Dashboard for 2,667 Radios and 2,951 SIMs"
excerpt: "A tour of the command dashboard I built to match push-to-talk radios with their data SIMs across five platforms, track licences and put a dollar value on idle SIMs."
date: "2026-10-31"
category: "PoC Radio and Telecommunications"
tags: ["POC radio", "Dashboard", "Data matching", "SIM management", "Operations", "JavaScript"]
cover: "/images/projects/poc-ops-center-overview.jpg"
coverStyle: "radar"
featured: true
---

Push-to-talk-over-cellular (POC) radios need two things to work: a **licence** on the radio platform and an **active data SIM** on a carrier. At Expert Mobile those two facts lived in different systems — the Inrico management platform for radios, and Telus Jasper, Simplex, Hologram and Mobilewave for SIMs. The **POC Ops Center** brings them together.

![POC Ops Center — Command Overview](/images/projects/poc-ops-center-overview.jpg)

## The numbers that started it

The first full import covered **217 companies, 2,667 devices and 2,951 carrier SIMs**. Only **16.5%** of devices (439) matched cleanly. **2,228** needed attention, and **206 SIMs** were active on radios that were switched off — about **$2,050 a month** of spend nobody was using. That one screen made the case for the project better than any slide.

## Command Overview

The home screen is a widget board you can rearrange: drag a section by its handle, resize it from the corner, collapse it, open it full screen or hide it (and restore it later).

- **Match gauge** — the overall match rate, with the breakdown underneath: matched on Jasper, matched on Simplex/Hologram, and each kind of mismatch.
- **Key numbers** — devices, online now, active and deactivated devices, active SIMs, *paying for idle SIMs*, licences expiring within 30 days and match rate. Every card is clickable and opens the list behind the number.
- **Freshness chips** — when each data source was last imported, so nobody acts on stale data.
- **Filters** — by agent, company and carrier, applied to every widget at once.

## How matching works

1. **Import** each platform's export in the Data hub (drag and drop). Missing columns are flagged before anything is processed.
2. **Normalise** identifiers: strip the trailing `f` Inrico adds to ICCIDs, trim spaces and stray commas.
3. **Join** radios and SIMs on ICCID.
4. **Classify** every device: *matched*, *no SIM in Inrico*, *invalid SIM value*, *SIM not on any carrier*, *wrong Jasper customer*, *name differs*, *same SIM on two or more devices*.
5. **Score** each issue as high, medium or low and raise an alert with the reason.

## The views

| View | What it answers |
| --- | --- |
| Matching | Which radios and SIMs agree, and why the rest don't |
| Active / Off | Device on + SIM off (service problem) vs device off + SIM on (wasted spend) |
| Savings | Idle-SIM cost by company and carrier, plus a what-if calculator |
| Licences | Licence × SIM matrix and an expiry calendar heat-map |
| Alerts | Prioritised list with one-click jump to the details |
| Companies / Devices / SIMs | Searchable tables with health bars and a per-company drawer |
| Compare | Custom groups side by side, with animated "versus" cards |
| Fleet map | Where devices and problems sit across companies and zones |
| Users / Admin | Roles, presence and settings |

## Turning findings into work

A dashboard only matters if problems get fixed. Every company drawer has an **action log** — status, owner and notes — and bulk actions for common fixes. Roles keep it safe:

- **Admin** — everything
- **Manager** — update actions
- **Viewer** — view and export
- **Agent** — only their own companies

## Reports

For any company where both platforms agree, the Ops Center produces two formatted workbooks — `dd-mm-yyyy Company (POC).xlsx` and `dd-mm-yyyy Company (SIM).xlsx` — with every identifier kept as full text, bold headers, frozen panes and filters, ready to file in the shared drive. Everything can also be downloaded as Excel, CSV or JSON.

## Design

The interface is a heads-up display: Orbitron and Rajdhani type, JetBrains Mono numbers, animated gauges and scan lines. It has a light theme (violet and orange) and a dark **Jarvis** theme (cyan and gold) — the same look that inspired the Jarvis theme on this site.

## What I learned

- Clean the identifiers first; most "mismatches" were formatting.
- Put a dollar figure on a problem and it gets prioritised.
- Every alert needs a reason and an owner.

See the full case study: [POC Ops Center](/projects/poc-sim-operations-center).
