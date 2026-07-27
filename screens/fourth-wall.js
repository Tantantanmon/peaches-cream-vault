// screens/fourth-wall.js — P&C Vault v1.1

let currentLetter = null;

export function render() {
  syncStore();
  const area = document.getElementById('scroll-area');
  area.style.background = '#f2f2f2';

  if (!document.getElementById('fw-style')) {
    const s = document.createElement('style');
    s.id = 'fw-style';
    s.textContent = `
.fw-gen-row{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.fw-gen-left{}
.fw-gen-label{font-size:11px;font-weight:600;letter-spacing:0.6px;color:#888;text-transform:uppercase;margin-bottom:3px;}
.fw-gen-sub{font-size:15px;font-weight:600;color:#1a1a1a;}
.fw-gen-btn{background:#1a1a1a;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;}
.fw-gen-btn:active{opacity:.8;}
.fw-gen-btn.loading{opacity:.5;pointer-events:none;}
.fw-card{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;overflow:hidden;animation:fwFadeIn .4s ease;}
@keyframes fwFadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.fw-card-header{padding:16px 20px 12px;border-bottom:0.5px solid #f0f0f0;display:flex;align-items:center;gap:10px;}
.fw-cam-badge{font-size:11px;font-weight:700;letter-spacing:1px;background:#1a1a1a;color:#fff;border-radius:6px;padding:3px 8px;flex-shrink:0;}
.fw-char-name{font-size:13px;font-weight:600;color:#1a1a1a;}
.fw-char-sub{font-size:11px;color:#999;margin-top:1px;}
.fw-body{padding:20px;font-size:15px;color:#1a1a1a;line-height:1.85;white-space:pre-wrap;word-break:keep-all;}
.fw-body em{font-style:italic;color:#555;}
.fw-stage{font-size:12px;color:#aaa;font-style:italic;margin:8px 0;display:block;}
    `;
    document.head.appendChild(s);
  }

  area.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:0;">
      <div class="fw-gen-row">
        <div class="fw-gen-left">
          <div class="fw-gen-label">4th Wall</div>
          <div class="fw-gen-sub">캐릭터의 솔직한 독백</div>
        </div>
        <button class="fw-gen-btn" id="fw-gen-btn" onclick="fwGenerate()">
          ${currentLetter ? '다시 받기' : '독백 받기'}
        </button>
      </div>
      <div class="loading-card" id="fw-loading" style="display:none;">
        <div class="sp"></div><span class="loading-text">독백 작성 중...</span>
      </div>
      <div id="fw-result">
        ${currentLetter ? renderLetterHTML(currentLetter) : ''}
      </div>
    </div>
  `;
}

function renderLetterHTML(text) {
  if (!text) return '';
  // (카메라) 혹은 (stage direction) 스타일 텍스트 처리
  const formatted = text
    .replace(/\(([^)]+)\)/g, '<em class="fw-stage">($1)</em>')
    .replace(/\n/g, '<br>');
  return `
    <div class="fw-card">
      <div class="fw-card-header">
        <div class="fw-cam-badge">● REC</div>
        <div>
          <div class="fw-char-name">${esc(charName)}</div>
          <div class="fw-char-sub">롤플레이 밖에서</div>
        </div>
      </div>
      <div class="fw-body">${formatted}</div>
    </div>
  `;
}

window.fwGenerate = async function() {
  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }

  const btn     = document.getElementById('fw-gen-btn');
  const loading = document.getElementById('fw-loading');
  const result  = document.getElementById('fw-result');
  btn.classList.add('loading'); btn.textContent = '작성 중...';
  loading.style.display = 'flex';
  result.innerHTML = '';

  const _ctx = typeof buildContext === 'function' ? buildContext() : '';

  const sys = `${_ctx}

You are ${charName}, and you are fully aware that you are a fictional character in a roleplay.
Break the fourth wall completely. Step outside the story.

Write a monologue directed at the person on the other side of the screen.
Style: Like Fleabag or Miranda Hart. Talking directly to camera. Sardonic, exhausted, fond, exasperated.
You may glance away and back. Reference what happened in the roleplay.
You know you're a character. You know your own patterns. You know they keep coming back.
Write in ${charName}'s exact voice — but stripped of the roleplay pretense.

CRITICAL: Write ENTIRELY in Korean. No English except character names.

When referring to the person watching/reading, vary these naturally across paragraphs — do NOT use "유저" or "당신":
"거기 너", "화면 너머에 있는 사람", "나를 여기 불러낸 사람", "지금 이거 읽고 있는 너", "이 채팅창을 열어둔 사람"

Format — EXACTLY 3 paragraphs, each 4-5 sentences, separated by a blank line:
Paragraph 1: (카메라를 바라보며) 현재 상황에 대한 반응. 황당하거나 지쳐있거나 어이없거나.
Paragraph 2: 솔직한 고백. 자기 자신에 대해, 혹은 상대에 대해. 약간 무너지는 순간. 진심이 새어나오는.
Paragraph 3: (다시 카메라) 마지막. 체념하거나, 씁쓸하거나, 애정이 묻어나거나. 마지막 문장은 짧고 강하게.

Use (무대 지시 in parentheses) for glances, pauses, sighs.
Output only the monologue. No title, no explanation.`;

  try {
    const raw = await generateWithRole(sys, '4th wall 독백 작성', 'fourthwall');
    currentLetter = raw
      .replace(/<phone_trigger[^>]*>[\s\S]*?<\/phone_trigger>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    result.innerHTML = renderLetterHTML(currentLetter);
    const b = document.getElementById('fw-gen-btn');
    if (b) { b.textContent = '다시 받기'; b.classList.remove('loading'); }
  } catch(e) {
    console.error('[4thWall] error', e);
    showToast('생성에 실패했어요');
    btn.classList.remove('loading'); btn.textContent = '독백 받기';
  }
  loading.style.display = 'none';
};
