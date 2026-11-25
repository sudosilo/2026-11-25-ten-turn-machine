// Ten Turn Machine piece library. Each part is 100 wide.
// make(x,y,p) returns path (ball center), exit height, trigger x, and draw(c,f).
// f is seconds since the ball fired the part, or -1 before that.
const ease = t => t < 0 ? 0 : Math.min(1, t);
function seg(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.stroke(); }

const PARTS = {
  ramp: { v: "rolls down a ramp", t: 0, b: 54, make(x, y, p) {
    const d = 15 + p * 30;
    return { path: [[x, y], [x + 100, y + d]], exit: y + d, trig: x,
      draw(c) { seg(c, [[x, y + 6], [x + 100, y + d + 6]]); } };
  } },
  dominoes: { v: "topples a row of dominoes", t: -20, b: 8, make(x, y) {
    return { path: [[x, y], [x + 100, y]], exit: y, trig: x + 5,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 100, y + 6]]);
        for (let i = 0; i < 5; i++) {
          const bx = x + 18 + i * 16, a = f < 0 ? 0 : ease((f - i * 0.12) / 0.2) * 1.2;
          seg(c, [[bx, y + 6], [bx + Math.sin(a) * 22, y + 6 - Math.cos(a) * 22]]);
        }
      } };
  } },
  bell: { v: "rings a bell", t: -42, b: 16, make(x, y) {
    return { path: [[x, y], [x + 100, y + 8]], exit: y + 8, trig: x + 50,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 100, y + 14]]);
        seg(c, [[x + 40, y - 38], [x + 60, y - 38]]);
        const w = f < 0 ? 0 : Math.sin(f * 25) * Math.max(0, 1 - f) * 0.5;
        c.save(); c.translate(x + 50, y - 38); c.rotate(w);
        seg(c, [[0, 0], [0, 8]]);
        c.beginPath(); c.moveTo(-10, 24); c.quadraticCurveTo(-9, 8, 0, 8); c.quadraticCurveTo(9, 8, 10, 24); c.closePath(); c.stroke();
        c.restore();
      } };
  } },
  spring: { v: "gets launched by a spring", t: -52, b: 44, make(x, y) {
    return { path: [[x, y], [x + 35, y], [x + 48, y + 28], [x + 52, y + 28], [x + 72, y - 48], [x + 100, y - 35]], exit: y - 35, trig: x + 48,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 35, y + 6]]);
        seg(c, [[x + 80, y - 29], [x + 100, y - 29]]);
        const top = y + 34 + (f >= 0 && f < 0.25 ? 6 : 0), base = y + 42;
        seg(c, [[x + 42, base], [x + 58, base]]);
        const z = [];
        for (let i = 0; i <= 6; i++) z.push([x + 50 + (i > 0 && i < 6 ? (i % 2 ? 6 : -6) : 0), base - (base - top) * i / 6]);
        seg(c, z); seg(c, [[x + 43, top], [x + 57, top]]);
      } };
  } },
  fan: { v: "gets blown up by a fan", t: -40, b: 40, make(x, y) {
    return { path: [[x, y], [x + 40, y], [x + 66, y - 34], [x + 100, y - 28]], exit: y - 28, trig: x + 30,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 42, y + 6]]);
        seg(c, [[x + 76, y - 22], [x + 100, y - 22]]);
        c.beginPath(); c.arc(x + 52, y + 26, 12, 0, 7); c.stroke();
        const a = f < 0 ? 0 : f * 18;
        for (let i = 0; i < 3; i++) { const r = a + i * 2.09; seg(c, [[x + 52, y + 26], [x + 52 + Math.cos(r) * 11, y + 26 + Math.sin(r) * 11]]); }
        seg(c, [[x + 52, y + 38], [x + 52, y + 44]]);
        if (f >= 0 && f < 1.5) for (let i = -1; i <= 1; i++) seg(c, [[x + 52 + i * 7, y + 10], [x + 56 + i * 7, y - 4]]);
      } };
  } },
  funnel: { v: "drops through a funnel", t: -12, b: 54, make(x, y) {
    return { path: [[x, y], [x + 32, y], [x + 50, y + 18], [x + 50, y + 40], [x + 100, y + 46]], exit: y + 46, trig: x + 32,
      draw(c) {
        seg(c, [[x, y + 6], [x + 28, y + 6]]);
        seg(c, [[x + 28, y + 6], [x + 44, y + 16], [x + 44, y + 30]]);
        seg(c, [[x + 70, y - 10], [x + 56, y + 16], [x + 56, y + 30]]);
        seg(c, [[x + 40, y + 46], [x + 100, y + 52]]);
      } };
  } },
  lever: { v: "flips off a lever", t: -36, b: 36, make(x, y) {
    return { path: [[x, y], [x + 28, y + 12], [x + 50, y - 30], [x + 76, y - 22], [x + 100, y - 18]], exit: y - 18, trig: x + 28,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 20, y + 6]]);
        seg(c, [[x + 76, y - 12], [x + 100, y - 12]]);
        const a = 0.3 - ease(f / 0.15) * 0.6, px = x + 40, py = y + 24;
        seg(c, [[px - 30 * Math.cos(a), py - 30 * Math.sin(a)], [px + 30 * Math.cos(a), py + 30 * Math.sin(a)]]);
        seg(c, [[px, py], [px - 7, py + 10], [px + 7, py + 10], [px, py]]);
      } };
  } },
  wheel: { v: "spins a waterwheel", t: 0, b: 60, make(x, y) {
    return { path: [[x, y], [x + 100, y + 14]], exit: y + 14, trig: x + 30,
      draw(c, f) {
        seg(c, [[x, y + 6], [x + 100, y + 20]]);
        c.beginPath(); c.arc(x + 50, y + 38, 8, 0, 7); c.stroke();
        const a = f < 0 ? 0 : f * 6;
        for (let i = 0; i < 6; i++) { const r = a + i * 1.047; seg(c, [[x + 50, y + 38], [x + 50 + Math.cos(r) * 20, y + 38 + Math.sin(r) * 20]]); }
      } };
  } },
  pulley: { v: "rides a pulley bucket down", t: -54, b: 56, make(x, y) {
    return { path: [[x, y], [x + 26, y], [x + 26, y + 40], [x + 60, y + 42], [x + 100, y + 46]], exit: y + 46, trig: x + 26,
      draw(c, f) {
        const o = f < 0 ? 0 : ease(f / 0.35) * 34;
        seg(c, [[x, y + 6], [x + 12, y + 6]]);
        c.beginPath(); c.arc(x + 34, y - 42, 10, 0, 7); c.stroke();
        seg(c, [[x + 24, y - 42], [x + 14, y + 2 + o]]);
        seg(c, [[x + 14, y + 2 + o], [x + 16, y + 12 + o], [x + 36, y + 12 + o], [x + 38, y + 2 + o]]);
        seg(c, [[x + 44, y - 42], [x + 45, y + 16 - o]]);
        c.strokeRect(x + 40, y + 16 - o, 10, 10);
        seg(c, [[x + 44, y + 52], [x + 100, y + 52]]);
      } };
  } }
};

// Turn cards: each turn draws one, and the builder tries to meet it.
const CARDS = [
  ["Ring the bell", n => n.includes("bell")],
  ["Send the ball uphill", (n, a, b) => b < a - 15],
  ["Finish lower than you started", (n, a, b) => b > a + 25],
  ["No ramps allowed", n => !n.includes("ramp")],
  ["Launch it with a spring", n => n.includes("spring")],
  ["Knock over dominoes", n => n.includes("dominoes")],
  ["Every part different", n => new Set(n).size === n.length],
  ["Blow it with a fan", n => n.includes("fan")],
  ["Ride the pulley", n => n.includes("pulley")],
  ["Finish near the top", (n, a, b) => b < 70],
  ["Finish near the floor", (n, a, b) => b > 140],
  ["Spin the waterwheel", n => n.includes("wheel")],
  ["Use the lever", n => n.includes("lever")],
  ["Drop it through the funnel", n => n.includes("funnel")]
];
