// All content in this file is derived from Masum's resume. Edit freely — pages read from here.

export type Job = {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string; // YYYY-MM
  end: string | null; // null = present
  primary: boolean;
  summary: string;
  highlights: string[];
  /** Optional grouped duties (shown as sections instead of one flat list). */
  groups?: { title: string; items: string[] }[];
  tags: string[];
  /** Company logo (shown on a white tile) and website link. */
  logo?: string;
  website?: string;
};

export const experience: Job[] = [
  {
    id: "expert-mobile",
    logo: "/images/logos/expert-mobile.png",
    website: "https://www.expertmobile.ca/",
    company: "Expert Mobile Communications Ltd.",
    title: "Lead IT Support & Network Administrator",
    location: "Grande Prairie, AB, Canada",
    start: "2026-05",
    end: null,
    primary: true,
    summary:
      "Lead the company’s telecommunications, IT infrastructure, business systems and web operations — from PoC radio fleets and the server room to Odoo, e-commerce websites and an in-house inventory system — supporting dealers, customers and partners across North America.",
    groups: [
      {
        title: "Telecommunications & PoC Radio Systems",
        items: [
          "Deploy, program, configure, test and support Push-to-Talk over Cellular (PoC) radio systems, including Inrico and Hytera devices.",
          "Administer Inrico PoC radios through the Inrico Canada Management Platform — provisioning, remote configuration, monitoring, licensing and dispatch services.",
          "Administer Hytera PoC radios through the HyTalk nationwide management platform — provisioning, configuration, monitoring and troubleshooting.",
          "Customize platform settings, device configurations and system functionality to customer-specific operational requirements, working with Inrico Solutions, Hytera representatives and other technical partners.",
          "Support installations, radio provisioning, dispatch configuration, equipment testing and service calls for Inrico dealers, Hytera customers and business partners across North America.",
          "Learn, configure and support multiple PoC radio server platforms, and lead the IRC380 custom firmware project for the Canadian market.",
          "Assist with customer installations, service calls, equipment configuration and testing on site and remotely.",
        ],
      },
      {
        title: "Android Device Engineering & Automation",
        items: [
          "Perform firmware updates, firmware configuration and device-level modifications on Android-based PoC radios to meet functionality, compatibility and performance requirements.",
          "Develop Android Debug Bridge (ADB) scripts, commands and configuration files for device customization, software configuration, troubleshooting and maintenance.",
          "Troubleshoot Android OS, firmware, radio connectivity and application configuration issues.",
          "Maintain technical documentation, device configuration records, firmware information and service reports.",
        ],
      },
      {
        title: "IT Infrastructure & Network Administration",
        items: [
          "Maintain, monitor and support the company’s IT infrastructure — network racks, switches, routers, cabling, servers and related hardware.",
          "Oversee day-to-day server room operations, including equipment monitoring, connectivity, physical organization and routine maintenance.",
          "Configure, maintain and troubleshoot LANs, internet access and network services; carry out equipment installations, configuration changes, upgrades and connectivity testing.",
          "Coordinate with Fusion Business Solutions and other external IT providers on network infrastructure, server maintenance, system upgrades and issue resolution.",
        ],
      },
      {
        title: "Servers, Surveillance & Hardware",
        items: [
          "Support server equipment, network-connected devices and associated infrastructure.",
          "Maintain and troubleshoot UNV video surveillance systems, including cameras, network connectivity and recording equipment.",
          "Install, configure and maintain desktops, laptops, printers and office IT equipment, with routine inspections, updates and preventive maintenance.",
          "Diagnose and resolve hardware failures, operating system issues and peripheral connectivity problems.",
        ],
      },
      {
        title: "Business Systems, Websites & Inventory",
        items: [
          "Administer Odoo and Point of Rental — system configuration, updates, troubleshooting, user support and vendor coordination.",
          "Maintain and develop the company websites — Expert Mobile Communications (expertmobile.ca), Canadian Wireless Supply (cwsupply.ca) and Inrico Canada — including content, product listings, pricing, layouts and e-commerce functionality.",
          "Developed an inventory management and stock-counting system that reconciles physical counts against the main product database and flags discrepancies.",
          "Designed receiving and shelf-placement workflows and inventory transaction tracking for receiving, issuing and stock movements, improving accuracy, accountability and traceability.",
          "Work with external developers and software providers to deliver improvements and resolve website and business-software issues.",
        ],
      },
      {
        title: "End-User Support, IT Security & Operations",
        items: [
          "Provide day-to-day support for computers, operating systems, business applications, email, printers and network connectivity.",
          "Manage user accounts and application access, and escalate complex issues to vendors and specialist support teams.",
          "Support access controls, data-protection practices and the secure handling of company IT equipment and information.",
          "Maintain technical documentation, equipment inventories, configuration details and service records, and apply IT best practices across the business.",
          "Follow company cybersecurity policies and confidentiality standards for customer, pricing and technical information.",
          "Take part in on-call support, emergency service calls, scheduled maintenance and deployments, and travel to customer sites, job sites across Alberta and trade shows as required.",
        ],
      },
    ],
    highlights: [],
    tags: ["PoC Radios", "Inrico · Hytera HyTalk", "Android & ADB", "Network Administration", "Server Room", "UNV Surveillance", "Odoo · Point of Rental", "Web & E-commerce", "Inventory Systems"],
  },
  {
    id: "omnivir",
    logo: "/images/logos/omnivir.png",
    website: "https://omnivir.com/",
    company: "Omnivir",
    title: "Computer Network Technician",
    location: "Vancouver, BC, Canada",
    start: "2025-07",
    end: "2026-04",
    primary: true,
    summary:
      "Installed and maintained LAN/WAN networks, IoT infrastructure and web server systems, with Tier 1–2 troubleshooting across field deployments.",
    highlights: [
      "Installed, configured and maintained LAN/WAN networks, IoT infrastructure and web server systems.",
      "Evaluated and deployed networking hardware, operating systems and enterprise software solutions.",
      "Performed routine network startup/shutdown procedures and maintained system control documentation.",
      "Troubleshot connectivity, server services (including Opera systems) and network performance issues.",
      "Supported remote engineering teams during validation and post-deployment testing.",
      "Provided Tier 1–2 troubleshooting for hardware, network connectivity and operating system issues.",
      "Completed 20+ network-focused Field Nation work orders involving system deployment and infrastructure support.",
    ],
    groups: [
      { title: "Network & infrastructure", items: [
        "Installed, configured and maintained LAN/WAN networks, IoT infrastructure and web server systems.",
        "Evaluated and deployed networking hardware, operating systems and enterprise software solutions.",
        "Performed routine network startup/shutdown procedures and maintained system control documentation.",
        "Troubleshot connectivity, server services (including Opera systems) and network performance issues.",
      ] },
      { title: "Telecom, cabling & telephony", items: [
        "Installed and serviced telecommunications equipment at client sites.",
        "Ran voice and data structured cabling to industry standards.",
        "Installed and serviced telephony systems.",
      ] },
      { title: "Field service & deliverables", items: [
        "Completed 20+ network-focused Field Nation work orders involving system deployment and infrastructure support.",
        "Worked to each work order’s scope, checking in and out with the site contact every day.",
        "Delivered cable test results, digital photos, sign-off checklists and punch lists within 12 hours of completion.",
        "Supported remote engineering teams during validation and post-deployment testing.",
        "Provided Tier 1–2 troubleshooting for hardware, network connectivity and operating system issues.",
      ] },
    ],
    tags: ["LAN/WAN", "IoT", "Web Servers", "Tier 1–2", "Field Nation", "Telephony", "Voice & Data Cabling"],
  },
  {
    id: "great-river",
    logo: "/images/logos/great-river.png",
    website: "https://thegreatriverfinancial.com/",
    company: "Great River Financial Services Inc. — IT Consulting Services",
    title: "IT Technician / Field Engineer (Project)",
    location: "Vancouver, BC, Canada",
    start: "2025-02",
    end: "2026-06",
    primary: true,
    summary:
      "Structured cabling and network deployment across 20+ Wendy’s locations in Greater Vancouver and across BC, in partnership with NCR Voyix.",
    highlights: [
      "Installed, terminated and tested Cat5e and Cat6 cabling following structured cabling standards across 20+ Wendy’s locations.",
      "Mounted and organized network racks, patch panels and cable management systems for new and upgraded sites.",
      "Configured and deployed switches, routers and wireless access points.",
      "Set up and troubleshot POS systems, computers, printers and other network peripherals.",
      "Performed cable testing, certification, labeling and documentation to ensure accurate network records.",
      "Operated punch-down tools, RJ45 crimpers, cable testers, tone generators and certifiers.",
      "Ensured compliance with safety standards (PPE, ladder use, site cleanliness and best practices).",
      "Coordinated with project managers and NCR Voyix local and remote teams to configure routers and switches to professional standards.",
    ],
    groups: [
      { title: "Structured cabling & network rollout (Wendy’s × NCR Voyix)", items: [
        "Installed, terminated and tested Cat5e and Cat6 cabling following structured cabling standards across 20+ Wendy’s locations.",
        "Mounted and organized network racks, patch panels and cable management systems for new and upgraded sites.",
        "Configured and deployed switches, routers and wireless access points.",
        "Performed cable testing, certification, labeling and documentation to ensure accurate network records.",
        "Coordinated with project managers and NCR Voyix local and remote teams to configure routers and switches to professional standards.",
      ] },
      { title: "IT support & systems", items: [
        "Installed, configured and upgraded operating systems, hardware and software components.",
        "Responded to technical support tickets and resolved IT issues remotely and in person.",
        "Set up workstations, peripherals, POS systems, printers and user accounts.",
        "Monitored and maintained computer systems and networks; ran routine backups, updates and system checks.",
        "Completed Lenovo hardware service calls.",
        "Supported employee onboarding and offboarding from an IT perspective.",
      ] },
      { title: "Security, documentation & safety", items: [
        "Implemented cybersecurity best practices and security protocols.",
        "Maintained accurate documentation for system configurations, support logs and technical processes.",
        "Followed IT policies, data-protection and acceptable-use rules.",
        "Operated punch-down tools, RJ45 crimpers, cable testers, tone generators and certifiers safely (PPE, ladder use, site cleanliness).",
      ] },
    ],
    tags: ["Structured Cabling", "Cat5e/Cat6", "Racks & Patch Panels", "Routers & Switches", "Wireless APs", "POS", "Help Desk Tickets", "Lenovo Service"],
  },
  {
    id: "fdu",
    logo: "/images/logos/fdu.png",
    website: "https://www.fdu.edu/",
    company: "Fairleigh Dickinson University",
    title: "Enrollment Services Clerk",
    location: "Vancouver, BC, Canada",
    start: "2023-08",
    end: "2024-12",
    primary: false,
    summary: "Supported enrollment, registration and student records while completing a master’s in Computer Security and Forensic Administration.",
    highlights: [
      "Assisted prospective and current students with enrollment, registration and program inquiries in person and via email/phone.",
      "Maintained accurate student records in the university database in line with institutional data management policies.",
      "Coordinated documentation for admissions, course registration and credential verification.",
    ],
    groups: [
      { title: "Student services", items: [
        "Assisted prospective and current students with enrollment, registration and program inquiries in person, by phone and by email.",
        "Guided students through course registration, add/drop and schedule changes, and explained program requirements and deadlines.",
        "Referred students to the right department — admissions, finance, international student services or academic advising.",
      ] },
      { title: "Records & data management", items: [
        "Maintained accurate student records in the university database in line with institutional data-management and privacy policies.",
        "Processed enrollment forms, transcripts and supporting documents with careful data entry and verification.",
        "Handled confidential student information securely, following privacy and records-retention practices.",
      ] },
      { title: "Administration & coordination", items: [
        "Coordinated documentation for admissions, course registration and credential verification.",
        "Prepared enrollment letters and supported reporting for the enrollment services team.",
        "Supported peak registration periods and orientation, keeping queues moving and inquiries resolved.",
      ] },
    ],
    tags: ["Records Management", "Data Policy", "Student Services", "Confidentiality", "Customer Service"],
  },
  {
    id: "imran-ahmad",
    company: "Imran Ahmad Technical College",
    title: "IT Lecturer",
    location: "Sylhet, Bangladesh",
    start: "2022-07",
    end: "2023-03",
    primary: false,
    summary: "Taught Computer Office Application I & II, Database Management System and Digital Tech Business.",
    highlights: [
      "Designed and delivered lectures, tutorials and learning materials.",
      "Provided academic guidance, monitored progress and assessed assignments, projects and exams.",
      "Participated in academic research and departmental planning; interviewed prospective students.",
    ],
    groups: [
      { title: "Courses taught", items: [
        "Computer Office Application I & II — word processing, spreadsheets, presentations and file management.",
        "Database Management System — relational design, tables and keys, SQL queries and normalization.",
        "Digital Tech Business — digital tools, e-commerce basics and technology in business.",
      ] },
      { title: "Teaching & assessment", items: [
        "Designed and delivered lectures, lab sessions, tutorials and learning materials.",
        "Ran hands-on computer-lab practicals and guided students through exercises step by step.",
        "Set and marked assignments, projects and exams, and tracked student progress.",
        "Provided academic guidance and extra support to students who needed it.",
      ] },
      { title: "Department & lab", items: [
        "Participated in academic research, curriculum planning and departmental meetings.",
        "Helped keep the computer lab working — software installs and basic troubleshooting.",
        "Interviewed prospective students and supported admissions activities.",
      ] },
    ],
    tags: ["Teaching", "Databases", "SQL", "MS Office", "Curriculum", "Lab Support"],
  },
  {
    id: "link3",
    logo: "/images/logos/link3.png",
    website: "https://link3.net/",
    company: "LINK3",
    title: "IT Help Desk",
    location: "Sylhet, Bangladesh",
    start: "2019-06",
    end: "2020-05",
    primary: false,
    summary: "First-level technical support for an internet service provider’s customers.",
    highlights: [
      "Delivered first-level support via phone, email and in person.",
      "Troubleshot and resolved desktop hardware and software issues.",
      "Diagnosed and repaired a range of hardware and software problems.",
    ],
    groups: [
      { title: "Customer support", items: [
        "Delivered first-level technical support to internet customers by phone, email and in person.",
        "Logged, prioritized and tracked support tickets through to resolution.",
        "Explained fixes in plain language and followed up to confirm the issue was resolved.",
      ] },
      { title: "Connectivity troubleshooting", items: [
        "Troubleshot internet connectivity: router/modem setup, Wi-Fi configuration, cabling and IP settings.",
        "Ran basic diagnostics (ping, traceroute, ipconfig) to isolate customer-side versus network-side faults.",
        "Escalated network and line issues to the NOC and field teams with clear technical notes.",
      ] },
      { title: "Desktop & hardware support", items: [
        "Troubleshot and resolved desktop hardware and software issues.",
        "Diagnosed and repaired a range of hardware and software problems, including OS and driver issues.",
        "Documented common problems and solutions to speed up future support.",
      ] },
    ],
    tags: ["Help Desk", "Desktop Support", "ISP", "Troubleshooting", "Ticketing"],
  },
];

