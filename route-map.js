/* Offline trip geography and evidence-based day locations. No geocoding or tiles. */
var TripRouteMap = (()=>{
 const places=[
  {id:'SGN',name:'Ho Chi Minh City',lat:10.8188,lon:106.652,aliases:['ho chi minh','saigon','sgn'],dx:-14,dy:-20,anchor:'end'},
  {id:'PQC',name:'Phu Quoc',lat:10.169783,lon:103.99353,aliases:['phu quoc','pqc'],dx:-13,dy:28,anchor:'end'},
  {id:'HAN',name:'Hanoi',lat:21.221201,lon:105.806999,aliases:['hanoi','ha noi','han','ha long','halong','lan ha'],dx:20,dy:-12,anchor:'start'},
  {id:'DAD',name:'Da Nang',lat:16.0439,lon:108.198997,aliases:['da nang','danang','dad','hoi an'],dx:20,dy:-10,anchor:'start'},
  {id:'VTG',name:'Vũng Tàu',lat:10.375093,lon:107.096185,aliases:['vung tau','vtg'],dx:18,dy:30,anchor:'start'}
 ];
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 const locate=s=>{const n=normalize(s);return places.find(p=>p.aliases.some(a=>new RegExp('(?:^|[^a-z])'+a+'(?:$|[^a-z])').test(n)))||null;};
 const point=p=>({x:(p.lon-101.5)*47,y:(24-p.lat)*47});
 const meta=d=>{try{const p=JSON.parse(d.notes);return p.format==='trip-plan-v1'?p:null;}catch{return null;}};
 const pending=f=>/booking in progress|pending/i.test(f.notes||'');
 function day(snapshot,date){
  const flights=snapshot.flights||[],documents=snapshot.documents||[],events=[],active=new Set(),shortlist=new Set();
  const arrivals=flights.filter(f=>f.arrivalAt.slice(0,10)<=date&&locate(f.arrival)).sort((a,b)=>Date.parse(a.arrivalAt+a.arrivalZone)-Date.parse(b.arrivalAt+b.arrivalZone));
  const latest=arrivals.at(-1),known=latest?locate(latest.arrival):null;
  flights.forEach(f=>{
   for(const [key,zone,label,location] of [['departureAt','departureZone','Departure',f.departure],['arrivalAt','arrivalZone','Arrival',f.arrival]])if(f[key].slice(0,10)===date){const place=locate(location);if(place)active.add(place.id);events.push({kind:'flight',time:f[key].slice(11),zone:f[zone],title:label+': '+location,detail:f.airline+' '+f.number,status:pending(f)?'Booking pending':'Recorded flight',id:f.id,placeId:place?.id});}
  });
  const stays=[],plans=[],unmapped=[];
  documents.forEach(d=>{const p=meta(d);if(!p)return;const hotel=d.category==='Hotel options';if(hotel?!(d.date&&d.date<=date&&(p.endDate||d.date)>=date):d.date!==date)return;
   const place=locate(p.location),entry={id:d.id,title:d.title,url:d.url||'',location:p.location||'Location to be added',time:p.time||'',status:p.status,placeId:place?.id};
   if(hotel){stays.push(entry);if(place)(p.status==='confirmed'?active:shortlist).add(place.id);}else{plans.push(entry);if(place)active.add(place.id);}
   if(!place)unmapped.push(entry);
  });
  if(!active.size&&known)active.add(known.id);
  const next=flights.filter(f=>f.departureAt.slice(0,10)>=date&&locate(f.departure)&&(!latest||Date.parse(f.departureAt+f.departureZone)>Date.parse(latest.arrivalAt+latest.arrivalZone))).sort((a,b)=>a.departureAt.localeCompare(b.departureAt))[0];
  const firstIncoming=flights.filter(f=>f.arrivalAt.slice(0,10)>date&&locate(f.arrival)).sort((a,b)=>a.arrivalAt.localeCompare(b.arrivalAt))[0];
  const onward=next&&known&&locate(next.departure).id!==known.id?{from:known.name,to:locate(next.departure).name,date:next.departureAt.slice(0,10)}:null;
  events.sort((a,b)=>a.time.localeCompare(b.time));
  return {date,events,stays,plans,unmapped,active:[...active],shortlist:[...shortlist],known:known?.id||null,knownDate:latest?.arrivalAt.slice(0,10)||'',arrivalPending:!!latest&&pending(latest),nextArrival:!known&&firstIncoming?locate(firstIncoming.arrival).id:null,onward};
 }
 function routes(snapshot){return (snapshot.flights||[]).map(f=>({id:f.id,from:locate(f.departure)?.id,to:locate(f.arrival)?.id,date:f.departureAt.slice(0,10),pending:pending(f)})).filter(f=>f.from&&f.to&&f.from!==f.to);}
 return {places,locate,point,day,routes};
})();
if(typeof module!=='undefined')module.exports=TripRouteMap;
