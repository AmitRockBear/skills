// ---------- shared scenes: chapter map, intro, quiz, outro ----------
// Timeline helpers (S): S.p(j, off, d) eased 0..1 from line j start (+off seconds); S.pf(j, f) from fraction f of line j;
// S.ls(j)/S.le(j) line start/end; S.out(j) 1->0 fade at line j; S.cur() current line index; S.start/S.end scene bounds.
// Register scenes as SCN.<name> = { chapter: CH.<key> | null, draw(S, t), guide?(S, t) }. Lay out in 1920x1080 scene
// coordinates (content area x 60..1860, y 110..850); main.js draws them at 0.86 scale beside the narrator's column.

const TITLE = { kicker: 'A beginner\'s tour', title: 'SUBJECT', sub: 'one building block at a time' };
const CH = { first: [1, 'First chapter'] };   // key: [number, chip title], one per chapter

// caption of line j of a scene, and the fraction of the way through it where `word` is spoken (character-based estimate)
const lineCap = (scene, j) => L.filter(l => l.scene === scene)[j].cap;
const wordAt = (scene, j, word) => { const c = lineCap(scene, j), i = c.indexOf(word); return i < 0 ? 0 : i / c.length; };

// ----- intro: the narrator stands big on the left, then hops to the corner when the next scene starts -----
SCN.intro = {
  chapter: null,
  guide: (S, t) => ({
    spot: 'big', hops: [S.le(0) - .35], happy: t > S.le(0) - .35 && t < S.le(0) + .9 ? 1 : 0,
    look: [{ t0: S.at(1, .3), t1: S.le(1) - .2 }],
  }),
  draw(S, t) {
    fade(P(t, .5, .8), () => {
      text(TITLE.kicker, 1300, 230, { size: 36, weight: 700, color: C.acc, align: 'center' });
      text(TITLE.title, 1300, 330, { size: 96, weight: 600, fam: SERIF, align: 'center' });
      text(TITLE.sub, 1300, 410, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
  },
};

// ----- quiz: question on line 0 (give it a hold of ~2.6 s in make_script.py for the countdown), answer on line 1 -----
// q: { question, answers: [[name, iconKind, use]], right: index }. The narrator cheers when the answer is revealed.
function quizScene(chapter, q) {
  return {
    chapter,
    guide: (S, t) => ({ look: [{ t0: S.ls(0), t1: S.le(1) }], happy: S.p(1, .2) > 0 ? 1 : 0, hops: [S.ls(1) + .2] }),
    draw(S, t) {
      pop(960, 160, S.p(0, .05, .7), () => { card(680, 110, 560, 100, { r: 50, fill: C.acc }); text('Quick check!', 960, 162, { size: 56, weight: 700, fam: SERIF, color: '#fff', align: 'center' }); });
      fade(S.pf(0, .15, .6), () => wrap(q.question, 1500, 36, 600).forEach((ln, i) => text(ln, 960, 290 + i * 48, { size: 36, weight: 600, align: 'center' })), 14);
      const win = S.p(1, 0, .5), n = q.answers.length, w = 360, gap = 40, x0 = 960 - (n * w + (n - 1) * gap) / 2;
      q.answers.forEach(([name, ic, use], i) => {
        const x = x0 + i * (w + gap), y = 420 + Math.sin(t * 2 + i) * 3, right = i === q.right;
        pop(x + w / 2, y + 130, S.pf(0, .5 + i * .07, .5), () => alpha(right ? 1 : 1 - .3 * win, () => {
          card(x, y, w, 260, { r: 28, fill: right && win > 0 ? C.greenL : '#fff', stroke: right && win > 0 ? C.green : C.line, lw: right ? 3 + 3 * win : 3 });
          node(x + 38, y + 38, 20, 'ABCDE'[i], { fill: C.bg, stroke: C.line, size: 20, color: C.soft });
          node(x + w / 2, y + 88, 52, '', { fill: right && win > 0 ? '#fff' : C.accL, stroke: 'transparent' });
          icon(ic, x + w / 2, y + 88, 30, right && win > 0 ? C.green : C.acc);
          text(name, x + w / 2, y + 172, { size: 38, weight: 800, align: 'center' });
          fade(S.pf(1, .3, .5), () => text(use, x + w / 2, y + 222, { size: 24, weight: 700, color: right ? C.green : C.soft, align: 'center' }), 8);
          if (right) pop(x + w - 30, y + 30, win, () => { node(x + w - 30, y + 30, 34, '', { fill: C.green, stroke: '#fff', lw: 4 }); check(x + w - 30, y + 30, 34, '#fff'); });
        }));
      });
      confetti(t, S.ls(1), 11, x0 + q.right * (w + gap) + w / 2, 420, 90);
      const cs = S.le(0), ce = S.ls(1) - .1;
      pop(960, 770, P(t, cs - .2, .4) * (1 - P(t, S.ls(1), .3)), () => countdown(960, 770, 52, (t - cs) / (ce - cs)));
    },
  };
}

// ----- outro: the narrator hops back to the big spot for the goodbye line (the last line of the scene) -----
SCN.outro = {
  chapter: null,
  guide: (S, t) => {
    const last = S.cur() === Math.max(0, L.filter(l => l.scene === 'outro').length - 1);
    return last ? { spot: 'big', happy: 1, hops: [S.ls(S.cur()) + .4] } : {};
  },
  draw(S, t) {
    fade(S.p(0, 0, .6), () => {
      text('Thanks for learning!', 1350, 360, { size: 72, weight: 600, fam: SERIF, align: 'center' });
      text(TITLE.title, 1350, 450, { size: 36, weight: 700, color: C.acc, align: 'center' });
    });
    confetti(t, S.at(0, .5), 33, 1300, 500, 90);
  },
};
