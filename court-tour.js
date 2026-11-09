(() => {
  const scenes = [...document.querySelectorAll('[data-court-scene]')];
  const home = scenes[0];
  const navigation = document.querySelector('[data-tour-nav]');
  const links = [...navigation.querySelectorAll('a')];
  const header = navigation.closest('header');
  const footer = document.querySelector('[data-rally-footer]');
  const backToTop = footer.querySelector('[data-room-top]');
  const skip = document.querySelector('[data-rally-skip-link]');
  const cancel = document.querySelector('[data-rally-cancel]');
  const names = { home: 'Home', work: 'Portfolio', about: 'About', contact: 'Contact' };
  let currentRoom;
  let pendingShot;

  function showRoom(room) {
    currentRoom = room;
    scenes.forEach(scene => { scene.hidden = scene !== room; });
    document.body.dataset.courtChapter = room.id;
    document.title = (room === home ? 'Benny Chen' : names[room.id]) + ' | Court Studio';
    header.style.setProperty('--tour-progress', (scenes.indexOf(room) + 1) / scenes.length);

    links.forEach(link => {
      if (link.hash === '#' + room.id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    skip.href = '#' + (room.getAttribute('aria-labelledby') ?? 'profile-title');
    backToTop.href = '#' + room.id;
    footer.hidden = room === home && Boolean(courtRally);
    cancel.hidden = true;
    courtRally?.stop();
  }

  function followLocation(moveFocus = false) {
    const target = document.getElementById(location.hash.slice(1));
    const room = target?.closest('[data-court-scene]') ?? home;
    const roomChanged = room !== currentRoom || Boolean(pendingShot);
    if (roomChanged) {
      pendingShot = undefined;
      showRoom(room);
    }

    if (room === home) {
      if (roomChanged) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        courtRally?.openHome(target?.id === 'profile-title', moveFocus);
      }
      return;
    }

    // The gallery and locker restore their selection before the linked item is scrolled into view.
    const deepLink = target && target !== room;
    if (deepLink) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    else if (roomChanged) window.scrollTo({ top: 0, behavior: 'instant' });

    if (moveFocus && (deepLink || roomChanged)) {
      const heading = deepLink ? target : room;
      if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function returnToRoom() {
    if (!pendingShot) return;
    const { link, scrollTop } = pendingShot;
    pendingShot = undefined;
    showRoom(currentRoom);
    window.scrollTo({ top: scrollTop, behavior: 'instant' });
    link.focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    if (!courtRally || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[data-rally-next], [data-tour-nav] a');
    if (!link) return;

    if (pendingShot && link.hash === location.hash) {
      event.preventDefault();
      returnToRoom();
      return;
    }
    if (!link.hasAttribute('data-rally-next') || pendingShot) return;

    event.preventDefault();
    pendingShot = { link, scrollTop: window.scrollY };
    const destination = link.hash.slice(1);
    // Each room carries on from the end of the court reached by the previous shot.
    const fromServer = scenes.indexOf(currentRoom) % 2 === 1;
    currentRoom.hidden = true;
    home.hidden = false;
    footer.hidden = true;
    cancel.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    courtRally.openShot(destination, names[destination], fromServer);
  });

  cancel.addEventListener('click', returnToRoom);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pendingShot) returnToRoom();
  });
  window.addEventListener('hashchange', () => followLocation(true));
  followLocation();
})();
