/* Sample trip for testing the template, taken from the Sept 2026 Montenegro site.
   Booking references, PINs, surnames and seat numbers are deliberately left out.
   Facts carry no recorded source, so most show "Confirm before booking" — that is intended. */
window.SAMPLE_TRIP = {
  Trip: [
    { key: 'title', value: 'Montenegro' },
    { key: 'subtitle', value: 'Bay of Kotor · Durmitor · Budva Riviera' },
    { key: 'start_date', value: '2026-09-06' },
    { key: 'end_date', value: '2026-09-14' },
    { key: 'timezone', value: 'Europe/Podgorica' },
    { key: 'home_currency', value: 'INR' },
    { key: 'local_currency', value: 'EUR' },
    { key: 'accent_colour', value: '#2a6b7c' },
    { key: 'intro', value: 'Kotor (3 nights), Žabljak (2), Budva (3). Self-drive throughout. No stay includes breakfast, so every meal is a named vegetarian-friendly pick.' }
  ],
  Sections: [
    { section_id: 'today', label: 'Today', order: 1, visible: 'yes' },
    { section_id: 'overview', label: 'Overview', order: 2, visible: 'yes' },
    { section_id: 'itinerary', label: 'Itinerary', order: 3, visible: 'yes' },
    { section_id: 'stays', label: 'Stays', order: 4, visible: 'yes' },
    { section_id: 'food', label: 'Food', order: 5, visible: 'yes' },
    { section_id: 'bookings', label: 'To book', order: 6, visible: 'yes' },
    { section_id: 'prepare', label: 'Prepare', order: 7, visible: 'yes' },
    { section_id: 'essentials', label: 'Essentials', order: 8, visible: 'yes' }
  ],
  Travellers: [
    { first_name: 'Parth', role: 'Driver and planner', diet: 'Vegetarian' },
    { first_name: 'Aditi', role: 'Co-navigator', diet: 'Vegetarian' },
    { first_name: 'Harsha', role: 'Traveller', diet: 'Vegetarian' }
  ],
  Bases: [
    { base_id: 'kotor', name: "Ana's Place", area: 'Kotor', check_in: '2026-09-06', check_out: '2026-09-09', address: 'Dobrota, 85330 Kotor, Montenegro', lat: '42.439', lng: '18.769', phone: '+382 67 249 964', payment_note: 'Cash only (EUR)', why_here: 'Quiet waterfront base 5 minutes from the cable car and Old Town', booking_id: 'ana' },
    { base_id: 'zabljak', name: 'Mountain Viewpoint', area: 'Žabljak', check_in: '2026-09-09', check_out: '2026-09-11', address: 'Uskoci, 84220 Žabljak, Montenegro', lat: '43.173', lng: '19.125', phone: '+382 67 517 701', payment_note: 'Prepaid', why_here: 'Gateway to Black Lake, Tara rafting and the Ring Road', booking_id: 'mv' },
    { base_id: 'budva', name: 'Talia AP 3 (Airbnb)', area: 'Budva', check_in: '2026-09-11', check_out: '2026-09-14', address: 'Ive Lole Ribara, Bečići, Budva, Montenegro', lat: '', lng: '', phone: '+382 69 258 474', payment_note: 'Prepaid', why_here: 'Beach base close to Sveti Stefan and Tivat airport', booking_id: 'talia' }
  ],
  Days: [
    { day_no: 1, date: '2026-09-06', title: 'Arrival, Kotor cable car and Alpine Coaster at sunset', base_id: 'kotor', hectic_1_10: 3, temp_hi_c: 24, temp_lo_c: 16, rain_pct: 15, weather_note: 'Clear evening expected for sunset views', wear: 'Travel layers; comfortable shoes for the Alpine Coaster', plan_b: '', source_url: '', verified_on: '' },
    { day_no: 2, date: '2026-09-07', title: 'Kotor Old Town and private boat: Perast, Lady of the Rocks, Blue Cave', base_id: 'kotor', hectic_1_10: 7, temp_hi_c: 26, temp_lo_c: 14, rain_pct: 10, weather_note: 'Calm seas expected', wear: 'Swimwear under light clothes; scarf for Lady of the Rocks', plan_b: 'If seas are rough: Perast on foot and the Maritime Museum', source_url: '', verified_on: '' },
    { day_no: 3, date: '2026-09-08', title: 'Lovćen serpentine drive, Njeguši lunch, mausoleum walk', base_id: 'kotor', hectic_1_10: 4, temp_hi_c: 25, temp_lo_c: 14, rain_pct: 15, weather_note: 'Summit about 5°C cooler than the coast', wear: 'Walking shoes and a light jacket for altitude', plan_b: '', source_url: '', verified_on: '' },
    { day_no: 4, date: '2026-09-09', title: 'Drive to Žabljak, Black Lake at evening', base_id: 'zabljak', hectic_1_10: 4, temp_hi_c: 18, temp_lo_c: 8, rain_pct: 25, weather_note: 'Mountain evenings cool fast after sunset', wear: 'Fleece for the evening lake walk', plan_b: '', source_url: '', verified_on: '' }
  ],
  Items: [
    { day_no: 1, time: '12:20', type: 'flight', title: 'Land at Tivat (easyJet from London Gatwick)', note: 'Collect bags, clear immigration', place_id: 'tivat' },
    { day_no: 1, time: '13:00', type: 'transfer', title: 'Car pickup, Final Rentals, Tivat Airport', note: '', place_id: 'tivat' },
    { day_no: 1, time: '15:30', type: 'meal', title: 'Lunch at Restobar Taraca (reserved)', place_id: 'taraca' },
    { day_no: 1, time: '16:45', type: 'checkin', title: "Check in at Ana's Place", note: 'Cash only', place_id: '' },
    { day_no: 1, time: '18:00', type: 'activity', title: 'Kotor cable car up to Vrmac viewpoint', note: '6-minute ride', tip: 'Time the last car up with the 19:15 sunset', place_id: 'cablecar' },
    { day_no: 1, time: '20:00', type: 'meal', title: 'Dinner at Platanus, Dobrota (reserved)', place_id: 'platanus' },
    { day_no: 2, time: '08:30', type: 'activity', title: 'Kotor Old Town before the cruise crowds', note: 'Cathedral of Saint Tryphon, main square, city walls' },
    { day_no: 2, time: '10:15', type: 'transfer', title: 'Drive to Perast, board private boat', distance_km: 20, duration_min: 25, maps_url: 'https://www.google.com/maps/dir/Dobrota,+Montenegro/Perast,+Montenegro' },
    { day_no: 2, time: '13:30', type: 'meal', title: 'Lunch at Conte, Perast', place_id: 'conte', tip: 'Confirm with the boat operator how long all stops take' },
    { day_no: 2, time: '20:00', type: 'meal', title: 'Dinner at Konoba Roma (reserved)', place_id: 'roma' },
    { day_no: 3, time: '10:30', type: 'transfer', title: 'Drive the Serpentine Road', note: '25 hairpin bends rising above Kotor', maps_url: 'https://www.google.com/maps/dir/Dobrota,+Montenegro/Lov%C4%87en+National+Park' },
    { day_no: 3, time: '12:30', type: 'meal', title: 'Lunch in Njeguši village', note: 'Local cheese is vegetarian' },
    { day_no: 3, time: '13:30', type: 'activity', title: 'Walk up to the Njegoš Mausoleum' },
    { day_no: 4, time: '08:30', type: 'transfer', title: 'Drive Kotor to Žabljak', distance_km: 175, duration_min: 180, tip: 'Fill the tank in Nikšić', maps_url: 'https://www.google.com/maps/dir/Kotor,+Montenegro/%C5%BDabljak,+Montenegro' },
    { day_no: 4, time: '18:00', type: 'activity', title: 'Black Lake evening loop', note: '3.5 km, flat' }
  ],
  Places: [
    { place_id: 'tivat', name: 'Tivat Airport', kind: 'airport', area: 'Tivat', veg_note: '', maps_url: 'https://www.google.com/maps/search/?api=1&query=Tivat+Airport', reserve_note: '', source_url: '', verified_on: '' },
    { place_id: 'cablecar', name: 'Kotor Cable Car', kind: 'sight', area: 'Kotor', veg_note: '', maps_url: 'https://www.google.com/maps/search/?api=1&query=Kotor+Cable+Car', reserve_note: 'Buy sunset tickets online', source_url: '', verified_on: '' },
    { place_id: 'taraca', name: 'Restobar Taraca', kind: 'restaurant', area: 'Kotor', veg_note: 'Large vegan and vegetarian menu', maps_url: 'https://www.google.com/maps/search/?api=1&query=Restobar+Taraca+Kotor', reserve_note: '', source_url: '', verified_on: '' },
    { place_id: 'platanus', name: 'Platanus', kind: 'restaurant', area: 'Kotor', veg_note: 'Salads and Montenegrin small plates', maps_url: 'https://www.google.com/maps/search/?api=1&query=Platanus+Dobrota', reserve_note: '', source_url: '', verified_on: '' },
    { place_id: 'roma', name: 'Konoba Roma', kind: 'restaurant', area: 'Kotor', veg_note: 'Vegetarian pasta, grilled vegetables, local cheese', maps_url: 'https://www.google.com/maps/search/?api=1&query=Konoba+Roma+Kotor', reserve_note: '', source_url: '', verified_on: '' },
    { place_id: 'conte', name: 'Conte', kind: 'restaurant', area: 'Perast', veg_note: 'Pesto pasta, grilled vegetables, shopska salad', maps_url: 'https://www.google.com/maps/search/?api=1&query=Conte+Perast', reserve_note: 'Reserve 3–4 days ahead', source_url: '', verified_on: '' }
  ],
  Bookings: [
    { booking_id: 'ana', type: 'stay', name: "Ana's Place, Kotor", status: 'booked', book_by: '', cancel_by: '', cash_only: 'yes', doc_link: '', notes: '' },
    { booking_id: 'mv', type: 'stay', name: 'Mountain Viewpoint, Žabljak', status: 'booked', book_by: '', cancel_by: '', cash_only: 'no', doc_link: '', notes: '' },
    { booking_id: 'talia', type: 'stay', name: 'Talia AP 3, Budva', status: 'booked', book_by: '', cancel_by: '', cash_only: 'no', doc_link: '', notes: '' },
    { booking_id: 'car', type: 'transport', name: 'Downsize the rental car to a mid-size SUV', status: 'to book', book_by: '2026-08-25', cancel_by: '', cash_only: 'no', doc_link: '', notes: 'Group is now 3' },
    { booking_id: 'cablecar', type: 'activity', name: 'Kotor cable car, sunset slot', status: 'to book', book_by: '2026-08-30', cancel_by: '', cash_only: 'no', doc_link: '', notes: '' },
    { booking_id: 'boat', type: 'activity', name: 'Private boat: Perast, Lady of the Rocks, Blue Cave', status: 'to book', book_by: '2026-08-30', cancel_by: '', cash_only: 'no', doc_link: '', notes: '' },
    { booking_id: 'park', type: 'fee', name: 'Durmitor National Park entry', status: 'pay on the day', book_by: '', cancel_by: '', cash_only: 'yes', doc_link: '', notes: 'Carry euro cash' }
  ],
  Visas: [
    { first_name: 'Parth', country: 'Montenegro', route: 'Valid UK visa allows entry', status: 'check validity', apply_by: '2026-08-15', processing_days: '', fallback: '', source_url: '', verified_on: '' },
    { first_name: 'Aditi', country: 'Montenegro', route: 'Valid UK visa allows entry', status: 'check validity', apply_by: '2026-08-15', processing_days: '', fallback: '', source_url: '', verified_on: '' }
  ],
  Pack: [
    { category: 'Coast', item: 'Swimwear (2 sets), sandals, sun hat', who: 'both' },
    { category: 'Mountain', item: 'Fleece and light waterproof jacket', who: 'both' },
    { category: 'Activities', item: 'Quick-dry towel and waterproof phone pouch', who: 'both' },
    { category: 'Cash', item: 'Euro cash for the cash-only stay and park fees', who: 'Parth' }
  ],
  Destination: [
    { topic: 'emergency', key: 'All emergencies', value: '112', source_url: '', verified_on: '' },
    { topic: 'emergency', key: 'Police', value: '122', source_url: '', verified_on: '' },
    { topic: 'emergency', key: 'Ambulance', value: '124', source_url: '', verified_on: '' },
    { topic: 'phrase', key: 'Without meat, without fish', value: 'Bez mesa, bez ribe', source_url: '', verified_on: '' },
    { topic: 'dish', key: 'Šataraš', value: 'Stewed peppers and tomatoes; vegetarian', source_url: '', verified_on: '' },
    { topic: 'dish', key: 'Kačamak', value: 'Cornmeal with cheese and kajmak', source_url: '', verified_on: '' }
  ]
};
