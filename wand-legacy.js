export const LEGACY_LEVELS = Object.freeze([
  ['I', 'Iniciação', 0, 'O início da jornada.', 'bronze'],
  ['II', 'Compromisso', 500, 'Construindo novos hábitos.', 'bronze'],
  ['III', 'Disciplina', 1500, 'Transformando esforço em rotina.', 'prata'],
  ['IV', 'Determinação', 3000, 'Mantendo o foco nos objetivos.', 'prata'],
  ['V', 'Superação', 5000, 'Ultrapassando os próprios limites com responsabilidade.', 'ouro'],
  ['VI', 'Ascensão', 8000, 'Consolidando sua evolução.', 'ouro'],
  ['VII', 'Excelência', 12000, 'Elevando seu padrão pessoal.', 'ouro'],
  ['VIII', 'Elite', 18000, 'Uma trajetória de consistência.', 'platina'],
  ['IX', 'Mestre', 26000, 'Dominando seus próprios hábitos.', 'prata'],
  ['X', 'Lendário', 40000, 'O nível máximo do WAND LEGACY.', 'ouro'],
].map(([roman, name, minimumXp, description, tone]) =>
  Object.freeze({ roman, name, minimumXp, description, tone })));

const PRESTIGE_INTERVAL = 10000;

export function legacyProgress(xp) {
  if (!Number.isSafeInteger(xp) || xp < 0) {
    throw new RangeError('XP deve ser um inteiro não negativo.');
  }

  const index = LEGACY_LEVELS.findLastIndex(level => xp >= level.minimumXp);
  const current = LEGACY_LEVELS[index];
  const next = LEGACY_LEVELS[index + 1] ?? null;
  const levelXp = xp - current.minimumXp;

  return {
    current,
    next,
    prestige: next ? 0 : Math.floor(levelXp / PRESTIGE_INTERVAL),
    progress: next
      ? levelXp / (next.minimumXp - current.minimumXp)
      : (levelXp % PRESTIGE_INTERVAL) / PRESTIGE_INTERVAL,
  };
}

export async function loadLegacy(client, studentId) {
  const { data, error } = await client.rpc('wand_legacy_resumo', { p_aluno_id: studentId });
  if (error) throw error;
  if (!data) throw new Error('Resumo indisponível.');
  return data;
}

const formatNumber = new Intl.NumberFormat('pt-BR');
const formatDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' });

export function legacyLevelCard(document, level, annotation = '') {
  const card = document.createElement('span');
  card.className = 'wand-legacy-level';
  card.dataset.tone = level.tone;
  const shield = document.createElement('span');
  shield.className = 'wand-legacy-level-shield';
  shield.setAttribute('aria-hidden', 'true');
  const icon = badgeIcon(document, 'legado_eterno');
  icon.firstChild.setAttribute('d', 'M12 2l9 4-1 8c-.8 3.3-4 6-8 8-4-2-7.2-4.7-8-8L3 6z');
  const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  lightning.setAttribute('d', 'M13 6l-4 5h3l-1 4 4-6h-3z');
  icon.append(lightning);
  shield.append(icon);
  const numeral = document.createElement('span');
  numeral.textContent = level.roman;
  shield.append(numeral);
  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = `Nível ${level.roman} — ${level.name}`;
  const description = document.createElement('span');
  description.textContent = level.description;
  const threshold = document.createElement('small');
  threshold.textContent = `${formatNumber.format(level.minimumXp)} XP${annotation ? ' · ' + annotation : ''}`;
  copy.append(title, description, threshold);
  card.append(shield, copy);
  return card;
}

const badgePaths = {
  primeiro_passo: 'M4 13h5v7H4z M15 4h5v7h-5z',
  disciplina_ouro: 'M5 4h14v16H5z M8 12l3 3 5-6',
  centuriao: 'M4 8h16l-2 9H6z M8 8V5h8v3',
  inabalavel: 'M3 19l6-10 3 4 4-8 5 14z',
  superacao: 'M5 18l6-6 3 3 5-8 M14 7h5v5',
  legado_eterno: 'M12 2l8 4-2 10-6 6-6-6L4 6z M12 7l-3 5h4l-1 4 4-6h-4z',
};

