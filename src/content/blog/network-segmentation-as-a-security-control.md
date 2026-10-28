---
title: "Network Segmentation as a Security Control"
excerpt: "Why separating users, servers and IoT devices is one of the most practical security improvements a small network can make."
date: "2026-10-18"
category: "Cybersecurity Fundamentals"
tags: ["Network Security", "VLAN", "Segmentation", "IoT", "Least Privilege"]
---

Segmentation is where networking and security meet. It doesn't stop every attack, but it limits **how far** a problem can spread — and it makes traffic easier to understand and monitor.

## The idea in one sentence

Put devices with different trust levels and purposes into different network segments, and only allow the traffic between them that is actually needed.

## A simple starting model

| Segment | Examples                         | Typical policy                                  |
|---------|----------------------------------|-------------------------------------------------|
| Users   | Workstations, laptops            | Internet + specific internal services           |
| Servers | File, inventory, NVR             | Only required ports from users                  |
| IoT     | Cameras, sensors, smart devices  | No access to users; limited outbound            |
| Guest   | Visitor Wi-Fi                    | Internet only                                   |
| Mgmt    | Switch/AP/firewall management    | Admin hosts only                                |

## Building blocks

- **VLANs** on switches to separate Layer 2 domains.
- **Inter-VLAN routing** on a router or Layer 3 switch.
- **ACLs or firewall rules** to enforce *which* traffic may cross.
- **Logging** at the boundaries so you can see what's being allowed and denied.

## Example: restricting an IoT VLAN with an ACL

```cisco
ip access-list extended IOT-IN
 remark allow cameras to reach the NVR only
 permit tcp 10.0.30.0 0.0.0.255 host 10.0.40.10 eq 554
 deny   ip 10.0.30.0 0.0.0.255 10.0.0.0 0.255.255.255 log
 permit ip 10.0.30.0 0.0.0.255 any
!
interface vlan 30
 ip access-group IOT-IN in
```

## Common mistakes

1. Creating VLANs but routing everything between them with no filtering.
2. Leaving device management interfaces reachable from the user network.
3. Forgetting to document *why* each rule exists.

Segmentation is a design habit as much as a configuration — and it's one I'm continuing to practise in my security learning labs.
