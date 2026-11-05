
(() => {
  "use strict";

  if (window.__wandFotosV2) return;
  window.__wandFotosV2 = true;

  // WAND METHOD - Avaliacao Fotografica 2.1
  const URL_DB = "https://kvxdnreipuahoaostlle.supabase.co";
  const CHAVE_DB = "sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo";
  const BUCKET = "avaliacoes-fotograficas";
  const VERSAO = "2.1";

  const pagina = location.pathname.split("/").pop();
  const paginas = [
    "anamnese.html",
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

  // GUIAS VISUAIS - FRENTE, PERFIL E COSTAS

  function desenho(posicao) {
    const feminino = guia === "feminino";

    const pele = "#c99b78";
    const sombra = "#ae7958";
    const roupa = "#242424";
    const detalhe = "#956849";

    const fundo = `
      <rect width="240" height="360" fill="#e9e7e3"/>

      <line
        x1="120" y1="12"
        x2="120" y2="342"
        stroke="#c9b76f"
        stroke-width="1"
        stroke-dasharray="5 5"
      />

      <line
        x1="24" y1="340"
        x2="216" y2="340"
        stroke="#b6b6b6"
        stroke-width="2"
      />
    `;

    const cabecaFrente = `
      <path
        d="M104 31 Q104 15 120 15
           Q136 15 136 31 L135 49
           Q132 65 120 68
           Q108 65 105 49 Z"
        fill="${pele}"
      />

      <path
        d="M104 35 Q101 17 112 12
           Q120 8 129 13
           Q140 18 136 36
           L133 26 Q119 19 106 28 Z"
        fill="#40332d"
      />

      <path
        d="M112 69 L112 83 L128 83 L128 69"
        fill="${pele}"
      />
    `;

    const cabecaCostas = `
      <path
        d="M104 31 Q104 15 120 15
           Q136 15 136 31 L135 49
           Q132 65 120 68
           Q108 65 105 49 Z"
        fill="${pele}"
      />

      <path
        d="M104 43 Q99 16 113 12
           Q125 7 134 16
           Q140 24 136 46
           Q120 53 104 43 Z"
        fill="#40332d"
      />

      <path
        d="M112 69 L112 83 L128 83 L128 69"
        fill="${pele}"
      />
    `;

    const tronco = `
      <path
        d="M110 79
           Q94 82 83 90
           Q76 100 81 120
           L91 157
           Q96 179 92 198
           Q120 209 148 198
           Q144 179 149 157
           L159 120
           Q164 100 157 90
           Q146 82 130 79
           Q125 87 120 87
           Q115 87 110 79 Z"
        fill="${pele}"
      />
    `;

    const bracos = `
      <path
        d="M84 91
           Q75 91 70 105
           L61 163 L57 199
           Q57 208 63 210
           Q69 211 71 203
           L77 170 L91 119 Z"
        fill="${pele}"
      />

      <path
        d="M156 91
           Q165 91 170 105
           L179 163 L183 199
           Q183 208 177 210
           Q171 211 169 203
           L163 170 L149 119 Z"
        fill="${pele}"
      />
    `;

    const pernas = `
      <path
        d="M94 195
           Q90 217 94 251
           L97 317
           Q97 329 106 329
           Q115 328 115 316
           L119 238 L120 207 Z"
        fill="${pele}"
      />

      <path
        d="M146 195
           Q150 217 146 251
           L143 317
           Q143 329 134 329
           Q125 328 125 316
           L121 238 L120 207 Z"
        fill="${pele}"
      />

      <path
        d="M98 321
           Q95 333 90 337
           Q89 342 106 342
           Q116 342 113 334
           L110 322 Z"
        fill="${pele}"
      />

      <path
        d="M142 321
           Q145 333 150 337
           Q151 342 134 342
           Q124 342 127 334
           L130 322 Z"
        fill="${pele}"
      />
    `;

    const sunga = `
      <path
        d="M92 194
           Q120 201 148 194
           L145 217
           Q132 225 121 231
           Q108 225 95 217 Z"
        fill="${roupa}"
      />
    `;

    const top = feminino ? `
      <path
        d="M94 91
           Q106 94 120 94
           Q134 94 146 91
           L151 125
           Q120 133 89 125 Z"
        fill="${roupa}"
      />

      <path
        d="M101 88 L106 78
           M139 88 L134 78"
        fill="none"
        stroke="${roupa}"
        stroke-width="7"
      />
    ` : "";

    const short = feminino ? `
      <path
        d="M92 194
           Q120 201 148 194
           L151 227 L124 229
           L120 214 L116 229
           L89 227 Z"
        fill="${roupa}"
      />
    ` : sunga;

    const detalhesFrente = `
      <path
        d="M101 137 Q120 144 139 137"
        fill="none"
        stroke="${sombra}"
        stroke-width="1.4"
        opacity=".55"
      />

      <path
        d="M120 151 L120 183"
        fill="none"
        stroke="${sombra}"
        stroke-width="1.2"
        opacity=".5"
      />

      <circle
        cx="120" cy="180" r="1.5"
        fill="${detalhe}"
      />
    `;

    const detalhesCostas = `
      <path
        d="M120 88 L120 190"
        stroke="${detalhe}"
        stroke-width="1.3"
        fill="none"
        opacity=".65"
      />

      <path
        d="M104 98 Q90 113 103 145
           M136 98 Q150 113 137 145"
        stroke="${sombra}"
        stroke-width="2"
        fill="none"
        opacity=".7"
      />

      <path
        d="M100 150 Q120 161 140 150"
        stroke="${sombra}"
        stroke-width="1.3"
        fill="none"
        opacity=".5"
      />
    `;

    const corpoFrente = `
      ${pernas}
      ${bracos}
      ${tronco}
      ${cabecaFrente}
      ${feminino ? "" : detalhesFrente}
      ${top}
      ${short}
    `;

    const corpoCostas = `
      ${pernas}
      ${bracos}
      ${tronco}
      ${cabecaCostas}
      ${detalhesCostas}
      ${top}
      ${short}
    `;

    const corpoPerfil = `
      <path
        d="M116 18
           Q131 15 136 30
           L138 47
           Q136 61 124 68
           L116 65
           Q110 55 111 41
           L109 34 Z"
        fill="${pele}"
      />

      <path
        d="M115 20
           Q125 9 135 20
           Q140 28 136 39
           L132 29
           Q124 25 115 31 Z"
        fill="#40332d"
      />

      <path
        d="M119 67
           L119 83 L131 83 L131 67"
        fill="${pele}"
      />

      <path
        d="M118 80
           Q137 79 142 97
           Q148 114 141 143
           Q137 165 143 196
           L112 198
           Q108 172 111 150
           Q107 125 110 104
           Q109 91 118 80 Z"
        fill="${pele}"
      />

      <path
        d="M135 91
           Q145 94 146 109
           L143 170 L143 204
           Q143 212 137 212
           Q131 211 132 202
           L130 165 L128 112 Z"
        fill="${sombra}"
      />

      <path
        d="M113 195
           Q111 224 116 259
           L115 321
           Q115 330 124 330
           Q131 329 130 318
           L132 248 L141 202 Z"
        fill="${pele}"
      />

      <path
        d="M131 198
           Q140 219 141 248
           L144 321
           Q145 330 153 330
           Q161 329 158 317
           L155 248 L145 194 Z"
        fill="${sombra}"
      />

      <path
        d="M116 321 L112 339
           Q112 343 132 342
           L130 322 Z"
        fill="${pele}"
      />

      <path
        d="M145 321 L143 339
           Q143 343 163 342
           L158 322 Z"
        fill="${sombra}"
      />

      ${feminino ? `
        <path
          d="M112 93 L141 93
             L142 122 L110 122 Z"
          fill="${roupa}"
        />

        <path
          d="M112 193 L145 193
             L149 225 L115 225 Z"
          fill="${roupa}"
        />
      ` : `
        <path
          d="M112 193 L145 193
             L146 218 L116 221 Z"
          fill="${roupa}"
        />
      `}
    `;

    const figura =
      posicao === "perfil"
        ? corpoPerfil
        : posicao === "costas"
          ? corpoCostas
          : corpoFrente;

    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 360"
        role="img"
        aria-label="Modelo ${guia}, posição ${posicao}"
      >
        ${fundo}
        ${figura}
      </svg>
    `;
  }

  // TERMOS DE AUTORIZACAO

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

  // VALIDACAO DE ARQUIVOS

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

  // INSTRUCOES PARA O ALUNO

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

  // HISTORICO FOTOGRAFICO

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

      cartoes(container);
      instrucoes(container);

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

  // INICIALIZACAO E IDENTIFICACAO DO ALUNO

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
