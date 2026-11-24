# PDF Pilot 5U

PDF Pilot 5U is a browser-first PDF workspace built with TanStack Start, React, TypeScript, PDF.js and pdf-lib.
Local PDF tools process files in the browser. Optional AI tools require explicit consent before extracted text is sent
to Google Gemini; a registered account is not required. Account data and anonymous AI sessions are handled by Supabase.
Basic DOCX, XLSX, PPTX, and HTML conversions extract text into a simple PDF; they do not preserve layout or embedded media.
PDF-to-DOCX/XLSX exports selectable text with simplified structure, not faithful page layouts or reconstructed tables.
PDF-to-PowerPoint converts each page into a full-slide image, preserving appearance but not editable content.
HEIC conversion, English OCR, notes, text highlights, freehand drawing and selectable-text redaction run locally in the browser. OCR downloads its English language model from Tesseract's configured CDN. Redaction rasterizes every page and removes interactive content; check every page and result before sharing.
Protect PDF applies AES-256 encryption locally. Unlock PDF requires the correct password; password recovery and bypass are not provided. Unlock encrypted PDFs before using other tools.

## External integrations

Authentication and user-scoped history use Supabase. Copy `.env.example` to `.env.local`, configure
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then run `supabase/schema.sql` in the Supabase SQL editor.
Enable email verification and configure the Google provider/redirect URLs in Supabase Auth before offering Google login.
Google sign-in remains on Supabase. Optional Firebase Analytics uses the public `VITE_FIREBASE_*` web configuration
and is initialized only when valid configuration is present and the user chooses “Accept all” in the cookie notice.
Without that configuration it remains unavailable; “Accept only essential” keeps it disabled. Configure the Firebase values from the Firebase console in `.env.local` for local development and as
Vercel build environment variables before deploying.

The Vercel Supabase integration can provide `SUPABASE_URL` and `SUPABASE_ANON_KEY`; the build maps only these public values to the browser. Never expose `SUPABASE_SERVICE_ROLE_KEY` or a Gemini key through a `VITE_` variable. The Neon/Postgres connection variables are not used by the current app; profiles and processing history remain in Supabase.

Gemini document tools require the server-only `GEMINI_API_KEY` and Supabase anonymous sign-ins enabled. For local development, put the Gemini key in `.env.local` without a `VITE_` prefix; Vite forwards `/api/ai` to the existing server handler. When a visitor is not signed in, the app creates a guest session automatically; a registered account is optional. Users explicitly consent before extracted selectable PDF text is sent to Google Gemini, while the PDF itself stays in the browser. Requests accept up to 60,000 text characters; chat accepts up to eight messages, and the API limits each guest or signed-in session to 12 requests per minute per server instance. Scanned PDFs need OCR first.

Payments, server-side high-fidelity LibreOffice conversion, certificate-backed signatures, PDF/A conversion and additional OCR languages still require provider/worker configuration. No ad spaces or AdSense ads are rendered. After approval, set `ADSENSE_PUBLISHER_ID` to a valid `pub-` ID to generate the corresponding `ads.txt`; configure region-appropriate consent management before loading ads.

The tool catalog and dispatch checks do not mean every tool has been executed end-to-end. See [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for what has been tested and what remains unverified. Local files are limited to 100 MiB per file; browser memory and available device resources can impose additional practical limits.

Set `PUBLIC_SITE_URL` before building for production to generate the sitemap with the correct domain. Without it,
sitemap generation is skipped rather than emitting placeholder URLs. See [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
for current implementation status and outstanding verification.

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`


## Deploy to Cloudflare Workers

This project uses the Cloudflare Vite plugin (configured in `vite.config.ts`) and `wrangler.jsonc`:

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `npx wrangler deploy`

For production env vars, run `wrangler secret put MY_VAR` for each secret listed in `.env.example`. Public (non-secret) vars go in `wrangler.jsonc` under `vars`.

KV, D1, R2, and Durable Object bindings are configured in `wrangler.jsonc` — see https://developers.cloudflare.com/workers/wrangler/configuration/.



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).



# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
