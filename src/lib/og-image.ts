import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DefaultTemplate,
  JournalTemplate,
  ProjectsTemplate,
  PageTemplate,
} from './og-templates';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(__dirname, '..', 'assets', 'fonts');

// Module-scope font cache for warm serverless instances
let instrumentSerifData: ArrayBuffer | null = null;
let dmSansData: ArrayBuffer | null = null;

function loadFonts() {
  if (!instrumentSerifData) {
    instrumentSerifData = readFileSync(
      join(fontsDir, 'InstrumentSerif-Regular.ttf')
    ).buffer as ArrayBuffer;
  }
  if (!dmSansData) {
    dmSansData = readFileSync(
      join(fontsDir, 'DMSans-Regular.ttf')
    ).buffer as ArrayBuffer;
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
  const [instrumentSerif, dmSans] = loadFonts();

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
