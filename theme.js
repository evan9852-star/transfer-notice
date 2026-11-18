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
