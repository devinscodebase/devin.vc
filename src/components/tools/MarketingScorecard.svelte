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
  let showHowItWorks = $state(false);

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
    'B2B average: $10K-$50K'
  );

  let cycleBenchmark = $derived(
    model === 'enterprise' ? 'Enterprise average: 90-180 days' :
    model === 'plg' ? 'PLG average: 14-30 days' :
    'B2B average: 30-90 days'
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
    showHowItWorks = false;
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
      const halfW = cw * 0.47;
      const rightX = mx + cw * 0.53;

      // Health color helper
      function hc(m) {
        if (m.health === 'critical' || m.health === 'contraction') return rust;
        if (m.health === 'warning' || m.health === 'stable') return amber;
        if (m.health === 'strong' || m.health === 'elite') return teal;
        return text;
      }

      // Render a single metric row: label left, value right-aligned, one line
      function row(x, y, label, value, color, w) {
        doc.setFontSize(9);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...muted);
        doc.text(label, x, y);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...color);
        doc.text(value, x + w, y, { align: 'right' });
      }

      // Render a scored metric by key
      function mrow(x, y, key, w) {
        const m = r.metrics[key];
        if (!m?.scored) return false;
        row(x, y, metricLabels[key] || key, formatMetric(key, m), hc(m), w);
        return true;
      }

      // ── Header ──
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

      let y = 53;

      // ── Constraint Card ──
      doc.setFontSize(9);
      const verdictLines = doc.splitTextToSize(c.verdict, cw - 10);
      const cardH = 10 + verdictLines.length * 4 + 4;

      // Elevated card background
      doc.setFillColor(...elevated);
      doc.roundedRect(mx, y - 2, cw, cardH, 1.5, 1.5, 'F');

      // Severity-colored left accent bar
      const sColor = severityColors[c.severity] || teal;
      doc.setFillColor(...sColor);
      doc.rect(mx, y - 2, 1.5, cardH, 'F');

      // Constraint label
      doc.setFontSize(8);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(...sColor);
      doc.text(c.name.toUpperCase(), mx + 6, y + 3);

      // Verdict text
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...text);
      doc.text(verdictLines, mx + 6, y + 9);

      y += cardH + 6;

      // ── Metrics: Acquisition (left) & Retention (right) ──
      const rh = 5.5; // row height — one line per metric

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(...teal);
      doc.text('ACQUISITION', mx, y);
      doc.text('RETENTION & GROWTH', rightX, y);
      y += 5;

      const acqKeys = ['cac', 'ltv', 'ltvCac', 'cacPayback'];
      const retKeys = ['nrr', 'monthlyChurn', 'mer', 'marketingSpendPercent'];

      const maxRows = Math.max(acqKeys.length, retKeys.length);
      for (let i = 0; i < maxRows; i++) {
        const ry = y + i * rh;
        if (i < acqKeys.length) mrow(mx, ry, acqKeys[i], halfW - 2);
        if (i < retKeys.length) mrow(rightX, ry, retKeys[i], halfW - 2);
      }

      y += maxRows * rh + 3;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 5;

      // ── Metrics: Pipeline ──
      doc.setFontSize(8);
      doc.setTextColor(...teal);
      doc.text('PIPELINE', mx, y);
      y += 5;

      const pipKeys = ['pipelineCoverage', 'pipelineVelocity', 'conversionRate'];
      let pi = 0;
      for (const k of pipKeys) {
        const m = r.metrics[k];
        if (!m?.scored) continue;
        const col = pi % 2;
        const rx = col === 0 ? mx : rightX;
        const ry = y + Math.floor(pi / 2) * rh;
        mrow(rx, ry, k, halfW - 2);
        pi++;
      }

      y += Math.ceil(pi / 2) * rh + 3;
      doc.setDrawColor(...border);
      doc.line(mx, y, W - mx, y);
      y += 5;

      // ── Watch List ──
      if (r.watchList.length > 0) {
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...amber);
        doc.text('WATCH', mx, y);
        y += 4.5;
        r.watchList.forEach(item => {
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(...dim);
          const wLines = doc.splitTextToSize(item.message, cw);
          doc.text(wLines, mx, y);
          y += wLines.length * 3.5 + 1;
        });
        y += 2;
        doc.setDrawColor(...border);
        doc.line(mx, y, W - mx, y);
        y += 5;
      }

      // ── Next Steps ──
      if (r.recommendations.length > 0) {
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...teal);
        doc.text('NEXT STEPS', mx, y);
        y += 4.5;
        r.recommendations.forEach((rec, i) => {
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(...text);
          const rLines = doc.splitTextToSize(`${i + 1}. ${rec.text}`, cw);
          doc.text(rLines, mx, y);
          y += rLines.length * 3.5 + 1.5;
        });
        y += 2;
        doc.setDrawColor(...border);
        doc.line(mx, y, W - mx, y);
        y += 5;
      }

      // ── Glossary (compact single-line definitions) ──
      doc.setFontSize(7);
      doc.setTextColor(...dim);
      doc.setFont('Helvetica', 'normal');
      const glossary = [
        ['CAC', 'Acquisition cost per customer'],
        ['LTV:CAC', 'Lifetime value per dollar acquired. 3-5:1 healthy'],
        ['NRR', 'Revenue retained + expansion from existing customers'],
        ['MER', 'Total revenue per marketing dollar spent'],
        ['Pipeline', 'Active pipeline as multiple of target. 3-4x healthy'],
      ];
      glossary.forEach(([term, def]) => {
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(...accent);
        doc.text(term, mx, y);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(...dim);
        doc.text(def, mx + 24, y);
        y += 3.5;
      });

      // ── Footer ──
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
      <p class="results-hero-number">{r.scoredMetricsCount}<span class="results-hero-fraction">/11</span></p>
      <p class="results-hero-eyebrow">metrics scored</p>
      <p class="results-hero-context">{STAGES[stage]?.label || stage} &nbsp;·&nbsp; {fmtCurrency(arr)} ARR &nbsp;·&nbsp; {MODELS[model]?.label || model}</p>
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
    <section class="results-section">
      <div class="verdict-block {severityClass(c.severity)}">
        <div class="verdict-header">
          <span class="verdict-severity-dot {severityClass(c.severity)}"></span>
          <span class="verdict-name">{c.name}</span>
        </div>
        <p class="verdict-text">{c.verdict}</p>
        {#if c.relatedTool}
          <a href={c.relatedTool.url} class="verdict-link">{c.relatedTool.cta} &rarr;</a>
        {/if}
      </div>
    </section>

    <!-- Section 2: Scorecard -->
    <section class="results-section">
      <div class="results-section-header">
        <span class="results-section-number">01</span>
        <h2 class="results-section-heading">Scorecard</h2>
      </div>

      <div class="scorecard-table">
        {#each Object.entries(r.metrics) as [key, m]}
          {#if m.scored}
            <div class="metric-row" class:metric-row--constraint={isConstraintMetric(c.id, key)}>
              <span class="metric-row-name">{metricLabels[key] || key}</span>
              <span class="metric-row-value {healthClass(m.health)}">{formatMetric(key, m)}</span>
              <span class="metric-row-health {healthClass(m.health)}">{healthLabel(m.health)}</span>
            </div>
            <div class="metric-detail">
              <span class="metric-detail-benchmark">{m.benchmark}</span>
              <span class="metric-detail-interpretation">{m.interpretation}</span>
            </div>
          {:else}
            <div class="metric-row metric-row--unscored">
              <span class="metric-row-name">{metricLabels[key] || key}</span>
              <span class="metric-row-value health--muted">&mdash;</span>
              <span class="metric-row-health health--muted">Needs data</span>
            </div>
          {/if}
        {/each}
      </div>

      {#if r.incompleteAssessment}
        <p class="incomplete-note">{r.scoredMetricsCount} of 11 metrics scored. Complete the optional fields for a fuller picture.</p>
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

    <!-- CTA -->
    <div class="results-cta">
      <p class="results-cta-text">Want to build a plan around these numbers?</p>
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
          {#each contextualTools as tool}
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
      <h1 class="wizard-title">Marketing Efficiency Scorecard</h1>
      <p class="wizard-subtitle">Find out what's actually holding your marketing back.</p>
    </header>

    <div class="progress" role="progressbar" aria-valuenow={totalSteps} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div class="progress-dots">
        {#each Array(totalSteps) as _}
          <span class="dot dot--completed"></span>
        {/each}
        <span class="dot dot--current"></span>
      </div>
      <span class="progress-label">Your details</span>
    </div>

    <div class="lead-content">
      <h2 class="lead-heading">Your scorecard is ready.</h2>
      <p class="lead-subheading">Enter your details to unlock your results. We'll email you a copy too.</p>

      {#if results}
        <div class="lead-teaser">
          <div class="lead-teaser-header">
            <svg class="lead-teaser-lock" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4 5.5V3.5a2 2 0 014 0V5.5"/></svg>
            <span class="lead-teaser-title">Your results preview</span>
          </div>
          <div class="lead-teaser-rows">
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Primary constraint</span>
              <span class="lead-teaser-redacted" style="width: 5.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Metrics scored</span>
              <span class="lead-teaser-redacted" style="width: 3.5rem"></span>
            </div>
            <div class="lead-teaser-row">
              <span class="lead-teaser-label">Recommendations</span>
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
          Get Your Scorecard
        {/if}
      </button>
    </nav>
  </div>
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="wizard" onkeydown={handleKeydown}>
    <header class="wizard-header">
      <span class="tag-label">Tools</span>
      <h1 class="wizard-title">Marketing Efficiency Scorecard</h1>
      <p class="wizard-subtitle">Find out what's actually holding your marketing back.</p>

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
        <p class="hiw-body">Answer 9 questions about your marketing metrics. We'll score each against stage-specific benchmarks, identify your primary constraint, and give you a specific diagnosis with actionable recommendations. No account required.</p>
        <div class="hiw-glossary">
          <h3 class="hiw-heading">Jargon decoder</h3>
          <dl class="hiw-defs">
            <div class="hiw-def"><dt>CAC</dt><dd>Customer Acquisition Cost. Total spend to acquire one new customer.</dd></div>
            <div class="hiw-def"><dt>LTV:CAC</dt><dd>Lifetime Value per acquisition dollar. 3:1 to 5:1 is healthy.</dd></div>
            <div class="hiw-def"><dt>NRR</dt><dd>Net Revenue Retention. Revenue kept plus expansion over 12 months.</dd></div>
            <div class="hiw-def"><dt>MER</dt><dd>Marketing Efficiency Ratio. Total revenue per marketing dollar.</dd></div>
            <div class="hiw-def"><dt>ACV</dt><dd>Annual Contract Value. Average yearly revenue per customer.</dd></div>
            <div class="hiw-def"><dt>Pipeline</dt><dd>Total dollar value of active deals in your sales funnel.</dd></div>
          </dl>
        </div>
      </div>
    </div>

    <div class="progress" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div class="progress-dots">
        {#each Array(totalSteps) as _, i}
          <span class="dot" class:dot--completed={i < currentStep - 1} class:dot--current={i === currentStep - 1} class:dot--future={i > currentStep - 1}></span>
        {/each}
      </div>
      <span class="progress-label">Step {currentStep} of {totalSteps}</span>
    </div>

    {#key currentStep}
      <div class="step-content" class:slide-from-right={direction === 1} class:slide-from-left={direction === -1}>
        <span class="step-category">{stepCategory(currentStep)}</span>

        <!-- Step 1: Stage + Model -->
        {#if currentStep === 1}
          <h2 class="step-question">Tell us about your business</h2>

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
          <h2 class="step-question">What's your current annual recurring revenue?</h2>
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                class="input-currency"
                inputmode="numeric"
                placeholder="2,000,000"
                value={arr != null && !inputFocused ? formatWithCommas(arr) : (arr ?? '')}
                oninput={(e) => handleNumericInput(e, v => arr = v)}
                onblur={(e) => handleNumericBlur(e, v => arr = v)}
                onfocus={(e) => handleNumericFocus(e, arr)}
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>

        <!-- Step 3: Acquisition (combined) -->
        {:else if currentStep === 3}
          <h2 class="step-question">How much do you spend and how many customers do you add each month?</h2>
          <p class="benchmark">Let's see how much of your growth budget goes to replacement vs. real growth.</p>
          <div class="combo-inputs">
            <div class="input-row">
              <label class="combo-label">Monthly marketing spend</label>
              <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
                <span class="currency-prefix">$</span>
                <input
                  type="text"
                  class="input-currency"
                  inputmode="numeric"
                  placeholder="25,000"
                  value={marketingSpend != null && !inputFocused ? formatWithCommas(marketingSpend) : (marketingSpend ?? '')}
                  oninput={(e) => handleNumericInput(e, v => marketingSpend = v)}
                  onblur={(e) => handleNumericBlur(e, v => marketingSpend = v)}
                  onfocus={(e) => handleNumericFocus(e, marketingSpend)}
                />
              </div>
            </div>
            <div class="input-row">
              <label class="combo-label">New customers per month</label>
              <div class="suffix-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
                <input
                  type="text"
                  class="input-number"
                  inputmode="numeric"
                  placeholder="15"
                  value={newCustomersMonth != null && !inputFocused ? formatWithCommas(newCustomersMonth) : (newCustomersMonth ?? '')}
                  oninput={(e) => handleNumericInput(e, v => newCustomersMonth = v)}
                  onblur={(e) => handleNumericBlur(e, v => newCustomersMonth = v)}
                  onfocus={(e) => handleNumericFocus(e, newCustomersMonth)}
                />
              </div>
            </div>
          </div>

        <!-- Step 4: ACV -->
        {:else if currentStep === 4}
          <h2 class="step-question">What's your average annual contract value?</h2>
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                class="input-currency"
                inputmode="numeric"
                placeholder="20,000"
                value={acv != null && !inputFocused ? formatWithCommas(acv) : (acv ?? '')}
                oninput={(e) => handleNumericInput(e, v => acv = v)}
                onblur={(e) => handleNumericBlur(e, v => acv = v)}
                onfocus={(e) => handleNumericFocus(e, acv)}
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>
          <p class="benchmark">{acvBenchmark}</p>

        <!-- Step 5: Churn -->
        {:else if currentStep === 5}
          <h2 class="step-question">What percentage of customers do you lose each month?</h2>
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused}>
              <input
                type="text"
                class="input-number"
                inputmode="decimal"
                placeholder={String(churnDefault)}
                value={monthlyChurnRate ?? ''}
                oninput={(e) => { monthlyChurnRate = parseFloat(e.target.value) || null; }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <span class="input-suffix">%</span>
            </div>
          </div>
          <p class="benchmark">{churnBenchmark}</p>

        <!-- Step 6: Expansion -->
        {:else if currentStep === 6}
          <h2 class="step-question">What percentage of existing revenue comes from upsells/expansions each month?</h2>
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused}>
              <input
                type="text"
                class="input-number"
                inputmode="decimal"
                placeholder="0.5"
                value={expansionRate ?? ''}
                oninput={(e) => {
                  const v = parseFloat(e.target.value);
                  expansionRate = Number.isNaN(v) ? 0 : v;
                }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <span class="input-suffix">%</span>
            </div>
          </div>
          <p class="benchmark">Top performers: 2-3%/month, most SMBs: 0-1%. Don't track this yet? Leave it at 0%.</p>

        <!-- Step 7: Sales Cycle (optional) -->
        {:else if currentStep === 7}
          <h2 class="step-question">How long from first touch to closed deal?</h2>
          <div class="input-row">
            <div class="suffix-wrapper" class:focused={inputFocused}>
              <input
                type="text"
                class="input-number"
                inputmode="numeric"
                placeholder="60"
                value={salesCycleLength ?? ''}
                oninput={(e) => { salesCycleLength = parseInt(e.target.value) || null; }}
                onblur={() => inputFocused = false}
                onfocus={() => inputFocused = true}
              />
              <span class="input-suffix">days</span>
            </div>
          </div>
          <p class="benchmark">{cycleBenchmark}</p>

        <!-- Step 8: Pipeline Value (optional) -->
        {:else if currentStep === 8}
          <h2 class="step-question">What's the total dollar value of your active pipeline right now?</h2>
          <div class="input-row">
            <div class="currency-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
              <span class="currency-prefix">$</span>
              <input
                type="text"
                class="input-currency"
                inputmode="numeric"
                placeholder="800,000"
                value={pipelineValue != null && !inputFocused ? formatWithCommas(pipelineValue) : (pipelineValue ?? '')}
                oninput={(e) => handleNumericInput(e, v => pipelineValue = v)}
                onblur={(e) => handleNumericBlur(e, v => pipelineValue = v)}
                onfocus={(e) => handleNumericFocus(e, pipelineValue)}
              />
            </div>
            {#if inputInvalid}<p class="input-hint">Enter a number</p>{/if}
          </div>
          <p class="benchmark">Healthy pipeline: 3-4x monthly revenue target</p>

        <!-- Step 9: Funnel (optional, combined) -->
        {:else if currentStep === 9}
          <h2 class="step-question">How many leads do you get and what percentage become customers?</h2>
          <div class="combo-inputs">
            <div class="input-row">
              <label class="combo-label">Monthly inbound leads</label>
              <div class="suffix-wrapper" class:focused={inputFocused} class:invalid={inputInvalid}>
                <input
                  type="text"
                  class="input-number"
                  inputmode="numeric"
                  placeholder="500"
                  value={monthlyLeadVolume != null && !inputFocused ? formatWithCommas(monthlyLeadVolume) : (monthlyLeadVolume ?? '')}
                  oninput={(e) => handleNumericInput(e, v => monthlyLeadVolume = v)}
                  onblur={(e) => handleNumericBlur(e, v => monthlyLeadVolume = v)}
                  onfocus={(e) => handleNumericFocus(e, monthlyLeadVolume)}
                />
              </div>
            </div>
            <div class="input-row">
              <label class="combo-label">Lead-to-customer rate</label>
              <div class="suffix-wrapper" class:focused={inputFocused}>
                <input
                  type="text"
                  class="input-number"
                  inputmode="decimal"
                  placeholder="3"
                  value={leadToCustomerRate ?? ''}
                  oninput={(e) => { leadToCustomerRate = parseFloat(e.target.value) || null; }}
                  onblur={() => inputFocused = false}
                  onfocus={() => inputFocused = true}
                />
                <span class="input-suffix">%</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/key}

    <nav class="wizard-nav">
      {#if currentStep > 1}
        <button type="button" class="nav-back" onclick={back}>Back</button>
      {:else}
        <span></span>
      {/if}
      <div class="wizard-nav-right">
        {#if currentStep >= 7}
          <button type="button" class="nav-skip" onclick={skipStep}>I don't know, skip</button>
        {/if}
        <button
          type="button"
          class="nav-next"
          class:nav-next--disabled={!currentStepValid}
          disabled={!currentStepValid}
          onclick={next}
        >
          {currentStep === totalSteps ? 'See my scorecard' : 'Next'}
        </button>
      </div>
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

  /* Card selections */
  .card-group { margin-bottom: 1.5rem; }

  .card-group-label {
    display: block;
    font-family: var(--font-body);
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
    transition: border-color var(--duration-fast) var(--ease-out-expo), background var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo);
  }

  .card-option:hover {
    border-color: color-mix(in oklab, var(--color-accent) 30%, transparent);
    background: color-mix(in oklab, var(--color-accent) 4%, transparent);
  }

  .card-option:active { transform: scale(0.98); }

  .card-option--active {
    border-color: var(--color-accent);
    background: color-mix(in oklab, var(--color-accent) 6%, transparent);
  }

  .card-option-name {
    display: block;
    font-family: var(--font-body);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--color-text);
  }

  .card-option-detail {
    display: block;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  /* Inputs */
  .input-row { display: flex; flex-direction: column; gap: 1rem; }

  .combo-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .combo-label {
    display: block;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

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

  .benchmark { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); letter-spacing: var(--tracking-wide); text-transform: uppercase; margin: 0.6rem 0 0; }

  /* Navigation */
  .wizard-nav { display: flex; justify-content: space-between; align-items: center; }
  .wizard-nav-right { display: flex; align-items: center; gap: 1rem; }

  .nav-back { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0.5rem 0; transition: color var(--duration-fast) var(--ease-out-expo); }
  .nav-back:hover { color: var(--color-text); }

  .nav-next { font-family: var(--font-body); font-size: var(--text-xs); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); background: transparent; border: 1px solid var(--color-accent); padding: 0.75rem 2rem; cursor: pointer; transition: background var(--duration-fast) var(--ease-out-expo), border-color var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo), opacity var(--duration-fast) var(--ease-out-expo), transform var(--duration-fast) var(--ease-out-expo); }
  .nav-next:hover:not(:disabled) { background: color-mix(in oklab, var(--color-accent) 12%, transparent); color: var(--color-accent); }
  .nav-next:active:not(:disabled) { transform: scale(0.97); }
  .nav-next--disabled { opacity: 0.25; cursor: not-allowed; border-color: color-mix(in oklab, var(--color-text-muted) 20%, transparent); }

  .nav-skip { font-family: var(--font-body); font-size: var(--text-xs); color: var(--color-text-muted); background: none; border: none; padding: 0.5rem 0; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: color var(--duration-fast) var(--ease-out-expo); }
  .nav-skip:hover { color: var(--color-text); }

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

  .lead-consent { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; margin-top: 0.5rem; }
  .lead-checkbox { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 3px; border: 1.5px solid color-mix(in oklab, var(--color-text-muted) 30%, transparent); flex-shrink: 0; margin-top: 1px; transition: border-color var(--duration-fast) var(--ease-out-expo), background var(--duration-fast) var(--ease-out-expo); }
  .lead-checkbox--checked { border-color: var(--color-accent-teal); background: var(--color-accent-teal); color: var(--color-bg); }
  .lead-checkbox-input { position: absolute; opacity: 0; pointer-events: none; }
  .lead-consent-text { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; }
  .lead-consent-link { color: var(--color-text-muted); text-decoration: underline; text-underline-offset: 2px; }
  .lead-consent-link:hover { color: var(--color-text); }

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
  .results-tag { font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); display: block; margin-bottom: 0.75rem; }
  .results-hero-number { font-family: var(--font-display); font-size: clamp(3.5rem, 9vw, 6.5rem); color: var(--color-text); line-height: 1; letter-spacing: var(--tracking-tight); margin: 0; display: inline-flex; align-items: baseline; }
  .results-hero-fraction { font-size: 0.4em; color: var(--color-text-muted); letter-spacing: 0; margin-left: 0.05em; }
  .results-hero-eyebrow { font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); margin: 0.5rem 0 0.75rem; }
  .results-hero-context { font-family: var(--font-display); font-style: italic; font-size: var(--text-lg); color: var(--color-text-muted); line-height: 1.35; margin: 0; }

  .results-email-sent { display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-accent-teal); padding: 0.55rem 0.85rem; border: 1px solid color-mix(in oklab, var(--color-accent-teal) 15%, transparent); margin-bottom: clamp(2rem, 4vw, 3rem); }
  .results-email-sent svg { flex-shrink: 0; opacity: 0.6; }

  .outlier-warnings { margin-bottom: 1.5rem; }
  .outlier-warning {
    display: flex; align-items: flex-start; gap: 0.6rem;
    font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text);
    line-height: 1.55; padding-left: 1rem; margin-bottom: 0.5rem;
    border-left: 2px solid var(--color-accent-amber);
  }
  .outlier-warning svg { flex-shrink: 0; color: var(--color-accent-amber); margin-top: 4px; }

  .pre-revenue-note {
    font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-muted);
    line-height: 1.6; padding-left: 1rem; margin-bottom: 1.5rem;
    border-left: 2px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent);
  }

  /* Verdict Block */
  .verdict-block {
    padding-left: 1.25rem;
    border-left: 2px solid var(--color-text-muted);
  }
  .verdict-block.severity--critical { border-left-color: var(--color-accent-rust); }
  .verdict-block.severity--warning { border-left-color: var(--color-accent-amber); }
  .verdict-block.severity--opportunity { border-left-color: var(--color-accent); }
  .verdict-block.severity--healthy { border-left-color: var(--color-accent-teal); }

  .verdict-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
  .verdict-severity-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .verdict-severity-dot.severity--critical { background: var(--color-accent-rust); }
  .verdict-severity-dot.severity--warning { background: var(--color-accent-amber); }
  .verdict-severity-dot.severity--opportunity { background: var(--color-accent); }
  .verdict-severity-dot.severity--healthy { background: var(--color-accent-teal); }

  .verdict-name { font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); }
  .verdict-text { font-family: var(--font-body); font-size: var(--text-md); color: var(--color-text); line-height: 1.6; margin: 0; }
  .verdict-link { display: inline-block; font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-accent); text-decoration: none; margin-top: 0.85rem; transition: color var(--duration-fast) var(--ease-out-expo); }
  .verdict-link:hover { color: var(--color-text); }

  /* Sections */
  .results-section { margin-bottom: clamp(2.5rem, 5vw, 3.5rem); padding-bottom: clamp(2rem, 4vw, 3rem); border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent); }
  .results-section:last-of-type { border-bottom: none; padding-bottom: 0; }
  .results-section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  .results-section-number { font-family: 'Instrument Serif', serif; font-style: italic; font-size: var(--text-lg); line-height: 1; color: var(--color-accent-teal); }
  .results-section-heading { font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); margin: 0; }

  /* Scorecard Table */
  .scorecard-table {
    display: flex;
    flex-direction: column;
  }

  .metric-row {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.85rem 0 0.5rem;
    border-bottom: 1px solid color-mix(in oklab, var(--color-text-muted) 8%, transparent);
  }

  .metric-row--constraint {
    padding-left: 0.85rem;
    border-left: 2px solid var(--color-accent);
  }

  .metric-row--unscored { opacity: 0.45; }

  .metric-row-name {
    font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text);
    flex: 1; min-width: 0; line-height: 1.3;
  }

  .metric-row-value {
    font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-text);
    line-height: 1; text-align: right; flex-shrink: 0; letter-spacing: -0.02em;
  }
  .metric-row-value.health--strong, .metric-row-value.health--healthy { color: var(--color-accent-teal); }
  .metric-row-value.health--warning { color: var(--color-accent-amber); }
  .metric-row-value.health--critical { color: var(--color-accent-rust); }
  .metric-row-value.health--muted { color: var(--color-text-muted); font-size: var(--text-md); font-family: var(--font-body); }

  .metric-row-health {
    font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-medium);
    letter-spacing: 0.08em; text-transform: uppercase; flex-shrink: 0;
    width: 6rem; text-align: right;
  }
  .metric-row-health.health--strong, .metric-row-health.health--healthy { color: var(--color-accent-teal); }
  .metric-row-health.health--warning { color: var(--color-accent-amber); }
  .metric-row-health.health--critical { color: var(--color-accent-rust); }
  .metric-row-health.health--muted { color: var(--color-text-muted); }

  .metric-detail {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.5rem 0 0.85rem;
    margin-bottom: 0.25rem;
  }

  .metric-detail-benchmark { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.45; }
  .metric-detail-interpretation { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.55; }

  .incomplete-note { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text-muted); margin-top: 1.25rem; font-style: italic; }

  /* Watch List */
  .watch-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .watch-item {
    font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text);
    line-height: 1.55; margin: 0; padding-left: 1rem;
    border-left: 2px solid var(--color-accent-amber);
  }

  /* Recommendations */
  .recommendations { display: flex; flex-direction: column; gap: 1.25rem; }
  .recommendation { display: flex; gap: 0.85rem; align-items: flex-start; }
  .recommendation-number {
    font-family: 'Instrument Serif', serif; font-style: italic; font-size: var(--text-md);
    color: var(--color-accent-teal); flex-shrink: 0; line-height: 1; margin-top: 4px;
  }
  .recommendation-text { font-family: var(--font-body); font-size: var(--text-base); color: var(--color-text); line-height: 1.6; margin: 0; }

  /* CTA */
  .results-cta { margin-bottom: clamp(2rem, 4vw, 3rem); }
  .results-cta-text { font-family: var(--font-display); font-style: italic; font-size: var(--text-md); color: var(--color-text); line-height: 1.35; margin: 0 0 0.75rem; }
  .results-cta-link { font-family: var(--font-body); font-size: var(--text-sm); color: var(--color-text-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; transition: color var(--duration-fast) var(--ease-out-expo); }
  .results-cta-link:hover { color: var(--color-accent); }
  .results-cta-arrow { display: inline-block; transition: transform var(--duration-fast) var(--ease-out-expo); }
  .results-cta-link:hover .results-cta-arrow { transform: translateX(3px); }

  /* Actions */
  .results-actions-divider { height: 1px; background: color-mix(in oklab, var(--color-text-muted) 10%, transparent); margin-bottom: 1.5rem; }
  .results-actions { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
  .results-copy { display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text); background: transparent; border: 1px solid color-mix(in oklab, var(--color-text-muted) 25%, transparent); padding: 0.85rem 2rem; cursor: pointer; transition: border-color var(--duration-fast) var(--ease-out-expo), color var(--duration-fast) var(--ease-out-expo); }
  .results-copy:hover:not(:disabled) { color: var(--color-accent); border-color: var(--color-accent); }
  .results-copy:disabled { opacity: 0.5; cursor: not-allowed; }
  .results-copy--copied { color: var(--color-accent-teal); border-color: var(--color-accent-teal); }
  .results-start-over { font-family: var(--font-body); font-size: var(--text-sm); letter-spacing: var(--tracking-wide); text-transform: uppercase; color: var(--color-text-muted); background: none; border: none; padding: 0.5rem 0; cursor: pointer; transition: color var(--duration-fast) var(--ease-out-expo); margin-left: auto; }
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
  @media (max-width: 640px) {
    .card-options { grid-template-columns: 1fr; }
    .combo-inputs { grid-template-columns: 1fr; gap: 1rem; }
    .metric-row { flex-wrap: wrap; row-gap: 0.4rem; }
    .metric-row-name { flex: 1 1 100%; }
    .metric-row-value { font-size: var(--text-lg); }
    .metric-row-health { width: auto; margin-left: auto; }
  }

  @media (max-width: 480px) {
    .lead-input { font-size: var(--text-xl); }
    .input-currency, .input-number { font-size: var(--text-xl); }
  }
</style>
