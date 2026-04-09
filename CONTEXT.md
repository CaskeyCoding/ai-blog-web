# Frontend Workspace

React 18 SPA bootstrapped with Create React App. TypeScript. MUI v7 for components and layout. Deployed to S3 + CloudFront at caskeycoding.com.

## Architecture

Most UI lives in `src/App.tsx`: `Blog`, `BlogPost`, `AdminDashboard`, `Navigation`, and routing. Standalone page components are in `src/components/` (`Landing`, `EricCaskey`, `Profile`, `Footer`, `Login`, `ProtectedRoute`).

API clients are in `src/api/` (`blog.ts`, `agent.ts`, `linkedin.ts`). Auth via AWS Amplify + Cognito is in `src/contexts/AuthContext.tsx` with config in `src/config/amplify.ts`.

## Styling

- Use MUI `sx` prop for all component styles. No CSS modules.
- Global styles in `index.css` (CSS variables, typography) and `App.css` (nav, buttons, paper).
- Color palette defined as a constant in `App.tsx`: `primary: #003366`, `accent: #F5A623`, `text: #222222`.
- Google Fonts: Inter (body), Montserrat (headings) — loaded in `public/index.html`.

## Blog rendering

Blog post content is markdown stored in the backend (DynamoDB/S3). Rendered via `ReactMarkdown` with `remarkGfm` and custom `markdownComponents` that map to MUI Typography, styled links, `SyntaxHighlighter` (Prism, oneLight theme) for code blocks, and responsive tables.

Listing previews use `stripMarkdown()` to remove syntax before truncating. `readingTime()` calculates estimated read time at 200 wpm.

## Deploy

```bash
npm run build
aws s3 sync build/ s3://caskeycoding.com --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

## Environment

Config in `.env` (not committed): `REACT_APP_API_URL`, `REACT_APP_USER_POOL_ID`, `REACT_APP_USER_POOL_CLIENT_ID`, `REACT_APP_AWS_REGION`.

## Source Control / Commits

- Treat `frontend/` as its own repository boundary.
- Run Git commands from `frontend/` only.
- Before commit/push, verify `frontend/` is initialized as a Git repo.
- If `frontend/` is not a Git repo yet, stop and ask whether to initialize it before committing.
- Commit format: `type(frontend): summary`.
- Typical types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.
- Keep one logical UI change per commit (routing, styling, SEO/meta, API client, etc.).
- Add a body for user-facing behavior changes and rollout notes.
