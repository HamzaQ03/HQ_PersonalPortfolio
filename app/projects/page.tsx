'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

type Status  = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
type TabKey  = 'PERSONAL' | 'PROFESSIONAL' | 'EDUCATION'

interface Project {
  caseNum:     string
  title:       string
  subtitle:    string
  description: string
  tags:        string[]
  status:      Status
}

/* ─────────────────────────────────────────────────────────────
   Data — case numbers are GLOBAL sequential 001-029 across tabs
───────────────────────────────────────────────────────────── */

const PROJECTS: Record<TabKey, Project[]> = {
  PERSONAL: [
    {
      caseNum:     '001',
      title:       'Hamza Qureshi Portfolio v3',
      subtitle:    'NEXT.JS · 2026',
      description: 'I designed and engineered this portfolio end to end on Next.js 14 using the App Router and TypeScript, structuring the codebase around server and client component boundaries to optimize rendering and minimize hydration cost. I integrated Supabase as the backend, leveraging its PostgreSQL database, Row Level Security policies, and Auth APIs to power a mentor review and feedback system where authenticated users can submit, view, and respond to portfolio critiques. I embedded an AI assistant powered by the Google Gemini API, grounded in a custom curated knowledge base that I authored, structured, and tuned to deliver contextual answers about my background, federal cybersecurity workflows, and compliance frameworks. I built the interaction layer with Framer Motion for declarative animations, used React Portals for modal isolation, and styled the application with Tailwind CSS following a strict design system I locked in across colors, typography, and spacing. The entire project is deployed on Vercel with continuous integration from GitHub, automatic preview deployments on every pull request, and edge optimized routing for global performance.',
      tags:        ['Next.js', 'TypeScript', 'Supabase', 'Gemini API', 'Framer Motion'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '002',
      title:       'Federal Cyber AI Knowledge Base',
      subtitle:    'AI ASSISTANT · 2025',
      description: 'I authored a 38KB structured knowledge corpus covering the full Risk Management Framework lifecycle per NIST SP 800-37 Rev. 2, the FedRAMP Low/Moderate/High baseline distinctions, the CMMC Level 1 and Level 2 practice sets aligned to NIST SP 800-171, and the core federal A&A artifacts including SSPs, SARs, RARs, PTAs, PIAs, BIAs, and POA&Ms. I structured the corpus with consistent headings, semantic tagging, and cross references so the AI assistant could retrieve and synthesize information across topics without hallucination. I integrated the knowledge base with the portfolio Gemini powered chatbot by engineering custom system prompts that anchor responses to the corpus, applying retrieval logic to surface the most relevant sections per query, and tuning response formatting for technical accuracy and readability. The result is a queryable conversational interface that answers federal cybersecurity questions with the same depth and precision I would deliver in a client engagement, while demonstrating practical application of AI augmentation to compliance education.',
      tags:        ['AI', 'Prompt Engineering', 'Knowledge Base', 'Gemini API'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '003',
      title:       'NIST 800-53 Control Crosswalk Tool',
      subtitle:    'PYTHON CLI · 2026',
      description: 'I am building a Python command line tool that ingests the NIST SP 800-53 Rev. 5 control catalog and generates crosswalk mappings between the full control set and the FedRAMP Low, Moderate, and High baselines, producing reports in JSON, CSV, and XLSX formats for direct ingestion into downstream GRC platforms. I structured the CLI using the Click framework to expose subcommands for catalog parsing, baseline filtering, control family lookup, and export, with argument validation and contextual help for each operation. I designed the data model around NIST OSCAL (Open Security Controls Assessment Language) schema so the tool can consume the official OSCAL JSON catalog without manual transformation, ensuring compatibility with federal automation standards. The export layer uses openpyxl to produce formatted Excel workbooks with control family grouping, baseline membership flags, and inheritance designation columns, making the output immediately usable by A&A analysts building Control Implementation Summaries or POA&M trackers without additional processing.',
      tags:        ['Python', 'Click', 'OSCAL', 'NIST 800-53', 'FedRAMP'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '004',
      title:       'Home Cybersecurity Lab Environment',
      subtitle:    'HOMELAB · 2026',
      description: 'I am building a self hosted cybersecurity lab on Proxmox VE to run a virtualized enterprise environment for hands on red and blue team practice. I am deploying pfSense as the network firewall and router with segmented VLANs separating attacker, defender, and victim subnets, configured to mirror realistic enterprise network architecture. I am standing up Wazuh as the centralized SIEM and XDR platform to collect logs across the environment, deploying agents on Windows and Linux endpoints, and tuning detection rules aligned to the MITRE ATT&CK framework. I am running intentionally vulnerable VMs including Metasploitable, DVWA, and various HackTheBox style targets to practice exploitation, lateral movement, persistence, and exfiltration techniques on the red side, while simultaneously practicing detection, threat hunting, and incident response on the blue side. The lab gives me a controlled environment to validate the security concepts I work with in my GRC role and to maintain hands on technical depth alongside compliance expertise.',
      tags:        ['Proxmox', 'pfSense', 'Wazuh', 'Kali Linux'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '005',
      title:       'CTF Writeups & Walkthroughs',
      subtitle:    'CONTENT · ONGOING',
      description: 'I maintain a personal collection of Capture-the-Flag challenge writeups documenting my solutions across HackTheBox, TryHackMe, and PicoCTF challenges, focusing on web exploitation, digital forensics, OSINT, and binary analysis. Each writeup walks through my reconnaissance approach, the tools I used, the vulnerabilities I identified, the exploitation steps I executed, and the lessons learned, formatted as both technical reference for myself and educational content for others learning the same disciplines. The collection serves as ongoing proof of hands on offensive security practice and forces me to articulate my technical reasoning clearly, which translates directly into my professional work where documenting evidence and findings is core to A&A and audit deliverables.',
      tags:        ['HackTheBox', 'TryHackMe', 'OSINT', 'Forensics'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '006',
      title:       'DigithroneX — Co-Founder & Program Manager',
      subtitle:    'STARTUP · 2020-2023',
      description: 'I co-founded DigithroneX, a digital transformation startup that delivered custom software development, web and application engineering, UI/UX design, and technology consulting services to clients across multiple countries and industries. I served as Program Manager, directing cross functional teams of developers, designers, and consultants through the full project lifecycle including discovery, scoping, planning, execution, quality assurance, and delivery. I owned client relationships end to end, leading initial sales conversations, scoping engagements, drafting statements of work, managing client communication throughout delivery, and conducting post delivery retrospectives that drove a 95%+ client satisfaction rate across the portfolio. I developed risk assessment and quality assurance procedures that identified security and delivery risks early in project lifecycles, embedding vulnerability review checkpoints into the SDLC, defining acceptance criteria upfront, and producing structured handoff documentation that gave clients confidence in long term maintainability. The experience taught me how to translate business requirements into technical delivery, manage ambiguity across distributed teams and time zones, and apply project management discipline at scale, all of which I now apply directly to federal cybersecurity program work.',
      tags:        ['Program Mgmt', 'SDLC', 'Client Delivery', 'Risk Assessment'],
      status:      'ARCHIVED',
    },
  ],

  PROFESSIONAL: [
    {
      caseNum:     '007',
      title:       'FedRAMP High CIS Assessment Workbook',
      subtitle:    'HRTec FEDHIVE · 2024-2025',
      description: 'I architected and built a 19-sheet Excel workbook from scratch that serves as a complete FedRAMP High Control Implementation Summary (CIS) assessment instrument, covering 346 control questions mapped to the full NIST SP 800-53 Rev. 5 High baseline across SaaS, PaaS, and hybrid deployment models. I authored plain language interpretations for every control to make the assessment accessible to CSPs, federal customer agencies, and 3PAOs without sacrificing technical accuracy, and I built supporting tabs including System Inventory, Ports/Protocols/Services, Cryptographic Modules, SBOM intake, Significant Change Request, Security Impact Analysis, External Systems and Services, and Authorized Users registers to consolidate fragmented FedRAMP documentation into a single integrated instrument. I engineered the entire VBA automation layer myself, writing every line of code to drive cascading dropdowns, cross sheet navigation logic, conditional formatting that color codes implementation status, real time progress tracking, and an embedded AI powered chatbot module that provides contextual control guidance directly inside the workbook. I performed multi cloud control inheritance mapping across AWS, GCP, and Azure FedRAMP authorized service offerings, defining CSP side, customer side, and shared responsibility designations per the FedRAMP shared responsibility model to clarify control ownership across hybrid deployments, and I aligned the workbook to support FedRAMP High, FedRAMP Moderate, and DoD IL4 baseline references for cross framework usability.',
      tags:        ['VBA', 'Excel Engineering', 'FedRAMP High', 'NIST 800-53'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '008',
      title:       'Multi-Cloud Control Inheritance Map (AWS / GCP / Azure)',
      subtitle:    'HRTec FEDHIVE · 2024-2025',
      description: 'I built a comprehensive multi cloud control inheritance reference covering the FedRAMP authorized service offerings of Amazon Web Services, Google Cloud Platform, and Microsoft Azure, designating each NIST SP 800-53 Rev. 5 control as CSP side, customer side, hybrid, or shared per the FedRAMP shared responsibility model. I researched the published Customer Responsibility Matrices from each cloud provider, mapped them against the FedRAMP High baseline control set, and reconciled inconsistencies between provider documentation and federal expectations. I scoped the mapping across SaaS, PaaS, and IaaS deployment patterns to clarify how inheritance shifts based on the service model selected, which gave federal tenants on FedHIVE clear visibility into which controls they were responsible for implementing versus which were inherited from the underlying cloud platform. The artifact directly informed control inheritance language in the CIS workbook and provided FedHIVE compliance team with a defensible reference for shared responsibility discussions during customer onboarding and 3PAO assessments.',
      tags:        ['AWS', 'GCP', 'Azure', 'CRM', 'Shared Responsibility'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '009',
      title:       'CMMC Level 2 Program (Greenfield Build)',
      subtitle:    'HRTec FEDHIVE · 2024-2025',
      description: 'I partnered with FedHIVE compliance team to stand up the company Cybersecurity Maturity Model Certification (CMMC) Level 2 program from initiation, working a greenfield instance with no preexisting framework in place. I executed gap analysis against all 110 required practices defined under NIST SP 800-171, identifying control implementation gaps across access control, audit and accountability, configuration management, identification and authentication, incident response, system and communications protection, and the remaining practice families. I scoped the Controlled Unclassified Information (CUI) boundary by tracing CUI data flows through FedHIVE systems, identifying ingress and egress points, and documenting handling procedures consistent with DFARS 252.204-7012 requirements. I integrated CMMC requirements into the existing FedRAMP and DoD IL4 compliance workflows to avoid duplicative control implementation effort, leveraging control overlap to maximize reuse of existing evidence. I supported self assessment and mock assessment cycles to validate program readiness, identifying residual gaps and supporting remediation planning to prepare FedHIVE for future C3PAO certification.',
      tags:        ['CMMC L2', 'NIST 800-171', 'DFARS', 'CUI Scoping'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '010',
      title:       'RegScale GRC Platform Operationalization',
      subtitle:    'HRTec FEDHIVE · 2024-2025',
      description: 'I operationalized FedHIVE RegScale GRC platform as the centralized system of record for documenting, tracking, and assessing security controls across multiple compliance frameworks including FedRAMP, CMMC, and DoD IL4. I configured the platform to ingest control catalogs, mapped assessment workflows to internal review processes, and built standardized dashboards that surface control implementation status, evidence freshness, POA&M aging, and continuous monitoring metrics in real time. I designed reporting templates that produce audit ready outputs for internal stakeholders and external assessors, reducing the time required to assemble compliance artifacts during assessments. The platform now serves as the authoritative source of compliance state for the FedHIVE environment, replacing fragmented spreadsheet based tracking with a unified, queryable system that improves audit efficiency and control visibility across the organization.',
      tags:        ['RegScale', 'GRC Tooling', 'Dashboards', 'ConMon'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '011',
      title:       'NIH RMF Lifecycle Execution & ATO Package Development',
      subtitle:    'NIH · TRIPLE POINT SECURITY · 2025-PRESENT',
      description: 'I am executing the full seven step Risk Management Framework lifecycle per NIST SP 800-37 Rev. 2 for mission critical NIH information systems, performing system preparation, security categorization per FIPS 199 with information type mapping from NIST SP 800-60, control selection and tailoring against the NIST SP 800-53 Rev. 5 baseline with FIPS 200 minimum requirements, control implementation support across system specific, hybrid, and common controls, security control assessment per NIST SP 800-53A, authorization, and ongoing monitoring. I support the development of complete ATO packages including System Security Plans, Security Assessment Reports, Risk Assessment Reports, Privacy Threshold Analyses, Privacy Impact Assessments, Business Impact Analyses, and Plans of Action and Milestones, working with System Owners, ISSOs, and Authorizing Officials to drive timely Authorization to Operate decisions across FISMA reportable systems.',
      tags:        ['RMF', 'NIST 800-37 Rev. 2', 'ATO Packages', 'FISMA'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '012',
      title:       'NIH ISCM Strategy & Ongoing Authorization Transition',
      subtitle:    'NIH · 2025-PRESENT',
      description: 'I co-led the development and enterprise rollout of NIH Information Security Continuous Monitoring Plan and Strategy under NIST SP 800-137, establishing a standardized framework for ongoing authorization across the agency FISMA reportable system inventory. I defined ISCM control families, assessment frequencies, evidence collection cadences, and reporting schedules to ensure critical security controls are evaluated on a rolling basis rather than relying on point in time triennial assessments. I built Security Impact Analysis processes for system changes, defining the criteria for when a change triggers reassessment, the workflow for documenting impact decisions, and the integration with the broader change management process so that security implications are evaluated before deployment. I partnered with System Owners, ISSOs, and the OCIO to integrate ISCM outputs into executive level cyber risk dashboards, delivering near real time visibility into control effectiveness, vulnerability posture, and POA&M status. The strategy positioned NIH to transition from triennial reauthorization cycles to an Ongoing Authorization model, reducing reauthorization burden and strengthening real time risk visibility across the enterprise.',
      tags:        ['NIST 800-137', 'ISCM', 'OA', 'SIA', 'FISMA'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '013',
      title:       'NIH JCAM GRC Tool Rollout',
      subtitle:    'NIH · 2025-PRESENT',
      description: 'I am managing the end to end implementation, User Acceptance Testing, and agency wide deployment of NIH Joint Cybersecurity Assessment & Management (JCAM) GRC platform, which serves as the central system of record for the agency A&A workflows, control assessments, POA&M tracking, and FISMA reporting. I translated NIST RMF workflows into JCAM configurations, including control catalog setup against NIST SP 800-53 Rev. 5, assessment template design, POA&M workflow automation, and ATO package generation logic to ensure the platform mirrors NIH operational reality across system owners and ISSOs. I coordinated UAT cycles by designing test scenarios that exercised each major workflow, recruiting end user testers from across NIH information systems community, tracking defects through resolution, and validating go/no go criteria for production release. I built enterprise reporting templates that consolidate FISMA metrics, control assessment status, and POA&M aging data into standardized dashboards consumed by NIH leadership, eliminating the manual artifact preparation effort that previously consumed significant analyst time and accelerating the agency compliance reporting cycles.',
      tags:        ['JCAM', 'GRC Implementation', 'UAT', 'POA&M Automation'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '014',
      title:       'NIH IT Modernization Project (Assistant PM)',
      subtitle:    'NIH · HHS EPLC · 2025-PRESENT',
      description: 'I am serving as Assistant Project Manager on NIH IT Modernization Project, applying the HHS Enterprise Performance Life Cycle (EPLC) framework to manage cybersecurity deliverables across the modernization roadmap. I coordinate stakeholder engagement across system owners, ISSOs, technical teams, and agency leadership, drive RACI based role and responsibility mapping to clarify accountability across workstreams, maintain a risk register tracking project level and security level risks with treatment strategies, and report milestone progress on a recurring cadence to ensure on time delivery of cybersecurity and modernization objectives. I facilitate kickoff meetings, requirements gathering sessions, and stage gate reviews aligned to the EPLC lifecycle, applying the same project management discipline I developed leading software delivery at my startup to the federal IT modernization context.',
      tags:        ['EPLC', 'Project Management', 'RACI', 'IT Modernization'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '015',
      title:       'Baker Tilly: NIST CSF 2.0 Client Audits',
      subtitle:    'BAKER TILLY · SUMMER 2024',
      description: 'I supported internal cybersecurity audits across multiple client engagements at Baker Tilly using the NIST Cybersecurity Framework 2.0, assessing maturity across the Govern, Identify, Protect, Detect, Respond, and Recover functions to evaluate client security posture and strengthen audit readiness. I participated in client interviews with control owners across access management, network security, incident response, and governance, reviewed policy and procedure documentation to assess design effectiveness, evaluated technical implementation evidence to confirm operating effectiveness, and identified control gaps requiring remediation. I documented findings against the CSF subcategory level, mapped findings back to client regulatory obligations, and supported senior advisors in drafting remediation roadmaps that prioritized gaps by risk impact and effort to close.',
      tags:        ['NIST CSF 2.0', 'Audit', 'Risk Advisory', 'Maturity Assessment'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '016',
      title:       'Baker Tilly: CUI Data Flow Mapping for DIB Clients',
      subtitle:    'BAKER TILLY · SUMMER 2024',
      description: 'I mapped Controlled Unclassified Information data flows across departments for Defense Industrial Base clients in support of Cybersecurity Maturity Model Certification readiness, tracing CUI from ingress through processing, storage, transmission, and eventual disposition. I developed visual data flow diagrams identifying every system, network segment, and human handler that touched CUI, documented handling procedures aligned to NIST SP 800-171 requirements, and produced scoping recommendations that clarified the CUI boundary for clients pursuing CMMC Level 2 certification. The mapping work directly informed clients System Security Plans and gave assessors a defensible articulation of which systems were in scope for CMMC assessment versus excluded from the certification boundary.',
      tags:        ['CUI Mapping', 'CMMC', 'DIB', 'NIST 800-171'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '017',
      title:       'Baker Tilly: IT SOX 404 Compliance Testing',
      subtitle:    'BAKER TILLY · SUMMER 2024',
      description: 'I assisted IT Sarbanes-Oxley 404 compliance engagements at Baker Tilly by supporting test of design and test of operating effectiveness procedures across IT General Controls covering access management and change management. I participated in process walkthroughs with client control owners to understand how controls were implemented in practice, gathered evidence including access provisioning records, change tickets, approval workflows, and segregation of duties matrices, supported sample selection from control populations following audit methodology, and documented test of design analyses confirming whether controls were designed appropriately to mitigate financial reporting risk. I helped identify control gaps where evidence was insufficient or design was deficient, contributing to remediation recommendations that strengthened client audit readiness.',
      tags:        ['SOX 404', 'ITGCs', 'Audit', 'Test of Design'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '018',
      title:       'Baker Tilly: AI Risk Advisory for Higher Education',
      subtitle:    'BAKER TILLY · SUMMER 2024',
      description: 'I contributed to AI risk advisory engagements at Baker Tilly for higher education clients, gathering and reviewing AI implementation practices against emerging guidance including the NIST AI Risk Management Framework (AI RMF) and FERPA requirements. I researched the client AI use cases, evaluated governance structures around AI deployment, assessed data privacy implications for student information processed through AI systems, and identified risks across the AI lifecycle including data sourcing, model training, deployment, monitoring, and decommissioning. I supported senior advisors in delivering recommendations that matured client AI governance, established AI risk management programs, and aligned AI practices with both federal guidance and the regulatory expectations specific to higher education institutions.',
      tags:        ['NIST AI RMF', 'AI Governance', 'FERPA', 'Higher Ed'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '019',
      title:       'NIH Par-4 Tumor Suppressor Research Publication',
      subtitle:    'NATIONAL INSTITUTES OF HEALTH · 2020-2021',
      description: 'I contributed to peer reviewed cancer research at the National Institutes of Health during a research internship, co-authoring a publication on the Par-4 tumor suppressor protein and its role in apoptotic signaling pathways relevant to cancer therapeutics. I supported the research team by participating in experimental design discussions, contributing to data collection and analysis workflows, reviewing scientific literature to contextualize findings within the broader cancer biology field, and supporting manuscript preparation through editing, citation management, and figure preparation. The experience taught me how to operate in a federally funded research environment, navigate institutional review and publication processes, and apply rigorous documentation standards that translated directly into the federal cybersecurity work I do today, where the same precision around evidence, methodology, and reproducibility underpins A&A artifacts and control assessments.',
      tags:        ['NIH', 'Research', 'Co-Author', 'Cancer Biology'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '020',
      title:       'HRTec Federal Proposal Capture & Compliance Matrix Development',
      subtitle:    'HRTec · 2023-2024',
      description: 'I supported federal proposal development and capture activities at HRTec by reviewing RFPs and RFIs from civilian and defense agencies, developing compliance matrices that mapped HRTec capabilities against solicitation requirements, compiling past performance documentation, and coordinating proposal formatting and submission processes. I conducted market research and competitive analysis across the federal cybersecurity and GRC consulting landscape, tracked contract opportunities through SAM.gov and industry databases, and supported strategic go/no-go decisions on pursuit opportunities. I coordinated proposal kickoff meetings aligning technical writers, subject matter experts, and pricing teams to meet tight submission deadlines, while developing technical marketing content including blog posts, case studies, and thought leadership articles focused on CMMC, FedRAMP, and NIST that strengthened HRTec digital presence and inbound lead generation.',
      tags:        ['Federal Proposals', 'Capture Mgmt', 'RFP/RFI', 'Compliance Matrix'],
      status:      'COMPLETED',
    },
  ],

  EDUCATION: [
    {
      caseNum:     '021',
      title:       'Virginia Tech Cybersecurity Capstone',
      subtitle:    'PAMPLIN · BIT 4554 · SPRING 2025',
      description: 'I completed my senior cybersecurity capstone in Virginia Tech Pamplin College of Business as the culminating project of the BIT Cybersecurity Management & Analytics concentration, executing an end to end cybersecurity risk assessment for a simulated financial services firm. I scoped the engagement by defining the organizational context, system boundaries, critical assets, and regulatory environment, then performed a structured risk assessment that identified threats, vulnerabilities, and impact across the firm information systems. I mapped findings against the NIST Cybersecurity Framework to organize control gaps by function (Identify, Protect, Detect, Respond, Recover) and prioritized remediation based on likelihood and business impact. I authored a complete incident response playbook covering preparation, detection and analysis, containment, eradication, recovery, and post incident lessons learned, and built a risk register documenting each identified risk with owner, severity rating, treatment strategy, and target remediation date. The capstone synthesized coursework across risk management, controls testing, audit methodology, and compliance frameworks into a single deliverable that mirrored the structure of a real consulting engagement.',
      tags:        ['NIST CSF', 'Risk Assessment', 'IR Playbook', 'BIT 4554'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '022',
      title:       'Information Security Audit Simulation',
      subtitle:    'VIRGINIA TECH · BIT 4434 · FALL 2024',
      description: 'I performed a full IT security audit on a simulated enterprise environment as part of Virginia Tech BIT 4434 coursework, identifying vulnerabilities across the organization technology stack and mapping each finding to ISO 27001 control requirements. I conducted asset inventory and scoping to define the audit boundary, executed vulnerability assessment workflows to identify technical weaknesses, reviewed policy and procedure documentation to assess governance maturity, and evaluated implementation evidence to confirm whether stated controls were operating as designed. I authored an audit report documenting each finding with risk rating, control reference, root cause analysis, and remediation recommendation, then presented findings to a mock C-suite audience including the CEO, CIO, and CFO, defending recommendations under questioning and translating technical risk into business impact language.',
      tags:        ['ISO 27001', 'Audit', 'Vulnerability Mgmt', 'BIT 4434'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '023',
      title:       'Business Intelligence Risk Dashboard',
      subtitle:    'VIRGINIA TECH · BIT 4514 · SPRING 2024',
      description: 'I designed and built a Tableau powered business intelligence dashboard for risk analytics as part of Virginia Tech BIT 4514 coursework, integrating threat intelligence feeds and Key Risk Indicator (KRI) monitoring for a fictional financial institution. I architected the data model to ingest multiple data sources including threat feeds, vulnerability scan output, incident logs, and control assessment results, then designed visualization layers that surfaced executive level risk posture alongside drill down detail for security analysts. I built calculated fields for risk scoring, threshold based alerting on KRI deviations, and trend analysis comparing posture over time, and styled the dashboard for a financial services executive audience with clear color coding, threshold annotations, and contextual narratives explaining each chart. The project demonstrated how analytics platforms can translate raw security telemetry into business decision support, a translation skill I now apply when building ConMon and FISMA reporting dashboards in my professional work.',
      tags:        ['Tableau', 'KRIs', 'Risk Analytics', 'BIT 4514'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '024',
      title:       'NIST CFReDS Hacking Case (Digital Forensics)',
      subtitle:    'VIRGINIA CYBER RANGE · 2023-2025',
      description: 'I completed a full digital and memory forensics investigation on the NIST Computer Forensic Reference Data Set (CFReDS) Hacking Case, a synthetic but realistic dataset published by NIST for forensic skill development. I used Sleuth Kit for file system analysis to enumerate partitions, extract deleted files via file carving, and reconstruct file system timelines from the Master File Table (MFT). I performed memory analysis with Volatility to extract running processes, network connections, registry hives, and command history from memory captures, identifying indicators of compromise that were not visible from disk analysis alone. I used RegRipper to parse Windows registry artifacts including user activity, USB device history, and recently accessed files, and applied HxD and Bless for hex level inspection of suspicious binaries and embedded data. I executed steganography detection workflows to identify and extract hidden payloads within image files, documenting each finding with chain of custody style notes that mirror federal forensic reporting expectations.',
      tags:        ['Sleuth Kit', 'Volatility', 'RegRipper', 'NIST CFReDS'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '025',
      title:       'Penetration Testing & Network Defense Labs',
      subtitle:    'VIRGINIA CYBER RANGE · 2023-2025',
      description: 'I completed extensive hands on penetration testing and network defense training across the Virginia Cyber Range platform, working through structured lab environments designed to mirror real world enterprise networks. I executed reconnaissance and enumeration workflows using Nmap for port scanning and service identification, performed vulnerability scanning to map attack surfaces, and exploited identified weaknesses using Metasploit and manual exploit chains in Kali Linux. On the defensive side I configured firewall rules, analyzed packet captures with Wireshark to identify malicious traffic patterns, built detection logic for indicators of compromise, and applied NIST cybersecurity methodology to develop remediation strategies aligned with federal cybersecurity standards. The labs strengthened my ability to think from both attacker and defender perspectives, which directly informs how I assess security controls in my A&A work today.',
      tags:        ['Kali Linux', 'Metasploit', 'Nmap', 'Wireshark'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '026',
      title:       'Red Team vs. Blue Team Attack/Defense Exercises',
      subtitle:    'VIRGINIA CYBER RANGE · 2023-2025',
      description: 'I participated in live red team versus blue team attack/defense exercises through the Virginia Cyber Range, working both offensive and defensive roles across multiple semesters. On red team rotations I executed reconnaissance, gained initial access through phishing simulations and exploit deployment, established persistence on compromised hosts, and moved laterally through the simulated network to reach target systems. On blue team rotations I monitored network traffic for indicators of compromise, analyzed log data to detect intrusion attempts, hardened systems against known attack patterns, and coordinated incident response actions including containment, eradication, and recovery. The exercises forced rapid context switching between offensive and defensive thinking and reinforced how detection engineering, hardening, and incident response actually function under live adversary pressure.',
      tags:        ['Red Team', 'Blue Team', 'Incident Response', 'Threat Hunting'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '027',
      title:       'CTF Competitions with CyberVT',
      subtitle:    'VIRGINIA TECH · 2023-2025',
      description: 'I competed in Capture-the-Flag competitions and attack/defense exercises through CyberVT, Virginia Tech premier cybersecurity student organization, working challenges that spanned the major offensive security disciplines across multiple semesters. I reverse engineered binaries using Ghidra and IDA to identify vulnerable functions, understand custom protocols, and recover obfuscated logic. I exploited binary vulnerabilities using gdb for live debugging and pwntools for scripted exploit development, working through buffer overflows, format string vulnerabilities, and return oriented programming challenges. I performed web application penetration testing using Burp Suite for request interception and modification, sqlmap for SQL injection automation, and manual payload crafting for XSS, CSRF, and authentication bypass scenarios. I solved cryptography challenges that ranged from classical cipher analysis to modern weaknesses in RSA, AES modes, and hash collisions. Each competition reinforced both individual technical depth and team collaboration under time pressure, since most CTFs require rapid context switching across disciplines while coordinating findings with teammates working parallel tracks.',
      tags:        ['Ghidra', 'pwntools', 'Burp Suite', 'Cryptography'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '028',
      title:       'CyberVT Technical Training Program',
      subtitle:    'VIRGINIA TECH · 2023-2025',
      description: 'I participated in bi-weekly technical training sessions through CyberVT covering offensive and defensive cybersecurity concepts across the major security disciplines. The training program covered reverse engineering fundamentals using disassemblers and debuggers, binary exploitation techniques including stack and heap based vulnerabilities, web application penetration testing methodology following the OWASP Top 10, applied cryptography including classical ciphers, symmetric and asymmetric encryption, and hash function analysis, network protocol analysis, and digital forensics across disk, memory, and network artifacts. The program complemented my academic coursework by adding depth in areas that the BIT curriculum touched but did not exhaust, and built the offensive security foundation that informs how I think about adversary behavior when assessing defensive controls.',
      tags:        ['Reverse Engineering', 'Binary Exploitation', 'OWASP', 'Cryptography'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '029',
      title:       'Commonwealth Cyber Initiative Industry Workshops',
      subtitle:    'VIRGINIA TECH · 2023-2025',
      description: 'I engaged in industry led workshops and networking events through the Commonwealth Cyber Initiative, Virginia federally backed cyber research and workforce program connecting universities, industry partners, and government agencies. I attended technical sessions covering ransomware response methodologies, incident handling workflows, emerging cyber threats including supply chain attacks and AI driven adversary tooling, and federal partner briefings on cybersecurity priorities and workforce needs. The exposure to working cybersecurity professionals, federal agency representatives, and Virginia Tech faculty researchers gave me visibility into how the academic, industry, and government layers of the cybersecurity ecosystem interconnect, and informed the federal cybersecurity career path I now operate in professionally.',
      tags:        ['CCI', 'Federal Partnerships', 'Incident Handling', 'Ransomware'],
      status:      'COMPLETED',
    },
  ],
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PERSONAL',     label: '▸ PERSONAL'     },
  { key: 'PROFESSIONAL', label: '▸ PROFESSIONAL'  },
  { key: 'EDUCATION',    label: '▸ EDUCATION'     },
]

/* ─────────────────────────────────────────────────────────────
   Status colour map
───────────────────────────────────────────────────────────── */

const STATUS_COLOR: Record<Status, string> = {
  ACTIVE:    '#22c55e',
  COMPLETED: '#c8a87c',
  ARCHIVED:  '#6b6660',
}

/* ─────────────────────────────────────────────────────────────
   Component-scoped CSS
───────────────────────────────────────────────────────────── */

const PAGE_STYLES = `
  .proj-card {
    background:    #0a0a0a;
    border:        2px solid #c8a87c;
    border-radius: 10px;
    padding:       22px;
    position:      relative;
    overflow:      hidden;
    transition:    all 350ms cubic-bezier(0.16, 1, 0.3, 1);
    cursor:        pointer;
    display:       flex;
    flex-direction: column;
    height:        330px;
  }
  .proj-card:hover {
    border-color: #c8a87c;
    background:   #14100c;
    box-shadow:   0 0 28px rgba(200,168,124,0.35),
                  0 12px 30px rgba(0,0,0,0.6),
                  inset 0 0 30px rgba(200,168,124,0.04);
    transform:    translateY(-6px);
  }
  .proj-view {
    color:       #c8a87c;
    font-family: monospace;
    font-size:   9px;
    letter-spacing: 1.5px;
    transition:  color 200ms ease;
  }
  .proj-card:hover .proj-view { color: #ffffff; }
  .proj-expand-btn {
    align-self: flex-start;
    background: rgba(200,168,124,0.08);
    border: 1px solid rgba(200,168,124,0.3);
    color: #c8a87c;
    font-family: monospace;
    font-size: 9px;
    letter-spacing: 1.5px;
    padding: 4px 10px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 200ms ease;
    margin-bottom: 10px;
  }
  .proj-expand-btn:hover {
    background: rgba(200,168,124,0.15);
    border-color: #c8a87c;
    color: #ffffff;
  }

  @media (max-width: 700px) {
    .proj-grid { grid-template-columns: 1fr !important; }
    .proj-tabs { flex-direction: column !important; }
    .proj-card { padding: 16px !important; height: auto !important; min-height: 330px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   Project Card
───────────────────────────────────────────────────────────── */

function ProjectCard({
  project, tabKey, onExpand,
}: {
  project: Project; tabKey: TabKey; onExpand: () => void
}) {
  return (
    <div
      className="proj-card"
      onClick={() => { playClickSound(); onExpand() }}
    >
      {/* Case stamp — top right */}
      <div style={{
        position:      'absolute',
        top:           12,
        right:         12,
        fontFamily:    'monospace',
        fontSize:      9,
        color:         '#c8a87c',
        letterSpacing: 2,
        padding:       '3px 8px',
        border:        '1px solid rgba(200,168,124,0.5)',
        borderRadius:  3,
        background:    'rgba(200,168,124,0.05)',
      }}>
        CASE #{project.caseNum}
      </div>

      {/* Fixed-height header section */}
      <div style={{ flexShrink: 0 }}>
        {/* Category line — top left */}
        <p style={{
          fontFamily:    'monospace',
          fontSize:      9,
          color:         '#c8a87c',
          letterSpacing: 2,
          margin:        '0 0 18px',
        }}>
          ▸ {tabKey} · CASE FILE
        </p>

        {/* Project title */}
        <h3 style={{
          fontFamily:   'var(--font-space-grotesk)',
          fontWeight:   700,
          fontSize:     17,
          color:        '#ffffff',
          lineHeight:   1.3,
          margin:       '0 0 6px',
          paddingRight: 80,      /* clear the case stamp */
        }}>
          {project.title}
        </h3>

        {/* Subtitle */}
        <p style={{
          fontFamily:    'monospace',
          fontSize:      10,
          color:         '#c8a87c',
          letterSpacing: 1,
          margin:        '0 0 10px',
        }}>
          {project.subtitle}
        </p>
      </div>

      {/* Description — fills remaining space and fades via mask gradient.
          flex:1 + minHeight:0 lets it shrink inside the fixed-height card
          while the footer (expand button + tags + status) stays pinned to
          the bottom. The 35% mask stop mirrors the Experience cards. */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
        maskImage: 'linear-gradient(180deg, #000 35%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, #000 35%, transparent 100%)',
      }}>
        <p style={{
          fontFamily:  'Inter, sans-serif',
          fontSize:    12,
          color:       '#ffffff',
          lineHeight:  1.6,
          margin:      0,
        }}>
          {project.description}
        </p>
      </div>

      {/* Expand button */}
      <button
        type="button"
        className="proj-expand-btn"
        onClick={e => { e.stopPropagation(); playClickSound(); onExpand() }}
      >
        ▾ EXPAND
      </button>

      {/* Tech stack tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10, flexShrink: 0 }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            padding:       '3px 8px',
            background:    'rgba(200,168,124,0.1)',
            border:        '1px solid rgba(200,168,124,0.3)',
            color:         '#c8a87c',
            fontFamily:    'monospace',
            fontSize:      9,
            letterSpacing: 1,
            borderRadius:  3,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Status bar */}
      <div style={{
        borderTop:      '1px dashed rgba(200,168,124,0.3)',
        paddingTop:     10,
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        fontFamily:     'monospace',
        fontSize:       9,
        letterSpacing:  1.5,
        flexShrink:     0,
      }}>
        <span style={{ color: STATUS_COLOR[project.status] }}>
          STATUS: {project.status}
        </span>
        <span className="proj-view">▸ VIEW DETAILS</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Project Detail Modal — local so it can carry Lenis-prevent
   guards that the shared <Modal> doesn't expose. Mirrors the
   ReviewLetterModal pattern on the Reviews page so long
   descriptions scroll naturally under the smooth-scroll provider.
───────────────────────────────────────────────────────────── */

function ProjectDetailModal({
  project, tabKey, onClose,
}: {
  project: Project | null; tabKey: TabKey; onClose: () => void
}) {
  // Portal-mount flag — avoids SSR mismatch when the page first renders.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          // Portaled to document.body so the modal escapes any nested
          // stacking context on the page (the global nav at z-index 50 was
          // painting over the in-page modal because the page wrapper
          // confined it). zIndex 9000 keeps it above the nav and any other
          // overlay short of the cursor (which sits at the 2147483646 tier).
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.78)',
            zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            data-lenis-prevent
            style={{
              background: '#0a0a0a',
              border: '2px solid #c8a87c',
              borderRadius: 12,
              maxWidth: 760, width: '92%',
              maxHeight: '85vh', overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: 32,
              position: 'relative',
            }}
          >
            <button
              onClick={() => { playClickSound(); onClose() }}
              style={{
                position: 'absolute', top: 16, right: 16,
                fontFamily: 'monospace', fontSize: 10,
                color: 'rgba(200,168,124,0.7)',
                border: '1px solid rgba(200,168,124,0.3)',
                background: 'transparent',
                padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                zIndex: 1,
              }}
            >✕ CLOSE</button>

            <div style={{
              fontFamily: 'monospace', fontSize: 10, color: '#c8a87c',
              letterSpacing: 2, marginBottom: 18,
            }}>
              ▸ {tabKey} · CASE FILE · CASE #{project.caseNum}
            </div>

            <h3 style={{
              fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
              fontSize: 22, color: '#ffffff', lineHeight: 1.25,
              margin: '0 0 8px', paddingRight: 80,
            }}>
              {project.title}
            </h3>

            <p style={{
              fontFamily: 'monospace', fontSize: 11, color: '#c8a87c',
              letterSpacing: 1.5, margin: '0 0 24px',
            }}>
              {project.subtitle}
            </p>

            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              color: '#e0e0e0', lineHeight: 1.7, margin: '0 0 24px',
              whiteSpace: 'pre-wrap',
            }}>
              {project.description}
            </p>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {project.tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 10px',
                  background: 'rgba(200,168,124,0.1)',
                  border: '1px solid rgba(200,168,124,0.3)',
                  color: '#c8a87c',
                  fontFamily: 'monospace', fontSize: 10,
                  letterSpacing: 1, borderRadius: 3,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{
              borderTop: '1px dashed rgba(200,168,124,0.3)',
              paddingTop: 12,
              fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5,
              color: STATUS_COLOR[project.status],
            }}>
              STATUS: {project.status}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */

export default function ProjectsPage() {
  const [activeTab,  setActiveTab]  = useState<TabKey>('PERSONAL')
  const [hoveredTab, setHoveredTab] = useState<TabKey | null>(null)
  const [expanded,   setExpanded]   = useState<Project | null>(null)
  const [expandedTab, setExpandedTab] = useState<TabKey>('PERSONAL')

  function openProject(project: Project, tabKey: TabKey) {
    setExpanded(project)
    setExpandedTab(tabKey)
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <style>{PAGE_STYLES}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Tab bar ── */}
        <div
          className="proj-tabs"
          style={{ display: 'flex', gap: 8, marginBottom: 32 }}
        >
          {TABS.map(({ key, label }) => {
            const isActive  = activeTab  === key
            const isHovered = hoveredTab === key && !isActive
            const count = PROJECTS[key].length.toString().padStart(2, '0')
            return (
              <button
                key={key}
                onClick={() => { playClickSound(); setActiveTab(key) }}
                onMouseEnter={() => setHoveredTab(key)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  flex:           1,
                  padding:        '14px 20px',
                  background:      isActive  ? '#1a1410'
                                 : isHovered ? 'rgba(200,168,124,0.05)'
                                 :             '#0a0a0a',
                  border:         `1px solid ${
                                   isActive  ? '#c8a87c'
                                 : isHovered ? 'rgba(200,168,124,0.4)'
                                 :             'rgba(200,168,124,0.25)'}`,
                  borderRadius:   6,
                  fontFamily:     'monospace',
                  fontSize:       11,
                  color:           isActive  ? '#ffffff'
                                 : isHovered ? '#c8a87c'
                                 :             '#c8a87c',
                  letterSpacing:  2,
                  cursor:         'pointer',
                  transition:     'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            8,
                  boxShadow:       isActive
                    ? '0 0 20px rgba(200,168,124,0.2), inset 0 0 10px rgba(200,168,124,0.05)'
                    : 'none',
                }}
              >
                {label}
                <span style={{
                  fontFamily:   'monospace',
                  fontSize:     10,
                  color:         isActive ? 'rgba(200,168,124,0.7)' : 'rgba(200,168,124,0.45)',
                  letterSpacing: 1,
                }}>
                  · {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Cards grid with AnimatePresence ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div
              className="proj-grid"
              style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 18,
              }}
            >
              {PROJECTS[activeTab].map((project, i) => (
                <motion.div
                  key={project.caseNum}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.06 }}
                >
                  <ProjectCard
                    project={project}
                    tabKey={activeTab}
                    onExpand={() => openProject(project, activeTab)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Full description modal */}
      <ProjectDetailModal
        project={expanded}
        tabKey={expandedTab}
        onClose={() => setExpanded(null)}
      />
    </div>
  )
}
