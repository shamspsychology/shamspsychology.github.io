/* Shams Psychology Center: shared page behaviour (both languages). */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var AR = root.lang === 'ar';
  var T = AR
    ? { greet: 'مرحبًا مركز شمس، ', open: 'مفتوح الآن', closed: 'مغلق الآن، وسنرد على رسالتك عند الافتتاح',
        nameErr: 'اكتب اسمك من فضلك.', msgErr: 'اكتب رسالتك من فضلك.', menu: 'القائمة', close: 'إغلاق' }
    : { greet: 'Hello Shams, ', open: 'Open now', closed: 'Closed now, we will reply when we open',
        nameErr: 'Please enter your name.', msgErr: 'Please write your message.', menu: 'Menu', close: 'Close' };
  var WA = 'https://wa.me/201200907001?text=';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* WhatsApp links carry a ready-made first message. Without JS they still open the chat. */
  $$('[data-wa]').forEach(function (a) {
    a.href = WA + encodeURIComponent(T.greet + a.getAttribute('data-wa'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* Open now? Saturday to Thursday, 10:00 to 22:00, Cairo time */
  var state = document.getElementById('hoursState');
  if (state) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', weekday: 'short', hour: '2-digit', hour12: false }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      var open = get('weekday') !== 'Fri' && +get('hour') >= 10 && +get('hour') < 22;
      state.classList.toggle('is-open', open);
      document.getElementById('hoursText').textContent = open ? T.open : T.closed;
    } catch (e) { /* keep the static label */ }
  }

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn'), mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var on = mobileNav.getAttribute('data-open') !== 'true';
      mobileNav.setAttribute('data-open', on);
      menuBtn.setAttribute('aria-expanded', on);
      menuBtn.setAttribute('aria-label', on ? T.close : T.menu);
      menuBtn.innerHTML = '<i class="ph ' + (on ? 'ph-x' : 'ph-list') + '" aria-hidden="true"></i>';
    });
  }

  /* Filter chips (team specialties, blog categories): data-filter-group + data-tags */
  $$('[data-filters]').forEach(function (bar) {
    var target = document.getElementById(bar.getAttribute('data-filters'));
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      var val = btn.getAttribute('data-value');
      $$('.filter', bar).forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      $$('[data-tags]', target).forEach(function (el) {
        el.hidden = !(val === 'all' || el.getAttribute('data-tags').split(' ').indexOf(val) > -1);
      });
    });
  });

  /* Team profile dialog */
  var dlg = document.getElementById('profile');
  if (dlg) {
    var last = null;
    $$('[data-profile]').forEach(function (card) {
      card.addEventListener('click', function () {
        var d = JSON.parse(document.getElementById('p-' + card.getAttribute('data-profile')).textContent);
        dlg.querySelector('img').src = d.img; dlg.querySelector('img').alt = d.name;
        dlg.querySelector('h2').textContent = d.name;
        dlg.querySelector('.role').textContent = d.role;
        dlg.querySelector('.bio').textContent = d.bio;
        var book = dlg.querySelector('[data-book]');
        book.href = WA + encodeURIComponent(T.greet + d.book);
        last = card;
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.close-x')) dlg.close(); });
    dlg.addEventListener('close', function () { if (last) last.focus(); });
  }

  /* Contact form: composes a WhatsApp message (nothing is stored on this site) */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [['cName', T.nameErr], ['cMsg', T.msgErr]].forEach(function (f) {
        var el = document.getElementById(f[0]), wrap = el.closest('.field');
        var bad = el.value.trim().length < 2;
        wrap.classList.toggle('invalid', bad);
        wrap.querySelector('.err').textContent = bad ? f[1] : '';
        el.setAttribute('aria-invalid', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var topic = document.getElementById('cTopic');
      var body = (AR ? 'اسمي ' : 'My name is ') + document.getElementById('cName').value.trim() + '.\n' +
        (topic && topic.value ? (AR ? 'الموضوع: ' : 'Topic: ') + topic.value + '\n' : '') +
        document.getElementById('cMsg').value.trim();
      window.open(WA + encodeURIComponent(T.greet + body), '_blank', 'noopener');
    });
  }

  /* Reveal on scroll */
  var els = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
