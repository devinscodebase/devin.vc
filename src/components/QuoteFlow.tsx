// ────────────────────────────────────────────────────────────────
// QuoteFlow.tsx — the /quote funnel as ONE hydrated island
// (client:load — the flow IS the page and the Turnstile widget
// must mount promptly). Three steps toggled with the `hidden`
// attribute, exactly like the removed src/scripts/quote-flow.ts
// controller did, so the SSR HTML ships step 1 visible and the
// honeypot field present in the initial document. Contact info is
// collected once, in step 3, right before the price is revealed —
// never before. Validation copy, focus moves, the aria-live step
// label, the /api/quote POST body shape, and the booking
// mini-flow all match the removed controller verbatim.
//
// Turnstile runs in explicit-render mode. quote.astro loads
// api.js with ?render=explicit&onload=onQuoteTurnstileLoad and
// defines a no-op stub for that global BEFORE the script tag;
// this island overwrites the stub during hydration. Whichever
// side wins the load race, the widget renders exactly once and
// the onload callback can never be undefined. The token arrives
// via the success callback; error/expired callbacks clear it; a
// failed submit resets the widget (tokens are single-use — the
// old flow never reset, a latent bug this fixes); the effect
// cleanup removes the widget.
// ────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react';

import { calculateQuote, REVENUE_BANDS, SERVICES, type QuoteResult } from '../lib/pricing';

import iconMoney from '../icons/freehand/money.svg?raw';
import iconArrowRight from '../icons/freehand/arrow-right.svg?raw';
import iconUser from '../icons/freehand/user.svg?raw';
import iconMail from '../icons/freehand/mail.svg?raw';

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    }
  ) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onQuoteTurnstileLoad?: () => void;
  }
}

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

const GATE_FAIL_TEXT = 'Could not get your number. Please try again or email me@devin.vc directly.';
const NO_TIMES_TEXT = 'No times available that day. Please try another date or email me@devin.vc directly.';
const SLOTS_FAIL_TEXT = 'Could not load available times. Please try again or email me@devin.vc directly.';
const BOOK_FAIL_TEXT = 'Could not book that time. Please try again or email me@devin.vc directly.';

// ── Local-time date helpers, copied from the removed controller.
// isoDate deliberately formats from the local getters, NOT
// toISOString(), which would shift dates across midnight UTC. ──
function nextWeekdays(count: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

interface Slot {
  time: string;
  label: string;
}

type SlotsState = { status: 'idle' } | { status: 'loading' } | { status: 'list'; slots: Slot[] };

interface BookingState {
  selectedDate: string | null;
  slots: SlotsState;
  booked: boolean;
  errorText: string; // '' = the booking error alert stays hidden
}

type BookingAction =
  | { type: 'select-date'; date: string }
  | { type: 'slots-loaded'; slots: Slot[] }
  | { type: 'slots-failed' }
  | { type: 'book-start' }
  | { type: 'book-failed'; errorText: string }
  | { type: 'booked' };

const bookingInitial: BookingState = {
  selectedDate: null,
  slots: { status: 'idle' },
  booked: false,
  errorText: '',
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'select-date':
      return { ...state, selectedDate: action.date, slots: { status: 'loading' }, errorText: '' };
    case 'slots-loaded':
      // An empty day is an error message, not an empty list — same
      // copy and styling as the removed controller.
      return action.slots.length === 0
        ? { ...state, slots: { status: 'idle' }, errorText: NO_TIMES_TEXT }
        : { ...state, slots: { status: 'list', slots: action.slots }, errorText: '' };
    case 'slots-failed':
      return { ...state, slots: { status: 'idle' }, errorText: SLOTS_FAIL_TEXT };
    case 'book-start':
      return { ...state, errorText: '' };
    case 'book-failed':
      return { ...state, errorText: action.errorText };
    case 'booked':
      return { ...state, booked: true };
  }
}

interface Props {
  siteKey: string | undefined;
}

