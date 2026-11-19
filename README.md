# Storm release website

Static site for the Storm browser, plain HTML/CSS/JS, no build step, no dependencies, no cookies or analytics.

```
index.html          landing page
download.html       download button, requirements, checksum
privacy.html        privacy policy
changelog.html      release notes
updates/latest.json auto-updater manifest (read by the browser)
config.js           ← download URL, version, size, SHA-256 (edit this per release)
storm.js            rain/lightning canvas, nav, fills in values from config.js
style.css           shared styles
favicon.svg
img/                put real screenshots here
```

## Shipping a release

1. Build and sign `Storm-Setup.exe`, upload it somewhere (e.g. a GitHub Release asset).
2. Get its checksum: `Get-FileHash .\Storm-Setup.exe -Algorithm SHA256`
3. Edit **`config.js`**, `downloadUrl`, `version`, `date`, `sha256` (and `sizeLabel` if you want it shown). Every download button and checksum on the site reads from this one file.
4. Edit **`updates/latest.json`**, same `version`, `url`, `sha256`, plus the update `signature` and short `notes`. The browser's auto-updater reads this file at `https://<your-domain>/updates/latest.json`.
5. Add a new `<article class="release">` block at the top of `changelog.html`.

## Screenshots

The landing page has placeholder frames. Replace a `.shot` block's inner `.label` with `<img src="img/study.png" alt="…" style="width:100%;height:calc(100% - 34px);object-fit:cover">` (or drop the whole `.shot` and use an `<img>`). 16:10 images fit best.

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
