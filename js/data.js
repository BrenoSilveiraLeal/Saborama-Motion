/* Saborama Motion · dados do cardápio.
   Cada linha de um tipo: Nome | Descrição | Preço | id da cena (opcional). Preços e tempos são de demonstração. */
(function () {
  const parse = (txt) => txt.trim().split('\n').map((l) => { const [n, d, p, s] = l.split('|').map((x) => x.trim()); return [n, d, parseFloat(p), s || undefined]; });
  const T = (id, name, min, c, txt, img) => ({ id, name, min, c, img, items: parse(txt) });

  window.SM = {
    whatsapp: '5511999999999',
    /* frete simulado por CEP: base + distância; grátis a partir de freeFrom */
    shipping: { base: 5.9, perZone: 1.6, express: 6.9, freeFrom: 120 },
    /* cupons de demonstração: pct = porcentagem, fix = valor fixo, ship = frete grátis */
    coupons: [
      { code: 'SABORAMA10', kind: 'pct', value: 0.1, label: '10% de desconto' },
      { code: 'BEMVINDO15', kind: 'pct', value: 0.15, min: 60, label: '15% acima de R$ 60' },
      { code: 'MENOS20', kind: 'fix', value: 20, min: 100, label: 'R$ 20 acima de R$ 100' },
      { code: 'FRETEGRATIS', kind: 'ship', label: 'Frete grátis' },
    ],

    /* Pratos com cena. kb = movimento lento da foto: [zoom inicial, zoom final, x%, y% inicial, x%, y% final] */
    SHOWS: [
      {
        id: 'smash-classico', type: 'burger', name: 'Smash Clássico', price: 32.9,
        colors: { page: '#F2A81D', ink: '#1F1004', soft: 'rgba(31,16,4,.74)', accent: '#C8321E' },
        steps: [
          { img: 'burger-1', kick: 'Passo 1 · Na chapa', t1: 'Bate', t2: 'na chapa', text: 'A carne moída na hora encontra o aço quente e é prensada de uma vez. A borda fica rendada e crocante.', stat: [230, '°C'], fx: 'smoke', kb: [1.14, 1.02, 2, 2, -2, -1] },
          { img: 'burger-2', kick: 'Passo 2 · O queijo', t1: 'O cheddar', t2: 'derrete', text: 'A fatia cai sobre a carne ainda chiando e escorre pelas bordas sem pressa.', stat: [45, 'seg'], fx: 'steam', kb: [1.03, 1.14, -2, 0, 1, -2] },
          { img: 'burger-3', kick: 'Passo 3 · A montagem', t1: 'Tudo', t2: 'vai caindo', text: 'Alface, tomate e picles caem sobre o pão tostado, cada um no seu lugar.', stat: [6, 'camadas'], fx: 'drops', kb: [1.12, 1.03, 0, 4, 0, -3] },
          { img: 'burger-4', kick: 'Passo 4 · O fechamento', t1: 'Fecha com', t2: 'brioche', text: 'O pão com gergelim desce devagar sobre a carne e o queijo derretido.', stat: [90, 'seg'], fx: 'steam', kb: [1.04, 1.14, 0, -4, 1, 3] },
          { img: 'burger-5', kick: 'Passo 5 · Pronto', t1: 'Smash', t2: 'Clássico', text: 'Sai direto para a mesa, ainda soltando vapor.', stat: [12, 'min'], fx: 'steam', kb: [1.12, 1.01, 2, 1, 0, 0] },
        ],
      },
      {
        id: 'pizza-calabresa', type: 'pizza', name: 'Calabresa Defumada', price: 54.9,
        colors: { page: '#C4301C', ink: '#FFF4DC', soft: 'rgba(255,244,220,.82)', accent: '#FFC93C' },
        steps: [
          { img: 'pizza-1', kick: 'Passo 1 · A massa', t1: 'A massa', t2: 'se abre', text: 'As mãos esticam o disco devagar, com farinha no ar e sem rolo, para preservar as bolhas.', stat: [48, 'h de fermentação'], fx: 'flour', kb: [1.14, 1.02, 2, 1, -2, -1] },
          { img: 'pizza-2', kick: 'Passo 2 · O molho', t1: 'O molho', t2: 'gira', text: 'Tomate em espiral, do centro para a borda, com a concha encostando de leve.', stat: [120, 'g'], fx: 'flour', kb: [1.03, 1.13, 0, -2, 1, 2] },
          { img: 'pizza-3', kick: 'Passo 3 · A cobertura', t1: 'A calabresa', t2: 'cai', text: 'Calabresa defumada, cebola roxa e mussarela chovem sobre o disco.', stat: [5, 'ingredientes'], fx: 'drops', kb: [1.12, 1.03, 0, 4, 0, -3] },
          { img: 'pizza-4', kick: 'Passo 4 · O forno', t1: 'Entra', t2: 'na lenha', text: 'A pá entra na boca do forno. Em segundos, a borda infla e o queijo borbulha.', stat: [420, '°C'], fx: 'embers', kb: [1.04, 1.15, -2, 0, 2, -2] },
          { img: 'pizza-5', kick: 'Passo 5 · Pronta', t1: 'A fatia', t2: 'estica', text: 'A primeira fatia sobe puxando o queijo em fios longos.', stat: [18, 'min'], fx: 'steam', kb: [1.12, 1.01, 2, 1, 0, 0] },
        ],
      },
    ],

    TYPES: [
      T('burger', 'Hambúrgueres', 12, ['#E8930F', '#9C4F0A'], `
Smash Clássico | Pão brioche, carne, cheddar, alface, tomate e picles. | 32.9 | smash-classico
Duplo Cheddar | Duas carnes prensadas e cheddar em dobro. | 39.9
Triplo Monstro | Três carnes, três queijos e molho da casa. | 49.9
Bacon Smoke | Bacon defumado e cebola caramelizada. | 42.9
Egg Burger | Ovo com gema mole e queijo prato. | 36.9
Salada Burger | Carne, queijo, alface, tomate e cebola roxa. | 33.9
Cheese Salada Duplo | Duas carnes, dois queijos e salada fresca. | 41.9
Onion Crunch | Anéis de cebola crocantes e ketchup. | 41.9
Barbecue Texano | Costela desfiada e molho barbecue. | 46.9
Blue Cheese | Gorgonzola, rúcula e cebola caramelizada. | 44.9
Trufado | Cogumelos, queijo suíço e maionese trufada. | 48.9
Picanha na Brasa | Blend de picanha e vinagrete. | 52.9
Costela 12 Horas | Costela assada lentamente e provolone. | 54.9
Jalapeño Fire | Pimenta jalapeño, pepper jack e molho picante. | 40.9
Abacaxi Havaiano | Abacaxi grelhado, presunto e queijo. | 39.9
Chicken Crispy | Frango empanado e maionese de limão. | 34.9
Chicken Parmegiana | Frango empanado, molho de tomate e mussarela. | 38.9
Fish Burger | Peixe empanado e molho tártaro. | 37.9
Veggie de Grão-de-Bico | Hambúrguer vegetal e abacate. | 35.9
Vegano de Cogumelos | Pão vegano, cogumelos e maionese de ervas. | 38.9
`, 'burger-5'),
      T('pizza', 'Pizzas', 18, ['#D93A22', '#7E170C'], `
Calabresa Defumada | Calabresa, cebola roxa e mussarela. | 54.9 | pizza-calabresa
Mussarela | Só queijo, molho de tomate e orégano. | 46.9
Margherita | Tomate, mussarela de búfala e manjericão. | 52.9
Portuguesa | Presunto, ovo, cebola e azeitona. | 58.9
Quatro Queijos | Mussarela, gorgonzola, parmesão e requeijão. | 62.9
Cinco Queijos | Os quatro clássicos e provolone defumado. | 66.9
Frango com Requeijão | Frango desfiado e requeijão cremoso. | 56.9
Pepperoni | Pepperoni crocante nas bordas. | 59.9
Napolitana | Tomate fresco, parmesão e manjericão. | 53.9
Atum com Cebola | Atum, cebola e azeitona preta. | 57.9
Bacon com Milho | Bacon crocante e milho. | 55.9
Palmito | Palmito, requeijão e azeitona. | 58.9
Vegetariana | Brócolis, pimentão, cogumelos e cebola. | 54.9
Rúcula com Parma | Presunto cru, rúcula e lascas de parmesão. | 69.9
Cogumelos Trufados | Cogumelos, azeite trufado e mussarela. | 72.9
Havaiana | Presunto e abacaxi grelhado. | 56.9
Carne Seca | Carne seca desfiada, cebola e requeijão. | 67.9
Lombo com Requeijão | Lombo canadense e requeijão. | 59.9
Brócolis com Bacon | Brócolis, bacon e alho frito. | 58.9
Chocolate com Morango | Pizza doce com morangos frescos. | 54.9
Banana com Canela | Banana, canela, açúcar e leite condensado. | 49.9
Romeu e Julieta | Queijo e goiabada derretida. | 49.9
`, 'pizza-5'),
      T('fritas', 'Batatas e Porções', 10, ['#EDB21C', '#B5760D'], `
Frita Clássica | Palito fino, sal da casa e maionese. | 18.9
Frita Grande | Porção para dividir, com dois molhos. | 28.9
Cheddar e Bacon | Cheddar cremoso e bacon crocante. | 27.9
Trufada com Parmesão | Azeite trufado e parmesão ralado. | 32.9
Rústica com Alecrim | Com casca, alho e alecrim. | 24.9
Batata-Doce | Páprica defumada e molho de iogurte. | 23.9
Batata Canoa | Gomos grossos e temperados. | 25.9
Batata Waffle | Fatias em grade, bem crocantes. | 26.9
Batata Sorriso | Carinhas crocantes, para as crianças. | 21.9
Mandioca Frita | Macia por dentro, com maionese verde. | 24.9
Polenta Frita | Palitos crocantes e parmesão. | 22.9
Anéis de Cebola | Empanados na cerveja. | 22.9
Palitos de Mussarela | Queijo puxando, com molho de tomate. | 29.9
Dadinho de Tapioca | Com geleia de pimenta. | 27.9
Bolinho de Bacalhau | Seis unidades com limão. | 36.9
Isca de Peixe | Empanada, com molho tártaro. | 39.9
Porção de Linguiça | Acebolada, com pão. | 38.9
Torresmo Crocante | Pururuca, com limão. | 29.9
`),
      T('nuggets', 'Nuggets e Frango Frito', 10, ['#D9861E', '#8A4C0D'], `
Nuggets Clássicos 6 un | Frango de verdade e molho à escolha. | 19.9
Nuggets Clássicos 12 un | Para dividir, com dois molhos. | 32.9
Nuggets 20 un | Balde com três molhos. | 49.9
Nuggets de Queijo | Recheados com queijo derretido. | 26.9
Nuggets Picantes | Empanado com pimenta caiena. | 24.9
Nuggets Veganos | De proteína vegetal. | 27.9
Tiras de Frango Crocante | Empanadas em flocos crocantes. | 29.9
Asinhas Barbecue | Oito unidades com molho defumado. | 34.9
Asinhas Apimentadas | Oito unidades com molho de pimenta. | 34.9
Drumet com Mel e Mostarda | Glaceado por cima. | 33.9
Coxinha da Asa | Temperada e bem sequinha. | 32.9
Balde de Frango | Mix de pedaços crocantes para quatro. | 79.9
Frango Coreano | Crocante com molho doce e picante. | 42.9
Pipoca de Frango | Pedacinhos crocantes com alho. | 26.9
`),
      T('sushi', 'Sushi', 15, ['#E2485C', '#7E1426'], `
Combinado 20 Peças | Seleção da casa. | 79.9
Combinado 40 Peças | Para duas pessoas. | 149.9
Barca Saborama 60 Peças | Sushi, sashimi e hot rolls. | 229.9
Sashimi de Salmão | Dez fatias finas. | 49.9
Sashimi Misto | Salmão, atum e peixe branco. | 59.9
Nigiri de Salmão | Quatro peças. | 34.9
Nigiri de Atum | Quatro peças. | 38.9
Nigiri de Camarão | Quatro peças. | 39.9
Hossomaki de Salmão | Oito peças. | 26.9
Hossomaki de Pepino | Oito peças vegetarianas. | 19.9
Uramaki Filadélfia | Salmão e cream cheese. | 32.9
Uramaki Califórnia | Kani, manga e pepino. | 29.9
Uramaki Skin | Pele de salmão crocante. | 29.9
Hot Roll Clássico | Empanado com molho tarê. | 34.9
Hot Roll de Camarão | Camarão empanado e cream cheese. | 42.9
Temaki de Salmão | Salmão com cebolinha. | 32.9
Temaki de Atum Picante | Atum com molho picante. | 34.9
Temaki Hot | Salmão empanado e cream cheese. | 35.9
Temaki Frito | Empanado e frito inteiro, com salmão e cream cheese. | 37.9
Joe de Salmão | Quatro peças com ovas. | 36.9
Gunkan de Ovas | Quatro peças. | 44.9
`),
      T('alacarte', 'Pratos à la Carte', 25, ['#7A3B2E', '#3A1810'], `
Filé ao Molho Madeira | Com arroz e batata sauté. | 72.9
Filé à Parmegiana | Com arroz e fritas. | 69.9
Frango à Parmegiana | Com arroz e fritas. | 54.9
Medalhão com Risoto | Mignon ao molho de vinho e risoto de parmesão. | 84.9
Salmão Grelhado | Com legumes e purê de batata. | 79.9
Bacalhau à Gomes de Sá | Batata, ovo, cebola e azeitona. | 96.9
Camarão na Moranga | Servido dentro da abóbora. | 98.9
Cordeiro com Purê | Carré, hortelã e purê de mandioquinha. | 109.9
Ossobuco com Polenta | Cozido lento no vinho. | 89.9
Picanha Fatiada para Dois | Arroz, farofa, vinagrete e fritas. | 139.9
Costela no Bafo | Com mandioca e vinagrete. | 79.9
Pato com Laranja | Coxa confitada e purê de maçã. | 94.9
Polvo Grelhado | Com batata ao murro. | 118.9
Escalope ao Limão Siciliano | Com talharim na manteiga. | 66.9
Risoto de Camarão | Limão siciliano e aspargos. | 84.9
Paella Valenciana | Frutos do mar, frango e açafrão. | 92.9
Strogonoff de Filé | Arroz branco e batata palha. | 58.9
Virado à Paulista | Bisteca, ovo, couve e tutu. | 49.9
`),
      T('hotdog', 'Hot Dogs e Sanduíches', 8, ['#D44F2A', '#7C2510'], `
Hot Dog Clássico | Salsicha, molho, milho e batata palha. | 21.9
Hot Dog Completo | Purê, vinagrete, ovo de codorna e queijo. | 27.9
Hot Dog de Bacon | Salsicha enrolada em bacon. | 28.9
Chili Dog | Carne apimentada e cheddar. | 29.9
Bauru | Rosbife, tomate, picles e queijo. | 33.9
Misto Quente | Presunto e queijo na chapa. | 16.9
Beirute | Rosbife, queijo e pão sírio. | 37.9
Sanduíche de Pernil | Pernil desfiado e vinagrete. | 31.9
Philly Cheese | Carne em tiras, cebola e queijo. | 39.9
Club Sandwich | Frango, bacon, ovo e salada. | 36.9
Croque Monsieur | Presunto, gruyère e bechamel. | 34.9
Wrap de Frango | Frango grelhado e salada. | 27.9
`),
      T('italiana', 'Massas', 20, ['#A3A81E', '#555B0B'], `
Carbonara | Guanciale, gema e pecorino. | 54.9
Bolonhesa | Ragu de seis horas. | 49.9
Alfredo | Fettuccine na manteiga e parmesão. | 48.9
Pesto de Manjericão | Pinoli, parmesão e azeite. | 49.9
Quatro Queijos | Molho cremoso de queijos. | 52.9
Frutos do Mar | Linguine com camarão e lula. | 74.9
Arrabbiata | Tomate e pimenta. | 44.9
Lasanha à Bolonhesa | Camadas gratinadas. | 52.9
Lasanha de Berinjela | Vegetariana, com ricota. | 49.9
Canelone de Ricota | Com espinafre e molho branco. | 48.9
Nhoque ao Sugo | Batata e tomate fresco. | 44.9
Ravioli de Queijo Brie | Na manteiga de sálvia. | 58.9
Rondelli de Presunto | Com molho rosé. | 49.9
Risoto de Funghi | Cogumelos e parmesão. | 58.9
`),
      T('chinesa', 'Comida Chinesa', 15, ['#CF2219', '#6E0D0A'], `
Yakisoba de Carne | Macarrão, carne e legumes no wok. | 44.9
Yakisoba de Frango | Macarrão, frango e legumes no wok. | 42.9
Yakisoba de Camarão | Macarrão, camarão e legumes no wok. | 54.9
Frango Xadrez | Pimentão, amendoim e molho escuro. | 42.9
Arroz Frito | Ovo, presunto e cebolinha. | 34.9
Arroz Oriental de Camarão | Camarão, ovo e legumes. | 48.9
Rolinho Primavera | Crocante, com molho agridoce. | 19.9
Porco Agridoce | Abacaxi e pimentões. | 46.9
Carne com Brócolis | Molho de ostra e gengibre. | 47.9
Pato Laqueado | Panquecas, pepino e molho hoisin. | 89.9
Dim Sum no Vapor | Seis trouxinhas. | 36.9
Bifum com Legumes | Macarrão de arroz vegetariano. | 36.9
`),
      T('japonesa', 'Japonesa Quente', 15, ['#B52A3F', '#5E0F1D'], `
Ramen Tonkotsu | Caldo de 12 horas e ovo marinado. | 54.9
Ramen de Missô | Caldo de soja e milho. | 49.9
Ramen Picante | Caldo com pimenta e carne moída. | 52.9
Udon com Camarão | Macarrão grosso e tempurá. | 52.9
Guioza | Seis unidades grelhadas. | 28.9
Tempurá de Camarão | Seis unidades crocantes. | 46.9
Tempurá de Legumes | Porção vegetariana. | 32.9
Katsu Curry | Porco empanado e curry. | 49.9
Teriyaki de Salmão | Com arroz e legumes. | 62.9
Donburi de Frango | Tigela de arroz, frango e ovo. | 42.9
Okonomiyaki | Panqueca japonesa com repolho. | 39.9
Mochi | Três sabores gelados. | 21.9
`),
      T('mexicana', 'Comida Mexicana', 12, ['#17A673', '#0A5C40'], `
Tacos al Pastor | Porco, abacaxi e coentro. | 36.9
Tacos de Carnitas | Porco desfiado e cebola. | 36.9
Tacos de Peixe | Peixe empanado e repolho. | 38.9
Burrito de Carne | Arroz, feijão e queijo. | 39.9
Burrito de Frango | Frango, guacamole e arroz. | 37.9
Nachos Completos | Guacamole, cheddar e jalapeño. | 38.9
Quesadilla | Queijo e frango na chapa. | 32.9
Enchiladas | Tortilhas gratinadas com molho. | 42.9
Chili com Carne | Com arroz e sour cream. | 39.9
Guacamole | Amassado na hora. | 22.9
`),
      T('brasileira', 'Comida Brasileira', 25, ['#0E9F6E', '#075A3F'], `
Feijoada Completa | Arroz, couve, farofa e laranja. | 58.9
Moqueca de Peixe | Dendê e leite de coco. | 68.9
Moqueca de Camarão | Pirão e arroz. | 82.9
Bobó de Camarão | Creme de mandioca e dendê. | 78.9
Baião de Dois | Carne de sol e queijo coalho. | 54.9
Escondidinho de Carne Seca | Purê de mandioca gratinado. | 49.9
Galinhada | Arroz, frango e açafrão-da-terra. | 44.9
Picanha na Chapa | Fatiada, com farofa e vinagrete. | 79.9
Coxinha | Seis unidades de frango com requeijão. | 24.9
Pastel de Feira | Carne ou queijo. | 16.9
Pão de Queijo | Porção com oito, quentinho. | 17.9
Acarajé | Vatapá, camarão e pimenta. | 26.9
`),
      T('churrasco', 'Churrasco', 25, ['#8A2F1E', '#451108'], `
Picanha Nobre | Na brasa, ponto à escolha. | 89.9
Fraldinha | Macia, com sal grosso. | 69.9
Maminha | Com alho e arroz. | 66.9
Costela de Boi | Assada lentamente. | 74.9
Costelinha Barbecue | Porco glaceado. | 62.9
Ancho | Corte alto, com manteiga de ervas. | 92.9
Tomahawk para Dois | Corte com osso longo. | 189.9
Linguiça Artesanal | Na brasa, com pão. | 34.9
Coração de Frango | Espetos temperados. | 32.9
Queijo Coalho | Espetos com melaço. | 24.9
`),
      T('saladas', 'Saladas e Veganos', 10, ['#6DB33F', '#2E6B1A'], `
Caesar de Frango | Alface, croutons e parmesão. | 36.9
Caprese | Tomate, búfala e manjericão. | 34.9
Grega | Pepino, azeitona e queijo feta. | 34.9
Salada de Quinoa | Grão-de-bico e legumes. | 36.9
Bowl Vegano | Arroz integral, tofu e abacate. | 42.9
Poke de Salmão | Arroz, salmão, manga e gergelim. | 49.9
Poke de Tofu | Vegano, com edamame. | 42.9
Berinjela à Milanesa | Vegana, com arroz. | 38.9
`),
      T('kids', 'Infantil', 10, ['#F56FA1', '#B42C6A'], `
Mini Burger com Fritas | Hambúrguer pequeno e suco. | 27.9
Mini Pizza de Mussarela | Só queijo e tomate. | 24.9
Macarrão na Manteiga | Com parmesão. | 22.9
Nuggets com Batata Sorriso | Seis nuggets e carinhas. | 26.9
Arroz, Feijão e Bifinho | Com batata frita. | 28.9
Panquequinhas | Com calda de chocolate. | 19.9
`),
      T('tabuas', 'Tábuas de Carnes', 30, ['#9C3A1E', '#4A1508'], `
Tábua de Carnes para Dois | Picanha, fraldinha, linguiça e fritas. | 149.9
Tábua de Carnes para Quatro | Cinco cortes, mandioca, farofa e vinagrete. | 269.9
Tábua Mista da Casa | Carne, frango, linguiça e queijo coalho. | 179.9
Tábua de Picanha | Só picanha fatiada, com alho e farofa. | 199.9
Tábua de Costela | Costela desfiada, mandioca e barbecue. | 159.9
Tábua de Linguiças | Quatro linguiças artesanais e pão. | 99.9
Tábua de Frango | Coxinha da asa, sobrecoxa e fritas. | 109.9
Tábua de Frios | Queijos, presunto cru, salame e torradas. | 119.9
Tábua de Boteco | Calabresa, torresmo, mandioca e pão. | 94.9
`),
      T('frituras', 'Frituras e Petiscos', 10, ['#DE9A16', '#94590A'], `
Pastel de Carne | Massa crocante e carne temperada. | 14.9
Pastel de Queijo | Queijo derretendo. | 13.9
Pastel de Camarão | Camarão e requeijão. | 21.9
Risoles de Presunto | Seis unidades cremosas. | 22.9
Bolinho de Arroz | Seis unidades crocantes. | 21.9
Bolinho de Carne | Seis unidades temperadas. | 24.9
Croquete | Seis unidades de carne. | 23.9
Frango a Passarinho | Com alho frito e limão. | 44.9
Tilápia Frita | Iscas crocantes com limão. | 49.9
Camarão Frito | Inteiro, com alho e limão. | 69.9
Calabresa Acebolada | Na chapa, com pão. | 36.9
Provolone à Milanesa | Empanado, com geleia de pimenta. | 34.9
`),
      T('marmitas', 'Marmitas e Prato do Dia', 15, ['#B8742A', '#6A3C10'], `
Frango Grelhado com Arroz e Feijão | Salada e batata frita. | 29.9
Bife Acebolado | Arroz, feijão e fritas. | 32.9
Carne de Panela | Com batata e arroz. | 33.9
Feijão Tropeiro | Bisteca, couve e ovo. | 34.9
Filé de Peixe | Arroz, purê e salada. | 34.9
Almôndegas ao Molho | Arroz e purê. | 28.9
Omelete com Salada | Queijo, tomate e ervas. | 24.9
Marmita Fitness | Frango, batata-doce e brócolis. | 31.9
`),
      T('padaria', 'Café da Manhã e Padaria', 8, ['#D6A15C', '#855820'], `
Pão na Chapa | Pão francês com manteiga. | 9.9
Pão com Ovo | Ovo com gema mole. | 13.9
Croissant Recheado | Presunto e queijo. | 17.9
Tapioca de Queijo | Queijo coalho e coco. | 16.9
Crepe de Frango | Frango e requeijão. | 24.9
Panqueca Americana | Com mel e frutas. | 26.9
Ovos Mexidos com Bacon | Com torradas. | 24.9
Bolo de Cenoura | Com calda de chocolate. | 13.9
`),
      T('sopas', 'Sopas e Caldos', 12, ['#B5832A', '#634510'], `
Caldo Verde | Couve, batata e calabresa. | 24.9
Canja de Galinha | Frango, arroz e legumes. | 24.9
Caldo de Feijão | Com bacon e cebolinha. | 22.9
Sopa de Cebola | Gratinada com queijo. | 28.9
Creme de Abóbora | Com gengibre e coco. | 24.9
Sopa de Legumes | Legumes da estação. | 21.9
`),
      T('bebidas', 'Refrigerantes', 2, ['#2F8FD6', '#114E86'], `
Coca-Cola | Lata com gelo e limão. | 8.9
Coca-Cola Zero | Sem açúcar, com gelo e limão. | 8.9
Guaraná Antarctica | Lata com gelo e limão. | 8.9
Guaraná Antarctica Zero | Sem açúcar, com gelo e limão. | 8.9
Fanta Laranja | Lata com gelo e laranja. | 8.9
Fanta Uva | Lata com gelo e limão. | 8.9
Limão com Hortelã | Artesanal. | 11.9
Schweppes Tônica | Lata com gelo e limão. | 9.9
Água com Gás | Com gelo e rodela de limão. | 6.9
Água sem Gás | Com gelo e rodela de limão. | 5.9
Kombucha de Gengibre | Fermentada na casa. | 15.9
`),
      T('sucos', 'Sucos e Chás', 4, ['#F28B1E', '#A34F08'], `
Laranja Espremida | Feito na hora. | 13.9
Limonada Suíça | Limão batido com leite condensado. | 14.9
Abacaxi com Hortelã | Batido com gelo. | 14.9
Maracujá | Natural. | 13.9
Morango | Natural, com leite ou água. | 14.9
Melancia | Natural e gelado. | 12.9
Verde Detox | Couve, limão e maçã. | 15.9
Chá Gelado de Pêssego | Feito na casa. | 12.9
Chá Gelado de Limão | Feito na casa. | 12.9
`),
      T('shakes', 'Milkshakes', 5, ['#F26D9B', '#A82A5E'], `
Morango | Sorvete, morango e chantilly. | 24.9
Chocolate Belga | Calda quente e raspas. | 26.9
Baunilha | Fava de baunilha de verdade. | 23.9
Cookies e Creme | Biscoito triturado. | 26.9
Doce de Leite | Com flor de sal. | 26.9
Creme de Avelã | Calda de avelã e chantilly. | 28.9
Café Gelado | Espresso duplo. | 25.9
Maracujá | Com calda da fruta. | 25.9
Caramelo Salgado | Calda quente e pipoca. | 27.9
Pistache | Pasta de pistache. | 31.9
`),
      T('acai', 'Açaí e Sorvetes', 5, ['#7A2E9E', '#3A1050'], `
Açaí na Tigela 300 ml | Granola, banana e morango. | 22.9
Açaí na Tigela 500 ml | Granola, banana, morango e leite em pó. | 32.9
Açaí com Paçoca | Paçoca e leite condensado. | 29.9
Sundae de Chocolate | Três bolas e calda quente. | 24.9
Sundae de Morango | Calda da fruta e chantilly. | 24.9
Banana Split | Três sabores e caldas. | 28.9
Casquinha Dupla | Dois sabores. | 13.9
Gelato de Pistache | Duas bolas. | 21.9
`),
      T('doces', 'Sobremesas', 8, ['#8A4FBF', '#472072'], `
Petit Gâteau | Centro derretido e sorvete. | 28.9
Cheesecake de Frutas | Calda de frutas vermelhas. | 26.9
Brownie com Sorvete | Calda quente. | 25.9
Pudim de Leite | Calda de caramelo. | 18.9
Tiramisù | Café e mascarpone. | 24.9
Churros | Com doce de leite. | 18.9
Torta de Limão | Merengue maçaricado. | 22.9
Crème Brûlée | Casquinha de açúcar. | 25.9
Waffle com Frutas | Calda e chantilly. | 26.9
Donut Recheado | Três sabores. | 16.9
Brigadeiro Gourmet | Caixa com quatro. | 18.9
Romeu e Julieta | Queijo com goiabada. | 19.9
`),
      T('cafes', 'Cafés', 3, ['#7C4A2A', '#3A1F0E'], `
Espresso | Curto e encorpado. | 7.9
Espresso Duplo | Dose dupla. | 10.9
Cappuccino | Com desenho no creme. | 13.9
Latte | Leite vaporizado. | 12.9
Mocha | Café, chocolate e leite. | 14.9
Café Gelado | Com leite em nuvem. | 14.9
Chocolate Quente | Cremoso. | 13.9
`),
      T('drinks', 'Cervejas e Drinks', 4, ['#C98A12', '#6B4708'], `
Chope Gelado | Colarinho cremoso. | 13.9
Cerveja Artesanal | IPA da casa. | 21.9
Caipirinha de Limão | Cachaça, limão e açúcar. | 22.9
Gin Tônica | Com zimbro e limão siciliano. | 29.9
Mojito | Rum, hortelã e limão. | 27.9
Aperol Spritz | Com rodela de laranja. | 31.9
`),
    ],
  };
})();
