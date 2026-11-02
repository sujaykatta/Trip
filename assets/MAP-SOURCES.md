# Local route map sources

Country outlines: Natural Earth 1:50m admin-0 countries, public domain. https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

Destination pin coordinates use OurAirports airport positions (SGN, HAN, PQC, DAD, VTG), public domain: https://ourairports.com/data/ . Pins represent the destination area, not a hotel address.

The map is a trip overview, not a navigation chart. Route curves are schematic, not aircraft tracks or road directions. No map tiles, geocoding API or external map request is needed. Geometry prepared 29 October 2026.

International flight overview (2 November 2026):
- `international-map.js` retains Natural Earth 1:50m country outlines for India, Vietnam and neighbouring countries. The larger view spans 66–114°E and approximately 2–37°N; coordinates use the same public-domain dataset above. Geometry is simplified for an overview, not navigation.
- Airport endpoints HYD, SGN, HAN, PQC and DAD come from the OurAirports CSV, fetched 2 November 2026.
- The wide map appears on the departure date of a recorded international booking, in both the itinerary and Map tab. Direction follows the saved booking; midnight arrivals do not move the outbound overview to the following day.
- A connecting booking is shown between its saved endpoints, with a visible schematic-route note. No stopover city, additional flight or actual aircraft track is inferred.
