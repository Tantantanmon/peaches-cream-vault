// main.js — P&C Vault v1.1

let store       = {};
let charName    = '{{char}}';
let userName    = '{{user}}';
let charDesc    = '';
let userPersona = '';
let generate    = null;
let generateWithRole = null;
let getChat     = null;
let getChatRange= null;
let saveStore   = null;
let refreshPrompt = null;
let charKey     = 'default';

function initBridge() {
  const p = window.parent;
  if (!p) return;
  store            = p.__PC_STORE__          || {};
  charName         = p.__PC_CHAR__           || '{{char}}';
  userName         = p.__PC_USER__           || '{{user}}';
  charDesc         = p.__PC_CHAR_DESC__      || '';
  userPersona      = p.__PC_USER_PERSONA__   || '';
  generate         = p.__PC_GENERATE__       || null;
  generateWithRole = p.__PC_GENERATE__       || null;
  getChat          = p.__PC_GET_CHAT__       || null;
  getChatRange     = p.__PC_GET_CHAT_RANGE__ || null;
  saveStore        = p.__PC_SAVE__           || null;
  refreshPrompt    = p.__PC_REFRESH_PROMPT__ || null;
  charKey          = p.__PC_CHAR_KEY__       || 'default';
}

window.__PC_ON_BRIDGE__ = function() {
  initBridge();
  window.saveStore     = saveStore;
  window.refreshPrompt = refreshPrompt;
  router.init();
};

// ── 공통 컨텍스트 빌더
function buildContext() {
  const lines = [];
  if (charDesc)                lines.push(`[Character]\n${charDesc}`);
  if (store.charBody || store.userBody) {
    const parts = [];
    if (store.charBody)  parts.push(`${charName}: ${store.charBody}`);
    if (store.userBody)  parts.push(`${userName}: ${store.userBody}`);
    lines.push(`[Appearance]\n${parts.join('\n')}`);
  }
  if (store.charErogenous || store.userErogenous) {
    const parts = [];
    if (store.charErogenous) parts.push(`${charName}: ${store.charErogenous}`);
    if (store.userErogenous) parts.push(`${userName}: ${store.userErogenous}`);
    lines.push(`[Intimacy]\n${parts.join('\n')}`);
  }
  if (userPersona) lines.push(`[User Persona]\n${userPersona}`);
  const chat = getChat ? getChat(10) : [];
  if (chat.length) {
    const chatText = chat.map(m => `${m.name||m.role}: ${m.content}`).join('\n');
    lines.push(`[Recent Chat]\n${chatText}`);
  }
  return lines.join('\n\n');
}

window.buildContext = buildContext;

const SCREENS = {
  'vault':            () => import('./screens/vault.js').then(m => m.render()),
  'vault-offrecord':  () => import('./screens/vault-offrecord.js').then(m => m.render()),
  'vault-worldfeed':  () => import('./screens/vault-worldfeed.js').then(m => m.render()),
  'vault-blackbox':   () => import('./screens/vault-blackbox.js').then(m => m.render()),
  'vault-dreamlog':   () => import('./screens/vault-dreamlog.js').then(m => m.render()),
  'vault-stash':      () => import('./screens/vault-stash.js').then(m => m.render()),
  'vault-studynotes': () => import('./screens/vault-studynotes.js').then(m => m.render()),
  'vault-settings':   () => import('./screens/vault-settings.js').then(m => m.render()),
  'fourth-wall':      () => import('./screens/fourth-wall.js').then(m => m.render()),
  'interrogation':    () => import('./screens/interrogation.js').then(m => m.render()),
  'apology':          () => import('./screens/apology.js').then(m => m.render()),
};

const TOPBAR_LABELS = {
  'vault':            '🍑 Vault',
  'vault-offrecord':  'Off the Record',
  'vault-worldfeed':  'World Feed',
  'vault-blackbox':   'Blackbox',
  'vault-dreamlog':   'Dream Log',
  'vault-stash':      'Stash',
  'vault-studynotes': 'Study Notes',
  'vault-settings':   'Settings',
  'fourth-wall':      '4th Wall',
  'interrogation':    'Interrogation',
  'apology':          'Sorry Not Sorry',
};

