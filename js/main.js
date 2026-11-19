/* Photon – site behaviour. No dependencies. */
(function () {
  'use strict';

  var cfg = window.PHOTON_CONFIG || {};
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme ---------- */
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function syncToggles() {
    var t = currentTheme();
    var next = t === 'dark' ? 'light' : 'dark';
    $$('.js-theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      var label = $('.theme-label', btn);
      if (label) label.textContent = btn.classList.contains('theme-toggle-wide')
        ? 'Theme: ' + (t === 'dark' ? 'Dark' : 'Light')
        : (t === 'dark' ? 'Dark' : 'Light');
    });
    var metaLight = $('meta[name="theme-color"][media*="light"]');
    var metaDark = $('meta[name="theme-color"][media*="dark"]');
    if (metaLight && metaDark) { /* media-specific values already cover system theme */ }
  }
  $$('.js-theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('photon-theme', next); } catch (e) {}
      syncToggles();
    });
  });
  syncToggles();

  // Follow system changes until the visitor makes an explicit choice
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSys = function (e) {
      var stored = null;
      try { stored = localStorage.getItem('photon-theme'); } catch (err) {}
      if (!stored) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); syncToggles(); }
    };
    if (mq.addEventListener) mq.addEventListener('change', onSys);
  }

  /* ---------- Header state ---------- */
  var header = $('#site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav a');
  var map = {};
  navLinks.forEach(function (a) { map[a.getAttribute('data-nav')] = a; });
  var spyTargets = ['website', 'integrations', 'hardware', 'consultancy', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function spy() {
    var y = window.scrollY + header.offsetHeight + 120;
    var active = 'top';
    spyTargets.forEach(function (s) { if (s.offsetTop <= y) active = s.id; });
    if (document.getElementById('why') && document.getElementById('why').offsetTop <= y && active === 'consultancy') active = 'consultancy';
    navLinks.forEach(function (a) { a.classList.toggle('is-active', a === map[active] && active !== 'top'); });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Contact details from config ---------- */
  function clean(s) { return typeof s === 'string' ? s.trim() : ''; }
  var email = clean(cfg.email), phone = clean(cfg.phone), wa = clean(cfg.whatsapp).replace(/\D/g, '');

  function fillContact(container) {
    if (!container) return;
    var li;
    if (email && (li = $('[data-contact="email"]', container))) {
      var a = $('a', li); a.href = 'mailto:' + email; a.textContent = email; a.hidden = false;
    }
    if (phone && (li = $('[data-contact="phone"]', container))) {
      var p = $('a', li); p.href = 'tel:' + phone.replace(/[^\d+]/g, ''); p.textContent = phone; p.hidden = false;
    }
    if (wa && (li = $('[data-contact="whatsapp"]', container))) {
      var w = $('a', li); w.href = 'https://wa.me/' + wa; w.textContent = 'Message on WhatsApp'; li.hidden = false;
    }
  }
  fillContact($('#contact-methods'));
  fillContact($('#footer-contact'));

  var socialBox = $('#footer-social');
  var labels = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', x: 'X' };
  if (socialBox && cfg.social) {
    Object.keys(labels).forEach(function (k) {
      var url = clean(cfg.social[k]);
      if (/^https?:\/\//i.test(url)) {
        var a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = labels[k];
        socialBox.appendChild(a);
      }
    });
    if (socialBox.children.length) socialBox.hidden = false;
  }

  var yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Enquiry form ---------- */
  var form = $('#enquiry-form');
  var statusBox = $('#form-status');
  var submitBtn = $('#submit-btn');
  var serviceSel = $('#f-service');
  var integrationBox = $('#integration-fields');
  var messageEl = $('#f-message');
  var integrationServices = [
    'Lekuka Integration',
    'Lekuka-compliant CRM / ERP',
    'Sage + TaxLink + Lekuka Integration',
    'Custom Lekuka Integration'
  ];

  function syncIntegrationFields() {
    integrationBox.hidden = integrationServices.indexOf(serviceSel.value) === -1;
  }
  serviceSel.addEventListener('change', syncIntegrationFields);

  // Links that pre-select a service (and optionally pre-fill the message)
  var noteMarker = 'I would like a quotation for: ';
  $$('[data-service]').forEach(function (el) {
    el.addEventListener('click', function () {
      var svc = el.getAttribute('data-service');
      var note = el.getAttribute('data-note');
      $$('option', serviceSel).forEach(function (o) { if (o.value === svc || o.textContent === svc) serviceSel.value = o.value || o.textContent; });
      syncIntegrationFields();
      if (note && (!messageEl.value.trim() || messageEl.value.indexOf(noteMarker) === 0)) {
        messageEl.value = noteMarker + note + '.';
      }
      clearErr(serviceSel);
    });
  });

  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el, msg) {
    var f = fieldOf(el); if (!f) return;
    var p = $('.err', f); if (p) p.textContent = msg;
    f.classList.add('has-error'); el.setAttribute('aria-invalid', 'true');
  }
  function clearErr(el) {
    var f = fieldOf(el); if (!f) return;
    var p = $('.err', f); if (p) p.textContent = '';
    f.classList.remove('has-error'); el.removeAttribute('aria-invalid');
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+()\d][\d\s().-]{5,19}$/;

  function validateField(el) {
    var v = el.value.trim();
    switch (el.name) {
      case 'name': if (!v) return 'Please enter your name.'; if (v.length < 2) return 'Please enter your full name.'; break;
      case 'email': if (!v) return 'Please enter your email address.'; if (!emailRe.test(v)) return 'Please enter a valid email address.'; break;
      case 'phone': if (v && !phoneRe.test(v)) return 'Please enter a valid phone number, or leave it blank.'; break;
      case 'service': if (!v) return 'Please choose the service you need.'; break;
      case 'message': if (!v) return 'Please describe your project or requirement.'; if (v.length < 10) return 'Please add a little more detail (at least 10 characters).'; break;
    }
    return '';
  }

  var validated = ['name', 'email', 'phone', 'service', 'message'].map(function (n) { return form.elements[n]; });
  function validateForm() {
    var firstBad = null;
    validated.forEach(function (el) {
      var m = validateField(el);
      if (m) { setErr(el, m); if (!firstBad) firstBad = el; } else { clearErr(el); }
    });
    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }
  validated.forEach(function (el) {
    el.addEventListener('blur', function () { var m = validateField(el); m ? setErr(el, m) : clearErr(el); });
    el.addEventListener('input', function () { if (fieldOf(el).classList.contains('has-error')) { var m = validateField(el); m ? setErr(el, m) : clearErr(el); } });
  });

  function showStatus(kind, html) {
    statusBox.innerHTML = '<div class="msg' + (kind === 'error' ? ' is-error' : '') + '">' + html + '</div>';
    statusBox.focus();
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function collect() {
    var d = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.name === '_gotcha' || el.closest('[hidden]')) return;
      var v = el.value.trim(); if (v) d[el.name] = v;
    });
    return d;
  }
  var labelsMap = {
    name: 'Name', business: 'Business', email: 'Email', phone: 'Phone', service: 'Service',
    existing_software: 'Existing software', systems_to_connect: 'Systems to connect',
    current_challenges: 'Current challenges', desired_outcome: 'Desired outcome', message: 'Project description'
  };
  function asText(d) {
    return Object.keys(labelsMap).filter(function (k) { return d[k]; })
      .map(function (k) { return labelsMap[k] + ': ' + d[k]; }).join('\n');
  }

  function setBusy(b) {
    submitBtn.disabled = b;
    $('.btn-label', submitBtn).textContent = b ? 'Sending…' : 'Send Enquiry';
  }

  var whatsappBtn = $('#whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.hidden = !wa;
    whatsappBtn.addEventListener('click', function () {
      statusBox.innerHTML = '';
      if (!validateForm()) return;
      if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return;

      var href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(asText(collect()));
      var whatsappWindow = window.open(href, '_blank');
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        showStatus('ok', '<p><strong>WhatsApp is ready.</strong></p><p>Your enquiry is pre-filled. Review it and press Send in WhatsApp to complete it.</p>');
      } else {
        showStatus('error', '<p><strong>WhatsApp could not be opened automatically.</strong></p><p><a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">Open WhatsApp with your enquiry</a>.</p>');
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.innerHTML = '';

    if (!validateForm()) return;

    // Honeypot: silently pretend nothing happened for bots
    if (form.elements['_gotcha'] && form.elements['_gotcha'].value) return;

    var data = collect();
    var endpoint = clean(cfg.formEndpoint);

    if (endpoint) {
      setBusy(true);
      var payload = {};
      Object.keys(data).forEach(function (k) { payload[k] = data[k]; });
      payload._subject = 'Photon website enquiry: ' + data.service;
      payload.summary = asText(data);
      var extra = cfg.formExtraFields || {};
      Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (res.ok && body.success !== false && !body.error) {
            form.reset(); syncIntegrationFields();
            showStatus('ok', '<p><strong>Thank you, ' + esc(data.name.split(' ')[0]) + '.</strong></p><p>Your enquiry has been sent. We will review it and reply to ' + esc(data.email) + '.</p>');
          } else { throw new Error('rejected'); }
        });
      }).catch(function () {
        var alt = email ? ' You can also email us directly at <a href="mailto:' + esc(email) + '">' + esc(email) + '</a>.' : '';
        showStatus('error', '<p><strong>Your enquiry could not be sent.</strong></p><p>Please check your connection and try again.' + alt + '</p>');
      }).then(function () { setBusy(false); });
      return;
    }

    // No form service configured: fall back to the visitor's email app if an address is set.
    if (email) {
      var href = 'mailto:' + email + '?subject=' + encodeURIComponent('Enquiry: ' + data.service) + '&body=' + encodeURIComponent(asText(data));
      showStatus('ok', '<p><strong>Almost there.</strong></p><p>Your email app should now open with your enquiry filled in. Press send there to complete it. Nothing has been sent yet. If nothing opened, write to <a href="mailto:' + esc(email) + '">' + esc(email) + '</a>.</p>');
      window.location.href = href;
      return;
    }

    if (window.console) console.warn('Photon: set formEndpoint or email in js/config.js to enable enquiries.');
    showStatus('error', '<p><strong>Online enquiries are not switched on yet.</strong></p><p>Your message has not been sent. Please try again later.</p>');
  });
})();
