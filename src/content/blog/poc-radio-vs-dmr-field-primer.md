---
title: "PoC Radio vs DMR: A Field Primer for Fleet Customers"
excerpt: "Push-to-Talk over Cellular and Digital Mobile Radio solve the same problem in different ways. Here's how I explain the difference — and why hybrid radios are popular."
date: "2026-10-14"
category: "PoC Radio and Telecommunications"
tags: ["PoC", "DMR", "Two-way radio", "Inrico", "Hytera"]
coverStyle: "waves"
---

Most of my week involves two-way radios for dispatchers, drivers and field crews. Customers often ask the same question: *should we buy PoC or DMR?* The honest answer is "it depends on where your people work."

## Push-to-Talk over Cellular (PoC)

PoC radios look like rugged walkie-talkies but talk over **cellular data (LTE)** to a cloud server.

- **Range:** anywhere there is mobile coverage — city to city, province to province.
- **Infrastructure:** no towers or repeaters to buy; you pay a service/licence per radio.
- **Management:** users, talk groups and settings are pushed from a web platform, so radios can be reconfigured remotely.
- **Weak spot:** no cellular signal, no talk.

## Digital Mobile Radio (DMR)

DMR is a digital land-mobile radio standard published by ETSI. Radios talk **directly over licensed radio frequencies**.

- **Simplex:** radio-to-radio with no network at all — great on a job site or in remote areas.
- **Repeaters:** extend range across a region you control.
- **Two time slots:** DMR uses TDMA to carry two voice paths on one 12.5 kHz channel.
- **Weak spot:** coverage is limited to what your radios and repeaters can reach.

## Why hybrid radios exist

Hybrid radios run **both** PoC and DMR. Crews use PoC on the highway and fall back to DMR simplex where there is no signal. The challenge is usability: if switching modes means leaving one app and opening another, it isn't safe while driving. That is exactly why I scoped a **unified channel selector** — one knob that steps through PoC groups and DMR channels — in our IRC380 custom firmware request.

## Provisioning checklist

1. Confirm the SIM/data plan and APN before configuring PoC accounts.
2. Create users and talk groups on the management platform first, then assign radios.
3. For DMR, program frequencies, colour codes and time slots exactly as licensed.
4. Lock settings menus so users can't break their own configuration.
5. Test a call in every group and every channel before the radio leaves the bench.
6. Record serial number, IMEI, account and firmware version for support.

## Quick comparison

| | PoC | DMR |
|---|---|---|
| Network | Cellular data | Licensed RF |
| Range | Wherever there's coverage | Radio/repeater range |
| Infrastructure | None (service fee) | Repeaters optional |
| Remote management | Yes | Limited |
| Works with no cell signal | No | Yes (simplex) |