// Flat list for places that show a single list (e.g. compact views).
for (const j of experience) if (j.groups && !j.highlights.length) j.highlights = j.groups.flatMap((g) => g.items);

export const education = [
  {
    degree: "Master of Administrative Science",
    field: "Computer Security and Forensic Administration",
    school: "Fairleigh Dickinson University",
    location: "Vancouver, BC",
    logo: "/images/logos/fdu.png",
    website: "https://www.fdu.edu/",
    date: "May 2025",
    gpa: "3.33 / 4.0",
    note: "Degree conferred 1 February 2025 · Teaneck, New Jersey",
    image: "/images/certificates/fdu-mas-diploma-2025.jpg",
  },
  {
    degree: "Bachelor of Science",
    field: "Computer Science and Engineering",
    school: "Metropolitan University",
    location: "Sylhet, Bangladesh",
    logo: "/images/logos/metropolitan.png",
    website: "https://metrouni.edu.bd/",
    date: "May 2019",
    gpa: "3.41 / 4.0",
    note: "B.Sc. Engg. — Grade B+ · School of Science and Technology (provisional certificate, 6 May 2019)",
    image: "/images/certificates/metropolitan-bsc-provisional-2019.jpg",
  },
];

/** Institution is shown as listed on the resume; it is not asserted to be the formal issuing body. */
export type CertificationItem = { name: string; listedWith: string; kind: string; date: string; image: string; document: string; summary?: string; learned?: string[]; instructor?: string; letter?: string; letterLabel?: string };
export const certifications: CertificationItem[] = [
  {
    name: "Cisco Certified Network Associate (CCNA) Routing and Switching",
    listedWith: "Shahjalal University of Science and Technology, Sylhet, Bangladesh",
    kind: "Networking", date: "", image: "", document: "",
    summary: "Cisco CCNA track completed through the Cisco Networking Academy at Shahjalal University of Science and Technology (SUST) — see the three course certificates below.",
    learned: ["Introduction to Networks (Dec 2019)", "Routing and Switching Essentials (Feb 2020)", "Enterprise Networking, Security, and Automation — CCNAv7 (Jan 2021)"],
  },
  {
    name: "CCNAv7: Enterprise Networking, Security, and Automation",
    listedWith: "Cisco Networking Academy — Shahjalal University of Science and Technology",
    kind: "Networking", date: "17 Jan 2021", image: "/images/certificates/ccnav7-ensa-2021.jpg", document: "/docs/certificates/ccnav7-ensa-2021.pdf", letter: "/docs/certificates/ccnav7-ensa-2021-letter.pdf", letterLabel: "Cisco congratulation letter", instructor: "Md. Saiful Islam",
    summary: "Student-level credential for the third CCNAv7 course — enterprise routing, security, WAN and automation.",
    learned: [
      "Configure single-area OSPFv2 in point-to-point and multi-access networks",
      "Mitigate threats and enhance security with ACLs and security best practices",
      "Implement standard IPv4 ACLs to filter traffic and secure administrative access",
      "Configure NAT on the edge router for IPv4 address scalability",
      "Address scalability and secure remote access for WANs",
      "Optimize, monitor and troubleshoot scalable network architectures",
      "How network devices implement QoS; protocols to manage the network",
      "Virtualization, software-defined networking and automation",
    ],
  },
  {
    name: "CCNA Routing and Switching: Routing and Switching Essentials",
    listedWith: "Cisco Networking Academy — Shahjalal University of Science and Technology",
    kind: "Networking", date: "15 Feb 2020", image: "/images/certificates/ccna-rs-rse-2020.jpg", document: "/docs/certificates/ccna-rs-rse-2020.pdf", letter: "/docs/certificates/ccna-rs-rse-2020-letter.pdf", letterLabel: "Cisco congratulation letter", instructor: "Enamul Hassan",
    summary: "Second course of the CCNA Routing and Switching track — how routers forward traffic and how switched networks are built.",
    learned: [
      "Determine how a router forwards traffic from its routing table",
      "Configure initial settings and Ethernet switch ports",
      "Implement VLANs, static routing and RIPv2",
      "Implement DHCP on a router and NAT",
      "Implement ACLs to filter traffic",
      "Use monitoring tools and management protocols to troubleshoot data networks",
    ],
  },
  {
    name: "CCNA Routing and Switching: Introduction to Networks",
    listedWith: "Cisco Networking Academy — Shahjalal University of Science and Technology",
    kind: "Networking", date: "2 Dec 2019", image: "/images/certificates/ccna-rs-itn-2019.jpg", document: "/docs/certificates/ccna-rs-itn-2019.pdf", letter: "/docs/certificates/ccna-rs-itn-2019-letter.pdf", letterLabel: "Cisco congratulation letter", instructor: "Enamul Hassan",
    summary: "First course of the CCNA Routing and Switching track — network fundamentals and building a small business network.",
    learned: [
      "Explain network technologies and how devices access local and remote resources",
      "Describe router hardware and how switching operates in small–medium business networks",
      "Design an IP addressing scheme for a small to medium-sized business network",
      "Configure initial settings on a network device and basic connectivity",
      "Configure monitoring tools for small to medium-sized business networks",
    ],
  },
  {
    name: "Introduction to Cybersecurity (Learnathon 2020)",
    listedWith: "Cisco Networking Academy — Shahjalal University of Science and Technology",
    kind: "Cybersecurity", date: "10 Apr 2020", image: "/images/certificates/intro-to-cybersecurity-2020.jpg", document: "/docs/certificates/intro-to-cybersecurity-2020.pdf", letter: "/docs/certificates/intro-to-cybersecurity-2020-cisco.pdf", letterLabel: "Cisco NetAcad certificate", instructor: "Md Forhad Rabbi",
    summary: "Cisco Networking Academy course completed during Learnathon 2020 at SUST — two certificates: the academy certificate (instructor-signed) and the Cisco Networking Academy certificate.",
    learned: [
      "Global implications of cyber threats and their impact on industries",
      "Ways in which networks are vulnerable to attack",
      "Cisco’s approach to threat detection and defense",
      "Why cybersecurity is a growing profession and the network-security certification path",
    ],
  },
  {
    name: "Web Design and Development",
    listedWith: "Web Design and Development Project — ICT Division Bangladesh",
    kind: "Web", date: "", image: "", document: "",
  },  {
    name: "Class 5 Driver’s Licence",
    listedWith: "Alberta, Canada",
    kind: "Professional", date: "", image: "", document: "",
    summary: "Full Alberta Class 5 driver’s licence — ready for on-site installs, customer visits, service calls and travel to job sites across the province.",
  },

];

