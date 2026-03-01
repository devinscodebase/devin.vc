<script>
  import { onMount } from 'svelte';
  import { animate } from 'motion';

  let step = $state(1); // 1 = date, 2 = slots + form
  let selectedDate = $state(null);
  let selectedSlot = $state(null);
  let currentMonth = $state(new Date());
  let availableSlots = $state([]);
  let loading = $state(false);
  let bookingStatus = $state('idle'); // idle | submitting | success | error
  let errorMsg = $state('');
  let timezone = $state('');

  let name = $state('');
  let email = $state('');
  let notes = $state('');

  // Prefetch cache: date string → slots array
  const slotCache = new Map();
  let prefetchController = null;

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function btnEnter(e) {
    animate(e.currentTarget, { scale: 1.04 }, { duration: 0.12, easing: [0.34, 1.56, 0.64, 1] });
  }
  function btnLeave(e) {
    animate(e.currentTarget, { scale: 1 }, { duration: 0.18, easing: [0.16, 1, 0.3, 1] });
  }

  onMount(() => {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }

  function isToday(date) {
    if (!date) return false;
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  function isPast(date) {
    if (!date) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  }

  function isSameDate(a, b) {
    if (!a || !b) return false;
    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }

  function formatDateLabel(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function prevMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }

  // Fetch slots for a date (with caching)
  async function fetchSlots(date, signal) {
    const dateStr = date.toISOString().split('T')[0];
    if (slotCache.has(dateStr)) return slotCache.get(dateStr);

    const res = await fetch(`/api/availability?date=${dateStr}&timezone=${encodeURIComponent(timezone)}`, { signal });
    const data = await res.json();
    const slots = res.ok ? (data.slots || []) : [];
    slotCache.set(dateStr, slots);
    return slots;
  }

  // Prefetch on hover — fire-and-forget
  function prefetchDate(date) {
    if (!date || isPast(date)) return;
    const dateStr = date.toISOString().split('T')[0];
    if (slotCache.has(dateStr)) return;

    prefetchController?.abort();
    prefetchController = new AbortController();
    fetchSlots(date, prefetchController.signal).catch(() => {});
  }

  async function selectDate(date) {
    selectedDate = date;
    selectedSlot = null;
    loading = true;
    step = 2;

    try {
      availableSlots = await fetchSlots(date);
    } catch {
      availableSlots = [];
    } finally {
      loading = false;
    }
  }

  function selectSlot(slot) {
    selectedSlot = slot;
  }

  function goBack() {
    step = 1;
    selectedDate = null;
    selectedSlot = null;
    availableSlots = [];
    bookingStatus = 'idle';
    errorMsg = '';
  }

  async function confirmBooking(e) {
    e.preventDefault();
    bookingStatus = 'submitting';
    errorMsg = '';

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, notes, slot: selectedSlot, timezone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Booking failed');
      }

      bookingStatus = 'success';
    } catch (err) {
      errorMsg = err.message;
      bookingStatus = 'error';
    }
  }

  const days = $derived(getMonthDays(currentMonth));
  const monthLabel = $derived(`${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`);
  const canGoPrev = $derived.by(() => {
    const now = new Date();
    return currentMonth.getFullYear() > now.getFullYear() ||
           (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth());
  });
  const canConfirm = $derived(selectedSlot && name.trim() && email.trim());
</script>

