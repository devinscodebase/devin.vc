<script>
  import { onMount, tick } from 'svelte';
  import { animate, stagger } from 'motion';

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

  /* ── Entrance animations ── */
  onMount(() => {
    if (window.__vtNav) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const header = document.querySelector('.wizard-header');
    if (header) {
      animate(header, { opacity: [0, 1], y: [12, 0] }, {
        duration: 0.4,
        easing: [0.16, 1, 0.3, 1],
      });
    }
  });

  $effect(() => {
    if (!showResults) return;

    tick().then(() => {
      const dashboard = document.querySelector('.results-dashboard');
      if (!dashboard) return;

      // Skip animations on view transition navigation
      if (window.__vtNav) return;

      // Respect reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // Animate header
      const header = dashboard.querySelector('.results-header');
      if (header) {
        animate(header, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.4,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      // Stagger sections
      const sections = dashboard.querySelectorAll('.results-section');
      if (sections.length) {
        animate(sections, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.4,
          delay: stagger(0.08, { start: 0.15 }),
          easing: [0.16, 1, 0.3, 1],
        });
      }

      // Animate funnel bars width
      const bars = dashboard.querySelectorAll('.funnel-bar');
      if (bars.length) {
        bars.forEach((bar, i) => {
          const targetWidth = bar.style.width;
          bar.style.width = '0%';
          animate(bar, { width: ['0%', targetWidth] }, {
            duration: 0.6,
            delay: 0.2 + (i * 0.08),
            easing: [0.16, 1, 0.3, 1],
          });
        });
      }

      // Stagger number cards and metrics
      const cards = dashboard.querySelectorAll('.results-card, .results-metric');
      if (cards.length) {
        animate(cards, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.35,
          delay: stagger(0.04, { start: 0.3 }),
          easing: [0.16, 1, 0.3, 1],
        });
      }

      // Animate post-results actions
      const actions = dashboard.querySelector('.results-actions');
      if (actions) {
        animate(actions, { opacity: [0, 1] }, {
          duration: 0.4,
          delay: 0.6,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      // Animate CTA
      const cta = dashboard.querySelector('.results-cta');
      if (cta) {
        animate(cta, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.4,
          delay: 0.7,
          easing: [0.16, 1, 0.3, 1],
        });
      }
    });
  });

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
  <div class="results-dashboard">
    <!-- Results header -->
    <header class="results-header">
      <h1 class="results-title">Your GTM Plan</h1>
      <p class="results-revenue">{fmtCurrency(revenueTarget)} annual target</p>
    </header>

    <!-- Section 1: Funnel -->
    <section class="results-section">
      <h2 class="results-section-heading">Funnel</h2>

      <div class="results-funnel">
        <!-- Leads -->
        <div class="funnel-stage">
          <div class="funnel-bar-track">
            <div class="funnel-bar funnel-bar--leads" style="width: 100%"></div>
          </div>
          <div class="funnel-meta">
            <span class="funnel-label">Leads</span>
            <span class="funnel-numbers">{fmtNum(results.leadsPerMonth, 0)}/mo &middot; {fmtNum(results.leadsPerWeek, 0)}/wk &middot; {fmtNum(results.leadsPerDay, 1)}/day</span>
          </div>
        </div>

        <!-- Connector: lead → SQL -->
        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-connector-rate">{results.leadToSqlRate}%</span>
          <div class="funnel-connector-line"></div>
        </div>

        <!-- SQLs -->
        <div class="funnel-stage">
          <div class="funnel-bar-track">
            <div class="funnel-bar funnel-bar--sqls" style="width: {results.leadsPerMonth > 0 ? (results.sqlsPerMonth / results.leadsPerMonth) * 100 : 0}%"></div>
          </div>
          <div class="funnel-meta">
            <span class="funnel-label">SQLs</span>
            <span class="funnel-numbers">{fmtNum(results.sqlsPerMonth, 0)}/mo &middot; {fmtNum(results.sqlsPerWeek, 1)}/wk</span>
          </div>
        </div>

        <!-- Connector: SQL → Opp -->
        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-connector-rate">{results.sqlToOppRate}%</span>
          <div class="funnel-connector-line"></div>
        </div>

        <!-- Opportunities -->
        <div class="funnel-stage">
          <div class="funnel-bar-track">
            <div class="funnel-bar funnel-bar--opps" style="width: {results.leadsPerMonth > 0 ? (results.oppsPerMonth / results.leadsPerMonth) * 100 : 0}%"></div>
          </div>
          <div class="funnel-meta">
            <span class="funnel-label">Opportunities</span>
            <span class="funnel-numbers">{fmtNum(results.oppsPerMonth, 0)}/mo &middot; {fmtNum(results.oppsPerWeek, 1)}/wk</span>
          </div>
        </div>

        <!-- Connector: Opp → Deal -->
        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-connector-rate">{results.closeRateVal}%</span>
          <div class="funnel-connector-line"></div>
        </div>

        <!-- Closed Deals -->
        <div class="funnel-stage">
          <div class="funnel-bar-track">
            <div class="funnel-bar funnel-bar--deals" style="width: {Math.max(results.leadsPerMonth > 0 ? (results.dealsPerMonth / results.leadsPerMonth) * 100 : 0, 2)}%"></div>
          </div>
          <div class="funnel-meta">
            <span class="funnel-label">Closed Deals</span>
            <span class="funnel-numbers">{fmtNum(results.dealsPerMonth, 1)}/mo</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Budget -->
    <section class="results-section">
      <h2 class="results-section-heading">Budget</h2>

      <div class="results-budget-grid">
        <div class="results-card">
          <span class="results-card-value">{fmtCurrency(results.monthlyBudget)}</span>
          <span class="results-card-label">Monthly spend</span>
        </div>
        <div class="results-card">
          <span class="results-card-value">{fmtCurrency(results.annualBudget)}</span>
          <span class="results-card-label">Annual spend</span>
        </div>
        <div class="results-card">
          <span class="results-card-value">{fmtPercent(results.spendPercent)}</span>
          <span class="results-card-label">Of revenue target</span>
        </div>
        <div class="results-card results-card--accent">
          <span class="results-card-value">{fmtCurrency(results.cac)}</span>
          <span class="results-card-label">Cost per customer</span>
        </div>
      </div>
    </section>

    <!-- Section 3: Unit Economics -->
    <section class="results-section">
      <h2 class="results-section-heading">Unit Economics</h2>

      <div class="results-metrics-row">
        <div class="results-metric">
          <span class="results-metric-value">{fmtCurrency(results.cac)}</span>
          <span class="results-metric-label">Customer Acquisition Cost</span>
        </div>
        <div class="results-metric">
          <span class="results-metric-value">{fmtCurrency(results.ltv)}</span>
          <span class="results-metric-label">Lifetime Value</span>
        </div>
        <div class="results-metric">
          <span class="results-metric-value results-metric-value--{results.ltvCacHealth}">{fmtNum(results.ltvCacRatio)}:1</span>
          <span class="results-metric-label">
            {#if results.ltvCacHealth === 'warning'}
              Below 3:1 benchmark — spending too much relative to customer value
            {:else if results.ltvCacHealth === 'healthy'}
              Healthy — acquisition costs balanced against value
            {:else}
              Strong — room to invest more in growth
            {/if}
          </span>
        </div>
      </div>

      {#if results.cacWarning}
        <div class="results-warning">
          Your CAC ({fmtCurrency(results.cac)}) is {fmtPercent(results.cacDealPercent)} of your deal size. That leaves thin margin for error.
        </div>
      {/if}
    </section>

    <!-- Section 4: Pipeline -->
    <section class="results-section">
      <h2 class="results-section-heading">Pipeline</h2>

      <div class="results-metrics-row">
        <div class="results-metric">
          <span class="results-metric-value">{fmtCurrency(results.pipelineCoverage)}</span>
          <span class="results-metric-label">Active pipeline needed (3-4x coverage)</span>
        </div>
        <div class="results-metric">
          <span class="results-metric-value">~{fmtNum(results.timeToRevenue, 1)} months</span>
          <span class="results-metric-label">From first marketing spend to first closed deal</span>
        </div>
        <div class="results-metric">
          <span class="results-metric-value">~{fmtNum(results.rampUp, 1)} months</span>
          <span class="results-metric-label">To reach steady-state pipeline</span>
        </div>
      </div>
    </section>

    <!-- Post-results actions -->
    <div class="results-actions-divider"></div>

    <div class="results-actions">
      <button
        type="button"
        class="results-copy"
        class:results-copy--copied={copied}
        onclick={copyResults}
      >{copied ? 'Copied' : 'Copy results'}</button>
      <button type="button" class="results-start-over" onclick={startOver}>Start over</button>
    </div>

    <!-- Quiet CTA -->
    <div class="results-cta">
      <p class="results-cta-text">Need help turning these numbers into an actual plan?</p>
      <a href="/contact" class="results-cta-link">Talk to Devin <span class="results-cta-arrow">&rarr;</span></a>
    </div>
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

  /* ══════════════════════════════════════════
     Results Dashboard
     ══════════════════════════════════════════ */

  .results-dashboard {
    /* Entrance handled by motion library in $effect */
  }

  /* ── Results header ── */
  .results-header {
    margin-bottom: clamp(3rem, 6vw, 4rem);
  }

  .results-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    line-height: 1.1;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0 0 0.5rem;
  }

  .results-revenue {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: 1.35;
    margin: 0;
  }

  /* ── Section pattern ── */
  .results-section {
    margin-bottom: clamp(3rem, 6vw, 4rem);
  }

  .results-section-heading {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin: 0 0 1.5rem;
  }

  /* ── Funnel ── */
  .results-funnel {
    display: flex;
    flex-direction: column;
  }

  .funnel-stage {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .funnel-bar-track {
    width: 100%;
    height: 6px;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border-radius: 3px;
    overflow: hidden;
  }

  .funnel-bar {
    height: 100%;
    border-radius: 3px;
    transition: width var(--duration-slow) var(--ease-out-expo);
    min-width: 4px;
  }

  .funnel-bar--leads { background: var(--color-accent-teal); }
  .funnel-bar--sqls { background: var(--color-accent-amber); }
  .funnel-bar--opps { background: var(--color-accent); }
  .funnel-bar--deals { background: var(--color-accent-rust); }

  .funnel-meta {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .funnel-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }

  .funnel-numbers {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  /* ── Funnel connectors ── */
  .funnel-connector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0;
    padding-left: 1rem;
  }

  .funnel-connector-line {
    flex: 0 0 12px;
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 20%, transparent);
  }

  .funnel-connector-rate {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  /* ── Budget grid ── */
  .results-budget-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
  }

  .results-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
  }

  .results-card--accent {
    border-left: 2px solid var(--color-accent);
  }

  .results-card-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text);
    line-height: 1.1;
  }

  .results-card-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  @media (max-width: 640px) {
    .results-budget-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ── Metrics row (unit economics, pipeline) ── */
  .results-metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  @media (max-width: 640px) {
    .results-metrics-row {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .results-metric {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .results-metric-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text);
    line-height: 1.1;
  }

  .results-metric-value--warning { color: var(--color-accent-rust); }
  .results-metric-value--healthy { color: var(--color-accent-teal); }
  .results-metric-value--strong { color: var(--color-accent); }

  .results-metric-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.45;
  }

  /* ── CAC Warning ── */
  .results-warning {
    margin-top: 1.25rem;
    padding: 1rem 1.25rem;
    border-left: 2px solid var(--color-accent-rust);
    background: color-mix(in oklab, var(--color-accent-rust) 5%, transparent);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* ── Post-results actions ── */
  .results-actions-divider {
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    margin-bottom: 1.5rem;
  }

  .results-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .results-copy {
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
                color var(--duration-fast) var(--ease-out-expo);
  }

  .results-copy:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .results-copy--copied {
    border-color: var(--color-accent-teal);
    color: var(--color-accent-teal);
  }

  .results-start-over {
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

  .results-start-over:hover {
    color: var(--color-text);
  }

  /* ── Quiet CTA ── */
  .results-cta {
    margin-top: clamp(4rem, 8vw, 6rem);
  }

  .results-cta-text {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: 1.35;
    margin: 0 0 0.75rem;
  }

  .results-cta-link {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .results-cta-link:hover {
    color: var(--color-accent);
  }

  .results-cta-arrow {
    display: inline-block;
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }

  .results-cta-link:hover .results-cta-arrow {
    transform: translateX(3px);
  }

  /* prefers-reduced-motion handled in JS for results entrance */
</style>
