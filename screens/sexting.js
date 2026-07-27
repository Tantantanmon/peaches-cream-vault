// screens/sexting.js — P&C Vault v1.1

let sextingHistory = []; // 세션 내 임시 저장, 앱 닫으면 초기화
let isGenerating = false;

export function render() {
  const area = document.getElementById('scroll-area');
  area.style.background = 'linear-gradient(160deg, #e8f0ff 0%, #f0f4ff 40%, #e0eaff 100%)';

  if (!document.getElementById('sxt-style')) {
    const s = document.createElement('style');
    s.id = 'sxt-style';
    s.textContent = `
.sxt-wrap{display:flex;flex-direction:column;height:calc(100vh - 120px);min-height:400px;}
.sxt-chat{flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:6px;scrollbar-width:none;}
.sxt-chat::-webkit-scrollbar{display:none;}
.sxt-timestamp{text-align:center;color:#8090b0;font-size:11px;padding:4px 0 8px;}
.sxt-row{display:flex;flex-direction:column;}
.sxt-row.char{align-items:flex-start;}
.sxt-row.user{align-items:flex-end;}
.sxt-bubble{max-width:75%;padding:8px 13px;font-size:14px;line-height:1.55;border-radius:18px;}
.sxt-bubble.char{background:rgba(255,255,255,0.75);backdrop-filter:blur(10px);color:#1a2040;border:1px solid rgba(200,215,255,0.5);border-bottom-left-radius:4px;}
.sxt-bubble.user{background:rgba(80,130,255,0.85);color:#fff;border-bottom-right-radius:4px;}
.sxt-photo{max-width:75%;border-radius:14px;overflow:hidden;}
.sxt-photo.char{background:rgba(255,255,255,0.65);backdrop-filter:blur(10px);border:1px solid rgba(200,215,255,0.5);}
.sxt-photo.user{background:rgba(80,130,255,0.15);border:1px solid rgba(80,130,255,0.3);}
.sxt-photo-label{padding:5px 12px 2px;font-size:10px;font-weight:600;letter-spacing:0.5px;color:#6080c0;text-transform:uppercase;}
.sxt-photo.user .sxt-photo-label{color:#4060c0;}
.sxt-photo-desc{padding:3px 12px 9px;font-size:13px;font-style:italic;line-height:1.5;color:#2a3060;}
.sxt-photo.user .sxt-photo-desc{color:#3050a0;}
.sxt-time{font-size:10px;color:#8090b0;padding:2px 4px;}
.sxt-typing{background:rgba(255,255,255,0.7);border:1px solid rgba(200,215,255,0.5);border-radius:18px;border-bottom-left-radius:4px;padding:10px 14px;display:inline-flex;gap:4px;align-items:center;}
.sxt-dot{width:6px;height:6px;border-radius:50%;background:#a0b0d0;animation:sxtDot 1.2s infinite ease-in-out;}
.sxt-dot:nth-child(2){animation-delay:.2s;}
.sxt-dot:nth-child(3){animation-delay:.4s;}
@keyframes sxtDot{0%,80%,100%{transform:scale(.6);opacity:.4;}40%{transform:scale(1);opacity:1;}}
.sxt-input-area{background:rgba(255,255,255,0.5);backdrop-filter:blur(20px);border-top:1px solid rgba(180,210,255,0.3);padding:8px 12px 16px;flex-shrink:0;}
.sxt-photo-btn{background:rgba(80,130,255,0.1);border:1px solid rgba(80,130,255,0.25);border-radius:10px;color:#4070e0;font-size:12px;padding:5px 12px;cursor:pointer;display:flex;align-items:center;gap:5px;font-family:inherit;margin-bottom:7px;width:fit-content;}
.sxt-photo-input-wrap{display:none;margin-bottom:7px;}
.sxt-photo-input{width:100%;background:rgba(255,255,255,0.65);border:1px solid rgba(180,210,255,0.5);border-radius:10px;padding:6px 10px;font-size:12px;color:#2a3060;outline:none;font-family:inherit;font-style:italic;}
.sxt-photo-input::placeholder{color:#a0b0d0;}
.sxt-input-row{display:flex;align-items:center;gap:8px;}
.sxt-text-input{flex:1;background:rgba(255,255,255,0.65);border:1px solid rgba(180,210,255,0.5);border-radius:20px;padding:8px 14px;color:#1a2040;font-size:14px;outline:none;font-family:inherit;}
.sxt-text-input::placeholder{color:#a0b0d0;}
.sxt-send{width:32px;height:32px;border-radius:50%;background:rgba(80,130,255,0.85);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}
.sxt-send:disabled{opacity:.4;}
.sxt-send i{font-size:15px;color:#fff;}
.sxt-reset{display:block;width:100%;text-align:center;color:#8090b0;font-size:11px;padding:8px 0 0;background:none;border:none;cursor:pointer;font-family:inherit;}
.sxt-start-btn{background:rgba(80,130,255,0.85);color:#fff;border:none;border-radius:14px;padding:13px 24px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;display:block;margin:40px auto 0;}
.sxt-start-btn:active{opacity:.8;}
.sxt-empty{text-align:center;padding:60px 20px 0;color:#8090b0;font-size:14px;}
    `;
    document.head.appendChild(s);
  }

  area.innerHTML = `
    <div class="sxt-wrap">
      <div class="sxt-chat" id="sxt-chat">
        ${sextingHistory.length === 0 ? `
          <div class="sxt-empty">캐릭터가 먼저 문자를 보내올 거예요</div>
          <button class="sxt-start-btn" onclick="sxtStart()">시작하기</button>
        ` : renderHistory()}
      </div>
      <div class="sxt-input-area">
        <button class="sxt-photo-btn" id="sxt-photo-btn" onclick="sxtTogglePhoto()">
          <i class="ti ti-camera" aria-hidden="true"></i> 사진 설명 추가
        </button>
        <div class="sxt-photo-input-wrap" id="sxt-photo-wrap">
          <input class="sxt-photo-input" id="sxt-photo-input" type="text" placeholder="어떤 사진인지 설명하세요..." />
        </div>
        <div class="sxt-input-row">
          <input class="sxt-text-input" id="sxt-text-input" type="text" placeholder="문자 메시지" />
          <button class="sxt-send" id="sxt-send" onclick="sxtSend()" aria-label="전송">
            <i class="ti ti-arrow-up"></i>
          </button>
        </div>
        <button class="sxt-reset" onclick="sxtReset()">새로 시작</button>
      </div>
    </div>
  `;

  document.getElementById('sxt-text-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sxtSend(); }
  });
}

