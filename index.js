// index.js — P&C Vault v1.1
const MODULE_NAME  = 'peaches-cream-vault';
const DATA_VERSION = '1.1';

function ctx() { return SillyTavern.getContext(); }

function isMobile() {
  try { return window.matchMedia('(max-width:430px),(pointer:coarse)').matches; }
  catch { return window.innerWidth <= 430; }
}

function getCharKey() {
  try {
    const c = ctx();
    const avatar = c?.characters?.[c?.characterId]?.avatar?.replace(/\.[^/.]+$/, '')
                || c?.characters?.[c?.characterId]?.filename?.replace(/\.[^/.]+$/, '');
    const name = c?.name2 || c?.characters?.[c?.characterId]?.name || 'default';
    return (avatar ? `${name}_${avatar}` : name).replace(/[^a-zA-Z0-9가-힣]/g, '_');
  } catch(e) { return 'default'; }
}

function getCoreStore() {
  try {
    const { extensionSettings } = ctx();
    return extensionSettings['peaches-cream-core']?.chars?.[getCharKey()] || {};
  } catch(e) { return {}; }
}

const defaultConfig = {
  maxTokens: 1000,
  apiSource: 'main',
  connectionProfile: '',
};

function getStore() {
  const { extensionSettings } = ctx();
  if (!extensionSettings[MODULE_NAME] || extensionSettings[MODULE_NAME].version !== DATA_VERSION) {
    extensionSettings[MODULE_NAME] = { version: DATA_VERSION, config: JSON.parse(JSON.stringify(defaultConfig)), chars: {} };
  }
  const s = extensionSettings[MODULE_NAME];
  if (!s.config) s.config = JSON.parse(JSON.stringify(defaultConfig));
  if (!s.chars)  s.chars  = {};
  Object.keys(defaultConfig).forEach(k => { if (s.config[k] === undefined) s.config[k] = defaultConfig[k]; });
  return s;
}

function getCharStore() {
  const s = getStore(), key = getCharKey();
  if (!s.chars[key]) s.chars[key] = {};
  return s.chars[key];
}

function saveStore() { ctx().saveSettingsDebounced(); }

// ── API 호출 (Connection Profile 지원)
async function generateWithRole(systemPrompt, userPrompt, appName) {
  const c     = ctx();
  const store = getStore();
  const APP_TOKENS = {
    offrecord:300, worldfeed:700, blackbox:400,
    dreamlog:300, stash:300, studynotes:300,
    clinic:400, apology:300,
  };
  const tokens = (appName && APP_TOKENS[appName]) ? APP_TOKENS[appName] : (store.config.maxTokens || 1000);

  if (store.config.apiSource === 'profile' && store.config.connectionProfile) {
    const messages = [
      { role: 'user', content: systemPrompt },
      { role: 'assistant', content: '알겠습니다. 위 설정을 숙지했습니다.' },
      { role: 'user', content: userPrompt || ' ' },
    ];
    try {
      const response = await c.ConnectionManagerRequestService.sendRequest(
        store.config.connectionProfile, messages, tokens,
        { stream: false, extractData: true, includePreset: true, includeInstruct: false }
      );
      if (typeof response === 'string' && response.trim()) return response;
      if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content;
      if (response?.content?.[0]?.text) return response.content[0].text;
      if (response?.content) return response.content;
      if (response?.message) return response.message;
      if (response?.text) return response.text;
      throw new Error('unknown response structure');
    } catch(e) {
      console.warn(`[${MODULE_NAME}] profile generate failed, fallback to main`, e);
    }
  }
  return await c.generateRaw({
    systemPrompt: systemPrompt || '',
    prompt: userPrompt || '',
    max_new_tokens: tokens,
    streaming: false,
  });
}

