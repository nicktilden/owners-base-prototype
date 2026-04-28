import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import styled from 'styled-components';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV_SECTIONS: Section[] = [
  { id: 'problem', label: 'The Problem' },
  { id: 'voice', label: 'Customer Voice' },
  { id: 'system', label: 'The System' },
  { id: 'objects', label: 'Object Model' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'demo', label: 'See It Live' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} style={{ scrollMarginTop: 80 }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#6f7e90',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Tag({ children, color = '#566578' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.04em',
      background: color + '18',
      color,
      border: `1px solid ${color}33`,
    }}>
      {children}
    </span>
  );
}

function WorkaroundCard({
  rank,
  company,
  method,
  failure,
}: {
  rank: number;
  company: string;
  method: string;
  failure: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8ebef',
      borderRadius: 10,
      padding: '18px 20px',
      display: 'grid',
      gridTemplateColumns: '28px 1fr',
      gap: '0 14px',
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: '#f2f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        color: '#566578',
        flexShrink: 0,
      }}>
        {rank}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: '#1e2836', fontSize: 14 }}>{company}</span>
          <Tag color="#566578">{method}</Tag>
        </div>
        <div style={{ fontSize: 13, color: '#8a97a7', lineHeight: 1.55 }}>
          <span style={{ color: '#c45a2e', fontWeight: 600 }}>Failure point:</span> {failure}
        </div>
      </div>
    </div>
  );
}

