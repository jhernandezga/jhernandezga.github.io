document.documentElement.classList.add('js');

const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#site-navigation');
if (menu && navigation) {
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
}

const collection = document.querySelector('[data-collection]');
if (collection) {
  const search = collection.querySelector('input[type="search"]');
  const select = collection.querySelector('select');
  const count = collection.querySelector('[data-count]');
  const empty = collection.querySelector('.no-results');
  const cards = [...collection.querySelectorAll('[data-entry]')];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const entries = cards.map(card => ({
    card,
    search: normalize(card.dataset.search),
    tags: JSON.parse(card.dataset.tags || '[]') || []
  }));
  const tags = [...new Set(entries.flatMap(entry => entry.tags))].sort((a, b) => a.localeCompare(b));
  tags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    select.append(option);
  });
  if (!tags.length) select.hidden = true;
  const update = () => {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    entries.forEach(entry => {
      const match = words.every(word => entry.search.includes(word)) && (!select.value || entry.tags.includes(select.value));
      entry.card.hidden = !match;
      if (match) visible++;
    });
    count.textContent = `${visible} ${visible === 1 ? count.dataset.one : count.dataset.many}`;
    empty.hidden = visible !== 0;
  };
  search.addEventListener('input', update);
  select.addEventListener('change', update);
  collection.querySelector('[data-reset]').addEventListener('click', () => {
    search.value = '';
    select.value = '';
    update();
    search.focus();
  });
  collection.querySelector('.collection-controls').hidden = false;
  // Browsers may restore a previous search when returning to the page; always start unfiltered.
  const reset = () => {
    search.value = '';
    select.value = '';
    update();
  };
  window.addEventListener('pageshow', reset);
  reset();
}

// Home: the samples appear one by one, left to right, before the curve reconstructs through them.
document.querySelectorAll('.signal-samples').forEach(group => {
  const x = node => Number(node.getAttribute('cx') || node.getAttribute('x1'));
  [...group.children].sort((a, b) => x(a) - x(b)).forEach((node, i) => {
    node.style.animationDelay = `${0.2 + i * 0.035}s`;
  });
});

