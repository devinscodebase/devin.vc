// Patches the existing "SEO Word List" training asset in Sanity.
// The doc already exists (id below), so this PATCHES it rather than creating a
// duplicate. It rewrites the glossary to ~84 plain-language terms and authors
// the landing copy (hero, showcase, categories) so /training/seo-word-list
// renders fully. Run from the project root so bun can resolve env + fetch:
//   SANITY_WRITE_TOKEN=... bun run scripts/seed-seo-word-list.mjs
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');

const PROJECT = 'ka7dwvnq';
const DATASET = 'production';
const DOC_ID = 'M0oy0WfFbuvfLUzOiITTkK';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const terms = [
  // ─── Search Engine Fundamentals ───
  { group: 'Search Engine Fundamentals', term: 'SEO (Search Engine Optimization)', definition: 'The work of getting your website to show up in search results when people look for what you offer. It is not a one-time fix. It builds up slowly over months as you improve your pages, earn links, and keep your site healthy.' },
  { group: 'Search Engine Fundamentals', term: 'Search Engine', definition: 'A tool like Google that finds pages across the web and lists the ones it thinks best answer what you typed. Google handles around nine out of ten searches, so in practice SEO mostly means doing well on Google.' },
  { group: 'Search Engine Fundamentals', term: 'SERP (Search Engine Results Page)', definition: 'The page of results you see after you search. It used to be a simple list of links. Now it is a busy mix of ads, an AI answer, quick-answer boxes, maps, videos, and the normal links, all fighting for your attention.' },
  { group: 'Search Engine Fundamentals', term: 'Crawler (Bot, Spider)', definition: 'A program that visits web pages, follows the links on them, and reports back what it found to the search engine. Google\'s is called Googlebot. If it cannot reach a page, Google has no idea the page exists.' },
  { group: 'Search Engine Fundamentals', term: 'Indexing', definition: 'When a search engine saves a page into its big list of pages it can show in results. A page can be visited by Google but still not saved. Until it is saved, it cannot show up for anything.' },
  { group: 'Search Engine Fundamentals', term: 'Ranking', definition: 'Where your page lands in the list of results for a given search. The first result gets the most clicks by far. By the bottom of page one almost no one is still looking, and page two might as well not exist.' },
  { group: 'Search Engine Fundamentals', term: 'Algorithm', definition: 'The set of rules Google uses to decide which pages show up first for each search. Google changes it thousands of times a year and never fully explains how it works.' },
  { group: 'Search Engine Fundamentals', term: 'Organic Traffic', definition: 'Visitors who find you through the normal, unpaid search results. This is the whole point of SEO. It is separate from people who arrive by clicking an ad, a link on another site, or a post on social media.' },
  { group: 'Search Engine Fundamentals', term: 'AI Overview (SGE)', definition: 'The AI-written answer Google now shows at the top of many results, pulled together from several sites. It often answers the question right there, so the person never clicks through to anyone. It is the biggest recent threat to getting clicks from search.' },

  // ─── On-Page SEO ───
  { group: 'On-Page SEO', term: 'On-Page SEO', definition: 'Everything you can change on the page itself to help it rank: the wording, the headings, the links between your own pages, the images. This is the part of SEO you fully control.' },
  { group: 'On-Page SEO', term: 'Title Tag', definition: 'The clickable blue headline for your page in the search results. It is one of the most important things you can set, both for ranking and for getting people to actually click.' },
  { group: 'On-Page SEO', term: 'Meta Description', definition: 'The short summary shown under the title in search results. It does not change your ranking, but a good one gets more people to click. Google cuts it off after about 155 characters, so keep it tight.' },
  { group: 'On-Page SEO', term: 'H1', definition: 'The main heading at the top of a page, usually the biggest text. It tells both the reader and Google what the page is about in one line. Use just one per page.' },
  { group: 'On-Page SEO', term: 'H2 / H3 (Subheadings)', definition: 'The smaller headings that break a long page into sections. An H2 starts a section, an H3 is a sub-point inside it. Clear headings make a page easier to read and easier for Google to follow.' },
  { group: 'On-Page SEO', term: 'URL Slug', definition: 'The readable end of a web address, the part after your domain name. /seo-word-list is a clean one. A string of random numbers is not. Short, lowercase, and with words separated by hyphens works best.' },
  { group: 'On-Page SEO', term: 'Alt Text', definition: 'A plain text description of an image. Screen readers read it aloud to people who cannot see the image, and search engines use it to understand the picture. Describe what is actually there, do not just stuff in keywords.' },
  { group: 'On-Page SEO', term: 'Internal Link', definition: 'A link from one page on your site to another page on your site. One of the most overlooked tools in SEO. These links pass authority around your site and show Google which of your pages matter most.' },
  { group: 'On-Page SEO', term: 'Anchor Text', definition: 'The visible words you click on in a link. Search engines read these words as a hint about the page the link points to. "Click here" tells Google nothing. "Plain-English SEO definitions" tells it exactly what is there.' },
  { group: 'On-Page SEO', term: 'Image Optimization', definition: 'Shrinking your image files and saving them in modern formats so they load fast, plus giving each one a good description. It speeds up the page and helps the images turn up in image search. One of the easiest wins available.' },

  // ─── Technical SEO ───
  { group: 'Technical SEO', term: 'Technical SEO', definition: 'The behind-the-scenes health of your site: how fast it loads, how cleanly it displays, and how easily Google can move through it. Invisible to visitors, but it can make or break your rankings.' },
  { group: 'Technical SEO', term: 'Sitemap (XML Sitemap)', definition: 'A simple file that lists all the pages on your site you want Google to find. You hand it to Google so its crawler does not miss anything important.' },
  { group: 'Technical SEO', term: 'Robots.txt', definition: 'A small file at the root of your site that tells crawlers which areas they may visit and which to skip. Handy for keeping them out of admin pages and other parts you do not want in search.' },
  { group: 'Technical SEO', term: 'Canonical Tag', definition: 'A note in your page\'s code that tells Google which version is the real one when you have several pages that are nearly the same. It stops them from competing with each other and keeps their ranking power in one place.' },
  { group: 'Technical SEO', term: '301 Redirect', definition: 'A permanent forward from an old web address to a new one. It carries most of the old page\'s ranking power over to the new page. The right move when you move content for good.' },
  { group: 'Technical SEO', term: 'Broken Link (404)', definition: 'A link that points to a page that no longer exists. It frustrates visitors, wastes Google\'s time, and throws away any ranking power the missing page had. Either bring the page back or forward it somewhere useful.' },
  { group: 'Technical SEO', term: 'Core Web Vitals', definition: 'Google\'s three scores for how a page feels to use: how quickly the main content loads, how fast the page reacts when you tap or click, and how much things jump around while loading. All three need to be good to pass.' },
  { group: 'Technical SEO', term: 'CLS (Cumulative Layout Shift)', definition: 'A score for how much the page jumps around as it loads. It is the reason your thumb hits the wrong button when an image or ad pops in late and shoves everything down. Lower is better.' },
  { group: 'Technical SEO', term: 'Mobile-First Indexing', definition: 'Google looks at the phone version of your site, not the desktop version, when deciding how to rank you. If your site is worse on a phone, that worse version is the one being judged.' },
  { group: 'Technical SEO', term: 'Schema Markup (Structured Data)', definition: 'Extra code you add to label what is on a page: this is a product, this is a recipe, this is a review. It lets Google show richer listings, like star ratings and prices, right in the search results.' },

  // ─── Keywords & Search Intent ───
  { group: 'Keywords & Search Intent', term: 'Keyword', definition: 'A word or phrase people type into search. The starting point for almost any SEO work. "Best running shoes for flat feet" is a keyword, and so is a specific product name.' },
  { group: 'Keywords & Search Intent', term: 'Head Term', definition: 'A short, broad, very popular search like "shoes" or "marketing". Tons of searches, but tons of competition too. Rarely worth chasing for a smaller site.' },
  { group: 'Keywords & Search Intent', term: 'Long-Tail Keyword', definition: 'A longer, more specific search like "best running shoes for sore heels under 150 dollars". Fewer people search each one, but they know exactly what they want and it is far easier to rank for. This is where most search traffic actually comes from.' },
  { group: 'Keywords & Search Intent', term: 'Search Intent', definition: 'What the person is really trying to do when they search. The most important idea in modern SEO. Matching your page to what they want matters more than any single trick.' },
  { group: 'Keywords & Search Intent', term: 'Informational Intent', definition: 'The person wants to learn something, like "how does SEO work". Best answered with a guide or an article, not a sales pitch.' },
  { group: 'Keywords & Search Intent', term: 'Commercial Intent', definition: 'The person is weighing their options before buying, like "best CRM for a small business". Best served by comparisons, reviews, and "this versus that" pages.' },
  { group: 'Keywords & Search Intent', term: 'Transactional Intent', definition: 'The person is ready to act, like "buy iPhone 15" or "free trial". This is where a product page or sign-up page belongs, not a blog post.' },
  { group: 'Keywords & Search Intent', term: 'Search Volume', definition: 'Roughly how many times a keyword is searched in a country each month. Treat it as a ballpark, not an exact number. Useful for deciding which keywords are worth your time.' },
  { group: 'Keywords & Search Intent', term: 'Keyword Difficulty', definition: 'A rough score, from 0 to 100, for how hard it would be to reach the first page for a keyword. It is based on how strong the sites already ranking are. Best used to compare keywords against each other.' },
  { group: 'Keywords & Search Intent', term: 'Keyword Cannibalization', definition: 'When two of your own pages aim at the same search and end up competing with each other instead of helping. Usually fixed by merging them or giving each a clearly different angle.' },

  // ─── Content & E-E-A-T ───
  { group: 'Content & E-E-A-T', term: 'Pillar Page', definition: 'A long, thorough page covering a big topic from end to end. It acts as the home base for a group of related articles and links out to all of them.' },
  { group: 'Content & E-E-A-T', term: 'Topic Cluster', definition: 'A main page on a broad topic plus a set of related articles, all linked together. It shows Google you cover the subject in real depth, not just in one passing mention.' },
  { group: 'Content & E-E-A-T', term: 'Content Gap', definition: 'A question your audience is searching for that you do not have a page for yet. Spotting these is usually where a content plan starts.' },
  { group: 'Content & E-E-A-T', term: 'Content Refresh', definition: 'Updating an existing page with current facts, better examples, and tighter writing. It often beats writing something brand new, because the page is already known to Google and already has links pointing to it.' },
  { group: 'Content & E-E-A-T', term: 'Evergreen Content', definition: 'Content that stays useful for years with only small updates, like a definitions list or a how-it-works guide. The opposite of news, which goes stale fast.' },
  { group: 'Content & E-E-A-T', term: 'E-E-A-T', definition: 'Short for Experience, Expertise, Authoritativeness, and Trust. It is how Google sizes up whether content is trustworthy, especially on money and health topics. It is not a single setting, but it shapes a lot of what Google rewards.' },
  { group: 'Content & E-E-A-T', term: 'Helpful Content', definition: 'Content written for real people first and search engines second. The opposite is content made only to rank. Google has rolled out several updates aimed squarely at pushing the second kind down.' },
  { group: 'Content & E-E-A-T', term: 'Thin Content', definition: 'A page with very little of real value for its topic, often padded with filler or churned out in bulk. Having a lot of these can drag down your whole site.' },

  // ─── Links & Authority ───
  { group: 'Links & Authority', term: 'Backlink (Inbound Link)', definition: 'A link from someone else\'s site pointing to yours. The original currency of SEO. Each one acts like a vote of confidence for the page it points to.' },
  { group: 'Links & Authority', term: 'Link Building', definition: 'The work of earning links from other sites, through outreach, press coverage, partnerships, and being worth linking to. The slowest and hardest part of SEO, and also the part that moves rankings the most for competitive searches.' },
  { group: 'Links & Authority', term: 'Referring Domain', definition: 'A single website that links to you. If one site links to you ten times, that still counts as one referring domain. How many different sites link to you usually matters more than the raw number of links.' },
  { group: 'Links & Authority', term: 'Domain Authority (DA)', definition: 'A score from 0 to 100, made by an outside company, that estimates how strong a whole site is at ranking. Google does not use it, but it is a handy way to compare one site against another.' },
  { group: 'Links & Authority', term: 'Dofollow Link', definition: 'A normal link that passes ranking power to the page it points to. This is the default kind, and the kind link builders are usually after.' },
  { group: 'Links & Authority', term: 'Nofollow Link', definition: 'A link tagged so that search engines do not pass ranking power through it. Common on blog comments, paid placements, and links added by users.' },
  { group: 'Links & Authority', term: 'Toxic Backlink', definition: 'A link from a spammy or shady site. Google ignores most of them on its own. Only worth cleaning up if there is a clear pattern of someone trying to game the system.' },
  { group: 'Links & Authority', term: 'Digital PR', definition: 'Earning links by getting your data, opinions, or stories covered in real publications. The modern, sturdy version of link building. Slower and pricier than the shortcuts, but much harder to lose.' },

  // ─── Local & SERP Features (local block) ───
  { group: 'Local & SERP Features', term: 'Local SEO', definition: 'Getting found for searches tied to a place, like "dentist near me" or "best tacos in Austin". It plays by its own rules, with Google\'s free business listing at the center of it all.' },
  { group: 'Local & SERP Features', term: 'Google Business Profile (GBP)', definition: 'Google\'s free listing for a local business. It is what shows up on the map, in the local results, and on the side of the search page. The most important thing to get right in local SEO.' },
  { group: 'Local & SERP Features', term: 'Local Pack (Map Pack)', definition: 'The box of three local businesses with a small map that sits at the top of many local searches. Most clicks for those searches go here. It is driven by your business listing, your reviews, and how close you are to the searcher.' },
  { group: 'Local & SERP Features', term: 'NAP (Name, Address, Phone)', definition: 'Your business name, address, and phone number. These need to match exactly everywhere they appear online. When they do not line up, it confuses Google and hurts your local ranking.' },
  { group: 'Local & SERP Features', term: 'Citation', definition: 'A mention of your business name, address, and phone number on another site, usually a directory like Yelp. It helps prove your business is a real, established local presence.' },
  { group: 'Local & SERP Features', term: 'Reviews', definition: 'The star ratings and written feedback customers leave on your Google listing and elsewhere. They directly affect your local ranking. How many you have and how recent they are both matter.' },

  // ─── Local & SERP Features (SERP block) ───
  { group: 'Local & SERP Features', term: 'Featured Snippet (Position Zero)', definition: 'A short answer box pulled from a page and shown above the normal links. It grabs a lot of clicks and is what voice assistants read out. You usually win it by answering the question clearly and directly on your page.' },
  { group: 'Local & SERP Features', term: 'People Also Ask (PAA)', definition: 'The expandable list of related questions in the middle of many results pages. Each question is a chance to show up, even when you are not the top result.' },
  { group: 'Local & SERP Features', term: 'Knowledge Panel', definition: 'The information card on the right side of the results for things Google recognizes, like a person, company, or place. It is pulled from trusted sources around the web.' },
  { group: 'Local & SERP Features', term: 'Rich Result', definition: 'A search listing dressed up with extra details like star ratings, prices, or a list of questions. It stands out more and tends to earn more clicks. You unlock it with schema markup.' },
  { group: 'Local & SERP Features', term: 'Discussions and Forums', definition: 'A results section that surfaces posts from Reddit, Quora, and other forums. Google has leaned on it much more since 2023 for opinion-style and "what do real people think" searches.' },
  { group: 'Local & SERP Features', term: 'Click-Through Rate (CTR)', definition: 'The share of people who see your result and actually click it. It depends heavily on your position, your title and summary, and which other features crowd the page around you. Higher spots earn far more clicks than lower ones.' },
  { group: 'Local & SERP Features', term: 'Zero-Click Search', definition: 'A search where the person gets their answer right on the results page and never clicks through to a site. AI answers and snippet boxes have pushed this past half of all searches for many kinds of questions.' },

  // ─── Measurement & Tools ───
  { group: 'Measurement & Tools', term: 'Google Search Console (GSC)', definition: 'Google\'s free tool showing which searches bring up your site, how many people see and click each page, where you rank, and any technical problems. The first place any SEO looks. Set it up before anything else.' },
  { group: 'Measurement & Tools', term: 'Google Analytics 4 (GA4)', definition: 'Google\'s free tool for seeing what people do once they land on your site: which pages they visit and which actions they take. Pair it with Search Console to connect what people searched with what they did next.' },
  { group: 'Measurement & Tools', term: 'Impressions', definition: 'How many times your page showed up in search results, whether or not anyone clicked. A lot of impressions but few clicks is a clear sign your title or summary needs work.' },
  { group: 'Measurement & Tools', term: 'Conversion', definition: 'The action you actually wanted from a visitor: a sign-up, a sale, a download, a booked call. The real goal of SEO. Traffic that never converts is just a feel-good number.' },
  { group: 'Measurement & Tools', term: 'Bounce Rate (Engagement Rate)', definition: 'A measure of how many visitors leave without really engaging. Google\'s newer tool flips it around and reports the share who do engage, by staying a while, viewing more pages, or taking an action. A quick exit is fine on some pages and a bad sign on others.' },
  { group: 'Measurement & Tools', term: 'Pogo-Sticking', definition: 'When someone clicks your result, bounces straight back to the search page, and picks a different one instead. A strong sign your page did not give them what they came for.' },
  { group: 'Measurement & Tools', term: 'Rank Tracker', definition: 'A tool that checks where your chosen keywords rank, day by day or week by week. Useful for seeing what moved after a change on your site or an update from Google.' },
  { group: 'Measurement & Tools', term: 'Site Audit', definition: 'A full scan of your site for technical problems: broken links, missing tags, slow pages, duplicate pages. Usually the first step when taking on a new site.' },

  // ─── Black Hat & Penalties ───
  { group: 'Black Hat & Penalties', term: 'White Hat SEO', definition: 'Playing by Google\'s rules: better content, a healthier site, and real links earned by being worth linking to. Slower, but it lasts.' },
  { group: 'Black Hat & Penalties', term: 'Black Hat SEO', definition: 'Breaking Google\'s rules to trick your way up the rankings. Faster at first, but it almost always ends in a penalty.' },
  { group: 'Black Hat & Penalties', term: 'Keyword Stuffing', definition: 'Jamming the same keyword into a page far more than reads naturally, hoping to rank for it. One of the oldest tricks. Easy for Google to spot and reliably punished.' },
  { group: 'Black Hat & Penalties', term: 'Cloaking', definition: 'Showing one version of a page to Google and a different one to real visitors. A flat-out rules violation that usually gets the site penalized by hand.' },
  { group: 'Black Hat & Penalties', term: 'PBN (Private Blog Network)', definition: 'A set of sites someone builds or buys for the sole purpose of linking to a site they want to boost. Google treats it as link spam. When caught, both the network and the boosted site usually get penalized.' },
  { group: 'Black Hat & Penalties', term: 'Manual Action (Manual Penalty)', definition: 'A penalty placed on a site by a human reviewer at Google, shown in Search Console. You get back from it by fixing the problem and asking Google to take another look.' },
  { group: 'Black Hat & Penalties', term: 'Algorithmic Penalty', definition: 'A drop in rankings caused by a Google update rather than a person. There is no warning in Search Console. Getting back means working out what the update was targeting and fixing it before the next one.' },
  { group: 'Black Hat & Penalties', term: 'Sandboxing', definition: 'The common pattern where brand-new sites struggle to rank for competitive searches in their first few months, even with good content and links. Google denies it exists, but almost everyone launching a new site sees it.' },
];

