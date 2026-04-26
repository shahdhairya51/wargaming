// ============================================================
// GAME ENGINE — Moves, typewriter, dragging, rollback, custom units
// ============================================================

let currentMove = 0, isAnimating = false, moveStates = {}, movedUnits = [], customMarkers = [];
let placingUnit = false, selectedSide = 'blue';

const els = {};
function cacheDom() {
  ['turnCounter','clockDisplay','moveBtn1','moveBtn2','moveBtn3','aarBtn',
   'lrasmBar','lrasmValue','sm6Bar','sm6Value','mk48Bar','mk48Value',
   'link16Status','cyberStatus','radarStatus',
   'lngBar','lngValue','coalBar','coalValue','oilBar','oilValue',
   'casBar','casValue','japanValue',
   'df21Status','df26Status','whiteCellPanel','redTeamPanel',
   'commanderOrderPanel','escalationFill','escLevel','escLabel',
   'gdeltStrip','mainContent','aarModal','aarContent','aarCloseBtn','aarDownloadBtn',
   'demoModeBtn','turnLog','threatOverlay','wcIcon','rtIcon',
   'endMoveBtn','rollbackBtn','diplomacySection','diplomacyToggle',
   'addUnitBtn','undoDragBtn','customUnitModal','customUnitCode',
   'customUnitDesc','customUnitCancel','customUnitPlace',
   'legendToggle','legendBody',
   'burnRateBtn','burnRateModal','closeBurnRateBtn',
   'metocBtn','etaRulerBtn','timeRingsBtn',
   'crisisPanel','crisisDiploBtn','crisisPressureBtn',
   'unitDetailPanel','detailTitle','detailBody','detailClose'
  ].forEach(id => { els[id] = document.getElementById(id); });
}

// ── TYPEWRITER ──
function typewriter(text, container, delay, speed, onComplete) {
  container.innerHTML = '';
  const thinkEl = document.createElement('div');
  thinkEl.className = 'thinking-indicator';
  thinkEl.innerHTML = '<span class="cursor-blink"></span> PROCESSING...';
  container.appendChild(thinkEl);
  setTimeout(() => {
    thinkEl.remove();
    const pre = document.createElement('pre');
    pre.className = 'streamed-text';
    container.appendChild(pre);
    let i = 0;
    const iv = setInterval(() => {
      pre.textContent = text.slice(0, i);
      container.scrollTop = container.scrollHeight;
      i++;
      if (i > text.length) { clearInterval(iv); if (onComplete) onComplete(); }
    }, speed);
  }, delay);
}

// ── ESCALATION ──
function updateEscalation(level, label) {
  const pct = (level / 10) * 100;
  const fill = els.escalationFill;
  fill.style.width = pct + '%';
  fill.className = 'escalation-fill';
  if (level <= 3) fill.classList.add('esc-0-3');
  else if (level <= 6) fill.classList.add('esc-4-6');
  else if (level <= 8) fill.classList.add('esc-7-8');
  else fill.classList.add('esc-9-10');
  els.escLevel.textContent = level;
  els.escLabel.textContent = label || '';
}

