/* The live transport sends credentials only through a pinned Apps Script message bridge. */
window.TripAPI = (() => {
  let token = '', bridge = null, ready = null, source = null, origin = '', mode = 'live', demo = null, demoUser = '', memoryOnly = false, storageNotice = '';
  // Keep the legacy account ID so saved allocations and password proofs remain valid.
  function correctMemberNames(result) {
    if (!result || typeof result !== 'object') return result;
    if (result.me?.id === 'vishanu') result.me.name = 'Vishnu';
    for (const key of ['members','adminMembers']) {
      if (Array.isArray(result[key])) result[key] = result[key].map(member => member.id === 'vishanu' ? {...member,name:'Vishnu'} : member);
    }
    return result;
  }
  const pending = new Map();
  const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), n=>n.toString(16).padStart(2,'0')).join('');
  let channel = random();
  let resolveReady;
  window.addEventListener('message', event => {
    if (!/^https:\/\/(?:[a-z0-9-]+-script|script)\.googleusercontent\.com$/.test(event.origin)) return;
    if (!event.data || event.data.channel !== channel) return;
    if (event.data.type === 'trip:ready' && resolveReady && !source) { source=event.source;origin=event.origin;resolveReady?.(); }
    if (event.data.type === 'trip:response' && event.source===source && event.origin===origin) {
      const job=pending.get(event.data.id);if (!job) return;clearTimeout(job.timer);pending.delete(event.data.id);
      if (event.data.response.ok) job.resolve(correctMemberNames(event.data.response.result)); else job.reject(new Error(event.data.response.error));
    }
  });
  function resetBridge() {
    bridge?.remove(); bridge=null; ready=null; source=null; origin=''; resolveReady=null;
  }
  function normalizeError(error) {
    const text=String(error?.message||error||'');
    if(/session expired|sign in again/i.test(text)) { token=''; const e=new Error('Your session ended. Please sign in again.'); e.sessionExpired=true; return e; }
    if(/account or access code is incorrect/i.test(text)) return new Error('The account, password or access code is incorrect.');
    if(/^unknown operation\.?$/i.test(text)) return new Error('This action needs the latest backend version. Ask Sujay to redeploy the Apps Script, then try again.');
    return error instanceof Error ? error : new Error(text||'Something went wrong.');
  }
  function connect() {
    if(ready) return ready;
    const url=window.TRIP_CONFIG.appsScriptUrl;
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url)) return Promise.reject(new Error('Connect Google Sheets first. See the setup guide, or explore the sample trip.'));
    // The bridge only posts to the configured origin; anywhere else it would stay silent until both 30-second attempts time out.
    const allowed=window.TRIP_CONFIG.frontendOrigin,here=window.location?.origin;
    if(allowed&&here&&here!==allowed) return Promise.reject(new Error(`Live sign-in only works on the published site (${allowed}). This copy runs at ${here}, which the Google bridge does not answer. Use “Take a look around” to explore sample data here.`));
    ready=new Promise((resolve,reject)=>{
      let attempt=0,timer;
      const fail=()=>{
        clearTimeout(timer);bridge?.remove();bridge=null;source=null;origin='';resolveReady=null;
        if(attempt<2){start();return;}
        ready=null;
        reject(new Error('Could not reach Google after two connection attempts. Google may be choosing the wrong signed-in account. Open this site in a private/incognito window and try again. If it still fails, ask Sujay to check the deployment and allowed site address.'));
      };
      const start=()=>{
        attempt++;channel=random();
        const frame=document.createElement('iframe');
        // Apps Script multi-login can redirect to a broken /u/N/ URL. In supported
        // browsers, isolate this anonymous web app from signed-in Google cookies.
        if ('credentialless' in frame) frame.credentialless=true;
        bridge=frame;frame.hidden=true;frame.title='Secure trip connection';
        resolveReady=()=>{clearTimeout(timer);frame.onerror=null;resolveReady=null;resolve();};
        frame.onerror=()=>{if(bridge===frame)fail();};
        frame.src=url+'?channel='+channel;
        timer=setTimeout(fail,30000);
        document.body.append(frame);
      };
      start();
    });
    return ready;
  }
  async function live(action,payload={},requestId,authToken=token) {
    await connect(); const id=random();
    // A bridge that stops answering is dropped on timeout so the next call reconnects with a fresh channel.
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);resetBridge();reject(new Error('The request timed out. Retry with the same form to avoid a duplicate.'));},65000);pending.set(id,{resolve,reject,timer});source.postMessage({type:'trip:request',channel,id,request:{action,payload,token:authToken,requestId}},origin);});
  }
  // Access codes are lowercase hex; accept them typed or pasted in capitals.
  function normalizeCode(value){const raw=String(value||'').trim();return /^[A-Fa-f0-9]{64}$/.test(raw)?raw.toLowerCase():raw;}
  async function credential(userId,value) {
    value=normalizeCode(value);
    if(TripPasswords.isAccessCode(value))return value;
    TripCore.assert(value.length>0 && value.length<=128,'Enter your password or original access code.');
    const info=await live('authInfo',{userId});
    return TripPasswords.proof(userId,value,info.salt,window.TRIP_CONFIG.appsScriptUrl);
  }
  function storage(action,value) {
    if(memoryOnly || typeof indexedDB==='undefined') return Promise.resolve(action==='read'?null:undefined);
    const unavailable=()=>new Error('Preview storage is unavailable. Enable browser storage.');
    return new Promise((resolve,reject)=>{let open;try{open=indexedDB.open('vietnam-together-preview',1);}catch{reject(unavailable());return;}open.onupgradeneeded=()=>open.result.createObjectStore('data');open.onerror=()=>reject(unavailable());open.onblocked=()=>reject(unavailable());open.onsuccess=()=>{try{const db=open.result,tx=db.transaction('data',action==='read'?'readonly':'readwrite'),store=tx.objectStore('data');let req=action==='read'?store.get('trip'):store.put(value,'trip');const fail=()=>{reject(new Error('Preview storage is full. Remove some attachments or reset the sample trip.'));db.close();};tx.oncomplete=()=>{resolve(req.result);db.close();};tx.onerror=fail;tx.onabort=fail;}catch{reject(unavailable());}};});
  }
  function seed() {
    const now=new Date().toISOString();
    const state={members:TripCore.MEMBERS,expenses:[],splits:[],settlements:[],flights:[],documents:[],notifications:[],files:{},requests:{},settings:{id:'trip',name:'Vietnam, together.',startDate:'2026-11-12',endDate:'2026-11-22',budgetMinor:15000000,rates:{INR:'1',VND:'0.0033',USD:'84',EUR:'92',GBP:'110',SGD:'64',THB:'2.5',JPY:'0.56'},version:1}};
    [['Old Town riverside stay','18000','Stay','sujay'],['A taste of Hanoi','4200','Food & drinks','niyanth'],['Ha Long Bay day cruise','15600','Experiences','vishanu'],['Airport to the city','2200','Transport','pujitha'],['Coffee, with a view','560','Food & drinks','vedavathi'],['Hoi An lantern workshop','4000','Experiences','sujay']].forEach((e,i)=>{
      const record=TripCore.expense({title:e[0],amount:e[1],category:e[2],payerId:e[3],currency:'INR',rate:'1',date:'2026-11-'+(12+Math.floor(i/2)),participants:TripCore.MEMBERS.map(u=>u.id),splitType:'equal',notes:'Illustrative sample expense. Not a real booking.'});
      const id='sample-expense-'+i;state.expenses.push({...record,splits:undefined,id,ownerId:e[3],version:1,createdAt:now,updatedAt:now});state.splits.push(...record.splits.map(s=>({...s,expenseId:id,version:1})));state.notifications.push({id:'sample-event-'+i,actorId:e[3],action:'Added an expense',entityId:id,createdAt:now});
    });
    const sampleFile={mimeType:'application/pdf',base64:btoa('%PDF-1.4\n1 0 obj\n<< /Title (Travel Credential) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF')};
    [['Pack a universal adapter','checklist','Packing','A small thing that makes a big difference.','',''],
     ['An evening in Hoi An','activity','Places to visit','Walk the lantern-lit streets and find a spot by the river.','','2026-11-16'],
     ['Care Health Travel Insurance Policy','file','Insurance','Policy #TVL-2026-881920. Medical emergency & travel assistance. 24/7 hotline: +84-28-3829-1234.','travel-insurance-policy.pdf','2026-12-28'],
     ['Vietnam E-Visa — Sujay','file','Visa','Electronic visa approval for entry at SGN (Tan Son Nhat). Valid 17–27 Dec 2026.','vietnam-evisa-sujay.pdf','2026-12-17'],
     ['Sujay’s Passport copy','file','Passport','Passport valid through May 2030. 6+ months validity verified for Vietnam entry.','passport-copy-sujay.pdf','2030-05-20']].forEach((d,i)=>{
      const id='sample-doc-'+i,isFile=d[1]==='file';
      state.documents.push({id,title:d[0],kind:d[1],category:d[2],notes:d[3],filename:d[4]||'',mimeType:isFile?'application/pdf':'',size:isFile?124000:0,ownerId:'sujay',sharedWith:TripCore.MEMBERS.map(u=>u.id),version:1,createdAt:now,updatedAt:now,checked:false,date:d[5]||''});
      if(isFile&&d[4])state.files[id]={...sampleFile,filename:d[4]};
    });
    return state;
  }
  function snapshot() {
    const visible=r=>!r.deleted && (r.ownerId===demoUser || r.sharedWith?.includes(demoUser));
    const result=structuredClone(demo);delete result.files;delete result.requests;
    result.me=structuredClone(TripCore.MEMBERS.find(u=>u.id===demoUser));result.expenses=result.expenses.filter(e=>!e.deleted);result.splits=result.splits.filter(s=>result.expenses.some(e=>e.id===s.expenseId && e.version===s.version));result.documents=result.documents.filter(visible);result.flights=result.flights.filter(visible);result.notifications=result.notifications.filter(n=>!n.audience || n.audience.includes(demoUser)).slice(-60).reverse();result.syncedAt=new Date().toISOString();return correctMemberNames(result);
  }
  async function preview(action,p={},requestId) {
    if(action==='load') return snapshot();
    if(action==='adminReport') {
      TripCore.assert(TripCore.MEMBERS.find(u=>u.id===demoUser)?.role==='admin','Only the trip admin can view individual financial reports.');
      return {...snapshot(),adminMembers:TripCore.MEMBERS.map(u=>({...u,status:'active'}))};
    }
    if(action==='download') { const doc=snapshot().documents.find(d=>d.id===p.id);TripCore.assert(doc && demo.files[p.id],'File unavailable.');return demo.files[p.id]; }
    const key=demoUser+':'+requestId,hash=JSON.stringify({action,p});
    if(demo.requests[key]) {TripCore.assert(demo.requests[key].hash===hash,'This request ID was used for different data. Reopen the form.');return {...snapshot(),savedId:demo.requests[key].id};}
    const before=structuredClone(demo),time=new Date().toISOString(),me=TripCore.MEMBERS.find(u=>u.id===demoUser);
    let table,record,old=null,label;
    const find=(name,admin=false)=>{const r=demo[name].find(x=>x.id===p.id && !x.deleted);TripCore.assert(r && (r.ownerId===demoUser || (admin && me.role==='admin')),'You cannot edit this record.');TripCore.assert(r.version===Number(p.version),'Record changed. Refresh and reopen it.');return r;};
    const base=()=>({id:old?.id || crypto.randomUUID(),ownerId:old?.ownerId || demoUser,version:(old?.version || 0)+1,createdAt:old?.createdAt || time,updatedAt:time});
    try {
      if(action==='saveExpense') {table='expenses';old=p.id?find(table,true):null;const value=TripCore.expense(p);record={...value,...base()};delete record.splits;demo.splits=demo.splits.filter(s=>s.expenseId!==record.id);demo.splits.push(...value.splits.map(s=>({...s,expenseId:record.id,version:record.version})));label=old?'Updated an expense':'Added an expense';}
      else if(action==='saveFlight') {table='flights';old=p.id?find(table):null;TripCore.members(p.passengers);TripCore.assert(Date.parse(p.arrivalAt+p.arrivalZone)>Date.parse(p.departureAt+p.departureZone),'Arrival must follow departure, including time zones.');TripCore.url(p.bookingUrl);TripCore.url(p.checkinUrl);record={...p,...base()};label=old?'Updated a flight':'Shared a flight';}
      else if(action==='saveDocument') {table='documents';old=p.id?find(table):null;TripCore.url(p.url);record={...old,...p,...base()};delete record.file;if(p.file){TripCore.assert(p.file.base64.length<=6990508,'Files must be 5 MB or smaller.');demo.files[record.id]=p.file;Object.assign(record,{filename:p.file.filename,mimeType:p.file.mimeType,size:Math.floor(p.file.base64.length*3/4)});}TripCore.assert(record.kind!=='file' || record.filename,'Attach a file.');label=old?'Updated a vault item':'Shared a vault item';}
      else if(action==='toggleChecklist') {table='documents';old=demo.documents.find(d=>d.id===p.id && snapshot().documents.some(v=>v.id===d.id));TripCore.assert(old && old.version===p.version,'Checklist changed. Refresh first.');record={...old,checked:!old.checked,version:old.version+1,updatedAt:time};label='Updated a checklist';}
      else if(action.startsWith('delete')) {table={deleteExpense:'expenses',deleteFlight:'flights',deleteDocument:'documents'}[action];old=find(table,table==='expenses');record={...old,deleted:true,version:old.version+1,updatedAt:time};label='Deleted '+(table==='expenses'?'an expense':table==='flights'?'a flight':'a vault item');}
      else if(action==='recordSettlement') {table='settlements';TripCore.assert(p.fromId===demoUser && p.toId!==demoUser && TripCore.MEMBERS.some(u=>u.id===p.toId),'Choose a different recipient.');const amountMinor=TripCore.minor(p.amount,'INR');TripCore.assert(amountMinor>0,'Enter a positive amount.');record={...p,...base(),amountMinor,status:'pending'};label='Recorded a repayment';}
      else if(action==='recordReceivedSettlement') {table='settlements';TripCore.assert(p.toId===demoUser && p.fromId!==demoUser && TripCore.MEMBERS.some(u=>u.id===p.fromId),'Record only money received by your own account.');const amountMinor=TripCore.minor(p.amount,'INR');TripCore.assert(amountMinor>0,'Enter a positive amount.');record={...p,...base(),date:TripCore.date(p.date),amountMinor,status:'confirmed'};label='Recorded money received';}
      else if(action==='confirmSettlement' || action==='cancelSettlement') {table='settlements';old=demo.settlements.find(s=>s.id===p.id && s.status==='pending');TripCore.assert(old && old.version===p.version && (action==='confirmSettlement'?old.toId===demoUser:[old.toId,old.fromId].includes(demoUser)),'You cannot change this repayment.');record={...old,status:action==='confirmSettlement'?'confirmed':'cancelled',version:old.version+1,updatedAt:time};label=action==='confirmSettlement'?'Confirmed a repayment':'Cancelled a repayment';}
      else if(action==='saveSettings') {TripCore.assert(me.role==='admin','Only the admin can change settings.');TripCore.assert(demo.settings.version===p.version,'Settings changed. Refresh first.');Object.values(p.rates).forEach(v=>TripCore.assert(TripCore.decimal(v,8)>0,'Rates must be positive.'));TripCore.assert(!p.startDate || !p.endDate || p.endDate>=p.startDate,'End date must follow start date.');record={...demo.settings,...p,budgetMinor:TripCore.minor(p.budget,'INR'),version:p.version+1,updatedAt:time};demo.settings=record;label='Updated trip settings';}
      else throw new Error('Unknown operation.');
      if(table){const i=demo[table].findIndex(r=>r.id===record.id);if(i<0)demo[table].push(record);else demo[table][i]=record;}
      demo.notifications.push({id:crypto.randomUUID(),actorId:demoUser,action:label,entityId:record.id,createdAt:time,audience:record.sharedWith?[record.ownerId,...record.sharedWith]:null});demo.requests[key]={hash,id:record.id};await storage('write',demo);return {...snapshot(),savedId:record.id};
    } catch(error){demo=before;throw error;}
  }
  return {
    prepareLogin(){return mode==='live'?connect().then(()=>true,()=>false):Promise.resolve(false);},
    // Sign-in connects once; a failure here is final, so login() never starts a second pair of attempts.
    async connectBridge(){mode='live';await connect();},
    async login(userId,code){mode='live';code=normalizeCode(code);let r;try{r=await live('login',{userId,code:TripPasswords.isAccessCode(String(code).trim())?String(code).trim():await credential(userId,code)});}catch(error){throw normalizeError(error);}token=r.token;return r.data;},
    async changePassword(userId,currentPassword,newPassword,confirmation,requestId){
      TripCore.assert(mode==='live','Password changes are available in your private account.');
      TripPasswords.validate(newPassword,confirmation);
      TripCore.assert(currentPassword!==newPassword,'Choose a different password.');
      const currentCode=await credential(userId,currentPassword),salt=random();
      const newCode=await TripPasswords.proof(userId,newPassword,salt,window.TRIP_CONFIG.appsScriptUrl);
      const result=await live('changePassword',{currentCode,newCode,salt},requestId);token='';return result;
    },
    async startPreview(userId='sujay'){mode='preview';demoUser=userId;
      try{demo=await storage('read') || seed();await storage('write',demo);}
      catch{memoryOnly=true;demo=demo||seed();storageNotice='Browser storage is unavailable here, so sample changes last only until this page is closed.';}
      return snapshot();},
    takeStorageNotice(){const n=storageNotice;storageNotice='';return n;},
    async resetPreview(){demo=seed();await storage('write',demo);return snapshot();},
    async call(action,payload={},requestId){if(mode==='preview')return preview(action,payload,requestId || crypto.randomUUID());try{return await live(action,payload,requestId);}catch(error){throw normalizeError(error);}},
    // Sign-out clears the local session at once; the server revocation runs in the background so a stale bridge cannot hold the UI.
    async logout(){const authToken=token,wasLive=mode==='live';token='';demoUser='';if(wasLive && authToken)live('logout',{},undefined,authToken).catch(()=>{});},
    get mode(){return mode;}
  };
})();
