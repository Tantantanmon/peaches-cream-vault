// screens/vault.js — P&C Vault v1.1

export function render() {
  const area = document.getElementById('scroll-area');
  area.style.background = '#f2f2f2';

  if (!document.getElementById('vault-home-style')) {
    const s = document.createElement('style');
    s.id = 'vault-home-style';
    s.textContent = `
.vh-section-label{font-size:11px;font-weight:600;letter-spacing:0.8px;color:#888;text-transform:uppercase;padding:0 2px;margin:0 0 8px;}
.vh-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.vh-app-card{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;padding:14px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:border-color .15s;}
.vh-app-card:hover{border-color:#bbb;}
.vh-app-card:active{background:#f8f8f8;}
.vh-app-icon{width:34px;height:34px;border-radius:9px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.vh-app-icon svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
.vh-app-name{font-size:13px;font-weight:600;color:#1a1a1a;}
.vh-app-sub{font-size:11px;color:#999;margin-top:1px;}
.vh-settings-row{background:#fff;border-radius:14px;border:0.5px solid #e8e8e8;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
.vh-settings-row:active{background:#f8f8f8;}
.vh-chevron{font-size:16px;color:#ccc;}
    `;
    document.head.appendChild(s);
  }

  area.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
      <div class="vh-section-label">Apps</div>
      <div class="vh-grid">
        <div class="vh-app-card" onclick="router.go('vault-offrecord')">
          <div class="vh-app-icon">${offRecordIcon()}</div>
          <div><div class="vh-app-name">Off the Record</div><div class="vh-app-sub">비밀 생각 · 욕망</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('vault-worldfeed')">
          <div class="vh-app-icon">${worldFeedIcon()}</div>
          <div><div class="vh-app-name">World Feed</div><div class="vh-app-sub">세계관 SNS</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('vault-blackbox')">
          <div class="vh-app-icon">${blackboxIcon()}</div>
          <div><div class="vh-app-name">Blackbox</div><div class="vh-app-sub">협박편지 · 민원</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('vault-dreamlog')">
          <div class="vh-app-icon">${dreamLogIcon()}</div>
          <div><div class="vh-app-name">Dream Log</div><div class="vh-app-sub">캐릭터의 꿈</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('vault-stash')">
          <div class="vh-app-icon">${stashIcon()}</div>
          <div><div class="vh-app-name">Stash</div><div class="vh-app-sub">훔친 물건 · 망상</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('vault-studynotes')">
          <div class="vh-app-icon">${studyNotesIcon()}</div>
          <div><div class="vh-app-name">Study Notes</div><div class="vh-app-sub">신체 분석 · 훈련</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('fourth-wall')">
          <div class="vh-app-icon">${fourthWallIcon()}</div>
          <div><div class="vh-app-name">4th Wall</div><div class="vh-app-sub">캐릭터의 솔직한 독백</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('interrogation')">
          <div class="vh-app-icon">${interrogationIcon()}</div>
          <div><div class="vh-app-name">Interrogation</div><div class="vh-app-sub">취조실 심문</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('fanarchive')">
          <div class="vh-app-icon">${fanArchiveIcon()}</div>
          <div><div class="vh-app-name">Fan Archive</div><div class="vh-app-sub">개쓰레기 팬픽 감상</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('sexting')">
          <div class="vh-app-icon">${sextingIcon()}</div>
          <div><div class="vh-app-name">Sexting</div><div class="vh-app-sub">야한 문자 주고받기</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('clinic')">
          <div class="vh-app-icon">${clinicIcon()}</div>
          <div><div class="vh-app-name">Clinic</div><div class="vh-app-sub">성건강 클리닉</div></div>
        </div>
        <div class="vh-app-card" onclick="router.go('apology')">
          <div class="vh-app-icon">${apologyIcon()}</div>
          <div><div class="vh-app-name">Sorry Not Sorry</div><div class="vh-app-sub">반성문 · 탄원서</div></div>
        </div>
      </div>
      <div class="vh-settings-row" onclick="router.go('vault-settings')">
        <div>
          <div style="font-size:14px;font-weight:500;color:#1a1a1a;">Settings</div>
          <div style="font-size:11px;color:#999;margin-top:2px;">World Feed · 데이터 초기화</div>
        </div>
        <span class="vh-chevron">›</span>
      </div>
    </div>
  `;
}

function offRecordIcon()  { return `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`; }
function worldFeedIcon()  { return `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`; }
function blackboxIcon()   { return `<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`; }
function dreamLogIcon()   { return `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`; }
function stashIcon()      { return `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`; }
function studyNotesIcon() { return `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`; }
function fourthWallIcon()    { return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M20.188 10.934c.2.431.312.912.312 1.066s-.112.635-.312 1.066C19.175 15.206 15.857 18 12 18c-3.857 0-7.175-2.794-8.188-4.934C3.612 12.635 3.5 12.154 3.5 12s.112-.635.312-1.066C4.825 8.794 8.143 6 12 6c3.857 0 7.175 2.794 8.188 4.934z"/></svg>`; }
function interrogationIcon() { return `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`; }
function fanArchiveIcon() { return `<svg viewBox="0 0 24 24"><path d="M20 17v-12c0-1.121-.879-2-2-2s-2 .879-2 2v12l2 2 2-2z"/><path d="M16 7h4"/><path d="M18 19h-13a2 2 0 1 1 0-4h4a2 2 0 1 0 0-4h-3"/></svg>`; }
function sextingIcon()    { return `<svg viewBox="0 0 24 24"><path d="M12 2c0 0 3 4 3 7c0 1.5-1 3-1 3s2-1 2-4c2 2 3 4 3 6a6 6 0 0 1-12 0c0-4 3-8 5-12z"/></svg>`; }
function clinicIcon()     { return `<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`; }
function apologyIcon()    { return `<svg viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.04 3 12 4 12 4C12 4 12.96 3 14.5 3C17.58 3 20 5.42 20 8.5C20 13.5 12 21 12 21Z"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="10.5" y1="9" x2="10.5" y2="13"/></svg>`; }
