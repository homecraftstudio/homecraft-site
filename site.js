/* Kleine extra's: rand onder de kop na scrollen en zacht opkomen van blokken. */
(function () {
  var kop = document.querySelector('.kop');
  if (kop) {
    var bij = function () { kop.classList.toggle('gescrold', window.scrollY > 8); };
    window.addEventListener('scroll', bij, { passive: true });
    bij();
  }
  var blokken = document.querySelectorAll('.opkomen');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    blokken.forEach(function (b) { b.classList.add('zichtbaar'); });
    return;
  }
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (it.isIntersecting) { it.target.classList.add('zichtbaar'); io.unobserve(it.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  blokken.forEach(function (b) { io.observe(b); });
})();