function badgeIcon(document, code) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('width', '20');
  icon.setAttribute('height', '20');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', '#d4af37');
  icon.setAttribute('stroke-width', '1.5');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', badgePaths[code] ?? 'M6 6h12v12H6z');
  icon.append(path);
  return icon;
}

export function renderLegacy(container, summary, { currentLevelOnly = false } = {}) {
  const document = container.ownerDocument;
  container.classList.add('wand-legacy-summary');
  const shield = document.createElement(currentLevelOnly ? 'img' : 'div');
  if (currentLevelOnly) {
    shield.className = 'wand-legacy-student-logo';
    shield.src = './imagens/wand-legacy-transparente.png';
    shield.alt = 'WAND LEGACY';
  } else {
    shield.className = 'wand-legacy-shield';
    shield.setAttribute('aria-label', 'WAND LEGACY');
    const brand = document.createElement('strong');
    brand.textContent = 'WAND';
    const subtitle = document.createElement('span');
    subtitle.textContent = 'LEGACY';
    shield.append(badgeIcon(document, 'legado_eterno'), brand, subtitle);
  }
  const progress = legacyProgress(Number(summary.xp));
  const level = document.createElement('h3');
  level.textContent = `${progress.current.roman} — ${progress.current.name}`;
  const balances = document.createElement('p');
  balances.textContent = `${formatNumber.format(summary.xp)} XP · ${formatNumber.format(summary.energia)} WAND ENERGY`;
  const label = document.createElement('p');
  label.textContent = progress.next
    ? `${formatNumber.format(progress.next.minimumXp - summary.xp)} XP até ${progress.next.name}`
    : `Prestígio: ${formatNumber.format(progress.prestige)}`;
  const bar = document.createElement('progress');
  bar.style.cssText = 'width:100%;accent-color:#d4af37';
  bar.max = 1;
  bar.value = progress.progress;
  bar.setAttribute('aria-label', progress.next ? 'Progresso para o próximo nível' : 'Progresso para o próximo prestígio');
  const heading = document.createElement('h3');
  heading.textContent = 'Insígnias';
  const badges = document.createElement('ul');
  for (const badge of summary.insignias) {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = badge.nome;
    const description = document.createElement('p');
    description.textContent = `${badge.descricao} · ${formatDate.format(new Date(badge.conquistada_em))}`;
    item.append(badgeIcon(document, badge.codigo), ' ', name, description);
    badges.append(item);
  }
  const empty = document.createElement('p');
  empty.textContent = 'Nenhuma insígnia conquistada até agora.';
  const levels = document.createElement('details');
  const levelsHeading = document.createElement('summary');
  levelsHeading.textContent = 'Conquistas';
  const levelsList = document.createElement('ul');
  levelsList.className = 'wand-legacy-level-list';
  for (const entry of currentLevelOnly ? [progress.current] : LEGACY_LEVELS) {
    const row = document.createElement('li');
    row.append(legacyLevelCard(document, entry, entry === progress.current ? 'Nível atual' : ''));
    levelsList.append(row);
  }
  levels.append(levelsHeading, levelsList);
  container.replaceChildren(shield, level, balances, label, bar, heading, badges.childElementCount ? badges : empty, levels);
  return progress;
}

export function renderLegacyRewards(container, summary, { request, decide }) {
  const document = container.ownerDocument;
  const states = { solicitado: 'Solicitado', aprovado: 'Aprovado', entregue: 'Entregue', cancelado: 'Cancelado' };
  const actions = { aprovado: 'Aprovar', entregue: 'Marcar como entregue', cancelado: 'Cancelar' };
  const section = document.createElement('details');
  section.dataset.legacyRewards = '';
  const heading = document.createElement('summary');
  heading.textContent = request ? 'Central de recompensas' : 'Resgates do aluno';
  section.append(heading);
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  section.append(status);

  function action(row, label, execute, disabled = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secundario';
    button.textContent = label;
    button.disabled = disabled;
    button.onclick = async () => {
      button.disabled = true;
      try { await execute(); }
      catch { status.textContent = 'Não foi possível concluir. Atualize os dados e tente novamente.'; }
      finally { button.disabled = false; }
    };
    row.append(button);
  }

  function row(text) {
    const card = document.createElement('div');
    card.className = 'card';
    const label = document.createElement('p');
    label.textContent = text;
    card.append(label);
    section.append(card);
    return card;
  }

  if (request) for (const item of summary.recompensas) {
    const suficiente = Number(summary.energia) >= item.custo;
    const card = row(`${item.nome} · ${formatNumber.format(item.custo)} WAND ENERGY`);
    for (const text of [item.descricao, item.condicoes].filter(Boolean)) {
      const description = document.createElement('p');
      description.textContent = text;
      card.append(description);
    }
    let key;
    action(card, suficiente ? 'Solicitar resgate' : 'Energia insuficiente',
      () => request(item.id, key ??= globalThis.crypto.randomUUID()), !suficiente);
  }
  if (!summary.resgates.length) row('Nenhum resgate registrado.');
  for (const item of summary.resgates) {
    const card = row(`${item.nome} · ${states[item.estado]} · ${formatNumber.format(item.custo)} WAND ENERGY`);
    if (!decide) continue;
    const transitions = item.estado === 'solicitado' ? ['aprovado', 'cancelado']
      : item.estado === 'aprovado' ? ['entregue', 'cancelado'] : [];
    for (const state of transitions) action(card, actions[state], () => decide(item.id, state));
  }
  container.append(section);
  return section;
}

