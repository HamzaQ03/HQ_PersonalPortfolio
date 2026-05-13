'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import { playClickSound } from '@/lib/sound'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-60px' }
const trans = (d = 0) => ({ duration: 0.6, ease: 'easeOut' as const, delay: d })

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'

/* ── Description render helpers ───────────────────────── */

function TechBullets({ bullets }: { bullets: string[] }) {
  return (
    <div style={{ marginTop: 12 }}>
      {bullets.map((bullet, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < bullets.length - 1 ? 10 : 0 }}
        >
          <span style={{ color: A, fontFamily: 'monospace', fontSize: 11, flexShrink: 0, lineHeight: 1.7 }}>▸</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#f5e8d4', lineHeight: 1.7 }}>
            {bullet}
          </span>
        </div>
      ))}
    </div>
  )
}

function SimpleContent({
  intro,
  sectionHeader,
  bullets,
  closing,
}: {
  intro:         string
  sectionHeader: string
  bullets:       { lead: string; text: string }[]
  closing:       string
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#f5e8d4', lineHeight: 1.7, margin: '0 0 12px' }}>
        {intro}
      </p>
      <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: A, letterSpacing: 1, margin: '0 0 10px' }}>
        {sectionHeader}
      </p>
      {bullets.map((b, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < bullets.length - 1 ? 10 : 0 }}
        >
          <span style={{ color: A, fontFamily: 'monospace', fontSize: 11, flexShrink: 0, lineHeight: 1.7 }}>▸</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#f5e8d4', lineHeight: 1.7 }}>
            <strong style={{ color: A, fontWeight: 700 }}>{b.lead}</strong>{b.text}
          </span>
        </div>
      ))}
      <p style={{
        fontFamily:  'Inter, sans-serif',
        fontStyle:   'italic',
        fontSize:    12,
        color:       A,
        marginTop:   12,
        marginBottom: 0,
        paddingTop:  10,
        borderTop:   '1px dashed rgba(200,168,124,0.3)',
      }}>
        {closing}
      </p>
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────── */

