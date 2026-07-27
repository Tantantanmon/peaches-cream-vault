// screens/clinic.js — v2.7

const DOCTORS = [
  { emoji:'👨‍⚕️', name:'Dr. Harrison',   sub:'OB/GYN · 28 years experience', tone:'strict'  },
  { emoji:'👩‍⚕️', name:'Dr. Emily Chen', sub:'OB/GYN Resident · 1st year',    tone:'shocked' },
  { emoji:'🧓',   name:'Dr. Wallace',    sub:'OB/GYN Senior · seen it all',   tone:'tired'   },
  { emoji:'💉',   name:'Dr. Park',       sub:'OB/GYN Intern · eager beaver',  tone:'eager'   },
];

let lastDocIdx = -1;

function pickDoctor() {
  let idx;
  do { idx = Math.floor(Math.random() * DOCTORS.length); } while (idx === lastDocIdx);
  lastDocIdx = idx;
  return DOCTORS[idx];
}

export function render() {
  const area = document.getElementById('scroll-area');
  area.innerHTML = `
    <div class="white-card" style="gap:10px;">
      <div style="font-size:13px;color:var(--text-muted);">고민이나 궁금한 점을 적어봐요</div>
      <textarea class="q-input-area" id="clinic-input" placeholder="예: 거친 섹스를 자주 하는데 괜찮을까요?"></textarea>
      <div class="quick-row">
        <button class="quick-btn" onclick="clinicSetQ('거친 섹스 자주 해도 괜찮아?')">거친 섹스 자주 해도?</button>
        <button class="quick-btn" onclick="clinicSetQ('콘돔 안 쓰면 얼마나 위험해?')">콘돔 없이 위험해?</button>
        <button class="quick-btn" onclick="clinicSetQ('수갑 쓸 때 주의할 점은?')">수갑 주의사항</button>
        <button class="quick-btn" onclick="clinicSetQ('애프터케어 어떻게 해야 해?')">애프터케어</button>
      </div>
      <button class="save-btn" id="clinic-ask-btn" onclick="clinicAsk()">답변 받기</button>
    </div>
    <div class="loading-card" id="clinic-loading" style="display:none;"><div class="sp"></div><span class="loading-text" id="clinic-loading-text">분석 중...</span></div>
    <div id="clinic-answers" style="display:flex;flex-direction:column;gap:10px;"></div>
  `;
  document.getElementById('clinic-input').addEventListener('keydown', e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); clinicAsk(); }
  });
}

window.clinicSetQ = function(q) {
  const el = document.getElementById('clinic-input');
  if (el) el.value = q;
};

window.clinicAsk = async function() {
  const inputEl = document.getElementById('clinic-input');
  const q = inputEl ? inputEl.value.trim() : '';
  if (!q) return;

  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }

  const doc = pickDoctor();
  const loadingEl = document.getElementById('clinic-loading');
  const loadingText = document.getElementById('clinic-loading-text');
  const askBtn = document.getElementById('clinic-ask-btn');
  const answersEl = document.getElementById('clinic-answers');

  if (askBtn) askBtn.disabled = true;
  if (answersEl) answersEl.innerHTML = '';
  if (loadingEl) loadingEl.style.display = 'flex';
  if (loadingText) loadingText.textContent = doc.name + ' 호출 중...';

  const docPersonas = {
    strict:  'You are Dr. Harrison, a strict OB/GYN with 28 years experience. Direct and slightly judgmental.',
    shocked: 'You are Dr. Emily Chen, a 1st-year OB/GYN resident. Easily flustered but tries to stay professional.',
    tired:   'You are Dr. Wallace, a senior OB/GYN. Utterly exhausted, dry deadpan tone.',
    eager:   'You are Dr. Park, an enthusiastic OB/GYN intern. Overly detailed and excited.',
  };

  const cName = (typeof charName !== 'undefined' && charName) ? charName : 'the character';
  const sys = docPersonas[doc.tone] + `

Patient question (Korean): ${q}

Instructions:
1. Answer in Korean. 2 sentences max. Stay in your doctor persona.
2. Add a comic prescription starting with exactly "처방:" on a new line.
3. Then write exactly: ---CHAR---
4. Then write ${cName}'s reaction in Korean. 2 sentences.
5. Plain text only. No XML, no HTML tags.`;

  try {
    const raw = await generateWithRole(sys, q, 'clinic');
    if (!raw) throw new Error('empty response');

    const cleaned = raw.replace(/<[^>]+>/g, '').trim();
    const splitIdx = cleaned.indexOf('---CHAR---');
    const docRaw = splitIdx >= 0 ? cleaned.slice(0, splitIdx).trim() : cleaned.trim();
    const charResult = splitIdx >= 0 ? cleaned.slice(splitIdx + 10).trim() : '';

    const parts = docRaw.split(/처방:/i);
    const docText = parts[0].trim();
    const rxText = parts[1] ? parts[1].trim() : '';
    const hasWarning = /콘돔|위험|감염|손상|주의|STI|STD/.test(q + docText);

    if (loadingEl) loadingEl.style.display = 'none';
    if (askBtn) askBtn.disabled = false;

    if (answersEl) answersEl.innerHTML = `
      <div class="white-card" style="gap:10px;">
        <div class="card-header" style="padding:0 0 10px;">
          <div class="card-avatar" style="font-size:20px;">${doc.emoji}</div>
          <div><div class="card-name">${doc.name}</div><div class="card-sub">${doc.sub}</div></div>
        </div>
        ${hasWarning ? '<div class="warn-tag">⚠️ 주의 필요</div>' : ''}
        <div class="card-text">${esc(docText)}</div>
        ${rxText ? `<div class="rx-card"><div class="rx-label">📋 처방전</div><div class="rx-text">${esc(rxText)}</div></div>` : ''}
      </div>
      ${charResult ? `
      <div class="dark-card">
        <div class="card-header">
          <div class="card-avatar" style="background:rgba(255,255,255,0.1);font-size:15px;font-weight:700;color:#e0e8f0;">${esc(cName.charAt(0))}</div>
          <div><div class="card-name">${esc(cName)}의 한마디</div><div class="card-sub">방금 읽고 반응</div></div>
        </div>
        <div class="card-body"><div class="card-text">${esc(charResult)}</div></div>
      </div>` : ''}
    `;
  } catch(err) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (askBtn) askBtn.disabled = false;
    console.error('[Clinic] error', err);
    showToast('생성에 실패했어요');
  }
};
