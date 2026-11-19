/* Photon – interaction layer (parallax, service panels, tabs, price toggle, data-flow). No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('fx');

  /* ---------- Image reveals ---------- */
  var imgs = $$('.reveal-img');
  if ('IntersectionObserver' in window && !reduced) {
    // Observe the parent: a fully clipped element can never report as intersecting
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.__reveal.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    imgs.forEach(function (el) { var host = el.parentElement || el; host.__reveal = el; io.observe(host); });
  } else {
    imgs.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Parallax ---------- */
  var par = $$('[data-parallax]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0 }; });
  var ticking = false;
  function runParallax() {
    ticking = false;
    var vh = window.innerHeight;
    par.forEach(function (p) {
      var r = p.el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var off = (r.top + r.height / 2 - vh / 2) * p.k * -1;
      p.el.style.setProperty('--py', off.toFixed(1) + 'px');
    });
  }
  if (!reduced && par.length) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(runParallax); } }, { passive: true });
    window.addEventListener('resize', runParallax);
    runParallax();
  }

  /* ---------- Service panels (accordion on wide screens) ---------- */
  var panels = $$('[data-panel]');
  var wide = window.matchMedia('(min-width: 900px)');
  function activate(p) {
    if (!wide.matches) return;
    panels.forEach(function (x) { x.classList.toggle('is-active', x === p); });
  }
  panels.forEach(function (p) {
    p.setAttribute('tabindex', '0');
    p.addEventListener('mouseenter', function () { activate(p); });
    p.addEventListener('click', function () { activate(p); });
    p.addEventListener('focusin', function () { activate(p); });
  });
  wide.addEventListener('change', function () {
    if (!wide.matches) { panels.forEach(function (x) { x.classList.remove('is-active'); }); }
    else if (!$('[data-panel].is-active')) { panels[0].classList.add('is-active'); }
  });

  /* ---------- Consultancy tabs ---------- */
  var tabs = $$('#con-tabs [role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t, false); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  if (tabs.length) selectTab(tabs[0], false);

  /* ---------- Price toggle (M250 / M250 + M150) ---------- */
  var toggle = $('#mgmt-toggle');
  var val = $('#price-val');
  var brk = $('#price-break');
  var addon = $('#addon');
  var cta = $('#web-cta');
  var shown = 250, anim = null;

  function countTo(target) {
    if (anim) cancelAnimationFrame(anim);
    if (reduced) { shown = target; val.textContent = target; return; }
    var from = shown, t0 = null, dur = 520;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (target - from) * e);
      val.textContent = shown;
      if (k < 1) anim = requestAnimationFrame(step);
    })(performance.now());
  }
  if (toggle && val) {
    toggle.addEventListener('change', function () {
      var on = toggle.checked;
      countTo(on ? 400 : 250);
      brk.textContent = on
        ? 'Website package M250/month + website management M150/month'
        : 'Website package: M250/month';
      addon.classList.toggle('is-on', on);
      if (cta) cta.setAttribute('data-service', on ? 'Website Management' : 'Website Design');
    });
  }

  /* ---------- Integration data-flow log ---------- */
  var rows = $$('#flow-list li');
  if (rows.length) {
    var idx = 0;
    var mark = function () { rows.forEach(function (r, i) { r.classList.toggle('is-on', i === idx); }); };
    mark();
    if (!reduced) {
      setInterval(function () { idx = (idx + 1) % rows.length; mark(); }, 1900);
    }
  }
})();
