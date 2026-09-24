```bash
npm install
npm run assets     # one-time: downloads the original WordPress images into src/assets/wp/
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
```

`npm run assets` matters. After it runs, Astro resizes every image and converts it to WebP
at build time. If you skip it, the site still builds, but each image loads straight from
venturebean.com at full size.

## Project structure

```
src/
├── assets/wp/            original images, mirrored from /wp-content/uploads (created by npm run assets)
├── components/
│   ├── common/Seo.astro          title, meta, canonical, Open Graph, Twitter, JSON-LD
│   ├── layout/                   Header, MobileMenu, Footer, BackToTop
│   ├── sections/                 one component per homepage section (Hero, About, Stats, …)
│   └── ui/                       Button, Img, Icon, SplitText, SectionHeading
├── data/
│   ├── site.js                   navigation, footer, contact details, SEO defaults
│   └── home.js                   all homepage copy and image references (verbatim)
├── layouts/BaseLayout.astro
├── pages/index.astro             homepage: sections in the original order
├── scripts/                      small vanilla JS modules (reveal, hero slider)
├── styles/                       tokens.css (design tokens), global.css, motion.css
└── utils/                        links.js (phased-migration links), images.js
public/                           logo, favicons, robots.txt
scripts/fetch-assets.mjs          image downloader
docs/sitemap.txt                  full site mind-map (plain text)
```

## Homepage sections (same order as the live site)

1. Hero slider (4 slides)
2. Management Consultant in Bangalore (About)
3. Trusted by Businesses… (stats counters)
4. Why VentureBean? (guiding principles)
5. Videos (2 × Vimeo)
6. How we help / Our Areas of Expertise
7. Business Consulting
8. Coaching & Organisational Development
9. Industries We Serve
10. Clients
11. Knowledge Hub (Media Spotlight / Industry Perspective / Insights tabs)
12. Testimonials (Coaching / Consulting)



## Design system

- **Colours** (`src/styles/tokens.css`): all taken from the live site and logo. Heading navy
  `#100057`, stats navy `#00053F`, footer navy `#0B0036`, brand brown `#733416`, Knowledge Hub
  button `#502627`, Reach Us blue `#06329C`, section greys `#F0F0F0` / `#EEEEEE` / `#FAF7F7`.
- **Type**: League Spartan (the live site's heading font) for display, Instrument Sans for body
  and UI text, and Instrument Serif italic for a few editorial accents. All three are self-hosted
  through Fontsource, so no requests go to Google Fonts.
- **Motion**: CSS transitions driven by one IntersectionObserver. There is no animation library.
  Everything respects `prefers-reduced-motion`, and content stays visible when JS is off.

## Performance notes

- Zero framework JS. Each interactive component ships a small inline module.
- Vimeo loads only when someone clicks play (a click-to-load facade), which saves about 1 MB on first load.
- The hero's first image is `eager` with `fetchpriority="high"`; all other images are lazy.
- The two main font files are preloaded.

## Known items to confirm with the client

- Several testimonial job titles on the live site end with a repeated "CEO, Xmplar ERP Solutions".
  They are kept verbatim; see the note in `src/data/home.js`.
- Client logos have no alt text on the live site, so the logo alt text here is generic.
- The chat bubble widget from the live site isn't included. It's a third-party embed; add its
  script to `BaseLayout.astro` if the client still wants it.
- Search sends queries to the live WordPress search until a search solution is chosen.
- The live footer's phone link is broken (`http://mail/`). Here it is a proper `tel:` link.
