/* Parse user-shared hotel links locally. Short links are opened for review, never fetched with credentials. */
(function(root){
 // Names match case-insensitively; airport codes only in capitals, so "han-river-view" in a Da Nang link is not Hanoi.
 const cities=[{id:'PQC',name:'Phu Quoc',match:/phu[\s-]*quoc/i},{id:'SGN',name:'Ho Chi Minh City',match:/ho[\s-]*chi[\s-]*minh|saigon/i},{id:'HAN',name:'Hanoi',match:/ha[\s-]*noi/i},{id:'DAD',name:'Da Nang',match:/da[\s-]*nang|\bdanang\b/i},{id:'NBH',name:'Ninh Binh',match:/ninh[\s-]*binh|tam[\s-]*coc|trang[\s-]*an\b/i,code:false},{id:'CBA',name:'Cat Ba',match:/cat[\s-]*ba\b/i,code:false},{id:'VTG',name:'Vũng Tàu',match:/v[uũ]ng[\s-]*t[aà]u/i,code:false}];
 const city=value=>{const text=String(value||'');return cities.find(c=>c.match.test(text))||cities.find(c=>c.code!==false&&new RegExp('\\b'+c.id+'\\b').test(text))||null;};
 const decode=value=>{try{return decodeURIComponent(value);}catch{return value;}};
 const count=(url,...keys)=>{for(const key of keys){const v=url.searchParams.get(key)||'';if(/^\d{1,2}$/.test(v))return v;}return '';};
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 function parse(input){
  const value=String(input||'').trim(),matches=value.match(/https:\/\/[^\s<>"']+/gi)||[];
  if(matches.length!==1)throw new Error('Paste one HTTPS hotel link or one shared hotel message.');
  const link=matches[0].replace(/[.,;!?)\]]+$/g,''),url=new URL(link);
  if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.'))throw new Error('Use a valid HTTPS hotel link without login details.');
  if(url.href.length>1000)throw new Error('This link is too long. Copy a shorter hotel link.');
  const isAgoda=/(^|\.)agoda\.com$/i.test(url.hostname),isBooking=/(^|\.)booking\.com$/i.test(url.hostname),slug=isAgoda?url.pathname.match(/\/([^/]+)\/hotel\//)?.[1]:isBooking?url.pathname.match(/\/hotel\/[a-z]{2}\/([^/.]+)/i)?.[1]:'',sharedName=value.slice(0,value.indexOf(matches[0])).replace(/^\s*check\s+out\s*/i,'').replace(/[\s:–—-]+$/,'').trim();
  const title=(sharedName|| (slug?decode(slug).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()):'')).slice(0,100);
  const start=url.searchParams.get('checkIn')||url.searchParams.get('checkin'),end=url.searchParams.get('checkOut')||url.searchParams.get('checkout');
  return {url:url.href,title,location:city(decode(url.pathname))?.name||'',start:validDate(start)?start:'',end:validDate(end)?end:'',adults:count(url,'adults','group_adults'),rooms:count(url,'rooms','no_rooms'),shortLink:(isAgoda&&url.pathname.startsWith('/sh-app/'))||(isBooking&&/^\/Share-/i.test(url.pathname))};
 }
 function stay(location,flights){const place=city(location);if(!place)return null;const arrivals=flights.filter(f=>city(f.arrival)?.id===place.id).sort((a,b)=>a.arrivalAt.localeCompare(b.arrivalAt));for(const arrival of arrivals){const departure=flights.filter(f=>city(f.departure)?.id===place.id&&f.departureAt>arrival.arrivalAt).sort((a,b)=>a.departureAt.localeCompare(b.departureAt))[0];if(departure)return {location:place.name,start:arrival.arrivalAt.slice(0,10),end:departure.departureAt.slice(0,10),arrivalTime:arrival.arrivalAt.slice(11),departureTime:departure.departureAt.slice(11),tentative:/booking in progress/i.test(arrival.notes+' '+departure.notes)};}return null;}
 const api={parse,stay,city,cities};if(typeof module==='object'&&module.exports)module.exports=api;else root.TripHotels=api;
})(typeof window==='object'?window:globalThis);