// ── RESOURCES ──
function updateResources(res) {
  if (res.domains !== undefined) {
    if (res.domains.link16) {
      els.link16Status.textContent = res.domains.link16;
      els.link16Status.style.color = res.domains.link16 === 'OPTIMAL' ? '#00FF88' : (res.domains.link16 === 'DEGRADED' ? '#E89B20' : '#E84C2E');
    }
    if (res.domains.cyber) {
      els.cyberStatus.textContent = res.domains.cyber;
      els.cyberStatus.style.color = res.domains.cyber === '100%' ? '#00FF88' : (res.domains.cyber === 'BLACKOUT' ? '#E84C2E' : '#E89B20');
    }
    if (res.domains.radar) {
      els.radarStatus.textContent = res.domains.radar;
      els.radarStatus.style.color = res.domains.radar === 'ACTIVE' ? '#00FF88' : '#E84C2E';
    }
  }
  if (res.lrasm !== undefined) {
    els.lrasmBar.style.width = (res.lrasm/450)*100 + '%';
    els.lrasmValue.textContent = res.lrasm;
    if (res.lrasm < 200) els.lrasmBar.style.background = 'linear-gradient(90deg, #C23B22, #E84C2E)';
  }
  if (res.sm6 !== undefined) {
    els.sm6Bar.style.width = (res.sm6/1500)*100 + '%';
    els.sm6Value.textContent = res.sm6;
    if (res.sm6 < 1200) els.sm6Bar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)';
  }
  if (res.mk48 !== undefined) {
    els.mk48Bar.style.width = res.mk48;
    els.mk48Value.textContent = res.mk48;
    if (parseInt(res.mk48) < 80) els.mk48Bar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)';
  }
  
  if (res.lng !== undefined) {
    if (res.lng === "STABLE") {
      els.lngValue.textContent = 'STABLE'; els.lngBar.style.width = '50%';
      els.lngBar.style.background = 'linear-gradient(90deg, #1A7A4A, #2A9B5F)';
      els.lngValue.classList.remove('resource-critical');
    } else {
      els.lngBar.style.width = (res.lng/11)*100 + '%';
      els.lngValue.textContent = res.lng + ' days';
      if (res.lng <= 3) { els.lngBar.style.background = 'linear-gradient(90deg, #C23B22, #E84C2E)'; els.lngValue.classList.add('resource-critical'); }
      else if (res.lng <= 6) { els.lngBar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)'; els.lngValue.classList.remove('resource-critical'); }
      else { els.lngBar.style.background = 'linear-gradient(90deg, #C23B22, #E84C2E)'; els.lngValue.classList.remove('resource-critical'); }
    }
  }
  if (res.coal !== undefined) {
    els.coalBar.style.width = (res.coal/41)*100 + '%';
    els.coalValue.textContent = res.coal + ' days';
    if (res.coal <= 14) { els.coalBar.style.background = 'linear-gradient(90deg, #C23B22, #E84C2E)'; }
    else if (res.coal <= 28) { els.coalBar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)'; }
    else { els.coalBar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)'; }
  }
  if (res.oil !== undefined) {
    els.oilBar.style.width = (res.oil/146)*100 + '%';
    els.oilValue.textContent = res.oil + ' days';
    if (res.oil <= 60) { els.oilBar.style.background = 'linear-gradient(90deg, #BA7517, #E89B20)'; }
    else { els.oilBar.style.background = 'linear-gradient(90deg, #1A7A4A, #2A9B5F)'; }
  }
  if (res.casualties !== undefined) {
    els.casValue.textContent = res.casualties.toLocaleString();
    els.casBar.style.width = Math.min((res.casualties/10000)*100, 100) + '%';
  }
  if (res.japan) {
    els.japanValue.textContent = res.japan;
    els.japanValue.className = 'resource-value japan-status japan-' + res.japan.toLowerCase().replace(' ','');
  }
  if (res.df21) { els.df21Status.textContent = res.df21; els.df21Status.className = 'threat-status ' + res.df21.toLowerCase().replace('-',''); }
  if (res.df26) { els.df26Status.textContent = res.df26; els.df26Status.className = 'threat-status ' + res.df26.toLowerCase().replace('-',''); }
}

function addLog(text, cls) {
  const e = document.createElement('div');
  e.className = 'log-entry ' + (cls||'log-system');
  e.textContent = text;
  els.turnLog.appendChild(e);
  els.turnLog.scrollTop = els.turnLog.scrollHeight;
}

