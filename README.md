# Saborama Motion

Cardápio digital de uma lanchonete em que cada prato é montado na tela, passo a passo, conforme a pessoa rola a página: o pão cai na tábua, o molho sai do frasco, o refrigerante enche o copo e o queijo é ralado por cima da pizza.

São **27 categorias e 315 pratos**, com busca, filtros (doce, salgado, vegetariano, vegano) e um pedido com checkout simulado. Nenhum pagamento é cobrado e nenhum dado sai do navegador.

## O que tem de interessante aqui

- **Animação guiada pela rolagem, sem biblioteca de scroll.** Um único laço (`gsap.ticker`) lê a posição da página e desenha a etapa atual. Cada ingrediente leva um tempo mínimo para cair, mesmo quando a pessoa rola rápido, e a página espera a imagem da etapa carregar antes de mostrar a queda.
- **Montagem a partir de fotos reais de cada etapa.** Para cada passo existe a foto do prato naquele momento e um recorte da peça nova (`*-peca.png`), com a posição exata dela na foto (`js/pieces.js`). A peça cai até esse ponto e se funde com a foto, então o que cai é exatamente o que aparece no prato.
- **Ferramentas de verdade em cena.** Frascos de molho, concha, ralador, saleiro, colher, lata, jarra e garrafa entram, inclinam e saem, cada um com o próprio movimento. Líquidos sobem dentro do copo com uma máscara de nível, e bebidas com gás ganham bolhas desenhadas em canvas.
- **Cardápio em grade que se ajusta sozinha.** Os blocos seguem um padrão de tamanhos, e os últimos se ajustam para a grade nunca terminar com buraco. Cada foto é enquadrada pela caixa real da comida (`js/dish-boxes.js`), então copo alto e pizza larga aparecem inteiros em qualquer formato de bloco.
- **Pedido completo no navegador.** Sacola, cupons, frete calculado por CEP, entrega ou retirada, Pix, cartão ou dinheiro, e acompanhamento do pedido. É tudo simulado.
- **Acessibilidade.** Navegação por teclado (setas, Esc), `aria-live` para avisos, rótulos em todos os controles e respeito a `prefers-reduced-motion`.

## Tecnologias

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. A única dependência é o [GSAP](https://gsap.com/), carregado por CDN para as transições.

## Estrutura

```
index.html            página única
css/style.css         estilos (tokens de cor, layout, responsivo)
js/
  data.js             categorias, pratos, preços, cupons e frete de demonstração
  tags.js             quais pratos são doces, vegetarianos ou veganos
  recipes-built.js    receitas: fotos de cada etapa, ferramenta e cor do líquido
  pieces.js           posição de cada peça na foto da sua etapa
  ingredients.js      transforma as receitas nas cenas animadas
  dish-boxes.js       caixa da comida pronta em cada foto, para enquadrar o cardápio
  app.js              cena animada, cardápio, ilha de compra, pedido e checkout
assets/
  frames/             foto de cada etapa (.jpg) e recorte da peça que cai (-peca.png)
  scenes/             tábua vazia e capas dos hambúrgueres
  ingredients/        ingredientes recortados (miniaturas dos passos)
  tools/              frascos, conchas, latas, jarras, ralador
servidor-local.ps1    servidor local para desenvolvimento (Windows)
```

Não há back-end: o projeto é um front-end estático, e o pedido é simulado de ponta a ponta no navegador.

## Como rodar

O site é estático. Abra o `index.html` ou sirva a pasta com qualquer servidor:

```bash
python -m http.server 5173
```

No Windows, `servidor-local.ps1` sobe um servidor em `http://localhost:5173` que já cuida do cache das imagens. Em `localhost`, a página se recarrega sozinha quando algum arquivo muda.

## Observações

As fotos dos pratos foram geradas por IA para demonstração. Os preços, os tempos, o contato e as marcas que aparecem nas embalagens são ilustrativos.
