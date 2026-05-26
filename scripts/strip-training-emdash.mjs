// Strip em-dashes from trainingAsset documents in Sanity.
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');

const PROJECT = 'ka7dwvnq';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const groq = `*[_type=="trainingAsset"]{...}`;
const url = `${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const data = await res.json();

function strip(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/ — /g, ', ');
}

function walk(v) {
  if (typeof v === 'string') return strip(v);
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = walk(val);
    return out;
  }
  return v;
}

const mutations = [];
for (const doc of data.result) {
  const patches = {};
  for (const key of ['title', 'tagline', 'description', 'terms']) {
    if (doc[key] == null) continue;
    const next = walk(doc[key]);
    if (JSON.stringify(doc[key]) !== JSON.stringify(next)) {
      patches[key] = next;
    }
  }
  if (Object.keys(patches).length > 0) {
    mutations.push({ patch: { id: doc._id, set: patches } });
    console.log(`Patching ${doc.title}: ${Object.keys(patches).join(', ')}`);
  }
}

if (mutations.length === 0) {
  console.log('Nothing to change.');
  process.exit(0);
}

const r = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
});
console.log(await r.text());
