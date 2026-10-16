/* Editor entry point. Anonymous web visitors cannot initialize the trip. */
function initializeTrip() {
  var active = Session.getActiveUser().getEmail();
  var effective = Session.getEffectiveUser().getEmail();
  if (!active || !effective || active !== effective) {
    throw new Error('Run initializeTrip from the Apps Script editor as the project owner.');
  }
  setupTrip_();
}

/* Run these private functions in the Apps Script editor, never from the web client. */
function validOrigin_(origin) {
  return typeof origin === 'string' && /^(?:https:\/\/[a-zA-Z0-9.-]+(?::\d+)?|http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)$/.test(origin);
}
function setupTrip_() {
  var properties=props_();
  if(properties.getProperty('SHEET_ID')) throw new Error('Already initialized. Setup will not overwrite an existing trip.');
  var origin=properties.getProperty('FRONTEND_ORIGIN');
  if(!validOrigin_(origin)) throw new Error('Set FRONTEND_ORIGIN in Script Properties, e.g. http://localhost:4173 or https://yourname.github.io (no path or trailing slash).');
  var sheet=SpreadsheetApp.create('Vietnam Together — private trip database');
  DriveApp.getFileById(sheet.getId()).setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.VIEW);
  var ids={};Object.keys(SCHEMA_).forEach((name,i)=>{var tab=i===0?sheet.getSheets()[0].setName(name):sheet.insertSheet(name);tab.getRange(1,1,1,SCHEMA_[name].length).setValues([SCHEMA_[name]]).setFontWeight('bold').setBackground('#e3ede7');tab.setFrozenRows(1);ids[name]=tab.getSheetId();});SpreadsheetApp.flush();
  var folder=DriveApp.createFolder('Vietnam Together — private vault');
  folder.setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.VIEW);
  properties.setProperties({SHEET_ID:sheet.getId(),DRIVE_FOLDER_ID:folder.getId(),SHEET_TAB_IDS:JSON.stringify(ids),AUTH_PEPPER:secret_()});
  var db=db_(),time=now_(),codes={};
  TripCore.MEMBERS.forEach(u=>{var code=secret_();codes[u.name]=code;write_(db,'Users',{...u,loginIdentifier:u.id,status:'active',codeHash:hashCode_(code),createdAt:time,updatedAt:time});});
  write_(db,'TripSettings',{id:'trip',name:'Vietnam, together.',startDate:'',endDate:'',budgetMinor:0,rates:{INR:'1',VND:'0.0033',USD:'84',EUR:'92',GBP:'110',SGD:'64',THB:'2.5',JPY:'0.56'},version:1,createdAt:time,updatedAt:time});
  commit_(db);
  console.log('Sheet: '+sheet.getUrl());
  console.log('INITIAL ACCESS CODES — share privately with each named member; never put them in the repository. '+JSON.stringify(codes));
  console.log('Exchange rates are illustrative defaults. Set agreed rates and budget in Profile before entering real expenses.');
}
function rotateAccessCode_() {
  // Set ROTATE_USER_ID in Script Properties to one of the five lowercase user IDs.
  var id=props_().getProperty('ROTATE_USER_ID');var lock=LockService.getScriptLock();lock.waitLock(20000);
  try { var db=db_(), user=db.Users.find(u=>u.id===id);if(!user) throw new Error('Set a valid ROTATE_USER_ID first.');var code=secret_();user.codeHash=hashCode_(code);user.updatedAt=now_();write_(db,'Users',user);audit_(db,user,'Rotated access code',user.id,{},null,null,[user.id]);commit_(db);
    var all=props_().getProperties();Object.keys(all).filter(k=>k.startsWith('SESSION_')).forEach(k=>{if(JSON.parse(all[k]).userId===id) props_().deleteProperty(k);});props_().deleteProperty('ATTEMPT_'+id);props_().deleteProperty('ROTATE_USER_ID');console.log('New access code for '+id+': '+code);
  } finally {lock.releaseLock();}
}
