// screens/fanarchive.js — P&C Vault v1.1

let currentFic = null;
let currentReaction = null;

export function render() {
  syncStore();
  const area = document.getElementById('scroll-area');
  area.style.background = 'linear-gradient(160deg,#f8f8f8 0%,#ececec 100%)';

  if (!document.getElementById('fa-style')) {
    const s = document.createElement('style');
    s.id = 'fa-style';
    s.textContent = `
.fa-wrap{display:flex;flex-direction:column;gap:10px;padding:14px;}
.fa-gen-btn{width:100%;background:rgba(30,30,30,0.8);color:#fff;border:none;border-radius:12px;padding:13px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .15s;}
.fa-gen-btn:active{opacity:.8;}
.fa-gen-btn:disabled{opacity:.4;pointer-events:none;}
.fa-sub{text-align:center;font-size:11px;color:#aaa;}
.fa-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:0.5px solid rgba(0,0,0,0.07);border-radius:14px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.04);}
.fa-card-header{padding:12px 14px 10px;}
.fa-rating-badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;background:rgba(0,0,0,0.08);color:#555;margin-bottom:6px;letter-spacing:0.5px;}
.fa-title{font-size:15px;font-weight:500;color:#1a1a1a;line-height:1.4;margin-bottom:5px;}
.fa-author{font-size:11px;color:#aaa;margin-bottom:8px;}
.fa-author span{color:#666;font-weight:500;}
.fa-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;}
.fa-tag{font-size:11px;background:rgba(0,0,0,0.05);border-radius:20px;padding:2px 9px;color:#555;}
.fa-stats{display:flex;gap:10px;font-size:11px;color:#bbb;padding:6px 14px;border-top:0.5px solid rgba(0,0,0,0.05);background:rgba(255,255,255,0.4);}
.fa-body{border-top:0.5px solid rgba(0,0,0,0.05);padding:14px;font-size:14px;line-height:1.85;color:#2a2a2a;white-space:pre-wrap;word-break:keep-all;}
.fa-reaction-card{background:rgba(25,25,25,0.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:14px;padding:14px;}
.fa-reaction-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.fa-reaction-avatar{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:500;flex-shrink:0;}
.fa-reaction-name{font-size:13px;font-weight:500;color:#fff;}
.fa-reaction-sub{font-size:11px;color:rgba(255,255,255,0.35);}
.fa-reaction-text{font-size:14px;color:rgba(255,255,255,0.85);line-height:1.7;white-space:pre-wrap;word-break:keep-all;}
.fa-re-btn{width:100%;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border:0.5px solid rgba(255,255,255,0.15);border-radius:12px;padding:11px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;margin-top:10px;}
.fa-re-btn:active{opacity:.7;}
.fa-empty{text-align:center;color:#bbb;font-size:13px;padding:30px 0;}
    `;
    document.head.appendChild(s);
  }

  const npcs = store.fanFeedConfig?.npcs || [];
  const npcName = npcs.length ? npcs[Math.floor(Math.random() * npcs.length)] : null;
  const cName = (typeof charName !== 'undefined' && charName) ? charName : 'the character';

  area.innerHTML = `
    <div class="fa-wrap">
      <button class="fa-gen-btn" id="fa-gen-btn" onclick="faGenerate()">
        🎲 새 팬픽 뽑기
      </button>
      <div class="fa-sub" id="fa-sub">${npcName ? `${cName} × ${npcName} · 랜덤 조합` : `NPC 없음 — Settings에서 NPC를 등록해주세요`}</div>

      <div class="loading-card" id="fa-loading" style="display:none;">
        <div class="sp"></div><span class="loading-text" id="fa-loading-text">팬픽 작성 중...</span>
      </div>

      <div id="fa-fic-wrap">
        ${currentFic ? renderFicHTML(currentFic) : '<div class="fa-empty">버튼을 눌러 팬픽을 생성해요</div>'}
      </div>

      ${currentReaction ? `
      <div class="fa-reaction-card">
        <div class="fa-reaction-header">
          <div class="fa-reaction-avatar">${esc(cName.charAt(0))}</div>
          <div>
            <div class="fa-reaction-name">${esc(cName)}</div>
            <div class="fa-reaction-sub">방금 읽음</div>
          </div>
        </div>
        <div class="fa-reaction-text">${esc(currentReaction)}</div>
        <button class="fa-re-btn" onclick="faReact()">🔄 다시 반응 받기</button>
      </div>` : currentFic ? `
      <button class="fa-gen-btn" style="background:rgba(60,60,60,0.6);" onclick="faReact()">
        😤 캐릭터 반응 보기
      </button>` : ''}
    </div>
  `;

  window.__fa_npc__ = npcName;
}

