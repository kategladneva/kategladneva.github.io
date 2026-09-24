/* Lamoda Club: the conic gradient turns toward the cursor and keeps a slow turn on its own.
   Touch devices: the slow turn plus a turn tied to scrolling. */
(function () {
  var section = document.querySelector(".case--club");
  if (!section) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CENTER = [0.5598, 0.3193];      // gradient centre from the design
  var IDLE_SPEED = 0.15;              // radians per second, about 40 s per full turn
  var target = 0, follow = 0, drift = 0;
  var shift = [0, 0], shiftTarget = [0, 0];

  function wrap(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

  window.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var r = section.getBoundingClientRect();
    var cx = r.left + CENTER[0] * r.width;
    var cy = r.top + CENTER[1] * r.height;
    // angle of the cursor around the centre, measured like conic-gradient (clockwise from 12 o'clock),
    // minus the idle turn so the cursor direction wins while the mouse moves
    var a = Math.atan2(e.clientX - cx, -(e.clientY - cy)) - drift;
    target = follow + wrap(a - follow);                    // always turn the short way round
    shiftTarget = [(e.clientX / window.innerWidth - 0.5) * 4, (e.clientY / window.innerHeight - 0.5) * 4];
  }, { passive: true });

  var running = false, last = 0;

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    var k = 1 - Math.exp(-dt * 2.5);                       // smooth, slightly lazy follow
    follow += (target - follow) * k;
    shift[0] += (shiftTarget[0] - shift[0]) * k;
    shift[1] += (shiftTarget[1] - shift[1]) * k;
    drift += dt * IDLE_SPEED;
    var r = section.getBoundingClientRect();
    var scroll = (r.top / window.innerHeight) * 0.6;
    var deg = (drift + follow + scroll) * 180 / Math.PI;
    section.style.setProperty("--club-angle", deg.toFixed(2) + "deg");
    section.style.setProperty("--club-dx", shift[0].toFixed(2) + "%");
    section.style.setProperty("--club-dy", shift[1].toFixed(2) + "%");
    requestAnimationFrame(frame);
  }

  section.classList.add("is-interactive");

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
