# Storm release website

Static site for the Storm browser, plain HTML/CSS/JS, no build step, no dependencies, no cookies or analytics (the font loads from Google Fonts).

```
index.html          landing page
download.html       download button, "thanks + 3 steps" screen, requirements, checksum
pricing.html        paid add-ons (Rainshield, Mirage, RainProtection)
privacy.html        privacy policy
changelog.html      release notes
updates/latest.json auto-updater manifest (read by the browser)
config.js           ← download URL, version, size, SHA-256 (edit per release) + STORM_BUY_BASE (checkout links)
storm.js            fills in values from config.js, buy links, menu, download thank-you steps
style.css           shared styles
favicon.svg
trailer/            trailer page, app icon and screenshots (used by the site)
```

## Shipping a release

1. Build `Storm.exe`, upload it somewhere (e.g. a GitHub Release asset).
2. Get its checksum: `Get-FileHash .\Storm-Setup.exe -Algorithm SHA256`
3. Edit **`config.js`**, `downloadUrl`, `version`, `date`, `sha256` (and `sizeLabel` if you want it shown). Every download button and checksum on the site reads from this one file.
4. Edit **`updates/latest.json`**, same `version`, `url`, `sha256`, plus the update `signature` and short `notes`. The browser's auto-updater reads this file at `https://<your-domain>/updates/latest.json`.
5. Add a new `<article class="release">` block at the top of `changelog.html`.

## Download flow

Download buttons on every page go to `download.html#thanks`, which starts the download and shows the "Thanks for downloading! Just a few steps left" cards (Open, Allow, Install). The button on the download page itself does the same.

## Pricing links

The "Get" buttons on `pricing.html` link to `STORM_BUY_BASE + "/rainshield"`, `"/mirage"` and `"/rainprotection"`. Change `STORM_BUY_BASE` in `config.js` to move checkout.

## Look

Black theme only (no light mode). Card colours are saturated and pass WCAG AA for their text. Font: Plus Jakarta Sans from Google Fonts (falls back to Segoe UI). Colors are CSS variables at the top of `style.css`.

## Hosting for free

### GitHub Pages
1. Create a GitHub repo and push the contents of this folder to it (the files at the repo root).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` and `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two. Custom domain: add it under the same Pages settings and point a CNAME DNS record at `<user>.github.io`.

GitHub Releases is also a good free place to host `Storm-Setup.exe` itself, use the asset's download URL in `config.js` and `latest.json`.

### Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages → Create → Pages**.
2. Either connect the GitHub repo (framework preset: **None**, build command: empty, output directory: `/`), or choose **Direct Upload** and drag this folder in.
3. You get `https://<project>.pages.dev`; add a custom domain under the project's **Custom domains** tab.

Note: Cloudflare Pages has a 25 MB per-file limit, so host the installer on GitHub Releases (or R2) rather than inside the site.

## Preview locally

```powershell
python -m http.server 8080
```
then open http://localhost:8080. (Opening `index.html` directly from disk also works.)
