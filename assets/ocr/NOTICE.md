# Local image recognition assets

- Tesseract.js 7.0.0: https://github.com/naptha/tesseract.js (Apache-2.0; TESSERACT-LICENSE.md).
- tesseract.js-core, pinned by package-lock.json: https://github.com/naptha/tesseract.js-core (Apache-2.0; CORE-LICENSE).
- English model: @tesseract.js-data/eng 1.0.0, 4.0.0_best_int. Package metadata/license is preserved in LANGUAGE-PACKAGE.json. Upstream model repository: https://github.com/naptha/tessdata; model origin: https://github.com/tesseract-ocr/tessdata_best (Apache-2.0).

Run `npm ci && npm run vendor:ocr` to reproduce the bundled runtime assets. Only LSTM engines are used; standard, SIMD and relaxed SIMD browsers have matching local engines. These static files contain no trip data. Recognition runs in a Web Worker on the user's device.
