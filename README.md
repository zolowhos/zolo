# Zolo Portfolio (`zolo.mov`)

Static one-page site for Zolo (`@zolowho`). HTML, CSS, JS. No build step. Works offline. Deploys on GitHub Pages.

Read this before you change things. Answers live here.

## Run it locally

1. Open the project folder.
2. Start the dev server (kills any old listener on port 8080 first):

```bash
python serve.py
```

Or manually:

```bash
python -m http.server 8080
```

```bash
npx --yes serve .
```

3. Go to `http://127.0.0.1:8080/#1` for the guide demo with copy buttons.

Paths are relative, so disk open works without a server, but the guide page needs a server to load the markdown and copy buttons reliably.

## Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5, one page with sections |
| Style | Plain CSS in `css/` |
| Script | `js/main.js` (nav + scroll reveal) |
| Host | GitHub Pages |
| Domain | `zolo.mov` (`CNAME`) |

Fonts sit in `assets/fonts/` (Inter + DotGothic16) so offline still looks right.

## Sections (in `index.html`)

Home, About, Skills, Projects, Contact. Plus `404.html`.

## Layout

```
/
  index.html
  bible.html               # redirects to /#1
  VIBE-CODING-BIBLE.md     # guide source (loaded by the demo)
  404.html
  CNAME
  README.md
  css/
    tokens.css
    base.css
    layout.css
    components.css
    pages/home.css
    pages/guide.css
  js/
    main.js
    guide.js
  serve.py                  # local dev server (no-cache, kills old port)
  assets/
    fonts/
    img/pfp.jpg
    icons/*.svg
```

## Demos

| Demo | Entry | Notes |
|------|-------|-------|
| Vibe Coding Bible | `/#1` | Hash route on the homepage; loads `VIBE-CODING-BIBLE.md` (needs a local server or Pages) |

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| Accent | `#4dacff` | Links, CTAs, focus |
| Secondary | `#4c77c2` | Borders, soft accents |
| Background | `#0a0a0a` | Page |

Dark only. If you add light mode, update tokens and contrast.

## Still placeholders

Search for `#todo` and `Coming soon`.

- Project GitHub / demo links
- Resume PDF (nav item is disabled until you add one)

Live socials: GitHub, YouTube, Discord, TikTok. Discord user: `@zolowho`.

## GitHub Pages

1. Push the repo.
2. Settings → Pages → deploy from branch → `main` (or `master`), `/ (root)`.
3. Set custom domain to `zolo.mov` (already in `CNAME`). Turn on HTTPS when DNS is ready.

DNS: follow [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-github-pages). Apex usually needs A records (or ALIAS/ANAME). `www` can CNAME to `USERNAME.github.io`.

Check:

- `https://zolo.mov` loads
- HTTPS shows as valid in Pages settings

## Behavior

- Mobile: hamburger opens the floating nav panel (`.is-open`)
- Active section: updated in `main.js` from scroll + clicks
- Motion: `.reveal` on scroll; off when `prefers-reduced-motion: reduce`
- Resume: not clickable until a PDF exists

## Don't

- Commit secrets or private Discord invites you don't want public
- Point fonts at a CDN if you care about offline (they're already local)

## License

Site content: all rights reserved by Zolo unless you add a license. Fonts: Inter and DotGothic16 under SIL OFL (and their usual terms).
