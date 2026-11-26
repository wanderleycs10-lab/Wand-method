const exercises = [
  ['079b68ab-ac22-4113-b67e-57f6170dd21c', 'Supino reto com barra', 'supino-reto-com-barra'],
  ['fa5df6cc-3e91-4929-9b08-03d8b121da60', 'Agachamento livre', 'agachamento-livre'],
  ['36e2370d-c28b-475d-8e30-d06a72502336', 'Puxada frontal', 'puxada-frontal'],
  ['69f1303a-f9ef-407f-945e-df9e37de8270', 'Crucifixo com halteres', 'crucifixo-com-halteres'],
  ['1b232d0f-dd12-492d-bf8e-f20f8d2b6ef4', 'Rosca Direta c/Barra W', 'rosca-direta-barra-w'],
  ['f008e760-cdb5-46e8-abe7-8536c0ad8971', 'Tríceps na polia', 'triceps-na-polia'],
  [null, 'Elevação lateral com halteres', 'elevacao-lateral-com-halteres'],
  [null, 'Panturrilha em pé', 'panturrilha-em-pe'],
  [null, 'Remada curvada com barra', 'remada-curvada-com-barra'],
  [null, 'Desenvolvimento sentado com halteres', 'desenvolvimento-sentado-com-halteres'],
];
const normalize = value => String(value ?? '').trim().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function showExercisePilot(container, exercise, source = 'library') {
  const match = exercises.find(([id, name]) =>
    source === 'training' || !id ? normalize(exercise.nome) === normalize(name) : exercise.id === id);
  if (!match) return false;
  const [, name, slug] = match;
  const assetPath = './imagens/exercicios/' + slug;

  const document = container.ownerDocument;
  const details = document.createElement('details');
  details.style.marginBlock = '.75rem';
  details.style.minWidth = '0';
  const heading = document.createElement('summary');
  heading.textContent = 'Demonstração · ' + name;
  heading.style.cursor = 'pointer';
  const image = document.createElement('img');
  image.alt = 'Execução ilustrada de ' + name + '. Músculos principais em dourado intenso e auxiliares em dourado suave.';
  image.width = 1000;
  image.height = 615;
  image.loading = 'lazy';
  image.style.cssText = 'display:block;width:100%;max-width:840px;max-height:55dvh;height:auto;object-fit:contain;margin:.75rem 0;border-radius:12px';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'secundario';
  const modelLabel = document.createElement('label');
  modelLabel.textContent = 'Modelo ';
  const model = document.createElement('select');
  for (const [value, label] of [['feminino', 'Feminino'], ['masculino', 'Masculino']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    model.append(option);
  }
  modelLabel.append(model);
  const pose = document.createElement('button');
  pose.type = 'button';
  pose.className = 'secundario';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px';
  controls.append(modelLabel, play, pose);
  if (slug === 'supino-reto-com-barra') {
    const pdf = document.createElement('a');
    pdf.href = assetPath + '.pdf?v=2';
    pdf.target = '_blank';
    pdf.rel = 'noopener';
    pdf.textContent = 'Abrir ficha em PDF (modelo feminino)';
    controls.append(pdf);
  }
  let mode = 'start';
  function show(next) {
    mode = next;
    const file = { start: '-inicio.webp', end: '-fim.webp', loop: '.gif' }[mode];
    image.src = assetPath + '-' + model.value + file;
    play.textContent = mode === 'loop' ? 'Parar sequência' : 'Reproduzir sequência';
    pose.textContent = mode === 'end' ? 'Ver posição inicial' : 'Ver posição final';
  }
  model.value = 'feminino';
  model.onchange = () => show(mode);
  play.onclick = () => show(mode === 'loop' ? 'start' : 'loop');
  pose.onclick = () => show(mode === 'end' ? 'start' : 'end');
  details.addEventListener('toggle', () => { if (!details.open && mode === 'loop') show('start'); });
  show('start');
  details.open = source === 'library';
  details.append(heading, image, controls);
  container.append(details);
  return true;
}
