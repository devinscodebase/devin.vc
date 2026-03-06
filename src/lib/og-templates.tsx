import React from 'react';

// Design tokens (hex for Satori compatibility)
const colors = {
  bg: '#0a0a08',
  bgSubtle: '#111110',
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

// Tag → accent color mapping
const tagColors: Record<string, string> = {
  essay: colors.teal,
  leadership: colors.amber,
  process: colors.accent,
  guide: colors.amber,
  note: colors.muted,
};

function getTagColor(tag?: string): string {
  if (!tag) return colors.teal;
  return tagColors[tag.toLowerCase()] || colors.teal;
}

// Shared wrapper: dark bg with radial glow, gradient top bar, branding bottom
function OgWrapper({
  children,
  accentColor = colors.teal,
}: {
  children: React.ReactNode;
  accentColor?: string;
}) {
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
      {/* Radial glow for depth */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '-200px',
          right: '-100px',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: '-300px',
          left: '-200px',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.accent}12 0%, transparent 70%)`,
        }}
      />

      {/* Gradient top bar */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '6px',
          background: `linear-gradient(to right, ${colors.teal}, ${colors.accent}, ${colors.amber})`,
        }}
      />

      {/* Content area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '56px 72px',
          justifyContent: 'center',
          position: 'relative',
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
          padding: '0 72px 36px',
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

// Gradient horizontal rule with accent color
function GradientRule({ color = colors.teal }: { color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '80px',
        height: '2px',
        background: `linear-gradient(to right, ${color}, ${colors.accent})`,
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
  subtitle,
  tag,
  date,
}: {
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
}) {
  const len = title.length;
  const fontSize = len > 60 ? 64 : len > 40 ? 76 : 88;
  const accentColor = getTagColor(tag);

  // Truncate subtitle for OG display
  const truncatedSubtitle = subtitle && subtitle.length > 90
    ? subtitle.slice(0, 87).replace(/\s+\S*$/, '') + '...'
    : subtitle;

  return (
    <OgWrapper accentColor={accentColor}>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Accent side stripe */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: '-72px',
            top: '0',
            width: '4px',
            height: '100%',
            background: `linear-gradient(to bottom, ${accentColor}, ${colors.accent}, transparent)`,
          }}
        />

        {/* Tag + date row */}
        {(tag || date) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '16px',
            }}
          >
            {tag && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  color: colors.bg,
                  backgroundColor: accentColor,
                  padding: '4px 14px',
                  borderRadius: '4px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            )}
            {date && (
              <span
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  color: colors.muted,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
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
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>

        {/* Description / subtitle */}
        {truncatedSubtitle && (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 26,
              color: colors.muted,
              marginTop: '24px',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {truncatedSubtitle}
          </span>
        )}

        <GradientRule color={accentColor} />
      </div>
    </OgWrapper>
  );
}

// Projects page OG
export function ProjectsTemplate() {
  return (
    <OgWrapper accentColor={colors.amber}>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Background number */}
        <span
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-20px',
            fontFamily: fonts.serif,
            fontSize: 280,
            color: `${colors.muted}08`,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          05
        </span>

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
        <GradientRule color={colors.amber} />
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
