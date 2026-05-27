<script lang="ts">
  type Type = 'text' | 'email' | 'tel' | 'url' | 'password' | 'search' | 'number' | 'textarea' | 'select';
  type Size = 'md' | 'lg';
  type Option = { value: string; label: string };

  type Props = {
    type?: Type;
    name?: string;
    label?: string;
    ariaLabel?: string;
    placeholder?: string;
    value?: string;
    helper?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    size?: Size;
    rows?: number;
    id?: string;
    autocomplete?: string;
    options?: Option[];
    class?: string;
  };

  let {
    type = 'text',
    name,
    label,
    ariaLabel,
    placeholder = '',
    value = $bindable(''),
    helper,
    error,
    required = false,
    disabled = false,
    size = 'md',
    rows = 4,
    id,
    autocomplete,
    options = [],
    class: className = '',
  }: Props = $props();

  // Deterministic ID: stable across SSR/hydration. Falls back to name when no id.
  const uid = $derived(id ?? `field-${name ?? 'x'}`);
  const describedBy = $derived(error ? `${uid}-err` : helper ? `${uid}-help` : undefined);
</script>

<div class={`field field--${size} field--type-${type} ${error ? 'field--error' : ''} ${disabled ? 'field--disabled' : ''} ${className}`}>
  {#if label}
    <label for={uid} class="field__label">
      {label}{#if required}<span class="field__required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="field__wrap">
    {#if type === 'textarea'}
      <textarea
        id={uid}
        {name}
        {placeholder}
        {required}
        {disabled}
        {rows}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required || undefined}
        bind:value
        class="field__control field__control--textarea"
      ></textarea>
    {:else if type === 'select'}
      <select
        id={uid}
        {name}
        {required}
        {disabled}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required || undefined}
        bind:value
        class="field__control field__control--select"
      >
        {#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
        {#each options as opt (opt.value)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <svg class="field__select-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.5 5.5L7 9L10.5 5.5" />
      </svg>
    {:else}
      <input
        id={uid}
        type={type}
        {name}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required || undefined}
        bind:value
        class="field__control"
      />
    {/if}

    <span class="field__line" aria-hidden="true"></span>
  </div>

  {#if error}
    <p id="{uid}-err" class="field__error" role="alert">{error}</p>
  {:else if helper}
    <p id="{uid}-help" class="field__helper">{helper}</p>
  {/if}
</div>

<style>
  /*
    Mirrors the site's existing form input language:
      • No box. Just an underline that grows on focus (teal → amber gradient).
      • Placeholder fades to 40% on focus.
      • `md`: body font, default form scale.
      • `lg`: display font, tool-wizard scale — used for marquee inputs in
              GtmPlanner / RetentionCalc / MarketingScorecard.
  */
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .field__label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
  }

  .field__required {
    color: var(--color-accent);
    margin-left: 0.25em;
  }

  .field__wrap {
    position: relative;
    display: block;
  }

  .field__control {
    width: 100%;
    background: transparent;
    border: 0;
    border-radius: 0;
    outline: none;
    color: var(--color-text);
    font-family: var(--font-body);
    font-weight: var(--weight-regular);
    padding: 0.7rem 0;
    transition:
      color var(--duration-fast) var(--ease-out-expo);
  }

  /* ============================================
     SIZES
     ============================================ */
  .field--md .field__control {
    font-size: var(--text-base);
    line-height: 1.4;
  }

  .field--lg .field__control {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    line-height: 1.1;
    padding: 0.5rem 0;
    letter-spacing: -0.02em;
  }

  /* Placeholder: muted by default, fades further on focus */
  .field__control::placeholder {
    color: var(--color-text-subtle);
    transition: opacity var(--duration-fast) var(--ease-out-expo);
  }

  .field__control:focus::placeholder {
    opacity: 0.4;
  }

  /* ============================================
     ANIMATED UNDERLINE — the line animation
     ============================================ */
  .field__line {
    display: block;
    position: relative;
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 28%, transparent);
    overflow: hidden;
    transition: background var(--duration-fast) var(--ease-out-expo);
  }

  .field--lg .field__line {
    height: 2px;
  }

  .field__line::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: linear-gradient(
      90deg,
      var(--color-accent-teal),
      var(--color-accent-amber)
    );
    transition: width 250ms var(--ease-out-expo);
  }

  /* Focus → grow the line full-width */
  .field__control:focus ~ .field__line::after,
  .field__control:focus-visible ~ .field__line::after {
    width: 100%;
  }

  /* Select variant: the icon sits between control and line, but ~ still works
     because it's a general-sibling selector (any preceding sibling). */
  .field__control--select {
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    padding-right: 1.75rem;
  }

  .field--lg .field__control--select {
    padding-right: 2.5rem;
  }

  .field__select-icon {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .field__control--select:focus ~ .field__select-icon {
    color: var(--color-accent);
  }

  /* Textarea: line still sits at the bottom of the wrap */
  .field__control--textarea {
    resize: vertical;
    min-height: 6rem;
    line-height: 1.55;
  }

  .field--lg .field__control--textarea {
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.55;
    min-height: 8rem;
  }

  /* ============================================
     STATES
     ============================================ */
  .field--error .field__line {
    background: color-mix(in oklab, var(--color-error) 30%, transparent);
  }

  .field--error .field__line::after {
    background: var(--color-error);
    width: 100%;
  }

  .field--disabled .field__control {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .field--disabled .field__line {
    background: color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  /* ============================================
     HELPER / ERROR TEXT
     ============================================ */
  .field__helper {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .field__error {
    margin: 0;
    font-size: var(--text-xs);
    color: var(--color-error);
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .field__line::after,
    .field__control,
    .field__select-icon {
      transition: none;
    }
  }
</style>
