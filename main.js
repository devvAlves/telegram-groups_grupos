// ============================================================
//  MAIN.JS — CHAOS MID-FUNNEL LP
//  Lógica: Roteamento PT/EN → links reais, contadores críveis,
//  notificações sociais, fade-in de seções, sticky footer
// ============================================================

(function () {
  'use strict';

  // ── LINKS DE DESTINO ────────────────────────────────────────
  // PT-BR → checkout apextry (UTMs já embutidas no link)
  const LINK_PT = 'https://apextry.com/go/acessovipoficial?utm_source=vazadostwt&utm_campaign=vazados&utm_medium=meio&utm_content=vazadoos&utm_term=termo&utm_id=id&apx=rvdie4u0&code=vazados';
  // EN → bot dedicado gringos
  const LINK_EN = 'https://t.me/clubxglobal_bot?start=matrizhub';

  // ── 1. DETECÇÃO DE IDIOMA + ROTEAMENTO ─────────────────────
  // Detecta idioma do navegador; qualquer variante de EN → bot gringo
  // Qualquer outra coisa (PT, ES, etc.) → link PT principal
  function detectLang() {
    const lpParam = new URLSearchParams(window.location.search).get('lang');
    if (lpParam) return lpParam.toLowerCase().startsWith('en') ? 'en' : 'pt';
    const nav = (navigator.language || navigator.userLanguage || 'pt').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'pt';
  }

  function applyLinks() {
    const lang     = detectLang();
    const baseLink = lang === 'en' ? LINK_EN : LINK_PT;

    // IDs dos três CTAs da página
    ['cta-hero', 'cta-main-link', 'cta-footer-link'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = baseLink;
    });

    // Guarda o idioma detectado para uso em outras funções
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
  }

  // ── 2. CONTADOR DE ACESSOS CRÍVEL ───────────────────────────
  // Número baseado em sessão — oscila de forma crível, não fake
  function initAccessCounter() {
    const storageKey = 'lp_access_count';
    const timestampKey = 'lp_access_ts';
    const now = Date.now();
    const twohours = 2 * 60 * 60 * 1000;

    let count = parseInt(localStorage.getItem(storageKey)) || 0;
    const lastTs = parseInt(localStorage.getItem(timestampKey)) || 0;

    // Reseta a cada 2h para manter crível
    if (now - lastTs > twohours || count === 0) {
      count = Math.floor(Math.random() * 18) + 19; // 19–37
      localStorage.setItem(storageKey, count);
      localStorage.setItem(timestampKey, now);
    }

    // Decrementa lentamente enquanto o lead está na página
    let current = count;
    const countEls = [
      document.getElementById('access-count'),
      document.getElementById('footer-count'),
    ].filter(Boolean);

    function update() {
      countEls.forEach(el => { el.textContent = current; });
    }
    update();

    // A cada 45–90 segundos, decrementa 1 (máx até 3)
    let decrements = 0;
    function tick() {
      if (decrements >= 3 || current <= 5) return;
      const delay = Math.floor(Math.random() * 45000) + 45000;
      setTimeout(() => {
        current = Math.max(current - 1, 4);
        decrements++;
        localStorage.setItem(storageKey, current);
        update();
        tick();
      }, delay);
    }
    tick();
  }

  // ── 3. NOTIFICAÇÕES SOCIAIS PROOF ───────────────────────────
  const notifications = [
    'Carlos M. acabou de garantir acesso ao acervo',
    'Pedro S. entrou no grupo há 1 min',
    'João R. confirmou o PIX agora',
    'Rafael T. já tá navegando no acervo',
    'Diego L. voltou pra renovar o acesso',
    'Thiago P. disse: não tem nada igual a isso',
    'Marcos A. fez o PIX e entrou',
    'Lucas B. desbloqueou acesso há 2 min',
  ];

  function initNotifications() {
    const toast = document.getElementById('notif-toast');
    const textEl = document.getElementById('notif-text');
    if (!toast || !textEl) return;

    let shown = 0;
    let msgIndex = Math.floor(Math.random() * notifications.length);

    function show() {
      if (shown >= 6) return; // Máx 6 notificações por sessão
      textEl.textContent = notifications[msgIndex % notifications.length];
      msgIndex++;
      shown++;

      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4500);

      // Próxima notificação em 18–35 segundos
      const nextDelay = Math.floor(Math.random() * 17000) + 18000;
      setTimeout(show, nextDelay);
    }

    // Primeira aparece após 12 segundos
    setTimeout(show, 12000);
  }

  // ── 4. FADE-IN DE SEÇÕES AO SCROLL ─────────────────────────
  function initFadeIn() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
  }

  // ── 5. STICKY FOOTER — OCULTAR NO HERO, MOSTRAR NO SCROLL ──
  function initStickyFooter() {
    const footer = document.getElementById('sticky-footer');
    const hero   = document.getElementById('hero');
    if (!footer || !hero) return;

    // Começa oculto
    footer.style.transform = 'translateY(100%)';
    footer.style.transition = 'transform 0.35s ease';

    const observer = new IntersectionObserver((entries) => {
      const heroVisible = entries[0].isIntersecting;
      footer.style.transform = heroVisible ? 'translateY(100%)' : 'translateY(0)';
    }, { threshold: 0.2 });

    observer.observe(hero);
  }

  // ── 6. TRACKING DE ABANDONO (saída sem clicar) ─────────────
  // Registra no localStorage para análise — não intercepta o usuário
  function initAbandonTracking() {
    let ctaClicked = false;

    ['cta-hero', 'cta-main-link', 'cta-footer-link'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { ctaClicked = true; });
    });

    window.addEventListener('beforeunload', () => {
      if (!ctaClicked) {
        const count = parseInt(localStorage.getItem('lp_abandon_count') || '0') + 1;
        localStorage.setItem('lp_abandon_count', count);
        localStorage.setItem('lp_abandon_ts', Date.now());
      }
    });
  }

  // ── 7. PIXEL RETARGETING (ativa após scroll 50%) ────────────
  // Placeholder: substituir pelo pixel real quando disponível
  function initRetargetingPixel() {
    let fired = false;
    window.addEventListener('scroll', () => {
      if (fired) return;
      const scrollPct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrollPct >= 0.50) {
        fired = true;
        // Aqui entra o código do pixel (ex: fbq, gtag, etc.)
        // console.log('[PIXEL] Retargeting event fired at 50% scroll');
      }
    }, { passive: true });
  }

  // ── INIT ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    applyLinks();
    initAccessCounter();
    initNotifications();
    initFadeIn();
    initStickyFooter();
    initAbandonTracking();
    initRetargetingPixel();
  });

})();
