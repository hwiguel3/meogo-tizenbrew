/*
 * MEO Go - Comando Samsung v0.1.0
 * Modulo nao oficial de modificacao de site para TizenBrew.
 * Usa a pagina oficial https://tv.meo.pt/pt - sem reimplementar o player.
 * Nao guarda credenciais/PIN, nao modifica DRM, video, cookies ou pedidos de rede.
 * JavaScript ES5 para compatibilidade com motores Tizen mais antigos.
 */
(function () {
  'use strict';
  if (!/(^|\.)tv\.meo\.pt$/i.test(window.location.hostname)) return;
  if (window.__meoTizenRemoteV1) return;
  window.__meoTizenRemoteV1 = true;

  var PREFIX = 'meotb-';
  var BLUE = '#168cff';
  var selected = null;
  var mode = 'focus';
  var cursorX = Math.round(window.innerWidth / 2);
  var cursorY = Math.round(window.innerHeight / 2);
  var ring = null, cursor = null, toast = null, diagnostics = null;
  var toastDeadline = 0, lastKeyAt = 0, updateTimer = null;
  var lastPageURL = window.location.href;
  var SELECTOR = [
    'a[href]', 'button', 'input:not([type="hidden"])', 'textarea', 'select',
    'summary', '[role="button"]', '[role="link"]', '[role="tab"]',
    '[role="menuitem"]', '[role="menuitemradio"]', '[role="option"]',
    '[role="checkbox"]', '[role="switch"]', '[aria-controls]',
    '[onclick]', '[tabindex]:not([tabindex="-1"])',
    '[class*="cursor-pointer"]', '[class*="swiper-slide"]'
  ].join(',');

  function rect(el) {
    try { return el.getBoundingClientRect(); } catch (e) { return null; }
  }
  function isOwn(el) {
    while (el && el.nodeType === 1) {
      if (el.id && el.id.indexOf(PREFIX) === 0) return true;
      el = el.parentElement;
    }
    return false;
  }
  function center(r) {
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function isEditable(el) {
    return !!(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
  }
  function isActionable(el) {
    if (!el || !el.tagName || isOwn(el)) return false;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    var tag = el.tagName;
    if (/^(BUTTON|INPUT|TEXTAREA|SELECT|SUMMARY)$/.test(tag)) return true;
    if (tag === 'A' && el.getAttribute('href')) return true;
    var role = (el.getAttribute('role') || '').toLowerCase();
    if (/^(button|link|tab|menuitem|menuitemradio|option|checkbox|switch)$/.test(role)) return true;
    if (el.hasAttribute('onclick') || el.hasAttribute('aria-controls')) return true;
    if (el.getAttribute('tabindex') === '0') return true;
    try { return window.getComputedStyle(el).cursor === 'pointer'; }
    catch (e) { return false; }
  }
  function visible(el, offscreen) {
    if (!el || isOwn(el) || el.disabled || el.getAttribute('aria-hidden') === 'true') return false;
    var r = rect(el);
    if (!r || r.width < 7 || r.height < 7 || r.width > window.innerWidth * .98 || r.height > window.innerHeight * .93) return false;
    var st;
    try { st = window.getComputedStyle(el); } catch (e) { return false; }
    if (!st || st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none' || Number(st.opacity) < .08) return false;
    if (offscreen) return true;
    if (r.bottom < 1 || r.right < 1 || r.top > window.innerHeight - 1 || r.left > window.innerWidth - 1) return false;
    var p = center(r);
    var x = Math.max(3, Math.min(window.innerWidth - 3, p.x));
    var y = Math.max(3, Math.min(window.innerHeight - 3, p.y));
    var at;
    try { at = document.elementFromPoint(x, y); } catch (e2) { at = null; }
    // Ignora elementos cobertos por modais/painéis.
    if (at && at !== el && !el.contains(at) && !at.contains(el)) return false;
    return true;
  }
  function initUI() {
    if (!document.body) return false;
    if (!document.getElementById(PREFIX + 'style')) {
      var style = document.createElement('style');
      style.id = PREFIX + 'style';
      style.textContent =
        '#meotb-ring{position:fixed!important;z-index:2147483635!important;display:none;'+
        'pointer-events:none!important;box-sizing:border-box!important;'+
        'border:4px solid #168cff!important;border-radius:8px!important;'+
        'box-shadow:0 0 0 2px #00184a,0 0 16px 4px rgba(22,140,255,.68)!important}'+
        '#meotb-cursor{position:fixed!important;z-index:2147483636!important;display:none;'+
        'pointer-events:none!important;width:24px!important;height:24px!important;'+
        'box-sizing:border-box!important;border:4px solid #168cff!important;'+
        'border-radius:50%!important;background:rgba(22,140,255,.24)!important;'+
        'box-shadow:0 0 12px #168cff!important}'+
        '#meotb-toast{position:fixed!important;right:12px!important;top:12px!important;'+
        'z-index:2147483640!important;display:none;pointer-events:none!important;'+
        'background:#062342!important;color:#fff!important;border:2px solid #168cff!important;'+
        'border-radius:8px!important;padding:9px 14px!important;max-width:78vw!important;'+
        'font:17px Arial,sans-serif!important}'+
        '#meotb-diag{position:fixed!important;z-index:2147483641!important;'+
        'display:none!important;left:7%!important;top:8%!important;width:86%!important;'+
        'height:80%!important;box-sizing:border-box!important;overflow:auto!important;'+
        'background:rgba(4,18,42,.98)!important;color:#fff!important;'+
        'border:3px solid #168cff!important;border-radius:12px!important;'+
        'padding:18px!important;white-space:pre-wrap!important;'+
        'font:17px/1.5 monospace!important}'+
        '#meotb-diag.meotb-open{display:block!important}';
      (document.head || document.documentElement).appendChild(style);
    }
    function make(id) {
      var node = document.getElementById(PREFIX + id);
      if (!node) { node = document.createElement('div'); node.id = PREFIX + id; document.body.appendChild(node); }
      return node;
    }
    ring = make('ring'); cursor = make('cursor'); toast = make('toast'); diagnostics = make('diag');
    return true;
  }
  function notify(message) {
    if (!initUI()) return;
    toast.textContent = 'MEO Go v1 | ' + message;
    toast.style.display = 'block';
    toastDeadline = Date.now() + 2600;
  }
  function updateHighlight() {
    if (!initUI()) return;
    if (Date.now() > toastDeadline) toast.style.display = 'none';
    if (diagnostics.className.indexOf('meotb-open') >= 0) {
      ring.style.display = 'none'; cursor.style.display = 'none'; return;
    }
    if (mode === 'cursor') {
      ring.style.display = 'none'; cursor.style.display = 'block';
      cursor.style.left = Math.round(cursorX - 12) + 'px';
      cursor.style.top = Math.round(cursorY - 12) + 'px';
      return;
    }
    cursor.style.display = 'none';
    if (!selected || !document.documentElement.contains(selected) || !visible(selected, false)) {
      ring.style.display = 'none'; return;
    }
    var r = rect(selected);
    ring.style.left = Math.max(0, Math.round(r.left - 4)) + 'px';
    ring.style.top = Math.max(0, Math.round(r.top - 4)) + 'px';
    ring.style.width = Math.round(r.width + 8) + 'px';
    ring.style.height = Math.round(r.height + 8) + 'px';
    ring.style.display = 'block';
  }
  function later() {
    if (updateTimer !== null) return;
    updateTimer = setTimeout(function () { updateTimer = null; updateHighlight(); }, 80);
  }
  function collect() {
    var all = document.querySelectorAll(SELECTOR), result = [], i, j, el, r, q, dupe;
    for (i = 0; i < all.length && i < 6000 && result.length < 350; i++) {
      el = all[i];
      if (!isActionable(el) || !visible(el, false)) continue;
      r = rect(el); dupe = false;
      for (j = 0; j < result.length; j++) {
        q = rect(result[j]);
        if (q && Math.abs(q.left - r.left) < 5 && Math.abs(q.top - r.top) < 5 &&
            Math.abs(q.width - r.width) < 10 && Math.abs(q.height - r.height) < 10) {
          // Preferir alvo mais específico em elementos sobrepostos.
          if (result[j].contains(el)) result[j] = el;
          dupe = true; break;
        }
      }
      if (!dupe) result.push(el);
    }
    return result;
  }
  function sortFirst(a, b) {
    var ar = rect(a), br = rect(b);
    return Math.abs(ar.top - br.top) > 30 ? ar.top - br.top : ar.left - br.left;
  }
  function select(el, focus) {
    if (!el) return;
    selected = el;
    if (focus && el.focus) {
      try { el.focus({ preventScroll: true }); }
      catch (e) { try { el.focus(); } catch (e2) {} }
    }
    later();
  }
  function nearest(items, code, origin) {
    var best = null, score = Infinity, i, el, p, dx, dy, fw, side, candidate;
    for (i = 0; i < items.length; i++) {
      el = items[i]; if (el === selected) continue;
      p = center(rect(el)); dx = p.x - origin.x; dy = p.y - origin.y;
      if (code === 37) { fw = -dx; side = Math.abs(dy); }
      else if (code === 39) { fw = dx; side = Math.abs(dy); }
      else if (code === 38) { fw = -dy; side = Math.abs(dx); }
      else { fw = dy; side = Math.abs(dx); }
      if (fw < 8) continue;
      // Preferir direcao e alinhamento, sem prender o foco em listas laterais.
      candidate = fw + side * 1.9 + (side > fw * 1.5 ? side * 1.4 : 0);
      if (candidate < score) { score = candidate; best = el; }
    }
    return best;
  }
  function scrollable(el, horizontal) {
    try { return el && (horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight) > 24; }
    catch (e) { return false; }
  }
  function moveScroll(el, code) {
    var horiz = code === 37 || code === 39;
    var sign = (code === 37 || code === 38) ? -1 : 1;
    var amount = sign * (horiz ? Math.max(180, window.innerWidth * .28) : Math.max(165, window.innerHeight * .47));
    try {
      var before = horiz ? el.scrollLeft : el.scrollTop;
      if (horiz) el.scrollLeft += amount; else el.scrollTop += amount;
      var after = horiz ? el.scrollLeft : el.scrollTop;
      return Math.abs(after - before) > 2;
    } catch (e) { return false; }
  }
  function scrollFallback(code) {
    var h = code === 37 || code === 39, el = selected, count = 0;
    // Comeca no contentor do alvo, depois tenta scroll global.
    while (el && count++ < 12) {
      if (scrollable(el, h) && moveScroll(el, code)) return true;
      el = el.parentElement;
    }
    var all = document.querySelectorAll('main,section,nav,aside,[role="list"],[class*="scroll"],[class*="Scroll"]');
    for (var i = 0; i < all.length && i < 150; i++) {
      if (visible(all[i], true) && scrollable(all[i], h) && moveScroll(all[i], code)) return true;
    }
    return moveScroll(document.scrollingElement || document.documentElement, code);
  }
  function navigate(code) {
    var targets = collect();
    if (!targets.length) { scrollFallback(code); later(); return; }
    if (!selected || targets.indexOf(selected) < 0) {
      targets.sort(sortFirst); select(targets[0], false); return;
    }
    var next = nearest(targets, code, center(rect(selected)));
    if (next) { select(next, false); return; }
    if (scrollFallback(code)) {
      // Recalcula apos scroll para encontrar alvos agora visiveis.
      setTimeout(function () {
        var a = collect();
        if (!a.length) { later(); return; }
        var old = selected && rect(selected);
        var point = old ? center(old) : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        var n = nearest(a, code, point);
        if (n) select(n, false); else later();
      }, 130);
    } else { notify('Sem mais elementos nesta direcao'); }
  }
  function clickElement(el) {
    if (!el) return false;
    try {
      if (el.focus) el.focus();
      if (el.click) el.click();
      else el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      later(); return true;
    } catch (e) { notify('Nao foi possivel ativar o elemento'); return false; }
  }
  function clickCurrent() {
    if (mode === 'cursor') {
      var hit = document.elementFromPoint(cursorX, cursorY);
      if (hit && !isOwn(hit)) {
        while (hit && hit !== document.body && !isActionable(hit)) hit = hit.parentElement;
        if (hit && hit !== document.body) { select(hit, false); return clickElement(hit); }
      }
      notify('Move o cursor ate um botao'); return;
    }
    if (!selected || !visible(selected, false)) {
      var a = collect(); if (a.length) select(a.sort(sortFirst)[0], false);
      else { notify('Nenhum botao selecionavel'); return; }
    }
    if (isEditable(selected)) {
      try { selected.focus(); selected.click(); } catch (e) {}
      later(); return;
    }
    clickElement(selected);
  }
  function findClose() {
    var dialogs = document.querySelectorAll('[role="dialog"],[aria-modal="true"],dialog[open],'+
      '[class*="modal"],[class*="Modal"],[class*="drawer"],[class*="Drawer"]');
    var d = null, i, r;
    for (i = dialogs.length - 1; i >= 0; i--) {
      r = rect(dialogs[i]);
      if (r && visible(dialogs[i], true) && r.width > 160 && r.height > 90 &&
          r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight) {
        d = dialogs[i]; break;
      }
    }
    if (!d) return null;
    var buttons = d.querySelectorAll('button,[role="button"],a[aria-label]');
    var best = null, bestScore = Infinity;
    for (i = 0; i < buttons.length; i++) {
      var b = buttons[i]; if (!visible(b, false)) continue;
      var label = [b.getAttribute('aria-label'), b.getAttribute('title'), b.textContent, b.className].join(' ').toLowerCase();
      var br = rect(b), dr = rect(d);
      if (/^(x|×|✕|fechar|close|dismiss|cancelar|cancel)$/.test((b.textContent || '').replace(/^\s+|\s+$/g, '').toLowerCase()) ||
          /close|fechar|dismiss|closebutton|close-button/i.test(label)) {
        var score = Math.abs(br.top - dr.top) + Math.min(Math.abs(br.left - dr.left), Math.abs(br.right - dr.right));
        if (score < bestScore) { best = b; bestScore = score; }
      }
    }
    return best;
  }
  function capabilities() {
    var list = [], v = document.querySelectorAll('video');
    var ms = window.MediaSource || window.WebKitMediaSource;
    var eme = !!(navigator.requestMediaKeySystemAccess);
    var types = ['video/mp4; codecs="avc1.42E01E"', 'application/vnd.apple.mpegurl'];
    var video = document.createElement('video');
    list.push('MEO Go TizenBrew - diagnostico v1');
    list.push('URL: ' + location.href);
    list.push('Motor: ' + navigator.userAgent);
    list.push('Tizen API: ' + (!!window.tizen));
    list.push('MSE: ' + (!!ms));
    list.push('EME API: ' + eme);
    list.push('AVPlay: ' + !!(window.webapis && window.webapis.avplay));
    list.push('HTML5 H264: ' + (video.canPlayType ? (video.canPlayType(types[0]) || 'nao') : 'API indisponivel'));
    list.push('HTML5 HLS: ' + (video.canPlayType ? (video.canPlayType(types[1]) || 'nao') : 'API indisponivel'));
    list.push('MSE H264: ' + (ms && ms.isTypeSupported ? !!ms.isTypeSupported(types[0]) : 'indisponivel'));
    list.push('Videos na pagina: ' + v.length);
    for (var i = 0; i < v.length && i < 4; i++) {
      var err = v[i].error;
      list.push('Video #' + (i + 1) + ': readyState=' + v[i].readyState +
        ', networkState=' + v[i].networkState + ', erro=' + (err ? err.code : 'nenhum'));
    }
    list.push('');
    list.push('AZUL ou VOLTAR: fechar este diagnostico');
    list.push('VERDE: alternar selecao/cursor');
    list.push('');
    list.push('Nota: estas APIs nao garantem suporte DRM.');
    list.push('O modulo nao contorna protecoes ou subscricoes.');
    return list.join('\n');
  }
  function toggleDiagnostics() {
    if (!initUI()) return;
    if (diagnostics.className.indexOf('meotb-open') >= 0) diagnostics.className = '';
    else { diagnostics.textContent = capabilities(); diagnostics.className = 'meotb-open'; }
    updateHighlight();
  }
  function toggleCursor() {
    mode = mode === 'focus' ? 'cursor' : 'focus';
    notify(mode === 'cursor' ? 'Cursor livre (setas + OK); verde para voltar' : 'Selecao azul ativa');
    later();
  }
  function keyCode(ev) {
    var key = ev.key || '';
    if (key === 'ArrowLeft') return 37;
    if (key === 'ArrowUp') return 38;
    if (key === 'ArrowRight') return 39;
    if (key === 'ArrowDown') return 40;
    if (key === 'Enter') return 13;
    if (key === 'Escape' || key === 'Backspace' || key === 'BrowserBack' || key === 'GoBack') return 10009;
    if (key === 'ColorF1Green') return 404;
    if (key === 'ColorF3Blue') return 406;
    return ev.keyCode || ev.which || 0;
  }
  function stop(ev) {
    if (ev.preventDefault) ev.preventDefault();
    if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    if (ev.stopPropagation) ev.stopPropagation();
  }
  function onKey(ev) {
    var code = keyCode(ev), now = Date.now();
    if ([37, 38, 39, 40, 13, 10009, 404, 406].indexOf(code) < 0) return;
    if (now - lastKeyAt < 55 && ev.repeat) { stop(ev); return; }
    lastKeyAt = now;
    if (code === 406) { stop(ev); toggleDiagnostics(); return; }
    if (diagnostics && diagnostics.className.indexOf('meotb-open') >= 0) {
      if (code === 10009) { stop(ev); toggleDiagnostics(); }
      return;
    }
    if (code === 404) { stop(ev); toggleCursor(); return; }
    if (code === 10009) {
      if (mode === 'cursor') { stop(ev); mode = 'focus'; notify('Selecao azul ativa'); return; }
      if (isEditable(document.activeElement)) {
        stop(ev); try { document.activeElement.blur(); } catch (e) {} later(); return;
      }
      var close = findClose();
      if (close) { stop(ev); clickElement(close); return; }
      // Sem modal, deixar o site/TizenBrew tratar Voltar e sair normalmente.
      return;
    }
    if (isEditable(document.activeElement) && mode === 'focus') {
      // Permitir escrita, edicao do PIN e teclado virtual do site.
      // A seta para baixo permite abandonar o campo para navegar no resto da pagina.
      if (code !== 40) return;
      try { document.activeElement.blur(); } catch (e2) {}
    }
    if (code >= 37 && code <= 40) {
      stop(ev);
      if (mode === 'cursor') {
        var step = 64;
        cursorX = Math.max(4, Math.min(window.innerWidth - 4, cursorX + (code === 37 ? -step : code === 39 ? step : 0)));
        cursorY = Math.max(4, Math.min(window.innerHeight - 4, cursorY + (code === 38 ? -step : code === 40 ? step : 0)));
        later();
      } else navigate(code);
      return;
    }
    if (code === 13) { stop(ev); clickCurrent(); }
  }
  function start() {
    if (!initUI()) { setTimeout(start, 250); return; }
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', later, false);
    window.addEventListener('scroll', later, true);
    document.addEventListener('click', function (e) {
      if (isOwn(e.target)) return;
      var el = e.target;
      while (el && el !== document.body && !isActionable(el)) el = el.parentElement;
      if (el && el !== document.body) select(el, false);
    }, true);
    if (window.MutationObserver) {
      try {
        new MutationObserver(function () { later(); }).observe(document.documentElement,
          { childList: true, subtree: true });
      } catch (e) {}
    }
    setInterval(function () {
      if (location.href !== lastPageURL) { lastPageURL = location.href; selected = null; }
      updateHighlight();
    }, 900);
    notify('Comando ativo | setas/OK | verde=cursor | azul=diagnostico');
    later();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();