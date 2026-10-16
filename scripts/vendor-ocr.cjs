const fs=require('node:fs'),path=require('node:path');
const target=path.join(__dirname,'../assets/ocr');fs.mkdirSync(target,{recursive:true});
for(const name of ['tesseract.min.js','worker.min.js'])fs.copyFileSync(path.join(__dirname,'../node_modules/tesseract.js/dist',name),path.join(target,name));
// LSTM-only recognition selects the appropriate engine for SIMD-capable and older browsers.
for(const name of ['tesseract-core-lstm.wasm.js','tesseract-core-simd-lstm.wasm.js','tesseract-core-relaxedsimd-lstm.wasm.js'])fs.copyFileSync(path.join(__dirname,'../node_modules/tesseract.js-core',name),path.join(target,name));
fs.copyFileSync(path.join(__dirname,'../node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'),path.join(target,'eng.traineddata.gz'));
fs.copyFileSync(path.join(__dirname,'../node_modules/tesseract.js/LICENSE.md'),path.join(target,'TESSERACT-LICENSE.md'));
fs.copyFileSync(path.join(__dirname,'../node_modules/tesseract.js-core/LICENSE'),path.join(target,'CORE-LICENSE'));
fs.copyFileSync(path.join(__dirname,'../node_modules/@tesseract.js-data/eng/package.json'),path.join(target,'LANGUAGE-PACKAGE.json'));
