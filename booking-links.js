/* Official airline portals. Booking references are entered by the traveler on the airline site. */
(function(root){
 function portal(flight){const name=String(flight.airline||''),number=String(flight.number||'').trim();if(/viet\s*jet/i.test(name)||/^VJ\s*\d/i.test(number))return {name:'VietJet Air',url:'https://www1.vietjetair.com/en/my/search-booking'};if(/viet\s*nam\s*airlines/i.test(name)||/^VN\s*\d/i.test(number))return {name:'Vietnam Airlines',url:'https://www.vietnamairlines.com/tw/en/buy-tickets-other-products/booking-and-manage-bookings/reservation-management'};return null;}
 const api={portal};if(typeof module==='object'&&module.exports)module.exports=api;else root.TripBookingLinks=api;
})(typeof window==='object'?window:globalThis);
