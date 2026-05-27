import React from 'react';

// Design tokens — hex equivalents of the live dark-mode CSS tokens.
// Satori requires concrete colors (no CSS custom properties).
const colors = {
  bg: '#0a0a08',           // --color-bg
  surface: '#1a1612',      // --color-surface
  text: '#ede8df',         // --color-text
  muted: '#a09488',        // --color-text-muted
  subtle: '#8a7d6e',       // --color-text-subtle
  accent: '#c4a47c',       // --color-accent (warm gold)
  teal: '#5a8b85',         // --color-accent-teal — desaturated teal for warm palette
  amber: '#dba85b',        // --color-accent-amber
  rust: '#c87045',         // --color-accent-rust — lifted to match amber band
};

const fonts = {
  display: 'Funnel Display',
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
  if (!tag) return colors.accent;
  return tagColors[tag.toLowerCase()] || colors.accent;
}

/**
 * Shared wrapper for every OG image.
 *
 * Aesthetic: single accent hairline at the top, one subtle warm radial in
 * the corner for depth, "devin.vc" wordmark at bottom-left, accent-colored
 * tag chip at bottom-right (if provided). No rainbow gradient bar, no
 * 3-dot decoration. Editorial precision, not template kit.
 */
function OgWrapper({
  children,
  accentColor = colors.accent,
  cornerLabel,
}: {
  children: React.ReactNode;
  accentColor?: string;
  cornerLabel?: string;
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
      {/* Single subtle warm radial — depth without gimmickry */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '-220px',
          right: '-160px',
          width: '720px',
          height: '720px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}1a 0%, transparent 65%)`,
        }}
      />

      {/* Accent hairline at top */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '2px',
          backgroundColor: accentColor,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '64px 72px',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {children}
      </div>

      {/* Bottom row: wordmark + optional corner label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '0 72px 44px',
        }}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 22,
            color: colors.text,
            letterSpacing: '-0.015em',
          }}
        >
          devin.vc
        </span>
        {cornerLabel && (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              color: colors.subtle,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {cornerLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// Short accent rule used under headlines
function AccentRule({ color = colors.accent }: { color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        width: '64px',
        height: '2px',
        backgroundColor: color,
        marginTop: '32px',
      }}
    />
  );
}

// Homepage / default OG
export function DefaultTemplate() {
  return (
    <OgWrapper cornerLabel="Marketing · Operations · Design · GTM">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 96,
            color: colors.text,
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
          }}
        >
          Devin Alexander
        </span>
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 400,
            fontSize: 30,
            color: colors.muted,
            marginTop: '24px',
            lineHeight: 1.35,
            maxWidth: '900px',
          }}
        >
          A decade of marketing work across four countries and thirteen industries.
        </span>
        <AccentRule />
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

  return (
    <OgWrapper accentColor={accentColor} cornerLabel={date}>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Tag chip */}
        {tag && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '28px',
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 16,
                fontWeight: 500,
                color: colors.bg,
                backgroundColor: accentColor,
                padding: '6px 14px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          </div>
        )}

        {/* Title */}
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize,
            color: colors.text,
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
          }}
        >
          {title}
        </span>

        {/* Subtitle */}
        {subtitle && (
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 26,
              color: colors.muted,
              marginTop: '24px',
              lineHeight: 1.4,
              maxWidth: '960px',
            }}
          >
            {subtitle}
          </span>
        )}

        <AccentRule color={accentColor} />
      </div>
    </OgWrapper>
  );
}

// Projects page OG
export function ProjectsTemplate() {
  return (
    <OgWrapper accentColor={colors.amber} cornerLabel="Selected work">
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Large background numeral — editorial touch */}
        <span
          style={{
            position: 'absolute',
            top: '-90px',
            right: '-30px',
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 280,
            color: `${colors.amber}0d`,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          05
        </span>

        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 80,
            color: colors.text,
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
          }}
        >
          Selected Work
        </span>
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 26,
            color: colors.muted,
            marginTop: '22px',
            lineHeight: 1.4,
          }}
        >
          Platforms and brands I've helped build.
        </span>
        <AccentRule color={colors.amber} />
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
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 88,
            color: colors.text,
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
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
              marginTop: '24px',
              lineHeight: 1.4,
              maxWidth: '960px',
            }}
          >
            {subtitle}
          </span>
        )}
        <AccentRule />
      </div>
    </OgWrapper>
  );
}
