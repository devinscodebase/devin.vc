// Rewrites the "Advertising Word List" with advertising-specific terms only.
// Scopes: creating ads, paid media channels (digital, print, radio, TV),
// audience targeting, ad performance, attribution, and landing pages.
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');

const PROJECT = 'ka7dwvnq';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const terms = [
  // ─── The Ad Itself ───
  { group: 'The Ad Itself', term: 'Advertisement (Ad)', definition: 'A paid message designed to get someone to think about, want, or buy a specific product, service, or idea. Lives on platforms the brand does not own (TV, radio, newspapers, social media, search engines, billboards).' },
  { group: 'The Ad Itself', term: 'Creative', definition: 'The actual ad itself, the picture, video, audio, or text. When marketers say "we need new creative," they mean new ads. When they say "the creative is tired," they mean people have seen it too many times.' },
  { group: 'The Ad Itself', term: 'Ad Copy', definition: 'The written words inside an ad. The headline, the description, captions on images, and scripts read aloud in video or radio ads. Anything someone reads or hears is ad copy.' },
  { group: 'The Ad Itself', term: 'Headline', definition: 'The biggest, boldest line of text in an ad. Its only job is to make someone stop scrolling, stop flipping the page, or pay attention to a screen long enough to read the next line.' },
  { group: 'The Ad Itself', term: 'Hook', definition: 'The opening seconds of an ad designed to grab attention before someone scrolls past or skips. In a TikTok ad, it is the first three seconds. In a TV ad, the first five. Get the hook wrong and the rest of the ad never gets watched.' },
  { group: 'The Ad Itself', term: 'Call to Action (CTA)', definition: 'The line that tells someone exactly what to do next. Examples: "Shop now", "Get the free guide", "Call today", "Visit our store this Saturday". Without a clear CTA, the ad does not convert.' },
  { group: 'The Ad Itself', term: 'Ad Format', definition: 'The shape and size of an ad. Examples: a square Instagram post, a vertical TikTok video, a banner at the top of a website, a 30-second TV spot, a half-page newspaper ad. Each platform has its own formats.' },
  { group: 'The Ad Itself', term: 'Storyboard', definition: 'A frame-by-frame sketch of a video ad before it gets filmed. Shows each shot, the camera angle, what is said, and what is shown. Used to get sign-off before spending money on production.' },
  { group: 'The Ad Itself', term: 'Ad Variant', definition: 'A slight change to an existing ad. Same offer, different headline. Or same video, different opening line. Variants are how advertisers test what works without starting from scratch.' },
  { group: 'The Ad Itself', term: 'Ad Fatigue', definition: 'When the same audience has seen an ad too many times and stops paying attention. Response drops, complaints rise, and the ad starts losing money. The fix is to make a new ad.' },

  // ─── Digital Ad Channels ───
  { group: 'Digital Ad Channels', term: 'Search Ads', definition: 'Text ads that appear at the top of search engine results (Google, Bing) when someone types a specific search. High-converting because the person is actively looking for what is being sold.' },
  { group: 'Digital Ad Channels', term: 'Display Ads', definition: 'Picture or video ads shown on websites, apps, and across the internet (banners, sidebars, in-article boxes). Cheaper than search ads but the viewer is not actively looking, so conversion rates are lower.' },
  { group: 'Digital Ad Channels', term: 'Social Ads', definition: 'Paid ads on social media platforms like Facebook, Instagram, TikTok, LinkedIn, X, Snapchat, Reddit, and Pinterest. Targeted by interests and behaviors rather than what someone is searching for.' },
  { group: 'Digital Ad Channels', term: 'Video Ads', definition: 'Ads that play as video. Includes YouTube pre-rolls, TikTok in-feed videos, Instagram Reels ads, and connected-TV ads on streaming services. Usually 6 to 30 seconds long.' },
  { group: 'Digital Ad Channels', term: 'Pay-Per-Click (PPC)', definition: 'A way of paying for ads where the advertiser pays only when someone clicks. Common on Google search and Bing. If no one clicks, no money is spent.' },
  { group: 'Digital Ad Channels', term: 'Programmatic', definition: 'When ads are bought and sold by computers in real time instead of a salesperson on the phone. Each ad impression is auctioned in milliseconds as a webpage loads. Powers most modern display and video ads.' },
  { group: 'Digital Ad Channels', term: 'Retargeting (Remarketing)', definition: 'Ads shown specifically to people who already visited a website or app but did not buy. Example: you look at a pair of shoes on a brand site, then those same shoes follow you around for a week. That is retargeting.' },
  { group: 'Digital Ad Channels', term: 'Native Ads', definition: 'Ads designed to look and feel like the regular content around them. Sponsored articles inside a news feed, suggested posts in social, recommended videos on YouTube. They blend in on purpose so people watch or read them.' },
  { group: 'Digital Ad Channels', term: 'Connected TV (CTV)', definition: 'Ads that play on streaming services watched through a TV (Hulu, YouTube TV, Roku, Amazon Fire TV). Looks like a TV commercial but bought and targeted like a digital ad.' },
  { group: 'Digital Ad Channels', term: 'Out-of-Home (OOH)', definition: 'Any ad seen outside the house: billboards, bus stop posters, taxi-top signs, stadium banners, mall kiosks. Digital OOH means the same locations but with digital screens that can change ads remotely.' },

  // ─── Print Advertising ───
  { group: 'Print Advertising', term: 'Print Ad', definition: 'An ad in a physical printed publication: newspaper, magazine, brochure, or direct-mail piece. Sold by size (full page, half page) and position (front of magazine, back cover).' },
  { group: 'Print Advertising', term: 'Full-Page Ad', definition: 'A print ad that fills an entire page of a newspaper or magazine. The most expensive but most attention-grabbing size in a publication.' },
  { group: 'Print Advertising', term: 'Spread', definition: 'A print ad that spans two facing pages in a magazine, creating one wide horizontal image. Usually the most expensive ad in any issue.' },
  { group: 'Print Advertising', term: 'Above the Fold (Print)', definition: 'The top half of a newspaper page that is visible when the paper is folded on a newsstand. Ads here cost more because that is what people see first.' },
  { group: 'Print Advertising', term: 'Classified', definition: 'A small, text-only ad grouped with similar ads by category (jobs, real estate, used cars). Cheap, sold by the word or line, common in newspapers and trade publications.' },
  { group: 'Print Advertising', term: 'Bleed', definition: 'When a print ad runs all the way to the edge of the page with no white border. Costs slightly more because it requires extra paper that gets trimmed off after printing.' },
  { group: 'Print Advertising', term: 'CMYK', definition: 'The four ink colors (Cyan, Magenta, Yellow, blacK) used in most printing. Designers must build print ads in CMYK so the colors print correctly. Screens use a different system (RGB), so a logo can look different on paper than on a phone.' },
  { group: 'Print Advertising', term: 'Insertion Order', definition: 'The signed paperwork that locks in a print ad buy. Specifies which issue, what size, what page, and the price. Once signed, the publication holds the space.' },
  { group: 'Print Advertising', term: 'Direct Mail', definition: 'Ads sent through the postal service: postcards, flyers, catalogs, letters. Targeted by address, ZIP code, or mailing list. Still works well for local businesses and re-engaging past customers.' },

  // ─── Radio & Audio Advertising ───
  { group: 'Radio & Audio Advertising', term: 'Spot', definition: 'A single play of a radio or TV ad. A "30-second spot" is a single 30-second ad. Buying "20 spots" means the ad will play 20 times in a given week.' },
  { group: 'Radio & Audio Advertising', term: 'Daypart', definition: 'A block of hours on radio or TV used to price ads. Examples: morning drive (6-10am), midday, afternoon drive (3-7pm), evening, overnight. Morning and afternoon drive cost the most because that is when most people listen in their cars.' },
  { group: 'Radio & Audio Advertising', term: 'Drive Time', definition: 'The morning and afternoon commute hours on radio (roughly 6-10am and 3-7pm). The most listened-to and most expensive time to advertise.' },
  { group: 'Radio & Audio Advertising', term: 'Live Read', definition: 'When the radio host reads the ad live in their own voice instead of playing a pre-recorded version. Sounds more like a personal recommendation, which is why advertisers pay extra for it.' },
  { group: 'Radio & Audio Advertising', term: 'Streaming Audio Ads', definition: 'Ads that play between songs on services like Spotify, Pandora, iHeartRadio, and SiriusXM. Targeted by listener data (location, age, music taste) which traditional radio cannot do.' },
  { group: 'Radio & Audio Advertising', term: 'Podcast Ad', definition: 'An ad inside a podcast episode. Can be a pre-recorded clip or a "host-read" ad where the podcaster talks about the product in their own words. Host-reads tend to convert better because listeners trust the host.' },
  { group: 'Radio & Audio Advertising', term: 'Frequency Cap', definition: 'A limit on how many times one listener hears the same ad in a set time period (for example, "no more than 3 times per day"). Prevents ad fatigue.' },

  // ─── TV Advertising ───
  { group: 'TV Advertising', term: 'TV Spot', definition: 'A single airing of a TV commercial. Usually 15, 30, or 60 seconds long. The 30-second spot is still the most common length.' },
  { group: 'TV Advertising', term: 'Primetime', definition: 'The evening hours when the most people are watching TV (8-11pm in most US markets). The most expensive ad slots on TV.' },
  { group: 'TV Advertising', term: 'GRP (Gross Rating Point)', definition: 'A TV measurement that combines how many people saw an ad (reach) with how many times they saw it (frequency). "100 GRPs" roughly means the ad got the equivalent of every person in the target audience seeing it once.' },
  { group: 'TV Advertising', term: 'Upfronts', definition: 'The yearly event each spring where TV networks present their fall lineup and big advertisers buy commercial time months in advance. Buying upfront usually costs less than buying spots last-minute.' },
  { group: 'TV Advertising', term: 'Scatter Market', definition: 'TV ad slots sold close to the airdate, after the upfronts. More expensive but flexible. Used when an advertiser needs to launch a campaign quickly.' },
  { group: 'TV Advertising', term: 'Make Good', definition: 'A free replacement TV spot the network gives an advertiser when the original spot did not deliver what was promised (low ratings, technical failure, wrong time). Standard industry practice.' },
  { group: 'TV Advertising', term: 'Pod', definition: 'A group of commercials shown back-to-back during a TV break. Being the first or last ad in a pod is more valuable than being stuck in the middle because viewers pay more attention at the start and end.' },
  { group: 'TV Advertising', term: 'Co-op Advertising', definition: 'When a national brand shares the cost of a local TV or radio ad with a local retailer that sells their product. Example: a car manufacturer pays half of the local dealership\'s TV ads.' },

  // ─── Audience & Targeting ───
  { group: 'Audience & Targeting', term: 'Audience', definition: 'The specific group of people an ad is meant to reach. Defined by who they are (age, gender, location), what they do (jobs, hobbies, purchases), or what they like (interests, brands they follow).' },
  { group: 'Audience & Targeting', term: 'Demographics', definition: 'The basic facts about a person used to target ads: age, gender, income, education, marital status, location, language. The most common starting point for choosing who sees an ad.' },
  { group: 'Audience & Targeting', term: 'Geo-Targeting', definition: 'Showing ads only to people in specific places. Can be as broad as a country or as narrow as a single neighborhood, ZIP code, or a one-mile radius around a store.' },
  { group: 'Audience & Targeting', term: 'Lookalike Audience', definition: 'A new audience the ad platform builds by finding people who look and behave like an advertiser\'s existing customers. Example: upload your customer list to Meta, get back a group of strangers with similar habits.' },
  { group: 'Audience & Targeting', term: 'Custom Audience', definition: 'An audience built from data the advertiser already owns: customer email list, past website visitors, app users. Used to retarget known people instead of reaching strangers.' },
  { group: 'Audience & Targeting', term: 'Cold vs. Warm Audience', definition: 'A cold audience has never heard of the brand and needs to be introduced. A warm audience has already interacted (visited the site, watched a video, followed the page). The two need very different ads to convert.' },

  // ─── Ad Performance ───
  { group: 'Ad Performance', term: 'Impression', definition: 'One showing of an ad to one person. If someone scrolls past an ad in their feed, that is one impression, even if they did not read it. Counts every appearance, including repeats.' },
  { group: 'Ad Performance', term: 'Reach', definition: 'The number of different people who saw an ad at least once. If an ad gets 10,000 impressions but the same 1,000 people saw it 10 times each, the reach is 1,000.' },
  { group: 'Ad Performance', term: 'Frequency', definition: 'How many times the average person has seen the same ad. Calculated as impressions divided by reach. Too low and the ad does not stick. Too high and people start tuning it out.' },
  { group: 'Ad Performance', term: 'Click-Through Rate (CTR)', definition: 'The percentage of people who clicked an ad after seeing it. If 1,000 people see an ad and 20 click, CTR is 2%. A higher CTR usually means the ad is relevant and compelling.' },
  { group: 'Ad Performance', term: 'Cost Per Click (CPC)', definition: 'How much the advertiser paid for each click on the ad. If $100 was spent and 50 people clicked, CPC is $2. Common metric for search and display ads.' },
  { group: 'Ad Performance', term: 'Cost Per Thousand (CPM)', definition: 'How much it costs to show an ad to 1,000 people ("M" comes from the Roman numeral for 1,000). Used to compare the cost of reaching audiences across different platforms. $10 CPM means 1,000 impressions cost $10.' },
  { group: 'Ad Performance', term: 'Conversion', definition: 'When someone does the thing the ad was meant to make them do: bought the product, signed up, called the store, downloaded the app, filled out the form. The ad\'s definition of success.' },
  { group: 'Ad Performance', term: 'Conversion Rate', definition: 'The percentage of people who saw or clicked the ad and then converted. If 100 people click and 5 buy, the conversion rate is 5%. Higher is better.' },
  { group: 'Ad Performance', term: 'Cost Per Acquisition (CPA)', definition: 'How much it costs in ad spend to get one new customer (or one new lead, signup, sale, etc.). If $1,000 in ads produced 10 customers, CPA is $100.' },
  { group: 'Ad Performance', term: 'Return on Ad Spend (ROAS)', definition: 'Revenue made for every dollar spent on ads. A 4x ROAS means $4 in sales for every $1 in ad spend. The simplest way to know if an ad campaign is profitable.' },

  // ─── Tracking & Attribution ───
  { group: 'Tracking & Attribution', term: 'Attribution', definition: 'Figuring out which ad actually caused a sale or signup when a customer saw several ads before buying. Example: someone sees a TV ad, then a Facebook ad, then clicks a Google ad and buys. Who gets the credit?' },
  { group: 'Tracking & Attribution', term: 'Last-Click Attribution', definition: 'Giving 100% of the credit for a sale to the final ad someone clicked before buying. Easiest to measure, but it undercounts ads earlier in the journey that started the interest.' },
  { group: 'Tracking & Attribution', term: 'First-Click Attribution', definition: 'Giving all the credit for a sale to the very first ad someone interacted with. Useful for measuring which ads are good at making people discover a brand for the first time.' },
  { group: 'Tracking & Attribution', term: 'Tracking Pixel', definition: 'A small piece of invisible code installed on a website that lets the ad platform see what visitors do after clicking an ad (browsed, added to cart, bought). Meta Pixel and Google Tag are the most common.' },
  { group: 'Tracking & Attribution', term: 'UTM Parameter', definition: 'Extra text added to the end of a link (like &utm_source=facebook) so analytics tools can tell exactly which ad sent the visitor. Without UTMs, "where did this traffic come from?" often becomes a guess.' },
  { group: 'Tracking & Attribution', term: 'Conversion Tracking', definition: 'The setup that lets the ad platform know when someone who saw or clicked an ad actually bought, signed up, or did the target action. Without it, the platform cannot optimize and the advertiser is flying blind.' },

  // ─── Landing & Conversion ───
  { group: 'Landing & Conversion', term: 'Landing Page', definition: 'The web page someone lands on after clicking an ad. Built for one purpose only: turn that visitor into a customer, lead, or signup. Different from a homepage, which has many purposes.' },
  { group: 'Landing & Conversion', term: 'Above the Fold (Web)', definition: 'The part of a landing page that is visible without scrolling. Has to communicate the offer, the value, and the next step instantly. If above the fold is weak, most visitors leave.' },
  { group: 'Landing & Conversion', term: 'Lead Magnet', definition: 'A free thing offered in exchange for a name and email: a guide, checklist, calculator, template, or short video. The bait that turns ad clicks into known contacts.' },
  { group: 'Landing & Conversion', term: 'Form Fill', definition: 'When a visitor completes and submits a form on a landing page (name, email, phone). A form fill is the most common conversion for lead-generation ads.' },
  { group: 'Landing & Conversion', term: 'Bounce Rate', definition: 'The percentage of visitors who land on a page and immediately leave without doing anything. High bounce usually means the ad promised something different from what the page actually shows.' },
  { group: 'Landing & Conversion', term: 'A/B Test', definition: 'Showing two versions of the same ad (or landing page) to similar groups of people and comparing which one performs better. Only one thing changes between A and B so the result is trustworthy.' },
  { group: 'Landing & Conversion', term: 'Social Proof', definition: 'Evidence that other people already trust the product: customer testimonials, star ratings, logos of well-known clients, "10,000 customers" counters. Reduces hesitation for someone seeing the offer for the first time.' },
];

const slug = 'advertising-word-list';

// Find the existing doc
const findRes = await fetch(`${API}/data/query/${DATASET}?query=${encodeURIComponent(`*[_type=="trainingAsset" && slug.current=="${slug}"][0]{_id}`)}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const findJson = await findRes.json();
const id = findJson.result?._id;
if (!id) {
  console.error('Could not find existing advertising-word-list doc');
  process.exit(1);
}

const patch = {
  description: 'A reference for the words used in advertising, including digital ads, paid media, print, radio, TV, and out-of-home. Plain-English definitions, with examples on anything that needs one.',
  terms,
};

const res = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations: [{ patch: { id, set: patch } }] }),
});
console.log(`Replaced terms (${terms.length} entries across 8 sections).`);
console.log(await res.text());
