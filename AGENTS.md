# Field research on love

React + Vite + Tailwind CSS site for "매주 화요일의 사랑연구회" (Field research on love), with an application form that writes submissions into Notion via `api/apply.ts`.

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Entire site: landing/home/project/program/application/complete/archive pages, all in one file
- `src/imports/` - Poster and illustration assets used by `App.tsx`
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `api/apply.ts` - Vercel serverless function; receives the application form POST and creates a page in the Notion applicants database (see README.md for env vars)
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and the `@` alias for `src`

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` (no Tailwind/PostCSS config file needed — theme customization lives in `src/index.css`)
- Build tooling: Vite, TypeScript, `@vitejs/plugin-react`

## Local development

`pnpm install && pnpm dev` starts the Vite dev server. The `/api/apply` endpoint only runs under Vercel (`vercel dev`) or once deployed — plain `vite dev` does not serve it.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
