// Seeds the "SEO Word List" training asset into Sanity.
// Scope: search engine optimization vocabulary. Search fundamentals, on-page,
// technical, keywords & intent, content & E-E-A-T, links & authority, local
// SEO, SERP features, measurement, and black-hat / penalty terms. Aimed at
// founders, marketers, and operators who need to brief or review SEO work
// without nodding through unfamiliar acronyms.
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');

const PROJECT = 'ka7dwvnq';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const terms = [
  // ─── Search Engine Fundamentals ───
  { group: 'Search Engine Fundamentals', term: 'SEO (Search Engine Optimization)', definition: 'The work of getting a site to show up in search engine results for the queries that matter to the business. Not a one-time project. A discipline that compounds over months and years.' },
  { group: 'Search Engine Fundamentals', term: 'Search Engine', definition: 'A system that crawls the web, indexes pages, and ranks them in response to a query. Google handles roughly 90 percent of global search, so most SEO work effectively means Google optimization.' },
  { group: 'Search Engine Fundamentals', term: 'SERP (Search Engine Results Page)', definition: 'The page Google shows after someone runs a query. Used to be ten blue links. Today it is a mix of ads, AI summaries, snippets, videos, maps, and organic results all competing for the same clicks.' },
  { group: 'Search Engine Fundamentals', term: 'Crawler (Bot, Spider)', definition: 'A program that visits pages on the web, follows links, and reports what it finds back to the search engine. Googlebot is the best-known crawler. If a crawler cannot reach a page, that page does not exist as far as Google is concerned.' },
  { group: 'Search Engine Fundamentals', term: 'Crawl Budget', definition: 'The number of pages a search engine is willing to crawl on a given site within a given window. Small sites never bump into the limit. Large sites with thousands of low-value pages can waste their budget and starve the pages that matter.' },
  { group: 'Search Engine Fundamentals', term: 'Indexing', definition: 'The process of adding a crawled page to the search engine\'s searchable database. A page can be crawled but not indexed. Until it is indexed, it cannot rank for anything.' },
  { group: 'Search Engine Fundamentals', term: 'Ranking', definition: 'The position a page holds on the SERP for a given query. Position 1 collects roughly 30 percent of clicks. Position 10 gets about 2 percent. Anything past page one might as well not exist for most queries.' },
  { group: 'Search Engine Fundamentals', term: 'Algorithm', definition: 'The set of rules and weighted signals a search engine uses to decide which pages rank for which queries. Google\'s algorithm is updated thousands of times a year and is never fully disclosed.' },
  { group: 'Search Engine Fundamentals', term: 'Core Update', definition: 'A major, named change to Google\'s ranking algorithm, usually rolled out over one to two weeks. Sites can see significant traffic gains or losses overnight. Recovery often takes until the next core update.' },
  { group: 'Search Engine Fundamentals', term: 'Organic Traffic', definition: 'Visitors who arrive from unpaid search results. The whole point of SEO. Distinct from paid traffic (ads), referral traffic (other sites), direct traffic (typed URL), and social traffic.' },
  { group: 'Search Engine Fundamentals', term: 'Paid Search', definition: 'Ads that appear at the top and bottom of the SERP, labeled "Sponsored". Bought through Google Ads on a pay-per-click basis. Separate from SEO but competes for the same screen space.' },
  { group: 'Search Engine Fundamentals', term: 'AI Overview (SGE)', definition: 'Google\'s AI-generated summary at the top of many results, drawn from multiple sources. Often answers the query before the user clicks anything. The biggest threat to organic click-through rates in years.' },

  // ─── On-Page SEO ───
  { group: 'On-Page SEO', term: 'On-Page SEO', definition: 'Everything you can change on the page itself to help it rank: title, headings, copy, internal links, images, schema. The half of SEO you fully control.' },
  { group: 'On-Page SEO', term: 'Title Tag', definition: 'The clickable headline of a result on the SERP. Lives in the page\'s HTML head as the <title> element. The single most important on-page element for both ranking and click-through.' },
  { group: 'On-Page SEO', term: 'Meta Description', definition: 'The short snippet of text shown below the title on the SERP. Does not directly affect ranking, but a well-written one lifts click-through rates noticeably. About 155 characters before Google truncates it.' },
  { group: 'On-Page SEO', term: 'H1', definition: 'The main heading of a page, usually visible at the top. Tells both users and search engines what the page is about. One per page is the convention.' },
  { group: 'On-Page SEO', term: 'H2 / H3 (Subheadings)', definition: 'Lower-level headings used to break a long page into scannable sections. H2 is a section. H3 sits inside an H2. Proper hierarchy helps both readers and search engines understand structure.' },
  { group: 'On-Page SEO', term: 'URL Slug', definition: 'The readable part of a URL after the domain. /seo-word-list is a clean slug. /?p=4729 is not. Short, keyword-aware, lowercase, hyphen-separated wins every time.' },
  { group: 'On-Page SEO', term: 'Alt Text', definition: 'The text description of an image, used by screen readers and by search engines that cannot see pixels. Real description, not keyword stuffing. Also helps the image rank in image search.' },
  { group: 'On-Page SEO', term: 'Internal Link', definition: 'A link from one page on your site to another page on your site. The most underused SEO lever. Internal links pass authority around the site and signal which pages matter most.' },
  { group: 'On-Page SEO', term: 'Anchor Text', definition: 'The visible, clickable text of a link. Search engines use anchor text as a strong hint about the topic of the destination page. "Click here" tells Google nothing. "Plain-English SEO definitions" tells it everything.' },
  { group: 'On-Page SEO', term: 'Content Length', definition: 'How long the body copy on a page is. Not a direct ranking factor. But thin pages tend to lose to pages that fully answer the query, and that fuller answer usually takes more words.' },
  { group: 'On-Page SEO', term: 'Keyword Density', definition: 'The percentage of words on a page that match the target keyword. An old-school metric. Modern SEO cares about whether the page actually answers the query, not how many times it repeats the phrase.' },
  { group: 'On-Page SEO', term: 'Image Optimization', definition: 'Compressing images, using modern formats (WebP, AVIF), and adding meaningful alt text. Cuts page weight, speeds up load, and unlocks image search. One of the highest-leverage on-page wins.' },
  { group: 'On-Page SEO', term: 'Featured Image (OG Image)', definition: 'The image shown when a page is shared on social media or messaging apps. Set via Open Graph and Twitter Card meta tags. Does not affect ranking directly but heavily affects click-through from off-search traffic.' },

  // ─── Technical SEO ───
  { group: 'Technical SEO', term: 'Technical SEO', definition: 'The plumbing of SEO: how fast the site loads, how cleanly it renders, how easily crawlers can move through it, how the URLs are structured. Invisible to users, decisive for rankings.' },
  { group: 'Technical SEO', term: 'Sitemap (XML Sitemap)', definition: 'An XML file listing every page on a site that the owner wants indexed. Submitted to Google Search Console. Helps crawlers find pages they might otherwise miss.' },
  { group: 'Technical SEO', term: 'Robots.txt', definition: 'A file at the root of a domain telling crawlers which paths they can and cannot access. Used to keep crawlers out of admin areas, search-result pages, and other low-value URLs.' },
  { group: 'Technical SEO', term: 'Meta Robots Tag', definition: 'An HTML tag that tells search engines whether to index a page and whether to follow its links. "noindex, follow" is common for paginated archives or thin pages.' },
  { group: 'Technical SEO', term: 'Canonical Tag', definition: 'A tag that tells search engines which version of a page is the original when multiple URLs have the same or very similar content. Prevents duplicate-content penalties and consolidates ranking signals.' },
  { group: 'Technical SEO', term: '301 Redirect', definition: 'A permanent redirect from one URL to another. Passes the bulk of the ranking signals from the old URL to the new one. The right choice when content moves permanently.' },
  { group: 'Technical SEO', term: '302 Redirect', definition: 'A temporary redirect. Use sparingly: search engines treat it as "the original URL is still the real one", so the old URL keeps its rankings.' },
  { group: 'Technical SEO', term: 'Broken Link (404)', definition: 'A link pointing to a page that no longer exists. Wastes crawl budget, hurts user experience, and leaks any authority that the missing page used to hold. Should either be restored or redirected.' },
  { group: 'Technical SEO', term: 'HTTPS', definition: 'The encrypted version of HTTP. A confirmed (if minor) ranking signal. Required for any modern site. Browsers now flag plain HTTP as "not secure" in the address bar.' },
  { group: 'Technical SEO', term: 'Page Speed', definition: 'How fast a page loads, renders, and becomes interactive. Affects both rankings and conversions. Google measures it through Core Web Vitals.' },
  { group: 'Technical SEO', term: 'Core Web Vitals', definition: 'Google\'s three measured performance signals: Largest Contentful Paint (load), Interaction to Next Paint (responsiveness), and Cumulative Layout Shift (stability). All three must be green to count as "passing".' },
  { group: 'Technical SEO', term: 'LCP (Largest Contentful Paint)', definition: 'The time until the largest visible element finishes rendering. The user-facing definition of "how fast did the page actually load?" Target is under 2.5 seconds.' },
  { group: 'Technical SEO', term: 'INP (Interaction to Next Paint)', definition: 'The delay between a user interaction (click, tap, key press) and the next visual response. The user-facing definition of "how responsive does the page feel?" Target is under 200 milliseconds.' },
  { group: 'Technical SEO', term: 'CLS (Cumulative Layout Shift)', definition: 'How much page content jumps around as it loads. The reason your finger lands on the wrong button when an ad pops in. Target is under 0.1.' },
  { group: 'Technical SEO', term: 'Mobile-First Indexing', definition: 'Google\'s policy of using the mobile version of a site as the primary version for indexing and ranking. If your mobile experience is worse than desktop, that worse experience is what Google sees.' },
  { group: 'Technical SEO', term: 'Schema Markup (Structured Data)', definition: 'Code added to a page (usually as JSON-LD) that labels content for search engines: this is an article, this is a product, this is a recipe. Unlocks rich results like star ratings, price, and FAQ accordions on the SERP.' },
  { group: 'Technical SEO', term: 'JSON-LD', definition: 'The recommended format for adding schema markup to a page. A small JSON script in the page head. Cleaner than the older microdata approach because it lives separately from the visible HTML.' },
  { group: 'Technical SEO', term: 'Hreflang', definition: 'A tag that tells search engines which language and region a page targets. Critical for multilingual sites so Google serves Spanish content to Spanish users and English content to English users.' },
  { group: 'Technical SEO', term: 'Pagination', definition: 'Splitting a long list (blog archive, product category) across multiple numbered pages. Handled cleanly with self-referencing canonicals and proper rel="next" / rel="prev" hints to search engines.' },
  { group: 'Technical SEO', term: 'JavaScript Rendering', definition: 'When a page\'s content is built in the browser by JavaScript instead of delivered as ready-made HTML. Google can render JavaScript, but it takes longer and sometimes fails. Server-rendered or pre-rendered HTML is the safer SEO bet.' },
  { group: 'Technical SEO', term: 'Log File Analysis', definition: 'Reading the raw server logs to see exactly which pages Googlebot crawled and how often. The only way to know for sure what Google is doing on your site. Heavy-duty technical SEO territory.' },

  // ─── Keywords & Search Intent ───
  { group: 'Keywords & Search Intent', term: 'Keyword', definition: 'A word or phrase that people type into a search engine. The starting point of nearly every SEO project. "Best running shoes for flat feet" is a keyword. So is "Nike Pegasus 40".' },
  { group: 'Keywords & Search Intent', term: 'Head Term', definition: 'A short, high-volume, broad keyword like "shoes" or "marketing". Lots of searches but lots of competition. Rarely worth chasing for a small site.' },
  { group: 'Keywords & Search Intent', term: 'Long-Tail Keyword', definition: 'A longer, more specific phrase like "best running shoes for plantar fasciitis under 150 dollars". Lower volume per phrase but much higher intent and easier to rank for. Where most SEO traffic actually comes from.' },
  { group: 'Keywords & Search Intent', term: 'Branded Keyword', definition: 'A search that contains the brand name (e.g. "Nike Pegasus", "Stripe pricing"). Usually the easiest to rank for. Lifts in branded search are one of the truest signals that broader brand awareness is working.' },
  { group: 'Keywords & Search Intent', term: 'Non-Branded Keyword', definition: 'A search that does not contain the brand name. The hard part of SEO. Captures people who do not yet know you exist.' },
  { group: 'Keywords & Search Intent', term: 'Search Intent', definition: 'What the searcher is actually trying to accomplish. The single most important concept in modern SEO. Matching content to intent matters more than any specific tactic.' },
  { group: 'Keywords & Search Intent', term: 'Informational Intent', definition: 'The user wants to learn something. "How does SEO work". Best served by guides, articles, and definitions. Not the place to put a sales page.' },
  { group: 'Keywords & Search Intent', term: 'Navigational Intent', definition: 'The user is looking for a specific site or page. "Linear app login". Branded queries are almost all navigational.' },
  { group: 'Keywords & Search Intent', term: 'Commercial Intent', definition: 'The user is comparing options before buying. "Best CRM for small business". Best served by comparison content, reviews, and "vs" pages.' },
  { group: 'Keywords & Search Intent', term: 'Transactional Intent', definition: 'The user is ready to buy or sign up. "Buy iPhone 15", "free trial Notion". This is where landing pages and product pages belong, not blog posts.' },
  { group: 'Keywords & Search Intent', term: 'Search Volume', definition: 'The estimated number of times a keyword is searched in a given country per month. A directional number, not a precise one. Useful for prioritizing keywords, not for forecasting traffic.' },
  { group: 'Keywords & Search Intent', term: 'Keyword Difficulty', definition: 'An estimate (0 to 100) of how hard it would be to rank in the top ten for a keyword. Based on the strength of the sites already ranking. Useful as a relative measure, not an absolute one.' },
  { group: 'Keywords & Search Intent', term: 'SERP Analysis', definition: 'Looking at the top ten results for a target keyword to figure out what kind of content Google rewards. If the top results are all 4,000-word guides, a 600-word blog post will not break in.' },
  { group: 'Keywords & Search Intent', term: 'Keyword Cannibalization', definition: 'When two or more pages on the same site target the same keyword and end up competing with each other in the rankings. Usually resolved by consolidating the pages or making each one target a clearly different angle.' },
  { group: 'Keywords & Search Intent', term: 'Keyword Mapping', definition: 'Assigning each target keyword to exactly one page on the site. Prevents cannibalization and forces a clear content plan. The unglamorous backbone of any real SEO program.' },

  // ─── Content & E-E-A-T ───
  { group: 'Content & E-E-A-T', term: 'Pillar Page', definition: 'A long, comprehensive page covering a broad topic at depth. The hub of a topic cluster. Usually targets a high-volume head term and links out to many supporting articles.' },
  { group: 'Content & E-E-A-T', term: 'Topic Cluster', definition: 'A pillar page plus a set of related supporting articles, all internally linked. Tells Google you have real depth on a topic, not just one page that happens to mention it.' },
  { group: 'Content & E-E-A-T', term: 'Content Gap', definition: 'A query your audience is searching for that your site does not yet have content for. The starting point of most SEO content roadmaps. Easy to spot in Search Console once you know where to look.' },
  { group: 'Content & E-E-A-T', term: 'Content Refresh', definition: 'Updating an existing piece of content with current information, better examples, and tighter copy. Often outperforms publishing new content because it reuses an already-indexed and already-linked URL.' },
  { group: 'Content & E-E-A-T', term: 'Evergreen Content', definition: 'Content that stays relevant for years with minor updates. A definitions article. A "how does X work" guide. The opposite of news, which decays fast.' },
  { group: 'Content & E-E-A-T', term: 'E-E-A-T', definition: 'Experience, Expertise, Authoritativeness, Trustworthiness. Google\'s framework for evaluating content quality, especially on topics that affect money or health. Not a direct ranking factor. But it shapes nearly every quality signal that is.' },
  { group: 'Content & E-E-A-T', term: 'Author Authority', definition: 'The signal that real, identifiable people with real credentials wrote the content. An author bio with credentials and a link to a real public profile. Especially important for finance, health, and legal topics.' },
  { group: 'Content & E-E-A-T', term: 'Helpful Content', definition: 'Google\'s shorthand for content written for humans first, search engines second. The opposite is content that exists only to rank. Multiple algorithm updates have specifically demoted the latter.' },
  { group: 'Content & E-E-A-T', term: 'Thin Content', definition: 'Pages with little useful content for their topic. Often auto-generated, scraped, or padded out with filler. A common cause of site-wide quality demotions.' },
  { group: 'Content & E-E-A-T', term: 'Duplicate Content', definition: 'The same or near-identical content appearing on multiple URLs, either within a site or across sites. Splits ranking signals and can trigger filters. Canonical tags are the usual fix within a site.' },
  { group: 'Content & E-E-A-T', term: 'Content Pruning', definition: 'Removing or consolidating low-performing pages so the remaining pages get more crawl budget and authority. Sometimes the highest-leverage SEO work is deletion, not creation.' },
  { group: 'Content & E-E-A-T', term: 'Content Cluster Strategy', definition: 'The deliberate practice of building topic clusters around target pillar pages instead of publishing one-off articles. Compounds authority over time. The dominant content-SEO model since around 2018.' },

  // ─── Links & Authority ───
  { group: 'Links & Authority', term: 'Backlink (Inbound Link)', definition: 'A link from another site pointing to yours. The original currency of SEO. Every backlink is, in effect, a vote for the page it points to.' },
  { group: 'Links & Authority', term: 'Link Building', definition: 'The work of earning or acquiring backlinks. Outreach, digital PR, guest posts, partnerships. The hardest and slowest part of SEO. Also the part that moves rankings most for competitive terms.' },
  { group: 'Links & Authority', term: 'Referring Domain', definition: 'A unique site linking to yours. Ten backlinks from one site count as one referring domain. The number of referring domains usually matters more than the raw backlink count.' },
  { group: 'Links & Authority', term: 'Anchor Text Distribution', definition: 'The mix of exact-match, partial-match, branded, and generic anchor texts pointing to a page. A natural profile has variety. A page with 80 percent exact-match "buy cheap shoes" anchors looks engineered and gets discounted.' },
  { group: 'Links & Authority', term: 'Domain Authority (DA)', definition: 'A third-party score from Moz (0 to 100) estimating how well a domain will rank overall. Not used by Google directly. Useful as a rough comparison metric.' },
  { group: 'Links & Authority', term: 'Domain Rating (DR)', definition: 'Ahrefs\' equivalent of Domain Authority. Also 0 to 100. Useful for sizing up competitors and prospect sites before reaching out for links.' },
  { group: 'Links & Authority', term: 'Page Authority (PA)', definition: 'A score for a specific page rather than the whole domain. A high-DA site can still have a low-PA page if that page has no internal or external links pointing to it.' },
  { group: 'Links & Authority', term: 'Link Equity (Link Juice)', definition: 'The ranking value that flows through a link. A link from a strong page passes more equity than one from a weak page. Splits across all the links on the page.' },
  { group: 'Links & Authority', term: 'Dofollow Link', definition: 'A regular link that passes ranking signals. The default. What link builders are usually after.' },
  { group: 'Links & Authority', term: 'Nofollow Link', definition: 'A link with a rel="nofollow" attribute, telling search engines not to pass ranking signals through it. Common on blog comments, sponsored content, and user-generated links.' },
  { group: 'Links & Authority', term: 'Sponsored / UGC Link', definition: 'Newer rel attributes (rel="sponsored" for paid, rel="ugc" for user-generated). More specific replacements for blanket nofollow. Required for paid placements under Google\'s guidelines.' },
  { group: 'Links & Authority', term: 'Toxic Backlink', definition: 'A link from a spammy, irrelevant, or penalized site. Most are ignored by Google automatically. Worth the cleanup effort only if there is a clear pattern of manipulation in the link profile.' },
  { group: 'Links & Authority', term: 'Disavow File', definition: 'A list of backlinks submitted to Google asking it to ignore them. A last-resort tool, used mostly to recover from manual penalties tied to bad links. Misused by many. Required by few.' },
  { group: 'Links & Authority', term: 'Link Velocity', definition: 'The rate at which a site gains new backlinks over time. Sudden spikes can look unnatural and trigger filters. Steady growth is the safer signal.' },
  { group: 'Links & Authority', term: 'Digital PR', definition: 'Earning backlinks by getting your data, opinions, or stories covered in mainstream and trade publications. The modern, defensible version of link building. Slower and more expensive than the alternatives but harder to undo.' },

  // ─── Local SEO ───
  { group: 'Local SEO', term: 'Local SEO', definition: 'Optimizing for searches with local intent: "dentist near me", "best tacos Austin". A different game from broader SEO, with its own ranking factors and its own Google product (Business Profile) at the center.' },
  { group: 'Local SEO', term: 'Google Business Profile (GBP)', definition: 'Google\'s free listing for a local business. Shows up in Maps, in the local pack, and on Google Search. The single most important asset in local SEO. Formerly called Google My Business.' },
  { group: 'Local SEO', term: 'Local Pack (Map Pack)', definition: 'The block of three local business results with a map at the top of many local SERPs. Where most clicks for local queries go. Driven heavily by Google Business Profile, reviews, and proximity.' },
  { group: 'Local SEO', term: 'NAP (Name, Address, Phone)', definition: 'The core business information used to verify a local listing. Must be identical across every directory, citation, and website. Inconsistent NAP confuses Google and tanks local rankings.' },
  { group: 'Local SEO', term: 'Citation', definition: 'A mention of a business\'s NAP on another site, typically a directory (Yelp, Bing Places, industry directories). Builds trust in the business as a real local entity.' },
  { group: 'Local SEO', term: 'Reviews', definition: 'The customer ratings and written reviews on the Google Business Profile and elsewhere. A direct local ranking factor. Both quantity and recency matter.' },
  { group: 'Local SEO', term: 'Local Schema', definition: 'Structured data (LocalBusiness, Service, FAQPage) added to local landing pages so Google understands the business, its service area, hours, and offerings.' },
  { group: 'Local SEO', term: 'Service Area Page', definition: 'A page targeting a specific city, neighborhood, or region the business serves. "Dentist in Brookline" or "Plumber Cambridge". Usually built as a template so a service business can cover dozens of areas without thin-content penalties.' },

  // ─── SERP Features ───
  { group: 'SERP Features', term: 'Featured Snippet (Position Zero)', definition: 'A short answer box pulled from a ranking page and shown above the regular blue links. Captures a big share of clicks and reads aloud in voice search. Usually requires the answer to be formatted in a clean, direct way on the source page.' },
  { group: 'SERP Features', term: 'People Also Ask (PAA)', definition: 'The expandable list of related questions in the middle of many SERPs. Each one is a content opportunity. Showing up in PAA also gets you on the page even when you do not hold the top organic spot.' },
  { group: 'SERP Features', term: 'Knowledge Panel', definition: 'The information card on the right side of the SERP for entities Google recognizes: people, companies, places, products. Pulled from sources like Wikipedia, Wikidata, and verified profiles.' },
  { group: 'SERP Features', term: 'Sitelinks', definition: 'The set of secondary links shown under a top-ranking result, deep-linking into key pages on the same site. Google decides which to show. Often appears for branded queries with strong site structure.' },
  { group: 'SERP Features', term: 'Rich Result', definition: 'A SERP result enhanced with extra information from schema: star ratings, prices, availability, FAQ accordions, recipe times. Earns more visual weight and usually higher click-through.' },
  { group: 'SERP Features', term: 'Image Pack', definition: 'A horizontal row of image results inside a regular SERP. Common for product, design, and travel queries. Image optimization is the way in.' },
  { group: 'SERP Features', term: 'Video Carousel', definition: 'A row of video results, mostly YouTube, inside the SERP. Often dominates for how-to and product-review queries.' },
  { group: 'SERP Features', term: 'Top Stories', definition: 'A carousel of recent news articles for queries with news intent. Reserved for sites in Google News.' },
  { group: 'SERP Features', term: 'Discussions and Forums', definition: 'A SERP feature surfacing Reddit, Quora, and forum results. Has grown sharply since 2023 as Google has leaned into user-generated content for opinion-style queries.' },
  { group: 'SERP Features', term: 'Shopping Results', definition: 'Product listings (free and paid) shown for transactional queries. Driven by a structured product feed in Google Merchant Center.' },
  { group: 'SERP Features', term: 'Click-Through Rate (CTR)', definition: 'The percentage of people who see a result and click on it. Affected heavily by position, by the title and meta description, and by which SERP features show up around the result.' },
  { group: 'SERP Features', term: 'Zero-Click Search', definition: 'A search where the user gets the answer directly on the SERP and never clicks through. AI Overviews and featured snippets have pushed the zero-click rate well over 50 percent for many query types.' },

  // ─── Measurement & Tools ───
  { group: 'Measurement & Tools', term: 'Google Search Console (GSC)', definition: 'Google\'s free tool that shows which queries trigger your site, which pages get impressions and clicks, average position, indexing status, and technical errors. The first place any SEO looks. Set it up before doing anything else.' },
  { group: 'Measurement & Tools', term: 'Google Analytics 4 (GA4)', definition: 'Google\'s analytics product. Shows what users do once they land on the site (sessions, events, conversions). Pair it with Search Console to connect what people searched with what they did.' },
  { group: 'Measurement & Tools', term: 'Impressions', definition: 'The number of times a page appeared in search results for a query, regardless of whether anyone clicked. Tracked in Search Console. High impressions with low clicks is a clear signal that the title or snippet needs work.' },
  { group: 'Measurement & Tools', term: 'Average Position', definition: 'The mean ranking position for a query or a page across all the impressions it served in a period. A useful directional metric. Distorted by occasional appearances in carousels and rich features.' },
  { group: 'Measurement & Tools', term: 'Conversion', definition: 'The action you actually wanted the visitor to take: sign up, buy, download, book a call. The real goal of SEO. Traffic without conversions is a vanity metric.' },
  { group: 'Measurement & Tools', term: 'Bounce Rate (Engagement Rate)', definition: 'In GA4, replaced by Engagement Rate: the percentage of sessions that lasted at least 10 seconds, had a conversion, or had two or more page views. High bounce on a content page is not necessarily bad. High bounce on a landing page usually is.' },
  { group: 'Measurement & Tools', term: 'Dwell Time', definition: 'How long a user spends on a page after clicking through from search before coming back. Google does not publish whether it uses this directly, but it correlates strongly with the kinds of signals that drive rankings.' },
  { group: 'Measurement & Tools', term: 'Pogo-Sticking', definition: 'When a user clicks a search result, immediately comes back, and clicks a different one. A strong negative signal: the page did not match the intent.' },
  { group: 'Measurement & Tools', term: 'Indexed Pages', definition: 'The number of pages from your site that Google has actually added to its index. Visible in Search Console. Often dramatically smaller than the number of pages on the site once low-quality and duplicate pages are filtered out.' },
  { group: 'Measurement & Tools', term: 'Crawl Stats', definition: 'The report in Search Console showing how often Google crawled your site, how many pages it hit, and how long it took. The technical health vitals of a site.' },
  { group: 'Measurement & Tools', term: 'Rank Tracker', definition: 'A tool (Ahrefs, Semrush, Sistrix, Nightwatch) that records the rankings of your target keywords on a daily or weekly basis. Useful for spotting movement after a release or an algorithm update.' },
  { group: 'Measurement & Tools', term: 'Site Audit', definition: 'A structured scan of a site for technical SEO issues: broken links, missing tags, slow pages, duplicate content, indexing errors. The starting point for any new engagement.' },
  { group: 'Measurement & Tools', term: 'Share of Voice (SOV)', definition: 'A site\'s share of available impressions for a defined set of keywords, compared against competitors. The clearest single metric for whether SEO is winning or losing market.' },

  // ─── Black Hat & Penalties ───
  { group: 'Black Hat & Penalties', term: 'White Hat SEO', definition: 'SEO that follows Google\'s guidelines: better content, better technical setup, real links earned through real value. Slower. Durable.' },
  { group: 'Black Hat & Penalties', term: 'Black Hat SEO', definition: 'SEO that breaks Google\'s guidelines to manipulate rankings. Faster wins, higher risk. Almost always ends in a penalty eventually.' },
  { group: 'Black Hat & Penalties', term: 'Gray Hat SEO', definition: 'Tactics that are not explicitly forbidden but bend the spirit of the guidelines: aggressive link building, AI-generated content with light editing, mass-produced doorway pages. Often works until it does not.' },
  { group: 'Black Hat & Penalties', term: 'Keyword Stuffing', definition: 'Cramming a keyword into a page far more times than makes sense, hoping to rank for it. One of the oldest black-hat tricks. Detected easily and demoted predictably.' },
  { group: 'Black Hat & Penalties', term: 'Cloaking', definition: 'Showing one version of a page to search engines and a different version to users. An explicit violation of Google\'s guidelines. Usually results in a manual penalty.' },
  { group: 'Black Hat & Penalties', term: 'Doorway Page', definition: 'A page built solely to rank for a specific keyword and then funnel users to a different destination. Mass-produced doorway pages (one per city, one per service combo) used to be a common local SEO trick. Now penalized.' },
  { group: 'Black Hat & Penalties', term: 'PBN (Private Blog Network)', definition: 'A network of sites built or bought specifically to pass backlinks to a target site. Treated as link spam. Once detected, both the network and the target site are usually penalized.' },
  { group: 'Black Hat & Penalties', term: 'Manual Action (Manual Penalty)', definition: 'A penalty applied to a site by a human reviewer at Google, recorded in Search Console. Recoverable only by fixing the issue and submitting a reconsideration request.' },
  { group: 'Black Hat & Penalties', term: 'Algorithmic Penalty', definition: 'A loss of rankings tied to an algorithm update rather than a manual action. No notice in Search Console. Recovery depends on understanding what the update targeted and fixing it before the next update.' },
  { group: 'Black Hat & Penalties', term: 'Negative SEO', definition: 'A third party deliberately trying to harm your rankings, usually by pointing toxic backlinks at your site. Mostly absorbed by Google\'s spam filters. Rarely effective today.' },
  { group: 'Black Hat & Penalties', term: 'Sandboxing', definition: 'The widely observed pattern where brand-new domains struggle to rank for competitive terms in their first months, even with strong content and links. Officially denied by Google. Visible in nearly every new launch.' },
];

const doc = {
  _type: 'trainingAsset',
  title: 'SEO Word List',
  slug: { _type: 'slug', current: 'seo-word-list' },
  category: 'word-list',
  tagline: 'Every word in an SEO audit, defined.',
  description: 'Search fundamentals, on-page, technical, content, links, and the SERP features eating your clicks.',
  accent: 'amber',
  order: 3,
  featured: true,
  publishedAt: new Date().toISOString(),
  terms,
};

const res = await fetch(`${API}/data/mutate/${DATASET}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mutations: [{ create: doc }],
  }),
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
