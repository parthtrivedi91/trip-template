# Trip template

A phone-first trip website that draws everything from a Google Sheet. Changing a trip means editing the sheet, never this code.

## How it works

- **Master sheet (private):** every tab, including costs and expenses. You and the people travelling edit it.
- **Public sheet:** copies only the shareable tabs from the master with IMPORTRANGE, and is shared as "Anyone with the link can view". The site reads this one.
- **Site:** `index.html`, `styles.css`, `app.js`. The share link carries the public sheet's ID after `#s=`, so no trip data is stored in this repo.

## Links

- Sample trip (Montenegro, for testing): open `index.html` with no `#s=` part.
- A real trip: `https://parthtrivedi91.github.io/trip-template/#s=<PUBLIC_SHEET_ID>`
- Try the Today view on a given date: add `&today=2027-04-18` to the link.

## Never put in any public tab

PINs, booking references, surnames, seat numbers, passport or card numbers.

## Offline

- The first visit with internet saves the site files (service worker, `sw.js`) and the trip data. After that it opens with no signal and shows "No connection. Showing the copy saved …".
- The footer badge says "✓ Saved for offline" once both are stored.
- Add to the home screen: iPhone Safari → Share → Add to Home Screen; Android Chrome → menu → Add to Home screen. Open the icon once with internet, because on iPhone the home-screen app keeps its own storage.
- The icon reopens the last trip opened. To see the sample instead, add `#sample` to the link.
- When any site file changes, bump `VERSION` in `sw.js` so phones fetch the new files.

Fonts: Cormorant Garamond and DM Sans, self-hosted under the SIL Open Font License (see `fonts/`).
