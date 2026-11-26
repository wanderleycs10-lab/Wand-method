const supinoId = '079b68ab-ac22-4113-b67e-57f6170dd21c';
const assetPath = './imagens/exercicios/supino-reto-com-barra';

export function showExercisePilot(container, exercise, source = 'library') {
  const matches = source === 'training'
    ? String(exercise.nome ?? '').trim().toLowerCase() === 'supino reto com barra'
    : exercise.id === supinoId;
  if (!matches) return false;

  const document = container.ownerDocument;
  const details = document.createElement('details');
  details.style.marginBlock = '.75rem';
  details.style.minWidth = '0';
  const heading = document.createElement('summary');
  heading.textContent = 'Demonstração · Supino reto com barra';
  heading.style.cursor = 'pointer';
  const image = document.createElement('img');
  image.alt = 'Execução ilustrada do supino reto com barra. Peitoral maior em dourado intenso, tríceps e deltoide anterior em dourado suave.';
  image.width = 1000;
  image.height = 615;
  image.loading = 'lazy';
  image.style.cssText = 'display:block;width:100%;max-width:840px;max-height:55dvh;height:auto;object-fit:contain;margin:.75rem 0;border-radius:12px';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'secundario';
  const pdf = document.createElement('a');
  pdf.href = assetPath + '.pdf?v=2';
  pdf.target = '_blank';
  pdf.rel = 'noopener';
  pdf.textContent = 'Abrir ficha em PDF';
  const pose = document.createElement('button');
  pose.type = 'button';
  pose.className = 'secundario';
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px';
  controls.append(play, pose, pdf);
  let mode = 'high';
  function show(next) {
    mode = next;
    const file = { high: '-capa.png', low: '-posicao-baixa.png', loop: '.gif' }[mode];
    image.src = assetPath + file + '?v=2';
    play.textContent = mode === 'loop' ? 'Parar sequência' : 'Reproduzir sequência';
    pose.textContent = mode === 'low' ? 'Ver posição alta' : 'Ver posição baixa';
  }
  play.onclick = () => show(mode === 'loop' ? 'high' : 'loop');
  pose.onclick = () => show(mode === 'low' ? 'high' : 'low');
  details.addEventListener('toggle', () => { if (!details.open && mode === 'loop') show('high'); });
  show('high');
  details.open = source === 'library';
  details.append(heading, image, controls);
  container.append(details);
  return true;
}
