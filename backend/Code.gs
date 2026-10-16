/* Server entry points: doGet and rpc. All helpers end in _ and cannot be called by google.script.run. */
var SCHEMA_ = {
  Users: ['id','name','loginIdentifier','role','status','codeHash','createdAt','updatedAt'],
  Expenses: ['id','title','originalMinor','currency','rate','baseMinor','category','date','payerId','notes','splitType','allocations','ownerId','version','deleted','createdAt','updatedAt'],
  ExpenseSplits: ['id','expenseId','version','userId','amountMinor','createdAt','updatedAt'],
  Settlements: ['id','fromId','toId','amountMinor','date','notes','status','ownerId','version','createdAt','updatedAt'],
  Flights: ['id','airline','number','departure','arrival','departureAt','arrivalAt','departureZone','arrivalZone','pnr','passengers','baggage','terminal','bookingUrl','checkinUrl','notes','reminder','sharedWith','ownerId','version','deleted','createdAt','updatedAt'],
  Documents: ['id','title','kind','category','notes','url','date','checked','sharedWith','ownerId','driveId','mimeType','filename','size','expenseId','flightId','version','deleted','createdAt','updatedAt'],
  TripSettings: ['id','name','startDate','endDate','budgetMinor','rates','version','createdAt','updatedAt'],
  AuditLog: ['id','actorId','action','entityId','requestId','requestHash','audience','before','after','createdAt','updatedAt']
};
var JSON_FIELDS_ = ['allocations','passengers','sharedWith','rates','audience','before','after'];
function props_() { return PropertiesService.getScriptProperties(); }
function uuid_() { return Utilities.getUuid(); }
function now_() { return new Date().toISOString(); }
function secret_() { return uuid_().replace(/-/g, '') + uuid_().replace(/-/g, ''); }
function digest_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join(''); }
function hashCode_(code) { return digest_(props_().getProperty('AUTH_PEPPER') + ':' + code); }
function equal_(a,b) { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; var x = 0; for(var i=0;i<a.length;i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }
function clean_(r) { return Object.fromEntries(Object.entries(r).filter(([k]) => k !== '_row' && k !== 'codeHash' && k !== 'driveId')); }
function doGet(e) {
  if (!e || !e.parameter) {
    initializeTrip();
    return HtmlService.createHtmlOutput('Trip initialized. See the execution log for your Sheet link and access codes.');
  }
  var origin = props_().getProperty('FRONTEND_ORIGIN');
  var channel = String(e.parameter.channel || '');
  if (!origin || !/^[a-f0-9]{64}$/.test(channel)) return HtmlService.createHtmlOutput('Open the configured Vietnam Together website to sign in.');
  var template = HtmlService.createTemplateFromFile('Bridge');
  template.origin = JSON.stringify(origin); template.channel = JSON.stringify(channel);
  return template.evaluate().setTitle('Vietnam Together connection').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function column_(number) { var result='';while(number>0){number--;result=String.fromCharCode(65+number%26)+result;number=Math.floor(number/26);}return result; }
function db_() {
  var id = props_().getProperty('SHEET_ID');
  if (!id) throw new Error('The trip backend has not been set up.');
  var names = Object.keys(SCHEMA_);
  var values = Sheets.Spreadsheets.Values.batchGet(id, { ranges: names.map(n => "'" + n + "'!A:" + column_(SCHEMA_[n].length)), valueRenderOption: 'UNFORMATTED_VALUE' }).valueRanges;
  var db = { _id: id, _requests: [] };
  names.forEach((name, i) => { var rows = values[i].values || []; if (JSON.stringify(rows[0]) !== JSON.stringify(SCHEMA_[name])) throw new Error('Sheet schema mismatch: ' + name); db[name] = rows.slice(1).map((row, ix) => { var record = { _row: ix + 1 }; SCHEMA_[name].forEach((key, col) => { var value = row[col] == null ? '' : row[col]; record[key] = JSON_FIELDS_.includes(key) && value !== '' ? JSON.parse(value) : value; }); return record; }).filter(r => r.id); });
  db._sheetIds = JSON.parse(props_().getProperty('SHEET_TAB_IDS'));
  return db;
}
function write_(db, table, record) {
  var cellValues = SCHEMA_[table].map(key => { var v = record[key] == null ? '' : record[key]; if (typeof v === 'object') v = JSON.stringify(v); return { userEnteredValue: typeof v === 'number' ? { numberValue: v } : typeof v === 'boolean' ? { boolValue: v } : { stringValue: String(v) } }; });
  var old = db[table].find(x => x.id === record.id);
  if (old) {
    record._row = old._row;
    db._requests.push({ updateCells: { start: { sheetId: db._sheetIds[table], rowIndex: old._row, columnIndex: 0 }, rows: [{ values: cellValues }], fields: 'userEnteredValue' } });
    db[table][db[table].indexOf(old)] = record;
  } else {
    record._row = db[table].length + 1;
    db._requests.push({ appendCells: { sheetId: db._sheetIds[table], rows: [{ values: cellValues }], fields: 'userEnteredValue' } }); db[table].push(record);
  }
}
function commit_(db) { if (db._requests.length) Sheets.Spreadsheets.batchUpdate({ requests: db._requests }, db._id); }
function audit_(db, user, action, entityId, request, before, after, audience) {
  var time = now_();
  write_(db, 'AuditLog', { id: uuid_(), actorId: user.id, action, entityId, requestId: request.requestId || '', requestHash: request.requestId ? digest_(JSON.stringify({ action: request.action, payload: request.payload })) : '', audience: audience || TripCore.MEMBERS.map(u=>u.id), before: before ? clean_(before) : null, after: after ? clean_(after) : null, createdAt: time, updatedAt: time });
}
function session_(token, db) {
  TripCore.assert(typeof token === 'string' && /^[a-f0-9]{64}$/.test(token), 'Session expired. Please sign in again.');
  var key = 'SESSION_' + digest_(token); var value = props_().getProperty(key);
  TripCore.assert(value, 'Session expired. Please sign in again.'); var s = JSON.parse(value);
  if (s.expires < Date.now()) { props_().deleteProperty(key); throw new Error('Session expired. Please sign in again.'); }
  var user = db.Users.find(u=>u.id === s.userId && u.status === 'active');
  TripCore.assert(user, 'Account is unavailable.'); return user;
}
function login_(payload, db) {
  var id = TripCore.text(payload.userId, 40); var key = 'ATTEMPT_' + (TripCore.MEMBERS.some(u => u.id === id) ? id : 'unknown');
  var attempts = JSON.parse(props_().getProperty(key) || '{"count":0,"until":0}');
  if (attempts.until < Date.now()) attempts = { count: 0, until: Date.now() + 15 * 60000 };
  TripCore.assert(attempts.count < 10, 'Too many attempts. Try again in 15 minutes.');
  var user = db.Users.find(u=>u.id === id && u.status === 'active');
  var code = String(payload.code || '').trim();
  if (!user || code.length !== 64 || !equal_(hashCode_(code), user.codeHash)) { attempts.count++; props_().setProperty(key, JSON.stringify(attempts)); throw new Error('The account or access code is incorrect.'); }
  props_().deleteProperty(key);
  var all = props_().getProperties(); var sessions = [];
  Object.keys(all).filter(k=>k.startsWith('SESSION_')).forEach(k => { var s=JSON.parse(all[k]); if(s.expires < Date.now()) props_().deleteProperty(k); else if(s.userId === id) sessions.push({key:k, expires:s.expires}); });
  sessions.sort((a,b)=>a.expires-b.expires).slice(0, Math.max(0, sessions.length - 4)).forEach(s=>props_().deleteProperty(s.key));
  var token = secret_(); props_().setProperty('SESSION_' + digest_(token), JSON.stringify({ userId: id, expires: Date.now() + 8*60*60000 }));
  audit_(db, user, 'Signed in', user.id, {}, null, null, [user.id]); commit_(db);
  return { token, data: snapshot_(db, user) };
}
function visible_(r, user) { return !r.deleted && (r.ownerId === user.id || (r.sharedWith || []).includes(user.id)); }
function snapshot_(db, user) {
  var expenses = db.Expenses.filter(e=>!e.deleted);
  var versions = Object.fromEntries(expenses.map(e=>[e.id,e.version]));
  var documents = db.Documents.filter(d=>visible_(d,user)); var flights = db.Flights.filter(f=>visible_(f,user));
  var allowed = new Set([...expenses,...documents,...flights,...db.Settlements].map(x=>x.id));
  return { me: { id:user.id,name:user.name,role:user.role }, members: db.Users.map(u=>({id:u.id,name:u.name})), expenses: expenses.map(clean_), splits: db.ExpenseSplits.filter(s=>versions[s.expenseId] === s.version).map(clean_), settlements: db.Settlements.map(clean_), documents: documents.map(clean_), flights: flights.map(clean_), settings: clean_(db.TripSettings[0]), notifications: db.AuditLog.filter(a => (a.audience || []).includes(user.id) && (allowed.has(a.entityId) || a.actorId === user.id)).slice(-60).reverse().map(a=>({id:a.id,actorId:a.actorId,action:a.action,entityId:a.entityId,createdAt:a.createdAt})), syncedAt: now_() };
}
function existing_(db, table, payload, user, admin) {
  var record = db[table].find(x=>x.id === payload.id && !x.deleted);
  TripCore.assert(record && (record.ownerId === user.id || (admin && user.role === 'admin')), 'You do not have permission to change this record.');
  TripCore.assert(record.version === Number(payload.version), 'This record changed. Refresh and reopen it before saving.'); return record;
}
function base_(old, user) { var time=now_(); return { id: old ? old.id : uuid_(), ownerId: old ? old.ownerId : user.id, version: old ? old.version + 1 : 1, deleted: false, createdAt: old ? old.createdAt : time, updatedAt: time }; }
function flight_(p) {
  ['departureAt','arrivalAt'].forEach(k => { TripCore.assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(p[k]), 'Enter departure and arrival local times.'); TripCore.date(p[k].slice(0,10)); TripCore.assert(+p[k].slice(11,13)<24 && +p[k].slice(14)<60,'Invalid flight time.'); });
  // Explicit UTC offsets remove ambiguity when flights cross time zones or midnight.
  ['departureZone','arrivalZone'].forEach(k => TripCore.assert(/^[+-](?:(?:0\d|1[0-3]):[0-5]\d|14:00)$/.test(p[k]), 'Enter time zones as UTC offsets, for example +07:00.'));
  TripCore.assert(Date.parse(p.arrivalAt+p.arrivalZone) > Date.parse(p.departureAt+p.departureZone), 'Arrival must be later than departure, including time zones.');
  return { airline:TripCore.text(p.airline,80),number:TripCore.text(p.number,20),departure:TripCore.text(p.departure,60),arrival:TripCore.text(p.arrival,60),departureAt:p.departureAt,arrivalAt:p.arrivalAt,departureZone:p.departureZone,arrivalZone:p.arrivalZone,pnr:TripCore.text(p.pnr,50,false),passengers:TripCore.members(p.passengers),sharedWith:Array.isArray(p.sharedWith) && !p.sharedWith.length ? [] : TripCore.members(p.sharedWith),baggage:TripCore.text(p.baggage,200,false),terminal:TripCore.text(p.terminal,100,false),bookingUrl:TripCore.url(p.bookingUrl),checkinUrl:TripCore.url(p.checkinUrl),notes:TripCore.text(p.notes,2000,false),reminder:TripCore.text(p.reminder,200,false) };
}
function document_(p) {
  TripCore.assert(['file','note','checklist','link','contact','activity'].includes(p.kind), 'Choose a valid vault item type.');
  return { title:TripCore.text(p.title,100),kind:p.kind,category:TripCore.text(p.category,50),notes:TripCore.text(p.notes,2000,false),url:TripCore.url(p.url),date:p.date ? TripCore.date(p.date) : '',checked:!!p.checked,sharedWith:Array.isArray(p.sharedWith) && !p.sharedWith.length ? [] : TripCore.members(p.sharedWith),expenseId:TripCore.text(p.expenseId,80,false),flightId:TripCore.text(p.flightId,80,false) };
}
function upload_(p) {
  TripCore.assert(p && typeof p.base64 === 'string' && p.base64.length <= 6990508 && /^[A-Za-z0-9+/]*={0,2}$/.test(p.base64), 'Invalid file or file exceeds 5 MB.');
  var bytes = Utilities.base64Decode(p.base64); var u = bytes.map(b=>(b+256)%256);
  TripCore.assert(bytes.length > 0 && bytes.length <= 5*1024*1024, 'File must be between 1 byte and 5 MB.');
  var allowed = { 'application/pdf':u.slice(0,5).join(',')==='37,80,68,70,45', 'image/png':u.slice(0,8).join(',')==='137,80,78,71,13,10,26,10', 'image/jpeg':u[0]===255 && u[1]===216 && u[2]===255, 'image/webp':String.fromCharCode(...u.slice(0,4))==='RIFF' && String.fromCharCode(...u.slice(8,12))==='WEBP', 'text/plain':!u.includes(0), 'text/csv':!u.includes(0) };
  TripCore.assert(allowed[p.mimeType], 'Supported files: valid PDF, PNG, JPEG, WebP, TXT and CSV.');
  var filename = TripCore.text(p.filename,150).replace(/[\\/\x00-\x1f]/g,'_');
  var extensions = {'application/pdf':['pdf'],'image/png':['png'],'image/jpeg':['jpg','jpeg'],'image/webp':['webp'],'text/plain':['txt'],'text/csv':['csv']};
  TripCore.assert(extensions[p.mimeType].includes(filename.split('.').pop().toLowerCase()), 'The filename extension must match the file type.');
  var file = DriveApp.getFolderById(props_().getProperty('DRIVE_FOLDER_ID')).createFile(Utilities.newBlob(bytes,p.mimeType,filename));
  return { driveId:file.getId(),mimeType:p.mimeType,filename,size:bytes.length };
}
function rpc(request) {
  var lock = LockService.getScriptLock(); var uploaded = null; var commitStarted = false;
  try {
    TripCore.assert(request && typeof request === 'object', 'Invalid request.');
    TripCore.assert(lock.tryLock(20000), 'The trip is busy. Please try again.');
    var db=db_(), p=request.payload || {}, action=request.action;
    if(action==='login') return {ok:true,result:login_(p,db)};
    var user=session_(request.token,db);
    if(action==='load') return {ok:true,result:snapshot_(db,user)};
    if(action==='adminReport') {
      TripCore.assert(user.role === 'admin', 'Only the trip admin can view individual financial reports.');
      var report = snapshot_(db,user);
      report.adminMembers = db.Users.map(u=>({id:u.id,name:u.name,role:u.role,status:u.status}));
      return {ok:true,result:report};
    }
    if(action==='logout') { props_().deleteProperty('SESSION_'+digest_(request.token)); return {ok:true,result:{}}; }
    if(action==='download') {
      var doc=db.Documents.find(d=>d.id===p.id && visible_(d,user) && d.driveId);
      TripCore.assert(doc,'This file is unavailable or private.'); var blob=DriveApp.getFileById(doc.driveId).getBlob();
      return {ok:true,result:{base64:Utilities.base64Encode(blob.getBytes()),mimeType:doc.mimeType,filename:doc.filename}};
    }
    TripCore.assert(typeof request.requestId==='string' && /^[a-zA-Z0-9-]{20,80}$/.test(request.requestId),'A unique request ID is required.');
    var previous=db.AuditLog.find(a=>a.actorId===user.id && a.requestId===request.requestId);
    if(previous) { TripCore.assert(previous.requestHash===digest_(JSON.stringify({action:request.action,payload:request.payload})), 'This request ID was already used for different data.'); return {ok:true,result:Object.assign(snapshot_(db,user), {savedId:previous.entityId})}; }
    var old=null, record=null, table='', label='', audience=null;
    if(action==='saveExpense') {
      old=p.id ? existing_(db,'Expenses',p,user,true) : null;
      var validated=TripCore.expense(p); var splits=validated.splits; delete validated.splits;
      record=Object.assign({},validated,base_(old,user)); table='Expenses';label=old?'Updated an expense':'Added an expense';
      splits.forEach(s=>write_(db,'ExpenseSplits',Object.assign({},s,{id:uuid_(),expenseId:record.id,version:record.version,createdAt:now_(),updatedAt:now_()})));
    } else if(action==='saveFlight') {
      old=p.id ? existing_(db,'Flights',p,user,false):null; record=Object.assign({},flight_(p),base_(old,user));table='Flights';label=old?'Updated a flight':'Shared a flight';audience=[...new Set([user.id,...record.sharedWith])];
    } else if(action==='saveDocument') {
      old=p.id ? existing_(db,'Documents',p,user,false):null; record=Object.assign({},old || {},document_(p),base_(old,user));table='Documents';label=old?'Updated a vault item':'Shared a vault item';audience=[...new Set([user.id,...record.sharedWith])];
      if(record.expenseId) TripCore.assert(db.Expenses.some(e=>e.id===record.expenseId && !e.deleted),'Linked expense is unavailable.');
      if(record.flightId) TripCore.assert(db.Flights.some(f=>f.id===record.flightId && visible_(f,user)),'Linked flight is unavailable.');
      TripCore.assert(!p.file || !old,'Upload a replacement as a new vault item.');
      if(p.file) { uploaded=upload_(p.file);Object.assign(record,uploaded); }
      TripCore.assert(record.kind!=='file' || record.driveId,'Attach a file.');
    } else if(action==='toggleChecklist') {
      old=db.Documents.find(d=>d.id===p.id && visible_(d,user) && d.kind==='checklist'); TripCore.assert(old,'Checklist is unavailable.');
      TripCore.assert(old.version===p.version,'This checklist changed. Refresh first.'); record=Object.assign({},old,{checked:!old.checked,version:old.version+1,updatedAt:now_()});table='Documents';label='Updated a checklist';audience=[...new Set([old.ownerId,...old.sharedWith])];
    } else if(action==='deleteExpense' || action==='deleteFlight' || action==='deleteDocument') {
      table={deleteExpense:'Expenses',deleteFlight:'Flights',deleteDocument:'Documents'}[action];old=existing_(db,table,p,user,table==='Expenses');record=Object.assign({},old,{deleted:true,version:old.version+1,updatedAt:now_()});label='Deleted '+(table==='Expenses'?'an expense':table==='Flights'?'a flight':'a vault item');audience=old.sharedWith ? [...new Set([old.ownerId,...old.sharedWith])] : null;
    } else if(action==='recordSettlement') {
      TripCore.assert(p.fromId===user.id && p.toId!==user.id && db.Users.some(u=>u.id===p.toId && u.status==='active'),'Only the sender can record a repayment.');
      var amount=TripCore.minor(p.amount,'INR');TripCore.assert(amount>0,'Enter a positive amount.');
      record=Object.assign(base_(null,user),{fromId:user.id,toId:p.toId,amountMinor:amount,date:TripCore.date(p.date),notes:TripCore.text(p.notes,1000,false),status:'pending'});table='Settlements';label='Recorded a repayment';
    } else if(action==='confirmSettlement' || action==='cancelSettlement') {
      old=db.Settlements.find(s=>s.id===p.id && s.status==='pending');TripCore.assert(old && old.version===p.version,'Repayment is unavailable or changed.');
      TripCore.assert(action==='confirmSettlement' ? old.toId===user.id : (old.fromId===user.id || old.toId===user.id),'You cannot change this repayment.');record=Object.assign({},old,{status:action==='confirmSettlement'?'confirmed':'cancelled',version:old.version+1,updatedAt:now_()});table='Settlements';label=action==='confirmSettlement'?'Confirmed a repayment':'Cancelled a repayment';
    } else if(action==='saveSettings') {
      TripCore.assert(user.role==='admin','Only the trip admin can update settings.');old=db.TripSettings[0];TripCore.assert(old.version===p.version,'Settings changed. Refresh first.');
      var rates={INR:'1'};Object.keys(TripCore.CURRENCIES).filter(c=>c!=='INR').forEach(c=>{var rate=String(p.rates[c] || '');TripCore.assert(TripCore.decimal(rate,8)>0,'Every exchange rate must be positive.'); rates[c]=rate;});
      var start=p.startDate?TripCore.date(p.startDate):'',end=p.endDate?TripCore.date(p.endDate):'';TripCore.assert(!start || !end || end>=start,'Trip end must follow its start.');
      record={...old,name:TripCore.text(p.name,100),startDate:start,endDate:end,budgetMinor:TripCore.minor(p.budget,'INR'),rates,version:old.version+1,updatedAt:now_()};table='TripSettings';label='Updated trip settings';
    } else throw new Error('Unknown operation.');
    write_(db,table,record); audit_(db,user,label,record.id,request,old,record,audience);
    commitStarted=true;commit_(db);
    // A timeout during the atomic Sheets request has an ambiguous outcome. Keep the
    // uploaded file so a successful commit never points at a trashed attachment.
    return {ok:true,result:Object.assign(snapshot_(db,user), {savedId:record.id})};
  } catch(error) {
    if(uploaded && !commitStarted) { try { DriveApp.getFileById(uploaded.driveId).setTrashed(true); } catch(ignore) {} }
    console.error(String(error)); return {ok:false,error: error.message || 'The request failed. Please try again.'};
  } finally { if(lock.hasLock()) lock.releaseLock(); }
}
