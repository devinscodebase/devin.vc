<script>
  /* ── Wizard state ── */
  let currentStep = $state(1);
  let direction = $state(1); // 1 = forward, -1 = back

  /* ── Inputs ── */
  let revenueTarget = $state(null);
  let dealSize = $state(null);
  let isRecurring = $state(false); // false = one-time, true = recurring
  let salesCycle = $state(90);
  let closeRate = $state(25);
  let sqlToOpp = $state(50);
  let leadToSql = $state(20);
  let costPerLead = $state(null);
  let grossMargin = $state(70);
  let customerLifespan = $state(null); // months, only for recurring

  /* ── Step definitions ── */
  let steps = $derived((() => {
    const base = [
      { id: 'revenue', label: 'What\'s your annual revenue target?', field: 'currency' },
      { id: 'deal', label: isRecurring ? 'What\'s your monthly contract value?' : 'What\'s your average deal size?', field: 'currency-toggle' },
      { id: 'cycle', label: 'How long is your average sales cycle?', field: 'days', default: 90, benchmark: 'Industry average: 90 days' },
      { id: 'close', label: 'What % of opportunities become closed deals?', field: 'percent', default: 25, benchmark: 'B2B average: 25%' },
      { id: 'sql-opp', label: 'What % of qualified leads become opportunities?', field: 'percent', default: 50, benchmark: 'Industry average: 50%' },
      { id: 'lead-sql', label: 'What % of leads become sales-qualified?', field: 'percent', default: 20, benchmark: 'Industry average: 20%' },
      { id: 'cpl', label: 'What\'s your average cost per lead?', field: 'currency' },
      { id: 'margin', label: 'What\'s your gross margin?', field: 'percent', default: 70, benchmark: 'B2B SaaS average: 70%' },
    ];
    if (isRecurring) {
      base.push({ id: 'lifespan', label: 'How long does a typical customer stay?', field: 'months' });
    }
    return base;
  })());

  let totalSteps = $derived(steps.length);
  let showResults = $state(false);

  /* ── Derived calculations ── */
  let canCalculate = $derived(
    revenueTarget > 0 && dealSize > 0 && costPerLead > 0 &&
    (!isRecurring || customerLifespan > 0)
  );

  let results = $derived((() => {
    if (!canCalculate) return null;

    // Core funnel
    const annualRevenue = revenueTarget;
    const effectiveDealValue = isRecurring ? dealSize * 12 : dealSize;
    const dealsPerYear = annualRevenue / effectiveDealValue;
    const dealsPerMonth = dealsPerYear / 12;
    const oppsPerMonth = dealsPerMonth / (closeRate / 100);
    const oppsPerWeek = oppsPerMonth / 4.33;
    const sqlsPerMonth = oppsPerMonth / (sqlToOpp / 100);
    const sqlsPerWeek = sqlsPerMonth / 4.33;
    const leadsPerMonth = sqlsPerMonth / (leadToSql / 100);
    const leadsPerWeek = leadsPerMonth / 4.33;
    const leadsPerDay = leadsPerMonth / 21.7;

    // Budget
    const monthlyBudget = leadsPerMonth * costPerLead;
    const annualBudget = monthlyBudget * 12;
    const spendPercent = (annualBudget / annualRevenue) * 100;

    // Unit economics
    const fullFunnelRate = (leadToSql / 100) * (sqlToOpp / 100) * (closeRate / 100);
    const cac = costPerLead / fullFunnelRate;
    const ltv = isRecurring
      ? dealSize * customerLifespan * (grossMargin / 100)
      : dealSize * (grossMargin / 100);
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const cacDealPercent = (cac / effectiveDealValue) * 100;

    // LTV:CAC health
    let ltvCacHealth;
    if (ltvCacRatio < 3) ltvCacHealth = 'warning';
    else if (ltvCacRatio <= 5) ltvCacHealth = 'healthy';
    else ltvCacHealth = 'strong';

    // Pipeline
    const monthlyRevenueTarget = annualRevenue / 12;
    const pipelineCoverage = monthlyRevenueTarget * 3.5;
    const salesCycleMonths = salesCycle / 30;

    return {
      // Funnel
      dealsPerYear, dealsPerMonth,
      oppsPerMonth, oppsPerWeek,
      sqlsPerMonth, sqlsPerWeek,
      leadsPerMonth, leadsPerWeek, leadsPerDay,
      // Rates for display on funnel connectors
      leadToSqlRate: leadToSql,
      sqlToOppRate: sqlToOpp,
      closeRateVal: closeRate,
      // Budget
      monthlyBudget, annualBudget, spendPercent, cac,
      // Unit economics
      ltv, ltvCacRatio, ltvCacHealth, cacDealPercent,
      cacWarning: cacDealPercent > 50,
      // Pipeline
      pipelineCoverage,
      timeToRevenue: salesCycleMonths,
      rampUp: salesCycleMonths,
      // Meta
      effectiveDealValue,
    };
  })());

  /* ── Navigation ── */
  function next() {
    if (currentStep < totalSteps) {
      direction = 1;
      currentStep++;
    } else if (canCalculate) {
      showResults = true;
    }
  }

  function back() {
    if (showResults) {
      showResults = false;
    } else if (currentStep > 1) {
      direction = -1;
      currentStep--;
    }
  }

  function startOver() {
    revenueTarget = null;
    dealSize = null;
    isRecurring = false;
    salesCycle = 90;
    closeRate = 25;
    sqlToOpp = 50;
    leadToSql = 20;
    costPerLead = null;
    grossMargin = 70;
    customerLifespan = null;
    currentStep = 1;
    showResults = false;
    direction = 1;
  }

  /* ── Get/set current step value ── */
  function getValue(stepIndex) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'revenue': return revenueTarget;
      case 'deal': return dealSize;
      case 'cycle': return salesCycle;
      case 'close': return closeRate;
      case 'sql-opp': return sqlToOpp;
      case 'lead-sql': return leadToSql;
      case 'cpl': return costPerLead;
      case 'margin': return grossMargin;
      case 'lifespan': return customerLifespan;
    }
  }

  function setValue(stepIndex, val) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'revenue': revenueTarget = val; break;
      case 'deal': dealSize = val; break;
      case 'cycle': salesCycle = val; break;
      case 'close': closeRate = val; break;
      case 'sql-opp': sqlToOpp = val; break;
      case 'lead-sql': leadToSql = val; break;
      case 'cpl': costPerLead = val; break;
      case 'margin': grossMargin = val; break;
      case 'lifespan': customerLifespan = val; break;
    }
  }

  /* ── Formatting helpers ── */
  function fmtCurrency(n) {
    if (n == null) return '\u2014';
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  function fmtNum(n, decimals = 1) {
    if (n == null) return '\u2014';
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  }

  function fmtPercent(n) {
    if (n == null) return '\u2014';
    return n.toFixed(1) + '%';
  }

  /* ── Currency formatting for display ── */
  function formatWithCommas(n) {
    if (n == null || n === '') return '';
    return Number(n).toLocaleString('en-US');
  }

  function parseRawNumber(str) {
    if (!str) return null;
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  /* ── Focus tracking for currency/number inputs ── */
  let inputFocused = $state(false);

  /* ── Step validity (for disabling Next button) ── */
  let currentStepValid = $derived((() => {
    const step = steps[currentStep - 1];
    const val = getValue(currentStep - 1);
    if (step.field === 'currency' || step.field === 'currency-toggle') {
      return val != null && val > 0;
    }
    if (step.field === 'days' || step.field === 'months') {
      return val != null && val > 0;
    }
    // percent fields always have a default
    return true;
  })());

  /* ── Keyboard navigation ── */
  function handleKeydown(e) {
    if (e.key === 'Enter' && currentStepValid) {
      e.preventDefault();
      next();
    }
  }

  /* ── Clipboard ── */
  let copied = $state(false);

  async function copyResults() {
    if (!results) return;
    const r = results;
    const dealLabel = isRecurring ? 'MCV' : 'deal size';
    const oneLiner = `GTM Plan: ${fmtCurrency(revenueTarget)} Revenue Target \u2014 ${fmtNum(r.dealsPerYear, 0)} deals/year at ${fmtCurrency(r.effectiveDealValue)} ${dealLabel} \u2014 ${fmtNum(r.leadsPerMonth, 0)} leads/month needed \u2014 ${fmtCurrency(r.monthlyBudget)}/mo marketing budget \u2014 LTV:CAC ${fmtNum(r.ltvCacRatio)}:1 (${r.ltvCacHealth})`;

    const full = `${oneLiner}

FUNNEL
  Leads: ${fmtNum(r.leadsPerMonth, 0)}/month | ${fmtNum(r.leadsPerWeek, 0)}/week | ${fmtNum(r.leadsPerDay, 1)}/day
  SQLs: ${fmtNum(r.sqlsPerMonth, 0)}/month | ${fmtNum(r.sqlsPerWeek, 1)}/week (${r.leadToSqlRate}% conversion)
  Opportunities: ${fmtNum(r.oppsPerMonth, 0)}/month | ${fmtNum(r.oppsPerWeek, 1)}/week (${r.sqlToOppRate}% conversion)
  Closed Deals: ${fmtNum(r.dealsPerMonth, 1)}/month (${r.closeRateVal}% close rate)

BUDGET
  Monthly: ${fmtCurrency(r.monthlyBudget)}
  Annual: ${fmtCurrency(r.annualBudget)}
  % of revenue target: ${fmtPercent(r.spendPercent)}
  Cost per acquisition: ${fmtCurrency(r.cac)}

UNIT ECONOMICS
  CAC: ${fmtCurrency(r.cac)}
  LTV: ${fmtCurrency(r.ltv)}
  LTV:CAC: ${fmtNum(r.ltvCacRatio)}:1 (${r.ltvCacHealth})${r.cacWarning ? `\n  \u26A0 CAC is ${fmtPercent(r.cacDealPercent)} of deal size` : ''}

PIPELINE
  Pipeline coverage needed: ${fmtCurrency(r.pipelineCoverage)} active at all times (3.5x)
  Time to first revenue: ~${fmtNum(r.timeToRevenue, 1)} months from first spend
  Steady-state pipeline: ~${fmtNum(r.rampUp, 1)} months to fully load

Generated at devin.vc/tools/gtm-planner`;

    await navigator.clipboard.writeText(full);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

{#if showResults && results}
  <div class="results-placeholder">
    <p>Results ready. Leads/month: {fmtNum(results.leadsPerMonth, 0)}</p>
    <button onclick={startOver}>Start over</button>
  </div>
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="wizard" onkeydown={handleKeydown}>
    <!-- Header -->
    <header class="wizard-header">
      <div class="section-tag">
        <span class="tag-number">01</span>
        <span class="tag-dash" aria-hidden="true"></span>
        <span class="tag-label">Tools</span>
      </div>
      <h1 class="wizard-title">GTM Budget Planner</h1>
      <p class="wizard-subtitle">Reverse-engineer your go-to-market budget from a revenue target.</p>
    </header>

    <!-- Progress dots -->
    <div class="progress" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div class="progress-dots">
        {#each steps as _, i}
          <span
            class="dot"
            class:dot--completed={i < currentStep - 1}
            class:dot--current={i === currentStep - 1}
            class:dot--future={i > currentStep - 1}
          ></span>
        {/each}
      </div>
      <span class="progress-label">Step {currentStep} of {totalSteps}</span>
    </div>

    <!-- Step content with transition -->
    {#key currentStep}
      <div class="step-content" class:slide-from-right={direction === 1} class:slide-from-left={direction === -1}>
        <h2 class="step-question">{steps[currentStep - 1].label}</h2>

        <!-- Currency input -->
        {#if steps[currentStep - 1].field === 'currency'}
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="input-currency"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : formatWithCommas(getValue(currentStep - 1))}
                onfocus={(e) => {
                  inputFocused = true;
                  const raw = getValue(currentStep - 1);
                  e.target.value = raw ?? '';
                }}
                onblur={(e) => {
                  inputFocused = false;
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                oninput={(e) => {
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                placeholder="0"
              />
            </div>
          </div>

        <!-- Currency with toggle (deal size step) -->
        {:else if steps[currentStep - 1].field === 'currency-toggle'}
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="input-currency"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : formatWithCommas(getValue(currentStep - 1))}
                onfocus={(e) => {
                  inputFocused = true;
                  const raw = getValue(currentStep - 1);
                  e.target.value = raw ?? '';
                }}
                onblur={(e) => {
                  inputFocused = false;
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                oninput={(e) => {
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                placeholder="0"
              />
            </div>
            <div class="toggle-pill">
              <button
                type="button"
                class="toggle-option"
                class:toggle-active={!isRecurring}
                onclick={() => { isRecurring = false; }}
              >One-time</button>
              <button
                type="button"
                class="toggle-option"
                class:toggle-active={isRecurring}
                onclick={() => { isRecurring = true; }}
              >Recurring</button>
            </div>
          </div>

        <!-- Percent slider -->
        {:else if steps[currentStep - 1].field === 'percent'}
          <div class="input-row input-row--slider">
            <input
              type="range"
              min="1"
              max="100"
              class="input-range"
              value={getValue(currentStep - 1)}
              oninput={(e) => setValue(currentStep - 1, parseInt(e.target.value))}
              style="--range-pct: {getValue(currentStep - 1)}%"
            />
            <span class="range-value">{getValue(currentStep - 1)}%</span>
          </div>

        <!-- Days input -->
        {:else if steps[currentStep - 1].field === 'days'}
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused}>
              <input
                type="text"
                inputmode="numeric"
                class="input-number"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : getValue(currentStep - 1)}
                onfocus={(e) => {
                  inputFocused = true;
                  e.target.value = getValue(currentStep - 1) ?? '';
                }}
                onblur={(e) => {
                  inputFocused = false;
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                oninput={(e) => {
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                placeholder="0"
              />
              <span class="input-suffix">days</span>
            </div>
          </div>

        <!-- Months input -->
        {:else if steps[currentStep - 1].field === 'months'}
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused}>
              <input
                type="text"
                inputmode="numeric"
                class="input-number"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : getValue(currentStep - 1)}
                onfocus={(e) => {
                  inputFocused = true;
                  e.target.value = getValue(currentStep - 1) ?? '';
                }}
                onblur={(e) => {
                  inputFocused = false;
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                oninput={(e) => {
                  const val = parseRawNumber(e.target.value);
                  setValue(currentStep - 1, val);
                }}
                placeholder="0"
              />
              <span class="input-suffix">months</span>
            </div>
          </div>
        {/if}

        <!-- Benchmark hint -->
        {#if steps[currentStep - 1].benchmark}
          <p class="benchmark">{steps[currentStep - 1].benchmark}</p>
        {/if}
      </div>
    {/key}

    <!-- Navigation -->
    <nav class="wizard-nav">
      {#if currentStep > 1}
        <button type="button" class="nav-back" onclick={back}>Back</button>
      {:else}
        <span></span>
      {/if}
      <button
        type="button"
        class="nav-next"
        class:nav-next--disabled={!currentStepValid}
        disabled={!currentStepValid}
        onclick={next}
      >
        {currentStep === totalSteps ? 'See Results' : 'Next'}
      </button>
    </nav>
  </div>
{/if}

<style>
  /* ── Wizard container ── */
  .wizard {
    display: flex;
    flex-direction: column;
    min-height: 60vh;
  }

  /* ── Header ── */
  .wizard-header {
    margin-bottom: var(--space-element);
  }

  .section-tag {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .tag-number {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: var(--text-md);
    line-height: 1;
    color: var(--color-accent-teal);
  }

  .tag-dash {
    width: 24px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent-teal), transparent);
  }

  .tag-label {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .wizard-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0 0 0.5rem;
  }

  .wizard-subtitle {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: 1.35;
    margin: 0;
  }

  /* ── Progress dots ── */
  .progress {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .progress-dots {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: background var(--duration-fast) var(--ease-out-expo),
                transform var(--duration-fast) var(--ease-out-expo);
  }

  .dot--completed {
    background: var(--color-accent-teal);
  }

  .dot--current {
    background: var(--color-accent);
    transform: scale(1.25);
  }

  .dot--future {
    background: color-mix(in oklab, var(--color-text-muted) 20%, transparent);
  }

  .progress-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  /* ── Step content ── */
  .step-content {
    flex: 1;
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .step-question {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    line-height: 1.2;
    letter-spacing: var(--tracking-tight);
    margin: 0 0 clamp(1.5rem, 3vw, 2rem);
  }

  /* ── Step transition animations ── */
  .slide-from-right {
    animation: slideFromRight var(--duration-normal) var(--ease-out-expo) both;
  }

  .slide-from-left {
    animation: slideFromLeft var(--duration-normal) var(--ease-out-expo) both;
  }

  @keyframes slideFromRight {
    from {
      opacity: 0;
      transform: translateX(24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideFromLeft {
    from {
      opacity: 0;
      transform: translateX(-24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .slide-from-right,
    .slide-from-left {
      animation: none;
    }
  }

  /* ── Input rows ── */
  .input-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-row--slider {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }

  /* ── Currency input ── */
  .currency-wrapper {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    border-bottom: 2px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent);
    transition: border-color var(--duration-fast) var(--ease-out-expo);
    padding-bottom: 0.25rem;
  }

  .currency-wrapper.focused {
    border-color: var(--color-accent);
  }

  .currency-prefix {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text-muted);
    line-height: 1;
    user-select: none;
  }

  .input-currency {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text);
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    line-height: 1;
    padding: 0;
  }

  .input-currency::placeholder {
    color: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
  }

  /* ── Suffix input (days / months) ── */
  .suffix-wrapper {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    border-bottom: 2px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent);
    transition: border-color var(--duration-fast) var(--ease-out-expo);
    padding-bottom: 0.25rem;
  }

  .suffix-wrapper.focused {
    border-color: var(--color-accent);
  }

  .input-number {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text);
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    line-height: 1;
    padding: 0;
  }

  .input-number::placeholder {
    color: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
  }

  .input-suffix {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text-muted);
    line-height: 1;
    user-select: none;
    white-space: nowrap;
  }

  /* ── Toggle pill (One-time / Recurring) ── */
  .toggle-pill {
    display: flex;
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    width: fit-content;
  }

  .toggle-option {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    padding: 0.5rem 1.25rem;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--color-text-muted);
    transition: background var(--duration-fast) var(--ease-out-expo),
                color var(--duration-fast) var(--ease-out-expo);
  }

  .toggle-option.toggle-active {
    background: var(--color-accent);
    color: var(--color-bg);
  }

  /* ── Range slider ── */
  .input-range {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 2px;
    background: linear-gradient(
      to right,
      var(--color-accent) 0%,
      var(--color-accent) var(--range-pct, 50%),
      color-mix(in oklab, var(--color-text-muted) 25%, transparent) var(--range-pct, 50%),
      color-mix(in oklab, var(--color-text-muted) 25%, transparent) 100%
    );
    border-radius: 1px;
    outline: none;
    cursor: pointer;
  }

  /* Webkit (Chrome, Safari, Edge) thumb */
  .input-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid var(--color-bg);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-accent) 30%, transparent);
    cursor: pointer;
    transition: transform var(--duration-fast) var(--ease-out-expo),
                box-shadow var(--duration-fast) var(--ease-out-expo);
  }

  .input-range::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent) 15%, transparent);
  }

  .input-range::-webkit-slider-thumb:active {
    transform: scale(1.05);
  }

  /* Firefox thumb */
  .input-range::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid var(--color-bg);
    box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-accent) 30%, transparent);
    cursor: pointer;
    transition: transform var(--duration-fast) var(--ease-out-expo),
                box-shadow var(--duration-fast) var(--ease-out-expo);
  }

  .input-range::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent) 15%, transparent);
  }

  /* Firefox track */
  .input-range::-moz-range-track {
    height: 2px;
    background: transparent;
    border: none;
  }

  .input-range::-moz-range-progress {
    height: 2px;
    background: var(--color-accent);
    border-radius: 1px;
  }

  .range-value {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text);
    line-height: 1;
    min-width: 3.5ch;
    text-align: right;
  }

  /* ── Benchmark hint ── */
  .benchmark {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    margin: 1rem 0 0;
  }

  /* ── Navigation ── */
  .wizard-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: clamp(1rem, 2vw, 1.5rem);
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .nav-back {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem 0;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .nav-back:hover {
    color: var(--color-text);
  }

  .nav-next {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text);
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent);
    padding: 0.75rem 2rem;
    cursor: pointer;
    transition: border-color var(--duration-fast) var(--ease-out-expo),
                color var(--duration-fast) var(--ease-out-expo),
                opacity var(--duration-fast) var(--ease-out-expo);
  }

  .nav-next:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .nav-next--disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
</style>