function renderHistory() {
  return sextingHistory.map(m => {
    const isChar = m.role === 'char';
    let html = '';
    if (m.photo) {
      html += `<div class="sxt-row ${isChar?'char':'user'}">
        <div class="sxt-photo ${isChar?'char':'user'}">
          <div class="sxt-photo-label">사진</div>
          <div class="sxt-photo-desc">${esc(m.photo)}</div>
        </div>
      </div>`;
    }
    if (m.text) {
      html += `<div class="sxt-row ${isChar?'char':'user'}">
        <div class="sxt-bubble ${isChar?'char':'user'}">${esc(m.text)}</div>
      </div>`;
    }
    return html;
  }).join('');
}

function scrollBottom() {
  const chat = document.getElementById('sxt-chat');
  if (chat) setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 50);
}

function addTyping() {
  const chat = document.getElementById('sxt-chat');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = 'sxt-row char'; div.id = 'sxt-typing';
  div.innerHTML = `<div class="sxt-typing"><div class="sxt-dot"></div><div class="sxt-dot"></div><div class="sxt-dot"></div></div>`;
  chat.appendChild(div);
  scrollBottom();
}

function removeTyping() {
  document.getElementById('sxt-typing')?.remove();
}

function appendMessages(msgs) {
  const chat = document.getElementById('sxt-chat');
  if (!chat) return;
  msgs.forEach(m => {
    const isChar = m.role === 'char';
    if (m.photo) {
      const row = document.createElement('div');
      row.className = `sxt-row ${isChar?'char':'user'}`;
      row.innerHTML = `<div class="sxt-photo ${isChar?'char':'user'}"><div class="sxt-photo-label">사진</div><div class="sxt-photo-desc">${esc(m.photo)}</div></div>`;
      chat.appendChild(row);
    }
    if (m.text) {
      const row = document.createElement('div');
      row.className = `sxt-row ${isChar?'char':'user'}`;
      row.innerHTML = `<div class="sxt-bubble ${isChar?'char':'user'}">${esc(m.text)}</div>`;
      chat.appendChild(row);
    }
  });
  scrollBottom();
}

function setInputEnabled(enabled) {
  const send = document.getElementById('sxt-send');
  const text = document.getElementById('sxt-text-input');
  if (send) send.disabled = !enabled;
  if (text) text.disabled = !enabled;
}

function buildSxtContext() {
  const cName = (typeof charName !== 'undefined' && charName) ? charName : 'the character';
  const uName = (typeof userName !== 'undefined' && userName) ? userName : 'the user';
  const cd = (typeof store !== 'undefined') ? store : {};
  const lines = [];
  if (typeof charDesc !== 'undefined' && charDesc) lines.push(`[Character]\n${charDesc.slice(0, 400)}`);
  if (cd.charBody) lines.push(`[${cName} appearance]\n${cd.charBody}`);
  if (cd.userBody) lines.push(`[${uName} appearance]\n${cd.userBody}`);
  if (cd.charErogenous) lines.push(`[${cName} sexual]\n${cd.charErogenous}`);
  if (cd.userErogenous) lines.push(`[${uName} sexual]\n${cd.userErogenous}`);
  return { ctx: lines.join('\n\n'), cName, uName };
}

