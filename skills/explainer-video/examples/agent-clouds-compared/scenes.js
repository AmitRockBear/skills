// ---------- scenes: chapters, intro, scorecards ----------
// Timeline helpers (S): S.p(j, off, d) eased 0..1 from line j start (+off seconds); S.pf(j, f) from fraction f of line j;
// S.ls(j)/S.le(j) line start/end; S.out(j) 1->0 fade at line j; S.cur() current line index; S.start/S.end scene bounds.

const CH = {
  body: [1, 'The body'], code: [2, 'The code'], brain: [3, 'The brain'], memory: [4, 'Memory'], time: [5, 'Time'],
  hands: [6, 'Hands'], senses: [7, 'Senses'], safety: [8, 'Safety & identity'], money: [9, 'Money'], ship: [10, 'Shipping it'],
  bill: [11, 'The bill'], verdict: [12, 'The verdict'],
};
// caption of line j of a scene, and the fraction of the way through it where `word` is spoken (character-based estimate)
const lineCap = (scene, j) => L.filter(l => l.scene === scene)[j].cap;
const wordAt = (scene, j, word) => { const c = lineCap(scene, j), i = c.indexOf(word); return i < 0 ? 0 : i / c.length; };

// ----- intro -----
SCN.intro = {
  chapter: null,
  guide: (S, t) => ({
    spot: 'big', hops: [S.le(0) - .35], happy: t > S.le(0) - .35 && t < S.le(0) + .9 ? 1 : 0,
    look: [{ t0: S.at(1, .3), t1: S.le(1) - .2 }, { t0: S.at(2, .3), t1: S.le(2) - .3 }],
  }),
  draw(S, t) {
    fade(P(t, .5, .8), () => {
      text('Cloudflare  ·  Vercel  ·  AWS', 1300, 200, { size: 36, weight: 700, color: C.acc, align: 'center' });
      text('AI Agent Clouds', 1300, 290, { size: 96, weight: 600, fam: SERIF, align: 'center' });
      text('compared, one building block at a time', 1300, 370, { size: 32, weight: 500, color: C.soft, align: 'center' });
    });
    const xs = { cf: 980, vc: 1300, aws: 1620 };
    const at = { cf: wordAt('intro', 1, 'Cloudflare'), vc: wordAt('intro', 1, 'Vercel'), aws: wordAt('intro', 1, 'AWS') };
    const ay = 790, link = S.p(2, .4, .8);
    PROVS.forEach(k => {
      if (link > 0) line(1300, ay - 50, lerp(1300, xs[k], link), lerp(ay - 50, 640, link), C.line, 4, [4, 10]);
      const bob = Math.sin(t * 1.8 + xs[k]) * 4;
      pop(xs[k], 530, S.pf(1, at[k], .6), () => provTile(k, xs[k], 520 + bob, 72));
    });
    pop(1300, ay, S.p(2, .2), () => atlas(1300, ay, .8, t, { mood: 'happy' }));
  },
};

// ----- scorecard scenes -----
// done: rows already filled before this scene. fills: [{ row, line, at: {cf, vc, aws} fractions of that line }].
function scoreScene(chapter, done, fills) {
  const fresh = fills.map(f => SCORE_ROW[f.row]);
  return {
    chapter,
    draw(S, t) {
      const cell = (i, k) => {
        if (done.includes(SCORE[i].k)) return 1;
        const f = fills.find(f => SCORE_ROW[f.row] === i);
        return f ? S.pf(f.line, f.at[k], .5) : 0;
      };
      scoreGrid({ cell, hi: i => fresh.includes(i) ? S.p(0, .2, .5) * (.75 + .25 * Math.sin(t * 3)) : 0 });
    },
  };
}
// the three providers' parts of a scorecard line, found by the word that starts each part
const parts = (scene, j, words = ['Cloudflare', 'Vercel', 'AWS']) => ({ cf: wordAt(scene, j, words[0]), vc: wordAt(scene, j, words[1]), aws: wordAt(scene, j, words[2]) });
const DONE = ['body', 'code', 'brain', 'keys', 'memory', 'time', 'hands', 'senses', 'safety'];
SCN.body_score = scoreScene(CH.body, [], [{ row: 'body', line: 1, at: parts('body_score', 1) }]);
SCN.brain_score = scoreScene(CH.brain, DONE.slice(0, 1), [
  { row: 'code', line: 0, at: { cf: .05, vc: .3, aws: .55 } },
  { row: 'brain', line: 1, at: parts('brain_score', 1) },
  { row: 'keys', line: 1, at: { cf: wordAt('brain_score', 1, 'ZDR'), vc: wordAt('brain_score', 1, 'ZDR') + .03, aws: wordAt('brain_score', 1, 'strict') } },
]);
SCN.memory_score = scoreScene(CH.memory, DONE.slice(0, 4), [{ row: 'memory', line: 1, at: parts('memory_score', 1) }]);
SCN.time_score = scoreScene(CH.time, DONE.slice(0, 5), [{ row: 'time', line: 1, at: parts('time_score', 1, ["Cloudflare's", "Vercel's", 'AWS']) }]);
SCN.hands_score = scoreScene(CH.hands, DONE.slice(0, 6), [{ row: 'hands', line: 1, at: parts('hands_score', 1) }]);
SCN.senses_score = scoreScene(CH.senses, DONE.slice(0, 7), [{ row: 'senses', line: 1, at: parts('senses_score', 1) }]);
SCN.safety_score = scoreScene(CH.safety, DONE.slice(0, 8), [{ row: 'safety', line: 1, at: parts('safety_score', 1) }]);
