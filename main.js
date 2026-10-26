// Shared interactions for the home and portfolio pages.
// Each feature checks for its elements so this file can be reused on new pages.
document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (menuButton && navigation) {
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
}

// aria-current="page" is set in each page's HTML so it remains correct on scroll.

// Native dialogs provide focus management, keyboard access and Escape to close.
document.querySelectorAll('[data-open-project]').forEach(button => {
  const dialog = button.dataset.openProject
    ? document.getElementById(button.dataset.openProject)
    : document.querySelector('.project-dialog');
  if (!dialog) return;
  button.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelectorAll('[data-close-project]').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('.project-dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
});

// Filter the portfolio without counting reserved spaces as actual projects.
const filterGroup = document.querySelector('.portfolio-filters');
if (filterGroup) {
  const cards = [...document.querySelectorAll('[data-work-card]')];
  const result = document.querySelector('[data-filter-result]');
  const buttons = [...filterGroup.querySelectorAll('[data-filter]')];
  const matches = (card, category) => category === 'all' || card.dataset.category.split(' ').includes(category);

  buttons.forEach(button => {
    const count = cards.filter(card => !card.hasAttribute('data-placeholder') && matches(card, button.dataset.filter)).length;
    button.querySelector('[data-filter-count]').textContent = count;
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      cards.forEach(card => { card.hidden = !matches(card, category); });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const visibleCount = cards.filter(card => !card.hidden && !card.hasAttribute('data-placeholder')).length;
      result.textContent = visibleCount
        ? visibleCount + ' project' + (visibleCount === 1 ? '' : 's') + ' in progress · coursework coming soon'
        : 'No projects added yet · design coursework coming soon';
    });
  });
  filterGroup.hidden = false;
}

document.querySelectorAll('[data-year]').forEach(element => {
  element.textContent = new Date().getFullYear();
});
