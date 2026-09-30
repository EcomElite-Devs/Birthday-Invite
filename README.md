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

## Google Sheets connection (RSVPs)
1. Create a new Google Sheet (keep it private).
2. Open Extensions > Apps Script, delete the sample code and paste in `apps-script.gs`. Save.
3. Click Deploy > New deployment > type **Web app**. Set "Execute as" to **Me** and "Who has access" to **Anyone**. Deploy and approve the permissions prompt.
4. Copy the Web app URL (ends in `/exec`) and paste it into `GOOGLE_SCRIPT_URL` in `script.js`.
5. Submit a test RSVP. A row appears in a tab named `RSVPs`.
6. If you later edit the Apps Script, use Deploy > Manage deployments > Edit > New version so the same URL picks up the change.

## Map
The map and buttons in the "How to get there" section use a search query in `index.html`. Replace `Mayur+Banquet+Mithapur+Service+Lane+Badarpur+New+Delhi` (three places) with the exact address, or paste a Google Maps "Share > Embed a map" link into the iframe `src`.
