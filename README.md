# KOATJI Sales Analytics — Netlify Dashboard

A React + Vite port of the v11 in-Sheet popout dashboard, deployed to Netlify
and fed by the Apps Script Web App in your Google Sheet.

---

## How it works (the 30-second version)

```
[Google Sheet] → [Apps Script /exec returns JSON]
              ↓
       [Netlify site fetches that JSON]
              ↓
        [Renders dashboard in browser]
```

The data lives in your Sheet. The dashboard lives at a Netlify URL. They talk
over HTTP. You can update the dashboard's look without touching the Sheet, and
update the data without touching the dashboard.

---

## Step-by-step setup

### Prerequisites

1. **A GitHub account** — free at github.com.
2. **A Netlify account** — free at netlify.com. "Sign in with GitHub" is the
   smoothest path.
3. **Your deployed Apps Script URL** — already done. Confirm by opening
   your `/exec` URL in a browser — you should see a JSON blob.

You do NOT need Node.js installed locally for any of this. Netlify will build
the site for you.

---

### Step 1 — Create a GitHub repo with this code

1. Go to github.com → click the green **New** button to create a new repo.
2. Name it whatever you like (e.g. `koatji-dashboard`). Set it to Private
   if you don't want anyone seeing the code.
3. Don't add a README, .gitignore, or license — they'd conflict with what's
   already in this folder.
4. Click **Create repository**.

GitHub now shows you setup instructions. The easiest path:

- On the GitHub repo page, click **uploading an existing file** (the link
  in the "or push an existing repository" section).
- Drag this entire folder's contents (everything except `node_modules/` if
  you have one) onto the page.
- Scroll down, write a commit message like "Initial commit", click
  **Commit changes**.

That's it — your code is on GitHub.

---

### Step 2 — Connect Netlify to the repo

1. Go to app.netlify.com → **Add new site** → **Import an existing project**.
2. Pick **Deploy with GitHub**, authorize Netlify if asked, then select the
   repo you just created.
3. Netlify auto-reads `netlify.toml` and pre-fills the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   Leave these alone.
4. Before clicking Deploy, click **Add environment variables** and add:
   - Key: `VITE_API_URL`
   - Value: your Apps Script `/exec` URL
     (run "Dashboard → Show data API URL" in the Sheet to get it)
5. Click **Deploy**.

Wait ~90 seconds for the first build. When done, click the temporary URL
Netlify gives you (something like `radiant-pony-12345.netlify.app`). You
should see the dashboard.

---

### Step 3 — Add a custom domain (optional)

In Netlify: **Domain management** → **Add a domain**.

If you bought a domain at Namecheap, Google Domains, etc:
1. Enter the domain in Netlify.
2. Netlify shows you DNS records to add at your registrar (usually one A
   record and one CNAME). Add them.
3. Wait 5-60 minutes for DNS to propagate. SSL is automatic via Let's Encrypt.

If you don't have a domain, the `.netlify.app` URL is yours to keep — and
you can rename it under **Site configuration → Change site name**.

---

## Making changes

### Update the data
Edit the Google Sheet. The dashboard re-fetches on every page load, so just
reload the browser tab.

### Update the dashboard UI / fix a bug
1. Edit the files locally (in any text editor).
2. Push the change to GitHub (drag-and-drop on github.com works, or
   `git push` if you've set up Git locally).
3. Netlify auto-redeploys within ~90 seconds.

### Update the API URL
**Site settings → Environment variables** in Netlify. Change `VITE_API_URL`,
then trigger a redeploy from **Deploys → Trigger deploy**.

---

## Local development (optional)

If you want to preview changes before pushing to GitHub:

1. Install Node.js from nodejs.org (LTS version, ~2 minute install).
2. Open a terminal in this folder and run:
   ```
   npm install
   cp .env.example .env.local
   ```
3. Edit `.env.local` and paste your real `/exec` URL.
4. Run `npm run dev`. Opens at http://localhost:5173.
5. Edit files, see changes instantly. When happy, push to GitHub.

---

## File map

```
.
├── index.html                  HTML shell, mounts React
├── package.json                Dependencies + scripts
├── vite.config.js              Build config
├── netlify.toml                Netlify build settings
├── .env.example                Template for env vars
├── src/
│   ├── main.jsx                React entry point
│   ├── App.jsx                 Top-level app, tab routing, state
│   ├── styles.css              Global CSS (dark theme, ports v11)
│   ├── lib/
│   │   ├── api.js              Fetches from Apps Script /exec
│   │   ├── format.js           fmtMoney, fmt, segment colors, etc.
│   │   └── aggregate.js        filtSum / filtAvgVel / etc.
│   ├── hooks/
│   │   └── useDashboardData.js One-shot data loader hook
│   ├── components/
│   │   ├── PeriodPicker.jsx    Dropdown + dual range slider
│   │   ├── SegmentFilter.jsx   Grouped FS/WH/RT pills
│   │   ├── KpiStrip.jsx        Last Month / Quarter / Period KPIs
│   │   ├── SegmentChart.jsx    Bar/line chart used everywhere
│   │   ├── DtcVsB2BChart.jsx   2-series Overview chart
│   │   └── CustomerModal.jsx   Per-customer detail popup
│   └── tabs/
│       ├── OverviewTab.jsx     Cases/Rev/DTC/Doors charts
│       ├── MetricTab.jsx       Cases/Orders/Doors/Velocity/Revenue
│       ├── ReconciliationTab.jsx  Data-Summary vs QBO
│       └── CustomersTab.jsx    Sortable customer table
```

---

## What's NOT yet ported from v11

These existed in the v11 in-Sheet popout but were left out of this initial
port to keep scope manageable. None are needed for daily use; all can be
added as follow-ups:

- **Segment breakdown sparkline rows** below each metric chart (Cases tab,
  Orders tab, etc.). The main chart shows the data; sparklines were a
  nice-to-have summary.
- **Export modal** (CSV / XLSX downloads of various report shapes). Since
  the v11 XLSX export went through `google.script.run`, that path doesn't
  work outside the Sheet — would need to either generate XLSX in the
  browser (via SheetJS) or POST data back to the Apps Script `exportToXLSX`
  endpoint and download from Drive. The Apps Script function `exportToXLSX`
  is still in place, so the second path is straightforward to add.
- **Customer flow chart** ("Live customer base by month") and the
  Active/Trial/Churned status counts above the customer table.
- **Forecast shading** (lighter bars for future months on charts).

If you want any of these next, say which one(s) and I'll add them.

---

## Troubleshooting

**"Failed to load data: Failed to fetch"** in the dashboard
→ Check `VITE_API_URL` in Netlify environment variables. Then trigger a
  redeploy (env vars only apply to new builds, not existing deploys).

**"API HTTP 401" or "Authorization required"**
→ Your Apps Script web app isn't deployed as "Anyone, even anonymous".
  Re-deploy: Apps Script editor → Deploy → Manage deployments → Edit (pencil
  icon) → Who has access: Anyone → Deploy.

**The Reconcile tab is missing**
→ Your `gross p&l monthly` tab is empty. Paste a QBO "Profit and Loss by
  Month" export into that tab; the tab will appear on the next page load.

**Build fails on Netlify**
→ Check the deploy log. Most common cause: a typo in package.json or an
  edited file with broken JSX. Fix locally (or in the GitHub web editor)
  and push again.
