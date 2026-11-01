---
title: "Two Offices, One Truth: Body-Cam Backups Over Tailscale and OneDrive"
excerpt: "Least-privilege accounts, Deny-Delete permissions, an encrypted tunnel and hash checks every two minutes — designing evidence storage across two sites."
date: "2026-10-24"
category: "IT Infrastructure"
tags: ["Backup", "Tailscale", "SMB", "NTFS", "OneDrive", "PowerShell", "Security"]
cover: "/images/projects/bc680-overview.jpg"
coverStyle: "shield"
---

Body-camera recordings are evidence. They must never be lost, silently changed or deleted — and staff in two offices need simple access. This post covers the *network and permissions* side of the BC680 backup system; the hashing side is in [Hash-Verified Backups with PowerShell](/blog/hash-verified-backups-with-powershell).

## Layout

- **Main office**: the primary PC receives recordings and holds the master copy.
- **Remote office**: a backup PC holds the second copy.
- **Off-site**: an optional OneDrive copy for disaster recovery.

The offices are joined by a **Tailscale** (WireGuard) tunnel, so SMB shares travel encrypted and nothing is exposed to the internet.

## Least privilege

Three Windows accounts, each with one job:

| Account | Can do |
| --- | --- |
| OfficeStaff | Read recordings in the main office |
| RemoteStaff | Read recordings from the remote office |
| BackupWriter | Write new copies to backups — nothing else |

On the backup folders, NTFS **Deny Delete** is set, so even the account that writes backups cannot remove them.

## Verification every two minutes

A scheduled PowerShell task compares SHA-256 hashes of the master and both backups every two minutes and logs any difference.

## Twelve problems, solved

The project write-up documents twelve real issues — from mapped drives disappearing after reboot to permission inheritance surprises — with the fix for each, plus a 55-step rebuild guide.

See the project: [BC680 Body-Cam Data Backup System](/projects/bc680-bodycam-data-backup).
