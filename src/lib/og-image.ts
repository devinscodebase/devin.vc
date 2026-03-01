import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  DefaultTemplate,
  JournalTemplate,
  ProjectsTemplate,
  PageTemplate,
} from './og-templates';

const INSTRUMENT_SERIF_URL =
  'https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf';
const DM_SANS_URL =
  'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf';

// Module-scope font cache for warm serverless instances
let instrumentSerifData: ArrayBuffer | null = null;
let dmSansData: ArrayBuffer | null = null;

async function loadFonts() {
  if (!instrumentSerifData) {
    instrumentSerifData = await fetch(INSTRUMENT_SERIF_URL).then((r) =>
      r.arrayBuffer()
    );
  }
  if (!dmSansData) {
    dmSansData = await fetch(DM_SANS_URL).then((r) => r.arrayBuffer());
  }
  return [instrumentSerifData, dmSansData] as const;
}

export interface OgImageParams {
  type: 'default' | 'journal' | 'projects' | 'page';
  title?: string;
  subtitle?: string;
  tag?: string;
  date?: string;
}

export async function generateOgImage(params: OgImageParams): Promise<Buffer> {
  const [instrumentSerif, dmSans] = await loadFonts();

  // Build the React element based on type
  let element: React.ReactElement;
  switch (params.type) {
    case 'journal':
      element = JournalTemplate({
        title: params.title || 'Untitled',
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
        name: 'Instrument Serif',
        data: instrumentSerif,
        weight: 400,
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
