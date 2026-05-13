'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

/* ─────────────────────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────────────────────── */

type Tab = 'bachelors' | 'masters' | 'coursework' | 'extracurricular'

const TABS: { id: Tab; num: string; label: string; dot: boolean }[] = [
  { id: 'bachelors',       num: '01', label: "BACHELOR'S DEGREE",  dot: false },
  { id: 'masters',         num: '02', label: "MASTER'S DEGREE",    dot: true  },
  { id: 'coursework',      num: '03', label: 'COURSEWORK',         dot: false },
  { id: 'extracurricular', num: '04', label: 'EXTRACURRICULAR',    dot: false },
]

/* ─────────────────────────────────────────────────────────────
   Component-scoped CSS
   (responsive layout + tab hover — inline styles can't do these)
───────────────────────────────────────────────────────────── */

const PAGE_STYLES = `
  .edu-layout {
    display: flex;
    gap: 24px;
    width: 100%;
    min-height: 560px;
  }
  .edu-tabs {
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .edu-right {
    flex: 1;
    position: relative;
    min-height: 560px;
  }
  .edu-diploma {
    padding: 40px 48px;
  }

  /* ── HQ Seal ── */
  .hq-seal { width: 79px; height: 79px; position: relative; display: inline-block; }
  .hq-seal-ring-outer { position: absolute; inset: 0; border: 2px solid #c8a87c; border-radius: 50%; }
  .hq-seal-ring-inner { position: absolute; inset: 6px; border: 1px solid #c8a87c; border-radius: 50%; }
  .hq-seal-text-curve {
    position: absolute; inset: 0; width: 100%; height: 100%;
    animation: hqSealRotate 30s linear infinite;
  }
  @keyframes hqSealRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .hq-seal-text-curve text {
    font-family: 'Times New Roman', serif;
    font-size: 5px; fill: #c8a87c; letter-spacing: 2.5px; font-weight: 600;
  }
  .hq-seal-star { position: absolute; font-size: 5px; color: #c8a87c; top: 50%; transform: translateY(-50%); }
  .hq-seal-star-left  { left: 2px; }
  .hq-seal-star-right { right: 2px; }
  .hq-seal-center {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .hq-seal-mono { font-family: 'Times New Roman', serif; font-weight: 700; font-size: 18px; color: #c8a87c; line-height: 1; letter-spacing: 1px; }
  .hq-seal-line { width: 16px; height: 1px; background: #c8a87c; }
  .hq-seal-year { font-family: monospace; font-size: 4px; color: #c8a87c; letter-spacing: 1px; }

  @media (max-width: 900px) {
    .edu-layout   { flex-direction: column; min-height: auto; }
    .edu-tabs     { width: 100%; flex-direction: row; overflow-x: auto;
                    gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
    .edu-tabs::-webkit-scrollbar { display: none; }
    .edu-right    { min-height: auto; }
    .edu-diploma  { padding: 24px; }
    .edu-tab-btn  { flex-shrink: 0; white-space: nowrap; width: auto !important; }
  }

  /* ── Extracurricular tab ── */
  .ec-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .ec-card {
    background: linear-gradient(135deg, #2a2418, #1a1410);
    border: 1px solid rgba(200,168,124,0.3);
    border-radius: 8px;
    padding: 24px 28px;
    transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
  }
  .ec-card:hover {
    border-color: #c8a87c;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200,168,124,0.15);
  }
  .ec-lang-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    .ec-grid  { grid-template-columns: 1fr; }
    .ec-card  { padding: 20px 22px; }
    .ec-title { font-size: 17px !important; }
    .ec-heading { font-size: 22px !important; }
  }
`

/* ─────────────────────────────────────────────────────────────
   Typography shorthand — every diploma line is Times New Roman
───────────────────────────────────────────────────────────── */

function t(extra?: React.CSSProperties): React.CSSProperties {
  return { fontFamily: "'Times New Roman', serif", ...extra }
}

/* ─────────────────────────────────────────────────────────────
   Shared diploma frame
───────────────────────────────────────────────────────────── */

