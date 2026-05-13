'use client'
import { useState } from 'react'
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
   Data
───────────────────────────────────────────────────────────── */

const PROJECTS: Record<TabKey, Project[]> = {
  PERSONAL: [
    {
      caseNum:     '001',
      title:       'Hamza Qureshi Portfolio v3',
      subtitle:    'NEXT.JS · 2026',
      description: 'Custom-built cybersecurity portfolio with vault-themed splash, holographic skill cards, AI-powered chatbot, and secret access easter eggs. Designed and engineered end-to-end.',
      tags:        ['Next.js', 'TypeScript', 'Framer Motion', 'Supabase', 'Gemini AI'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '002',
      title:       'Home Security Lab Environment',
      subtitle:    'HOMELAB · 2025',
      description: 'Self-hosted cybersecurity lab running pfSense, Wazuh SIEM, and vulnerable VMs for hands-on red/blue team practice. Includes automated threat detection rules.',
      tags:        ['pfSense', 'Wazuh', 'Proxmox', 'Kali Linux'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '003',
      title:       'NIST 800-53 Control Mapper',
      subtitle:    'PYTHON CLI · 2025',
      description: 'Open-source command-line tool that maps NIST 800-53 controls to FedRAMP and CIS frameworks, generating compliance crosswalk reports automatically.',
      tags:        ['Python', 'Click', 'NIST', 'FedRAMP'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '004',
      title:       'CTF Writeups & Walkthroughs',
      subtitle:    'CONTENT · ONGOING',
      description: 'Personal collection of capture-the-flag challenge solutions across HackTheBox, TryHackMe, and PicoCTF. Focus on web exploitation and forensics.',
      tags:        ['HackTheBox', 'TryHackMe', 'OSINT', 'Forensics'],
      status:      'ACTIVE',
    },
  ],

  PROFESSIONAL: [
    {
      caseNum:     '001',
      title:       'NIH ATO Security Authorization Package',
      subtitle:    'NIH/HHS · 2025-PRESENT',
      description: 'Leading FISMA Moderate Authorization to Operate package through NIH/HHS pipeline. Coordinating with system owners, ISSOs, and AOs across 800+ controls.',
      tags:        ['eMASS', 'NIST 800-53', 'RMF', 'FISMA Mod', 'POA&M'],
      status:      'ACTIVE',
    },
    {
      caseNum:     '002',
      title:       'FedRAMP Continuous Monitoring System',
      subtitle:    'HRTec FEDHIVE · 2024-2025',
      description: 'Built automated continuous monitoring dashboard tracking FedRAMP control implementation in near-real-time. Reduced manual audit prep effort by 60%.',
      tags:        ['FedRAMP', 'Splunk', 'Tenable', 'PowerBI'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '003',
      title:       'Splunk SIEM Detection Tuning',
      subtitle:    'NIH · 2025',
      description: 'Optimized Splunk Enterprise Security correlation searches and reduced false positive alert rate by 40%. Authored 20+ custom detection rules aligned to MITRE ATT&CK.',
      tags:        ['Splunk ES', 'MITRE ATT&CK', 'SIEM', 'SPL'],
      status:      'COMPLETED',
    },
    {
      caseNum:     '004',
      title:       'SOC 2 Type II Risk Advisory Engagement',
      subtitle:    'BAKER TILLY · 2024',
      description: 'Conducted SOC 2 Type II readiness assessments for mid-market SaaS clients. Identified 15+ control deficiencies and authored remediation roadmaps.',
      tags:        ['SOC 2', 'Risk Advisory', 'AICPA', 'Audit'],
      status:      'COMPLETED',
    },
  ],

  EDUCATION: [
    {
      caseNum:     '001',
      title:       'Cybersecurity Capstone — VT Pamplin',
      subtitle:    'BIT 4554 · SPRING 2025',
      description: 'Senior capstone project simulating end-to-end cybersecurity risk assessment for a fictional financial services firm. Delivered full incident response playbook and risk register.',
      tags:        ['Risk Assessment', 'NIST CSF', 'IR Plan', 'BIT 4554'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '002',
      title:       'Tumor Suppressor Par-4 Research Publication',
      subtitle:    'NIH · 2020-2021',
      description: 'Co-authored peer-reviewed research on Par-4 tumor suppressor protein during cancer research internship at the National Institutes of Health. Published with research team.',
      tags:        ['Research', 'Co-Author', 'Bioinformatics', 'NIH'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '003',
      title:       'Information Security Audit Simulation',
      subtitle:    'BIT 4434 · FALL 2024',
      description: 'Performed full IT security audit on a simulated enterprise environment. Identified vulnerabilities, mapped to ISO 27001 controls, and presented findings to mock C-suite.',
      tags:        ['ISO 27001', 'Audit', 'Vulnerability Mgmt'],
      status:      'ARCHIVED',
    },
    {
      caseNum:     '004',
      title:       'Business Intelligence Risk Dashboard',
      subtitle:    'BIT 4514 · SPRING 2024',
      description: 'Designed and built a Tableau-powered BI dashboard for risk analytics, integrating threat intel feeds and KRI monitoring for a fictional financial institution.',
      tags:        ['Tableau', 'KRIs', 'Risk Analytics', 'BIT 4514'],
      status:      'ARCHIVED',
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
    border:        1px solid rgba(200,168,124,0.3);
    border-radius: 10px;
    padding:       22px;
    position:      relative;
    overflow:      hidden;
    transition:    all 280ms ease;
    cursor:        pointer;
  }
  .proj-card:hover {
    border-color: #c8a87c;
    background:   #14100c;
    box-shadow:   0 8px 28px rgba(200,168,124,0.12),
                  inset 0 0 30px rgba(200,168,124,0.04);
    transform:    translateY(-3px);
  }
  .proj-view {
    color:       #c8a87c;
    font-family: monospace;
    font-size:   9px;
    letter-spacing: 1.5px;
    transition:  color 200ms ease;
  }
  .proj-card:hover .proj-view { color: #ffffff; }

  @media (max-width: 700px) {
    .proj-grid { grid-template-columns: 1fr !important; }
    .proj-tabs { flex-direction: column !important; }
    .proj-card { padding: 16px !important; }
  }
`

/* ─────────────────────────────────────────────────────────────
   Project Card
───────────────────────────────────────────────────────────── */

function ProjectCard({ project, tabKey }: { project: Project; tabKey: TabKey }) {
  return (
    <div
      className="proj-card"
      onClick={() => { playClickSound(); console.log('Project selected:', project.title) }}
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

      {/* Category line — top left */}
      <p style={{
        fontFamily:    'monospace',
        fontSize:      9,
        color:         '#c8a87c',
        letterSpacing: 2,
        marginBottom:  24,
        margin:        '0 0 24px',
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
        margin:       '0 0 8px',
        paddingRight: 64,      /* clear the case stamp */
      }}>
        {project.title}
      </h3>

      {/* Subtitle */}
      <p style={{
        fontFamily:    'monospace',
        fontSize:      10,
        color:         '#c8a87c',
        letterSpacing: 1,
        margin:        '0 0 12px',
      }}>
        {project.subtitle}
      </p>

      {/* Description */}
      <p style={{
        fontFamily:  'Inter, sans-serif',
        fontSize:    12,
        color:       '#ffffff',
        lineHeight:  1.6,
        margin:      '0 0 14px',
      }}>
        {project.description}
      </p>

      {/* Tech stack tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
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
   Page
───────────────────────────────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const vp     = { once: true, margin: '-60px' }

export default function ProjectsPage() {
  const [activeTab,  setActiveTab]  = useState<TabKey>('PROFESSIONAL')
  const [hoveredTab, setHoveredTab] = useState<TabKey | null>(null)

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
                  · 04
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
                  <ProjectCard project={project} tabKey={activeTab} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
