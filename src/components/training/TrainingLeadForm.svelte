<script lang="ts">
  /*
    TrainingLeadForm — the soft gate in front of /words.

    Collects name/email/company/job-title + consent, POSTs to
    /api/training-lead (which saves the lead, emails the asset, and sets the
    per-asset unlock cookie), then sends the visitor straight to the word
    list. The email arrives in parallel; the on-screen link is the fast path.
  */
  import { untrack } from 'svelte';
  import Field from '../ui/Field.svelte';
  import Button from '../ui/Button.svelte';

  let {
    assetSlug,
    assetTitle = 'word list',
    formAction,
    siteKey,
    serverError = '',
  }: {
    assetSlug: string;
    assetTitle?: string;
    formAction: string;
    siteKey?: string;
    serverError?: string;
  } = $props();

  let name = $state('');
  let email = $state('');
  let company = $state('');
  let jobTitle = $state('');
  let consent = $state(false);
  let marketingConsent = $state(false);

  let submitting = $state(false);
  let done = $state(false);
  // Seed the form-level error from any no-JS POST round-trip (initial value
  // only — it's rendered during SSR so a no-JS failure still shows its error).
  let error = $state(untrack(() => serverError));
  let assetUrl = $state('');
  let formEl = $state<HTMLFormElement | null>(null);

  // Per-field errors, surfaced inline rather than dead-ending behind a button.
  let fieldErrors = $state<{ name?: string; email?: string; company?: string; jobTitle?: string }>({});

  const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!name.trim()) next.name = 'Your name is required.';
    if (!email.trim()) next.email = 'Your email is required.';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address.';
    if (!company.trim()) next.company = 'Your company is required.';
    if (!jobTitle.trim()) next.jobTitle = 'Your job title is required.';
    fieldErrors = next;
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) {
      error = '';
      return;
    }
    if (!consent) {
      error = 'Please agree to the Privacy Policy and Terms to continue.';
      return;
    }

    submitting = true;
    error = '';

    // The Turnstile widget injects a hidden input named cf-turnstile-response
    // into the form once solved. Pull it for the JSON request.
    const turnstileToken =
      (formEl?.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value || '';

    try {
      const res = await fetch('/api/training-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, company, jobTitle, assetSlug,
          consent, marketingConsent, turnstileToken, website: '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');

      assetUrl = data.assetUrl || `/training/${assetSlug}/words`;
      done = true;
      // Let the success state register, then open the list.
      setTimeout(() => window.location.assign(assetUrl), 850);
    } catch (err: any) {
      error = err?.message || 'Something went wrong. Please try again.';
      submitting = false;
      // Reset the Turnstile widget so the next attempt gets a fresh token.
      (window as any).turnstile?.reset?.();
    }
  }
</script>

