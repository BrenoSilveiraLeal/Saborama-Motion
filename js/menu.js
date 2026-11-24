/* Saborama Motion · cardápio da hamburgueria.
   O data.js guarda o catálogo completo (27 tipos); aqui escolhemos só o que uma hamburgueria serve, em 5 seções.
   Cada item: [nome no cardápio, descrição, preço, id da montagem, etiqueta]. As montagens vêm de ingredients.js. */
(function () {
  const S = window.SM, todos = S.TYPES;
  /* pega um prato do catálogo completo, com outro nome se precisar */
  const pega = (tipo, nome, etiqueta, novo) => { const t = todos.find((x) => x.id === tipo), it = t && t.items.find((i) => i[0] === nome); return it ? [novo || nome, it[1], it[2], it[3], etiqueta] : null; };
  const secao = (id, name, min, c, ink, acc, word, items) => ({ id, name, min, c, ink, acc, word, items: items.filter(Boolean) });

  /* mini pizza: a montagem da pizza de mussarela, em tamanho de entrada */
  const base = S.SHOWS.find((s) => s.id === 'pizza-mussarela');
  if (base && !S.SHOWS.some((s) => s.id === 'mini-pizza')) S.SHOWS.push({ ...base, id: 'mini-pizza', name: 'Mini Pizza', price: 19.9, done: { ...base.done, t1: 'Mini', t2: 'pizza', text: 'Do tamanho certo para abrir a fome, na entrada.' } });

  S.TYPES = [
    secao('lanches', 'Lanches', 12, ['#F2A81D', '#B5760D'], '#1F1004', '#C8321E', 'Smash', [
      pega('burger', 'Smash Clássico', 'O mais pedido'),
      pega('burger', 'Bacon Smoke', 'Defumado'),
      pega('burger', 'Duplo Cheddar', 'Queijo em dobro'),
      pega('burger', 'Egg Burger', 'Gema mole'),
      pega('burger', 'Salada Burger', 'Mais leve'),
      pega('burger', 'Triplo Monstro', 'Pra fome grande'),
      pega('burger', 'Onion Crunch', 'Bem crocante'),
      pega('burger', 'Chicken Crispy', 'Frango empanado'),
      pega('burger', 'Veggie de Grão-de-Bico', 'Vegetariano'),
    ]),
    secao('entradas', 'Entradas e Frituras', 10, ['#D93A22', '#8E1E0C'], '#FFF4DC', '#FFC93C', 'Crocante', [
      pega('fritas', 'Frita Clássica', 'Pra dividir', 'Batata Frita'),
      pega('fritas', 'Cheddar e Bacon', 'Cheddar cremoso', 'Fritas Cheddar e Bacon'),
      pega('fritas', 'Anéis de Cebola', 'Empanados na hora'),
      pega('nuggets', 'Nuggets Clássicos 6 un', 'Com molho', 'Nuggets 6 un'),
      ['Mini Pizza', 'Massa fina, molho de tomate e mussarela.', 19.9, 'mini-pizza', 'Nova'],
      pega('fritas', 'Palitos de Mussarela', 'Puxa-puxa'),
      pega('nuggets', 'Asinhas Barbecue', 'Pra dividir'),
      pega('fritas', 'Rústica com Alecrim', 'Com casca', 'Batata Rústica'),
    ]),
    secao('pizzas', 'Pizzas', 18, ['#3E8E41', '#1F5222'], '#FFF4DC', '#FFC93C', 'Forno', [
      pega('pizza', 'Calabresa Defumada', 'A clássica'),
      pega('pizza', 'Mussarela', 'Só queijo'),
      pega('pizza', 'Margherita', 'Manjericão fresco'),
      pega('pizza', 'Pepperoni', 'Apimentada'),
      pega('pizza', 'Quatro Queijos', 'Bem cremosa'),
      pega('pizza', 'Frango com Requeijão', 'Favorita da casa'),
      pega('pizza', 'Portuguesa', 'Completa'),
      pega('pizza', 'Chocolate com Morango', 'Doce'),
    ]),
    secao('bebidas', 'Bebidas', 3, ['#2F8FD6', '#114E86'], '#FFF4DC', '#FFC93C', 'Gelado', [
      pega('bebidas', 'Coca-Cola', 'Bem gelada'),
      pega('bebidas', 'Coca-Cola Zero', 'Sem açúcar'),
      pega('bebidas', 'Guaraná Antarctica', 'Brasileiro'),
      pega('bebidas', 'Fanta Laranja', 'Laranja'),
      pega('sucos', 'Limonada Suíça', 'Batida na hora'),
      pega('sucos', 'Laranja Espremida', 'Natural', 'Suco de Laranja'),
      pega('drinks', 'Chope Gelado', 'Colarinho cremoso'),
      pega('bebidas', 'Água sem Gás', 'Leve'),
    ]),
    secao('sobremesas', 'Sobremesas e Sorvetes', 8, ['#1A0F08', '#000000'], '#FFF4DC', '#FFC93C', 'Doce', [
      pega('doces', 'Petit Gâteau', 'Sai quentinho'),
      pega('doces', 'Brownie com Sorvete', 'Pra dividir'),
      pega('acai', 'Sundae de Chocolate', 'Calda quente'),
      pega('acai', 'Casquinha Dupla', 'Duas bolas'),
      pega('acai', 'Banana Split', 'Três sabores'),
      pega('shakes', 'Morango', 'Batido na hora', 'Milkshake de Morango'),
      pega('shakes', 'Chocolate Belga', 'Bem cremoso', 'Milkshake de Chocolate'),
      pega('doces', 'Churros', 'Doce de leite'),
    ]),
  ];
})();