export const research = {
  title: "Risk Prediction of Stroke at The Early Stage Using Data Mining Techniques",
  venue: "2nd International Conference on Innovation in Engineering and Technology (ICIET 2019)",
  sponsor: "IEEE-sponsored",
  host: "University of Dhaka",
  year: "2019",
  dateFrom: "Dec 23, 2019",
  dateTo: "Dec 24, 2019",
  duration: "2 days",
  abstract:
    "Stroke is a non-communicable, fatal disease causing an increasing number of deaths in Bangladesh each year. Predicting the risk of developing stroke can help individuals keep their risk factors under control and delay its progress. We prepared a dataset of common stroke risk factors for 635 patients from a direct questionnaire, analysed it with Naïve Bayes, Random Forest, Random Tree and Support Vector Machine classifiers, and evaluated them with 10-fold cross-validation and an 80:20 percentage split. Random Forest proved the most accurate for this dataset (84.16% with cross-validation); we generated the decision tree in Python (Jupyter) and proposed a knowledge-based system prototype that predicts stroke risk and gives essential suggestions.",
  link: "/docs/stroke-risk-prediction-iciet-2019.pdf",
};

export type AwardTier = "gold" | "silver" | "honor" | "participation";
export const awards: { rank: string; event: string; date: string; tier: AwardTier; detail: string; image: string }[] = [
  { rank: "Champion", event: "Software Hackathon — LICT SUST Techfest 2019", date: "19–20 April 2019", tier: "gold", detail: "Team MU-EDU GEN", image: "/images/certificates/sust-techfest-2019-hackathon-champion.jpg" },
  { rank: "Champion", event: "Intra MU Tech Emulation V1 (Project Showcase)", date: "19 July 2018", tier: "gold", detail: "Project: AR Bornoporichoy · MU CSE Society", image: "/images/certificates/mu-tech-emulation-2018-champion.jpg" },
  { rank: "Runner-up", event: "Intra MU Tech Emulation V1 (Project Showcase)", date: "19 July 2018", tier: "silver", detail: "Project: IoT Field · MU CSE Society", image: "/images/certificates/mu-tech-emulation-2018-runner-up.jpg" },
  { rank: "Top 75 Startups", event: "Student to Startup: Chapter-2 — ICT Division Bangladesh (iDEA project)", date: "", tier: "honor", detail: "Startup: Kilagbe.XYZ", image: "/images/certificates/student-to-startup-top75.jpg" },
  { rank: "Participant", event: "NASA Space Apps Challenge 2019", date: "2019", tier: "participation", detail: "Team VR_WEBB · organised by BASIS", image: "/images/certificates/nasa-space-apps-2019.jpg" },
  { rank: "Participant", event: "LICT SUST Techfest 2019", date: "19–20 April 2019", tier: "participation", detail: "Team MU-EDU GEN", image: "/images/certificates/sust-techfest-2019-participation.jpg" },
  { rank: "Participant", event: "EEE Festival 2018 — Shahjalal University of Science & Technology", date: "2 March 2018", tier: "participation", detail: "Department of EEE, SUST", image: "/images/certificates/sust-eee-festival-2018.jpg" },
  { rank: "Participant", event: "Kaizen SUST Project Fair 2017", date: "2017", tier: "participation", detail: "Project: Farming solution", image: "/images/certificates/kaizen-sust-project-fair-2017.jpg" },
  { rank: "Participant", event: "Metropolitan University IT Festival 2015 — Project Exhibition", date: "19–20 Sept 2015", tier: "participation", detail: "Project: Soccer Robot (hardware / software)", image: "/images/certificates/mu-it-festival-2015.jpg" },
  { rank: "Participant", event: "MU Rover Scout Group — 1st Annual Camp 2016", date: "29–31 Jan 2016", tier: "participation", detail: "Senior Rover Mate", image: "/images/certificates/rover-scout-annual-camp-2016.jpg" },
  { rank: "Participant", event: "MU Rover Scout Group — Day Camp 2015", date: "22 May 2015", tier: "participation", detail: "Junior Rover Mate", image: "/images/certificates/rover-scout-day-camp-2015.jpg" },
  { rank: "Completed", event: "Microcontroller & Robotics Course (32 hours)", date: "Summer 2015", tier: "participation", detail: "Department of EEE, Metropolitan University, Sylhet", image: "/images/certificates/microcontroller-robotics-2015.jpg" },
  { rank: "Grade A", event: "Advance Certificate in Computer Application", date: "Apr – Oct 2014", tier: "participation", detail: "National Youth Development Training Center (NYDTC), Dhaka", image: "/images/certificates/nydtc-computer-application-2014.jpg" },
  { rank: "Trained", event: "Basic Training: Call Center Agent — National Help Desk 16666", date: "", tier: "participation", detail: "ICT Division, Bangladesh", image: "/images/certificates/ict-division-call-center-training.jpg" },
  { rank: "Completed", event: "Career Development Workshop", date: "Mar 2019 – Mar 2020", tier: "participation", detail: "Nitol-Niloy (Niloy Motors Ltd.)", image: "/images/certificates/career-development-workshop.jpg" },
  { rank: "Appreciation", event: "C.V. Writing & Interview Skill Workshop", date: "5 Nov 2016", tier: "participation", detail: "SUST Career Club · facilitated by Corporate Ask", image: "/images/certificates/cv-writing-interview-skill-2016.jpg" },
];

