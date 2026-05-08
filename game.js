/* FocusClass VR — game.js */

// ─── ESTADO ───────────────────────────────────────
const S = {
  pts: 0, sessionPts: 0, streak: 0,
  done: [], badges: [],
  screen: 'loading',
};
const Metrics = { distractors: 0, premature: 0 };
const TaskResults = {};
const LEVEL_NAMES = ['Nv.1 Nuevo', 'Nv.2 Atento', 'Nv.3 Curioso', 'Nv.4 Maestro'];

// ─── AUDIO ────────────────────────────────────────
let AC;
function initAudio(){ if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)(); }
function tone(f, d=.14, t='sine', v=.26){
  if(!AC) return;
  try{
    const o=AC.createOscillator(), g=AC.createGain();
    o.connect(g); g.connect(AC.destination);
    o.type=t; o.frequency.value=f;
    g.gain.setValueAtTime(v, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, AC.currentTime+d);
    o.start(); o.stop(AC.currentTime+d);
  }catch(e){}
}
const sfxOk  = ()=>{ tone(523,.1); setTimeout(()=>tone(659,.1),100); setTimeout(()=>tone(784,.16),200); };
const sfxErr = ()=>{ tone(200,.18,'sawtooth',.22); setTimeout(()=>tone(160,.22,'sawtooth',.14),160); };
const sfxPts = ()=>{ tone(880,.07); setTimeout(()=>tone(1100,.09),75); };
const sfxLvl = ()=>{ [523,587,659,784,880].forEach((f,i)=>setTimeout(()=>tone(f,.14,'sine',.3),i*110)); };

// ─── HELPERS ──────────────────────────────────────
const $   = id => document.getElementById(id);
const a3d = (id,a,v) => { const e=$(id); if(e) e.setAttribute(a,v); };
const show3d = id => a3d(id,'visible','true');
const hide3d = id => a3d(id,'visible','false');

function showScreen(name){
  ['screen-welcome','screen-select','screen-end','screen-summary'].forEach(id=>$(id).classList.add('hidden'));
  if(name) $(name).classList.remove('hidden');
}
function showHUD(){ $('hud').classList.remove('hidden'); }
function hideHUD(){ $('hud').classList.add('hidden'); }
function showBar(txt){ $('task-bar').textContent=txt; $('task-bar').classList.remove('hidden'); }
function hideBar()   { $('task-bar').classList.add('hidden'); }
function setBoard(txt){ a3d('board-text','value', txt); }

// ─── POPUP DEL PROFESOR ───────────────────────────
let popupTimer = null;

function showTeacherPopup(text, autoDismissMs = 0) {
  clearTimeout(popupTimer);
  const el  = $('teacher-popup');
  const txt = $('teacher-popup-text');
  if (!el || !txt) return;
  txt.textContent = text;
  el.classList.remove('hidden');
  // reinicia animación
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = '';
  if (autoDismissMs > 0) {
    popupTimer = setTimeout(closeTeacherPopup, autoDismissMs);
  }
}

function closeTeacherPopup() {
  clearTimeout(popupTimer);
  const el = $('teacher-popup');
  if (el) el.classList.add('hidden');
}

// ─── GEMINI API ───────────────────────────────────
async function callGemini(prompt) {
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] }) }
    );
    const d = await r.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch(e) { return null; }
}

function cleanAI(txt, maxLen=220) {
  return txt.replace(/\*\*/g,'').replace(/#+\s?/g,'').replace(/\n{2,}/g,'\n').trim().substring(0,maxLen);
}

async function popupGemini(prompt, fallback='Sigue practicando.\nCada sesion te hace mas fuerte.') {
  showTeacherPopup('El profesor está pensando...');
  const r = await callGemini(prompt);
  showTeacherPopup(r ? cleanAI(r) : fallback);
}

// ─── HISTORIAL DE SESIONES ────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('fc_history')||'[]'); } catch { return []; }
}
function saveSession() {
  const h = loadHistory();
  h.push({
    date: new Date().toISOString(),
    pts: S.sessionPts, done: S.done.length, streak: S.streak,
    distractors: Metrics.distractors, premature: Metrics.premature,
    badges: S.badges.length
  });
  if(h.length>30) h.shift();
  localStorage.setItem('fc_history', JSON.stringify(h));
}

