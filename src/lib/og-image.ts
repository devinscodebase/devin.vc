import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  DefaultTemplate,
  JournalTemplate,
  ProjectsTemplate,
  PageTemplate,
} from './og-templates';

// DM Sans only needs to be fetched once — Google's gstatic TTF URL is stable.
const DM_SANS_URL =
  'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf';

// Module-scope caches
let wasmInitialized = false;
let funnelRegularData: Buffer | null = null;
let funnelSemiBoldData: Buffer | null = null;
let dmSansData: ArrayBuffer | null = null;

/**
 * Funnel Display: bundled from @fontsource/funnel-display via createRequire.
 * Same pattern as the WASM module below. The Google Fonts variable TTF has an
 * fvar table that Satori's opentype.js fork can't parse, so we use static
 * weight files (Regular + SemiBold) from @fontsource instead.
 *
 * DM Sans: fetched from gstatic once and cached.
 */
async function loadFonts() {
  if (!funnelRegularData || !funnelSemiBoldData) {
    const require = createRequire(import.meta.url);
    const regularPath = require.resolve('@fontsource/funnel-display/files/funnel-display-latin-400-normal.woff');
    const semiBoldPath = require.resolve('@fontsource/funnel-display/files/funnel-display-latin-600-normal.woff');
    funnelRegularData = readFileSync(regularPath);
    funnelSemiBoldData = readFileSync(semiBoldPath);
  }
  if (!dmSansData) {
    dmSansData = await fetch(DM_SANS_URL).then((r) => r.arrayBuffer());
  }
  return [funnelRegularData, funnelSemiBoldData, dmSansData] as const;
}

export interface OgImageParams {
  type: 'default' | 'journal' | 'projects' | 'page';
  title?: string;
  subtitle?: string;
  tag?: string;
  date?: string;
}

export async function generateOgImage(params: OgImageParams): Promise<Uint8Array> {
  if (!wasmInitialized) {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve('@resvg/resvg-wasm/index_bg.wasm');
    const wasmBuffer = readFileSync(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  }
  const [funnelRegular, funnelSemiBold, dmSans] = await loadFonts();

  // Build the React element based on type
  let element: React.ReactElement;
  switch (params.type) {
    case 'journal':
      element = JournalTemplate({
        title: params.title || 'Untitled',
        subtitle: params.subtitle,
        tag: params.tag,
        date: params.date,
      });
      break;
    case 'projects':
      element = ProjectsTemplate();
      break;
    case 'page':
      element = PageTemplate({
        title: params.title || '',
        subtitle: params.subtitle,
      });
      break;
    default:
      element = DefaultTemplate();
  }

  // Satori → SVG
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Funnel Display',
        data: funnelRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Funnel Display',
        data: funnelSemiBold,
        weight: 600,
        style: 'normal',
      },
      {
        name: 'DM Sans',
        data: dmSans,
        weight: 400,
        style: 'normal',
      },
    ],
  });

  // Resvg → PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
