# Vietnam, together.

A complete mobile-first trip companion for **Sujay, Niyanth, Vishanu, Pujitha and Vedavathi**, with a static GitHub Pages frontend, a Google Apps Script backend, Google Sheets records, and private Google Drive attachments.

## Start here

Open the hosted app at **[Vietnam Together](https://sujaykatta.github.io/Trip/)**. GitHub Pages uses the included GitHub Actions workflow with HTTPS enforced. The Google Apps Script backend is initialized, and `config.js` contains its public endpoint. Production sign-in uses `FRONTEND_ORIGIN=https://sujaykatta.github.io` in Apps Script properties. No privileged credentials belong in this repository.

For a local preview, open `index.html`, or run:

```sh
cd vietnam-trip-manager
npm run serve
```

Open `http://localhost:4173`, then **Take a look around**. Browser storage works most consistently over localhost or HTTPS. The five account cards always ask for a backend access code. Sample access is a separate, explicitly labeled flow.

The live backend is configured for the hosted site. Localhost remains available for the sample preview; to use live sign-in locally, the organizer must set the backend’s allowed origin accordingly.

Sample expenses, dates, budget and rates are fictional. **No actual flight or PNR is prefilled.** Preview changes and uploaded preview files live only in this browser’s IndexedDB. Reset the sample trip in **My account**. The live backend starts with no expenses, flights or documents.

## What works

- Responsive welcome screen and dashboard, light/dark themes, desktop sidebar, and glass mobile navigation.
- Personal paid/share/net balances, group budget, category totals, history and CSV export.
- A dedicated Sujay admin dashboard with five traveler reports, category/date filters, separate paid/share totals, confirmed repayment balances, and per-traveler/group CSV exports.
- Expense creation, editing and soft deletion; equal, exact custom and percentage splits; selected beneficiaries; INR/VND and six other currencies.
- Saved historical conversion rates; integer paise; largest-remainder rounding; sum-preserving settlement suggestions.
- Repayment records, pending/confirmed/cancelled status, sender-only creation and recipient-only confirmation.
- Flights, airport-local times and explicit UTC offsets, passengers, PNRs, baggage, terminals, booking/check-in links, ticket attachments, and downloadable calendar reminders.
- Private or shared files, receipts, hotel/visa/insurance documents, packing checklists, activities, itinerary notes, links and emergency contacts.
- Activity notifications from the audit log, visible on refresh or after an action. These are in-app activity updates, not email or push messages.
- Admin settings for budget, dates, trip name and manually agreed exchange rates.
- Version conflicts, durable mutation request IDs, file validation, literal Sheet strings, CSV formula protection, backend authentication and permission checks.

## Architecture

```text
GitHub Pages: index.html / CSS / JavaScript
        │ origin-checked postMessage, random channel, memory-only token
        ▼
Apps Script HTML bridge → google.script.run.rpc(request)
        │ access-code login / authenticated session / record permissions
        ▼
Google Sheets (8 tabs)            Google Drive (private vault)
        │ locked, atomic batches          │ authorized file download
        └─────────────────────────────────┘
```

The browser never connects directly to the spreadsheet or Drive API. The Apps Script bridge avoids assuming that a cross-origin JSON POST will provide usable CORS response headers. Credentials are passed in message bodies, never URL parameters. Only a random connection nonce appears in the iframe URL.

Every protected operation checks a backend session. Private flight/document metadata is filtered on the server; file downloads check access again. Group expenses and repayments are deliberately shared with all five members. The trip admin may edit group expenses/settings, but does **not** automatically gain app access to another member’s private files. The Google account owning the backend remains the trusted infrastructure administrator and can access the underlying Sheet and Drive folder.

## 1. Prepare the public site address

Use a dedicated GitHub repository for this project, for example `vietnam-trip-manager`. Its Pages address will usually be:

```text
https://YOUR_USERNAME.github.io/vietnam-trip-manager/
```

The corresponding **origin** is just `https://YOUR_USERNAME.github.io`. Do not include the repository path or a trailing slash in the Apps Script origin setting. If using a custom domain, use that exact HTTPS origin instead.

This folder currently sits beside an unrelated workspace project. Copy **the contents of this folder** to a new repository root; do not publish the parent workspace by mistake. The included Actions workflow assumes these files are at repository root.

## 2. Create and initialize the Google backend

1. Open [Google Apps Script](https://script.google.com/) with the Google account that will own the private trip data. Create a standalone project named **Vietnam Together**.
2. Copy these files from `backend/` into matching Apps Script files:
   - `Code.gs`
   - `Core.gs`
   - `Setup.gs`
   - `Bridge.html` (create an **HTML** file named `Bridge`)
3. In **Project Settings**, enable showing `appsscript.json`. Replace its contents with the included manifest. It specifies the V8 runtime, the Google Sheets advanced service, and required Sheets/Drive scopes. If using a standard Google Cloud project, also enable the Sheets API there.
4. In **Project Settings → Script Properties**, add `FRONTEND_ORIGIN` with the HTTPS origin from step 1. To connect the local preview first, use `http://localhost:4173` instead. HTTP is permitted only for localhost/127.0.0.1; use HTTPS when publishing. Update this property to the published origin when switching to GitHub Pages.
5. In the editor, select and run **`initializeTrip`**. Authorize the Google scopes. The visible entry point checks the active Google identity against the executing owner before calling the private setup helper.
6. Setup creates a new spreadsheet and private Drive folder. It stores `SHEET_ID`, `DRIVE_FOLDER_ID`, `SHEET_TAB_IDS`, and `AUTH_PEPPER` in **Script Properties**, not the frontend.
7. The execution log prints the spreadsheet URL and **one generated 64-character access code per member**. Give each person only their own code through a private channel. Keep codes and the execution log private. Do not paste codes into issues, source files, screenshots, or `config.js`.
8. Setup creates the five accounts; Sujay is the trip admin. Budget and trip dates start empty. The initial exchange rates are clearly illustrative; replace them with agreed rates before entering real expenses.

Setup refuses to overwrite an already configured spreadsheet. Keep the Sheet, Drive folder, Apps Script project and their logs private to the organizer. Do not share the Sheet with travelers: that would bypass app permissions and expose authentication hashes.

### Using an existing spreadsheet

The recommended setup creates a fresh correctly structured Sheet. To use a different Sheet, first duplicate the initialized Sheet **with all eight tabs and headers intact**. Then set `SHEET_ID` to the copy’s ID and update the `SHEET_TAB_IDS` JSON property with its numeric tab IDs (`gid` in each tab URL). Do not point the script at an arbitrary uninitialized spreadsheet. Never sort, delete, or change header cells while the app is in use.

## 3. Deploy the Apps Script web app

1. Choose **Deploy → New deployment → Web app**.
2. **Execute as:** your deploying Google account.
3. **Who has access:** **Anyone** (anonymous access). The app itself verifies every account code and session. An “Anyone with a Google account” deployment adds a separate Google sign-in gate and can break the embedded bridge.
4. Deploy and copy the URL ending in **`/exec`**. Do not use the editor-only `/dev` URL.
5. Set the public endpoint in `config.js`:

```js
window.TRIP_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  allowPreview: true
};
```

The deployment URL is public routing configuration, not a credential. No Sheet ID, Drive ID, access code, OAuth token, pepper or service-account key is needed in frontend files.

For updates: edit the Apps Script sources, then **Deploy → Manage deployments → Edit → New version → Deploy**. Keeping the same deployment preserves the `/exec` URL. Frontend changes alone do not update the backend.

## 4. Publish on GitHub Pages

Create an empty GitHub repository. From a **separate new directory** containing this project’s files:

```sh
git init -b main
git add .
git commit -m "Build Vietnam Together trip manager"
git remote add origin https://github.com/YOUR_USERNAME/vietnam-trip-manager.git
git push -u origin main
```

In the repository, open **Settings → Pages → Build and deployment**, and select **GitHub Actions**. Run **Test and publish Vietnam Together** from the Actions tab, or push another commit.

The workflow installs dev-only testing tools, runs accounting/backend and browser checks, then publishes only the public frontend and assets. It excludes the backend, tests, package files and README from the Pages artifact. The deployed frontend has **no Node, Python or local-server dependency**.

After deployment, open the Pages URL and sign in with a generated access code. Set the budget and exchange rates under **My account → Trip settings**. You can set `allowPreview: false` to hide sample access on the published site; real authentication does not depend on this setting.

## Sujay’s admin dashboard

Sign in as **Sujay**, then choose **Admin** in the mobile navigation or **Admin dashboard** in the desktop sidebar. The same link is available in My account. Other members do not receive the admin navigation or report access.

The page shows all five travelers. Select a traveler to inspect every bill they paid or shared, their exact allocation, and confirmed repayments sent/received. Use **Paid by**, **Shared with**, or **Recorded by** to distinguish the payer, beneficiary and person who entered a bill. Every row opens the existing expense detail/edit flow; Sujay retains the existing permission to edit group expenses.

Date/category filters affect the report’s totals. Dates include only expenses and repayments dated within that period. Category views exclude repayments, since repayments have no expense category; their balances show paid minus allocated share within that category. Search and relationship filters affect the selected traveler’s bill list and CSV export. Group summary exports cover all five members in the date/category scope.

The `adminReport` backend operation checks the authenticated user’s current role on every request. Changing a name or role in the browser cannot grant admin report access. The report returns no access-code hashes or private Drive references, and private flights/documents retain their sharing permissions. No new spreadsheet tabs are required. The existing Apps Script deployment was updated with this operation.

## Authentication and privacy

- Codes are generated with two UUIDs, rather than short PINs or human-chosen passwords. The server stores a SHA-256 digest with a server-only pepper. This scheme is for high-entropy generated secrets; do not replace codes with short passwords without adopting a suitable password KDF and abuse protection.
- A successful login issues an eight-hour opaque bearer session. Its hash is stored in Script Properties. The browser token stays in JavaScript memory only. **Refreshing the page signs you out.** No real trip records or tokens are cached in localStorage/IndexedDB.
- Up to five active sessions per member. Old sessions and expired sessions are cleaned during login. Ten failed attempts for an account within fifteen minutes temporarily block that account.
- The bridge checks the configured exact page origin and `event.source`; the frontend checks Google’s bridge origin, a cryptographically random per-page channel and then pins the responding window/origin. All records still require backend authorization.
- Expense edits/deletions are allowed for the creator or Sujay. Only owners edit/delete flights and vault items. A traveler with access can mark a shared checklist complete. The owner always retains access.
- Users can record money paid by another traveler because that is a shared expense ledger. This does not grant access to the payer’s private files or account.
- Generated secrets are bearer credentials: a person who has someone else’s code can sign in as that person. Keep and share them accordingly. The app does not attempt to identify physical users from names.

### Rotate an access code or deactivate an account

Set `ROTATE_USER_ID` in Script Properties to `sujay`, `niyanth`, `vishanu`, `pujitha` or `vedavathi`. Use an owner-checked editor wrapper to invoke **`rotateAccessCode_`**; private helper names are hidden from the Run menu. It replaces the code hash, revokes that member’s sessions, clears their failed-attempt counter, records an audit event and prints the new code once. Remove access completely by changing that user’s `status` cell in `Users` from `active` to `disabled`; every request rechecks status.

## Sheet tabs and record rules

| Tab | Stored data |
| --- | --- |
| `Users` | Stable IDs, names, login identifiers, roles, active status, code hashes and timestamps |
| `Expenses` | Original minor units/currency, saved rate, INR paise, payer, category, date, owner, version and deletion flag |
| `ExpenseSplits` | Expense ID, revision, user ID and exact INR allocation; prior revisions remain for history |
| `Settlements` | Sender, recipient, amount, payment date, pending/confirmed/cancelled state and timestamps |
| `Flights` | Airports, local times, explicit offsets, PNR, passenger IDs, links, access list and version |
| `Documents` | Vault item/file metadata, Drive ID, owner, access list, optional flight/expense link and version |
| `TripSettings` | Trip name/dates, budget in INR paise, manually configured rates and version |
| `AuditLog` | Actor, action, target, audience, before/after records, request ID, request digest and timestamps |

Arrays/objects use JSON cells. IDs join records. Numeric values are written as numeric cells; strings are written explicitly as literal string cells, never formulas. Rows are not physically removed by the application.

All read/modify/write operations hold a **script lock**. Related Sheet changes—including splits and audit/deduplication entries—commit in one atomic `spreadsheets.batchUpdate`. `version` rejects stale edits. Repeating the same mutation ID and payload returns its prior result; reusing the ID for different content is rejected. If a save times out, retry from the **same open form**. If the form was closed, refresh and check history before resubmitting.

## Money rules

- INR is the fixed accounting/display base. Supported original currencies: INR, VND, USD, EUR, GBP, SGD, THB and JPY. VND/JPY accept whole currency units; the others accept two decimal places.
- Amounts are parsed as decimal strings, not binary floating-point inputs. Conversion uses scaled integers and BigInt, rounds half-up to paise, and saves the rate with the expense.
- Equal shares and percentage/custom weights use the largest-remainder method. Remaining paise go to the largest fractional remainders; ties use stable user-ID ordering. Every split sums exactly to the converted bill.
- Custom allocations must sum to the original currency amount. Percentages must sum to exactly `100.00%`. Participants must be unique valid travelers.
- Net balance = paid − allocated share + confirmed repayments sent − confirmed repayments received. Positive means money to receive; negative means money to pay. Settlement suggestions simplify these net balances; they are not necessarily direct reimbursements to the payer of each individual bill.
- Confirmed repayments remain real money transfers even if an expense is later edited/deleted. Deleting a bill can therefore create a refund obligation.
- Currency rates are manual agreed inputs, **not live market quotes**. Changing settings never revalues historical bills.

## Files, reminders, and operational limits

Attachments support PDF, PNG, JPEG, WebP, TXT and CSV, up to **5 MB each**. The backend validates size, allowed type and binary signatures for PDF/images; HTML, SVG and executables are not accepted. Files are downloaded as attachments instead of rendered as active content. This is type validation, not antivirus scanning.

Drive files inherit only the private organizer folder. Travelers receive authorized file bytes through the app, not public Drive links. Soft-deleted file metadata stops downloads but retains the original Drive file for audit/recovery. A failed Sheet commit after a Drive upload can leave an orphan file; keep it until the organizer verifies it is unreferenced. Sheets and Drive cannot be committed as one atomic transaction. A successfully created expense and its optional receipt are also separate operations: if the receipt fails, the app clearly reports that the expense was saved and lets you attach the receipt later.

Calendar exports create an event and a reminder three hours before departure. Flight reminder text and audit notifications are in-app information; there is no background email/push scheduler. Downloaded files, calendar entries and CSV exports cannot be recalled after sharing is revoked.

This is designed for five travelers, not a large public service. It reads the small trip tables per request. Apps Script/Sheets/Drive impose quotas, latency and runtime limits; public endpoints do not provide strong denial-of-service protection. Workspace administrators may prohibit anonymous web apps. If **Anyone** is unavailable, use an allowed Google account or change the hosting/auth architecture; a frontend-only workaround cannot fix that policy. Browser extensions or third-party-frame restrictions may block the bridge. Test the actual GitHub Pages + Apps Script combination on each traveler’s browser before relying on it.

## Running doGet from the editor

The current `doGet` detects an editor run without a web request and calls the owner-checked `initializeTrip` setup entry point. It does not read `e.parameter` until a real request event is present. Both editor initialization routes require the current `Setup.gs` and the userinfo.email scope in the manifest. Public visitors cannot use this editor fallback without passing the owner identity check.

## Apps Script save errors

If Apps Script reports `Unexpected token ILLEGAL` at a BigInt expression in `Core.gs`, use the current `backend/Core.gs`. It uses `BigInt(100)` constructor syntax instead of BigInt numeric literals such as `100n`, which the Apps Script save parser can reject. Keep `"runtimeVersion": "V8"` in the manifest. Save the project before selecting `initializeTrip`; a failed save can leave the old `myFunction` selection in the toolbar.

## Tests and maintenance

```sh
npm ci
npm test                 # accounting + mocked Apps Script integration tests
npm run serve            # separate terminal
npm run test:ui          # requires installed Chrome
```

For Playwright’s bundled browser:

```sh
npx playwright install chromium
PLAYWRIGHT_CHANNEL=chromium npm run test:ui
```

`core.js` is shared accounting logic. After editing it, run `npm run sync:backend`; then copy the updated `backend/Core.gs` into Apps Script and redeploy. A test checks that the two copies are identical.

The automated backend tests execute the actual Apps Script source against in-memory Google-service substitutes. They validate application logic, **not a deployed Google service or live quota/CORS behavior**. Browser tests exercise sample mode in real Chromium. Follow **TESTING.md** for live deployment acceptance tests.

## Files

```text
index.html, styles.css, app.js       Interface
core.js                             Shared accounting/validation
admin.js, admin-page.js              Admin financial reporting and page
api.js                              Live bridge client + isolated preview adapter
config.js                           Public endpoint configuration
assets/                             Local photo, logo, font and font license
backend/                            Apps Script source, manifest and initialization
scripts/sync-backend.cjs             Keep shared backend accounting in sync
.github/workflows/pages.yml          Tests + GitHub Pages deployment
TESTING.md                          Complete live acceptance checklist
tests/                              Accounting, permissions, transport and browser tests
sample/sample-data.json              Exported illustrative fixture for reference
VERIFICATION.md                     Completed checks and deployment boundaries
```

## References and credits

- [Apps Script HTML communication](https://developers.google.com/apps-script/guides/html/communication), [web app execution and deployment](https://developers.google.com/apps-script/guides/web), and [iframe embedding behavior](https://developers.google.com/apps-script/reference/html/html-output). The bridge uses HTML service and `google.script.run`; `ALLOWALL` is paired with exact-origin messaging checks.
- [Atomic Sheets batch updates](https://developers.google.com/workspace/sheets/api/guides/batch), [script locks](https://developers.google.com/apps-script/reference/lock/), and [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Bundled Vietnam photograph on Unsplash](https://images.unsplash.com/photo-1528127269322-539801943592) — decorative destination imagery, not evidence of a group booking. [Unsplash license](https://unsplash.com/license).
- [Manrope](https://github.com/sharanda/manrope), licensed under SIL Open Font License; license included in `assets/FONT-LICENSE.txt`. System fonts provide a fallback for additional currency glyphs.
- The design is independently created and inspired by translucent glass interfaces; it is not an Apple product.

### Day-by-day planning

The Itinerary page builds a day selector from trip dates and shared flights. Add timed plans and hotel links, keep hotels shortlisted until booked, then mark a stay confirmed to place check-in and check-out on their respective dates. These plans are stored privately in the existing Google Sheets Documents table and shared with the five travelers; no schema change or Apps Script redeployment is required. Each owner can edit their entries. Confirming a stay never creates an expense automatically.

Members can use **I have paid Sujay** under Expenses to record a repayment. It remains pending until Sujay confirms receipt in **Expenses → Settle up**. The app records repayments only; it does not transfer money.

Hotel shortlisting supports pasted HTTPS URLs and shared messages via **Add hotel from link**. Full property URLs can supply the name, city, proposed dates and party size; short links can be opened to review the property. Selecting a supported city suggests a stay from the existing arrival and onward flights, including a warning when a flight is pending. Saved shortlist dates remain potential until the booking is explicitly confirmed.

### Personal passwords

After signing in, open **My account / Profile → Change password**. Enter the current password or original access code, then a matching new password of 12–128 characters. A successful change signs out every session for that user and replaces the original access code. The organizer can still recover an account using the existing access-code rotation helper.

The browser uses Web Crypto PBKDF2-HMAC-SHA256 (600,000 iterations) with a fresh random salt, account ID and deployment URL before sending a verifier through the pinned bridge. The server stores only a peppered hash of that verifier plus the public salt, never password text. The same stable Apps Script deployment URL must be retained. This work factor follows the [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2). Backend Version 3 supports the password protocol without changing the Sheet schema.

### Image scanning and day navigation

Itinerary now has **Day by day** and **Hotels** tabs. Use the horizontal numbered days or range slider to select a date. Daily pages show a compact summary of hotels for that date; use **View hotels** to open the filtered full shortlist.

New expense, flight, hotel and vault forms accept PNG/JPEG/WebP images for on-device text recognition. Receipt or vault image uploads also trigger scanning. Detected fields are highlighted for review; manually edited fields are preserved, and scanning never saves a record automatically. Scanning alone does not attach an image; use the receipt/ticket/vault attachment controls to keep a file. OCR can misread text and leaves unsupported fields for manual entry. English OCR is currently bundled locally. The first scan loads a model and worker from this site, without sending the image to a third-party recognition service. Runtime/model licenses and reproduction instructions are in assets/ocr/NOTICE.md.

Flights from recognized VietJet Air and Vietnam Airlines bookings include an official manage-booking link and Copy PNR. The portal opens without sending the booking reference in its URL; enter the copied reference and passenger details on the airline site. Portal destinations were checked against the official airline pages on 16 October 2026.

### Trip overview on Home

Home prioritizes the journey: the next flight, other recorded flight legs, a selectable daily itinerary preview, confirmed stays and hotel options, saved documents, and the crew. Travel shortcuts open the matching date or hotel list. The spending summary, recent expenses and budget sit together at the bottom. All cards use the signed-in user’s current trip snapshot.
