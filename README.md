# PackBreak — NC State campus companion

A phone-first Next.js hackathon app that turns gaps between classes into time to eat, meet friends, or study. This replaces the original Pantry Lens recipe app. Keep your existing Gemini API key in Vercel.

## Demo in 60 seconds

1. Open the app and choose **Explore with a sample schedule**.
2. Pick a free window in **Your day, at a glance**. Try a midday window for the largest selection.
3. Switch between **Quick bite**, **With friends**, and **Study + eat**.
4. Choose **Plan this break**, add a friend's name, and save.
5. Open **Plans** to share an invitation or export calendar reminders.
6. Open **Schedule** to add an exam and choose when preparation reminders begin.

The demo has no signup. It stores schedules, preferences, and plans in this browser's local storage. No cross-device synchronization is implemented.

## Vercel deployment

Import `bhavyakummeta-a11y/HackDay1` with framework **Next.js**, root directory **./**, and Node.js 22 or 24. The standard build command is `npm run build`.

Required for photo import and AI explanations:

- `GEMINI_API_KEY`: your existing server-only Gemini API key.
- `GEMINI_MODEL`: optional model override; select a model your Google project can access that supports image input and structured JSON. Default: `gemini-3.8-flash`, following the provider documentation checked during development.

Manual schedules, local recommendations, Maps directions, plans, and calendar exports do not require Gemini. The API key must never be prefixed with `NEXT_PUBLIC_` or committed to GitHub. After changing Vercel environment variables, redeploy.

## Optional Google Calendar connection

Firebase alone does not grant Calendar access. The app implements Google Identity Services OAuth and read-only Calendar API import.

1. In Google Cloud Console, select a project and enable **Google Calendar API**.
2. Configure the OAuth consent screen / Google Auth Platform branding, audience, and data access. Add your demo Google account as a test user while the app is in testing.
3. Create an OAuth client of type **Web application**.
4. Add your deployed HTTPS origin (for example `https://your-project.vercel.app`) to **Authorized JavaScript origins**. Add `http://localhost:3000` for local development. Origins have no path or trailing slash. Preview domains need their own configuration.
5. Add the public client ID to Vercel as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and redeploy. Do not add a client secret; the browser token flow does not use one.
6. In **Schedule → Google Calendar**, sign in, consent to read-only events access, then review and confirm imported events.

Import reads the next 60 days from your visible Google calendars, expands recurring events into individual occurrences, paginates up to 500 entries, and skips all-day and multi-day events. Nothing is saved until confirmation. Access tokens stay in memory and are not stored. Reconnecting is a manual refresh; deleted remote events are not automatically removed locally. School administrators may restrict third-party Calendar access. Public OAuth verification may be required beyond a test-user demo.

Without the client ID, the button explains the setup requirement; manual and photo entry remain available.

## What works

- Manual classes, recurring weekly meetings, and exams; edit/delete any entry.
- Gemini schedule image extraction (JPEG, PNG, WebP), followed by mandatory editable confirmation. For undated weekly screenshots, the selected planning date determines the week; review dates carefully.
- Per-exam study preparation windows, independent of the size of today's schedule gaps.
- Break detection between 8 AM and 8 PM Eastern time, merging overlapping classes and subtracting saved meal plans.
- Venue filtering for budget, campus/off-campus, travel mode, and dietary discovery preferences.
- Travel estimation from previous class to venue and onward to the next class, plus a 5-minute arrival buffer. Driving includes a 10-minute parking allowance per leg. Study breaks require at least 40 minutes at the venue; quick meals require 20.
- Explicit unverified travel state for unknown building names. Choose one of the recognized campus buildings to save a travel-checked plan.
- Google Maps walking/driving directions links; no Maps API key is needed for links.
- Meal plans with optional friend names; native sharing, copy fallback, and SMS links. Sharing is user-operated and never sends automatically.
- In-app exam reminders and opt-in browser notification attempts while the page remains active.
- ICS calendar export with alarms for meals, exams, and a separate preparation-start event. Import the file into a calendar app and verify that app's notification settings.
- Gemini explanations of already-filtered venue choices, restricted to the provided venue facts.

## Honest hackathon limits

This is a demo, not a background notification service. Browser alerts can be blocked or suspended, especially on phones. There is no Firebase Cloud Messaging, push service worker, background scheduler, or email delivery. Calendar export provides a user-controlled way to use the phone calendar's reminders; calendar apps may handle imported alarms differently.

Venue hours, prices, menus, quietness, seating, meal-plan eligibility and route times are not live. Venue price numbers and coordinates are hand-maintained planning estimates. No Google Places or Routes API is called. The interface links to official sources and Google Maps to verify details. Dietary tags are discovery hints, not allergy guarantees. A future production version needs live venue data, billed Maps Routes/Places integration, accounts, shared storage, API rate limits and reliable push scheduling.

## Local development

Requires Node.js 22.18+ (24 also supported).

```sh
npm ci
cp .env.example .env.local
# Add secrets to .env.local only
npm run dev
```

```sh
npm test
npm run build
npm run typecheck
```

Gemini CLI is available as a development dependency via `npx gemini`; it is not spawned by the deployed app. Read `GEMINI.md` for development guidance.

## Structure

- `app/page.tsx`: responsive UI, saved browser state, review dialogs and reminders.
- `app/api/gemini/route.ts`: validated server-only photo extraction and AI tips.
- `lib/planner.ts`: gap, travel, exam and calendar-export logic.
- `lib/data.ts`: curated NC State venues and estimated building coordinates.
- `lib/calendar.ts`: Google OAuth and read-only Calendar import.
- `lib/schema.ts`: schedule and persisted-data validation.
- `tests/planner.test.mjs`: scheduling, travel and reminder regression tests.

## Sources

Venue existence and locations: https://dining.ncsu.edu/locations/ and https://cupajoe.com/contact/ (checked September 26, 2026). All descriptions and study suitability labels are editorial demo guidance, not verified live conditions.

Integration references:
- https://developers.google.com/maps/documentation/urls/get-started
- https://developers.google.com/workspace/calendar/api/quickstart/js
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output

Independent student hackathon demo; not affiliated with NC State.
