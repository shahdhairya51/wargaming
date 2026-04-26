// ============================================================
// MAP ENGINE — Leaflet initialization, unit markers, animations
// ============================================================

let map, unitMarkers = {}, mapLayers = [];

function initMap() {
  map = L.map('map', { zoomControl: false, attributionControl: false }).setView([23.5, 122.0], 6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB', maxZoom: 10
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  metocLayerGroup = L.layerGroup().addTo(map);
  timeRingsLayerGroup = L.layerGroup().addTo(map);
  attackRadiusLayerGroup = L.layerGroup().addTo(map);
  casualtyLayerGroup = L.layerGroup().addTo(map);

  map.on('click', handleMapClick);

  placeAllUnits();
}

function createUnitIcon(unit) {
  return L.divIcon({
    className: '',
    html: `<div class="unit-icon ${unit.iconClass}" title="${unit.name}">
      <span class="icon-label">${unit.label}</span>
    </div>`,
    iconSize: [40, 40], iconAnchor: [20, 20]
  });
}

function placeAllUnits() {
  const allUnits = [...ORBAT.blue, ...ORBAT.red, ...ORBAT.neutral];
  allUnits.forEach(u => {
    const isBlue = ORBAT.blue.includes(u);
    const isRed = ORBAT.red.includes(u);
    const marker = L.marker([u.lat, u.lng], { icon: createUnitIcon(u), draggable: isBlue, zIndexOffset: isBlue ? 100 : 0 }).addTo(map);
    
    // Improved tactical tooltips
    const sideClass = isRed ? 'unit-tooltip-red' : (isBlue ? '' : 'unit-tooltip-neutral');
    marker.bindTooltip(`<div class="unit-tooltip ${sideClass}"><b>${u.callsign || u.label}</b>${u.name}</div>`, { 
      direction: 'top', offset: [0, -24], className: 'tactical-tooltip-wrapper' 
    });

    if (u.hidden) { marker.getElement().style.opacity = '0'; marker.getElement().style.pointerEvents = 'none'; }
    
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (etaRulerMode) {
        selectEtaUnit(u, marker);
      } else {
        handleUnitClick(u, marker);
      }
    });

    unitMarkers[u.id] = marker;
  });

  // Global map click to deselect
  map.on('click', () => {
    if (!etaRulerMode) deselectUnit();
  });

  // Detail panel close
  if (els.detailClose) {
    els.detailClose.onclick = deselectUnit;
  }
}

let selectedUnit = null;
let selectionCircle = null;

function handleUnitClick(unit, marker) {
  if (selectedUnit && selectedUnit.id === unit.id) {
    deselectUnit();
    return;
  }
  
  deselectUnit();
  selectedUnit = unit;
  
  // Highlight with pulsing ring
  selectionCircle = L.circle(marker.getLatLng(), {
    radius: 50000, color: unit.iconClass.includes('red') ? '#E84C2E' : '#2E8FE8',
    fill: false, weight: 2, className: 'selection-ring'
  }).addTo(map);

  showUnitDetails(unit);
}

function deselectUnit() {
  selectedUnit = null;
  if (selectionCircle) {
    map.removeLayer(selectionCircle);
    selectionCircle = null;
  }
  if (els.unitDetailPanel) els.unitDetailPanel.style.display = 'none';
}

