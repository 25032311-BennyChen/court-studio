(() => {
  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const picker = gallery.querySelector('[data-gallery-picker]');
    const posters = [...gallery.querySelectorAll('[data-poster]')];
    const filters = [...gallery.querySelectorAll('[data-gallery-filter]')];
    const projects = [...gallery.querySelectorAll('[data-work-card]')];
    const empty = gallery.querySelector('[data-gallery-empty]');
    const status = gallery.querySelector('[data-gallery-status]');
    let category = 'all';
    let selection;

    function showProjects(preferred) {
      const matching = projects.filter(project => category === 'all' || project.dataset.category === category);
      const selected = matching.find(project => project.id === preferred) ?? matching[0];
      selection = selected?.id;
      const visibleIds = new Set(matching.map(project => project.id));

      projects.forEach(project => { project.hidden = project !== selected; });
      posters.forEach(poster => {
        poster.hidden = !visibleIds.has(poster.dataset.poster);
        poster.setAttribute('aria-pressed', String(poster.dataset.poster === selection));
      });
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.galleryFilter === category)));
      empty.hidden = Boolean(selected);

      if (selected) {
        const position = matching.indexOf(selected) + 1;
        status.textContent = position + ' of ' + matching.length + ' · ' + selected.querySelector('h3').textContent.trim();
      } else {
        status.textContent = 'No design projects yet';
      }
    }

    function projectFromHash() {
      return document.getElementById(location.hash.slice(1))?.closest('[data-work-card]');
    }

    posters.forEach(poster => poster.addEventListener('click', () => showProjects(poster.dataset.poster)));
    filters.forEach(filter => filter.addEventListener('click', () => {
      category = filter.dataset.galleryFilter;
      showProjects(selection);
    }));
    gallery.querySelector('[data-gallery-reset]').addEventListener('click', () => {
      category = 'all';
      showProjects();
      filters[0].focus();
    });
    window.addEventListener('hashchange', () => {
      const project = projectFromHash();
      if (!project) return;
      category = 'all';
      showProjects(project.id);
    });
    showProjects(projectFromHash()?.id);
    gallery.dataset.galleryReady = '';
    picker.hidden = false;
  }

  const locker = document.querySelector('[data-locker]');
  if (locker) {
    const scene = locker.closest('[data-locker-scene]');
    const plate = scene.querySelector('[data-locker-plate]');
    const tabList = locker.querySelector('[data-locker-tabs]');
    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    const panels = [...locker.querySelectorAll('[data-locker-panel]')];

    function openTab(tab, updateHash = false) {
      const panelId = tab.getAttribute('aria-controls');
      tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== panelId; });
      scene.dataset.lockerCurrent = panelId;
      plate.textContent = tab.textContent.trim().toUpperCase();
      if (updateHash) history.replaceState(null, '', '#' + panelId);
    }

    function tabFromHash() {
      const panel = document.getElementById(location.hash.slice(1))?.closest('[data-locker-panel]');
      return tabs.find(tab => tab.getAttribute('aria-controls') === panel?.id);
    }

    tabs.forEach(tab => {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', () => openTab(tab, true));
    });
    tabList.addEventListener('keydown', event => {
      const current = tabs.indexOf(event.target);
      if (current < 0) return;

      let next;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;

      event.preventDefault();
      openTab(tabs[next], true);
      tabs[next].focus();
    });
    window.addEventListener('hashchange', () => {
      const tab = tabFromHash();
      if (tab) openTab(tab);
    });
    openTab(tabFromHash() ?? tabs[0]);
    locker.dataset.lockerReady = '';
    tabList.hidden = false;
  }

  const awards = document.querySelector('[data-award-book]');
  if (awards) {
    const picker = awards.querySelector('[data-award-picker]');
    const buttons = [...picker.querySelectorAll('[data-award-select]')];
    const entries = [...awards.querySelectorAll('[data-award-entry]')];

    function showAward(id) {
      entries.forEach(entry => { entry.hidden = entry.id !== id; });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.awardSelect === id)));
    }

    function awardFromHash() {
      return document.getElementById(location.hash.slice(1))?.closest('[data-award-entry]')?.id;
    }

    buttons.forEach(button => button.addEventListener('click', () => showAward(button.dataset.awardSelect)));
    window.addEventListener('hashchange', () => {
      const id = awardFromHash();
      if (id) showAward(id);
    });
    showAward(awardFromHash() ?? entries[0].id);
    awards.dataset.awardReady = '';
    picker.hidden = false;
  }

  const contact = document.querySelector('[data-contact-room]');
  if (contact) {
    const composer = contact.querySelector('[data-contact-composer]');
    const message = composer.querySelector('[data-draft-message]');
    const hint = composer.querySelector('[data-draft-hint]');
    const status = composer.querySelector('[data-draft-status]');
    const copy = composer.querySelector('[data-copy-draft]');
    const drafts = {
      internship: 'Hi Benny,\n\nI’d like to discuss an internship opportunity with [team or company]. The role involves [brief description] and the dates are [start and end dates]. Would you be open to a short conversation?\n\n[Your name]',
      project: 'Hi Benny,\n\nI saw your [project name] case study and wanted to ask about [feature or decision]. I’d love to hear more about how you approached it.\n\n[Your name]',
      feedback: 'Hi Benny,\n\nI explored Court Studio and wanted to share some feedback about [page or interaction]. Here’s what I noticed: [your feedback].\n\n[Your name]'
    };
    const hints = {
      internship: 'Add the team, role and relevant internship dates.',
      project: 'Name the project and the feature you’re curious about.',
      feedback: 'Tell me which page you visited and what stood out.'
    };
    let topic;

    function chooseTopic(next) {
      if (topic) drafts[topic] = message.value;
      topic = next;
      contact.dataset.topic = next;
      message.value = drafts[next];
      hint.textContent = hints[next];
      status.textContent = '';
    }

    composer.addEventListener('change', event => {
      if (event.target.matches('input[name="draft-topic"]')) chooseTopic(event.target.value);
    });
    message.addEventListener('input', () => { status.textContent = ''; });
    copy.addEventListener('click', async () => {
      const draft = message.value.trim();
      if (!draft) {
        status.textContent = 'Add a message first.';
        message.focus();
        return;
      }
      try {
        await navigator.clipboard.writeText(draft);
        status.textContent = 'Draft copied.';
      } catch {
        message.focus();
        message.select();
        status.textContent = 'Draft selected. Use your device’s copy command.';
      }
    });

    chooseTopic(composer.querySelector('input[name="draft-topic"]:checked').value);
    composer.hidden = false;
  }
})();
