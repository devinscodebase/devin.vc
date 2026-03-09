import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const subscribers = sqliteTable('subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  status: text('status', { enum: ['pending', 'confirmed', 'unsubscribed'] })
    .notNull()
    .default('pending'),
  resendContactId: text('resend_contact_id'),
  token: text('token').notNull(),
  subscribedAt: text('subscribed_at').notNull(),
  confirmedAt: text('confirmed_at'),
  unsubscribedAt: text('unsubscribed_at'),
});

export const gtmLeads = sqliteTable('gtm_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Contact
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  // Inputs
  revenueTarget: integer('revenue_target').notNull(),
  dealSize: integer('deal_size').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull(),
  salesCycle: integer('sales_cycle').notNull(),
  closeRate: integer('close_rate').notNull(),
  sqlToOpp: integer('sql_to_opp').notNull(),
  leadToSql: integer('lead_to_sql').notNull(),
  costPerLead: integer('cost_per_lead').notNull(),
  grossMargin: integer('gross_margin').notNull(),
  customerLifespan: integer('customer_lifespan'),
  // Results (text to preserve decimals)
  dealsPerMonth: text('deals_per_month').notNull(),
  leadsPerMonth: text('leads_per_month').notNull(),
  monthlyBudget: text('monthly_budget').notNull(),
  annualBudget: text('annual_budget').notNull(),
  cac: text('cac').notNull(),
  ltv: text('ltv').notNull(),
  ltvCacRatio: text('ltv_cac_ratio').notNull(),
  // Meta
  resendContactId: text('resend_contact_id'),
  createdAt: text('created_at').notNull(),
});

export const retentionLeads = sqliteTable('retention_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Contact
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  // Inputs
  arr: integer('arr').notNull(),
  customers: integer('customers').notNull(),
  monthlyChurnRate: text('monthly_churn_rate').notNull(),
  arpc: text('arpc').notNull(),
  expansionRate: text('expansion_rate').notNull(),
  grossMargin: integer('gross_margin').notNull(),
  marketingSpend: integer('marketing_spend'),
  newCustomersMonth: integer('new_customers_month'),
  // Key results (text to preserve decimals)
  annualChurnRevenue: text('annual_churn_revenue').notNull(),
  grr: text('grr').notNull(),
  nrr: text('nrr').notNull(),
  revenueGap36: text('revenue_gap_36').notNull(),
  // Meta
  resendContactId: text('resend_contact_id'),
  createdAt: text('created_at').notNull(),
});

export const scorecardLeads = sqliteTable('scorecard_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Contact
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  // Context
  stage: text('stage').notNull(),
  model: text('model').notNull(),
  // Inputs
  arr: integer('arr').notNull(),
  marketingSpend: integer('marketing_spend').notNull(),
  newCustomersMonth: integer('new_customers_month').notNull(),
  acv: integer('acv').notNull(),
  monthlyChurnRate: text('monthly_churn_rate').notNull(),
  expansionRate: text('expansion_rate').notNull(),
  salesCycleLength: integer('sales_cycle_length'),
  pipelineValue: integer('pipeline_value'),
  monthlyLeadVolume: integer('monthly_lead_volume'),
  leadToCustomerRate: text('lead_to_customer_rate'),
  // Key results
  constraintId: text('constraint_id').notNull(),
  constraintSeverity: text('constraint_severity').notNull(),
  scoredMetricsCount: integer('scored_metrics_count').notNull(),
  // Meta
  resendContactId: text('resend_contact_id'),
  createdAt: text('created_at').notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['contact', 'booking'] }).notNull(),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message'),
  metadata: text('metadata'),
  resendEmailId: text('resend_email_id'),
  status: text('status', { enum: ['new', 'read', 'archived'] })
    .notNull()
    .default('new'),
  createdAt: text('created_at').notNull(),
  readAt: text('read_at'),
});