function showUnitDetails(unit) {
  if (!els.unitDetailPanel) return;
  
  els.detailTitle.textContent = unit.callsign || unit.label;
  els.unitDetailPanel.style.display = 'block';
  
  const isRed = ORBAT.red.find(x => x.id === unit.id);
  const color = isRed ? 'var(--accent-red-bright)' : 'var(--accent-blue-bright)';
  els.unitDetailPanel.style.borderColor = color;
  els.detailTitle.style.color = color;

  let html = `
    <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${unit.name}</span></div>
    <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${unit.type.toUpperCase()}</span></div>
    <div class="detail-row"><span class="detail-label">Position</span><span class="detail-value">${unit.lat.toFixed(2)}°N, ${unit.lng.toFixed(2)}°E</span></div>
    <div class="detail-row"><span class="detail-label">Speed</span><span class="detail-value">${unit.speedKts || 0} KTS</span></div>
    <div class="detail-divider"></div>
    <div class="detail-actions">
      <button class="detail-btn" onclick="toggleUnitTimeRings('${unit.id}')">TOGGLE TIME RADIUS</button>
      <button class="detail-btn" onclick="toggleUnitAttackRadius('${unit.id}')">TOGGLE ATTACK RADIUS</button>
      ${unit.type === 'missile' ? `<button class="detail-btn" onclick="toggleThreatRings()">SHOW ENGAGEMENT ENVELOPE</button>` : ''}
    </div>
  `;
  els.detailBody.innerHTML = html;
}

/**
 * FEATURE 2: MULTI-DOMAIN DEBUFFS
 * Calculates range multiplier based on real-time Link-16 status.
 */
function getTacticalMultiplier() {
  const status = els.link16Status ? els.link16Status.textContent : 'OPTIMAL';
  if (status === 'DENIED') return 0.4;
  if (status === 'DEGRADED') return 0.7;
  return 1.0;
}

window.toggleUnitAttackRadius = function(unitId) {
  const u = [...ORBAT.blue, ...ORBAT.red].find(x => x.id === unitId);
  if (!u || !u.attackRangeNm) return;
  
  let existing = null;
  attackRadiusLayerGroup.eachLayer(l => {
    if (l.options && l.options.unitId === unitId) existing = l;
  });

  if (existing) {
    const toRemove = [];
    attackRadiusLayerGroup.eachLayer(l => {
      if (l.options && l.options.unitId === unitId) toRemove.push(l);
    });
    toRemove.forEach(l => attackRadiusLayerGroup.removeLayer(l));
  } else {
    const latlng = unitMarkers[u.id].getLatLng();
    const multiplier = getTacticalMultiplier();
    const range = u.attackRangeNm * multiplier;
    const radiusMeters = range * 1852;
    
    L.circle(latlng, {
      radius: radiusMeters,
      color: u.iconClass.includes('red') ? '#E84C2E' : '#2E8FE8',
      weight: multiplier < 1 ? 2 : 1, 
      dashArray: multiplier < 1 ? '2 10' : '5 5',
      fillOpacity: 0.1,
      interactive: false, unitId: u.id
    }).addTo(attackRadiusLayerGroup);
    
    const msg = multiplier < 1 
      ? `Tactical: Range reduced to ${range.toFixed(0)}NM due to Link-16 ${els.link16Status.textContent}`
      : `Tactical: Attack radius (${u.attackRangeNm}NM) displayed for ${u.label}`;
    addLog(msg, multiplier < 1 ? 'log-red' : 'log-system');
  }
};

/**
 * FEATURE 4: CASUALTY HEATMAP
 * Renders data-driven loss zones based on scenario casualties.
 */
