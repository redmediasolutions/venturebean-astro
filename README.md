# VentureBean

Static Astro site for VentureBean. Page markup, styles, fonts, and images live in this
project. A small runtime replaces jQuery and Elementor's scripts, and a few scroll
animations are added on top.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about-us/` | About Us |
| `/clients/` | Clients |
| `/testimonials/` | Testimonials |
| `/case-studies/` | Case Studies |
| `/consulting-case-studies/` | Consulting Case Studies |
| `/coaching-case-studies/` | Coaching Case Studies |
| `/business-consulting/` | Consulting |
| `/coaching/` | Coaching (`/coaching-page/` redirects here) |
| `/contact-us/` | Reach Us |

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview
```

## How it is put together

```
src/content/                 header, footer, popups, and one HTML file per page
src/content/pages.json       per-page head tags, stylesheets, and body classes
src/layouts/Layout.astro     assembles head, styles, and markup
src/pages/                   one Astro route per page
src/scripts/runtime/         menu, carousels, tabs, counters, animations, chat
public/assets/               stylesheets, fonts, images, and videos
public/site/overrides.css    behaviour styles for the runtime
```

Edit page HTML in `src/content/pages/`. Shared chrome is `src/content/header.html` and
`src/content/footer.html`.

## Notes

- The Calendly booking widget on Reach Us loads from calendly.com.
- Google Analytics uses tag GT-NFBZ386N.
