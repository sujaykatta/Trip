/* Parse user-shared hotel links locally. Short links are opened for review, never fetched with credentials. */
(function(root){
 const cities=[{id:'PQC',name:'Phu Quoc',match:/phu[\s-]*quoc|\bPQC\b/i},{id:'SGN',name:'Ho Chi Minh City',match:/ho[\s-]*chi[\s-]*minh|saigon|\bSGN\b/i},{id:'HAN',name:'Hanoi',match:/ha[\s-]*noi|\bHAN\b/i},{id:'DAD',name:'Da Nang',match:/da[\s-]*nang|\bdanang\b|\bDAD\b/i}];
 const city=value=>cities.find(c=>c.match.test(String(value||'')))||null;
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 function parse(input){
  const value=String(input||'').trim(),matches=value.match(/https:\/\/[^\s<>"']+/gi)||[];
  if(matches.length!==1)throw new Error('Paste one HTTPS hotel link or one shared hotel message.');
  const link=matches[0].replace(/[.,;!?)\]]+$/g,''),url=new URL(link);
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.'))throw new Error('Use a valid HTTPS hotel link without login details.');
  if(url.href.length>1000)throw new Error('This link is too long. Copy a shorter hotel link.');
  const isAgoda=/(^|\.)agoda\.com$/i.test(url.hostname),slug=isAgoda?url.pathname.match(/\/([^/]+)\/hotel\//)?.[1]:'',sharedName=value.slice(0,value.indexOf(matches[0])).replace(/^\s*check\s+out\s*/i,'').replace(/[\s:–—-]+$/,'').trim();
  const title=(sharedName|| (slug?decodeURIComponent(slug).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()):'')).slice(0,100);
  const start=url.searchParams.get('checkIn')||url.searchParams.get('checkin'),end=url.searchParams.get('checkOut')||url.searchParams.get('checkout');
  return {url:url.href,title,location:city(decodeURIComponent(url.pathname))?.name||'',start:validDate(start)?start:'',end:validDate(end)?end:'',adults:/^\d{1,2}$/.test(url.searchParams.get('adults')||'')?url.searchParams.get('adults'):'',rooms:/^\d{1,2}$/.test(url.searchParams.get('rooms')||'')?url.searchParams.get('rooms'):'',shortLink:isAgoda&&url.pathname.startsWith('/sh-app/')};
 }
 function stay(location,flights){const place=city(location);if(!place)return null;const arrivals=flights.filter(f=>city(f.arrival)?.id===place.id).sort((a,b)=>a.arrivalAt.localeCompare(b.arrivalAt));for(const arrival of arrivals){const departure=flights.filter(f=>city(f.departure)?.id===place.id&&f.departureAt>arrival.arrivalAt).sort((a,b)=>a.departureAt.localeCompare(b.departureAt))[0];if(departure)return {location:place.name,start:arrival.arrivalAt.slice(0,10),end:departure.departureAt.slice(0,10),arrivalTime:arrival.arrivalAt.slice(11),departureTime:departure.departureAt.slice(11),tentative:/booking in progress/i.test(arrival.notes+' '+departure.notes)};}return null;}
 const api={parse,stay,city,cities};if(typeof module==='object'&&module.exports)module.exports=api;else root.TripHotels=api;
})(typeof window==='object'?window:globalThis);