// ── STATE SNAPSHOTS (for rollback) ──
function saveState(moveNum) {
  const positions = {};
  Object.keys(unitMarkers).forEach(id => {
    const ll = unitMarkers[id].getLatLng();
    positions[id] = { lat: ll.lat, lng: ll.lng };
  });
  moveStates[moveNum] = {
    positions,
    escalation: { level: parseInt(els.escLevel.textContent), label: els.escLabel.textContent },
    resources: {
      lrasmW: els.lrasmBar.style.width, lrasmV: els.lrasmValue.textContent, lrasmBg: els.lrasmBar.style.background,
      sm6W: els.sm6Bar.style.width, sm6V: els.sm6Value.textContent, sm6Bg: els.sm6Bar.style.background,
      mk48W: els.mk48Bar.style.width, mk48V: els.mk48Value.textContent, mk48Bg: els.mk48Bar.style.background,
      lngW: els.lngBar.style.width, lngV: els.lngValue.textContent, lngBg: els.lngBar.style.background,
      coalW: els.coalBar.style.width, coalV: els.coalValue.textContent, coalBg: els.coalBar.style.background,
      oilW: els.oilBar.style.width, oilV: els.oilValue.textContent, oilBg: els.oilBar.style.background,
      cas: els.casValue.textContent, casW: els.casBar.style.width,
      japan: els.japanValue.textContent, df21: els.df21Status.textContent, df26: els.df26Status.textContent,
      link16: els.link16Status.textContent, link16C: els.link16Status.style.color,
      cyber: els.cyberStatus.textContent, cyberC: els.cyberStatus.style.color,
      radar: els.radarStatus.textContent, radarC: els.radarStatus.style.color
    },
    wcHTML: els.whiteCellPanel.innerHTML,
    rtHTML: els.redTeamPanel.innerHTML,
    coHTML: els.commanderOrderPanel.innerHTML
  };
}

function rollbackState(moveNum) {
  const s = moveStates[moveNum];
  if (!s) return;
  // Restore positions
  Object.keys(s.positions).forEach(id => {
    if (unitMarkers[id]) unitMarkers[id].setLatLng([s.positions[id].lat, s.positions[id].lng]);
  });
  // Restore UI
  updateEscalation(s.escalation.level, s.escalation.label);
  els.lrasmBar.style.width = s.resources.lrasmW; els.lrasmValue.textContent = s.resources.lrasmV; els.lrasmBar.style.background = s.resources.lrasmBg;
  els.sm6Bar.style.width = s.resources.sm6W; els.sm6Value.textContent = s.resources.sm6V; els.sm6Bar.style.background = s.resources.sm6Bg;
  els.mk48Bar.style.width = s.resources.mk48W; els.mk48Value.textContent = s.resources.mk48V; els.mk48Bar.style.background = s.resources.mk48Bg;
  els.lngBar.style.width = s.resources.lngW; els.lngValue.textContent = s.resources.lngV;
  els.lngBar.style.background = s.resources.lngBg;
  els.coalBar.style.width = s.resources.coalW; els.coalValue.textContent = s.resources.coalV;
  els.coalBar.style.background = s.resources.coalBg;
  els.oilBar.style.width = s.resources.oilW; els.oilValue.textContent = s.resources.oilV;
  els.oilBar.style.background = s.resources.oilBg;
  els.casValue.textContent = s.resources.cas; els.casBar.style.width = s.resources.casW;
  els.japanValue.textContent = s.resources.japan;
  els.df21Status.textContent = s.resources.df21;
  els.df26Status.textContent = s.resources.df26;
  els.link16Status.textContent = s.resources.link16; els.link16Status.style.color = s.resources.link16C;
  els.cyberStatus.textContent = s.resources.cyber; els.cyberStatus.style.color = s.resources.cyberC;
  els.radarStatus.textContent = s.resources.radar; els.radarStatus.style.color = s.resources.radarC;
  els.whiteCellPanel.innerHTML = s.wcHTML;
  els.redTeamPanel.innerHTML = s.rtHTML;
  els.commanderOrderPanel.innerHTML = s.coHTML;
  // Remove map layers added during the move
  mapLayers.forEach(l => { try { map.removeLayer(l); } catch(e){} });
  mapLayers = [];
  // Re-hide units that should be hidden at this move
  if (moveNum < 2) {
    const r09 = unitMarkers['R-09'];
    if (r09) { r09.getElement().style.opacity = '0'; r09.getElement().style.pointerEvents = 'none'; }
    const leg09 = document.getElementById('leg-R-09');
    if (leg09) leg09.style.display = 'none';
  }
  if (moveNum < 3) {
    const r08 = unitMarkers['R-08'];
    if (r08) { r08.getElement().style.opacity = '0'; r08.getElement().style.pointerEvents = 'none'; }
    const leg08 = document.getElementById('leg-R-08');
    if (leg08) leg08.style.display = 'none';
  }
}

