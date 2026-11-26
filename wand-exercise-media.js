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
  image.width = 840;
  image.height = 532;
  image.loading = 'lazy';
  image.style.cssText = 'display:block;width:100%;max-width:840px;max-height:55dvh;height:auto;object-fit:contain;margin:.75rem 0;border-radius:12px';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'secundario';
  const pdf = document.createElement('a');
  pdf.href = assetPath + '.pdf';
  pdf.target = '_blank';
  pdf.rel = 'noopener';
  pdf.textContent = 'Abrir ficha em PDF';
  pdf.style.marginInlineStart = '.75rem';
  let playing = false;
  function setPlaying(next) {
    playing = next;
    image.src = assetPath + (next ? '.gif' : '-capa.png');
    play.textContent = next ? 'Pausar animação' : 'Reproduzir animação';
  }
  play.onclick = () => setPlaying(!playing);
  details.addEventListener('toggle', () => { if (!details.open && playing) setPlaying(false); });
  setPlaying(false);
  details.open = source === 'library';
  details.append(heading, image, play, pdf);
  container.append(details);
  return true;
}