const BACK_MAP = {
  'vault-offrecord':  'vault',
  'vault-worldfeed':  'vault',
  'vault-blackbox':   'vault',
  'vault-dreamlog':   'vault',
  'vault-stash':      'vault',
  'vault-studynotes': 'vault',
  'vault-settings':   'vault',
  'fourth-wall':      'vault',
  'interrogation':    'vault',
  'clinic':           'vault',
  'apology':          'vault',
};

const router = {
  current: 'vault',
  init() { initBridge(); this.go('vault'); },
  go(screenId) {
    this.current = screenId;
    document.querySelectorAll('.save-bar, .tab-bar').forEach(el => el.remove());
    const areaReset = document.getElementById('scroll-area');
    if (areaReset) { areaReset.style.padding=''; areaReset.style.background=''; }
    this._updateTopbar(screenId);
    const area = document.getElementById('scroll-area');
    area.innerHTML = '<div class="loading-card" style="margin:20px 16px;"><div class="sp"></div><span class="loading-text">로딩 중...</span></div>';
    area.scrollTop = 0;
    const fn = SCREENS[screenId];
    if (fn) fn().catch(err => {
      console.error('[PCV] screen load error', err);
      area.innerHTML = '<div style="padding:20px;color:#c03020;">화면 로딩 실패</div>';
    });
  },
  _updateTopbar(id) {
    const left   = document.getElementById('topbar-left');
    const center = document.getElementById('topbar-center');
    const right  = document.getElementById('topbar-right');
    right.innerHTML = '<button class="close-btn" onclick="closeApp()">✕</button>';
    if (id === 'vault') {
      left.innerHTML   = '';
      center.innerHTML = `<span class="topbar-title">${TOPBAR_LABELS[id]}</span>`;
    } else {
      const backTo = BACK_MAP[id] || 'vault';
      left.innerHTML   = `<button class="back-btn" onclick="router.go('${backTo}')">← Vault</button>`;
      center.innerHTML = `<span class="topbar-title">${TOPBAR_LABELS[id]||id}</span>`;
    }
  }
};

function closeApp() {
  if (window.parent && window.parent.__PC_CLOSE__) window.parent.__PC_CLOSE__();
  else window.close();
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\n/g,'<br>');
}

function showToast(msg) {
  const t = document.getElementById('save-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function showModal({ title, desc, confirmText='확인', onConfirm, danger=false }) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-desc').textContent  = desc;
  const confirmBtn = document.getElementById('modal-confirm');
  confirmBtn.textContent = confirmText;
  confirmBtn.style.background = danger ? '#c03020' : '#000';
  overlay.classList.add('show');
  document.getElementById('modal-cancel').onclick  = () => overlay.classList.remove('show');
  confirmBtn.onclick = () => { overlay.classList.remove('show'); if (onConfirm) onConfirm(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('show'); };
}

function doSave(fn) {
  if (fn) fn();
  if (saveStore) saveStore();
  showToast('저장됐어요 ✓');
  const btn = document.querySelector('.save-btn');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '저장됐어요 ✓';
    btn.style.background = '#2a7a40';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1500);
  }
}

function syncStore() {
  if (window.parent && window.parent.__PC_STORE__) store = window.parent.__PC_STORE__;
}

function getRecentChat(limit) {
  return getChat ? getChat(limit || 10) : [];
}


// ── JSON 파싱 헬퍼
function safeParseJSON(raw) {
  if (!raw) return null;
  let cleaned = raw.replace(/```json|```/g, '').trim();
  // 배열 추출
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch(e) {}
  }
  // 객체 추출
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch(e) {}
  }
  try { return JSON.parse(cleaned); } catch(e) {}
  return null;
}
window.safeParseJSON = safeParseJSON;

if (window.parent && window.parent.__PC_STORE__) {
  router.init();
}
