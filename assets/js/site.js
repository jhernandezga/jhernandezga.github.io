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