function getCurrentCharName() { try { return ctx().name2 || '{{char}}'; } catch(e) { return '{{char}}'; } }
function getCurrentUserName()  { try { return ctx().name1 || '{{user}}'; } catch(e) { return '{{user}}'; } }
function getCharDescription() {
  try {
    const c = ctx();
    if (c.characters && c.characterId !== undefined) {
      const ch = c.characters[c.characterId];
      if (ch) return [ch.description, ch.personality, ch.scenario, ch.mes_example].filter(Boolean).join('\n').trim();
    }
    return '';
  } catch(e) { return ''; }
}
function getUserPersona() {
  try { const c = ctx(); return c.persona || c?.powerUserSettings?.persona_description || ''; } catch(e) { return ''; }
}
function getRecentChat(limit) {
  try { const { chat } = ctx(); return (chat||[]).slice(-(limit||10)).map(m => ({ role:m.is_user?'user':'assistant', content:m.mes||'', name:m.name||'' })); }
  catch(e) { return []; }
}
function getChatRange(s, e) {
  try {
    const { chat } = ctx(), arr = chat||[];
    if (!s && !e) return getRecentChat(10);
    const si = s ? Math.max(1,parseInt(s)) : 1, ei = e ? Math.min(arr.length,parseInt(e)) : arr.length;
    return arr.slice(si-1,ei).map(m => ({ role:m.is_user?'user':'assistant', content:m.mes||'', name:m.name||'' }));
  } catch(e) { return getRecentChat(10); }
}

// ── ST 설정 패널
function renderSettingsPanel() {
  const store = getStore();
  $('#extensions_settings2').append(`
    <div id="pcv-settings-panel">
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>🍑 P&amp;C Vault</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
          <div style="margin-bottom:10px;">
            <label style="font-size:13px;font-weight:500;">API 소스</label>
            <select id="pcv-api-source" class="text_pole" style="margin-top:4px;">
              <option value="main" ${store.config.apiSource==='main'?'selected':''}>Main API</option>
              <option value="profile" ${store.config.apiSource==='profile'?'selected':''}>Connection Profile</option>
            </select>
          </div>
          <div id="pcv-profile-wrap" style="margin-bottom:10px;display:${store.config.apiSource==='profile'?'block':'none'};">
            <label style="font-size:13px;font-weight:500;">Connection Profile</label>
            <select id="pcv-profile-select" class="text_pole" style="margin-top:4px;"></select>
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:13px;font-weight:500;">최대 토큰</label>
            <input id="pcv-max-tokens" type="number" value="${store.config.maxTokens||1000}" min="100" max="8000" class="text_pole" style="width:80px;margin-top:4px;"/>
          </div>
          <hr>
          <small style="color:#888;">요술봉 메뉴에서 🍑 P&amp;C Vault를 클릭해 여세요.</small>
        </div>
      </div>
    </div>
  `);

  $('#pcv-api-source').on('change', function() {
    getStore().config.apiSource = $(this).val();
    saveStore();
    $('#pcv-profile-wrap').toggle($(this).val() === 'profile');
  });

  // ConnectionManagerRequestService 드롭다운
  try {
    ctx().ConnectionManagerRequestService.handleDropdown(
      '#pcv-profile-select',
      store.config.connectionProfile,
      (profile) => {
        getStore().config.connectionProfile = profile?.id ?? '';
        saveStore();
      }
    );
  } catch(e) {
    console.warn(`[${MODULE_NAME}] ConnectionManagerRequestService not available`, e);
  }

  $('#pcv-max-tokens').on('change', function() {
    getStore().config.maxTokens = parseInt($(this).val()) || 1000;
    saveStore();
  });
}

function addWandMenuItem() {
  const $item = $(`<div id="pcv-wand-btn" class="list-group-item flex-container flexGap5"><span>🍑</span><span>P&amp;C Vault</span></div>`);
  $item.on('click', function() { $('#extensionsMenu').hide(); openVaultHub(); });
  $('#extensionsMenu').append($item);
}

const POPUP_ID = 'pcv-popup-overlay';

