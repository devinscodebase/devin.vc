// ────────────────────────────────────────────────────────────────
// QuoteFlow.tsx — the /quote funnel as ONE hydrated island
// (client:load — the flow IS the page). Three steps toggled with
// the `hidden` attribute, so the SSR HTML ships step 1 visible and
// the honeypot field present in the initial document. Contact info
// is collected once, in step 3, right before the price is revealed,
// never before.
//
// FULLY CLIENT SIDE. The site has no server layer, so the flow
// computes the price locally with calculateQuote() and reveals it
// on submit. Nothing is transmitted. When a data layer exists again,
// the place to POST the lead is handleGateSubmit, right after
// validation passes and before setView('result').
//
// The honeypot field is kept in the DOM, inert, because it has to be
// in the initial HTML to be worth anything and it costs nothing to
// carry until there is an endpoint to validate it.
// ────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { calculateQuote, REVENUE_BANDS, SERVICES, type QuoteResult } from '../lib/pricing';

import iconMoney from '../icons/freehand/money.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';
import iconUser from '../icons/freehand/user.svg?raw';
import iconMail from '../icons/freehand/mail.svg?raw';

const industries = [
  'E-commerce or retail',
  'Professional services',
  'Home services or trades',
  'Health and wellness',
  'Hospitality or food and beverage',
  'B2B or software',
  'Other',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function QuoteFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [view, setView] = useState<'gate' | 'result'>('gate');

  const [industry, setIndustry] = useState('');
  const [revenueBand, setRevenueBand] = useState('');
  const [whatYouSell, setWhatYouSell] = useState('');
  const [services, setServices] = useState<Set<string>>(() => new Set());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState({
    industry: false,
    revenue: false,
    services: false,
    name: false,
    email: false,
  });
  const [quote, setQuote] = useState<{ result: QuoteResult; revenueBandId: string } | null>(null);

  const step1HeadingRef = useRef<HTMLHeadingElement>(null);
  const step2HeadingRef = useRef<HTMLHeadingElement>(null);
  const step3HeadingRef = useRef<HTMLHeadingElement>(null);
  // The honeypot stays UNcontrolled and is read from the DOM at
  // submit time: a bot writing to the input directly must be
  // captured, and controlled state would overwrite its value.
  const websiteRef = useRef<HTMLInputElement>(null);
  const skipFocusRef = useRef(true);

  // ── Focus lands on the active step's heading on every step
  // change, skipping the initial mount (no focus steal on load). ──
  useEffect(() => {
    if (skipFocusRef.current) {
      skipFocusRef.current = false;
      return;
    }
    const heading =
      step === 1 ? step1HeadingRef.current : step === 2 ? step2HeadingRef.current : step3HeadingRef.current;
    heading?.focus();
  }, [step]);

  const toggleService = (id: string) => {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Step 1 → 2 ──
  const handleStep1Next = () => {
    const industryInvalid = industry === '';
    const revenueInvalid = revenueBand === '';
    setErrors((prev) => ({ ...prev, industry: industryInvalid, revenue: revenueInvalid }));
    if (industryInvalid || revenueInvalid) return;
    setStep(2);
  };

  // ── Step 2 → 3 ──
  const handleStep2Next = () => {
    if (services.size === 0) {
      setErrors((prev) => ({ ...prev, services: true }));
      return;
    }
    setErrors((prev) => ({ ...prev, services: false }));
    setStep(3);
  };

  // ── Gate submit ──
  const handleGateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    let valid = true;
    const nameInvalid = !trimmedName;
    const emailInvalid = !trimmedEmail || !EMAIL_RE.test(trimmedEmail);
    if (nameInvalid) valid = false;
    if (emailInvalid) valid = false;
    setErrors((prev) => ({ ...prev, name: nameInvalid, email: emailInvalid }));
    // Existing wart, preserved on purpose: an unchecked consent box
    // blocks the submit silently, with no field error.
    if (!consent) valid = false;
    if (!valid) return;

    // SERVICES order regardless of check order, matching the old
    // DOM-order querySelectorAll read.
    const selectedServiceIds = SERVICES.filter((s) => services.has(s.id)).map((s) => s.id);

    setQuote({ result: calculateQuote(selectedServiceIds, revenueBand), revenueBandId: revenueBand });
    setView('result');
  };

  const bandLabel = quote
    ? (REVENUE_BANDS.find((b) => b.id === quote.revenueBandId)?.label ?? 'your revenue band')
    : '';
  const breakdownNote = quote
    ? quote.result.lineItems.length > 1
      ? 'Adjusted for ' + bandLabel + ' revenue and a ' + quote.result.lineItems.length + '-service bundle discount.'
      : 'Adjusted for ' + bandLabel + ' revenue.'
    : '';

  return (
    <div className="max-w-sm" id="quoteFlow">
      <p className="label is-kicker" id="quoteStepLabel" aria-live="polite">{'Step ' + step + ' of 3'}</p>

      {/* ── Step 1 — About your business ── */}
      <div className="card quote_card mt-medium" id="quoteStep1" hidden={step !== 1}>
        <h3 className="text-h4" id="quoteStep1Heading" tabIndex={-1} ref={step1HeadingRef}>About your business</h3>

        <div className="flex flex-col gap-large mt-large">
          <div className={errors.industry ? 'field is-error' : 'field'} id="quoteIndustryField">
            <label className="label" htmlFor="quoteIndustry">Industry</label>
            <select
              className="field_input"
              id="quoteIndustry"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="" disabled>Choose one</option>
              {industries.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <p className="field_message" id="quoteIndustryMessage" hidden={!errors.industry}>Choose an industry.</p>
          </div>

          <fieldset className={errors.revenue ? 'field_group is-error' : 'field_group'} id="quoteRevenueGroup">
            <legend className="label">Annual revenue</legend>
            <div className="flex flex-col gap-small mt-small">
              {REVENUE_BANDS.map((band) => (
                <label key={band.id} className="field_check">
                  <input
                    type="radio"
                    name="revenueBand"
                    value={band.id}
                    checked={revenueBand === band.id}
                    onChange={() => setRevenueBand(band.id)}
                  />
                  {band.label}
                </label>
              ))}
            </div>
            <p className="field_message mt-small" id="quoteRevenueMessage" hidden={!errors.revenue}>Choose a revenue range.</p>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor="quoteWhatYouSell">What do you sell?</label>
            <textarea
              className="field_input"
              id="quoteWhatYouSell"
              rows={3}
              maxLength={200}
              placeholder="A sentence or two is plenty"
              value={whatYouSell}
              onChange={(e) => setWhatYouSell(e.target.value)}
            ></textarea>
            <p className="field_message">Optional. Helps me understand your business before we talk.</p>
          </div>
        </div>

        <div className="button-group mt-xlarge">
          <button className="button" type="button" id="quoteStep1Next" onClick={handleStep1Next}>
            Next <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} />
          </button>
        </div>
      </div>

      {/* ── Step 2 — What you need ── */}
      <div className="card quote_card mt-medium" id="quoteStep2" hidden={step !== 2}>
        <h3 className="text-h4" id="quoteStep2Heading" tabIndex={-1} ref={step2HeadingRef}>What you need</h3>

        <fieldset className={errors.services ? 'field_group mt-large is-error' : 'field_group mt-large'} id="quoteServicesGroup">
          <legend className="label">Select any that apply</legend>
          <div className="flex flex-col gap-medium mt-small">
            {SERVICES.map((service) => (
              <label key={service.id} className="field_check items-start">
                <input
                  type="checkbox"
                  name="services"
                  value={service.id}
                  checked={services.has(service.id)}
                  onChange={() => toggleService(service.id)}
                />
                <span className="flex flex-col gap-tiny">
                  <span className="text-body">{service.label}</span>
                  <span className="text-small text-ink-muted">{service.description}</span>
                  <span className="label text-ink-muted">
                    {'From $' + service.basePrice.toLocaleString('en-US') + (service.type === 'monthly' ? ' a month' : '')}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="field_message mt-small" id="quoteServicesMessage" hidden={!errors.services}>Select at least one service.</p>
        </fieldset>

        <div className="button-group mt-xlarge">
          <button className="button is-secondary" type="button" id="quoteStep2Back" onClick={() => setStep(1)}>Back</button>
          <button className="button" type="button" id="quoteStep2Next" onClick={handleStep2Next}>
            See my number <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconArrowRight }} />
          </button>
        </div>
      </div>

      {/* ── Step 3 — Your price (the gate) ── */}
      <div className="card quote_card mt-medium" id="quoteStep3" hidden={step !== 3}>
        <h3 className="text-h4" id="quoteStep3Heading" tabIndex={-1} ref={step3HeadingRef}>Your price</h3>

        <div id="quoteGateWrap" hidden={view !== 'gate'}>
          <p className="text-small text-ink-muted mt-tiny">Two fields, then the number.</p>

          <form id="quoteGateForm" noValidate className="mt-large" onSubmit={handleGateSubmit}>
            <div className="flex flex-col gap-large">
              <div className={errors.name ? 'field is-error' : 'field'} id="quoteNameField">
                <label className="label" htmlFor="quoteName">Name</label>
                <div className="field_control">
                  <span className="field_icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconUser }} />
                  <input
                    className="field_input"
                    id="quoteName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <p className="field_message" id="quoteNameMessage" hidden={!errors.name}>Enter your name.</p>
              </div>

              <div className={errors.email ? 'field is-error' : 'field'} id="quoteEmailField">
                <label className="label" htmlFor="quoteEmail">Email</label>
                <div className="field_control">
                  <span className="field_icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconMail }} />
                  <input
                    className="field_input"
                    id="quoteEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="field_message" id="quoteEmailMessage" hidden={!errors.email}>Enter a valid email address.</p>
              </div>

              {/* Honeypot: a real field, visually hidden (clip technique,
                  not display:none, so a computed-style check still finds
                  a real box) rather than removed from the DOM. Hidden by
                  the .quote_honeypot rule in global.css. Not in the tab
                  order and never autofilled. A human never sees or fills
                  this in. Inert until there is an endpoint to check it. */}
              <div className="field quote_honeypot" aria-hidden="true">
                <label className="label" htmlFor="quoteWebsite">Leave this field blank</label>
                <input className="field_input" id="quoteWebsite" name="website" type="text" tabIndex={-1} autoComplete="off" ref={websiteRef} />
              </div>

              <label className="field_check">
                <input
                  type="checkbox"
                  id="quoteConsent"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I agree to be contacted about this quote.
              </label>
            </div>

            <div className="button-group mt-xlarge">
              <button className="button is-secondary" type="button" id="quoteStep3Back" onClick={() => setStep(2)}>Back</button>
              <button className="button is-hero" type="submit" id="quoteGateSubmit">
                <span className="icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconMoney }} /> Get my number
              </button>
            </div>
          </form>
        </div>

        <div id="quoteResult" className="mt-large" hidden={view !== 'result'}>
          <div className="flex flex-wrap gap-xlarge" id="quoteStats">
            {quote && quote.result.projectTotal > 0 && (
              <div className="stat">
                <p className="stat_value">{'$' + quote.result.projectTotal.toLocaleString()}</p>
                <p className="label text-ink-muted mt-tiny">To start</p>
              </div>
            )}
            {quote && quote.result.monthlyTotal > 0 && (
              <div className="stat">
                <p className="stat_value">{'$' + quote.result.monthlyTotal.toLocaleString()}</p>
                <p className="label text-ink-muted mt-tiny">A month</p>
              </div>
            )}
          </div>

          <div className="mt-xlarge">
            <p className="label is-kicker">How we priced this</p>
            <ul className="list mt-small" id="quoteBreakdownList">
              {quote &&
                quote.result.lineItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-baseline gap-medium">
                    <span className="text-body">{item.label}</span>
                    <span className="font-mono text-ink-muted">{'$' + item.adjustedPrice.toLocaleString()}</span>
                  </li>
                ))}
            </ul>
            <p className="text-small text-ink-muted mt-medium" id="quoteBreakdownNote">{breakdownNote}</p>
          </div>

          <p className="text-small text-ink-muted mt-xlarge">
            This number is good for 30 days. Project work is half down to
            start, half at delivery. Ongoing work is billed monthly,
            cancel anytime with 30 days' notice.
          </p>
        </div>
      </div>
    </div>
  );
}
