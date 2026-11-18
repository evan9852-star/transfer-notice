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
})();
