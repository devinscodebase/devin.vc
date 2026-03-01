import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ka7dwvnq',
  dataset: 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const posts = [
  {
    _type: 'journal',
    title: 'The Taste Gap',
    slug: { _type: 'slug', current: 'the-taste-gap' },
    description:
      'Why the hardest part of building anything isn\'t execution — it\'s closing the distance between what you can envision and what you can ship.',
    tag: 'essay',
    date: '2026-02-18',
    featured: true,
    noIndex: false,
    body: [
      {
        _type: 'block',
        _key: 'tg1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg1a',
            marks: [],
            text: 'Ira Glass once described something every creator knows but few can articulate: the gap between your taste and your ability. You got into this work because you have good taste. You can recognize great work when you see it. But the things you make — at least early on — don\'t meet that standard. And that gap is painful.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg2',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg2a',
            marks: [],
            text: 'Most people talk about this in the context of creative beginners. But the taste gap never fully closes. It just changes shape. The more experienced you get, the more refined your eye becomes — and the more you notice the distance between the vision in your head and the reality on the screen.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg3',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg3a',
            marks: [],
            text: 'Taste as competitive advantage',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg4',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg4a',
            marks: [],
            text: 'In a world flooded with tools that make it trivially easy to ship, taste is the last remaining moat. Anyone can spin up a landing page. Anyone can launch a product. The raw act of building has been democratized to the point of commoditization. What hasn\'t been democratized is the ability to look at something and know — in your gut — that it\'s not right yet.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg5',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg5a',
            marks: [],
            text: 'Taste is what makes you obsess over the easing curve on a button animation when everyone else has already moved on to the next ticket. It\'s what makes you rewrite a headline seven times because six of them were ',
          },
          {
            _type: 'span',
            _key: 'tg5b',
            marks: ['em'],
            text: 'fine',
          },
          {
            _type: 'span',
            _key: 'tg5c',
            marks: [],
            text: ' — and fine is the enemy of great. Taste is the voice that whispers "something is off" before you can name what it is.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg6',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg6a',
            marks: [],
            text: 'The teams that build things people love — Linear, Stripe, Arc, Apple — don\'t have a speed advantage. They have a taste advantage. They\'re willing to sit with discomfort longer. They\'ll delay shipping not because they\'re slow, but because they can see something the rest of us can\'t yet.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg7',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg7a',
            marks: [],
            text: 'The trap of "good enough"',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg8',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg8a',
            marks: [],
            text: 'Here\'s the uncomfortable truth: most teams optimize for velocity. Ship fast. Learn fast. Iterate. There\'s wisdom in that — but it\'s incomplete wisdom. Speed without taste produces a lot of mediocre things, quickly. You end up with a product that technically works, that checks every box on the spec, but that no one falls in love with.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg9',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg9a',
            marks: [],
            text: '"Good enough" is the most dangerous phrase in product development. Not because the product fails — it won\'t. It\'ll work. People will use it. Metrics might even look healthy for a while. But "good enough" slowly erodes the soul of what you\'re building. Each compromise compounds. Each "we\'ll fix it later" becomes permanent. And one day you look up and realize you\'ve built something that\'s functionally complete but spiritually hollow.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg10',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg10a',
            marks: [],
            text: 'Developing taste',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg11',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg11a',
            marks: [],
            text: 'Taste isn\'t innate. It\'s cultivated. It develops the same way a sommelier\'s palate develops — through exposure, attention, and deliberate comparison. You build taste by studying the best work in your field, by understanding ',
          },
          {
            _type: 'span',
            _key: 'tg11b',
            marks: ['em'],
            text: 'why',
          },
          {
            _type: 'span',
            _key: 'tg11c',
            marks: [],
            text: ' something works, not just that it does.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg12',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg12a',
            marks: [],
            text: 'A few practices that have sharpened mine: saving everything that catches my eye — not to copy, but to build a library of references that trains my subconscious. Asking "what would I change?" about every product I use. Spending time in adjacent disciplines — architecture, typography, film editing — because the principles of craft are universal. And most importantly, shipping relentlessly. You can\'t develop taste in theory. You develop it by making things, cringing at them, and making them again.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg13',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg13a',
            marks: [],
            text: 'Closing the gap',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg14',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg14a',
            marks: [],
            text: 'The gap between your taste and your ability will always exist. That\'s not a bug — it\'s the engine. The discomfort of seeing the distance between what you imagined and what you built is what drives you forward. The moment you stop feeling that tension is the moment you\'ve stopped growing.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'tg15',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'tg15a',
            marks: [],
            text: 'So don\'t try to eliminate the taste gap. Learn to use it. Let it be the compass that tells you where to push harder, where to spend the extra hour, where to say "not yet" when everyone else is saying "ship it." The world doesn\'t need more things that work. It needs more things that sing.',
          },
        ],
      },
    ],
  },
  {
    _type: 'journal',
    title: 'The Art of the Handoff',
    slug: { _type: 'slug', current: 'the-art-of-the-handoff' },
    description:
      'The moment a project moves from one person to another is where most things break. On designing clean interfaces between humans.',
    tag: 'leadership',
    date: '2026-02-04',
    featured: false,
    noIndex: false,
    body: [
      {
        _type: 'block',
        _key: 'ah1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah1a',
            marks: [],
            text: 'Every broken project I\'ve ever seen died at a handoff. Not at the kickoff. Not at the deadline. At the seam where one person\'s understanding ended and another\'s was supposed to begin.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah2',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah2a',
            marks: [],
            text: 'We talk endlessly about strategy, about execution, about talent. But we almost never talk about the connective tissue between them — the moment when context transfers from one mind to another. And yet, this is where the real work lives.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah3',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah3a',
            marks: [],
            text: 'The context problem',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah4',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah4a',
            marks: [],
            text: 'When you\'ve been deep in a project, you carry an enormous amount of implicit knowledge. You know why that decision was made. You know which stakeholder cares about what. You know the three approaches that were considered and rejected. You know the political landmines. This context lives in your head, and most of it never makes it into a document.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah5',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah5a',
            marks: [],
            text: 'So when you hand the project to someone else — "here\'s the brief, here are the files, good luck" — you\'re handing them an iceberg and pretending it\'s just the tip. They can see what was decided. They can\'t see ',
          },
          {
            _type: 'span',
            _key: 'ah5b',
            marks: ['em'],
            text: 'why',
          },
          {
            _type: 'span',
            _key: 'ah5c',
            marks: [],
            text: '. And without the why, they\'ll inevitably re-litigate decisions, miss constraints, or optimize for the wrong thing.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah6',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah6a',
            marks: [],
            text: 'Designing the interface',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah7',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah7a',
            marks: [],
            text: 'Software engineers figured this out decades ago. When two systems need to communicate, you design an interface — a clear, documented contract between them. The interface defines what goes in, what comes out, and what each side is responsible for. Good interfaces are the reason complex software works at all.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah8',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah8a',
            marks: [],
            text: 'Human handoffs need the same rigor. Not a 40-page document no one reads — a clear, structured transfer of the essential context. I\'ve found that a good handoff answers exactly five questions:',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah9',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah9a',
            marks: ['strong'],
            text: 'Where are we?',
          },
          {
            _type: 'span',
            _key: 'ah9b',
            marks: [],
            text: ' The current state, honestly assessed. Not where the plan says we should be. Where we actually are.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah10',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah10a',
            marks: ['strong'],
            text: 'Why are we here?',
          },
          {
            _type: 'span',
            _key: 'ah10b',
            marks: [],
            text: ' The key decisions that shaped the current state, including the ones that went sideways. Context on constraints, tradeoffs, and the reasoning behind non-obvious choices.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah11',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah11a',
            marks: ['strong'],
            text: 'Where are we going?',
          },
          {
            _type: 'span',
            _key: 'ah11b',
            marks: [],
            text: ' The intended outcome. Not a list of tasks — the actual destination. What does "done" look like, and what does success feel like?',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah12',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah12a',
            marks: ['strong'],
            text: 'What could go wrong?',
          },
          {
            _type: 'span',
            _key: 'ah12b',
            marks: [],
            text: ' The risks you can see from your vantage point. The stakeholder who changes their mind. The technical constraint lurking under the surface. The thing that kept you up at night.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah13',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah13a',
            marks: ['strong'],
            text: 'Who matters?',
          },
          {
            _type: 'span',
            _key: 'ah13b',
            marks: [],
            text: ' The people with influence, their motivations, and how to work with them. The human map of the project.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah14',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah14a',
            marks: [],
            text: 'Leaders as editors',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah15',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah15a',
            marks: [],
            text: 'The best leaders I\'ve worked with aren\'t the most visionary or the most charismatic. They\'re the ones who are exceptional at editing information flow. They take a complex, messy reality and compress it into something their team can actually act on. They absorb ambiguity so their team doesn\'t have to.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah16',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah16a',
            marks: [],
            text: 'This is the real work of leadership — not making decisions, but creating the conditions for good decisions to happen. And that starts with clean handoffs. Clean briefs. Clear context. The unglamorous work of making sure the person after you has everything they need to succeed.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'ah17',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'ah17a',
            marks: [],
            text: 'Every minute you invest in a clean handoff saves hours of misalignment downstream. It\'s the highest-leverage work that almost nobody prioritizes — because it doesn\'t feel like "real work." It feels like overhead. But it\'s not overhead. It\'s the infrastructure that makes everything else possible.',
          },
        ],
      },
    ],
  },
  {
    _type: 'journal',
    title: 'Build the Reps',
    slug: { _type: 'slug', current: 'build-the-reps' },
    description:
      'Mastery isn\'t inspiration — it\'s volume. On the unsexy discipline of showing up every day and trusting the compound effect of consistency.',
    tag: 'process',
    date: '2026-01-21',
    featured: false,
    noIndex: false,
    body: [
      {
        _type: 'block',
        _key: 'br1',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br1a',
            marks: [],
            text: 'Nobody wants to hear this, but the secret to getting great at anything is profoundly boring. It\'s not a framework. It\'s not a breakthrough insight. It\'s not even talent. It\'s reps. An unglamorous, repetitive, sometimes soul-crushing volume of reps.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br2',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br2a',
            marks: [],
            text: 'Every person I admire — every designer whose work stops me mid-scroll, every writer whose sentences I reread, every builder whose products feel inevitable — got there the same way. They did the work. A lot. Over and over. Not because each rep was a masterpiece, but because the accumulation of reps is what eventually produces mastery.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br3',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br3a',
            marks: [],
            text: 'Consistency beats intensity',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br4',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br4a',
            marks: [],
            text: 'We love intensity. The late-night sprint. The caffeine-fueled weekend where everything comes together. The burst of creative energy that produces something brilliant in a single sitting. It makes for a great story. But intensity is the sugar rush of productivity — a spike followed by a crash.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br5',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br5a',
            marks: [],
            text: 'Consistency is the opposite. It\'s not exciting. Showing up at the same time, doing the same kind of work, making incremental progress — none of that makes for a viral tweet. But consistency compounds. One hour a day, every day, for a year is 365 hours. That\'s roughly nine 40-hour work weeks. Dedicated to a single craft. That kind of focused accumulation changes you in ways a weekend sprint never will.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br6',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br6a',
            marks: [],
            text: 'The math is simple but the execution requires something most people struggle with: tolerance for being mediocre. When you commit to reps, you have to accept that most of what you produce won\'t be good. You\'re not showing up to create your best work every day. You\'re showing up to create your ',
          },
          {
            _type: 'span',
            _key: 'br6b',
            marks: ['em'],
            text: 'next',
          },
          {
            _type: 'span',
            _key: 'br6c',
            marks: [],
            text: ' work. The quality takes care of itself over time.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br7',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br7a',
            marks: [],
            text: 'Designing for reps',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br8',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br8a',
            marks: [],
            text: 'If consistency is the goal, then your job is to reduce the friction of doing the work. Motivation is unreliable. Discipline is finite. The only sustainable approach is to make the reps so easy to start that not starting feels harder than starting.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br9',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br9a',
            marks: [],
            text: 'For me, that means: a fixed time block every morning where I write or design — no decisions about when or what, just open the file and go. A running list of small projects that I can pick from without deliberation. An environment where the tools are already open, the notifications are off, and the only thing left to do is the work.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br10',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br10a',
            marks: [],
            text: 'I\'ve also learned to separate the creating from the judging. When you\'re building reps, you can\'t afford to evaluate every output in real time. That inner critic slows you down, makes you precious, and eventually makes you stop. Create first. Judge later. The reps are about output, not quality control.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br11',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br11a',
            marks: [],
            text: 'The compound effect',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br12',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br12a',
            marks: [],
            text: 'Here\'s what nobody tells you about reps: the returns are non-linear. The first hundred reps feel like nothing. The next hundred start to build patterns you can feel but not articulate. Somewhere around the five-hundredth rep, something shifts. Your hands start to know things your brain hasn\'t caught up to yet. You stop thinking about the mechanics and start thinking about the meaning.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br13',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br13a',
            marks: [],
            text: 'This is the compound effect in action. Each rep builds on every rep before it. Your subconscious is pattern-matching across hundreds of attempts, finding connections you couldn\'t make consciously. The "overnight breakthrough" everyone celebrates is really just the moment when all those quiet reps finally become visible.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br14',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br14a',
            marks: [],
            text: 'Trust the process',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br15',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br15a',
            marks: [],
            text: 'The hardest part of building reps isn\'t the work itself. It\'s trusting that the work matters during the long stretch where you can\'t see the results. It\'s showing up on day forty-seven when nothing feels different, when the gap between where you are and where you want to be seems just as wide as it did on day one.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'br16',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'br16a',
            marks: [],
            text: 'But this is exactly the point. The people who break through aren\'t the ones with more talent or better tools. They\'re the ones who kept going when it didn\'t feel like it was working. They trusted the reps. And eventually, the reps rewarded them.',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('Seeding journal posts...\n');

  for (const post of posts) {
    const result = await client.create(post);
    console.log(`  ✓ Created "${post.title}" (${result._id})`);
  }

  console.log('\nDone — 3 posts created.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
