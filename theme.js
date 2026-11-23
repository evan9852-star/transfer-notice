// 모든 페이지 공통 테마: 메뉴 줄 오른쪽 버튼으로 밝게/어둡게, 이 사이트 전체에 저장
(function () {
  var KEY = 'siteTheme', root = document.documentElement;
  function get() { try { return localStorage.getItem(KEY) || localStorage.getItem('activityTheme') || ''; } catch (e) { return ''; } }
  function isDark(t) { return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function apply(t) { if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme'); }
  apply(get());
  function mount() {
    var nav = document.querySelector('nav.apps'); if (!nav || nav.querySelector('.theme-btn')) return;
    var link = nav.querySelector('a:not([aria-current])') || nav.querySelector('a');
    var b = document.createElement('button'); b.type = 'button'; b.className = 'theme-btn';
    if (link) { var cs = getComputedStyle(link); ['padding', 'borderRadius', 'border', 'background', 'color', 'fontSize', 'fontFamily', 'lineHeight'].forEach(function (p) { b.style[p] = cs[p]; }); }
    b.style.marginLeft = 'auto'; b.style.cursor = 'pointer'; b.style.whiteSpace = 'nowrap';
    function label() { var d = isDark(get()); b.textContent = d ? '밝게' : '어둡게'; b.setAttribute('aria-pressed', d ? 'true' : 'false'); b.title = '사이트 전체 화면 테마'; }
    function restyle() { if (link) { var cs = getComputedStyle(link); ['border', 'background', 'color'].forEach(function (p) { b.style[p] = cs[p]; }); } }
    b.addEventListener('click', function () {
      var t = isDark(get()) ? 'light' : 'dark';
      try { localStorage.setItem(KEY, t); } catch (e) {}
      apply(t); label(); restyle();
    });
    label(); nav.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('storage', function (e) { if (e.key === KEY) { apply(e.newValue || ''); var b = document.querySelector('.theme-btn'); if (b) b.textContent = isDark(e.newValue) ? '밝게' : '어둡게'; } });

  // 모든 입력 풍선: 드래그로 크기 조절 없음, 글이 길어지면 저절로 커지다가 일정 높이부터는 스크롤
  var st = document.createElement('style');
  st.textContent = 'textarea{resize:none!important;overflow-y:hidden}';
  (document.head || root).appendChild(st);
  var CAP = 240;
  function fit(el) {
    if (!el || el.tagName !== 'TEXTAREA' || !el.isConnected || !el.offsetParent) return;
    var cs = getComputedStyle(el), minH = parseFloat(cs.minHeight) || 0;
    var cap = Math.max(CAP, minH * 2);
    var extra = cs.boxSizing === 'border-box' ? (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0) : -((parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0));
    var keep = window.scrollY;
    el.style.height = 'auto';
    var h = el.scrollHeight + extra;
    el.style.height = Math.min(h, cap) + 'px';
    el.style.overflowY = h > cap + 1 ? 'auto' : 'hidden';
    if (window.scrollY !== keep) window.scrollTo(window.scrollX, keep);
  }
  var queued = false;
  function fitAll() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; var a = document.getElementsByTagName('textarea'); for (var i = 0; i < a.length; i++) fit(a[i]); }); }
  document.addEventListener('input', function (e) { fit(e.target); }, true);
  document.addEventListener('focusin', function (e) { fit(e.target); }, true);
  document.addEventListener('click', fitAll, true);
  document.addEventListener('change', fitAll, true);
  window.addEventListener('resize', fitAll);
  window.addEventListener('load', fitAll);
  try {
    var d = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, v); fitAll(); } });
  } catch (e) {}
  function watch() { fitAll(); try { new MutationObserver(fitAll).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();

// 이름·번호 찾기 칸(data-find): 돋보기·지우기 버튼이 있는 크고 잘 보이는 칸으로 (모든 페이지 공통)
(function () {
  var css = '.findbox{position:relative;display:flex;align-items:center;flex:1 1 320px;min-width:0;max-width:560px}' +
    '.findbox svg{position:absolute;left:14px;width:20px;height:20px;color:var(--ink,#1b2220);pointer-events:none}' +
    '.findbox input{font:inherit!important;font-size:16px!important;font-weight:500;width:100%!important;min-width:0;height:48px;padding:0 44px 0 44px!important;border:2px solid var(--ink-2,#56625d)!important;border-radius:8px!important;background:var(--sheet,#fff)!important;color:var(--ink,#1b2220);-webkit-appearance:none;appearance:none}' +
    '.findbox input::placeholder{color:var(--ink-2,#56625d);opacity:1;font-weight:400}' +
    '.findbox input:hover{border-color:var(--ink,#1b2220)!important}' +
    '.findbox input:focus{border-color:var(--seal,#a8362a)!important;outline:3px solid var(--seal-soft,#f6e5e1);outline-offset:0}' +
    '.findbox input::-webkit-search-cancel-button{display:none}' +
    '.findbox .fx{position:absolute;right:6px;width:36px;height:36px;min-height:0;padding:0;border:0;border-radius:50%;background:var(--rule-2,#eceee9);color:var(--ink,#1b2220);font-size:18px;line-height:1;cursor:pointer;display:grid;place-items:center}' +
    '.findbox .fx:hover{background:var(--rule,#d9ded7)}' +
    '.findbox input:placeholder-shown~.fx{display:none}' +
    '.findrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:4px 0}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  function enhance() {
    var list = document.querySelectorAll('input[data-find]');
    for (var i = 0; i < list.length; i++) (function (inp) {
      if (inp.parentNode && inp.parentNode.classList && inp.parentNode.classList.contains('findbox')) return;
      var box = document.createElement('span'); box.className = 'findbox';
      inp.parentNode.insertBefore(box, inp);
      box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
      box.appendChild(inp);
      if (!inp.placeholder) inp.placeholder = ' ';
      var x = document.createElement('button'); x.type = 'button'; x.className = 'fx'; x.textContent = '×'; x.setAttribute('aria-label', '찾기 지우기');
      x.addEventListener('click', function () { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.focus(); });
      box.appendChild(x);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Escape' && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); } });
    })(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance); else enhance();
})();
