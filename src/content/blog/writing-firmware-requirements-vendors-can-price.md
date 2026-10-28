---
title: "Writing Firmware Requirements a Vendor Can Actually Price"
excerpt: "A one-page structure for turning dealer complaints into clear, priced, testable requirements — from a real custom-firmware request for quote."
date: "2026-10-10"
category: "Technical Career Development"
tags: ["Requirements", "RFQ", "Firmware", "Project management"]
coverStyle: "circuit"
---

"Can you make the radio better?" is not something a manufacturer can quote. When I gathered dealer feedback for a custom radio firmware build, the goal was a document an engineering team could **price item by item** and **test** when delivered.

## 1. One row per requirement

Each requirement got its own row with five columns:

| Column | Why it matters |
|---|---|
| **Requirement** | A short name people can refer to ("B — password on app settings") |
| **What we need and why** | The behaviour *and* the real-world problem it solves |
| **Components** | Where the change probably lands (firmware, PoC app, DMR app, management platform) |
| **Priority** | Must or Should — lets the vendor quote a "must-have only" option |
| **Cost / lead time** | Left blank for the vendor to fill in |

The *why* is the most important part. "Crews must leave one app and enter another — unusable while driving" tells the engineer what success looks like better than any spec.

## 2. Ask for separate prices

Ask the vendor to price **each item separately** and to **flag anything not feasible**. You can then drop an expensive "should" without renegotiating the whole job.

## 3. Define the deliverables

- Flashable firmware image and updated app builds
- Changes to the programming/provisioning tool
- Release notes per item
- A list of prompts to translate (for bilingual voice announcements)

## 4. Ask the commercial questions up front

- Total for all items, and for must-haves only
- Warranty / defect-fix period
- Is the build exclusive to us?
- Will the features carry forward into future stock firmware?

## 5. Show the process

A simple four-step timeline sets expectations: **dealer input → list finalised → quote returned → build, pilot on 2–3 test units, short field pilot, release.**

## What I'd tell anyone writing their first RFQ

Write it for the engineer who has never met your customers. If they can read one row and picture the user's problem, you'll get a realistic quote — and a feature that actually fixes it.