<div class="booking">
  <h3 class="booking-heading">Book a call</h3>
  <p class="booking-pitch">Pick a time that works and I'll send a confirmation.</p>

  {#if bookingStatus === 'success'}
    <div class="booking-success">
      <svg class="success-check" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <p class="success-msg">You're booked.</p>
      <p class="success-detail">
        {formatDateLabel(selectedDate)} at {selectedSlot?.label}
      </p>
      <p class="success-hint">Check your email for confirmation.</p>
    </div>
  {:else}

    {#if step >= 2}
      <button class="back-btn" onclick={goBack}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 7H1M6 2L1 7l5 5" />
        </svg>
        Back
      </button>
    {/if}

    {#if step === 1}
      <div class="calendar">
        <div class="cal-nav">
          <button class="cal-arrow" onclick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L4 7l5 5" /></svg>
          </button>
          <span class="cal-month">{monthLabel}</span>
          <button class="cal-arrow" onclick={nextMonth} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2l5 5-5 5" /></svg>
          </button>
        </div>

        <div class="cal-grid">
          {#each DAYS as day (day)}
            <span class="cal-day-header">{day}</span>
          {/each}
          {#each days as date, i (date ? date.getTime() : `empty-${i}`)}
            {#if date}
              <button
                class="cal-day"
                class:today={isToday(date)}
                class:past={isPast(date)}
                class:selected={isSameDate(date, selectedDate)}
                disabled={isPast(date)}
                onclick={() => selectDate(date)}
                onmouseenter={() => prefetchDate(date)}
              >
                {date.getDate()}
              </button>
            {:else}
              <span class="cal-day empty"></span>
            {/if}
          {/each}
        </div>
      </div>

      {#if timezone}
        <p class="tz-label">{timezone}</p>
      {/if}

    {:else if step === 2}
      <div class="step-2">
        <p class="step-label">{formatDateLabel(selectedDate)}</p>

        {#if loading}
          <div class="slots skeleton">
            {#each Array(6) as _}
              <div class="slot-skeleton"></div>
            {/each}
          </div>
        {:else if availableSlots.length === 0}
          <p class="no-slots">No available times on this date. Try another day.</p>
        {:else}
          <div class="slots">
            {#each availableSlots as slot (slot.time)}
              <button
                class="slot"
                class:selected={selectedSlot?.time === slot.time}
                onclick={() => selectSlot(slot)}
              >
                {slot.label}
              </button>
            {/each}
          </div>

          <!-- Inline confirm form appears when a slot is selected -->
          {#if selectedSlot}
            <form class="confirm-form" onsubmit={confirmBooking}>
              <p class="confirm-label">{formatDateShort(selectedDate)} at {selectedSlot.label}</p>
              <input type="text" bind:value={name} placeholder="Name" required class="form-input" aria-label="Your name" />
              <input type="email" bind:value={email} placeholder="Email" required class="form-input" aria-label="Your email address" />
              <textarea bind:value={notes} placeholder="Anything I should know? (optional)" class="form-input form-textarea" rows="2" aria-label="Additional notes"></textarea>
              <button
                type="submit"
                class="confirm-btn"
                disabled={bookingStatus === 'submitting' || !canConfirm}
                onmouseenter={btnEnter}
                onmouseleave={btnLeave}
              >
                {#if bookingStatus === 'submitting'}
                  <span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                {:else}
                  Confirm booking
                {/if}
              </button>
              {#if bookingStatus === 'error'}
                <p class="form-error">{errorMsg}</p>
              {/if}
            </form>
          {/if}
        {/if}
      </div>
    {/if}

  {/if}
</div>

<style>
  .booking {
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  .booking-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.4rem, 2.8vw, 1.75rem);
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.35rem;
  }

  .booking-pitch {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.92rem, 1.2vw, 1rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0 0 1.5rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1.25rem;
    transition: color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .back-btn:hover {
    color: var(--color-accent);
  }

  .back-btn:hover svg {
    transform: translateX(-3px);
  }

  .back-btn svg {
    transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Calendar */
  .calendar {
    margin-bottom: 1rem;
  }

  .cal-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .cal-month {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .cal-arrow {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.5rem;
    transition: color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cal-arrow:hover {
    color: var(--color-accent);
  }

  .cal-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .cal-day-header {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.63rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-align: center;
    padding: 0.5rem 0;
  }

  .cal-day {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--color-text);
    background: none;
    border: 1px solid transparent;
    padding: 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cal-day:hover:not(:disabled):not(.empty) {
    border-color: var(--color-accent-teal);
    background: color-mix(in oklab, var(--color-accent-teal) 8%, transparent);
  }

  .cal-day.today {
    color: var(--color-accent-amber);
    font-weight: 500;
  }

  .cal-day.past {
    color: var(--color-text-muted);
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cal-day.selected {
    background: var(--color-accent-teal);
    color: var(--color-bg);
    border-color: var(--color-accent-teal);
  }

  .cal-day.empty {
    cursor: default;
  }

  .tz-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* Step 2: slots + inline form */
  .step-2 {
    animation: step-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes step-enter {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .step-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0 0 1rem;
  }

  .loading-text, .no-slots {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .slots {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  /* Skeleton loading for slots */
  .slots.skeleton {
    pointer-events: none;
  }

  .slot-skeleton {
    height: 38px;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    animation: shimmer 1.2s ease-in-out infinite alternate;
  }

  @keyframes shimmer {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }

  .slot {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--color-text);
    background: none;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    padding: 0.6rem 0.75rem;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.12s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.12s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .slot:hover {
    border-color: var(--color-accent-teal);
    background: color-mix(in oklab, var(--color-accent-teal) 8%, transparent);
  }

  .slot.selected {
    background: var(--color-accent-teal);
    color: var(--color-bg);
    border-color: var(--color-accent-teal);
  }

  /* Confirm form — slides in below slots */
  .confirm-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    animation: step-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .confirm-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-accent-teal);
    margin: 0;
  }

  .form-input {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    color: var(--color-text);
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    padding: 0.65rem 0;
    outline: none;
    transition: border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .form-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 1px 0 0 var(--color-accent);
  }

  .form-input::placeholder {
    color: var(--color-text-muted);
    transition: opacity 0.15s;
  }

  .form-input:focus::placeholder {
    opacity: 0.4;
  }

  .form-textarea {
    resize: vertical;
    min-height: 48px;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    padding: 0.65rem;
  }

  .form-textarea:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-accent) 10%, transparent);
  }

  .confirm-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    background-color: var(--color-accent);
    background-image: linear-gradient(90deg, var(--color-accent-teal) 50%, transparent 50%);
    background-size: 200% 100%;
    background-position: 100% 0;
    color: var(--color-bg);
    border: 1px solid var(--color-accent);
    padding: 0.85rem 1.5rem;
    cursor: pointer;
    transition: background-position 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.15s;
    margin-top: 0.25rem;
  }

  .confirm-btn:hover:not(:disabled) {
    background-position: 0% 0;
    border-color: var(--color-accent-teal);
  }

  .confirm-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .loading-dots {
    display: inline-flex;
    gap: 2px;
  }

  .loading-dots span {
    animation: dot-pulse 1s infinite;
    opacity: 0;
  }

  .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes dot-pulse {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }

  .form-error {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: var(--color-error);
    margin: 0;
  }

  /* Success */
  .booking-success {
    text-align: center;
    padding: clamp(1.5rem, 3vw, 2.5rem) 0;
    animation: step-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .success-check {
    color: var(--color-accent-teal);
    margin-bottom: 0.75rem;
  }

  .success-msg {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.2rem, 2vw, 1.5rem);
    color: var(--color-text);
    margin: 0 0 0.35rem;
  }

  .success-detail {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    color: var(--color-accent);
    margin: 0 0 0.25rem;
  }

  .success-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 480px) {
    .slots {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
