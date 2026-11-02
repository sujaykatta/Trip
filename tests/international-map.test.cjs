const {test}=require('node:test'),assert=require('node:assert/strict'),M=require('../international-map.js');
const flight=(from,to,date,arrival=date)=>({id:date,departure:from,arrival:to,departureAt:date+'T23:45',arrivalAt:arrival+'T05:40',number:'Example'});
test('wide route follows international departure days and direction without adding connection legs',()=>{
 const data={flights:[flight('Hyderabad (HYD)','Ho Chi Minh City (SGN)','2026-12-17','2026-12-18'),flight('SGN','PQC','2026-12-19'),flight('Da Nang (DAD)','Hyderabad (HYD)','2026-12-27')]};
 assert.deepEqual(M.legs(data,'2026-12-17').map(r=>[r.from.id,r.to.id]),[['HYD','SGN']]);
 assert.deepEqual(M.legs(data,'2026-12-27').map(r=>[r.from.id,r.to.id]),[['DAD','HYD']]);
 assert.equal(M.legs(data,'2026-12-18').length,0);assert.equal(M.legs(data,'2026-12-19').length,0);
 assert.equal(M.legs({flights:[flight('Unknown (XXX)','HYD','2026-12-17')]},'2026-12-17').length,0);
});
test('both countries and all airport points fit the offline wide-map frame',()=>{
 for(const code of ['HYD','SGN','HAN','DAD','PQC']){const p=M.point(M.airports[code]);assert.ok(p.x>0&&p.x<1000&&p.y>0&&p.y<720,code);}
 for(const country of ['India','Vietnam'])assert.ok(M.land.some(l=>l.name===country&&l.path.startsWith('M')));
 const leg={from:M.airports.HYD,to:M.airports.SGN};assert.ok(M.curve(leg).startsWith('M'+M.point(leg.from).x));assert.notEqual(M.curve(leg),M.curve({from:leg.to,to:leg.from}));
});
