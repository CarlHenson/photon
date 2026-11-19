# Photon website

Static site (HTML, CSS, vanilla JS). No build step, no dependencies. All paths are relative, so it works at
`https://<user>.github.io/<repo>/` as well as at a custom domain root.

## Deploy on GitHub Pages
1. Put the contents of this folder at the root of the repository.
2. Settings → Pages → Deploy from branch → `main` / root.

## Before going live (all in `js/config.js`)
| Setting | What to do |
|---|---|
| `formEndpoint` | Create a form on Formspree, Web3Forms or similar and paste its endpoint. Until then the form **will not claim success**: it opens the visitor's email app if `email` is set, otherwise it says enquiries are not switched on. |
| `formExtraFields` | Extra fields some services require, e.g. `{ access_key: "..." }` for Web3Forms. |
| `email`, `phone`, `whatsapp` | Real contact details. Empty values show a bracketed placeholder. WhatsApp is digits only, international format. |
| `social` | Full URLs. Empty ones are not shown. |

## Social preview image
`index.html` references `assets/photon_logo.png` with a relative path. Social platforms need an absolute URL, so once the
site is live use `https://carlhenson.github.io/photon/assets/photon_logo.png` for the `og:image` content.

## Content notes
- Prices shown: M250/month website package, +M150/month optional management. Nothing else is priced.
- No testimonials, logos, statistics or product listings are included, by design.
- Photography: `assets/photos/` holds three crops (`desk-hero.jpg`, `desk-tower.jpg`, `desk-monitors.jpg`) made from one supplied desk photo; a third-party logo in its corner was cropped out. **Confirm you have the right to use that photo.** A watermarked Unsplash+ preview was supplied too and is deliberately not used; it is not licensed for a live site.
- To swap in more photos, replace those three files (keep the names) or edit the `src` / `url(...)` references in `index.html` and `css/styles.css`. Good next candidates: a server rack and network switch for the Hardware and Consultancy sections, and a designer at work for the Website section.
- The website mockup in the first service panel is built in CSS and is illustrative, not client work.
- Layout: on desktop each main section is sized to fill one screen (`.fit` in `css/styles.css`, section 17). On small laptops it tightens up; on phones everything stacks normally.
- No privacy policy page is included, so the footer has no link to one. Add a page and link when one is written.
- Fonts (Syne, Instrument Serif, Manrope, IBM Plex Mono) load from Google Fonts with system-font fallbacks. The display layout was tuned with the fallback font, so glance at the headings once Syne loads.
- `js/fx.js` holds interactions (parallax, service panels, tabs, price toggle). Everything respects reduced-motion settings.
