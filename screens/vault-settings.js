// screens/vault-settings.js — P&C Vault v1.1

export function render() {
  syncStore();
  const cfg = (typeof window.parent?.__PC_GET_FAN_CONFIG__ === 'function')
    ? window.parent.__PC_GET_FAN_CONFIG__()
    : (store.fanFeedConfig || { group:'', npcs:[] });
  const area = document.getElementById('scroll-area');
  area.style.background = '#f2f2f2';

  if (!document.getElementById('vs-style')) {
    const s = document.createElement('style');
    s.id = 'vs-style';
    s.textContent = `
.vs-section{font-size:11px;font-weight:600;letter-spacing:0.8px;color:#888;text-transform:uppercase;padding:0 2px;margin:0 0 8px;}
.vs-group{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;overflow:hidden;margin-bottom:10px;}
.vs-row{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:0.5px solid #f0f0f0;gap:12px;}
.vs-row:last-child{border-bottom:none;}
.vs-row.tap{cursor:pointer;}
.vs-row.tap:active{background:#f8f8f8;}
.vs-col{display:flex;flex-direction:column;gap:10px;padding:14px 16px;}
.vs-label{font-size:14px;font-weight:500;color:#1a1a1a;margin-bottom:2px;}
.vs-sub{font-size:12px;color:#999;}
.vs-chevron{font-size:16px;color:#ccc;flex-shrink:0;}
.vs-input{border:0.5px solid #e8e8e8;border-radius:10px;padding:7px 11px;font-size:13px;color:#1a1a1a;background:#fff;outline:none;font-family:inherit;min-width:130px;}
.vs-input:focus{border-color:#aaa;}
.vs-tag-wrap{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
.vs-tag{display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:20px;font-size:12px;background:#f0f0f0;border:0.5px solid #e8e8e8;color:#333;}
.vs-tag-x{cursor:pointer;color:#aaa;font-size:13px;line-height:1;}
.vs-tag-x:hover{color:#c03020;}
.vs-add-tag{padding:5px 11px;border-radius:20px;font-size:12px;background:#fff;border:0.5px solid #e8e8e8;color:#888;cursor:pointer;font-family:inherit;}
.vs-save-btn{width:100%;padding:14px;border-radius:14px;background:#1a1a1a;color:#fff;border:none;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;margin-bottom:16px;}
.vs-save-btn:active{opacity:.8;}
.vs-reset-btn{width:100%;padding:14px;border-radius:14px;background:#fff;color:#c03020;border:0.5px solid #e8e8e8;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;}
.vs-reset-btn:active{background:#fff5f5;}
    `;
    document.head.appendChild(s);
  }

  area.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:0;">
      <div class="vs-section" style="margin-top:4px;">World Feed</div>
      <div class="vs-group">
        <div class="vs-row">
          <div>
            <div class="vs-label">세계관</div>
            <div class="vs-sub">AI가 피드 생성할 때 참고해요</div>
          </div>
          <input class="vs-input" id="ff-group" type="text" placeholder="예: 콜오브듀티, F1" value="${esc(cfg.group||'')}"/>
        </div>
        <div class="vs-col">
          <div>
            <div class="vs-label">등장 NPC <span style="font-size:11px;color:#999;">최대 8명</span></div>
            <div class="vs-sub">피드에 등장할 인물들</div>
          </div>
          <div class="vs-tag-wrap" id="ff-npc-wrap">
            ${(cfg.npcs||[]).map(n=>`<div class="vs-tag">${esc(n)}<span class="vs-tag-x" onclick="this.parentElement.remove()">×</span></div>`).join('')}
            <button class="vs-add-tag" onclick="ffAddNPC()">+ 추가</button>
          </div>
        </div>
      </div>
      <button class="vs-save-btn" onclick="ffSaveConfig()">World Feed 설정 저장</button>

      <div class="vs-section">앱별 초기화</div>
      <div class="vs-group">
        <div class="vs-row tap" onclick="resetApp('fourthwall')">
          <div><div class="vs-label">4th Wall</div><div class="vs-sub">독백 기록 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('offrecord')">
          <div><div class="vs-label">Off the Record</div><div class="vs-sub">카드 전체 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('worldfeed')">
          <div><div class="vs-label">World Feed</div><div class="vs-sub">생성 히스토리 초기화</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('blackbox')">
          <div><div class="vs-label">Blackbox</div><div class="vs-sub">협박편지 · 민원 히스토리 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('dreamlog')">
          <div><div class="vs-label">Dream Log</div><div class="vs-sub">현재 꿈 기록 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('stash')">
          <div><div class="vs-label">Stash</div><div class="vs-sub">Stolen · Evidence 히스토리 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-row tap" onclick="resetApp('studynotes')">
          <div><div class="vs-label">Study Notes</div><div class="vs-sub">Body Map · Training Log 삭제</div></div>
          <span class="vs-chevron">›</span>
        </div>
      </div>

      <div class="vs-section">데이터</div>
      <button class="vs-reset-btn" onclick="resetAll()">이 캐릭터 데이터 전체 초기화</button>
      <div style="padding:8px 2px;margin-bottom:20px;font-size:12px;color:#999;">모든 생성 기록이 삭제돼요.</div>
    </div>
  `;
}

window.ffAddNPC = function() {
  const wrap = document.getElementById('ff-npc-wrap');
  if (wrap.querySelectorAll('.vs-tag').length >= 8) { showToast('NPC는 최대 8명까지 추가할 수 있어요'); return; }
  const val = prompt('NPC 이름:');
  if (!val?.trim()) return;
  const addBtn = wrap.querySelector('.vs-add-tag');
  const tag = document.createElement('div');
  tag.className = 'vs-tag';
  tag.innerHTML = `${esc(val.trim())}<span class="vs-tag-x" onclick="this.parentElement.remove()">×</span>`;
  wrap.insertBefore(tag, addBtn);
};

window.ffSaveConfig = function() {
  const group = document.getElementById('ff-group')?.value.trim() || '';
  const npcs  = Array.from(document.getElementById('ff-npc-wrap')?.querySelectorAll('.vs-tag')||[])
                  .map(t => t.textContent.replace('×','').trim());
  const cfg = { group, npcs };
  if (typeof window.parent?.__PC_SAVE_FAN_CONFIG__ === 'function') {
    window.parent.__PC_SAVE_FAN_CONFIG__(cfg);
  } else {
    syncStore();
    store.fanFeedConfig = cfg;
    if (window.parent?.__PC_STORE__) window.parent.__PC_STORE__.fanFeedConfig = cfg;
    if (saveStore) saveStore();
  }
  showToast('저장됐어요 ✓');
};

window.resetApp = function(type) {
  const labels = {
    'fourthwall': '4th Wall 독백 기록을 삭제할까요?',
    'offrecord': 'Off the Record 카드를 전부 삭제할까요?',
    'worldfeed': 'World Feed 히스토리를 초기화할까요?',
    'blackbox':  'Blackbox 히스토리를 전부 삭제할까요?',
    'dreamlog':  'Dream Log 기록을 삭제할까요?',
    'stash':     'Stash 히스토리를 삭제할까요?',
    'studynotes':'Study Notes 기록을 삭제할까요?',
  };
  showModal({
    title:'초기화', desc:labels[type]||'초기화할까요?',
    confirmText:'초기화', danger:true,
    onConfirm:() => {
      syncStore();
      const ps = window.parent?.__PC_STORE__;
      if (type==='fourthwall') { store.fourthWallLetter=null; if(ps) ps.fourthWallLetter=null; }
      if (type==='offrecord')  { store.cogCards=[]; store.cogHistory=[]; store.darkCards=[]; store.darkHistory=[]; if(ps){ps.cogCards=[];ps.cogHistory=[];ps.darkCards=[];ps.darkHistory=[];} }
      if (type==='worldfeed')  { store.fanFeedHistory=[]; if(ps) ps.fanFeedHistory=[]; }
      if (type==='blackbox')   { store.blackboxHistory={threat:[],complaint:[]}; if(ps) ps.blackboxHistory={threat:[],complaint:[]}; }
      if (type==='dreamlog')   { store.dreamLogCurrent=null; if(ps) ps.dreamLogCurrent=null; }
      if (type==='stash')      { store.stashStolenHistory=[]; store.stashEvidenceHistory=[]; if(ps){ps.stashStolenHistory=[];ps.stashEvidenceHistory=[];} }
      if (type==='studynotes') { store.studyBodyHistory=[]; store.studyTrainingHistory=[]; if(ps){ps.studyBodyHistory=[];ps.studyTrainingHistory=[];} }
      if (saveStore) saveStore();
      showToast('초기화됐어요');
    }
  });
};

window.resetAll = function() {
  showModal({
    title:'전체 초기화', desc:'이 캐릭터의 모든 Vault 데이터가 삭제돼요.',
    confirmText:'초기화', danger:true,
    onConfirm:() => {
      const key = window.parent?.__PC_CHAR_KEY__ || charKey;
      const gs  = window.parent?.__PC_GLOBAL_STORE__;
      if (gs?.chars?.[key]) delete gs.chars[key];
      if (saveStore) saveStore();
      showToast('전체 데이터 초기화됐어요');
      router.go('vault');
    }
  });
};
