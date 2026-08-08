/* ==========================================================================
   Perla Makhoul — site behaviour
   Small, dependency-free modules. Each guards its own markup, so every page
   can load this one file safely.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- toast */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* ------------------------------------------------------- reading progress */
  function progress() {
    var bar = $('.progress');
    if (!bar) return;
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ---------------------------------------------------------- scroll reveal */
  function reveals() {
    var items = $$('.rise');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------- count-up figures */
  function counters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = target + suffix; return; }
      var t0 = null, dur = 1300;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------- hover-to-reveal photos (touch) */
  function photos() {
    $$('.reveal-photo').forEach(function (fig) {
      fig.setAttribute('tabindex', '0');
      // On touch devices there is no hover: first tap opens the caption.
      fig.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: hover)').matches) return;
        if (e.target.closest('a')) return;
        fig.classList.toggle('is-open');
      });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fig.classList.toggle('is-open'); }
      });
    });
  }

  /* ---------------------------------------------------- disclosure (abstracts) */
  function disclosures() {
    $$('.disclose-btn').forEach(function (btn) {
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      if (!body) return;
      var label = btn.querySelector('.txt');
      var open = btn.getAttribute('data-open-label') || 'Hide abstract';
      var shut = btn.getAttribute('data-shut-label') || 'Read abstract';
      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isOpen));
        if (label) label.textContent = isOpen ? shut : open;
        if (isOpen) {
          body.style.height = body.scrollHeight + 'px';
          requestAnimationFrame(function () { body.style.height = '0px'; });
        } else {
          body.style.height = body.scrollHeight + 'px';
          var done = function () { body.style.height = 'auto'; body.removeEventListener('transitionend', done); };
          body.addEventListener('transitionend', done);
        }
      });
    });
  }

  /* ------------------------------------------------------ publication filters */
  function filters() {
    var chips = $$('.chip[data-filter]');
    if (!chips.length) return;
    var pubs = $$('[data-kind]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var shown = 0;
        pubs.forEach(function (p) {
          var match = key === 'all' || (p.getAttribute('data-kind') || '').split(' ').indexOf(key) > -1;
          p.classList.toggle('is-hidden', !match);
          if (match) shown++;
        });
        var count = $('#filter-count');
        if (count) count.textContent = shown + (shown === 1 ? ' item' : ' items');
      });
    });
  }

  /* ------------------------------------------------------------ copy to clip */
  function copiers() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var target = btn.getAttribute('data-copy-from');
        if (target) {
          var src = document.getElementById(target);
          if (src) text = src.textContent.replace(/\s+/g, ' ').trim();
        }
        var done = function () {
          var old = btn.textContent;
          btn.textContent = 'Copied ✓';
          btn.classList.add('ok');
          toast('Copied to clipboard');
          setTimeout(function () { btn.textContent = old; btn.classList.remove('ok'); }, 1800);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, function () { legacy(text, done); });
        } else { legacy(text, done); }
      });
    });
    function legacy(text, cb) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); cb(); } catch (e) { toast('Copy failed — select the text manually'); }
      document.body.removeChild(ta);
    }
  }

  /* ---------------------------------------------------------------- lightbox */
  function lightbox() {
    var triggers = $$('[data-lightbox]');
    if (!triggers.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = '<button class="x" aria-label="Close">✕</button>' +
                    '<div><img alt=""><p class="cap"></p></div>';
    document.body.appendChild(box);
    var img = $('img', box), cap = $('.cap', box), clearTimer;

    var open = function (src, text) {
      clearTimeout(clearTimer);
      img.src = src; img.alt = text || '';
      cap.textContent = text || '';
      box.classList.add('show');
      document.body.style.overflow = 'hidden';
      $('.x', box).focus();
    };
    var close = function () {
      box.classList.remove('show');
      document.body.style.overflow = '';
      clearTimeout(clearTimer);
      clearTimer = setTimeout(function () { img.removeAttribute('src'); }, 400);
    };
    triggers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        var src = el.getAttribute('data-lightbox') || (el.querySelector('img') || {}).src;
        if (!src) return;
        open(src, el.getAttribute('data-caption') || '');
      });
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target.closest('.x')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('show')) close(); });
  }

  /* ------------------------------------------------- collapsible rail navigation */
  function navToggle() {
    var btn = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!btn || !nav) return;

    var label = btn.querySelector('.lbl');
    var set = function (open, remember) {
      nav.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (remember) { try { localStorage.setItem('pm-nav', open ? '1' : '0'); } catch (e) {} }
    };

    // Stay open once opened — the choice carries across pages.
    var saved = null;
    try { saved = localStorage.getItem('pm-nav'); } catch (e) {}
    set(saved === '1', false);

    btn.addEventListener('click', function () {
      set(nav.hidden, true);
    });
  }

  /* ------------------------------------------------------------------ fabs */
  function fabs() {
    var dock = $('.fab-dock');
    if (!dock) return;

    var main = $('#fab-main', dock);
    if (main) {
      main.addEventListener('click', function () {
        var open = document.body.classList.toggle('fabs-open');
        main.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function (e) {
        if (!dock.contains(e.target)) {
          document.body.classList.remove('fabs-open');
          main.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var top = $('#fab-top', dock);
    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
      var show = function () { top.hidden = window.scrollY < 400; };
      window.addEventListener('scroll', show, { passive: true });
      show();
    }

    var pal = $('#fab-palette', dock);
    if (pal) {
      var order = ['ochre', 'rose', 'sage'];
      var names = { ochre: 'Ochre', rose: 'Rose', sage: 'Sage' };
      var saved = null;
      try { saved = localStorage.getItem('pm-palette'); } catch (e) {}
      if (saved && order.indexOf(saved) > 0) document.documentElement.setAttribute('data-palette', saved);
      pal.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-palette') || 'ochre';
        var next = order[(order.indexOf(cur) + 1) % order.length];
        if (next === 'ochre') document.documentElement.removeAttribute('data-palette');
        else document.documentElement.setAttribute('data-palette', next);
        try { localStorage.setItem('pm-palette', next); } catch (e) {}
        toast(names[next] + ' palette');
      });
    }

    var pr = $('#fab-print', dock);
    if (pr) pr.addEventListener('click', function () { window.print(); });
  }

  /* --------------------------------------------------------- contact form */
  function contactForm() {
    var form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to   = form.getAttribute('data-to') || '';
      var name = (form.elements.name.value || '').trim();
      var subj = (form.elements.subject.value || '').trim() || 'Message from your website';
      var msg  = (form.elements.message.value || '').trim();
      var from = (form.elements.email.value || '').trim();
      if (!msg) { toast('Please write a message first'); form.elements.message.focus(); return; }
      var body = msg + '\n\n—\n' + name + (from ? ' · ' + from : '');
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subj) +
        '&body=' + encodeURIComponent(body);
      toast('Opening your mail app…');
    });
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    progress(); reveals(); counters(); photos();
    disclosures(); filters(); copiers(); lightbox();
    navToggle(); fabs(); contactForm();
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
