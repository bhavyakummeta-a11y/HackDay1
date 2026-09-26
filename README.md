# Pantry Lens

A Next.js app for Vercel: upload or capture up to three ingredient photos, review Gemini's ingredient list, choose preferences, and generate up to three recipes with quantities, instructions, and missing ingredients. You can also enter ingredients manually.

## Project structure

```text
app/
  api/gemini/route.ts   # Server-only Gemini API integration
  page.tsx             # Photo upload and recipe interface
  layout.tsx
  globals.css
.env.example           # Copy to .env.local for local use
.gitignore             # Keeps API keys out of Git
GEMINI.md              # Gemini CLI project instructions
package.json
package-lock.json
tsconfig.json
```

If VS Code shows `HackDay1 [GitHub]`, it is a virtual remote repository. Clone the repository locally or open it in GitHub Codespaces to run Node.js commands. For Vercel, import this repository directly and set its environment variables there. Never add your actual API key through the GitHub file editor.

## Run locally

Requires Node.js 20.19 or newer.

```sh
npm install
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local
npm run dev
```

Create an API key at https://aistudio.google.com/apikey. The key stays in the server environment. Never prefix it with NEXT_PUBLIC_. GEMINI_MODEL is configurable; choose a model available to your Google project that supports images and structured JSON output. The default follows Google's current structured output example.

## Gemini CLI

Gemini CLI is a development assistant; the deployed app calls Gemini API directly, without spawning a CLI process. To work on this project using Gemini CLI:

```sh
npx @google/gemini-cli
```

Authenticate when prompted, then ask: "Read GEMINI.md and review this Pantry Lens app. Verify the API integration against my available Gemini model, then run npm run build."

Gemini CLI 0.61.0 is installed as a development dependency and its version command was verified. The app was authored directly; AI CLI execution and live Gemini API verification still require credentials. Production build and TypeScript checks passed.

## Deploy on Vercel

1. Push this directory to your GitHub repository.
2. Import that repository into Vercel; select the Next.js framework preset.
3. Add GEMINI_API_KEY and optionally GEMINI_MODEL under project environment variables.
4. Deploy. Redeploy after changing environment variables.

Alternatively, run `npx vercel` from this directory and follow the prompts.

## Behavior and limits

Photos are resized in the browser and only sent to Google when Identify ingredients is clicked. The app does not persist photos or recipes. It accepts JPEG, PNG and WebP; convert HEIC photos before uploading. Requests and Gemini JSON responses are validated. API errors and missing configuration are displayed in the UI. Review image recognition mistakes and allergy suitability before cooking.

This is an MVP with an unauthenticated API endpoint. Before broad public use, configure access protection or authentication and a shared rate limiter to control API spend. Google API quota limits remain applicable.

## Checks

```sh
npm run build
npm run typecheck
```

Live photo recognition and recipe generation require your own valid API key. For a smoke test, upload a clear food photo, scan, edit the detected list, and generate recipes. Also verify manual ingredients, photo removal, dietary preferences, and missing-key feedback.

References: https://ai.google.dev/gemini-api/docs/generate-content/structured-output and https://geminicli.com/docs/get-started/installation/
