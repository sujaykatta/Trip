const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
test('live bridge pins origin/window/channel and keeps codes and session tokens out of URLs',async()=>{
 let listener,frame;const messages=[];const origin='https://example-script.googleusercontent.com';
 const context={crypto:crypto.webcrypto,Map,Array,Promise,Error,Uint8Array,setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t;},clearTimeout,URL,console,window:{TRIP_CONFIG:{appsScriptUrl:'https://script.google.com/macros/s/TEST/exec'},addEventListener:(type,cb)=>listener=cb},document:{createElement:()=>({credentialless:false,remove(){}}),body:{append:f=>frame=f}}};
 context.TripPasswords={isAccessCode:v=>/^[a-f0-9]{64}$/.test(v)};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../api.js'),'utf8'),context);
 const api=context.window.TripAPI,code='a'.repeat(64),token='b'.repeat(64);
 const source={postMessage(message,target){messages.push({message,target});}};
 const warmup=api.prepareLogin();const warmFrame=frame;const login=api.login('sujay',code);assert.equal(frame,warmFrame);assert.ok(frame.src.startsWith('https://script.google.com/macros/s/TEST/exec?channel='));assert.equal(frame.src.includes(code),false);assert.equal(frame.credentialless,true);const channel=new URL(frame.src).searchParams.get('channel');assert.match(channel,/^[a-f0-9]{64}$/);
 listener({origin:'https://attacker.example',source,data:{type:'trip:ready',channel}});listener({origin,source,data:{type:'trip:ready',channel:'wrong'}});await Promise.resolve();assert.equal(messages.length,0);
 listener({origin,source,data:{type:'trip:ready',channel}});await new Promise(resolve=>setImmediate(resolve));assert.equal(await warmup,true);assert.equal(messages.length,1);assert.equal(messages[0].target,origin);assert.equal(messages[0].message.request.payload.code,code);
 let settled=false;login.then(()=>settled=true);const id=messages[0].message.id,response={ok:true,result:{token,data:{me:{id:'sujay'}}}};
 listener({origin:'https://attacker.example',source,data:{type:'trip:response',channel,id,response}});listener({origin,source:{},data:{type:'trip:response',channel,id,response}});listener({origin,source,data:{type:'trip:response',channel:'wrong',id,response}});await Promise.resolve();assert.equal(settled,false);
 listener({origin,source,data:{type:'trip:response',channel,id,response}});assert.equal((await login).me.id,'sujay');
 const load=api.call('load');await new Promise(resolve=>setImmediate(resolve));assert.equal(messages[1].message.request.token,token);assert.equal(frame.src.includes(token),false);const nextId=messages[1].message.id;listener({origin,source,data:{type:'trip:response',channel,id:nextId,response:{ok:true,result:{expenses:[]}}}});assert.deepEqual(JSON.parse(JSON.stringify(await load)),{expenses:[]});
 const logout=api.logout();await new Promise(resolve=>setImmediate(resolve));const logoutId=messages[2].message.id;listener({origin,source,data:{type:'trip:response',channel,id:logoutId,response:{ok:true,result:{}}}});await logout;
});
test('bridge server script ignores mismatched parent origins and untrusted source windows',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../backend/Bridge.html'),'utf8');let source=html.match(/<script>([\s\S]*)<\/script>/)[1].replace('<?!= origin ?>',JSON.stringify('https://owner.github.io')).replace('<?!= channel ?>',JSON.stringify('a'.repeat(64)));let listener,calls=0;const top={postMessage(){}};const runner={withSuccessHandler(){return this;},withFailureHandler(){return this;},rpc(){calls++;}};const context={window:{top,addEventListener:(_,cb)=>listener=cb},google:{script:{run:runner}}};vm.createContext(context);vm.runInContext(source,context);const data={type:'trip:request',channel:'a'.repeat(64),id:'request',request:{action:'load'}};
 listener({origin:'https://attacker.example',source:top,data});listener({origin:'https://owner.github.io',source:{},data});listener({origin:'https://owner.github.io',source:top,data:{...data,channel:'wrong'}});assert.equal(calls,0);listener({origin:'https://owner.github.io',source:top,data});assert.equal(calls,1);
});
test('password login and change send only stretched proofs through the pinned bridge',async()=>{
 let listener,frame;const messages=[],origin='https://example-script.googleusercontent.com',P=require('../passwords.js');
 const context={crypto:crypto.webcrypto,TextEncoder,Map,Array,Promise,Error,Uint8Array,setTimeout:(fn,ms)=>{const t=setTimeout(fn,ms);t.unref();return t;},clearTimeout,URL,console,TripPasswords:P,TripCore:{assert:(v,m)=>{if(!v)throw new Error(m);}},window:{TRIP_CONFIG:{appsScriptUrl:'https://script.google.com/macros/s/TEST/exec'},addEventListener:(_,cb)=>listener=cb},document:{createElement:()=>({remove(){}}),body:{append:f=>frame=f}}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../api.js'),'utf8'),context);
 const api=context.window.TripAPI,password='Example current passphrase',next='Example replacement passphrase',salt='c'.repeat(64),source={postMessage:(message,target)=>messages.push({message,target})},wait=async n=>{for(let i=0;i<200&&messages.length<n;i++)await new Promise(r=>setTimeout(r,10));assert.equal(messages.length,n);};
 const login=api.login('test-user',password),channel=new URL(frame.src).searchParams.get('channel');listener({origin,source,data:{type:'trip:ready',channel}});await wait(1);
 const reply=(i,result)=>listener({origin,source,data:{type:'trip:response',channel,id:messages[i].message.id,response:{ok:true,result}}});
 assert.equal(messages[0].message.request.action,'authInfo');reply(0,{salt});await wait(2);assert.equal(messages[1].message.request.action,'login');assert.equal(messages[1].message.request.payload.code,await P.proof('test-user',password,salt,context.window.TRIP_CONFIG.appsScriptUrl));reply(1,{token:'b'.repeat(64),data:{me:{id:'test-user'}}});await login;
 const change=api.changePassword('test-user',password,next,next,'request-id-123456789012345');await wait(3);reply(2,{salt});await wait(4);const payload=messages[3].message.request.payload;assert.equal(messages[3].message.request.action,'changePassword');assert.equal(payload.newCode,await P.proof('test-user',next,payload.salt,context.window.TRIP_CONFIG.appsScriptUrl));assert.equal(payload.currentCode,messages[1].message.request.payload.code);assert.equal(JSON.stringify(messages).includes(password),false);assert.equal(JSON.stringify(messages).includes(next),false);reply(3,{passwordChanged:true});await change;
 const load=api.call('load');await wait(5);assert.equal(messages[4].message.request.token,'');reply(4,{});await load;
});
test('connection retries with a fresh channel, ignores the old frame and can recover after both attempts time out',async()=>{
 let listener;const frames=[],timers=new Map(),messages=[];let nextTimer=0;
 const context={crypto:crypto.webcrypto,Map,Array,Promise,Error,Uint8Array,URL,console,
 setTimeout:(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),
 TripPasswords:{isAccessCode:v=>/^[a-f0-9]{64}$/.test(v)},
 window:{TRIP_CONFIG:{appsScriptUrl:'https://script.google.com/macros/s/TEST/exec'},addEventListener:(_,cb)=>listener=cb},
 document:{createElement:()=>({remove(){this.removed=true;}}),body:{append:frame=>frames.push(frame)}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../api.js'),'utf8'),context);
 const api=context.window.TripAPI,source={postMessage:message=>messages.push(message)},origin='https://example-script.googleusercontent.com';
 const expire=()=>{const entry=[...timers].find(([,t])=>t.ms===30000);assert.ok(entry);timers.delete(entry[0]);entry[1].fn();};
 const ready=frame=>listener({origin,source,data:{type:'trip:ready',channel:new URL(frame.src).searchParams.get('channel')}});
 const first=api.login('niyanth','a'.repeat(64));const rejected=assert.rejects(first,/two connection attempts/);
 expire();assert.equal(frames.length,2);assert.equal(frames[0].removed,true);assert.notEqual(frames[0].src,frames[1].src);
 ready(frames[0]);await Promise.resolve();assert.equal(messages.length,0);
 expire();await rejected;assert.equal(frames[1].removed,true);assert.equal(messages.length,0);
 ready(frames[1]);
 const second=api.login('niyanth','a'.repeat(64));assert.equal(frames.length,3);
 ready(frames[1]);await Promise.resolve();assert.equal(messages.length,0);
 ready(frames[2]);await new Promise(resolve=>setImmediate(resolve));assert.equal(messages.length,1);
 listener({origin,source,data:{type:'trip:response',channel:new URL(frames[2].src).searchParams.get('channel'),id:messages[0].id,response:{ok:true,result:{token:'b'.repeat(64),data:{me:{id:'niyanth'}}}}}});
 assert.equal((await second).me.id,'niyanth');assert.equal(timers.size,0);
});
