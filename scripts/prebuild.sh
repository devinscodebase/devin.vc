#!/bin/sh
# Write server env vars to .env so Vite inlines them at build time.
# On CF Pages, env vars are system env vars but Vite only reads from .env files
# for non-PUBLIC_ prefixed variables.

VARS="TURSO_DATABASE_URL TURSO_AUTH_TOKEN RESEND_API_KEY RESEND_AUDIENCE_ID RESEND_WEBHOOK_SECRET NEWSLETTER_SECRET CAL_API_KEY CAL_EVENT_TYPE_ID CLERK_SECRET_KEY PUBLIC_CLERK_PUBLISHABLE_KEY SANITY_WRITE_TOKEN"

for var in $VARS; do
  val=$(eval echo \$$var)
  if [ -n "$val" ]; then
    echo "$var=$val" >> .env
  fi
done