// ── COMMANDER ORDER AUTO-UPDATE ──
function updateCommanderOrder() {
  if (movedUnits.length === 0) {
    els.commanderOrderPanel.innerHTML = '<div class="panel-placeholder">Deploy forces on map or execute auto-move...</div>';
    return;
  }
  let lines = movedUnits.map(u => {
    const ll = unitMarkers[u.id].getLatLng();
    return `\u25B8 ${u.name} \u2192 ${ll.lat.toFixed(1)}\u00B0N, ${ll.lng.toFixed(1)}\u00B0E`;
  });
  els.commanderOrderPanel.textContent = "Commander INDOPACOM repositioned:\n" + lines.join("\n");
}

// ── MAKE BLUE UNITS DRAGGABLE ──
function enableBlueDragging() {
  ORBAT.blue.forEach(u => {
    const marker = unitMarkers[u.id];
    if (!marker || u.type === 'airbase') return;
    marker.dragging.enable();
    marker.on('dragstart', () => {
      // Auto-start the next move if none active
      if (currentMove === 0 || (!isAnimating && els['moveBtn' + (currentMove + 1)] && !els['moveBtn' + (currentMove + 1)].disabled)) {
        if (currentMove === 0) {
          currentMove = 1;
          saveState(1);
          els.turnCounter.textContent = 'MOVE 1 OF 3';
          els.clockDisplay.textContent = '15 APR 2026 — 0600Z (D+0)';
          els.moveBtn1.classList.add('active');
          addLog('M1: Manual positioning', 'log-blue');
        }
      }
      if (!movedUnits.find(m => m.id === u.id)) movedUnits.push(u);
      els.endMoveBtn.style.display = 'block';
      els.undoDragBtn.style.display = 'block';
    });
    marker.on('dragend', () => { updateCommanderOrder(); });
  });
}

function disableBlueDragging() {
  ORBAT.blue.forEach(u => {
    const marker = unitMarkers[u.id];
    if (marker && marker.dragging) marker.dragging.disable();
  });
}

// ── MOVE EXECUTION ──
function executeMove(moveNum, isAutoPlay) {
  if (isAnimating) return;
  if (moveNum <= currentMove && currentMove > 0) return; // Don't replay completed moves
  isAnimating = true;
  currentMove = moveNum;
  saveState(moveNum);
  movedUnits = [];

  if (typeof renderWeather === 'function') renderWeather(moveNum);

  els.turnCounter.textContent = `MOVE ${moveNum} OF 3`;
  const MOVE_TIMESTAMPS = {
    1: '15 APR 2026 — 0600Z (D+0)',
    2: '16 APR 2026 — 0340Z (D+1)',
    3: '17 APR 2026 — 0215Z (D+2)'
  };
  els.clockDisplay.textContent = MOVE_TIMESTAMPS[moveNum] || `15 APR 2026 — D+${moveNum - 1}`;

  for (let i = 1; i <= 3; i++) {
    const btn = els['moveBtn' + i];
    btn.classList.remove('active', 'completed');
    if (i < moveNum) btn.classList.add('completed');
    else if (i === moveNum) btn.classList.add('active');
    btn.disabled = (i > moveNum);
  }

  els.diplomacySection.style.display = (moveNum === 3) ? 'block' : 'none';
  els.rollbackBtn.style.display = 'none';

  if (isAutoPlay) {
    disableBlueDragging();
    const move = MOVES[moveNum];
    els.commanderOrderPanel.textContent = move.playerMove;
    addLog(`M${moveNum}: ${move.title} [AUTO]`, 'log-blue');
    runMapAnimations(moveNum, () => { streamAdjudication(moveNum, move); });
  } else {
    enableBlueDragging();
    els.endMoveBtn.style.display = 'block';
    els.commanderOrderPanel.innerHTML = '<div class="panel-placeholder">Drag Blue units to desired positions, then click END MOVE...</div>';
    addLog(`M${moveNum}: Manual positioning`, 'log-blue');
    isAnimating = false;
  }
}