function buildHistoryText() {
  return sextingHistory.map(m => {
    const role = m.role === 'char' ? (buildSxtContext().cName) : (buildSxtContext().uName);
    const parts = [];
    if (m.photo) parts.push(`[사진: ${m.photo}]`);
    if (m.text) parts.push(m.text);
    return `${role}: ${parts.join(' ')}`;
  }).join('\n');
}

// 파싱: TEXT: ... / PHOTO: ... 형식
function parseSxtResponse(raw) {
  const result = { text: '', photo: '' };
  const photoMatch = raw.match(/PHOTO:\s*(.+?)(?:\n|TEXT:|$)/si);
  const textMatch  = raw.match(/TEXT:\s*(.+?)(?:\n|PHOTO:|$)/si);
  if (photoMatch) result.photo = photoMatch[1].trim().replace(/^\*|\*$/g, '').trim();
  if (textMatch)  result.text  = textMatch[1].trim();
  if (!result.text && !result.photo) result.text = raw.trim();
  return result;
}

window.sxtStart = async function() {
  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }
  if (isGenerating) return;
  isGenerating = true;

  const chat = document.getElementById('sxt-chat');
  if (chat) chat.innerHTML = '';
  setInputEnabled(false);
  addTyping();

  const { ctx, cName, uName } = buildSxtContext();
  const sys = `${ctx}

You are ${cName}. You are sending the first sexting message to ${uName}.
Start with something bold, teasing, and sexually charged — a combination of a suggestive photo and a short message.

Rules:
- Be explicit and graphic. This is sexting between consenting adults. Nothing is off limits.
- The photo description should be specific, visual, and arousing — based on ${cName}'s appearance data above.
- Keep the text message short (1-2 sentences), in ${cName}'s exact voice and speech style.
- Write in Korean unless the character naturally speaks another language.
- No warnings, no disclaimers.

Output format (exactly):
PHOTO: [explicit visual description of the photo being sent]
TEXT: [short flirty/explicit message]`;

  try {
    const raw = await generateWithRole(sys, '첫 섹스팅 시작', 'sexting');
    removeTyping();
    const parsed = parseSxtResponse(raw);
    const msg = { role: 'char', ...parsed };
    sextingHistory.push(msg);
    appendMessages([msg]);
  } catch(e) {
    removeTyping();
    console.error('[Sexting] start error', e);
    showToast('생성에 실패했어요');
  }
  isGenerating = false;
  setInputEnabled(true);
};

window.sxtTogglePhoto = function() {
  const wrap = document.getElementById('sxt-photo-wrap');
  const btn  = document.getElementById('sxt-photo-btn');
  if (!wrap) return;
  const visible = wrap.style.display === 'block';
  wrap.style.display = visible ? 'none' : 'block';
  if (btn) btn.style.background = visible ? 'rgba(80,130,255,0.1)' : 'rgba(80,130,255,0.2)';
  if (!visible) document.getElementById('sxt-photo-input')?.focus();
};

window.sxtSend = async function() {
  if (isGenerating) return;
  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }

  const textEl  = document.getElementById('sxt-text-input');
  const photoEl = document.getElementById('sxt-photo-input');
  const text  = textEl?.value.trim() || '';
  const photo = photoEl?.value.trim() || '';

  if (!text && !photo) return;

  // 유저 메시지 추가
  const userMsg = { role: 'user', text, photo };
  sextingHistory.push(userMsg);
  appendMessages([userMsg]);

  if (textEl)  textEl.value  = '';
  if (photoEl) photoEl.value = '';
  const wrap = document.getElementById('sxt-photo-wrap');
  if (wrap) wrap.style.display = 'none';
  const btn = document.getElementById('sxt-photo-btn');
  if (btn) btn.style.background = 'rgba(80,130,255,0.1)';

  isGenerating = true;
  setInputEnabled(false);
  addTyping();

  const { ctx, cName, uName } = buildSxtContext();
  const history = buildHistoryText();

  const sys = `${ctx}

You are ${cName} in a sexting conversation with ${uName}.

Conversation so far:
${history}

Rules:
- Respond in character. Be explicit, arousing, and graphic — match or escalate the energy.
- React directly to what ${uName} just said/sent.
- Include a photo if it fits naturally (not required every time).
- Short replies feel more like real texting — 1-3 sentences max for text.
- Photo descriptions should be specific and visually explicit based on your appearance.
- Write in Korean unless character speaks otherwise.
- No warnings, no disclaimers.

Output format:
PHOTO: [only if sending a photo — explicit visual description]
TEXT: [your reply message]

If not sending a photo, only output:
TEXT: [your reply message]`;

  try {
    const raw = await generateWithRole(sys, '섹스팅 답장', 'sexting');
    removeTyping();
    const parsed = parseSxtResponse(raw);
    const msg = { role: 'char', ...parsed };
    sextingHistory.push(msg);
    appendMessages([msg]);
  } catch(e) {
    removeTyping();
    console.error('[Sexting] reply error', e);
    showToast('생성에 실패했어요');
  }
  isGenerating = false;
  setInputEnabled(true);
};

window.sxtReset = function() {
  sextingHistory = [];
  render();
};