let casualtyLayerGroup = null;
window.toggleCasualtyHeatmap = function() {
  const btn = document.getElementById('casualtyBtn');
  if (casualtyLayerGroup.getLayers().length > 0) {
    casualtyLayerGroup.clearLayers();
    btn.classList.remove('active');
    return;
  }
  
  btn.classList.add('active');
  const casualties = parseInt(els.casValue.textContent) || 0;
  if (casualties === 0) {
    addLog('System: No significant losses recorded yet.', 'log-system');
    return;
  }

  const hotzones = [
    { lat: 25.3, lng: 121.2, weight: 0.8, label: "Quarantine Cordon" },
    { lat: 24.28, lng: 120.53, weight: 0.4, label: "Taichung Terminal" },
    { lat: 30.02, lng: 122.11, weight: 1.2, label: "Zhoushan Strike Zone" }
  ];

  hotzones.forEach(zone => {
    const radius = 40000 + (casualties / 5000) * 100000 * zone.weight;
    L.circle([zone.lat, zone.lng], {
      radius,
      className: 'casualty-heatmap-circle',
      interactive: false
    }).addTo(casualtyLayerGroup);

    L.marker([zone.lat, zone.lng], {
      icon: L.divIcon({
        className: 'heatmap-label',
        html: `<div style="color: #FF4500; font-size: 8px; font-family: 'Share Tech Mono'; white-space: nowrap; text-shadow: 0 0 5px black;">${zone.label}</div>`,
        iconSize: [0, 0]
      })
    }).addTo(casualtyLayerGroup);
  });

  addLog(`Intel: Loss heatmap generated for ${casualties} cumulative casualties.`, 'log-red');
};
window.toggleUnitTimeRings = function(unitId) {
  const u = [...ORBAT.blue, ...ORBAT.red].find(x => x.id === unitId);
  if (!u) return;
  
  // Find if ring already exists
  let existing = null;
  timeRingsLayerGroup.eachLayer(l => {
    if (l.options && l.options.unitId === unitId) existing = l;
  });

  if (existing) {
    // Remove all layers for this unit
    const toRemove = [];
    timeRingsLayerGroup.eachLayer(l => {
      if (l.options && l.options.unitId === unitId) toRemove.push(l);
    });
    toRemove.forEach(l => timeRingsLayerGroup.removeLayer(l));
  } else {
    // Draw rings for this unit
    const latlng = unitMarkers[u.id].getLatLng();
    const speedKts = u.speedKts || 20;
    
    [24, 48].forEach(hrs => {
      const radius = (speedKts * hrs) * 1852;
      L.circle(latlng, {
        radius, color: u.iconClass.includes('red') ? '#FF0032' : '#00FF88',
        weight: hrs === 24 ? 1.5 : 1, dashArray: hrs === 24 ? '4 4' : '2 6',
        fillOpacity: 0.03, interactive: false, unitId: u.id
      }).addTo(timeRingsLayerGroup);
    });
    
    addLog(`Tactical: Time radius displayed for ${u.label}`, 'log-system');
  }
};

function animateMove(unitId, toLat, toLng, duration, callback) {
  const marker = unitMarkers[unitId];
  if (!marker) { if (callback) callback(); return; }
  const start = marker.getLatLng();
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const lat = start.lat + (toLat - start.lat) * eased;
    const lng = start.lng + (toLng - start.lng) * eased;
    marker.setLatLng([lat, lng]);
    if (t < 1) requestAnimationFrame(step);
    else if (callback) callback();
  }
  requestAnimationFrame(step);
}

function revealUnit(unitId, newClass) {
  const marker = unitMarkers[unitId];
  if (!marker) return;
  const el = marker.getElement();
  el.style.transition = 'opacity 2s ease';
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';
  if (newClass) {
    const iconDiv = el.querySelector('.unit-icon');
    if (iconDiv) {
      iconDiv.className = `unit-icon ${newClass}`;
    }
  }
  const legEl = document.getElementById(`leg-${unitId}`);
  if (legEl) legEl.style.display = 'flex';
}

function drawArc(from, to, options, waypoints) {
  const pts = waypoints ? [from, ...waypoints, to] : [from, to];
  const line = L.polyline(pts, options).addTo(map);
  mapLayers.push(line);
  return line;
}

function drawDeterenceArc(center) {
  const pts = [];
  for (let a = -90; a <= 90; a += 10) {
    const r = 3;
    pts.push([center[0] + r * Math.cos(a * Math.PI/180), center[1] - r * Math.sin(a * Math.PI/180)]);
  }
  const arc = L.polyline(pts, { color: '#2E8FE8', weight: 1.5, dashArray: '8 8', opacity: 0.5 }).addTo(map);
  mapLayers.push(arc);
}

