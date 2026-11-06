
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
  let processando = false;
  let exibirTermos = false;
  let guia = "masculino";

  const estilo = document.createElement("style");

  estilo.textContent = `
    #wand-fotos {
      --ouro:#f5cc37;
      --fundo:#101010;
      --painel:#1d1d1d;
      --borda:#514627;
      display:block!important;
      visibility:visible!important;
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
      document.body.appendChild(container);
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

  // ENVIO DE FOTOGRAFIAS

  async function enviar(posicao, arquivo) {
    if (processando) return;

    processando = true;

    let caminho = null;
    let arquivoEnviado = false;

    try {
      if (statusAtual() !== "autorizada") {
        throw new Error(
          "É necessário autorizar a avaliação."
        );
      }

      validarArquivo(arquivo);

      const extensao = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      }[arquivo.type];

      caminho =
        aluno.id + "/" +
        crypto.randomUUID() + "." + extensao;

      mostrarMensagem(
        "Enviando foto de " + posicao + "..."
      );

      const upload = await db.storage
        .from(BUCKET)
        .upload(caminho, arquivo, {
          contentType: arquivo.type,
          upsert: false
        });

      if (upload.error) {
        throw upload.error;
      }

      arquivoEnviado = true;

      const registro = await db
        .from("fotos_avaliacao")
        .insert({
          aluno_id: aluno.id,
          posicao: posicao,
          caminho: caminho,
          enviado_por: usuario.id
        });

      if (registro.error) {
        throw registro.error;
      }

      await buscar();
      renderizar();

      mostrarMensagem(
        "Fotografia enviada com sucesso."
      );

    } catch (erro) {
      if (arquivoEnviado && caminho) {
        await db.storage
          .from(BUCKET)
          .remove([caminho]);
      }

      mostrarMensagem(erro.message, true);

    } finally {
      processando = false;
    }
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

  // CARDS DE FRENTE, PERFIL E COSTAS

  function cartoes(pai) {
    const grade = adicionar(pai, "div", "wf-grid");

    for (const posicao of [
      "frente",
      "perfil",
      "costas"
    ]) {
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

      const foto = ultimaFoto(posicao);

      if (foto) {
        exibirImagem(area, foto);
      } else {
        area.innerHTML = desenho(posicao);
      }

      adicionar(
        card,
        "strong",
        null,
        posicao.charAt(0).toUpperCase() +
        posicao.slice(1)
      );

      const input = document.createElement("input");

      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.style.display = "none";

      input.onchange = () => {
        if (input.files?.[0]) {
          enviar(posicao, input.files[0]);
        }
      };

      card.appendChild(input);

      card.appendChild(
        botao(
          foto ? "Nova foto" : "Tirar / enviar",
          () => input.click()
        )
      );

      if (foto) {
        card.appendChild(
          botao(
            "Excluir",
            () => excluir(foto),
            true
          )
        );
      }
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

  // MONTAGEM DA INTERFACE

  function renderizar() {
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

    const status = statusAtual();

    const topo = adicionar(
      container,
      "div",
      "wf-box"
    );

    adicionar(
      topo,
      "p",
      "wf-status",
      "Avaliação fotográfica: " +
      (
        status === "autorizada"
          ? "AUTORIZADA"
          : status === "recusada"
            ? "RECUSADA"
            : "PENDENTE"
      )
    );

    adicionar(
      topo,
      "p",
      "wf-muted",
      "Divulgação: " +
      (
        consentimento?.divulgacao_autorizada
          ? "Autorização inicial registrada. " +
            "Publicação depende de aprovação específica."
          : "Não autorizada."
      )
    );

    if (pagina === "perfil-aluno.html") {
      adicionar(
        topo,
        "p",
        "wf-small",
        "As autorizações devem ser registradas " +
        "pelo próprio aluno na conta dele."
      );
    }

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

    if (status === "autorizada") {
      const guiaBox = adicionar(
        container,
        "div",
        "wf-box"
      );

      adicionar(
        guiaBox,
        "h3",
        null,
        "Guia visual"
      );

      const botoes = adicionar(
        guiaBox,
        "div",
        "wf-actions"
      );

      botoes.appendChild(
        botao(
          "Modelo masculino",
          () => {
            guia = "masculino";
            renderizar();
          },
          guia !== "masculino"
        )
      );

      botoes.appendChild(
        botao(
          "Modelo feminino",
          () => {
            guia = "feminino";
            renderizar();
          },
          guia !== "feminino"
        )
      );

      adicionar(
        guiaBox,
        "p",
        "wf-small",
        "As imagens são referências de posição, " +
        "não de biotipo. Mantenha sua postura natural."
      );

      // Primeiro as orientações, depois as imagens.
      instrucoes(container);
      cartoes(container);

      if (
        pagina !== "perfil-aluno.html" &&
        !exibirTermos
      ) {
        container.appendChild(
          botao(
            "Revisar autorizações",
            () => {
              exibirTermos = true;
              renderizar();
            },
            true
          )
        );
      }
    }

    historico(container);

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