function endManualMove() {
  // Auto-determine move if not set
  if (currentMove === 0) currentMove = 1;
  if (isAnimating) return;
  isAnimating = true;
  disableBlueDragging();
  els.endMoveBtn.style.display = 'none';
  els.undoDragBtn.style.display = 'none';

  const moveNum = currentMove;
  let move;

  if (moveNum === 3) {
    const useDiplomacy = els.diplomacyToggle && els.diplomacyToggle.checked;
    move = useDiplomacy ? MOVES[3] : MOVE3_BAD;
    addLog(`M3: ${move.title} [${useDiplomacy ? 'DIPLOMACY' : 'NO DIPLOMACY'}]`, useDiplomacy ? 'log-blue' : 'log-red');
  } else {
    move = MOVES[moveNum];
    addLog(`M${moveNum}: ${move.title}`, 'log-blue');
  }

  // If manual and commander order wasn't set by auto, use generated text
  if (movedUnits.length > 0) updateCommanderOrder();
  else els.commanderOrderPanel.textContent = move.playerMove;

  runMapAnimations(moveNum, () => { streamAdjudication(moveNum, move); });
}

function streamAdjudication(moveNum, move) {
  els.wcIcon.classList.add('pulse-icon');
  typewriter(move.whiteCell, els.whiteCellPanel, 400, 8, () => {
    els.wcIcon.classList.remove('pulse-icon');
    addLog(`WC: Adjudication complete`, 'log-amber');
    setTimeout(() => {
      els.rtIcon.classList.add('pulse-icon');
      typewriter(move.redTeam, els.redTeamPanel, 300, 8, () => {
        els.rtIcon.classList.remove('pulse-icon');
        addLog(`RT: Response complete`, 'log-red');
        updateResources(move.resources);

        if (moveNum === 3 && move.escPeak) {
          // Animate up to peak — then PAUSE and show Crisis Decision Panel
          updateEscalation(move.escPeak, 'WAR THRESHOLD');
          addLog(`⚠ CRISIS THRESHOLD: Escalation at ${move.escPeak}/10 — Decision required`, 'log-red');
          setTimeout(() => { showCrisisPanel(move); }, 1200);
        } else {
          updateEscalation(move.escEnd, move.escLabel);
          finalizeMove(moveNum);
        }
      });
    }, 400);
  });
}

function finalizeMove(moveNum) {
  isAnimating = false;
  disableBlueDragging();
  els.endMoveBtn.style.display = 'none';
  els.rollbackBtn.style.display = 'block';
  els['moveBtn' + moveNum].classList.remove('active');
  els['moveBtn' + moveNum].classList.add('completed');

  if (moveNum < 3) els['moveBtn' + (moveNum + 1)].disabled = false;
  else els.aarBtn.style.display = 'block';
}

// ── CRISIS DECISION POINT ──
function showCrisisPanel(move) {
  // Show rollback button so commander can undo Move 3 entirely
  els.rollbackBtn.style.display = 'block';
  // Show crisis decision panel
  els.crisisPanel.style.display = 'block';
  // Store the move ref so the handlers can access it
  els.crisisPanel.dataset.moveLabel = move.escLabel;
  els.crisisPanel.dataset.moveEscEnd = move.escEnd;
  addLog('⚡ DECISION REQUIRED: Activate diplomacy or hold pressure', 'log-amber');
}