{#if done}
  <div class="lead-done" aria-live="polite">
    <span class="done-mark" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
    <h2 class="done-title">You're in</h2>
    <p class="done-text">
      Opening the list now. A copy is on its way to your inbox too.
    </p>
    <a class="done-link" href={assetUrl}>
      Open the {assetTitle}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 7h12M8 2l5 5-5 5" />
      </svg>
    </a>
  </div>
{:else}
  <form
    class="lead-form"
    method="POST"
    action={formAction}
    onsubmit={onSubmit}
    bind:this={formEl}
    novalidate
  >
    <input type="hidden" name="assetSlug" value={assetSlug} />

    <!-- Honeypot — hidden from humans, irresistible to bots. Filled = spam. -->
    <div class="hp-field" aria-hidden="true">
      <label for="lead-website">Website</label>
      <input id="lead-website" type="text" name="website" tabindex="-1" autocomplete="off" />
    </div>

    <div class="lead-grid">
      <Field
        type="text"
        name="name"
        label="Name"
        ariaLabel="Your name"
        placeholder="Jane Doe"
        autocomplete="name"
        required
        error={fieldErrors.name}
        bind:value={name}
      />
      <Field
        type="email"
        name="email"
        label="Email"
        ariaLabel="Your email address"
        placeholder="jane@company.com"
        autocomplete="email"
        required
        error={fieldErrors.email}
        bind:value={email}
      />
      <Field
        type="text"
        name="company"
        label="Company"
        ariaLabel="Your company"
        placeholder="Company name"
        autocomplete="organization"
        required
        error={fieldErrors.company}
        bind:value={company}
      />
      <Field
        type="text"
        name="jobTitle"
        label="Job title"
        ariaLabel="Your job title"
        placeholder="Marketing Lead"
        autocomplete="organization-title"
        required
        error={fieldErrors.jobTitle}
        bind:value={jobTitle}
      />
    </div>

    <label class="consent-label">
      <input type="checkbox" name="consent" required bind:checked={consent} class="consent-checkbox" />
      <span class="consent-check" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3L4.5 8.5 2 6" />
        </svg>
      </span>
      <span class="consent-text">I agree to the <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="/terms" target="_blank">Terms of Use</a>.</span>
    </label>

    <label class="consent-label">
      <input type="checkbox" name="marketingConsent" bind:checked={marketingConsent} class="consent-checkbox" />
      <span class="consent-check" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3L4.5 8.5 2 6" />
        </svg>
      </span>
      <span class="consent-text">Email me when new training assets are released. <span class="consent-optional">Optional.</span></span>
    </label>

    {#if siteKey}
      <div class="cf-turnstile" data-sitekey={siteKey} data-theme="auto"></div>
    {/if}

    <div class="submit-row">
      <Button type="submit" variant="primary" size="lg" arrow loading={submitting} fullWidth>
        {submitting ? 'Unlocking' : 'Unlock the word list'}
      </Button>
    </div>

    {#if error}
      <p class="lead-error" role="alert">{error}</p>
    {/if}
  </form>
{/if}

<style>
  .lead-form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  /* Honeypot — kept in the layout but off-screen and out of the tab order so
     only bots (which fill every field) ever populate it. */
  .hp-field {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .lead-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem 1.5rem;
  }
  @media (min-width: 520px) {
    .lead-grid { grid-template-columns: 1fr 1fr; }
  }

  /* ---- Consent checkbox (native input under a custom box) ---- */
  .consent-label {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    cursor: pointer;
    user-select: none;
  }
  .consent-checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  .consent-check {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 30%, transparent);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    transition:
      border-color var(--duration-fast) var(--ease-out-expo),
      background-color var(--duration-fast) var(--ease-out-expo);
  }
  .consent-check svg {
    opacity: 0;
    transform: scale(0.5);
    color: var(--words-accent, var(--color-accent));
    transition:
      opacity var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring);
  }
  .consent-checkbox:checked + .consent-check {
    border-color: var(--words-accent, var(--color-accent));
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 12%, transparent);
  }
  .consent-checkbox:checked + .consent-check svg {
    opacity: 1;
    transform: scale(1);
  }
  .consent-checkbox:focus-visible + .consent-check {
    outline: 2px solid var(--words-accent, var(--color-accent));
    outline-offset: 2px;
  }
  .consent-text {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--color-text-muted);
  }
  .consent-text a {
    color: var(--color-text);
    text-decoration: underline;
    text-decoration-color: color-mix(in oklab, var(--color-text-muted) 35%, transparent);
    text-underline-offset: 2px;
    transition: text-decoration-color var(--duration-fast) var(--ease-out-expo);
  }
  .consent-text a:hover { text-decoration-color: var(--words-accent, var(--color-accent)); }
  .consent-optional { color: var(--color-text-subtle); }

  .submit-row { display: flex; }

  .lead-error {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-error);
    text-align: center;
  }

  /* ---- Success state ---- */
  .lead-done {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.85rem;
    padding: clamp(1.5rem, 4vw, 2.5rem) 0;
    animation: lead-enter var(--duration-normal) var(--ease-out-expo) both;
  }
  .done-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-full);
    color: var(--words-accent, var(--color-accent));
    background: color-mix(in oklab, var(--words-accent, var(--color-accent)) 12%, transparent);
    animation: lead-pop var(--duration-slow) var(--ease-out-back) both;
  }
  .done-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.05;
    letter-spacing: var(--tracking-tight);
    color: var(--color-text);
  }
  .done-text {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.6;
    color: var(--color-text-muted);
    max-width: 32ch;
  }
  .done-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.35rem;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--words-accent, var(--color-accent));
    text-decoration: none;
  }
  .done-link svg { transition: transform var(--duration-fast) var(--ease-out-expo); }
  .done-link:hover svg { transform: translateX(3px); }

  @keyframes lead-enter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lead-pop {
    0%   { opacity: 0; transform: scale(0.6); }
    100% { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .lead-done, .done-mark { animation: none; }
  }
</style>