function DiplomaFrame({
  children,
  status,
  statusLabel,
}: {
  children: React.ReactNode
  status: 'completed' | 'inprogress'
  statusLabel?: string
}) {
  return (
    <div
      className="edu-diploma"
      style={{
        width: '100%',
        minHeight: 540,
        background: 'linear-gradient(135deg, #1a1612, #0a0a0a)',
        border: '3px double #c8a87c',
        borderRadius: 4,
        position: 'relative',
        boxShadow:
          'inset 0 0 60px rgba(200,168,124,0.06), 0 12px 40px rgba(0,0,0,0.7)',
        boxSizing: 'border-box',
      }}
    >
      {/* Inner ornate border */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 12,
          border: '1px solid rgba(200,168,124,0.3)',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      />

      {/* HQ Seal — top right */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        <div className="hq-seal">
          <div className="hq-seal-ring-outer" />
          <div className="hq-seal-ring-inner" />
          <svg className="hq-seal-text-curve" viewBox="0 0 140 140">
            <defs>
              <path id="hqSealCirclePath" d="M 70,70 m -54,0 a 54,54 0 1,1 108,0 a 54,54 0 1,1 -108,0" />
            </defs>
            <text>
              <textPath href="#hqSealCirclePath" startOffset="0">
                ▸ HAMZA QURESHI ▸ EST 2026 ▸ HAMZA QURESHI ▸ EST 2026
              </textPath>
            </text>
          </svg>
          <span className="hq-seal-star hq-seal-star-left">✦</span>
          <span className="hq-seal-star hq-seal-star-right">✦</span>
          <div className="hq-seal-center">
            <div className="hq-seal-mono">HQ</div>
            <div className="hq-seal-line" />
            <div className="hq-seal-year">2026</div>
          </div>
        </div>
      </div>

      {/* Status ribbon — top left */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          padding: '6px 14px',
          fontFamily: "'Times New Roman', serif",
          fontSize: 10,
          letterSpacing: 3,
          ...(status === 'completed'
            ? { background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', color: '#22c55e' }
            : { background: 'rgba(234,179,8,0.1)', border: '1px solid #eab308', color: '#eab308' }),
        }}
      >
        {statusLabel ?? (status === 'completed' ? '✓ CONFERRED' : '◷ IN PROGRESS')}
      </div>

      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Stat cell (reused in stats row)
───────────────────────────────────────────────────────────── */

function Stat({ val, label }: { val: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={t({ fontWeight: 700, fontSize: 22, color: '#fff', margin: '0 0 4px' })}>{val}</p>
      <p style={t({ fontSize: 9, color: '#c8a87c', letterSpacing: 2, margin: 0 })}>{label}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tab 1 — Bachelor's Degree
───────────────────────────────────────────────────────────── */

function BachelorsDiploma() {
  return (
    <DiplomaFrame status="completed">

      <p style={t({ textAlign: 'center', fontSize: 11, color: '#c8a87c', letterSpacing: 5, marginTop: 30, marginBottom: 16 })}>
        ▸ THIS IS TO CERTIFY THAT
      </p>

      <p style={t({ fontStyle: 'italic', textAlign: 'center', fontSize: 28, color: '#f5e8d4', marginBottom: 6, textShadow: '0 0 12px rgba(200,168,124,0.3)' })}>
        Hamza Qureshi
      </p>

      <p style={t({ textAlign: 'center', fontSize: 11, color: '#c8a87c', fontStyle: 'italic', marginBottom: 20 })}>
        has been conferred the degree of
      </p>

      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <p style={t({ fontWeight: 700, fontSize: 26, color: '#ffffff', lineHeight: 1.3, letterSpacing: 0.5, margin: '0 0 4px' })}>
          Bachelor of Science
        </p>
        <p style={t({ fontWeight: 700, fontSize: 18, color: '#ffffff', lineHeight: 1.3, letterSpacing: 0.5, margin: 0 })}>
          in Business Information Technology
        </p>
      </div>

      {/* ── Line A: Concentration pull-quote ── */}
      <div style={{ textAlign: 'center', marginTop: 14, marginBottom: 24 }}>
        <div style={{
          display:     'inline-block',
          padding:     '6px 0 6px 16px',
          borderLeft:  '2px solid #c8a87c',
          textAlign:   'left',
          maxWidth:    'fit-content',
        }}>
          <span style={{
            fontFamily:    "'Times New Roman', serif",
            fontStyle:     'italic',
            fontSize:      17,
            color:         '#c8a87c',
            letterSpacing: '0.2px',
            lineHeight:    1.4,
            display:       'block',
          }}>
            Concentration: Cybersecurity Management &amp; Analytics
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={t({ fontWeight: 700, fontSize: 16, color: '#f5e8d4', letterSpacing: 4, margin: '0 0 4px' })}>
          VIRGINIA TECH
        </p>
        <p style={t({ fontSize: 11, color: '#f5e8d4', margin: 0 })}>
          Pamplin College of Business
        </p>
      </div>

      {/* ── Line B: Dean's List honor badge ── */}
      <div style={{ textAlign: 'center', marginTop: 22, marginBottom: 24 }}>
        <div style={{
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          gap:             14,
          padding:         '8px 22px',
          borderTop:       '1px solid rgba(200, 168, 124, 0.4)',
          borderBottom:    '1px solid rgba(200, 168, 124, 0.4)',
          background:      'rgba(200, 168, 124, 0.04)',
        }}>
          <span style={{ fontSize: 10, color: '#c8a87c', opacity: 0.85, lineHeight: 1 }}>✦</span>
          <span style={{
            fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
            fontSize:      11,
            fontWeight:    500,
            color:         '#c8a87c',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            DEAN&apos;S LIST · ALL SEMESTERS OF ATTENDANCE
          </span>
          <span style={{ fontSize: 10, color: '#c8a87c', opacity: 0.85, lineHeight: 1 }}>✦</span>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(200,168,124,0.3)',
        paddingTop: 18,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      }}>
        <Stat val="3.61"     label="OVERALL GPA"  />
        <Stat val="3.56"     label="IN-MAJOR GPA" />
        <Stat val="MAY 2025" label="CONFERRED"     />
      </div>

    </DiplomaFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tab 2 — Master's Degree
───────────────────────────────────────────────────────────── */

function MastersDiploma() {
  return (
    <DiplomaFrame status="inprogress" statusLabel="◷ APPLICATIONS IN PROGRESS">

      <p style={t({ textAlign: 'center', fontSize: 11, color: '#c8a87c', letterSpacing: 5, marginTop: 30, marginBottom: 16 })}>
        ▸ THIS IS TO CERTIFY THAT
      </p>

      <p style={t({ fontStyle: 'italic', textAlign: 'center', fontSize: 28, color: '#f5e8d4', marginBottom: 6, textShadow: '0 0 12px rgba(200,168,124,0.3)' })}>
        Hamza Qureshi
      </p>

      <p style={t({ textAlign: 'center', fontSize: 11, color: '#c8a87c', fontStyle: 'italic', marginBottom: 20 })}>
        is in the process of applying for the degree of
      </p>

      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <p style={t({ fontWeight: 700, fontSize: 26, color: '#ffffff', lineHeight: 1.3, letterSpacing: 0.5, margin: '0 0 4px' })}>
          Master of Science
        </p>
        <p style={t({ fontWeight: 700, fontSize: 18, color: '#ffffff', lineHeight: 1.3, letterSpacing: 0.5, margin: 0 })}>
          in Information Systems
        </p>
      </div>

      {/* ── Element 5: Concentration pull-quote ── */}
      <div style={{ textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
        <div style={{
          display:     'inline-block',
          padding:     '6px 0 6px 16px',
          borderLeft:  '2px solid #c8a87c',
          textAlign:   'left',
          maxWidth:    'fit-content',
        }}>
          <span style={{
            fontFamily:    "'Times New Roman', serif",
            fontStyle:     'italic',
            fontSize:      17,
            color:         '#c8a87c',
            letterSpacing: '0.2px',
            lineHeight:    1.4,
            display:       'block',
          }}>
            Concentration: Advanced Cybersecurity &amp; Information Systems Strategy
          </span>
        </div>
      </div>

      {/* ── Element 8: Stamped badge — The Journey Continues ── */}
      <div style={{ textAlign: 'center', marginTop: 22, marginBottom: 0 }}>
        <div style={{
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            14,
          padding:        '8px 22px',
          borderTop:      '1px solid rgba(200, 168, 124, 0.4)',
          borderBottom:   '1px solid rgba(200, 168, 124, 0.4)',
          background:     'rgba(200, 168, 124, 0.04)',
        }}>
          <span style={{ fontSize: 10, color: '#c8a87c', opacity: 0.85, lineHeight: 1 }}>✦</span>
          <span style={{
            fontFamily:    "'JetBrains Mono', 'Courier New', monospace",
            fontSize:      11,
            fontWeight:    500,
            color:         '#c8a87c',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            THE JOURNEY CONTINUES
          </span>
          <span style={{ fontSize: 10, color: '#c8a87c', opacity: 0.85, lineHeight: 1 }}>✦</span>
        </div>
      </div>

      {/* ── Element 9: Personal quote ── */}
      <p style={{
        fontFamily:    "'Times New Roman', serif",
        fontStyle:     'italic',
        fontSize:      14,
        color:         'rgba(245, 232, 212, 0.7)',
        lineHeight:    1.65,
        letterSpacing: '0.1px',
        textAlign:     'center',
        maxWidth:      640,
        margin:        '18px auto 0',
      }}>
        I&apos;m a firm believer that education has no finish line, which is why I&apos;m pursuing my Master&apos;s.
        The application process is currently underway, and this page will be updated as the next chapter takes shape.
      </p>

      {/* ── Stats block ── */}
      <div style={{
        borderTop: '1px solid rgba(200,168,124,0.3)',
        paddingTop: 18,
        marginTop: 24,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      }}>
        <Stat val="M.S."     label="DEGREE TYPE"          />
        <Stat val="JAN 2027" label="EXPECTED START DATE"  />
        <Stat val="DEC 2028" label="EXPECTED COMPLETION"  />
      </div>

    </DiplomaFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tab 3 — Coursework
───────────────────────────────────────────────────────────── */

const COURSEWORK_DATA = [
  {
    category: 'Cybersecurity & Information Security',
    courses: [
      { code: 'BIT 3554', name: 'Networks, Telecom, & Security'   },
      { code: 'BIT 3674', name: 'Cybersecurity Management II'     },
      { code: 'BIT 4604', name: 'Data Governance, Privacy & Ethics'},
      { code: 'BIT 4624', name: 'Cybersecurity Analytics'         },
      { code: 'BIT 4644', name: 'Forensics & Incident Response'   },
      { code: 'FIN 4014', name: 'Cyberlaw and Policy'             },
    ],
  },
  {
    category: 'Business Analytics & Modeling',
    courses: [
      { code: 'BIT 2405',  name: 'Business Stats, Analytics & Modeling'    },
      { code: 'BIT 2406',  name: 'Business Stats, Analytics & Modeling II' },
      { code: 'BIT 3424',  name: 'Intro to Business Analytics & Modeling'  },
      { code: 'BIT 3434',  name: 'Advanced Modeling for Business Analytics'},
      { code: 'BIT 3444',  name: 'Advanced Business Computing & Applications'},
      { code: 'ACIS 1504', name: 'Intro to Business Analytics & BI'        },
    ],
  },
  {
    category: 'Management & Strategy',
    courses: [
      { code: 'MGT 3404', name: 'Principles of Management'              },
      { code: 'MGT 4394', name: 'Strategic Management'                  },
      { code: 'BIT 3414', name: 'Operations & Supply Chain Management'  },
      { code: 'BIT 4484', name: 'Project Management'                    },
      { code: 'BIT 4964', name: 'Field Study'                           },
      { code: 'BIT 2104', name: 'Careers in BIT'                        },
    ],
  },
  {
    category: 'Programming & Technical Foundations',
    courses: [
      { code: 'CS 1014',   name: 'Intro to Computational Thinking' },
      { code: 'CS 1064',   name: 'Intro to Programming in Python'  },
      { code: 'ENGE 1215', name: 'Foundations of Engineering'      },
      { code: 'MATH 1524', name: 'Business Calculus'               },
    ],
  },
  {
    category: 'Business Foundations',
    courses: [
      { code: 'FIN 3104',  name: 'Introduction to Finance'                    },
      { code: 'FIN 3054',  name: 'Legal & Ethical Environment of Business'    },
      { code: 'MKTG 3104', name: 'Marketing Management'                       },
      { code: 'ECON 2005', name: 'Principles of Economics'                    },
      { code: 'ECON 2006', name: 'Principles of Economics II'                 },
      { code: 'MGT 1104',  name: 'Foundations of Business'                    },
      { code: 'MGT 2314',  name: 'Intro to International Business'            },
    ],
  },
]

function CourseworkDiploma() {
  return (
    <DiplomaFrame status="completed">

      <p style={t({ textAlign: 'center', fontSize: 11, color: '#c8a87c', letterSpacing: 4, marginTop: 30, marginBottom: 12 })}>
        ▸ NOTABLE COURSEWORK &amp; ACADEMIC FOCUS
      </p>

      <p style={t({ fontStyle: 'italic', textAlign: 'center', fontSize: 22, color: '#f5e8d4', marginBottom: 0, textShadow: '0 0 12px rgba(200,168,124,0.3)' })}>
        Hamza Qureshi
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 26 }}>
        {COURSEWORK_DATA.map((section) => (
          <div key={section.category}>
            {/* Category header */}
            <p style={t({
              fontStyle:     'italic',
              fontSize:      12,
              color:         '#c8a87c',
              textAlign:     'center',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom:  10,
              paddingBottom: 6,
              borderBottom:  '1px dashed rgba(200,168,124,0.3)',
              margin:        '0 0 10px',
            })}>
              {section.category}
            </p>

            {/* Courses grid */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 '8px 32px',
            }}>
              {section.courses.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily:    'monospace',
                    fontSize:      10,
                    color:         '#c8a87c',
                    minWidth:      80,
                    letterSpacing: 1,
                    flexShrink:    0,
                  }}>
                    {c.code}
                  </span>
                  <span style={t({ fontSize: 12, color: '#f5e8d4', lineHeight: 1.3 })}>
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={t({
        fontStyle:   'italic',
        textAlign:   'center',
        fontSize:    11,
        color:       '#c8a87c',
        marginTop:   24,
        marginBottom: 0,
        paddingTop:  14,
        borderTop:   '1px solid rgba(200,168,124,0.3)',
      })}>
        — A foundation built on technical depth &amp; business acumen —
      </p>

    </DiplomaFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Tab 4 — Extracurricular
───────────────────────────────────────────────────────────── */

type ExtraActivity = {
  category:    string
  title:       string
  subtitle:    string
  dateRange?:  string
  description?: string
  languages?:  [string, string][]
}

const EXTRA_ACTIVITIES: ExtraActivity[] = [
  {
    category:    'MENTORSHIP',
    title:       'LinkedIn Cybersecurity Mentor',
    subtitle:    'Independent · Online Community',
    dateRange:   'Dec 2025 — Present',
    description: 'Actively mentor students and early-career professionals breaking into cybersecurity, GRC, and federal compliance through LinkedIn content, DMs, and 1:1 sessions. Focus on resume reviews, certification paths, and federal hiring guidance.',
  },
  {
    category:    'DEI & ADVOCACY',
    title:       'Cybersecurity Outreach Speaker',
    subtitle:    'Islamic Center of Maryland',
    dateRange:   '2021 — Present',
    description: 'Speaking engagements and mentorship programs aimed at bringing South Asian and Muslim students into the cybersecurity field. Workshops on certifications, career paths, and federal contracting opportunities.',
  },
  {
    category:    'VOLUNTEERING',
    title:       'Volunteer & Tech Advisor',
    subtitle:    'Montgomery County Muslim Foundation',
    dateRange:   '2021 — Present',
    description: 'Organize food drives serving the local community; digitized inventory management and built automated financial tracking systems for the foundation, replacing manual paper-based processes with custom tools.',
  },
  {
    category:    'LEADERSHIP',
    title:       'Events Coordinator',
    subtitle:    'Pakistani Student Alliance · Virginia Tech',
    dateRange:   'Aug 2022 — Aug 2024',
    description: 'Planned and executed cultural events, Pakistan Day celebrations, and community gatherings for the South Asian student community on campus. Coordinated logistics, vendors, and partnerships with other cultural organizations.',
  },
  {
    category:    'COMMUNITY',
    title:       'Active Member',
    subtitle:    'Muslim Students Association · Virginia Tech',
    dateRange:   'Aug 2022 — Aug 2024',
    description: 'Engaged in weekly programming, interfaith dialogue, and community service projects centered around Islamic values. Participated in Ramadan iftars, MSA Council collaborations, and campus-wide cultural events.',
  },
  {
    category:    'ATHLETICS',
    title:       'Vice-Captain · Cricket Team',
    subtitle:    'WCL Division 1 Leather Ball — Elite',
    dateRange:   'Jun 2025 — Present',
    description: 'Co-lead batting strategy, fielding rotations, and team coordination for elite-level competitive cricket in the Washington Cricket League\'s top division. Bridge between players and team captain on tactical decisions.',
  },
  {
    category:    'ATHLETICS',
    title:       'Vice-Captain · Germantown FC United',
    subtitle:    'Maryland Premier Adult Soccer League — Recreational Division',
    dateRange:   'Aug 2025 — Present',
    description: 'Coordinate match strategy, lineup rotations, and team communications for competitive recreational soccer at the Maryland SoccerPlex. Help build chemistry across a roster of players from across the DMV area.',
  },
  {
    category:    'MARTIAL ARTS',
    title:       'Brown Belt · Karate',
    subtitle:    'Years of disciplined training',
    dateRange:   'Feb 2020 — Feb 2021',
    description: 'Year-long intensive training in traditional Karate, progressing through belt ranks while developing focus, resilience, physical conditioning, and discipline. The mindset built on the dojo floor carries directly into how I approach high-stakes federal work.',
  },
  {
    category:    'CREATIVE',
    title:       'Musician & Producer',
    subtitle:    'Home Studio · Personal Pursuit',
    dateRange:   'Ongoing',
    description: 'Singing, playing instruments, and producing music in a personal home studio setup. An ongoing creative outlet that balances out the precision and analytical work of cybersecurity with something completely different.',
  },
  {
    category:  'LANGUAGES',
    title:     'Multilingual · 6 Languages',
    subtitle:  'Cross-cultural communicator',
    languages: [
      ['English', 'NATIVE'],
      ['Urdu',    'NATIVE'],
      ['Sindhi',  'NATIVE'],
      ['Hindi',   'FLUENT'],
      ['Punjabi', 'FLUENT'],
      ['Arabic',  'CONVERSATIONAL'],
    ],
  },
]

function ExtracurricularDiploma() {
  return (
    <div style={{ width: '100%' }}>

      {/* ── Intro ── */}
      <h3
        className="ec-heading"
        style={{
          fontFamily:    'var(--font-space-grotesk)',
          fontWeight:    700,
          fontSize:      28,
          color:         '#ffffff',
          textAlign:     'center',
          margin:        '0 0 12px',
          letterSpacing: '-0.3px',
        }}
      >
        Beyond the Resume
      </h3>
      <p style={{
        fontFamily:  'Inter, sans-serif',
        fontWeight:  400,
        fontSize:    14,
        color:       'rgba(245,232,212,0.7)',
        textAlign:   'center',
        lineHeight:  1.6,
        maxWidth:    720,
        margin:      '0 auto 50px',
      }}>
        A glimpse into the people, places, and pursuits that shape who I am outside of work.
        The relationships, interests, and experiences that complete the rest of this site.
      </p>

      {/* ── Card grid ── */}
      <div className="ec-grid">
        {EXTRA_ACTIVITIES.map((act, i) => (
          <div key={i} className="ec-card">

            {/* Category badge */}
            <div style={{
              fontFamily:    'monospace',
              fontSize:      10,
              color:         '#c8a87c',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              paddingBottom: 12,
              borderBottom:  '1px dashed rgba(200,168,124,0.2)',
              marginBottom:  14,
            }}>
              ▸ {act.category}
            </div>

            {/* Title */}
            <h4
              className="ec-title"
              style={{
                fontFamily:  'var(--font-space-grotesk)',
                fontWeight:  700,
                fontSize:    19,
                color:       '#ffffff',
                lineHeight:  1.3,
                margin:      '0 0 4px',
              }}
            >
              {act.title}
            </h4>

            {/* Subtitle */}
            <p style={{
              fontFamily:  "'Times New Roman', serif",
              fontStyle:   'italic',
              fontSize:    13,
              color:       '#c8a87c',
              margin:      '0 0 10px',
            }}>
              {act.subtitle}
            </p>

            {/* Date range (optional) */}
            {act.dateRange && (
              <p style={{
                fontFamily:    'monospace',
                fontSize:      10,
                color:         'rgba(245,232,212,0.5)',
                letterSpacing: '1.5px',
                margin:        '0 0 14px',
              }}>
                {act.dateRange}
              </p>
            )}

            {/* Language grid (card 10) */}
            {act.languages ? (
              <div className="ec-lang-grid">
                {act.languages.map(([lang, prof]) => (
                  <React.Fragment key={lang}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize:   13,
                      color:      '#ffffff',
                      alignSelf:  'center',
                    }}>
                      {lang}
                    </span>
                    <span style={{
                      fontFamily:    'monospace',
                      fontSize:      11,
                      color:         '#c8a87c',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      alignSelf:     'center',
                    }}>
                      {prof}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* Description */
              <p style={{
                fontFamily:  'Inter, sans-serif',
                fontWeight:  400,
                fontSize:    13,
                color:       'rgba(245,232,212,0.75)',
                lineHeight:  1.65,
                margin:      0,
              }}>
                {act.description}
              </p>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const vp     = { once: true, margin: '-60px' }

export default function EducationPage() {
  const [activeTab,  setActiveTab]  = useState<Tab>('bachelors')
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null)

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <style>{PAGE_STYLES}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Two-column layout ── */}
        <div className="edu-layout">

          {/* LEFT — heading + vertical tab list */}
          <div className="edu-tabs">
            {/* Heading sits inside the left column, above the tabs */}
            <h2 style={{
              fontFamily:    'var(--font-space-grotesk)',
              fontWeight:    700,
              fontSize:      28,
              color:         '#ffffff',
              margin:        '0 0 24px',
              letterSpacing: '-0.5px',
              lineHeight:    1.1,
            }}>
              Education
            </h2>

            {TABS.map(tab => {
              const isActive  = activeTab  === tab.id
              const isHovered = hoveredTab === tab.id && !isActive
              return (
                <button
                  key={tab.id}
                  className="edu-tab-btn"
                  onClick={() => { playClickSound(); setActiveTab(tab.id) }}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    padding:      '14px 16px',
                    background:    isActive  ? '#1a1410'
                                 : isHovered ? 'rgba(200,168,124,0.05)'
                                 :             '#0a0a0a',
                    border:       `1px solid ${
                                   isActive  ? '#c8a87c'
                                 : isHovered ? 'rgba(200,168,124,0.4)'
                                 :             'rgba(200,168,124,0.2)'}`,
                    borderRadius: 6,
                    fontFamily:   'monospace',
                    fontSize:     11,
                    color:         isActive  ? '#ffffff'
                                 : isHovered ? '#c8a87c'
                                 :             'rgba(200,168,124,0.6)',
                    letterSpacing: 1.5,
                    cursor:       'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          10,
                    transition:   'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow:     isActive
                      ? '0 0 20px rgba(200,168,124,0.2), inset 0 0 10px rgba(200,168,124,0.05)'
                      : 'none',
                    textAlign:    'left',
                    width:        '100%',
                  }}
                >
                  {/* Active bracket indicator */}
                  {isActive && (
                    <span style={{ color: '#c8a87c', fontSize: 14, flexShrink: 0 }}>▸</span>
                  )}

                  {/* Number + label */}
                  <span style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{ opacity: 0.5 }}>{tab.num} · </span>
                    {tab.label}
                  </span>

                  {/* In-progress amber dot */}
                  {tab.dot && (
                    <span style={{
                      display:      'block',
                      width:        6,
                      height:       6,
                      borderRadius: '50%',
                      background:   '#eab308',
                      flexShrink:   0,
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* RIGHT — diploma display */}
          <div className="edu-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ width: '100%' }}
              >
                {activeTab === 'bachelors'       && <BachelorsDiploma       />}
                {activeTab === 'masters'         && <MastersDiploma         />}
                {activeTab === 'coursework'      && <CourseworkDiploma      />}
                {activeTab === 'extracurricular' && <ExtracurricularDiploma />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}
