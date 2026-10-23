# The 13th Hour 🩺💉

A clickable prototype of a stress-relief app for nurses. Built with Next.js and Tailwind CSS.

## Run it on your Mac

You need **Node.js** (version 18.18 or newer). Check by opening Terminal and running:

```
node -v
```

If you see "command not found", install the LTS version from https://nodejs.org first.

Then, in Terminal:

```
cd ~/Downloads/the-13th-hour     # or wherever you unzipped it
npm install                       # first time only, takes a minute
npm run dev
```

Open **http://localhost:3000** in your browser. Leave Terminal running — every time you save a change to a file, the page updates by itself. Press `Ctrl + C` in Terminal to stop it.

**See it as a phone:** in Chrome, press `Cmd + Option + I`, then click the phone icon (top-left of the panel) and pick an iPhone.

**See it on your actual phone:** while `npm run dev` is running, Terminal shows a "Network" address like `http://192.168.1.20:3000`. Open that on your phone (same Wi-Fi).

## Where things live

| What | File |
|---|---|
| The whole app | `components/The13thHour.jsx` |
| Permission slips | `SLIPS` list near the top of that file |
| Vibe buttons | `VIBES` list near the top |
| City suggestions | `STATES` list near the top |
| Page title / tab name | `app/layout.jsx` |

## Add the real PDF

1. Put your PDF in the `public` folder, e.g. `public/remote-nursing-exit-strategy-guide.pdf`
2. In `components/The13thHour.jsx`, change `const GUIDE_URL = null;` to
   `const GUIDE_URL = "/remote-nursing-exit-strategy-guide.pdf";`

## Reset the location setup screen

The app remembers the city/state in your browser. To see the setup screen again, open the page in a private window, or in Chrome DevTools go to Application → Local storage and clear it.

## Put it on Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, click **Add New → Project**, import the repo, and click **Deploy**. No settings to change.
