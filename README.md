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
OIDC_CLIENT_ID=nextjs-project
OIDC_AUTHORITY=https://auth.localhost
OIDC_REDIRECT_URI=https://app.localhost/api/auth/callback
OIDC_RESPONSE_TYPE=code
OIDC_SCOPE=openid profile email api.read access_level
```

`OIDC_REDIRECT_URI` must exactly match a URI allowed for `nextjs-project` in the IDP. The local IDP is configured for `https://app.localhost/api/auth/callback` in `module/oidc-provider.ts of NodeJs---esaleshome.com`. Use HTTPS and the matching public callback URI outside local development.

nginx:


# 1. Build your Next.js app
npm run build

# 2. Install PM2 globally and start Next.js on localhost:3000
npm install -g pm2
pm2 start npm --name "nextjs-project" -- start -- -H 127.0.0.1 -p 3001

# 3. Save process list for server reboots
pm2 save
pm2 startup

#####
1. Delete the errored PM2 processes:bash
pm2 delete all
Use code with caution.
2. Start Next.js directly using its JS binary (make sure you are inside ~/codes/apps/nextjs-project):bash
pm2 start ./node_modules/next/dist/bin/next --name "nextjs-project" -- start -H 127.0.0.1 -p 3001

#####
cd C:\nginx

# Test configuration for syntax errors
.\nginx.exe -t

# Start Nginx (runs in the background)
start .\nginx.exe

# Reload after editing nginx.conf
.\nginx.exe -s reload

# Stop Nginx cleanly
.\nginx.exe -s quit


# Verify Nginx is Running
tasklist | grep -i nginx