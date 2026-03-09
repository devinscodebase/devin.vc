<script>
  import { onMount, tick } from 'svelte';
  import { animate, stagger } from 'motion';
  import {
    fmtCurrency, fmtNum, fmtPercent, formatWithCommas,
    parseRawNumber, abbreviateTarget, calculateGtmResults
  } from './gtm-planner-utils.js';

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
  let steps = $derived.by(() => {
    const base = [
      { id: 'revenue', category: 'Revenue', label: 'What\'s your annual revenue target?', field: 'currency' },
      { id: 'deal', category: 'Revenue', label: isRecurring ? 'What\'s your monthly contract value?' : 'What\'s your average deal size?', field: 'currency-toggle' },
      { id: 'cycle', category: 'Funnel', label: 'How long is your average sales cycle?', field: 'days', default: 90, benchmark: 'Industry average: 90 days' },
      { id: 'close', category: 'Funnel', label: 'What % of opportunities become closed deals?', field: 'percent', default: 25, benchmark: 'B2B average: 25%' },
      { id: 'sql-opp', category: 'Funnel', label: 'What % of qualified leads become opportunities?', field: 'percent', default: 50, benchmark: 'Industry average: 50%' },
      { id: 'lead-sql', category: 'Funnel', label: 'What % of leads become sales-qualified?', field: 'percent', default: 20, benchmark: 'Industry average: 20%' },
      { id: 'cpl', category: 'Economics', label: 'What\'s your average cost per lead?', field: 'currency' },
      { id: 'margin', category: 'Economics', label: 'What\'s your gross margin?', field: 'percent', default: 70, benchmark: 'B2B average: 70%' },
    ];
    if (isRecurring) {
      base.push({ id: 'lifespan', category: 'Economics', label: 'How long does a typical customer stay?', field: 'months' });
    }
    return base;
  });

  let totalSteps = $derived(steps.length);
  let showResults = $state(false);

  /* ── Lead capture state ── */
  let showLeadCapture = $state(false);
  let leadName = $state('');
  let leadEmail = $state('');
  let leadCompany = $state('');
  let leadConsent = $state(false);
  let leadSubmitting = $state(false);
  let leadError = $state('');
  let leadSubmitted = $state(false);
  let leadEmailDisplay = $state('');

  let leadFormValid = $derived(
    leadName.trim().length > 0 &&
    leadEmail.trim().length > 0 &&
    leadEmail.includes('@') &&
    leadCompany.trim().length > 0 &&
    leadConsent
  );

  /* ── Derived calculations ── */
  let canCalculate = $derived(
    revenueTarget > 0 && dealSize > 0 && costPerLead > 0 &&
    (!isRecurring || customerLifespan > 0)
  );

  let results = $derived(calculateGtmResults({
    revenueTarget, dealSize, isRecurring, salesCycle,
    closeRate, sqlToOpp, leadToSql, costPerLead,
    grossMargin, customerLifespan,
  }));

  /* ── Navigation ── */
  function next() {
    if (currentStep < totalSteps) {
      direction = 1;
      currentStep++;
    } else if (canCalculate) {
      showLeadCapture = true;
      animateLeadCapture();
    }
  }

  function back() {
    if (showResults) {
      // Skip lead capture on back — it's a one-time gate, not a nav stop
      showResults = false;
      showLeadCapture = false;
    } else if (showLeadCapture) {
      showLeadCapture = false;
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
    showLeadCapture = false;
    leadName = '';
    leadEmail = '';
    leadCompany = '';
    leadConsent = false;
    leadSubmitting = false;
    leadError = '';
    leadSubmitted = false;
    leadEmailDisplay = '';
    pdfGenerating = false;
    showHowItWorks = false;
    direction = 1;
  }

  async function submitLead() {
    if (!leadFormValid || leadSubmitting) return;
    leadSubmitting = true;
    leadError = '';

    try {
      const res = await fetch('/api/gtm-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          company: leadCompany.trim(),
          inputs: {
            revenueTarget,
            dealSize,
            isRecurring,
            salesCycle,
            closeRate,
            sqlToOpp,
            leadToSql,
            costPerLead,
            grossMargin,
            customerLifespan: isRecurring ? customerLifespan : null,
          },
          results,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      leadEmailDisplay = leadEmail.trim();
      leadSubmitted = true;
      showLeadCapture = false;
      showResults = true;
      animateResults();
    } catch (err) {
      leadError = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      leadSubmitting = false;
    }
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


  /* ── How it works accordion ── */
  let showHowItWorks = $state(false);

  /* ── Focus tracking for currency/number inputs ── */
  let inputFocused = $state(false);
  let inputInvalid = $state(false);

  function handleNumericInput(e, stepIndex) {
    const val = parseRawNumber(e.target.value);
    setValue(stepIndex, val);
    // Flag invalid if there's text but no valid number
    inputInvalid = e.target.value.trim().length > 0 && val === null;
  }

  function handleNumericBlur(e, stepIndex) {
    inputFocused = false;
    const val = parseRawNumber(e.target.value);
    setValue(stepIndex, val);
    inputInvalid = false;
  }

  function handleNumericFocus(e, stepIndex) {
    inputFocused = true;
    inputInvalid = false;
    const raw = getValue(stepIndex);
    e.target.value = raw ?? '';
  }

  /* ── Step validity (for disabling Next button) ── */
  let currentStepValid = $derived.by(() => {
    const step = steps[currentStep - 1];
    if (step.field === 'currency' || step.field === 'currency-toggle') {
      // Read state directly (not via getValue) to guarantee reactive tracking
      let val;
      switch (step.id) {
        case 'revenue': val = revenueTarget; break;
        case 'deal': val = dealSize; break;
        case 'cpl': val = costPerLead; break;
      }
      return val != null && val > 0;
    }
    if (step.field === 'days' || step.field === 'months') {
      let val;
      switch (step.id) {
        case 'cycle': val = salesCycle; break;
        case 'lifespan': val = customerLifespan; break;
      }
      return val != null && val > 0;
    }
    // percent fields always have a default
    return true;
  });

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

  /* ── Animation helpers (called imperatively, no $effect) ── */
  function animateLeadCapture() {
    tick().then(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const form = document.querySelector('.lead-capture');
      if (!form) return;

      const header = form.querySelector('.lead-heading');
      if (header) {
        animate(header, { opacity: [0, 1], y: [16, 0] }, {
          duration: 0.4,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const fields = form.querySelectorAll('.lead-field');
      if (fields.length) {
        animate(fields, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.35,
          delay: stagger(0.06, { start: 0.1 }),
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const actions = form.querySelector('.lead-actions');
      if (actions) {
        animate(actions, { opacity: [0, 1] }, {
          duration: 0.4,
          delay: 0.35,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      // Autofocus name field after entrance animation settles
      const nameInput = form.querySelector('.lead-input');
      if (nameInput) setTimeout(() => nameInput.focus(), 350);
    });
  }

  function animateResults() {
    tick().then(() => {
      const dashboard = document.querySelector('.results-dashboard');
      if (!dashboard) return;

      if (window.__vtNav) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const header = dashboard.querySelector('.results-header');
      if (header) {
        animate(header, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.4,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const insight = dashboard.querySelector('.results-insight');
      if (insight) {
        animate(insight, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.4,
          delay: 0.12,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const sections = dashboard.querySelectorAll('.results-section');
      if (sections.length) {
        animate(sections, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.4,
          delay: stagger(0.08, { start: 0.2 }),
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const bars = dashboard.querySelectorAll('.funnel-stage-bar');
      if (bars.length) {
        bars.forEach((bar, i) => {
          const targetWidth = bar.style.width;
          bar.style.width = '0%';
          animate(bar, { width: ['0%', targetWidth] }, {
            duration: 0.6,
            delay: 0.3 + (i * 0.08),
            easing: [0.16, 1, 0.3, 1],
          });
        });
      }

      const metrics = dashboard.querySelectorAll('.results-metric, .budget-primary, .pipeline-coverage');
      if (metrics.length) {
        animate(metrics, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.35,
          delay: stagger(0.04, { start: 0.35 }),
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const cta = dashboard.querySelector('.results-cta');
      if (cta) {
        animate(cta, { opacity: [0, 1], y: [12, 0] }, {
          duration: 0.4,
          delay: 0.6,
          easing: [0.16, 1, 0.3, 1],
        });
      }

      const actions = dashboard.querySelector('.results-actions');
      if (actions) {
        animate(actions, { opacity: [0, 1] }, {
          duration: 0.4,
          delay: 0.7,
          easing: [0.16, 1, 0.3, 1],
        });
      }
    });
  }

  /* ── Clipboard ── */
  let copied = $state(false);

  /* ── PDF ── */
  let pdfGenerating = $state(false);

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

  /* ── PDF generation ── */
  async function downloadPDF() {
    if (!results || pdfGenerating) return;
    pdfGenerating = true;

    try {
      const { jsPDF } = await import('jspdf');
      const r = results;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297;

      // Colors
      const bg = [10, 10, 8];
      const elevated = [20, 18, 16];
      const text = [237, 232, 223];
      const muted = [160, 148, 136];
      const dim = [140, 124, 106];
      const accent = [196, 164, 124];
      const teal = [91, 163, 163];
      const rust = [176, 106, 82];
      const border = [50, 44, 36];

      // Dark background
      doc.setFillColor(...bg);
      doc.rect(0, 0, W, H, 'F');

      const mx = 20; // margin x
      const cw = W - 2 * mx; // content width

      // ─── Zone 1: Header ───
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('GTM PLAN', mx, 22);

      doc.setFontSize(18);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...text);
      const companyName = leadCompany.trim() || 'Your Company';
      doc.text(companyName, mx, 30);

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      const modelLabel = isRecurring ? 'Recurring Revenue' : 'One-Time Revenue';
      doc.text(`${fmtCurrency(revenueTarget)} Target  ·  ${modelLabel}`, mx, 37);

      doc.setFontSize(9);
      doc.setTextColor(...dim);
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(today, mx, 43);

      // Divider
      doc.setDrawColor(...border);
      doc.setLineWidth(0.3);
      doc.line(mx, 47, W - mx, 47);

      // ─── Zone 2: Funnel ───
      let y = 54;
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('FUNNEL', mx, y);
      y += 7;

      const funnelData = [
        { label: 'Leads', monthly: r.leadsPerMonth, weekly: r.leadsPerWeek },
        { label: 'SQLs', monthly: r.sqlsPerMonth, weekly: r.sqlsPerWeek },
        { label: 'Opportunities', monthly: r.oppsPerMonth, weekly: r.oppsPerWeek },
        { label: 'Closed Deals', monthly: r.dealsPerMonth, weekly: null },
      ];
      const convRates = [
        { rate: r.leadToSqlRate, label: 'Lead → SQL' },
        { rate: r.sqlToOppRate, label: 'SQL → Opp' },
        { rate: r.closeRateVal, label: 'Opp → Deal' },
      ];

      const maxVal = Math.max(...funnelData.map(d => d.monthly));
      const barMaxW = cw * 0.45;
      const barH = 7;
      const barX = mx + cw * 0.35;
      const rowSpacing = 18;

      funnelData.forEach((item, i) => {
        const rowY = y + i * rowSpacing;

        // Label
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...text);
        doc.text(item.label, mx, rowY + 1);

        // Values
        doc.setFontSize(9);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        const valText = item.weekly != null
          ? `${fmtNum(item.monthly, 0)}/mo  ·  ${fmtNum(item.weekly, 1)}/wk`
          : `${fmtNum(item.monthly, 1)}/mo`;
        doc.text(valText, mx, rowY + 6);

        // Bar
        const barW = maxVal > 0 ? (item.monthly / maxVal) * barMaxW : 0;
        doc.setFillColor(...elevated);
        doc.roundedRect(barX, rowY - 2, barMaxW, barH, 1, 1, 'F');
        if (barW > 0) {
          doc.setFillColor(...accent);
          doc.roundedRect(barX, rowY - 2, Math.max(barW, 2), barH, 1, 1, 'F');
        }

        // Value on bar
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...bg);
        if (barW > 15) {
          doc.text(fmtNum(item.monthly, 0), barX + 3, rowY + 3);
        } else {
          doc.setTextColor(...muted);
          doc.text(fmtNum(item.monthly, 0), barX + barW + 3, rowY + 3);
        }

        // Conversion rate between rows
        if (i < convRates.length) {
          doc.setFontSize(7.5);
          doc.setFont('Helvetica', 'italic');
          doc.setTextColor(...muted);
          doc.text(`${convRates[i].rate}%`, barX + barMaxW + 5, rowY + 7);
        }
      });

      y += funnelData.length * rowSpacing + 6;

      // Divider
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // ─── Zone 3: Budget + Unit Economics (two columns) ───
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('BUDGET', mx, y);
      doc.text('UNIT ECONOMICS', mx + cw * 0.55, y);
      y += 7;

      // Left column: Budget
      const leftX = mx;
      const budgetItems = [
        { label: 'Monthly Spend', value: fmtCurrency(r.monthlyBudget) },
        { label: 'Annual Spend', value: fmtCurrency(r.annualBudget) },
        { label: '% of Revenue', value: fmtPercent(r.spendPercent) },
        { label: 'Cost per Customer', value: fmtCurrency(r.cac) },
      ];

      budgetItems.forEach((item, i) => {
        const iy = y + i * 10;
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(item.label, leftX, iy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...text);
        doc.text(item.value, leftX, iy + 5);
      });

      // Right column: Unit Economics
      const rightX = mx + cw * 0.55;
      const healthColor = r.ltvCacHealth === 'warning' ? rust
        : r.ltvCacHealth === 'strong' ? teal : accent;

      const econItems = [
        { label: 'CAC', value: fmtCurrency(r.cac), color: text },
        { label: 'LTV', value: fmtCurrency(r.ltv), color: text },
        { label: 'LTV:CAC Ratio', value: `${fmtNum(r.ltvCacRatio)}:1`, color: healthColor },
      ];

      econItems.forEach((item, i) => {
        const iy = y + i * 10;
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(item.label, rightX, iy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...item.color);
        doc.text(item.value, rightX, iy + 5);
      });

      // CAC warning
      if (r.cacWarning) {
        const warningY = y + econItems.length * 10 + 2;
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'italic');
        doc.setTextColor(...rust);
        doc.text(`CAC is ${fmtPercent(r.cacDealPercent)} of deal size`, rightX, warningY);
      }

      y += Math.max(budgetItems.length, econItems.length + (r.cacWarning ? 1 : 0)) * 10 + 8;

      // Divider
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // ─── Zone 4: Pipeline ───
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('PIPELINE', mx, y);
      y += 7;

      const pipelineItems = [
        { label: 'Pipeline Coverage (3.5x)', value: fmtCurrency(r.pipelineCoverage) },
        { label: 'Time to First Revenue', value: `~${fmtNum(r.timeToRevenue, 1)} months` },
        { label: 'Ramp to Steady-State', value: `~${fmtNum(r.rampUp, 1)} months` },
      ];

      pipelineItems.forEach((item, i) => {
        const iy = y + i * 10;
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(item.label, mx, iy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...text);
        doc.text(item.value, mx, iy + 5);
      });

      // ─── Zone 5: Footer ───
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('devin.vc', mx, H - 12);
      doc.text('Generated with GTM Budget Planner', W - mx, H - 12, { align: 'right' });

      // Save
      const dateStr = new Date().toISOString().split('T')[0];
      const shortTarget = abbreviateTarget(revenueTarget);
      doc.save(`gtm-plan-${shortTarget}-${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      pdfGenerating = false;
    }
  }
</script>

{#if showResults && results}
  <div class="results-dashboard">
    <!-- Hero header -->
    <header class="results-header">
      <span class="results-tag">Your GTM Plan</span>
      <p class="results-hero-number">{fmtCurrency(results.monthlyBudget)}<span class="results-hero-period">/mo</span></p>
      <p class="results-hero-context">to hit {fmtCurrency(revenueTarget)} in annual revenue</p>
    </header>

    {#if leadSubmitted && leadEmailDisplay}
      <div class="results-email-sent">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
        <span>A copy is on its way to {leadEmailDisplay}</span>
      </div>
    {/if}

    <!-- Summary insight -->
    <p class="results-insight">
      You need <strong>{fmtNum(results.leadsPerMonth, 0)} leads per month</strong> at
      <strong>{fmtCurrency(results.monthlyBudget)}/mo</strong> to close
      <strong>{fmtNum(results.dealsPerMonth, 1)} deals</strong> and hit your target.
      Your unit economics are
      <strong class="insight-health insight-health--{results.ltvCacHealth}">{results.ltvCacHealth === 'warning' ? 'under pressure' : results.ltvCacHealth === 'healthy' ? 'healthy' : 'strong'}</strong>.
    </p>

    <!-- Section 1: Funnel -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">01</span>
        <h2 class="results-section-heading">Funnel</h2>
      </div>

      <div class="results-funnel">
        <!-- Leads -->
        <div class="funnel-stage">
          <div class="funnel-stage-bar funnel-bar--leads" style="width: 100%"></div>
          <div class="funnel-stage-content">
            <span class="funnel-count">{fmtNum(results.leadsPerMonth, 0)}</span>
            <div class="funnel-detail">
              <span class="funnel-label">Leads per month</span>
              <span class="funnel-breakdown">{fmtNum(results.leadsPerWeek, 0)}/wk · {fmtNum(results.leadsPerDay, 1)}/day</span>
            </div>
          </div>
        </div>

        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-rate">{results.leadToSqlRate}%</span>
        </div>

        <!-- SQLs -->
        <div class="funnel-stage">
          <div class="funnel-stage-bar funnel-bar--sqls" style="width: {results.leadsPerMonth > 0 ? Math.max((results.sqlsPerMonth / results.leadsPerMonth) * 100, 5) : 0}%"></div>
          <div class="funnel-stage-content">
            <span class="funnel-count">{fmtNum(results.sqlsPerMonth, 0)}</span>
            <div class="funnel-detail">
              <span class="funnel-label">SQLs per month</span>
              <span class="funnel-breakdown">{fmtNum(results.sqlsPerWeek, 1)}/wk</span>
            </div>
          </div>
        </div>

        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-rate">{results.sqlToOppRate}%</span>
        </div>

        <!-- Opportunities -->
        <div class="funnel-stage">
          <div class="funnel-stage-bar funnel-bar--opps" style="width: {results.leadsPerMonth > 0 ? Math.max((results.oppsPerMonth / results.leadsPerMonth) * 100, 5) : 0}%"></div>
          <div class="funnel-stage-content">
            <span class="funnel-count">{fmtNum(results.oppsPerMonth, 0)}</span>
            <div class="funnel-detail">
              <span class="funnel-label">Opportunities per month</span>
              <span class="funnel-breakdown">{fmtNum(results.oppsPerWeek, 1)}/wk</span>
            </div>
          </div>
        </div>

        <div class="funnel-connector">
          <div class="funnel-connector-line"></div>
          <span class="funnel-rate">{results.closeRateVal}%</span>
        </div>

        <!-- Closed Deals -->
        <div class="funnel-stage">
          <div class="funnel-stage-bar funnel-bar--deals" style="width: {results.leadsPerMonth > 0 ? Math.max((results.dealsPerMonth / results.leadsPerMonth) * 100, 3) : 0}%"></div>
          <div class="funnel-stage-content">
            <span class="funnel-count">{fmtNum(results.dealsPerMonth, 1)}</span>
            <div class="funnel-detail">
              <span class="funnel-label">Closed deals per month</span>
              <span class="funnel-breakdown">{fmtNum(results.dealsPerYear, 0)}/year at {fmtCurrency(results.effectiveDealValue)} each</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Budget -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">02</span>
        <h2 class="results-section-heading">Budget</h2>
      </div>

      <div class="results-budget-hero">
        <div class="budget-primary">
          <span class="budget-primary-value">{fmtCurrency(results.monthlyBudget)}</span>
          <span class="budget-primary-label">Monthly marketing spend</span>
        </div>
        <div class="budget-supporting">
          <div class="results-metric">
            <span class="results-metric-value">{fmtCurrency(results.annualBudget)}</span>
            <span class="results-metric-label">Annual spend</span>
          </div>
          <div class="results-metric">
            <span class="results-metric-value results-metric-value--spend-{results.spendHealth}">{fmtPercent(results.spendPercent)}</span>
            <span class="results-metric-label">
              {#if results.spendHealth === 'warning'}
                Of revenue. High for most models
              {:else if results.spendHealth === 'moderate'}
                Of revenue. Typical B2B range
              {:else}
                Of revenue. Lean and efficient
              {/if}
            </span>
          </div>
          <div class="results-metric">
            <span class="results-metric-value">{fmtCurrency(results.costPerLead)}</span>
            <span class="results-metric-label">Cost per lead</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Unit Economics -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">03</span>
        <h2 class="results-section-heading">Unit Economics</h2>
      </div>

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
              Below 3:1 benchmark. Spending too much relative to customer value
            {:else if results.ltvCacHealth === 'healthy'}
              Healthy. Acquisition costs balanced against value
            {:else}
              Strong. Room to invest more in growth
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
      <div class="results-section-header">
        <span class="results-section-number">04</span>
        <h2 class="results-section-heading">Pipeline</h2>
      </div>

      <div class="pipeline-hero">
        <div class="pipeline-coverage">
          <span class="pipeline-coverage-value">{fmtCurrency(results.pipelineCoverage)}</span>
          <span class="pipeline-coverage-label">Active pipeline needed at all times (3.5x coverage)</span>
        </div>
      </div>

      <div class="pipeline-timeline">
        <div class="pipeline-timeline-item">
          <span class="pipeline-timeline-value">~{fmtNum(results.timeToRevenue, 1)} mo</span>
          <span class="pipeline-timeline-label">First spend to first closed deal</span>
        </div>
        <div class="pipeline-timeline-divider"></div>
        <div class="pipeline-timeline-item">
          <span class="pipeline-timeline-value">~{fmtNum(results.rampUp, 1)} mo</span>
          <span class="pipeline-timeline-label">To fully loaded pipeline</span>
        </div>
      </div>
    </section>

    <!-- CTA (moved up, before actions) -->
    <div class="results-cta">
      <p class="results-cta-text">Need help turning these numbers into an actual plan?</p>
      <a href="/contact" class="results-cta-link">Talk to Devin <span class="results-cta-arrow">&rarr;</span></a>
    </div>

    <!-- Post-results actions -->
    <div class="results-actions-divider"></div>

    <div class="results-actions">
      <button
        type="button"
        class="results-copy"
        onclick={downloadPDF}
        disabled={pdfGenerating}
      >
        {#if pdfGenerating}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 1v3M6 8v3M1.5 6H4M8 6h2.5" opacity="0.4"/><path d="M2.8 2.8l1.8 1.8M7.4 7.4l1.8 1.8" opacity="0.6"/></svg>
          Generating...
        {:else}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 1v7M3 6l3 3 3-3"/><path d="M1 10h10"/></svg>
          Download PDF
        {/if}
      </button>
      <button
        type="button"
        class="results-copy"
        class:results-copy--copied={copied}
        onclick={copyResults}
      >
        {#if copied}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6.5L4.5 9L10 3"/></svg>
          Copied
        {:else}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M8 4V2.5A1.5 1.5 0 006.5 1h-4A1.5 1.5 0 001 2.5v4A1.5 1.5 0 002.5 8H4"/></svg>
          Copy results
        {/if}
      </button>
      <button type="button" class="results-start-over" onclick={startOver}>Start over</button>
    </div>
  </div>
{:else if showLeadCapture}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lead-capture" onkeydown={(e) => { if (e.key === 'Enter' && leadFormValid && !leadSubmitting) submitLead(); }}>
    <!-- Persist wizard header for visual continuity -->
    <header class="wizard-header">
      <span class="tag-label">Tools</span>
      <h1 class="wizard-title">GTM Budget Planner</h1>
      <p class="wizard-subtitle">Reverse-engineer your go-to-market budget from a revenue target.</p>
    </header>

    <!-- Progress dots — all completed -->
    <div class="progress" role="progressbar" aria-valuenow={totalSteps} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div class="progress-dots">
        {#each steps as _}
          <span class="dot dot--completed"></span>
        {/each}
        <span class="dot dot--current"></span>
      </div>
      <span class="progress-label">Your details</span>
    </div>

    <div class="lead-content">
      <h2 class="lead-heading">Your plan is ready.</h2>
      <p class="lead-subheading">Enter your details to unlock your results. We'll email you a copy too.</p>

      {#if results}
        <div class="lead-teaser">
          <div class="lead-teaser-header">
            <svg class="lead-teaser-lock" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4 5.5V3.5a2 2 0 014 0V5.5"/></svg>
            <span class="lead-teaser-title">Your results preview</span>
          </div>
          <div class="lead-teaser-rows">
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Monthly budget</span>
              <span class="lead-teaser-redacted" style="width: 5.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Leads per month</span>
              <span class="lead-teaser-redacted" style="width: 3.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">LTV:CAC ratio</span>
              <span class="lead-teaser-redacted" style="width: 2.5rem"></span>
            </div>
          </div>
        </div>
      {/if}

      <div class="lead-fields">
        <div class="lead-field">
          <input
            type="text"
            class="lead-input"
            placeholder="Name"
            bind:value={leadName}
            autocomplete="name"
          />
          <div class="lead-input-line"></div>
        </div>

        <div class="lead-field">
          <input
            type="email"
            class="lead-input"
            placeholder="Email"
            bind:value={leadEmail}
            autocomplete="email"
          />
          <div class="lead-input-line"></div>
        </div>

        <div class="lead-field">
          <input
            type="text"
            class="lead-input"
            placeholder="Company"
            bind:value={leadCompany}
            autocomplete="organization"
          />
          <div class="lead-input-line"></div>
        </div>
      </div>

      <label class="lead-consent lead-field">
        <span class="lead-checkbox" class:lead-checkbox--checked={leadConsent}>
          <input type="checkbox" bind:checked={leadConsent} class="lead-checkbox-input" />
          {#if leadConsent}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5L4 7.5L8 3"/></svg>
          {/if}
        </span>
        <span class="lead-consent-text">
          I agree to the <a href="/terms" class="lead-consent-link">terms</a> and <a href="/privacy" class="lead-consent-link">privacy policy</a>.
        </span>
      </label>

      {#if leadError}
        <p class="lead-error">{leadError}</p>
      {/if}
    </div>

    <nav class="lead-actions">
      <button type="button" class="nav-back" onclick={back}>Back</button>
      <button
        type="button"
        class="nav-next"
        class:nav-next--disabled={!leadFormValid || leadSubmitting}
        disabled={!leadFormValid || leadSubmitting}
        onclick={submitLead}
      >
        {#if leadSubmitting}
          <span class="lead-dots">
            <span class="lead-dot"></span>
            <span class="lead-dot"></span>
            <span class="lead-dot"></span>
          </span>
        {:else}
          Get Your Plan
        {/if}
      </button>
    </nav>
  </div>
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="wizard" onkeydown={handleKeydown}>
    <!-- Header -->
    <header class="wizard-header">
      <span class="tag-label">Tools</span>
      <h1 class="wizard-title">GTM Budget Planner</h1>
      <p class="wizard-subtitle">Reverse-engineer your go-to-market budget from a revenue target.</p>

      <!-- How it works trigger -->
      <button
        type="button"
        class="how-it-works-trigger"
        class:how-it-works-trigger--open={showHowItWorks}
        onclick={() => showHowItWorks = !showHowItWorks}
        aria-expanded={showHowItWorks}
        aria-controls="how-it-works-panel"
      >
        <svg class="how-it-works-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="6"/><path d="M7 9.5V9.5"/><circle cx="7" cy="9.5" r="0.25" fill="currentColor" stroke="none"/><path d="M5.5 5.25a1.5 1.5 0 112.12 1.37c-.37.22-.62.6-.62 1.03V8"/></svg>
        How it works
        <svg class="how-it-works-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5L5 6.5L7.5 3.5"/></svg>
      </button>
    </header>

    <!-- How it works accordion panel -->
    <div
      id="how-it-works-panel"
      class="how-it-works-panel"
      class:how-it-works-panel--open={showHowItWorks}
      aria-hidden={!showHowItWorks}
    >
      <div class="how-it-works-inner">
        <p class="hiw-body">Start with your revenue goal. We'll ask about deal size, sales cycle, and a few conversion rates. If you don't know the exact numbers, the defaults are solid. From there we work backward to show you how many leads you need each month, what to spend, and whether the math holds up.</p>

        <div class="hiw-glossary">
          <h3 class="hiw-heading">Jargon decoder</h3>
          <dl class="hiw-defs">
            <div class="hiw-def"><dt>SQL</dt><dd>A lead your sales team has vetted and thinks is worth pursuing.</dd></div>
            <div class="hiw-def"><dt>CAC</dt><dd>What it costs you, all-in, to win one customer.</dd></div>
            <div class="hiw-def"><dt>LTV</dt><dd>Total profit from one customer before they churn or stop buying.</dd></div>
            <div class="hiw-def"><dt>LTV:CAC</dt><dd>Are your customers worth more than they cost to acquire? 3:1 is the floor. 5:1+ is great.</dd></div>
            <div class="hiw-def"><dt>MCV</dt><dd>Monthly contract value. What a subscriber pays you per month.</dd></div>
            <div class="hiw-def"><dt>Pipeline</dt><dd>Total deal value you're actively working. You want 3-3.5x your monthly target in here at all times.</dd></div>
          </dl>
        </div>
      </div>
    </div>

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
        <span class="step-category">{steps[currentStep - 1].category}</span>
        <h2 class="step-question">{steps[currentStep - 1].label}</h2>

        <!-- Currency input -->
        {#if steps[currentStep - 1].field === 'currency'}
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="input-currency"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : formatWithCommas(getValue(currentStep - 1))}
                onfocus={(e) => handleNumericFocus(e, currentStep - 1)}
                onblur={(e) => handleNumericBlur(e, currentStep - 1)}
                oninput={(e) => handleNumericInput(e, currentStep - 1)}
                placeholder="0"
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>

        <!-- Currency with toggle (deal size step) -->
        {:else if steps[currentStep - 1].field === 'currency-toggle'}
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="input-currency"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : formatWithCommas(getValue(currentStep - 1))}
                onfocus={(e) => handleNumericFocus(e, currentStep - 1)}
                onblur={(e) => handleNumericBlur(e, currentStep - 1)}
                oninput={(e) => handleNumericInput(e, currentStep - 1)}
                placeholder="0"
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
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
            <div class="range-track-wrapper">
              <input
                type="range"
                min="1"
                max="100"
                class="input-range"
                value={getValue(currentStep - 1)}
                oninput={(e) => setValue(currentStep - 1, parseInt(e.target.value))}
                style="--range-pct: {getValue(currentStep - 1)}%"
              />
              {#if steps[currentStep - 1].default}
                <span class="range-tick" style="left: {steps[currentStep - 1].default}%" aria-hidden="true"></span>
              {/if}
            </div>
            <span class="range-value">{getValue(currentStep - 1)}%</span>
          </div>

        <!-- Days input -->
        {:else if steps[currentStep - 1].field === 'days'}
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <input
                type="text"
                inputmode="numeric"
                class="input-number"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : getValue(currentStep - 1)}
                onfocus={(e) => handleNumericFocus(e, currentStep - 1)}
                onblur={(e) => handleNumericBlur(e, currentStep - 1)}
                oninput={(e) => handleNumericInput(e, currentStep - 1)}
                placeholder="0"
              />
              <span class="input-suffix">days</span>
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>

        <!-- Months input -->
        {:else if steps[currentStep - 1].field === 'months'}
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <input
                type="text"
                inputmode="numeric"
                class="input-number"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : getValue(currentStep - 1)}
                onfocus={(e) => handleNumericFocus(e, currentStep - 1)}
                onblur={(e) => handleNumericBlur(e, currentStep - 1)}
                oninput={(e) => handleNumericInput(e, currentStep - 1)}
                placeholder="0"
              />
              <span class="input-suffix">months</span>
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
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
        Next
      </button>
    </nav>
  </div>
{/if}

<style>
  /* ── Wizard container ── */
  .wizard {
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .wizard-header {
    margin-bottom: clamp(1.25rem, 2vw, 1.5rem);
  }

  .tag-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
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

  /* ── How it works ── */
  .how-it-works-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.75rem;
    padding: 0;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .how-it-works-trigger:hover {
    color: var(--color-accent);
  }

  .how-it-works-trigger .how-it-works-icon {
    color: var(--color-accent-teal);
    flex-shrink: 0;
  }

  .how-it-works-trigger .how-it-works-chevron {
    transition: transform var(--duration-normal) var(--ease-out-expo);
    opacity: 0.5;
  }

  .how-it-works-trigger--open .how-it-works-chevron {
    transform: rotate(180deg);
  }

  .how-it-works-panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows var(--duration-slow) var(--ease-out-expo),
      opacity var(--duration-normal) var(--ease-out-expo);
  }

  .how-it-works-panel--open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .how-it-works-inner {
    overflow: hidden;
    padding-top: 0;
    transition: padding-top var(--duration-slow) var(--ease-out-expo);
  }

  .how-it-works-panel--open .how-it-works-inner {
    padding-top: 1.25rem;
    padding-bottom: 1rem;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .hiw-body,
  .hiw-heading,
  .hiw-def {
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity var(--duration-normal) var(--ease-out-expo),
      transform var(--duration-normal) var(--ease-out-expo);
  }

  .how-it-works-panel--open .hiw-body { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }
  .how-it-works-panel--open .hiw-heading { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
  .how-it-works-panel--open .hiw-def:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.30s; }
  .how-it-works-panel--open .hiw-def:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.34s; }
  .how-it-works-panel--open .hiw-def:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.38s; }
  .how-it-works-panel--open .hiw-def:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.42s; }
  .how-it-works-panel--open .hiw-def:nth-child(5) { opacity: 1; transform: translateY(0); transition-delay: 0.46s; }
  .how-it-works-panel--open .hiw-def:nth-child(6) { opacity: 1; transform: translateY(0); transition-delay: 0.50s; }

  .hiw-body {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.6;
    color: var(--color-text-muted);
    margin: 0 0 1rem;
    max-width: 52ch;
  }

  .hiw-heading {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent-teal);
    margin: 0 0 0.6rem;
  }

  .hiw-glossary {
    padding-bottom: 0.25rem;
  }

  .hiw-defs {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.1rem 1.5rem;
  }

  .hiw-def {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .hiw-def dt {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    color: var(--color-accent);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 3.5rem;
  }

  .hiw-def dd {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.45;
  }

  @media (max-width: 600px) {
    .hiw-defs {
      grid-template-columns: 1fr;
    }
  }

  /* ── Progress dots ── */
  .progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .progress-dots {
    display: flex;
    gap: 0.4rem;
  }

  .dot {
    width: 6px;
    height: 6px;
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
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
  }

  .step-category {
    display: block;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--color-accent-teal);
    margin-bottom: 0.5rem;
  }

  .step-question {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    line-height: 1.2;
    letter-spacing: var(--tracking-tight);
    margin: 0 0 clamp(1rem, 2vw, 1.25rem);
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
    .step-content,
    .slide-from-right,
    .slide-from-left {
      animation: none !important;
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

  /* ── Invalid state ── */
  .currency-wrapper.invalid,
  .suffix-wrapper.invalid {
    border-color: var(--color-accent-rust);
  }

  .input-hint {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-accent-rust);
    margin: 0.5rem 0 0;
    opacity: 0;
    animation: hint-enter 0.3s var(--ease-out-expo) forwards;
  }

  @keyframes hint-enter {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
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

  @media (max-width: 480px) {
    .toggle-pill {
      width: 100%;
    }

    .toggle-option {
      flex: 1;
      text-align: center;
    }
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

  .range-track-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .range-track-wrapper .input-range {
    width: 100%;
  }

  .range-tick {
    position: absolute;
    top: 50%;
    width: 1px;
    height: 10px;
    background: var(--color-accent-teal);
    opacity: 0.5;
    transform: translateX(-50%) translateY(-50%);
    pointer-events: none;
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
    margin: 0.6rem 0 0;
  }

  /* ── Navigation ── */
  .wizard-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    border: 1px solid var(--color-accent);
    padding: 0.75rem 2rem;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out-expo),
                border-color var(--duration-fast) var(--ease-out-expo),
                color var(--duration-fast) var(--ease-out-expo),
                opacity var(--duration-fast) var(--ease-out-expo),
                transform var(--duration-fast) var(--ease-out-expo);
  }

  .nav-next:hover:not(:disabled) {
    background: color-mix(in oklab, var(--color-accent) 12%, transparent);
    color: var(--color-accent);
  }

  .nav-next:active:not(:disabled) {
    transform: scale(0.97);
  }

  .nav-next--disabled {
    opacity: 0.25;
    cursor: not-allowed;
    border-color: color-mix(in oklab, var(--color-text-muted) 20%, transparent);
  }

  /* ══════════════════════════════════════════
     Results Dashboard
     ══════════════════════════════════════════ */

  .results-dashboard {
    /* Entrance handled by motion library in $effect */
  }

  /* ── Hero header ── */
  .results-header {
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
  }

  .results-tag {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    display: block;
    margin-bottom: 0.75rem;
  }

  .results-hero-number {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: var(--weight-regular);
    line-height: 1;
    color: var(--color-text);
    letter-spacing: -0.03em;
    margin: 0 0 0.35rem;
  }

  .results-hero-period {
    font-size: 0.45em;
    color: var(--color-text-muted);
    letter-spacing: 0;
    vertical-align: baseline;
    margin-left: 0.1em;
  }

  .results-hero-context {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    line-height: 1.35;
    margin: 0;
  }

  /* ── Summary insight ── */
  .results-insight {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.65;
    margin: 0 0 clamp(2.5rem, 5vw, 3.5rem);
    padding: 1rem 0;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .results-insight strong {
    color: var(--color-text);
    font-weight: var(--weight-medium);
  }

  .insight-health--warning { color: var(--color-accent-rust); }
  .insight-health--healthy { color: var(--color-accent-teal); }
  .insight-health--strong { color: var(--color-accent); }

  /* ── Section pattern ── */
  .results-section {
    margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
    padding-bottom: clamp(2rem, 4vw, 3rem);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .results-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .results-section:nth-child(odd) {
    margin-bottom: clamp(2rem, 4vw, 2.75rem);
  }

  .results-section:nth-child(even) {
    margin-bottom: clamp(2.75rem, 5.5vw, 3.75rem);
  }

  .results-section-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1.25rem;
  }

  .results-section-number {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: var(--text-md);
    line-height: 1;
    color: var(--color-accent-teal);
  }

  .results-section-heading {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* ── Funnel ── */
  .results-funnel {
    display: flex;
    flex-direction: column;
  }

  .funnel-stage {
    position: relative;
  }

  .funnel-stage-bar {
    height: 6px;
    border-radius: 3px;
    margin-bottom: 0.65rem;
    transition: width var(--duration-slow) var(--ease-out-expo);
    min-width: 6px;
  }

  .funnel-bar--leads { background: var(--color-accent-teal); }
  .funnel-bar--sqls { background: var(--color-accent-amber); }
  .funnel-bar--opps { background: var(--color-accent); }
  .funnel-bar--deals { background: var(--color-accent-rust); }

  .funnel-stage-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .funnel-count {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text);
    line-height: 1.1;
    letter-spacing: var(--tracking-tight);
    flex-shrink: 0;
  }

  .funnel-detail {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-top: 0.2em;
  }

  .funnel-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-muted);
    line-height: 1.2;
  }

  .funnel-breakdown {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: color-mix(in oklab, var(--color-text-muted) 65%, transparent);
    letter-spacing: 0.02em;
  }

  /* ── Funnel connectors ── */
  .funnel-connector {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0 0.55rem 0.1rem;
  }

  .funnel-connector-line {
    width: 16px;
    height: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 25%, transparent);
  }

  .funnel-rate {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: color-mix(in oklab, var(--color-text-muted) 70%, transparent);
    letter-spacing: 0.04em;
  }

  /* ── Budget hero layout ── */
  .results-budget-hero {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .budget-primary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: clamp(1rem, 2vw, 1.25rem);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .budget-primary-value {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-text);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .budget-primary-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .budget-supporting {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1.25rem, 2.5vw, 2rem);
  }

  @media (max-width: 640px) {
    .budget-supporting {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
  }

  /* ── Metrics row (unit economics) ── */
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
  .results-metric-value--spend-warning { color: var(--color-accent-rust); }
  .results-metric-value--spend-moderate { color: var(--color-accent-amber); }
  .results-metric-value--spend-efficient { color: var(--color-accent-teal); }

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

  /* ── Pipeline ── */
  .pipeline-hero {
    margin-bottom: clamp(1rem, 2vw, 1.5rem);
  }

  .pipeline-coverage {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: clamp(1rem, 2vw, 1.25rem);
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
  }

  .pipeline-coverage-value {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-text);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .pipeline-coverage-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .pipeline-timeline {
    display: flex;
    align-items: stretch;
    gap: clamp(1.25rem, 2.5vw, 2rem);
  }

  .pipeline-timeline-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .pipeline-timeline-divider {
    width: 1px;
    background: color-mix(in oklab, var(--color-text-muted) 15%, transparent);
  }

  .pipeline-timeline-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text);
    line-height: 1.1;
  }

  .pipeline-timeline-label {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.45;
  }

  @media (max-width: 640px) {
    .pipeline-timeline {
      flex-direction: column;
    }
    .pipeline-timeline-divider {
      width: 100%;
      height: 1px;
    }
  }

  /* ── CTA (between content and actions) ── */
  .results-cta {
    margin-bottom: clamp(2rem, 4vw, 3rem);
    padding: clamp(1.25rem, 2.5vw, 1.75rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .results-cta-text {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.35;
    margin: 0;
  }

  .results-cta-link {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    padding: 0.6rem 1.25rem;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent);
    transition: border-color var(--duration-fast) var(--ease-out-expo),
                color var(--duration-fast) var(--ease-out-expo);
  }

  .results-cta-link:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .results-cta-arrow {
    display: inline-block;
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }

  .results-cta-link:hover .results-cta-arrow {
    transform: translateX(3px);
  }

  @media (max-width: 640px) {
    .results-cta {
      flex-direction: column;
      align-items: flex-start;
    }
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
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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

  /* ── Email confirmation indicator ── */
  .results-email-sent {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent-teal);
    padding: 0.5rem 0.75rem;
    border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent);
    border-radius: var(--radius-sm);
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .results-email-sent svg {
    flex-shrink: 0;
    opacity: 0.6;
  }

  /* ══════════════════════════════════════════
     Lead Capture Form
     ══════════════════════════════════════════ */

  .lead-capture {
    display: flex;
    flex-direction: column;
  }

  .lead-content {
    margin-bottom: clamp(1.5rem, 3vw, 2rem);
  }

  .lead-heading {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--weight-regular);
    line-height: 1.2;
    color: var(--color-text);
    letter-spacing: var(--tracking-tight);
    margin: 0 0 0.35rem;
  }

  .lead-subheading {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.4;
    margin: 0 0 clamp(1.25rem, 2.5vw, 1.5rem);
  }

  .lead-teaser {
    padding: 1rem 1.25rem;
    margin-bottom: clamp(1.25rem, 2.5vw, 1.5rem);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    background: color-mix(in oklab, var(--color-text-muted) 4%, transparent);
  }

  .lead-teaser-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }

  .lead-teaser-lock {
    color: var(--color-accent);
    flex-shrink: 0;
  }

  .lead-teaser-title {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--color-text-muted);
  }

  .lead-teaser-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .lead-teaser-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .lead-teaser-row:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .lead-teaser-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .lead-teaser-redacted {
    display: inline-block;
    height: 0.625rem;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      color-mix(in oklab, var(--color-accent) 15%, transparent),
      color-mix(in oklab, var(--color-accent) 8%, transparent)
    );
    animation: shimmer 2s ease-in-out infinite alternate;
  }

  @keyframes shimmer {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  .lead-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .lead-field {
    position: relative;
  }

  .lead-input {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    color: var(--color-text);
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    padding: 0.25rem 0;
    line-height: 1;
  }

  .lead-input::placeholder {
    color: color-mix(in oklab, var(--color-text-muted) 40%, transparent);
  }

  .lead-input:focus::placeholder {
    opacity: 0.4;
  }

  .lead-input-line {
    height: 2px;
    background: color-mix(in oklab, var(--color-text-muted) 25%, transparent);
    position: relative;
    overflow: hidden;
    transition: background var(--duration-fast) var(--ease-out-expo);
  }

  .lead-input-line::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: var(--color-accent);
    transition: width var(--duration-normal) var(--ease-out-expo);
  }

  .lead-input:focus + .lead-input-line::after {
    width: 100%;
  }

  /* ── Consent checkbox ── */
  .lead-consent {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
    margin-bottom: 1.5rem;
    user-select: none;
  }

  .lead-checkbox {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border: 1.5px solid color-mix(in oklab, var(--color-text-muted) 30%, transparent);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    transition: border-color var(--duration-fast) var(--ease-out-expo),
                background var(--duration-fast) var(--ease-out-expo);
  }

  .lead-consent:hover .lead-checkbox:not(.lead-checkbox--checked) {
    border-color: color-mix(in oklab, var(--color-text-muted) 55%, transparent);
  }

  .lead-checkbox--checked {
    border-color: var(--color-accent-teal);
    background: var(--color-accent-teal);
  }

  .lead-checkbox--checked svg {
    color: var(--color-bg);
  }

  .lead-checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .lead-consent-text {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .lead-consent-link {
    color: var(--color-text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color var(--duration-fast) var(--ease-out-expo);
  }

  .lead-consent-link:hover {
    color: var(--color-text);
  }

  /* ── Lead error ── */
  .lead-error {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-accent-rust);
    margin: 0 0 1rem;
  }

  /* ── Lead form nav (mirrors .wizard-nav) ── */
  .lead-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* ── Loading dots ── */
  .lead-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .lead-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-text);
    animation: leadDotPulse 1.2s var(--ease-in-out-smooth) infinite;
  }

  .lead-dot:nth-child(2) {
    animation-delay: 0.15s;
  }

  .lead-dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes leadDotPulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 1; }
  }

  /* prefers-reduced-motion handled in JS for results entrance */
</style>