function hideCrisisPanel() {
  els.crisisPanel.style.display = 'none';
}

function resolveCrisisDiplomacy() {
  hideCrisisPanel();
  els.rollbackBtn.style.display = 'none';
  addLog('✦ DIPLOMATIC CHANNEL ACTIVATED — 0220Z — MMCA hotline open', 'log-blue');

  // Draw humanitarian corridor on map
  if (typeof drawHumanitarianCorridor === 'function') drawHumanitarianCorridor();

  // Animate escalation smoothly DOWN: 9 → 8 → 7
  const steps = [9, 8, 7];
  const labels = ['WAR THRESHOLD', 'DE-ESCALATING...', 'LIMITED CONFLICT'];
  steps.forEach((level, i) => {
    setTimeout(() => {
      updateEscalation(level, labels[i]);
      if (i === steps.length - 1) {
        addLog('✦ DE-ESCALATION COMPLETE — Limited Conflict stabilized', 'log-blue');
        // Print a brief White Cell addendum
        const addendum = `\n— WC ADDENDUM 0222Z —\nDiplomatic channel accepted. Red halts DF-26 TEL dispersal. Humanitarian corridor proposal under PRC review. Escalation stabilized at Level 7.`;
        els.whiteCellPanel.textContent += addendum;
        finalizeMove(3);
      }
    }, i * 900);
  });
}

function resolveCrisisPressure() {
  hideCrisisPanel();
  addLog('✖ MILITARY PRESSURE MAINTAINED — No diplomatic channel opened', 'log-red');

  // Hold at 9 — armed standoff
  updateEscalation(9, 'ARMED STANDOFF');

  // Print a grim White Cell addendum
  const addendum = `\n— WC ADDENDUM 0222Z —\nNo diplomatic off-ramp extended. DF-26 TELs remain deployed and unconstrained. Red retains escalation initiative. Situation: ARMED STANDOFF.\n\nNext move will determine whether this remains conventional.`;
  els.whiteCellPanel.textContent += addendum;

  // Rollback is still visible — allow retry
  els.rollbackBtn.style.display = 'block';
  isAnimating = false;
  addLog('⚠ ARMED STANDOFF — Rollback available to try alternative approach', 'log-amber');
}

// ── ROLLBACK ──
function doRollback() {
  if (currentMove === 0) return;
  addLog(`ROLLBACK: Move ${currentMove} reverted`, 'log-amber');
  rollbackState(currentMove);
  
  if (typeof renderWeather === 'function') renderWeather(currentMove - 1);

  // Always hide the crisis panel on rollback
  if (els.crisisPanel) els.crisisPanel.style.display = 'none';

  els.rollbackBtn.style.display = 'none';
  els.aarBtn.style.display = 'none';

  const btn = els['moveBtn' + currentMove];
  btn.classList.remove('completed');
  btn.disabled = false;

  // Re-enable for retry
  movedUnits = [];
  isAnimating = false;
  enableBlueDragging();
  els.endMoveBtn.style.display = 'block';
  if (currentMove === 3) els.diplomacySection.style.display = 'block';
}

