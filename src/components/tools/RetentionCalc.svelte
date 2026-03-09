<script>
  import { onMount, tick } from 'svelte';
  import { animate, stagger } from 'motion';
  import {
    fmtCurrency, fmtNum, fmtPercent, formatWithCommas,
    parseRawNumber, abbreviateTarget, roundToNearest5,
    calculateRetentionResults,
  } from './retention-calc-utils.js';

  const relatedTools = [
    {
      title: 'GTM Budget Planner',
      description: 'Reverse-engineer your entire funnel from revenue target to daily activity.',
      href: '/tools/gtm-planner',
    },
  ];

  /* ── Wizard state ── */
  let currentStep = $state(1);
  let direction = $state(1);

  /* ── Inputs ── */
  let arr = $state(null);
  let customers = $state(null);
  let monthlyChurnRate = $state(5);
  let arpc = $state(null);
  let arpcOverride = $state(false);
  let expansionRate = $state(0.5);
  let grossMargin = $state(70);
  let marketingSpend = $state(null);
  let newCustomersMonth = $state(null);

  /* ── Lead capture ── */
  let showLeadCapture = $state(false);
  let showResults = $state(false);
  let leadName = $state('');
  let leadEmail = $state('');
  let leadCompany = $state('');
  let leadConsent = $state(false);
  let leadSubmitting = $state(false);
  let leadError = $state('');
  let leadSuccess = $state(false);
  let leadAttempts = $state(0);

  /* ── Results interaction ── */
  let improvementPoints = $state(2);
  let pdfGenerating = $state(false);
  let copied = $state(false);

  /* ── UI ── */
  let inputFocused = $state(false);
  let inputInvalid = $state(false);
  let showHowItWorks = $state(false);

  /* ── Derived ── */
  let autoArpc = $derived(arr && customers ? arr / customers / 12 : null);
  let effectiveArpc = $derived(arpcOverride ? arpc : autoArpc);

  let steps = $derived.by(() => [
    { id: 'arr', category: 'Revenue', label: 'What\'s your current annual recurring revenue?', field: 'currency' },
    { id: 'customers', category: 'Revenue', label: 'How many active customers do you have?', field: 'number' },
    { id: 'churn', category: 'Retention', label: 'What percentage of customers do you lose each month?', field: 'percent', default: 5, benchmark: 'SMB average: 4-7%' },
    { id: 'arpc', category: 'Retention', label: `That puts your average customer at ${fmtCurrency(roundToNearest5(autoArpc || 0))}/month. Does that feel right?`, field: 'arpc-confirm' },
    { id: 'expansion', category: 'Retention', label: 'What percentage of existing revenue comes from upsells/expansions each month?', field: 'percent-decimal', default: 0.5, benchmark: 'Top performers: 2-3%/month, most SMBs: 0-1%' },
    { id: 'margin', category: 'Economics', label: 'What\'s your gross margin?', field: 'percent', default: 70, benchmark: 'Industry benchmark: 70-80%' },
    { id: 'marketing', category: 'Acquisition', label: 'How much do you spend per month acquiring new customers?', field: 'currency' },
    { id: 'new-customers', category: 'Acquisition', label: 'How many new customers do you add per month?', field: 'number' },
  ]);

  let totalSteps = $derived(steps.length);

  let canCalculate = $derived(
    arr > 0 && customers > 0 && effectiveArpc > 0
  );

  let results = $derived.by(() => {
    if (!canCalculate) return null;
    return calculateRetentionResults({
      arr, customers, monthlyChurnRate,
      arpc: effectiveArpc,
      expansionRate, grossMargin,
      marketingSpend: marketingSpend ?? 0,
      newCustomersMonth: newCustomersMonth ?? 0,
      improvementPoints,
    });
  });

  let leadFormValid = $derived(
    leadName.trim().length > 0 &&
    leadEmail.trim().length > 0 &&
    leadEmail.includes('@') &&
    leadCompany.trim().length > 0 &&
    leadConsent
  );

  // Slider options: gray out values that push improved churn below 0.5%
  let sliderOptions = $derived.by(() => {
    const options = [1, 2, 3, 5];
    return options.map(pts => ({
      value: pts,
      disabled: (monthlyChurnRate - pts) < 0.5,
    }));
  });

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
    arr = null;
    customers = null;
    monthlyChurnRate = 5;
    arpc = null;
    arpcOverride = false;
    expansionRate = 0.5;
    grossMargin = 70;
    marketingSpend = null;
    newCustomersMonth = null;
    currentStep = 1;
    showResults = false;
    showLeadCapture = false;
    leadName = '';
    leadEmail = '';
    leadCompany = '';
    leadConsent = false;
    leadSubmitting = false;
    leadError = '';
    leadSuccess = false;
    leadAttempts = 0;
    improvementPoints = 2;
    pdfGenerating = false;
    showHowItWorks = false;
    direction = 1;
    copied = false;
  }

  function skipToResults() {
    showLeadCapture = false;
    showResults = true;
    animateResults();
  }

  async function submitLead() {
    if (!leadFormValid || leadSubmitting) return;
    leadSubmitting = true;
    leadError = '';

    try {
      const res = await fetch('/api/retention-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          company: leadCompany.trim(),
          inputs: {
            arr, customers, monthlyChurnRate,
            arpc: effectiveArpc,
            expansionRate, grossMargin,
            marketingSpend: marketingSpend ?? 0,
            newCustomersMonth: newCustomersMonth ?? 0,
          },
          results,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      leadSuccess = true;
      showLeadCapture = false;
      showResults = true;
      animateResults();
    } catch (err) {
      leadAttempts++;
      leadError = err instanceof Error ? err.message : 'Something went wrong';
    } finally {
      leadSubmitting = false;
    }
  }

  /* ── Get/set current step value ── */
  function getValue(stepIndex) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'arr': return arr;
      case 'customers': return customers;
      case 'churn': return monthlyChurnRate;
      case 'expansion': return expansionRate;
      case 'margin': return grossMargin;
      case 'marketing': return marketingSpend;
      case 'new-customers': return newCustomersMonth;
    }
  }

  function setValue(stepIndex, val) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'arr': arr = val; break;
      case 'customers': customers = val; break;
      case 'churn': monthlyChurnRate = val; break;
      case 'expansion': expansionRate = val; break;
      case 'margin': grossMargin = val; break;
      case 'marketing': marketingSpend = val; break;
      case 'new-customers': newCustomersMonth = val; break;
    }
  }

  /* ── Input handlers ── */
  function handleNumericInput(e, stepIndex) {
    const val = parseRawNumber(e.target.value);
    setValue(stepIndex, val);
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

  /* ── Step validity ── */
  let currentStepValid = $derived.by(() => {
    const step = steps[currentStep - 1];
    if (step.field === 'currency') {
      let val;
      switch (step.id) {
        case 'arr': val = arr; break;
        case 'marketing': val = marketingSpend; break;
      }
      return val != null && val > 0;
    }
    if (step.field === 'number') {
      let val;
      switch (step.id) {
        case 'customers': val = customers; break;
        case 'new-customers': val = newCustomersMonth; break;
      }
      return val != null && val > 0;
    }
    if (step.field === 'arpc-confirm') return true;
    return true;
  });

  /* ── Keyboard navigation ── */
  function handleKeydown(e) {
    if (e.key === 'Enter' && currentStepValid) {
      e.preventDefault();
      next();
    }
  }

  /* ── Animations ── */
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

  function animateLeadCapture() {
    tick().then(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const form = document.querySelector('.lead-capture');
      if (!form) return;
      const header = form.querySelector('.lead-heading');
      if (header) {
        animate(header, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
      }
      const fields = form.querySelectorAll('.lead-field');
      if (fields.length) {
        animate(fields, { opacity: [0, 1], y: [12, 0] }, { duration: 0.35, delay: stagger(0.06, { start: 0.1 }), easing: [0.16, 1, 0.3, 1] });
      }
      const actions = form.querySelector('.lead-actions');
      if (actions) {
        animate(actions, { opacity: [0, 1] }, { duration: 0.4, delay: 0.35, easing: [0.16, 1, 0.3, 1] });
      }
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
      if (header) animate(header, { opacity: [0, 1], y: [20, 0] }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });

      const insight = dashboard.querySelector('.results-insight');
      if (insight) animate(insight, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, delay: 0.12, easing: [0.16, 1, 0.3, 1] });

      const sections = dashboard.querySelectorAll('.results-section');
      if (sections.length) animate(sections, { opacity: [0, 1], y: [20, 0] }, { duration: 0.4, delay: stagger(0.08, { start: 0.2 }), easing: [0.16, 1, 0.3, 1] });

      const cta = dashboard.querySelector('.results-cta');
      if (cta) animate(cta, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, delay: 0.6, easing: [0.16, 1, 0.3, 1] });

      const actions = dashboard.querySelector('.results-actions');
      if (actions) animate(actions, { opacity: [0, 1] }, { duration: 0.4, delay: 0.7, easing: [0.16, 1, 0.3, 1] });
    });
  }

  /* ── SVG Chart helpers ── */
  function buildChartPath(data, key, chartW, chartH, yMin, yMax, padTop, padBot, padLeft = 0) {
    return data.map((d, i) => {
      const x = padLeft + (i / 36) * chartW;
      const y = padTop + chartH - ((d[key] - yMin) / (yMax - yMin)) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  /* ── Clipboard ── */
  async function copyResults() {
    if (!results) return;
    const r = results;
    const grrLabel = r.grrHealth === 'critical' ? 'Critical' : r.grrHealth === 'needs_work' ? 'Needs Work' : 'Healthy';
    const nrrLabel = r.nrrHealth === 'contraction' ? 'Contraction' : r.nrrHealth === 'stable' ? 'Stable' : r.nrrHealth === 'healthy' ? 'Healthy' : 'Elite';

    const oneLiner = `Retention Report: ${fmtCurrency(arr)} ARR | ${monthlyChurnRate}% monthly churn | ${fmtCurrency(r.annualChurnRevenue)} lost annually | NRR ${fmtPercent(r.nrr)}`;
    const impLabel = `Reducing churn by ${r.effectiveImprovementPoints} points = ${fmtCurrency(r.revenueGap36)} more revenue over 3 years`;

    let full = `${oneLiner}\n${impLabel}\n\nCHURN TAX\nAnnual revenue lost: ${fmtCurrency(r.annualChurnRevenue)}`;
    if (r.replacementPercent != null) full += `\nMarketing spend on replacement: ${fmtPercent(r.replacementPercent)} (${fmtCurrency(r.replacementCostYear)}/yr)`;
    full += `\nNet new monthly revenue: ${fmtCurrency(r.netNewRevenueMonth)}`;
    full += `\n\nRETENTION SCORES\nGRR: ${fmtPercent(r.grr)} (${grrLabel})\nNRR: ${fmtPercent(r.nrr)} (${nrrLabel})`;
    full += `\n\nIMPROVEMENT SCENARIO (${r.effectiveImprovementPoints}-point reduction)\nCurrent 36-month ARR: ${fmtCurrency(r.projectedArr36Current)}\nImproved 36-month ARR: ${fmtCurrency(r.projectedArr36Improved)}\nRevenue gap: ${fmtCurrency(r.revenueGap36)}`;

    full += '\n\nUNIT ECONOMICS';
    if (r.cac != null) full += `\nStated CAC: ${fmtCurrency(r.cac)}`;
    if (r.effectiveCac != null) full += ` | Effective CAC: ${fmtCurrency(r.effectiveCac)}`;
    full += `\nCurrent LTV: ${fmtCurrency(r.ltv)} | Improved LTV: ${fmtCurrency(r.improvedLtv)}`;
    if (r.ltvCacRatio != null) full += `\nLTV:CAC: ${fmtNum(r.ltvCacRatio, 1)}:1 -> ${r.improvedLtvCacRatio != null ? fmtNum(r.improvedLtvCacRatio, 1) + ':1' : 'N/A'}`;

    full += '\n\nGenerated with devin.vc/tools/retention-calculator';

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

      const bg = [10, 10, 8];
      const elevated = [20, 18, 16];
      const text = [237, 232, 223];
      const muted = [160, 148, 136];
      const dim = [140, 124, 106];
      const accent = [196, 164, 124];
      const teal = [91, 163, 163];
      const rust = [176, 106, 82];
      const amber = [196, 154, 60];
      const border = [50, 44, 36];

      doc.setFillColor(...bg);
      doc.rect(0, 0, W, H, 'F');

      const mx = 20;
      const cw = W - 2 * mx;

      // Zone 1: Header
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('RETENTION REPORT', mx, 22);

      doc.setFontSize(18);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...text);
      doc.text(leadCompany.trim() || 'Your Company', mx, 30);

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text(`${fmtCurrency(arr)} ARR  ·  ${monthlyChurnRate}% monthly churn`, mx, 37);

      doc.setFontSize(9);
      doc.setTextColor(...dim);
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(today, mx, 43);

      doc.setDrawColor(...border);
      doc.setLineWidth(0.3);
      doc.line(mx, 47, W - mx, 47);

      let y = 54;

      // Zone 2: Churn Tax
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('CHURN TAX', mx, y);
      y += 7;

      const churnItems = [
        { label: 'Annual Revenue Lost', value: fmtCurrency(r.annualChurnRevenue), color: rust },
        { label: 'Net New Monthly Revenue', value: fmtCurrency(r.netNewRevenueMonth), color: r.netNewRevenueHealth === 'shrinking' ? rust : teal },
      ];
      if (r.replacementPercent != null) {
        churnItems.splice(1, 0, { label: 'Marketing on Replacement', value: fmtPercent(r.replacementPercent), color: amber });
      }

      churnItems.forEach((item, i) => {
        const iy = y + i * 10;
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(item.label, mx, iy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...item.color);
        doc.text(item.value, mx, iy + 5);
      });

      y += churnItems.length * 10 + 6;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // Zone 3: Retention Scores + Improvement
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('RETENTION SCORES', mx, y);
      doc.text('IMPROVEMENT SCENARIO', mx + cw * 0.5, y);
      y += 7;

      const grrColor = r.grrHealth === 'critical' ? rust : r.grrHealth === 'needs_work' ? amber : teal;
      const nrrColor = r.nrrHealth === 'contraction' ? rust : r.nrrHealth === 'stable' ? amber : r.nrrHealth === 'healthy' ? teal : accent;

      // Left: GRR + NRR
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('GRR', mx, y);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...grrColor);
      doc.text(fmtPercent(r.grr), mx, y + 6);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('NRR', mx, y + 14);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...nrrColor);
      doc.text(fmtPercent(r.nrr), mx, y + 20);

      // Right: Improvement
      const rx = mx + cw * 0.5;
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('Current 36-Month ARR', rx, y);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...text);
      doc.text(fmtCurrency(r.projectedArr36Current), rx, y + 5);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text(`Improved 36-Month ARR (${r.effectiveImprovementPoints}pt)`, rx, y + 12);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...teal);
      doc.text(fmtCurrency(r.projectedArr36Improved), rx, y + 17);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('Revenue Gap', rx, y + 24);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...accent);
      doc.text(fmtCurrency(r.revenueGap36), rx, y + 29);

      y += 38;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // Zone 4: Unit Economics
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('UNIT ECONOMICS', mx, y);
      y += 7;

      const econItems = [];
      if (r.cac != null && !r.netCustomersShrinking) {
        econItems.push({ label: 'Stated CAC', value: fmtCurrency(r.cac), color: text });
        if (r.effectiveCac != null) econItems.push({ label: 'Effective CAC', value: fmtCurrency(r.effectiveCac), color: rust });
      }
      econItems.push({ label: 'Current LTV', value: fmtCurrency(r.ltv), color: text });
      econItems.push({ label: 'Improved LTV', value: fmtCurrency(r.improvedLtv), color: teal });
      if (r.ltvCacRatio != null) {
        const ltvColor = r.ltvCacHealth === 'warning' ? rust : r.ltvCacHealth === 'strong' ? teal : accent;
        econItems.push({ label: 'LTV:CAC', value: `${fmtNum(r.ltvCacRatio, 1)}:1`, color: ltvColor });
        if (r.improvedLtvCacRatio != null) econItems.push({ label: 'Improved LTV:CAC', value: `${fmtNum(r.improvedLtvCacRatio, 1)}:1`, color: teal });
      }

      // Render in two columns
      const colW = cw * 0.45;
      econItems.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ix = mx + col * colW;
        const iy = y + row * 12;
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(item.label, ix, iy);
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...item.color);
        doc.text(item.value, ix, iy + 5);
      });

      y += Math.ceil(econItems.length / 2) * 12 + 6;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // Zone 5: Glossary
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('GLOSSARY', mx, y);
      y += 6;

      const glossary = [
        ['GRR', 'Gross Revenue Retention. % of existing revenue retained over 12 months, excluding expansion.'],
        ['NRR', 'Net Revenue Retention. % of existing revenue retained plus expansion over 12 months. Above 100% = growth engine.'],
        ['Effective CAC', 'True cost per net-new customer after churn replacement. Often 2-3x stated CAC.'],
        ['LTV', 'Customer Lifetime Value. Total gross profit from an average customer over their lifespan.'],
        ['Churn Tax', 'The portion of marketing spend replacing lost customers rather than growing.'],
      ];

      glossary.forEach(([term, def]) => {
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...accent);
        doc.text(term, mx, y);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...dim);
        const lines = doc.splitTextToSize(def, cw - 28);
        doc.text(lines, mx + 28, y);
        y += lines.length * 3.2 + 2;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('devin.vc', mx, H - 12);
      doc.text('Generated with Retention Revenue Calculator', W - mx, H - 12, { align: 'right' });

      const dateStr = new Date().toISOString().split('T')[0];
      const shortArr = abbreviateTarget(arr);
      doc.save(`retention-report-${shortArr}-${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      pdfGenerating = false;
    }
  }

  // ARPC confirm step helpers
  function confirmArpc() {
    direction = 1;
    currentStep++;
  }

  function overrideArpc() {
    arpcOverride = true;
  }

  function handleArpcInput(e) {
    const val = parseRawNumber(e.target.value);
    arpc = val;
    inputInvalid = e.target.value.trim().length > 0 && val === null;
  }

  function handleArpcBlur(e) {
    inputFocused = false;
    arpc = parseRawNumber(e.target.value);
    inputInvalid = false;
  }

  function handleArpcFocus(e) {
    inputFocused = true;
    inputInvalid = false;
    e.target.value = arpc ?? '';
  }
</script>

{#if showResults && results}
  {@const r = results}
  <div class="results-dashboard">
    <!-- Hero header -->
    <header class="results-header">
      <span class="results-tag">Your Retention Report</span>
      <p class="results-hero-number">{fmtCurrency(r.annualChurnRevenue)}<span class="results-hero-period">/yr lost</span></p>
      <p class="results-hero-context">at {monthlyChurnRate}% monthly churn on {fmtCurrency(arr)} ARR</p>
    </header>

    {#if leadSuccess && leadEmail}
      <div class="results-email-sent">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
        <span>A copy is on its way to {leadEmail.trim()}</span>
      </div>
    {/if}

    <!-- Summary insight -->
    <p class="results-insight">
      You're losing <strong class="insight-health--rust">{fmtCurrency(r.annualChurnRevenue)}</strong> per year to churn.
      {#if r.replacementPercent != null}
        {fmtPercent(r.replacementPercent)} of your marketing budget ({fmtCurrency(r.replacementCostYear)}/yr) just replaces those lost customers before you can grow.
      {/if}
      Reducing churn by {r.effectiveImprovementPoints} points would unlock <strong class="insight-health--teal">{fmtCurrency(r.revenueGap36)}</strong> in additional revenue over 3 years.
    </p>

    <!-- Section 1: Churn Tax -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">01</span>
        <h2 class="results-section-heading">The Churn Tax</h2>
      </div>

      <div class="results-metrics-row results-metrics-row--hero">
        <div class="results-metric">
          <span class="results-metric-value results-metric-value--rust">{fmtCurrency(r.annualChurnRevenue)}</span>
          <span class="results-metric-label">Annual revenue lost to churn</span>
        </div>

        {#if !r.zeroMarketingFlag && r.replacementPercent != null}
          <div class="results-metric">
            <span class="results-metric-value results-metric-value--amber">{fmtPercent(r.replacementPercent)}</span>
            <span class="results-metric-label">Of marketing spend on replacement</span>
          </div>
        {/if}

        <div class="results-metric">
          <span class="results-metric-value" class:results-metric-value--teal={r.netNewRevenueHealth === 'growing'} class:results-metric-value--rust={r.netNewRevenueHealth === 'shrinking'}>{fmtCurrency(r.netNewRevenueMonth)}</span>
          <span class="results-metric-label">Net new monthly revenue</span>
        </div>
      </div>

      {#if r.zeroMarketingFlag}
        <div class="results-note">
          Without acquisition spend data, we can't calculate your replacement cost. But at your current churn rate, you need to add {fmtNum(r.churnedCustomersMonth, 0)} customers per month just to maintain current revenue.
        </div>
      {/if}
    </section>

    <!-- Section 2: Retention Scores -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">02</span>
        <h2 class="results-section-heading">Retention Scores</h2>
      </div>

      <div class="results-scores">
        <div class="score-card">
          <span class="score-value score-value--{r.grrHealth}">{fmtPercent(r.grr)}</span>
          <span class="score-label">GRR</span>
          <span class="score-badge score-badge--{r.grrHealth}">
            {r.grrHealth === 'critical' ? 'Critical' : r.grrHealth === 'needs_work' ? 'Needs work' : 'Healthy'}
          </span>
        </div>
        <div class="score-card">
          <span class="score-value score-value--{r.nrrHealth}">{fmtPercent(r.nrr)}</span>
          <span class="score-label">NRR</span>
          <span class="score-badge score-badge--{r.nrrHealth}">
            {r.nrrHealth === 'contraction' ? 'Contraction' : r.nrrHealth === 'stable' ? 'Stable' : r.nrrHealth === 'healthy' ? 'Healthy' : 'Elite'}
          </span>
        </div>
      </div>
    </section>

    <!-- Section 3: Improvement Scenario -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">03</span>
        <h2 class="results-section-heading">Improvement Scenario</h2>
      </div>

      <div class="improvement-slider">
        <span class="improvement-slider-label">Churn reduction</span>
        <div class="improvement-options">
          {#each sliderOptions as opt (opt.value)}
            <button
              type="button"
              class="improvement-option"
              class:improvement-option--active={improvementPoints === opt.value}
              class:improvement-option--disabled={opt.disabled}
              disabled={opt.disabled}
              onclick={(e) => { e.stopPropagation(); improvementPoints = opt.value; }}
            >
              {opt.value}pt
            </button>
          {/each}
        </div>
      </div>

      <div class="improvement-comparison">
        <div class="improvement-col">
          <span class="improvement-col-heading">Current Path</span>
          <div class="improvement-stat">
            <span class="improvement-stat-value">{fmtCurrency(r.projectedArr12Current)}</span>
            <span class="improvement-stat-label">12-month ARR</span>
          </div>
          <div class="improvement-stat">
            <span class="improvement-stat-value">{fmtCurrency(r.projectedArr36Current)}</span>
            <span class="improvement-stat-label">36-month ARR</span>
          </div>
        </div>
        <div class="improvement-col improvement-col--improved">
          <span class="improvement-col-heading">With {r.effectiveImprovementPoints}-Point Improvement</span>
          <div class="improvement-stat">
            <span class="improvement-stat-value improvement-stat-value--teal">{fmtCurrency(r.projectedArr12Improved)}</span>
            <span class="improvement-stat-label">12-month ARR</span>
          </div>
          <div class="improvement-stat">
            <span class="improvement-stat-value improvement-stat-value--teal">{fmtCurrency(r.projectedArr36Improved)}</span>
            <span class="improvement-stat-label">36-month ARR</span>
          </div>
        </div>
      </div>

      <div class="improvement-gap">
        <span class="improvement-gap-value">{fmtCurrency(r.revenueGap36)}</span>
        <span class="improvement-gap-label">Revenue gap over 3 years</span>
      </div>

      {#if r.acquisitionCostToMatch != null}
        <p class="improvement-cost-note">To match through acquisition alone, you'd spend {fmtCurrency(r.acquisitionCostToMatch)} over 3 years.</p>
      {/if}

      <!-- SVG Trajectory Chart -->
      {#if r.trajectoryData?.length}
        {@const data = r.trajectoryData}
        {@const allVals = data.flatMap(d => [d.currentArr, d.improvedArr, d.acquisitionArr])}
        {@const yMin = Math.min(...allVals) * 0.95}
        {@const yMax = Math.max(...allVals) * 1.05}
        {@const vW = 640}
        {@const vH = 280}
        {@const padL = 16}
        {@const padR = 16}
        {@const padT = 24}
        {@const padB = 40}
        {@const chartW = vW - padL - padR}
        {@const chartH = vH - padT - padB}

        <div class="chart-container">
          <svg viewBox="0 0 {vW} {vH}" class="trajectory-chart">
            <!-- Grid lines -->
            {#each [0, 12, 24, 36] as m}
              {@const x = padL + (m / 36) * chartW}
              <line x1={x} y1={padT} x2={x} y2={padT + chartH} stroke="var(--color-text-muted)" stroke-opacity="0.08" stroke-width="1" />
              <text x={x} y={padT + chartH + 20} fill="var(--color-text-muted)" font-size="11" text-anchor="middle" font-family="DM Sans, sans-serif" opacity="0.6">{m} mo</text>
            {/each}

            <!-- Y-axis labels -->
            {#each [0, 0.5, 1] as frac}
              {@const yVal = yMin + (yMax - yMin) * (1 - frac)}
              {@const y = padT + chartH * frac}
              <text x={padL - 4} y={y + 4} fill="var(--color-text-muted)" font-size="9" text-anchor="end" font-family="DM Sans, sans-serif" opacity="0.4">{fmtCurrency(yVal)}</text>
            {/each}

            <!-- Current path (muted) -->
            <polyline
              points={buildChartPath(data, 'currentArr', chartW, chartH, yMin, yMax, padT, 0, padL)}
              fill="none"
              stroke="var(--color-text-muted)"
              stroke-width="2"
              stroke-opacity="0.35"
              class="chart-line chart-line--current"
            />

            <!-- Acquisition-only path (amber dashed) -->
            <polyline
              points={buildChartPath(data, 'acquisitionArr', chartW, chartH, yMin, yMax, padT, 0, padL)}
              fill="none"
              stroke="var(--color-accent-amber)"
              stroke-width="1.5"
              stroke-opacity="0.6"
              stroke-dasharray="6 4"
              class="chart-line chart-line--acquisition"
            />

            <!-- Improved path (teal, prominent) -->
            <polyline
              points={buildChartPath(data, 'improvedArr', chartW, chartH, yMin, yMax, padT, 0, padL)}
              fill="none"
              stroke="var(--color-accent-teal)"
              stroke-width="2.5"
              class="chart-line chart-line--improved"
            />

            <!-- Cost annotation below acquisition line end -->
            {#if r.cumulativeExtraAcquisitionCost > 0}
              {@const acqEndY = padT + chartH - ((data[36].acquisitionArr - yMin) / (yMax - yMin)) * chartH}
              <text x={padL + chartW} y={Math.min(acqEndY + 16, padT + chartH - 4)} fill="var(--color-accent-amber)" font-size="9" text-anchor="end" font-family="DM Sans, sans-serif" opacity="0.7">
                +{fmtCurrency(r.cumulativeExtraAcquisitionCost)} in extra spend
              </text>
            {/if}
          </svg>

          <div class="chart-legend">
            <span class="chart-legend-item"><span class="chart-dot chart-dot--current"></span> Current</span>
            <span class="chart-legend-item"><span class="chart-dot chart-dot--improved"></span> Improved</span>
            <span class="chart-legend-item"><span class="chart-dot chart-dot--acquisition"></span> Acquisition-only</span>
          </div>
        </div>
      {/if}
    </section>

    <!-- Section 4: Unit Economics -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">04</span>
        <h2 class="results-section-heading">Unit Economics Impact</h2>
      </div>

      <div class="results-metrics-row">
        {#if r.cac != null && !r.netCustomersShrinking}
          <div class="results-metric">
            <span class="results-metric-value">{fmtCurrency(r.cac)}</span>
            <span class="results-metric-label">Stated CAC</span>
          </div>
          {#if r.effectiveCac != null}
            <div class="results-metric">
              <span class="results-metric-value results-metric-value--rust">{fmtCurrency(r.effectiveCac)}</span>
              <span class="results-metric-label">Effective CAC</span>
            </div>
          {/if}
        {/if}

        <div class="results-metric">
          <span class="results-metric-value">{fmtCurrency(r.ltv)}</span>
          <span class="results-metric-label">Current LTV</span>
        </div>
        <div class="results-metric">
          <span class="results-metric-value results-metric-value--teal">{fmtCurrency(r.improvedLtv)}</span>
          <span class="results-metric-label">Improved LTV</span>
        </div>

        {#if r.ltvCacRatio != null}
          <div class="results-metric">
            <span class="results-metric-value" class:results-metric-value--warning={r.ltvCacHealth === 'warning'} class:results-metric-value--teal={r.ltvCacHealth === 'healthy'} class:results-metric-value--accent={r.ltvCacHealth === 'strong'}>{fmtNum(r.ltvCacRatio, 1)}:1</span>
            <span class="results-metric-label">Current LTV:CAC</span>
          </div>
          {#if r.improvedLtvCacRatio != null}
            <div class="results-metric">
              <span class="results-metric-value results-metric-value--teal">{fmtNum(r.improvedLtvCacRatio, 1)}:1</span>
              <span class="results-metric-label">Improved LTV:CAC</span>
            </div>
          {/if}
        {/if}
      </div>

      {#if r.netCustomersShrinking}
        <div class="results-callout results-callout--rust">
          You're losing more customers than you're acquiring. CAC isn't the relevant metric here. Stabilizing churn is.
        </div>
      {/if}
    </section>

    <!-- Edge case callouts -->
    {#if r.highChurnWarning}
      <div class="results-callout results-callout--rust">
        At this churn rate, your average customer lifespan is under 10 months. The priority here is product-market fit and customer success before scaling acquisition.
      </div>
    {/if}

    {#if r.eliteNrrFlag}
      <div class="results-callout results-callout--teal">
        Your expansion revenue is outpacing churn significantly. Your existing customer base is a growth engine. The question is whether you're investing enough in acquisition to feed it.
      </div>
    {/if}

    {#if r.zeroExpansionFlag && r.expansionGapNrr != null}
      <div class="results-note">
        You're not generating expansion revenue yet. Even modest upsell activity (1-2% monthly) would shift your NRR from {fmtPercent(r.nrr)} to {fmtPercent(r.expansionGapNrr)}.
      </div>
    {/if}

    <!-- CTA -->
    <div class="results-cta">
      <p class="results-cta-text">Need help turning these numbers into a retention strategy?</p>
      <a href="/contact" class="results-cta-link">Talk to Devin <span class="results-cta-arrow">&rarr;</span></a>
    </div>

    <!-- Actions -->
    <div class="results-actions-divider"></div>

    <div class="results-actions">
      <button type="button" class="results-copy" onclick={downloadPDF} disabled={pdfGenerating}>
        {#if pdfGenerating}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 1v3M6 8v3M1.5 6H4M8 6h2.5" opacity="0.4"/><path d="M2.8 2.8l1.8 1.8M7.4 7.4l1.8 1.8" opacity="0.6"/></svg>
          Generating...
        {:else}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 1v7M3 6l3 3 3-3"/><path d="M1 10h10"/></svg>
          Download PDF
        {/if}
      </button>
      <button type="button" class="results-copy" class:results-copy--copied={copied} onclick={copyResults}>
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

    <!-- Related tools -->
    {#if relatedTools.length}
      <div class="related-tools">
        <span class="related-tools-heading">Also on devin.vc</span>
        <div class="related-tools-grid">
          {#each relatedTools as tool}
            <a href={tool.href} class="related-tool-card">
              <span class="related-tool-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14L14 2M14 2H6M14 2v8"/></svg>
              </span>
              <span class="related-tool-title">{tool.title}</span>
              <span class="related-tool-desc">{tool.description}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>

{:else if showLeadCapture}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="lead-capture" onkeydown={(e) => { if (e.key === 'Enter' && leadFormValid && !leadSubmitting) submitLead(); }}>
    <header class="wizard-header">
      <span class="tag-label">Tools</span>
      <h1 class="wizard-title">Retention Revenue Calculator</h1>
      <p class="wizard-subtitle">See the real cost of customer churn.</p>
    </header>

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
      <h2 class="lead-heading">Your report is ready.</h2>
      <p class="lead-subheading">Enter your details to unlock your results. We'll email you a copy too.</p>

      {#if results}
        <div class="lead-teaser">
          <div class="lead-teaser-header">
            <svg class="lead-teaser-lock" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4 5.5V3.5a2 2 0 014 0V5.5"/></svg>
            <span class="lead-teaser-title">Your results preview</span>
          </div>
          <div class="lead-teaser-rows">
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Annual churn loss</span>
              <span class="lead-teaser-redacted" style="width: 5.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">NRR score</span>
              <span class="lead-teaser-redacted" style="width: 3.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">3-year revenue gap</span>
              <span class="lead-teaser-redacted" style="width: 4.5rem"></span>
            </div>
          </div>
        </div>
      {/if}

      <div class="lead-fields">
        <div class="lead-field">
          <input type="text" class="lead-input" placeholder="Name" bind:value={leadName} autocomplete="name" />
          <div class="lead-input-line"></div>
        </div>
        <div class="lead-field">
          <input type="email" class="lead-input" placeholder="Email" bind:value={leadEmail} autocomplete="email" />
          <div class="lead-input-line"></div>
        </div>
        <div class="lead-field">
          <input type="text" class="lead-input" placeholder="Company" bind:value={leadCompany} autocomplete="organization" />
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

      {#if leadAttempts >= 2}
        <button type="button" class="lead-skip" onclick={skipToResults}>
          Skip and view results
        </button>
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
          <span class="lead-dots"><span class="lead-dot"></span><span class="lead-dot"></span><span class="lead-dot"></span></span>
        {:else}
          Get Your Report
        {/if}
      </button>
    </nav>
  </div>

{:else}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="wizard" onkeydown={handleKeydown}>
    <header class="wizard-header">
      <span class="tag-label">Tools</span>
      <h1 class="wizard-title">Retention Revenue Calculator</h1>
      <p class="wizard-subtitle">See the real cost of customer churn.</p>

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

    <div id="how-it-works-panel" class="how-it-works-panel" class:how-it-works-panel--open={showHowItWorks} aria-hidden={!showHowItWorks}>
      <div class="how-it-works-inner">
        <p class="hiw-body">Enter your revenue, customer count, and churn rate. We'll calculate exactly how much revenue you're losing, what it costs to replace those customers, and how much a small churn reduction compounds over 3 years. No account required.</p>
        <div class="hiw-glossary">
          <h3 class="hiw-heading">Jargon decoder</h3>
          <dl class="hiw-defs">
            <div class="hiw-def"><dt>GRR</dt><dd>Gross Revenue Retention. How much existing revenue you keep, ignoring expansion.</dd></div>
            <div class="hiw-def"><dt>NRR</dt><dd>Net Revenue Retention. Revenue kept plus expansion. Above 100% means customers grow on their own.</dd></div>
            <div class="hiw-def"><dt>Churn Rate</dt><dd>Percentage of customers who cancel or downgrade each month.</dd></div>
            <div class="hiw-def"><dt>Effective CAC</dt><dd>Your real cost per net-new customer after accounting for churn replacement.</dd></div>
            <div class="hiw-def"><dt>LTV</dt><dd>Lifetime Value. Total profit from one customer over their entire relationship.</dd></div>
            <div class="hiw-def"><dt>ARPC</dt><dd>Average Revenue Per Customer per month. Your ARR divided by customers divided by 12.</dd></div>
          </dl>
        </div>
      </div>
    </div>

    <div class="progress" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div class="progress-dots">
        {#each steps as _, i}
          <span class="dot" class:dot--completed={i < currentStep - 1} class:dot--current={i === currentStep - 1} class:dot--future={i > currentStep - 1}></span>
        {/each}
      </div>
      <span class="progress-label">Step {currentStep} of {totalSteps}</span>
    </div>

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

        <!-- Number input -->
        {:else if steps[currentStep - 1].field === 'number'}
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <input
                type="text"
                inputmode="numeric"
                class="input-number"
                value={inputFocused ? (getValue(currentStep - 1) ?? '') : formatWithCommas(getValue(currentStep - 1))}
                onfocus={(e) => handleNumericFocus(e, currentStep - 1)}
                onblur={(e) => handleNumericBlur(e, currentStep - 1)}
                oninput={(e) => handleNumericInput(e, currentStep - 1)}
                placeholder="0"
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>

        <!-- Percent slider (integer) -->
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

        <!-- Percent slider (decimal for expansion) -->
        {:else if steps[currentStep - 1].field === 'percent-decimal'}
          <div class="input-row input-row--slider">
            <div class="range-track-wrapper">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                class="input-range"
                value={expansionRate * 10}
                oninput={(e) => { expansionRate = parseInt(e.target.value) / 10; }}
                style="--range-pct: {(expansionRate * 10 / 50) * 100}%"
              />
              {#if steps[currentStep - 1].default}
                <span class="range-tick" style="left: {(steps[currentStep - 1].default * 10 / 50) * 100}%" aria-hidden="true"></span>
              {/if}
            </div>
            <span class="range-value">{expansionRate.toFixed(1)}%</span>
          </div>

        <!-- ARPC confirmation -->
        {:else if steps[currentStep - 1].field === 'arpc-confirm'}
          <div class="arpc-confirm">
            {#if !arpcOverride}
              <div class="arpc-display">
                <span class="arpc-display-value">{fmtCurrency(roundToNearest5(autoArpc || 0))}</span>
                <span class="arpc-display-period">/month</span>
              </div>
              <div class="arpc-actions">
                <button type="button" class="arpc-btn arpc-btn--confirm" onclick={confirmArpc}>Yes, that's right</button>
                <button type="button" class="arpc-btn arpc-btn--adjust" onclick={overrideArpc}>No, let me adjust</button>
              </div>
            {:else}
              <div class="input-row">
                <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
                  <span class="currency-prefix">$</span>
                  <input
                    type="text"
                    inputmode="numeric"
                    class="input-currency"
                    value={inputFocused ? (arpc ?? '') : formatWithCommas(arpc)}
                    onfocus={handleArpcFocus}
                    onblur={handleArpcBlur}
                    oninput={handleArpcInput}
                    placeholder="0"
                  />
                  <span class="input-suffix">/month</span>
                </div>
                {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
              </div>
            {/if}
          </div>
        {/if}

        {#if steps[currentStep - 1].benchmark}
          <p class="benchmark">{steps[currentStep - 1].benchmark}</p>
        {/if}

        {#if steps[currentStep - 1].id === 'expansion'}
          <p class="benchmark">Don't track this yet? Leave it at 0%. That's useful data too.</p>
        {/if}
      </div>
    {/key}

    <nav class="wizard-nav">
      {#if currentStep > 1}
        <button type="button" class="nav-back" onclick={back}>Back</button>
      {:else}
        <span></span>
      {/if}
      {#if steps[currentStep - 1].field === 'arpc-confirm' && !arpcOverride}
        <span></span>
      {:else}
        <button
          type="button"
          class="nav-next"
          class:nav-next--disabled={!currentStepValid}
          disabled={!currentStepValid}
          onclick={next}
        >
          Next
        </button>
      {/if}
    </nav>
  </div>
{/if}

<style>
  /* ══════════════════════════════════════════
     Wizard
     ══════════════════════════════════════════ */

  .wizard { display: flex; flex-direction: column; }

  .wizard-header { margin-bottom: clamp(1.25rem, 2vw, 1.5rem); }

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

  /* How it works */
  .how-it-works-trigger {
    display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.75rem;
    padding: 0; font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide); color: var(--color-text-muted); background: none; border: none;
    cursor: pointer; transition: color var(--duration-fast) var(--ease-out-expo);
  }
  .how-it-works-trigger:hover { color: var(--color-accent); }
  .how-it-works-trigger .how-it-works-icon { color: var(--color-accent-teal); flex-shrink: 0; }
  .how-it-works-trigger .how-it-works-chevron { transition: transform var(--duration-normal) var(--ease-out-expo); opacity: 0.5; }
  .how-it-works-trigger--open .how-it-works-chevron { transform: rotate(180deg); }

  .how-it-works-panel {
    display: grid; grid-template-rows: 0fr; opacity: 0;
    transition: grid-template-rows var(--duration-slow) var(--ease-out-expo), opacity var(--duration-normal) var(--ease-out-expo);
  }
  .how-it-works-panel--open { grid-template-rows: 1fr; opacity: 1; }
  .how-it-works-inner { overflow: hidden; padding-top: 0; transition: padding-top var(--duration-slow) var(--ease-out-expo); }
  .how-it-works-panel--open .how-it-works-inner { padding-top: 1.25rem; padding-bottom: 1rem; border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent); }

  .hiw-body, .hiw-heading, .hiw-def {
    opacity: 0; transform: translateY(6px);
    transition: opacity var(--duration-normal) var(--ease-out-expo), transform var(--duration-normal) var(--ease-out-expo);
  }
  .how-it-works-panel--open .hiw-body { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }
  .how-it-works-panel--open .hiw-heading { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
  .how-it-works-panel--open .hiw-def:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.30s; }
  .how-it-works-panel--open .hiw-def:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.34s; }
  .how-it-works-panel--open .hiw-def:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.38s; }
  .how-it-works-panel--open .hiw-def:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.42s; }
  .how-it-works-panel--open .hiw-def:nth-child(5) { opacity: 1; transform: translateY(0); transition-delay: 0.46s; }
  .how-it-works-panel--open .hiw-def:nth-child(6) { opacity: 1; transform: translateY(0); transition-delay: 0.50s; }

  .hiw-body { font-family: var(--font-body); font-size: var(--text-sm); line-height: 1.6; color: var(--color-text-muted); margin: 0 0 1rem; max-width: 52ch; }
  .hiw-heading { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-accent-teal); margin: 0 0 0.6rem; }
  .hiw-glossary { padding-bottom: 0.25rem; }
  .hiw-defs { margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.1rem 1.5rem; }
  .hiw-def { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.45rem 0; border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent); }
  .hiw-def dt { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); color: var(--color-accent); white-space: nowrap; flex-shrink: 0; min-width: 3.5rem; }
  .hiw-def dd { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; line-height: 1.45; }

  @media (max-width: 600px) { .hiw-defs { grid-template-columns: 1fr; } }

  /* Progress */
  .progress { display: flex; align-items: center; gap: 0.75rem; margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem); }
  .progress-dots { display: flex; gap: 0.4rem; }
  .dot { width: 6px; height: 6px; border-radius: 50%; transition: background var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo); }
  .dot--completed { background: var(--color-accent-teal); }
  .dot--current { background: var(--color-accent); transform: scale(1.25); }
  .dot--future { background: color-mix(in oklab, var(--color-text-muted) 20%, transparent); }
  .progress-label { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }

  /* Step content */
  .step-content { flex: 1; margin-bottom: clamp(1.5rem, 3vw, 2rem); }
  .step-category { display: block; font-family: var(--font-body); font-size: var(--text-xs); font-weight: 500; text-transform: uppercase; letter-spacing: var(--tracking-wide); color: var(--color-accent-teal); margin-bottom: 0.5rem; }
  .step-question { font-family: var(--font-display); font-size: var(--text-xl); font-weight: var(--weight-regular); color: var(--color-text); line-height: 1.2; letter-spacing: var(--tracking-tight); margin: 0 0 clamp(1rem, 2vw, 1.25rem); }

  .slide-from-right { animation: slideFromRight var(--duration-normal) var(--ease-out-expo) both; }
  .slide-from-left { animation: slideFromLeft var(--duration-normal) var(--ease-out-expo) both; }
  @keyframes slideFromRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideFromLeft { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
  @media (prefers-reduced-motion: reduce) { .step-content, .slide-from-right, .slide-from-left { animation: none !important; } }

  /* Inputs */
  .input-row { display: flex; flex-direction: column; gap: 1rem; }
  .input-row--slider { flex-direction: row; align-items: center; gap: 1.5rem; }

  .currency-wrapper { display: flex; align-items: baseline; gap: 0.25rem; border-bottom: 2px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent); transition: border-color var(--duration-fast) var(--ease-out-expo); padding-bottom: 0.25rem; }
  .currency-wrapper.focused { border-color: var(--color-accent); }
  .currency-prefix { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text-muted); line-height: 1; user-select: none; }
  .input-currency { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text); background: transparent; border: none; outline: none; width: 100%; line-height: 1; padding: 0; }
  .input-currency::placeholder { color: color-mix(in oklab, var(--color-text-muted) 40%, transparent); }

  .suffix-wrapper { display: flex; align-items: baseline; gap: 0.5rem; border-bottom: 2px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent); transition: border-color var(--duration-fast) var(--ease-out-expo); padding-bottom: 0.25rem; }
  .suffix-wrapper.focused { border-color: var(--color-accent); }
  .currency-wrapper.invalid, .suffix-wrapper.invalid { border-color: var(--color-accent-rust); }

  .input-hint { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-accent-rust); margin: 0.5rem 0 0; opacity: 0; animation: hint-enter 0.3s var(--ease-out-expo) forwards; }
  @keyframes hint-enter { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .input-number { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text); background: transparent; border: none; outline: none; width: 100%; line-height: 1; padding: 0; }
  .input-number::placeholder { color: color-mix(in oklab, var(--color-text-muted) 40%, transparent); }
  .input-suffix { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text-muted); line-height: 1; user-select: none; white-space: nowrap; }

  /* Range slider */
  .input-range { flex: 1; -webkit-appearance: none; appearance: none; height: 2px; background: linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) var(--range-pct, 50%), color-mix(in oklab, var(--color-text-muted) 25%, transparent) var(--range-pct, 50%), color-mix(in oklab, var(--color-text-muted) 25%, transparent) 100%); border-radius: 1px; outline: none; cursor: pointer; }
  .input-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--color-accent); border: 2px solid var(--color-bg); box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-accent) 30%, transparent); cursor: pointer; transition: transform var(--duration-fast) var(--ease-out-expo), box-shadow var(--duration-fast) var(--ease-out-expo); }
  .input-range::-webkit-slider-thumb:hover { transform: scale(1.15); box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent) 15%, transparent); }
  .input-range::-webkit-slider-thumb:active { transform: scale(1.05); }
  .input-range::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--color-accent); border: 2px solid var(--color-bg); box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-accent) 30%, transparent); cursor: pointer; }
  .input-range::-moz-range-track { height: 2px; background: transparent; border: none; }
  .input-range::-moz-range-progress { height: 2px; background: var(--color-accent); border-radius: 1px; }
  .range-track-wrapper { position: relative; flex: 1; display: flex; align-items: center; }
  .range-track-wrapper .input-range { width: 100%; }
  .range-tick { position: absolute; top: 50%; width: 1px; height: 10px; background: var(--color-accent-teal); opacity: 0.5; transform: translateX(-50%) translateY(-50%); pointer-events: none; border-radius: 1px; }
  .range-value { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text); line-height: 1; min-width: 3.5ch; text-align: right; }

  .benchmark { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); letter-spacing: var(--tracking-wide); text-transform: uppercase; margin: 0.6rem 0 0; }

  /* ARPC confirmation */
  .arpc-confirm { display: flex; flex-direction: column; gap: 1.25rem; }
  .arpc-display { display: flex; align-items: baseline; gap: 0.25rem; }
  .arpc-display-value { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); color: var(--color-text); line-height: 1; }
  .arpc-display-period { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-text-muted); }
  .arpc-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .arpc-btn { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; padding: 0.75rem 1.5rem; border: none; cursor: pointer; transition: background var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo); }
  .arpc-btn:active { transform: scale(0.97); }
  .arpc-btn--confirm { background: var(--color-accent); color: var(--color-bg); }
  .arpc-btn--confirm:hover { background: color-mix(in oklab, var(--color-accent) 85%, white); }
  .arpc-btn--adjust { background: transparent; color: var(--color-text-muted); border: 1px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent); }
  .arpc-btn--adjust:hover { color: var(--color-text); border-color: color-mix(in oklab, var(--color-text-muted) 50%, transparent); }

  /* Navigation */
  .wizard-nav { display: flex; justify-content: space-between; align-items: center; }
  .nav-back { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0.5rem 0; transition: color var(--duration-fast) var(--ease-out-expo); }
  .nav-back:hover { color: var(--color-text); }
  .nav-next { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); background: transparent; border: 1px solid var(--color-accent); padding: 0.75rem 2rem; cursor: pointer; transition: background var(--duration-fast) var(--ease-out-expo), border-color var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo), opacity var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo); }
  .nav-next:hover:not(:disabled) { background: color-mix(in oklab, var(--color-accent) 12%, transparent); color: var(--color-accent); }
  .nav-next:active:not(:disabled) { transform: scale(0.97); }
  .nav-next--disabled { opacity: 0.25; cursor: not-allowed; border-color: color-mix(in oklab, var(--color-text-muted) 20%, transparent); }

  /* ══════════════════════════════════════════
     Lead Capture
     ══════════════════════════════════════════ */

  .lead-capture { display: flex; flex-direction: column; }
  .lead-content { flex: 1; margin-bottom: 1.5rem; }
  .lead-heading { font-family: var(--font-display); font-size: var(--text-xl); font-weight: var(--weight-regular); color: var(--color-text); line-height: 1.2; margin: 0 0 0.5rem; }
  .lead-subheading { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; margin: 0 0 1.5rem; }

  .lead-teaser { background: color-mix(in oklab, var(--color-text-muted) 5%, transparent); border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
  .lead-teaser-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.75rem; }
  .lead-teaser-lock { color: var(--color-text-muted); }
  .lead-teaser-title { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }
  .lead-teaser-rows { display: flex; flex-direction: column; gap: 0.5rem; }
  .lead-teaser-row { display: flex; justify-content: space-between; align-items: center; }
  .lead-teaser-label { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); }
  .lead-teaser-redacted { height: 14px; border-radius: 3px; background: linear-gradient(90deg, color-mix(in oklab, var(--color-text-muted) 15%, transparent) 25%, color-mix(in oklab, var(--color-text-muted) 8%, transparent) 50%, color-mix(in oklab, var(--color-text-muted) 15%, transparent) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .lead-fields { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 1.5rem; }
  .lead-field { position: relative; }
  .lead-input { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--color-text); background: transparent; border: none; outline: none; width: 100%; padding: 0.25rem 0; line-height: 1; }
  .lead-input::placeholder { color: color-mix(in oklab, var(--color-text-muted) 40%, transparent); }
  .lead-input:focus::placeholder { opacity: 0.4; }
  .lead-input-line { height: 2px; background: color-mix(in oklab, var(--color-text-muted) 25%, transparent); position: relative; overflow: hidden; transition: background var(--duration-fast) var(--ease-out-expo); }
  .lead-input-line::after { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 0; background: var(--color-accent); transition: width var(--duration-normal) var(--ease-out-expo); }
  .lead-input:focus + .lead-input-line::after { width: 100%; }

  .lead-consent { display: flex; align-items: flex-start; gap: 0.6rem; cursor: pointer; margin-top: 0.5rem; }
  .lead-checkbox { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid color-mix(in oklab, var(--color-text-muted) 35%, transparent); flex-shrink: 0; margin-top: 1px; transition: border-color var(--duration-fast) var(--ease-out-expo), background var(--duration-fast) var(--ease-out-expo); }
  .lead-checkbox--checked { border-color: var(--color-accent-teal); background: var(--color-accent-teal); color: var(--color-bg); }
  .lead-checkbox-input { position: absolute; opacity: 0; pointer-events: none; }
  .lead-consent-text { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; }
  .lead-consent-link { color: var(--color-accent); text-decoration: none; }
  .lead-consent-link:hover { text-decoration: underline; }

  .lead-error { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-accent-rust); margin: 0.75rem 0 0; }

  .lead-skip { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); background: none; border: none; padding: 0.5rem 0; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; margin-top: 0.5rem; transition: color var(--duration-fast) var(--ease-out-expo); }
  .lead-skip:hover { color: var(--color-text); }

  .lead-actions { display: flex; justify-content: space-between; align-items: center; }

  .lead-dots { display: flex; gap: 4px; align-items: center; }
  .lead-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: dotPulse 1s ease-in-out infinite; }
  .lead-dot:nth-child(2) { animation-delay: 0.15s; }
  .lead-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  /* ══════════════════════════════════════════
     Results Dashboard
     ══════════════════════════════════════════ */

  .results-header { margin-bottom: clamp(1.5rem, 3vw, 2rem); }
  .results-tag { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); display: block; margin-bottom: 0.75rem; }
  .results-hero-number { font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 3.5rem); font-weight: var(--weight-regular); line-height: 1; color: var(--color-accent-rust); letter-spacing: -0.03em; margin: 0 0 0.35rem; }
  .results-hero-period { font-size: 0.45em; color: var(--color-text-muted); letter-spacing: 0; vertical-align: baseline; margin-left: 0.1em; }
  .results-hero-context { font-family: var(--font-display); font-style: italic; font-size: var(--text-lg); color: var(--color-text-muted); line-height: 1.35; margin: 0; }

  .results-email-sent { display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-accent-teal); padding: 0.5rem 0.75rem; border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent); border-radius: var(--radius-sm); margin-bottom: clamp(2rem, 4vw, 3rem); }
  .results-email-sent svg { flex-shrink: 0; opacity: 0.6; }

  .results-insight { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.65; margin: 0 0 clamp(2.5rem, 5vw, 3.5rem); padding: 1rem 0; border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent); border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent); }
  .results-insight strong { color: var(--color-text); font-weight: var(--weight-medium); }
  .insight-health--rust { color: var(--color-accent-rust); }
  .insight-health--teal { color: var(--color-accent-teal); }

  /* Sections */
  .results-section { margin-bottom: clamp(2.5rem, 5vw, 3.5rem); padding-bottom: clamp(2rem, 4vw, 3rem); border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent); }
  .results-section:last-of-type { border-bottom: none; padding-bottom: 0; }
  .results-section-header { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1.25rem; }
  .results-section-number { font-family: 'Instrument Serif', serif; font-style: italic; font-size: var(--text-md); line-height: 1; color: var(--color-accent-teal); }
  .results-section-heading { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); margin: 0; }

  /* Metrics */
  .results-metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.25rem 2rem; }
  .results-metrics-row--hero { margin-bottom: 1rem; }
  .results-metric { display: flex; flex-direction: column; gap: 0.3rem; }
  .results-metric-value { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); color: var(--color-text); line-height: 1.1; letter-spacing: -0.02em; }
  .results-metric-label { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.4; letter-spacing: 0.01em; }

  .results-metric-value--rust { color: var(--color-accent-rust); }
  .results-metric-value--amber { color: var(--color-accent-amber); }
  .results-metric-value--teal { color: var(--color-accent-teal); }
  .results-metric-value--accent { color: var(--color-accent); }
  .results-metric-value--warning { color: var(--color-accent-rust); }

  /* Scores */
  .results-scores { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .score-card { display: flex; flex-direction: column; gap: 0.3rem; }
  .score-value { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.75rem); line-height: 1; letter-spacing: -0.02em; }
  .score-label { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }
  .score-badge { display: inline-block; font-family: var(--font-body); font-size: 10px; font-weight: var(--weight-medium); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 3px; width: fit-content; margin-top: 0.25rem; }

  .score-value--critical { color: var(--color-accent-rust); }
  .score-value--needs_work { color: var(--color-accent-amber); }
  .score-value--healthy { color: var(--color-accent-teal); }
  .score-value--contraction { color: var(--color-accent-rust); }
  .score-value--stable { color: var(--color-accent-amber); }
  .score-value--elite { color: var(--color-accent); }

  .score-badge--critical { color: var(--color-accent-rust); background: color-mix(in oklab, var(--color-accent-rust) 12%, transparent); }
  .score-badge--needs_work { color: var(--color-accent-amber); background: color-mix(in oklab, var(--color-accent-amber) 12%, transparent); }
  .score-badge--healthy { color: var(--color-accent-teal); background: color-mix(in oklab, var(--color-accent-teal) 12%, transparent); }
  .score-badge--contraction { color: var(--color-accent-rust); background: color-mix(in oklab, var(--color-accent-rust) 12%, transparent); }
  .score-badge--stable { color: var(--color-accent-amber); background: color-mix(in oklab, var(--color-accent-amber) 12%, transparent); }
  .score-badge--elite { color: var(--color-accent); background: color-mix(in oklab, var(--color-accent) 12%, transparent); }

  /* Improvement */
  .improvement-slider { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; position: relative; z-index: 1; }
  .improvement-slider-label { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); white-space: nowrap; }
  .improvement-options { display: flex; gap: 0.35rem; }
  .improvement-option { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); padding: 0.45rem 0.85rem; border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent); background: transparent; color: var(--color-text-muted); cursor: pointer; border-radius: 3px; transition: background var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo), border-color var(--duration-fast) var(--ease-out-expo), opacity var(--duration-fast) var(--ease-out-expo); }
  .improvement-option:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
  .improvement-option--active { background: var(--color-accent); color: var(--color-bg); border-color: var(--color-accent); }
  .improvement-option--disabled { opacity: 0.25; cursor: not-allowed; }

  .improvement-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
  .improvement-col { display: flex; flex-direction: column; gap: 0.75rem; }
  .improvement-col-heading { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); padding-bottom: 0.5rem; border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent); }
  .improvement-col--improved .improvement-col-heading { color: var(--color-accent-teal); border-color: color-mix(in oklab, var(--color-accent-teal) 20%, transparent); }
  .improvement-stat { display: flex; flex-direction: column; gap: 0.15rem; }
  .improvement-stat-value { font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-text); line-height: 1.2; }
  .improvement-stat-value--teal { color: var(--color-accent-teal); }
  .improvement-stat-label { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); }

  .improvement-gap { display: flex; flex-direction: column; gap: 0.3rem; padding: 1rem; background: color-mix(in oklab, var(--color-accent) 6%, transparent); border: 1px solid color-mix(in oklab, var(--color-accent) 15%, transparent); border-radius: 6px; margin-bottom: 1rem; }
  .improvement-gap-value { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.25rem); color: var(--color-accent); line-height: 1; letter-spacing: -0.02em; }
  .improvement-gap-label { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); }

  .improvement-cost-note { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); font-style: italic; margin: 0 0 1.5rem; }

  /* Chart */
  .chart-container { margin-top: 1.5rem; }
  .trajectory-chart { width: 100%; height: auto; overflow: visible; }
  .chart-line { vector-effect: non-scaling-stroke; }
  .chart-line--improved { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1.2s var(--ease-out-expo) 0.3s forwards; }
  .chart-line--current { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1s var(--ease-out-expo) 0.1s forwards; }
  .chart-line--acquisition { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: drawLine 1.1s var(--ease-out-expo) 0.2s forwards; }
  @keyframes drawLine { to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) { .chart-line--improved, .chart-line--current, .chart-line--acquisition { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; } }

  .chart-legend { display: flex; gap: 1.25rem; margin-top: 0.75rem; }
  .chart-legend-item { display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); }
  .chart-dot { width: 8px; height: 3px; border-radius: 1.5px; }
  .chart-dot--current { background: var(--color-text-muted); opacity: 0.4; }
  .chart-dot--improved { background: var(--color-accent-teal); }
  .chart-dot--acquisition { background: var(--color-accent-amber); opacity: 0.7; }

  /* Callouts & Notes */
  .results-callout { font-family: var(--font-body); font-size: var(--text-sm); line-height: 1.6; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
  .results-callout--rust { color: var(--color-accent-rust); background: color-mix(in oklab, var(--color-accent-rust) 8%, transparent); border: 1px solid color-mix(in oklab, var(--color-accent-rust) 15%, transparent); }
  .results-callout--teal { color: var(--color-accent-teal); background: color-mix(in oklab, var(--color-accent-teal) 8%, transparent); border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent); }
  .results-note { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); font-style: italic; line-height: 1.6; padding: 0.75rem 0; margin-bottom: 1rem; }

  /* CTA */
  .results-cta { margin-bottom: clamp(2rem, 4vw, 3rem); padding: clamp(1.25rem, 2.5vw, 1.75rem); border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .results-cta-text { font-family: var(--font-display); font-style: italic; font-size: var(--text-base); color: var(--color-text-muted); line-height: 1.35; margin: 0; }
  .results-cta-link { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; white-space: nowrap; padding: 0.6rem 1.25rem; border: 1px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent); transition: border-color var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo); }
  .results-cta-link:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .results-cta-arrow { display: inline-block; transition: transform var(--duration-fast) var(--ease-out-expo); }
  .results-cta-link:hover .results-cta-arrow { transform: translateX(3px); }
  @media (max-width: 640px) { .results-cta { flex-direction: column; align-items: flex-start; } }

  /* Actions */
  .results-actions-divider { height: 1px; background: color-mix(in oklab, var(--color-text-muted) 10%, transparent); margin-bottom: 1.5rem; }
  .results-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  .results-copy { display: inline-flex; align-items: center; gap: 0.4rem; font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); background: none; border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent); padding: 0.55rem 1rem; cursor: pointer; transition: all var(--duration-fast) var(--ease-out-expo); }
  .results-copy:hover:not(:disabled) { color: var(--color-accent); border-color: var(--color-accent); }
  .results-copy:disabled { opacity: 0.5; cursor: not-allowed; }
  .results-copy--copied { color: var(--color-accent-teal); border-color: var(--color-accent-teal); }
  .results-start-over { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); background: none; border: none; padding: 0.5rem 0; cursor: pointer; transition: color var(--duration-fast) var(--ease-out-expo); margin-left: auto; }
  .results-start-over:hover { color: var(--color-text); }

  /* Related tools */
  .related-tools { margin-top: clamp(3rem, 6vw, 4rem); padding-top: 2rem; border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent); }
  .related-tools-heading { display: block; font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 1rem; }
  .related-tools-grid { display: grid; gap: 0.75rem; }
  .related-tool-card { display: block; text-decoration: none; padding: clamp(1rem, 2vw, 1.25rem); border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent); border-radius: var(--radius-md); position: relative; transition: border-color var(--duration-fast) var(--ease-out-expo), background var(--duration-fast) var(--ease-out-expo); }
  .related-tool-card:hover { border-color: color-mix(in oklab, var(--color-accent) 30%, transparent); background: color-mix(in oklab, var(--color-accent) 3%, transparent); }
  .related-tool-icon { position: absolute; top: clamp(1rem, 2vw, 1.25rem); right: clamp(1rem, 2vw, 1.25rem); color: var(--color-text-muted); opacity: 0.4; transition: opacity var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo); }
  .related-tool-card:hover .related-tool-icon { opacity: 0.8; color: var(--color-accent); transform: translate(2px, -2px); }
  .related-tool-title { display: block; font-family: var(--font-display); font-size: var(--text-lg); color: var(--color-text); line-height: 1.2; margin-bottom: 0.35rem; transition: color var(--duration-fast) var(--ease-out-expo); }
  .related-tool-card:hover .related-tool-title { color: var(--color-accent); }
  .related-tool-desc { display: block; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; }

  /* Mobile */
  @media (max-width: 480px) {
    .results-scores { grid-template-columns: 1fr; }
    .improvement-comparison { grid-template-columns: 1fr; }
    .improvement-slider { flex-direction: column; align-items: flex-start; }
  }
</style>
