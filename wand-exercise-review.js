import {showYouTubeExercise, youtubeId} from './wand-youtube.js';

export function setupExerciseReview({supabase, edit, openVideo, refreshLibrary, confirm}) {
  const element = id => document.getElementById(id);
  const panel = element('revisaoExercicios');
  const list = element('listaRevisao');
  const selected = new Set();
  const pageSize = 12;
  let page = 0;
  let total = 0;
  let busy = false;
  let request = 0;
  let mediaOnly = false;

  function button(text, action, className = 'secundario') {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = className;
    result.textContent = text;
    result.addEventListener('click', action);
    return result;
  }

  function sync() {
    element('aprovarSelecao').disabled = busy || !selected.size;
    element('aprovarSelecao').textContent = selected.size
      ? 'Aprovar exercícios selecionados (' + selected.size + ')'
      : 'Aprovar exercícios selecionados';
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = 'exercicio revisao-card';
    const heading = document.createElement('h3');
    heading.textContent = item.nome;
    const label = document.createElement('label');
    label.className = 'revisao-selecao';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = selected.has(item.id);
    check.setAttribute('aria-label','Selecionar ' + item.nome);
    check.addEventListener('change', () => {
      if (check.checked) selected.add(item.id);
      else selected.delete(item.id);
      sync();
    });
    label.append(check, 'Selecionar exercício');
    article.append(heading, label);
    for (const [title, value] of [
      ['Grupo muscular',item.grupo_muscular], ['Músculos primários',item.musculos_primarios || item.grupo_muscular],
      ['Músculos secundários',item.musculos_secundarios], ['Equipamento',item.equipamento],
      ['Orientações de execução',item.instrucoes],
      ['Erros comuns',item.erros_comuns],
    ]) {
      const info = document.createElement('p');
      const name = document.createElement('strong');
      name.textContent = title + ' ';
      info.append(name,value || 'A preencher');
      article.append(info);
    }
    const media = document.createElement('div');
    media.className = 'revisao-media';
    const video = mediaOnly ? {...item,video_tipo:'youtube',video_url:item.video_proposto_url} : item;
    if (!showYouTubeExercise(media,video)) {
      if (item.video_tipo === 'proprio') media.append(button('Ver vídeo', event => openVideo(item,event.currentTarget)));
      else media.textContent = 'Vídeo ainda não cadastrado.';
    }
    article.append(media);
    const actions = document.createElement('div');
    actions.className = 'acoes';
    if (mediaOnly) actions.append(
      button('Aprovar substituição', () => decideMedia(item,true), 'revisao-primario'),
      button('Editar proposta', () => propose(item)),
      button('Rejeitar substituição', () => decideMedia(item,false), 'perigo'),
    );
    else actions.append(
      button('Aprovar exercício', () => decide([item.id],true), 'revisao-primario'),
      button('Editar informações', () => edit(item,false)),
      button('Substituir vídeo', () => edit(item,true)),
      button('Rejeitar exercício', () => decide([item.id],false), 'perigo'),
    );
    article.append(actions);
    label.hidden = mediaOnly;
    return article;
  }

  async function load() {
    const current = ++request;
    const query = supabase.from('wand_exercicios').select(panel.hidden ? 'id' : '*', {
      count:'exact',head:panel.hidden,
    }).eq(mediaOnly?'status_revisao_midia':'status_revisao','pendente');
    if (mediaOnly) query.eq('ativo',true);
    const other = supabase.from('wand_exercicios').select('id',{count:'exact',head:true})
      .eq(mediaOnly?'status_revisao':'status_revisao_midia','pendente');
    if (!mediaOnly) other.eq('ativo',true);
    if (!panel.hidden) query.order('nome').order('id').range(page*pageSize,(page+1)*pageSize-1);
    const [{data,count,error},alternate] = await Promise.all([query,other]);
    if (current !== request) return;
    if (error) {
      element(mediaOnly?'totalMidias':'totalPendentes').textContent = '—';
      element('statusRevisao').textContent = 'Não foi possível consultar os exercícios pendentes.';
      return;
    }
    total = count ?? 0;
    element(mediaOnly?'totalMidias':'totalPendentes').textContent = total;
    element(mediaOnly?'totalPendentes':'totalMidias').textContent = alternate.error?'—':alternate.count ?? 0;
    if (panel.hidden) return;
    if (page > 0 && page * pageSize >= total) {
      page = Math.max(0,Math.ceil(total/pageSize)-1);
      return load();
    }
    list.replaceChildren(...data.map(card));
    element('vazioRevisao').hidden = Boolean(total);
    element('paginacaoRevisao').hidden = total <= pageSize;
    element('revisaoAnterior').disabled = !page;
    element('revisaoProxima').disabled = (page+1)*pageSize >= total;
    element('paginaRevisao').textContent = 'Página ' + (page+1) + ' de ' + Math.max(1,Math.ceil(total/pageSize));
    sync();
  }

  async function decide(ids, approve) {
    if (busy || !ids.length) return;
    busy = true;
    sync();
    const status = element('statusRevisao');
    try {
      if (!await confirm(approve
        ? 'Aprovar ' + ids.length + ' exercício(s) para prescrição?'
        : 'Rejeitar este exercício? Ele sairá da fila de revisão.')) return;
      status.textContent = '';
      const {data,error} = await supabase.from('wand_exercicios')
        .update({ativo:approve,status_revisao:approve?'aprovado':'rejeitado'})
        .eq('status_revisao','pendente').in('id',ids).select('id');
      if (error) throw error;
      for (const id of ids) selected.delete(id);
      await refreshLibrary();
      if (data.length) {
        element('textoSucessoRevisao').textContent = approve
          ? data.length + ' exercício(s) disponíveis para prescrição.'
          : 'Exercício rejeitado.';
        element('sucessoRevisao').showModal();
      }
      if (data.length !== ids.length) status.textContent = 'Alguns exercícios já haviam saído da fila.';
    } catch (error) {
      status.textContent = 'Não foi possível concluir a revisão. ' + error.message;
    } finally {
      busy = false;
      sync();
    }
  }

  async function decideMedia(item, approve) {
    if (busy) return;
    busy = true;
    try {
      if (!await confirm(approve ? 'Substituir a mídia de ' + item.nome + '?' : 'Rejeitar a proposta de vídeo?')) return;
      const {data,error} = await supabase.rpc('wand_decidir_midia_exercicio',{
        p_id:item.id,p_url:item.video_proposto_url,p_aprovar:approve,
      });
      if (error) throw error;
      if (!data) throw new Error('A proposta mudou. Atualize a fila e revise novamente.');
      await refreshLibrary();
      success(approve?'Vídeo atualizado no mesmo exercício.':'Proposta rejeitada. A mídia atual foi preservada.');
    } catch(error) {
      element('statusRevisao').textContent = 'Não foi possível concluir a revisão. ' + error.message;
    } finally {
      busy = false;
    }
  }

  function success(message) {
    element('textoSucessoRevisao').textContent = message;
    element('sucessoRevisao').showModal();
  }

  function propose(item) {
    const dialog = element('propostaMidia');
    const form = element('formPropostaMidia');
    const errorBox = element('erroPropostaMidia');
    const input = element('linkPropostaMidia');
    errorBox.textContent = '';
    element('nomePropostaMidia').textContent = item.nome;
    input.value = item.status_revisao_midia==='pendente' ? item.video_proposto_url : '';
    form.onsubmit = async event => {
      event.preventDefault();
      const id = youtubeId(input.value.trim());
      if (!id) { errorBox.textContent = 'Informe um link válido do YouTube.';return; }
      const save = form.querySelector('[type=submit]');
      save.disabled = true;
      try {
        const {data,error} = await supabase.from('wand_exercicios')
          .update({video_proposto_url:'https://www.youtube.com/watch?v='+id,status_revisao_midia:'pendente'})
          .eq('id',item.id).eq('ativo',true).select('id');
        if (error) throw error;
        if (!data.length) throw new Error('O exercício não está mais ativo.');
        dialog.close();
        location.hash = '#revisao-midia';
        await load();
        success('Proposta enviada para revisão.');
      } catch(error) { errorBox.textContent = error.message; }
      finally { save.disabled = false; }
    };
    dialog.showModal();
  }

  element('formImportarRevisao').onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const errorBox = element('erroImportarRevisao');
    const save = form.querySelector('[type=submit]');
    save.disabled = true;
    errorBox.textContent = '';
    try {
      const file = element('arquivoImportarRevisao').files[0];
      if (!file || file.size > 1024*1024) throw new Error('Selecione um arquivo JSON de até 1 MB.');
      const rows = JSON.parse(await file.text());
      if (!Array.isArray(rows)) throw new Error('O arquivo deve conter uma lista de exercícios.');
      const {data,error} = await supabase.rpc('wand_importar_exercicios_revisao',{p_lote:rows});
      if (error) throw error;
      element('importarRevisao').close();
      form.reset();
      await load();
      success(data.inseridos+' exercício(s) incluídos na fila. '+data.ignorados+' duplicado(s) ignorados.');
    } catch(error) { errorBox.textContent = 'Não foi possível importar. '+error.message; }
    finally { save.disabled = false; }
  };
  element('abrirImportarRevisao').onclick = () => { element('erroImportarRevisao').textContent='';element('importarRevisao').showModal(); };

  function route() {
    mediaOnly = location.hash === '#revisao-midia';
    const reviewing = mediaOnly || location.hash === '#revisao';
    page = 0;
    element('tituloRevisao').textContent = mediaOnly?'Substituições de mídia':'Exercícios pendentes de revisão';
    element('aprovarSelecao').hidden = mediaOnly;
    element('abrirImportarRevisao').hidden = mediaOnly;
    element('statusRevisao').textContent = '';
    panel.hidden = !reviewing;
    element('catalogoOficial').hidden = reviewing;
    if (!reviewing) list.replaceChildren();
    void load();
  }
  element('aprovarSelecao').onclick = () => decide([...selected],true);
  element('revisaoAnterior').onclick = () => { page--; void load(); };
  element('revisaoProxima').onclick = () => { page++; void load(); };
  window.addEventListener('hashchange',route);
  route();
  return {load,propose};
}
