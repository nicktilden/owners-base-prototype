import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_SECTIONS: Section[] = [
  { id: 'problem', label: 'The Problem' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'concepts', label: 'Core Concepts' },
  { id: 'demo', label: 'See It Live' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} style={{ scrollMarginTop: 80 }} />;
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
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}

function ConceptCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8ebef',
      borderRadius: 10,
      padding: '20px 24px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, color: '#1e2836', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#566578', lineHeight: 1.6 }}>{description}</div>
      </div>
    </div>
  );
}

function UseCaseCard({ role, scenario, outcome }: { role: string; scenario: string; outcome: string }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8ebef',
      borderRadius: 10,
      padding: '20px 24px',
    }}>
      <Tag color="#566578">{role}</Tag>
      <p style={{ margin: '12px 0 8px', fontWeight: 500, color: '#1e2836', fontSize: 15 }}>{scenario}</p>
      <p style={{ margin: 0, fontSize: 14, color: '#566578', lineHeight: 1.6 }}>
        <strong style={{ color: '#3c4856' }}>Outcome:</strong> {outcome}
      </p>
    </div>
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
        <title>Health &amp; Risk — Feature Overview</title>
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
          gap: 0,
          padding: '0 32px',
          height: 56,
        }}>
          <span style={{ color: '#8a97a7', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 24 }}>
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
          <Tag color="#8a97a7">Health &amp; Risk</Tag>
          <h1 style={{
            color: '#fff',
            fontSize: 44,
            fontWeight: 700,
            margin: '20px 0 16px',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}>
            Know what&apos;s wrong<br />before it&apos;s too late
          </h1>
          <p style={{
            color: '#8a97a7',
            fontSize: 18,
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            A unified signal layer that aggregates schedule, budget, action item,
            and risk data across your entire portfolio — surfacing problems early,
            not after the damage is done.
          </p>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 24px 120px' }}>

          {/* THE PROBLEM */}
          <SectionAnchor id="problem" />
          <section style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>The Problem</h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 24 }}>
              Owner organizations manage dozens — sometimes hundreds — of concurrent construction
              projects. Each project generates a constant stream of updates across schedule, budget,
              RFIs, submittals, punch items, and risks. Today that information lives in silos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { icon: '📊', text: 'Status reports arrive weekly, by email, manually assembled by PMs' },
                { icon: '🔍', text: 'Executives have no way to spot a troubled project without drilling in' },
                { icon: '⏰', text: 'Issues surface at monthly reviews — weeks after corrective action was possible' },
                { icon: '🗂️', text: 'Risk registers live in spreadsheets, disconnected from live project data' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  background: '#fff3f0',
                  border: '1px solid #fcd5c2',
                  borderRadius: 8,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 14, color: '#4e2414', lineHeight: 1.55 }}>{text}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7 }}>
              The result: owners are always reacting. By the time a project is flagged as red,
              the schedule has already slipped, the budget has already overrun, and the team is
              already in firefighting mode.
            </p>
          </section>

          {/* USE CASES */}
          <SectionAnchor id="use-cases" />
          <section style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Use Cases</h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 24 }}>
              Health &amp; Risk is designed for three primary audiences across the owner organization.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <UseCaseCard
                role="Executive / Board"
                scenario="Monthly portfolio review — which projects need my attention?"
                outcome="A single health score per project with a traffic-light status makes the answer visible in under 30 seconds, without opening a single project."
              />
              <UseCaseCard
                role="Portfolio Manager"
                scenario="A project just turned yellow. What changed, and what's the recommended action?"
                outcome="The risk card shows which signal triggered the change (e.g. schedule variance exceeded threshold) and surfaces the linked open action items."
              />
              <UseCaseCard
                role="Project Manager"
                scenario="I want to log a new risk and tie it to a mitigation plan before the next owner meeting."
                outcome="The risk register accepts structured risk entries with likelihood, impact, owner, and due date — all visible to the portfolio level immediately."
              />
            </div>
          </section>

          {/* CORE CONCEPTS */}
          <SectionAnchor id="concepts" />
          <section style={{ marginBottom: 72 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1e2836', marginBottom: 8 }}>Core Concepts</h2>
            <p style={{ fontSize: 16, color: '#566578', lineHeight: 1.7, marginBottom: 24 }}>
              The feature is built around five interlocking concepts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ConceptCard
                icon="🟢"
                title="Health Score"
                description="A composite 0–100 score computed from schedule variance, budget variance, open action item age, and risk exposure. Rendered as a traffic-light status (Green / Yellow / Red) at both project and portfolio level."
              />
              <ConceptCard
                icon="📡"
                title="Signals"
                description="Individual data inputs that feed the health score — e.g. 'Schedule SPI < 0.85', 'Budget overrun > 5%', '3+ overdue action items'. Each signal has a configurable threshold and weight."
              />
              <ConceptCard
                icon="⚠️"
                title="Risk Register"
                description="A structured log of identified risks per project, each with likelihood (1–5), impact (1–5), an assigned owner, a due date, and a mitigation note. Risk exposure = likelihood × impact, rolled up to portfolio level."
              />
              <ConceptCard
                icon="📋"
                title="Action Plans"
                description="A linked layer of corrective actions tied to flagged risks or signals. Each action has an owner, due date, and status. Overdue actions increase the health score penalty."
              />
              <ConceptCard
                icon="⚙️"
                title="Configurable Thresholds"
                description="Portfolio admins can tune what constitutes a 'yellow' vs 'red' threshold for each signal type — letting organizations calibrate sensitivity to their risk appetite."
              />
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
              <p style={{ color: '#8a97a7', fontSize: 16, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.65 }}>
                The live prototype shows the portfolio health dashboard, per-project risk cards,
                and the configurable threshold settings page. Click below to open it.
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
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
