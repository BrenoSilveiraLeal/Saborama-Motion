/* Saborama Motion · abertura.
   Um hambúrguer se monta sozinho, sem depender da rolagem: as peças flutuam separadas, descem uma por uma até formar o lanche,
   ele fica um instante pronto e se desfaz para o próximo sabor entrar. A cor da abertura acompanha cada sabor.
   A montagem passo a passo, guiada pela rolagem, fica na cozinha (#cena), que abre quando a pessoa escolhe um prato. */
(function () {
  const S = window.SM, ING = S.ING, $ = (s, r = document) => r.querySelector(s);
  const hero = $('#abertura'); if (!hero || !window.gsap || !ING) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brl = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ingUrl = (k) => `assets/ingredients/${k}.png`;

  /* sabores da abertura: os que são montados só com ingredientes recortados */
  const ORDEM = ['smash-classico', 'bacon-smoke', 'egg-burger', 'salada-burger'];
  const lista = ORDEM.map((id) => S.SHOWS.find((s) => s.id === id)).filter((s) => s && s.recipe && s.recipe.every((k) => ING[k]));
  if (!lista.length) return;

  const palco = $('#hb'), pilha = $('.hb-stack', palco), sombra = $('.hb-shadow', palco), tag = $('#hbTag');
  let k = 0, atual = lista[0], tl = null, visivel = true, comecou = false;

  /* faixa do topo */
  const FRASES = ['Montado na hora', 'Smash na chapa', 'Fritas crocantes', 'Pizza no forno', 'Milkshake batido na hora', 'Do pão à tampa'];
  $('#tape').innerHTML = [...FRASES, ...FRASES, ...FRASES, ...FRASES].map((f) => `<span>${f}</span><i>✦</i>`).join('');

  /* as cores ficam na raiz: o topo da página, fora da abertura, também acompanha o sabor */
  const raiz = document.documentElement.style;
  const cores = (s) => { raiz.setProperty('--h-page', s.colors.page); raiz.setProperty('--h-ink', s.colors.ink); raiz.setProperty('--h-acc', s.colors.accent); };

  /* geometria: o lanche pronto ocupa no máximo 60% da altura do palco; separado, as peças sobem em leque pela altura toda */
  const medir = (s) => {
    const Hh = palco.clientHeight, Ww = palco.clientWidth, gs = s.recipe.map((key) => ING[key]), n = gs.length;
    const alto = gs.reduce((a, g, i) => a + (i < n - 1 ? g.t : (g.w || 1) / g.ar), 0), W = Math.min(Ww * 0.86, (Hh * (innerWidth <= 800 ? 0.78 : 0.7)) / alto);
    let y = 0; const fin = gs.map((g) => { const w = W * (g.w || 1), h = w / g.ar, rest = y - (g.dy || 0) * W; y += g.t * W; return { w, h, x: -w / 2, y: -h - rest }; });
    const vao = Math.min(Hh * 0.8, W * 0.3 * n + W * 0.4);
    const sep = fin.map((f, i) => { const lado = i % 2 ? 1 : -1, cy = -((i + 0.5) / n) * vao; return { x: f.x + lado * W * (0.1 + ((i * 7) % 3) * 0.06), y: cy - f.h / 2, r: lado * (5 + ((i * 5) % 8)) }; });
    return { W, fin, sep };
  };

  const escreverTag = (s) => {
    $('#hbName').textContent = s.name;
    $('#hbPrice').textContent = brl(s.price);
    $('#heroSee').textContent = `Ver o ${s.name} montando`;
  };

  const montarPecas = (s, m) => {
    pilha.innerHTML = '';
    return s.recipe.map((key, i) => { const im = new Image(); im.src = ingUrl(key); im.alt = ''; im.className = 'hb-p'; im.draggable = false; im.style.width = m.fin[i].w + 'px'; im.style.zIndex = i + 1; pilha.appendChild(im); return im; });
  };

  const estatico = () => { const s = lista[0], m = medir(s), p = montarPecas(s, m); cores(s); escreverTag(s); p.forEach((im, i) => gsap.set(im, { x: m.fin[i].x, y: m.fin[i].y })); gsap.set(sombra, { width: m.W * 1.15, opacity: 0.5 }); };

  /* uma volta: as camadas caem do alto, uma sobre a outra, o lanche fica pronto um instante e sai para o próximo entrar */
  const volta = () => {
    const s = lista[k % lista.length]; k++; atual = s;
    const m = medir(s), pecas = montarPecas(s, m), n = pecas.length, alto = palco.clientHeight + 120;
    cores(s); escreverTag(s);
    gsap.set(pilha, { scaleY: 1, scale: 1, opacity: 1, y: 0, transformOrigin: '0px 0px' }); gsap.set(sombra, { width: m.W * 1.15, scaleX: 0.3, opacity: 0 });
    pecas.forEach((im, i) => gsap.set(im, { x: m.fin[i].x, y: m.fin[i].y - alto, rotation: (i % 2 ? 1 : -1) * 8 }));
    tl = gsap.timeline({ onComplete: volta, paused: !visivel });
    const t0 = 0.3, passo = 0.2;
    pecas.forEach((im, i) => {
      const t = t0 + i * passo;
      tl.to(im, { y: m.fin[i].y, rotation: 0, duration: 0.42, ease: 'power2.in' }, t);
      /* cada camada que pousa amassa a pilha um pouquinho */
      tl.to(pilha, { scaleY: 0.95, duration: 0.06, ease: 'power1.out' }, t + 0.42).to(pilha, { scaleY: 1, duration: 0.45, ease: 'elastic.out(1,.4)' }, t + 0.48);
      tl.to(sombra, { scaleX: 0.4 + (0.6 * (i + 1)) / n, opacity: 0.2 + (0.3 * (i + 1)) / n, duration: 0.25 }, t + 0.38);
    });
    const fim = t0 + (n - 1) * passo + 0.55;
    tl.call(() => { escreverTag(s); if (!reduce) gsap.fromTo(tag, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.5)' }); }, null, fim);
    /* pronto: balança de leve enquanto fica em cena */
    tl.to(pilha, { rotation: 2, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 3 }, fim + 0.1);
    tl.to(pilha, { y: 30, scale: 0.86, opacity: 0, duration: 0.45, ease: 'power2.in' }, fim + 3.4);
    tl.to(sombra, { scaleX: 0.2, opacity: 0, duration: 0.4 }, fim + 3.4);
  };

  /* ingredientes soltos em volta, em profundidades diferentes, que seguem o mouse de leve */
  const DECO = [['tomato', 6, 20, 120, 0, -14], ['pickles', 82, 16, 104, 1, 10], ['onion', 86, 56, 132, 0, -8], ['lettuce', 27, 72, 130, 1, 12], ['cheddar', 70, 82, 96, 2, 18]];
  const deco = $('#hdeco');
  deco.innerHTML = DECO.map(([key, x, y, w, z, r]) => `<span class="hd hd-${z}" style="left:${x}%;top:${y}%;--w:${w}px;--r:${r}deg"><img src="${ingUrl(key)}" alt="" draggable="false"></span>`).join('');
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    const itens = [...deco.children].map((el, i) => ({ x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }), f: [26, 14, 34, 18, 44][i] }));
    const word = gsap.quickTo('.hero-word', 'x', { duration: 1.4, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5; itens.forEach((it) => { it.x(-dx * it.f); it.y(-dy * it.f); }); word(dx * 18); });
  }

  /* SABORAMA gigante (abertura e rodapé): o tamanho da letra se ajusta para a palavra inteira caber, centralizada */
  const ajustarPalavra = () => document.querySelectorAll('.hero-word,.foot-word').forEach((el) => {
    if (!el.firstElementChild) el.innerHTML = `<span>${el.textContent.trim()}</span>`;
    const sp = el.firstElementChild, alvo = el.clientWidth * 0.94; el.style.fontSize = ''; const atual = parseFloat(getComputedStyle(el).fontSize), w = sp.getBoundingClientRect().width / (window.SM_Z || 1);
    if (w > 0 && alvo > 0) el.style.fontSize = (atual * alvo) / w + 'px';
  });
  ajustarPalavra(); addEventListener('resize', ajustarPalavra); if (document.fonts) document.fonts.ready.then(ajustarPalavra);

  /* fora da tela, a montagem pausa */
  new IntersectionObserver((es) => { visivel = es[0].isIntersecting; if (tl) visivel ? tl.play() : tl.pause(); }, { threshold: 0.05 }).observe(hero);

  /* tela mudou de tamanho: a volta recomeça com as medidas novas */
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (!comecou) return; if (reduce) { estatico(); return; } if (tl) tl.kill(); k = Math.max(0, k - 1); volta(); }, 200); });

  /* ver o lanche da abertura sendo montado de verdade, na cozinha */
  const verMontando = (id) => S.abrirCozinha && S.abrirCozinha(id);
  palco.addEventListener('click', () => verMontando(atual.id));
  $('#heroSee').addEventListener('click', () => verMontando(atual.id));
  const fs = $('#footSee'); if (fs) fs.addEventListener('click', () => verMontando(lista[0].id));

  const comecar = () => {
    if (comecou) return; comecou = true;
    if (reduce) { estatico(); return; }
    gsap.timeline()
      .from('.hero-word', { yPercent: 30, opacity: 0, duration: 1, ease: 'power3.out' }, 0)
      .from('.hero-copy > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0.2)
      .from('.hd', { scale: 0, opacity: 0, stagger: 0.07, duration: 0.8, ease: 'back.out(1.6)' }, 0.3)
      .from('.stk, .hero-tag', { scale: 0.6, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'back.out(2)' }, 0.6);
    volta();
  };
  cores(lista[0]); escreverTag(lista[0], false);
  if (S.pronto) comecar(); else document.addEventListener('sm:pronto', comecar, { once: true });
})();
