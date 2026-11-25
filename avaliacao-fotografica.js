function wandConclusaoLocal(mensagem){return new Promise(resolve=>{const d=document.createElement('dialog');d.setAttribute('aria-label','Concluído com sucesso');d.style.cssText='position:fixed;margin:auto;width:min(90vw,420px);max-height:90vh;box-sizing:border-box;border:1px solid #bda05c;border-radius:20px;background:#191919;color:#fff;padding:28px;text-align:center;box-shadow:0 0 0 100vmax #000b;z-index:2147483647;font-family:inherit';const h=document.createElement('h2');h.textContent='Concluído com sucesso!';h.style.color='#e8c674';const p=document.createElement('p');p.textContent=mensagem;p.style.whiteSpace='pre-line';const b=document.createElement('button');b.type='button';b.textContent='OK';b.style.cssText='width:100%;padding:14px;border:1px solid #e8c674;border-radius:12px;background:linear-gradient(145deg,#f1d58a,#a77a2d);color:#111;font-weight:bold;font-size:16px;cursor:pointer';d.append(h,p,b);document.body.append(d);d.addEventListener('cancel',e=>e.preventDefault());b.onclick=()=>{d.close();d.remove();resolve()};d.showModal();b.focus()})}

(() => {
  "use strict";

  if (window.__wandFotosV2) return;
  window.__wandFotosV2 = true;

  // WAND METHOD - Avaliação Fotográfica 2.2
  const URL_DB = "https://kvxdnreipuahoaostlle.supabase.co";
  const CHAVE_DB = "sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo";
  const BUCKET = "avaliacoes-fotograficas";
  const VERSAO = "2.1";

  const pagina = location.pathname.split("/").pop();
  const paginas = [
    "perfil-aluno.html",
    "aluno.html"
  ];

  if (!paginas.includes(pagina)) return;

  let db;
  let usuario;
  let aluno;
  let consentimento = null;
  let fotos = [];
  let solicitacaoPendente = null;
  let erroSolicitacao = false;
  let processando = false;
  const rascunhos = new Map(); // Apenas no aparelho, até confirmar envio.
  let exibirTermos = false;
  let guia = "masculino";
  let guiaAberto = false;
  let instrucoesAbertas = false;
  let autorizacoesAbertas = false;

  const estilo = document.createElement("style");

  estilo.textContent = `
    #wand-fotos {
      --ouro:#f5cc37;
      --fundo:#101010;
      --painel:#1d1d1d;
      --borda:#514627;
      display:block;
      visibility:visible;
      opacity:1!important;
      position:relative!important;
      width:100%;
      max-width:1100px;
      margin:28px auto;
      padding:22px;
      border:1px solid var(--borda);
      border-radius:18px;
      background:var(--fundo);
      color:#f4f4f4;
      font-family:Arial,Helvetica,sans-serif;
      box-sizing:border-box;
      clear:both;
    }

    #wand-fotos * {
      box-sizing:border-box;
    }

    #wand-fotos h2 {
      margin:0 0 10px;
      color:#fff;
      font-size:24px;
    }

    #wand-fotos h3 {
      color:var(--ouro);
      font-size:17px;
      margin:0 0 10px;
    }

    #wand-fotos p,
    #wand-fotos li {
      line-height:1.55;
    }

    #wand-fotos .wf-muted {
      color:#c5c5c5;
      font-size:14px;
    }

    #wand-fotos .wf-box {
      background:var(--painel);
      border:1px solid #424242;
      border-radius:13px;
      padding:16px;
      margin:15px 0;
    }

    #wand-fotos .wf-warning {
      background:#342a13;
      border-left:4px solid var(--ouro);
      border-radius:8px;
      padding:13px;
      margin:15px 0;
    }

    #wand-fotos .wf-grid {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
      margin:18px 0;
    }

    #wand-fotos .wf-card {
      background:#202020;
      border:1px solid #555;
      border-radius:12px;
      padding:10px;
      text-align:center;
      min-width:0;
    }

    #wand-fotos .wf-image {
      width:100%;
      aspect-ratio:3/4;
      background:#e9e7e3;
      border-radius:8px;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    #wand-fotos .wf-image img,
    #wand-fotos .wf-image svg {
      width:100%;
      height:100%;
      object-fit:contain;
    }

    #wand-fotos .wf-card strong {
      display:block;
      margin:10px 0;
    }

    #wand-fotos .wf-button {
      display:inline-block;
      background:var(--ouro);
      color:#101010;
      border:0;
      border-radius:9px;
      padding:11px 13px;
      margin:5px 0;
      font-size:13px;
      font-weight:bold;
      cursor:pointer;
      max-width:100%;
    }

    #wand-fotos .wf-button.secondary {
      background:#353535;
      color:#fff;
      border:1px solid #777;
    }

    #wand-fotos .wf-button:disabled {
      opacity:.5;
      cursor:not-allowed;
    }

    #wand-fotos .wf-card .wf-button {
      display:block;
      width:100%;
    }

    #wand-fotos .wf-actions {
      display:flex;
      flex-wrap:wrap;
      gap:9px;
      margin:12px 0;
    }

    #wand-fotos .wf-status {
      font-weight:bold;
      color:var(--ouro);
    }

    #wand-fotos label {
      display:block;
      margin:12px 0;
      line-height:1.5;
    }

    #wand-fotos input[type=checkbox],
    #wand-fotos input[type=radio] {
      accent-color:var(--ouro);
      margin-right:8px;
    }

    #wand-fotos .wf-term {
      white-space:pre-wrap;
      overflow:auto;
      max-height:200px;
      background:#101010;
      border:1px solid #555;
      border-radius:9px;
      padding:12px;
      font-size:12px;
      line-height:1.6;
      color:#ddd;
    }

    #wand-fotos .wf-error {
      color:#ff9999;
    }

    #wand-fotos .wf-success {
      color:#77e2a3;
    }

    #wand-fotos .wf-history {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px;
    }

    #wand-fotos .wf-history img {
      width:100%;
      aspect-ratio:3/4;
      object-fit:contain;
      background:#ddd;
      border-radius:8px;
    }

    #wand-fotos .wf-small {
      color:#bcbcbc;
      font-size:12px;
    }

    #wand-fotos .wf-disclosure{border:1px solid #63543b;border-radius:14px;background:linear-gradient(145deg,#292522,#151515 72%,#271c10);margin:12px 0;overflow:hidden}
    #wand-fotos .wf-disclosure>summary{cursor:pointer;list-style:none;padding:15px 17px;color:#f3d18a;font-size:16px;font-weight:600;display:flex;justify-content:space-between;align-items:center}
    #wand-fotos .wf-disclosure>summary::-webkit-details-marker{display:none}
    #wand-fotos .wf-disclosure>summary:after{content:'⌄';font-size:22px;color:#eac067}
    #wand-fotos .wf-disclosure[open]>summary:after{content:'⌃'}
    #wand-fotos .wf-disclosure-body{padding:0 15px 14px}
    #wand-fotos .wf-disclosure-body>.wf-box{margin:4px 0}
    #wand-fotos .wf-compact-status{margin:12px 0;padding:13px 16px;border:1px solid #655439;border-radius:13px;background:#211e19}
    #wand-fotos .wf-compact-status .wf-status{margin:0;font-size:15px}
    #wand-fotos .wf-guide-choice{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
    #wand-fotos .wf-guide-choice .wf-button{flex:1;min-width:130px}

    @media(max-width:600px) {
      #wand-fotos {
        padding:12px;
      }

      #wand-fotos .wf-grid,
      #wand-fotos .wf-history {
        gap:6px;
      }

      #wand-fotos .wf-card {
        padding:5px;
      }

      #wand-fotos .wf-card .wf-button {
        font-size:11px;
        padding:9px 4px;
      }
    }
  `;

  document.head.appendChild(estilo);

  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
  }

  function adicionar(pai, tag, classe, texto) {
    const elemento = criar(tag, classe, texto);
    pai.appendChild(elemento);
    return elemento;
  }

  function botao(texto, acao, secundario = false) {
    const elemento = criar(
      "button",
      "wf-button" + (secundario ? " secondary" : ""),
      texto
    );

    elemento.type = "button";
    elemento.addEventListener("click", acao);

    return elemento;
  }

  const container = criar("section");
  container.id = "wand-fotos";

  function montar() {
    if (!document.body) {
      document.addEventListener(
        "DOMContentLoaded",
        montar,
        { once:true }
      );
      return;
    }

    if (!container.isConnected) {
      (document.getElementById("area-fotos") || document.body).appendChild(container);
    }

    container.replaceChildren();

    adicionar(
      container,
      "h2",
      null,
      "WAND METHOD | Avaliação Fotográfica"
    );

    adicionar(
      container,
      "p",
      "wf-muted",
      "Preparando o registro fotográfico..."
    );
  }

  montar();

  function erroVisivel(erro) {
    console.error("[WAND FOTOS]", erro);

    container.replaceChildren();

    adicionar(
      container,
      "h2",
      null,
      "Avaliação Fotográfica"
    );

    adicionar(
      container,
      "p",
      "wf-error",
      "Não foi possível carregar o módulo: " +
      (erro?.message || String(erro))
    );

    container.appendChild(
      botao("Tentar novamente", iniciar)
    );
  }

  function mostrarMensagem(texto, falha = false) {
    let elemento = container.querySelector("#wf-mensagem");

    if (!elemento) {
      elemento = adicionar(container, "p");
      elemento.id = "wf-mensagem";
    }

    elemento.className = falha
      ? "wf-error"
      : "wf-success";

    elemento.textContent = texto;
  }

  function dataBR(valor) {
    if (!valor) return "—";

    return new Date(valor).toLocaleDateString("pt-BR");
  }

  function statusAtual() {
    return consentimento?.status_avaliacao || "pendente";
  }

  function ultimaFoto(posicao) {
    return fotos.find(foto => foto.posicao === posicao);
  }

  // Imagens de referência na pasta /imagens/
  const GUIAS = {
    masculino: {
      frente: "imagens/masculino_frente.jpg",
      perfil: "imagens/masculino_perfil.jpg",
      costas: "imagens/masculino_costas.jpg"
    },
    feminino: {
      frente: "imagens/feminino_frente.jpg",
      perfil: "imagens/feminino_perfil.jpg",
      costas: "imagens/feminino_costas.jpg"
    }
  };

  function desenho(posicao) {
    const modelo = GUIAS[guia] || GUIAS.masculino;
    const src = modelo[posicao] || modelo.frente;
    return `<img src="${src}" alt="Modelo ${guia}, vista ${posicao}" loading="lazy" decoding="async">`;
  }

  // TERMOS DE AUTORIZAÇÃO

  const TERMO_AVALIACAO = `
TERMO DE REGISTRO FOTOGRÁFICO — VERSÃO ${VERSAO}

As fotografias de frente, perfil e costas são
solicitadas para acompanhar a evolução corporal
e complementar a observação postural.

As imagens serão armazenadas em ambiente privado,
com acesso restrito ao aluno e ao treinador
autorizado no WAND METHOD.

A análise visual tem limitações e não constitui
diagnóstico clínico.

A participação nesta etapa é voluntária.
A recusa poderá limitar a avaliação fotográfica,
sem impedir a continuidade do treinamento.

O aluno poderá solicitar informações sobre
o tratamento dos dados e a exclusão das imagens
pelos canais de atendimento do WAND METHOD.

Esta autorização não permite uso publicitário.
`;

  const TERMO_DIVULGACAO = `
AUTORIZAÇÃO OPCIONAL DE DIVULGAÇÃO — VERSÃO ${VERSAO}

A autorização de divulgação é independente
da autorização para avaliação.

A escolha positiva não publica automaticamente
nenhuma fotografia.

Antes de utilizar qualquer imagem em publicidade,
o WAND METHOD deverá solicitar aprovação específica
das fotografias e dos canais de publicação.

A recusa não afeta o treinamento.

A autorização poderá ser revogada, observadas
as condições legais aplicáveis.
`;

  // CONSULTA DOS REGISTROS

  async function buscar() {
    const consultaConsentimento = await db
      .from("consentimentos_fotograficos")
      .select("*")
      .eq("aluno_id", aluno.id)
      .maybeSingle();

    if (consultaConsentimento.error) {
      throw consultaConsentimento.error;
    }

    consentimento = consultaConsentimento.data;

    const consultaFotos = await db
      .from("fotos_avaliacao")
      .select("*")
      .eq("aluno_id", aluno.id)
      .order("criado_em", { ascending:false });

    if (consultaFotos.error) {
      throw consultaFotos.error;
    }

    fotos = consultaFotos.data || [];

    // A solicitação é independente do consentimento. Falhas nesta consulta
    // não devem impedir que o aluno consulte suas fotografias existentes.
    if (pagina === "aluno.html") {
      const consultaSolicitacao = await db
        .from("wand_solicitacoes_fotograficas")
        .select("id,orientacoes,criada_em,status")
        .eq("aluno_id", aluno.id)
        .eq("status", "pendente")
        .order("criada_em", { ascending:false })
        .limit(1);
      erroSolicitacao = Boolean(consultaSolicitacao.error);
      solicitacaoPendente = consultaSolicitacao.error ? null : (consultaSolicitacao.data?.[0] || null);
      if (consultaSolicitacao.error) console.warn("[WAND FOTOS] Solicitação indisponível:", consultaSolicitacao.error);
    }
  }

  // SALVAR CONSENTIMENTO

  async function salvarConsentimento(status, divulgacao) {
    if (processando) return;

    processando = true;

    try {
      if (pagina === "perfil-aluno.html") {
        throw new Error(
          "A autorização deve ser registrada pelo próprio aluno."
        );
      }

      const registro = {
        aluno_id: aluno.id,
        status_avaliacao: status,
        divulgacao_autorizada:
          status === "autorizada" && divulgacao,
        versao_termo: VERSAO,
        atualizado_por: usuario.id,
        atualizado_em: new Date().toISOString()
      };

      const resultado = await db
        .from("consentimentos_fotograficos")
        .upsert(registro, { onConflict:"aluno_id" });

      if (resultado.error) {
        throw resultado.error;
      }

      exibirTermos = false;

      await buscar();
      renderizar();

      mostrarMensagem("Sua escolha foi registrada.");

    } catch (erro) {
      mostrarMensagem(erro.message, true);

    } finally {
      processando = false;
    }
  }

  // INTERFACE DOS TERMOS

  function criarTermos(pai) {
    const caixa = adicionar(pai, "div", "wf-box");

    adicionar(
      caixa,
      "h3",
      null,
      "Autorização para avaliação fotográfica"
    );

    adicionar(
      caixa,
      "pre",
      "wf-term",
      TERMO_AVALIACAO
    );

    const label = adicionar(caixa, "label");

    const aceite = document.createElement("input");
    aceite.type = "checkbox";

    label.appendChild(aceite);

    label.append(
      "Li o termo e autorizo o registro fotográfico " +
      "para avaliação e acompanhamento."
    );

    adicionar(
      caixa,
      "h3",
      null,
      "Autorização de divulgação — opcional"
    );

    adicionar(
      caixa,
      "pre",
      "wf-term",
      TERMO_DIVULGACAO
    );

    const simLabel = adicionar(caixa, "label");

    const sim = document.createElement("input");
    sim.type = "radio";
    sim.name = "wand-divulgacao-v2";

    simLabel.appendChild(sim);
    simLabel.append("Autorizo divulgação conforme o termo.");

    const naoLabel = adicionar(caixa, "label");

    const nao = document.createElement("input");
    nao.type = "radio";
    nao.name = "wand-divulgacao-v2";

    naoLabel.appendChild(nao);
    naoLabel.append("Não autorizo divulgação.");

    if (consentimento?.divulgacao_autorizada) {
      sim.checked = true;
    } else {
      nao.checked = true;
    }

    caixa.appendChild(
      botao("Autorizar avaliação e continuar", () => {
        if (!aceite.checked) {
          mostrarMensagem(
            "Leia e aceite o termo de avaliação.",
            true
          );
          return;
        }

        salvarConsentimento(
          "autorizada",
          sim.checked
        );
      })
    );

    caixa.appendChild(
      botao("Não quero realizar esta etapa", () => {
        const confirmado = confirm(
          "A avaliação fotográfica ficará incompleta. " +
          "Você poderá realizá-la posteriormente. " +
          "Deseja registrar sua recusa?"
        );

        if (confirmado) {
          salvarConsentimento("recusada", false);
        }
      }, true)
    );
  }

  // AVISO DE RECUSA

  function avisoRecusa(pai) {
    const caixa = adicionar(pai, "div", "wf-warning");

    adicionar(
      caixa,
      "h3",
      null,
      "Avaliação fotográfica recusada"
    );

    adicionar(
      caixa,
      "p",
      null,
      "No WAND METHOD, as fotografias ajudam a " +
      "acompanhar a evolução corporal e observar " +
      "possíveis assimetrias posturais."
    );

    adicionar(
      caixa,
      "p",
      null,
      "Sem esse registro, a avaliação ficará " +
      "incompleta na parte fotográfica. Isso " +
      "reduz as informações disponíveis para " +
      "o acompanhamento individualizado."
    );

    adicionar(
      caixa,
      "p",
      null,
      "Seu treinamento poderá continuar. " +
      "Você poderá realizar essa etapa depois."
    );

    if (pagina !== "perfil-aluno.html") {
      caixa.appendChild(
        botao("Quero realizar a avaliação", () => {
          exibirTermos = true;
          renderizar();
        })
      );
    }
  }

  // VALIDAÇÃO DE ARQUIVOS

  function validarArquivo(arquivo) {
    if (!arquivo) {
      throw new Error("Selecione uma imagem.");
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      throw new Error("Use JPG, PNG ou WebP.");
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      throw new Error("Máximo de 10 MB por imagem.");
    }
  }

  const estiloEditor=document.createElement('style');
  estiloEditor.textContent=`
    .wf-editor-overlay{position:fixed;inset:0;z-index:99999;background:#000e;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto}
    .wf-editor-panel{width:min(95vw,480px);max-height:94dvh;overflow:auto;background:#181818;color:#fff;border:2px solid #d4af37;border-radius:18px;padding:17px;text-align:center}
    .wf-editor-panel h3{color:#f5cc37;margin:4px 0 8px}
    .wf-editor-panel p{font-size:13px}
    .wf-editor-canvas{display:block;width:min(100%,280px);aspect-ratio:3/4;margin:10px auto;border:1px solid #d4af37;border-radius:9px;touch-action:none;background:#222}
    .wf-editor-panel input[type=range]{display:block;width:90%;margin:16px auto;accent-color:#d4af37}
    .wf-editor-panel .wf-actions{display:flex;gap:10px;justify-content:center}
    .wf-editor-panel button{background:#d4af37;border:1px solid #d4af37;border-radius:9px;padding:12px;color:#111;font-weight:bold}
    .wf-editor-panel button.secondary{background:transparent;color:#d4af37}
  `;
  document.head.append(estiloEditor);
  // PREPARAR, RECORTAR E CONFIRMAR: nenhuma foto vai ao servidor antes do botão Enviar.
  async function editarImagem(posicao, arquivo) {
    try { validarArquivo(arquivo); } catch(e) { mostrarMensagem(e.message,true); return; }
    const url=URL.createObjectURL(arquivo);
    const imagem=new Image();
    imagem.onload=()=>{
      const camada=document.createElement('div');
      camada.className='wf-editor-overlay';
      camada.setAttribute('role','dialog');
      camada.setAttribute('aria-modal','true');
      camada.setAttribute('aria-label','Ajustar fotografia de '+posicao);
      const painel=document.createElement('div');painel.className='wf-editor-panel';camada.append(painel);
      adicionar(painel,'h3',null,'Ajustar fotografia · '+posicao);
      adicionar(painel,'p','wf-muted','Arraste para enquadrar e use o zoom. Confira antes de confirmar.');
      const tela=document.createElement('canvas');tela.width=600;tela.height=800;tela.className='wf-editor-canvas';painel.append(tela);
      const ctx=tela.getContext('2d');
      const zoom=document.createElement('input');zoom.type='range';zoom.min='1';zoom.max='3';zoom.step='0.05';zoom.value='1';zoom.setAttribute('aria-label','Zoom da fotografia');painel.append(zoom);
      let deslocX=0,deslocY=0,inicio=null;
      const desenhar=()=>{
        const base=Math.max(tela.width/imagem.width,tela.height/imagem.height);
        const escala=base*Number(zoom.value);
        const largura=imagem.width*escala,altura=imagem.height*escala;
        const limiteX=Math.max(0,(largura-tela.width)/2),limiteY=Math.max(0,(altura-tela.height)/2);
        deslocX=Math.max(-limiteX,Math.min(limiteX,deslocX));
        deslocY=Math.max(-limiteY,Math.min(limiteY,deslocY));
        ctx.clearRect(0,0,tela.width,tela.height);
        ctx.drawImage(imagem,(tela.width-largura)/2+deslocX,(tela.height-altura)/2+deslocY,largura,altura);
      };
      zoom.addEventListener('input',desenhar);
      tela.addEventListener('pointerdown',e=>{inicio={x:e.clientX,y:e.clientY};tela.setPointerCapture(e.pointerId)});
      tela.addEventListener('pointermove',e=>{
        if(!inicio)return;
        const escala=tela.width/tela.getBoundingClientRect().width;
        deslocX+=(e.clientX-inicio.x)*escala;deslocY+=(e.clientY-inicio.y)*escala;
        inicio={x:e.clientX,y:e.clientY};desenhar();
      });
      tela.addEventListener('pointerup',()=>inicio=null);
      tela.addEventListener('pointercancel',()=>inicio=null);
      const acoes=adicionar(painel,'div','wf-actions');
      const fechar=()=>{camada.remove();URL.revokeObjectURL(url)};
      acoes.append(botao('Cancelar',fechar,true));
      acoes.append(botao('Usar esta foto',()=>{
        tela.toBlob(blob=>{
          if(!blob){mostrarMensagem('Não foi possível recortar a imagem.',true);return;}
          const anterior=rascunhos.get(posicao);
          if(anterior)URL.revokeObjectURL(anterior.url);
          const foto=new File([blob],posicao+'.jpg',{type:'image/jpeg'});
          rascunhos.set(posicao,{arquivo:foto,url:URL.createObjectURL(foto)});
          fechar();renderizar();mostrarMensagem('Fotografia preparada. Confirme as três antes de enviar.');
        },'image/jpeg',0.9);
      }));
      document.body.append(camada);desenhar();
    };
    imagem.onerror=()=>{URL.revokeObjectURL(url);mostrarMensagem('Não foi possível abrir esta imagem.',true)};
    imagem.src=url;
  }

  async function enviarConjunto() {
    if(processando)return;
    const posicoes=['frente','perfil','costas'];
    if(posicoes.some(p=>!rascunhos.has(p))){mostrarMensagem('Selecione e revise as três fotografias antes de enviar.',true);return;}
    if(statusAtual()!=='autorizada'){mostrarMensagem('É necessário autorizar a avaliação.',true);return;}
    // Revalidar no servidor: um pedido pode ter sido concluído ou cancelado enquanto o aluno editava.
    const verificacao=await db.from('wand_solicitacoes_fotograficas')
      .select('id').eq('aluno_id',aluno.id).eq('status','pendente').limit(1);
    if(verificacao.error||!verificacao.data?.length){
      mostrarMensagem('Não há solicitação fotográfica pendente do treinador. Aguarde um novo pedido.',true);
      await buscar().then(renderizar).catch(console.warn);
      return;
    }
    processando=true;
    const registros=[];
    try{
      for(const posicao of posicoes){
        const arquivo=rascunhos.get(posicao).arquivo;
        validarArquivo(arquivo);
        const caminho=aluno.id+'/'+crypto.randomUUID()+'.jpg';
        mostrarMensagem('Enviando fotografia de '+posicao+'...');
        const upload=await db.storage.from(BUCKET).upload(caminho,arquivo,{contentType:'image/jpeg',upsert:false});
        if(upload.error)throw upload.error;
        const registro=await db.from('fotos_avaliacao').insert({
          aluno_id:aluno.id,posicao,caminho,enviado_por:usuario.id
        }).select('id').single();
        if(registro.error){
          await db.storage.from(BUCKET).remove([caminho]);
          throw registro.error;
        }
        registros.push({id:registro.data.id,caminho});
      }
      for(const item of rascunhos.values())URL.revokeObjectURL(item.url);
      rascunhos.clear();
      try{await buscar();renderizar();document.dispatchEvent(new Event('wand:fotografias-atualizadas'))}
      catch(e){console.warn('[WAND FOTOS] Fotos salvas, mas atualização falhou:',e)}
      mostrarMensagem(''); await wandConclusaoLocal('As três fotografias foram enviadas com sucesso.');
    }catch(e){
      // Se houve falha antes da terceira foto, remover os registros parciais.
      // A conclusão só é disparada com as três posições confirmadas.
      let limpezaOk=true;
      for(const item of registros){
        const del=await db.from('fotos_avaliacao').delete().eq('id',item.id).eq('aluno_id',aluno.id);
        if(del.error){limpezaOk=false;console.warn('[WAND FOTOS] Falha ao limpar registro parcial:',del.error);continue;}
        const arquivo=await db.storage.from(BUCKET).remove([item.caminho]);
        if(arquivo.error){limpezaOk=false;console.warn('[WAND FOTOS] Falha ao limpar arquivo parcial:',arquivo.error);}
      }
      mostrarMensagem('Não foi possível enviar as fotografias: '+e.message+(limpezaOk?' Nenhuma fotografia parcial foi mantida. Você pode tentar novamente.':' Alguns registros podem ter sido salvos; entre em contato com o treinador antes de reenviar.'),true);
    }finally{processando=false;}
  }

  // EXCLUIR FOTOGRAFIA

  async function excluir(foto) {
    if (processando) return;

    if (!confirm("Excluir esta fotografia?")) {
      return;
    }

    processando = true;

    try {
      const arquivo = await db.storage
        .from(BUCKET)
        .remove([foto.caminho]);

      if (arquivo.error) {
        throw arquivo.error;
      }

      const registro = await db
        .from("fotos_avaliacao")
        .delete()
        .eq("id", foto.id);

      if (registro.error) {
        throw registro.error;
      }

      await buscar();
      renderizar();

      mostrarMensagem("Fotografia excluída.");

    } catch (erro) {
      mostrarMensagem(erro.message, true);

    } finally {
      processando = false;
    }
  }

  // VISUALIZAR FOTOGRAFIA PRIVADA

  async function exibirImagem(local, foto) {
    const resultado = await db.storage
      .from(BUCKET)
      .createSignedUrl(foto.caminho, 300);

    if (
      resultado.error ||
      !resultado.data?.signedUrl
    ) {
      if (local.isConnected) {
        local.textContent = "Imagem indisponível";
      }
      return;
    }

    if (!local.isConnected) return;

    const imagem = document.createElement("img");

    imagem.src = resultado.data.signedUrl;
    imagem.alt = "Fotografia de " + foto.posicao;
    imagem.loading = "lazy";

    local.replaceChildren(imagem);
  }

  // Cartões de preparação: substituições permanecem locais até Enviar.
  function cartoes(pai) {
    const grade=adicionar(pai,'div','wf-grid');
    for(const posicao of ['frente','perfil','costas']){
      const card=adicionar(grade,'div','wf-card');
      const area=adicionar(card,'div','wf-image');
      const rascunho=rascunhos.get(posicao);
      if(rascunho){
        const img=document.createElement('img');img.src=rascunho.url;img.alt='Prévia de '+posicao;area.append(img);
      }else{area.innerHTML=desenho(posicao)}
      adicionar(card,'strong',null,posicao.charAt(0).toUpperCase()+posicao.slice(1));
      const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.style.display='none';
      input.onchange=()=>{if(input.files?.[0])editarImagem(posicao,input.files[0])};
      card.append(input);
      if(pagina==='aluno.html' && solicitacaoPendente && !erroSolicitacao){
        card.append(botao(rascunho?'Trocar fotografia':'Selecionar fotografia',()=>input.click()));
        if(rascunho)card.append(botao('Remover seleção',()=>{
          URL.revokeObjectURL(rascunho.url);rascunhos.delete(posicao);renderizar();
        },true));
      }else{
        const foto=ultimaFoto(posicao);
        if(foto)exibirImagem(area,foto);
      }
    }
    if(pagina==='aluno.html' && solicitacaoPendente && !erroSolicitacao){
      const pronto=['frente','perfil','costas'].every(p=>rascunhos.has(p));
      adicionar(pai,'p','wf-muted',pronto?'As três fotografias estão prontas. Revise e confirme o envio.':'Selecione as três fotografias. Nada será enviado antes da confirmação.');
      const enviarBtn=botao('Enviar fotografias',enviarConjunto);
      enviarBtn.disabled=!pronto||processando;pai.append(enviarBtn);
    }
  }

  // INSTRUÇÕES PARA O ALUNO

  function instrucoes(pai) {
    const caixa = adicionar(
      pai,
      "div",
      "wf-box"
    );

    adicionar(
      caixa,
      "h3",
      null,
      "Como tirar suas fotografias"
    );

    const lista = adicionar(caixa, "ul");

    const orientacoes = [
      "Fotografe o corpo inteiro, da cabeça aos pés.",
      "Utilize iluminação adequada e fundo neutro.",
      "Fique descalço e com os braços relaxados.",
      "Mantenha sua postura natural.",
      "Não contraia o abdômen nem estufe o peito.",
      "Não tente corrigir artificialmente sua postura.",
      "Posicione a câmera aproximadamente na altura do quadril.",
      "Quando possível, mantenha cerca de 2 a 3 metros de distância."
    ];

    orientacoes.forEach(texto => {
      adicionar(lista, "li", null, texto);
    });

    adicionar(
      caixa,
      "h3",
      null,
      "Vestimenta recomendada"
    );

    adicionar(
      caixa,
      "p",
      null,
      guia === "feminino"
        ? "Top esportivo com short curto ou biquíni, conforme seu conforto."
        : "Sunga ou short curto e ajustado, conforme seu conforto."
    );

    adicionar(
      caixa,
      "p",
      "wf-muted",
      "Essas roupas facilitam a observação de " +
      "contornos e assimetrias, mas não são obrigatórias."
    );

    adicionar(
      caixa,
      "div",
      "wf-warning",
      "Importante: não contraia a musculatura, " +
      "não estufe o peito e não tente corrigir " +
      "sua postura para as fotografias."
    );
  }

  // HISTÓRICO FOTOGRÁFICO

  function historico(pai) {
    if (!fotos.length) return;

    const caixa = adicionar(
      pai,
      "div",
      "wf-box"
    );

    adicionar(
      caixa,
      "h3",
      null,
      "Histórico fotográfico"
    );

    const grade = adicionar(
      caixa,
      "div",
      "wf-history"
    );

    for (const foto of fotos) {
      const card = adicionar(
        grade,
        "div",
        "wf-card"
      );

      const area = adicionar(
        card,
        "div",
        "wf-image"
      );

      exibirImagem(area, foto);

      adicionar(
        card,
        "p",
        "wf-small",
        foto.posicao.toUpperCase() +
        " · " +
        dataBR(foto.criado_em)
      );
    }
  }

  // Indicador no cartão inicial: não envia push e não expõe fotos.
  function atualizarAvisoSolicitacao() {
    if (pagina !== "aluno.html") return;
    const cartao = document.querySelector('[data-view="fotografica"]');
    if (!cartao) return;
    const anterior = cartao.querySelector('[data-wand-foto-aviso]');
    if (anterior) anterior.remove();
    if (!solicitacaoPendente) return;
    const aviso = document.createElement("span");
    aviso.setAttribute("data-wand-foto-aviso", "");
    aviso.textContent = "● Solicitação pendente";
    aviso.style.cssText = "display:block;color:#f5cc37;font-size:12px;font-weight:bold;margin-top:7px";
    cartao.appendChild(aviso);
  }

  // MONTAGEM DA INTERFACE

  function renderizar() {
    atualizarAvisoSolicitacao();
    if (pagina === "aluno.html") {
      document.dispatchEvent(new CustomEvent("wand:solicitacao-fotografica", {
        detail: { pendente: Boolean(solicitacaoPendente), id: solicitacaoPendente?.id || null }
      }));
    }
    container.replaceChildren();

    adicionar(
      container,
      "h2",
      null,
      "Suas fotografias corporais"
    );

    adicionar(
      container,
      "p",
      "wf-muted",
      "WAND METHOD — Registro fotográfico e " +
      "acompanhamento corporal e postural."
    );

    if (aluno?.nome_completo) {
      adicionar(
        container,
        "p",
        "wf-muted",
        "Aluno(a): " + aluno.nome_completo
      );
    }

    if (pagina === "aluno.html" && solicitacaoPendente) {
      const pedido = adicionar(container, "div", "wf-box");
      adicionar(pedido, "h3", null, "Solicitação de fotografias do treinador");
      adicionar(pedido, "p", "wf-muted", "Solicitada em " + dataBR(solicitacaoPendente.criada_em) + ". Envie fotografias de frente, lado e costas seguindo as orientações abaixo.");
      if (solicitacaoPendente.orientacoes) adicionar(pedido, "p", "wf-muted", solicitacaoPendente.orientacoes);
      adicionar(pedido, "p", "wf-small", "O envio depende da sua autorização para avaliação interna. A divulgação é opcional e separada.");
    } else if (pagina === "aluno.html" && erroSolicitacao) {
      adicionar(container, "p", "wf-muted", "Não foi possível consultar as solicitações neste momento. Suas fotografias continuam disponíveis.");
    }

    const status = statusAtual();

    const topo = adicionar(container,"div","wf-compact-status");
    adicionar(topo,"p","wf-status","Avaliação fotográfica: "+(status==="autorizada"?"AUTORIZADA":status==="recusada"?"RECUSADA":"PENDENTE"));
    const autorizacoes=adicionar(container,"details","wf-disclosure");
    autorizacoes.open=autorizacoesAbertas;
    autorizacoes.addEventListener("toggle",()=>{autorizacoesAbertas=autorizacoes.open;});
    adicionar(autorizacoes,"summary",null,"Privacidade e autorizações");
    const corpoAutorizacoes=adicionar(autorizacoes,"div","wf-disclosure-body");
    adicionar(corpoAutorizacoes,"p","wf-muted","Divulgação: "+(consentimento?.divulgacao_autorizada?"Autorização inicial registrada. Publicação depende de aprovação específica.":"Não autorizada."));
    if(pagina==="perfil-aluno.html")adicionar(corpoAutorizacoes,"p","wf-small","As autorizações devem ser registradas pelo próprio aluno na conta dele.");

    if (status === "recusada") {
      avisoRecusa(container);
    }

    if (
      pagina !== "perfil-aluno.html" &&
      (
        status !== "autorizada" ||
        exibirTermos
      )
    ) {
      criarTermos(container);
    }

    if (status === "autorizada" && pagina === "aluno.html" && !solicitacaoPendente) {
      adicionar(container,"p","wf-muted",erroSolicitacao
        ? "Não foi possível verificar se há solicitação do treinador. O envio está temporariamente indisponível."
        : "Nenhuma solicitação fotográfica pendente. Aguarde um pedido do treinador para enviar novas fotografias.");
    }
    if (status === "autorizada" && (pagina !== "aluno.html" || Boolean(solicitacaoPendente))) {
      // Fotos em destaque; orientações e opções ficam recolhidas até o usuário solicitar.
      const guiaBox=adicionar(container,"details","wf-disclosure");
      guiaBox.open=guiaAberto;
      guiaBox.addEventListener("toggle",()=>{guiaAberto=guiaBox.open;});
      adicionar(guiaBox,"summary",null,"Guia visual · Modelo "+(guia==="masculino"?"masculino":"feminino"));
      const guiaConteudo=adicionar(guiaBox,"div","wf-disclosure-body");
      const botoes=adicionar(guiaConteudo,"div","wf-guide-choice");
      botoes.appendChild(botao("Modelo masculino",()=>{guia="masculino";guiaAberto=true;renderizar();},guia!=="masculino"));
      botoes.appendChild(botao("Modelo feminino",()=>{guia="feminino";guiaAberto=true;renderizar();},guia!=="feminino"));

      const instrucoesBox=adicionar(container,"details","wf-disclosure");
      instrucoesBox.open=instrucoesAbertas;
      instrucoesBox.addEventListener("toggle",()=>{instrucoesAbertas=instrucoesBox.open;});
      adicionar(instrucoesBox,"summary",null,"Como tirar suas fotografias");
      const instrucoesConteudo=adicionar(instrucoesBox,"div","wf-disclosure-body");
      instrucoes(instrucoesConteudo);

      cartoes(container);


    }

    if (pagina !== "aluno.html") historico(container);

    if (fotos.length) {
      adicionar(
        container,
        "p",
        "wf-small",
        "As fotografias são privadas. Para solicitar " +
        "exclusão de dados ou revogação de consentimento, " +
        "entre em contato com o responsável pelo WAND METHOD."
      );
    }

    const mensagem = adicionar(container, "p");
    mensagem.id = "wf-mensagem";
  }

  // INICIALIZAÇÃO E IDENTIFICAÇÃO DO ALUNO

  async function iniciar() {
    try {
      montar();

      const biblioteca = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      db = biblioteca.createClient(
        URL_DB,
        CHAVE_DB,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
      );

      const autenticacao = await db.auth.getUser();

      if (
        autenticacao.error ||
        !autenticacao.data?.user
      ) {
        throw new Error(
          "Faça login no WAND METHOD para abrir esta etapa."
        );
      }

      usuario = autenticacao.data.user;

      if (pagina === "perfil-aluno.html") {
        const perfil = await db
          .from("profiles")
          .select("role")
          .eq("id", usuario.id)
          .single();

        if (
          perfil.error ||
          perfil.data?.role !== "admin"
        ) {
          throw new Error(
            "Esta área é exclusiva do treinador."
          );
        }

        const id = new URLSearchParams(
          location.search
        ).get("id");

        if (!id || !/^\d+$/.test(id)) {
          throw new Error(
            "Aluno não identificado na URL."
          );
        }

        const consulta = await db
          .from("alunos")
          .select("id,nome_completo,sexo")
          .eq("id", Number(id))
          .single();

        if (consulta.error) {
          throw consulta.error;
        }

        aluno = consulta.data;

      } else {
        const consulta = await db
          .from("alunos")
          .select("id,nome_completo,sexo")
          .eq("user_id", usuario.id)
          .single();

        if (consulta.error) {
          throw consulta.error;
        }

        aluno = consulta.data;
      }

      if (!aluno) {
        throw new Error("Aluno não encontrado.");
      }

      const sexo = String(
        aluno.sexo || ""
      ).toLowerCase();

      guia = [
        "f",
        "feminino",
        "mulher"
      ].includes(sexo)
        ? "feminino"
        : "masculino";

      await buscar();
      renderizar();

    } catch (erro) {
      erroVisivel(erro);
    }
  }

  iniciar();

})();