async function openVaultHub() {
  if ($(`#${POPUP_ID}`).length) return;

  const charStore  = getCharStore();
  const coreStore  = getCoreStore();
  const merged     = { ...coreStore, ...charStore };

  const bridgeData = {
    __PC_STORE__:          merged,
    __PC_GLOBAL_STORE__:   getStore(),
    __PC_CLOSE__:          closeVaultHub,
    __PC_GENERATE__:       (sys, usr, app) => generateWithRole(sys, usr, app),
    __PC_GET_CHAT__:       getRecentChat,
    __PC_GET_CHAT_RANGE__: getChatRange,
    __PC_CHAR__:           getCurrentCharName(),
    __PC_USER__:           getCurrentUserName(),
    __PC_CHAR_DESC__:      getCharDescription(),
    __PC_USER_PERSONA__:   getUserPersona(),
    __PC_SAVE__:           saveStore,
    __PC_REFRESH_PROMPT__: () => {},
    __PC_CHAR_KEY__:       getCharKey(),
    __PC_CHAR_REACTION__:  '',
    __PC_APP_TOKENS__:     {},
  };
  Object.assign(window, bridgeData);

  const extUrl = `scripts/extensions/third-party/${MODULE_NAME}/main.html`;
  const mobile = isMobile();

  const overlay = document.createElement('div');
  overlay.id = POPUP_ID;
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;z-index:9999;display:flex;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);${mobile?'align-items:flex-end;justify-content:center;':'align-items:center;justify-content:center;'}`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeVaultHub(); });
  overlay.addEventListener('touchstart', e => { if (e.target === overlay) closeVaultHub(); }, { passive: true });

  const wrap = document.createElement('div');
  wrap.id = 'pcv-popup-wrap';
  wrap.style.cssText = mobile
    ? 'position:relative;width:100%;height:92vh;height:92dvh;border-radius:24px 24px 0 0;overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,0.4);'
    : 'position:relative;width:min(460px,92vw);height:min(90vh,800px);border-radius:24px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.5);';

  const iframe = document.createElement('iframe');
  iframe.src = extUrl;
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
  iframe.id = 'pcv-iframe';
  window.__PCV_IFRAME__ = iframe;

  iframe.addEventListener('load', function() {
    try {
      const iw = iframe.contentWindow;
      Object.assign(iw, bridgeData);
      if (typeof iw.__PC_ON_BRIDGE__ === 'function') iw.__PC_ON_BRIDGE__();
    } catch(e) { console.error(`[${MODULE_NAME}] bridge error`, e); }
  });

  wrap.appendChild(iframe);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);
}

function closeVaultHub() {
  $(`#${POPUP_ID}`).remove();
  window.__PCV_IFRAME__ = null;
}

(async function init() {
  getStore();
  renderSettingsPanel();
  addWandMenuItem();

  const { eventSource, event_types } = ctx();
  eventSource.on(event_types.CHAT_CHANGED, () => {
    try {
      const iw = window.__PCV_IFRAME__?.contentWindow;
      if (iw) {
        const merged = { ...getCoreStore(), ...getCharStore() };
        const newKey = getCharKey(), newName = getCurrentCharName();
        Object.assign(iw, {
          __PC_STORE__:        merged,
          __PC_CHAR_KEY__:     newKey,
          __PC_CHAR__:         newName,
          __PC_USER__:         getCurrentUserName(),
          __PC_CHAR_DESC__:    getCharDescription(),
          __PC_USER_PERSONA__: getUserPersona(),
        });
        Object.assign(window, { __PC_STORE__: merged, __PC_CHAR_KEY__: newKey, __PC_CHAR__: newName });
        if (typeof iw.router?.go === 'function') iw.router.go('vault');
      }
    } catch(e) { console.warn(`[${MODULE_NAME}] CHAT_CHANGED error`, e); }
  });

  console.log(`[${MODULE_NAME}] v1.1 로드 완료`);
})();
