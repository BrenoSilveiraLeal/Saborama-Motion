/* Saborama Motion · escala da página.
   O site é desenhado numa tela de 1366px de largura. Em qualquer computador a partir de 1000px, a página inteira é
   ampliada ou reduzida na mesma proporção, então fica igual em todas as telas. Celular e tablet usam o layout próprio.
   --vw e --vh substituem vw e vh no CSS: com zoom, 1vw passaria a valer mais que 1% da tela. */
(function () {
  const BASE = 1366, MINIMO = 1000, raiz = document.documentElement;
  const aplicar = () => {
    const z = innerWidth >= MINIMO ? innerWidth / BASE : 1;
    window.SM_Z = z;
    raiz.style.zoom = z === 1 ? '' : String(z);
    raiz.style.setProperty('--vw', innerWidth / z / 100 + 'px');
    raiz.style.setProperty('--vh', innerHeight / z / 100 + 'px');
  };
  aplicar();
  addEventListener('resize', aplicar);
})();
