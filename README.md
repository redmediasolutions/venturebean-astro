# VentureBean website (Astro)

The venturebean.com site, rebuilt in Astro with the same design and the same page addresses as the old
WordPress site. Blog articles and client logos come from the Content Manager (Firebase); see
[docs/CMS.md](docs/CMS.md).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things are

Every page in the menu is a file in `src/pages/`, and its sections are components in a folder of
the same name in `src/components/`.

| Menu                                        | Page file (`src/pages/`)                                      | Sections (`src/components/`)           |
| ------------------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| Home                                        | `index.astro`                                                 | `home/`                                |
| About Us                                    | `about-us.astro`                                              | `about/`                               |
| About Us → Clients                          | `clients.astro`                                               | `clients/`                             |
| About Us → Testimonials                     | `testimonials.astro`                                          | `testimonials/`                        |
| About Us → Case Studies                     | `case-studies.astro`                                          | `case-studies/`                        |
| … Consulting / Coaching case studies        | `consulting-case-studies.astro`, `coaching-case-studies.astro` | `case-studies/consulting/`, `…/coaching/` |
| Consulting                                  | `business-consulting.astro`                                   | `consulting/`                          |
| Coaching                                    | `coaching.astro`                                              | `coaching/` (+ `coaching/programs/`)   |
| Solutions                                   | `venturebean-solutions-page.astro`                            | `solutions/`                           |
| Knowledge Hub                               | `knowledge-hub/index.astro`                                   | `knowledge-hub/`                       |
| Knowledge Hub → Insights (blog)             | `knowledge-hub/insights.astro`                                | `knowledge-hub/insights/`              |
| Reach Us                                    | `contact-us.astro`                                            | `contact/`                             |
| A blog article (`/<slug>/`)                 | `[slug].astro`                                                | `blog/article/`                        |

Shared pieces:

- `src/layouts/Layout.astro`: wraps every page (SEO tags, stylesheets, header, footer).
- `src/components/layout/`: `Header` (+ `header/`: logo, desktop menu, mobile menu), `Footer`
  (+ `footer/`), pop-ups and the WhatsApp/phone button.
- `src/components/blog/`: article cards, table of contents, Calendly box.
- `src/components/client-logos/`: client logos from the Content Manager.
- `src/data/pages.json`: per-page SEO tags (title, description, Open Graph) and stylesheet lists.
- `src/lib/`: loading data from Firebase (`posts.ts`, `clients.ts`) and article helpers.
- `src/scripts/`: the small runtime for sliders, tabs, menus and animations.
- `public/`: images, fonts and the CSS saved from the old site. Our own CSS is in `public/site/`:
  `overrides.css` (behaviour and small tweaks) and `responsive.css` (fixes for phones, tablets and
  small laptops, grouped by page).

## Editing a section

Open the page file to see its sections in order, then open the section's component. The markup keeps
the original class names (`vb-element-…`) because the saved CSS styles each element by them, so change
text and images freely but keep those classes.
