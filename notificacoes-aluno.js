/* WAND METHOD | Central de notificacoes do aluno.
 * Fonte inicial: solicitacoes fotograficas pendentes. Outras fontes
 * podem ser adicionadas sem criar novos botoes no painel. */
(async()=>{
  'use strict';
  if(window.__wandNotificacoesAluno)return;
  window.__wandNotificacoesAluno=true;
  const barra=document.getElementById('wandAlunoNotificacoes');
  const contador=document.getElementById('wandAlunoNotificacoesQtd');
  const lista=document.getElementById('wandAlunoNotificacoesLista');
  const alternar=document.getElementById('wandAlunoNotificacoesAbrir');
  if(!barra||!contador||!lista||!alternar)return;
  let db=null,alunoId=null,ocupado=false;
  const adicionar=(tag,texto,pai)=>{const el=document.createElement(tag);if(texto!==undefined)el.textContent=texto;pai.append(el);return el};
  function abrirFotografias(){
    const botao=document.querySelector('[data-view="fotografica"]');
    if(botao){botao.click();lista.hidden=true;alternar.setAttribute('aria-expanded','false');}
  }
  function render(itens){
    contador.textContent=String(itens.length);
    contador.hidden=itens.length===0;
    lista.replaceChildren();
    if(!itens.length){adicionar('p','Nenhuma solicitação pendente.',lista);return;}
    for(const item of itens){
      const botao=adicionar('button',undefined,lista);
      botao.type='button';botao.className='wand-aluno-notificacao-item';
      adicionar('strong',item.titulo,botao);
      adicionar('small',item.detalhe,botao);
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
      render((data||[]).map(p=>({
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
  alternar.addEventListener('click',()=>{
    lista.hidden=!lista.hidden;
    alternar.setAttribute('aria-expanded',String(!lista.hidden));
    if(!lista.hidden)atualizar();
  });
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
    barra.hidden=false;
    await atualizar();
  }catch(e){console.warn('[WAND] Central do aluno indisponível:',e);}
})();