function addStrikeBurst(lat, lng) {
  const icon = L.divIcon({
    className: '', html: '<div class="strike-burst"></div>',
    iconSize: [24, 24], iconAnchor: [12, 12]
  });
  const m = L.marker([lat, lng], { icon }).addTo(map);
  mapLayers.push(m);
  setTimeout(() => { map.removeLayer(m); }, 2000);
  // Add persistent impact marker
  const impact = L.divIcon({
    className: '', html: '<div style="width:12px;height:12px;border-radius:50%;background:rgba(232,76,46,0.4);border:1px solid #E84C2E;"></div>',
    iconSize: [12,12], iconAnchor: [6,6]
  });
  const im = L.marker([lat, lng], { icon: impact }).addTo(map);
  mapLayers.push(im);
}

function drawGuamThreatArc() {
  const arc = L.polyline(
    [[26.64, 118.17], [20.0, 130.0], [13.58, 144.93]],
    { color: '#E84C2E', weight: 2, opacity: 0.8, dashArray: '8, 6' }
  ).addTo(map);
  mapLayers.push(arc);

  const rangeLabel = L.marker([20.0, 132.0], {
    icon: L.divIcon({
      html: '<div class="range-label">DF-26 RANGE: ~2,800km<br>ANDERSEN AFB THREATENED</div>',
      className: '', iconSize: [180, 36], iconAnchor: [90, 18]
    })
  }).addTo(map);
  mapLayers.push(rangeLabel);
}

function drawHumanitarianCorridor() {
  const corridor = L.polyline(
    [[23.0, 122.0], [24.0, 121.8], [25.13, 121.74]],
    { color: '#2E8FE8', weight: 3, dashArray: '12 6', opacity: 0.6 }
  ).addTo(map);
  mapLayers.push(corridor);

  const label = L.marker([24.0, 121.5], {
    icon: L.divIcon({
      html: '<div style="background:rgba(26,110,191,0.2);border:1px solid #1A6EBF;color:#2E8FE8;font-family:DM Mono,monospace;font-size:8px;padding:3px 6px;letter-spacing:0.08em;text-align:center;">HUMANITARIAN<br>CORRIDOR</div>',
      className: '', iconSize: [80, 28], iconAnchor: [40, 14]
    })
  }).addTo(map);
  mapLayers.push(label);
}

function drawStrikeArc(from, to, callback) {
  const pts = [from, [(from[0]+to[0])/2 + 3, (from[1]+to[1])/2], to];
  const line = L.polyline([], { color: '#E84C2E', weight: 2, dashArray: '10 6', opacity: 0.9 }).addTo(map);
  mapLayers.push(line);
  const totalPts = 30;
  let i = 0;
  const iv = setInterval(() => {
    i++;
    const t = i / totalPts;
    // Quadratic bezier
    const lat = (1-t)*(1-t)*pts[0][0] + 2*(1-t)*t*pts[1][0] + t*t*pts[2][0];
    const lng = (1-t)*(1-t)*pts[0][1] + 2*(1-t)*t*pts[1][1] + t*t*pts[2][1];
    line.addLatLng([lat, lng]);
    if (i >= totalPts) { clearInterval(iv); if (callback) callback(); }
  }, 66);
  return line;
}

// ── THREAT RINGS & COP FILTERS ──
let threatRings = [];
let ringsVisible = false;

function toggleThreatRings() {
  ringsVisible = !ringsVisible;
  const btn = document.getElementById('threatRangesBtn');
  if (ringsVisible) {
    if (btn) btn.classList.add('active');
    const u21 = ORBAT.red.find(u => u.id === 'R-07');
    if (u21) {
      const ring21 = L.circle([u21.lat, u21.lng], { radius: 1500000, className: 'threat-ring-red' }).addTo(map);
      threatRings.push(ring21);
    }
    const u26 = ORBAT.red.find(u => u.id === 'R-08');
    const m26 = unitMarkers['R-08'];
    if (u26 && m26 && m26.getElement().style.opacity !== '0') {
      const ring26 = L.circle([u26.lat, u26.lng], { radius: 2800000, className: 'threat-ring-red' }).addTo(map);
      threatRings.push(ring26);
    }
    const cvn = ORBAT.blue.find(u => u.id === 'B-01');
    if (cvn) {
      const mCvn = unitMarkers['B-01'];
      const latlng = mCvn ? mCvn.getLatLng() : [cvn.lat, cvn.lng];
      const ringCvn = L.circle(latlng, { radius: 500000, className: 'threat-ring-blue' }).addTo(map);
      threatRings.push(ringCvn);
    }
  } else {
    if (btn) btn.classList.remove('active');
    threatRings.forEach(r => map.removeLayer(r));
    threatRings = [];
  }
}

