# Verification

Accounting, backend, setup and transport tests verified on 16 October 2026; browser and visual checks completed on 15 October 2026.

- **45 automated accounting, backend, setup and transport tests passed.** The accounting checks include 1,000 deterministic randomized split/settlement cases.
- **14 browser acceptance scenarios passed in real Chromium**, with no browser runtime or resource errors. Scenarios cover account selection, receipt downloads, custom-split validation/editing, filtered CSV exports, flights/tickets/calendar export, private notes, checklist/repayment confirmation, settings/summary, mobile/dark layouts, and preview persistence.
- Visual inspection completed for desktop and mobile dashboards, welcome screen, and a dark mobile expense form.
- All five app sections fit a 390 px viewport without horizontal overflow; desktop checked at 1440 px.
- Browser and Apps Script accounting sources are identical.
- Existing files in the parent workspace were left unchanged.

The backend tests run the actual `.gs` source with mocked Google services. The message transport tests check request origin, source window, channel validation and token handling. Browser tests override endpoint configuration and run isolated preview mode.

Live backend connection verified on 16 October 2026 after the organizer completed initialization: the configured Apps Script deployment responds from the localhost frontend, reads the initialized Sheet schema, and rejects an unauthenticated data request with the expected sign-in requirement.

Live Sujay sign-in was also verified in the in-app browser on 16 October 2026 after reloading the current backend configuration. The dashboard displayed the private trip with its actual empty expense history. Configuration loading now includes a version query to avoid reusing an old config response.

**Not yet verified:** real file uploads and per-member Drive access in your account, Safari/iPhone behavior. Continue the acceptance checks in TESTING.md. No real trip expenses or private documents were uploaded during verification.

Admin update: all five traveler reports, filtered CSV exports, per-traveler paid/share balances and member access rejection were checked. Admin layouts were tested at 320 px and 390 px. The backend role is rechecked on each adminReport request, including after role revocation. Apps Script deployment Version 2 was published on 16 October 2026 using the existing /exec URL.

Live admin acceptance completed: Sujay signed into the updated frontend against deployment Version 2, opened Admin, loaded all five member summaries from the protected report endpoint, and selected Niyanth’s individual report. No real expenses, repayments or private files were added during this check.

GitHub Pages production deployment verified on 16 October 2026 at https://sujaykatta.github.io/Trip/. The deployment workflow passed all 45 automated tests and 14 browser acceptance scenarios. HTTPS is enforced. The backend FRONTEND_ORIGIN is set to https://sujaykatta.github.io; live Sujay sign-in and the protected individual admin reports were verified from the hosted site.

Itinerary update: all 45 unit/backend tests and 17 browser scenarios passed. Added checks cover hotel shortlist/confirmation, separate check-in/check-out day timelines, invalid plan times, persistence after reload, and 320 px itinerary layout. The new member repayment action was also checked: recording a payment keeps the balance unchanged until confirmation and prevents resubmitting the full pending amount. Private ticket details and expense amounts are stored in Google Sheets, never bundled into the public frontend.

Hotel link update: 49 automated tests and 18 browser scenarios passed, including shared-message URL/name extraction, full-link potential dates, invalid-date/unsafe-link rejection, flight-derived stay suggestions, and shortlisted hotels appearing on relevant day pages without creating confirmed check-in events.

Password update: 54 automated tests and 19 browser scenarios passed, covering current-credential checks, user isolation, all-session revocation, failed atomic writes, throttling, PBKDF2 outputs, password-proof login/change transport, and form confirmation/sign-out. Apps Script Version 3 was deployed on 16 October 2026. Tests use synthetic credentials and do not change any real member password.

Day navigation, image scanning and mobile alignment update: all 60 automated tests and 21 browser scenarios passed. Real local OCR recognized a synthetic receipt and correctly filled the paid amount from the organizer-provided ticket image without saving a record. Tests cover preserving manual edits, official booking links/PNR copy, a numbered slider, separate Hotels management, concise daily hotel summaries, and long route text at 320/375/390/430/540/700 px. The first mobile reproduction exceeded the viewport by 129 px; the fixed expense, travel, budget and crew panels stay within the content edges.

Trip-first Home update: 60 automated tests and 22 browser scenarios passed. The added Home acceptance check verifies that travel and hotels lead, the spending section is last, day shortcuts select the matching itinerary date, and hotel/flight shortcuts open the right sections. Mobile checks cover 320–700 px with long airport names. Navigation from the bottom spending section was also checked to open the destination at the top.

Connection recovery update: 61 automated tests passed, including a delayed Google bridge, a fresh channel on automatic retry, rejection of late frames, exhaustion of both attempts, and recovery on the next sign-in. Live Niyanth sign-in with the original access code succeeded before the update; the reported timeout could not be reproduced. The frontend now allows two 30-second connection attempts without sending credentials before a trusted handshake.

Light-default update: checked with a dark system color scheme and an older saved dark preference; initial render uses light. Explicitly selecting dark still persists after reload. New browser preference key applies the requested one-time default to returning users too.

Name correction: the traveler display name is Vishnu. The legacy `vishanu` ID remains unchanged, preserving account sign-in, password derivation, flight passengers, expense allocations and file permissions. Frontend snapshots also correct older persisted member names for profile/admin reports.

29 October 2026 — Google multi-account 404: supported browsers set `credentialless` on the Apps Script iframe before navigation, isolating the anonymous bridge from Google account cookies. Unsupported browsers retain the existing bridge and receive private-window guidance if it times out. All 61 automated tests passed, including origin/channel/source pinning with the isolated bridge and existing unsupported-property contexts. No backend or credential changes.

Unreleased local Map section (29 October 2026): 66 automated tests and 23 browser scenarios passed. Day selection, itinerary links, visible trip route derivation, tentative hotels, missing connections, unknown locations and 320–700px layouts were checked. A separate local visual check verified clickable Hanoi, mobile/desktop/dark rendering and tentative Vũng Tàu. Geography uses local public-domain Natural Earth and OurAirports data. No map/geocoding requests. Nothing committed, pushed or deployed for this local draft.

Local activity-link update: daily itinerary and Map activity cards display stored links, labelled View on map for Google Maps links. Existing UI acceptance now checks a saved map URL appears as a clickable link. All 66 automated tests and 23 browser scenarios passed. Still not deployed.