export const aboutSummary =
  "I’m a Computer Science and Engineering graduate with a Master of Administrative Science in Computer Security and Forensic Administration, working as Lead IT Support & Network Administrator at Expert Mobile Communications in Grande Prairie, Alberta.\n\nMy work sits where three disciplines meet. On the network and infrastructure side, I handle IT support, network administration and installation, structured cabling, server and infrastructure maintenance, device provisioning and hands-on troubleshooting. In telecommunications, I deploy and support Push-to-Talk over Cellular and DMR radio fleets — programming Inrico and Hytera radios, configuring dispatch platforms and talk groups, and leading a custom IRC380 firmware project for the Canadian market. And as a web programmer, I build company websites, admin dashboards, inventory and backup tooling with HTML, CSS, JavaScript, Python/Django, PHP/CodeIgniter and MySQL/PostgreSQL.\n\nI’m continuing to grow in networking and cybersecurity — bringing the security mindset from my master’s into every network, radio fleet and web application I build.";

export const careerObjectives = [
  "Deepen hands-on network engineering — routing, switching and secure network design in production environments.",
  "Build toward a network security specialization, applying my academic grounding in computer security and forensic administration.",
  "Develop practical security monitoring and incident-response skills through documented home-lab work.",
  "Keep sharing what I learn through technical write-ups and case studies on this site.",
];

export function formatMonth(ym: string | null) {
  if (!ym) return "Present";
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
