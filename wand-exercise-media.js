import {approvedExerciseVideos, showExerciseVideo} from './wand-exercise-videos.js';
import {showYouTubeExercise} from './wand-youtube.js?v=2';

const exercises = [
  ['079b68ab-ac22-4113-b67e-57f6170dd21c', 'Supino reto com barra', 'supino-reto-com-barra', 'lateral', 'Pegada pronada na barra.'],
  ['fa5df6cc-3e91-4929-9b08-03d8b121da60', 'Agachamento livre', 'agachamento-livre', 'frontal', 'Barra apoiada na parte alta das costas.'],
  ['36e2370d-c28b-475d-8e30-d06a72502336', 'Puxada frontal', 'puxada-frontal', 'lateral', 'Pegada pronada aberta. A barra desce à frente do corpo.'],
  ['69f1303a-f9ef-407f-945e-df9e37de8270', 'Crucifixo com halteres', 'crucifixo-com-halteres', '', 'Pegada neutra, sem rotação voluntária dos punhos durante o arco.'],
  ['1b232d0f-dd12-492d-bf8e-f20f8d2b6ef4', 'Rosca Direta c/Barra W', 'rosca-direta-barra-w', 'frontal', 'Pegada semissupinada nas curvas da barra W.'],
  ['f008e760-cdb5-46e8-abe7-8536c0ad8971', 'Tríceps na polia', 'triceps-na-polia', 'lateral', 'Pegada pronada no puxador reto.'],
  ['8379b5f6-07f7-43fb-b9d0-3a2419dd680c', 'Elevação lateral com halteres', 'elevacao-lateral-com-halteres', 'frontal', 'Punhos alinhados aos antebraços.'],
  ['32a8a16d-83f5-42e9-b01e-445505023d1a', 'Panturrilha em pé', 'panturrilha-em-pe', 'lateral', 'A parte da frente dos pés permanece apoiada.'],
  ['2672bc58-0b7e-40f0-8afe-9fcdce5bceff', 'Remada curvada com barra', 'remada-curvada-com-barra', 'lateral', 'Pegada pronada na barra.'],
  ['214f33ee-9488-4009-8d49-62c6aaee78d7', 'Desenvolvimento sentado com halteres', 'desenvolvimento-sentado-com-halteres', '', 'Pegada pronada do início ao fim, com as palmas voltadas para a frente.'],
];
const normalize = value => String(value ?? '').trim().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function showExercisePilot(container, exercise, source = 'library', {direct=false} = {}) {
  const catalogId = source === 'training' ? exercise.exercicio_id : exercise.id;
  const match = exercises.find(([id, name]) =>
    catalogId ? catalogId === id : normalize(exercise.nome) === normalize(name));
  if ((!match || exercise.midia_revisada_em) && showYouTubeExercise(container, exercise, {direct})) return true;
  if (exercise.video_tipo === 'proprio' && source !== 'training') return false;
  if (!match) return false;
  const [, name, slug, existingView, technique] = match;
  if (Object.hasOwn(approvedExerciseVideos, slug)) {
    showExerciseVideo(container, name, approvedExerciseVideos[slug]);
    return true;
  }
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
  const viewLabel = document.createElement('label');
  viewLabel.textContent = 'Vista ';
  const view = document.createElement('select');
  for (const [value, description] of [['lateral', 'Lateral'], ['frontal', 'Frontal']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = description;
    view.append(option);
  }
  viewLabel.append(view);
  const guidance = document.createElement('p');
  guidance.className = 'muted';
  const pose = document.createElement('button');
  pose.type = 'button';
  pose.className = 'secundario';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px';
  controls.append(modelLabel, viewLabel, play, pose);
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
    const suffix = view.value === existingView ? '' : '-' + view.value;
    image.src = assetPath + '-' + model.value + suffix + file;
    image.alt = name + ', modelo ' + model.value + ', vista ' + view.value
      + '. Músculos principais em dourado intenso e auxiliares em dourado suave.';
    guidance.textContent = slug === 'agachamento-livre'
      ? technique + (view.value === 'frontal' ? ' Observe a direção dos joelhos em relação aos pés.'
        : ' Observe o movimento do quadril, do tronco e o apoio dos pés.')
      : technique;
    if (suffix === '' && ['puxada-frontal','triceps-na-polia','panturrilha-em-pe','remada-curvada-com-barra','supino-reto-com-barra','elevacao-lateral-com-halteres'].includes(slug)) {
      guidance.textContent += ' Enquadramento em três quartos.';
    }
    play.textContent = mode === 'loop' ? 'Parar sequência' : 'Reproduzir sequência';
    pose.textContent = mode === 'end' ? 'Ver posição inicial' : 'Ver posição final';
  }
  model.value = 'feminino';
  view.value = 'lateral';
  model.onchange = () => show(mode);
  view.onchange = () => show(mode);
  play.onclick = () => show(mode === 'loop' ? 'start' : 'loop');
  pose.onclick = () => show(mode === 'end' ? 'start' : 'end');
  details.addEventListener('toggle', () => { if (!details.open && mode === 'loop') show('start'); });
  show(direct ? 'loop' : 'start');
  details.open = source === 'library';
  details.append(heading, image, controls);
  if (!direct) details.append(guidance);
  container.append(details);
  return true;
}
