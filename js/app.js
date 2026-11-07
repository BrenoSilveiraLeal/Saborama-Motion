/* Saborama Motion · cozinha com rolagem e abertura em círculo, troca de prato com onda de líquido, cardápio em grade que expande e pedido. */
(function () {
  const { SHOWS, TYPES } = window.SM;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const brl = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sceneUrl = (n) => `assets/scenes/${n}.jpg`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const ARROW = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  const ARROWL = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 4 3 8l4 4"/></svg>';

  /* ---------- catálogo ---------- */
  const DISHES = [];
  TYPES.forEach((t) => t.items.forEach(([name, desc, price, show]) => DISHES.push({ id: t.id + '-' + name, type: t, name, desc, price, show })));
  const showById = (id) => SHOWS.find((s) => s.id === id);
  $('#totalLine').textContent = `${TYPES.length} tipos · ${DISHES.length} sabores`;
  $('#band').innerHTML = [...TYPES, ...TYPES, ...TYPES].map((t) => `<span>${esc(t.name)}</span><i>●</i>`).join('');

  /* ---------- cozinha ---------- */
  let cur = 0, target = 0, p = 0, stepNow = -1, busy = false, shotEls = [], fxKind = 'smoke';
  const cena = $('#cena'), stage = $('#stage'), shotsEl = $('#shots'), stepsEl = $('#steps');
  const setVars = (c) => { const r = document.documentElement.style; r.setProperty('--page', c.page); r.setProperty('--ink', c.ink); r.setProperty('--soft', c.soft); r.setProperty('--accent', c.accent); };
  const sectionRange = () => ({ top: cena.offsetTop, h: cena.offsetHeight - innerHeight });
  const jumpTo = (f) => { const { top, h } = sectionRange(); scrollTo({ top: top + h * f, behavior: reduce ? 'auto' : 'smooth' }); };
  const ingUrl = (k) => `assets/ingredients/${k}.png`;
  const stepImg = (s) => (s.frame ? `assets/frames/${s.frame}.jpg` : s.ing ? ingUrl(s.ing) : sceneUrl(s.img));
  const showThumb = (s) => s.heroUrl || sceneUrl(s.recipe ? s.hero : s.steps[s.steps.length - 1].img);
  let layers = [], frameEls = [], fizz = null;
  /* bebidas com gás: as bolhas sobem dentro do copo */
  const FIZZ = new Set(['cola', 'colazero', 'guaraná', 'guaranázero', 'laranja', 'uva', 'limão', 'tônica', 'água']);
  const SAUCE = { spraychantilly: 'linear-gradient(90deg,#E9E4D8,#FFFFFF 45%,#EEE9DE)', frascocaramelo:'linear-gradient(90deg,#A8661C,#DC9A44 45%,#B47022)', pegadormel:'linear-gradient(90deg,#B86A08,#F5B02E 45%,#C4780C)', conchrose: 'linear-gradient(90deg,#C4806E,#EDB2A0 45%,#CE8A78)', conchastrogonoff: 'linear-gradient(90deg,#B87448,#E2A070 45%,#C27E52)', conchalaranja: 'linear-gradient(90deg,#C25A10,#F08A28 45%,#CC6414)', conchavinho: 'linear-gradient(90deg,#4E0F16,#7C1E28 45%,#581219)', conchacaramelo: 'linear-gradient(90deg,#96540F,#CC7E24 45%,#A05C12)', conchacarbonara: 'linear-gradient(90deg,#D9AE5E,#F8DC96 45%,#E0B668)', conchacheddar:'linear-gradient(90deg,#D9730A,#FF9D14 45%,#E07C0C)', requeijao:'linear-gradient(90deg,#E4D8B8,#FFFBEF 45%,#EADFC2)', ketchup:'linear-gradient(90deg,#7E0F08,#C9261A 45%,#8E130B)', mostarda: 'linear-gradient(90deg,#A87C08,#E6B716 45%,#B98A0A)', barbecue: 'linear-gradient(90deg,#2A0F05,#6A2A10 45%,#34130A)', maionese: 'linear-gradient(90deg,#D8CCA8,#FBF5E2 45%,#E2D7B6)', cheddar: 'linear-gradient(90deg,#B86A08,#F2A81D 45%,#C4740A)', concha: 'linear-gradient(90deg,#8E1E0C,#D23A1C 45%,#9C230E)', conchamarrom: 'linear-gradient(90deg,#3A1B0A,#7A3E1A 45%,#44200C)', conchacreme: 'linear-gradient(90deg,#D9C9A2,#FBF3DD 45%,#E1D3AE)', conchaamarela: 'linear-gradient(90deg,#B47A10,#F0B42C 45%,#BF8414)', conchaverde: 'linear-gradient(90deg,#3F5F1E,#7FA63A 45%,#486B22)' };
  const GRAO = { colherleite: '#FBF6E8', colhervatapa: '#D69A24', colherchimichurri: '#3F7A22', saleirooregano: '#5C7034', saleiro: '#F6F1E6', saleiroescuro: '#4A2A15', saleirodourado: '#DDB872' };
  const buildShots = (show) => {
    shotsEl.innerHTML = ''; layers = []; shotEls = []; frameEls = []; fizz = null;
    stage.classList.toggle('is-build', !!show.recipe);
    if (show.recipe) {
      const wrap = document.createElement('div'); wrap.className = 'build'; wrap.innerHTML = `<img class="b-bg" src="${sceneUrl(window.SM.BOARD.img)}" alt=""><div class="b-shadow"></div><div class="b-stack"></div><img class="b-final" src="${showThumb(show)}" alt=""><div class="b-fade"></div>`;
      shotsEl.appendChild(wrap); const st = $('.b-stack', wrap);
      /* fotos reais de cada etapa, uma por ingrediente (a última etapa é a foto final) */
      frameEls = (show.frames || []).map((n) => { const f = new Image(); f.className = 'b-frame'; f.alt = ''; f.onerror = () => { f.style.display = 'none'; }; f.src = `assets/frames/${n}.jpg`; wrap.insertBefore(f, st); return f; });
      layers = show.recipe.map((k, i) => { const fr = show.frames && show.frames[i], im = new Image(); im.className = 'b-ing'; im.alt = ''; const box = fr && window.SM.PIECES[fr], pour = show.pours && show.pours[i]; if (box && !pour) im.src = `assets/frames/${fr}-peca.png`; else if (!fr) im.src = ingUrl(k); im.style.zIndex = i + 1; st.appendChild(im);
        /* etapa de molho: um frasco de verdade entra em cena e aplica o molho */
        let bottle = null, stream = null; if (pour) { if (/^ralador/.test(pour || '')) { bottle = document.createElement('div'); bottle.className = 'b-bottle b-grater'; bottle.innerHTML = '<img src="assets/tools/ralador-base.png" alt=""><img class="g-queijo" src="assets/tools/' + (pour === 'raladorchocolate' ? 'ralador-chocolate' : 'ralador-queijo') + '.png" alt="">'; bottle.naturalWidth = 452; bottle.naturalHeight = 900; Object.defineProperty(bottle, 'complete', { get: () => [...bottle.children].every((c) => c.complete) }); } else { bottle = new Image(); bottle.className = 'b-bottle'; bottle.alt = ''; bottle.src = `assets/tools/${pour}.png`; } stream = document.createElement('div'); stream.className = 'b-stream'; stream.style.background = SAUCE[pour] || SAUCE.ketchup; wrap.append(stream, bottle); }
        /* etapa de líquido: um jato cai de cima e enche o recipiente */
        /* água e tônica são transparentes: a cor medida na foto puxaria para o marrom da luz da cena */
        const corCafe = show.type === 'cafes' && { espresso: '#3A2013', duplo: '#3A2013', mocha: '#4A2A18', 'mocha sem creme': '#4A2A18', gelado: '#5A3820', quente: '#3F2214', cappuccino: '#9A6E48', latte: '#B98E66' }[(show.stepKeys || [])[i]];
        const fill = corCafe || show.fills && show.fills[i] && (/^(jarraagua|latatonica|garrafacachaca|garrafagin|garrafarum)$/.test(pour || '') ? '#D6E4E8' : show.fills[i]); if (fill) { stream = document.createElement('div'); stream.className = 'b-stream'; stream.style.background = `linear-gradient(90deg,${fill},color-mix(in srgb,${fill} 88%,#fff) 45%,${fill})`; if (/^(jarraagua|latatonica|garrafacachaca|garrafagin|garrafarum)$/.test(pour || '')) stream.style.opacity = 0.5; wrap.append(stream); }
        const temperando = /^(saleiro|colher)/.test(pour || '') && pour !== 'colherpure';
        const shreds = pour === 'mao' || /^ralador/.test(pour || '') || temperando ? Array.from({ length: /^ralador/.test(pour || '') || temperando ? 44 : 26 }, () => { const q = document.createElement('i'); q.className = temperando ? 'b-shred grao' : 'b-shred'; if (temperando) q.style.background = GRAO[pour] || GRAO.saleiro; if (pour === 'raladorchocolate') q.style.background = 'linear-gradient(90deg,#3A1E10,#6A3C20)'; wrap.appendChild(q); return q; }) : null;
        const layer = { k, im, g: window.SM.ING[k] || { ar: 1.6, w: 1, t: 0.1 }, box, pour, fill, bottle, stream, shreds, espalha: (show.stepKeys || [])[i] === 'molho' && (show.stepKeys || [])[i - 1] === 'massa', seed: ((i * 37) % 11) / 11 - 0.5 };
        /* imagem ausente nunca aparece quebrada na tela */
        im.onerror = () => { layer.box = null; im.style.display = 'none'; };
        return layer; });
      /* a área do molho vem da diferença entre duas fotos e pode pegar fumaça e luz: ela nunca passa dos limites da comida que já caiu */
      layers.forEach((l, i) => { if (!l.pour || !l.box || l.pour === 'colherpure') return; let x0 = 1, x1 = 0, ant = null; for (let q = 0; q < i; q++) { const b = layers[q].box; if (b && !layers[q].pour) { x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x + b.w); ant = b; } } if (!ant) return; /* panela e abóbora: o molho entra pela abertura, em cima, nunca por fora */ if ((show.stepKeys || [])[i] === 'vatapá') { l.box = { x: ant.x + ant.w * 0.22, y: ant.y + ant.h * 0.42, w: ant.w * 0.56, h: ant.h * 0.2 }; return; } if (['creme de camarão', 'creme de mandioca', 'leite de coco'].includes((show.stepKeys || [])[i])) { l.box = { x: ant.x + ant.w * 0.22, y: ant.y + ant.h * 0.02, w: ant.w * 0.56, h: ant.h * 0.2 }; return; } /* ralador, saleiro e colher passam por toda a comida que já está no prato, sem contar o prato ou a tigela: nada cai fora dela */ if (/^(ralador|saleiro|colher|mao)/.test(l.pour)) { let xa = 1, xb = 0, ya = 1, yb = 0; for (let q = 1; q < i; q++) { const b = layers[q].box; if (b && !layers[q].pour) { xa = Math.min(xa, b.x); xb = Math.max(xb, b.x + b.w); ya = Math.min(ya, b.y); yb = Math.max(yb, b.y + b.h); } } l.box = xb > xa ? { x: xa, y: ya, w: xb - xa, h: yb - ya } : ant; return; } const a = Math.max(l.box.x, x0), c = Math.min(l.box.x + l.box.w, x1); /* na altura também: o molho nunca desce abaixo da última comida, para não cair no prato nem na frente da tigela */ const y0 = Math.min(l.box.y, ant.y + ant.h * 0.5), y1 = Math.min(l.box.y + l.box.h, ant.y + ant.h), h0 = y1 - y0; l.box = c - a >= 0.06 ? { x: a, w: c - a, y: y0, h: h0 >= 0.03 ? h0 : ant.h } : ant; });
      const iFizz = show.type === 'bebidas' ? (show.stepKeys || []).findIndex((k) => FIZZ.has(k)) : -1;
      if (iFizz > 0) { const c = document.createElement('canvas'); c.className = 'b-fizz'; wrap.appendChild(c); fizz = { i: iFizz, c, g: c.getContext('2d'), on: false, bolhas: [], t0: 0, pontos: [0.12, 0.3, 0.46, 0.63, 0.8, 0.93].map((u) => ({ u, em: Math.random() * 1.5, rajada: 0 })) }; }
    } else shotEls = show.steps.map((s) => { const im = new Image(); im.className = 'shot'; im.alt = ''; im.src = sceneUrl(s.img); shotsEl.appendChild(im); return im; });
    stepsEl.innerHTML = show.steps.map((s) => `<button class="st ${s.ing ? 'ing' : ''}" type="button" aria-label="${esc(s.kick)}"><img src="${stepImg(s)}" alt=""></button>`).join('');
    $$('.st', stepsEl).forEach((b, i) => b.addEventListener('click', () => jumpTo((i + 0.45) / show.steps.length)));
    $('#heroPrice').textContent = 'R$ ' + brl(show.price);
    stepNow = -1;
  };
  /* primeira etapa cuja peça ou foto ainda não terminou de carregar */
  const stepsReady = () => { for (let i = 0; i < layers.length; i++) { const l = layers[i], f = frameEls[i]; if ((l.box && !l.pour && !l.im.complete) || (l.bottle && !l.bottle.complete) || (f && !f.complete)) return i; } return layers.length; };
  /* centraliza um item dentro de uma faixa com rolagem, sem cortá-lo */
  const centerIn = (box, el) => { if (!box || !el) return; const a = box.getBoundingClientRect(), b = el.getBoundingClientRect(); box.scrollLeft += b.left - a.left - (a.width - b.width) / 2; };
  /* o título nunca vaza do cartão: nomes longos diminuem até caber */
  const fitTitle = () => {
    const a = $('#t1'), b = $('#t2'), host = a.closest('.title') || a.parentElement, card = a.closest('.copy') || host; host.style.fontSize = ''; a.style.whiteSpace = b.style.whiteSpace = 'nowrap'; a.style.display = b.style.display = 'block'; a.style.width = b.style.width = 'max-content';
    const cs = getComputedStyle(card), room = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); let size = parseFloat(getComputedStyle(host).fontSize);
    const wide = Math.max(a.getBoundingClientRect().width, b.getBoundingClientRect().width); if (wide > room && room > 0) { size = Math.max(20, Math.floor((size * room) / wide)); host.style.fontSize = size + 'px'; }
    a.style.width = b.style.width = '';
  };
  addEventListener('resize', () => fitTitle());
  /* a fonte definitiva é mais larga que a provisória: mede de novo quando ela chega */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitTitle());
  const caindoRub = (s) => Math.sin(s * Math.PI * 22); /* vaivém do queijo no ralador */
  const setCopy = (s, i, instant) => {
    const els = [$('#kick'), $('#t1'), $('#t2'), $('#text')], vals = [s.kick, s.t1, s.t2, s.text];
    $('#statU').textContent = s.stat[1];
    gsap.to($('#statV'), { innerText: s.stat[0], snap: { innerText: 1 }, duration: instant ? 0 : 0.8, ease: 'power2.out' });
    $$('.st', stepsEl).forEach((b, k) => b.classList.toggle('on', k === i));
    if (instant || reduce) { els.forEach((e, k) => (e.textContent = vals[k])); fitTitle(); return; }
    gsap.killTweensOf(els);
    gsap.to(els, { y: -22, opacity: 0, filter: 'blur(6px)', duration: 0.2, stagger: 0.03, ease: 'power2.in', onComplete() {
      els.forEach((e, k) => (e.textContent = vals[k])); fitTitle();
      gsap.fromTo(els, { y: 28, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.05, ease: 'power3.out' });
    } });
  };
  const ringEl = $('#ring'), cue = $('#cue');
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let shadowOn = true, fxDone = false, fxPlate = null;
  /* montagem: cada ingrediente cai e bate na pilha, conforme a rolagem */
  const renderBuild = (pos, n) => {
    const win = $('#win'), mob = innerWidth <= 800, B = window.SM.BOARD, bg = $('.b-bg'), Ww = win.clientWidth;
    /* no celular a cena fica acima do cartão */
    const Hw = mob ? Math.round($('.copy').getBoundingClientRect().top - win.getBoundingClientRect().top + 26) : win.clientHeight;
    shotsEl.style.height = Hw + 'px';
    /* posição real da tábua na foto, com object-fit: cover */
    const iw = bg.naturalWidth || 1536, ih = bg.naturalHeight || 864, cover = Math.max(Ww / iw, Hw / ih);
    /* no celular e no tablet, o prato inteiro cabe na largura da tela: pratos largos, como a pizza, não ficam cortados */
    const dishW = layers.reduce((m, l) => Math.max(m, l.box ? l.box.w : 0), 0.34), topoComida = layers.reduce((m, l) => (l.box && !l.pour ? Math.min(m, l.box.y) : m), 0.3), folga = mob ? 76 : 84, sc = mob ? Math.min(cover, Ww / (dishW * iw * 1.08), (Hw - folga) / (ih * (1 - topoComida))) : cover;
    /* a comida nunca encosta no topo: em janela larga, a foto desce até sobrar folga acima dela */
    const ox = mob ? (Ww * 0.5 - B.x * iw * sc) : (Ww - iw * sc) * 0.5, oy = sc < cover ? Hw - ih * sc : Math.max((Hw - ih * sc) * 0.5, Math.min(0, folga - topoComida * ih * sc));
    const fade = $('.b-fade'); if (fade) fade.style.cssText = sc < cover ? `display:block;top:${oy - 1}px;height:${ih * sc * 0.3}px` : 'display:none';
    const cx = ox + B.x * iw * sc, baseY = oy + B.y * ih * sc, boardW = B.w * iw * sc;
    bg.style.cssText = `left:${ox}px;top:${oy}px;width:${iw * sc}px;height:${ih * sc}px`;
    const fin = $('.b-final'); [fin, ...frameEls].forEach((el) => { el.style.left = bg.style.left; el.style.top = bg.style.top; el.style.width = bg.style.width; el.style.height = bg.style.height; });
    shadowOn = !frameEls.length;
    const totalT = layers.reduce((s, l, i) => s + (i < n - 1 ? l.g.t : 1 / l.g.ar), 0), avail = baseY - (mob ? 60 : 70), W = Math.min(boardW * 0.57, avail / totalT);
    const stack = $('.b-stack'), shadow = $('.b-shadow');
    stack.style.left = cx + 'px'; stack.style.top = baseY + 'px';
    shadow.style.cssText = `left:${cx}px;top:${baseY - W * 0.11}px;width:${W * 1.16}px;height:${W * 0.24}px`;
    /* no fim, a montagem se funde com a foto real do prato pronto */
    const f = reduce ? (pos >= n ? 1 : 0) : clamp((pos - (n - 0.12)) / 0.5); fin.style.opacity = f; stack.style.opacity = 1 - f; shadow.style.opacity = shadowOn ? 1 - f : 0;
    /* prato pronto: a fumaça sobe por trás dele, sem passar na frente */
    const tb = layers[n - 1].box, bx = tb ? ox + (tb.x + tb.w / 2) * iw * sc : cx, bTop = tb ? oy + tb.y * ih * sc : baseY - totalT * W, bw = tb ? tb.w * iw * sc * 1.2 : W * 1.1, bh = baseY - bTop;
    fxDone = pos >= n - 0.02; fxPlate = { x: bx, y: bTop, w: bw, h: bh, top: 0 };
    const rx = bw * 0.62, ry = bh * 0.66, my = bTop + bh * 0.56, maskV = fxDone ? `radial-gradient(ellipse ${rx}px ${ry}px at ${bx}px ${my}px,transparent 82%,#000 100%)` : 'none';
    if (cv.style.webkitMaskImage !== maskV) { cv.style.webkitMaskImage = maskV; cv.style.maskImage = maskV; }
    if (fizz) { const c0 = (layers[fizz.i - 1] && layers[fizz.i - 1].box) || { x: 0.56, y: 0.3, w: 0.2, h: 0.42 }, lo = reduce ? (pos >= fizz.i ? 1 : 0) : clamp((pos - fizz.i) / 0.82), sf = clamp((lo - 0.1) / 0.66), ef = sf * sf * (3 - 2 * sf); fizz.x0 = ox + (c0.x + c0.w * 0.2) * iw * sc; fizz.lx = c0.w * 0.6 * iw * sc; fizz.base = oy + (c0.y + c0.h * 0.87) * ih * sc; const cheio = oy + (c0.y + c0.h * 0.17) * ih * sc; fizz.nivel = fizz.base - (fizz.base - cheio) * ef; fizz.on = ef > 0.04; fizz.enchendo = sf > 0 && sf < 1; }
    let y = 0;
    layers.forEach((l, i) => {
      const local = reduce ? (pos >= i ? 1 : 0) : clamp((pos - i) / 0.82), w = W * l.g.w, h = w / l.g.ar, rest = y - (l.g.dy || 0) * W, frame = frameEls[i];
      if ((l.pour === 'mao' || /^ralador/.test(l.pour || '')) && frame) {
        /* a mão entra por cima, percorre a pizza em espiral e salpica o queijo, que vai cobrindo atrás dela */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.52, h: 0.24 }, wid = b.w * iw * sc, hh = b.h * ih * sc, mid = ox + (b.x + b.w / 2) * iw * sc, cy = oy + (b.y + b.h / 2) * ih * sc;
        const a = clamp(local / 0.16), s = clamp((local - 0.12) / 0.7), o = clamp((local - 0.84) / 0.16), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s), ang = e * Math.PI * 5.4 - Math.PI / 2;
        const spotX = mid + Math.cos(ang) * wid * 0.42 * e, spotY = cy + Math.sin(ang) * hh * 0.38 * e, tipY = spotY - Math.max(70, Hw * 0.15);
        const ral = /^ralador/.test(l.pour || ''), lh = ral ? 0.56 * iw * sc * 0.72 /* o ralador tem sempre o tamanho que usa na pizza, mesmo que passe do topo da tela */ : Math.max(wid * 0.7, (spotY + 40) / 0.98), lw = lh * ((l.bottle.naturalWidth || 1) / (l.bottle.naturalHeight || 2)), off = lh + 60, hidden = local <= 0 || local >= 1;
        l.bottle.style.visibility = hidden ? 'hidden' : 'visible'; l.bottle.style.width = lw + 'px'; l.bottle.style.height = lh + 'px'; l.bottle.style.left = spotX - lw * (ral ? 0.5 : 0.62) + (ral ? Math.sin(s * 120) * 3 : 0) + 'px'; l.bottle.style.top = spotY - lh * 0.98 - (1 - inA) * off - o * o * off + 'px'; l.bottle.style.transformOrigin = '50% 60%'; l.bottle.style.transform = `rotate(${Math.sin(s * (ral ? 120 : 40)) * (ral ? 1.2 : 1.6)}deg)`;
        /* raspas de chocolate: copo alto chega perto do topo, então o ralador vem deitado pela esquerda, onde cabe na tela, sem cobrir o chantilly */
        const rc = l.pour === 'raladorchocolate', topoRc = oy + b.y * ih * sc, xRc = mid - wid * 0.1, yRc = topoRc + Math.min(hh * 0.05, 24);
        if (rc) { const t = 85 * Math.PI / 180, cxR = xRc + lh * 0.1 - lh / 2 * Math.sin(t) + Math.sin(s * 120) * 3 - (1 - inA + o * o) * wid, cyR = yRc - lh / 2 * Math.cos(t) - (1 - inA) * off - o * o * off; l.bottle.style.left = cxR - lw / 2 + 'px'; l.bottle.style.top = cyR - lh / 2 + 'px'; l.bottle.style.transformOrigin = '50% 50%'; l.bottle.style.transform = `rotate(${-85 + Math.sin(s * 120) * 1.2}deg)`; }
        /* o queijo esfrega no ralador e vai diminuindo; os fios crescem por baixo da aba */
        if (ral) { const rub = caindoRub(s), q0 = l.bottle.querySelector('.g-queijo'); q0.style.transform = `translate3d(${rub * lh * 0.012}px,${rub * lh * 0.14}px,0) scale(${1 - e * 0.3})`; }
        /* pedacinhos de queijo caindo */
        const caindo = s > 0 && o === 0;
        const fromY = rc ? yRc - 6 : ral ? spotY - lh * 0.22 : tipY, alvoY = rc ? yRc + Math.max(20, Hw * 0.03) : spotY, baseX = rc ? mid - wid * 0.08 : spotX; (l.shreds || []).forEach((p, k) => { if (!caindo) { p.style.opacity = 0; return; } const t = (s * 16 + k / l.shreds.length) % 1, jx = Math.sin(k * 12.9) * wid * (rc ? 0.14 : ral ? 0.09 : 0.03), jy = Math.cos(k * 7.7) * hh * (rc ? 0.02 : 0.08); p.style.opacity = t < 0.85 ? 1 : (1 - t) / 0.15; p.style.transform = `translate3d(${baseX + jx + t * jx * 0.8}px,${fromY + t * t * (alvoY - fromY + jy)}px,0) rotate(${k * 47 + t * 220}deg)`; });
        l.stream.style.visibility = 'hidden';
        const maskM = s >= 1 ? 'none' : `radial-gradient(ellipse ${(e * wid * 0.56 + 1).toFixed(1)}px ${(e * hh * 0.56 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(cy - oy).toFixed(1)}px,#000 80%,transparent 100%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskM; frame.style.maskImage = maskM; l.im.style.visibility = 'hidden';
        return;
      }
      if (/^saleiro/.test(l.pour || '') && frame) {
        /* o saleiro entra de ponta-cabeça, sacode sobre o prato e o tempero cai em grãos */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.52, h: 0.24 }, wid = b.w * iw * sc, hh = b.h * ih * sc, mid = ox + (b.x + b.w / 2) * iw * sc, cy = oy + (b.y + b.h / 2) * ih * sc;
        const a = clamp(local / 0.16), s = clamp((local - 0.14) / 0.68), o = clamp((local - 0.84) / 0.16), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s);
        const spotX = mid + Math.sin(e * Math.PI * 3) * wid * 0.4, spotY = cy + Math.cos(e * Math.PI * 5) * hh * 0.28, lh = Math.max(130, Math.min(wid * 0.8, Hw * 0.32)), lw = lh * 0.5, tipX = spotX, tipY = spotY - Math.max(70, Hw * 0.16), off = tipY + lh;
        const sacode = s > 0 && o === 0 ? Math.sin(s * 150) : 0, ang = 150 + sacode * 7, cxS = tipX - 0.225 * lh, cyS = tipY - 0.39 * lh + sacode * 7 - (1 - inA) * off - o * o * off;
        l.bottle.style.visibility = local <= 0 || local >= 1 ? 'hidden' : 'visible'; l.bottle.style.width = lw + 'px'; l.bottle.style.height = lh + 'px'; l.bottle.style.left = cxS - lw / 2 + 'px'; l.bottle.style.top = cyS - lh / 2 + 'px'; l.bottle.style.transformOrigin = '50% 50%'; l.bottle.style.transform = `rotate(${ang}deg)`;
        const caindo = s > 0 && o === 0; (l.shreds || []).forEach((q, k) => { if (!caindo) { q.style.opacity = 0; return; } const t = (s * 14 + k / l.shreds.length) % 1, jx = Math.sin(k * 12.9) * wid * 0.07, jy = Math.cos(k * 7.7) * hh * 0.1; q.style.opacity = t < 0.88 ? 1 : (1 - t) / 0.12; q.style.transform = `translate3d(${tipX + jx * t * 1.4}px,${tipY + t * t * (spotY - tipY + jy)}px,0)`; });
        l.stream.style.visibility = 'hidden';
        const maskS = s >= 1 ? 'none' : `radial-gradient(ellipse ${(e * wid * 0.6 + 1).toFixed(1)}px ${(e * hh * 0.6 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(cy - oy).toFixed(1)}px,#000 80%,transparent 100%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskS; frame.style.maskImage = maskS; l.im.style.visibility = 'hidden';
        return;
      }
      if (l.pour === 'colherpure' && frame) {
        /* purê: a colher deixa uma porção no prato e puxa, desenhando o rastro como na vida real */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.4, h: 0.14 }, left = ox + b.x * iw * sc, wid = b.w * iw * sc, topY = oy + b.y * ih * sc, hh = b.h * ih * sc;
        const a = clamp(local / 0.14), s1 = clamp((local - 0.14) / 0.22), s2 = clamp((local - 0.36) / 0.44), o = clamp((local - 0.82) / 0.18), inA = 1 - Math.pow(1 - a, 3), e1 = s1 * s1 * (3 - 2 * s1), e2 = s2 * s2 * (3 - 2 * s2);
        const iniX = left + wid * 0.17, iniY = topY + hh * 0.62, fimX = left + wid * 0.98, fimY = topY + hh * 0.22, spotX = iniX + (fimX - iniX) * e2, spotY = iniY + (fimY - iniY) * e2 - Math.sin(s1 * Math.PI) * hh * 0.12;
        const lw = 0.56 * iw * sc * 0.42, lh = lw * ((l.bottle.naturalHeight || 1) / (l.bottle.naturalWidth || 1)), off = spotY + lh, incl = -4 - 14 * e2;
        l.bottle.style.visibility = local <= 0 || local >= 1 ? 'hidden' : 'visible'; l.bottle.style.height = 'auto'; l.bottle.style.width = lw + 'px'; l.bottle.style.left = spotX - lw * 0.2 + (1 - inA) * wid * 0.3 + o * wid * 0.3 + 'px'; l.bottle.style.top = spotY - lh * 0.82 - (1 - inA) * off - o * o * off + 'px'; l.bottle.style.transformOrigin = '20% 82%'; l.bottle.style.transform = `rotate(${incl}deg)`;
        l.stream.style.visibility = 'hidden';
        const mx = iniX - ox, my = iniY - oy, ate = ((spotX + wid * 0.02 - ox) / (iw * sc)) * 100, maskU = s2 >= 1 ? 'none' : s2 > 0 ? `linear-gradient(90deg,#000 ${(ate - 0.6).toFixed(2)}%,transparent ${(ate + 0.4).toFixed(2)}%)` : `radial-gradient(ellipse ${(e1 * wid * 0.22 + 1).toFixed(1)}px ${(e1 * hh * 0.62 + 1).toFixed(1)}px at ${mx.toFixed(1)}px ${my.toFixed(1)}px,#000 82%,transparent 100%)`;
        frame.style.opacity = s1 > 0 ? 1 : 0; frame.style.webkitMaskImage = maskU; frame.style.maskImage = maskU; l.im.style.visibility = 'hidden';
        return;
      }
      if (/^colher/.test(l.pour || '') && frame) {
        /* colher de tempero: passa em espiral sobre a comida, inclinada, e os flocos caem da ponta */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.52, h: 0.24 }, wid = b.w * iw * sc, hh = b.h * ih * sc, mid = ox + (b.x + b.w / 2) * iw * sc, cy = oy + (b.y + b.h / 2) * ih * sc;
        const a = clamp(local / 0.16), s = clamp((local - 0.14) / 0.66), o = clamp((local - 0.82) / 0.18), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s), ang = e * Math.PI * 5.2 - Math.PI / 2;
        const lw = 0.56 * iw * sc * 0.42, lh = lw * ((l.bottle.naturalHeight || 1) / (l.bottle.naturalWidth || 1)), spotX = mid + Math.cos(ang) * wid * 0.42 * e, spotY = cy + Math.sin(ang) * hh * 0.38 * e, off = cy + lh, altura = Math.max(56, Math.min(Hw * 0.16, 130));
        const incl = -6 - 22 * clamp(s / 0.12) * (1 - clamp((local - 0.8) / 0.08)), rad = (incl * Math.PI) / 180, dxB = -0.21 * lw, dyB = -0.03 * lh, bicoX = dxB * Math.cos(rad) - dyB * Math.sin(rad), bicoY = dxB * Math.sin(rad) + dyB * Math.cos(rad), lipX = spotX, lipY = spotY - altura;
        const hidden = local <= 0 || local >= 1, sobe = (1 - inA) * off + o * o * off;
        l.bottle.style.visibility = hidden ? 'hidden' : 'visible'; l.bottle.style.height = 'auto'; l.bottle.style.width = lw + 'px'; l.bottle.style.left = lipX - (0.23 * lw + bicoX) + (1 - inA) * wid * 0.4 + o * wid * 0.4 + 'px'; l.bottle.style.top = lipY - (0.85 * lh + bicoY) - sobe + 'px'; l.bottle.style.transform = `rotate(${incl}deg)`; l.bottle.style.transformOrigin = '23% 85%';
        const caindo = s > 0.04 && s < 1 && o === 0; (l.shreds || []).forEach((q, k) => { if (!caindo) { q.style.opacity = 0; return; } const t = (s * 18 + k / l.shreds.length) % 1, jx = Math.sin(k * 12.9) * Math.min(26, wid * 0.05), jy = Math.cos(k * 7.7) * hh * 0.1; q.style.opacity = t < 0.85 ? 1 : (1 - t) / 0.15; q.style.transform = `translate3d(${lipX + jx * (0.35 + t)}px,${lipY + t * t * (altura + jy)}px,0) rotate(${k * 47 + t * 200}deg)`; });
        l.stream.style.visibility = 'hidden';
        const maskS = s >= 1 ? 'none' : `radial-gradient(ellipse ${(e * wid * 0.56 + 1).toFixed(1)}px ${(e * hh * 0.56 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(cy - oy).toFixed(1)}px,#000 84%,transparent 100%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskS; frame.style.maskImage = maskS; l.im.style.visibility = 'hidden';
        return;
      }
      if (l.pour === 'concha' && l.espalha && frame) {
        /* pizza: a concha encosta no molho e gira em espiral do centro para a borda, espalhando */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.52, h: 0.24 }, wid = b.w * iw * sc, hh = b.h * ih * sc, mid = ox + (b.x + b.w / 2) * iw * sc, cy = oy + (b.y + b.h / 2) * ih * sc;
        const a = clamp(local / 0.16), s = clamp((local - 0.14) / 0.66), o = clamp((local - 0.82) / 0.18), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s), ang = e * Math.PI * 5.2 - Math.PI / 2;
        const lw = 0.56 * iw * sc * 0.62, lh = lw * ((l.bottle.naturalHeight || 1) / (l.bottle.naturalWidth || 1)), tipX = mid + Math.cos(ang) * wid * 0.44 * e, tipY = cy + Math.sin(ang) * hh * 0.4 * e, off = cy + lh;
        const hidden = local <= 0 || local >= 1, py = tipY - lh * 0.8 - (1 - inA) * off - o * o * off, px = tipX - lw * 0.26 + (1 - inA) * wid * 0.4 + o * wid * 0.4;
        l.bottle.style.visibility = hidden ? 'hidden' : 'visible'; l.bottle.style.height = 'auto'; l.bottle.style.width = lw + 'px'; l.bottle.style.left = px + 'px'; l.bottle.style.top = py + 'px'; l.bottle.style.transform = `rotate(${Math.sin(ang) * 4}deg)`; l.bottle.style.transformOrigin = '26% 80%';
        l.stream.style.visibility = 'hidden';
        const maskC = s >= 1 ? 'none' : `radial-gradient(ellipse ${(e * wid * 0.56 + 1).toFixed(1)}px ${(e * hh * 0.56 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(cy - oy).toFixed(1)}px,#000 84%,transparent 100%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskC; frame.style.maskImage = maskC; l.im.style.visibility = 'hidden';
        return;
      }
      if (/^(concha|pegador)/.test(l.pour || '') && frame) {
        /* a concha entra, gira em espiral do centro para a borda espalhando o molho e sai */
        const b = l.box || { x: 0.42, y: 0.52, w: 0.52, h: 0.24 }, wid = b.w * iw * sc, hh = b.h * ih * sc, mid = ox + (b.x + b.w / 2) * iw * sc, cy = oy + (b.y + b.h / 2) * ih * sc;
        const a = clamp(local / 0.16), s = clamp((local - 0.14) / 0.66), o = clamp((local - 0.82) / 0.18), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s), ang = e * Math.PI * 5.2 - Math.PI / 2;
        const lw = 0.56 * iw * sc * (l.pour === 'pegadormel' ? 0.34 : 0.62), lh = lw * ((l.bottle.naturalHeight || 1) / (l.bottle.naturalWidth || 1)), tipX = mid + Math.cos(ang) * wid * 0.44 * e, tipY = cy + Math.sin(ang) * hh * 0.4 * e, off = cy + lh;
        /* a concha fica acima da comida e inclina: o molho sai pela borda e desce num fio até o prato */
        const incl = -6 - 26 * clamp(s / 0.12) * (1 - clamp((local - 0.8) / 0.08)), rad = (incl * Math.PI) / 180, dxB = -0.21 * lw, dyB = -0.03 * lh, bicoX = dxB * Math.cos(rad) - dyB * Math.sin(rad), bicoY = dxB * Math.sin(rad) + dyB * Math.cos(rad), altura = Math.max(lh * 0.24, Math.min(Hw * 0.2, 170)), lipX = tipX, lipY = tipY - altura;
        const hidden = local <= 0 || local >= 1, sobe = (1 - inA) * off + o * o * off, px = lipX - (0.23 * lw + bicoX) + (1 - inA) * wid * 0.4 + o * wid * 0.4, py = lipY - (0.85 * lh + bicoY) - sobe;
        l.bottle.style.visibility = hidden ? 'hidden' : 'visible'; l.bottle.style.height = 'auto'; l.bottle.style.width = lw + 'px'; l.bottle.style.left = px + 'px'; l.bottle.style.top = py + 'px'; l.bottle.style.transform = `rotate(${incl}deg)`; l.bottle.style.transformOrigin = '23% 85%';
        const escorre = s > 0.04 && s < 1 && o === 0; l.stream.style.visibility = escorre ? 'visible' : 'hidden';
        if (escorre) { const fio = l.pour === 'pegadormel' ? 4 : Math.max(7, Math.min(16, wid * 0.03)) * (1 - clamp((s - 0.9) / 0.1) * 0.6), desce = clamp((s - 0.04) / 0.06); l.stream.style.left = lipX - fio / 2 + 'px'; l.stream.style.top = lipY + 'px'; l.stream.style.width = fio + 'px'; l.stream.style.height = altura * desce + 2 + 'px'; }
        const maskC = s >= 1 ? 'none' : `radial-gradient(ellipse ${(e * wid * 0.56 + 1).toFixed(1)}px ${(e * hh * 0.56 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(cy - oy).toFixed(1)}px,#000 84%,transparent 100%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskC; frame.style.maskImage = maskC; l.im.style.visibility = 'hidden';
        return;
      }
      if (l.fill && /^(jarra|lata|garrafa)/.test(l.pour || '') && frame) {
        /* bebida: a jarra ou a lata entra, inclina sobre o copo e o nível sobe; gelo e fruta caem depois */
        const lata = /^lata/.test(l.pour), c0 = (layers[0] && layers[0].box) || (layers[i - 1] && layers[i - 1].box) || { x: 0.56, y: 0.3, w: 0.2, h: 0.42 } /* sempre o copo, mesmo com gelo ou limão já dentro */, wid = c0.w * iw * sc, topY = oy + c0.y * ih * sc, hh = c0.h * ih * sc, mid = ox + c0.x * iw * sc + wid / 2, bottom = topY + hh;
        const a = clamp(local / 0.16), s = clamp((local - 0.14) / 0.62), o = clamp((local - 0.8) / 0.2), inA = 1 - Math.pow(1 - a, 3), e = s * s * (3 - 2 * s), sai = o * o, fora = 1 - inA + sai;
        /* o bico fica sempre dentro da tela, mesmo quando a janela é baixa e corta o alto do copo */
        /* despeja pela borda direita do copo: a lata ou a jarra fica ao lado, sem cobrir a bebida */
        /* lata, jarra, garrafa e bule têm tamanho real fixo em relação à cena, igual em todas as bebidas, sem depender da altura do copo */
        const garrafa = /^garrafa/.test(l.pour), buleP = l.pour === 'jarrabule', inox = l.pour === 'jarrainox', espelho = /^jarra/.test(l.pour) /* jarra não tem rótulo: vem pela esquerda do copo, onde cabe inteira */, lipX = mid + wid * (espelho ? -0.3 : lata ? 0.36 : 0.3), lipY = Math.max(lata || espelho ? topY : topY - Math.max(10, hh * 0.04), Hw * (mob ? 0.14 : 0.07)), lh = ih * sc * (lata ? 0.44 : garrafa ? 0.5 : buleP ? 0.42 : inox ? 0.44 : 0.46), lw = lh * ((l.bottle.naturalWidth || 1) / (l.bottle.naturalHeight || 2)), incl = (lata ? -96 : garrafa ? -108 : espelho ? 38 : -42) * inA * (1 - o * 0.85), rad = (incl * Math.PI) / 180;
        const bule = l.pour === 'jarrabule', dxB = ((lata ? 0.22 : garrafa ? 0.5 : bule ? 0.01 : 0.05) - 0.5) * lw, dyB = ((lata ? 0.03 : garrafa ? 0.01 : bule ? 0.18 : 0.1) - 0.5) * lh, xicara = wid / hh > 1.2;
        const dxM = espelho ? -dxB : dxB, cxT = lipX - (dxM * Math.cos(rad) - dyB * Math.sin(rad)) + (espelho ? -1 : 1) * fora * wid * 1.6, cyT = lipY - (dxM * Math.sin(rad) + dyB * Math.cos(rad)) - fora * (lipY + lh);
        l.bottle.style.visibility = local <= 0 || local >= 1 ? 'hidden' : 'visible'; l.bottle.style.width = lw + 'px'; l.bottle.style.height = lh + 'px'; l.bottle.style.left = cxT - lw / 2 + 'px'; l.bottle.style.top = cyT - lh / 2 + 'px'; l.bottle.style.transformOrigin = '50% 50%'; l.bottle.style.transform = `rotate(${incl}deg)${espelho ? ' scaleX(-1)' : ''}`;
        const jorra = s > 0 && s < 1 && o === 0, land = xicara ? topY + hh * 0.15 : bottom - hh * 0.06 - e * hh * 0.8, fio = Math.min(14, Math.max(5, wid * 0.07)); l.stream.style.visibility = jorra ? 'visible' : 'hidden';
        if (jorra) { l.stream.style.left = lipX - fio / 2 + 'px'; l.stream.style.top = lipY + 'px'; l.stream.style.width = fio + 'px'; l.stream.style.height = Math.max(0, land - lipY) + 'px'; }
        const lv = ((bottom - e * hh * 1.04 - oy) / (ih * sc)) * 100, maskB = s >= 1 ? 'none' : xicara ? `radial-gradient(ellipse ${(e * wid * 0.7 + 1).toFixed(1)}px ${(e * hh * 0.62 + 1).toFixed(1)}px at ${(mid - ox).toFixed(1)}px ${(topY + hh * 0.2 - oy).toFixed(1)}px,#000 86%,transparent 100%)` : `linear-gradient(180deg,transparent ${(lv - 0.5).toFixed(2)}%,#000 ${(lv + 0.5).toFixed(2)}%)`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskB; frame.style.maskImage = maskB; l.im.style.visibility = 'hidden';
        return;
      }
      if (l.pour && frame) {
        /* o frasco entra, vira, passa sobre o prato soltando o molho e sai; a foto com molho aparece atrás do bico */
        /* o molho sai em cima da última peça que caiu, nunca fora da comida */
        let ultima = l.box; for (let q = i - 1; q >= 0 && !ultima; q--) ultima = layers[q].box;
        const b0 = ultima || { x: 0.5, y: 0.33, w: 0.3, h: 0.1 }, wB = Math.max(b0.w, 0.12), b = { x: b0.x + b0.w / 2 - wB / 2, y: b0.y, w: wB, h: b0.h }, left = ox + b.x * iw * sc, wid = b.w * iw * sc, topY = oy + b.y * ih * sc, hh = b.h * ih * sc;
        const a = clamp(local / 0.22), s = clamp((local - 0.2) / 0.6), o = clamp((local - 0.82) / 0.18), zig = Math.sin(s * Math.PI * 5), inA = 1 - Math.pow(1 - a, 3);
        const tipX = left + wid * (0.06 + 0.88 * s), targetY = topY + hh * (0.3 + zig * 0.14), spray = l.pour === 'spraychantilly', tipY = spray ? Math.max(targetY - Math.max(46, Hw * 0.085), Hw * 0.11) : targetY - Math.max(46, Hw * 0.085), bh2 = l.pour === 'requeijao' ? Hw * 0.56 : Math.max(wid * 1.15, Hw * 0.42), bw2 = bh2 * ((l.bottle.naturalWidth || 1) / (l.bottle.naturalHeight || 3)), off = tipY + 40;
        const angle = (spray ? 270 - inA * 12 : 268 - inA * 33) + zig * (spray ? 1.5 : 3) + o * 25, by = tipY - (1 - inA) * off - o * o * off; /* inclinado, com o corpo do frasco para cima e para a direita */
        const hidden = local <= 0 || local >= 1;
        l.bottle.style.visibility = hidden ? 'hidden' : 'visible'; l.bottle.style.height = bh2 + 'px'; l.bottle.style.left = tipX - bw2 / 2 + 'px'; l.bottle.style.top = by + 'px'; l.bottle.style.transform = `rotate(${angle}deg)`;
        const flowing = s > 0 && s < 1 && o === 0; l.stream.style.visibility = flowing ? 'visible' : 'hidden';
        if (flowing) { l.stream.style.left = tipX - Math.max(2, wid * 0.008) + 'px'; l.stream.style.top = tipY + 'px'; l.stream.style.width = Math.max(4, wid * 0.016) + 'px'; l.stream.style.height = Math.max(0, targetY - tipY) + 'px'; }
        /* o molho só aparece na faixa da comida: a luz e a fumaça das duas fotos são diferentes e, se a foto abrisse na tela inteira, formariam uma linha clara seguindo o frasco. No fim a faixa abre, sem degrau */
        const pct = ((tipX - ox) / (iw * sc)) * 100, abre = clamp((s - 0.82) / 0.18), yA = ((topY - oy) / (ih * sc)) * 100, yB = ((topY + hh - oy) / (ih * sc)) * 100, folgaY = 5 + abre * 110, maskH = `linear-gradient(90deg,#000 ${(pct - 4).toFixed(2)}%,transparent ${(pct + 1 + abre * 120).toFixed(2)}%)`, maskV = `linear-gradient(180deg,transparent ${(yA - folgaY - 5).toFixed(2)}%,#000 ${(yA - folgaY).toFixed(2)}%,#000 ${(yB + folgaY).toFixed(2)}%,transparent ${(yB + folgaY + 5).toFixed(2)}%)`, maskP = s >= 1 ? 'none' : `${maskH},${maskV}`;
        frame.style.opacity = s > 0 ? 1 : 0; frame.style.webkitMaskImage = maskP; frame.style.maskImage = maskP; frame.style.webkitMaskComposite = 'source-in'; frame.style.maskComposite = 'intersect'; l.im.style.visibility = 'hidden';
        return;
      }
      if (l.fill && frame) {
        /* copo: o nível sobe. Tigela e xícara: o líquido se espalha a partir de onde o jato cai */
        const c0 = (layers[0] && layers[0].box) || (layers[i - 1] && layers[i - 1].box) || { x: 0.56, y: 0.3, w: 0.2, h: 0.42 } /* sempre o copo, mesmo com gelo ou limão já dentro */, left = ox + c0.x * iw * sc, wid = c0.w * iw * sc, topY = oy + c0.y * ih * sc, hh = c0.h * ih * sc, mid = left + wid / 2, bottom = topY + hh, wide = wid / hh > 1.2;
        const s = clamp((local - 0.06) / 0.72), e = s * s * (3 - 2 * s), done = local >= 0.86, head = clamp(local / 0.08), tail = clamp((local - 0.78) / 0.08);
        /* xícara e tigela: o jato termina na boca, dentro do recipiente, e não na frente dele */
        const land = wide ? topY + hh * 0.15 : bottom - hh * 0.06 - e * hh * 0.8, sw = Math.min(16, Math.max(5, wid * (wide ? 0.04 : 0.08)));
        const flowing = local > 0 && tail < 1; l.stream.style.visibility = flowing ? 'visible' : 'hidden';
        if (flowing) { const y0 = tail * land, y1 = head * land; l.stream.style.left = mid - sw / 2 + 'px'; l.stream.style.top = y0 + 'px'; l.stream.style.width = sw + 'px'; l.stream.style.height = Math.max(0, y1 - y0) + 'px'; }
        let maskF = 'none';
        if (!done) { if (wide) { const cy = topY + hh * 0.2 - oy, cxx = mid - ox; maskF = `radial-gradient(ellipse ${(e * wid * 0.7 + 1).toFixed(1)}px ${(e * hh * 0.62 + 1).toFixed(1)}px at ${cxx.toFixed(1)}px ${cy.toFixed(1)}px,#000 86%,transparent 100%)`; } else { const lv = ((bottom - e * hh * 1.04 - oy) / (ih * sc)) * 100; maskF = `linear-gradient(180deg,transparent ${(lv - 0.5).toFixed(2)}%,#000 ${(lv + 0.5).toFixed(2)}%)`; } }
        frame.style.opacity = local > 0.04 ? 1 : 0; frame.style.webkitMaskImage = maskF; frame.style.maskImage = maskF; l.im.style.visibility = 'hidden';
        return;
      }
      if (frame && !l.box) { frame.style.opacity = local; l.im.style.visibility = 'hidden'; return; } /* etapa sem queda: a foto se transforma */
      if (l.box) {
        /* a peça saiu da foto real: cai até o ponto exato em que está nessa foto */
        const pw = l.box.w * iw * sc, ph = l.box.h * ih * sc, px = ox + l.box.x * iw * sc - cx, py = oy + l.box.y * ih * sc - baseY;
        const fd = clamp(local / 0.66), drop = (1 - fd * fd) * (oy + l.box.y * ih * sc + ph + 40), land = clamp((local - 0.66) / 0.12);
        frame.style.opacity = land;
        if (local <= 0 || land >= 1) l.im.style.visibility = 'hidden';
        else { l.im.style.visibility = 'visible'; l.im.style.width = pw + 'px'; l.im.style.height = ph + 'px'; l.im.style.opacity = 1 - land; l.im.style.filter = fd < 1 ? `blur(${((1 - fd) * fd * 8).toFixed(1)}px)` : 'none'; l.im.style.transform = `translate3d(${px}px,${py - drop}px,0)`; }
        return;
      }
      /* queda com peso e desfoque de movimento, sem quicar */
      const d = clamp(local / 0.62), e = 1 - Math.pow(1 - d, 2.4) * (1 - d * 0.15), settle = local > 0.62 ? Math.sin(clamp((local - 0.62) / 0.3) * Math.PI) * 0.012 * W : 0, fall = (1 - d * d) * (baseY + h + W * 0.6), speed = d < 1 ? d : 0;
      /* com fotos da etapa: a peça se funde com a foto real ao pousar */
      const merge = frame ? clamp((local - 0.58) / 0.34) : 0;
      if (frame) frame.style.opacity = merge;
      if (local <= 0 || (frame && merge >= 1)) { l.im.style.visibility = 'hidden'; } else {
        l.im.style.visibility = 'visible'; l.im.style.width = w + 'px'; l.im.style.opacity = 1 - merge;
        l.im.style.filter = `blur(${(speed * 5).toFixed(1)}px) brightness(.74) contrast(1.1) saturate(.84) sepia(.1) drop-shadow(0 8px 10px rgba(0,0,0,.55))`;
        l.im.style.transform = `translate3d(${-w / 2 + (1 - d) * l.seed * W * 0.14}px,${-h - rest - fall + settle}px,0) rotate(${(1 - d) * l.seed * 7}deg)`;
      }
      y += l.g.t * W;
    });
  };
  const renderScene = () => {
    const show = SHOWS[cur], n = show.steps.length, pos = clamp(p) * n * 0.9999, W = 0.34;
    if (show.recipe) renderBuild(clamp(p) * (n + 0.5), n); else shotsEl.style.height = '';
    shotEls.forEach((el, i) => {
      const t = pos - i, s = show.steps[i], u = i === 0 ? 1 : clamp((t + W) / W), covered = i < n - 1 && pos - (i + 1) >= 0;
      if (u <= 0 || covered) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = 'visible';
      /* abre em círculo, como um prato chegando à mesa */
      el.style.clipPath = u >= 1 ? 'none' : `circle(${easeIO(u) * 78}% at 60% 52%)`;
      const m = reduce ? 1 : clamp((t + W) / (1 + W)), k = s.kb; el.style.transform = `translate3d(${lerp(k[2], k[4], m)}%,${lerp(k[3], k[5], m)}%,0) scale(${lerp(k[0], k[1], m)})`;
    });
    const idx = Math.floor(pos + 0.1 > n - 1 ? n - 1 : pos + 0.1); if (idx !== stepNow) { const first = stepNow === -1; stepNow = idx; setCopy(show.steps[idx], idx, first); fxKind = show.steps[idx].fx; }
    ringEl.style.strokeDashoffset = 100 - clamp(p) * 100;
    cue.style.opacity = 1 - clamp(p / 0.02); cue.style.visibility = p > 0.022 ? 'hidden' : 'visible';
  };

  /* ---------- fumaça e faíscas dentro da janela ---------- */
  const cv = $('#fx'), g = cv.getContext('2d'); let W = 0, H = 0; const parts = [];
  const sprite = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), r = x.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(235,225,210,.34)'); r.addColorStop(0.5, 'rgba(225,215,200,.13)'); r.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = r; x.fillRect(0, 0, 128, 128); return c; })();
  const size = () => { const b = cv.getBoundingClientRect(); W = cv.width = Math.min(b.width, 1400) || 2; H = cv.height = W * (b.height / b.width) || 2; };
  new ResizeObserver(size).observe(cv);
  const spawn = (k) => {
    const cx = 0.64 * W, cy = 0.68 * H, sp = W * 0.26, q = { k, life: 0, x: cx + (Math.random() - 0.5) * sp, y: cy, vx: (Math.random() - 0.5) * 0.3, vy: 0, r: 2, max: 1 };
    if (k === 'wisp') { const b = fxPlate, kx = W / (cv.clientWidth || W); q.x = (b.x + (Math.random() - 0.5) * b.w * 1.25) * kx; q.y = (b.y + b.h * (0.1 + Math.random() * 0.75)) * kx; q.r = W * (0.05 + Math.random() * 0.08); q.vy = -(0.28 + Math.random() * 0.42) * (W / 1000); q.vx = (Math.random() - 0.5) * 0.18; q.max = 340 + Math.random() * 260; q.a = 0.3; q.k = 'smoke'; q.wob = 0.012 + Math.random() * 0.012; q.amp = 0.25 + Math.random() * 0.45; }
    else if (k === 'smoke' || k === 'steam') { q.r = W * (0.06 + Math.random() * 0.08); q.y = cy - Math.random() * H * 0.2; q.vy = -(0.5 + Math.random() * 0.8) * (W / 1000); q.max = 200 + Math.random() * 140; q.a = k === 'smoke' ? 0.34 : 0.2; }
    else if (k === 'embers') { q.x = W * (0.4 + Math.random() * 0.55); q.y = H * (0.3 + Math.random() * 0.5); q.r = 1 + Math.random() * 2.2; q.vy = -(1 + Math.random() * 1.8); q.vx = (Math.random() - 0.3) * 0.9; q.max = 70 + Math.random() * 80; q.c = Math.random() > 0.4 ? '255,150,50' : '255,210,110'; }
    else if (k === 'drops') { q.x = W * (0.3 + Math.random() * 0.6); q.y = -10; q.r = 1 + Math.random() * 2; q.vy = 2 + Math.random() * 3.5; q.max = 150; q.c = '255,230,190'; }
    else { q.x = Math.random() * W; q.y = H * (0.25 + Math.random() * 0.65); q.r = 0.8 + Math.random() * 2; q.vy = -(0.08 + Math.random() * 0.3); q.vx = (Math.random() - 0.5) * 0.5; q.max = 160 + Math.random() * 120; q.c = '255,246,228'; }
    parts.push(q);
  };
  const drawFx = () => {
    g.clearRect(0, 0, W, H); if (reduce) return;
    const kindNow = fxDone && fxPlate && SHOWS[cur].recipe ? 'wisp' : fxKind;
    const rate = { smoke: 0.22, steam: 0.1, embers: 0.7, drops: 0.34, flour: 0.45, wisp: 0.3 }[kindNow] || 0;
    if (parts.length < 150 && Math.random() < rate) spawn(kindNow);
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.life++; q.x += q.vx; q.y += q.vy; const u = q.life / q.max;
      if (u >= 1 || q.y > H + 20) { parts.splice(i, 1); continue; }
      const env = Math.min(1, u * 6) * (1 - u);
      if (q.k === 'smoke' || q.k === 'steam') { const rr = q.r * (1 + u * 2.4); g.globalCompositeOperation = 'screen'; g.globalAlpha = env * q.a; q.x += Math.sin(q.life * (q.wob || 0.02)) * (q.amp || 0.3); g.drawImage(sprite, q.x - rr, q.y - rr, rr * 2, rr * 2); }
      else { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1; g.fillStyle = `rgba(${q.c},${env * 0.9})`; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7); g.fill(); }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  };

  /* bolhas de gás: cada ponto do copo solta uma rajada, para um pouco e solta outra, como em um copo de verdade */
  const drawFizz = () => {
    const fz = fizz; if (!fz || reduce) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), box = fz.c.parentElement, cw = box.clientWidth, ch = box.clientHeight;
    if (fz.c.width !== Math.round(cw * dpr) || fz.c.height !== Math.round(ch * dpr)) { fz.c.width = Math.round(cw * dpr); fz.c.height = Math.round(ch * dpr); }
    const g2 = fz.g, agora = performance.now() / 1000, dt = Math.min(0.05, fz.t0 ? agora - fz.t0 : 0.016); fz.t0 = agora;
    g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.clearRect(0, 0, cw, ch);
    if (!fz.on) { fz.bolhas.length = 0; return; }
    const altura = Math.max(1, fz.base - fz.nivel), rMax = Math.max(1.4, Math.min(2.6, fz.lx * 0.02));
    fz.pontos.forEach((q) => {
      if (agora < q.em || fz.bolhas.length > 70) return;
      if (q.rajada > 0) { q.rajada--; q.em = agora + 0.05 + Math.random() * 0.13; fz.bolhas.push({ x: fz.x0 + fz.lx * q.u + (Math.random() - 0.5) * 2, y: fz.base - Math.random() * altura * 0.08, r: rMax * (0.4 + Math.random() * 0.6), v: 14 + Math.random() * 16, fase: Math.random() * 6.3 }); }
      else { q.rajada = 3 + Math.floor(Math.random() * 9); q.em = agora + (fz.enchendo ? 0.08 + Math.random() * 0.3 : 0.5 + Math.random() * 2.4); }
    });
    for (let i = fz.bolhas.length - 1; i >= 0; i--) {
      const b = fz.bolhas[i]; b.v += 95 * dt; b.y -= b.v * dt; b.fase += dt * 7; const px = b.x + Math.sin(b.fase) * 0.7, u = clamp((fz.base - b.y) / altura);
      if (b.y <= fz.nivel) { fz.bolhas.splice(i, 1); continue; }
      const rr = b.r * (0.8 + u * 0.5), a = Math.min(1, u * 8 + 0.25) * (u > 0.94 ? (1 - u) / 0.06 : 1);
      /* bolha pequena e suave, sem contorno: um brilho que se mistura às bolhas da foto */
      const brilho = g2.createRadialGradient(px - rr * 0.25, b.y - rr * 0.25, 0, px, b.y, rr); brilho.addColorStop(0, `rgba(255,244,226,${(a * 0.62).toFixed(3)})`); brilho.addColorStop(0.55, `rgba(255,236,208,${(a * 0.22).toFixed(3)})`); brilho.addColorStop(1, 'rgba(255,236,208,0)');
      g2.beginPath(); g2.arc(px, b.y, rr, 0, 6.3); g2.fillStyle = brilho; g2.fill();
    }
  };

  /* ---------- onda de líquido ---------- */
  const wave = $('#wave'), line = $('#waveLine'), wv = { level: -0.12, amp: 0, on: false }, wb = [];
  const updateWave = (t) => {
    if (!wv.on) return; const n = 32, pts = [], lp = [];
    for (let i = 0; i <= n; i++) { const x = (i / n) * 100, y = (1 - wv.level) * 100 + (Math.sin(i * 0.5 + t * 4) * 0.6 + Math.sin(i * 0.23 - t * 2.6) * 0.8) * wv.amp; pts.push(`${x}% ${y}%`); lp.push(`${i ? 'L' : 'M'}${x} ${y}`); }
    wave.style.clipPath = `polygon(${pts.join(',')},100% 120%,0 120%)`; line.setAttribute('d', lp.join(' '));
  };
  /* recomeça o prato com a cena limpa: a comida nunca aparece se desmontando */
  const voltarAoInicio = () => { p = 0; scrollTo({ top: sectionRange().top, behavior: 'instant' }); };
  const switchShow = (i, { scroll = true } = {}) => {
    if (busy) return; if (i === cur) { if (scroll) voltarAoInicio(); return; }
    busy = true; const nx = SHOWS[i], c = nx.colors;
    const apply = () => { cur = i; p = 0; if (scroll) scrollTo(0, sectionRange().top); buildShots(nx); setVars(c); refreshPick(); setIsland(DISHES.find((d) => d.show === nx.id)); renderScene(); };
    if (reduce) { apply(); busy = false; return; }
    wave.style.background = c.page; wave.style.visibility = 'visible'; wv.on = true; wv.level = -0.12; wv.amp = 0;
    wb.splice(0).forEach((b) => b.remove());
    for (let k = 0; k < 26; k++) { const b = document.createElement('i'), s = 4 + Math.random() * 14; b.style.cssText = `position:absolute;left:${Math.random() * 100}%;bottom:-20px;width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.85),rgba(255,255,255,.08) 65%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)`; wave.appendChild(b); wb.push(b); gsap.to(b, { y: -innerHeight - 60, x: (Math.random() - 0.5) * 80, duration: 0.9 + Math.random() * 0.8, delay: Math.random() * 0.6, ease: 'power1.in' }); }
    gsap.timeline({ onComplete() { wave.style.visibility = 'hidden'; wave.style.clipPath = ''; wave.style.opacity = ''; wv.on = false; busy = false; } })
      .to(wv, { level: 1.14, duration: 1.3, ease: 'power2.inOut' }, 0).to(wv, { amp: 5, duration: 0.45, ease: 'power2.out' }, 0).to(wv, { amp: 0, duration: 0.45, ease: 'power2.in' }, 0.85)
      .call(apply, null, 1.3).to(wave, { opacity: 0, duration: 0.45 }, 1.32);
  };

  /* ---------- bolhas ---------- */
  /* bolhas escolhem o tipo; os sabores daquele tipo ficam no cartão */
  const BUB_TYPES = ['burger', 'pizza', 'fritas'];
  const typeGroups = BUB_TYPES.map((id) => TYPES.find((t) => t.id === id)).filter((t) => t && SHOWS.some((s) => s.type === t.id)).map((t) => ({ t, first: SHOWS.findIndex((s) => s.type === t.id) }));
  $('#bubbles').innerHTML = typeGroups.map(({ t, first }) => { const s = SHOWS[first]; return `<button class="bub" type="button" role="radio" data-i="${first}" data-type="${t.id}" aria-checked="false" aria-label="${esc(t.name)}" style="--c:${s.colors.page}"><span class="bub-g"><span class="bub-i"><img src="${showThumb(s)}" alt=""></span></span><b>${esc(t.name)}</b></button>`; }).join('');
  /* setas e roda do mouse percorrem as categorias */
  const bubsBox = $('#bubbles'), pickBox = bubsBox.parentElement;
  pickBox.insertAdjacentHTML('beforeend', '<button class="bub-nav prev" type="button" aria-label="Categorias anteriores">‹</button><button class="bub-nav next" type="button" aria-label="Mais categorias">›</button>');
  const bubPrev = $('.bub-nav.prev', pickBox), bubNext = $('.bub-nav.next', pickBox);
  const paintNav = () => { bubPrev.disabled = bubsBox.scrollLeft < 8; bubNext.disabled = bubsBox.scrollLeft + bubsBox.clientWidth > bubsBox.scrollWidth - 8; };
  bubPrev.addEventListener('click', () => bubsBox.scrollBy({ left: -bubsBox.clientWidth * 0.75 })); bubNext.addEventListener('click', () => bubsBox.scrollBy({ left: bubsBox.clientWidth * 0.75 }));
  bubsBox.addEventListener('scroll', paintNav, { passive: true }); addEventListener('resize', paintNav); paintNav();
  bubsBox.addEventListener('wheel', (e) => { if (bubsBox.scrollWidth <= bubsBox.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; const antes = bubsBox.scrollLeft; bubsBox.scrollLeft += e.deltaY; if (bubsBox.scrollLeft !== antes) e.preventDefault(); }, { passive: false });
  const flavorsEl = $('#flavors');
  /* carrega em segundo plano, um arquivo por vez, os outros sabores do tipo aberto */
  const preloaded = new Set(), preQueue = []; let preBusy = false;
  const preNext = () => { const u = preQueue.shift(); if (!u) { preBusy = false; return; } preBusy = true; const i = new Image(); i.onload = i.onerror = preNext; i.src = u; };
  const preloadType = (type) => { if (preloaded.has(type)) return; preloaded.add(type); SHOWS.filter((s) => s.type === type && s.frames).forEach((s) => s.frames.forEach((n, i) => { preQueue.push(`assets/frames/${n}.jpg`); if (window.SM.PIECES[n] && !(s.pours && s.pours[i])) preQueue.push(`assets/frames/${n}-peca.png`); })); if (!preBusy) setTimeout(preNext, 1200); };
  const refreshPick = () => {
    const show = SHOWS[cur];
    $$('.bub').forEach((b) => { const on = b.dataset.type === show.type; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    /* aqui aparece só a comida aberta: as outras opções ficam no cardápio */
    flavorsEl.innerHTML = `<button class="fl" type="button" role="radio" data-i="${cur}" aria-checked="true">${esc(show.name)}</button>`;
    preloadType(show.type);
    /* o sabor e a bolha selecionados ficam centralizados, nunca cortados */
    centerIn(flavorsEl, $('.fl[aria-checked=true]', flavorsEl));
    centerIn($('#bubbles'), $('.bub[aria-checked=true]'));
  };
  flavorsEl.addEventListener('click', (e) => { const b = e.target.closest('.fl'); if (b) switchShow(+b.dataset.i); });
  const popBubble = (b) => {
    if (reduce) return; const gl = $('.bub-g', b), c = b.style.getPropertyValue('--c');
    gsap.timeline().to(gl, { scaleX: 1.2, scaleY: 0.88, duration: 0.12, ease: 'power2.out' }).to(gl, { scaleX: 1, scaleY: 1, clearProps: 'transform', duration: 0.9, ease: 'elastic.out(1.1,.35)' });
    const r = document.createElement('i'); r.className = 'pop-ring'; gl.appendChild(r); gsap.fromTo(r, { scale: 1, opacity: 1 }, { scale: 1.9, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => r.remove() });
    for (let k = 0; k < 10; k++) { const dp = document.createElement('i'); dp.className = 'pop-drop'; gl.appendChild(dp); const a = (k / 10) * 6.283, dd = 50 + Math.random() * 40; gsap.fromTo(dp, { x: 0, y: 0, scale: 1 }, { x: Math.cos(a) * dd, y: Math.sin(a) * dd, scale: 0, duration: 0.7, ease: 'power2.out', onComplete: () => dp.remove() }); }
  };
  $$('.bub').forEach((b) => {
    b.addEventListener('click', () => { const i = +b.dataset.i; if (b.dataset.type !== SHOWS[cur].type && !busy) { popBubble(b); switchShow(i); } else voltarAoInicio(); });
    b.addEventListener('keydown', (e) => { const all = $$('.bub'), k = all.indexOf(b), n = all.length; let to = null; if (['ArrowDown', 'ArrowRight'].includes(e.key)) to = (k + 1) % n; if (['ArrowUp', 'ArrowLeft'].includes(e.key)) to = (k - 1 + n) % n; if (to !== null) { e.preventDefault(); all[to].focus(); all[to].click(); } });
  });

  /* ---------- cardápio: grade que expande ---------- */
  const bento = $('#bento'); let filter = 'burger', query = '', list = [], tiles = [], open = -1, caseBusy = false, touched = false, inView = false, autoT = 0, cyc = 0;
  /* a altura da linha acompanha a largura: o bloco largo sempre mostra a comida e a mesa, sem cortar */
  const medirBlocos = () => { const cs = getComputedStyle(bento), cols = cs.gridTemplateColumns.split(' ').length, gap = parseFloat(cs.columnGap) || 0; if (bento.clientWidth) bento.style.setProperty('--row', `${(((bento.clientWidth - gap * (cols - 1)) / cols) * 2 + gap) / 2.2}px`); };
  new ResizeObserver(medirBlocos).observe(bento);
  const chipsEl = $('#chips');
  const artHtml = (d) => {
    const s = d.show && showById(d.show);
    /* o enquadramento acompanha o topo da comida: copo alto não corta e a mesa continua aparecendo */
    if (s) { const topo = (s.frames || []).reduce((m, f, i) => { const b = window.SM.PIECES[f]; return b && !(s.pours && s.pours[i]) ? Math.min(m, b.y) : m; }, 0.3), y = Math.round(clamp((topo - 0.03) / 0.192) * 100); return `<img class="art" src="${showThumb(s)}" style="--art-y:${y}%" alt="" loading="lazy">`; }
    const hue = ((d.type.items.findIndex((x) => x[0] === d.name) % 4) - 1.5) * 9;
    return `<span class="art typ" style="filter:hue-rotate(${hue}deg);background:radial-gradient(90% 90% at 75% 15%,${d.type.c[0]},${d.type.c[1]})"><u>${esc(d.name)}</u><s></s><q></q></span>`;
  };
  const renderChips = () => { chipsEl.innerHTML = TYPES.map((t) => `<button class="chip" type="button" data-id="${t.id}" style="--c:${t.c[0]}" aria-pressed="${filter === t.id && !query}">${esc(t.name)}</button>`).join(''); $$('.chip', chipsEl).forEach((c) => c.addEventListener('click', () => { touched = true; stopAuto(); filter = c.dataset.id; query = ''; $('#q').value = ''; closeNow(); renderChips(); renderBento(); setIsland(list[0]); c.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); })); };
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  /* filtros: doce, salgado, vegetariano e vegano (a lista está em tags.js) */
  const FILTROS = [['doce', 'Doce'], ['salgado', 'Salgado'], ['vegetariano', 'Vegetariano'], ['vegano', 'Vegano']];
  let tagAtiva = '', buscaGeral = false;
  const temTag = (d, k) => { const T = window.SM_TAGS, id = d.type.id, p = T.pratos[id] || {}, tem = (n) => (p[n] || []).includes(d.name); if (T.semTipo.includes(id)) return false; const doce = T.sempreDoce.includes(id) || tem('doce'); if (k === 'doce') return doce; if (k === 'salgado') return !doce; return tem(k); };
  const closeNow = () => { open = -1; caseBusy = false; bento.classList.remove('is-open', 'is-panel'); };
  const renderBento = () => {
    const q = norm(query), base = buscaGeral ? DISHES : DISHES.filter((d) => d.type.id === filter);
    /* cada botão só aparece onde faz sentido: precisa ter prato com ele e prato sem ele */
    const disponiveis = FILTROS.filter(([k]) => { const n = base.filter((d) => temTag(d, k)).length; return n > 0 && n < base.length; });
    if (!disponiveis.some(([k]) => k === tagAtiva)) tagAtiva = '';
    $('#filtros').innerHTML = disponiveis.map(([k, rotulo]) => `<button class="chip" type="button" data-tag="${k}" aria-pressed="${k === tagAtiva}">${rotulo}</button>`).join('');
    list = base.filter((d) => (!q || norm(d.name + ' ' + d.desc + ' ' + d.type.name).includes(q)) && (!tagAtiva || temTag(d, tagAtiva)));
    const t = TYPES.find((x) => x.id === filter);
    $('#q').placeholder = buscaGeral ? 'Buscar em todo o cardápio...' : `Buscar em ${t.name}...`;
    $('#menuTitle').textContent = q || buscaGeral ? `${list.length} ${list.length === 1 ? 'resultado.' : 'resultados.'}` : `${t.name}.`;
    $('#empty').hidden = list.length > 0;
    bento.className = 'bento' + (!q && !buscaGeral && list.length >= 5 ? ' featured' : '') + (!q && !buscaGeral && list.length === 5 ? ' five' : '');
    bento.innerHTML = list.map((d, i) => `<button class="tile" type="button" data-i="${i}" aria-label="${esc(d.name)}, R$ ${brl(d.price)}">${artHtml(d)}<span class="lab" style="--c:${d.type.c[0]}"><i></i><b>${esc(d.name)}</b><small>R$ ${brl(d.price)}</small></span></button>`).join('') +
      `<div class="case" role="dialog" aria-modal="false" aria-label="Prato aberto"><div class="box"></div><button class="nb p-close" type="button" aria-label="Fechar o prato">✕</button><div class="panel"><div class="p-top"><span id="pNum"></span><span id="pCena"></span></div><h3 class="p-t" id="pT"></h3><p class="p-meta" id="pMeta"></p><p class="p-desc" id="pDesc"></p><div class="p-res" id="pRes"></div><div class="p-size" id="pSize" role="group" aria-label="Tamanho"></div><div class="p-acts"><button class="p-see" id="pSee" type="button" hidden>Ver o preparo</button><button class="p-add" id="pAdd" type="button"><span>Adicionar ao pedido</span><i aria-hidden="true">+</i></button><button class="nb" id="pPrev" type="button" aria-label="Prato anterior">${ARROWL}</button><button class="nb" id="pNext" type="button" aria-label="Próximo prato">${ARROW}</button></div></div></div>`;
    medirBlocos(); tiles = $$('.tile', bento); open = -1;
    tiles.forEach((el, i) => el.addEventListener('click', () => { touched = true; stopAuto(); showCase(i, true); }));
    $('.p-close', bento).addEventListener('click', () => { touched = true; stopAuto(); hideCase(true); }); $('.box', bento).addEventListener('click', () => { touched = true; stopAuto(); hideCase(true); });
    $('#pNext').addEventListener('click', () => { touched = true; stopAuto(); goCase(1); }); $('#pPrev').addEventListener('click', () => { touched = true; stopAuto(); goCase(-1); });
    $('#pAdd').addEventListener('click', () => addToOrder(list[open], SIZES[isSize][0], isPrice()));
    $('#pSee').addEventListener('click', () => { const i = SHOWS.findIndex((s) => s.id === list[open].show); touched = true; stopAuto(); hideCase(false); if (i === cur) voltarAoInicio(); else switchShow(i); });
    if (!reduce && tiles.length) gsap.fromTo(tiles, { y: 26, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'all' });
  };
  const box = () => $('.box', bento);
  let caseTop = 0;
  const rectOf = (el) => { const a = bento.getBoundingClientRect(), r = el.getBoundingClientRect(); return { left: r.left - a.left, top: r.top - a.top - caseTop, width: r.width, height: r.height }; };
  /* o prato aberto nunca passa da altura da tela, para os botões ficarem à vista */
  const caseH = () => Math.max(Math.min(bento.clientHeight, innerHeight - 96), 460);
  const caseTarget = () => { const w = bento.clientWidth, h = caseH(); bento.style.setProperty('--ch', h + 'px'); return innerWidth <= 800 ? { left: 0, top: 0, width: w, height: h * 0.3 } : { left: 0, top: 0, width: w * 0.62 - 6, height: h }; };
  const fillCase = (i) => {
    const d = list[i]; box().innerHTML = artHtml(d); box().firstChild.classList.remove('x');
    $('#pNum').innerHTML = `<b>${pad(i + 1)}</b> / ${pad(list.length)}`; $('#pCena').textContent = d.show ? 'PREPARO EM CENA' : 'PREPARO EM BREVE';
    $('#pT').textContent = d.name; $('#pMeta').textContent = d.type.name; $('#pDesc').textContent = d.desc; $('#pSee').hidden = !d.show;
    setIsland(d); paintRes();
  };
  const paintRes = () => { if (open < 0 || !$('#pRes')) return; const d = list[open]; $('#pRes').innerHTML = `<div><b>R$ ${brl(isPrice())}</b>${SIZES.length > 1 ? `tamanho ${SIZES[isSize][0]}` : 'preço'}</div><div><b>${d.type.min} min</b>preparo</div><div><b>R$ ${brl(isPrice() * 0.9)}</b>no Pix</div>`; };
  /* a grade agora é longa: o prato abre na altura em que a pessoa está */
  const placeCase = () => { const h = caseH(), a = bento.getBoundingClientRect().top, ct = Math.round(clamp(78 - a, 0, Math.max(0, bento.clientHeight - h))); caseTop = ct; bento.style.setProperty('--ct', ct + 'px'); };
  const showCase = (i, user) => { if (caseBusy || open >= 0) return; caseBusy = true; open = i; fillCase(i); placeCase(); gsap.set(box(), rectOf(tiles[i])); bento.classList.add('is-open'); if (user) { const vt = bento.getBoundingClientRect().top + caseTop; if (Math.abs(vt - 78) > 4) scrollBy({ top: vt - 78, behavior: reduce ? 'auto' : 'smooth' }); } gsap.to(box(), { ...caseTarget(), duration: reduce ? 0 : 0.72, ease: 'power3.inOut', onComplete() { caseBusy = false; if (user) $('.p-close', bento).focus({ preventScroll: true }); } }); gsap.delayedCall(reduce ? 0 : 0.42, () => open >= 0 && bento.classList.add('is-panel')); };
  const hideCase = (user) => { if (caseBusy || open < 0) return; caseBusy = true; const i = open; bento.classList.remove('is-panel'); gsap.to(box(), { ...rectOf(tiles[i]), duration: reduce ? 0 : 0.62, ease: 'power3.inOut', onComplete() { bento.classList.remove('is-open'); open = -1; caseBusy = false; if (user) tiles[i].focus({ preventScroll: true }); } }); };
  const goCase = (d) => { if (caseBusy || open < 0) return; caseBusy = true; open = (open + d + list.length) % list.length; bento.classList.remove('is-panel'); const nu = document.createElement('div'); nu.style.cssText = 'position:absolute;inset:0'; nu.innerHTML = artHtml(list[open]); gsap.set(nu, { clipPath: d > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }); box().appendChild(nu); gsap.to(nu, { clipPath: 'inset(0% 0% 0% 0%)', duration: reduce ? 0 : 0.68, ease: 'power3.inOut', onComplete() { fillCase(open); bento.classList.add('is-panel'); caseBusy = false; } }); };
  bento.addEventListener('keydown', (e) => { if (open < 0) return; touched = true; stopAuto(); if (e.key === 'Escape') { e.preventDefault(); hideCase(true); } else if (e.key === 'ArrowRight') { e.preventDefault(); goCase(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); goCase(-1); } });
  addEventListener('resize', () => { if (open >= 0 && !caseBusy) gsap.set(box(), caseTarget()); });
  /* sem ninguém mexendo, um prato abre sozinho */
  const stopAuto = () => clearTimeout(autoT);
  const auto = () => { if (touched || !inView || reduce || !list.length) return; if (open < 0) { showCase(cyc % list.length); autoT = setTimeout(auto, 3000); } else if (cyc % 2 === 0) { goCase(1); cyc++; autoT = setTimeout(auto, 2800); } else { hideCase(); cyc++; autoT = setTimeout(auto, 3400); } };
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; stopAuto(); if (inView && !touched) autoT = setTimeout(auto, 1800); }, { threshold: 0.35 }).observe($('#cardapio'));
  $('#q').addEventListener('input', (e) => { touched = true; stopAuto(); query = e.target.value; if (buscaGeral && !query.trim()) { $('#catBack').click(); return; } closeNow(); renderChips(); renderBento(); });
  $('#filtros').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; touched = true; stopAuto(); tagAtiva = b.dataset.tag === tagAtiva ? '' : b.dataset.tag; closeNow(); renderBento(); });

  /* ---------- tela de categorias: cards de tamanhos diferentes ---------- */
  const CAT_SIZE = { burger: 'l', pizza: 'l', tabuas: 'l', sushi: 'l', fritas: 'w', nuggets: 'w', churrasco: 'w', japonesa: 'w', brasileira: 'w', doces: 'w', shakes: 'w', bebidas: 'w', alacarte: 'w', mar: 'w', saladas: 'w', drinks: 'w', cafes: 'w', frituras: 't', acai: 't', italiana: 't' };
  const CAT_ORDER = ['burger', 'pizza', 'fritas', 'frituras', 'nuggets', 'tabuas', 'churrasco', 'sushi', 'japonesa', 'alacarte', 'italiana', 'hotdog', 'brasileira', 'marmitas', 'mexicana', 'chinesa', 'saladas', 'sopas', 'padaria', 'kids', 'acai', 'doces', 'shakes', 'cafes', 'bebidas', 'sucos', 'drinks'];
  const catsEl = $('#cats'), catTypes = [...CAT_ORDER.map((id) => TYPES.find((t) => t.id === id)), ...TYPES.filter((t) => !CAT_ORDER.includes(t.id))].filter(Boolean);
  catsEl.innerHTML = catTypes.map((t) => {
    const d = DISHES.find((x) => x.type.id === t.id && x.show && showById(x.show)), n = t.items.length, sz = CAT_SIZE[t.id] || 'n';
    return `<button class="cat cat-${sz}${d ? ' has-img' : ''}" type="button" data-id="${t.id}" aria-label="${esc(t.name)}, ${n} sabores" style="--c:${t.c[0]};--d:${t.c[1]}">${d ? `<img class="art" src="${showThumb(showById(d.show))}" alt="" loading="lazy">` : '<span class="cat-deco"><s></s><q></q></span>'}<span class="cat-go" aria-hidden="true">${ARROW}</span><span class="cat-lab"><b>${esc(t.name)}</b><small>${n} sabores · ${t.min} min</small></span></button>`;
  }).join('');
  $('#catsLine').textContent = `${TYPES.length} categorias · ${DISHES.length} sabores`;
  /* os produtos só aparecem depois de escolher uma categoria */
  const menuSec = $('#cardapio');
  const openCat = (id, scroll) => {
    /* com uma categoria aberta, abaixo da cena ficam só as comidas dela; as outras categorias voltam pelo botão */
    document.documentElement.classList.add('com-categoria'); menuSec.hidden = false; touched = true; stopAuto(); filter = id; buscaGeral = false; tagAtiva = ''; query = ''; $('#q').value = ''; closeNow(); renderChips(); renderBento(); setIsland(list[0]);
    try { sessionStorage.setItem('sm_cat', id); } catch (e) { /* sem armazenamento */ }
    if (scroll) menuSec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    centerIn(chipsEl, $(`.chip[data-id="${filter}"]`, chipsEl));
  };
  /* fora de uma categoria, a busca procura em todo o cardápio: a lista de resultados abre e o cursor continua na caixa de busca */
  $('#qGeral').addEventListener('input', (e) => { const v = e.target.value; if (!v.trim()) return; e.target.value = ''; document.documentElement.classList.add('com-categoria'); menuSec.hidden = false; touched = true; stopAuto(); buscaGeral = true; tagAtiva = ''; query = v; const qi = $('#q'); qi.value = v; closeNow(); renderChips(); renderBento(); scrollTo({ top: menuSec.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }); qi.focus({ preventScroll: true }); qi.setSelectionRange(v.length, v.length); });
  /* transição: o card cresce até ocupar a tela, sobe e revela os produtos */
  let catBusy = false;
  catsEl.addEventListener('click', (e) => {
    const c = e.target.closest('.cat'); if (!c || catBusy) return;
    if (reduce) { openCat(c.dataset.id, true); return; }
    catBusy = true; const r = c.getBoundingClientRect(), fly = c.cloneNode(true); fly.classList.add('cat-fly'); fly.setAttribute('aria-hidden', 'true'); fly.tabIndex = -1;
    gsap.set(fly, { left: r.left, top: r.top, width: r.width, height: r.height, opacity: 1, scale: 1, y: 0 }); document.body.appendChild(fly); c.style.visibility = 'hidden';
    const titulo = $('.cat-lab b', fly), rotulo = $('.cat-lab', fly), seta = $('.cat-go', fly), grande = Math.min(innerWidth * 0.11, 128);
    gsap.timeline({ onComplete() { fly.remove(); c.style.visibility = ''; catBusy = false; } })
      .to(seta, { opacity: 0, scale: 0.6, duration: 0.2 }, 0)
      .to(fly, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.72, ease: 'power3.inOut' }, 0)
      .to(titulo, { fontSize: grande, duration: 0.72, ease: 'power3.inOut' }, 0)
      .to(rotulo, { left: 'var(--gut)', bottom: 40, duration: 0.72, ease: 'power3.inOut' }, 0)
      .call(() => { openCat(c.dataset.id, false); scrollTo({ top: menuSec.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }); }, null, 0.86)
      .to(fly, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, 0.9);
  });
  /* "Cardápio" no topo fecha os produtos e volta para os cards */
  $$('a[href="#categorias"]').forEach((a) => a.addEventListener('click', () => { closeNow(); menuSec.hidden = true; buscaGeral = false; tagAtiva = ''; query = ''; $('#q').value = ''; document.documentElement.classList.remove('com-categoria'); try { sessionStorage.removeItem('sm_cat'); } catch (e) { /* sem armazenamento */ } }));
  /* botão que acompanha a lista: a lista some e os cards de categoria voltam */
  $('#catBack').addEventListener('click', () => {
    if (catBusy) return; catBusy = true; closeNow(); try { sessionStorage.removeItem('sm_cat'); } catch (e) { /* sem armazenamento */ }
    const fim = () => { menuSec.hidden = true; buscaGeral = false; tagAtiva = ''; query = ''; $('#q').value = ''; document.documentElement.classList.remove('com-categoria'); gsap.set(menuSec, { clearProps: 'opacity,transform' }); scrollTo({ top: $('#categorias').getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }); catBusy = false; if (!reduce) gsap.from($$('.cat', catsEl), { y: 26, opacity: 0, scale: 0.97, duration: 0.5, stagger: 0.015, ease: 'power3.out', clearProps: 'transform,opacity' }); $('.cat', catsEl).focus({ preventScroll: true }); };
    if (reduce) { fim(); return; }
    /* transição: uma cortina sobe, cobre a tela, e ao sair revela o menu */
    const cortina = document.createElement('div'); cortina.className = 'menu-cortina'; cortina.setAttribute('aria-hidden', 'true'); cortina.innerHTML = '<b>Menu</b>'; document.body.appendChild(cortina);
    gsap.timeline({ onComplete() { cortina.remove(); } })
      .fromTo(cortina, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.inOut' })
      .fromTo($('b', cortina), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0.25)
      .call(fim, null, 0.7)
      .to(cortina, { yPercent: -100, duration: 0.65, ease: 'power3.inOut' }, 0.78);
  });
  try { const salva = sessionStorage.getItem('sm_cat'); if (salva && TYPES.some((t) => t.id === salva)) setTimeout(() => openCat(salva, false), 0); } catch (e) { /* sem armazenamento */ }
  if (!reduce) { const io = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; io.disconnect(); gsap.from($$('.cat', catsEl), { y: 30, opacity: 0, scale: 0.97, duration: 0.65, stagger: 0.025, ease: 'power3.out', clearProps: 'transform,opacity' }); }, { threshold: 0.08 }); io.observe(catsEl); }

  /* ---------- ilha de compra ---------- */
  /* tamanho só onde faz sentido: hambúrguer e prato feito têm tamanho único */
  const SIZE_SETS = { pmg: { list: [['P', 'Pequena', 0.82], ['M', 'Média', 1], ['G', 'Grande', 1.28]], def: 1 }, pizza: { list: [['Broto', 'Broto', 0.62], ['Média', 'Média', 0.82], ['Grande', 'Grande', 1]], def: 2 }, unico: { list: [['', 'Tamanho único', 1]], def: 0 } };
  const SIZE_BY_TYPE = { fritas: 'pmg', bebidas: 'pmg', sucos: 'pmg', shakes: 'pmg', sopas: 'pmg', marmitas: 'pmg', pizza: 'pizza' };
  let SIZES = SIZE_SETS.unico.list, sizeKey = 'unico';
  let isDish = null, isSize = 0;
  const paintSizes = () => {
    const html = SIZES.map(([k, nome], i) => `<button type="button" data-i="${i}" aria-pressed="${i === isSize}" aria-label="Tamanho ${esc(nome)}">${esc(k)}</button>`).join('');
    ['#isOpts', '#pSize'].forEach((sel) => { const el = $(sel); if (!el) return; el.innerHTML = html; el.style.display = SIZES.length > 1 ? '' : 'none'; $$('button', el).forEach((b) => b.addEventListener('click', () => setSize(+b.dataset.i))); });
  };
  const useSizesFor = (d) => { const key = SIZE_BY_TYPE[d.type.id] || 'unico', set = SIZE_SETS[key]; if (key !== sizeKey || (isDish && isDish.id !== d.id)) { sizeKey = key; SIZES = set.list; isSize = set.def; } paintSizes(); };
  const isPrice = () => Math.round(isDish.price * SIZES[isSize][2] * 100) / 100;
  const paintPrice = (roll) => { const v = isPrice(), n = $('#isNum'); n.textContent = brl(v); if (roll && !reduce) { n.classList.remove('roll'); void n.offsetWidth; n.classList.add('roll'); } $('#isInst').innerHTML = `<b>R$ ${brl(v * 0.9)}</b> no Pix`; };
  const setSize = (i) => { isSize = i; $$('#isOpts button,#pSize button').forEach((o) => o.setAttribute('aria-pressed', +o.dataset.i === i)); paintPrice(true); paintRes(); };
  const setIsland = (d) => { if (!d) return; useSizesFor(d); isDish = d; const s = d.show && showById(d.show); $('#isTh').innerHTML = s ? `<img src="${showThumb(s)}" alt="">` : `<span style="background:radial-gradient(circle at 70% 20%,${d.type.c[0]},${d.type.c[1]})"></span>`; $('#isName').textContent = d.name; $('#isSub').textContent = d.type.name; paintPrice(true); };
  $('#isCta').addEventListener('click', () => addToOrder(isDish, SIZES[isSize][0], isPrice()));
  $('#heroBuy').addEventListener('click', () => { const d = DISHES.find((x) => x.show === SHOWS[cur].id); addToOrder(d, 'M', d.price); });

  /* ---------- pedido ---------- */
  /* ---------- pedido e checkout simulado (nada é cobrado nem enviado) ---------- */
  const order = [], co = { step: 0, mode: 'entrega', name: '', phone: '', addr: '', pay: 'pix', coupon: null, cep: '', ship: 'padrao', id: '' };
  const { shipping: SHIP, coupons: COUPONS } = window.SM;
  const money = (v) => 'R$ ' + brl(v);
  const subtotal = () => order.reduce((s, o) => s + o.price * o.qty, 0);
  /* frete simulado: a região do CEP define o valor e o tempo */
  const cepZone = () => { const n = co.cep.replace(/\D/g, ''); return n.length === 8 ? (+n[0] + +n[1] + +n[2]) % 6 : -1; };
  const shipOptions = () => { const z = cepZone(); if (z < 0) return null; const std = SHIP.base + z * SHIP.perZone, t = 35 + z * 6; return { padrao: { name: 'Padrão', fee: std, time: `${t}–${t + 15} min` }, expresso: { name: 'Expressa', fee: std + SHIP.express, time: `${Math.max(15, t - 15)}–${Math.max(25, t - 5)} min` } }; };
  const couponOk = (c, sub) => !!c && !(c.min && sub < c.min);
  const sums = () => {
    const sub = subtotal(), c = couponOk(co.coupon, sub) ? co.coupon : null, off = !c ? 0 : c.kind === 'pct' ? sub * c.value : c.kind === 'fix' ? Math.min(sub, c.value) : 0;
    const opts = shipOptions(), raw = co.mode === 'entrega' && order.length && opts ? opts[co.ship].fee : 0, free = co.mode === 'entrega' && !!opts && (sub >= SHIP.freeFrom || (c && c.kind === 'ship')), fee = free ? 0 : raw;
    return { sub, off, fee, free, c, pending: co.mode === 'entrega' && !opts, tot: sub - off + fee };
  };
  const totalsHtml = () => {
    const s = sums(), opts = shipOptions(), missing = SHIP.freeFrom - s.sub;
    const shipTxt = co.mode !== 'entrega' ? 'Grátis' : s.pending ? 'Informe o CEP' : s.free ? 'Grátis' : money(s.fee);
    const bar = co.mode === 'entrega' && order.length && co.step < 3 && !(s.free && s.c && s.c.kind === 'ship') ? (missing > 0 ?`<div class="co-free"><span>Faltam <b>${money(missing)}</b> para o frete grátis</span><i><u style="width:${Math.min(100, (s.sub / SHIP.freeFrom) * 100)}%"></u></i></div>` : '<div class="co-free ok"><span>Você ganhou <b>frete grátis</b></span></div>') : '';
    return `${bar}<div class="co-sum"><div><span>Subtotal</span><span>${money(s.sub)}</span></div>${s.c && s.off ? `<div class="good"><span>Cupom ${s.c.code}</span><span>− ${money(s.off)}</span></div>` : ''}<div class="${s.free ? 'good' : ''}"><span>${co.mode === 'entrega' ? `Frete${opts ? ' · ' + opts[co.ship].time : ''}` : 'Retirada'}</span><span>${shipTxt}</span></div><div class="big"><span>Total</span><b>${money(s.tot)}</b></div></div>`;
  };
  const couponHtml = () => { const s = subtotal(), c = co.coupon; return `<form class="co-coupon" id="couponF"><label class="vh" for="couponI">Cupom de desconto</label><input id="couponI" autocomplete="off" placeholder="Cupom de desconto" value="${c ? c.code : ''}"><button type="submit">${c ? 'Trocar' : 'Aplicar'}</button></form><p class="co-err ${c && couponOk(c, s) ? 'okm' : ''}" id="couponE" role="alert">${c ? (couponOk(c, s) ? `Cupom aplicado: ${esc(c.label)}.` : `Falta chegar a ${money(c.min)} para usar ${c.code}.`) : ''}</p><div class="co-tags" aria-label="Cupons de teste">${COUPONS.map((x) => `<button type="button" data-coupon="${x.code}" aria-pressed="${!!c && c.code === x.code}" title="${esc(x.label)}">${x.code}</button>`).join('')}</div>`; };
  const cepHtml = () => { const opts = shipOptions(); return `<form class="co-coupon co-cep" id="cepF"><label class="vh" for="cepI">CEP para calcular o frete</label><input id="cepI" inputmode="numeric" autocomplete="off" maxlength="9" placeholder="CEP para o frete (fictício)" value="${esc(co.cep)}"><button type="submit">Calcular</button></form><p class="co-err" id="cepE" role="alert"></p>${opts ? `<div class="ships" role="radiogroup" aria-label="Tipo de entrega">${Object.entries(opts).map(([id, o]) => `<button type="button" role="radio" aria-checked="${co.ship === id}" data-ship="${id}"><b>${o.name}</b><small>${o.time}</small><em>${sums().free ? 'Grátis' : money(o.fee)}</em></button>`).join('')}</div>` : ''}`; };
  const STAGES = [['Pedido recebido', 'A cozinha já viu.'], ['Na cozinha', 'Seu prato está sendo feito.'], ['Finalizando', 'Última conferência.'], ['A caminho', 'Saiu para entrega.'], ['Entregue', 'Bom apetite!']];
  let trackTimer = 0;
  const paintOrder = () => {
    const list = $('#drList'), foot = $('#drFoot'), stepsEl2 = $('#coSteps'); clearTimeout(trackTimer);
    $('#orderCount').textContent = order.reduce((s, o) => s + o.qty, 0);
    $$('li', stepsEl2).forEach((l, i) => { l.className = i < co.step ? 'done' : i === co.step ? 'now' : ''; }); stepsEl2.hidden = co.step === 3 || (!order.length && co.step === 0);
    $('#drTitle').textContent = ['Seu pedido', 'Entrega', 'Pagamento', 'Pedido confirmado'][co.step];
    if (co.step === 0) {
      list.innerHTML = order.length ? order.map((o, i) => `<div class="dr-it"><div><b>${esc(o.name)}</b><small>${o.size ? `Tamanho ${esc(o.size)} · ` : ''}${money(o.price)}</small></div><span class="qty"><button type="button" data-dec="${i}" aria-label="Menos ${esc(o.name)}">−</button><em>${o.qty}</em><button type="button" data-inc="${i}" aria-label="Mais ${esc(o.name)}">+</button></span></div>`).join('') : '<p class="dr-empty">Sua sacola está vazia. Escolha um prato no cardápio.</p>';
      foot.innerHTML = order.length ? `${totalsHtml()}<button class="dr-send" type="button" data-next>Continuar</button>` : '';
      if (order.length) list.insertAdjacentHTML('beforeend', `<div class="co-extra">${couponHtml()}${cepHtml()}</div>`);
    } else if (co.step === 1) {
      list.innerHTML = `<form id="addrF" class="co-form" novalidate><div class="seg" role="radiogroup" aria-label="Como receber"><button type="button" role="radio" aria-checked="${co.mode === 'entrega'}" data-mode="entrega">Entrega</button><button type="button" role="radio" aria-checked="${co.mode === 'retirada'}" data-mode="retirada">Retirada</button></div><label>Nome<input id="fName" autocomplete="off" value="${esc(co.name)}" placeholder="Pode ser fictício"></label><label>Telefone<input id="fPhone" autocomplete="off" inputmode="tel" value="${esc(co.phone)}" placeholder="(11) 90000-0000"></label>${co.mode === 'entrega' ? `<label>Endereço<input id="fAddr" autocomplete="off" value="${esc(co.addr)}" placeholder="Rua, número e bairro"></label>` : '<p class="co-note">Retire no balcão em cerca de 25 minutos.</p>'}<p class="co-err" id="addrE" role="alert"></p></form>${co.mode === 'entrega' ? cepHtml() : ''}`;
      foot.innerHTML = `${totalsHtml()}<div class="co-nav"><button class="co-back" type="button" data-back>Voltar</button><button class="dr-send" type="button" data-next>Ir para o pagamento</button></div>`;
    } else if (co.step === 2) {
      const opt = (id, t, s) => `<button type="button" class="pay" role="radio" aria-checked="${co.pay === id}" data-pay="${id}"><b>${t}</b><small>${s}</small></button>`;
      list.innerHTML = `<div class="co-demo">Simulação: nenhum valor é cobrado e nenhum dado é enviado.</div><div role="radiogroup" aria-label="Forma de pagamento" class="pays">${opt('pix', 'Pix', 'Código gerado na hora')}${opt('cartao', 'Cartão', 'Cartão de teste •••• 4242')}${opt('dinheiro', 'Dinheiro', 'Pagar na entrega')}</div>${co.pay === 'pix' ? `<div class="pix"><svg viewBox="0 0 29 29" aria-label="QR Code de demonstração" role="img">${fakeQr()}</svg><p>QR Code de demonstração</p></div>` : ''}`;
      foot.innerHTML = `${totalsHtml()}<div class="co-nav"><button class="co-back" type="button" data-back>Voltar</button><button class="dr-send" type="button" data-pay-now>Pagar ${money(sums().tot)}</button></div>`;
    } else {
      list.innerHTML = `<div class="done-head"><span class="done-ok">✓</span><p>Pedido <b>#${co.id}</b></p><small>Simulação. Nenhum pedido real foi feito.</small></div><ol class="track" id="track">${STAGES.map(([a, b], i) => `<li data-i="${i}"><b>${a}</b><small>${b}</small></li>`).join('')}</ol>`;
      foot.innerHTML = `${totalsHtml()}<button class="dr-send" type="button" data-new>Fazer novo pedido</button>`;
      let st = 0; const adv = () => { $$('#track li').forEach((l, i) => { l.className = i < st ? 'done' : i === st ? 'now' : ''; }); if (st < STAGES.length - 1) { st++; trackTimer = setTimeout(adv, reduce ? 0 : 2600); } }; adv();
    }
  };
  const fakeQr = () => { const r = (x, y) => ((x * 7 + y * 13 + x * y * 3) % 5) < 2, fin = (x, y) => (x < 7 && y < 7) || (x > 21 && y < 7) || (x < 7 && y > 21); let s = ''; for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) if (!fin(x, y) && r(x, y)) s += `<rect x="${x}" y="${y}" width="1" height="1"/>`; [[0, 0], [22, 0], [0, 22]].forEach(([a, b]) => { s += `<path fill-rule="evenodd" d="M${a} ${b}h7v7h-7zM${a + 1} ${b + 1}v5h5v-5z"/><rect x="${a + 2}" y="${b + 2}" width="3" height="3"/>`; }); return s; };
  function addToOrder(d, size, price, semOferta) { const e = order.find((o) => o.id === d.id && o.size === size); if (e) e.qty++; else order.push({ id: d.id, name: d.name, size, price, qty: 1 }); if (co.step === 3) { co.step = 0; ofertaRecusada = false; } paintOrder(); $('#live').textContent = d.name + ' adicionado ao pedido.'; if (!reduce) embalar(d); if (!semOferta) { clearTimeout(ofertaT); ofertaT = setTimeout(() => oferecer(d), reduce ? 200 : 1500); } }
  /* comprou comida: oferece bebida e sobremesa. Só o que ainda falta no pedido, e quem recusa não vê de novo neste pedido */
  const TIPOS_BEBIDA = ['bebidas', 'sucos', 'cafes', 'drinks'], TIPOS_DOCE = ['doces', 'acai', 'shakes'], SUGESTOES = { bebida: ['bebidas-Coca-Cola', 'bebidas-Guaraná Antarctica', 'sucos-Laranja Espremida', 'bebidas-Água sem Gás'], doce: ['doces-Petit Gâteau', 'doces-Brownie com Sorvete', 'doces-Pudim de Leite', 'doces-Churros'] };
  let ofertaT = 0, ofertaRecusada = false, ofertaEl = null;
  const temNoPedido = (tipos) => order.some((o) => tipos.some((t) => o.id.startsWith(t + '-')));
  const precoPadrao = (d) => { const set = SIZE_SETS[SIZE_BY_TYPE[d.type.id] || 'unico'], t = set.list[set.def]; return { size: t[0], price: Math.round(d.price * t[2] * 100) / 100 }; };
  const fecharOferta = (recusou) => { clearTimeout(ofertaT); if (!ofertaEl) return; if (recusou) ofertaRecusada = true; const el = ofertaEl; ofertaEl = null; if (reduce) { el.remove(); return; } gsap.to(el, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => el.remove() }); };
  const blocoOferta = (titulo, ids) => { const itens = ids.map((id) => DISHES.find((x) => x.id === id)).filter(Boolean); return itens.length ? `<div class="of-bloco"><h4>${titulo}</h4><div class="of-grade">${itens.map((d) => { const s = d.show && showById(d.show), p = precoPadrao(d); return `<button class="of-item" type="button" data-id="${esc(d.id)}"><span class="of-foto">${s ? `<img src="${showThumb(s)}" alt="" loading="lazy">` : ''}</span><b>${esc(d.name)}</b><small>R$ ${brl(p.price)}</small><i aria-hidden="true">+</i></button>`; }).join('')}</div></div>` : ''; };
  function oferecer(d) {
    if (ofertaRecusada || ofertaEl || drawer.classList.contains('on') || !order.length) return;
    if (TIPOS_BEBIDA.includes(d.type.id) || TIPOS_DOCE.includes(d.type.id)) return;
    const faltaBebida = !temNoPedido(TIPOS_BEBIDA), faltaDoce = !temNoPedido(TIPOS_DOCE); if (!faltaBebida && !faltaDoce) return;
    const el = document.createElement('aside'); el.className = 'oferta'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Complete seu pedido');
    el.innerHTML = `<div class="of-topo"><h3>Vai querer ${faltaBebida && faltaDoce ? 'bebida e sobremesa' : faltaBebida ? 'uma bebida' : 'uma sobremesa'}?</h3><button class="nb of-x" type="button" aria-label="Fechar">✕</button></div>${faltaBebida ? blocoOferta('Para beber', SUGESTOES.bebida) : ''}${faltaDoce ? blocoOferta('De sobremesa', SUGESTOES.doce) : ''}<button class="of-nao" type="button">Não, obrigado</button>`;
    document.body.appendChild(el); ofertaEl = el; if (!reduce) gsap.from(el, { y: 60, opacity: 0, duration: 0.45, ease: 'power3.out' });
    el.addEventListener('click', (e) => {
      if (e.target.closest('.of-x,.of-nao')) { fecharOferta(true); return; }
      const b = e.target.closest('.of-item'); if (!b || b.classList.contains('feito')) return;
      const x = DISHES.find((q) => q.id === b.dataset.id), p = precoPadrao(x); addToOrder(x, p.size, p.price, true); b.classList.add('feito'); $('i', b).textContent = '✓';
      /* escolheu do grupo: o grupo sai; acabou tudo, a oferta fecha */
      const bloco = b.closest('.of-bloco'); setTimeout(() => { if (!ofertaEl) return; bloco.remove(); if (!$('.of-bloco', el)) fecharOferta(false); }, 500);
    });
  }
  /* a comida cai na caixa, a caixa fecha, voa para a sacola e a sacola entra no botão Pedido */
  let ultimoClique = null; document.addEventListener('click', (e) => { if (e.clientX || e.clientY) ultimoClique = { x: e.clientX, y: e.clientY }; }, true);
  function embalar(d) {
    const s = d.show && showById(d.show), alvo = $('#orderBtn').getBoundingClientRect(), ini = ultimoClique || { x: innerWidth / 2, y: innerHeight * 0.7 };
    const BW = 124, BH = 88, bx = Math.max(16, Math.min(innerWidth - BW - 16, ini.x - BW / 2)), by = Math.max(150, Math.min(innerHeight - BH - 24, ini.y - BH - 46));
    const bagW = 92, bagH = 112, bagX = Math.max(10, Math.min(innerWidth - bagW - 10, alvo.left + alvo.width / 2 - bagW / 2)), bagY = alvo.bottom + 10;
    const cena = document.createElement('div'); cena.className = 'pk'; cena.setAttribute('aria-hidden', 'true');
    const foto = s ? `background-image:url('${showThumb(s)}')` : `background:radial-gradient(circle at 70% 20%,${d.type.c[0]},${d.type.c[1]})`;
    cena.innerHTML = `<div class="pk-box"><i class="pk-back"></i><span class="pk-food" style="${foto}"></span><i class="pk-front"></i><i class="pk-lid"><b></b></i></div><div class="pk-bag"><svg viewBox="0 0 92 112"><path d="M30 22V12a16 16 0 0 1 32 0v10" fill="none" stroke="#7A5230" stroke-width="4" stroke-linecap="round"/><path d="M6 22h80l5 86a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4z" fill="#C49763"/><path d="M6 22h80l1 12H5z" fill="#A87C4B"/><circle cx="46" cy="70" r="15" fill="#C8321E"/><circle cx="46" cy="70" r="7" fill="#F4EEDF"/></svg></div>`;
    document.body.appendChild(cena);
    const box = $('.pk-box', cena), food = $('.pk-food', cena), lid = $('.pk-lid', cena), bag = $('.pk-bag', cena), selo = $('.pk-lid b', cena);
    gsap.set(box, { x: bx, y: by, scale: 0, transformOrigin: '50% 100%' }); gsap.set(bag, { x: bagX, y: bagY, scale: 0, transformOrigin: '50% 0%' });
    gsap.set(food, { x: ini.x - bx - 48, y: ini.y - by - 48, scale: 0.35 }); gsap.set(lid, { rotationX: -125 }); gsap.set(selo, { scale: 0 });
    const destinoX = bagX + bagW / 2 - BW / 2, destinoY = bagY - 4, botaoX = alvo.left + alvo.width / 2 - bagW / 2, botaoY = alvo.top + alvo.height / 2 - bagH / 2;
    gsap.timeline({ onComplete() { cena.remove(); } })
      .to(box, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, 0)
      .to(food, { x: (BW - 96) / 2, y: -74, scale: 1, duration: 0.36, ease: 'power3.out' }, 0)
      .to(food, { y: 2, scale: 0.8, duration: 0.26, ease: 'power2.in' }, 0.38)
      .to(box, { scaleY: 0.88, scaleX: 1.06, duration: 0.08, ease: 'power1.out' }, 0.62).to(box, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1,.45)' }, 0.7)
      .to(lid, { rotationX: 0, duration: 0.24, ease: 'power2.in' }, 0.72)
      .to(selo, { scale: 1, duration: 0.26, ease: 'back.out(2.4)' }, 0.96)
      .to(bag, { scale: 1, duration: 0.3, ease: 'back.out(1.6)' }, 1.02)
      .to(box, { x: destinoX, duration: 0.6, ease: 'power1.inOut' }, 1.2)
      .to(box, { y: Math.min(by, destinoY) - 60, duration: 0.3, ease: 'power2.out' }, 1.2).to(box, { y: destinoY, duration: 0.3, ease: 'power2.in' }, 1.5)
      .to(box, { scale: 0.42, duration: 0.6, ease: 'power1.in' }, 1.2)
      .set(box, { autoAlpha: 0 }, 1.8)
      .to(bag, { scaleY: 0.86, scaleX: 1.08, duration: 0.08 }, 1.8).to(bag, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(3)' }, 1.88)
      .to(bag, { x: botaoX, y: botaoY, scale: 0.12, autoAlpha: 0.2, duration: 0.34, ease: 'power3.in' }, 2.12)
      .fromTo('#orderCount', { scale: 1 }, { scale: 1.7, duration: 0.12, ease: 'power2.out', immediateRender: false }, 2.42).to('#orderCount', { scale: 1, duration: 0.6, ease: 'elastic.out(1,.4)' }, 2.54);
  }
  const saveAddr = () => { const v = (id) => ($('#' + id) ? $('#' + id).value.trim() : ''); co.name = v('fName'); co.phone = v('fPhone'); if ($('#fAddr')) co.addr = v('fAddr'); };
  drawer_events();
  function drawer_events() {
    const d = $('#drawer');
    d.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.inc) { order[+b.dataset.inc].qty++; paintOrder(); }
      else if (b.dataset.dec) { const o = order[+b.dataset.dec]; o.qty--; if (!o.qty) order.splice(+b.dataset.dec, 1); paintOrder(); }
      else if (b.dataset.mode) { saveAddr(); co.mode = b.dataset.mode; paintOrder(); }
      else if (b.dataset.pay) { co.pay = b.dataset.pay; paintOrder(); }
      else if (b.dataset.ship) { saveAddr(); co.ship = b.dataset.ship; paintOrder(); }
      else if (b.dataset.coupon) { const c = COUPONS.find((x) => x.code === b.dataset.coupon); co.coupon = co.coupon && co.coupon.code === c.code ? null : c; paintOrder(); }
      else if ('back' in b.dataset) { if (co.step === 1) saveAddr(); co.step--; paintOrder(); }
      else if ('next' in b.dataset) {
        if (co.step === 1) { saveAddr(); const miss = !co.name ? 'Informe o nome.' : !co.phone ? 'Informe o telefone.' : co.mode === 'entrega' && !co.addr ? 'Informe o endereço.' : ''; if (miss) { $('#addrE').textContent = miss; return; } if (co.mode === 'entrega' && cepZone() < 0) { $('#cepE').textContent = 'Informe um CEP com 8 números para calcular o frete.'; $('#cepI').focus(); return; } }
        co.step++; paintOrder(); $('#drList').scrollTop = 0;
      }
      else if ('payNow' in b.dataset) { b.disabled = true; b.textContent = 'Processando...'; setTimeout(() => { co.id = String(1000 + Math.floor(Math.random() * 9000)); co.step = 3; paintOrder(); }, reduce ? 0 : 1400); }
      else if ('new' in b.dataset) { order.length = 0; Object.assign(co, { step: 0, coupon: null }); paintOrder(); }
    });
    d.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.target.id === 'couponF') { const code = $('#couponI').value.trim().toUpperCase(), c = COUPONS.find((x) => x.code === code); if (!code) { co.coupon = null; paintOrder(); return; } if (!c) { co.coupon = null; paintOrder(); $('#couponE').textContent = 'Cupom inválido.'; return; } co.coupon = c; paintOrder(); }
      if (e.target.id === 'cepF') { saveAddr(); co.cep = $('#cepI').value.trim(); if (cepZone() < 0) { $('#cepE').textContent = 'O CEP precisa ter 8 números.'; return; } paintOrder(); }
    });
    d.addEventListener('input', (e) => { if (e.target.id === 'cepI') { const n = e.target.value.replace(/\D/g, '').slice(0, 8); e.target.value = n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n; } });
  }
  const drawer = $('#drawer'), scrim = $('#scrim'); let lastFocus = null;
  const showDrawer = (on) => { if (on) paintOrder(); drawer.classList.toggle('on', on); scrim.classList.toggle('on', on); drawer.setAttribute('aria-hidden', !on); drawer.inert = !on; if (on) { lastFocus = document.activeElement; $('#drClose').focus(); } else if (lastFocus) lastFocus.focus({ preventScroll: true }); };
  addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharOferta(true); });
  $('#orderBtn').addEventListener('click', () => { fecharOferta(false); showDrawer(true); }); $('#drClose').addEventListener('click', () => showDrawer(false)); scrim.addEventListener('click', () => showDrawer(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('on')) showDrawer(false); });

  /* ---------- laço ---------- */
  let stageVisible = true; new IntersectionObserver((e) => { stageVisible = e[0].isIntersecting; }).observe(stage);
  const topEl = $('#top'), island = $('#island');
  /* clique em link ou botão pode pular para outra parte da página: esse pulo nunca é segurado */
  let holdDesde = 0, holdFree = 0, naMontagem = false; const raizEl = document.documentElement;
  document.addEventListener('click', (e) => { const alvo = e.target.closest && e.target.closest('a,button'); if (alvo && !alvo.matches('#pSee') && !(alvo.tagName === 'BUTTON' && alvo.closest('#stage'))) { holdFree = performance.now() + 1800; raizEl.classList.remove('montando'); } }, true);
  gsap.ticker.add((t) => {
    const { top, h } = sectionRange(); target = clamp((scrollY - top) / h);
    const show = SHOWS[cur]; let alvo = target;
    /* a montagem espera a peça carregar: nenhum ingrediente aparece sem cair */
    if (show.recipe) { const pronta = stepsReady(); if (pronta < layers.length) alvo = Math.min(target, pronta / (show.steps.length + 0.5)); }
    /* um pulo para cima (link, botão ou rolagem muito rápida) leva direto àquele ponto, sem desmontar a comida na frente do cliente */
    if (show.recipe && p - target > 0.15) p = target;
    let nextP = p + (alvo - p) * (reduce ? 1 : 0.1);
    /* cada etapa leva um tempo mínimo: mesmo rolando rápido, todo ingrediente cai de verdade */
    if (!reduce && show.recipe) { const total = show.steps.length + 0.5, behind = (alvo - p) * total, perStep = behind > 3 ? 0.42 : 0.9, lim = (gsap.ticker.deltaRatio(60) / 60) / (perStep * total); if (nextP - p > lim) nextP = p + lim; }
    p = nextP; if (Math.abs(alvo - p) < 0.0002) p = alvo;
    /* a página segue assim que a última peça pousa. Só uma imagem que não carrega por 15 segundos solta antes, para não prender o cliente */
    /* enquanto monta, o que vem depois da cena sai do layout: a página termina no fim da montagem e nenhuma rolagem passa dali */
    let segurar = false;
    if (!reduce && show.recipe && open < 0 && !drawer.classList.contains('on')) {
      const fim = top + h, n0 = show.steps.length, pronto = (n0 - 0.18) / (n0 + 0.5), agora = performance.now(), liberada = p >= pronto, parada = stepsReady() < layers.length;
      if (parada && scrollY >= fim - 1) { if (!holdDesde) holdDesde = agora; if (agora - holdDesde > 15000) { holdFree = agora + 8000; holdDesde = 0; } } else holdDesde = 0;
      segurar = !liberada && agora >= holdFree && naMontagem;
      naMontagem = scrollY >= top - 1 && scrollY <= fim + 1;
    } else naMontagem = false;
    raizEl.classList.toggle('montando', segurar);
    if (stageVisible) { renderScene(); drawFx(); drawFizz(); }
    updateWave(t);
    const past = scrollY > top + h + innerHeight * 0.2, end = innerHeight + scrollY > document.documentElement.scrollHeight - 90;
    island.classList.toggle('on', past && !end && open < 0 && !drawer.classList.contains('on')); topEl.classList.toggle('on-cream', scrollY > top + h + innerHeight * 0.92); topEl.classList.toggle('in-list', !menuSec.hidden);
  });

  /* ---------- início ---------- */
  /* ao recarregar sozinho, volta para o prato que estava aberto */
  try { const salvo = SHOWS.findIndex((s) => s.id === sessionStorage.getItem('sm_show')); if (salvo > 0) cur = salvo; } catch (e) { /* sem armazenamento */ }
  setVars(SHOWS[cur].colors); buildShots(SHOWS[cur]); refreshPick(); setIsland(DISHES.find((d) => d.show === SHOWS[cur].id));
  /* em localhost, a página se atualiza sozinha quando chegam fotos ou código novos (menos com pedido em andamento) */
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    let assinatura = null; const arquivos = ['index.html', 'js/data.js', 'js/pieces.js', 'js/recipes-built.js', 'js/ingredients.js', 'js/app.js', 'css/style.css'];
    const conferir = async () => { try { const textos = await Promise.all(arquivos.map((a) => fetch(a, { cache: 'no-store' }).then((r) => r.text()))); const nova = textos.map((t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h; }).join(); if (assinatura && nova !== assinatura) { if (order.length || open >= 0 || busy) return; try { sessionStorage.setItem('sm_show', SHOWS[cur].id); } catch (e) { /* sem armazenamento */ } location.reload(); return; } assinatura = nova; } catch (e) { /* servidor reiniciando */ } };
    conferir(); setInterval(conferir, 20000);
  } renderChips(); renderBento(); paintOrder();
  const first = SHOWS[0], urls = [...new Set([...(first.frames || []).flatMap((n) => [`assets/frames/${n}.jpg`, `assets/frames/${n}-peca.png`]), ...typeGroups.map((g) => showThumb(SHOWS[g.first])), sceneUrl(window.SM.BOARD.img)])]; /* só o primeiro prato e as bolhas: o resto carrega quando for aberto */ let done = 0; const plate = $('.ld-plate'), ldn = $('#ldn');
  const finish = () => {
    const tl = gsap.timeline();
    tl.to('#loader', { opacity: 0, duration: reduce ? 0 : 0.5, onComplete() { const el = $('#loader'); if (el) el.remove(); } });
    if (!reduce) tl.from('.window', { clipPath: 'circle(0% at 60% 52%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0.1).from('.top', { y: -24, opacity: 0, duration: 0.6 }, 0.3).from('.title .ln', { y: 50, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.45).from('.kick,.text,.soda,.steps', { y: 20, opacity: 0, stagger: 0.07, duration: 0.5 }, 0.65);
  };
  const tick = () => { done++; const f = Math.round((done / urls.length) * 100); plate.style.setProperty('--f', f); ldn.textContent = f; if (done === urls.length) finish(); };
  urls.forEach((u) => { const i = new Image(); i.onload = i.onerror = tick; i.src = u; });
})();