function applyCopFilter(filter) {
  const domains = {
    air: ['aircraft', 'bomber'],
    sea: ['carrier', 'cruiser', 'destroyer', 'submarine', 'coastguard', 'militia', 'merchant', 'allied'],
    land: ['airbase', 'missile', 'infrastructure']
  };

  Object.keys(unitMarkers).forEach(id => {
    const u = [...ORBAT.blue, ...ORBAT.red, ...ORBAT.neutral].find(x => x.id === id);
    if (!u) return;

    const el = unitMarkers[id].getElement();
    // Don't unhide fog-of-war hidden units
    if (el.style.opacity === '0') return;

    if (filter === 'all' || (domains[filter] && domains[filter].includes(u.type))) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}

let metocVisible = false;
let metocLayerGroup = null;

function toggleMetoc() {
  metocVisible = !metocVisible;
  const btn = document.getElementById('metocBtn');
  const legend = document.getElementById('metocLegend');
  if (metocVisible) {
    if (btn) btn.classList.add('active');
    if (legend) legend.style.display = 'block';
    renderMetocData(window.currentMove || 0);
  } else {
    if (btn) btn.classList.remove('active');
    if (legend) legend.style.display = 'none';
    metocLayerGroup.clearLayers();
  }
}

function renderMetocData(moveNum) {
  metocLayerGroup.clearLayers();
  if (!metocVisible) return;

  // ── REGIONAL WEATHER ZONES ──────────────────────────────
  // Instead of one massive base circle, paint discrete weather
  // zones across the theater with realistic size and intensity.
  // Each zone: [lat, lng, radiusKm, fillColor, fillOpacity, label]
  const M = moveNum || 0;

  // Scale factors: weather intensifies as typhoon approaches
  const scl = M === 0 ? 0.6 : M === 1 ? 0.8 : M === 2 ? 1.0 : 1.2;

  const zones = [
    // South China Sea — persistent swell
    [15.0, 114.0, 420 * scl, '#0096FF', 0.08],
    // Philippine Sea background — elevated as typhoon forms
    [14.0, 130.0, 500 * scl, '#00AAFF', 0.09 + M * 0.02],
    // East China Sea — moderate seas
    [28.0, 124.0, 350 * scl, '#0096FF', 0.07],
    // Western Pacific — roughening seas
    [22.0, 130.0, 380 * scl, '#0096FF', 0.08],
  ];

  zones.forEach(([lat, lng, radiusKm, color, opacity]) => {
    L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: 'none', fillColor: color,
      fillOpacity: Math.min(opacity, 0.18),
      interactive: false
    }).addTo(metocLayerGroup);
  });

  // ── TYPHOON SYSTEM ──────────────────────────────────────
  // Three concentric bands: Gale (green) → Severe (orange) → Eye Wall (red)
  // Position and size grow with move number
  let tCenter = null;
  let tSizes = null;

  if (M === 1) {
    tCenter = [16.0, 132.0];
    tSizes  = { gale: 380000, storm: 200000, eye: 70000 };
  } else if (M === 2) {
    tCenter = [19.0, 128.0];
    tSizes  = { gale: 520000, storm: 300000, eye: 110000 };
  } else if (M >= 3) {
    tCenter = [22.5, 123.5];
    tSizes  = { gale: 700000, storm: 420000, eye: 160000 };
  }

  if (tCenter && tSizes) {
    // Outermost: Gale Force 30-40 kts (green)
    L.circle(tCenter, {
      radius: tSizes.gale,
      color: 'rgba(0,255,100,0.3)', weight: 1,
      fillColor: '#00FF64', fillOpacity: 0.12,
      interactive: false
    }).addTo(metocLayerGroup);

    // Middle: Severe Storm 50-60 kts (orange)
    L.circle(tCenter, {
      radius: tSizes.storm,
      color: 'rgba(255,150,0,0.4)', weight: 1.5,
      fillColor: '#FF9600', fillOpacity: 0.20,
      interactive: false
    }).addTo(metocLayerGroup);

    // Core: Typhoon / Eye Wall 80+ kts (red-magenta)
    L.circle(tCenter, {
      radius: tSizes.eye,
      color: 'rgba(255,0,50,0.6)', weight: 2,
      fillColor: '#FF0032', fillOpacity: 0.30,
      interactive: false
    }).addTo(metocLayerGroup);

    // Eye of storm (calm inside — dark center)
    L.circle(tCenter, {
      radius: tSizes.eye * 0.15,
      color: 'rgba(255,0,50,0.8)', weight: 1,
      fillColor: '#1a0008', fillOpacity: 0.6,
      interactive: false
    }).addTo(metocLayerGroup);

    // ── TYPHOON LABEL ──────────────────────────────────────
    const wsSummary = M === 1 ? '95 KTS / CAT-2' : M === 2 ? '115 KTS / CAT-3' : '140 KTS / CAT-4';
    const ssLabel   = M === 1 ? 'SS 4' : M === 2 ? 'SS 5' : 'SS 6';
    const typLabel = L.divIcon({
      className: '',
      html: `<div style="font-family:'Share Tech Mono',monospace;font-size:9px;color:#FF6060;background:rgba(0,0,0,0.75);padding:2px 6px;border:1px solid rgba(255,0,50,0.6);white-space:nowrap;text-align:center;">
        <b>TYPHOON</b><br>${wsSummary}<br>${ssLabel} / ACTIVE
      </div>`,
      iconSize: null, iconAnchor: [0, 36]
    });
    L.marker(tCenter, { icon: typLabel, interactive: false, zIndexOffset: 600 })
      .addTo(metocLayerGroup);
  }
}