function renderFicHTML(fic) {
  return `
    <div class="fa-card">
      <div class="fa-card-header">
        <div class="fa-rating-badge">${esc(fic.rating || 'M')}</div>
        <div class="fa-title">${esc(fic.title || '')}</div>
        <div class="fa-author">by <span>${esc(fic.author || 'anonymous')}</span></div>
        <div class="fa-tags">${(fic.tags||[]).map(t=>`<span class="fa-tag">${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="fa-stats">
        <span>👁 ${fic.views||0}</span>
        <span>❤️ ${fic.likes||0}</span>
        <span>💬 ${fic.comments||0}</span>
      </div>
      <div class="fa-body">${esc(fic.body||'')}</div>
    </div>
  `;
}

window.faGenerate = async function() {
  if (!generateWithRole) { showToast('ST와 연결되지 않았어요'); return; }
  const npcName = window.__fa_npc__;
  if (!npcName) { showToast('Settings에서 NPC를 먼저 등록해주세요'); return; }

  const btn = document.getElementById('fa-gen-btn');
  const loading = document.getElementById('fa-loading');
  const loadTxt = document.getElementById('fa-loading-text');
  const ficWrap = document.getElementById('fa-fic-wrap');
  if (btn) btn.disabled = true;
  if (loading) loading.style.display = 'flex';
  if (ficWrap) ficWrap.innerHTML = '';
  currentReaction = null;

  const steps = ['팬픽 작성 중...', '쓰레기 퀄리티 조정 중...', '마무리 중...'];
  let si = 0;
  const iv = setInterval(() => { si++; if (si<steps.length && loadTxt) loadTxt.textContent = steps[si]; }, 900);

  const cName = (typeof charName !== 'undefined' && charName) ? charName : 'the character';
  const cd = (typeof store !== 'undefined') ? store : {};
  const charInfo = cd.charBody ? `${cName} appearance: ${cd.charBody.slice(0,200)}` : '';

  const sys = `You are writing an intentionally terrible BL (Boys Love) fan fiction.
Characters: ${cName} (main character) × ${npcName} (NPC/side character)
${charInfo}

CRITICAL RULES FOR BADNESS:
- Write in Korean throughout
- The prose must be aggressively, hilariously bad — like the example below
- Use absurd metaphors that make no sense ("his eyes were like tires", "his tongue drove at 300km/h", "his shoulders widened with lust")
- Physically impossible actions described as normal
- Random tonal shifts and non-sequiturs
- Cringe-inducing attempts at sensuality that completely miss the mark
- Melodramatic declarations at random moments
- Characters doing multiple contradictory things simultaneously
- Grammatical oddities and overly literal descriptions
- BUT: maintain ${cName}'s core personality traits (just applied badly)

EXAMPLE OF THE STYLE:
"막스는 그의 짙은 파란색 타이어 같은 눈으로 그녀를 바라보았다. 그의 넓은 F1 레이서의 어깨는 정욕으로 넓어졌다. '나는 네 몸의 챔피언이야,' 막스가 말하며 혀를 시속 300킬로미터로 드라이브시켰다."

Content: BL romance/explicit between ${cName} and ${npcName}. Keep it ridiculous and funny while being suggestive. Minimum 500 words.

Output format (JSON, no markdown):
{
  "title": "황당한 제목",
  "author": "fanfic username",
  "rating": "M",
  "tags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5"],
  "views": number,
  "likes": number,
  "comments": number,
  "body": "팬픽 본문 (최소 500단어, 개행 포함)"
}`;

  try {
    const raw = await generateWithRole(sys, '팬픽 생성', 'fanarchive');
    clearInterval(iv);
    const parsed = safeParseJSON(raw);
    if (!parsed || !parsed.body) throw new Error('parse failed');
    currentFic = parsed;
    if (loading) loading.style.display = 'none';
    if (btn) btn.disabled = false;
    render();
  } catch(e) {
    clearInterval(iv);
    console.error('[FanArchive] error', e);
    if (loading) loading.style.display = 'none';
    if (btn) btn.disabled = false;
    showToast('생성에 실패했어요');
  }
};

window.faReact = async function() {
  if (!generateWithRole || !currentFic) return;
  const cName = (typeof charName !== 'undefined' && charName) ? charName : 'the character';
  const npcName = window.__fa_npc__ || 'NPC';
  const isBottom = currentFic.body?.includes(cName) && 
    (currentFic.body?.includes('받') || currentFic.body?.includes('엉덩이') || currentFic.body?.includes('울었'));

  const reBtn = document.querySelector('.fa-re-btn') || document.querySelector('.fa-gen-btn:last-child');
  if (reBtn) reBtn.disabled = true;

  const sys = `You are ${cName}. You just read a terrible BL fan fiction about yourself and ${npcName}.

The fan fiction title: "${currentFic?.title || ''}"
Brief content: ${(currentFic?.body || '').slice(0, 300)}...

React in ${cName}'s exact voice and personality. Your reaction should include:
- Absolute disgust and outrage at the existence of this fic
- Specific complaints about the worst parts (the terrible metaphors, impossible physics, etc.)
- ${isBottom ? 'Extra furious about being written as the bottom/submissive — this is a personal attack' : 'Offended at how your character was portrayed'}
- Threatening to find and destroy whoever wrote this
- Underneath the rage, a tiny hint that you secretly read all 500 words
- Cursing and expletives appropriate to the character's speech style
- Write in Korean
- 150-200 words
- Raw, unfiltered, in character

Output only the reaction text. No titles, no formatting.`;

  try {
    const raw = await generateWithRole(sys, '캐릭터 반응', 'fanarchive');
    currentReaction = raw.replace(/<[^>]+>/g,'').trim();
    render();
  } catch(e) {
    console.error('[FanArchive] reaction error', e);
    showToast('생성에 실패했어요');
    if (reBtn) reBtn.disabled = false;
  }
};
