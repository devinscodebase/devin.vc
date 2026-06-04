import { describe, test, expect } from 'bun:test';
import {
  VISUAL_TERMS,
  escapeHtml,
  emphasize,
  headlineHtml,
  subtitleHtml,
  resolveHeroSlides,
  resolveShowcase,
  countVisualTerms,
  showcaseTitleOf,
  categoriesTitleOf,
  type HeroSlideInput,
} from './training-landing';

describe('escapeHtml', () => {
  test('escapes the HTML-significant characters', () => {
    expect(escapeHtml('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });
  test('escapes & before angle brackets (no double-escaping)', () => {
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });
  test('leaves plain text untouched', () => {
    expect(escapeHtml('Advertising Word List')).toBe('Advertising Word List');
  });
});

describe('emphasize', () => {
  test('renders *phrase* as <em>', () => {
    expect(emphasize('fully *defined* here')).toBe('fully <em>defined</em> here');
  });
  test('handles multiple emphasis spans', () => {
    expect(emphasize('*a* and *b*')).toBe('<em>a</em> and <em>b</em>');
  });
  test('escapes HTML before applying emphasis (no injection)', () => {
    expect(emphasize('*<script>*')).toBe('<em>&lt;script&gt;</em>');
  });
  test('leaves an unmatched lone asterisk as-is', () => {
    expect(emphasize('5 * 5 = 25')).toBe('5 * 5 = 25');
  });
  test('text with no asterisks is unchanged', () => {
    expect(emphasize('plain copy')).toBe('plain copy');
  });
});

describe('headlineHtml', () => {
  test('converts newlines to <br /> (preserving authored line breaks)', () => {
    expect(headlineHtml('Advertising\nWord List', 'X')).toBe(
      'Advertising<br />Word List'
    );
  });
  test('handles CRLF newlines', () => {
    expect(headlineHtml('A\r\nB', 'X')).toBe('A<br />B');
  });
  test('falls back to the title when headline is empty', () => {
    expect(headlineHtml('', 'SEO Word List')).toBe('SEO Word List');
    expect(headlineHtml(null, 'SEO Word List')).toBe('SEO Word List');
    expect(headlineHtml(undefined, 'SEO Word List')).toBe('SEO Word List');
  });
  test('escapes HTML in the headline', () => {
    expect(headlineHtml('A & <B>', 'X')).toBe('A &amp; &lt;B&gt;');
  });
});

describe('subtitleHtml', () => {
  test('uses the CMS subtitle with emphasis', () => {
    expect(subtitleHtml('terms, *clearly defined*.', 73)).toBe(
      'terms, <em>clearly defined</em>.'
    );
  });
  test('falls back to a term-count line when blank', () => {
    expect(subtitleHtml('', 132)).toBe('132 terms, <em>clearly defined</em>.');
    expect(subtitleHtml(null, 110)).toBe('110 terms, <em>clearly defined</em>.');
  });
});

describe('resolveHeroSlides', () => {
  const registry = { retargeting: 'R', 'click-rate': 'C', conversion: 'V' };

  test('maps known visual keys to their component and keeps term/note', () => {
    const slides: HeroSlideInput[] = [
      { visual: 'retargeting', term: 'Retargeting', note: 'trails you' },
    ];
    expect(resolveHeroSlides(slides, registry)).toEqual([
      { Visual: 'R', term: 'Retargeting', note: 'trails you' },
    ]);
  });

  test('drops slides whose visual key is not in the registry', () => {
    const slides: HeroSlideInput[] = [
      { visual: 'retargeting', term: 'Retargeting', note: 'a' },
      { visual: 'does-not-exist', term: 'Ghost', note: 'b' },
      { visual: 'conversion', term: 'Conversion', note: 'c' },
    ];
    const out = resolveHeroSlides(slides, registry);
    expect(out.map((s) => s.term)).toEqual(['Retargeting', 'Conversion']);
  });

  test('preserves source order', () => {
    const slides: HeroSlideInput[] = [
      { visual: 'conversion', term: 'C', note: '' },
      { visual: 'retargeting', term: 'R', note: '' },
    ];
    expect(resolveHeroSlides(slides, registry).map((s) => s.Visual)).toEqual([
      'V',
      'R',
    ]);
  });

  test('null/undefined/empty slides yield an empty array (hero collapses)', () => {
    expect(resolveHeroSlides(null, registry)).toEqual([]);
    expect(resolveHeroSlides(undefined, registry)).toEqual([]);
    expect(resolveHeroSlides([], registry)).toEqual([]);
  });

  test('an SEO list referencing only unbuilt visuals collapses the hero', () => {
    const slides: HeroSlideInput[] = [
      { visual: 'keyword-research', term: 'Keyword Research', note: '' },
    ];
    expect(resolveHeroSlides(slides, registry)).toEqual([]);
  });
});

describe('resolveShowcase', () => {
  test('keeps a lead + pair that all have visuals', () => {
    const r = resolveShowcase('Storyboard', ['Geo-Targeting', 'A/B Test']);
    expect(r).toEqual({
      leadTerm: 'Storyboard',
      pairTerms: ['Geo-Targeting', 'A/B Test'],
      show: true,
    });
  });

  test('drops a lead with no visual', () => {
    const r = resolveShowcase('Made Up Term', ['Geo-Targeting']);
    expect(r.leadTerm).toBeNull();
    expect(r.pairTerms).toEqual(['Geo-Targeting']);
    expect(r.show).toBe(true);
  });

  test('filters pair terms without visuals', () => {
    const r = resolveShowcase('Storyboard', ['Geo-Targeting', 'Nope']);
    expect(r.pairTerms).toEqual(['Geo-Targeting']);
  });

  test('caps the pair at two specimens', () => {
    const r = resolveShowcase('Storyboard', [
      'Geo-Targeting',
      'A/B Test',
      'Reach',
    ]);
    expect(r.pairTerms).toEqual(['Geo-Targeting', 'A/B Test']);
  });

  test('no valid specimens -> showcase hidden (SEO list case)', () => {
    expect(resolveShowcase(null, null)).toEqual({
      leadTerm: null,
      pairTerms: [],
      show: false,
    });
    expect(resolveShowcase('Keyword', ['Backlink']).show).toBe(false);
  });

  test('respects a custom visual-terms set', () => {
    const set = new Set(['Backlink']);
    const r = resolveShowcase('Backlink', ['Keyword'], set);
    expect(r.leadTerm).toBe('Backlink');
    expect(r.pairTerms).toEqual([]);
  });
});

describe('countVisualTerms', () => {
  test('counts only terms that have a visual', () => {
    const terms = [
      { term: 'Storyboard' }, // has visual
      { term: 'A/B Test' }, // has visual
      { term: 'Totally Made Up' }, // none
    ];
    expect(countVisualTerms(terms)).toBe(2);
  });
  test('an all-SEO list with no advertising visuals counts zero', () => {
    const terms = [{ term: 'Crawl Budget' }, { term: 'Canonical Tag' }];
    expect(countVisualTerms(terms)).toBe(0);
  });
});

describe('title fallbacks', () => {
  test('showcaseTitleOf returns the CMS value or a default', () => {
    expect(showcaseTitleOf('From the ad to the sale')).toBe(
      'From the ad to the sale'
    );
    expect(showcaseTitleOf('')).toBe('Some words are easier to show than to say');
    expect(showcaseTitleOf(null)).toBe(
      'Some words are easier to show than to say'
    );
  });
  test('categoriesTitleOf returns the CMS value or a count-based default', () => {
    expect(categoriesTitleOf('Browse the brief', 5)).toBe('Browse the brief');
    expect(categoriesTitleOf('', 7)).toBe('Browse all 7 categories');
  });
});

describe('VISUAL_TERMS canonical set', () => {
  test('contains the advertising showcase specimens', () => {
    for (const t of ['Storyboard', 'Geo-Targeting', 'A/B Test']) {
      expect(VISUAL_TERMS.has(t)).toBe(true);
    }
  });
  test('does not contain arbitrary non-advertising terms', () => {
    expect(VISUAL_TERMS.has('Crawl Budget')).toBe(false);
    expect(VISUAL_TERMS.has('')).toBe(false);
  });
});

// End-to-end-ish: feed the helpers the actual shapes the two kinds of asset
// produce, and assert the page would render the right thing.
describe('asset scenarios', () => {
  const adRegistry = {
    retargeting: 'R',
    'click-rate': 'C',
    conversion: 'V',
    frequency: 'F',
    bounce: 'B',
  };

  test('advertising list (fully authored) shows hero + showcase', () => {
    const asset = {
      title: 'Advertising Word List',
      heroHeadline: 'Advertising\nWord List',
      heroSubtitle:
        '73 of the most important terms in advertising, *fully defined and visualized*.',
      heroSlides: [
        { visual: 'retargeting', term: 'Retargeting', note: 'a' },
        { visual: 'click-rate', term: 'Click-Through Rate', note: 'b' },
        { visual: 'conversion', term: 'Conversion', note: 'c' },
        { visual: 'frequency', term: 'Frequency', note: 'd' },
        { visual: 'bounce', term: 'Bounce Rate', note: 'e' },
      ] as HeroSlideInput[],
      showcaseLead: 'Storyboard',
      showcasePair: ['Geo-Targeting', 'A/B Test'],
    };

    const hero = resolveHeroSlides(asset.heroSlides, adRegistry);
    const showcase = resolveShowcase(asset.showcaseLead, asset.showcasePair);

    expect(hero).toHaveLength(5);
    expect(hero.length > 0).toBe(true); // showHero
    expect(headlineHtml(asset.heroHeadline, asset.title)).toBe(
      'Advertising<br />Word List'
    );
    expect(subtitleHtml(asset.heroSubtitle, 73)).toContain(
      '<em>fully defined and visualized</em>'
    );
    expect(showcase.show).toBe(true);
    expect(showcase.leadTerm).toBe('Storyboard');
    expect(showcase.pairTerms).toEqual(['Geo-Targeting', 'A/B Test']);
  });

  test('brand-new SEO list (no landing fields) degrades to title + no visuals', () => {
    const asset = {
      title: 'SEO Word List',
      heroHeadline: null,
      heroSubtitle: null,
      heroSlides: null,
      showcaseLead: null,
      showcasePair: null,
    };

    const hero = resolveHeroSlides(asset.heroSlides, adRegistry);
    const showcase = resolveShowcase(asset.showcaseLead, asset.showcasePair);

    expect(hero).toEqual([]); // hero collapses to one column
    expect(showcase.show).toBe(false); // showcase section skipped
    expect(headlineHtml(asset.heroHeadline, asset.title)).toBe('SEO Word List');
    expect(subtitleHtml(asset.heroSubtitle, 132)).toBe(
      '132 terms, <em>clearly defined</em>.'
    );
  });
});