// ── MAP ANIMATIONS ──
function runMapAnimations(moveNum, callback) {
  if (moveNum === 1) {
    drawDeterenceArc([23.0, 127.0]);
    animateMove('B-05', 24.5, 124.5, 2000, () => {
      els.gdeltStrip.style.display = 'flex';
      els.mainContent.classList.add('gdelt-visible');
      setTimeout(() => { map.invalidateSize(); }, 100);
      setTimeout(callback, 500);
    });
  } else if (moveNum === 2) {
    animateMove('B-03', 24.0, 122.5, 2000, () => {
      setTimeout(() => { animateMove('N-01', 24.5, 121.8, 2000); animateMove('B-05', 24.5, 122.0, 1500); }, 1000);
      setTimeout(() => { animateMove('B-04', 24.2, 121.8, 1500); }, 2000);
      setTimeout(() => { revealUnit('R-09', 'red-destroyer'); addLog('INTEL: SSN contacts detected', 'log-red'); }, 4000);
      setTimeout(() => { animateMove('R-01', 23.5, 122.0, 2000); }, 3000);
      setTimeout(callback, 3500);
    });
  } else if (moveNum === 3) {
    drawStrikeArc([13.584, 144.929], [30.02, 122.11], () => {
      animateMove('B-01', 24.5, 125.0, 2000);
      addStrikeBurst(30.02, 122.11);
      setTimeout(() => {
        revealDF26(() => {
          drawGuamThreatArc();
          const useDiplomacy = els.diplomacyToggle && els.diplomacyToggle.checked;
          if (useDiplomacy) {
            setTimeout(() => { drawHumanitarianCorridor(); }, 2000);
          }
          setTimeout(callback, 1000);
        });
      }, 1500);
    });
  }
}

function revealDF26(callback) {
  const overlay = els.threatOverlay;
  overlay.style.display = 'flex';
  addLog('\u26A0 HIDDEN ASSET: DF-26 GUAM KILLER', 'log-red');
  setTimeout(() => {
    overlay.style.display = 'none';
    revealUnit('R-08', 'red-missile');
    const baseLat = 26.64, baseLng = 118.17;
    for (let i = 1; i <= 7; i++) {
      setTimeout(() => {
        const angle = (i/7) * Math.PI * 2;
        const lat = baseLat + Math.cos(angle) * 0.08;
        const lng = baseLng + Math.sin(angle) * 0.08;
        const icon = L.divIcon({ className: '', html: '<div class="unit-icon red-missile" style="width:28px;height:28px;"><span class="icon-label" style="font-size:7px;">TEL</span></div>', iconSize: [28,28], iconAnchor: [14,14] });
        const m = L.marker([lat, lng], { icon }).addTo(map);
        mapLayers.push(m);
      }, i * 200);
    }
    setTimeout(() => { if (callback) callback(); }, 1800);
  }, 1500);
}

// ── CUSTOM UNIT PLACEMENT ──
function startPlaceUnit() {
  els.customUnitModal.style.display = 'flex';
  els.customUnitCode.value = '';
  els.customUnitDesc.value = '';
  els.customUnitCode.focus();
}

function placeCustomUnit() {
  const code = els.customUnitCode.value.trim().toUpperCase();
  const desc = els.customUnitDesc.value.trim();
  if (!code) return;
  els.customUnitModal.style.display = 'none';
  placingUnit = true;

  // Change cursor
  document.getElementById('map').style.cursor = 'crosshair';
  map.once('click', (e) => {
    const sideColors = { blue: 'blue-destroyer', red: 'red-destroyer', neutral: 'neutral-merchant' };
    const iconClass = sideColors[selectedSide] || 'blue-destroyer';
    const icon = L.divIcon({
      className: '',
      html: `<div class="unit-icon ${iconClass}" title="${desc || code}"><span class="icon-label">${code}</span></div>`,
      iconSize: [40,40], iconAnchor: [20,20]
    });
    const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon, draggable: true }).addTo(map);
    marker.bindTooltip(`<div class="unit-tooltip"><b>${code}</b><br>${desc || 'Custom unit'}</div>`, { direction: 'top', offset: [0,-24] });
    const uid = 'CUSTOM-' + Date.now();
    unitMarkers[uid] = marker;
    customMarkers.push({ id: uid, code, desc, side: selectedSide });
    addLog(`Deployed: ${code} (${desc || 'custom'}) at ${e.latlng.lat.toFixed(1)}\u00B0N, ${e.latlng.lng.toFixed(1)}\u00B0E`, 'log-blue');
    document.getElementById('map').style.cursor = '';
    placingUnit = false;

    // Add to legend
    const secId = `legend-${selectedSide}-sec`;
    const secEl = document.getElementById(secId);
    if (secEl) {
      const row = document.createElement('div');
      row.className = `ul-row ${selectedSide}-text`;
      row.id = `leg-${uid}`;
      row.innerHTML = `<span class="ul-code">${code}</span>${desc || 'Custom unit'}`;
      let nextNode = secEl.nextElementSibling;
      while(nextNode && !nextNode.classList.contains('unit-legend-section')) {
        nextNode = nextNode.nextElementSibling;
      }
      if (nextNode) {
        els.legendBody.insertBefore(row, nextNode);
      } else {
        els.legendBody.appendChild(row);
      }
    }
  });
}

