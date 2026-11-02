const {test}=require('node:test'),assert=require('node:assert/strict'),P=require('../itinerary-photos.js');

test('airport photos follow the individual event airport, not the first airport in its route title',()=>{
 const title='Arrival: Hyderabad (HYD) → Ho Chi Minh City (SGN)';
 for(const code of ['HYD','SGN','PQC','HAN','DAD'])assert.match(P.find(title,'',`Airport (${code})`).caption,new RegExp(code));
 assert.equal(P.find(title,'','Unknown (XXX)'),null);
});

test('known attraction photos take precedence over area references; unknown venues stay unclaimed',()=>{
 for(const [title,location,expected] of [
  ['Grand World Phu Quoc','Phu Quoc','Grand World'],['VinWonders Phu Quoc','Phu Quoc','VinWonders'],
  ['Kiss Bridge — optional','Phu Quoc','Kiss Bridge'],['Landmark 81 SkyView','Ho Chi Minh City','Landmark 81'],
  ['Pink Church','Ho Chi Minh City','Pink Church'],['Train Street Hanoi','Hanoi','Train Street'],
  ['The Cafe Apartments','Ho Chi Minh City','Cafe Apartments'],['Thang Long water puppets','Hanoi','water puppets'],
  ['Bui Vien walking street','Ho Chi Minh City','Bui Vien'],['Mekong Delta day trip','My Tho','Mekong Delta']
 ])assert.ok(P.find(title,location).caption.includes(expected),title);
 assert.match(P.find('Hotel & luggage drop','Ninh Binh').caption,/area reference.*confirm/);
 assert.match(P.find('Unconfirmed hotel','Vũng Tàu').caption,/area reference.*confirm/);
 assert.equal(P.find('Unidentified venue','Unknown town'),null);
 for(const p of Object.values(P.photos)){assert.match(p.image,/^assets\/trip-photos\//);assert.match(p.originalImage,/^https:\/\//);assert.match(p.source,/^https:\/\//);assert.ok(p.caption);}
});

test('retained photo files and publisher manifest are present for deployment',()=>{const fs=require('node:fs'),path=require('node:path'),manifest=require('../assets/trip-photos/sources.json');assert.equal(new Set(Object.values(manifest).map(p=>p.file.toLowerCase())).size,Object.keys(manifest).length);assert.notEqual(P.photos.HAN.image.toLowerCase(),P.photos.han.image.toLowerCase());for(const p of Object.values(manifest)){assert.ok(fs.statSync(path.join(__dirname,'..',p.file)).size>0,p.file);assert.match(p.source,/^https:\/\//);}for(const p of Object.values(P.photos))assert.ok(fs.existsSync(path.join(__dirname,'..',p.image)),p.image);});
