/* =====================================================================
   appnav.js — ドックダッシュボード / 着車プラン / 配置ダッシュボード の画面切替
   使い方（各ページの </body> の直前に1行）:
     <script src="https://takahirohayashi358244.github.io/ibaraki-dockdashboad/appnav.js" data-app="dock"></script>
   data-app : このページのID（dock / plan / haichi）
   data-title（任意）: 名称が入っている要素のセレクタ（既定: "header h1"）
   ページ名の部分がボタンになり、押すと切替メニューが出ます。同じタブで画面が切り替わります。
   ===================================================================== */
(function () {
  "use strict";
  // ページの一覧（URLを変えるときはここだけ直す）
  var APPS = [
    { id: "dock",   name: "ドックダッシュボード", url: "https://takahirohayashi358244.github.io/ibaraki-dockdashboad/" },
    { id: "plan",   name: "着車プラン",           url: "https://takahirohayashi358244.github.io/ibaraki-dockdashboad/plan.html" },
    { id: "haichi", name: "配置ダッシュボード",   url: "https://takahirohayashi358244.github.io/ibaraki-haichi-dashboard/" }
  ];

  var me = document.currentScript;
  var cur = (me && me.getAttribute("data-app")) || "";
  var sel = (me && me.getAttribute("data-title")) || "header h1";

  function css() {
    if (document.getElementById("appnav-css")) return;
    var st = document.createElement("style");
    st.id = "appnav-css";
    st.textContent =
      ".appnav-btn{all:unset;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border-radius:6px;padding:1px 6px 1px 4px;margin:-1px 0 -1px -4px;font:inherit;color:inherit;letter-spacing:inherit;white-space:nowrap}" +
      ".appnav-btn:hover,.appnav-btn[aria-expanded=true]{background:rgba(31,111,139,.10)}" +
      ".appnav-btn:focus-visible{outline:2px solid #1f6f8b;outline-offset:1px}" +
      ".appnav-caret{font-size:.62em;opacity:.6;transition:transform .15s}" +
      ".appnav-btn[aria-expanded=true] .appnav-caret{transform:rotate(180deg)}" +
      ".appnav-menu{position:fixed;z-index:3000;min-width:220px;background:#fff;border:1px solid #d8e0e8;border-radius:10px;box-shadow:0 10px 30px rgba(30,43,56,.22);padding:5px;font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif}" +
      ".appnav-menu[hidden]{display:none}" +
      ".appnav-item{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:7px;color:#1f2b38;text-decoration:none;font-size:13.5px;font-weight:600;letter-spacing:0}" +
      ".appnav-item:hover,.appnav-item:focus-visible{background:#eef6f9;outline:none}" +
      ".appnav-item .mk{width:7px;height:7px;border-radius:50%;background:transparent;flex:none}" +
      ".appnav-item.cur{color:#1f6f8b;cursor:default}" +
      ".appnav-item.cur .mk{background:#1f6f8b}" +
      ".appnav-item.cur:hover{background:transparent}";
    document.head.appendChild(st);
  }

  // 見出しの中から、ページ名の文字だけをボタンに置き換える（ロゴや接続表示はそのまま）
  function findNameNode(root) {
    var names = APPS.map(function (a) { return a.name; });
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      var t = n.nodeValue.trim();
      if (!t) continue;
      for (var i = 0; i < names.length; i++) if (t.indexOf(names[i]) >= 0) return { node: n, name: names[i] };
    }
    return null;
  }

  function init() {
    var h = document.querySelector(sel);
    if (!h || h.querySelector(".appnav-btn")) return;
    css();
    var found = findNameNode(h);
    var curApp = APPS.filter(function (a) { return a.id === cur; })[0];
    var label = curApp ? curApp.name : (found ? found.name : document.title);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "appnav-btn";
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    btn.title = "画面を切り替え";
    btn.innerHTML = '<span class="appnav-name"></span><span class="appnav-caret">▼</span>';
    btn.querySelector(".appnav-name").textContent = label;

    if (found) {
      // テキストノードを「前 + ボタン + 後」に分割
      var v = found.node.nodeValue, i = v.indexOf(found.name);
      var before = document.createTextNode(v.slice(0, i));
      var after = document.createTextNode(v.slice(i + found.name.length));
      var p = found.node.parentNode;
      p.insertBefore(before, found.node);
      p.insertBefore(btn, found.node);
      p.insertBefore(after, found.node);
      p.removeChild(found.node);
    } else {
      h.appendChild(btn);
    }

    var menu = document.createElement("div");
    menu.className = "appnav-menu";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    APPS.forEach(function (a) {
      var it = document.createElement("a");
      it.className = "appnav-item" + (a.id === cur ? " cur" : "");
      it.setAttribute("role", "menuitem");
      it.innerHTML = '<span class="mk"></span><span></span>';
      it.lastChild.textContent = a.name;
      if (a.id === cur) {
        it.href = "#";
        it.addEventListener("click", function (e) { e.preventDefault(); close(); });
      } else {
        it.href = a.url;   // 同じタブで切り替え
        it.addEventListener("mouseenter", function () { prefetch(a.url); });
      }
      menu.appendChild(it);
    });
    document.body.appendChild(menu);

    function place() {
      var r = btn.getBoundingClientRect();
      menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + "px";
      menu.style.top = (r.bottom + 6) + "px";
    }
    function open() { menu.hidden = false; place(); btn.setAttribute("aria-expanded", "true"); var f = menu.querySelector(".appnav-item:not(.cur)"); if (f) f.focus(); }
    function close() { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); menu.hidden ? open() : close(); });
    document.addEventListener("click", function (e) { if (!menu.hidden && !menu.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { close(); btn.focus(); } });
    window.addEventListener("resize", function () { if (!menu.hidden) place(); });
    window.addEventListener("scroll", function () { if (!menu.hidden) place(); }, true);
  }

  var pre = {};
  function prefetch(url) {
    if (pre[url]) return; pre[url] = 1;
    try { var l = document.createElement("link"); l.rel = "prefetch"; l.href = url; document.head.appendChild(l); } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
