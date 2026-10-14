# Client logos from the Content Manager

The **client logos** on the home page (scrolling strip) and the **Clients page** (industry tabs)
come from the Content Manager admin panel (Firebase).

## How it's organised in the Content Manager

| On the website                  | In the Content Manager                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| A client logo                   | A **post** in the **Clients** category — featured image = logo    |
| Client name (logo alt text)     | Post title                                                        |
| Industry tabs on Clients page   | **Sub-categories** of Clients (Consumer, Education, …)            |
| Order of logos                  | Custom field **Display order** (lower first)                      |
| Logo bigger / smaller           | Custom field **Logo size (%)** (normal is 60)                     |
| Not on home strip / Clients page | Custom fields **Hide on home page** / **Hide on Clients page**   |

- **Add a client:** Posts → New Post → title = client name → tick **Clients** and its industry →
  set the featured image (the logo) → **Publish**.
- **Remove a client:** delete the post, or switch it to draft.
- **New industry tab:** Categories → add a category with **Parent = Clients**. Tabs are sorted A–Z;
  tabs with no logos are hidden.

## Setup (one time)

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the Firebase keys (same as the admin panel).
3. Import the logos that are currently on the website:

   ```bash
   npm run import:clients -- --dry-run   # preview what will be imported
   npm run import:clients                # asks for your admin email + password
   ```

   Safe to run again — already-imported logos are skipped. Names are guessed from file names
   (e.g. "Client 12"), so rename them in Posts afterwards.

4. Add the same `PUBLIC_FIREBASE_…` variables in your hosting provider (Vercel / Netlify / …).

## Seeing changes on the website

The site is static, so logos are fetched **when the site is built**:

- **Live site:** redeploy after changing logos (or set up a deploy hook).
- **Local:** restart `npm run dev`.

If Firebase can't be reached, the keys are missing, or the Clients category is empty, the build
keeps the original logos that are saved in the page HTML — the site never breaks.

## Code

- `src/lib/clients.ts` — loads clients from Firebase (once per build)
- `src/lib/render-clients.ts` — writes them into the page HTML
- `src/content/pages/home.html`, `clients.html` — the logo sections are marked with
  `<!--cms:…-->` comments; everything between the markers is replaced
- `scripts/import-clients.mjs` — the one-time import
