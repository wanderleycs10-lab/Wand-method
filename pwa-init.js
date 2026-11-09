// Instalação e atualizações do WAND METHOD; não força recarga durante treinos.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
 window.addEventListener('load', () => {
  navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'})
   .then(reg => {reg.update().catch(()=>{});})
   .catch(err => console.warn('PWA indisponível:', err));
 });
}
