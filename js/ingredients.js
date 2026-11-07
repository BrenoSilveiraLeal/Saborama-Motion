/* Saborama Motion · pratos montados com ingredientes que caem.
   Cada sabor é só uma lista de ingredientes: a animação nasce sozinha dessa lista.
   ar = largura/altura do recorte · w = largura relativa · t = quanto a pilha sobe · dy = ajuste para baixo */
(function () {
  const S = window.SM;
  const ING = (S.ING = {
    'bun-bottom': { ar: 1000 / 574, w: 1, t: 0.17, kick: 'A base', t1: 'O pão', t2: 'tostado', text: 'Brioche cortado ao meio e dourado na manteiga, com o lado crocante para cima.', fx: 'steam' },
    lettuce: { ar: 1000 / 543, w: 1.1, t: 0.08, dy: 0.02, kick: 'Alface', t1: 'A alface', t2: 'cai', text: 'Folha fresca e bem crespa, que segura o calor da carne longe do pão.', fx: 'drops' },
    tomato: { ar: 1000 / 542, w: 0.98, t: 0.08, dy: 0.01, kick: 'Tomate', t1: 'O tomate', t2: 'desce', text: 'Duas rodelas grossas, cortadas na hora.', fx: 'drops' },
    onion: { ar: 1000 / 539, w: 0.9, t: 0.06, dy: 0.01, kick: 'Cebola', t1: 'A cebola', t2: 'roxa', text: 'Anéis finos, para dar crocância e um toque ácido.', fx: 'drops' },
    pickles: { ar: 1000 / 327, w: 0.9, t: 0.06, dy: 0.01, kick: 'Picles', t1: 'Os', t2: 'picles', text: 'Cinco rodelas curtidas na casa cortam a gordura em cada mordida.', fx: 'drops' },
    patty: { ar: 1000 / 592, w: 1, t: 0.15, dy: 0.02, kick: 'A carne', t1: 'A carne', t2: 'chega', text: 'Blend moído na hora, selado na chapa até formar uma crosta escura e suculenta.', fx: 'smoke' },
    cheddar: { ar: 1000 / 477, w: 1.03, t: 0.03, dy: 0.1, kick: 'O queijo', t1: 'O cheddar', t2: 'derrete', text: 'A fatia pousa sobre a carne quente e escorre pelas bordas.', fx: 'steam' },
    bacon: { ar: 1000 / 552, w: 1, t: 0.08, dy: 0.04, kick: 'Bacon', t1: 'O bacon', t2: 'estala', text: 'Três tiras crocantes, ainda quentes da chapa.', fx: 'smoke' },
    egg: { ar: 999 / 541, w: 1.02, t: 0.07, dy: 0.04, kick: 'O ovo', t1: 'O ovo', t2: 'pousa', text: 'Clara com a borda rendada e gema mole, pronta para escorrer.', fx: 'steam' },
    'bun-top': { ar: 1000 / 719, w: 1.02, t: 0.4, dy: 0.03, kick: 'A tampa', t1: 'Fecha com', t2: 'brioche', text: 'O pão com gergelim desce por último e fecha tudo.', fx: 'steam' },
  });

  /* posição exata de cada peça na foto da etapa (fração da imagem), gerada por extrair-pecas.ps1 */
  S.PIECES = {
    'smash-1': { x: 0.4779, y: 0.5069, w: 0.3439, h: 0.2136 }, 'smash-2': { x: 0.4713, y: 0.4655, w: 0.3487, h: 0.1838 }, 'smash-3': { x: 0.5048, y: 0.4261, w: 0.2787, h: 0.1828 }, 'smash-4': { x: 0.4952, y: 0.3369, w: 0.2925, h: 0.2412 },
    'smash-5': { x: 0.4964, y: 0.3401, w: 0.2883, h: 0.2147 }, 'smash-6': { x: 0.5544, y: 0.3177, w: 0.1794, h: 0.102 }, 'smash-7': { x: 0.57, y: 0.2986, w: 0.1453, h: 0.0988 }, 'smash-8': { x: 0.5084, y: 0.1637, w: 0.2883, h: 0.187 },
  };
  S.BOARD = { img: 'cena-vazia', x: 0.665, y: 0.735, w: 0.585 }; /* centro e largura da tábua no cenário, em fração da foto */
  /* fotos reais de cada etapa, por sabor: as etapas iguais são reaproveitadas */
  const FRAMES = {
    'smash-classico': ['smash-1', 'smash-2', 'smash-3', 'smash-4', 'smash-5', 'smash-6', 'smash-7', 'smash-8'],
    'duplo-cheddar': ['smash-1', 'duplo-2', 'duplo-3', 'duplo-4', 'duplo-5', 'duplo-6'],
    'triplo-monstro': ['smash-1', 'duplo-2', 'duplo-3', 'duplo-4', 'duplo-5', 'triplo-6', 'triplo-7', 'triplo-8'],
    'bacon-smoke': ['smash-1', 'duplo-2', 'duplo-3', 'bacon-4', 'bacon-5', 'bacon-6'],
    'egg-burger': ['smash-1', 'smash-2', 'egg-3', 'egg-4', 'egg-5', 'egg-6'],
    'salada-burger': ['smash-1', 'smash-2', 'smash-3', 'salada-4', 'salada-5', 'salada-6', 'salada-7'],
    'cheese-salada-duplo': ['smash-1', 'smash-2', 'smash-3', 'smash-4', 'smash-5', 'csd-6', 'csd-7', 'csd-8', 'csd-9'],
  };
  S.PIECES = window.SM_PIECES || S.PIECES;
  const AMBER = { page: '#F2A81D', ink: '#1F1004', soft: 'rgba(31,16,4,.74)', accent: '#C8321E' };
  const BURGERS = [
    ['Smash Clássico', 'smash-classico', ['bun-bottom', 'lettuce', 'tomato', 'patty', 'cheddar', 'pickles', 'onion', 'bun-top'], 'patty', AMBER],
    ['Duplo Cheddar', 'duplo-cheddar', ['bun-bottom', 'patty', 'cheddar', 'patty', 'cheddar', 'bun-top'], 'cheddar', { page: '#F7B500', ink: '#1F1004', soft: 'rgba(31,16,4,.74)', accent: '#B8320A' }],
    ['Triplo Monstro', 'triplo-monstro', ['bun-bottom', 'patty', 'cheddar', 'patty', 'cheddar', 'patty', 'cheddar', 'bun-top'], 'bun-top', { page: '#D9601A', ink: '#FFF4DC', soft: 'rgba(255,244,220,.84)', accent: '#FFC93C' }],
    ['Bacon Smoke', 'bacon-smoke', ['bun-bottom', 'patty', 'cheddar', 'bacon', 'onion', 'bun-top'], 'bacon', { page: '#A8321C', ink: '#FFF4DC', soft: 'rgba(255,244,220,.84)', accent: '#FFB23C' }],
    ['Egg Burger', 'egg-burger', ['bun-bottom', 'lettuce', 'patty', 'cheddar', 'egg', 'bun-top'], 'egg', { page: '#FFD23C', ink: '#1F1004', soft: 'rgba(31,16,4,.74)', accent: '#D9601A' }],
    ['Salada Burger', 'salada-burger', ['bun-bottom', 'lettuce', 'tomato', 'onion', 'patty', 'cheddar', 'bun-top'], 'lettuce', { page: '#5FA82B', ink: '#10210A', soft: 'rgba(16,33,10,.78)', accent: '#C8321E' }],
    ['Cheese Salada Duplo', 'cheese-salada-duplo', ['bun-bottom', 'lettuce', 'tomato', 'patty', 'cheddar', 'patty', 'cheddar', 'onion', 'bun-top'], 'tomato', { page: '#D93A22', ink: '#FFF4DC', soft: 'rgba(255,244,220,.84)', accent: '#FFC93C' }],
  ];
  const type = S.TYPES.find((t) => t.id === 'burger');
  /* a primeira cena (foto) dá lugar à montagem; a pizza segue em fotos até ganhar ingredientes */
  S.SHOWS = S.SHOWS.filter((s) => s.id !== 'smash-classico');
  const built = BURGERS.map(([name, id, recipe, thumb, colors]) => {
    const item = type.items.find((i) => i[0] === name); item[3] = id;
    const n = recipe.length, used = {};
    const steps = recipe.map((k, i) => {
      const g = ING[k]; used[k] = (used[k] || 0) + 1;
      const again = used[k] > 1, last = i === n - 1;
      return { ing: k, kick: `Passo ${i + 1} de ${n} · ${g.kick}`, t1: last ? name.split(' ')[0] : again ? 'Mais' : g.t1, t2: last ? name.split(' ').slice(1).join(' ') || 'pronto' : again ? g.kick.replace(/^[AO] /, '').toLowerCase() : g.t2, text: last ? `${g.text} Sai direto para a mesa.` : again ? 'Outra camada, para ficar ainda mais alto.' : g.text, stat: [i + 1, `de ${n}`], fx: g.fx };
    });
    return { id, type: 'burger', name, price: item[2], colors, recipe, thumb, hero: id, frames: FRAMES[id], steps };
  });
  S.SHOWS = [...built, ...S.SHOWS];

  /* sabores gerados a partir de receitas.txt: entram sozinhos assim que as fotos ficam prontas */
  const dark = (hex) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return 0.299 * r + 0.587 * g + 0.114 * b < 150; };
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  /* divide o nome em duas linhas de tamanho parecido */
  const balanceCut = (w) => { let best = 1, bestLen = Infinity; for (let i = 1; i < Math.max(2, w.length); i++) { const m = Math.max(w.slice(0, i).join(' ').length, w.slice(i).join(' ').length); if (m < bestLen) { bestLen = m; best = i; } } return best; };
  /* nome que o cliente lê em cada passo, quando a chave da receita é só um código interno */
  const ROTULO = { 'donuts na tábua': 'donuts', 'brigadeiros na tábua': 'brigadeiros', 'torradas no prato': 'torradas', 'mocha sem creme': 'mocha', 'brûlée no prato': 'crème brûlée', 'shake morango': 'milkshake', 'shake chocolate': 'milkshake', 'shake baunilha': 'milkshake', 'shake cookies': 'milkshake', 'shake doce': 'milkshake', 'shake avelã': 'milkshake', 'shake café': 'milkshake', 'shake maracujá': 'milkshake', 'shake caramelo': 'milkshake', 'shake pistache': 'milkshake', 'morango fresco': 'morango', 'calda quente': 'calda', 'raspas': 'raspas de chocolate', 'farelo de cookies': 'cookies', 'calda de doce': 'doce de leite', 'calda de avelã': 'calda de avelã', 'grãos de café': 'café', 'pistache picado': 'pistache', 'fatia inteira': 'queijo', 'fatia de cheddar': 'cheddar', 'fatia comprida': 'queijo', 'fatia de mussarela': 'mussarela', 'presunto dobrado': 'presunto', 'tofu glaceado': 'tofu', 'cebolinha do poke': 'cebolinha', 'frango espalhado': 'frango', 'queijo espalhado': 'queijo', 'quesadilla pronta': 'na chapa', 'tomate em rodelas': 'tomate', 'pão de forma menor': 'pão de forma', 'fatia igual': 'fatia de cima', 'fatia de queijo': 'queijo', 'panqueca lisa': 'panqueca', 'orégano verde': 'orégano', 'linguiça ao lado': 'linguiça', 'atum em lascas': 'atum', 'carne desfiada': 'carne seca', 'cebola em anéis': 'cebola', 'banana em rodelas': 'banana', 'canela leve': 'canela', 'macarrão claro': 'macarrão', ppres: 'presunto', cebolab: 'cebola', tomatef: 'tomate', parm: 'parmesão', bufalap: 'muçarela de búfala', gorg: 'gorgonzola', atums: 'atum', bacons: 'bacon', palmitos: 'palmito', brocolisp: 'brócolis', pimentao: 'pimentão', cogumelosp: 'cogumelos', parmas: 'presunto de parma', ruculap: 'rúcula', abacaxip: 'abacaxi', carnes: 'carne seca', queijob: 'queijo branco', goiabadas: 'goiabada', bananas: 'banana', 'massa doce': 'chocolate', assada: 'forno', a300: 'açaí', a500: 'açaí', pacoca: 'paçoca', leite: 'leite em pó', tartaro: 'molho tártaro', 'burger:trufa': 'maionese trufada', ervas: 'maionese de ervas', 'burger:picante': 'molho picante', grão: 'hambúrguer de grão-de-bico', jack: 'queijo pepper jack', suíço: 'queijo suíço', peixe: 'peixe', filé: 'filé', sugo: 'molho sugo', palito: 'batata frita', grande: 'batata frita', potes: 'molhos', rústica: 'batata rústica', 'fritas:doce': 'batata-doce', canoa: 'batata canoa', 'fritas:waffle': 'batata waffle', sorriso: 'batata sorriso', seis: 'nuggets', doze: 'nuggets', vinte: 'nuggets', veganos: 'nuggets veganos', tiras: 'tiras de frango', coxinha: 'coxinha', balde: 'frango frito', c20: 'combinado', c40: 'combinado', sashimi: 'sashimi', nsalmão: 'nigiri de salmão', natum: 'nigiri de atum', ncamarão: 'nigiri de camarão', hsalmão: 'hossomaki', hpepino: 'hossomaki', filadélfia: 'uramaki', califórnia: 'uramaki', skin: 'uramaki', hot: 'hot roll', hotcamarão: 'hot roll', tsalmão: 'temaki', tatum: 'temaki', thot: 'temaki', joe: 'joe', gunkan: 'gunkan', ardósia: 'tábua de ardósia', pure: 'purê', codorna: 'ovos de codorna', palha: 'batata palha', ecarne: 'esfiha', equeijo: 'esfiha', pãoqueijo: 'pão de queijo', pcarne: 'pastel', pqueijo: 'pastel', pcamarão: 'pastel', arroz: 'arroz', wrap: 'wrap', 'wrap frango': 'enrolar', 'wrap carne': 'enrolar', burrito: 'enrolar', enrolado: 'enrolar', quesadilla: 'dobrar', dobrada: 'dobrar', gratinado: 'gratinar', guaca: 'guacamole', chips: 'nachos', 'pistache um': 'pistache', 'pistache dois': 'pistache', 'caldo claro': 'caldo', 'hot rolls no barco': 'hot rolls', 'sashimis no barco': 'sashimi', 'nigiris no barco': 'nigiris', 'uramakis no barco': 'uramakis', vaporeira: 'cesto de bambu' };
  (window.SM_BUILT || []).forEach((b) => {
    const t = S.TYPES.find((x) => x.id === b.type), item = t && t.items.find((i) => i[0] === b.name); if (!item) return;
    const id = `${b.type}-${slug(b.name)}`, n = b.steps.length, page = t.c[0], light = dark(page);
    const steps = b.steps.map((k, i) => { const last = i === n - 1, words = last ? b.name.split(' ') : ['Agora:', ROTULO[`${b.type}:${k}`] || ROTULO[k] || k], cut = balanceCut(words); return { frame: b.frames[i], kick: `Passo ${i + 1} de ${n}`, t1: words.slice(0, cut).join(' '), t2: words.slice(cut).join(' '), text: last ? item[1] : 'Feito na hora, camada por camada.', stat: [i + 1, `de ${n}`], fx: 'steam' }; });
    item[3] = id;
    S.SHOWS.push({ id, type: b.type, name: b.name, price: item[2], colors: { page, ink: light ? '#FFF4DC' : '#1F1004', soft: light ? 'rgba(255,244,220,.84)' : 'rgba(31,16,4,.74)', accent: light ? '#FFC93C' : '#C8321E' }, recipe: b.frames, thumb: b.frames[n - 1], heroUrl: `assets/frames/${b.frames[n - 1]}.jpg`, frames: b.frames, pours: b.pours, fills: b.fills, stepKeys: b.steps, steps });
  });
  /* a Calabresa em fotos antigas sai quando a nova montagem ficar pronta */
  if (S.SHOWS.some((s) => s.id === 'pizza-calabresa-defumada')) S.SHOWS = S.SHOWS.filter((s) => s.id !== 'pizza-calabresa');
})();