function renderWeather(moveNum) {
  // Always update metoc if visible (handles typhoon moving with moves)
  if (metocVisible) renderMetocData(moveNum);
}

// ============================================================
// TIME & TRANSIT TOOLS
// ============================================================

let timeRingsLayerGroup = null;
let timeRingsVisible = false;

let etaRulerMode = false;
let etaState = { unitData: null, marker: null, lines: [] };

function toggleTimeRings() {
  timeRingsVisible = !timeRingsVisible;
  const btn = document.getElementById('timeRingsBtn');
  if (timeRingsVisible) {
    if (btn) btn.classList.add('active');
    renderTimeRings();
  } else {
    if (btn) btn.classList.remove('active');
    timeRingsLayerGroup.clearLayers();
  }
}

function renderTimeRings() {
  timeRingsLayerGroup.clearLayers();
  if (!timeRingsVisible) return;

  const allUnits = [...ORBAT.red];
  allUnits.forEach(u => {
    // Only draw for significant units like carriers and subs
    if (u.type === 'carrier' || u.type === 'submarine') {
      const marker = unitMarkers[u.id];
      if (!marker) return;
      const latlng = marker.getLatLng();
      const speedKts = u.speedKts || 20;
      const radius24h = (speedKts * 24) * 1852;  // meters
      const radius48h = (speedKts * 48) * 1852;

      // Draw 24hr radius (inner)
      L.circle(latlng, {
        radius: radius24h,
        color: '#FF0032', weight: 1.5, dashArray: '4 4', fillOpacity: 0.05, interactive: false
      }).addTo(timeRingsLayerGroup);

      // Draw 48hr radius (outer)
      L.circle(latlng, {
        radius: radius48h,
        color: '#FF0032', weight: 1, dashArray: '2 6', fillOpacity: 0.02, interactive: false
      }).addTo(timeRingsLayerGroup);

      // Labels: place at NORTH edge of inner ring to avoid east-side overlap
      const nm24 = Math.round(speedKts * 24);
      const nm48 = Math.round(speedKts * 48);
      // North offset in degrees lat (~1 deg = 60 NM)
      const degOffset24 = radius24h / 1852 / 60;
      const degOffset48 = radius48h / 1852 / 60;
      const label24Lat = latlng.lat + degOffset24;
      const label48Lat = latlng.lat + degOffset48;

      const makeLabel = (text) => L.divIcon({
        className: '',
        html: `<div style="font-family:'Share Tech Mono',monospace;font-size:8px;color:#FF6060;background:rgba(0,0,0,0.7);padding:1px 5px;border:1px solid rgba(255,0,50,0.5);white-space:nowrap;">${text}</div>`,
        iconSize: null, iconAnchor: [0, 8]
      });

      const shortName = u.name.split(' ')[0] + (u.name.includes('Shandong') ? ' (CV-17)' : u.name.includes('Fujian') ? ' (CV-18)' : u.name.includes('SSN') ? ' (SSN)' : '');
      L.marker([label24Lat, latlng.lng], { icon: makeLabel(`${shortName}: +24H (${nm24}NM)`), interactive: false, zIndexOffset: 700 })
        .addTo(timeRingsLayerGroup);
      L.marker([label48Lat, latlng.lng], { icon: makeLabel(`${shortName}: +48H (${nm48}NM)`), interactive: false, zIndexOffset: 700 })
        .addTo(timeRingsLayerGroup);
    }
  });
}

