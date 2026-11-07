/* Filtros do cardápio: doce, salgado, vegetariano e vegano.
   Categoria que não aparece aqui não tem prato doce, vegetariano nem vegano para filtrar.
   Quem está em "vegano" precisa estar também em "vegetariano". */
window.SM_TAGS = {
  sempreDoce: ['shakes', 'acai', 'doces'],
  semTipo: ['bebidas', 'sucos', 'cafes', 'drinks'],
  pratos: {
    burger: {
      vegetariano: ['Veggie de Grão-de-Bico', 'Vegano de Cogumelos'],
      vegano: ['Vegano de Cogumelos'],
    },
    pizza: {
      doce: ['Chocolate com Morango', 'Banana com Canela', 'Romeu e Julieta'],
      vegetariano: ['Mussarela', 'Margherita', 'Quatro Queijos', 'Cinco Queijos', 'Napolitana', 'Palmito', 'Vegetariana', 'Cogumelos Trufados', 'Chocolate com Morango', 'Banana com Canela', 'Romeu e Julieta'],
    },
    fritas: {
      vegetariano: ['Frita Clássica', 'Frita Grande', 'Trufada com Parmesão', 'Rústica com Alecrim', 'Batata-Doce', 'Batata Canoa', 'Batata Waffle', 'Batata Sorriso', 'Mandioca Frita', 'Polenta Frita', 'Anéis de Cebola', 'Palitos de Mussarela', 'Dadinho de Tapioca'],
      vegano: ['Rústica com Alecrim', 'Batata Canoa', 'Batata Waffle'],
    },
    nuggets: {
      vegetariano: ['Nuggets Veganos', 'Nuggets de Queijo'],
      vegano: ['Nuggets Veganos'],
    },
    sushi: {
      vegetariano: ['Hossomaki de Pepino'],
      vegano: ['Hossomaki de Pepino'],
    },
    italiana: {
      vegetariano: ['Alfredo', 'Pesto de Manjericão', 'Quatro Queijos', 'Arrabbiata', 'Lasanha de Berinjela', 'Canelone de Ricota', 'Nhoque ao Sugo', 'Ravioli de Queijo Brie', 'Risoto de Funghi'],
      vegano: ['Arrabbiata'],
    },
    chinesa: {
      vegetariano: ['Rolinho Primavera', 'Bifum com Legumes'],
      vegano: ['Bifum com Legumes'],
    },
    japonesa: {
      doce: ['Mochi'],
      vegetariano: ['Tempurá de Legumes', 'Mochi'],
    },
    mexicana: {
      vegetariano: ['Nachos Completos', 'Guacamole'],
      vegano: ['Guacamole'],
    },
    brasileira: {
      vegetariano: ['Pão de Queijo'],
    },
    churrasco: {
      vegetariano: ['Queijo Coalho'],
    },
    saladas: {
      vegetariano: ['Caprese', 'Grega', 'Salada de Quinoa', 'Bowl Vegano', 'Poke de Tofu', 'Berinjela à Milanesa'],
      vegano: ['Salada de Quinoa', 'Bowl Vegano', 'Poke de Tofu', 'Berinjela à Milanesa'],
    },
    kids: {
      doce: ['Panquequinhas'],
      vegetariano: ['Mini Pizza de Mussarela', 'Macarrão na Manteiga', 'Panquequinhas'],
    },
    frituras: {
      vegetariano: ['Pastel de Queijo', 'Bolinho de Arroz', 'Provolone à Milanesa'],
    },
    marmitas: {
      vegetariano: ['Omelete com Salada'],
    },
    padaria: {
      doce: ['Panqueca Americana', 'Bolo de Cenoura'],
      vegetariano: ['Pão na Chapa', 'Pão com Ovo', 'Tapioca de Queijo', 'Panqueca Americana', 'Bolo de Cenoura'],
    },
    sopas: {
      vegetariano: ['Creme de Abóbora', 'Sopa de Legumes'],
      vegano: ['Creme de Abóbora', 'Sopa de Legumes'],
    },
  },
};
