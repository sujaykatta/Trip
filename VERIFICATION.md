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

**Not yet verified:** real file uploads and per-member Drive access in your account, GitHub Pages hosting, or Safari/iPhone behavior. Continue the acceptance checks in TESTING.md. No real trip expenses or private documents were uploaded during verification.

Admin update: all five traveler reports, filtered CSV exports, per-traveler paid/share balances and member access rejection were checked. Admin layouts were tested at 320 px and 390 px. The backend role is rechecked on each adminReport request, including after role revocation. Apps Script deployment Version 2 was published on 16 October 2026 using the existing /exec URL.

Live admin acceptance completed: Sujay signed into the updated frontend against deployment Version 2, opened Admin, loaded all five member summaries from the protected report endpoint, and selected Niyanth’s individual report. No real expenses, repayments or private files were added during this check.