function toggleEtaRuler() {
  etaRulerMode = !etaRulerMode;
  const btn = document.getElementById('etaRulerBtn');
  if (etaRulerMode) {
    if (btn) btn.classList.add('active');
    map.getContainer().style.cursor = 'crosshair';
  } else {
    if (btn) btn.classList.remove('active');
    map.getContainer().style.cursor = '';
    clearEtaState();
  }
}

function selectEtaUnit(unitData, marker) {
  if (etaState.marker) {
    etaState.marker.getElement().classList.remove('pulse-highlight');
  }
  etaState.unitData = unitData;
  etaState.marker = marker;
  etaState.marker.getElement().classList.add('pulse-highlight');
}

function clearEtaState() {
  if (etaState.marker) {
    etaState.marker.getElement().classList.remove('pulse-highlight');
  }
  etaState.unitData = null;
  etaState.marker = null;
  etaState.lines.forEach(l => map.removeLayer(l));
  etaState.lines = [];
}

function handleMapClick(e) {
  if (!etaRulerMode || !etaState.unitData || !etaState.marker) return;

  const startLatLng = etaState.marker.getLatLng();
  const endLatLng = e.latlng;
  const distanceMeters = startLatLng.distanceTo(endLatLng);
  const distanceNM = distanceMeters / 1852;
  
  const speed = etaState.unitData.speedKts || 1;
  const timeHrs = distanceNM / speed;

  const line = L.polyline([startLatLng, endLatLng], {
    color: '#00FF88', weight: 2, dashArray: '5 5'
  }).addTo(map);

  const tooltipHtml = `
    <div style="font-family:'Share Tech Mono',monospace; font-size:10px; color:#00FF88; background:rgba(0,20,8,0.9); padding:4px; border:1px solid #00FF88;">
      <b>ETA CALCULATION</b><br>
      DIST: ${Math.round(distanceNM)} NM<br>
      SPD: ${speed} KTS<br>
      ETA: ${timeHrs.toFixed(1)} HRS
    </div>
  `;

  line.bindTooltip(tooltipHtml, { permanent: true, direction: 'center', className: 'transparent-tooltip' }).openTooltip();
  
  etaState.lines.push(line);
}
