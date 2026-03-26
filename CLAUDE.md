# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What's in this repo

**CoolCats English** — static marketing site for a Barcelona English academy (Susana Gallegos). Vanilla HTML/CSS/JS, no build step. Deploys to coolcatsenglish.com via Netlify.

## Deployment

Pushes to `main` auto-deploy to Netlify (coolcatsenglish.com). There is no build step — Netlify serves the repo root as-is (`publish = "."`).

**CSS/JS are cached for 1 year** (`max-age=31536000, immutable`). After any change to `styles.css` or `app.js`, bump their `?v=N` query string in the HTML that loads them — otherwise Netlify's CDN serves the old version.

## Local development

No local server is needed — open `index.html` directly in the browser.

## Main website structure

- `index.html` + `styles.css` + `script.js` — single-page layout with anchor sections: `#inicio`, `#servicios`, `#acerca`, `#cursos`, `#calendario`, `#faq`, `#contacto`
- CSS variables in `:root` control the color palette (`--primary-color: #0891b2`)
- Mobile nav uses a CSS grid layout in `.nav-container` with `.site-title` (a `<p>` tag) shown only on mobile
- Contact form uses Netlify Forms (`data-netlify="true"`, `method="POST"`, `action="/"`)
- Google Analytics tag ID: `G-3C9GJJYLDK`
