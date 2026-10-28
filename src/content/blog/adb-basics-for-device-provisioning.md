---
title: "ADB Basics for Android Device Provisioning"
excerpt: "A safe, repeatable starting point for using Android Debug Bridge when provisioning and troubleshooting Android-based devices."
date: "2026-10-05"
category: "Device Provisioning and Automation"
tags: ["Android", "ADB", "Provisioning", "Automation", "Bash"]
---

Android Debug Bridge (ADB) is the workhorse for configuring Android-based devices at scale. These are general patterns — always follow the device vendor's documentation and policies.

## Setup

1. Install the official **Android SDK Platform-Tools**.
2. Enable **Developer options → USB debugging** on the device (where the vendor permits it).
3. Connect and authorize the workstation.

```bash
adb devices
# List of devices attached
# R58N12345AB   device
```

## Read before you change

Always capture a baseline first:

```bash
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.display.id
adb shell pm list packages -3        # third-party packages
```

## Working with multiple devices

When several devices are connected, target each one by serial:

```bash
for s in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $s"
  adb -s "$s" shell getprop ro.product.model
done
```

## Installing and updating apps

```bash
adb -s "$SERIAL" install -r app-release.apk   # -r keeps app data
```

## Good habits

- **Log everything** — serial, firmware, what changed, when.
- **Script, don't type** — repeatable scripts reduce mistakes across a fleet.
- **Make scripts idempotent** — running twice shouldn't break anything.
- **Keep secrets out of scripts** — no credentials or license keys in plain text in version control.
- **Disable USB debugging** when the device leaves the bench, if policy requires.

## Troubleshooting

| Symptom                 | Try                                              |
|-------------------------|--------------------------------------------------|
| `unauthorized`          | Re-accept the RSA prompt on the device           |
| `no devices/emulators`  | Check cable (data, not charge-only), drivers     |
| `offline`               | `adb kill-server && adb start-server`            |