// ── AAR ──
function showAAR() {
  els.aarContent.textContent = AAR_CONTENT;
  els.aarModal.style.display = 'flex';
  addLog('AAR GENERATED', 'log-amber');
}

// ── DEMO MODE ──
function toggleDemoMode() {
  document.body.classList.toggle('demo-mode');
  els.demoModeBtn.classList.toggle('active');
  setTimeout(() => { map.invalidateSize(); }, 300);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  initMap();
  updateEscalation(2, 'BASELINE');
  enableBlueDragging();

  // Move buttons — auto-play
  els.moveBtn1.addEventListener('click', () => executeMove(1, true));
  els.moveBtn2.addEventListener('click', () => executeMove(2, true));
  els.moveBtn3.addEventListener('click', () => executeMove(3, true));

  // Action buttons
  els.endMoveBtn.addEventListener('click', endManualMove);
  els.rollbackBtn.addEventListener('click', doRollback);
  els.aarBtn.addEventListener('click', showAAR);
  els.aarCloseBtn.addEventListener('click', () => { els.aarModal.style.display = 'none'; });
  els.aarDownloadBtn.addEventListener('click', () => { window.print(); });
  els.demoModeBtn.addEventListener('click', toggleDemoMode);

  // Custom unit
  els.addUnitBtn.addEventListener('click', startPlaceUnit);
  els.customUnitCancel.addEventListener('click', () => { els.customUnitModal.style.display = 'none'; });
  els.customUnitPlace.addEventListener('click', placeCustomUnit);

  // Side selector in modal
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSide = btn.dataset.side;
    });
  });

  // Legend toggle
  els.legendToggle.addEventListener('click', () => {
    els.legendBody.classList.toggle('collapsed');
    els.legendToggle.textContent = els.legendBody.classList.contains('collapsed') ? '+' : '−';
  });

  // Threat Rings
  const ringsBtn = document.getElementById('threatRangesBtn');
  if (ringsBtn) {
    ringsBtn.addEventListener('click', toggleThreatRings);
  }

  // COP Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyCopFilter(e.target.dataset.filter);
    });
  });

  // Burn Rate Modal
  if (els.burnRateBtn) {
    els.burnRateBtn.addEventListener('click', () => { els.burnRateModal.style.display = 'flex'; });
  }
  if (els.closeBurnRateBtn) {
    els.closeBurnRateBtn.addEventListener('click', () => { els.burnRateModal.style.display = 'none'; });
  }

  // METOC Toggle
  if (els.metocBtn) {
    els.metocBtn.addEventListener('click', toggleMetoc);
  }

  // Time & Transit Tools
  if (els.etaRulerBtn) {
    els.etaRulerBtn.addEventListener('click', toggleEtaRuler);
  }
  if (els.timeRingsBtn) {
    els.timeRingsBtn.addEventListener('click', toggleTimeRings);
  }
  if (document.getElementById('casualtyBtn')) {
    document.getElementById('casualtyBtn').addEventListener('click', toggleCasualtyHeatmap);
  }

  // Crisis Decision Panel
  if (els.crisisDiploBtn) {
    els.crisisDiploBtn.addEventListener('click', resolveCrisisDiplomacy);
  }
  if (els.crisisPressureBtn) {
    els.crisisPressureBtn.addEventListener('click', resolveCrisisPressure);
  }
});
