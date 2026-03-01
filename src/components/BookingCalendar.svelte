<script>
  import { onMount } from 'svelte';

  let step = $state(1); // 1 = date, 2 = time, 3 = confirm
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

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  onMount(() => {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days = [];

    // Leading empty cells
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }

  function isToday(date) {
    if (!date) return false;
    const now = new Date();
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  }

  function isPast(date) {
    if (!date) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  }

  function isSameDate(a, b) {
    if (!a || !b) return false;
    return a.getDate() === b.getDate() &&
           a.getMonth() === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
  }

  function formatDateLabel(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function prevMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }

  async function selectDate(date) {
    selectedDate = date;
    selectedSlot = null;
    loading = true;

    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/availability?date=${dateStr}&timezone=${encodeURIComponent(timezone)}`);
      const data = await res.json();

      if (!res.ok) {
        availableSlots = [];
        return;
      }

      availableSlots = data.slots || [];
    } catch {
      availableSlots = [];
    } finally {
      loading = false;
    }

    if (availableSlots.length > 0) {
      step = 2;
    }
  }

  function selectSlot(slot) {
    selectedSlot = slot;
    step = 3;
  }

  function goBack() {
    if (step === 3) {
      step = 2;
      selectedSlot = null;
    } else if (step === 2) {
      step = 1;
      selectedDate = null;
      availableSlots = [];
    }
  }

  async function confirmBooking(e) {
    e.preventDefault();
    bookingStatus = 'submitting';

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          notes,
          slot: selectedSlot,
          timezone,
        }),
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
  const canGoPrev = $derived(() => {
    const now = new Date();
    return currentMonth.getFullYear() > now.getFullYear() ||
           (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() > now.getMonth());
  });
</script>

<div class="booking">
  <h3 class="booking-heading">Book a call</h3>
  <p class="booking-pitch">Pick a time that works and I'll send a confirmation.</p>

  {#if bookingStatus === 'success'}
    <div class="booking-success">
      <p class="success-msg">You're booked — check your email for confirmation.</p>
      <p class="success-detail">
        {formatDateLabel(selectedDate)} at {selectedSlot?.label}
      </p>
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
          <button class="cal-arrow" onclick={prevMonth} disabled={!canGoPrev()} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L4 7l5 5" /></svg>
          </button>
          <span class="cal-month">{monthLabel}</span>
          <button class="cal-arrow" onclick={nextMonth} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2l5 5-5 5" /></svg>
          </button>
        </div>

        <div class="cal-grid">
          {#each DAYS as day}
            <span class="cal-day-header">{day}</span>
          {/each}
          {#each days as date}
            {#if date}
              <button
                class="cal-day"
                class:today={isToday(date)}
                class:past={isPast(date)}
                class:selected={isSameDate(date, selectedDate)}
                disabled={isPast(date)}
                onclick={() => selectDate(date)}
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
      <p class="step-label">{formatDateLabel(selectedDate)}</p>

      {#if loading}
        <p class="loading-text">Loading times...</p>
      {:else if availableSlots.length === 0}
        <p class="no-slots">No available times on this date. Try another day.</p>
      {:else}
        <div class="slots">
          {#each availableSlots as slot}
            <button
              class="slot"
              class:selected={selectedSlot?.time === slot.time}
              onclick={() => selectSlot(slot)}
            >
              {slot.label}
            </button>
          {/each}
        </div>
      {/if}

    {:else if step === 3}
      <p class="step-label">{formatDateLabel(selectedDate)} at {selectedSlot?.label}</p>

      <form class="confirm-form" onsubmit={confirmBooking}>
        <input type="text" bind:value={name} placeholder="Name" required class="form-input" aria-label="Your name" />
        <input type="email" bind:value={email} placeholder="Email" required class="form-input" aria-label="Your email address" />
        <textarea bind:value={notes} placeholder="Anything I should know? (optional)" class="form-input form-textarea" rows="3" aria-label="Additional notes"></textarea>
        <button type="submit" class="confirm-btn" disabled={bookingStatus === 'submitting'}>
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

<style>
  .booking {
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  .booking-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(1.3rem, 2.5vw, 1.6rem);
    font-weight: 400;
    line-height: 1.2;
    color: var(--color-text);
    margin: 0 0 0.35rem;
  }

  .booking-pitch {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(0.8rem, 1.1vw, 0.88rem);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0 0 1.5rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 400;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1.25rem;
    transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .back-btn:hover {
    color: var(--color-accent);
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
    padding: 0.25rem;
    transition: color 0.2s;
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
    font-size: 0.58rem;
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
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cal-day:hover:not(:disabled) {
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
  }

  .cal-day.today {
    color: var(--color-accent);
    font-weight: 500;
  }

  .cal-day.past {
    color: var(--color-text-muted);
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cal-day.selected {
    background: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }

  .cal-day.empty {
    cursor: default;
  }

  .tz-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem;
    color: var(--color-text-muted);
    opacity: 0.6;
    margin: 0;
  }

  /* Time slots */
  .step-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0 0 1.25rem;
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
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .slot:hover {
    border-color: color-mix(in oklab, var(--color-accent) 40%, transparent);
  }

  .slot.selected {
    background: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }

  /* Confirm form */
  .confirm-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-input {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: var(--color-text);
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    padding: 0.65rem 0;
    outline: none;
    transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .form-input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 12%, transparent);
  }

  .form-input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .form-textarea {
    resize: vertical;
    min-height: 60px;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    padding: 0.65rem;
  }

  .confirm-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    padding: 0.85rem 1.5rem;
    cursor: pointer;
    transition: filter 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    margin-top: 0.5rem;
  }

  .confirm-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .confirm-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-dots {
    display: inline-flex;
    gap: 2px;
  }

  .loading-dots span {
    animation: dot-pulse 1.4s infinite;
    opacity: 0;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

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
    padding: clamp(1.5rem, 3vw, 2rem) 0;
  }

  .success-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: var(--color-accent);
    margin: 0 0 0.5rem;
  }

  .success-detail {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  @media (max-width: 480px) {
    .slots {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