function ObjectCard({
  name,
  level,
  description,
  detail,
  color,
}: {
  name: string;
  level: string;
  description: string;
  detail: string;
  color: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${color}33`,
      borderRadius: 10,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontWeight: 700, color: '#1e2836', fontSize: 16 }}>{name}</span>
        <Tag color={color}>{level}</Tag>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: '#3c4856', lineHeight: 1.65 }}>{description}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#8a97a7', lineHeight: 1.55 }}>{detail}</p>
    </div>
  );
}

function LayerRow({
  num,
  name,
  items,
  note,
}: {
  num: string;
  name: string;
  items: string[];
  note?: string;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '32px 160px 1fr',
      gap: '0 16px',
      padding: '16px 0',
      borderBottom: '1px solid #f0f1f2',
      alignItems: 'start',
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: '#2a333f',
        color: '#8a97a7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {num}
      </div>
      <div style={{ fontWeight: 600, color: '#1e2836', fontSize: 14, paddingTop: 4 }}>{name}</div>
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: note ? 8 : 0 }}>
          {items.map(item => (
            <span key={item} style={{
              background: '#f2f4f6',
              border: '1px solid #e8ebef',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              color: '#566578',
            }}>
              {item}
            </span>
          ))}
        </div>
        {note && <div style={{ fontSize: 12, color: '#8a97a7', lineHeight: 1.55 }}>{note}</div>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: 'healthy' | 'at-risk' | 'critical' }) {
  const map = {
    healthy:  { label: 'Healthy',  bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    'at-risk':  { label: 'At Risk',  bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    critical: { label: 'Critical', bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 99,
      background: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

const QuoteCard = styled.div`
  background: #fff;
  border: 1px solid #e8ebef;
  border-radius: 10px;
  padding: 20px 24px;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  &:hover {
    border-color: #566578;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: #f8f9fa;
  }
`;

function Quote({ text, speaker, topic }: { text: string; speaker: string; topic?: string }) {
  return (
    <QuoteCard>
      {topic && (
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#8a97a7',
          marginBottom: 10,
        }}>
          {topic}
        </div>
      )}
      <blockquote style={{ margin: 0 }}>
        <p style={{
          margin: '0 0 12px',
          fontSize: 15,
          color: '#2a333f',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          &ldquo;{text}&rdquo;
        </p>
        <footer style={{ fontSize: 13, color: '#8a97a7', fontWeight: 500 }}>
          {'\u2014'} {speaker}
        </footer>
      </blockquote>
    </QuoteCard>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HealthRiskExplain() {
  const [activeSection, setActiveSection] = useState('problem');

  function scrollTo(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <Head>
        <title>Health &amp; Risk Framework — Feature Overview</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#f2f4f6' }}>

        {/* ── Top nav ────────────────────────────────────────────────── */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#1e2836',
          borderBottom: '1px solid #2a333f',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          height: 56,
          gap: 0,
        }}>
          <span style={{ color: '#6f7e90', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 24, whiteSpace: 'nowrap' }}>
            Feature Overview
          </span>
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {NAV_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  background: activeSection === s.id ? '#2a333f' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  color: activeSection === s.id ? '#fff' : '#8a97a7',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 14px',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <Link
            href="/portfolio"
            style={{
              background: '#566578',
              color: '#fff',
              borderRadius: 6,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              marginLeft: 16,
            }}
          >
            Open Prototype →
          </Link>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e2836 0%, #2a333f 60%, #3c4856 100%)',
          padding: '72px 48px 64px',
          textAlign: 'center',
        }}>
          <Tag color="#8a97a7">Health &amp; Risk Framework  </Tag>
          <p style={{
            color: '#8a97a7',
            fontSize: 18,
            maxWidth: 580,
            margin: '0 auto 32px',
            lineHeight: 1.65,
          }}>
            One unified system answering the following questions at every level of scope —
            portfolio, program, project, and user.
          </p>
          <ul style={{
            color: '#fff',
            fontSize: 44,
            fontWeight: 700,
            margin: '20px 0 16px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            paddingLeft: 0,
            listStyleType: 'none',
          }}>
            <li>* Where do I need to focus?</li>
            <li>* What risks exist?</li>
            <li>* How do I resolve them?</li>
          </ul>
          {/* <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Current state', sub: 'from connected tool data' },
              { label: 'Forecast state', sub: 'from Risk Records' },
              { label: 'Trust layer', sub: 'every signal explained' },
            ].map(({ label, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{label}</div>
                <div style={{ color: '#6f7e90', fontSize: 13, marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 120px' }}>

          {/* THE PROBLEM */}
          <SectionAnchor id="problem" />
          <section style={{ marginBottom: 80 }}>
            <SectionLabel>The Problem</SectionLabel>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2836', marginBottom: 16, lineHeight: 1.2 }}>
              Owners are responsible for portfolio outcomes,<br />but they can&apos;t see the full picture.
            </h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 24, maxWidth: 700 }}>
              Owners are responsible for the performance and outcomes of an entire portfolio, yet today
              they are forced to piece together signals from individual projects, tools, and reports
              to understand risk.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 28,
            }}>
              {[
                { label: 'Identified too late', detail: 'By the time a project is flagged, corrective action is already constrained.' },
                { label: 'Buried in project detail', detail: 'Portfolio-level visibility requires manually aggregating across dozens of projects.' },
                { label: 'Subjective and inconsistent', detail: 'Risk severity varies by PM, team, and region — making comparison impossible.' },
                { label: 'Communicated reactively', detail: 'Status reaches leadership through weekly reports and meetings, not live signals.' },
              ].map(({ label, detail }) => (
                <div key={label} style={{
                  background: '#fff',
                  border: '1px solid #e8ebef',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}>
                  <div style={{ fontWeight: 600, color: '#1e2836', fontSize: 14, marginBottom: 4 }}>Risk is {label.toLowerCase()}</div>
                  <div style={{ fontSize: 14, color: '##566578', lineHeight: 1.55 }}>{detail}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 32, maxWidth: 700 }}>
              As a result, Owners don&apos;t know where to focus their attention and struggle to clearly
              identify risk and understand root cause. The research found five distinct workaround
              patterns in production across customers today.
            </p>

            <Quote
              text="The majority of risk management happens in Excel documents. We haven't found a good way to document risk. Like, I don't think there's... a form in Procore for early development, that says, hey, these are potential risks that you've seen that your company has seen in the past... Please select them."
              speaker="Victor"
              topic="On the absence of a native risk register"
            />

            <div style={{
              marginTop: 32,
              background: 'linear-gradient(135deg, #1e2836 0%, #2a333f 100%)',
              borderRadius: 10,
              padding: '28px 32px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6f7e90', marginBottom: 12 }}>
                The Opportunity
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                Every customer has invented a workaround.
                <br />
                <span style={{ color: '#8a97a7' }}>None of them have a purpose-built solution.</span>
              </p>
            </div>
          </section>

          {/* CUSTOMER VOICE */}
          <SectionAnchor id="voice" />
          <section style={{ marginBottom: 80 }}>
            <SectionLabel>Customer Voice</SectionLabel>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>
              What customers are asking for, in their own words.
            </h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 32, maxWidth: 680 }}>
              These themes emerged consistently across customer interviews. The language varies;
              the underlying need does not.
            </p>

            <div className="highlight-quote" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Quote
                text="Owners are very high level and so they want to know how are we doing against budget, how are we doing on schedule and how are we doing on risks? Are we running a lot of risks? Is it high right now or are we low on risks?"
                speaker="Jennifer"
                topic="The executive view of portfolio health"
              />
              <Quote
                text="The idea here is for us to... identify quickly, you know, the 20/80 rule — what 20 percent of the issues are going to occupy 80 percent of our time. Where should we focus? What's green is green. What's red is red. And then that yellow state in between are things that are of concern that we need to be watchful of."
                speaker="Ro"
                topic="Visual hierarchy and the 80/20 rule"
              />
              <Quote
                text="I really don't want a construction team and a project manager sitting there thinking I've got 100 things that are on my mind... I don't want 80 percent of them. I want to see the big 20 percent of them. And I think this is their opportunity to make senior leadership aware of the larger risk items that are out there that they're worried about..."
                speaker="Jeff"
                topic="Filtering noise — surfacing only what matters to leadership"
              />
              <Quote
                text="A lot of firms use like a 3 by 3 or a 5 by 5 risk matrix, which is based on potential probability... and the impact of that risk if it occurred. And then they score it on this five by five matrix."
                speaker="Nicolas"
                topic="How owners score risk today"
              />
              <Quote
                text="There's a pre-mitigation risk, there's a post-mitigation risk. So risk, you say if it happens, you know, it's four and a half out of five. But then we have mitigation measures and then we track those and then post-mitigation it is, you know, three out of five..."
                speaker="Nicolas"
                topic="Tracking mitigation over the risk lifecycle"
              />
              <Quote
                text="We are linking our risks to specific schedule events. So what we want to know is if you're 50% done with that event, you should be 50% done with your risk... The flip side, too, is have they moved the risk? You need the visibility into that. So, where's the risk going? What's the movement on it?"
                speaker="Mike C"
                topic="Linking risk directly to schedule progress"
              />
            </div>

            <div style={{
              marginTop: 24,
              background: '#fff',
              border: '1px solid #e8ebef',
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>What this tells us</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { theme: 'Cost + Schedule first', detail: 'Every executive defines health the same way. The framework starts there and adds dimensions on top.' },
                  { theme: 'RAG is the interface', detail: 'Red / Yellow / Green is the universal mental model. The UI must surface status, not raw numbers.' },
                  { theme: 'Filter to the 20%', detail: 'Leadership does not want comprehensive lists. They want the critical few items surfaced automatically.' },
                  { theme: 'Lifecycle matters', detail: 'Pre-mitigation → mitigation → post-mitigation is how practitioners think. The Risk Record must model this arc.' },
                  { theme: 'Schedule linkage', detail: 'Risks tied to schedule events, with movement tracked over time, is a specific and repeated ask.' },
                  { theme: 'Starter templates + customization', detail: '5×5 matrices are the default mental model but every firm calibrates them differently. Defaults must be editable.' },
                ].map(({ theme, detail }) => (
                  <div key={theme} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                    <span style={{
                      fontWeight: 600,
                      color: '#3c4856',
                      minWidth: 180,
                      flexShrink: 0,
                    }}>
                      {theme}
                    </span>
                    <span style={{ color: '#566578', lineHeight: 1.6 }}>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              <WorkaroundCard
                rank={1}
                company="Dragados UK, Related Companies"
                method="Correspondence as risk register"
                failure="Saved view workaround — no scoring, no cross-project roll-up, parallel Excel required"
              />
              <WorkaroundCard
                rank={2}
                company="St. Luke's Health System"
                method="Forms as risk register"
                failure="Probabilistic scoring, but one instance per project, no aggregation, Power BI integration broken"
              />
              <WorkaroundCard
                rank={3}
                company="Sparus"
                method="External tool entirely"
                failure="Full S-curve model outside Procore — Procore was explicitly told it has no risk register"
              />
              <WorkaroundCard
                rank={4}
                company="Willmeng"
                method="Procore Analytics"
                failure="Mainly financial, unreliable data quality, needs customization for quality/safety types"
              />
              <WorkaroundCard
                rank={5}
                company="Dragados (fallback)"
                method="Hyperlink to Excel"
                failure="Captures nothing in Procore"
              />
            </div>

            <div style={{
              background: '#fff',
              border: '2px solid #c45a2e',
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>The universal failure point</div>
              <p style={{ margin: 0, fontSize: 14, color: '#566578', lineHeight: 1.65 }}>
                Every customer hits the same wall: <strong style={{ color: '#3c4856' }}>cross-project aggregation</strong>.
                The Risk Signal layer — aggregating Risk Records across projects into a portfolio-level view —
                is what none of them can build with current Procore tools.
              </p>
            </div>

            <div style={{
              marginTop: 16,
              background: '#fff',
              border: '2px solid #566578',
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Convergent design evidence</div>
              <p style={{ margin: 0, fontSize: 14, color: '#566578', lineHeight: 1.65 }}>
                Two separate Procore accounts independently named their fieldset{' '}
                <em>"Risk Identification Default"</em> and built nearly identical schemas.
                Customers are designing this product without help.
              </p>
            </div>
          </section>

          {/* THE SYSTEM */}
          <SectionAnchor id="system" />
          <section style={{ marginBottom: 80 }}>
            <SectionLabel>The System</SectionLabel>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>
              Two questions. Every level of scope.
            </h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 32, maxWidth: 680 }}>
              Health & Risk is one unified system — not two separate modules.
              The health lens answers "where do I need to focus?" through signals and scores.
              The risk lens answers "what risks exist?" through structured Risk Records.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#2a333f' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8a97a7', fontWeight: 600, borderRadius: '6px 0 0 0' }}>Level</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8a97a7', fontWeight: 600 }}>Health lens</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#8a97a7', fontWeight: 600, borderRadius: '0 6px 0 0' }}>Risk lens</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      level: 'Portfolio',
                      health: 'Which projects are trending toward impact?',
                      risk: 'What risks are open across my portfolio?',
                    },
                    {
                      level: 'Program',
                      health: 'Which programs have cost or schedule pressure?',
                      risk: 'What risks are shared across related projects?',
                    },
                    {
                      level: 'Project',
                      health: 'How is this project performing across dimensions?',
                      risk: 'What specific risks are on this project?',
                    },
                    {
                      level: 'User',
                      health: 'What needs my attention today?',
                      risk: 'What risks am I responsible for?',
                    },
                  ].map((row, i) => (
                    <tr key={row.level} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8f8', borderBottom: '1px solid #e8ebef' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e2836' }}>{row.level}</td>
                      <td style={{ padding: '12px 16px', color: '#566578' }}>{row.health}</td>
                      <td style={{ padding: '12px 16px', color: '#566578' }}>{row.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid #e8ebef', borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Current state signals</div>
                <p style={{ margin: 0, fontSize: 14, color: '#566578', lineHeight: 1.65 }}>
                  Calculated automatically from connected tool data via the rule engine.
                  Zero manual effort. Sources: budget variance, schedule variance, contingency,
                  change events, RFI aging, inspection failures, invoice status.
                </p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e8ebef', borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Forecast signals</div>
                <p style={{ margin: 0, fontSize: 14, color: '#566578', lineHeight: 1.65 }}>
                  Derived from open Risk Records — probability × impact scores — to surface
                  what <em>could happen next</em>. The most important demo state: a project
                  currently Healthy, forecast At Risk from open high-probability risks.
                </p>
              </div>
            </div>

            <div style={{
              marginTop: 16,
              background: '#1e2836',
              borderRadius: 10,
              padding: '20px 24px',
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ color: '#8a97a7', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Current state</div>
                <StatusPill status="healthy" />
              </div>
              <div style={{ color: '#3c4856', fontSize: 20, fontWeight: 300 }}>→</div>
              <div>
                <div style={{ color: '#8a97a7', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Forecast (open risks)</div>
                <StatusPill status="at-risk" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ color: '#8a97a7', fontSize: 13, lineHeight: 1.55 }}>
                  3 high-probability open Risk Records on a currently-healthy project.
                  This is the signal that matters — visible before damage is done.
                </div>
              </div>
            </div>
          </section>

          {/* OBJECT MODEL */}
          <SectionAnchor id="objects" />
          <section style={{ marginBottom: 80 }}>
            <SectionLabel>Object Model</SectionLabel>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>
              Three named objects. One architecture.
            </h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 32, maxWidth: 680 }}>
              Understanding the distinction between these three objects is the architectural foundation.
              Each lives at a different scope, serves a different purpose, and is created differently.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ObjectCard
                name="Risk Type"
                level="Account level"
                description="The admin-defined template. Defines what a risk looks like — fields, scoring behavior, health dimension mapping, default status lifecycle, and compliance framing."
                detail="Procore ships defaults (Financial, Schedule, Safety, Quality, Regulatory, Site, Contractual). Customers edit or add their own. Managed in Company Settings → Health & Risk → Risk Types."
                color="#566578"
              />
              <ObjectCard
                name="Risk Record"
                level="Project level"
                description="One record tracking one uncertainty or issue across its full lifecycle — from identification to resolution. Created manually by a project team member, or promoted from an automated signal."
                detail="Important: Risk Records are not raw source data. They are a distinct input type — human-entered or promoted — and their completeness is not guaranteed. The normalization layer treats them separately from connected tool data."
                color="#f59e0b"
              />
              <ObjectCard
                name="Risk Signal"
                level="Company level"
                description="The derived aggregation of Risk Records at the company level. Not a new object — a computed view. Clicking a Signal opens a filtered list of existing Risk Records across projects."
                detail="Also includes automated signals from connected tool data (budget variance, schedule variance, etc.). Both types surface through the same UI components but are visually distinguished by origin label. A Signal can exist with no Risk Records (tool-data only). Records enrich it with the forecast layer."
                color="#10b981"
              />
            </div>

            <div style={{
              marginTop: 24,
              background: '#fff',
              border: '1px solid #e8ebef',
              borderRadius: 10,
              padding: '20px 24px',
            }}>
              <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Signal drill-in model</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: '#566578' }}>
                <span style={{ background: '#f2f4f6', padding: '4px 12px', borderRadius: 6, fontWeight: 500, color: '#3c4856' }}>Risk Signal</span>
                <span style={{ color: '#8a97a7' }}>→ click opens</span>
                <span style={{ background: '#f2f4f6', padding: '4px 12px', borderRadius: 6, fontWeight: 500, color: '#3c4856' }}>filtered Risk Records</span>
                <span style={{ color: '#8a97a7' }}>across all projects</span>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#8a97a7', lineHeight: 1.55 }}>
                This is a query, not a new record type. The drill-in is a filtered view of existing
                records — same objects, different scope.
              </p>
            </div>
          </section>

          {/* ARCHITECTURE */}
          <SectionAnchor id="architecture" />
          <section style={{ marginBottom: 80 }}>
            <SectionLabel>Architecture</SectionLabel>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>
              Four layers. Two calculation paths.
            </h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 32, maxWidth: 680 }}>
              The system is a pipeline from raw source data to the experience layer.
              Two calculation paths run simultaneously — current-state and forecast — and return
              through the same result type.
            </p>

            <div style={{ background: '#fff', border: '1px solid #e8ebef', borderRadius: 10, overflow: 'hidden', marginBottom: 32 }}>
              <div style={{ background: '#2a333f', padding: '10px 20px' }}>
                <div style={{ color: '#8a97a7', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  System pipeline
                </div>
              </div>
              <div style={{ padding: '0 20px' }}>
                <LayerRow
                  num="1"
                  name="Source Data"
                  items={['Budget / Financial', 'Change Events', 'Schedule & Milestones', 'Risk Records', 'RFIs / Submittals', 'Invoices', 'Funding Data']}
                  note="Risk Records are distinct from tool data — completeness is not guaranteed."
                />
                <LayerRow
                  num="2"
                  name="Normalization"
                  items={['Standardize units', 'Validate completeness', 'Data integrity branch', 'Risk Record origin flag']}
                  note="Incomplete or stale data routes to the integrity branch — produces a degraded score, never suppressed."
                />
                <LayerRow
                  num="3"
                  name="Calculation"
                  items={['Current-state path', 'Forecast path', 'Threshold & rules engine', 'Portfolio roll-up']}
                  note="Both paths run simultaneously. Current: tool data → health signals. Forecast: Risk Records → probability × impact → expected exposure."
                />
                <LayerRow
                  num="4"
                  name="Experience"
                  items={['KPI Cards', 'Portfolio hub', 'Project hub', 'KPI Wizard', 'Health tearsheet']}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', border: '2px solid #566578', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8, fontSize: 14 }}>Current-state path</div>
                <div style={{ fontSize: 13, color: '#566578', lineHeight: 1.7 }}>
                  Budget vs Forecast Variance · Remaining Contingency ·
                  FTC / CAC · Schedule Variance · Milestone Rate ·
                  RFI / Submittal Aging
                </div>
              </div>
              <div style={{ background: '#fff', border: '2px solid #f59e0b', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 8, fontSize: 14 }}>Forecast path</div>
                <div style={{ fontSize: 13, color: '#566578', lineHeight: 1.7 }}>
                  Open Risk Records → probability × impact → expected cost exposure per dimension ·
                  High-probability risks on healthy projects → forecast degradation signal ·
                  Risk trend over time
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e8ebef', borderRadius: 10, padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: '#1e2836', marginBottom: 12 }}>Trust, Transparency & Action — the design principle</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { step: 'Signal', desc: 'Shows what\'s being measured. Current AND forecast together. Always interactive.' },
                  { step: 'Evidence (popover)', desc: 'Why is this flagged? Value vs. threshold. Which rule triggered it.' },
                  { step: 'Evidence (tearsheet)', desc: 'Per-dimension breakdown · open Risk Records · probability · expected exposure · trend sparkline · source labels (automated vs. manual) on every data point.' },
                  { step: 'Action', desc: 'Navigate to source · adjust threshold inline · acknowledge with note · risk response on Risk Records (Mitigate / Transfer / Accept / Close).' },
                ].map(({ step, desc }) => (
                  <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{
                      background: '#f2f4f6',
                      border: '1px solid #e8ebef',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#566578',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {step}
                    </span>
                    <span style={{ color: '#566578', lineHeight: 1.6 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DEMO CTA */}
          <SectionAnchor id="demo" />
          <section>
            <div style={{
              background: 'linear-gradient(135deg, #1e2836 0%, #3c4856 100%)',
              borderRadius: 16,
              padding: '48px 40px',
              textAlign: 'center',
            }}>
              <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
                See it in the prototype
              </h2>
              <p style={{ color: '#8a97a7', fontSize: 16, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.65 }}>
                The prototype shows the portfolio health dashboard, per-project risk cards
                with current + forecast status, and the configurable Health & Risk settings page.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/portfolio/health"
                  style={{
                    background: '#566578',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Portfolio Health →
                </Link>
                <Link
                  href="/portfolio"
                  style={{
                    background: 'transparent',
                    color: '#8a97a7',
                    border: '1px solid #3c4856',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Full Portfolio Hub
                </Link>
                <Link
                  href="/settings/health-risk"
                  style={{
                    background: 'transparent',
                    color: '#8a97a7',
                    border: '1px solid #3c4856',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  H&amp;R Settings
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
