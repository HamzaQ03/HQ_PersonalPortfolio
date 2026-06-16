'use client'
import { useState, useEffect, useLayoutEffect, useRef, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

interface Skill {
  name:        string
  years:       number
  proficiency: number
}

interface CategoryData {
  id:        string
  label:     string
  fullLabel: string
  icon:      string
  skills:    Skill[]
}

/* ─────────────────────────────────────────────────────────────
   Skills Data — 7 categories, exact order
───────────────────────────────────────────────────────────── */

const SKILLS_DATA: Record<string, CategoryData> = {
  technical: {
    id: 'technical', label: 'TECHNICAL', fullLabel: 'TECHNICAL SKILLS', icon: '▣',
    skills: [
      { name: 'Python Programming', years: 4, proficiency: 85 },
      { name: 'VBA Scripting & Automation', years: 3, proficiency: 90 },
      { name: 'SQL & SQLite Databases', years: 3, proficiency: 80 },
      { name: 'PowerShell Scripting', years: 2, proficiency: 70 },
      { name: 'Bash & Shell Scripting', years: 2, proficiency: 70 },
      { name: 'HTML & CSS', years: 4, proficiency: 75 },
      { name: 'JavaScript Fundamentals', years: 2, proficiency: 60 },
      { name: 'Git & GitHub Version Control', years: 3, proficiency: 75 },
      { name: 'R Programming', years: 2, proficiency: 65 },
      { name: 'MATLAB', years: 2, proficiency: 60 },
      { name: 'Linux & Kali Linux Operations', years: 3, proficiency: 80 },
      { name: 'Windows Server Administration', years: 3, proficiency: 75 },
      { name: 'Network Fundamentals & TCP/IP', years: 3, proficiency: 75 },
      { name: 'Active Directory & Group Policy', years: 2, proficiency: 70 },
      { name: 'DNS, DHCP & Network Services', years: 2, proficiency: 65 },
      { name: 'Wireshark & Packet Analysis', years: 3, proficiency: 80 },
      { name: 'Vulnerability Scanning & Assessment', years: 3, proficiency: 80 },
      { name: 'Penetration Testing Fundamentals', years: 2, proficiency: 70 },
      { name: 'Network Security & Defense', years: 3, proficiency: 80 },
      { name: 'Endpoint Security & Protection', years: 3, proficiency: 75 },
      { name: 'Identity & Access Management (IAM)', years: 3, proficiency: 80 },
      { name: 'Multi-Factor Authentication (MFA)', years: 3, proficiency: 85 },
      { name: 'Single Sign-On (SSO)', years: 2, proficiency: 75 },
      { name: 'Privileged Access Management (PAM)', years: 2, proficiency: 70 },
      { name: 'Encryption & Cryptography', years: 3, proficiency: 75 },
      { name: 'PKI & Digital Certificates', years: 2, proficiency: 70 },
      { name: 'Hash Functions & Digital Signatures', years: 2, proficiency: 75 },
      { name: 'TLS/SSL Configuration', years: 2, proficiency: 70 },
      { name: 'VPN & Remote Access Security', years: 2, proficiency: 70 },
      { name: 'Firewall Configuration & Management', years: 2, proficiency: 70 },
      { name: 'Intrusion Detection & Prevention (IDS/IPS)', years: 2, proficiency: 70 },
      { name: 'SIEM Tools & Operations', years: 3, proficiency: 75 },
      { name: 'Splunk', years: 2, proficiency: 70 },
      { name: 'Microsoft Sentinel', years: 2, proficiency: 70 },
      { name: 'Wazuh', years: 2, proficiency: 65 },
      { name: 'Log Analysis & Correlation', years: 3, proficiency: 80 },
      { name: 'Threat Intelligence Analysis', years: 2, proficiency: 70 },
      { name: 'Threat Modeling', years: 3, proficiency: 80 },
      { name: 'Indicators of Compromise (IoC)', years: 2, proficiency: 75 },
      { name: 'Incident Response Planning & Triage', years: 3, proficiency: 80 },
      { name: 'Incident Response Documentation', years: 3, proficiency: 85 },
      { name: 'Digital Forensics', years: 3, proficiency: 80 },
      { name: 'Memory Forensics (Volatility)', years: 2, proficiency: 70 },
      { name: 'Disk & File System Forensics', years: 2, proficiency: 75 },
      { name: 'Master File Table (MFT) Analysis', years: 2, proficiency: 75 },
      { name: 'File Carving & Recovery', years: 2, proficiency: 75 },
      { name: 'Hex Editor Analysis (HxD, Bless)', years: 2, proficiency: 80 },
      { name: 'Sleuth Kit (fls, istat, blkcat)', years: 2, proficiency: 75 },
      { name: 'RegRipper & Registry Analysis', years: 2, proficiency: 70 },
      { name: 'Steganography Detection', years: 2, proficiency: 70 },
      { name: 'Forensic Imaging', years: 2, proficiency: 70 },
      { name: 'Chain of Custody Documentation', years: 2, proficiency: 75 },
      { name: 'Capture-The-Flag (CTF) Competitions', years: 2, proficiency: 75 },
      { name: 'Reverse Engineering Fundamentals', years: 2, proficiency: 65 },
      { name: 'Binary Exploitation Basics', years: 2, proficiency: 60 },
      { name: 'Web Application Security', years: 2, proficiency: 70 },
      { name: 'OWASP Top 10', years: 2, proficiency: 80 },
      { name: 'Burp Suite', years: 2, proficiency: 70 },
      { name: 'Nmap & Network Scanning', years: 3, proficiency: 80 },
      { name: 'Nessus & Tenable', years: 2, proficiency: 75 },
      { name: 'OpenVAS & Qualys', years: 2, proficiency: 65 },
      { name: 'Metasploit Framework', years: 2, proficiency: 65 },
      { name: 'John the Ripper & Hydra', years: 2, proficiency: 65 },
      { name: 'Regex & Pattern Matching', years: 3, proficiency: 80 },
      { name: 'Grep, Awk & Sed', years: 2, proficiency: 75 },
      { name: 'Database Administration & Security', years: 3, proficiency: 75 },
      { name: 'Backup, Recovery & DR Planning', years: 2, proficiency: 70 },
      { name: 'Business Continuity Planning', years: 2, proficiency: 70 },
      { name: 'Data Loss Prevention (DLP)', years: 2, proficiency: 70 },
      { name: 'Endpoint Detection & Response (EDR)', years: 2, proficiency: 70 },
      { name: 'Configuration & Patch Management', years: 3, proficiency: 75 },
      { name: 'Change & Asset Management', years: 3, proficiency: 80 },
      { name: 'Process & Workflow Automation', years: 3, proficiency: 85 },
      { name: 'Excel Macros & Advanced Functions', years: 4, proficiency: 90 },
      { name: 'Data Analytics & Reporting', years: 4, proficiency: 85 },
      { name: 'Data Visualization', years: 3, proficiency: 80 },
      { name: 'Tableau & Power BI', years: 2, proficiency: 65 },
      { name: 'Statistical Analysis', years: 3, proficiency: 75 },
      { name: 'Pandas & NumPy (Python Libraries)', years: 2, proficiency: 70 },
      { name: 'API Integration & RESTful Services', years: 2, proficiency: 65 },
      { name: 'JSON & XML Data Formats', years: 3, proficiency: 80 },
      { name: 'Virtualization (VMware, VirtualBox)', years: 2, proficiency: 70 },
      { name: 'Container Fundamentals (Docker)', years: 1, proficiency: 60 },
      { name: 'DevSecOps Principles', years: 2, proficiency: 65 },
      { name: 'Secure SDLC', years: 2, proficiency: 75 },
      { name: 'Code Review for Security', years: 2, proficiency: 65 },
      { name: 'SAST & DAST Concepts', years: 1, proficiency: 60 },
      { name: 'Network Architecture & Design', years: 3, proficiency: 75 },
      { name: 'Security Architecture Fundamentals', years: 2, proficiency: 70 },
      { name: 'Cyber Threat Hunting', years: 2, proficiency: 65 },
    ],
  },

  grc: {
    id: 'grc', label: 'GRC', fullLabel: 'GOVERNANCE, RISK & COMPLIANCE', icon: '◈',
    skills: [
      { name: 'NIST Cybersecurity Framework (CSF) 2.0', years: 3, proficiency: 90 },
      { name: 'NIST Risk Management Framework (RMF)', years: 3, proficiency: 95 },
      { name: 'NIST SP 800-37 Rev. 2', years: 3, proficiency: 95 },
      { name: 'NIST SP 800-53 Rev. 5', years: 3, proficiency: 95 },
      { name: 'NIST SP 800-53A (Assessment)', years: 2, proficiency: 90 },
      { name: 'NIST SP 800-137 (ISCM)', years: 2, proficiency: 90 },
      { name: 'NIST SP 800-171', years: 2, proficiency: 90 },
      { name: 'NIST SP 800-172', years: 2, proficiency: 80 },
      { name: 'NIST SP 800-30 (Risk Assessment)', years: 2, proficiency: 85 },
      { name: 'NIST SP 800-39 (Risk Management)', years: 2, proficiency: 80 },
      { name: 'NIST SP 800-60 (Categorization)', years: 2, proficiency: 85 },
      { name: 'NIST SP 800-18 (SSP Guide)', years: 2, proficiency: 90 },
      { name: 'NIST SP 800-70 (Configuration)', years: 2, proficiency: 75 },
      { name: 'NIST SP 800-207 (Zero Trust)', years: 2, proficiency: 80 },
      { name: 'NIST AI Risk Management Framework', years: 2, proficiency: 85 },
      { name: 'NIST Privacy Framework', years: 2, proficiency: 80 },
      { name: 'FedRAMP Low, Moderate & High Baselines', years: 2, proficiency: 95 },
      { name: 'FedRAMP Authorization Process', years: 2, proficiency: 90 },
      { name: 'FedRAMP Continuous Monitoring', years: 2, proficiency: 85 },
      { name: 'FedRAMP Shared Responsibility Model', years: 2, proficiency: 90 },
      { name: 'FISMA Compliance & Reporting', years: 3, proficiency: 90 },
      { name: 'CMMC Level 1 & Level 2', years: 2, proficiency: 90 },
      { name: 'DFARS 252.204-7012 / 7019 / 7020', years: 2, proficiency: 90 },
      { name: 'DoD IL2 / IL4 / IL5 Compliance', years: 2, proficiency: 85 },
      { name: 'DoD Risk Management Framework', years: 2, proficiency: 85 },
      { name: 'HIPAA Compliance (Security & Privacy)', years: 2, proficiency: 75 },
      { name: 'FERPA Compliance', years: 2, proficiency: 80 },
      { name: 'FIPS 199 (Categorization)', years: 3, proficiency: 95 },
      { name: 'FIPS 200 (Minimum Security)', years: 3, proficiency: 90 },
      { name: 'OMB Circular A-130', years: 2, proficiency: 80 },
      { name: 'HHS Enterprise Performance Life Cycle (EPLC)', years: 1, proficiency: 85 },
      { name: 'ISO 27001 & ISO 27002', years: 2, proficiency: 75 },
      { name: 'ISO 31000 (Risk Management)', years: 2, proficiency: 70 },
      { name: 'ISO 27017 & 27018 (Cloud & Privacy)', years: 2, proficiency: 70 },
      { name: 'COBIT 2019', years: 2, proficiency: 70 },
      { name: 'ITIL Framework', years: 2, proficiency: 70 },
      { name: 'PCI DSS', years: 2, proficiency: 70 },
      { name: 'SOC 1 & SOC 2 (Type I & II)', years: 2, proficiency: 75 },
      { name: 'IT SOX 404 Compliance', years: 2, proficiency: 80 },
      { name: 'GDPR & CCPA Awareness', years: 2, proficiency: 65 },
      { name: 'Risk Management & Assessment', years: 3, proficiency: 90 },
      { name: 'Risk Register Management', years: 3, proficiency: 85 },
      { name: 'Risk-Based Decision Making', years: 3, proficiency: 85 },
      { name: 'Risk Acceptance & Documentation', years: 2, proficiency: 85 },
      { name: 'Risk Appetite & Tolerance', years: 2, proficiency: 80 },
      { name: 'Risk Mitigation Strategy', years: 3, proficiency: 85 },
      { name: 'Compliance Gap Analysis', years: 3, proficiency: 90 },
      { name: 'Control Mapping & Testing', years: 3, proficiency: 90 },
      { name: 'Maturity Assessments', years: 2, proficiency: 85 },
      { name: 'Regulatory Analysis & Interpretation', years: 3, proficiency: 85 },
      { name: 'Policy Development & Review', years: 3, proficiency: 85 },
      { name: 'Standard Operating Procedures (SOPs)', years: 3, proficiency: 85 },
      { name: 'Compliance Strategy & Program Mgmt', years: 2, proficiency: 80 },
      { name: 'Continuous Monitoring & Reporting', years: 3, proficiency: 90 },
      { name: 'Audit Readiness & Coordination', years: 3, proficiency: 85 },
      { name: 'Internal Controls Testing', years: 2, proficiency: 80 },
      { name: 'IT General Controls (ITGCs)', years: 2, proficiency: 80 },
      { name: 'Application Controls Testing', years: 2, proficiency: 75 },
      { name: 'Process Walkthroughs & Evidence Gathering', years: 2, proficiency: 85 },
      { name: 'Sample Selection & Test of Design', years: 2, proficiency: 80 },
      { name: 'Test of Operating Effectiveness', years: 2, proficiency: 75 },
      { name: 'Privacy Compliance & Impact Assessment', years: 2, proficiency: 85 },
      { name: 'CUI Protection, Handling & Boundary', years: 2, proficiency: 90 },
      { name: 'CUI Data Flow Mapping', years: 2, proficiency: 85 },
      { name: 'PII Protection & Management', years: 2, proficiency: 80 },
      { name: 'Sensitive Data Management', years: 3, proficiency: 85 },
      { name: 'Data Classification & Categorization', years: 2, proficiency: 80 },
      { name: 'AI Risk & Governance', years: 2, proficiency: 80 },
      { name: 'AI Compliance & Ethics', years: 1, proficiency: 75 },
      { name: 'Third-Party Risk Awareness', years: 2, proficiency: 70 },
      { name: 'Vendor Risk Management', years: 2, proficiency: 70 },
      { name: 'Federal Regulatory Compliance', years: 3, proficiency: 90 },
      { name: 'Federal Acquisition Regulations (FAR/DFAR)', years: 2, proficiency: 75 },
      { name: 'Government Contracting Compliance', years: 2, proficiency: 75 },
      { name: 'Compliance Documentation Excellence', years: 3, proficiency: 90 },
      { name: 'GRC Strategy Development', years: 2, proficiency: 75 },
      { name: 'Information Assurance', years: 3, proficiency: 85 },
      { name: 'Compliance Workflow Standardization', years: 3, proficiency: 85 },
      { name: 'Mission Assurance', years: 2, proficiency: 80 },
      { name: 'Compliance Reporting & Dashboards', years: 3, proficiency: 85 },
    ],
  },

  aa: {
    id: 'aa', label: 'A&A', fullLabel: 'ASSESSMENT & AUTHORIZATION (A&A)', icon: '⬢',
    skills: [
      { name: 'Risk Management Framework (RMF) Execution', years: 2, proficiency: 95 },
      { name: 'RMF Step 1: Prepare', years: 2, proficiency: 90 },
      { name: 'RMF Step 2: Categorize', years: 2, proficiency: 95 },
      { name: 'RMF Step 3: Select Controls', years: 2, proficiency: 95 },
      { name: 'RMF Step 4: Implement Controls', years: 2, proficiency: 90 },
      { name: 'RMF Step 5: Assess Controls', years: 2, proficiency: 95 },
      { name: 'RMF Step 6: Authorize', years: 2, proficiency: 90 },
      { name: 'RMF Step 7: Monitor', years: 2, proficiency: 90 },
      { name: 'Authorization to Operate (ATO) Process', years: 2, proficiency: 95 },
      { name: 'ATO Package Development', years: 2, proficiency: 95 },
      { name: 'System Security Plans (SSPs)', years: 2, proficiency: 95 },
      { name: 'Security Assessment Plans & Reports (SAPs/SARs)', years: 2, proficiency: 95 },
      { name: 'Risk Assessment Reports (RARs)', years: 2, proficiency: 90 },
      { name: 'Plans of Action & Milestones (POA&Ms)', years: 2, proficiency: 95 },
      { name: 'POA&M Tracking & Remediation', years: 2, proficiency: 95 },
      { name: 'Privacy Threshold Analyses (PTAs)', years: 2, proficiency: 90 },
      { name: 'Privacy Impact Assessments (PIAs)', years: 2, proficiency: 90 },
      { name: 'Business Impact Analyses (BIAs)', years: 2, proficiency: 85 },
      { name: 'Contingency & Continuity Plans (CPs)', years: 2, proficiency: 80 },
      { name: 'Incident Response Plans (IRPs)', years: 2, proficiency: 80 },
      { name: 'Configuration Management Plans', years: 2, proficiency: 80 },
      { name: 'System & Authorization Boundary Definition', years: 2, proficiency: 90 },
      { name: 'Security Categorization (FIPS 199)', years: 2, proficiency: 95 },
      { name: 'Impact Level Determination', years: 2, proficiency: 90 },
      { name: 'Control Selection & Tailoring', years: 2, proficiency: 90 },
      { name: 'Control Implementation Statements', years: 2, proficiency: 95 },
      { name: 'Common, Hybrid & System Controls', years: 2, proficiency: 90 },
      { name: 'Compensating Controls Documentation', years: 2, proficiency: 80 },
      { name: 'Security Control Assessment (SCA)', years: 2, proficiency: 90 },
      { name: 'Security Control Testing', years: 2, proficiency: 90 },
      { name: 'Security Test & Evaluation (ST&E)', years: 2, proficiency: 85 },
      { name: 'Independent Verification & Validation (IV&V)', years: 1, proficiency: 75 },
      { name: 'Authorization Decision Support', years: 2, proficiency: 85 },
      { name: 'Authorization Letter Preparation', years: 2, proficiency: 80 },
      { name: 'Continuous Monitoring Strategy', years: 2, proficiency: 90 },
      { name: 'Information Security Continuous Monitoring (ISCM)', years: 2, proficiency: 90 },
      { name: 'Ongoing Authorization (OA) Models', years: 2, proficiency: 85 },
      { name: 'Security Impact Analysis (SIA)', years: 2, proficiency: 85 },
      { name: 'Reauthorization Process', years: 2, proficiency: 80 },
      { name: 'Annual Security Reviews', years: 2, proficiency: 85 },
      { name: 'Vulnerability & Penetration Test Coordination', years: 2, proficiency: 75 },
      { name: 'Findings Documentation & Tracking', years: 2, proficiency: 90 },
      { name: 'Risk-Based Authorization', years: 2, proficiency: 85 },
      { name: 'Risk Acceptance Documentation', years: 2, proficiency: 85 },
      { name: 'Information System Security Officer (ISSO) Support', years: 2, proficiency: 90 },
      { name: 'Authorizing Official (AO) Support', years: 2, proficiency: 85 },
      { name: 'System Owner Coordination', years: 2, proficiency: 85 },
      { name: 'Independent Assessor Coordination', years: 2, proficiency: 80 },
      { name: '3PAO Coordination & Engagement', years: 2, proficiency: 85 },
      { name: 'C3PAO Preparation (CMMC)', years: 2, proficiency: 80 },
      { name: 'Mock Assessments & Self-Assessments', years: 2, proficiency: 85 },
      { name: 'Pre-Assessment Activities', years: 2, proficiency: 80 },
      { name: 'Post-Assessment Remediation', years: 2, proficiency: 85 },
      { name: 'Audit Trail Maintenance', years: 2, proficiency: 85 },
      { name: 'Documentation Lifecycle Management', years: 2, proficiency: 85 },
      { name: 'A&A Workflow Standardization', years: 2, proficiency: 85 },
      { name: 'Multi-Tenancy Authorization', years: 2, proficiency: 75 },
      { name: 'Reciprocity Agreements', years: 2, proficiency: 70 },
      { name: 'Federal Sponsorship Documentation', years: 2, proficiency: 75 },
      { name: 'Authorization Strategy & Planning', years: 2, proficiency: 85 },
    ],
  },

  cloud: {
    id: 'cloud', label: 'CLOUD', fullLabel: 'CLOUD SECURITY', icon: '⬡',
    skills: [
      { name: 'Amazon Web Services (AWS)', years: 2, proficiency: 85 },
      { name: 'AWS Solutions Architecture', years: 1, proficiency: 80 },
      { name: 'AWS GovCloud (US)', years: 2, proficiency: 80 },
      { name: 'AWS IAM & Access Management', years: 2, proficiency: 80 },
      { name: 'AWS S3 & EC2 Security', years: 2, proficiency: 75 },
      { name: 'AWS Security Hub & Config', years: 2, proficiency: 70 },
      { name: 'AWS GuardDuty & CloudTrail', years: 2, proficiency: 75 },
      { name: 'AWS KMS & Encryption', years: 2, proficiency: 70 },
      { name: 'AWS WAF & Shield', years: 1, proficiency: 65 },
      { name: 'AWS VPC Security', years: 2, proficiency: 70 },
      { name: 'AWS Artifact & Compliance', years: 2, proficiency: 75 },
      { name: 'AWS FedRAMP Authorization', years: 2, proficiency: 80 },
      { name: 'Microsoft Azure', years: 2, proficiency: 85 },
      { name: 'Azure Administrator (AZ-104)', years: 1, proficiency: 80 },
      { name: 'Azure Government', years: 2, proficiency: 75 },
      { name: 'Azure Active Directory & Entra ID', years: 2, proficiency: 75 },
      { name: 'Azure Security Center & Defender', years: 2, proficiency: 75 },
      { name: 'Azure Sentinel (SIEM)', years: 2, proficiency: 70 },
      { name: 'Azure Policy & Compliance Manager', years: 2, proficiency: 70 },
      { name: 'Azure Key Vault & Monitor', years: 2, proficiency: 70 },
      { name: 'Azure FedRAMP Authorization', years: 2, proficiency: 75 },
      { name: 'Google Cloud Platform (GCP)', years: 2, proficiency: 70 },
      { name: 'GCP Security Command Center & IAM', years: 2, proficiency: 65 },
      { name: 'GCP FedRAMP Authorization', years: 2, proficiency: 70 },
      { name: 'Multi-Cloud Architecture & Strategy', years: 2, proficiency: 80 },
      { name: 'Multi-Cloud Compliance', years: 2, proficiency: 85 },
      { name: 'Multi-Cloud Control Inheritance', years: 2, proficiency: 85 },
      { name: 'Cloud Service Provider (CSP) Assessment', years: 2, proficiency: 85 },
      { name: 'Shared Responsibility Model', years: 2, proficiency: 90 },
      { name: 'SaaS, PaaS & IaaS Security', years: 2, proficiency: 80 },
      { name: 'Hybrid Cloud Security', years: 2, proficiency: 75 },
      { name: 'Cloud Identity & Access Management', years: 2, proficiency: 80 },
      { name: 'Cloud Data Protection & Encryption', years: 2, proficiency: 75 },
      { name: 'Cloud Network Security', years: 2, proficiency: 75 },
      { name: 'Cloud Configuration Management', years: 2, proficiency: 75 },
      { name: 'Cloud Vulnerability Management', years: 2, proficiency: 75 },
      { name: 'Cloud Incident Response', years: 2, proficiency: 70 },
      { name: 'Cloud Continuous Monitoring', years: 2, proficiency: 75 },
      { name: 'Cloud Compliance (FedRAMP)', years: 2, proficiency: 90 },
      { name: 'Cloud Compliance (DoD IL4/IL5)', years: 2, proficiency: 85 },
      { name: 'Cloud Compliance (CMMC)', years: 2, proficiency: 80 },
      { name: 'Cloud Security Alliance (CSA) CCM', years: 2, proficiency: 70 },
      { name: 'Cloud Security Architecture', years: 2, proficiency: 75 },
      { name: 'Zero Trust Architecture (ZTA)', years: 2, proficiency: 80 },
      { name: 'DevSecOps in Cloud', years: 1, proficiency: 65 },
    ],
  },

  tools: {
    id: 'tools', label: 'TOOLS', fullLabel: 'TOOLS & PLATFORMS', icon: '◆',
    skills: [
      { name: 'RegScale (GRC Platform)', years: 1, proficiency: 85 },
      { name: 'JCAM (Joint Cybersecurity A&M)', years: 1, proficiency: 90 },
      { name: 'ServiceNow GRC', years: 1, proficiency: 70 },
      { name: 'RSA Archer', years: 1, proficiency: 65 },
      { name: 'OneTrust', years: 1, proficiency: 65 },
      { name: 'Microsoft Excel (Advanced + VBA)', years: 5, proficiency: 95 },
      { name: 'Microsoft Word & PowerPoint', years: 5, proficiency: 95 },
      { name: 'Microsoft Outlook & Teams', years: 5, proficiency: 95 },
      { name: 'Microsoft SharePoint', years: 3, proficiency: 80 },
      { name: 'Microsoft OneNote', years: 4, proficiency: 85 },
      { name: 'Microsoft Visio', years: 3, proficiency: 80 },
      { name: 'Microsoft Project', years: 2, proficiency: 70 },
      { name: 'Google Workspace', years: 5, proficiency: 90 },
      { name: 'Adobe Acrobat Pro', years: 4, proficiency: 85 },
      { name: 'Notion', years: 2, proficiency: 80 },
      { name: 'Slack', years: 4, proficiency: 85 },
      { name: 'Zoom & Webex', years: 5, proficiency: 95 },
      { name: 'Jira & Confluence', years: 2, proficiency: 75 },
      { name: 'Asana & Trello', years: 3, proficiency: 80 },
      { name: 'Splunk', years: 2, proficiency: 70 },
      { name: 'Microsoft Sentinel', years: 2, proficiency: 70 },
      { name: 'Wazuh & Elastic Stack (ELK)', years: 1, proficiency: 65 },
      { name: 'Nessus & Tenable', years: 2, proficiency: 75 },
      { name: 'Qualys & OpenVAS', years: 2, proficiency: 65 },
      { name: 'Wireshark', years: 3, proficiency: 80 },
      { name: 'Nmap', years: 3, proficiency: 80 },
      { name: 'Metasploit Framework', years: 2, proficiency: 65 },
      { name: 'Burp Suite', years: 2, proficiency: 70 },
      { name: 'Kali Linux', years: 3, proficiency: 80 },
      { name: 'Sleuth Kit', years: 2, proficiency: 75 },
      { name: 'Volatility', years: 2, proficiency: 70 },
      { name: 'HxD & Bless (Hex Editors)', years: 2, proficiency: 80 },
      { name: 'RegRipper', years: 2, proficiency: 70 },
      { name: 'FTK Imager & Autopsy', years: 1, proficiency: 65 },
      { name: 'Virginia Cyber Range Platform', years: 2, proficiency: 90 },
      { name: 'VMware & VirtualBox', years: 2, proficiency: 75 },
      { name: 'Visual Studio Code', years: 4, proficiency: 85 },
      { name: 'PyCharm & RStudio', years: 2, proficiency: 75 },
      { name: 'Git & GitHub', years: 3, proficiency: 75 },
      { name: 'SQLite & MySQL', years: 3, proficiency: 80 },
      { name: 'Tableau & Power BI', years: 2, proficiency: 65 },
      { name: 'SAM.gov', years: 1, proficiency: 80 },
      { name: 'LinkedIn (Professional)', years: 5, proficiency: 90 },
      { name: 'Canva', years: 3, proficiency: 80 },
      { name: 'WordPress', years: 2, proficiency: 70 },
    ],
  },

  soft: {
    id: 'soft', label: 'SOFT', fullLabel: 'SOFT SKILLS', icon: '✦',
    skills: [
      { name: 'Verbal & Written Communication', years: 5, proficiency: 95 },
      { name: 'Active Listening', years: 5, proficiency: 90 },
      { name: 'Public Speaking & Presentation', years: 4, proficiency: 85 },
      { name: 'Cross-Cultural Communication', years: 4, proficiency: 85 },
      { name: 'Multilingual Communication', years: 5, proficiency: 90 },
      { name: 'Empathy & Emotional Intelligence', years: 5, proficiency: 90 },
      { name: 'Adaptability & Resilience', years: 5, proficiency: 95 },
      { name: 'Open-Mindedness', years: 5, proficiency: 90 },
      { name: 'Curiosity & Continuous Learning', years: 5, proficiency: 95 },
      { name: 'Creativity & Innovation', years: 4, proficiency: 85 },
      { name: 'Critical & Analytical Thinking', years: 5, proficiency: 90 },
      { name: 'Problem Solving', years: 5, proficiency: 90 },
      { name: 'Decision Making', years: 4, proficiency: 85 },
      { name: 'Strategic Thinking', years: 4, proficiency: 85 },
      { name: 'Time Management & Prioritization', years: 5, proficiency: 90 },
      { name: 'Multitasking', years: 5, proficiency: 90 },
      { name: 'Detail-Oriented & Organized', years: 5, proficiency: 95 },
      { name: 'Self-Motivated & Self-Disciplined', years: 5, proficiency: 95 },
      { name: 'Accountability & Integrity', years: 5, proficiency: 95 },
      { name: 'Reliability & Trustworthiness', years: 5, proficiency: 95 },
      { name: 'Strong Work Ethic', years: 5, proficiency: 95 },
      { name: 'Initiative & Proactivity', years: 5, proficiency: 90 },
      { name: 'Growth Mindset', years: 5, proficiency: 95 },
      { name: 'Coachability & Feedback Receptive', years: 5, proficiency: 90 },
      { name: 'Conflict Resolution', years: 4, proficiency: 80 },
      { name: 'Negotiation & Persuasion', years: 4, proficiency: 80 },
      { name: 'Diplomacy & Influence', years: 4, proficiency: 80 },
      { name: 'Customer Service Excellence', years: 5, proficiency: 90 },
      { name: 'Client Relationship Management', years: 4, proficiency: 85 },
      { name: 'Stakeholder Engagement', years: 4, proficiency: 85 },
      { name: 'Networking & Relationship Building', years: 5, proficiency: 90 },
      { name: 'Teamwork & Collaboration', years: 5, proficiency: 95 },
      { name: 'Cross-Functional Collaboration', years: 4, proficiency: 90 },
      { name: 'Leadership & Mentorship', years: 4, proficiency: 85 },
      { name: 'Cultural Awareness', years: 5, proficiency: 90 },
      { name: 'Professionalism', years: 5, proficiency: 95 },
      { name: 'Composure Under Pressure', years: 5, proficiency: 90 },
      { name: 'Stress Management', years: 5, proficiency: 90 },
      { name: 'Time Pressure Performance', years: 5, proficiency: 90 },
      { name: 'Ambiguity Tolerance', years: 4, proficiency: 85 },
      { name: 'Entrepreneurial Mindset', years: 5, proficiency: 90 },
      { name: 'Business Acumen', years: 4, proficiency: 80 },
      { name: 'Industry & Commercial Awareness', years: 4, proficiency: 80 },
      { name: 'Goal-Oriented & Results-Driven', years: 5, proficiency: 95 },
      { name: 'Quality-Focused', years: 5, proficiency: 95 },
      { name: 'Process-Oriented & Standards-Driven', years: 5, proficiency: 90 },
      { name: 'Ethics-Driven & Compliance Mindset', years: 5, proficiency: 95 },
      { name: 'Risk-Aware & Solution-Oriented', years: 5, proficiency: 90 },
      { name: 'Mission & Purpose-Driven', years: 5, proficiency: 90 },
      { name: 'Big Picture & Future-Focused Thinking', years: 5, proficiency: 90 },
    ],
  },

  professional: {
    id: 'professional', label: 'PROFESSIONAL', fullLabel: 'PROFESSIONAL COMPETENCIES', icon: '◇',
    skills: [
      { name: 'Project & Program Management', years: 4, proficiency: 85 },
      { name: 'Project Planning & Execution', years: 4, proficiency: 85 },
      { name: 'Milestone & Deliverable Management', years: 4, proficiency: 85 },
      { name: 'Resource Coordination', years: 4, proficiency: 80 },
      { name: 'Risk Tracking & Issue Management', years: 3, proficiency: 85 },
      { name: 'Change Management', years: 3, proficiency: 80 },
      { name: 'RACI Modeling', years: 2, proficiency: 80 },
      { name: 'Stakeholder Mapping & Communication', years: 4, proficiency: 85 },
      { name: 'Executive Communication & Briefings', years: 3, proficiency: 80 },
      { name: 'Cross-Functional Leadership', years: 3, proficiency: 80 },
      { name: 'Strategic Planning & Advisory', years: 3, proficiency: 75 },
      { name: 'Business Development', years: 3, proficiency: 75 },
      { name: 'Federal Capture Strategy', years: 2, proficiency: 75 },
      { name: 'Proposal Management & Coordination', years: 2, proficiency: 80 },
      { name: 'RFP & RFI Response', years: 2, proficiency: 80 },
      { name: 'Compliance Matrix Development', years: 2, proficiency: 85 },
      { name: 'Past Performance Documentation', years: 2, proficiency: 80 },
      { name: 'Client Engagement & Advisory', years: 3, proficiency: 80 },
      { name: 'Cybersecurity Consulting', years: 2, proficiency: 80 },
      { name: 'Risk Advisory & Regulatory Advisory', years: 2, proficiency: 80 },
      { name: 'Technical Writing', years: 4, proficiency: 90 },
      { name: 'Documentation Excellence', years: 4, proficiency: 90 },
      { name: 'Policy & Procedure Writing', years: 3, proficiency: 85 },
      { name: 'Process Documentation', years: 4, proficiency: 90 },
      { name: 'Training & Knowledge Transfer', years: 3, proficiency: 80 },
      { name: 'Workshop Facilitation', years: 2, proficiency: 75 },
      { name: 'Mentorship & Coaching', years: 3, proficiency: 75 },
      { name: 'Process Automation & Workflow Design', years: 3, proficiency: 85 },
      { name: 'Process Improvement', years: 3, proficiency: 80 },
      { name: 'Operational Excellence', years: 3, proficiency: 80 },
      { name: 'Continuous Improvement', years: 3, proficiency: 80 },
      { name: 'Quality Assurance & Control', years: 4, proficiency: 85 },
      { name: 'Audit Readiness & Support', years: 3, proficiency: 85 },
      { name: 'Internal & External Audit Coordination', years: 2, proficiency: 80 },
      { name: 'Compliance Reporting & Metrics', years: 3, proficiency: 85 },
      { name: 'Dashboard & KPI Development', years: 2, proficiency: 75 },
      { name: 'Performance Tracking', years: 3, proficiency: 80 },
      { name: 'Decision Analysis & Data-Driven Decisions', years: 3, proficiency: 80 },
      { name: 'Cost-Benefit & ROI Analysis', years: 2, proficiency: 70 },
      { name: 'Resource & Capacity Planning', years: 2, proficiency: 75 },
      { name: 'Marketing Strategy & Content', years: 2, proficiency: 75 },
      { name: 'SEO & Digital Marketing', years: 2, proficiency: 70 },
      { name: 'Thought Leadership Content', years: 2, proficiency: 75 },
      { name: 'Market & Competitive Analysis', years: 3, proficiency: 80 },
      { name: 'Pipeline Management', years: 2, proficiency: 70 },
      { name: 'Go/No-Go Decision Support', years: 2, proficiency: 75 },
      { name: 'Entrepreneurship & Startup Operations', years: 5, proficiency: 85 },
      { name: 'Research & Literature Review', years: 2, proficiency: 85 },
      { name: 'Academic & Scientific Writing', years: 2, proficiency: 80 },
      { name: 'CTF Competition & Club Leadership', years: 2, proficiency: 80 },
    ],
  },
}

/* ─────────────────────────────────────────────────────────────
   Static derived constants (computed once at module load)
───────────────────────────────────────────────────────────── */

const CATEGORY_KEYS = ['technical', 'grc', 'aa', 'cloud', 'tools', 'soft', 'professional'] as const

const TOTAL_COUNT = CATEGORY_KEYS.reduce((s, k) => s + SKILLS_DATA[k].skills.length, 0)

const FILTER_CHIPS = [
  { id: 'all', label: 'ALL', count: TOTAL_COUNT },
  ...CATEGORY_KEYS.map(k => ({
    id:    SKILLS_DATA[k].id,
    label: SKILLS_DATA[k].label,
    count: SKILLS_DATA[k].skills.length,
  })),
]

/* ─────────────────────────────────────────────────────────────
   Component-scoped CSS (fully static string)
───────────────────────────────────────────────────────────── */

const STYLES = `
  /* ── Animations ──────────────────────────────────────────── */
  @keyframes marqueeSlide {
    from { transform: translateX(0); }
    to   { transform: translateX(calc(-1 * var(--track-translate, 50%))); }
  }
  @keyframes cardShine {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* ── Card base ────────────────────────────────────────────── */
  .sk-card {
    width: 140px;
    height: 180px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #2a2418 0%, #1a1a1a 50%, #2a2418 100%);
    border: 2px solid #c8a87c;
    border-radius: 8px;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.1),
      inset 0 0 16px rgba(200,168,124,0.12),
      0 4px 14px rgba(0,0,0,0.6);
    padding: 8px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    cursor: default;
    transition: opacity 200ms ease, filter 200ms ease,
                transform 200ms ease, box-shadow 200ms ease,
                border-color 200ms ease;
    contain: layout style;
  }
  /* Active match — bright, pops out */
  .sk-card-active-match {
    border-color: #f5e8d4 !important;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.2),
      inset 0 0 16px rgba(200,168,124,0.2),
      0 0 24px rgba(245,232,212,0.7),
      0 0 12px #c8a87c !important;
    transform: scale(1.08) !important;
    z-index: 10;
  }
  /* Other matches in non-active rows — soft glow */
  .sk-card-other-match {
    border-color: #c8a87c !important;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.1),
      inset 0 0 16px rgba(200,168,124,0.12),
      0 0 12px rgba(200,168,124,0.4) !important;
  }
  /* Non-matching when search active — fade out */
  .sk-card-dimmed {
    opacity: 0.25;
    filter: grayscale(0.5);
  }

  /* ── Corner flourishes ───────────────────────────────────── */
  .sk-corner { position: absolute; width: 9px; height: 9px; opacity: 0.7; }
  .sk-corner-tl { top: 4px; left: 4px;
    border-top: 1.5px solid #c8a87c; border-left: 1.5px solid #c8a87c; }
  .sk-corner-tr { top: 4px; right: 4px;
    border-top: 1.5px solid #c8a87c; border-right: 1.5px solid #c8a87c; }
  .sk-corner-bl { bottom: 4px; left: 4px;
    border-bottom: 1.5px solid #c8a87c; border-left: 1.5px solid #c8a87c; }
  .sk-corner-br { bottom: 4px; right: 4px;
    border-bottom: 1.5px solid #c8a87c; border-right: 1.5px solid #c8a87c; }

  /* ── Holographic shine ────────────────────────────────────── */
  .sk-shine {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(115deg, transparent 30%,
      rgba(255,255,255,0.18) 50%, transparent 70%);
    pointer-events: none; z-index: 10;
    animation: cardShine 8s linear infinite;
    transform: translateZ(0);
  }

  /* ── Proficiency bar ─────────────────────────────────────── */
  .sk-bar-wrap {
    height: 14px; background: rgba(0,0,0,0.6);
    border: 1px solid rgba(200,168,124,0.5); border-radius: 3px;
    overflow: hidden; position: relative;
    margin-top: 4px; margin-bottom: 4px; flex-shrink: 0;
  }
  .sk-bar-fill { height: 100%; background: linear-gradient(90deg, #c8a87c, #c8a87c); }
  .sk-bar-label {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: monospace; font-size: 9px; font-weight: 700;
    color: #ffffff; text-shadow: 0 0 4px rgba(0,0,0,0.9);
    letter-spacing: 1px; white-space: nowrap;
    line-height: 1; pointer-events: none;
  }

  /* ── Years badge ─────────────────────────────────────────── */
  .sk-years {
    text-align: center; font-family: monospace; font-size: 10px;
    color: #c8a87c; letter-spacing: 2px; margin-bottom: 6px;
    font-weight: 700; flex-shrink: 0;
  }

  /* ── Skill name ──────────────────────────────────────────── */
  .sk-name-wrap {
    flex: 1; display: flex; align-items: center;
    justify-content: center; text-align: center; padding: 4px;
  }
  .sk-name {
    font-family: 'Times New Roman', serif; font-weight: 700;
    font-size: 13px; color: #f5e8d4; line-height: 1.15;
    text-shadow: 0 0 8px rgba(200,168,124,0.4); letter-spacing: 0.3px;
  }

  /* ── Bottom bar ──────────────────────────────────────────── */
  .sk-bottom {
    border-top: 1px dashed rgba(200,168,124,0.3); padding-top: 4px;
    display: flex; align-items: center; justify-content: center;
    gap: 6px; flex-shrink: 0;
  }
  .sk-icon { font-size: 14px; color: #c8a87c; opacity: 0.8; line-height: 1; }
  .sk-cat-label {
    font-family: 'Times New Roman', serif; font-style: italic;
    font-size: 8px; color: #c8a87c; letter-spacing: 1.5px;
  }

  /* ── Marquee row ─────────────────────────────────────────── */
  .sk-row {
    position: relative; overflow: hidden; padding: 8px 0;
    width: 100vw; margin-left: calc(-50vw + 50%);
  }

  /* ── Marquee track (duration set inline per-row) ─────────── */
  .sk-track {
    display: flex; gap: 14px; width: max-content;
    animation: marqueeSlide linear infinite;
    will-change: transform;
  }
  .sk-row-rev .sk-track { animation-direction: reverse; }
  .sk-row:hover .sk-track { animation-play-state: paused; }

  /* ── Filter chips ────────────────────────────────────────── */
  .sk-chip {
    padding: 10px 18px;
    background: rgba(200,168,124,0.04);
    border: 1px solid rgba(200,168,124,0.3);
    border-radius: 6px;
    font-family: monospace; font-size: 11px;
    color: #ffffff; letter-spacing: 2.5px;
    cursor: pointer; transition: all 200ms;
    display: inline-flex; align-items: center;
    gap: 6px; white-space: nowrap;
  }
  .sk-chip:hover {
    background: rgba(200,168,124,0.1);
    border-color: rgba(200,168,124,0.6);
    color: #ffffff;
  }
  .sk-chip-active {
    background: rgba(200,168,124,0.2) !important;
    border-color: #c8a87c !important;
    color: #ffffff !important;
    box-shadow: 0 0 12px rgba(200,168,124,0.2);
  }

  /* ── Search button (sits in the chip row) ───────────────── */
  .skills-search-btn {
    padding: 10px 18px;
    background: rgba(200,168,124,0.04);
    border: 1px solid rgba(200,168,124,0.3);
    border-radius: 6px;
    color: #ffffff;
    font-family: monospace; font-size: 11px; letter-spacing: 2px;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    transition: all 200ms; white-space: nowrap;
  }
  .skills-search-btn:hover {
    background: rgba(200,168,124,0.1);
    border-color: #c8a87c;
  }

  /* ── Sticky search overlay ───────────────────────────────── */
  @keyframes skillsSearchSlideDown {
    from { transform: translateY(-100%); }
    to   { transform: translateY(0); }
  }
  .skills-search-overlay {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(10,10,10,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(200,168,124,0.3);
    padding: 16px 24px;
    animation: skillsSearchSlideDown 250ms ease-out;
  }
  .skills-search-overlay-inner {
    max-width: 800px; margin: 0 auto;
    display: flex; align-items: center; gap: 12px;
  }
  .skills-search-icon-ol { color: #c8a87c; font-size: 16px; flex-shrink: 0; }
  .skills-search-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: #ffffff; font-family: monospace; font-size: 14px; padding: 8px 0;
  }
  .skills-search-input::placeholder { color: rgba(245,232,212,0.4); }
  .skills-search-nav {
    display: flex; align-items: center; gap: 8px;
    padding: 0 12px;
    border-left: 1px solid rgba(200,168,124,0.3);
    border-right: 1px solid rgba(200,168,124,0.3);
    flex-shrink: 0;
  }
  .skills-search-nav button {
    width: 28px; height: 28px;
    background: rgba(200,168,124,0.08);
    border: 1px solid rgba(200,168,124,0.3);
    border-radius: 4px; color: #c8a87c; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; transition: all 200ms;
  }
  .skills-search-nav button:hover {
    background: rgba(200,168,124,0.2); border-color: #c8a87c;
  }
  .skills-search-nav span {
    font-family: monospace; font-size: 11px; color: #f5e8d4;
    letter-spacing: 1.5px; min-width: 60px;
    text-align: center; user-select: none; flex-shrink: 0;
  }
  .skills-search-nav span.no-matches { color: #ef4444; }
  .skills-search-close {
    width: 32px; height: 32px; background: transparent;
    border: 1px solid rgba(200,168,124,0.3); border-radius: 4px;
    color: #c8a87c; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 200ms; flex-shrink: 0;
  }
  .skills-search-close:hover {
    background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444;
  }

  /* ── Mobile ──────────────────────────────────────────────── */
  @media (max-width: 767px) {
    .sk-card { width: 120px; height: 160px; }
    .sk-track { gap: 10px; }
    .sk-chip { padding: 8px 12px; font-size: 10px; }
  }
`

/* ─────────────────────────────────────────────────────────────
   SkillCard
───────────────────────────────────────────────────────────── */

const SkillCard = memo(function SkillCard({
  skill, icon, categoryShort, shineDelay, isActiveMatch, isOtherMatch, isDimmed,
  cardKey, isOrig, onCardRef,
}: {
  skill:         Skill
  icon:          string
  categoryShort: string
  shineDelay:    number
  isActiveMatch: boolean
  isOtherMatch:  boolean
  isDimmed:      boolean
  cardKey:       string
  isOrig:        boolean
  onCardRef:     (cardKey: string, el: HTMLDivElement | null) => void
}) {
  // Stable ref callback — only original cards register into the parent map.
  // Stability lets React.memo skip re-rendering unaffected cards during search.
  const setCardRef = useCallback((el: HTMLDivElement | null) => {
    if (isOrig) onCardRef(cardKey, el)
  }, [isOrig, cardKey, onCardRef])

  return (
    <div
      ref={setCardRef}
      className={
        'sk-card' +
        (isActiveMatch ? ' sk-card-active-match' : '') +
        (isOtherMatch  ? ' sk-card-other-match'  : '') +
        (isDimmed      ? ' sk-card-dimmed'        : '')
      }
      onMouseEnter={() => window.dispatchEvent(new Event('skills:cardEntered'))}
    >
      <div className="sk-corner sk-corner-tl" />
      <div className="sk-corner sk-corner-tr" />
      <div className="sk-corner sk-corner-bl" />
      <div className="sk-corner sk-corner-br" />
      <div className="sk-shine" aria-hidden="true" style={{ animationDelay: `${shineDelay}s` }} />
      <div className="sk-bar-wrap">
        <div className="sk-bar-fill" style={{ width: `${skill.proficiency}%` }} />
        <span className="sk-bar-label">{skill.proficiency}%</span>
      </div>
      <div className="sk-years">{skill.years}Y EXP</div>
      <div className="sk-name-wrap">
        <span className="sk-name">{skill.name}</span>
      </div>
      <div className="sk-bottom">
        <span className="sk-icon">{icon}</span>
        <span className="sk-cat-label">{categoryShort}</span>
      </div>
    </div>
  )
})

/* ─────────────────────────────────────────────────────────────
   MarqueeRow — animation managed externally via onTrackRef
───────────────────────────────────────────────────────────── */

const DUPLICATE_COUNT = 18

function MarqueeRow({
  data, reverse, searchOpen, searchQuery, activeCardKey, matchCardKeySet, onTrackRef, onCardRef,
}: {
  data:            CategoryData
  reverse:         boolean
  searchOpen:      boolean
  searchQuery:     string
  activeCardKey:   string | null
  matchCardKeySet: Set<string>
  onTrackRef:      (id: string, el: HTMLDivElement | null) => void
  onCardRef:       (cardKey: string, el: HTMLDivElement | null) => void
}) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  // Full original array + a small duplicate tail (just enough to mask the
  // wrap-around) instead of a full 2× copy — keeps the DOM ~75% smaller.
  const doubled  = [...data.skills, ...data.skills.slice(0, DUPLICATE_COUNT)]
  const duration = Math.max(60, data.skills.length * 1.6)

  // Forward the track node to both the local ref and the parent's row map
  const setTrackRef = useCallback((el: HTMLDivElement | null) => {
    trackRef.current = el
    onTrackRef(data.id, el)
  }, [onTrackRef, data.id])

  // Measure the exact one-period translate distance (N original cards + N gaps)
  // and expose it to the marquee keyframe via a CSS custom property. Measuring at
  // runtime keeps the loop seamless across the responsive card-size breakpoint.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const apply = () => {
      const firstCard = track.children[0] as HTMLElement | undefined
      if (!firstCard) return
      const slot = firstCard.offsetWidth +
        (parseFloat(window.getComputedStyle(track).gap || '0') || 0)
      track.style.setProperty('--track-translate', `${data.skills.length * slot}px`)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [data.skills.length])

  return (
    <div id={data.id} style={{ marginBottom: 48 }}>
      {/* Category header — centered */}
      <h2 style={{
        fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
        fontSize: 22, color: '#ffffff', letterSpacing: '1.5px',
        margin: '50px 0 24px', textAlign: 'center',
      }}>
        <span style={{ color: '#c8a87c', marginRight: 10 }}>▸</span>
        {data.fullLabel}
      </h2>

      {/* Marquee — full viewport width */}
      <div className={`sk-row${reverse ? ' sk-row-rev' : ''}`}>
        <div
          ref={setTrackRef}
          className="sk-track"
          data-dur={`${duration}s`}
          style={{ animationDuration: `${duration}s` }}
        >
          {doubled.map((skill, i) => {
            const isOrig        = i < data.skills.length
            const skillIdx      = i % data.skills.length
            const cardKey       = `${data.id}-${skillIdx}`
            const isActiveMatch = searchOpen && !!searchQuery && activeCardKey === cardKey
            const isOtherMatch  = searchOpen && !!searchQuery && matchCardKeySet.has(cardKey) && !isActiveMatch
            const isDimmed      = searchOpen && !!searchQuery && !matchCardKeySet.has(cardKey)
            return (
              <SkillCard
                key={`${data.id}-${skill.name}-${i}`}
                skill={skill}
                icon={data.icon}
                categoryShort={data.label}
                shineDelay={skillIdx * 0.5}
                isActiveMatch={isActiveMatch}
                isOtherMatch={isOtherMatch}
                isDimmed={isDimmed}
                cardKey={cardKey}
                isOrig={isOrig}
                onCardRef={onCardRef}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */

type Match = { categoryId: string; skillIndex: number; cardKey: string }

export default function SkillsPage() {
  const [mounted, setMounted]                     = useState(false)
  const [activeFilters, setActiveFilters]         = useState<Set<string>>(new Set(['all']))
  const [searchOpen, setSearchOpen]               = useState(false)
  const [searchQuery, setSearchQuery]             = useState('')
  const [debouncedQuery, setDebouncedQuery]       = useState('')
  const [allMatches, setAllMatches]               = useState<Match[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  const overlayRef  = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const cardRefs    = useRef<Map<string, HTMLDivElement>>(new Map())
  const rowTrackRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => { setMounted(true) }, [])

  // ── Debounce the search query (80ms) — typing bursts compute matches once ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 80)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // ── Relevance-ranked match computation ───────────────────────
  // Tier 1: exact  Tier 2: starts-with  Tier 3: word-boundary  Tier 4: substring
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setAllMatches([])
      setCurrentMatchIndex(0)
      return
    }
    const q = debouncedQuery.toLowerCase().trim()
    const tier1: Match[] = []
    const tier2: Match[] = []
    const tier3: Match[] = []
    const tier4: Match[] = []

    CATEGORY_KEYS.forEach(key => {
      SKILLS_DATA[key].skills.forEach((skill, idx) => {
        const name = skill.name.toLowerCase()
        if (!name.includes(q)) return

        const m: Match = { categoryId: key, skillIndex: idx, cardKey: `${key}-${idx}` }

        if (name === q) {
          tier1.push(m)
        } else if (name.startsWith(q)) {
          tier2.push(m)
        } else {
          const words = name.split(/[\s\-_/(),.]+/)
          if (words.some(w => w.startsWith(q))) {
            tier3.push(m)
          } else {
            tier4.push(m)
          }
        }
      })
    })

    setAllMatches([...tier1, ...tier2, ...tier3, ...tier4])
    setCurrentMatchIndex(0)
  }, [debouncedQuery])

  // ── Two-axis navigation: vertical scroll + horizontal centering ──
  useEffect(() => {
    if (!searchOpen || allMatches.length === 0) return
    const activeMatch = allMatches[currentMatchIndex]
    if (!activeMatch) return

    const card  = cardRefs.current.get(activeMatch.cardKey)
    const track = rowTrackRefs.current.get(activeMatch.categoryId)
    if (!card || !track) return

    // STEP 1 — vertical: bring the row into the viewport center
    card.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // STEP 2 — horizontal: shift the track so the card is centered
    requestAnimationFrame(() => {
      const cardRect        = card.getBoundingClientRect()
      const viewportCenter  = window.innerWidth / 2
      const cardCenter      = cardRect.left + cardRect.width / 2
      const horizontalOffset = viewportCenter - cardCenter

      // Read the track's current animated translateX
      const computedTransform = window.getComputedStyle(track).transform
      let currentX = 0
      if (computedTransform && computedTransform !== 'none') {
        const m = computedTransform.match(/matrix\(([^)]+)\)/)
        if (m) {
          const vals = m[1].split(',').map(s => parseFloat(s.trim()))
          currentX = vals[4] ?? 0
        }
      }

      const targetX = currentX + horizontalOffset

      // Freeze the CSS animation then slide to the target position
      track.style.animation  = 'none'
      track.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
      track.style.transform  = `translateX(${targetX}px)`
    })
  }, [currentMatchIndex, allMatches, searchOpen])

  // ── Pause / resume all marquee rows when overlay opens / closes ──
  useEffect(() => {
    rowTrackRefs.current.forEach(track => {
      if (!track) return
      if (searchOpen) {
        track.style.animationPlayState = 'paused'
      } else {
        // Explicitly clear every inline override so the CSS keyframe resumes
        track.style.animationPlayState = ''
      }
    })
  }, [searchOpen])

  // ── Auto-focus input when overlay opens ───────────────────
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  // ── Click-outside → close overlay ─────────────────────────
  useEffect(() => {
    if (!searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    // Delay 100 ms so the click that opened the overlay doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen])

  // ── Stable ref collectors — stability lets SkillCard's React.memo hold ──
  const handleTrackRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) rowTrackRefs.current.set(id, el)
    else    rowTrackRefs.current.delete(id)
  }, [])
  const handleCardRef = useCallback((cardKey: string, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(cardKey, el)
    else    cardRefs.current.delete(cardKey)
  }, [])

  const closeSearch = useCallback(() => {
    rowTrackRefs.current.forEach(track => {
      if (!track) return
      // Read the duration that was baked in as a data attribute at render time.
      // We need this because track.style.animation = 'none' (shorthand) clobbers
      // the separately-set animationDuration inline style, so we must restore it.
      const dur = track.dataset.dur ?? ''
      // Clear manual overrides from navigation
      track.style.transition         = ''
      track.style.transform          = ''
      track.style.animationPlayState = ''
      // Force-stop the animation so the reflow registers a clean break,
      // then clear the inline override → CSS class rule restarts the keyframe.
      track.style.animation = 'none'
      void track.offsetWidth          // force reflow between 'none' and ''
      track.style.animation = ''      // let .sk-track { animation: marqueeSlide … } take over
      // Restore the duration (the 'animation: none' shorthand clobbered it)
      if (dur) track.style.animationDuration = dur
    })
    setSearchOpen(false)
    setSearchQuery('')
    setDebouncedQuery('')
    setAllMatches([])
    setCurrentMatchIndex(0)
  }, [])

  const goNext = useCallback(() => {
    setCurrentMatchIndex(prev =>
      allMatches.length === 0 ? 0 : prev >= allMatches.length - 1 ? 0 : prev + 1
    )
  }, [allMatches.length])

  const goPrevious = useCallback(() => {
    setCurrentMatchIndex(prev =>
      allMatches.length === 0 ? 0 : prev <= 0 ? allMatches.length - 1 : prev - 1
    )
  }, [allMatches.length])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) goPrevious(); else goNext()
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  }, [goNext, goPrevious, closeSearch])

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (id === 'all') return new Set(['all'])
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      next.delete('all')
      if (next.size === 0) return new Set(['all'])
      return next
    })
  }

  if (!mounted) return null

  const activeCardKey    = allMatches[currentMatchIndex]?.cardKey ?? null
  const matchCardKeySet  = new Set(allMatches.map(m => m.cardKey))

  // Overlay markup — portalled to document.body to escape any ancestor
  // stacking context (transform / will-change on SmoothScrollProvider etc.)
  const overlayPortal = searchOpen
    ? createPortal(
        <div className="skills-search-overlay" ref={overlayRef}>
          <div className="skills-search-overlay-inner">
            <span className="skills-search-icon-ol" aria-hidden="true">🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for skills"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="skills-search-input"
              autoFocus
            />
            {searchQuery && (
              <div className="skills-search-nav">
                <button onClick={goPrevious} aria-label="Previous match">◀</button>
                <span className={allMatches.length === 0 ? 'no-matches' : ''}>
                  {allMatches.length === 0
                    ? '0 of 0'
                    : `${currentMatchIndex + 1} of ${allMatches.length}`}
                </span>
                <button onClick={goNext} aria-label="Next match">▶</button>
              </div>
            )}
            <button className="skills-search-close" onClick={closeSearch} aria-label="Close search">
              ✕
            </button>
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <>
    {overlayPortal}
    <div className="min-h-screen pt-28 pb-24">
      <style>{STYLES}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">

        {/* Page title */}
        <h2 style={{
          fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
          fontSize: 56, color: '#ffffff', margin: '0 0 16px', textAlign: 'center',
        }}>
          Expertise &amp; Capabilities
        </h2>

        {/* Intro line */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 400,
          fontSize: 16, color: 'rgba(245,232,212,0.7)',
          lineHeight: 1.7, textAlign: 'center',
          maxWidth: 720, margin: '0 auto 50px auto', padding: '0 24px',
        }}>
          Below are the skills, frameworks, and tools I&apos;ve acquired through years of
          professional and educational experience in cybersecurity, governance, and federal compliance.
        </p>

        {/* Filter chips + search button */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 12, width: '100%', margin: '0 auto 50px auto',
          alignItems: 'center',
        }}>
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.id}
              className={`sk-chip${activeFilters.has(chip.id) ? ' sk-chip-active' : ''}`}
              onClick={() => toggleFilter(chip.id)}
            >
              <span style={{ color: '#c8a87c' }}>▸</span>{' '}{chip.label} · {chip.count}
            </button>
          ))}

          {/* Search button — hidden when overlay is open */}
          {!searchOpen && (
            <button
              className="skills-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Open skill search"
            >
              <span>🔍</span>
              <span>Search for skills</span>
            </button>
          )}
        </div>

        {/* Marquee rows */}
        {CATEGORY_KEYS.map((key, index) => {
          const data = SKILLS_DATA[key]
          if (!activeFilters.has('all') && !activeFilters.has(data.id)) return null
          return (
            <section key={key} id={data.id} className="scroll-mt-24">
              <MarqueeRow
                data={data}
                reverse={index % 2 === 1}
                searchOpen={searchOpen}
                searchQuery={debouncedQuery}
                activeCardKey={activeCardKey}
                matchCardKeySet={matchCardKeySet}
                onTrackRef={handleTrackRef}
                onCardRef={handleCardRef}
              />
            </section>
          )
        })}

      </div>
    </div>
    </>
  )
}
