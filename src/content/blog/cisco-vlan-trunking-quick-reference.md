---
title: "Cisco VLANs and Trunking: A Practical Quick Reference"
excerpt: "The IOS commands I reach for when creating VLANs, assigning access ports, building 802.1Q trunks and verifying that it all works."
date: "2026-09-14"
category: "Cisco Networking"
tags: ["Cisco IOS", "VLAN", "802.1Q", "Switching", "CCNA"]
---

VLANs are one of the first tools for organizing — and securing — a switched network. This is a working reference for Cisco IOS switches, written for lab practice and day-to-day configuration.

> All addresses and VLAN IDs below are lab examples.

## Plan before you type

Write the plan down first. A small table saves a lot of re-work:

| VLAN | Name   | Purpose                  | Subnet         |
|------|--------|--------------------------|----------------|
| 10   | USERS  | Staff workstations       | 10.0.10.0/24   |
| 20   | VOICE  | IP phones / PoC dispatch | 10.0.20.0/24   |
| 30   | IOT    | Cameras, sensors         | 10.0.30.0/24   |
| 99   | MGMT   | Switch management        | 10.0.99.0/24   |

## Create and name VLANs

```cisco
SW1# configure terminal
SW1(config)# vlan 10
SW1(config-vlan)# name USERS
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name VOICE
SW1(config-vlan)# vlan 30
SW1(config-vlan)# name IOT
SW1(config-vlan)# vlan 99
SW1(config-vlan)# name MGMT
```

## Assign access ports

```cisco
SW1(config)# interface range gi0/2 - 12
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# spanning-tree portfast
```

Setting `switchport mode access` explicitly stops the port from negotiating a trunk with whatever gets plugged in.

## Build an 802.1Q trunk

```cisco
SW1(config)# interface gi0/1
SW1(config-if)# switchport trunk encapsulation dot1q   ! only on platforms that support ISL
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 10,20,30,99
SW1(config-if)# switchport trunk native vlan 999
SW1(config-if)# switchport nonegotiate
```

### Why these lines matter

- **Allowed VLAN list** — only carry what the far side needs.
- **Unused native VLAN** — reduces the risk of VLAN-hopping via double tagging.
- **`nonegotiate`** — disables DTP so a trunk can't be formed by accident.

## Verify

```cisco
SW1# show vlan brief
SW1# show interfaces trunk
SW1# show interfaces gi0/2 switchport
```

Check that the native VLAN matches on both ends of the trunk — a mismatch produces CDP warnings and confusing connectivity problems.

## Quick troubleshooting checklist

1. Is the port in the right VLAN? (`show interfaces status`)
2. Is the VLAN allowed **and** active on the trunk? (`show interfaces trunk`)
3. Does the VLAN exist on every switch in the path?
4. Is there a Layer 3 interface (SVI or router subinterface) for inter-VLAN routing?
5. Are ACLs or firewall rules blocking the traffic you expect?
