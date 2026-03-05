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
