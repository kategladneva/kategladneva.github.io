/* Lamoda Club: the conic gradient swings with the cursor (and a little with scrolling).
   The swing is limited on purpose: the logo and labels are black and sit on the light wedge. */
(function () {
  var section = document.querySelector(".case--club");
  if (!section) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MOUSE_SWING = 40;   // degrees either way across the full window width
  var SCROLL_SWING = 12;  // degrees either way while the block passes through the screen
  var SHIFT = 2;          // percent the gradient centre moves

  var mx = 0, my = 0, tx = 0, ty = 0;   // -0.5 … 0.5
  var angle = 0, dx = 0, dy = 0;
  var running = false, last = 0;

  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var k = 1 - Math.exp(-dt * 3);
    mx += (tx - mx) * k;
    my += (ty - my) * k;
    var r = section.getBoundingClientRect();
    var p = (r.top + r.height / 2) / window.innerHeight - 0.5;   // block centre vs screen centre
    p = Math.max(-1.5, Math.min(1.5, p));
    var target = mx * 2 * MOUSE_SWING + p * SCROLL_SWING;
    angle += (target - angle) * k;
    dx = mx * 2 * SHIFT;
    dy = my * 2 * SHIFT;
    section.style.setProperty("--club-angle", angle.toFixed(2) + "deg");
    section.style.setProperty("--club-dx", dx.toFixed(2) + "%");
    section.style.setProperty("--club-dy", dy.toFixed(2) + "%");
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(function (entries) {
    var visible = entries[0].isIntersecting;
    if (visible && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!visible) {
      running = false;
    }
  }).observe(section);
})();