export default function QuoteFlow({ siteKey }: Props) {
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
  const [submitting, setSubmitting] = useState(false);
  const [gateError, setGateError] = useState('');
  const [lead, setLead] = useState({ name: '', email: '' });
  const [quote, setQuote] = useState<{ result: QuoteResult; revenueBandId: string } | null>(null);

  const [booking, dispatch] = useReducer(bookingReducer, bookingInitial);

  const step1HeadingRef = useRef<HTMLHeadingElement>(null);
  const step2HeadingRef = useRef<HTMLHeadingElement>(null);
  const step3HeadingRef = useRef<HTMLHeadingElement>(null);
  // The honeypot stays UNcontrolled and is read from the DOM at
  // submit time: a bot writing to the input directly must be
  // captured, and controlled state would overwrite its value.
  const websiteRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef('');
  const skipFocusRef = useRef(true);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ── Turnstile explicit-render handshake ──
  useEffect(() => {
    // TURNSTILE_SITE_KEY is optional in the env schema; without it
    // the flow degrades exactly like the old page did — no widget,
    // empty turnstileToken in the POST.
    if (!siteKey) return;
    let disposed = false;

    const renderWidget = () => {
      if (disposed || widgetIdRef.current !== null) return;
      const container = turnstileRef.current;
      const api = window.turnstile;
      if (!container || !api) return;
      const widgetId = api.render(container, {
        sitekey: siteKey,
        callback: (token) => {
          tokenRef.current = token;
        },
        'error-callback': () => {
          tokenRef.current = '';
        },
        'expired-callback': () => {
          tokenRef.current = '';
        },
      });
      if (widgetId != null) widgetIdRef.current = widgetId;
    };

    if (window.turnstile) {
      // api.js won the race and already ran the no-op stub.
      renderWidget();
    } else {
      window.onQuoteTurnstileLoad = renderWidget;
    }

    return () => {
      disposed = true;
      if (window.onQuoteTurnstileLoad === renderWidget) {
        window.onQuoteTurnstileLoad = () => {};
      }
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      tokenRef.current = '';
    };
  }, [siteKey]);

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

  const bookingDays = useMemo(() => (view === 'result' ? nextWeekdays(5) : []), [view]);

  const resetTurnstile = () => {
    tokenRef.current = '';
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

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
    setGateError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    let valid = true;
    const nameInvalid = !trimmedName;
    const emailInvalid = !trimmedEmail || !EMAIL_RE.test(trimmedEmail);
    if (nameInvalid) valid = false;
    if (emailInvalid) valid = false;
    setErrors((prev) => ({ ...prev, name: nameInvalid, email: emailInvalid }));
    // Existing wart, preserved on purpose: an unchecked consent box
    // blocks the submit silently, with no field error (flagged in
    // the conversion report, not fixed here).
    if (!consent) valid = false;
    if (!valid) return;

    // SERVICES order regardless of check order, matching the old
    // DOM-order querySelectorAll read.
    const selectedServiceIds = SERVICES.filter((s) => services.has(s.id)).map((s) => s.id);
    const quoteResult = calculateQuote(selectedServiceIds, revenueBand);
    const website = websiteRef.current ? websiteRef.current.value : '';
    const turnstileToken = tokenRef.current;

    setSubmitting(true);

    fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        industry,
        whatYouSell: whatYouSell.trim(),
        revenueBand,
        selectedServiceIds,
        quoteResult,
        website,
        turnstileToken,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then((result) => {
        setSubmitting(false);
        if (!result.ok) {
          setGateError((result.data && result.data.error) || GATE_FAIL_TEXT);
          resetTurnstile();
          return;
        }
        setLead({ name: trimmedName, email: trimmedEmail });
        setQuote({ result: quoteResult, revenueBandId: revenueBand });
        setView('result');
      })
      .catch(() => {
        setSubmitting(false);
        setGateError(GATE_FAIL_TEXT);
        resetTurnstile();
      });
  };

  // ── Booking mini-flow ──
  const selectDate = (date: string) => {
    dispatch({ type: 'select-date', date });
    fetch('/api/availability?date=' + encodeURIComponent(date) + '&timezone=' + encodeURIComponent(timezone))
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'slots-loaded', slots: data.slots || [] });
      })
      .catch(() => {
        dispatch({ type: 'slots-failed' });
      });
  };

  const bookSlot = (slot: Slot) => {
    dispatch({ type: 'book-start' });
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        slot: { time: slot.time },
        timezone,
        notes: 'Booked from /quote',
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then((result) => {
        if (!result.ok) {
          dispatch({
            type: 'book-failed',
            errorText: (result.data && result.data.error) || BOOK_FAIL_TEXT,
          });
          return;
        }
        dispatch({ type: 'booked' });
      })
      .catch(() => {
        dispatch({ type: 'book-failed', errorText: BOOK_FAIL_TEXT });
      });
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
                  the .quote_honeypot rule in global.css (promoted there
                  from this page's old scoped style block; Tailwind's
                  core `sr-only` utility is not generated in this
                  project's build). Not in the tab order and never
                  autofilled. A human never sees or fills this in; a
                  filled value tells the API it is a bot
                  (src/pages/api/quote.ts's website check). */}
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

              <div className="cf-turnstile" id="quoteTurnstile" data-sitekey={siteKey} ref={turnstileRef}></div>

              <div className="alert is-error" id="quoteGateError" hidden={gateError === ''} role="alert">
                <strong>Error</strong> <span id="quoteGateErrorText">{gateError}</span>
              </div>
            </div>

            <div className="button-group mt-xlarge">
              <button className="button is-secondary" type="button" id="quoteStep3Back" onClick={() => setStep(2)}>Back</button>
              <button className={submitting ? 'button is-hero is-loading' : 'button is-hero'} type="submit" id="quoteGateSubmit">
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

          <p className="text-body mt-xlarge">Answered within one business day.</p>
          <p className="text-small text-ink-muted mt-small">
            This number is good for 30 days. Project work is half down to
            start, half at delivery. Ongoing work is billed monthly,
            cancel anytime with 30 days' notice.
          </p>

          <div className="mt-xlarge" id="quoteBooking">
            <p className="label is-kicker">Book a call</p>
            <p className="text-small text-ink-muted mt-tiny">Optional. You get an answer within one business day either way.</p>
            <div className="button-group mt-small" id="quoteBookingDates" hidden={booking.booked}>
              {bookingDays.map((d) => {
                const date = isoDate(d);
                return (
                  <button
                    key={date}
                    className="button is-secondary is-small"
                    type="button"
                    aria-pressed={booking.selectedDate === date}
                    onClick={() => selectDate(date)}
                  >
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </button>
                );
              })}
            </div>
            <p className="text-small text-ink-muted mt-small" id="quoteBookingStatus" hidden={booking.slots.status !== 'loading'}>Loading available times.</p>
            <div className="button-group mt-small" id="quoteBookingSlots" hidden={booking.slots.status !== 'list' || booking.booked}>
              {booking.slots.status === 'list' &&
                booking.slots.slots.map((slot) => (
                  <button key={slot.time} className="button is-small" type="button" onClick={() => bookSlot(slot)}>{slot.label}</button>
                ))}
            </div>
            <p className="text-body mt-small" id="quoteBookingConfirm" hidden={!booking.booked}>Booked. Check your email.</p>
            <div className="alert is-error mt-small" id="quoteBookingError" hidden={booking.errorText === ''} role="alert">
              <strong>Error</strong> <span id="quoteBookingErrorText">{booking.errorText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