// Page headings: a small signal drawn once per visit, one per section.
const traces = document.querySelectorAll('[data-trace]');
if (traces.length) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 600, MID = 42, AMP = 30;
  const node = (parent, name, attrs) => {
    const n = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    parent.append(n);
    return n;
  };
  const toPath = points => 'M' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
  const plot = (f, n = 300) => Array.from({ length: n + 1 }, (_, i) => [i / n * W, MID - AMP * f(i / n)]);
  const ease = p => 1 - Math.pow(1 - p, 3);
  const animate = (duration, frame, delay = 0) => {
    if (reduce) return frame(1);
    frame(0);
    const start = performance.now() + delay;
    const tick = now => {
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      frame(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  let seed = 11;
  const noise = () => (seed = seed * 16807 % 2147483647) / 2147483647 - 0.5;

  const scenes = {
    // The logistic map's bifurcation diagram: one stable value, then 2, 4, 8… then chaos.
    chaos(svg) {
      const cols = 300, r0 = 2.6, r1 = 4;
      const columns = Array.from({ length: cols }, (_, c) => {
        const r = r0 + (r1 - r0) * c / cols;
        let x = 0.5;
        for (let i = 0; i < 300; i++) x = r * x * (1 - x);
        const ys = new Set();
        for (let i = 0; i < 60; i++) { x = r * x * (1 - x); ys.add(Math.round((80 - 76 * x) * 2) / 2); }
        const px = (c / cols * W).toFixed(1);
        return { r, d: [...ys].map(y => `M${px} ${y}h1`).join('') };
      });
      const readout = node(svg, 'text', { class: 'trace-readout', x: W, y: -6, 'text-anchor': 'end' });
      let drawn = 0;
      animate(3200, p => {
        const upto = Math.round(p * cols);
        if (upto > drawn) {
          node(svg, 'path', { class: 'trace-dots', d: columns.slice(drawn, upto).map(c => c.d).join('') });
          drawn = upto;
        }
        readout.textContent = `r = ${columns[Math.min(cols - 1, Math.max(0, upto - 1))].r.toFixed(2)}`;
      });
    },
    // Certainty spreading into surprise: a distribution over 16 symbols and its entropy in bits.
    entropy(svg) {
      const n = 16, gap = 8, bw = (W - gap * (n - 1)) / n;
      const bars = Array.from({ length: n }, (_, i) => node(svg, 'rect', { class: 'trace-bar', x: (i * (bw + gap)).toFixed(1), width: bw.toFixed(1), y: 80, height: 0 }));
      const readout = node(svg, 'text', { class: 'trace-readout', x: W, y: 12, 'text-anchor': 'end' });
      animate(2600, p => {
        const s = 0.12 + 2.1 * ease(p);
        const w = bars.map((_, i) => Math.exp(-((i - 7) ** 2) / (2 * s * s)));
        const z = w.reduce((a, b) => a + b);
        const probs = w.map(v => v / z);
        probs.forEach((q, i) => {
          const h = 70 * q;
          bars[i].setAttribute('y', (80 - h).toFixed(1));
          bars[i].setAttribute('height', h.toFixed(1));
        });
        const bits = -probs.reduce((a, q) => a + (q > 1e-9 ? q * Math.log2(q) : 0), 0);
        readout.textContent = `H = ${Math.abs(bits).toFixed(2)} bits`;
      }, 300);
    },
    // Bayes: a prior, then the data's likelihood, then the posterior that settles between them.
    bayes(svg) {
      const gauss = (m, s) => x => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
      const prior = { m: -1, s: 0.8 }, like = { m: 1, s: 0.55 };
      const v = 1 / (1 / prior.s ** 2 + 1 / like.s ** 2);
      const post = { m: v * (prior.m / prior.s ** 2 + like.m / like.s ** 2), s: Math.sqrt(v) };
      const X = x => (x + 3) / 6 * W, top = gauss(0, post.s)(0);
      const curve = ({ m, s }) => toPath(Array.from({ length: 241 }, (_, i) => { const x = -3 + 6 * i / 240; return [X(x), 80 - 70 * gauss(m, s)(x) / top]; }));
      const label = (cls, { m, s }) => node(svg, 'text', { class: `trace-label ${cls}`, x: X(m).toFixed(1), y: (80 - 70 * gauss(m, s)(m) / top - 6).toFixed(1), 'text-anchor': 'middle' });
      const priorLine = node(svg, 'path', { class: 'trace-soft is-strong', d: curve(prior), pathLength: 1 });
      const likeLine = node(svg, 'path', { class: 'trace-like', d: curve(like), pathLength: 1 });
      const postLine = node(svg, 'path', { class: 'trace-line' });
      const labels = [label('', prior), label('', like), label('is-accent', post)];
      [priorLine, likeLine].forEach(l => { l.style.strokeDasharray = 1; });
      const stage = (p, a, b) => ease(Math.min(1, Math.max(0, (p - a) / (b - a))));
      animate(3000, p => {
        priorLine.style.strokeDashoffset = 1 - stage(p, 0, 0.3);
        likeLine.style.strokeDashoffset = 1 - stage(p, 0.25, 0.55);
        const k = stage(p, 0.55, 1);
        postLine.setAttribute('d', k > 0 ? curve({ m: prior.m + (post.m - prior.m) * k, s: prior.s + (post.s - prior.s) * k }) : '');
        labels[0].textContent = p > 0.18 ? 'p(x)' : '';
        labels[1].textContent = p > 0.45 ? 'p(y | x)' : '';
        labels[2].textContent = p >= 1 ? 'p(x | y)' : '';
      });
    },
    // Gradient descent on a curve with two minima: where you start decides where you arrive.
    descent(svg) {
      const f = x => 0.35 * x * x + 0.45 * Math.sin(2.6 * x);
      const df = x => 0.7 * x + 1.17 * Math.cos(2.6 * x);
      const X = x => (x + 3) / 6 * W, Y = x => 76 - (f(x) + 0.4) / 4.1 * 70;
      node(svg, 'path', { class: 'trace-soft', d: toPath(Array.from({ length: 241 }, (_, i) => { const x = -3 + 6 * i / 240; return [X(x), Y(x)]; })) });
      [[-2.7, 'trace-dot'], [2.8, 'trace-dot is-muted']].forEach(([x0, cls], run) => {
        const steps = [x0];
        for (let k = 0; k < 9; k++) steps.push(steps[k] - 0.35 * df(steps[k]));
        const trail = node(svg, 'path', { class: `trace-trail${run ? ' is-muted' : ''}` });
        const dot = node(svg, 'circle', { class: cls, r: 4 });
        animate(2400, p => {
          const k = Math.min(steps.length - 1, Math.floor(ease(p) * steps.length));
          trail.setAttribute('d', toPath(steps.slice(0, k + 1).map(x => [X(x), Y(x)])));
          dot.setAttribute('cx', X(steps[k]).toFixed(1));
          dot.setAttribute('cy', Y(steps[k]).toFixed(1));
        }, run * 350);
      });
    },
    // A blurred, noisy measurement resolving into the signal behind it.
    inverse(svg) {
      const n = 240;
      const x = Array.from({ length: n + 1 }, (_, i) => {
        const u = i / n;
        return 0.9 * Math.exp(-(((u - 0.22) / 0.045) ** 2)) + (u > 0.46 && u < 0.64 ? 0.55 : 0) - 0.6 * Math.exp(-(((u - 0.82) / 0.03) ** 2));
      });
      const y = x.map((_, i) => {
        let s = 0, w = 0;
        for (let j = -18; j <= 18; j++) {
          const g = Math.exp(-(j * j) / 60), v = x[Math.min(n, Math.max(0, i + j))];
          s += g * v; w += g;
        }
        return s / w + 0.12 * noise();
      });
      const at = values => values.map((v, i) => [i / n * W, MID - AMP * v]);
      node(svg, 'path', { class: 'trace-soft', d: toPath(at(y)) });
      const line = node(svg, 'path', { class: 'trace-line' });
      animate(2000, p => {
        const e = ease(p);
        line.setAttribute('d', toPath(at(y.map((v, i) => v + (x[i] - v) * e))));
      }, 500);
    },
    decay(svg) {
      const line = node(svg, 'path', { class: 'trace-line' });
      animate(2600, p => {
        const a = 1 - ease(p);
        line.setAttribute('d', toPath(plot(u => a * Math.sin(2 * Math.PI * 5 * u + 6 * p))));
      });
    }
  };

  // Distributions and landscapes sit on a baseline; waves oscillate around the middle.
  const grounded = ['entropy', 'bayes', 'descent', 'chaos'];
  traces.forEach(trace => {
    const kind = trace.dataset.trace, scene = scenes[kind], svg = trace.querySelector('svg');
    if (grounded.includes(kind)) svg.querySelector('.trace-axis').setAttribute('d', 'M0 80H600');
    if (scene) scene(svg);
  });
}

const article = document.querySelector('[data-article]');
const toc = document.querySelector('.toc');
if (article && toc) {
  const headings = [...article.querySelectorAll('h2')];
  if (headings.length > 1) {
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent;
      toc.querySelector('nav').append(link);
    });
    toc.hidden = false;
  }
}
