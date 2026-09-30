# Birthday invitation website

A static, mobile-friendly birthday invitation starter. It includes:
- Invitation artwork (`assets/invitation.png`)
- Responsive layout
- Starter quiz and balloon-popping game
- RSVP form prepared for Google Apps Script / Google Sheets

## Preview locally
Open `index.html` in a browser. For best results, use a local static server (for example, VS Code Live Server).

## Customize
Edit `script.js`:
- Replace the starter quiz questions with real birthday facts.
- Set `GOOGLE_SCRIPT_URL` after deploying the Google Apps Script backend.
- Confirm the date/month/year and update the invitation details in `index.html`.

Replace the memory placeholders in `index.html` with your photos. Keep media in `assets/` and use relative paths such as `assets/photo-1.jpg`.

## Free deployment
1. Create a free Cloudflare account.
2. Open Workers & Pages → Create application → Pages → Upload assets (or connect a Git repository).
3. Upload the contents of this folder (not the ZIP itself, if using direct upload).
4. Cloudflare will provide a `*.pages.dev` URL.

## Google Sheets connection
The RSVP form is not connected yet. Create a Google Sheet and an Apps Script web app, deploy it to accept requests from anyone with the link, then paste the deployment URL into `GOOGLE_SCRIPT_URL`. Do not make the spreadsheet itself public. Test with a sample RSVP before sharing the invite.
