
/*
  WAND METHOD
  Avaliação Fotográfica — versão 2.0

  Páginas:
  anamnese.html
  perfil-aluno.html
  aluno.html

  Armazenamento privado: avaliacoes-fotograficas
*/
(() => {
  "use strict";

  if (window.__wandFotosV2) return;
  window.__wandFotosV2 = true;

  const URL_DB = "https://kvxdnreipuahoaostlle.supabase.co";
  const CHAVE_DB = "sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo";
  const BUCKET = "avaliacoes-fotograficas";
  const VERSAO = "2.0";

  const pagina = location.pathname.split("/").pop();
  const paginas = [
    "anamnese.html",
    "perfil-aluno.html",
    "aluno.html"
  ];

  if (!paginas.includes(pagina)) return;

  let db, usuario, aluno, consentimento;
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
    #wand-fotos * {box-sizing:border-box}
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
    #wand-fotos p, #wand-fotos li {
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
      background:#dedede;
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
    #wand-fotos .wf-error {color:#ff9999}
    #wand-fotos .wf-success {color:#77e2a3}
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
      #wand-fotos {padding:12px}
      #wand-fotos .wf-grid,
      #wand-fotos .wf-history {gap:6px}
      #wand-fotos .wf-card {padding:5px}
      #wand-fotos .wf-card .wf-button {
        font-size:11px;
        padding:9px 4px;
      }
    }
  `;
  document.head.appendChild(estilo);

  const $ = (tag, classe, texto) => {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  };

  const add = (pai, tag, classe, texto) => {
    const e = $(tag, classe, texto);
    pai.appendChild(e);
    return e;
  };

  const button = (texto, acao, secondary = false) => {
    const b = $("button",
      "wf-button" + (secondary ? " secondary" : ""),
      texto
    );
    b.type = "button";
    b.addEventListener("click", acao);
    return b;
  };

  const container = $("section");
  container.id = "wand-fotos";

  function montar() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", montar, {
        once:true
      });
      return;
    }

    if (!container.isConnected) {
      // Fora de formulários para evitar interferências.
      document.body.appendChild(container);
    }

    container.replaceChildren();
    add(container, "h2", null,
      "WAND METHOD | Avaliação Fotográfica");
    add(container, "p", "wf-muted",
      "Preparando o registro fotográfico...");
  }

  montar();

  function erroVisivel(erro) {
    console.error("[WAND FOTOS]", erro);
    container.replaceChildren();

    add(container, "h2", null,
      "Avaliação Fotográfica");

    add(container, "p", "wf-error",
      "Não foi possível carregar o módulo: " +
      (erro?.message || String(erro)));

    container.appendChild(
      button("Tentar novamente", iniciar)
    );
  }

  function mostrarMensagem(texto, falha = false) {
    let e = container.querySelector("#wf-mensagem");

    if (!e) {
      e = add(container, "p");
      e.id = "wf-mensagem";
    }

    e.className = falha ? "wf-error" : "wf-success";
    e.textContent = texto;
  }

  function dataBR(v) {
    if (!v) return "—";
    return new Date(v).toLocaleDateString("pt-BR");
  }

  function statusAtual() {
    return consentimento?.status_avaliacao || "pendente";
  }

  function ultimaFoto(posicao) {
    return fotos.find(f => f.posicao === posicao);
  }

  function desenho(posicao) {
    // Figura orientativa, não uma fotografia real.
    const feminino = guia === "feminino";
    const pele = "#c99b78";
    const roupa = "#222";

    const frente = `
      <ellipse cx="100" cy="45" rx="17" ry="21"
        fill="${pele}"/>
      <path d="M85 66 L73 82 L77 170 L123 170
        L127 82 L115 66 Z" fill="${pele}"/>
      <path d="M74 80 L60 91 L51 158 L55 183
        L65 183 L68 155 L84 98 Z" fill="${pele}"/>
      <path d="M126 80 L140 91 L149 158 L145 183
        L135 183 L132 155 L116 98 Z" fill="${pele}"/>
      <path d="M77 168 L74 281 L92 281
        L100 185 L108 281 L126 281
        L123 168 Z" fill="${pele}"/>
      <path d="M74 277 L68 294 L92 294 L92 280 Z"
        fill="${pele}"/>
      <path d="M108 280 L108 294 L132 294
        L126 277 Z" fill="${pele}"/>
      <path d="M77 164 L123 164 L119 187
        L105 187 L100 179 L95 187 L81 187 Z"
        fill="${roupa}"/>
      ${feminino ? `
        <path d="M82 89 L118 89 L122 115
          L78 115 Z" fill="${roupa}"/>
      ` : ""}
    `;

    const perfil = `
      <ellipse cx="108" cy="45" rx="15" ry="21"
        fill="${pele}"/>
      <path d="M94 66 Q124 69 123 101
        L117 171 L92 171 L88 101 Z"
        fill="${pele}"/>
      <path d="M111 85 L125 98 L124 169
        L119 184 L110 181 L112 160
        L110 112 Z" fill="${pele}"/>
      <path d="M93 168 L90 281 L110 281
        L112 185 L118 281 L135 281
        L118 168 Z" fill="${pele}"/>
      <path d="M90 278 L86 294 L112 294
        L110 280 Z" fill="${pele}"/>
      <path d="M118 279 L114 294 L138 294
        L135 280 Z" fill="${pele}"/>
      <path d="M93 163 L118 163 L123 187
        L96 187 Z" fill="${roupa}"/>
      ${feminino ? `
        <path d="M92 92 L121 92 L121 115
          L92 115 Z" fill="${roupa}"/>
      ` : ""}
    `;

    const figura = posicao === "perfil"
      ? perfil
      : frente;

    return `
      <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 320"
        role="img"
        aria-label="Guia de posição ${posicao}">
        <rect width="200" height="320" fill="#e7e7e7"/>
        <line x1="20" y1="297" x2="180" y2="297"
          stroke="#aaa"/>
        ${figura}
        ${posicao === "costas" ? `
          <path d="M100 82 L100 152"
            stroke="#a97d5c" stroke-width="1.5"/>
        ` : ""}
      </svg>
    `;
  }

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

  async function buscar() {
    const c = await db
      .from("consentimentos_fotograficos")
      .select("*")
      .eq("aluno_id", aluno.id)
      .maybeSingle();

    if (c.error) throw c.error;
    consentimento = c.data;

    const f = await db
      .from("fotos_avaliacao")
      .select("*")
      .eq("aluno_id", aluno.id)
      .order("criado_em", {ascending:false});

    if (f.error) throw f.error;
    fotos = f.data || [];
  }

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
        aluno_id:aluno.id,
        status_avaliacao:status,
        divulgacao_autorizada:
          status === "autorizada" && divulgacao,
        versao_termo:VERSAO,
        atualizado_por:usuario.id,
        atualizado_em:new Date().toISOString()
      };

      const r = await db
        .from("consentimentos_fotograficos")
        .upsert(registro, {onConflict:"aluno_id"});

      if (r.error) throw r.error;

      exibirTermos = false;
      await buscar();
      renderizar();

      mostrarMensagem("Sua escolha foi registrada.");

    } catch (e) {
      mostrarMensagem(e.message, true);
    } finally {
      processando = false;
    }
  }

  function criarTermos(pai) {
    const caixa = add(pai, "div", "wf-box");
    add(caixa, "h3", null,
      "Autorização para avaliação fotográfica");

    add(caixa, "pre", "wf-term", TERMO_AVALIACAO);

    const label = add(caixa, "label");
    const aceite = document.createElement("input");
    aceite.type = "checkbox";
    label.appendChild(aceite);
    label.append(
      "Li o termo e autorizo o registro fotográfico " +
      "para avaliação e acompanhamento."
    );

    add(caixa, "h3", null,
      "Autorização de divulgação — opcional");

    add(caixa, "pre", "wf-term", TERMO_DIVULGACAO);

    const simLabel = add(caixa, "label");
    const sim = document.createElement("input");
    sim.type = "radio";
    sim.name = "wand-divulgacao-v2";
    simLabel.appendChild(sim);
    simLabel.append("Autorizo divulgação conforme o termo.");

    const naoLabel = add(caixa, "label");
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
      button("Autorizar avaliação e continuar", () => {
        if (!aceite.checked) {
          mostrarMensagem(
            "Leia e aceite o termo de avaliação.",
            true
          );
          return;
        }
        salvarConsentimento("autorizada", sim.checked);
      })
    );

    caixa.appendChild(
      button("Não quero realizar esta etapa", () => {
        const ok = confirm(
          "A avaliação fotográfica ficará incompleta. " +
          "Você poderá realizá-la posteriormente. " +
          "Deseja registrar sua recusa?"
        );

        if (ok) {
          salvarConsentimento("recusada", false);
        }
      }, true)
    );
  }

  function avisoRecusa(pai) {
    const caixa = add(pai, "div", "wf-warning");

    add(caixa, "h3", null,
      "Avaliação fotográfica recusada");

    add(caixa, "p", null,
      "No WAND METHOD, as fotografias ajudam a " +
      "acompanhar a evolução corporal e observar " +
      "possíveis assimetrias posturais.");

    add(caixa, "p", null,
      "Sem esse registro, a avaliação ficará " +
      "incompleta na parte fotográfica. Isso " +
      "reduz as informações disponíveis para " +
      "o acompanhamento individualizado.");

    add(caixa, "p", null,
      "Seu treinamento poderá continuar. " +
      "Você poderá realizar essa etapa depois.");

    if (pagina !== "perfil-aluno.html") {
      caixa.appendChild(
        button("Quero realizar a avaliação", () => {
          exibirTermos = true;
          renderizar();
        })
      );
    }
  }

  function validarArquivo(file) {
    if (!file) throw new Error("Selecione uma imagem.");

    if (![
      "image/jpeg",
      "image/png",
      "image/webp"
    ].includes(file.type)) {
      throw new Error("Use JPG, PNG ou WebP.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Máximo de 10 MB por imagem.");
    }
  }

  async function enviar(posicao, file) {
    if (processando) return;
    processando = true;

    let caminho = null;

    try {
      if (statusAtual() !== "autorizada") {
        throw new Error(
          "É necessário autorizar a avaliação."
        );
      }

      validarArquivo(file);

      const extensao = {
        "image/jpeg":"jpg",
        "image/png":"png",
        "image/webp":"webp"
      }[file.type];

      caminho =
        aluno.id + "/" +
        crypto.randomUUID() + "." + extensao;

      mostrarMensagem("Enviando foto de " + posicao + "...");

      const up = await db.storage
        .from(BUCKET)
        .upload(caminho, file, {
          contentType:file.type,
          upsert:false
        });

      if (up.error) throw up.error;

      const reg = await db
        .from("fotos_avaliacao")
        .insert({
          aluno_id:aluno.id,
          posicao,
          caminho,
          enviado_por:usuario.id
        });

      if (reg.error) throw reg.error;

      await buscar();
      renderizar();

      mostrarMensagem("Fotografia enviada com sucesso.");

    } catch (e) {
      if (caminho) {
        await db.storage.from(BUCKET)
          .remove([caminho]);
      }
      mostrarMensagem(e.message, true);
    } finally {
      processando = false;
    }
  }

  async function excluir(foto) {
    if (processando) return;
    if (!confirm("Excluir esta fotografia?")) return;

    processando = true;

    try {
      const arq = await db.storage
        .from(BUCKET)
        .remove([foto.caminho]);

      if (arq.error) throw arq.error;

      const reg = await db
        .from("fotos_avaliacao")
        .delete()
        .eq("id", foto.id);

      if (reg.error) throw reg.error;

      await buscar();
      renderizar();

      mostrarMensagem("Fotografia excluída.");

    } catch (e) {
      mostrarMensagem(e.message, true);
    } finally {
      processando = false;
    }
  }

  async function exibirImagem(local, foto) {
    const resultado = await db.storage
      .from(BUCKET)
      .createSignedUrl(foto.caminho, 300);

    if (resultado.error || !resultado.data?.signedUrl) {
      local.textContent = "Imagem indisponível";
      return;
    }

    if (!local.isConnected) return;

    const img = document.createElement("img");
    img.src = resultado.data.signedUrl;
    img.alt = "Fotografia de " + foto.posicao;
    img.loading = "lazy";

    local.replaceChildren(img);
  }

  function cartoes(pai) {
    const grade = add(pai, "div", "wf-grid");

    for (const posicao of ["frente","perfil","costas"]) {
      const card = add(grade, "div", "wf-card");
      const area = add(card, "div", "wf-image");
      const foto = ultimaFoto(posicao);

      if (foto) {
        exibirImagem(area, foto);
      } else {
        area.innerHTML = desenho(posicao);
      }

      add(card, "strong", null,
        posicao.charAt(0).toUpperCase() +
        posicao.slice(1));

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
        button(foto ? "Nova foto" : "Tirar / enviar", () => {
          input.click();
        })
      );

      if (foto) {
        card.appendChild(
          button("Excluir", () => excluir(foto), true)
        );
      }
    }
  }

  function instrucoes(pai) {
    const caixa = add(pai, "div", "wf-box");

    add(caixa, "h3", null,
      "Como tirar suas fotografias");

    const ul = add(caixa, "ul");

    [
      "Fotografe o corpo inteiro, da cabeça aos pés.",
      "Utilize iluminação adequada e fundo neutro.",
      "Fique descalço e com os braços relaxados.",
      "Mantenha sua postura natural.",
      "Não contraia o abdômen nem estufe o peito.",
      "Não tente corrigir artificialmente sua postura.",
      "Posicione a câmera aproximadamente na altura do quadril.",
      "Quando possível, mantenha cerca de 2 a 3 metros de distância."
    ].forEach(t => add(ul, "li", null, t));

    add(caixa, "h3", null, "Vestimenta recomendada");

    add(caixa, "p", null,
      guia === "feminino"
        ? "Top esportivo com short curto ou biquíni, conforme seu conforto."
        : "Sunga ou short curto e ajustado, conforme seu conforto.");

    add(caixa, "p", "wf-muted",
      "Essas roupas facilitam a observação de " +
      "contornos e assimetrias, mas não são obrigatórias.");

    add(caixa, "div", "wf-warning",
      "Importante: não contraia a musculatura, " +
      "não estufe o peito e não tente corrigir " +
      "sua postura para as fotografias.");
  }

  function historico(pai) {
    if (!fotos.length) return;

    const caixa = add(pai, "div", "wf-box");
    add(caixa, "h3", null, "Histórico fotográfico");

    const grade = add(caixa, "div", "wf-history");

    for (const foto of fotos) {
      const card = add(grade, "div", "wf-card");
      const area = add(card, "div", "wf-image");

      exibirImagem(area, foto);

      add(card, "p", "wf-small",
        foto.posicao.toUpperCase() +
        " · " + dataBR(foto.criado_em));
    }
  }

  function renderizar() {
    container.replaceChildren();

    add(container, "h2", null,
      "Suas fotografias corporais");

    add(container, "p", "wf-muted",
      "WAND METHOD — Registro fotográfico e " +
      "acompanhamento corporal e postural.");

    if (aluno?.nome_completo) {
      add(container, "p", "wf-muted",
        "Aluno(a): " + aluno.nome_completo);
    }

    const status = statusAtual();

    const topo = add(container, "div", "wf-box");

    add(topo, "p", "wf-status",
      "Avaliação fotográfica: " +
      (status === "autorizada"
        ? "AUTORIZADA"
        : status === "recusada"
          ? "RECUSADA"
          : "PENDENTE"));

    add(topo, "p", "wf-muted",
      "Divulgação: " +
      (consentimento?.divulgacao_autorizada
        ? "Autorização inicial registrada. " +
          "Publicação depende de aprovação específica."
        : "Não autorizada."));

    if (pagina === "perfil-aluno.html") {
      add(topo, "p", "wf-small",
        "As autorizações devem ser registradas " +
        "pelo próprio aluno na conta dele.");
    }

    if (status === "recusada") {
      avisoRecusa(container);
    }

    if (pagina !== "perfil-aluno.html" &&
        (status !== "autorizada" || exibirTermos)) {
      criarTermos(container);
    }

    if (status === "autorizada") {
      const guiaBox = add(container, "div", "wf-box");

      add(guiaBox, "h3", null, "Guia visual");

      const botoes = add(guiaBox, "div", "wf-actions");

      botoes.appendChild(
        button("Modelo masculino", () => {
          guia = "masculino";
          renderizar();
        }, guia !== "masculino")
      );

      botoes.appendChild(
        button("Modelo feminino", () => {
          guia = "feminino";
          renderizar();
        }, guia !== "feminino")
      );

      cartoes(container);
      instrucoes(container);

      if (pagina !== "perfil-aluno.html" && !exibirTermos) {
        container.appendChild(
          button("Revisar autorizações", () => {
            exibirTermos = true;
            renderizar();
          }, true)
        );
      }
    }

    historico(container);

    if (fotos.length) {
      add(container, "p", "wf-small",
        "As fotografias são privadas. Para solicitar " +
        "exclusão de dados ou revogação de consentimento, " +
        "entre em contato com o responsável pelo WAND METHOD.");
    }

    const msg = add(container, "p");
    msg.id = "wf-mensagem";
  }

  async function iniciar() {
    try {
      montar();

      // Carrega a biblioteca após mostrar a interface.
      const biblioteca = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      db = biblioteca.createClient(URL_DB, CHAVE_DB, {
        auth: {
          persistSession:true,
          autoRefreshToken:true,
          detectSessionInUrl:false
        }
      });

      const auth = await db.auth.getUser();

      if (auth.error || !auth.data?.user) {
        throw new Error(
          "Faça login no WAND METHOD para abrir esta etapa."
        );
      }

      usuario = auth.data.user;

      if (pagina === "perfil-aluno.html") {
        const perfil = await db
          .from("profiles")
          .select("role")
          .eq("id", usuario.id)
          .single();

        if (perfil.error || perfil.data?.role !== "admin") {
          throw new Error(
            "Esta área é exclusiva do treinador."
          );
        }

        const id = new URLSearchParams(location.search)
          .get("id");

        if (!id || !/^\d+$/.test(id)) {
          throw new Error("Aluno não identificado na URL.");
        }

        const consulta = await db
          .from("alunos")
          .select("id,nome_completo,sexo")
          .eq("id", Number(id))
          .single();

        if (consulta.error) throw consulta.error;
        aluno = consulta.data;

      } else {
        const consulta = await db
          .from("alunos")
          .select("id,nome_completo,sexo")
          .eq("user_id", usuario.id)
          .single();

        if (consulta.error) throw consulta.error;
        aluno = consulta.data;
      }

      if (!aluno) {
        throw new Error("Aluno não encontrado.");
      }

      const sexo = String(aluno.sexo || "").toLowerCase();
      guia = ["f","feminino","mulher"].includes(sexo)
        ? "feminino"
        : "masculino";

      await buscar();
      renderizar();

    } catch (e) {
      erroVisivel(e);
    }
  }

  iniciar();
})();