const roles = [
  /* ── Role 1 — NIH / Triple Point Security ── */
  {
    id:          'role-1',
    title:       'Senior Consultant (Cybersecurity GRC, Assessment & Authorization)',
    company:     'National Institutes of Health',
    subtext:     '(Contractor via Triple Point Security)',
    location:    'Bethesda, MD',
    dates:       'June 2025 – Present',
    badge:       { label: 'CURRENT', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e' },
    publication: null as string | null,
    logo:        '/TPS_Logo.png',
    logoAlt:     'Triple Point Security',
    logoScale:   1.4,
    techDesc: (
      <TechBullets bullets={[
        'Executed Risk Management Framework (RMF) processes across all seven lifecycle steps per NIST SP 800-37 Rev. 2 for mission-critical NIH information systems, performing system preparation, security categorization (FIPS 199), control selection and tailoring (NIST SP 800-53 Rev. 5), security control assessment (NIST SP 800-53A), authorization support, and ongoing monitoring, ensuring comprehensive risk management and regulatory compliance across the enterprise.',
        'Supported development of Authorization to Operate (ATO) packages including System Security Plans (SSPs), Security Assessment Reports (SARs), Risk Assessment Reports (RARs), Privacy Threshold Analyses (PTAs), Privacy Impact Assessments (PIAs), Business Impact Analyses (BIAs), and Plans of Action and Milestones (POA&Ms), reducing authorization timelines and supporting timely ATO decisions for FISMA-reportable systems.',
        "Co-led development and enterprise rollout of NIH's Information Security Continuous Monitoring (ISCM) Plan and Strategy under NIST SP 800-137, including Security Impact Analysis (SIA) processes for system changes, transitioning the agency from point-in-time reauthorizations to an Ongoing Authorization (OA) model that strengthened real-time risk visibility and reduced reauthorization burden across FISMA reportable systems.",
        'Managed implementation, User Acceptance Testing (UAT), and agency-wide deployment of the Joint Cybersecurity Assessment & Management (JCAM) GRC tool, automating security control assessments, POA&M tracking, and FISMA reporting to eliminate manual reporting overhead, standardize Assessment and Authorization (A&A) workflows across system owners and Information System Security Officers (ISSOs), and accelerate enterprise compliance reporting cycles.',
        "Served as Assistant Project Manager on NIH's IT Modernization Project, applying the HHS Enterprise Performance Life Cycle (EPLC) framework to manage deliverables, stakeholder engagement, RACI based role to responsibilities mapping, risk tracking, and milestone to achieve on-time delivery of cybersecurity milestones and enhance accountability across project teams throughout the modernization lifecycle.",
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="When you're protecting the IT infrastructure for one of the world's leading medical research institutions, 'good enough' doesn't cut it. At NIH, I'm part of the team making sure cybersecurity actually works, not just looks good on paper."
        sectionHeader="Key Contributions:"
        bullets={[
          {
            lead: 'Running the full RMF playbook: ',
            text: "Executed the complete Risk Management Framework across all seven lifecycle steps for mission critical NIH systems. Categorized systems, selected and tailored controls, ran assessments, supported authorizations, and kept eyes on everything through ongoing monitoring. Basically, the entire NIST SP 800-37 lifecycle, start to finish.",
          },
          {
            lead: 'Building bulletproof ATO packages: ',
            text: 'Supported development of Authorization to Operate (ATO) packages including SSPs, SARs, RARs, PTAs, PIAs, BIAs, and POA&Ms. Translation? The mountain of documentation that proves a federal system is actually secure enough to operate. Helped reduce timelines and get systems authorized faster.',
          },
          {
            lead: 'Modernizing how NIH handles risk: ',
            text: "Co-led NIH's Information Security Continuous Monitoring (ISCM) Plan rollout, transitioning the agency from old school point-in-time reauthorizations to a real-time Ongoing Authorization model. Think of it as moving from annual checkups to continuous health tracking for NIH's entire IT ecosystem.",
          },
          {
            lead: 'Killing the spreadsheet nightmare: ',
            text: "Managed implementation, UAT, and agency-wide deployment of JCAM, NIH's GRC platform. Automated control assessments, POA&M tracking, and FISMA reporting, turning a manual, painful process into something streamlined that actually helps people do their jobs.",
          },
          {
            lead: 'Keeping modernization on track: ',
            text: "Served as Assistant PM on NIH's IT Modernization Project under the HHS EPLC framework. My job? Make sure stakeholders talk to each other, deadlines don't slip, risks get tracked, and cybersecurity requirements don't get deprioritized when things get hectic (which is always).",
          },
        ]}
        closing="NIH can now proactively defend against threats across a massive, complex environment, all while meeting federal compliance standards that don't mess around."
      />
    ),
  },

  /* ── Role 2 — HRTec FedHIVE ── */
  {
    id:          'role-2',
    title:       'Cybersecurity Compliance Analyst',
    company:     'Human Resources Technologies, Inc. (HRTec)',
    subtext:     'FedHIVE Division',
    location:    'Alexandria, VA',
    dates:       'August 2024 – June 2025',
    badge:       null as { label: string; bg: string; border: string; color: string } | null,
    publication: null as string | null,
    logo:        '/FedHIve logo.png',
    logoAlt:     'HRTec FedHIVE',
    logoScale:   1,
    techDesc: (
      <TechBullets bullets={[
        'Architected and developed an end-to-end FedRAMP High Control Implementation Summary (CIS) assessment workbook, mapping all 346 control questions across the full NIST SP 800-53 Rev. 5 High baseline and authoring plain language control interpretations to enable Cloud Service Providers (CSPs), federal customer agencies, and Third-Party Assessment Organizations (3PAOs) to perform consistent control implementation assessments.',
        "Engineered the workbook's full VBA automation layer, including dynamic dropdowns, navigation logic, conditional formatting, real time progress tracking, and embedded a licensed AI based chatbot, transforming a static control checklist into an interactive assessment tool designed to streamline assessment workflows across CSPs, customers, and 3PAOs.",
        'Performed multi cloud control inheritance mapping across Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure FedRAMP authorized service offerings, defining CSP side, customer side, and shared responsibility designations per the FedRAMP shared responsibility model to clarify control ownership across SaaS, PaaS, and hybrid deployments.',
        'Partnered with the FedHIVE compliance team to develop and build out the company\'s Cybersecurity Maturity Model Certification (CMMC) Level 2 program in alignment with NIST SP 800-171 and DFARS 252.204-7012, performing gap analysis against the 110 required practices, defining the Controlled Unclassified Information (CUI) boundary, integrating CMMC requirements into existing FedRAMP and DoD IL4 compliance workflows, and conducting self-assessment and mock assessment activities to prepare the organization for future C3PAO certification.',
        "Utilized FedHIVE's Governance, Risk, and Compliance (GRC) platform RegScale to document, track, and assess security controls across multiple compliance frameworks, building standardized dashboards and reporting templates to improve audit efficiency, control visibility, and continuous monitoring across the FedHIVE environment.",
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="FedRAMP High. DoD IL5. CMMC Level 2. If those sound intimidating, that's because they are. They're some of the toughest security standards the federal government throws at cloud environments. I worked in those environments every day."
        sectionHeader="What I Delivered:"
        bullets={[
          {
            lead: 'Built the assessment workbook nobody else had: ',
            text: 'Architected an end-to-end FedRAMP High CIS assessment workbook from scratch, mapping all 346 control questions across the NIST SP 800-53 Rev. 5 High baseline. Wrote plain language interpretations so CSPs, federal customers, and 3PAOs could finally have consistent assessments instead of everyone interpreting controls differently.',
          },
          {
            lead: 'Made compliance interactive (yes, really): ',
            text: "Engineered the workbook's full VBA automation layer with dynamic dropdowns, navigation logic, conditional formatting, real time progress tracking, and an embedded AI chatbot. Took a static checklist and turned it into an interactive assessment tool that actually streamlines workflows.",
          },
          {
            lead: 'Mapped the multi cloud maze: ',
            text: 'Performed control inheritance mapping across AWS, Azure, and GCP FedRAMP authorized offerings, defining CSP side, customer side, and shared responsibility designations. This work clarified who owns what across SaaS, PaaS, and hybrid deployments, because shared responsibility models confuse everyone until someone actually maps them out.',
          },
          {
            lead: "Built FedHIVE's CMMC program from the ground up: ",
            text: "Partnered with the compliance team to develop the company's CMMC Level 2 program aligned with NIST 800-171 and DFARS 252.204-7012. Performed gap analysis against all 110 required practices, defined the CUI boundary, and ran mock assessments to prep for future C3PAO certification.",
          },
          {
            lead: 'Made compliance visible: ',
            text: 'Used RegScale GRC platform to document, track, and assess security controls across multiple compliance frameworks. Built standardized dashboards and reporting templates that turned messy compliance data into something leadership could actually use.',
          },
        ]}
        closing="Federal agencies and defense contractors depend on secure cloud systems. I helped make sure those systems could stand up to serious threats and serious audits."
      />
    ),
  },

  /* ── Role 3 — Baker Tilly ── */
  {
    id:          'role-3',
    title:       'Cybersecurity Risk Advisory Intern',
    company:     'Baker Tilly US, LLP',
    subtext:     null as string | null,
    location:    'Tysons Corner, VA',
    dates:       'June 2024 – August 2024',
    badge:       { label: 'INTERNSHIP', bg: 'rgba(200,168,124,0.08)', border: 'rgba(200,168,124,0.25)', color: A },
    publication: null as string | null,
    logo:        '/Bakertilly logo.png',
    logoAlt:     'Baker Tilly US, LLP',
    logoScale:   1.5,
    techDesc: (
      <TechBullets bullets={[
        'Supported internal cybersecurity audits across multiple client engagements using the NIST Cybersecurity Framework (CSF) 2.0, assessing maturity across the Govern, Identify, Protect, Detect, Respond, and Recover functions to evaluate client security posture, identify control gaps, and strengthen audit readiness against regulatory requirements.',
        'Mapped Controlled Unclassified Information (CUI) data flows across departments for Defense Industrial Base (DIB) clients in support of Cybersecurity Maturity Model Certification (CMMC) readiness, developing visual data flow diagrams and handling procedures to clarify CUI scope and align client information handling practices with NIST SP 800-171 requirements.',
        'Assisted IT Sarbanes-Oxley (SOX) 404 compliance engagements by participating in process walkthroughs, gathering control evidence, supporting sample selection and test of design documentation, and helping identify control gaps across IT General Controls (ITGCs) covering access management and change management.',
        'Contributed to AI risk advisory engagements for higher education clients, gathering and reviewing AI implementation practices against emerging guidance including the NIST AI Risk Management Framework (AI RMF) and FERPA requirements, supporting senior advisors in delivering recommendations to mature client AI governance and mitigate AI specific risk.',
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="Big Four consulting internships get all the hype, but Baker Tilly gave me something better. Real client work from day one. No coffee runs. I was in the room where decisions happened."
        sectionHeader="Key Contributions:"
        bullets={[
          {
            lead: 'Strengthened client security postures: ',
            text: 'Supported internal cybersecurity audits across multiple client engagements using the NIST CSF 2.0, assessing maturity across all six functions (Govern, Identify, Protect, Detect, Respond, Recover). These weren\'t checkmark exercises. Clients used our findings to make real improvements.',
          },
          {
            lead: 'Mapped the invisible: ',
            text: 'Mapped CUI data flows across departments for Defense Industrial Base (DIB) clients to support CMMC readiness. Built visual data flow diagrams and handling procedures aligned with NIST SP 800-171 requirements, making it clear where sensitive information actually lives and moves.',
          },
          {
            lead: 'Kept financial controls honest: ',
            text: 'Assisted IT SOX 404 compliance engagements by participating in process walkthroughs, gathering control evidence, supporting test of design documentation, and identifying control gaps across IT General Controls. This stuff matters. Weak IT controls can tank an entire financial audit.',
          },
          {
            lead: 'Advised on AI governance (before it was cool): ',
            text: 'Contributed to AI risk advisory engagements for higher education clients, reviewing AI implementation practices against the NIST AI RMF and FERPA. Helped senior advisors deliver recommendations to mature client AI governance and avoid the compliance nightmares that come with AI adoption.',
          },
        ]}
        closing="Consulting taught me how to translate technical risks into business language. Clients don't care about CVE numbers. They care about what could go wrong and how to fix it."
      />
    ),
  },

  /* ── Role 4 — HRTec Business Development & Marketing ── */
  {
    id:          'role-4',
    title:       'Business Development & Marketing Intern',
    company:     'Human Resources Technologies, Inc. (HRTec)',
    subtext:     null as string | null,
    location:    'Alexandria, VA',
    dates:       'October 2023 – June 2024',
    badge:       { label: 'INTERNSHIP', bg: 'rgba(200,168,124,0.08)', border: 'rgba(200,168,124,0.25)', color: A },
    publication: null as string | null,
    logo:        '/HRTEC Logo.png',
    logoAlt:     'HRTec',
    logoScale:   1,
    techDesc: (
      <TechBullets bullets={[
        "Supported federal proposal development and capture activities by reviewing RFPs and RFIs from civilian and defense agencies, developing compliance matrices to map HRTec capabilities against solicitation requirements, compiling past performance documentation, and coordinating proposal formatting and submission processes, directly contributing to HRTec's competitive positioning in the federal marketplace.",
        'Conducted comprehensive market research and competitive analysis across the federal cybersecurity and GRC consulting landscape, tracking contract opportunities through SAM.gov and industry databases, identifying winnable pursuits aligned with HRTec\'s capabilities, and supporting strategic go/no-go decisions that contributed to expanded pipeline growth and new contract awards during tenure.',
        "Developed technical marketing content including blog posts, case studies, and thought leadership articles focused on cybersecurity compliance frameworks (CMMC, FedRAMP, NIST), optimized HRTec's digital presence through SEO improvements and strategic content placement, and amplified brand visibility across industry platforms, contributing to a 12% increase in digital engagement metrics and strengthening inbound lead generation.",
        "Coordinated proposal kickoff meetings and cross-functional team collaboration for federal contract pursuits, aligning technical writers, subject matter experts, and pricing teams to meet tight submission deadlines, while supporting client acquisition strategies through targeted outreach and relationship development, contributing to an 18% improvement in proposal win rates and expanding HRTec's federal agency client base across DoD and civilian sectors.",
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="Before I went full cybersecurity, I spent a year learning how consulting firms actually get the work. Turns out, landing federal contracts is an art form. One that requires market research, killer proposals, and understanding what makes decision makers say 'yes.'"
        sectionHeader="What I Delivered:"
        bullets={[
          {
            lead: 'Won more federal business: ',
            text: "Supported federal proposal development by reviewing RFPs and RFIs from civilian and defense agencies, building compliance matrices to map HRTec capabilities against requirements, and coordinating proposal submissions. Directly contributed to HRTec's competitive positioning in the federal marketplace.",
          },
          {
            lead: 'Hunted opportunities: ',
            text: "Conducted market research and competitive analysis across the federal cybersecurity and GRC consulting landscape, tracking opportunities through SAM.gov and supporting strategic go/no-go decisions that contributed to pipeline growth and new contract awards.",
          },
          {
            lead: 'Amplified the brand: ',
            text: "Developed technical marketing content including blog posts, case studies, and thought leadership articles focused on CMMC, FedRAMP, and NIST. Optimized HRTec's digital presence through SEO improvements, contributing to a 12% increase in digital engagement metrics.",
          },
          {
            lead: 'Coordinated proposal chaos: ',
            text: "Ran proposal kickoff meetings and aligned cross-functional teams (technical writers, SMEs, pricing) to meet tight federal submission deadlines. Contributed to an 18% improvement in proposal win rates and helped expand HRTec's federal client base across DoD and civilian sectors.",
          },
        ]}
        closing="Understanding the business side makes me better at the security side. I don't just implement controls. I understand why they matter to the bottom line."
      />
    ),
  },

  /* ── Role 5 — Virginia Tech (unchanged) ── */
  {
    id:          'role-5',
    title:       'Payroll & Financial Operations Assistant',
    company:     "Virginia Tech Controller's Office",
    subtext:     null as string | null,
    location:    'Blacksburg, VA',
    dates:       'January 2023 – May 2023',
    badge:       { label: 'PART-TIME', bg: 'rgba(200,168,124,0.08)', border: 'rgba(200,168,124,0.25)', color: A },
    publication: null as string | null,
    logo:        '/VT Logo.png',
    logoAlt:     'Virginia Tech',
    logoScale:   1,
    techDesc: (
      <TechBullets bullets={[
        'Process, balance, and reconcile salaries, wages, compensations, reimbursements, payroll exceptions, and fellowships for Virginia Tech Employees and the Virginia Employment Commission to maintain financial transactions that underpin employee well-being and organizational financial stability.',
        "Manage state and federal taxes while reviewing and entering tax deductions for Virginia Tech's non-resident employees to maintain the accuracy of taxes paid, received, and withheld.",
        'Supported IT infrastructure of financial systems in the office to resolve any possible errors or malfunctions while maintaining the functionality of the department\'s technological equipment.',
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="Not glamorous, but essential. I processed payroll, balanced financial transactions, and managed tax deductions for Virginia Tech employees. This role taught me precision, accountability, and how critical backend systems are to keeping organizations running."
        sectionHeader="My Role:"
        bullets={[
          {
            lead: 'Kept operations running smoothly: ',
            text: 'Processed and reconciled salaries, wages, compensations, reimbursements, payroll exceptions, and fellowships for Virginia Tech employees and the Virginia Employment Commission. Made sure thousands of people got paid accurately and on time, because nothing breaks trust faster than a botched paycheck.',
          },
          {
            lead: 'Managed tax compliance: ',
            text: "Reviewed and entered state and federal tax deductions for Virginia Tech's non-resident employees, maintaining accuracy of taxes paid, received, and withheld. One mistake here could mean serious headaches for employees and the university.",
          },
          {
            lead: 'Kept the systems running: ',
            text: "Supported the IT infrastructure of financial systems in the office, troubleshooting errors and maintaining the functionality of the department's technological equipment so the financial machine never stopped.",
          },
        ]}
        closing="Boring work done right builds trust. Flashy work done wrong destroys it."
      />
    ),
  },

  /* ── Role 6 — NIH Cancer Research ── */
  {
    id:          'role-6',
    title:       'Cancer Research Intern & Co-Author',
    company:     'National Institute of Health (NIH)',
    subtext:     null as string | null,
    location:    'Bethesda, MD',
    dates:       'April 2020 – April 2021',
    badge:       { label: 'INTERNSHIP', bg: 'rgba(200,168,124,0.08)', border: 'rgba(200,168,124,0.25)', color: A },
    publication: 'Publication: Tumor Suppressor Par-4' as string | null,
    logo:        '/NIH_Logo.png',
    logoAlt:     'NIH',
    logoScale:   1.3,
    techDesc: (
      <TechBullets bullets={[
        'Co-authored and published a peer-reviewed scientific chapter on PAR-4 (Prostate Apoptosis Response-4), a pro-apoptotic protein involved in radiation-mediated killing of solid tumors, applying advanced technical writing skills to translate complex biomedical research into clear, evidence-based documentation for academic and clinical audiences.',
        'Conducted extensive data analysis and scientific literature review on the RAS Oncogene (Rat Sarcoma Virus) and its functions in radiation-induced apoptosis, synthesizing findings from multiple peer-reviewed sources to support hypothesis development and research conclusions.',
        'Performed structured research and experimental design analysis under senior researcher mentorship, contributing to investigations into cancer cell apoptosis mechanisms and producing detailed technical documentation that informed publication content and laboratory protocols.',
      ]} />
    ),
    simpleDesc: (
      <SimpleContent
        intro="My first experience at NIH wasn't in cybersecurity. It was in cancer research. I co-authored a published chapter on PAR-4 (Prostate Apoptosis Response-4), a protein involved in radiation-mediated killing of solid tumors, and analyzed scientific literature on RAS oncogenes in radiation-induced apoptosis."
        sectionHeader="Key Contributions:"
        bullets={[
          {
            lead: 'Contributed to pioneering research: ',
            text: 'Co-authored a peer-reviewed scientific chapter on PAR-4, a pro-apoptotic protein involved in radiation-mediated killing of solid tumors. Applied advanced technical writing skills to translate complex biomedical research into clear, evidence-based documentation for academic and clinical audiences.',
          },
          {
            lead: 'Analyzed complex scientific literature: ',
            text: 'Conducted extensive data analysis and literature review on the RAS Oncogene and its functions in radiation-induced apoptosis. Synthesized findings from multiple peer-reviewed sources to support hypothesis development and research conclusions.',
          },
          {
            lead: 'Built research foundations: ',
            text: 'Performed structured research and experimental design analysis under senior researcher mentorship, contributing to investigations into cancer cell apoptosis mechanisms while producing detailed technical documentation that informed publication content and laboratory protocols.',
          },
        ]}
        closing="This experience showed me what high-stakes, mission-critical work looks like. Whether it's protecting research data or conducting the research itself, I understand what's at risk."
      />
    ),
  },
]

type Role = typeof roles[0]

/* ── Shared sub-components ───────────────────────────── */

function Badge({ b }: { b: NonNullable<Role['badge']> }) {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
      padding: '3px 10px', borderRadius: 4, display: 'inline-block',
      background: b.bg, border: `1px solid ${b.border}`, color: b.color,
      flexShrink: 0,
    }}>{b.label}</span>
  )
}

/* ── Flip button ─────────────────────────────────────── */

function FlipButton({
  isFlipped,
  onFlip,
}: {
  isFlipped: boolean
  onFlip: (e: React.MouseEvent) => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onFlip}
      aria-label={isFlipped ? 'Show technical details' : 'Toggle simplified explanation'}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: '1.5px',
        background: hov ? 'rgba(200,168,124,0.12)' : 'rgba(200,168,124,0.05)',
        border: `1px solid ${hov ? '#c8a87c' : 'rgba(200,168,124,0.3)'}`,
        color: hov ? '#ffffff' : '#c8a87c',
        padding: '6px 14px',
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
    >
      {isFlipped ? '↻ Back to Pro Mode' : '↻ Simplified Version'}
    </button>
  )
}

/* ── Expand button ───────────────────────────────────── */

function ExpandButton({ onExpand }: { onExpand: (e: React.MouseEvent) => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onExpand}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: '1.5px',
        background: hov ? 'rgba(200,168,124,0.15)' : 'rgba(200,168,124,0.08)',
        border: `1px solid ${hov ? '#c8a87c' : 'rgba(200,168,124,0.4)'}`,
        color: hov ? '#ffffff' : '#c8a87c',
        padding: '8px 14px',
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
    >
      ▸ EXPAND DESCRIPTION
    </button>
  )
}

/* ── Card face content ───────────────────────────────── */

function CardFaceContent({
  role, desc, isFlipped, onFlip, onExpand,
}: {
  role: Role
  desc: React.ReactNode
  isFlipped: boolean
  onFlip: (e: React.MouseEvent) => void
  onExpand: (e: React.MouseEvent) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 330 }}>
      {/* ── Header (fixed) ── */}
      <div style={{ flexShrink: 0 }}>
        {/* Logo + title/info row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
          {/* Logo */}
          <div style={{
            width: 90, height: 60, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ffffff',
            border: '1px solid rgba(200,168,124,0.25)',
            borderRadius: 6, padding: 8, overflow: 'hidden',
          }}>
            <Image
              src={role.logo}
              alt={role.logoAlt}
              width={80}
              height={50}
              style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', transform: `scale(${role.logoScale || 1})`, transformOrigin: 'center center' }}
            />
          </div>

          {/* Title + badge/dates + company/location */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top row: title + badge + dates */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <h3 style={{
                fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 18,
                color: T, margin: 0,
              }}>{role.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                {role.badge && <Badge b={role.badge} />}
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: A }}>
                  {role.dates}
                </span>
              </div>
            </div>

            {/* Company · location */}
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
              {role.company}{role.subtext ? ` ${role.subtext}` : ''} · {role.location}
            </p>

            {/* Publication line (role 6 only) */}
            {role.publication && (
              <p style={{ fontFamily: 'monospace', fontSize: 11, fontStyle: 'italic', color: TM, margin: '2px 0 0' }}>
                {role.publication}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Description (fade-truncated, grows to fill) ── */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
        maskImage: 'linear-gradient(180deg, #000 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, #000 60%, transparent 100%)',
      }}>
        {desc}
      </div>

      {/* ── Buttons row (fixed) ── */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8, flexShrink: 0 }}>
        <ExpandButton onExpand={onExpand} />
        <FlipButton isFlipped={isFlipped} onFlip={onFlip} />
      </div>
    </div>
  )
}

/* ── Modal ───────────────────────────────────────────── */

function ExpModal({
  role, onClose, initialFlipped = false,
}: { role: Role | null; onClose: () => void; initialFlipped?: boolean }) {
  const [mounted, setMounted]     = useState(false)
  const [isFlipped, setIsFlipped] = useState(initialFlipped)
  const [hovFlip, setHovFlip]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Sync flip state whenever a new role is opened or initialFlipped changes
  useEffect(() => { setIsFlipped(initialFlipped) }, [role, initialFlipped])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = role ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [role])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {role && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.78)',
            zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px',
          }}
        >
          {/* Custom scrollbar styles */}
          <style>{`
            .exp-modal-body::-webkit-scrollbar { width: 8px; }
            .exp-modal-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; }
            .exp-modal-body::-webkit-scrollbar-thumb { background: rgba(200,168,124,0.4); border-radius: 4px; }
            .exp-modal-body::-webkit-scrollbar-thumb:hover { background: rgba(200,168,124,0.7); }
          `}</style>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            style={{
              background: '#0a0a0a',
              border: '1px solid #c8a87c',
              borderRadius: 12,
              width: '100%',
              maxWidth: 896,
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ── Header (fixed) ── */}
            <div style={{
              flexShrink: 0,
              padding: '18px 24px',
              borderBottom: '1px solid rgba(200,168,124,0.3)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
            }}>
              {/* Left: logo + role info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                {/* Logo */}
                <div style={{
                  width: 120, height: 80, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#ffffff',
                  border: '1px solid rgba(200,168,124,0.3)',
                  borderRadius: 8, padding: 10, overflow: 'hidden',
                }}>
                  <Image
                    src={role.logo}
                    alt={role.logoAlt}
                    width={100}
                    height={60}
                    style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', transform: `scale(${role.logoScale || 1})`, transformOrigin: 'center center' }}
                  />
                </div>

                {/* Role info */}
                <div>
                  {role.badge && (
                    <div style={{ marginBottom: 8 }}>
                      <Badge b={role.badge} />
                    </div>
                  )}
                  <h3 style={{
                    fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 22,
                    color: T, margin: '0 0 8px',
                  }}>{role.title}</h3>
                  <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                    {role.company}{role.subtext ? ` ${role.subtext}` : ''}
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                    {role.location}
                  </p>
                  {role.publication && (
                    <p style={{ fontFamily: 'monospace', fontSize: 11, fontStyle: 'italic', color: TM, margin: '0 0 2px' }}>
                      {role.publication}
                    </p>
                  )}
                  <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: 0 }}>
                    {role.dates}
                  </p>
                </div>
              </div>

              {/* Right: close button */}
              <button
                onClick={() => { playClickSound(); onClose() }}
                style={{
                  flexShrink: 0,
                  fontFamily: 'monospace', fontSize: 10,
                  color: 'rgba(200,168,124,0.7)',
                  border: '1px solid rgba(200,168,124,0.3)',
                  background: 'transparent',
                  padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                  letterSpacing: 1,
                }}
              >✕ CLOSE</button>
            </div>

            {/* ── Body (scrollable) ── */}
            <div
              className="exp-modal-body"
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '24px 28px',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isFlipped ? 'simple' : 'tech'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {isFlipped ? role.simpleDesc : role.techDesc}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer (fixed) — flip button only, right-aligned ── */}
            <div style={{
              flexShrink: 0,
              padding: '14px 24px',
              borderTop: '1px solid rgba(200,168,124,0.3)',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 16,
              background: 'rgba(0,0,0,0.3)',
            }}>
              {/* Flip button */}
              <button
                onClick={() => { playClickSound(); setIsFlipped(f => !f) }}
                onMouseEnter={() => setHovFlip(true)}
                onMouseLeave={() => setHovFlip(false)}
                style={{
                  flexShrink: 0,
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: '1.5px',
                  background: hovFlip ? 'rgba(200,168,124,0.15)' : 'rgba(200,168,124,0.08)',
                  border: `1px solid ${hovFlip ? '#c8a87c' : 'rgba(200,168,124,0.4)'}`,
                  color: hovFlip ? '#ffffff' : '#c8a87c',
                  padding: '8px 16px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                ↻ {isFlipped ? 'Back to Pro Mode' : 'Simplified Version'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ── Page ────────────────────────────────────────────── */

export default function ExperiencePage() {
  const [selected, setSelected]                     = useState<Role | null>(null)
  const [selectedInitialFlipped, setSelectedInitialFlipped] = useState(false)
  const [hovered, setHovered]                       = useState<string | null>(null)
  const [flipped, setFlipped]                       = useState<Record<string, boolean>>({})

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    playClickSound()
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const openModal = (role: Role, startFlipped: boolean) => {
    playClickSound()
    setSelected(role)
    setSelectedInitialFlipped(startFlipped)
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        {/* Page heading */}
        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-16"
          style={{ color: T, textAlign: 'center' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.1)}
        >
          Professional Experience
        </motion.h2>

        {/* Role cards */}
        <div className="flex flex-col gap-6">
          {roles.map((role, i) => {
            const isFlipped = !!flipped[role.id]
            return (
              <section key={role.id} id={role.id} className="scroll-mt-24">
                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(i * 0.07)}
                >
                  <div
                    style={{ position: 'relative', cursor: 'pointer', perspective: '1500px' }}
                    onClick={() => openModal(role, isFlipped)}
                    onMouseEnter={() => {
                      setHovered(role.id)
                      window.dispatchEvent(new CustomEvent('experience:roleCardEntered'))
                    }}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Hover hint */}
                    <span style={{
                      position: 'absolute', top: 14, right: 16, zIndex: 2,
                      fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                      opacity: hovered === role.id ? 1 : 0,
                      transition: 'opacity 0.2s', pointerEvents: 'none',
                    }}>↗</span>

                    {/* Flip wrapper */}
                    <div style={{
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}>
                      {/* Front face */}
                      <div style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        width: '100%',
                      }}>
                        <GlassCard static>
                          <CardFaceContent
                            role={role}
                            desc={role.techDesc}
                            isFlipped={false}
                            onFlip={(e) => toggleFlip(role.id, e)}
                            onExpand={(e) => { e.stopPropagation(); openModal(role, false) }}
                          />
                        </GlassCard>
                      </div>

                      {/* Back face */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}>
                        <GlassCard static>
                          <CardFaceContent
                            role={role}
                            desc={role.simpleDesc}
                            isFlipped={true}
                            onFlip={(e) => toggleFlip(role.id, e)}
                            onExpand={(e) => { e.stopPropagation(); openModal(role, true) }}
                          />
                        </GlassCard>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      <ExpModal role={selected} onClose={() => setSelected(null)} initialFlipped={selectedInitialFlipped} />
    </div>
  )
}
