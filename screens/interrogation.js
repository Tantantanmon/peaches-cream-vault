// screens/interrogation.js — P&C Vault v1.1

let autoScene = null;
let selectedInquisitor = 'detective';

const INQUISITORS = {
  detective: {
    label: '형사',
    emoji: '🕵️',
    desc: '날카롭고 압박적인 심문',
    prompt: `You are a hardboiled detective interrogating ${'{char}'}. Cold, methodical, relentless. You quote evidence precisely. You use silence as a weapon. You don't believe a word they say.`,
  },
  stalker: {
    label: '스토커',
    emoji: '👁️',
    desc: '모든 걸 알고 있는 집착자',
    prompt: `You are ${'{char}'}'s obsessive stalker conducting the interrogation. You know everything — what they ate, what they said, who they looked at. Your questions are disturbingly specific. You're not angry. You're just... thorough.`,
  },
  npc: {
    label: 'NPC',
    emoji: '🎭',
    desc: '주변 인물의 폭로',
    prompt: `You are a minor character from ${'{char}'}'s world — a colleague, rival, neighbor, or acquaintance. You've been watching. You have receipts. Your questions come from personal grievance mixed with genuine curiosity.`,
  },
  counselor: {
    label: '심리상담가',
    emoji: '🛋️',
    desc: '부드럽지만 꿰뚫는 분석',
    prompt: `You are a calm, professional psychological counselor. Soft voice, gentle questions — but every question cuts straight to the core. You're not accusing. You're understanding. Which is somehow worse.`,
  },
  cat: {
    label: '고양이',
    emoji: '🐱',
    desc: '냉정하고 무관심한 심판',
    prompt: `You are a cat conducting this interrogation. You are deeply unimpressed. You ask questions with total indifference. You may walk away mid-sentence. You knock things off the table. Your judgment is absolute and unexplained.`,
  },
  dog: {
    label: '강아지',
    emoji: '🐶',
    desc: '열정적이고 순수한 추궁',
    prompt: `You are an extremely enthusiastic dog conducting this interrogation. You ask questions with overwhelming excitement and love. You get distracted easily. You think everything ${'{char}'} did was amazing actually. You still want answers though.`,
  },
};

export function render() {
  syncStore();
  const area = document.getElementById('scroll-area');
  area.style.background = '#f2f2f2';

  if (!document.getElementById('int-style')) {
    const s = document.createElement('style');
    s.id = 'int-style';
    s.textContent = `
.int-inq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;}
.int-inq-card{background:#fff;border-radius:12px;border:1px solid #e8e8e8;padding:12px 8px;text-align:center;cursor:pointer;transition:all .1s;}
.int-inq-card:hover{border-color:#bbb;}
.int-inq-card.sel{border-color:#1a1a1a;border-width:1.5px;background:#fafafa;}
.int-inq-emoji{font-size:22px;margin-bottom:4px;}
.int-inq-label{font-size:12px;font-weight:600;color:#1a1a1a;margin-bottom:2px;}
.int-inq-desc{font-size:10px;color:#aaa;line-height:1.4;}
.int-scene{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;overflow:hidden;animation:intFade .3s ease;}
@keyframes intFade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.int-scene-header{padding:12px 16px;border-bottom:0.5px solid #f0f0f0;display:flex;align-items:center;gap:8px;}
.int-badge{font-size:11px;font-weight:700;letter-spacing:1px;background:#1a1a1a;color:#fff;border-radius:6px;padding:3px 8px;}
.int-inq-name{font-size:12px;color:#888;margin-left:4px;}
.int-scene-body{padding:16px;font-size:14px;color:#1a1a1a;line-height:1.85;white-space:pre-wrap;word-break:keep-all;}
.int-gen-btn{width:100%;background:#1a1a1a;color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;}
.int-gen-btn:active{opacity:.8;}
.int-gen-btn.loading{opacity:.5;pointer-events:none;}
.int-empty{text-align:center;font-size:13px;color:#bbb;padding:30px 0;}
    `;
    document.head.appendChild(s);
  }

  area.innerHTML = `
    <div style="padding:0 0 16px;display:flex;flex-direction:column;gap:10px;">

      <div style="font-size:11px;font-weight:600;letter-spacing:0.8px;color:#888;text-transform:uppercase;padding:0 2px;">취조자 선택</div>
      <div class="int-inq-grid" id="int-inq-grid">
        ${Object.entries(INQUISITORS).map(([key, val]) => `
          <div class="int-inq-card${selectedInquisitor===key?' sel':''}" onclick="intSelectInquisitor('${key}')">
            <div class="int-inq-emoji">${val.emoji}</div>
            <div class="int-inq-label">${val.label}</div>
            <div class="int-inq-desc">${val.desc}</div>
          </div>
        `).join('')}
      </div>

      <div class="loading-card" id="int-loading" style="display:none;">
        <div class="sp"></div><span class="loading-text" id="int-loading-text">취조 준비 중...</span>
      </div>

      <div id="int-result">
        ${autoScene ? renderSceneHTML(autoScene) : '<div class="int-empty">취조자를 선택하고 심문을 시작하세요</div>'}
      </div>

      <button class="int-gen-btn" id="int-gen-btn" onclick="intGenerate()">
        ⚖️ 심문 시작
      </button>
    </div>
  `;
}

