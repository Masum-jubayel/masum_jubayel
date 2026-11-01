---
title: "Building a Double-Booking-Proof Installation Scheduler"
excerpt: "Slot locks, time zones and a live board: lessons from replacing paper and group chats with a real-time booking system for vehicle radio installs."
date: "2026-10-26"
category: "Web Development"
tags: ["Scheduling", "Real-time", "Concurrency", "JavaScript", "UX"]
cover: "/images/projects/install-board.jpg"
coverStyle: "grid"
---

Vehicle radio installations are booked into fixed slots — 08:00, 10:00, 13:00 and 15:00 — across several installers. When that lived on paper and in chat threads, two things kept happening: **double bookings** and **forgotten rental equipment**. The Install Board fixes both.

## One live board

The board shows every installer side by side in **Day**, **Week** and **Month** views. It is backed by a real-time database, so when the front desk books a job, the installer's phone updates immediately.

## Slot locks: the heart of it

Two people opening the same empty slot at the same moment is the classic race condition. The fix is a short-lived **lock**:

1. When someone starts a booking, the app tries to *acquire* a lock on that installer + slot.
2. The lock has a **time-to-live**, so an abandoned form frees the slot automatically.
3. If the lock is taken, the second person is told instantly who is holding it — no silent failure.

The booking is only saved while the lock is held, then the lock is released.

## Time zones

The shop is in Alberta, so every time is shown in `America/Edmonton`, regardless of the device's clock. Dates are stored in one consistent format and converted only for display.

## The rest of the workflow

- **Ticket numbers** on every booking.
- **Block time** for training, holidays or vehicle prep.
- **Rentals & equipment** tracked against each job.
- **Reports**: daily run sheets and installer workload.
- **History**: who created, moved or cancelled each booking.

## Takeaways

Concurrency is a user-experience problem as much as a database one. Tell people *why* a slot is unavailable, and make locks expire on their own.

See the full project: [Install Board](/projects/install-board-appointment-booking).
