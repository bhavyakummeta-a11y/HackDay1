# PackBreak development

Phone-first NC State schedule, dining, friends and study planner built with Next.js, React, TypeScript and Zod. Run npm test, npm run build and npm run typecheck after material changes.

Keep GEMINI_API_KEY server-only. Only NEXT_PUBLIC_GOOGLE_CLIENT_ID is public. Do not print secrets. Google Calendar OAuth imports read-only data on user action; tokens stay in memory.

Photo extraction and Calendar imports must pass through editable confirmation before saving. Preserve manual entry and local recommendations when APIs are unavailable. Schedule times are America/New_York. Check travel to a venue AND to the next class. Never invent a travel duration for unknown buildings.

Venue prices, coordinates and travel estimates are demo data, not live. Do not claim a venue is open, quiet, allergy-safe, or covered by a meal plan without verified data. Maintain links to official venue sources.

Friend invitations are user-operated share/SMS links. No automatic sending. Browser reminders only work during the active session; calendar export is the alternative for background alerts. Do not claim reliable mobile push without implementing a backend and push subscriptions.

Preserve mobile navigation, keyboard-accessible dialogs, errors/loading/empty states, and reduced-motion support. No account system or database is required for this hackathon demo.
