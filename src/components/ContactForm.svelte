<script lang="ts">
  import Field from './ui/Field.svelte';
  import Button from './ui/Button.svelte';

  let name = $state('');
  let email = $state('');
  let message = $state('');
  let consent = $state(false);
  let submitting = $state(false);
  let success = $state(false);
  let error = $state('');

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    error = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Something went wrong');
      }
      success = true;
    } catch (err: any) {
      error = err?.message || 'Something went wrong';
      submitting = false;
    }
  }
</script>

{#if success}
  <div class="success">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
    <p class="success-text">Message sent, I'll be in touch.</p>
  </div>
{:else}
  <form class="contact-form" onsubmit={onSubmit} novalidate>
    <Field
      type="text"
      name="name"
      ariaLabel="Your name"
      placeholder="Name"
      autocomplete="name"
      required
      bind:value={name}
    />
    <Field
      type="email"
      name="email"
      ariaLabel="Your email address"
      placeholder="Email"
      autocomplete="email"
      required
      bind:value={email}
    />
    <Field
      type="textarea"
      name="message"
      ariaLabel="Your message"
      placeholder="What's on your mind?"
      rows={4}
      required
      bind:value={message}
    />

    <label class="consent-label">
      <input type="checkbox" required bind:checked={consent} class="consent-checkbox" />
      <span class="consent-check" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 3L4.5 8.5 2 6" />
        </svg>
      </span>
      <span class="consent-text">I agree to the <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="/terms" target="_blank">Terms of Use</a>.</span>
    </label>

    <div class="submit-row">
      <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={!consent}>
        {submitting ? 'Sending' : 'Send message'}
      </Button>
    </div>

    {#if error}
      <p class="form-status error" role="alert">{error}</p>
    {/if}
  </form>
{/if}

<style>
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .submit-row {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  /* ---- Consent checkbox (custom-styled, native input under) ---- */
  .consent-label {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    cursor: pointer;
    margin-top: -0.25rem;
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
    color: var(--color-accent);
    transition:
      opacity var(--duration-fast) var(--ease-out-expo),
      transform var(--duration-fast) var(--ease-spring);
  }

  .consent-checkbox:checked + .consent-check {
    border-color: var(--color-accent);
    background: color-mix(in oklab, var(--color-accent) 12%, transparent);
  }

  .consent-checkbox:checked + .consent-check svg {
    opacity: 1;
    transform: scale(1);
  }

  .consent-checkbox:focus-visible + .consent-check {
    outline: 2px solid var(--color-accent);
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

  .consent-text a:hover {
    text-decoration-color: var(--color-accent);
  }

  /* ---- Status messaging ---- */
  .form-status {
    font-family: var(--font-body);
    font-size: var(--text-base);
    margin: 0;
    min-height: 1.2em;
    text-align: center;
  }

  .form-status.error {
    color: var(--color-error);
  }

  /* ---- Success state ---- */
  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: clamp(2rem, 4vw, 3rem) 0;
    animation: panel-enter var(--duration-normal) var(--ease-out-expo) forwards;
  }

  .success svg {
    color: var(--color-accent-teal);
  }

  .success-text {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--color-text);
    margin: 0;
  }

  @keyframes panel-enter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
