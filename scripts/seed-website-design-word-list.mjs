// Seeds the "Website Design Word List" training asset into Sanity.
// Scope: web design terms only — CSS, layout, typography, color, components,
// motion, and design process. No SEO. No back-end / framework / JS terms.
const token = process.env.SANITY_WRITE_TOKEN;
if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');

const PROJECT = 'ka7dwvnq';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2024-01-01`;

const terms = [
  // ─── Layout & Structure ───
  { group: 'Layout & Structure', term: 'Layout', definition: 'The arrangement of every element on a page. Decides where the headline sits, where the buttons go, how the content flows. The skeleton of the design before color and type get applied.' },
  { group: 'Layout & Structure', term: 'Grid', definition: 'An underlying structure of rows and columns used to align elements. Most modern sites use a 12-column grid so designs can split cleanly into halves, thirds, quarters, or sixths.' },
  { group: 'Layout & Structure', term: 'Flexbox', definition: 'A CSS layout method that arranges items in a single row or column and automatically handles spacing between them. Good for navbars, button groups, and anything one-dimensional.' },
  { group: 'Layout & Structure', term: 'Container', definition: 'A wrapper element that holds content and limits how wide it can stretch. Without a container, paragraphs on a 4K monitor would run a full screen wide and become unreadable.' },
  { group: 'Layout & Structure', term: 'Section', definition: 'A major horizontal slice of a page. A homepage might have a hero section, a features section, a testimonials section, and a footer section. Each one is a clear visual chapter.' },
  { group: 'Layout & Structure', term: 'Hero', definition: 'The very first section of a page, usually full-width and tall. Sets the tone and delivers the main pitch. The first thing every visitor sees before scrolling.' },
  { group: 'Layout & Structure', term: 'Above the Fold', definition: 'The part of a page visible without scrolling. Inherited from newspaper layout, where the top half of the front page was what people saw on the stand. Still the most valuable real estate on any site.' },
  { group: 'Layout & Structure', term: 'Sticky', definition: 'An element that scrolls with the page until it hits a target position, then locks in place. Common for headers that pin to the top once a user starts scrolling.' },
  { group: 'Layout & Structure', term: 'Z-Index', definition: 'Controls which element appears on top when two overlap. Higher z-index wins. Modals, dropdowns, and tooltips all rely on z-index to stay above the page content.' },

  // ─── Spacing ───
  { group: 'Spacing', term: 'Padding', definition: 'The space inside an element, between its content and its border. A button with 16px padding has 16px of space between the text and the edge of the button.' },
  { group: 'Spacing', term: 'Margin', definition: 'The space outside an element, pushing it away from its neighbors. Two cards sitting next to each other use margin between them to create breathing room.' },
  { group: 'Spacing', term: 'Gap', definition: 'The space between items inside a grid or flex layout, set in one place instead of repeating margins on every child. Cleaner than the old "margin on every item" approach.' },
  { group: 'Spacing', term: 'Gutter', definition: 'The vertical spacing between columns in a grid system. A 12-column grid with 24px gutters has 24px between each column.' },
  { group: 'Spacing', term: 'Whitespace', definition: 'The empty space around and between elements. Also called negative space. Not wasted space — it gives the eye room to rest and signals what matters most.' },
  { group: 'Spacing', term: 'Max-Width', definition: 'The maximum width an element is allowed to stretch to, even when the screen is wider. Used on text containers so paragraphs stay readable on large monitors.' },
  { group: 'Spacing', term: 'Spacing Scale', definition: 'A defined set of consistent spacing values (4, 8, 12, 16, 24, 32, 48, 64...) used across an entire design. Without a scale, paddings and margins drift into a soup of arbitrary numbers.' },

  // ─── Typography ───
  { group: 'Typography', term: 'Font', definition: 'A specific typeface in a specific weight and style. "Inter Regular" and "Inter Bold" are two fonts from the same typeface family.' },
  { group: 'Typography', term: 'Typeface', definition: 'The full family of related fonts under one name (Helvetica, Inter, Georgia). A typeface is the design; fonts are the individual weights and styles within it.' },
  { group: 'Typography', term: 'Serif', definition: 'A category of typefaces with small decorative strokes at the ends of letters. Times New Roman, Georgia, Garamond. Often used for editorial, luxury, or traditional designs.' },
  { group: 'Typography', term: 'Sans-Serif', definition: 'A category of typefaces without those strokes. Helvetica, Inter, Arial. The default for most modern interfaces because the clean letterforms read well on screens.' },
  { group: 'Typography', term: 'Monospace', definition: 'A typeface where every character takes the same horizontal width. JetBrains Mono, Courier. Used for code, data tables, or to create a technical aesthetic.' },
  { group: 'Typography', term: 'Display Font', definition: 'A typeface designed for very large sizes like headlines and hero text. Often distinctive or expressive in a way that would be tiring at body size.' },
  { group: 'Typography', term: 'Body Font', definition: 'The typeface used for long-form reading text. Tuned for legibility at 14-18px, not for personality at 80px.' },
  { group: 'Typography', term: 'Font Weight', definition: 'How thick or thin the letterforms are. Common weights are Thin (100), Regular (400), Medium (500), Semibold (600), Bold (700). Heavier weights carry more visual weight.' },
  { group: 'Typography', term: 'Line Height (Leading)', definition: 'The vertical space between lines of text. Body text usually needs 1.5-1.7x the font size; headlines need 1.1-1.2x. Wrong leading makes text either feel cramped or float apart.' },
  { group: 'Typography', term: 'Letter Spacing (Tracking)', definition: 'The horizontal space between letters across a whole word or phrase. Large headlines need slightly tighter tracking; small uppercase labels need looser tracking to stay legible.' },
  { group: 'Typography', term: 'Kerning', definition: 'Fine adjustments to the space between specific letter pairs (like "AV" or "Yo"). Most of the time the font handles this; designers only touch it for large display type.' },
  { group: 'Typography', term: 'Type Scale', definition: 'A defined set of font sizes used across a design (12, 14, 16, 20, 24, 32, 48, 64...). Built on a ratio so sizes feel related, not random.' },
  { group: 'Typography', term: 'Fluid Typography', definition: 'Text sizes that scale smoothly with the viewport width instead of jumping at breakpoints. A heading might fluidly grow from 32px on mobile to 80px on desktop.' },
  { group: 'Typography', term: 'Hierarchy', definition: 'The visible order of importance in a block of text. Big H1, smaller H2, smaller still body, even smaller captions. The eye should know what to read first without thinking.' },
  { group: 'Typography', term: 'Line Length', definition: 'How many characters fit on one line of text. The sweet spot for reading is 45-75 characters per line. Longer is tiring; shorter feels choppy.' },

  // ─── Color ───
  { group: 'Color', term: 'Palette', definition: 'The complete set of colors used in a design. Usually one or two brand colors, a handful of neutrals (grays), and semantic colors for success, warning, and error.' },
  { group: 'Color', term: 'Primary Color', definition: 'The main brand color that appears most often — usually on the logo and the primary action button. The color most associated with the brand.' },
  { group: 'Color', term: 'Accent Color', definition: 'A secondary color used sparingly for emphasis. Highlights, hover states, or special callouts. Stays rare on purpose so it draws the eye when it appears.' },
  { group: 'Color', term: 'Foreground / Background', definition: 'Foreground is the color of the content (text, icons). Background is the color behind it. Most accessibility issues come from foreground and background being too close in brightness.' },
  { group: 'Color', term: 'Hex Code', definition: 'A 6-character color code prefixed with #. #FF6B00 means a specific orange. Each pair represents red, green, and blue values. The most common way to write colors in CSS.' },
  { group: 'Color', term: 'RGB', definition: 'A color defined by three numbers — Red, Green, Blue — each from 0 to 255. rgb(255, 107, 0) is the same color as #FF6B00.' },
  { group: 'Color', term: 'HSL', definition: 'A color defined by Hue, Saturation, and Lightness. Easier to adjust by hand than RGB or hex because you can change the lightness without picking a new color from scratch.' },
  { group: 'Color', term: 'Contrast Ratio', definition: 'The measured difference in brightness between two colors. WCAG accessibility standards require at least 4.5:1 for body text and 3:1 for large text. Lower ratios become unreadable for many users.' },
  { group: 'Color', term: 'Tint', definition: 'A color mixed with white. Light pink is a tint of red. Used to make softer, less aggressive versions of a brand color.' },
  { group: 'Color', term: 'Shade', definition: 'A color mixed with black. Dark navy is a shade of blue. Used for darker variants like hover states or pressed buttons.' },
  { group: 'Color', term: 'Dark Mode', definition: 'A version of a design with dark backgrounds and light text. Once a niche preference, now expected by default. Requires its own color palette — you cannot just invert light mode.' },
  { group: 'Color', term: 'Semantic Color', definition: 'A color reserved to communicate meaning — green for success, red for error, amber for warning, blue for info. The user learns the meaning and recognizes it instantly.' },

  // ─── Visual Design Principles ───
  { group: 'Visual Design Principles', term: 'Contrast', definition: 'The visible difference between two elements — light vs. dark, big vs. small, bold vs. thin. Without contrast, nothing stands out and nothing reads. The single most important design principle.' },
  { group: 'Visual Design Principles', term: 'Alignment', definition: 'Keeping elements lined up to shared invisible lines. Misaligned designs feel sloppy even when the user cannot say why. Strong alignment is what makes a page feel intentional.' },
  { group: 'Visual Design Principles', term: 'Balance', definition: 'The distribution of visual weight across a layout. Symmetric balance feels formal; asymmetric balance feels modern. Unbalanced layouts feel like one side is about to tip over.' },
  { group: 'Visual Design Principles', term: 'Rhythm', definition: 'The repeating pattern of spacing, sizes, and elements that gives a page a sense of flow. Predictable rhythm makes long pages feel scannable; broken rhythm signals "something changed, pay attention."' },
  { group: 'Visual Design Principles', term: 'Proximity', definition: 'Placing related elements close together so the eye groups them automatically. A label and its input belong close; two unrelated buttons need a gap.' },
  { group: 'Visual Design Principles', term: 'Visual Weight', definition: 'How heavy or dominant an element feels. Bigger, bolder, darker, and higher contrast elements carry more weight. Designers balance weight to control where the eye goes.' },
  { group: 'Visual Design Principles', term: 'Affordance', definition: 'A visual cue that tells the user what an element does. A button looks pressable; a link looks clickable; an input looks like you can type in it. Without affordance, users have to guess.' },
  { group: 'Visual Design Principles', term: 'Consistency', definition: 'Using the same patterns, colors, spacing, and components across the whole site. Consistency builds trust; inconsistency makes a site feel like it was made by five different people.' },

  // ─── Components & UI Patterns ───
  { group: 'Components & UI Patterns', term: 'Component', definition: 'A reusable piece of UI — a button, card, input, modal. Built once, used everywhere. The atom of any modern interface.' },
  { group: 'Components & UI Patterns', term: 'Primary Button', definition: 'The most important button on a screen — the one the user is expected to click. Usually filled with the brand color and visually heavier than other buttons on the page.' },
  { group: 'Components & UI Patterns', term: 'Secondary Button', definition: 'A button for supporting actions (cancel, back, learn more). Visually lighter than the primary button so the user is not torn between two equally weighted choices.' },
  { group: 'Components & UI Patterns', term: 'Ghost Button', definition: 'A button with no background, just an outline or plain text. The lightest button option. Used for tertiary actions that should not compete for attention.' },
  { group: 'Components & UI Patterns', term: 'Card', definition: 'A self-contained block of content with its own background, border, or shadow. Used for repeating items like blog posts, product tiles, or pricing tiers.' },
  { group: 'Components & UI Patterns', term: 'Modal (Dialog)', definition: 'An overlay that interrupts the page to ask for confirmation or focus the user on one task. Closes the rest of the page until the user acts.' },
  { group: 'Components & UI Patterns', term: 'Input Field', definition: 'The box where a user types text — search bars, email fields, password fields. The single hardest component to design well across all states.' },
  { group: 'Components & UI Patterns', term: 'Form', definition: 'A group of inputs collected for submission. Sign-up forms, contact forms, checkout forms. The friction in a form directly affects how many users complete it.' },
  { group: 'Components & UI Patterns', term: 'Navigation (Nav)', definition: 'The menu of links that lets users move around the site. Usually at the top, sometimes on the side. The map of the site, made visible.' },
  { group: 'Components & UI Patterns', term: 'Header', definition: 'The section at the very top of every page. Usually contains the logo, navigation, and a primary CTA. The first thing users see and the most-clicked region of any site.' },
  { group: 'Components & UI Patterns', term: 'Footer', definition: 'The section at the very bottom of every page. Holds links, legal info, contact details, and social icons. The catch-all for anything that does not deserve top-level placement.' },
  { group: 'Components & UI Patterns', term: 'Sidebar', definition: 'A vertical column of navigation or supplementary content next to the main page content. Common in dashboards, documentation, and admin tools.' },
  { group: 'Components & UI Patterns', term: 'Avatar', definition: 'A small profile picture or icon, usually round. Represents a user, an author, or a brand.' },
  { group: 'Components & UI Patterns', term: 'Badge', definition: 'A small label that calls attention to a count or status — a red dot with "3" on an inbox icon, a "NEW" tag on a menu item.' },
  { group: 'Components & UI Patterns', term: 'Tag (Chip)', definition: 'A small label used to categorize content — "Design", "CSS", "Tutorial". Often clickable to filter a list by that category.' },
  { group: 'Components & UI Patterns', term: 'Tooltip', definition: 'A small popup that appears on hover or focus, explaining what an element does. Reserved for short, one-line clarifications.' },
  { group: 'Components & UI Patterns', term: 'Toast', definition: 'A small temporary notification that appears at the corner of the screen, then disappears on its own. Used for non-blocking feedback like "Saved" or "Copied to clipboard".' },
  { group: 'Components & UI Patterns', term: 'Tabs', definition: 'A control that lets the user switch between views without leaving the page. Each tab reveals different content in the same space.' },
  { group: 'Components & UI Patterns', term: 'Accordion', definition: 'A stack of headers that expand to reveal hidden content when clicked. Used for FAQs and dense content lists where most items can stay collapsed.' },
  { group: 'Components & UI Patterns', term: 'Breadcrumb', definition: 'A row of small links showing where the user is in the site hierarchy (Home > Products > Shoes > Running). Helps users orient themselves on deep pages.' },

  // ─── States & Interaction ───
  { group: 'States & Interaction', term: 'State', definition: 'How an element looks or behaves at a specific moment — resting, hovered, clicked, focused, disabled, loading. Designing every state is what separates polished UI from rough UI.' },
  { group: 'States & Interaction', term: 'Hover', definition: 'What happens when the cursor sits on an element. A button might change color, a card might lift, a link might underline. Hover does not exist on touch devices, so it cannot be the only signal.' },
  { group: 'States & Interaction', term: 'Active (Pressed)', definition: 'The visual response while the user is actively pressing an element. A button might shrink slightly or get darker. Confirms to the user that the click registered.' },
  { group: 'States & Interaction', term: 'Focus', definition: 'When an element is selected by keyboard navigation or click, ready to receive input. Critical for users navigating with a keyboard or screen reader.' },
  { group: 'States & Interaction', term: 'Focus Ring', definition: 'The visible outline around the currently focused element. Often a colored border or glow. Removing the focus ring without replacing it breaks keyboard accessibility.' },
  { group: 'States & Interaction', term: 'Disabled', definition: 'An element that exists but cannot be interacted with. Usually faded to roughly 50% opacity and stripped of hover states. Should also explain why it is disabled where possible.' },
  { group: 'States & Interaction', term: 'Empty State', definition: 'What the user sees when there is no content yet — a "no results" screen, a first-time user dashboard, an empty inbox. The opportunity to explain what to do next instead of showing nothing.' },
  { group: 'States & Interaction', term: 'Loading State', definition: 'What the user sees while content is being fetched. A spinner, a skeleton, a progress bar. Tells the user the page is working and prevents the assumption that something broke.' },
  { group: 'States & Interaction', term: 'Error State', definition: 'What the user sees when something went wrong — a form validation error, a failed request, a missing page. Should explain what happened and what to do about it.' },
  { group: 'States & Interaction', term: 'Skeleton', definition: 'A gray, often shimmering placeholder shaped like the content that is about to load. Feels faster than a spinner because the user can see the layout filling in.' },

  // ─── Responsive Design ───
  { group: 'Responsive Design', term: 'Responsive', definition: 'A design that adapts to different screen sizes. The same site reflows on a phone, tablet, and desktop without users needing a separate mobile version.' },
  { group: 'Responsive Design', term: 'Mobile-First', definition: 'Designing for phones before bigger screens. Forces hard prioritization of content, since there is less room. Then adapt upward as the screen gets wider.' },
  { group: 'Responsive Design', term: 'Breakpoint', definition: 'The screen width at which a layout changes. Common breakpoints are around 640px (mobile to tablet), 1024px (tablet to laptop), and 1280px (laptop to desktop).' },
  { group: 'Responsive Design', term: 'Viewport', definition: 'The visible area of the page on the user\'s screen. A phone\'s viewport is usually about 390px wide; a desktop monitor might be 1440px or wider.' },
  { group: 'Responsive Design', term: 'Container Query', definition: 'A layout rule based on the size of the container an element sits in, not the size of the whole screen. Lets a card behave differently in a sidebar than in a full-width section.' },
  { group: 'Responsive Design', term: 'Touch Target', definition: 'The clickable area of a button, link, or icon. Should be at least 44x44 pixels so a fingertip can hit it reliably. Anything smaller is a usability problem on mobile.' },
  { group: 'Responsive Design', term: 'Hamburger Menu', definition: 'The three-line icon used to hide navigation on small screens. Tapping it expands the full menu. Common solution for collapsing desktop navs on mobile.' },

  // ─── Effects, Motion & Polish ───
  { group: 'Effects, Motion & Polish', term: 'Border', definition: 'The line drawn around the edge of an element. Defined by width, style (solid, dashed, dotted), and color. Used for inputs, cards, and dividers.' },
  { group: 'Effects, Motion & Polish', term: 'Border Radius (Corner Radius)', definition: 'How rounded the corners of an element are. 0 is sharp; high values become a pill or a circle. A consistent radius across components is one of the simplest unifiers of a design.' },
  { group: 'Effects, Motion & Polish', term: 'Box Shadow', definition: 'A soft shadow drawn around an element to give the impression of depth. Lifts cards, modals, and floating menus off the background.' },
  { group: 'Effects, Motion & Polish', term: 'Drop Shadow', definition: 'A shadow specifically positioned below an element, simulating a light source above it. Subtle drop shadows make UI feel tactile; heavy ones feel dated.' },
  { group: 'Effects, Motion & Polish', term: 'Gradient', definition: 'A smooth blend between two or more colors. Linear gradients flow in a straight direction; radial gradients spread out from a point. Used for backgrounds, buttons, and accents.' },
  { group: 'Effects, Motion & Polish', term: 'Opacity', definition: 'How transparent an element is. 0 is invisible, 1 (or 100%) is fully solid. Used for hover dimming, disabled states, and layered overlays.' },
  { group: 'Effects, Motion & Polish', term: 'Blur', definition: 'A softening effect applied to an image or background. Common in glassmorphism and to de-emphasize background content behind a modal.' },
  { group: 'Effects, Motion & Polish', term: 'Glassmorphism', definition: 'The frosted-glass look — a translucent background with a heavy blur applied to whatever is behind it. Lets layered UI feel deep without obscuring what is underneath.' },
  { group: 'Effects, Motion & Polish', term: 'Easing', definition: 'How an animation accelerates and decelerates over time. Linear feels mechanical; ease-out (fast then slow) feels natural. Custom easing curves are what make motion feel intentional instead of generic.' },
  { group: 'Effects, Motion & Polish', term: 'Transition', definition: 'A smooth change between two states of an element — a button changing color on hover, a card lifting on hover. Defined by the property being changed, the duration, and the easing.' },
  { group: 'Effects, Motion & Polish', term: 'Animation', definition: 'A piece of motion that plays through defined keyframes — an icon spinning, a logo fading in, content sliding into view. More involved than a transition because it can change multiple properties over time.' },
  { group: 'Effects, Motion & Polish', term: 'Micro-Interaction', definition: 'A small animated response to a user action — a heart icon pulsing when liked, a checkmark drawing in when a task completes. Tiny moments that make the product feel alive.' },

  // ─── Design Process & Tools ───
  { group: 'Design Process & Tools', term: 'Wireframe', definition: 'A low-fidelity layout sketch focused on structure, not visuals. Usually just boxes, lines, and placeholder text. The blueprint before any design work happens.' },
  { group: 'Design Process & Tools', term: 'Mockup', definition: 'A high-fidelity static design showing what the final UI will actually look like. Includes real colors, type, imagery, and content. The "this is what we are going to build" version.' },
  { group: 'Design Process & Tools', term: 'Prototype', definition: 'A clickable mockup that simulates how the real interface will work. Lets the team test flows and interactions before any code is written.' },
  { group: 'Design Process & Tools', term: 'Design System', definition: 'A single source of truth that defines every reusable color, type style, spacing value, and component. Built so a team of any size can ship consistent UI without re-deciding the basics every time.' },
  { group: 'Design Process & Tools', term: 'Design Tokens', definition: 'The smallest design decisions stored as named variables — color-accent, space-md, radius-lg. Tokens get referenced everywhere, so changing one updates the whole product.' },
  { group: 'Design Process & Tools', term: 'Component Library', definition: 'The shared file or codebase that contains every reusable UI component, fully designed and built. The output of a design system, ready to be assembled into pages.' },
  { group: 'Design Process & Tools', term: 'Style Guide', definition: 'A document showing how the brand and design system should be used — type rules, color usage, do-and-don\'t examples. Lives alongside the component library but speaks to humans instead of files.' },
  { group: 'Design Process & Tools', term: 'Moodboard', definition: 'A collection of references — screenshots, images, type samples, color swatches — that set the visual direction before any designing begins.' },
  { group: 'Design Process & Tools', term: 'Hand-Off', definition: 'The moment a finished design is passed from the designer to whoever is building it. Includes specs for spacing, colors, type, and any interactive behavior.' },
  { group: 'Design Process & Tools', term: 'Spec', definition: 'The exact measurements and properties of a design — the padding values, hex codes, font sizes, and shadow blur radii needed to build it accurately.' },
];

const doc = {
  _type: 'trainingAsset',
  title: 'Website Design Word List',
  slug: { _type: 'slug', current: 'website-design-word-list' },
  category: 'word-list',
  tagline: 'Every word in a design review, defined.',
  description: 'Layout, typography, color, components, motion, and process.',
  accent: 'teal',
  order: 2,
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