// Landing copy. Hero headline splits on the newline; subtitle renders *phrase*
// as an accent em. Hero slides reference the 5 seo-* hero visuals registered in
// [slug].astro. Showcase + categories drive the visual sections on the landing.
const landing = {
  tagline: 'Every word in an SEO audit, defined.',
  description: 'Search fundamentals, on-page, technical, content, links, and the SERP features quietly eating your clicks.',
  heroHeadline: 'SEO\nWord List',
  heroSubtitle: '84 of the most important terms in SEO, *clearly defined and illustrated*.',
  pitchStatement: 'Most SEO glossaries define one piece of jargon with three more. This one is written in plain English, start to finish.',
  audienceHead: 'For anyone who ends up owning search without being taught it.',
  audienceItems: [
    'The founder told the site needs SEO',
    'The marketer who owns the traffic goal',
    'Anyone who nodded along on the call, then looked it up after',
  ],
  heroSlides: [
    { _key: 'seo-slide-crawl', visual: 'seo-crawl', term: 'Crawler', note: 'How Google finds your pages in the first place.' },
    { _key: 'seo-slide-index', visual: 'seo-index', term: 'Indexing', note: 'Found, filed, then ranked. The path every page takes.' },
    { _key: 'seo-slide-cluster', visual: 'seo-cluster', term: 'Topic Cluster', note: 'One main page, many linked articles, real depth.' },
    { _key: 'seo-slide-ai', visual: 'seo-ai-overview', term: 'AI Overview', note: 'The AI answer that gets read before your link does.' },
    { _key: 'seo-slide-cls', visual: 'seo-cls', term: 'Layout Shift', note: 'When the page jumps and your tap lands wrong.' },
  ],
  showcaseTitle: 'Some words are easier to show than to say',
  showcaseLead: 'Featured Snippet (Position Zero)',
  showcasePair: ['Backlink (Inbound Link)', 'SERP (Search Engine Results Page)'],
  categoriesTitle: 'From the first crawl to the final click',
};

const res = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mutations: [
      {
        patch: {
          id: DOC_ID,
          set: { terms, ...landing },
        },
      },
    ],
  }),
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
