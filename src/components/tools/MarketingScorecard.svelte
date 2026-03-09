<script>
  import { onMount, tick } from 'svelte';
  import { animate, stagger } from 'motion';
  import {
    fmtCurrency, fmtNum, fmtPercent, fmtRatio, fmtMonths,
    formatWithCommas, parseRawNumber, abbreviateTarget,
    calculateScorecardResults,
    STAGES, MODELS, BENCHMARKS,
  } from './marketing-scorecard-utils.js';

  function isConstraintMetric(constraintId, metricKey) {
    const map = {
      retention_crisis: ['monthlyChurn'],
      unit_economics: ['ltvCac', 'cac', 'ltv'],
      cash_flow_efficiency: ['cacPayback'],
      pipeline_gap: ['pipelineCoverage'],
      expansion_gap: ['nrr'],
      growth_throttle: ['marketingSpendPercent', 'ltvCac'],
      conversion_leak: ['conversionRate'],
      optimization_mode: [],
    };
    return (map[constraintId] || []).includes(metricKey);
  }

  const relatedTools = [
    {
      title: 'Retention Revenue Calculator',
      description: 'See the real cost of customer churn and the compounding gap over 3 years.',
      href: '/tools/retention-calculator',
    },
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
  let stage = $state(null);
  let model = $state(null);
  let arr = $state(null);
  let marketingSpend = $state(null);
  let newCustomersMonth = $state(null);
  let acv = $state(null);
  let monthlyChurnRate = $state(null);
  let expansionRate = $state(0.5);
  let salesCycleLength = $state(null);
  let pipelineValue = $state(null);
  let monthlyLeadVolume = $state(null);
  let leadToCustomerRate = $state(null);

  let salesCycleSkipped = $state(false);
  let pipelineSkipped = $state(false);
  let funnelSkipped = $state(false);

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

  /* ── Results ── */
  let pdfGenerating = $state(false);
  let copied = $state(false);

  /* ── UI ── */
  let inputFocused = $state(false);
  let inputInvalid = $state(false);

  /* ── Derived ── */
  let churnDefault = $derived(
    stage === 'scale' ? 2 :
    stage === 'growth' ? 3 :
    5
  );

  let churnBenchmark = $derived(
    stage === 'scale' ? 'Scale stage average: 1-3%' :
    stage === 'growth' ? 'Growth stage average: 3-5%' :
    'Early stage average: 4-7%'
  );

  let acvBenchmark = $derived(
    model === 'enterprise' ? 'Enterprise average: $50K-$250K' :
    model === 'plg' ? 'PLG average: $1K-$10K' :
    'B2B SaaS average: $10K-$50K'
  );

  let cycleBenchmark = $derived(
    model === 'enterprise' ? 'Enterprise average: 90-180 days' :
    model === 'plg' ? 'PLG average: 14-30 days' :
    'B2B SaaS average: 30-90 days'
  );

  const totalSteps = 9;

  let canCalculate = $derived(
    stage && model && arr > 0 && marketingSpend > 0 && newCustomersMonth > 0 && acv > 0 && monthlyChurnRate != null
  );

  let results = $derived.by(() => {
    if (!canCalculate) return null;
    return calculateScorecardResults({
      stage, model, arr, marketingSpend, newCustomersMonth, acv,
      monthlyChurnRate, expansionRate,
      salesCycleLength: salesCycleSkipped ? null : salesCycleLength,
      pipelineValue: pipelineSkipped ? null : pipelineValue,
      monthlyLeadVolume: funnelSkipped ? null : monthlyLeadVolume,
      leadToCustomerRate: funnelSkipped ? null : leadToCustomerRate,
    });
  });

  let leadFormValid = $derived(
    leadName.trim().length > 0 &&
    leadEmail.trim().length > 0 &&
    leadEmail.includes('@') &&
    leadCompany.trim().length > 0 &&
    leadConsent
  );

  let currentStepValid = $derived.by(() => {
    switch (currentStep) {
      case 1: return stage != null && model != null;
      case 2: return arr != null && arr > 0;
      case 3: return marketingSpend != null && marketingSpend > 0 && newCustomersMonth != null && newCustomersMonth > 0;
      case 4: return acv != null && acv > 0;
      case 5: return monthlyChurnRate != null && monthlyChurnRate > 0;
      case 6: return true; // expansion has a default
      case 7: return salesCycleSkipped || (salesCycleLength != null && salesCycleLength > 0);
      case 8: return pipelineSkipped || (pipelineValue != null && pipelineValue > 0);
      case 9: return funnelSkipped || (monthlyLeadVolume != null && monthlyLeadVolume > 0 && leadToCustomerRate != null && leadToCustomerRate > 0);
      default: return false;
    }
  });

  /* ── Step category labels ── */
  function stepCategory(step) {
    if (step <= 1) return 'Context';
    if (step <= 2) return 'Revenue';
    if (step <= 4) return 'Acquisition';
    if (step <= 6) return 'Retention';
    if (step <= 8) return 'Pipeline';
    return 'Funnel';
  }

  /* ── Navigation ── */
  function next() {
    if (currentStep < totalSteps) {
      direction = 1;
      currentStep++;
      // Set churn default when entering churn step
      if (currentStep === 5 && monthlyChurnRate == null) {
        monthlyChurnRate = churnDefault;
      }
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

  function skipStep() {
    switch (currentStep) {
      case 7: salesCycleSkipped = true; break;
      case 8: pipelineSkipped = true; break;
      case 9: funnelSkipped = true; break;
    }
    next();
  }

  function startOver() {
    stage = null;
    model = null;
    arr = null;
    marketingSpend = null;
    newCustomersMonth = null;
    acv = null;
    monthlyChurnRate = null;
    expansionRate = 0.5;
    salesCycleLength = null;
    pipelineValue = null;
    monthlyLeadVolume = null;
    leadToCustomerRate = null;
    salesCycleSkipped = false;
    pipelineSkipped = false;
    funnelSkipped = false;
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
    pdfGenerating = false;
    copied = false;
    direction = 1;
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
      const res = await fetch('/api/marketing-scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          company: leadCompany.trim(),
          inputs: {
            stage, model, arr, marketingSpend, newCustomersMonth, acv,
            monthlyChurnRate, expansionRate,
            salesCycleLength: salesCycleSkipped ? null : salesCycleLength,
            pipelineValue: pipelineSkipped ? null : pipelineValue,
            monthlyLeadVolume: funnelSkipped ? null : monthlyLeadVolume,
            leadToCustomerRate: funnelSkipped ? null : leadToCustomerRate,
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

  /* ── Input handlers ── */
  function handleNumericInput(e, setter) {
    const val = parseRawNumber(e.target.value);
    setter(val);
    inputInvalid = e.target.value.trim().length > 0 && val === null;
  }

  function handleNumericBlur(e, setter) {
    inputFocused = false;
    setter(parseRawNumber(e.target.value));
    inputInvalid = false;
  }

  function handleNumericFocus(e, raw) {
    inputFocused = true;
    inputInvalid = false;
    e.target.value = raw ?? '';
  }

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
      if (header) animate(header, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
      const fields = form.querySelectorAll('.lead-field');
      if (fields.length) animate(fields, { opacity: [0, 1], y: [12, 0] }, { duration: 0.35, delay: stagger(0.06, { start: 0.1 }), easing: [0.16, 1, 0.3, 1] });
      const actions = form.querySelector('.lead-actions');
      if (actions) animate(actions, { opacity: [0, 1] }, { duration: 0.4, delay: 0.35, easing: [0.16, 1, 0.3, 1] });
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

      const verdict = dashboard.querySelector('.verdict-card');
      if (verdict) animate(verdict, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, delay: 0.12, easing: [0.16, 1, 0.3, 1] });

      const sections = dashboard.querySelectorAll('.results-section');
      if (sections.length) animate(sections, { opacity: [0, 1], y: [20, 0] }, { duration: 0.4, delay: stagger(0.08, { start: 0.25 }), easing: [0.16, 1, 0.3, 1] });

      const cards = dashboard.querySelectorAll('.metric-card');
      if (cards.length) animate(cards, { opacity: [0, 1], y: [12, 0] }, { duration: 0.35, delay: stagger(0.04, { start: 0.35 }), easing: [0.16, 1, 0.3, 1] });

      const cta = dashboard.querySelector('.results-cta');
      if (cta) animate(cta, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, delay: 0.6, easing: [0.16, 1, 0.3, 1] });

      const actions = dashboard.querySelector('.results-actions');
      if (actions) animate(actions, { opacity: [0, 1] }, { duration: 0.4, delay: 0.7, easing: [0.16, 1, 0.3, 1] });
    });
  }

  /* ── Health color class ── */
  function healthClass(health) {
    if (health === 'strong' || health === 'elite') return 'health--strong';
    if (health === 'healthy') return 'health--healthy';
    if (health === 'warning' || health === 'stable') return 'health--warning';
    if (health === 'critical' || health === 'contraction') return 'health--critical';
    return 'health--muted';
  }

  function healthLabel(health) {
    if (health === 'strong' || health === 'elite') return 'Strong';
    if (health === 'healthy') return 'Healthy';
    if (health === 'warning' || health === 'stable') return 'Watch';
    if (health === 'critical' || health === 'contraction') return 'Needs Work';
    return '';
  }

  function severityClass(severity) {
    if (severity === 'critical') return 'severity--critical';
    if (severity === 'warning') return 'severity--warning';
    if (severity === 'opportunity') return 'severity--opportunity';
    return 'severity--healthy';
  }

  /* ── Metric formatters ── */
  const metricLabels = {
    cac: 'CAC', ltv: 'LTV', ltvCac: 'LTV:CAC', cacPayback: 'CAC Payback',
    marketingSpendPercent: 'Marketing Spend %', monthlyChurn: 'Monthly Churn',
    nrr: 'NRR', mer: 'MER', pipelineCoverage: 'Pipeline Coverage',
    pipelineVelocity: 'Pipeline Velocity', conversionRate: 'Conversion Rate',
  };

  function formatMetric(key, m) {
    if (m.value == null) return '\u2014';
    switch (key) {
      case 'cac': case 'ltv': case 'pipelineVelocity': return fmtCurrency(m.value);
      case 'ltvCac': case 'mer': return fmtRatio(m.value);
      case 'cacPayback': return fmtMonths(m.value);
      case 'pipelineCoverage': return fmtNum(m.value, 1) + 'x';
      default: return fmtPercent(m.value);
    }
  }

  /* ── Related tools for CTA ── */
  let contextualTools = $derived.by(() => {
    if (!results) return relatedTools;
    const c = results.constraint;
    if (c.id === 'retention_crisis' || c.id === 'expansion_gap') {
      return relatedTools.filter(t => t.href.includes('retention'));
    }
    if (c.id === 'pipeline_gap') {
      return relatedTools.filter(t => t.href.includes('gtm'));
    }
    return relatedTools;
  });

  /* ── Clipboard ── */
  async function copyResults() {
    if (!results) return;
    const r = results;
    const c = r.constraint;
    const stageLabel = STAGES[stage]?.label || stage;

    let full = `Marketing Efficiency Scorecard: ${fmtCurrency(arr)} ARR | ${stageLabel} Stage | ${MODELS[model]?.label || model}\n`;
    full += `\nPRIMARY CONSTRAINT: ${c.name} (${c.severity.charAt(0).toUpperCase() + c.severity.slice(1)})\n${c.verdict}\n`;

    full += '\nSCORECARD';
    for (const [key, m] of Object.entries(r.metrics)) {
      if (!m.scored) continue;
      full += `\n${metricLabels[key] || key}: ${formatMetric(key, m)} (${healthLabel(m.health)}${m.benchmark ? ' | ' + m.benchmark : ''})`;
    }

    if (r.watchList.length > 0) {
      full += '\n\nWATCH LIST';
      r.watchList.forEach(item => { full += `\n${item.message}`; });
    }

    if (r.recommendations.length > 0) {
      full += '\n\nTOP RECOMMENDATION';
      full += `\n${r.recommendations[0].text}`;
    }

    full += '\n\nGenerated with devin.vc/tools/marketing-scorecard';

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
      const c = r.constraint;
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

      const severityColors = { critical: rust, warning: amber, opportunity: accent, healthy: teal };

      doc.setFillColor(...bg);
      doc.rect(0, 0, W, H, 'F');

      const mx = 20;
      const cw = W - 2 * mx;

      // Header
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('EFFICIENCY SCORECARD', mx, 22);

      doc.setFontSize(18);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...text);
      doc.text(leadCompany.trim() || 'Your Company', mx, 30);

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      const stageLabel = STAGES[stage]?.label || stage;
      const modelLabel = MODELS[model]?.label || model;
      doc.text(`${fmtCurrency(arr)} ARR  ·  ${stageLabel}  ·  ${modelLabel}`, mx, 37);

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(9);
      doc.setTextColor(...dim);
      doc.text(today, mx, 43);

      doc.setDrawColor(...border);
      doc.setLineWidth(0.3);
      doc.line(mx, 47, W - mx, 47);

      let y = 54;

      // Verdict
      doc.setFontSize(8);
      doc.setTextColor(...(severityColors[c.severity] || teal));
      doc.text(`PRIMARY CONSTRAINT: ${c.name.toUpperCase()}`, mx, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...text);
      const verdictLines = doc.splitTextToSize(c.verdict, cw);
      doc.text(verdictLines, mx, y);
      y += verdictLines.length * 4.5 + 6;

      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // Scorecard
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('SCORECARD', mx, y);
      y += 7;

      const colW = cw * 0.48;
      let col = 0;
      let row = 0;
      const metricEntries = Object.entries(r.metrics).filter(([, m]) => m.scored);

      metricEntries.forEach(([key, m]) => {
        const ix = mx + col * colW;
        const iy = y + row * 14;

        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(metricLabels[key] || key, ix, iy);

        doc.setFontSize(11);
        doc.setFont('Helvetica', 'bold');
        const hColor = (m.health === 'critical' || m.health === 'contraction') ? rust
          : (m.health === 'warning' || m.health === 'stable') ? amber
          : (m.health === 'strong' || m.health === 'elite') ? teal : text;
        doc.setTextColor(...hColor);
        doc.text(formatMetric(key, m), ix, iy + 5);

        doc.setFontSize(7);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...dim);
        doc.text(healthLabel(m.health), ix, iy + 9);

        col++;
        if (col >= 2) { col = 0; row++; }
      });

      y += (Math.ceil(metricEntries.length / 2)) * 14 + 4;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 8;

      // Watch List
      if (r.watchList.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...teal);
        doc.text('WATCH LIST', mx, y);
        y += 6;
        r.watchList.forEach(item => {
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'italic');
          doc.setTextColor(...amber);
          const wLines = doc.splitTextToSize(item.message, cw);
          doc.text(wLines, mx, y);
          y += wLines.length * 3.5 + 2;
        });
        y += 4;
        doc.setDrawColor(...border);
        doc.line(mx, y, W - mx, y);
        y += 8;
      }

      // Recommendations
      if (r.recommendations.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(...teal);
        doc.text('RECOMMENDATIONS', mx, y);
        y += 6;
        r.recommendations.forEach((rec, i) => {
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(...text);
          const rLines = doc.splitTextToSize(`${i + 1}. ${rec.text}`, cw);
          doc.text(rLines, mx, y);
          y += rLines.length * 3.5 + 3;
        });
        y += 4;
        doc.setDrawColor(...border);
        doc.line(mx, y, W - mx, y);
        y += 8;
      }

      // Glossary
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('GLOSSARY', mx, y);
      y += 6;

      const glossary = [
        ['CAC', 'Customer Acquisition Cost. Total marketing spend / new customers. Lower is better, but context matters by stage.'],
        ['LTV:CAC', 'Lifetime value per acquisition dollar. 3:1 to 5:1 is healthy for most B2B SaaS.'],
        ['CAC Payback', 'Months to recover acquisition cost. Under 12 months is healthy.'],
        ['NRR', 'Net Revenue Retention. Revenue retained from existing customers + expansion. Above 100% = growth engine.'],
        ['MER', 'Marketing Efficiency Ratio. Total revenue per marketing dollar. Measures overall marketing productivity.'],
        ['Pipeline Coverage', 'Active pipeline as a multiple of revenue target. 3-4x is healthy.'],
      ];

      glossary.forEach(([term, def]) => {
        doc.setFontSize(7);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...accent);
        doc.text(term, mx, y);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...dim);
        const lines = doc.splitTextToSize(def, cw - 30);
        doc.text(lines, mx + 30, y);
        y += lines.length * 3.2 + 2;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...muted);
      doc.text('devin.vc', mx, H - 12);
      doc.text('Generated with Marketing Efficiency Scorecard', W - mx, H - 12, { align: 'right' });

      const dateStr = new Date().toISOString().split('T')[0];
      const shortArr = abbreviateTarget(arr);
      doc.save(`scorecard-${stage}-${shortArr}-${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      pdfGenerating = false;
    }
  }
</script>

{#if showResults && results}
  {@const r = results}
  {@const c = r.constraint}
  <div class="results-dashboard">
    <!-- Hero header -->
    <header class="results-header">
      <span class="results-tag">Your Marketing Scorecard</span>
      <p class="results-hero-context">{STAGES[stage]?.label || stage} Stage | {fmtCurrency(arr)} ARR | {MODELS[model]?.label || model}</p>
    </header>

    {#if leadSuccess && leadEmail}
      <div class="results-email-sent">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
        <span>A copy is on its way to {leadEmail.trim()}</span>
      </div>
    {/if}

    <!-- Outlier Warnings -->
    {#if r.outliers.length > 0}
      <div class="outlier-warnings">
        {#each r.outliers as warning}
          <div class="outlier-warning">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <span>{warning}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Pre-revenue note -->
    {#if r.preRevenueMode}
      <div class="pre-revenue-note">
        Pre-revenue scoring focuses on burn efficiency, funnel viability, and early retention signals. Some metrics (CAC payback, LTV:CAC, MER) require revenue history and are excluded.
      </div>
    {/if}

    <!-- Section 1: The Verdict -->
    <section class="verdict-card {severityClass(c.severity)}">
      <div class="verdict-header">
        <span class="verdict-severity-dot {severityClass(c.severity)}"></span>
        <span class="verdict-name">{c.name}</span>
      </div>
      <p class="verdict-text">{c.verdict}</p>
      {#if c.relatedTool}
        <a href={c.relatedTool.url} class="verdict-link">{c.relatedTool.cta}</a>
      {/if}
    </section>

    <!-- Section 2: Scorecard Grid -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">01</span>
        <h2 class="results-section-heading">Scorecard</h2>
      </div>

      <div class="scorecard-grid">
        {#each Object.entries(r.metrics) as [key, m]}
          {#if m.scored}
            <div class="metric-card" class:metric-card--constraint={isConstraintMetric(c.id, key)}>
              <div class="metric-card-top">
                <span class="metric-card-name">{metricLabels[key] || key}</span>
                <span class="metric-card-health {healthClass(m.health)}">{healthLabel(m.health)}</span>
              </div>
              <span class="metric-card-value {healthClass(m.health)}">{formatMetric(key, m)}</span>
              <span class="metric-card-benchmark">{m.benchmark}</span>
              <span class="metric-card-interpretation">{m.interpretation}</span>
            </div>
          {:else}
            <div class="metric-card metric-card--unscored">
              <div class="metric-card-top">
                <span class="metric-card-name">{metricLabels[key] || key}</span>
              </div>
              <span class="metric-card-value health--muted">Not enough data</span>
              <span class="metric-card-benchmark">Provide {m.missingInput || 'additional data'} for this score</span>
            </div>
          {/if}
        {/each}
      </div>

      {#if r.incompleteAssessment}
        <p class="incomplete-note">This assessment scored {r.scoredMetricsCount} of 11 possible metrics. Complete the optional fields for a fuller picture.</p>
      {/if}
    </section>

    <!-- Section 3: Watch List -->
    {#if r.watchList.length > 0}
      <section class="results-section">
        <div class="results-section-header">
          <span class="results-section-number">02</span>
          <h2 class="results-section-heading">Also worth watching</h2>
        </div>
        <div class="watch-list">
          {#each r.watchList as item}
            <p class="watch-item">{item.message}</p>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Section 4: Recommendations -->
    {#if r.recommendations.length > 0}
      <section class="results-section">
        <div class="results-section-header">
          <span class="results-section-number">{r.watchList.length > 0 ? '03' : '02'}</span>
          <h2 class="results-section-heading">Recommended Next Steps</h2>
        </div>
        <div class="recommendations">
          {#each r.recommendations as rec, i}
            <div class="recommendation">
              <span class="recommendation-number">{i + 1}</span>
              <p class="recommendation-text">{rec.text}</p>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Actions -->
    <div class="results-actions">
      <button class="action-btn" onclick={downloadPDF} disabled={pdfGenerating}>
        {#if pdfGenerating}
          Generating...
        {:else}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Download PDF
        {/if}
      </button>
      <button class="action-btn" onclick={copyResults}>
        {#if copied}
          Copied
        {:else}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy results
        {/if}
      </button>
      <button class="action-btn action-btn--text" onclick={startOver}>Start over</button>
    </div>

    <!-- CTA -->
    <div class="results-cta">
      <span class="cta-question">Want to build a plan around these numbers?</span>
      <a href="/contact" class="cta-link">Talk to Devin
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>

    <!-- Related tools -->
    <div class="related-tools">
      <span class="related-tools-heading">Also on devin.vc</span>
      {#each contextualTools as tool}
        <a href={tool.href} class="related-tool-card">
          <div class="related-tool-info">
            <span class="related-tool-title">{tool.title}</span>
            <span class="related-tool-desc">{tool.description}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      {/each}
    </div>
  </div>
{:else if showLeadCapture}
  <!-- Lead Capture Gate -->
  <div class="lead-capture" onkeydown={e => { if (e.key === 'Enter' && leadFormValid) submitLead(); }}>
    <div class="teaser-card">
      <div class="teaser-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
      </div>
      <span class="teaser-title">Your scorecard preview</span>
      <div class="teaser-rows">
        <div class="teaser-row"><div class="teaser-shimmer" style="width: 70%"></div></div>
        <div class="teaser-row"><div class="teaser-shimmer" style="width: 50%"></div></div>
        <div class="teaser-row"><div class="teaser-shimmer" style="width: 60%"></div></div>
      </div>
    </div>

    <h2 class="lead-heading">See your full diagnosis</h2>

    <div class="lead-field">
      <input
        type="text"
        class="lead-input"
        placeholder="First name"
        bind:value={leadName}
        autocomplete="given-name"
      />
      <div class="lead-input-line"></div>
    </div>

    <div class="lead-field">
      <input
        type="email"
        class="lead-input"
        placeholder="Work email"
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

    <label class="lead-consent">
      <input type="checkbox" bind:checked={leadConsent} />
      <span>Send me a copy of my scorecard</span>
    </label>

    {#if leadError}
      <p class="lead-error">{leadError}</p>
    {/if}

    <div class="lead-actions">
      <button class="lead-submit" onclick={submitLead} disabled={!leadFormValid || leadSubmitting}>
        {leadSubmitting ? 'Sending...' : 'Get my scorecard'}
      </button>
      {#if leadAttempts >= 2}
        <button class="lead-skip" onclick={skipToResults}>Skip and view results</button>
      {/if}
      <button class="lead-back" onclick={back}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7H1M6 2L1 7l5 5" /></svg>
        Back
      </button>
    </div>
  </div>
{:else}
  <!-- Wizard -->
  <div class="wizard" onkeydown={handleKeydown}>
    <header class="wizard-header">
      <span class="wizard-tag">Marketing Efficiency Scorecard</span>
      <p class="wizard-progress">{currentStep} of {totalSteps} <span class="wizard-category">· {stepCategory(currentStep)}</span></p>
    </header>

    <div class="wizard-step" style="--dir: {direction}">
      {#key currentStep}
        <div class="step-content">
          <!-- Step 1: Stage + Model -->
          {#if currentStep === 1}
            <h2 class="step-label">Tell us about your business</h2>

            <div class="card-group">
              <span class="card-group-label">Where are you in your growth journey?</span>
              <div class="card-options">
                {#each Object.entries(STAGES) as [key, s]}
                  <button
                    type="button"
                    class="card-option"
                    class:card-option--active={stage === key}
                    onclick={() => stage = key}
                  >
                    <span class="card-option-name">{s.label}</span>
                    <span class="card-option-detail">{s.arrRange}</span>
                  </button>
                {/each}
              </div>
            </div>

            {#if stage != null}
              <div class="card-group">
                <span class="card-group-label">How do you sell?</span>
                <div class="card-options">
                  {#each Object.entries(MODELS) as [key, m]}
                    <button
                      type="button"
                      class="card-option"
                      class:card-option--active={model === key}
                      onclick={() => model = key}
                    >
                      <span class="card-option-name">{m.label}</span>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

          <!-- Step 2: ARR -->
          {:else if currentStep === 2}
            <h2 class="step-label">What's your current annual recurring revenue?</h2>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input step-input--currency"
                inputmode="numeric"
                placeholder="$2,000,000"
                value={arr != null && !inputFocused ? formatWithCommas(arr) : (arr ?? '')}
                oninput={(e) => handleNumericInput(e, v => arr = v)}
                onblur={(e) => handleNumericBlur(e, v => arr = v)}
                onfocus={(e) => handleNumericFocus(e, arr)}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
            </div>

          <!-- Step 3: Acquisition (combined) -->
          {:else if currentStep === 3}
            <h2 class="step-label">How much do you spend and how many customers do you add each month?</h2>
            <p class="step-hint">Let's see how much of your growth budget goes to replacement vs. real growth.</p>
            <div class="combo-inputs">
              <div class="input-wrap">
                <label class="combo-label">Monthly marketing spend</label>
                <input
                  type="text"
                  class="step-input step-input--currency"
                  inputmode="numeric"
                  placeholder="$25,000"
                  value={marketingSpend != null && !inputFocused ? formatWithCommas(marketingSpend) : (marketingSpend ?? '')}
                  oninput={(e) => handleNumericInput(e, v => marketingSpend = v)}
                  onblur={(e) => handleNumericBlur(e, v => marketingSpend = v)}
                  onfocus={(e) => handleNumericFocus(e, marketingSpend)}
                />
                <div class="input-line" class:input-line--focus={inputFocused}></div>
              </div>
              <div class="input-wrap">
                <label class="combo-label">New customers per month</label>
                <input
                  type="text"
                  class="step-input"
                  inputmode="numeric"
                  placeholder="15"
                  value={newCustomersMonth != null && !inputFocused ? formatWithCommas(newCustomersMonth) : (newCustomersMonth ?? '')}
                  oninput={(e) => handleNumericInput(e, v => newCustomersMonth = v)}
                  onblur={(e) => handleNumericBlur(e, v => newCustomersMonth = v)}
                  onfocus={(e) => handleNumericFocus(e, newCustomersMonth)}
                />
                <div class="input-line" class:input-line--focus={inputFocused}></div>
              </div>
            </div>

          <!-- Step 4: ACV -->
          {:else if currentStep === 4}
            <h2 class="step-label">What's your average annual contract value?</h2>
            <p class="step-hint">{acvBenchmark}</p>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input step-input--currency"
                inputmode="numeric"
                placeholder="$20,000"
                value={acv != null && !inputFocused ? formatWithCommas(acv) : (acv ?? '')}
                oninput={(e) => handleNumericInput(e, v => acv = v)}
                onblur={(e) => handleNumericBlur(e, v => acv = v)}
                onfocus={(e) => handleNumericFocus(e, acv)}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
            </div>

          <!-- Step 5: Churn -->
          {:else if currentStep === 5}
            <h2 class="step-label">What percentage of customers do you lose each month?</h2>
            <p class="step-hint">{churnBenchmark}</p>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input step-input--percent"
                inputmode="decimal"
                placeholder={String(churnDefault)}
                value={monthlyChurnRate ?? ''}
                oninput={(e) => { monthlyChurnRate = parseFloat(e.target.value) || null; }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
            </div>

          <!-- Step 6: Expansion -->
          {:else if currentStep === 6}
            <h2 class="step-label">What percentage of existing revenue comes from upsells/expansions each month?</h2>
            <p class="step-hint">Top performers: 2-3%/month, most SMBs: 0-1%. Don't track this yet? Leave it at 0%.</p>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input step-input--percent"
                inputmode="decimal"
                placeholder="0.5"
                value={expansionRate ?? ''}
                oninput={(e) => { expansionRate = parseFloat(e.target.value) ?? 0; }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
            </div>

          <!-- Step 7: Sales Cycle (optional) -->
          {:else if currentStep === 7}
            <h2 class="step-label">How long from first touch to closed deal?</h2>
            <p class="step-hint">{cycleBenchmark}</p>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input"
                inputmode="numeric"
                placeholder="60 days"
                value={salesCycleLength ?? ''}
                oninput={(e) => { salesCycleLength = parseInt(e.target.value) || null; }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
              <span class="input-suffix">days</span>
            </div>

          <!-- Step 8: Pipeline Value (optional) -->
          {:else if currentStep === 8}
            <h2 class="step-label">What's the total dollar value of your active pipeline right now?</h2>
            <p class="step-hint">Healthy pipeline: 3-4x monthly revenue target</p>
            <div class="input-wrap">
              <input
                type="text"
                class="step-input step-input--currency"
                inputmode="numeric"
                placeholder="$800,000"
                value={pipelineValue != null && !inputFocused ? formatWithCommas(pipelineValue) : (pipelineValue ?? '')}
                oninput={(e) => handleNumericInput(e, v => pipelineValue = v)}
                onblur={(e) => handleNumericBlur(e, v => pipelineValue = v)}
                onfocus={(e) => handleNumericFocus(e, pipelineValue)}
              />
              <div class="input-line" class:input-line--focus={inputFocused}></div>
            </div>

          <!-- Step 9: Funnel (optional, combined) -->
          {:else if currentStep === 9}
            <h2 class="step-label">How many leads do you get and what percentage become customers?</h2>
            <div class="combo-inputs">
              <div class="input-wrap">
                <label class="combo-label">Monthly inbound leads</label>
                <input
                  type="text"
                  class="step-input"
                  inputmode="numeric"
                  placeholder="500"
                  value={monthlyLeadVolume != null && !inputFocused ? formatWithCommas(monthlyLeadVolume) : (monthlyLeadVolume ?? '')}
                  oninput={(e) => handleNumericInput(e, v => monthlyLeadVolume = v)}
                  onblur={(e) => handleNumericBlur(e, v => monthlyLeadVolume = v)}
                  onfocus={(e) => handleNumericFocus(e, monthlyLeadVolume)}
                />
                <div class="input-line" class:input-line--focus={inputFocused}></div>
              </div>
              <div class="input-wrap">
                <label class="combo-label">Lead-to-customer rate</label>
                <input
                  type="text"
                  class="step-input step-input--percent"
                  inputmode="decimal"
                  placeholder="3%"
                  value={leadToCustomerRate ?? ''}
                  oninput={(e) => { leadToCustomerRate = parseFloat(e.target.value) || null; }}
                  onblur={() => inputFocused = false}
                  onfocus={() => inputFocused = true}
                />
                <div class="input-line" class:input-line--focus={inputFocused}></div>
              </div>
            </div>
          {/if}
        </div>
      {/key}
    </div>

    <!-- Navigation -->
    <div class="wizard-nav">
      {#if currentStep > 1}
        <button class="wizard-nav-btn wizard-nav-btn--back" onclick={back}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7H1M6 2L1 7l5 5" /></svg>
          Back
        </button>
      {:else}
        <div></div>
      {/if}

      <div class="wizard-nav-right">
        {#if currentStep >= 7}
          <button class="wizard-skip-btn" onclick={skipStep}>
            I don't know, skip
          </button>
        {/if}
        <button
          class="wizard-nav-btn wizard-nav-btn--next"
          onclick={next}
          disabled={!currentStepValid}
        >
          {currentStep === totalSteps ? 'See my scorecard' : 'Next'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ── Wizard ── */
  .wizard { max-width: 720px; margin: 0 auto; }

  .wizard-header { margin-bottom: 2rem; }

  .wizard-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent-teal);
    border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent);
    background: color-mix(in oklab, var(--color-accent-teal) 4%, transparent);
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
  }

  .wizard-progress {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0.75rem 0 0;
  }

  .wizard-category { color: var(--color-text-dim); }

  .wizard-step { min-height: 200px; }

  .step-content { padding: 1rem 0 2rem; }

  .step-label {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    line-height: 1.3;
    margin: 0 0 0.5rem;
  }

  .step-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  /* ── Card Selections (Step 1) ── */
  .card-group { margin-bottom: 1.5rem; }

  .card-group-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .card-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .card-option {
    background: color-mix(in oklab, var(--color-text) 3%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    padding: 1rem;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .card-option:hover {
    border-color: color-mix(in oklab, var(--color-accent) 30%, transparent);
    background: color-mix(in oklab, var(--color-accent) 4%, transparent);
  }

  .card-option--active {
    border-color: var(--color-accent);
    background: color-mix(in oklab, var(--color-accent) 6%, transparent);
  }

  .card-option-name {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }

  .card-option-detail {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    color: var(--color-text-dim);
    margin-top: 0.25rem;
  }

  /* ── Inputs ── */
  .input-wrap {
    position: relative;
    margin-bottom: 1rem;
  }

  .combo-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .combo-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .step-input {
    width: 100%;
    background: transparent;
    border: none;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    padding: 0.5rem 0;
    outline: none;
    caret-color: var(--color-accent);
  }

  .step-input::placeholder { color: var(--color-text-dim); opacity: 0.5; }

  .input-line {
    height: 2px;
    background: color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    border-radius: 1px;
    transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .input-line--focus { background: var(--color-accent); }

  .input-suffix {
    position: absolute;
    right: 0;
    bottom: 0.75rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    pointer-events: none;
  }

  /* ── Navigation ── */
  .wizard-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .wizard-nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .wizard-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    padding: 0.6rem 1.25rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
  }

  .wizard-nav-btn--back {
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    color: var(--color-text-muted);
  }

  .wizard-nav-btn--back:hover { color: var(--color-text); border-color: color-mix(in oklab, var(--color-text-muted) 40%, transparent); }

  .wizard-nav-btn--next {
    background: var(--color-accent);
    border: none;
    color: var(--color-bg);
  }

  .wizard-nav-btn--next:hover { opacity: 0.9; }
  .wizard-nav-btn--next:disabled { opacity: 0.35; cursor: not-allowed; }

  .wizard-skip-btn {
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.2s;
  }

  .wizard-skip-btn:hover { color: var(--color-text-muted); }

  /* ── Lead Capture ── */
  .lead-capture { max-width: 480px; margin: 0 auto; text-align: center; }

  .teaser-card {
    background: color-mix(in oklab, var(--color-text) 3%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-lg);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .teaser-icon { color: var(--color-text-dim); margin-bottom: 0.75rem; }

  .teaser-title {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-muted);
    margin-bottom: 1.25rem;
  }

  .teaser-rows { display: flex; flex-direction: column; gap: 0.6rem; }

  .teaser-row {
    height: 12px;
    background: color-mix(in oklab, var(--color-text-muted) 8%, transparent);
    border-radius: 3px;
    overflow: hidden;
  }

  .teaser-shimmer {
    height: 100%;
    background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-accent) 10%, transparent), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }

  .lead-heading {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    margin: 0 0 1.5rem;
  }

  .lead-field { margin-bottom: 1rem; }

  .lead-input {
    width: 100%;
    background: transparent;
    border: none;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    padding: 0.5rem 0;
    outline: none;
    text-align: center;
    caret-color: var(--color-accent);
  }

  .lead-input::placeholder { color: var(--color-text-dim); opacity: 0.5; }

  .lead-input-line {
    height: 2px;
    background: color-mix(in oklab, var(--color-text-muted) 20%, transparent);
    border-radius: 1px;
    transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lead-input:focus ~ .lead-input-line { background: var(--color-accent); }

  .lead-consent {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 1.5rem 0;
    cursor: pointer;
  }

  .lead-error {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-accent-rust);
    margin: 0 0 1rem;
  }

  .lead-actions { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }

  .lead-submit {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .lead-submit:hover { opacity: 0.9; }
  .lead-submit:disabled { opacity: 0.4; cursor: not-allowed; }

  .lead-skip, .lead-back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    cursor: pointer;
    transition: color 0.2s;
  }

  .lead-skip:hover, .lead-back:hover { color: var(--color-text-muted); }

  /* ── Results Dashboard ── */
  .results-dashboard { max-width: 840px; margin: 0 auto; }

  .results-header { margin-bottom: 1.5rem; }

  .results-tag {
    display: inline-flex;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent-teal);
    border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent);
    background: color-mix(in oklab, var(--color-accent-teal) 4%, transparent);
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
  }

  .results-hero-context {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin: 0.75rem 0 0;
  }

  .results-email-sent {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    color: var(--color-accent-teal);
    border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent);
    background: color-mix(in oklab, var(--color-accent-teal) 4%, transparent);
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
    margin-bottom: 1.5rem;
  }

  .outlier-warnings { margin-bottom: 1.5rem; }

  .outlier-warning {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    padding: 0.75rem 1rem;
    background: color-mix(in oklab, var(--color-accent-amber) 4%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-accent-amber) 12%, transparent);
    border-radius: var(--radius-sm);
    margin-bottom: 0.5rem;
  }

  .outlier-warning svg { flex-shrink: 0; color: var(--color-accent-amber); margin-top: 1px; }

  .pre-revenue-note {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    line-height: 1.6;
    padding: 1rem;
    background: color-mix(in oklab, var(--color-text) 3%, transparent);
    border-radius: var(--radius-sm);
    margin-bottom: 1.5rem;
  }

  /* ── Verdict Card ── */
  .verdict-card {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    background: color-mix(in oklab, var(--color-text) 3%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    margin-bottom: 2rem;
  }

  .verdict-card.severity--critical { border-left: 3px solid var(--color-accent-rust); }
  .verdict-card.severity--warning { border-left: 3px solid var(--color-accent-amber); }
  .verdict-card.severity--opportunity { border-left: 3px solid var(--color-accent); }
  .verdict-card.severity--healthy { border-left: 3px solid var(--color-accent-teal); }

  .verdict-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }

  .verdict-severity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .verdict-severity-dot.severity--critical { background: var(--color-accent-rust); }
  .verdict-severity-dot.severity--warning { background: var(--color-accent-amber); }
  .verdict-severity-dot.severity--opportunity { background: var(--color-accent); }
  .verdict-severity-dot.severity--healthy { background: var(--color-accent-teal); }

  .verdict-name {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--color-text);
  }

  .verdict-text {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .verdict-link {
    display: inline-block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-accent);
    text-decoration: none;
    margin-top: 0.75rem;
    transition: opacity 0.2s;
  }

  .verdict-link:hover { opacity: 0.8; }

  /* ── Section Headers ── */
  .results-section { margin-bottom: 2rem; }

  .results-section-header {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .results-section-number {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-dim);
    letter-spacing: var(--tracking-wide);
  }

  .results-section-heading {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--weight-regular);
    color: var(--color-text);
    margin: 0;
  }

  /* ── Scorecard Grid ── */
  .scorecard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .metric-card {
    background: color-mix(in oklab, var(--color-text) 3%, transparent);
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .metric-card--constraint {
    border-left: 2px solid var(--color-accent);
    background: color-mix(in oklab, var(--color-accent) 3%, transparent);
  }

  .metric-card--unscored {
    opacity: 0.5;
    border-style: dashed;
  }

  .metric-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .metric-card-name {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .metric-card-health {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: var(--weight-medium);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .metric-card-health.health--strong { color: var(--color-accent-teal); background: color-mix(in oklab, var(--color-accent-teal) 10%, transparent); }
  .metric-card-health.health--healthy { color: var(--color-accent-teal); background: color-mix(in oklab, var(--color-accent-teal) 10%, transparent); }
  .metric-card-health.health--warning { color: var(--color-accent-amber); background: color-mix(in oklab, var(--color-accent-amber) 10%, transparent); }
  .metric-card-health.health--critical { color: var(--color-accent-rust); background: color-mix(in oklab, var(--color-accent-rust) 10%, transparent); }

  .metric-card-value {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--color-text);
    line-height: 1.2;
  }

  .metric-card-value.health--strong, .metric-card-value.health--healthy { color: var(--color-accent-teal); }
  .metric-card-value.health--warning { color: var(--color-accent-amber); }
  .metric-card-value.health--critical { color: var(--color-accent-rust); }
  .metric-card-value.health--muted { color: var(--color-text-dim); font-size: var(--text-sm); }

  .metric-card-benchmark {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--color-text-dim);
    line-height: 1.4;
  }

  .metric-card-interpretation {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.5;
    margin-top: 0.25rem;
  }

  .incomplete-note {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-dim);
    margin-top: 1rem;
    font-style: italic;
  }

  /* ── Watch List ── */
  .watch-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .watch-item {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
    margin: 0;
    padding-left: 1rem;
    border-left: 2px solid var(--color-accent-amber);
  }

  /* ── Recommendations ── */
  .recommendations { display: flex; flex-direction: column; gap: 1rem; }

  .recommendation {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .recommendation-number {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-accent);
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in oklab, var(--color-accent) 25%, transparent);
    border-radius: 50%;
    margin-top: 2px;
  }

  .recommendation-text {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* ── Actions ── */
  .results-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 0;
    border-top: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    margin-top: 1rem;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 15%, transparent);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }

  .action-btn:hover { color: var(--color-text); border-color: color-mix(in oklab, var(--color-text-muted) 30%, transparent); }
  .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .action-btn--text {
    border: none;
    color: var(--color-text-dim);
    padding: 0.5rem 0.75rem;
  }

  .action-btn--text:hover { color: var(--color-text-muted); }

  /* ── CTA ── */
  .results-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 12%, transparent);
    border-radius: var(--radius-md);
    margin-top: 2rem;
    gap: 1rem;
  }

  .cta-question {
    font-family: var(--font-display);
    font-style: italic;
    font-size: var(--text-base);
    color: var(--color-text);
  }

  .cta-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-accent);
    text-decoration: none;
    border: 1px solid color-mix(in oklab, var(--color-accent) 25%, transparent);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    transition: background 0.2s, color 0.2s;
  }

  .cta-link:hover {
    background: color-mix(in oklab, var(--color-accent) 8%, transparent);
  }

  /* ── Related Tools ── */
  .related-tools { margin-top: 2.5rem; }

  .related-tools-heading {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    color: var(--color-text-dim);
    margin-bottom: 0.75rem;
  }

  .related-tool-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border: 1px solid color-mix(in oklab, var(--color-text-muted) 10%, transparent);
    border-radius: var(--radius-md);
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: border-color 0.2s, background 0.2s;
  }

  .related-tool-card:hover {
    border-color: color-mix(in oklab, var(--color-accent) 25%, transparent);
    background: color-mix(in oklab, var(--color-accent) 3%, transparent);
  }

  .related-tool-card svg { color: var(--color-text-dim); flex-shrink: 0; }

  .related-tool-info { display: flex; flex-direction: column; gap: 0.2rem; }

  .related-tool-title {
    font-family: var(--font-display);
    font-size: var(--text-base);
    color: var(--color-text);
  }

  .related-tool-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: var(--text-xs);
    color: var(--color-text-dim);
    line-height: 1.4;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .card-options { grid-template-columns: 1fr; }
    .combo-inputs { grid-template-columns: 1fr; gap: 1rem; }
    .scorecard-grid { grid-template-columns: 1fr; }
    .results-cta { flex-direction: column; text-align: center; }
    .results-actions { flex-wrap: wrap; }
    .step-input { font-size: var(--text-xl); }
    .lead-input { font-size: var(--text-xl); }
  }
</style>
