let playerApi;

function loadPlayerApi(window) {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (playerApi) return playerApi;
  playerApi = new Promise((resolve,reject) => {
    const script = window.document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    const previous = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => reject(new Error('API indisponível')), 8000);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      try { previous?.(); } finally { resolve(window.YT); }
    };
    script.onerror = () => { window.clearTimeout(timer);reject(new Error('API indisponível')); };
    window.document.head.append(script);
  });
  return playerApi;
}

export function youtubeId(link) {
  try {
    const url = new URL(link);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '');
    const parts = url.pathname.split('/');
    let id;
    if (host === 'youtu.be') id = parts[1];
    else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else if (['embed', 'shorts', 'live'].includes(parts[1])) id = parts[2];
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
  } catch {
    return null;
  }
}

export function showYouTubeExercise(container, exercise) {
  if (exercise.video_tipo !== 'youtube') return false;
  const document = container.ownerDocument;
  const id = youtubeId(exercise.video_url);
  if (!id) {
    const error = document.createElement('p');
    error.textContent = 'Link do YouTube inválido.';
    container.append(error);
    return true;
  }
  const section = document.createElement('section');
  section.style.cssText = 'margin-block:.75rem;max-width:840px';
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.className = 'secundario';
  preview.setAttribute('aria-label', 'Reproduzir demonstração de ' + exercise.nome);
  preview.style.cssText = 'position:relative;display:block;width:100%;padding:0;overflow:hidden;background:#000;aspect-ratio:16/9';
  const image = document.createElement('img');
  image.alt = '';
  image.loading = 'lazy';
  image.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  image.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain';
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '▶';
  icon.style.cssText = 'position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:3rem;aspect-ratio:1;border-radius:50%;background:#eac45e;color:#100d08';
  preview.append(image, icon);
  const source = document.createElement('a');
  source.href = 'https://www.youtube.com/watch?v=' + id;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Assistir no YouTube';
  preview.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    const window = document.defaultView;
    const params = new URLSearchParams({autoplay:'1',playsinline:'1',enablejsapi:'1',origin:window.location.origin});
    frame.src = 'https://www.youtube.com/embed/' + id + '?' + params;
    frame.title = 'Demonstração de ' + exercise.nome + ' no YouTube';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.style.cssText = 'display:block;border:0;width:100%;min-height:200px;aspect-ratio:16/9';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'secundario';
    close.textContent = 'Fechar demonstração';
    const status = document.createElement('p');
    status.setAttribute('role','status');
    status.hidden = true;
    let player;
    close.addEventListener('click', () => {
      player?.destroy();
      frame.remove();
      status.remove();
      close.remove();
      preview.hidden = false;
      preview.style.display = 'block';
      preview.focus({preventScroll:true});
    });
    preview.hidden = true;
    preview.style.display = 'none';
    preview.after(close, frame, status);
    loadPlayerApi(window).then(YT => {
      if (!frame.isConnected || !YT?.Player) return;
      player = new YT.Player(frame,{events:{onError:() => {
        status.hidden = false;
        status.textContent = 'Vídeo indisponível neste player. Abra o link no YouTube ou solicite ao WandCoach uma substituição.';
      }}});
    }).catch(() => {});
    close.focus({preventScroll:true});
  });
  section.append(preview, source);
  container.append(section);
  return true;
}
