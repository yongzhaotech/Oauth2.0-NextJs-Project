This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## BFF sign-in configuration

The browser starts sign-in at `/api/auth/login`. The BFF performs the authorization-code exchange and stores the access and refresh tokens in `auth_tokens`; the browser receives only an HttpOnly `session_id` cookie.

Configure these server-side environment variables for the Next.js app:

```env
OIDC_AUTHORITY=http://localhost:88
OIDC_CLIENT_ID=nextjs-project
OIDC_REDIRECT_URI=http://localhost:3001/api/auth/callback
OIDC_SCOPE=openid profile email api.read
```

`OIDC_REDIRECT_URI` must exactly match a URI allowed for `nextjs-project` in the IDP. The local IDP is configured for `http://localhost:3001/api/auth/callback` in `module/oidc-provider.ts`. Use HTTPS and the matching public callback URI outside local development.
