(() => {
  const role = document.currentScript?.dataset.profile;
  if (!['coach', 'student'].includes(role)) return;

  const themeToggle = document.querySelector('[data-wand-theme-toggle]');
  const themeKey = 'wand-appearance';
  function applyTheme(light) {
    document.documentElement.toggleAttribute('data-wand-light', light);
    themeToggle?.setAttribute('aria-pressed', String(light));
  }
  if (document.body?.hasAttribute('data-wand-level')) {
    try {
      applyTheme(localStorage.getItem(themeKey) === 'light');
    } catch {
      applyTheme(false);
    }
    themeToggle?.addEventListener('click', () => {
      const light = !document.documentElement.hasAttribute('data-wand-light');
      applyTheme(light);
      try {
        localStorage.setItem(themeKey, light ? 'light' : 'dark');
      } catch {
        // A preferência continua disponível nesta página.
      }
    });
  }

  window.wandContextUrl = (value, allowedPages, fallback) => {
    if (!value) return fallback;
    try {
      const url = new URL(value, location.href);
      return allowedPages.some(page => {
        const allowed = new URL(page, location.href);
        return url.origin === allowed.origin && url.pathname === allowed.pathname;
      }) && !url.username && !url.password ? url.href : fallback;
    } catch {
      return fallback;
    }
  };

  window.wandMostrarConclusao = (mensagem, { fullscreen = false } = {}) => new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.className = 'wand-completion';
    dialog.classList.toggle('wand-completion-fullscreen', fullscreen);
    dialog.setAttribute('aria-label', 'Concluído com sucesso');
    const check = document.createElement('span');
    check.className = 'wand-completion-icon';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    const title = document.createElement('h2');
    title.textContent = 'Concluído com sucesso!';
    const detail = document.createElement('p');
    detail.textContent = mensagem;
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'primary';
    confirm.textContent = 'OK';
    dialog.append(check, title, detail, confirm);
    dialog.addEventListener('cancel', event => event.preventDefault());
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve();
    }, { once: true });
    confirm.addEventListener('click', () => dialog.close(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
    confirm.focus();
  });

  const icons = {
    home: '<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/>',
    training: '<path d="M2 10v4m3-7h3v10H5zm3 5h8m0-5h3v10h-3zm6 3v4"/>',
    evolution: '<path d="M4 20v-5m5 5v-7m5 7v-9m5 9v-13M3 11l6-5 4 3 7-7m-5 0h5v5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    book: '<path d="M4 4h16v16H4zM8 4v16m3-12h6m-6 4h6"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h6"/>',
    activity: '<path d="M2 12h4l3-7 5 15 3-8h5"/>',
    camera: '<path d="M3 7h5l2-3h4l2 3h5v13H3z"/><circle cx="12" cy="13" r="3"/>',
    heart: '<path d="M12 21 3 12a5 5 0 0 1 9-5 5 5 0 0 1 9 5z"/>',
    legacy: '<path d="M12 2 21 6 19 15 12 22 5 15 3 6Z"/><path d="m13 5-5 8h4l-1 6 5-9h-4z"/>',
    bell: '<path d="M4 17h16l-2-3V9a6 6 0 0 0-12 0v5zm6 3h4"/>',
    message: '<path d="M3 4h18v13H9l-6 4zM7 9h10m-10 4h6"/>',
  };

  const coach = role === 'coach';
  const panel = coach ? 'admin.html' : 'aluno.html';
  const route = key => panel + (coach ? '#wc/' : '#') + key;
  const shortcuts = coach ? [
    ['Início', 'home', panel], ['Alunos', 'users', route('alunos')],
    ['Treinos', 'training', route('treinos')], ['Evolução', 'evolution', route('evolucao')],
  ] : [
    ['Início', 'home', panel], ['Treinos', 'training', route('treinos')],
    ['Evolução', 'evolution', route('evolucao')], ['Bem-estar', 'heart', route('bemestar')],
  ];
  const areas = coach ? [
    ['Contratos', 'book', route('contratos'), 'Propostas, aceites e pagamentos'],
    ['Anamneses', 'clipboard', route('anamnese'), 'Saúde, respostas e acompanhamento'],
    ['Avaliação Física', 'activity', route('avaliacao'), 'Medidas, resultados e reavaliações'],
    ['Avaliação Fotográfica', 'camera', route('fotografica'), 'Fotografias e análise postural'],
    ['Bem-estar', 'heart', route('bemestar'), 'Saúde e acompanhamento'],
    ['WAND LEGACY', 'legacy', route('coins'), 'Evolução, conquistas e recompensas'],
    ['Comunicação', 'message', route('comunicacao'), 'Mensagens e suporte'],
  ] : [
    ['Minha Ficha', 'book', route('ficha'), 'Dados e saúde'],
    ['Anamnese', 'clipboard', 'anamnese.html', 'Histórico e rotina'],
    ['Avaliação Física', 'activity', route('avaliacoes'), 'Medidas corporais'],
    ['Avaliação Fotográfica', 'camera', route('fotografica'), 'Frente, perfil e costas'],
    ['WAND LEGACY', 'legacy', route('coins'), 'Conquistas e recompensas'],
    ['Meu Treinador', 'message', route('treinador'), 'Contato e suporte'],
    ['Meus contratos', 'book', 'contratos-aluno.html', 'Contratos e aceites'],
    ['Minha jornada', 'activity', route('jornada'), 'Acompanhamento inicial'],
  ];
  const notices = ['Notificações', 'bell', route('notificacoes'), 'Avisos e solicitações'];

  function icon(name) {
    const element = document.createElement('span');
    element.className = 'wand-navigation-icon';
    element.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>';
    return element;
  }

  function tile([name, glyph, href, description]) {
    const link = document.createElement('a');
    link.className = 'wand-navigation-tile';
    link.href = href;
    const title = document.createElement('strong');
    title.textContent = name;
    const detail = document.createElement('small');
    detail.textContent = description;
    link.append(icon(glyph), title, detail);
    return link;
  }

  if (document.currentScript.dataset.root === 'true') {
    const dock = document.querySelector('.wand-dock');
    const drawer = document.querySelector('.wand-drawer');
    dock.classList.add('wand-navigation-dock');
    drawer.classList.add('wand-navigation-drawer');
    for (const [selector, glyph] of [[coach ? '[data-wc-dock="home"]' : '[data-dock-home]', 'home'],
      [coach ? '[data-wc-dock="menu"]' : '#wandDockMenu', 'menu']]) {
      const button = dock.querySelector(selector);
      button.replaceChildren(icon(glyph), button.querySelector('small'));
    }
    const grid = drawer.querySelector('nav');
    grid.classList.add('wand-navigation-grid');
    document.addEventListener('DOMContentLoaded', () => {
      const extras = coach ? [notices] : [...areas.slice(6), notices];
      for (const item of extras) {
        const link = tile(item);
        link.addEventListener('click', () => drawer.querySelector('.wand-drawer-head button').click());
        grid.append(link);
      }
    }, { once: true });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || drawer.hidden) return;
      drawer.querySelector('.wand-drawer-head button').click();
      dock.querySelector('[aria-expanded]').focus();
    });
    return;
  }

  const dock = document.createElement('nav');
  dock.className = 'wand-navigation-dock';
  dock.setAttribute('aria-label', coach ? 'Navegação WandCoach' : 'Navegação do aluno');
  for (const [name, glyph, href] of shortcuts) {
    const link = document.createElement('a');
    link.href = href;
    const label = document.createElement('small');
    label.textContent = name;
    link.append(icon(glyph), label);
    dock.append(link);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'wandNavigationDrawer');
  toggle.setAttribute('aria-expanded', 'false');
  const menuLabel = document.createElement('small');
  menuLabel.textContent = 'Menu';
  toggle.append(icon('menu'), menuLabel);
  dock.append(toggle);

  const drawer = document.createElement('section');
  drawer.id = 'wandNavigationDrawer';
  drawer.className = 'wand-navigation-drawer';
  drawer.hidden = true;
  const head = document.createElement('div');
  head.className = 'wand-drawer-head';
  const title = document.createElement('strong');
  title.textContent = coach ? 'Áreas do WandCoach' : 'Meu espaço de treinamento';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Fechar ×';
  head.append(title, close);
  const grid = document.createElement('nav');
  grid.className = 'wand-navigation-grid';
  grid.setAttribute('aria-label', title.textContent);
  for (const item of [...areas, notices]) grid.append(tile(item));
  drawer.append(head, grid);
  document.body.append(drawer, dock);
  document.body.classList.add('wand-navigation-standalone');

  const profileMenu = document.querySelector('nav.menu-perfil');
  if (profileMenu) {
    const descriptions = {
      anamnese: 'Triagem e respostas de saúde', avaliacao: 'Medidas e avaliações registradas',
      'atalhos-evolucao': 'Gráficos e progresso do aluno', treinos: 'Prescrições e histórico',
      fotos: 'Fotografias e análise postural', acompanhamento: 'Solicitações e registros',
    };
    profileMenu.classList.add('wand-primary-menu');
    for (const button of profileMenu.querySelectorAll('button[data-painel]')) {
      const glyph = button.querySelector('svg');
      const description = descriptions[button.dataset.painel];
      if (!glyph || !description) continue;
      const holder = document.createElement('span');
      holder.className = 'nav-icon';
      holder.append(glyph);
      const title = document.createElement('span');
      title.className = 'nav-name';
      title.append(...button.childNodes);
      const detail = document.createElement('small');
      detail.className = 'nav-desc';
      detail.textContent = description;
      button.classList.add('wand-primary-row');
      button.append(holder, title, detail);
    }
  }

  function show(open) {
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    (open ? close : toggle).focus();
  }
  toggle.onclick = () => show(drawer.hidden);
  close.onclick = () => show(false);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !drawer.hidden) show(false);
  });
})();
