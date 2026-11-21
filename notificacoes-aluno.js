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
    contador.hidden=itens.length===0;
    lista.replaceChildren();
    if(!itens.length){adicionar('p','Nenhuma solicitação pendente.',lista);return;}
    for(const item of itens){
      const botao=adicionar('button',undefined,lista);
      botao.type='button';botao.className='wand-aluno-notificacao-item';
      const icone=adicionar('span','▣',botao);
      icone.className='wand-aluno-notificacoes-icone';
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
      render(pedidos.map(p=>({
        titulo:'Fotografias solicitadas pelo treinador',
        detalhe:'Toque para abrir a Avaliação Fotográfica.',
        abrir:abrirFotografias
      })));
    }catch(e){
      console.warn('[WAND] Falha ao consultar notificações do aluno:',e);
      lista.replaceChildren();
      adicionar('p','Não foi possível atualizar as notificações. Tente novamente.',lista);
    }finally{ocupado=false;}
  }
  // O modulo de fotografias ja consulta o pedido real. Reutilizamos esse
  // resultado para impedir divergencia entre o aviso do menu e a central.
  document.addEventListener('wand:solicitacao-fotografica',event=>{
    if(event.detail?.pendente){
      render([{titulo:'Fotografias solicitadas pelo treinador',
        detalhe:'Toque para abrir a Avaliação Fotográfica.',abrir:abrirFotografias}]);
    }else if(event.detail?.pendente===false){
      render([]);
    }
  });
  alternar.addEventListener('click',()=>{atualizar()});
  window.addEventListener('focus',()=>{if(!document.hidden)atualizar()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)atualizar()});
  document.addEventListener('wand:fotografias-atualizadas',atualizar);
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
