// Small interactions for the home page. No framework or build step is needed.
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});

const desktopLayout = window.matchMedia('(min-width: 761px)');
desktopLayout.addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Highlight the section currently being viewed in the navigation.
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}

// The native dialog handles keyboard focus and Escape automatically.
const projectDialog = document.querySelector('.project-dialog');
document.querySelector('[data-open-project]').addEventListener('click', () => {
  projectDialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('[data-close-project]').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target === projectDialog) projectDialog.close();
});
projectDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

document.querySelector('[data-year]').textContent = new Date().getFullYear();
