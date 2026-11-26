/* WAND METHOD | Central de notificacoes do aluno.
 * Fonte inicial: solicitacoes fotograficas pendentes. Outras fontes
 * podem ser adicionadas sem criar novos botoes no painel. */
(async()=>{
  'use strict';
  if(window.__wandNotificacoesAluno)return;
  window.__wandNotificacoesAluno=true;
  const contador=document.getElementById('wandAlunoNotificacoesQtd');
  const lista=document.getElementById('wandAlunoNotificacoesLista');
  const alternar=document.getElementById('wandAlunoNotificacoesAbrir');
  if(!contador||!lista||!alternar)return;
  let db=null,alunoId=null,ocupado=false;
  const adicionar=(tag,texto,pai)=>{const el=document.createElement(tag);if(texto!==undefined)el.textContent=texto;pai.append(el);return el};
  function abrirFotografias(){
    window.wandMostrarVista?.('fotografica');
  }
  function render(itens){
    contador.textContent=String(itens.length);
    contador.hidden=false;
    lista.replaceChildren();
    if(!itens.length){adicionar('p','Nenhuma solicitação pendente.',lista);return;}
    for(const item of itens){
      const botao=adicionar('button',undefined,lista);
      botao.type='button';botao.className='wand-aluno-notificacao-item';
      const icone=adicionar('span',undefined,botao);
      icone.className='wand-aluno-notificacoes-icone';
      const desenho=item.legacy
        ? '<path d="M12 2 21 6 19 15 12 22 5 15 3 6Z"/><path d="m13 5-5 8h4l-1 6 5-9h-4z"/>'
        : '<path d="M4 7h4l2-2h4l2 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="3.5"/>';
      icone.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+desenho+'</svg>';
      const texto=adicionar('span',undefined,botao);
      adicionar('strong',item.titulo,texto);
      adicionar('small',item.detalhe,texto);
      botao.addEventListener('click',item.abrir);
    }
  }
  async function atualizar(){
    if(ocupado||!db||!alunoId)return;
    ocupado=true;
    try{
      const {data,error}=await db.from('wand_solicitacoes_fotograficas')
        .select('id,criada_em').eq('aluno_id',alunoId)
        .eq('status','pendente').order('criada_em',{ascending:false}).limit(20);
      if(error)throw error;
      // A avaliacao fotografica ja mostra o pedido no menu. Se a
      // consulta paralela estiver atrasada, manter o mesmo aviso na central.
      const pedidos=(data||[]).length ? data : (
        document.querySelector('[data-view="fotografica"] [data-wand-foto-aviso]')
          ? [{id:'pedido-visivel-no-modulo'}] : []
      );
      const itens=pedidos.map(p=>({
        titulo:'Fotografias solicitadas pelo treinador',
        detalhe:'Toque para abrir a Avaliação Fotográfica.',
        abrir:abrirFotografias
      }));
      const autorizacao=await db.from('wand_pedidos_autorizacao_foto')
        .select('id,solicitado_em').eq('aluno_id',alunoId).eq('status','pendente')
        .order('solicitado_em',{ascending:false}).limit(10);
      if(!autorizacao.error){
        for(const pedido of autorizacao.data||[])itens.push({
          titulo:'Autorização fotográfica solicitada',
          detalhe:'Seu treinador pediu sua autorização. Toque para ler o termo e escolher se deseja autorizar.',
          abrir:abrirFotografias
        });
      }else console.warn('[WAND] Pedidos de autorização fotográfica indisponíveis',autorizacao.error);
      const fisica=await db.rpc('wand_aluno_avaliacoes_pendentes');
      if(!fisica.error)for(const p of fisica.data||[])itens.push({titulo:'Avaliação física solicitada',detalhe:'Toque para enviar suas medidas ao treinador.',abrir:()=>location.assign('minha-avaliacao-fisica.html')});
      else console.warn('[WAND] Avaliações físicas indisponíveis',fisica.error);
      const internas=await db.rpc('wand_minhas_notificacoes');
      if(!internas.error)for(const p of internas.data||[])if(p.tipo==='solicitacao_ciclo'&&!p.lida_em)itens.push({titulo:'Solicitação de registro menstrual',detalhe:'Seu treinador solicitou a atualização do registro. O preenchimento é voluntário.',abrir:async()=>{await db.rpc('wand_ler_notificacao',{p_id:p.id});window.wandAbrirRegistroMenstrual?.();atualizar();}});
      const legacy=await db.rpc('wand_legacy_avisos');
      if(!legacy.error)for(const aviso of legacy.data||[])itens.push({
        titulo:aviso.titulo,detalhe:'Abrir WAND LEGACY',legacy:true,
        abrir:async()=>{
          window.wandAbrirLegacy?.(aviso.destino);
          await db.rpc('wand_legacy_ler_aviso',{p_id:aviso.id});
          atualizar();
        }
      });
      render(itens);
    }catch(e){
      console.warn('[WAND] Falha ao consultar notificações do aluno:',e);
      lista.replaceChildren();
      adicionar('p','Não foi possível atualizar as notificações. Tente novamente.',lista);
    }finally{ocupado=false;}
  }
  // O modulo de fotografias ja consulta o pedido real. Reutilizamos esse
  // resultado para impedir divergencia entre o aviso do menu e a central.
  document.addEventListener('wand:solicitacao-fotografica',atualizar);
  alternar.addEventListener('click',()=>{atualizar()});
  window.addEventListener('focus',()=>{if(!document.hidden)atualizar()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)atualizar()});
  document.addEventListener('wand:fotografias-atualizadas',atualizar);
  document.addEventListener('wand:autorizacao-fotografica-atualizada',atualizar);
  try{
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    db=createClient('https://kvxdnreipuahoaostlle.supabase.co','sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo');
    const {data:{user},error:authError}=await db.auth.getUser();
    if(authError||!user)return;
    const {data,error}=await db.from('alunos').select('id').eq('user_id',user.id).single();
    if(error||!data)return;
    alunoId=data.id;
    await atualizar();
  }catch(e){console.warn('[WAND] Central do aluno indisponível:',e);}
})();
