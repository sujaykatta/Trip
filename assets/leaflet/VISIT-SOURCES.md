Leaflet 1.9.4 is vendored from its npm distribution; license included.
Maps use OpenStreetMap tiles with visible attribution.

Known attraction marker coordinates (area-level venue locations, not entrances):
- VinWonders Phu Quoc: OpenStreetMap way 660104575, 10.338, 103.85449.
- Grand World Phu Quoc: OpenStreetMap way 936712302, 10.32494, 103.8581376.
- Tan Dinh Church: https://en.wikipedia.org/wiki/T%C3%A2n_%C4%90%E1%BB%8Bnh_Church
- Cafe Apartments: https://www.tourbyspot.com/spots/cafe-apartments-nguyen-hue-walking-street-ho-chi-minh-city-vietnam

Plans without verified venue/meeting-point coordinates remain in the visit list, not at guessed city-center pins.

Hanoi additions (1 November 2026):
- Train Street area: 21.03, 105.8439, https://en.wikipedia.org/wiki/Hanoi_Train_Street . Area reference only; does not indicate legal access or a viewing position.
- VEGAS-M uses its Meliá Hanoi hotel location: OSM way 842628260, 21.0245301, 105.8484024. Venue address verified at https://vegas-m.com/ : 44B Ly Thuong Kiet.
- Access restrictions reference: https://vietnamtourism.vn/en/index.php/news/items/18875

Additional itinerary locations checked 1 November 2026:
- Landmark 81 complex: 10.795, 106.7219; https://en.wikipedia.org/wiki/Landmark_81 . SkyView and ice rink share one marker with both activities in its popup.
- Metashow uses the Thiso Mall Sala location: OSM way605774020, 10.7720643, 106.7217734; address corroborated by https://metashow.vn/ .
- Saigon Square: OSM node13736467601, 10.7728037, 106.7001899.
- Bui Vien: OSM way459271667, 10.7668329, 106.6926683.
- Nguyen Van Binh Book Street: OSM node11708010270, 10.7805735, 106.6996948.
- Kiss Bridge: OSM way1467926468, 10.0282631, 104.0041947.
- Rach Vem: OSM node6873078787, 10.3660694, 103.9322926. Village-area reference, not a confirmed boat landing, restaurant or starfish sighting.
- Sunset Town: OSM way718108394, 10.0294252, 104.0083142. Area reference.
- Oasis branch, Teddy Cafe confirmation, bus boarding point, Mekong tour operator and snorkeling/cable-car meeting point are still pending. No guessed pins are drawn.

Dashed lines indicate selected-day visit order only, not a road route or travel-time calculation. Amber markers indicate optional/alternative visits.

Photo references are linked thumbnails loaded only on matching itinerary cards with visible source links. Oasis/Me photos are marked provisional; they do not confirm branch or seasonal decorations.

Northern route revision (2 November 2026):
- Ninh Binh map-region reference: Trang An complex, 20.25667, 105.89639, https://en.wikipedia.org/wiki/Tr%C3%A0ng_An_Scenic_Landscape_Complex . Area marker, not a hotel or boat departure point.
- Cat Ba island-area reference: 20.795, 107.011, https://en.wikipedia.org/wiki/C%C3%A1t_B%C3%A0_Island . No guessed embarkation pin; boat connection remains unconfirmed.
- Hang Mua viewpoint: 20.229379, 105.933717, https://www.juzaphoto.com/destinazioni.php?d=hang_mua_viewpoint&l=en .
- Bich Dong pagoda: 20.21806, 105.91444, https://www.vietnam-pagodas.com/en/chua/chua-bich-dong .
- Photos: Vietnam Tourism, https://vietnam.travel/things-to-do/10-must-do-activities-ninh-binh/ (Trang An, Hang Mua, Bich Dong) and https://vietnam.travel/things-to-do/what-to-do-in-ha-long-bay/ (bay kayaking reference; does not establish an exact Cat Ba route). Image URLs stay on the publisher's host with visible source links.
- Cruise reference only: https://eliteoftheseas.com/itineraries/2days-1night-discovery-halong-lan-ha-bay returns to mainland about 11:15–11:20. Exact booked operator and any Cat Ba drop-off remain to confirm.
- Thang Long address: https://www.thanglongwaterpuppet.org/lien-he/ . No December show time assumed.

Photo coverage audit (2 November 2026):
- `itinerary-photos.js` retains the curated photo URLs, source pages and visible captions for five airports and the remaining itinerary places. Existing Ninh Binh, cafe and exhibition references remain in `itinerary.js`.
- Flight cards select the departure or arrival airport explicitly; route titles containing two airport codes cannot choose the wrong endpoint. Airports: HYD (Hyderabad official airport), SGN (Vietjet terminal photo), HAN/PQC (Klook terminal photos), DAD (VOV terminal photo). Images are visual references, not terminal or gate guidance. City panoramas and an airport expansion rendering found during review were replaced with actual terminal photographs.
- Added dedicated references for Landmark 81, Grand World, VinWonders, Kiss Bridge/Sunset Town, water puppetry, Mekong scenery, Bui Vien, Train Street, Cafe Apartments, Pink Church, Book Street, Saigon Square, Vincom ice rink, Rach Vem and Hon Thom cable car.
- Transfers and unnamed/unconfirmed hotels use explicitly labelled area references. A picture never establishes a booking, operator, opening time or precise meeting point. All 34 selected photos are retained in `assets/trip-photos/` with original URLs, captions and publisher pages in `sources.json`. The frontend uses local files, so external hotlink restrictions cannot blank these cards. Source links accompany every photo.
