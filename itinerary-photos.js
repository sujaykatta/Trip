/* Curated public photo references. Publisher sources remain visible. */
(function(root){
const photos={
 "HAN": {
  "image": "https://res.klook.com/image/upload/fl_lossy.progressive%2Cw_1200%2Ch_630%2Cc_fill%2Cq_85/v1617790805/blog/e56gpaxlcgguh5dgxitk.jpg",
  "source": "https://www.klook.com/ja/blog/hanoi-airport-to-city-vietnam/",
  "caption": "Noi Bai International Airport (HAN) · terminal reference · Klook"
 },
 "DAD": {
  "image": "https://media.vov.vn/sites/default/files/world/Uploaded/bichthuan/2015_11_15/danangairp1.jpg",
  "source": "https://vov.vn/zh-CN/%E5%B2%98%E6%B8%AF%E5%9B%BD%E9%99%85%E6%9C%BA%E5%9C%BA%E5%9B%BD%E9%99%85%E8%88%AA%E7%AB%99%E6%A5%BC%E5%BC%80%E5%B7%A5%E5%BB%BA%E8%AE%BE-323197.vov",
  "caption": "Da Nang International Airport (DAD) · terminal reference · VOV"
 },
 "SGN": {
  "image": "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/g3-1715917065765.png",
  "source": "https://www.vietjetair.com/en/destinations/experience/list-of-domestic-and-international-airports-in-vietnam",
  "caption": "Tan Son Nhat International Airport (SGN) · terminal reference · Vietjet"
 },
 "HYD": {
  "image": "https://dx0mo0fmeu4hj.cloudfront.net/uploads/hial_banner_02_top_3429e00e53.jpg",
  "source": "https://www.hyderabad.aero/",
  "caption": "Rajiv Gandhi International Airport (HYD) · official airport image"
 },
 "PQC": {
  "image": "https://res.klook.com/image/upload/fl_lossy.progressive%2Cq_85/c_fill%2Cw_1000/v1725879097/gmayapm0lupprdmo69wi.jpg",
  "source": "https://www.klook.com/zh-TW/blog/direct-flights-to-phu-quoc/",
  "caption": "Phu Quoc International Airport (PQC) · terminal reference · Klook"
 },
 "sgn": {
  "image": "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-07/vietnam-tourism-4.jpg?itok=sxkNfdns",
  "source": "https://vietnam.travel/places-to-go/southern-vietnam/ho-chi-minh-city/",
  "caption": "Ho Chi Minh City area reference · exact venue / hotel to confirm"
 },
 "han": {
  "image": "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-06/vietnam-travel-5.jpg?itok=S0kyMyUm",
  "source": "https://vietnam.travel/places-to-go/northern-vietnam/ha-noi/",
  "caption": "Hanoi area reference · exact venue / hotel to confirm"
 },
 "pqc": {
  "image": "https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-nam/Kien-Giang/phu-quoc/danh-thang/vuong-quoc-sao-bien.jpg",
  "source": "https://datviettour.com.vn/tin-tuc/lang-chai-rach-vem-o-dau-an-gi-choi-gi-tai-day",
  "caption": "Phu Quoc beach area reference · exact hotel / meeting point to confirm"
 },
 "nbh": {
  "image": "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-06/travel-vietnam-3.jpg?itok=VIgUe7_6",
  "source": "https://vietnam.travel/places-to-go/northern-vietnam/ninh-binh/",
  "caption": "Ninh Binh area reference · exact venue / hotel to confirm"
 },
 "dad": {
  "image": "https://images.vietnam.travel/styles/card_wide_1200w/s3/2018-10/danang%20travel%20guide.jpg?itok=GirnBHLp",
  "source": "https://vietnam.travel/places-to-go/central-vietnam/da-nang/",
  "caption": "Da Nang area reference · exact venue / hotel to confirm"
 },
 "landmark": {
  "image": "https://images.vietnam.travel/inline-images/thap_hcm-edit.jpg",
  "source": "https://vietnam.travel/things-to-do/10-tourist-spots-not-be-missed-ho-chi-minh-city/",
  "caption": "Landmark 81 complex · Vietnam Tourism"
 },
 "grandworld": {
  "image": "https://media1.thrillophilia.com/filestore/4tkjyrcfjn4y2kvdy4zwz9muf78y_52681262911_096921b45d_b.jpg",
  "source": "https://www.thrillophilia.com/attractions/grand-world-phu-quoc",
  "caption": "Grand World Phu Quoc · Thrillophilia photo reference"
 },
 "vinwonders": {
  "image": "https://booking-static.vinpearl.com/tours/8cc89f36e44c4574b90f8f3030b6b1a9_imgi_3_b61cd5e3d4834a6ca82ea920922c813d_vwpq_vinwonders-phu-quoc-ve-vao-cua-tet-vi-vu_vinwonders-phu-quoc-ve-vao-cua-family-combo.jpg",
  "source": "https://vinwonders.com/en/wonderpedia/news/vinwonders-phu-quoc-rides/",
  "caption": "VinWonders Phu Quoc · official photo"
 },
 "kiss": {
  "image": "https://visitphuquoc.com.vn/VisitPhuQuoc/_default_upload_bucket/1819/image-thumb__1819__720_jpg/2C5A9537.d54dfae0.33c75374.jpg",
  "source": "https://visitphuquoc.com.vn/en/kiss-bridge",
  "caption": "Kiss Bridge, Sunset Town · Visit Phu Quoc"
 },
 "puppets": {
  "image": "https://images.vietnam.travel/inline-images/water%20puppetry%20Vietnam_0.jpg",
  "source": "https://vietnam.travel/things-to-do/vietnam-water-puppets/",
  "caption": "Vietnamese water puppets · display reference · Vietnam Tourism"
 },
 "bay": {
  "image": "https://images.vietnam.travel/inline-images/782A1780_resize.jpg",
  "source": "https://vietnam.travel/things-to-do/what-to-do-in-ha-long-bay/",
  "caption": "Ha Long / Lan Ha bay scenery reference · exact cruise to confirm"
 },
 "mekong": {
  "image": "https://images.vietnam.travel/2017-07/southern-vietnam_1.jpg",
  "source": "https://vietnam.travel/place-to-go/mekong-delta/",
  "caption": "Mekong Delta scenery reference · route to confirm"
 },
 "bui": {
  "image": "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Thay%20Anh%20Traffic%20Tieng%20Anh/bui%20vien%20walking%20street/experience-the-thrill-of-fire-dancers-street-magicians-turning-bui-vien-into-a-stage-of-wonders.png",
  "source": "https://www.vietnamairlines.com/go/en/plan-book/travel/travel-guide/bui-vien-walking-street",
  "caption": "Bui Vien Walking Street · Vietnam Airlines photo reference"
 },
 "train": {
  "image": "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Thay%20Anh%20Traffic%20Tieng%20Anh/hanoi%20train%20street/in-the-face-of-destruction-this-narrow-alleyway-became-a-quiet-testament-to-the-strength-of-the.jpeg",
  "source": "https://www.vietnamairlines.com/go/en/plan-book/travel/travel-guide/hanoi-train-street",
  "caption": "Hanoi Train Street · Vietnam Airlines photo reference"
 },
 "cafes": {
  "image": "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Traffic%20TA/MN/the%20cafe%20apartments/thumbs.jpg",
  "source": "https://www.vietnamairlines.com/go/vi/plan-book/travel/travel-guide/the-cafe-apartment",
  "caption": "The Cafe Apartments · Vietnam Airlines photo reference"
 },
 "pink": {
  "image": "https://visithcmc.vn/wp-content/uploads/2026/10/nha_tho_tan_dinh_fUvgJ7O0Sc.webp",
  "source": "https://visithcmc.vn/vi/10-diem-tham-quan-khong-the-bo-qua-khi-den-thanh-pho-ho-chi-minh/",
  "caption": "Tân Định Pink Church · Visit HCMC"
 },
 "vtg": {
  "image": "https://images.vietnam.travel/2018-12/top%20things%20to%20do%20in%20vung%20tau.jpg",
  "source": "https://vietnam.travel/places-to-go/southern-vietnam/vung-tau/",
  "caption": "Vũng Tàu area reference · exact hotel to confirm"
 },
 "book": {
  "image": "https://image.vietnamnews.vn/uploadvnnews/Article/2024/2/25/332801_book.jpg",
  "source": "https://vietnamnews.vn/life-style/1650915/hcm-city-to-encourage-reading-culture.html",
  "caption": "Nguyễn Văn Bình Book Street · Vietnam News"
 },
 "square": {
  "image": "https://www.vietnamairlines.com/~/media/SEO-images/2025%20SEO/Traffic%20TV/saigon-square/saigon-square.jpg",
  "source": "https://www.vietnamairlines.com/vn/vi/useful-information/travel-guide/saigon-square",
  "caption": "Saigon Square · Vietnam Airlines photo reference"
 },
 "ice": {
  "image": "https://cdn2.tuoitre.vn/471584752817336320/2024/3/25/r1-17113535736871684687592.jpg",
  "source": "https://muctim.tuoitre.vn/nang-nong-gen-z-ru-nhau-truot-bang-giai-nhiet-101240325150541901.htm",
  "caption": "Vincom Ice Rink · Tuổi Trẻ / Mực Tím photo reference"
 },
 "starfish": {
  "image": "https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-nam/Kien-Giang/phu-quoc/danh-thang/vuong-quoc-sao-bien.jpg",
  "source": "https://datviettour.com.vn/tin-tuc/lang-chai-rach-vem-o-dau-an-gi-choi-gi-tai-day",
  "caption": "Rạch Vẹm / Starfish Beach · Đất Việt Tour reference"
 },
 "cable": {
  "image": "https://mktravel.com.vn/assets/image/product_main/original/kham-pha-4dao-cap-treo-hon-thom-phu-quoc.jpeg",
  "source": "https://visitphuquoc.com.vn/en/hon-thom-cable-car-continues-to-capture-the-attention-of-international-media",
  "caption": "Hòn Thơm cable car · MK Travel / Visit Phu Quoc reference"
 }
};
const patterns=[[/book street/i,'book'],[/saigon square/i,'square'],[/ice rink|ice skat/i,'ice'],[/starfish|rach vem/i,'starfish'],[/hon thom|cable car|snorkeling/i,'cable'],[/pink church|tan dinh/i,'pink'],[/landmark 81|ice rink|ice skat/i,'landmark'],[/grand world/i,'grandworld'],[/vinwonders/i,'vinwonders'],[/kiss bridge|sunset town/i,'kiss'],[/water puppet/i,'puppets'],[/train street|đường tàu/i,'train'],[/caf[eé] apartments?/i,'cafes'],[/bui vien/i,'bui'],[/mekong/i,'mekong'],[/cruise|cat ba island hopping/i,'bay']];
function find(title='',location='',airport=''){
 if(airport){const code=Object.keys(photos).filter(k=>/^[A-Z]{3}$/.test(k)).find(k=>new RegExp('\\b'+k+'\\b','i').test(airport));return photos[code]||null;}
 const specific=patterns.find(([match])=>match.test(title));if(specific)return photos[specific[1]];
 const text=location+' '+title,areas=[[/vung tau|vũng tàu/i,'vtg'],[/ninh binh|tam coc|trang an|bich dong|hang mua/i,'nbh'],[/cat ba|ha long|lan ha/i,'bay'],[/phu quoc|pqc|hon thom|starfish|rach vem/i,'pqc'],[/hanoi|ha noi|vegas/i,'han'],[/ho chi minh|saigon|sai gon|bus tour|pink church|tan dinh|book street/i,'sgn'],[/da nang|hoi an/i,'dad']];
 const area=areas.find(([match])=>match.test(text));return area?photos[area[1]]:null;
}
const localImages={"https://res.klook.com/image/upload/fl_lossy.progressive%2Cw_1200%2Ch_630%2Cc_fill%2Cq_85/v1617790805/blog/e56gpaxlcgguh5dgxitk.jpg": "assets/trip-photos/airport-han.jpg", "https://media.vov.vn/sites/default/files/world/Uploaded/bichthuan/2015_11_15/danangairp1.jpg": "assets/trip-photos/airport-dad.jpg", "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/g3-1715917065765.png": "assets/trip-photos/airport-sgn.jpg", "https://dx0mo0fmeu4hj.cloudfront.net/uploads/hial_banner_02_top_3429e00e53.jpg": "assets/trip-photos/airport-hyd.jpg", "https://res.klook.com/image/upload/fl_lossy.progressive%2Cq_85/c_fill%2Cw_1000/v1725879097/gmayapm0lupprdmo69wi.jpg": "assets/trip-photos/airport-pqc.jpg", "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-07/vietnam-tourism-4.jpg?itok=sxkNfdns": "assets/trip-photos/reference-sgn.jpg", "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-06/vietnam-travel-5.jpg?itok=S0kyMyUm": "assets/trip-photos/reference-han.jpg", "https://datviettour.com.vn/uploads/images/tin-tuc-SEO/mien-nam/Kien-Giang/phu-quoc/danh-thang/vuong-quoc-sao-bien.jpg": "assets/trip-photos/reference-starfish.jpg", "https://images.vietnam.travel/styles/card_wide_1200w/s3/2017-06/travel-vietnam-3.jpg?itok=VIgUe7_6": "assets/trip-photos/reference-nbh.jpg", "https://images.vietnam.travel/styles/card_wide_1200w/s3/2018-10/danang%20travel%20guide.jpg?itok=GirnBHLp": "assets/trip-photos/reference-dad.jpg", "https://images.vietnam.travel/inline-images/thap_hcm-edit.jpg": "assets/trip-photos/reference-landmark.jpg", "https://media1.thrillophilia.com/filestore/4tkjyrcfjn4y2kvdy4zwz9muf78y_52681262911_096921b45d_b.jpg": "assets/trip-photos/reference-grandworld.jpg", "https://booking-static.vinpearl.com/tours/8cc89f36e44c4574b90f8f3030b6b1a9_imgi_3_b61cd5e3d4834a6ca82ea920922c813d_vwpq_vinwonders-phu-quoc-ve-vao-cua-tet-vi-vu_vinwonders-phu-quoc-ve-vao-cua-family-combo.jpg": "assets/trip-photos/reference-vinwonders.jpg", "https://visitphuquoc.com.vn/VisitPhuQuoc/_default_upload_bucket/1819/image-thumb__1819__720_jpg/2C5A9537.d54dfae0.33c75374.jpg": "assets/trip-photos/reference-kiss.jpg", "https://images.vietnam.travel/inline-images/water%20puppetry%20Vietnam_0.jpg": "assets/trip-photos/reference-puppets.jpg", "https://images.vietnam.travel/inline-images/782A1780_resize.jpg": "assets/trip-photos/reference-existing-3.jpg", "https://images.vietnam.travel/2017-07/southern-vietnam_1.jpg": "assets/trip-photos/reference-mekong.jpg", "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Thay%20Anh%20Traffic%20Tieng%20Anh/bui%20vien%20walking%20street/experience-the-thrill-of-fire-dancers-street-magicians-turning-bui-vien-into-a-stage-of-wonders.png": "assets/trip-photos/reference-bui.jpg", "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Thay%20Anh%20Traffic%20Tieng%20Anh/hanoi%20train%20street/in-the-face-of-destruction-this-narrow-alleyway-became-a-quiet-testament-to-the-strength-of-the.jpeg": "assets/trip-photos/reference-train.jpg", "https://www.vietnamairlines.com/content/dam/legacy-site-assets/SEO-images/2025%20SEO/Traffic%20TA/MN/the%20cafe%20apartments/thumbs.jpg": "assets/trip-photos/reference-cafes.jpg", "https://visithcmc.vn/wp-content/uploads/2026/10/nha_tho_tan_dinh_fUvgJ7O0Sc.webp": "assets/trip-photos/reference-pink.webp", "https://images.vietnam.travel/2018-12/top%20things%20to%20do%20in%20vung%20tau.jpg": "assets/trip-photos/reference-vtg.jpg", "https://image.vietnamnews.vn/uploadvnnews/Article/2024/2/25/332801_book.jpg": "assets/trip-photos/reference-book.jpg", "https://www.vietnamairlines.com/~/media/SEO-images/2025%20SEO/Traffic%20TV/saigon-square/saigon-square.jpg": "assets/trip-photos/reference-square.jpg", "https://cdn2.tuoitre.vn/471584752817336320/2024/3/25/r1-17113535736871684687592.jpg": "assets/trip-photos/reference-ice.jpg", "https://mktravel.com.vn/assets/image/product_main/original/kham-pha-4dao-cap-treo-hon-thom-phu-quoc.jpeg": "assets/trip-photos/reference-cable.jpg", "https://images.vietnam.travel/inline-images/Activities%20Ninh%20Binh%20Vietnam%20Travel_0.jpg": "assets/trip-photos/reference-existing-0.jpg", "https://images.vietnam.travel/inline-images/top%20activities%20in%20ninh%20binh-2.jpg": "assets/trip-photos/reference-existing-1.jpg", "https://images.vietnam.travel/inline-images/Activities%20Ninh%20Binh%20Vietnam%20Travel-5_0.jpg": "assets/trip-photos/reference-existing-2.jpg", "https://static.hotdeal.vn/images/1723/1722851/500x500/369685-metashow-tham-quan-va-chup-anh-doc-dao-nhat-viet-nam.jpg": "assets/trip-photos/reference-existing-4.jpg", "https://statics.vinpearl.com/khong-gian-oasis-cafe-sai-gon_1745589555.jpg": "assets/trip-photos/reference-existing-5.jpg", "https://images2.thanhnien.vn/528068263637045248/2025/6/17/ca-phe-me-7-17501581414371913991063.jpg": "assets/trip-photos/reference-existing-6.jpg"};
const localImage=url=>localImages[url]||url;
Object.values(photos).forEach(p=>{p.originalImage=p.image;p.image=localImage(p.image);});
const api={find,photos,localImage};if(typeof module==='object'&&module.exports)module.exports=api;else root.TripItineraryPhotos=api;
})(typeof window==='object'?window:globalThis);
