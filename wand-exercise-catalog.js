import {showExercisePilot} from './wand-exercise-media.js?v=7';

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const alphabet = new Intl.Collator('pt-BR',{sensitivity:'base'});
let videoSequence = 0;

function button(document, label, className, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.setAttribute('aria-label',label);
  element.addEventListener('click',action);
  return element;
}

function icon(document, kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  const path = document.createElementNS(svg.namespaceURI,'path');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  path.setAttribute('d',{play:'M8 5v14l11-7z',add:'M12 5v14M5 12h14',check:'M5 12l4 4L19 6',detail:'m9 6 6 6-6 6'}[kind]);
  svg.append(path);
  return svg;
}

export function renderExerciseCatalog({items,list,pager,status,page,filters,onPage,onOpen,onToggle,selection,manage=false}) {
  const document = list.ownerDocument;
  const term = normalize(filters.name.trim());
  const results = items.filter(item =>
    normalize(item.nome).includes(term) &&
    (!filters.group || normalize(item.grupo_muscular) === normalize(filters.group)) &&
    (!filters.category || item.categoria === filters.category) &&
    (!filters.equipment || item.equipamento === filters.equipment)
  ).sort((a,b)=>alphabet.compare(a.nome,b.nome));
  const size = filters.size;
  const total = Math.max(1,Math.ceil(results.length/size));
  page = Math.min(page,total);
  status.textContent = results.length + ' exercício(s) · Página ' + page + ' de ' + total;
  list.replaceChildren();
  if (!results.length) list.textContent = 'Nenhum exercício encontrado.';
  for (const item of results.slice((page-1)*size,page*size)) {
    const row = document.createElement('article');
    row.className = 'wand-catalog-row';
    const open = button(document,(manage?'Gerenciar ':'Ver demonstração de ')+item.nome,'wand-catalog-open',event=>onOpen(item,event.currentTarget));
    const name = document.createElement('strong');
    name.textContent = item.nome;
    const meta = document.createElement('small');
    meta.textContent = [item.grupo_muscular || 'Grupo não informado',item.categoria || 'Sem categoria'].join(' · ');
    const text = document.createElement('span');
    text.append(name,meta);
    open.append(text,icon(document,manage?'detail':'play'));
    row.append(open);
    if (onToggle) {
      const state = selection(item);
      const toggle = button(document,(state==='undo'?'Desfazer adição de ':state?'Já adicionado: ':'Adicionar ')+item.nome,
        'wand-catalog-toggle',()=>onToggle(item));
      toggle.disabled = state === 'existing';
      toggle.dataset.exerciseId = String(item.id);
      if (state) toggle.classList.add('wand-catalog-selected');
      toggle.append(icon(document,state?'check':'add'));
      row.append(toggle);
    }
    list.append(row);
  }
  pager.replaceChildren();
  if (total>1) for (const [text,target,label] of [
    ['‹',page-1,'Página anterior'],
    ...Array.from({length:Math.min(total,5)},(_,i)=>{
      const n=Math.max(1,Math.min(page-2,total-4))+i;
      return [String(n),n,'Página '+n];
    }),
    ['›',page+1,'Próxima página'],
  ]) {
    const control = button(document,label,'secundario',()=>onPage(target));
    control.textContent = text;
    control.disabled = target<1 || target>total || target===page;
    if (target===page && !['‹','›'].includes(text)) control.setAttribute('aria-current','page');
    pager.append(control);
  }
  return page;
}

export async function openExerciseCatalogVideo(exercise, origin, loadPrivateVideo) {
  const document = origin.ownerDocument;
  const dialog = document.createElement('dialog');
  dialog.className = 'wand-catalog-video modal-card';
  const heading = document.createElement('h2');
  heading.id = 'wand-catalog-video-' + ++videoSequence;
  heading.textContent = exercise.nome;
  dialog.setAttribute('aria-labelledby',heading.id);
  const close = button(document,'Fechar vídeo','secundario',()=>dialog.close());
  close.textContent = 'Fechar vídeo';
  const top = document.createElement('div');
  top.className = 'wand-catalog-video-top';
  top.append(heading,close);
  const media = document.createElement('div');
  dialog.append(top,media);
  dialog.addEventListener('close',()=>{
    dialog.remove();
    if (origin.isConnected) origin.focus({preventScroll:true});
  },{once:true});
  document.body.append(dialog);
  dialog.showModal();
  if (showExercisePilot(media,exercise,'library',{direct:true})) return;
  if (exercise.video_tipo !== 'proprio' || !exercise.video_url) {
    media.textContent = 'Vídeo ainda não cadastrado.';
    return;
  }
  media.textContent = 'Carregando vídeo…';
  try {
    const url = await loadPrivateVideo(exercise.video_url);
    if (!dialog.open) return;
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.src = url;
    media.replaceChildren(video);
  } catch {
    media.textContent = 'Não foi possível abrir o vídeo.';
  }
}
