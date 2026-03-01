import React from 'react';

// Design tokens (hex for Satori compatibility)
const colors = {
  bg: '#0a0a08',
  text: '#ede8df',
  muted: '#a09488',
  accent: '#c4a47c',
  teal: '#5ba3a3',
  amber: '#d4a24a',
  rust: '#a04030',
};

const fonts = {
  serif: 'Instrument Serif',
  sans: 'DM Sans',
};

// Shared wrapper: dark bg, gradient top bar, branding bottom
function OgWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: colors.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient top bar */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '4px',
          background: `linear-gradient(to right, ${colors.teal}, ${colors.accent}, ${colors.amber})`,
        }}
      />

      {/* Content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '60px 72px',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {/* Bottom bar: branding + accent dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 72px 40px',
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 20,
            color: colors.muted,
            letterSpacing: '0.02em',
          }}
        >
          devin.vc
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: colors.teal,
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: colors.accent,
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: colors.amber,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Gradient horizontal rule
function GradientRule() {
  return (
    <div
      style={{
        display: 'flex',
        width: '80px',
        height: '2px',
        background: `linear-gradient(to right, ${colors.teal}, ${colors.accent})`,
        marginTop: '32px',
      }}
    />
  );
}

// Homepage / default OG
export function DefaultTemplate() {
  return (
    <OgWrapper>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: 72,
            color: colors.text,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Devin Alexander
        </span>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 28,
            color: colors.muted,
            marginTop: '20px',
            lineHeight: 1.4,
          }}
        >
          Marketing, Operations, Design & Development
        </span>
        <GradientRule />
      </div>
    </OgWrapper>
  );
}

// Journal post OG
export function JournalTemplate({
  title,
  tag,
  date,
}: {
  title: string;
  tag?: string;
  date?: string;
}) {
  // Dynamic font size based on title length
  const len = title.length;
  const fontSize = len > 60 ? 48 : len > 40 ? 56 : 64;

  return (
    <OgWrapper>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Tag + date row */}
        {(tag || date) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '12px',
            }}
          >
            {tag && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  color: colors.accent,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {tag}
              </span>
            )}
            {tag && date && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  color: colors.muted,
                }}
              >
                —
              </span>
            )}
            {date && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  color: colors.muted,
                }}
              >
                {date}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize,
            color: colors.text,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>

        <GradientRule />
      </div>
    </OgWrapper>
  );
}

// Projects page OG
export function ProjectsTemplate() {
  return (
    <OgWrapper>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: 72,
            color: colors.text,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Selected Work
        </span>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 26,
            color: colors.muted,
            marginTop: '20px',
            lineHeight: 1.4,
          }}
        >
          Platforms and brands I've helped build
        </span>
        <GradientRule />
      </div>
    </OgWrapper>
  );
}

// Generic page OG (about, work, contact, journal index)
export function PageTemplate({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <OgWrapper>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: fonts.serif,
            fontSize: 80,
            color: colors.text,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 26,
              color: colors.muted,
              marginTop: '20px',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </span>
        )}
        <GradientRule />
      </div>
    </OgWrapper>
  );
}
