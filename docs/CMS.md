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
- `src/components/client-logos/ClientLogoMarquee.astro`: home page logo strip
- `src/components/client-logos/ClientLogoTabs.astro` + `ClientLogo.astro`: Clients page tabs
- `src/components/client-logos/saved/`: the logos saved from WordPress, shown when the
  Content Manager has none (they're passed into the components above as children)
- `scripts/import-clients.mjs` — the one-time import

# Articles (Knowledge Hub → Insights)

Coaching and consulting articles come from the same Content Manager.

| On the website                                   | In the Content Manager                                       |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Insights page, **Consulting** / **Coaching** tabs | Published posts in the **Consulting** / **Coaching** categories |
| Article address `venturebean.com/<slug>/`        | Post **slug** (same as on WordPress, so old links keep working) |
| Card image + article header image                | **Featured image**                                           |
| Card text                                        | First 20 words of the **excerpt** (or of the article)        |
| Table of contents (sidebar)                      | Built from the article's headings and bold-only lines        |

- **Add an article:** Posts → Coaching (or Consulting) → New post → **Publish**. Or bring it over
  from WordPress with **Import from WordPress** (one post, or a whole category by ID).
- Drafts and posts scheduled for later are not shown.
- The Calendly booking box sits under the table of contents and stays on screen while reading
  (desktop). Its code is in `src/components/blog/CalendlyWidget.astro`.

## Code

- `src/lib/posts.ts`: loads published coaching and consulting posts (once per build)
- `src/lib/article.ts`: link clean-up, table-of-contents headings, card text and dates
- `src/components/blog/PostCardList.astro` + `PostCard.astro`: the Insights tab cards
  (`blog/saved/` holds the cards saved from WordPress, shown when there are no posts yet)
- `src/components/blog/article/`: the article page pieces (header, body + sidebar, "Continue reading")
- `src/components/blog/TableOfContents.astro`, `CalendlyWidget.astro`: the sidebar
- `src/pages/[slug].astro`: one page per article

# Knowledge Hub pages (Media Spotlight, Industry Perspectives, Toolkit)

| Page / list                                   | Content Manager category (slug)               | Card shows                                     | Card opens                         |
| --------------------------------------------- | --------------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| Media Spotlight → Publications                | Media Spotlight (`media-spotlight`)           | Featured image, title, date                    | **Link** field (article, PDF…)     |
| Media Spotlight → Videos                      | Videos (`videos`)                             | Featured image, title, date                    | **Link** field (YouTube video)     |
| Media Spotlight → Photos                      | not from the Content Manager (fixed gallery)  |                                                |                                    |
| Industry Perspectives                         | Industry Perspectives (`industry-perspectives`) | Title, date, first 25 words, "Download PDF" | The article page `/<slug>/`        |
| Toolkit → Frameworks                          | Framework (`framework`)                       | Featured image, title, first line of the post  | The article page `/<slug>/`        |

- **Link field:** the "Card link" field group (field name `link_url`) on Media Spotlight and Videos
  posts. Paste the full address (https://…), or a file on this site such as
  `/assets/uploads/2026/06/report.pdf`. Links to other sites open in a new tab.
- Industry Perspectives and Framework posts also get their own article page, like blog posts.
- Each list shows newest first. If a category has no published posts, the page shows the cards saved
  from WordPress instead.
- The slugs the site looks for are in `KNOWLEDGE_HUB` in `src/lib/posts.ts`.
- **Toolkit → Assessment** is still the saved WordPress tab; its two cards link to pages that only
  exist on WordPress.

## Code

- `src/lib/posts.ts`: `getSectionPosts()` and `linkOf()`
- `src/components/knowledge-hub/cards/`: `MediaCardList`, `VideoCardList`, `PerspectiveCardList`,
  `ToolkitCardList` (each falls back to its `saved/` cards)
- `src/pages/knowledge-hub/media-spotlight.astro`, `industry-perspectives.astro`, `toolkit.astro`
