/* Trip template: renders a trip from a Google Sheet (or the bundled sample).
   Share link format:  https://<site>/#s=<PUBLIC_SHEET_ID>
   Test a date:        add &today=2027-04-18 to the hash
   No code here should ever need editing to change a trip. */
(function () {
  'use strict';

  var TABS = ['Trip', 'Sections', 'Travellers', 'Bases', 'Days', 'Items', 'Places', 'Bookings', 'Visas', 'Pack', 'Destination'];
  var REQUIRED = {
    Trip: ['key', 'value'],
    Sections: ['section_id', 'label', 'order', 'visible'],
    Days: ['day_no', 'date', 'title'],
    Items: ['day_no', 'time', 'title'],
    Bookings: ['booking_id', 'name', 'status'],
    Visas: ['first_name', 'country', 'apply_by']
  };
  var DEFAULT_SECTIONS = [
    ['today', 'Today'], ['overview', 'Overview'], ['itinerary', 'Itinerary'], ['stays', 'Stays'],
    ['food', 'Food'], ['bookings', 'To book'], ['prepare', 'Prepare'], ['essentials', 'Essentials']
  ].map(function (s, i) { return { section_id: s[0], label: s[1], order: i + 1, visible: 'yes' }; });
  var STALE_DAYS = 60;

  // ---------- helpers ----------
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function params() {
    var out = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (p) {
      var kv = p.split('=');
      if (kv[0]) out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }
  function store(key, val) {
    try { if (val === undefined) return JSON.parse(localStorage.getItem(key)); localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { return null; }
  }
  function parseDate(s) { // 'YYYY-MM-DD' -> UTC midnight Date
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '').trim());
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function daysBetween(a, b) { return Math.round((b - a) / 864e5); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function fmtDate(s, withDay) {
    var d = parseDate(s); if (!d) return esc(s);
    var t = d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
    return withDay ? WEEKDAYS[d.getUTCDay()] + ', ' + t : t;
  }
  function fmtRange(a, b) {
    var x = parseDate(a), y = parseDate(b); if (!x || !y) return '';
    if (x.getUTCMonth() === y.getUTCMonth() && x.getUTCFullYear() === y.getUTCFullYear())
      return x.getUTCDate() + '–' + y.getUTCDate() + ' ' + MONTHS[y.getUTCMonth()] + ' ' + y.getUTCFullYear();
    return fmtDate(a) + ' – ' + fmtDate(b);
  }
  function todayIn(tz) { // today's date string in the trip's time zone
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz || undefined, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { return iso(new Date()); }
  }
  function nowMinutesIn(tz) {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: tz || undefined, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      var hm = p.split(':'); return (+hm[0]) * 60 + (+hm[1]);
    } catch (e) { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  }
  function minutes(t) { var m = /(\d{1,2}):(\d{2})/.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
  function yes(v) { return /^(yes|y|true|1)$/i.test(String(v || '').trim()); }
  function mapsLink(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }

  // Trust flag for any fact row with verified_on / source_url columns.
  function trust(row, today) {
    if (!row || !('verified_on' in row)) return '';
    var out = '';
    var v = parseDate(row.verified_on);
    if (!v) out += '<span class="flag confirm">Confirm before booking</span>';
    else if (daysBetween(v, parseDate(today)) > STALE_DAYS) out += '<span class="flag stale">Re-check: verified ' + fmtDate(row.verified_on) + '</span>';
    if (row.source_url) out += '<a class="src" href="' + esc(row.source_url) + '" target="_blank" rel="noopener">source</a>';
    return out;
  }

  // ---------- data loading ----------
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  function toObjects(rows) {
    if (!rows.length) return { cols: [], rows: [] };
    var cols = rows[0].map(function (h) { return String(h).trim(); });
    var out = rows.slice(1).filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); })
      .map(function (r) { var o = {}; cols.forEach(function (c, i) { if (c) o[c] = (r[i] || '').trim(); }); return o; });
    return { cols: cols, rows: out };
  }
  function fetchWithTimeout(url, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('no response after ' + (ms / 1000) + 's')); }, ms);
      fetch(url, { cache: 'no-store' }).then(function (r) { clearTimeout(t); resolve(r); }, function (e) { clearTimeout(t); reject(e); });
    });
  }
  function loadSheet(id) {
    return Promise.all(TABS.map(function (tab) {
      var url = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(id) +
        '/gviz/tq?tqx=out:csv&headers=1&sheet=' + encodeURIComponent(tab);
      return fetchWithTimeout(url, 10000).then(function (r) {
        if (!r.ok) throw new Error(tab + ': HTTP ' + r.status);
        return r.text();
      }).then(function (t) {
        if (/^\s*</.test(t)) throw new Error(tab + ': sheet is not shared as "Anyone with the link"');
        return [tab, toObjects(parseCSV(t))];
      });
    })).then(function (pairs) {
      var data = {}; pairs.forEach(function (p) { data[p[0]] = p[1]; }); return data;
    });
  }
  function fromSample(sample) {
    var data = {};
    TABS.forEach(function (t) {
      var rows = sample[t] || [];
      var cols = rows.length ? Object.keys(rows[0]) : (REQUIRED[t] || []);
      data[t] = { cols: cols, rows: rows.map(function (r) { var o = {}; for (var k in r) o[k] = String(r[k] == null ? '' : r[k]); return o; }) };
    });
    return data;
  }

  // ---------- rendering ----------
  function render(data, meta) {
    var trip = {}; (data.Trip.rows || []).forEach(function (r) { trip[r.key] = r.value; });
    var p = params();
    var today = p.today || todayIn(trip.timezone);
    var warnings = [];
    Object.keys(REQUIRED).forEach(function (t) {
      var have = data[t] ? data[t].cols : [];
      var missing = REQUIRED[t].filter(function (c) { return have.indexOf(c) < 0; });
      if (data[t] && data[t].rows.length && missing.length) warnings.push(t + ' tab is missing column(s): ' + missing.join(', '));
    });
    if (trip.accent_colour && /^#[0-9a-f]{6}$/i.test(trip.accent_colour)) document.documentElement.style.setProperty('--accent', trip.accent_colour);
    document.title = (trip.title || 'Trip') + (trip.start_date ? ' · ' + fmtRange(trip.start_date, trip.end_date) : '');

    var ctx = {
      trip: trip, today: today, tz: trip.timezone,
      days: data.Days.rows.slice().sort(function (a, b) { return (+a.day_no) - (+b.day_no); }),
      items: data.Items.rows, places: index(data.Places.rows, 'place_id'), placeList: data.Places.rows,
      bases: data.Bases.rows, basesById: index(data.Bases.rows, 'base_id'),
      bookings: data.Bookings.rows, visas: data.Visas.rows, pack: data.Pack.rows,
      dest: data.Destination.rows, travellers: data.Travellers.rows
    };

    var sections = (data.Sections.rows.length ? data.Sections.rows : DEFAULT_SECTIONS)
      .filter(function (s) { return yes(s.visible); })
      .sort(function (a, b) { return (+a.order) - (+b.order); })
      .filter(function (s) { return RENDER[s.section_id]; });

    var nights = (parseDate(trip.start_date) && parseDate(trip.end_date)) ? daysBetween(parseDate(trip.start_date), parseDate(trip.end_date)) : '';
    var html = '';
    if (meta.banner) html += '<div class="banner ' + meta.banner[0] + '">' + esc(meta.banner[1]) + '</div>';
    warnings.forEach(function (w) { html += '<div class="banner error">' + esc(w) + '</div>'; });
    if (trip.dates_status) html += '<div class="banner warn">Dates: ' + esc(trip.dates_status) + '</div>';
    html += '<section class="hero"><div class="hero-bg"></div><div class="hero-content">' +
      '<div class="eyebrow">A private journey</div>' +
      '<h1 class="hero-title">' + esc(trip.title || 'Trip') + '</h1>' +
      '<p class="hero-subtitle">' + esc(trip.subtitle || '') + '</p><div class="hero-meta">' +
      (trip.start_date ? metaItem('Dates', fmtRange(trip.start_date, trip.end_date)) : '') +
      (nights !== '' ? metaItem('Nights', nights + ' nights') : '') +
      (ctx.travellers.length ? metaItem('Travellers', ctx.travellers.length + (ctx.travellers.length === 1 ? ' person' : ' people')) : '') +
      '</div></div></section>';
    html += '<nav class="nav"><div class="nav-inner">' + sections.map(function (s, i) {
      return '<button class="nav-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + esc(s.section_id) + '">' + esc(s.label) + '</button>';
    }).join('') + '</div></nav>';
    html += sections.map(function (s, i) {
      return '<div class="tab' + (i === 0 ? ' active' : '') + '" id="tab-' + esc(s.section_id) + '"><section class="section">' +
        RENDER[s.section_id](ctx, s.label) + '</section></div>';
    }).join('');
    html += '<footer><div id="offline-badge"></div>' + esc(trip.title || '') + ' · data ' + esc(meta.source) +
      (meta.loadedAt ? ' · ' + esc(meta.loadedAt) : '') + '</footer>';

    document.getElementById('app').innerHTML = html;
    if (currentTab && document.getElementById('tab-' + currentTab)) showTab(currentTab, false);
    updateBadge();
  }
  var currentTab = null;
  function showTab(id, scroll) {
    currentTab = id;
    document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === id); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.id === 'tab-' + id); });
    if (scroll) window.scrollTo({ top: document.querySelector('.nav').offsetTop, behavior: 'smooth' });
  }
  // "Saved for offline" = the site files are held by the service worker AND a copy of the trip data is stored.
  var hasSavedData = false;
  function updateBadge() {
    var el = document.getElementById('offline-badge');
    if (!el) return;
    var sw = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    if (sw && hasSavedData) { el.className = 'badge ok'; el.textContent = '✓ Saved for offline'; }
    else if (sw) { el.className = 'badge ok'; el.textContent = '✓ Site saved for offline'; }
    else { el.className = 'badge'; el.textContent = 'Not saved for offline yet: open once with internet, then reload'; }
  }
  function metaItem(label, value) { return '<div><span class="meta-label">' + esc(label) + '</span><span class="meta-value">' + esc(value) + '</span></div>'; }
  function index(rows, key) { var o = {}; rows.forEach(function (r) { if (r[key]) o[r[key]] = r; }); return o; }
  function head(label, title) { return '<div class="section-label">' + esc(label) + '</div><h2 class="section-title">' + esc(title) + '</h2>'; }

  function onClick(e) {
    var btn = e.target.closest('.nav-btn');
    if (btn) { showTab(btn.dataset.tab, true); return; }
    var dh = e.target.closest('.day-head');
    if (dh) dh.parentNode.classList.toggle('open');
  }
  function onChange(e) {
    if (!e.target.matches('.pack-item input')) return;
    var key = 'pack:' + location.hash;
    var state = store(key) || {};
    state[e.target.dataset.k] = e.target.checked;
    store(key, state);
    e.target.parentNode.classList.toggle('done', e.target.checked);
  }

  // ----- booking urgency (computed, never typed) -----
  function urgency(b, today) {
    var st = String(b.status || '').toLowerCase();
    if (/booked|paid|done|confirmed/.test(st)) return ['Booked', 'u-done', 9999];
    if (/pay on the day|walk-in/.test(st)) return ['On the day', 'u-later', 9000];
    var by = parseDate(b.book_by);
    if (!by) return ['To book', 'u-later', 5000];
    var d = daysBetween(parseDate(today), by);
    if (d < 0) return ['Overdue', 'u-now', d];
    if (d <= 7) return ['Now', 'u-now', d];
    if (d <= 30) return ['Soon', 'u-soon', d];
    return ['By ' + fmtDate(b.book_by), 'u-later', d];
  }
  function openBookings(ctx) {
    return ctx.bookings.map(function (b) { return { b: b, u: urgency(b, ctx.today) }; })
      .filter(function (x) { return x.u[1] !== 'u-done'; })
      .sort(function (a, b) { return a.u[2] - b.u[2]; });
  }
  function bookingRow(x) {
    var b = x.b;
    return '<div class="row"><span class="pill ' + x.u[1] + '">' + esc(x.u[0]) + '</span><div><strong>' + esc(b.name) + '</strong>' +
      (yes(b.cash_only) ? ' <span class="flag confirm">Cash only</span>' : '') +
      (b.notes ? '<div class="item-note">' + esc(b.notes) + '</div>' : '') +
      (b.book_by ? '<div class="item-note">Book by ' + fmtDate(b.book_by) + (b.cancel_by ? ' · free cancellation until ' + fmtDate(b.cancel_by) : '') + '</div>' : '') +
      (b.doc_link ? '<a href="' + esc(b.doc_link) + '" target="_blank" rel="noopener">Confirmation</a>' : '') + '</div></div>';
  }

  // ----- day card -----
  function hecticClass(n) { n = +n; return n >= 7 ? 'h-high' : n >= 5 ? 'h-med' : 'h-low'; }
  function dayCard(ctx, d, open, highlightNext) {
    var base = ctx.basesById[d.base_id];
    var its = ctx.items.filter(function (i) { return String(i.day_no) === String(d.day_no); })
      .sort(function (a, b) { return (minutes(a.time) || 0) - (minutes(b.time) || 0); });
    var nextIdx = -1;
    if (highlightNext) {
      var now = nowMinutesIn(ctx.tz);
      for (var k = 0; k < its.length; k++) { if ((minutes(its[k].time) || 0) >= now) { nextIdx = k; break; } }
    }
    var h = '<div class="day' + (open ? ' open' : '') + '"><div class="day-head"><div>' +
      '<div class="day-no">Day ' + esc(d.day_no) + (base ? ' · ' + esc(base.area || base.name) : '') + '</div>' +
      '<div class="day-title">' + esc(d.title) + '</div><div class="day-date">' + fmtDate(d.date, true) + '</div></div>' +
      (d.hectic_1_10 ? '<span class="hectic ' + hecticClass(d.hectic_1_10) + '">' + esc(d.hectic_1_10) + '/10</span>' : '') +
      '</div><div class="day-body">';
    if (d.temp_hi_c || d.weather_note) {
      h += '<div class="weather"><div><b>' + (d.temp_hi_c ? esc(d.temp_hi_c) + '° / ' + esc(d.temp_lo_c) + '°C' : '') + '</b>' +
        (d.rain_pct ? '<div>Rain ~' + esc(d.rain_pct) + '%</div>' : '') + '</div><div>' + esc(d.weather_note) + '</div></div>';
    }
    if (d.wear) h += '<div class="strip"><div class="strip-label">Wear and carry</div>' + esc(d.wear) + '</div>';
    if (its.length) {
      h += '<div class="timeline">' + its.map(function (it, idx) {
        var place = ctx.places[it.place_id];
        var link = it.maps_url || (place && place.maps_url) || '';
        return '<div class="item' + (idx === nextIdx ? ' next' : '') + '"><div class="item-time">' + esc(it.time) + (idx === nextIdx ? ' · next' : '') + '</div>' +
          '<div class="item-title">' + esc(it.title) + '</div>' +
          (it.note ? '<div class="item-note">' + esc(it.note) + '</div>' : '') +
          (place && place.veg_note ? '<div class="item-note">Veg: ' + esc(place.veg_note) + '</div>' : '') +
          (it.distance_km || it.duration_min ? '<div class="item-note">' + (it.distance_km ? esc(it.distance_km) + ' km' : '') + (it.duration_min ? ' · ' + esc(it.duration_min) + ' min' : '') + '</div>' : '') +
          (it.tip ? '<div class="item-tip">' + esc(it.tip) + '</div>' : '') +
          (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">Directions →</a>' : '') + '</div>';
      }).join('') + '</div>';
    }
    if (d.plan_b) h += '<div class="strip"><div class="strip-label">Plan B (bad weather)</div>' + esc(d.plan_b) + '</div>';
    h += trust(d, ctx.today) ? '<div class="item-note">Weather ' + trust(d, ctx.today) + '</div>' : '';
    return h + '</div></div>';
  }

  // ----- sections -----
  var RENDER = {
    today: function (ctx, label) {
      var start = parseDate(ctx.trip.start_date), end = parseDate(ctx.trip.end_date), t = parseDate(ctx.today);
      var h = head(label, 'Today');
      if (!start || !t) return h + '<div class="empty">Add start_date and end_date to the Trip tab.</div>';
      if (t < start) {
        var n = daysBetween(t, start);
        h += '<div class="card"><div class="big-number">' + n + '</div><div class="card-body">day' + (n === 1 ? '' : 's') + ' until departure, ' + fmtDate(ctx.trip.start_date, true) + '</div></div>';
        var open = openBookings(ctx).slice(0, 4);
        if (open.length) h += '<div class="card"><div class="card-eyebrow">Next to book</div>' + open.map(bookingRow).join('') + '</div>';
        var pendingVisas = ctx.visas.filter(function (v) { return !/approved|issued|done/i.test(v.status || ''); });
        if (pendingVisas.length) h += '<div class="card"><div class="card-eyebrow">Visas</div>' + pendingVisas.map(visaRow(ctx)).join('') + '</div>';
        return h;
      }
      if (end && t > end) return h + '<div class="empty">This trip finished on ' + fmtDate(ctx.trip.end_date) + '.</div>';
      var day = ctx.days.filter(function (d) { return d.date === ctx.today; })[0];
      if (!day) return h + '<div class="empty">No plan entered for ' + fmtDate(ctx.today, true) + '.</div>';
      return h + dayCard(ctx, day, true, !params().today);
    },

    overview: function (ctx, label) {
      var h = head(label, 'Trip at a glance');
      if (ctx.trip.intro) h += '<p class="lead">' + esc(ctx.trip.intro) + '</p>';
      if (ctx.bases.length) {
        h += '<div class="grid">' + ctx.bases.map(function (b, i) {
          return '<div class="card"><div class="card-eyebrow">Base ' + (i + 1) + '</div><div class="card-title">' + esc(b.area || b.name) + '</div>' +
            '<div class="card-body">' + fmtDate(b.check_in) + ' → ' + fmtDate(b.check_out) + '</div></div>';
        }).join('') + '</div>';
      }
      if (ctx.travellers.length) {
        h += '<div class="section-label" style="margin-top:1rem">Travelling together</div><div class="chips">' + ctx.travellers.map(function (p) {
          return '<span class="chip">' + esc(p.first_name) + (p.role ? ' <small>· ' + esc(p.role) + '</small>' : '') + '</span>';
        }).join('') + '</div>';
      }
      return h;
    },

    itinerary: function (ctx, label) {
      var h = head(label, 'Day by day');
      if (!ctx.days.length) return h + '<div class="empty">Days are added once the route is chosen.</div>';
      return h + '<p class="lead">Tap a day to open it.</p>' + ctx.days.map(function (d, i) { return dayCard(ctx, d, i === 0, false); }).join('');
    },

    stays: function (ctx, label) {
      var h = head(label, 'Where you are staying');
      if (!ctx.bases.length) return h + '<div class="empty">Stays appear here once booked.</div>';
      return h + ctx.bases.map(function (b) {
        var q = (b.lat && b.lng) ? b.lat + ',' + b.lng : (b.address || b.name);
        var bk = ctx.bookings.filter(function (x) { return x.booking_id && x.booking_id === b.booking_id; })[0];
        return '<div class="card"><div class="card-eyebrow">' + fmtDate(b.check_in) + ' → ' + fmtDate(b.check_out) +
          (bk ? ' · ' + esc(urgency(bk, ctx.today)[0]) : '') + '</div><div class="card-title">' + esc(b.name) + '</div><div class="card-body">' +
          (b.address ? '<div><strong>Address:</strong> ' + esc(b.address) + '</div>' : '') +
          (b.address_local ? '<div><strong>Show the driver:</strong> ' + esc(b.address_local) + '</div>' : '') +
          (b.payment_note ? '<div><strong>Payment:</strong> ' + esc(b.payment_note) + '</div>' : '') +
          (b.why_here ? '<div><strong>Why here:</strong> ' + esc(b.why_here) + '</div>' : '') +
          '</div><div class="actions"><a class="btn primary" href="' + mapsLink(q) + '" target="_blank" rel="noopener">Open in Maps</a>' +
          (b.phone ? '<a class="btn" href="tel:' + esc(b.phone.replace(/\s/g, '')) + '">Call</a>' : '') + '</div></div>';
      }).join('');
    },

    food: function (ctx, label) {
      var h = head(label, 'Food and drink');
      var food = ctx.placeList.filter(function (p) { return /restaurant|cafe|café|bar|food/i.test(p.kind || ''); });
      var dishes = ctx.dest.filter(function (d) { return d.topic === 'food' || d.topic === 'dish'; });
      var phrases = ctx.dest.filter(function (d) { return d.topic === 'phrase'; });
      if (!food.length && !dishes.length) return h + '<div class="empty">Restaurants appear here once the route is chosen.</div>';
      var areas = {};
      food.forEach(function (p) { (areas[p.area || 'Other'] = areas[p.area || 'Other'] || []).push(p); });
      Object.keys(areas).forEach(function (a) {
        h += '<div class="card"><div class="card-eyebrow">' + esc(a) + '</div>' + areas[a].map(function (p) {
          return '<div class="row"><div><strong>' + esc(p.name) + '</strong>' + trust(p, ctx.today) +
            (p.veg_note ? '<div class="item-note">' + esc(p.veg_note) + '</div>' : '') +
            (p.reserve_note ? '<div class="item-tip">' + esc(p.reserve_note) + '</div>' : '') +
            (p.maps_url ? '<a href="' + esc(p.maps_url) + '" target="_blank" rel="noopener">Map</a>' : '') + '</div></div>';
        }).join('') + '</div>';
      });
      if (dishes.length || phrases.length) h += '<div class="card"><div class="card-eyebrow">Vegetarian survival guide</div>' +
        dishes.concat(phrases).map(destRow(ctx)).join('') + '</div>';
      return h;
    },

    bookings: function (ctx, label) {
      var h = head(label, 'Still to book');
      var open = openBookings(ctx);
      var done = ctx.bookings.filter(function (b) { return urgency(b, ctx.today)[1] === 'u-done'; });
      h += open.length ? '<div class="card">' + open.map(bookingRow).join('') + '</div>' : '<div class="empty">Nothing left to book.</div>';
      if (done.length) h += '<div class="section-label" style="margin-top:1.2rem">Already booked</div><div class="card">' +
        done.map(function (b) { return bookingRow({ b: b, u: urgency(b, ctx.today) }); }).join('') + '</div>';
      return h;
    },

    prepare: function (ctx, label) {
      var h = head(label, 'Before you go');
      h += '<div class="section-label">Visa timeline</div>';
      h += ctx.visas.length ? '<div class="card">' + ctx.visas.map(visaRow(ctx)).join('') + '</div>' : '<div class="empty">No visas needed, or none entered yet.</div>';
      if (ctx.pack.length) {
        var state = store('pack:' + location.hash) || {};
        var cats = {};
        ctx.pack.forEach(function (p, i) { (cats[p.category || 'Other'] = cats[p.category || 'Other'] || []).push([p, i]); });
        h += '<div class="section-label" style="margin-top:1.2rem">Packing list</div><p class="lead">Ticks are saved on this phone only.</p>';
        Object.keys(cats).forEach(function (c) {
          h += '<div class="card"><div class="card-eyebrow">' + esc(c) + '</div>' + cats[c].map(function (x) {
            var k = c + '|' + x[0].item, on = !!state[k];
            return '<label class="pack-item' + (on ? ' done' : '') + '"><input type="checkbox" data-k="' + esc(k) + '"' + (on ? ' checked' : '') + '><span>' +
              esc(x[0].item) + (x[0].who && x[0].who !== 'both' ? ' <small>(' + esc(x[0].who) + ')</small>' : '') + '</span></label>';
          }).join('') + '</div>';
        });
      }
      return h;
    },

    essentials: function (ctx, label) {
      var h = head(label, 'Good to know');
      var rows = ctx.dest.filter(function (d) { return d.topic !== 'food' && d.topic !== 'dish'; });
      if (!rows.length) return h + '<div class="empty">Destination facts appear here.</div>';
      var order = ['emergency', 'practical', 'money', 'visa', 'holiday', 'phrase', 'transport', 'scam', 'etiquette'];
      var groups = {};
      rows.forEach(function (r) { (groups[r.topic || 'other'] = groups[r.topic || 'other'] || []).push(r); });
      Object.keys(groups).sort(function (a, b) {
        var x = order.indexOf(a), y = order.indexOf(b); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
      }).forEach(function (g) {
        h += '<div class="card"><div class="card-eyebrow">' + esc(g) + '</div>' + groups[g].map(destRow(ctx)).join('') + '</div>';
      });
      return h;
    }
  };
  function destRow(ctx) {
    return function (r) {
      return '<div class="row"><div><strong>' + esc(r.key) + ':</strong> ' + esc(r.value) + trust(r, ctx.today) + '</div></div>';
    };
  }
  function visaRow(ctx) {
    return function (v) {
      var by = parseDate(v.apply_by), d = by ? daysBetween(parseDate(ctx.today), by) : null;
      var pill = /approved|issued|done/i.test(v.status || '') ? ['Done', 'u-done'] :
        d == null ? ['Check', 'u-later'] : d < 0 ? ['Late', 'u-now'] : d <= 30 ? [d + ' days', 'u-now'] : d <= 60 ? [d + ' days', 'u-soon'] : [d + ' days', 'u-later'];
      return '<div class="row"><span class="pill ' + pill[1] + '">' + esc(pill[0]) + '</span><div><strong>' + esc(v.first_name) + ' · ' + esc(v.country) + '</strong>' +
        trust(v, ctx.today) + '<div class="item-note">' + esc(v.route) + (v.status ? ' · ' + esc(v.status) : '') + '</div>' +
        (v.apply_by ? '<div class="item-note">Apply by ' + fmtDate(v.apply_by) + (v.processing_days ? ' · processing ' + esc(v.processing_days) : '') + '</div>' : '') +
        (v.fallback ? '<div class="item-tip">Fallback: ' + esc(v.fallback) + '</div>' : '') + '</div></div>';
    };
  }

  // ---------- start ----------
  function stampNow() {
    return new Date().toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function start() {
    var p = params();
    // Opened from the home-screen icon without a trip in the link: reopen the last trip used.
    if (!p.s && !('sample' in p)) {
      var last = store('lastTrip');
      if (last) { location.replace('#s=' + encodeURIComponent(last)); return; }
    }
    if (p.s) {
      store('lastTrip', p.s);
      var cacheKey = 'trip:' + p.s;
      var cached = store(cacheKey);
      // Show the saved copy at once, then refresh from the sheet when the network answers.
      if (cached) {
        hasSavedData = true;
        render(cached.data, { source: 'saved ' + cached.at, banner: ['info', 'Checking for updates…'] });
      }
      loadSheet(p.s).then(function (data) {
        var stamp = stampNow();
        store(cacheKey, { data: data, at: stamp });
        hasSavedData = !!store(cacheKey);
        render(data, { source: 'updated ' + stamp });
      }).catch(function (err) {
        if (cached) render(cached.data, { source: 'saved ' + cached.at, banner: ['warn', 'No connection. Showing the copy saved ' + cached.at + '.'] });
        else document.getElementById('app').innerHTML = '<div class="banner error">Could not load the trip: ' + esc(err.message) +
          '. Open this link once with internet so it can be saved for offline use.</div>';
      });
    } else if (window.SAMPLE_TRIP) {
      render(fromSample(window.SAMPLE_TRIP), { source: 'sample (Montenegro)', banner: ['info', 'Sample trip. Add #s=<sheet id> to the link to load a real trip.'] });
    } else {
      document.getElementById('app').innerHTML = '<div class="banner error">No trip given. Add #s=&lt;sheet id&gt; to the link.</div>';
    }
  }
  var app = document.getElementById('app');
  app.addEventListener('click', onClick);
  app.addEventListener('change', onChange);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* site still works online */ });
    navigator.serviceWorker.addEventListener('controllerchange', updateBadge);
  }
  window.addEventListener('hashchange', function () { location.reload(); });
  start();
})();
