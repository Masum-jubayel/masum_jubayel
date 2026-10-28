---
title: "Hash-Verified Backups with PowerShell and SHA-256"
excerpt: "How to keep three copies of evidence-grade files — and prove they are identical — using nothing but Windows, PowerShell and a scheduled task."
date: "2026-10-22"
category: "IT Infrastructure"
tags: ["PowerShell", "Backup", "SHA-256", "Windows", "Automation"]
coverStyle: "shield"
featured: true
---

Body-camera recordings, signed contracts, CCTV exports — some files are only useful if you can prove nobody changed them. A backup that silently copies a corrupted or edited file is worse than no backup at all. This is the pattern I used for a body-cam data system: **one master, two backups, every copy verified by hash.**

## The idea in four steps

1. A recording lands on the **primary PC**.
2. Its **SHA-256 hash** is recorded and the file becomes the *master*.
3. The file is copied to **two backup locations** and each copy is hashed again.
4. Only when all three hashes match is the file marked as protected — and the backups **refuse deletes**.

A scheduled task repeats the check every couple of minutes, so a new file is protected almost as soon as it arrives.

## Hashing a file

PowerShell has hashing built in — no extra tools needed:

```powershell
$h = Get-FileHash -Path 'D:\Recordings\cam01_0915.mp4' -Algorithm SHA256
$h.Hash   # 64 hex characters
```

Two files with the same SHA-256 are, for all practical purposes, byte-for-byte identical.

## Copy, then verify

```powershell
param([string]$Source = 'D:\Recordings', [string[]]$Targets = @('\\backup1\Recordings', '\\backup2\Recordings'))

$log = Join-Path $Source 'hash-log.csv'
Get-ChildItem $Source -File -Filter *.mp4 | ForEach-Object {
    $master = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    foreach ($t in $Targets) {
        $dest = Join-Path $t $_.Name
        if (-not (Test-Path $dest)) { Copy-Item $_.FullName $dest }
        $copy = (Get-FileHash $dest -Algorithm SHA256).Hash
        if ($copy -ne $master) { Write-Warning "MISMATCH: $dest"; Remove-Item $dest; continue }
    }
    [pscustomobject]@{ File = $_.Name; SHA256 = $master; Checked = Get-Date -Format s } |
        Export-Csv $log -Append -NoTypeInformation
}
```

> Test every script on sample files first. Never point a new script at the only copy of real data.

## Make the backups refuse deletes

NTFS permissions can let staff **add** files without being able to **delete** them. Deny the delete rights on the backup folder for the user group (adjust names for your environment):

```powershell
icacls 'E:\Recordings' /deny 'OFFICE\Staff:(OI)(CI)(DE,DC)'
```

`DE` is delete and `DC` is delete-child. Keep at least one administrator account that is *not* in that group for maintenance.

## Run it on a schedule

```powershell
$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -File C:\Scripts\verify-backups.ps1'
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 2)
Register-ScheduledTask -TaskName 'Verify recordings' -Action $action -Trigger $trigger -RunLevel Highest
```

## Lessons learned

- **Log every hash.** The CSV becomes your proof of integrity when someone asks.
- **Two offices beat one.** A second site over an encrypted tunnel protects against fire, theft and ransomware on a single network.
- **Document the rebuild.** If the person who built it is away, a step-by-step guide is what keeps the system alive.
