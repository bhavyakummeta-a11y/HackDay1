# Pantry Lens development instructions

This project uses Next.js App Router, React, TypeScript and Zod. Run npm run build and npm run typecheck after meaningful changes.

The app/api/gemini/route.ts server route owns Gemini API access. Keep GEMINI_API_KEY server-only. Validate inputs and model outputs, bound image/request sizes, retain timeouts, and do not expose provider error details or secrets.

Preserve the two-stage flow: recognize ingredients, allow user correction, then generate recipes. Missing ingredients must be explicit. Do not infer freshness, allergen safety, or wild food edibility from a photograph.

The client resizes photos before uploading. Keep the design responsive and keyboard accessible, with loading, empty and error states. No database is required for the MVP.