export function renderLegacyHistory(container, history) {
  const document = container.ownerDocument;
  const section = document.createElement('details');
  section.dataset.legacyHistory = '';
  const title = document.createElement('summary');
  title.textContent = 'Histórico de XP e energia';
  const list = document.createElement('ul');
  for (const event of history) {
    const item = document.createElement('li');
    const date = formatDate.format(new Date(event.criado_em));
    const code = event.codigo.replaceAll('_', ' ');
    item.textContent = `${date} · ${code} · +${formatNumber.format(event.xp)} XP · +${formatNumber.format(event.energia)} WAND ENERGY`;
    list.append(item);
  }
  if (!history.length) {
    const item = document.createElement('li');
    item.textContent = 'Nenhum crédito registrado.';
    list.append(item);
  }
  section.append(title, list);
  container.append(section);
}

export function renderLegacyMissions(container, missions, { assign, update }) {
  const document = container.ownerDocument;
  const section = document.createElement('details');
  section.dataset.legacyMissions = '';
  const title = document.createElement('summary');
  title.textContent = assign ? 'Missões e metas do aluno' : 'Minhas missões';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  section.append(title, status);
  async function execute(button, operation) {
    button.disabled = true;
    try { await operation(); }
    catch { status.textContent = 'Não foi possível atualizar a missão.'; }
    finally { button.disabled = false; }
  }
  if (assign) {
    const form = document.createElement('form');
    const name = document.createElement('input');
    name.required = true;
    name.maxLength = 160;
    name.placeholder = 'Título da missão';
    name.setAttribute('aria-label', 'Título da missão');
    const category = document.createElement('select');
    category.setAttribute('aria-label', 'Categoria da missão');
    const categories = {
      missao: 'Acompanhamento', meta_curta: 'Meta de curto prazo', meta_media: 'Meta de médio prazo',
      meta_longa: 'Meta de longo prazo', forca: 'Força', mobilidade: 'Mobilidade',
      resistencia: 'Resistência', composicao: 'Composição corporal', reconhecimento: 'Reconhecimento do personal',
    };
    for (const [code, label] of Object.entries(categories)) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = label;
      category.append(option);
    }
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Atribuir missão';
    form.append(name, category, button);
    form.onsubmit = event => {
      event.preventDefault();
      execute(button, () => assign(name.value, category.value));
    };
    section.append(form);
  }
  for (const mission of missions) {
    const card = document.createElement('div');
    card.className = 'card';
    const label = document.createElement('p');
    const states = { atribuida: 'Atribuída', em_validacao: 'Aguardando validação', validada: 'Concluída' };
    label.textContent = `${mission.titulo} · ${states[mission.estado]}`;
    card.append(label);
    if (assign ? mission.estado === 'em_validacao' : mission.estado === 'atribuida') {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = assign ? 'Validar conclusão' : 'Enviar para validação';
      button.onclick = () => execute(button, () => update(mission.id, assign ? 'validada' : 'em_validacao'));
      card.append(button);
    }
    section.append(card);
  }
  if (!missions.length) status.textContent = 'Nenhuma missão atribuída.';
  container.append(section);
  return section;
}
