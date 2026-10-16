const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
test('setup creates eight private sheets, five hashed-code accounts and no fictional live bookings',()=>{
 const props={FRONTEND_ORIGIN:'https://owner.github.io'},tables={},sharing=[],logs=[];let nextId=0;
 const initial={getSheetId:()=>0,setName:name=>{tables[name]=[];return {getSheetId:()=>0,getRange:()=>({setValues:rows=>{tables[name]=structuredClone(rows);return {setFontWeight:()=>({setBackground(){}})};}}),setFrozenRows(){}};}};
 const sheet={getId:()=> 'sheet',getUrl:()=> 'https://example.test/sheet',getSheets:()=>[initial],insertSheet:name=>{const id=++nextId;tables[name]=[];return {getSheetId:()=>id,getRange:()=>({setValues:rows=>{tables[name]=structuredClone(rows);return {setFontWeight:()=>({setBackground(){}})};}}),setFrozenRows(){}};}};
 const setSharing=(access,permission)=>{assert.equal(access,'PRIVATE');assert.equal(permission,'VIEW');sharing.push(access);};
 const context={console:{log:x=>logs.push(x)},Date,JSON,Object,Array,Number,String,Math,Set,BigInt,Error,RegExp,
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]??null,setProperty:(k,v)=>props[k]=v,setProperties:v=>Object.assign(props,v)})},
  Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()]},
  SpreadsheetApp:{create:()=>sheet,flush(){}},DriveApp:{Access:{PRIVATE:'PRIVATE'},Permission:{VIEW:'VIEW',NONE:'NONE'},getFileById:()=>({setSharing}),createFolder:()=>({getId:()=> 'folder',setSharing})},
  Sheets:{Spreadsheets:{Values:{batchGet:(_,o)=>({valueRanges:o.ranges.map(r=>({values:structuredClone(tables[r.match(/'([^']+)'/)[1]])}))})},batchUpdate:({requests})=>{for(const {appendCells}of requests){const table=Object.entries(JSON.parse(props.SHEET_TAB_IDS)).find(([,id])=>id===appendCells.sheetId)[0];tables[table].push(...appendCells.rows.map(r=>r.values.map(c=>Object.values(c.userEnteredValue)[0])));}}}}
 };
 vm.createContext(context);for(const file of ['Core.gs','Code.gs','Setup.gs'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../backend',file),'utf8'),context);
 context.setupTrip_();assert.equal(Object.keys(tables).length,8);assert.equal(tables.Users.length,6);assert.equal(tables.Expenses.length,1);assert.equal(tables.Flights.length,1);assert.equal(tables.Documents.length,1);assert.equal(sharing.length,2);assert.ok(props.AUTH_PEPPER.length===64);assert.ok(props.SHEET_ID);const codes=JSON.parse(logs.find(s=>s.startsWith('INITIAL ACCESS CODES')).split('repository. ')[1]);for(const code of Object.values(codes)){assert.equal(code.length,64);assert.equal(JSON.stringify(tables).includes(code),false);}assert.throws(()=>context.setupTrip_(),/Already initialized/);
});
test('setup accepts exact HTTPS or loopback origins and rejects insecure public sites and paths',()=>{
 const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../backend/Setup.gs'),'utf8'),context);
 for(const origin of ['https://owner.github.io','https://trip.example.com','http://localhost:4173','http://127.0.0.1:4173'])assert.equal(context.validOrigin_(origin),true,origin);
 for(const origin of ['',undefined,'http://example.com','http://localhost.evil.com:4173','http://localhost:4173/','https://owner.github.io/repo','https://owner.github.io?x=1','https://owner.github.io#x'])assert.equal(context.validOrigin_(origin),false,String(origin));
});
test('visible initialization entry rejects anonymous visitors and nonowners',()=>{
 const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../backend/Setup.gs'),'utf8'),context);let initialized=0;context.setupTrip_=()=>initialized++;
 const identities=(active,effective)=>context.Session={getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>({getEmail:()=>effective})};
 identities('','owner@example.com');assert.throws(()=>context.initializeTrip(),/project owner/);
 identities('other@example.com','owner@example.com');assert.throws(()=>context.initializeTrip(),/project owner/);assert.equal(initialized,0);
 identities('owner@example.com','owner@example.com');context.initializeTrip();assert.equal(initialized,1);
});
