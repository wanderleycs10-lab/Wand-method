// Adicione apenas pares de vídeos e prévias aprovados, indexados pelo slug.
export const approvedExerciseVideos = Object.freeze({});

export function showExerciseVideo(container, title, media) {
  const document = container.ownerDocument;
  const section = document.createElement('section');
  section.style.cssText = 'margin-block:.75rem;min-width:0';
  const label = document.createElement('label');
  label.textContent = 'Modelo ';
  const model = document.createElement('select');
  for (const [value, description] of [['feminino', 'Feminino'], ['masculino', 'Masculino']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = description;
    model.append(option);
  }
  label.append(model);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'secundario';
  trigger.setAttribute('aria-label', 'Reproduzir demonstração de ' + title);
  trigger.style.cssText = 'display:block;position:relative;width:min(100%,840px);padding:0;overflow:hidden;margin-block:.5rem;background:#000';
  const poster = document.createElement('img');
  poster.alt = '';
  poster.width = 1280;
  poster.height = 720;
  poster.loading = 'lazy';
  poster.style.cssText = 'display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:contain';
  const icon = document.createElement('span');
  icon.textContent = '▶';
  icon.setAttribute('aria-hidden','true');
  icon.style.cssText = 'display:grid;place-items:center;position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:3rem;aspect-ratio:1;border-radius:50%;background:#eac45e;color:#100d08';
  const setPoster = () => { poster.src = media[model.value].poster; };
  model.addEventListener('change', setPoster);
  setPoster();
  trigger.append(poster,icon);
  section.append(label,trigger);
  container.append(section);

  trigger.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', 'Demonstração de ' + title);
    dialog.style.cssText = 'width:min(880px,calc(100% - 1rem));max-height:calc(100% - 1rem);padding:1rem;background:#111;color:#fff;border:1px solid #b0995b;border-radius:14px';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Fechar';
    close.className = 'secundario';
    close.autofocus = true;
    close.addEventListener('click', () => dialog.close());
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.poster = media[model.value].poster;
    video.style.cssText = 'display:block;width:100%;max-height:68dvh;background:#000;margin-block:.5rem';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'secundario';
    play.textContent = 'Reproduzir';
    const toggle = () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    };
    play.addEventListener('click', toggle);
    video.addEventListener('play', () => { play.textContent = 'Pausar'; });
    video.addEventListener('pause', () => { play.textContent = 'Reproduzir'; });
    const rateLabel = document.createElement('label');
    rateLabel.textContent = 'Velocidade ';
    const rate = document.createElement('select');
    for (const [value, text] of [['0.5','0,5×'],['1','1×'],['1.5','1,5×']]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      rate.append(option);
    }
    rate.value = '1';
    rate.addEventListener('change', () => { video.playbackRate = Number(rate.value); });
    rateLabel.append(rate);
    const full = document.createElement('button');
    full.type = 'button';
    full.textContent = 'Tela cheia';
    full.className = 'secundario';
    full.hidden = !document.fullscreenEnabled && typeof video.webkitEnterFullscreen !== 'function';
    full.addEventListener('click', () => {
      if (document.fullscreenEnabled) {
        const transition = document.fullscreenElement === video ? document.exitFullscreen() : video.requestFullscreen();
        transition.catch(() => {});
      } else if (video.readyState >= 1) video.webkitEnterFullscreen?.();
    });
    const status = document.createElement('p');
    status.setAttribute('role','status');
    status.hidden = true;
    video.addEventListener('error', () => {
      status.textContent = 'A demonstração está indisponível.';
      status.hidden = false;
      play.disabled = true;
    });
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap;align-items:center';
    controls.append(play,rateLabel,full);
    dialog.append(close,video,controls,status);
    dialog.addEventListener('close', () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      dialog.remove();
      if (trigger.isConnected) trigger.focus({preventScroll:true});
    }, {once:true});
    section.append(dialog);
    dialog.showModal();
    video.src = media[model.value].video;
    video.play().catch(() => {});
  });
}
