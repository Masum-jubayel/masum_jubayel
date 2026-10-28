---
title: "A Field Checklist for Structured Cabling Installs"
excerpt: "What I check before, during and after a structured cabling job — from pathway planning to certification and documentation."
date: "2026-08-22"
category: "IT Infrastructure"
tags: ["Structured Cabling", "Cat6", "Patch Panels", "Documentation", "Field Engineering"]
---

Good cabling is invisible: nobody notices it until it fails. This checklist reflects the routine I follow on multi-site installation work.

## Before the job

- Confirm the **scope**: number of drops, cable category (Cat5e / Cat6), rack location, and device list (routers, switches, APs, POS terminals, printers).
- Walk the **pathways**. Look for EMI sources (lighting ballasts, motors) and plan separation.
- Agree on the **labeling scheme** with the project manager *before* the first pull.
- Check PPE and ladder requirements for the site.

## During the install

- Respect the **minimum bend radius** and don't over-tighten cable ties — use hook-and-loop where possible.
- Keep the **untwist length** at terminations as short as possible.
- Terminate to a single standard (T568A or T568B) throughout the site.
- Dress cables into the rack with proper cable management; leave a service loop.
- Label **both ends** as you go — not at the end of the day.

## Testing and certification

1. Run a **wiremap** test on every link (opens, shorts, split pairs, reversed pairs).
2. Certify with a certifier where the job requires it, and save the results.
3. Tone-trace anything unexpected rather than guessing.
4. Re-test after any re-termination.

## Handover

| Deliverable              | Why it matters                            |
|--------------------------|-------------------------------------------|
| Port/patch map           | Fast troubleshooting later                |
| Test/certification files | Proof of performance                      |
| Photos of rack           | Visual baseline for the next technician   |
| Device config notes      | Shared with the remote config team        |

A tidy rack and an accurate map are what make the next visit a ten-minute fix instead of a two-hour trace.