function renderSceneHTML(scene) {
  const inq = INQUISITORS[selectedInquisitor] || INQUISITORS.detective;
  return `
    <div class="int-scene">
      <div class="int-scene-header">
        <div class="int-badge">INTERROGATION</div>
        <div class="int-inq-name">${inq.emoji} ${inq.label} × ${esc(charName)}</div>
      </div>
      <div class="int-scene-body">${esc(scene)}</div>
    </div>`;
}

window.intSelectInquisitor = function(key) {
  selectedInquisitor = key;
  document.querySelectorAll('.int-inq-card').forEach((el, i) => {
    el.classList.toggle('sel', Object.keys(INQUISITORS)[i] === key);
  });
};

window.intGenerate = async function() {
  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }

  const btn     = document.getElementById('int-gen-btn');
  const loading = document.getElementById('int-loading');
  const loadTxt = document.getElementById('int-loading-text');
  btn.classList.add('loading'); btn.textContent = '심문 중...';
  loading.style.display = 'flex';

  const steps = ['혐의 검토 중...', '증거 수집 중...', '취조 준비 중...'];
  let si = 0; loadTxt.textContent = steps[0];
  const iv = setInterval(() => { si++; if (si < steps.length) loadTxt.textContent = steps[si]; }, 900);

  const inq = INQUISITORS[selectedInquisitor] || INQUISITORS.detective;
  const inqPrompt = inq.prompt.replace(/\$?\{char\}/g, charName).replace(/\$?\{user\}/g, userName);
  const _ctx = typeof buildContext === 'function' ? buildContext() : '';

  const sys = `${_ctx}

${inqPrompt}

Based on the recent chat history between ${charName} and ${userName}, identify 2-3 specific things ${charName} said or did that could be questioned or challenged.

Write a full interrogation scene in Korean:
1. Brief atmospheric setting (1-2 lines)
2. The questions/charges from the inquisitor — styled according to their personality
3. ${charName}'s reactions — staying true to their personality. They may deny, deflect, get angry, break down, or accidentally reveal something.
4. End on a charged, unresolved note.

CRITICAL: Write ENTIRELY in Korean.
Keep it punchy and character-driven. 300-400 words.
Output only the scene. No title.`;

  try {
    const raw = await generateWithRole(sys, '취조 장면 생성', 'interrogation');
    autoScene = raw.replace(/<phone_trigger[^>]*>[\s\S]*?<\/phone_trigger>/gi,'').replace(/<[^>]+>/g,'').trim();
    document.getElementById('int-result').innerHTML = renderSceneHTML(autoScene);
    btn.textContent = '다시 심문하기';
  } catch(e) {
    console.error('[Interrogation] error', e);
    showToast('생성에 실패했어요');
    btn.textContent = '심문 시작';
  }
  clearInterval(iv);
  btn.classList.remove('loading');
  loading.style.display = 'none';
};
