# Deployment acceptance checklist

Run this on the actual published HTTPS Pages site after configuring Apps Script. The local automated tests do not replace these live checks. Use temporary records and small amounts, then delete/cancel them where applicable. Do not upload real sensitive documents until access controls pass.

## Deployment and authentication

- [ ] `initializeTrip` created all eight tabs, their exact headers, five active members and a private Drive folder.
- [ ] `FRONTEND_ORIGIN` exactly equals the published site’s origin. No path or trailing slash.
- [ ] The public `config.js` includes only the `/exec` URL and preview flag.
- [ ] The web app executes as the owner and allows Anyone. Open the Pages site in a signed-out/private browser window to test the bridge without an accidental Google-account dependency.
- [ ] Each account card opens a code form. Empty, incorrect, and another member’s code are rejected.
- [ ] Each valid code opens the matching account. No code hashes, credentials, private Drive IDs or private records for other users appear in returned payloads.
- [ ] Refresh requires sign-in again. Sign-out invalidates the previous session on the server.
- [ ] Rotate a temporary account’s code: old code and existing sessions stop working, new code works.
- [ ] Disabled account cannot sign in or use a previously valid session.
- [ ] An unexpected embedding origin gets no usable bridge reply. Forged `postMessage` events do not authenticate or mutate records.
- [ ] Check Chrome, Safari on iPhone/iPad, and another intended traveler browser. If embedding is blocked, resolve deployment/account/browser restrictions before using real data.

## Accounting

- [ ] Sujay pays ₹5,000, split among all five: each share is ₹1,000; Sujay is owed ₹4,000; each other member owes ₹1,000 (in an otherwise empty test trip).
- [ ] ₹0.03 split five ways allocates exactly three paise with stable tie-breaking. No lost or duplicated paise.
- [ ] VND 100,001 at INR 0.0033 converts to ₹330.00. Original amount, currency and rate remain stored.
- [ ] Change the configured VND rate: prior bill value stays ₹330.00.
- [ ] Custom amounts totaling less/more than the bill cannot save. 99.99% and 100.01% cannot save.
- [ ] A subset split affects only selected beneficiaries. The payer can be outside that subset.
- [ ] A noncreator cannot edit/delete another member’s expense; Sujay can as admin.
- [ ] Edit the same expense in two tabs: the stale form is rejected rather than overwriting the first edit.
- [ ] Double-click or retry a timed-out save from the same form: one expense, one current set of splits, one mutation audit event.
- [ ] CSV exports match active filters, quote commas/newlines and neutralize leading formula characters.

## Admin reports

- [ ] Sign in as Sujay: Admin appears in mobile navigation, desktop sidebar and My account.
- [ ] Select each of the five travelers. Paid totals equal their actual bill payments; share totals equal only their own allocations.
- [ ] A ₹5,000 bill split five ways shows ₹5,000 paid and ₹1,000 share for its payer, and ₹0 paid / ₹1,000 share for each other beneficiary.
- [ ] Paid by, Shared with and Recorded by select the intended bills. Search and CSV export match the displayed list.
- [ ] Date filters use transaction dates for expenses and repayments. Category views exclude repayments and disclose that scope.
- [ ] The group summary includes all five members and balances sum to zero.
- [ ] Ordinary members have no admin navigation; a direct/forged adminReport request is rejected on the server.
- [ ] The admin report does not expose another member’s private documents, authentication secrets or Drive IDs.
- [ ] Admin navigation and reports fit 320 px and 390 px screens; wide tables scroll inside their panels.

## Repayments

- [ ] Sender records a payment; it stays pending and does not change balances.
- [ ] Only the recipient can confirm receipt. A third member and the sender cannot confirm it.
- [ ] On confirmation, sender debt and recipient credit change by exactly the recorded amount; group net remains zero.
- [ ] Sender or recipient can cancel a pending record. Confirmed payments cannot be casually edited/cancelled.
- [ ] History status filters work. A settled group produces an empty suggested-transfer list.
- [ ] Deleting a bill preserves confirmed money transfers and computes any resulting refund correctly.

## Private vault and files

- [ ] Owner uploads a valid file with no other viewers: other travelers, including the trip admin, receive neither its metadata nor its bytes through the app.
- [ ] Adding one viewer permits only that viewer and the owner; removing them blocks future reads/downloads immediately.
- [ ] Guessing/changing a document ID or browser-side `me` variable cannot bypass the backend.
- [ ] Valid PDF, PNG, JPEG, WebP, TXT and CSV files download successfully with their original names.
- [ ] Files above 5 MB, SVG/HTML/executables, and mismatched PDF/image signatures are rejected.
- [ ] Drive folder and uploaded files have no public or traveler sharing grants.
- [ ] A bill receipt is linked to the correct bill. A ticket attachment is linked to the correct flight.
- [ ] Failed receipt upload reports the saved expense clearly; attaching it later works without a duplicate bill.
- [ ] Only owner edits/deletes a vault item. Any authorized viewer can toggle a shared checklist.
- [ ] Deleted document metadata no longer grants downloads; organizer retains the file for audit/recovery.

## Flights, plans and interface

- [ ] No invented flights or PNRs appear in the live empty database.
- [ ] Add real local departure/arrival times and UTC offsets. Cross-midnight/time-zone flights sort by actual departure instant.
- [ ] Arrival before departure is rejected after applying offsets. Offset values beyond ±14:00 are rejected.
- [ ] Passenger list, PNR, baggage, terminal, notes, links and sharing permissions persist after reload/sign-in.
- [ ] Downloaded `.ics` shows the right departure/arrival times and a reminder three hours before departure in your calendar app.
- [ ] Booking/check-in links open safely in a new tab. Unsafe URL schemes are rejected.
- [ ] Activities, emergency contacts, notes, packing lists and shared links work from the vault.
- [ ] New authorized expenses/tickets appear in activity notifications after refreshing.
- [ ] Main navigation, dialogs, keyboard focus, validation errors, toasts, loading states and empty states work at 390 px, tablet width and desktop width.
- [ ] Light and dark modes preserve financial readability; reduced-motion preference is respected.
- [ ] Sample-mode data never enters the Google database. Hiding preview access does not affect live sign-in.

## Recovery and trust boundaries

- [ ] Keep organizer-only backups of the Sheet and private Drive folder before travel.
- [ ] Verify the organizer can inspect before/after audit records. Never grant direct Sheet access merely to let someone use the app.
- [ ] On an ambiguous service timeout, keep the form open and retry its same request ID. If closed, refresh history before creating another record.
- [ ] Verify any orphan upload against `Documents` and `AuditLog` before moving it to trash; an ambiguous Sheets timeout may actually have committed.
- [ ] Confirm current Google quotas support the group’s expected usage. This implementation has no offline real-data mode, automatic currency feed, virus scanner, push/email delivery or uptime guarantee.