// ─── EXPORTAR REPORTE CSV ─────────────────────────
function csvRow(...cells) {
  return cells.map(c => {
    const s = String(c ?? '');
    return (s.includes(',') || s.includes('"') || s.includes('\n'))
      ? '"' + s.replace(/"/g,'""') + '"'
      : s;
  }).join(',');
}

function exportReport() {
  const aiEl   = $('sum-ai-report');
  const aiText = aiEl ? (aiEl.innerText||aiEl.textContent).replace(/\n+/g,' | ').trim() : '';
  const history = loadHistory();
  const avg = history.length > 1
    ? Math.round(history.reduce((a,s)=>a+s.pts,0)/history.length) : S.sessionPts;

  const rows = [];

  // Encabezado de sección
  const sec = t => rows.push(csvRow(t), csvRow(''));

  rows.push(csvRow('FocusClass VR - Reporte de Sesion'));
  rows.push(csvRow('Fecha', new Date().toLocaleString('es-BO')));
  rows.push(csvRow(''));

  sec('SESION ACTUAL');
  rows.push(csvRow('Campo','Valor'));
  rows.push(csvRow('Puntos totales', S.sessionPts));
  rows.push(csvRow('Misiones completadas', S.done.length + '/3'));
  rows.push(csvRow('Misiones jugadas', S.done.join(' | ') || 'ninguna'));
  rows.push(csvRow('Racha maxima', S.streak));
  rows.push(csvRow('Insignias', S.badges.join(' | ') || 'ninguna'));
  rows.push(csvRow(''));

  sec('METRICAS CLINICAS POR TAREA');
  rows.push(csvRow('Tarea','Dimension','Resultado','Errores/Notas'));

  if(TaskResults.A1) {
    rows.push(csvRow('A1 - Encuentra el Lapiz','Atencion selectiva',
      TaskResults.A1.ok ? 'Completada' : 'No completada',
      'Distractores tocados: ' + TaskResults.A1.wrong));
  } else {
    rows.push(csvRow('A1 - Encuentra el Lapiz','Atencion selectiva','No jugada',''));
  }
  if(TaskResults.B3) {
    rows.push(csvRow('B3 - Semaforo del Recreo','Control de impulsos',
      TaskResults.B3.correct + '/' + TaskResults.B3.total + ' verdes capturados',
      'Clics prematuros en rojo: ' + TaskResults.B3.premature));
  } else {
    rows.push(csvRow('B3 - Semaforo del Recreo','Control de impulsos','No jugada',''));
  }
  if(TaskResults.C1) {
    rows.push(csvRow('C1 - Hora de Clase','Regulacion / calma',
      TaskResults.C1.ok + ' exhalaciones correctas',
      'Ciclos perdidos: ' + TaskResults.C1.err + ' | Puntos: ' + TaskResults.C1.pts));
  } else {
    rows.push(csvRow('C1 - Hora de Clase','Regulacion / calma','No jugada',''));
  }
  rows.push(csvRow(''));

  sec('HISTORIAL DE SESIONES');
  rows.push(csvRow('Sesiones registradas', history.length));
  if(history.length > 1) {
    rows.push(csvRow('Promedio de puntos', avg));
    rows.push(csvRow('Tendencia', S.sessionPts >= avg ? 'Mejorando ↑' : 'Por debajo del promedio ↓'));
  }
  rows.push(csvRow(''));

  if(history.length > 0) {
    rows.push(csvRow('#','Fecha','Puntos','Misiones','Racha','Distractores','Prematuros','Insignias'));
    history.forEach((s, i) => {
      const fecha = s.date ? new Date(s.date).toLocaleDateString('es-BO') : '-';
      rows.push(csvRow(i+1, fecha, s.pts, (s.done||0)+'/3', s.streak||0,
        s.distractors||0, s.premature||0, s.badges||0));
    });
    rows.push(csvRow(''));
  }

  sec('REPORTE IA GEMINI');
  rows.push(csvRow(aiText || '(No generado)'));
  rows.push(csvRow(''));
  rows.push(csvRow('FocusClass VR - Bolivia - SDGs 3, 4, 10'));

  const csv  = rows.join('\n');
  const blob = new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `FocusClass_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── REPORTE IA DE SESIÓN ─────────────────────────
async function generateAiReport() {
  const el = $('sum-ai-report');
  if(el) el.innerHTML = '<em style="color:#5A9AB0;font-style:italic">Analizando sesión con IA...</em>';

  const history = loadHistory();
  const prev = history.slice(0,-1);
  const histLine = prev.length > 0
    ? `Historial: ${prev.length} sesion(es) previa(s). Ultima: ${prev[prev.length-1]?.pts??0} pts.`
    : 'Primera sesion del estudiante.';

  const a1r = TaskResults.A1
    ? `A1 Atencion: ${TaskResults.A1.ok?'encontro el lapiz':'no completo'}; distractores: ${TaskResults.A1.wrong}.`
    : 'A1 Atencion: no jugada.';
  const b3r = TaskResults.B3
    ? `B3 Impulsividad: ${TaskResults.B3.correct}/${TaskResults.B3.total} verdes; prematuros: ${TaskResults.B3.premature}.`
    : 'B3 Impulsividad: no jugada.';
  const c1r = TaskResults.C1
    ? `C1 Regulacion: ${TaskResults.C1.ok} exhalaciones correctas; ${TaskResults.C1.err} perdidas.`
    : 'C1 Regulacion: no jugada.';

  const prompt = `Eres psicopedagogo especialista en TDAH infantil (5-12 anos). Analiza esta sesion de FocusClass VR:
${a1r}
${b3r}
${c1r}
Puntos: ${S.sessionPts}. Racha: ${S.streak}. Insignias: ${S.badges.join(', ')||'ninguna'}.
${histLine}
Escribe un reporte en exactamente 3 puntos con bullet "•" para el educador/terapeuta. Cada punto: 1-2 oraciones claras. Cubre: (1) desempeno general, (2) area mas fuerte, (3) sugerencia concreta para la proxima sesion. Espanol formal, sin asteriscos ni encabezados.`;

  const result = await callGemini(prompt);
  if(result && el) {
    el.innerHTML = cleanAI(result, 600).replace(/\n/g,'<br>');
  } else if(el) {
    el.innerHTML = '• Sin conexion a la IA. Revisa tu internet.';
  }
}

// ─── TOAST ────────────────────────────────────────
let toastT;
function toast(msg, color='#2ECC40'){
  const t=$('toast');
  t.textContent=msg; t.style.color=color;
  t.classList.remove('hidden');
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.add('hidden'), 2300);
}

// ─── HUD ──────────────────────────────────────────
function getLevel(){
  if(S.pts>=600) return 3; if(S.pts>=350) return 2; if(S.pts>=150) return 1; return 0;
}
let prevLvl=0;
function addPts(n, bonus=false){
  const mult = S.streak>=3?1.5:1;
  const total = Math.round(n*mult);
  S.pts+=total; S.sessionPts+=total;
  sfxPts();
  toast(bonus?`+${total} BONUS ⭐`:`+${total} pts`, bonus?'#FFD700':'#2ECC40');
  $('hud-pts').textContent = '⭐ '+S.pts;
  $('hud-lvl').textContent = LEVEL_NAMES[getLevel()];
  const lvl=getLevel();
  if(lvl>prevLvl){ prevLvl=lvl; sfxLvl(); setTimeout(()=>toast('🏆 '+LEVEL_NAMES[lvl]+'!','#FFD700'),500); }
}

// ─── TIMER ────────────────────────────────────────
let timerIv;
function startTimer(seconds){
  clearInterval(timerIv);
  let t=seconds;
  const upd=()=>{ const m=Math.floor(t/60),s=t%60; $('hud-timer').textContent=`${m}:${s.toString().padStart(2,'0')}`; };
  upd();
  timerIv=setInterval(()=>{ t--; upd(); if(t<0) clearInterval(timerIv); },1000);
}
function stopTimer(){ clearInterval(timerIv); $('hud-timer').textContent=''; }

// ─── RELOJ ────────────────────────────────────────
function updateClock(){
  const now=new Date(), h=now.getHours()%12, m=now.getMinutes();
  a3d('clock-hour','rotation',`0 0 ${-(h/12*360+m/60*30)}`);
  a3d('clock-min', 'rotation',`0 0 ${-(m/60*360)}`);
}

// ─── TECLADO ──────────────────────────────────────
document.addEventListener('keydown', e=>{
  initAudio();
  const blocked=['Space','Enter','Digit1','Digit2','Digit3','Digit4',
    'Numpad1','Numpad2','Numpad3','Numpad4','Escape','KeyR'];
  if(blocked.includes(e.code)) e.preventDefault();
  switch(S.screen){
    case 'welcome':
      if(e.code==='Enter'||e.code==='Space') goSelectScreen(); break;
    case 'select':
      if(e.code==='Digit1'||e.code==='Numpad1') launchTask('A1');
      if(e.code==='Digit2'||e.code==='Numpad2') launchTask('B3');
      if(e.code==='Digit3'||e.code==='Numpad3') launchTask('C1');
      if(e.code==='KeyR') goSummary();
      if(e.code==='Escape') goFree();
      break;
    case 'A1':
      if(e.code==='Digit1'||e.code==='Numpad1') a1Pick(0);
      if(e.code==='Digit2'||e.code==='Numpad2') a1Pick(1);
      if(e.code==='Digit3'||e.code==='Numpad3') a1Pick(2);
      if(e.code==='Digit4'||e.code==='Numpad4') a1Pick(3);
      if(e.code==='Escape'){ stopA1(); goSelectScreen(); }
      break;
    case 'B3':
      if(e.code==='Space') b3Press();
      if(e.code==='Escape'){ stopB3(); goSelectScreen(); }
      break;
    case 'C1':
      if(e.code==='Space') c1Breathe();
      if(e.code==='Escape'){ stopC1(); goSelectScreen(); }
      break;
    case 'end':
      if(e.code==='Enter'||e.code==='Space') goSelectScreen(); break;
    case 'summary':
      if(e.code==='Enter'||e.code==='Space') location.reload(); break;
    case 'free':
      if(e.code==='Escape'||e.code==='Tab') goSelectScreen(); break;
  }
}, true);

// ─── PANTALLAS ────────────────────────────────────
function goSelectScreen(){
  stopAll(); S.screen='select';
  showScreen('screen-select');
  hideBar(); hideHUD();
  $('tl-indicator').classList.add('hidden');
  $('orb-indicator').classList.add('hidden');
  setBoard('¡Bienvenidos a FocusClass VR!');
  updateActionBtn();
  showTeacherPopup(
    'Elige tu misión:\n[1] Encuentra el Lápiz\n[2] Semáforo del Recreo\n[3] Hora de Clase\n\nESC = explorar libremente',
    9000
  );
}

function goFree(){
  stopAll(); S.screen='free';
  showScreen(null); hideBar(); hideHUD();
  setBoard('Modo exploración libre');
  showTeacherPopup('Explora el aula libremente.\nPresiona ESC para volver al menú de misiones.', 6000);
}

async function goSummary(){
  stopAll(); S.screen='summary';
  showScreen('screen-summary');
  $('sum-pts').textContent    = '⭐ Puntos esta sesión: '+S.sessionPts;
  $('sum-tasks').textContent  = '📋 Misiones completadas: '+S.done.length+'/3';
  $('sum-streak').textContent = '🔥 Racha máxima: '+S.streak;
  $('sum-badges').textContent = S.badges.length?'🏅 Insignias: '+S.badges.join('  '):'Sin insignias aún';
  $('sum-clinic').textContent = `Distractores: ${Metrics.distractors} | Prematuras: ${Metrics.premature}`;
  hideBar(); hideHUD();
  setBoard('Resumen de sesión');
  updateActionBtn();
  saveSession();
  await generateAiReport();
}

function showEnd(taskId, pts, bonus, ok){
  if(!S.done.includes(taskId)) S.done.push(taskId);
  if(ok) S.streak++; else S.streak=0;
  S.screen='end';
  showScreen('screen-end');
  hideBar();
  $('end-icon').textContent  = ok?'✅':'📚';
  $('end-title').textContent = ok?'¡Misión completada!':'¡Sigue intentando!';
  const names={A1:'Encuentra el Objeto',B3:'Semáforo del Recreo',C1:'Hora de Clase'};
  $('end-msg').textContent   = ok?`¡Excelente! Completaste "${names[taskId]}".`:`Completaste "${names[taskId]}". ¡La práctica es clave!`;
  $('end-pts').textContent   = pts+bonus>0?`+ ${pts+bonus} puntos!`:'0 puntos';
  $('end-pts').style.color   = pts+bonus>0?'#2ECC40':'#888';
  const newB=awardBadges(taskId,ok,bonus>0);
  $('end-badge').textContent = newB.length?'🏅 Nueva insignia: '+newB.join(' '):'';
  updateActionBtn();
  geminiTaskFeedback(taskId, ok, pts);
}

async function geminiTaskFeedback(taskId, ok, pts) {
  const labels = {
    A1:'Encuentra el Lapiz (atencion selectiva)',
    B3:'Semaforo del Recreo (control de impulsos)',
    C1:'Hora de Clase (regulacion y calma)'
  };
  let metrics = '';
  if(taskId==='A1')
    metrics = `Resultado: ${ok?'encontro el lapiz':'no completo'}. Distractores: ${TaskResults.A1?.wrong??0}.`;
  else if(taskId==='B3')
    metrics = `${TaskResults.B3?.correct??0}/${TaskResults.B3?.total??0} verdes. Prematuros: ${Metrics.premature}.`;
  else
    metrics = `Exhalaciones OK: ${TaskResults.C1?.ok??0}. Perdidas: ${TaskResults.C1?.err??0}.`;

  const prompt = `Eres el profesor virtual de FocusClass VR. El nino (8-12 anos, TDAH) termino: "${labels[taskId]}".
${metrics}
Da exactamente 2 oraciones cortas y calidas: (1) celebracion o aliento segun el resultado, (2) consejo positivo y concreto para mejorar. Espanol, tono motivador, SIN asteriscos, SIN listas.`;

  await popupGemini(prompt);
}

function awardBadges(taskId,ok,withBonus){
  const earned=[];
  if(taskId==='A1'&&ok&&withBonus&&!S.badges.includes('👁️ Lince')){ S.badges.push('👁️ Lince'); earned.push('👁️ Lince'); }
  if(taskId==='B3'&&ok&&!S.badges.includes('🚦 Semáforo')){ S.badges.push('🚦 Semáforo'); earned.push('🚦 Semáforo'); }
  if(taskId==='C1'&&ok&&withBonus&&!S.badges.includes('🪑 Día')){ S.badges.push('🪑 Día'); earned.push('🪑 Día'); }
  if(S.streak>=2&&!S.badges.includes('🔥 Llamas')){ S.badges.push('🔥 Llamas'); earned.push('🔥 Llamas'); }
  return earned;
}

function launchTask(id){
  showScreen(null);
  if(id==='A1') startA1();
  if(id==='B3') startB3();
  if(id==='C1') startC1();
}
function stopAll(){ stopA1(); stopB3(); stopC1(); }

// ══════════════════════════════════════════════════
// TAREA A1 — Encuentra el Lápiz
// ══════════════════════════════════════════════════
const A1_IDS=['a1-pencil','a1-eraser','a1-ruler','a1-scissors'];
const A1_CORRECT=0;
let a1Running=false, a1Timer=null, a1Left=90, a1Wrong=0, a1Order=[];

function startA1(){
  S.screen='A1'; a1Running=true; a1Left=90; a1Wrong=0;
  a1Order=[0,1,2,3].sort(()=>Math.random()-.5);
  A1_IDS.forEach(id=>show3d(id));
  showHUD(); startTimer(90);
  showBar('🔍 Encuentra el LÁPIZ — clic en él o [1][2][3][4]');
  setBoard('Tarea A1 · Atención selectiva');
  updateActionBtn();
  showTeacherPopup(
    'Busca el LÁPIZ escondido en el aula.\nHay objetos que te distraerán.\nIgnóralos y enfócate. ¡Tienes 90 segundos!',
    8000
  );
  a1Timer=setInterval(()=>{ if(!a1Running) return; a1Left--; if(a1Left<=0) a1Timeout(); },1000);
}

function a1Pick(slot){
  if(!a1Running) return;
  if(a1Order[slot]===A1_CORRECT){
    a1Running=false; stopA1(); sfxOk();
    TaskResults.A1 = { ok:true, wrong:a1Wrong };
    const bonus=a1Wrong===0?5:0;
    addPts(10); if(bonus) setTimeout(()=>addPts(bonus,true),400);
    setBoard('¡Encontraste el lápiz! ✏️');
    setTimeout(()=>showEnd('A1',10,bonus,true),1400);
  } else {
    a1Wrong++; Metrics.distractors++; sfxErr();
    toast('¡Ese no! Sigue buscando 🔍','#FF6B35');
  }
}

function a1ClickObj(isCorrect){
  if(!a1Running) return;
  if(isCorrect){
    a1Running=false; stopA1(); sfxOk();
    TaskResults.A1 = { ok:true, wrong:a1Wrong };
    const bonus=a1Wrong===0?5:0;
    addPts(10); if(bonus) setTimeout(()=>addPts(bonus,true),400);
    setBoard('¡Encontraste el lápiz! ✏️');
    setTimeout(()=>showEnd('A1',10,bonus,true),1400);
  } else {
    a1Wrong++; Metrics.distractors++; sfxErr();
    toast('¡Ese no! Sigue buscando 🔍','#FF6B35');
  }
}

function a1Timeout(){
  if(!a1Running) return; a1Running=false; stopA1();
  TaskResults.A1 = { ok:false, wrong:a1Wrong, timeout:true };
  sfxErr(); toast('¡Tiempo agotado! 😅','#FF6B35');
  setTimeout(()=>showEnd('A1',0,0,false),1200);
}

function stopA1(){
  clearInterval(a1Timer); a1Timer=null; a1Running=false;
  A1_IDS.forEach(id=>hide3d(id)); stopTimer();
}

// ══════════════════════════════════════════════════
// TAREA B3 — Semáforo
// ══════════════════════════════════════════════════
let b3Running=false, b3Phase='red', b3Correct=0, b3Total=0;
let b3RedT=null, b3GreenT=null;

function startB3(){
  S.screen='B3'; b3Running=true; b3Phase='red'; b3Correct=0; b3Total=0;
  setTL('red');
  $('tl-indicator').classList.remove('hidden');
  showHUD();
  showBar('🚦 Espera el VERDE — ESPACIO solo en verde');
  setBoard('Tarea B3 · Control de impulsos');
  updateActionBtn();
  showTeacherPopup(
    'Mira el semáforo del recreo.\nPresiona ESPACIO SOLO cuando sea VERDE.\nSi presionas en ROJO, pierdes puntos. ¡Paciencia!',
    8000
  );
  b3Cycle();
}

function setTL(color){
  b3Phase=color;
  const red=$('tl-red'), grn=$('tl-green'), msg=$('tl-msg');
  if(color==='red'){
    red.className='tl-light tl-red active';
    grn.className='tl-light tl-green';
    msg.textContent='Espera...';
    a3d('tl3d-red',  'material','color:#FF0000;emissive:#FF0000;emissiveIntensity:2.0');
    a3d('tl3d-green','material','color:#003300;emissive:#003300;emissiveIntensity:0.1');
  } else {
    red.className='tl-light tl-red';
    grn.className='tl-light tl-green active';
    msg.textContent='¡AHORA!';
    a3d('tl3d-red',  'material','color:#550000;emissive:#550000;emissiveIntensity:0.1');
    a3d('tl3d-green','material','color:#00FF00;emissive:#00FF00;emissiveIntensity:2.2');
    tone(880,.1);
  }
}

function b3Cycle(){
  if(!b3Running||b3Total>=5){ b3Finish(); return; }
  setTL('red');
  showBar('🔴 Espera...');
  b3RedT=setTimeout(()=>{
    if(!b3Running) return;
    setTL('green');
    showBar('🟢 ¡AHORA! Presiona ESPACIO');
    b3GreenT=setTimeout(()=>{
      if(!b3Running||b3Phase!=='green') return;
      setTL('red'); b3Total++;
      toast('¡Se pasó el verde! 😅','#FF9900');
      setTimeout(()=>b3Cycle(),800);
    }, 1500+Math.random()*2000);
  }, 2000+Math.random()*4000);
}

function b3Press(){
  if(!b3Running) return;
  if(b3Phase==='green'){
    clearTimeout(b3GreenT); b3Correct++; b3Total++; sfxOk();
    toast(b3Correct>=3?'¡RACHA ×2! 🔥':'¡Verde correcto! ✅', b3Correct>=3?'#FFD700':'#2ECC40');
    setTL('red');
    setTimeout(()=>b3Cycle(),700);
  } else {
    Metrics.premature++; sfxErr();
    toast('¡Era ROJO! Espera el verde 🛑','#FF6B35');
  }
}

function b3Finish(){
  b3Running=false; stopB3();
  TaskResults.B3 = { correct:b3Correct, total:b3Total, premature:Metrics.premature };
  const pts=b3Correct*8, bonus=b3Correct>=3?b3Correct*4:0, ok=b3Correct>=3;
  if(pts>0) addPts(pts);
  if(bonus) setTimeout(()=>addPts(bonus,true),400);
  setTimeout(()=>showEnd('B3',pts,bonus,ok),1300);
}

function stopB3(){
  clearTimeout(b3RedT); clearTimeout(b3GreenT);
  b3RedT=null; b3GreenT=null; b3Running=false;
  setTL('red'); stopTimer();
  $('tl-indicator').classList.add('hidden');
}

// ══════════════════════════════════════════════════
// TAREA C1 — Respiración / Hora de clase
// ══════════════════════════════════════════════════
let c1Running=false, c1Phase='inhale', c1Left=60, c1Pts=0, c1Ok=0, c1Err=0;
let c1Main=null, c1Breath=null, c1Pressed=false;

function startC1(){
  S.screen='C1'; c1Running=true; c1Left=60; c1Pts=0; c1Ok=0; c1Err=0; c1Pressed=false;
  show3d('c1-orb');
  $('orb-indicator').classList.remove('hidden');
  showHUD(); startTimer(60);
  showBar('🪑 Inhala y exhala con el orbe — ESPACIO al EXHALAR');
  setBoard('Tarea C1 · Regulación y calma');
  updateActionBtn();
  showTeacherPopup(
    'Respira con calma junto al orbe.\nCuando el orbe se encoja, presiona ESPACIO para exhalar.\nLa calma es tu superpoder. ¡Tienes 60 segundos!',
    9000
  );
  c1BreathCycle();
  c1Main=setInterval(()=>{
    if(!c1Running) return;
    c1Left--;
    if(c1Left%15===0&&c1Left>0){
      const ratio=c1Err/Math.max(1,c1Ok+c1Err);
      if(ratio<0.5){ c1Pts+=8; addPts(8); toast(`¡${60-c1Left}s de calma! +8 ✨`,'#2ECC40'); }
    }
    if(c1Left<=0) c1Finish();
  },1000);
}

function c1BreathCycle(){
  if(!c1Running) return;
  c1Phase='inhale'; c1Pressed=false;
  setOrbPhase('inhale');
  c1Breath=setTimeout(()=>{
    if(!c1Running) return;
    c1Phase='exhale'; c1Pressed=false;
    setOrbPhase('exhale');
    c1Breath=setTimeout(()=>{
      if(!c1Running) return;
      if(!c1Pressed){ c1Err++; setOrbPhase('miss'); toast('¡Exhala con ESPACIO! 💨','#FF9900'); }
      c1BreathCycle();
    },3000);
  },3000);
}

function setOrbPhase(phase){
  const orb=$('orb-circle'), lbl=$('orb-label');
  if(!orb||!lbl) return;
  orb.className='';
  if(phase==='inhale'){
    orb.classList.add('inhale'); lbl.textContent='Inhala... 😤';
    a3d('c1-sphere','material','color:#00B4D8;emissive:#00B4D8;emissiveIntensity:0.5;opacity:0.8;transparent:true');
    a3d('c1-sphere','animation','property:scale;to:1.4 1.4 1.4;dur:2800;easing:easeInOutSine');
  } else if(phase==='exhale'){
    orb.classList.add('exhale'); lbl.textContent='¡Exhala! 😮‍💨';
    a3d('c1-sphere','material','color:#2ECC40;emissive:#2ECC40;emissiveIntensity:0.5;opacity:0.8;transparent:true');
    a3d('c1-sphere','animation','property:scale;to:0.7 0.7 0.7;dur:2800;easing:easeInOutSine');
  } else if(phase==='correct'){
    orb.classList.add('correct'); lbl.textContent='¡Perfecto! ✅';
    a3d('c1-sphere','material','color:#FFD700;emissive:#FFD700;emissiveIntensity:0.8;opacity:0.9;transparent:true');
  } else {
    orb.classList.add('miss'); lbl.textContent='¡Ups! 😵';
    a3d('c1-sphere','material','color:#FF6B35;emissive:#FF6B35;emissiveIntensity:0.6;opacity:0.8;transparent:true');
  }
}

function c1Breathe(){
  if(!c1Running||c1Pressed) return;
  if(c1Phase==='exhale'){
    c1Pressed=true; c1Ok++; sfxOk();
    setOrbPhase('correct');
    toast('¡Bien respirado! 💨','#2ECC40');
  } else {
    c1Err++; sfxErr();
    setOrbPhase('miss');
    toast('¡Aún no! Espera el exhala 😬','#FF9900');
  }
}

function c1Finish(){
  c1Running=false; stopC1();
  TaskResults.C1 = { ok:c1Ok, err:c1Err, pts:c1Pts };
  const noErr=c1Err===0, bonus=noErr?10:0;
  if(bonus){ sfxLvl(); addPts(bonus,true); toast('🏆 ¡ALUMNO DEL DÍA!','#FFD700'); }
  setTimeout(()=>showEnd('C1',c1Pts,bonus,c1Pts>=16),1500);
}

function stopC1(){
  clearInterval(c1Main); clearTimeout(c1Breath);
  c1Main=null; c1Breath=null; c1Running=false;
  hide3d('c1-orb'); stopTimer();
  $('orb-indicator').classList.add('hidden');
}

// ─── CONTROLES MÓVIL ──────────────────────────────
const mDir = { fwd:false, bck:false, lft:false, rgt:false };
const M_SPEED = 0.030;

function mset(dir, val) { mDir[dir] = val; }

function mAction() {
  initAudio();
  const btn = $('btn-mobile-action');
  switch(S.screen) {
    case 'welcome':  goSelectScreen(); break;
    case 'C1':       c1Breathe(); break;
    case 'B3':       b3Press();   break;
    case 'end':      goSelectScreen(); break;
    case 'summary':  location.reload(); break;
  }
  // feedback visual breve
  if(btn){ btn.style.background='rgba(255,107,53,.85)'; setTimeout(()=>btn.style.background='',200); }
}

function updateActionBtn() {
  const btn = $('btn-mobile-action');
  if(!btn) return;
  const labels = {
    welcome:'▶ Empezar', select:'···',
    A1:'· Lápiz ·', B3:'¡ AHORA !', C1:'💨 Exhalar',
    end:'▶ Siguiente', summary:'↺ Nueva', free:'···'
  };
  btn.textContent = labels[S.screen] || 'ACCIÓN';
}

function mobileLoop() {
  if(mDir.fwd || mDir.bck || mDir.lft || mDir.rgt) {
    const rig = document.getElementById('rig');
    const cam = document.getElementById('cam');
    if(rig && cam) {
      const yaw = cam.object3D.rotation.y;
      let dx = 0, dz = 0;
      if(mDir.fwd){ dx -= Math.sin(yaw)*M_SPEED; dz -= Math.cos(yaw)*M_SPEED; }
      if(mDir.bck){ dx += Math.sin(yaw)*M_SPEED; dz += Math.cos(yaw)*M_SPEED; }
      if(mDir.lft){ dx -= Math.cos(yaw)*M_SPEED; dz += Math.sin(yaw)*M_SPEED; }
      if(mDir.rgt){ dx += Math.cos(yaw)*M_SPEED; dz -= Math.sin(yaw)*M_SPEED; }
      const p = rig.object3D.position;
      p.x = Math.max(-5.4, Math.min(5.4, p.x + dx));
      p.z = Math.max(-4.5, Math.min(4.7, p.z + dz));
    }
  }
  requestAnimationFrame(mobileLoop);
}

// ─── CLICKS EN OBJETOS 3D ─────────────────────────
function setupClicks(){
  const wire=(id,fn)=>{ const e=$(id); if(e) e.addEventListener('click',()=>{ initAudio(); fn(); }); };
  wire('hit-pencil',   ()=>a1ClickObj(true));
  wire('hit-eraser',   ()=>a1ClickObj(false));
  wire('hit-ruler',    ()=>a1ClickObj(false));
  wire('hit-scissors', ()=>a1ClickObj(false));
  wire('c1-sphere',    ()=>{ if(S.screen==='C1') c1Breathe(); });
  wire('tl3d-green',   ()=>{ if(S.screen==='B3') b3Press(); });
}

// ─── INICIO ───────────────────────────────────────
document.querySelector('a-scene').addEventListener('loaded', ()=>{
  $('loading').style.display='none';
  S.screen='welcome';
  showScreen('screen-welcome');
  setBoard('¡Bienvenidos a FocusClass VR!');
  updateClock();
  setInterval(updateClock, 30000);
  setupClicks();
  mobileLoop();
  updateActionBtn();
});

document.addEventListener('keydown', ()=>initAudio(), {once:true, capture:true});
document.addEventListener('click',   ()=>initAudio(), {once:true});
