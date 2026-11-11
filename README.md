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
