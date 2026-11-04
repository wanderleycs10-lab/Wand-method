
/*
 WAND METHOD — AVALIAÇÃO FOTOGRÁFICA 1.0

 Inserir em:
 - anamnese.html
 - perfil-aluno.html
 - aluno.html (opcional, para consultar fotos)

 Requer as tabelas e o bucket criados no Supabase.
*/

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const db = createClient(
  "https://kvxdnreipuahoaostlle.supabase.co",
  "sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo"
);

const BUCKET = "avaliacoes-fotograficas";
const VERSAO_TERMO = "1.0";

const paginaTreinador =
  location.pathname.endsWith("perfil-aluno.html");

const paginaAnamnese =
  location.pathname.endsWith("anamnese.html");

const paginaAluno =
  location.pathname.endsWith("aluno.html");

const POSICOES = [
  { id: "frente", titulo: "Frente" },
  { id: "perfil", titulo: "Perfil" },
  { id: "costas", titulo: "Costas" }
];

let usuario = null;
let aluno = null;
let consentimento = null;
let fotos = [];
let visualizacao = [];
let painel = null;
let mensagem = null;
let carregando = false;

const css = document.createElement("style");

css.textContent = `
#wf-modulo {
  --wf-ouro:#ffd500;
  --wf-fundo:#101010;
  --wf-card:#1a1a1a;
  --wf-borda:#444;
  font-family:Arial,sans-serif;
  color:#f5f5f5;
  background:#101010;
  border:1px solid #5a4a1e;
  border-radius:18px;
  padding:20px;
  margin:24px auto;
  max-width:1100px;
  box-sizing:border-box;
}
#wf-modulo * { box-sizing:border-box; }
#wf-modulo h2 {
  font-size:23px;
  color:white;
  margin:0 0 12px;
}
#wf-modulo h3 {
  color:var(--wf-ouro);
  font-size:17px;
  margin:0 0 12px;
}
#wf-modulo p {
  line-height:1.5;
}
#wf-modulo .wf-sub {
  color:#c6c6c6;
  font-size:14px;
}
#wf-modulo .wf-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
  margin:20px 0;
}
#wf-modulo .wf-foto {
  background:#202020;
  border:1px solid #555;
  border-radius:13px;
  padding:10px;
  min-width:0;
  text-align:center;
}
#wf-modulo .wf-imagem {
  background:#ededed;
  border-radius:10px;
  width:100%;
  aspect-ratio:3/4;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
#wf-modulo .wf-imagem img,
#wf-modulo .wf-imagem svg {
  display:block;
  width:100%;
  height:100%;
  object-fit:contain;
}
#wf-modulo .wf-foto strong {
  display:block;
  margin:10px 0;
}
#wf-modulo .wf-btn {
  background:#ffd500;
  color:#111;
  border:0;
  border-radius:10px;
  padding:12px 14px;
  font-size:14px;
  font-weight:bold;
  cursor:pointer;
  width:100%;
  margin:5px 0;
}
#wf-modulo .wf-btn:disabled {
  opacity:.45;
  cursor:not-allowed;
}
#wf-modulo .wf-btn-sec {
  background:#303030;
  color:white;
  border:1px solid #777;
}
#wf-modulo .wf-box {
  background:#1b1b1b;
  border:1px solid #565656;
  border-radius:13px;
  padding:16px;
  margin:15px 0;
}
#wf-modulo .wf-alerta {
  border-left:4px solid #ffd500;
  background:#302611;
  border-radius:8px;
  padding:14px;
  margin:12px 0;
  line-height:1.5;
}
#wf-modulo .wf-status {
  display:inline-block;
  border-radius:20px;
  background:#383838;
  padding:7px 12px;
  font-size:13px;
  font-weight:bold;
}
#wf-modulo .wf-ok {
  color:#65df9a;
}
#wf-modulo .wf-erro {
  color:#ff9999;
}
#wf-modulo label {
  display:block;
  margin:12px 0;
  line-height:1.5;
  cursor:pointer;
}
#wf-modulo input[type=checkbox],
#wf-modulo input[type=radio] {
  accent-color:#ffd500;
  margin-right:8px;
}
#wf-modulo .wf-termo {
  background:#0d0d0d;
  border:1px solid #444;
  border-radius:10px;
  padding:14px;
  max-height:230px;
  overflow:auto;
  font-size:13px;
  line-height:1.6;
}
#wf-modulo .wf-mini {
  font-size:12px;
  color:#bbb;
  line-height:1.5;
}
#wf-modulo .wf-linha {
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}
#wf-modulo .wf-linha > * {
  flex:1 1 160px;
}
#wf-modulo .wf-historico {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:12px;
}
#wf-modulo .wf-historico img {
  width:100%;
  aspect-ratio:3/4;
  object-fit:contain;
  background:#eee;
  border-radius:8px;
}
#wf-modulo .wf-instrucao {
  font-size:13px;
  color:#ddd;
}
@media(max-width:650px) {
  #wf-modulo { padding:12px; }
  #wf-modulo .wf-grid { gap:6px; }
  #wf-modulo .wf-foto { padding:5px; }
  #wf-modulo .wf-btn {
    font-size:11px;
    padding:9px 5px;
  }
  #wf-modulo .wf-historico { gap:6px; }
}
`;

document.head.appendChild(css);

function el(tag, classe, texto) {
  const item = document.createElement(tag);

  if (classe) item.className = classe;

  if (texto !== undefined) {
    item.textContent = texto;
  }

  return item;
}

function add(pai, tag, classe, texto) {
  const item = el(tag, classe, texto);
  pai.appendChild(item);
  return item;
}

function botao(texto, funcao, secundario = false) {
  const b = el(
    "button",
    secundario ? "wf-btn wf-btn-sec" : "wf-btn",
    texto
  );

  b.type = "button";
  b.onclick = funcao;
  return b;
}

function avisar(texto, erro = false) {
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.className = erro ? "wf-erro" : "wf-ok";
}

function dataBR(valor) {
  if (!valor) return "—";

  return new Date(valor).toLocaleDateString("pt-BR");
}

function sexoNormalizado() {
  const s = String(aluno?.sexo || "").toLowerCase();

  if (["f", "feminino", "mulher"].includes(s)) {
    return "feminino";
  }

  return "masculino";
}

/*
 Desenhos orientativos originais em SVG.
 Braços relaxados, mãos ao lado das coxas.
 Não representam uma posição anatômica forçada.
*/
function desenho(posicao, sexo) {
  const feminino = sexo === "feminino";
  const pele = "#c18d6d";
  const roupa = "#222222";

  const cabeca = `
    <ellipse cx="100" cy="49" rx="17" ry="22"
      fill="${pele}"/>
    <path d="M83 45 Q83 21 101 23 Q121 25 117 45
      L115 36 Q101 28 85 38 Z" fill="#33261e"/>
  `;

  const pernas = `
    <path d="M77 178 L72 267 Q71 284 81 284
      L94 185 Z" fill="${pele}"/>
    <path d="M106 185 L119 284 Q130 286 128 270
      L123 178 Z" fill="${pele}"/>
    <path d="M72 279 L67 292 L87 292 L82 280 Z"
      fill="${pele}"/>
    <path d="M119 280 L115 292 L135 292 L128 279 Z"
      fill="${pele}"/>
  `;

  const corpo = `
    <path d="M91 69 L78 77 L70 112 L77 174
      L123 174 L130 112 L122 77 L109 69 Z"
      fill="${pele}"/>
    <path d="M78 77 L64 86 L55 144 L58 180
      Q64 185 68 177 L70 138 L83 99 Z"
      fill="${pele}"/>
    <path d="M122 77 L136 86 L145 144 L142 180
      Q136 185 132 177 L130 138 L117 99 Z"
      fill="${pele}"/>
  `;

  const vestimenta = feminino
    ? `
      <path d="M83 91 L117 91 L122 116 L78 116 Z"
        fill="${roupa}"/>
      <path d="M77 164 L123 164 L127 192
        L103 192 L100 180 L97 192 L73 192 Z"
        fill="${roupa}"/>
    `
    : `
      <path d="M77 164 L123 164 L117 184
        L103 184 L100 176 L97 184 L83 184 Z"
        fill="${roupa}"/>
    `;

  const frente = `
    ${pernas}
    ${corpo}
    ${cabeca}
    ${vestimenta}
  `;

  const costas = `
    ${pernas}
    ${corpo}
    ${cabeca}
    ${vestimenta}
    <path d="M100 82 L100 147"
      stroke="#9d725a" stroke-width="1.5"
      fill="none"/>
  `;

  const perfil = `
    <path d="M95 177 L91 282 L112 282
      L113 185 Z" fill="${pele}"/>
    <path d="M105 178 L114 282 L132 282
      L117 176 Z" fill="${pele}"/>
    <path d="M92 278 L87 291 L114 291
      L112 280 Z" fill="${pele}"/>
    <path d="M115 279 L110 291 L136 291
      L132 280 Z" fill="${pele}"/>
    <path d="M94 73 Q120 68 120 96
      L116 170 L93 170 L88 102 Z"
      fill="${pele}"/>
    <path d="M109 82 Q125 93 124 119
      L121 174 Q115 182 111 174
      L112 122 L103 98 Z"
      fill="${pele}"/>
    <ellipse cx="106" cy="49" rx="15" ry="22"
      fill="${pele}"/>
    <path d="M91 44 Q90 23 107 24
      Q121 26 119 42 Q110 31 94 37 Z"
      fill="#33261e"/>
    <path d="M94 162 L118 162 L122 185
      L96 185 Z" fill="${roupa}"/>
    ${feminino
      ? `<path d="M94 94 L119 94 L119 115
           L94 115 Z" fill="${roupa}"/>`
      : ""}
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 320"
      role="img"
      aria-label="Exemplo de foto ${posicao}">
      <rect width="200" height="320" fill="#ededed"/>
      <line x1="20" y1="296" x2="180" y2="296"
        stroke="#bbbbbb" stroke-width="1"/>
      ${posicao === "perfil"
        ? perfil
        : posicao === "costas" ? costas : frente}
    </svg>
  `;
}

function limparURLs() {
  for (const url of visualizacao) {
    URL.revokeObjectURL(url);
  }
  visualizacao = [];
}

async function buscarDados() {
  const { data: c, error: erroC } = await db
    .from("consentimentos_fotograficos")
    .select("*")
    .eq("aluno_id", aluno.id)
    .maybeSingle();

  if (erroC) throw erroC;

  consentimento = c;

  const { data: f, error: erroF } = await db
    .from("fotos_avaliacao")
    .select("*")
    .eq("aluno_id", aluno.id)
    .order("criado_em", { ascending: false });

  if (erroF) throw erroF;

  fotos = f || [];
}

async function salvarConsentimento(status, divulgacao) {
  if (carregando) return;

  carregando = true;

  try {
    const registro = {
      aluno_id: aluno.id,
      status_avaliacao: status,
      divulgacao_autorizada: divulgacao,
      versao_termo: VERSAO_TERMO,
      atualizado_em: new Date().toISOString(),
      atualizado_por: usuario.id
    };

    const { error } = await db
      .from("consentimentos_fotograficos")
      .upsert(registro, { onConflict: "aluno_id" });

    if (error) throw error;

    const { error: erroEvento } = await db
      .from("eventos_consentimento_fotografico")
      .insert({
        aluno_id: aluno.id,
        status_avaliacao: status,
        divulgacao_autorizada: divulgacao,
        versao_termo: VERSAO_TERMO,
        registrado_por: usuario.id
      });

    if (erroEvento) {
      console.warn("Falha no histórico:", erroEvento);
      throw new Error(
        "A escolha foi salva, mas o registro de auditoria falhou. " +
        "Entre em contato com o suporte antes de utilizar as imagens."
      );
    }

    await buscarDados();
    renderizar();

  } catch (erro) {
    avisar(erro.message || "Erro ao salvar.", true);
  } finally {
    carregando = false;
  }
}

function textoTermoAvaliacao() {
  return `
TERMO DE REGISTRO FOTOGRÁFICO PARA AVALIAÇÃO

Versão ${VERSAO_TERMO}

As fotografias de frente, perfil e costas serão
utilizadas para acompanhar a evolução corporal
e apoiar a observação de características posturais.

As imagens serão acessíveis ao aluno e ao treinador
autorizado no WAND METHOD.

A análise por fotografias tem limitações e não
constitui diagnóstico clínico.

O aluno poderá recusar esta etapa. Nesse caso,
a avaliação fotográfica ficará registrada como
não realizada, com limitações na análise visual.

O aluno poderá solicitar a retirada das imagens
e informações sobre o tratamento de seus dados.

Esta autorização NÃO permite divulgação em redes
sociais ou publicidade.
`;
}

function textoTermoDivulgacao() {
  return `
AUTORIZAÇÃO OPCIONAL PARA DIVULGAÇÃO

Versão ${VERSAO_TERMO}

A autorização para divulgação é separada do
registro fotográfico para avaliação.

Se autorizada, poderá permitir o uso de imagens
selecionadas para apresentar os serviços e
resultados do WAND METHOD em seus canais oficiais.

Nenhuma imagem será publicada automaticamente.

Antes de qualquer divulgação, o aluno deverá
aprovar as fotografias específicas e os canais
de publicação.

A recusa não prejudica o treinamento.

O aluno poderá revogar a autorização para
novas utilizações e solicitar retirada das
publicações sob controle do WAND METHOD.
`;
}

function criarTermos(destino) {
  const caixa = add(destino, "div", "wf-box");

  add(caixa, "h3", null, "Autorização e privacidade");

  add(
    caixa,
    "p",
    "wf-sub",
    "Leia os termos antes de decidir. A divulgação é opcional."
  );

  const termo = add(caixa, "pre", "wf-termo");
  termo.style.whiteSpace = "pre-wrap";
  termo.textContent = textoTermoAvaliacao();

  const concordo = add(caixa, "label");

  const check = document.createElement("input");
  check.type = "checkbox";
  concordo.appendChild(check);

  concordo.append(
    "Li e autorizo o registro fotográfico " +
    "para avaliação física e acompanhamento postural."
  );

  add(
    caixa,
    "h3",
    null,
    "Divulgação de imagens — escolha opcional"
  );

  const termoDiv = add(caixa, "pre", "wf-termo");
  termoDiv.style.whiteSpace = "pre-wrap";
  termoDiv.textContent = textoTermoDivulgacao();

  const grupo = add(caixa, "div");

  const opcaoSim = add(grupo, "label");
  const sim = document.createElement("input");
  sim.type = "radio";
  sim.name = "wf-divulgacao";
  sim.value = "sim";
  opcaoSim.appendChild(sim);
  opcaoSim.append("Autorizo, conforme o termo.");

  const opcaoNao = add(grupo, "label");
  const nao = document.createElement("input");
  nao.type = "radio";
  nao.name = "wf-divulgacao";
  nao.value = "nao";
  nao.checked = true;
  opcaoNao.appendChild(nao);
  opcaoNao.append("Não autorizo divulgação.");

  if (consentimento?.divulgacao_autorizada) {
    sim.checked = true;
  }

  const salvar = botao(
    "Autorizar avaliação e continuar",
    async () => {
      if (!check.checked) {
        avisar(
          "Leia e aceite o termo de avaliação para continuar.",
          true
        );
        return;
      }

      await salvarConsentimento(
        "autorizada",
        sim.checked
      );
    }
  );

  caixa.appendChild(salvar);

  const recusar = botao(
    "Não quero realizar a avaliação fotográfica",
    async () => {
      const confirmado = confirm(
        "Ao recusar, a análise fotográfica e postural " +
        "ficará incompleta. Deseja registrar sua recusa?"
      );

      if (!confirmado) return;

      await salvarConsentimento("recusada", false);
    },
    true
  );

  caixa.appendChild(recusar);
}

function criarAvisoRecusa(destino) {
  const caixa = add(destino, "div", "wf-alerta");

  add(
    caixa,
    "strong",
    null,
    "Avaliação fotográfica recusada"
  );

  add(
    caixa,
    "p",
    null,
    "No WAND METHOD, o registro fotográfico é uma " +
    "etapa importante para acompanhar mudanças " +
    "corporais e observar possíveis assimetrias."
  );

  add(
    caixa,
    "p",
    null,
    "Sem essas imagens, sua avaliação permanecerá " +
    "incompleta na parte fotográfica e a análise " +
    "visual e postural terá limitações. Isso pode " +
    "reduzir as informações disponíveis para o " +
    "acompanhamento individualizado."
  );

  add(
    caixa,
    "p",
    null,
    "Seu treinamento poderá continuar normalmente. " +
    "Você poderá realizar esta etapa posteriormente."
  );

  caixa.appendChild(
    botao("Quero realizar a avaliação", () => {
      renderizar(true);
    })
  );
}

function verificarArquivo(arquivo) {
  const tipos = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!arquivo || !tipos.includes(arquivo.type)) {
    throw new Error(
      "Escolha uma imagem JPG, PNG ou WebP."
    );
  }

  if (arquivo.size > 10 * 1024 * 1024) {
    throw new Error(
      "A fotografia deve ter no máximo 10 MB."
    );
  }
}

async function enviarFoto(posicao, arquivo) {
  if (carregando) return;

  carregando = true;

  let caminho = null;

  try {
    if (consentimento?.status_avaliacao !== "autorizada") {
      throw new Error(
        "Autorize a avaliação fotográfica primeiro."
      );
    }

    verificarArquivo(arquivo);

    const extensoes = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    const extensao = extensoes[arquivo.type];

    caminho =
      aluno.id + "/" +
      crypto.randomUUID() + "." + extensao;

    avisar("Enviando fotografia de " + posicao + "...");

    const { error: erroUpload } = await db.storage
      .from(BUCKET)
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        upsert: false
      });

    if (erroUpload) throw erroUpload;

    const { error: erroRegistro } = await db
      .from("fotos_avaliacao")
      .insert({
        aluno_id: aluno.id,
        posicao,
        caminho,
        enviado_por: usuario.id
      });

    if (erroRegistro) throw erroRegistro;

    await buscarDados();
    renderizar();

  } catch (erro) {
    if (caminho) {
      await db.storage.from(BUCKET)
        .remove([caminho]);
    }

    avisar(erro.message || "Erro no envio.", true);
  } finally {
    carregando = false;
  }
}

async function excluirFoto(foto) {
  if (carregando) return;

  if (!confirm("Excluir esta fotografia permanentemente?")) {
    return;
  }

  carregando = true;

  try {
    const { error: erroStorage } = await db.storage
      .from(BUCKET)
      .remove([foto.caminho]);

    if (erroStorage) throw erroStorage;

    const { error: erroBanco } = await db
      .from("fotos_avaliacao")
      .delete()
      .eq("id", foto.id);

    if (erroBanco) throw erroBanco;

    await buscarDados();
    renderizar();

  } catch (erro) {
    avisar(erro.message || "Erro ao excluir.", true);
  } finally {
    carregando = false;
  }
}

async function mostrarFoto(elemento, foto) {
  const { data, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(foto.caminho, 600);

  if (error || !data?.signedUrl) {
    elemento.textContent = "Imagem indisponível";
    return;
  }

  const imagem = document.createElement("img");
  imagem.src = data.signedUrl;
  imagem.alt = "Fotografia " + foto.posicao;
  imagem.loading = "lazy";

  elemento.replaceChildren(imagem);
}

function ultimaFoto(posicao) {
  return fotos.find(f => f.posicao === posicao);
}

function criarCartoes(destino) {
  const grade = add(destino, "div", "wf-grid");

  for (const posicao of POSICOES) {
    const card = add(grade, "div", "wf-foto");

    const visual = add(card, "div", "wf-imagem");

    const foto = ultimaFoto(posicao.id);

    if (foto) {
      mostrarFoto(visual, foto);
    } else {
      visual.innerHTML = desenho(
        posicao.id,
        sexoNormalizado()
      );
    }

    add(card, "strong", null, posicao.titulo);

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.style.display = "none";

    input.onchange = async () => {
      const arquivo = input.files?.[0];

      if (arquivo) {
        await enviarFoto(posicao.id, arquivo);
      }
    };

    card.appendChild(input);

    card.appendChild(
      botao(
        foto ? "Trocar foto" : "Tirar / enviar",
        () => input.click()
      )
    );

    if (foto) {
      card.appendChild(
        botao(
          "Excluir",
          () => excluirFoto(foto),
          true
        )
      );
    }
  }
}

function criarInstrucoes(destino) {
  const caixa = add(destino, "div", "wf-box");

  add(caixa, "h3", null, "Como tirar suas fotos");

  const instrucoes = [
    "Use boa iluminação e fundo neutro.",
    "Enquadre o corpo inteiro, da cabeça aos pés.",
    "Fique descalço.",
    "Mantenha os braços ao lado do corpo e as mãos relaxadas, sem supinação forçada.",
    "Fique em sua postura habitual. Não tente corrigir ombros, coluna ou joelhos.",
    "Não contraia o abdômen nem estufe o peito.",
    "Deixe o celular nivelado, aproximadamente na altura da cintura ou quadril.",
    "Mantenha distância suficiente para enquadrar o corpo inteiro, preferencialmente cerca de 2 a 3 metros, quando o espaço permitir."
  ];

  const lista = add(caixa, "ul", "wf-instrucao");

  for (const texto of instrucoes) {
    add(lista, "li", null, texto);
  }

  const roupa = sexoNormalizado() === "feminino"
    ? "Para melhor visualização, recomendamos top esportivo e short curto ou biquíni, conforme seu conforto."
    : "Para melhor visualização, recomendamos sunga ou short curto e ajustado, conforme seu conforto.";

  add(caixa, "p", "wf-alerta", roupa);

  add(
    caixa,
    "p",
    "wf-mini",
    "A roupa recomendada não é obrigatória. " +
    "Escolha uma opção confortável que permita " +
    "a observação corporal. As fotos são privadas."
  );
}

function criarHistorico(destino) {
  if (!fotos.length) return;

  const caixa = add(destino, "div", "wf-box");

  add(caixa, "h3", null, "Histórico fotográfico");

  const grade = add(caixa, "div", "wf-historico");

  for (const foto of fotos) {
    const item = add(grade, "div", "wf-foto");
    const visual = add(item, "div", "wf-imagem");

    mostrarFoto(visual, foto);

    add(
      item,
      "p",
      "wf-mini",
      foto.posicao.toUpperCase() +
      " · " + dataBR(foto.criado_em)
    );
  }

  add(
    caixa,
    "p",
    "wf-mini",
    "As fotografias ficam organizadas por data " +
    "para permitir comparação visual ao longo do tempo."
  );
}

function renderizar(mostrarTermos = false) {
  limparURLs();
  painel.replaceChildren();

  add(painel, "h2", null, "📷 Suas fotografias corporais");

  add(
    painel,
    "p",
    "wf-sub",
    "Registro fotográfico para acompanhar sua " +
    "evolução física e observar características " +
    "posturais. Mantenha sua postura natural."
  );

  const status =
    consentimento?.status_avaliacao || "pendente";

  const linha = add(painel, "div", "wf-box");

  add(
    linha,
    "strong",
    "wf-status",
    status === "autorizada"
      ? "Avaliação autorizada"
      : status === "recusada"
        ? "Avaliação fotográfica recusada"
        : "Avaliação fotográfica pendente"
  );

  add(
    linha,
    "p",
    "wf-mini",
    "Divulgação: " +
    (consentimento?.divulgacao_autorizada
      ? "autorizada em princípio; publicação exige aprovação específica"
      : "não autorizada")
  );

  if (status === "recusada" && !mostrarTermos) {
    criarAvisoRecusa(painel);
  }

  if (status !== "autorizada" || mostrarTermos) {
    criarTermos(painel);
  }

  if (status === "autorizada") {
    criarCartoes(painel);
    criarInstrucoes(painel);

    painel.appendChild(
      botao(
        "Revisar ou alterar autorizações",
        () => renderizar(true),
        true
      )
    );
  }

  criarHistorico(painel);

  if (fotos.length) {
    add(
      painel,
      "p",
      "wf-mini",
      "As imagens registradas anteriormente continuam " +
      "no histórico até que seja solicitada sua exclusão. " +
      "A revogação de autorização deve ser tratada " +
      "separadamente da exclusão dos arquivos."
    );
  }

  mensagem = add(painel, "p", "wf-mini");
}

async function iniciar() {
  if (!paginaTreinador && !paginaAnamnese && !paginaAluno) {
    return;
  }

  painel = document.createElement("section");
  painel.id = "wf-modulo";

  const principal =
    document.querySelector("main") ||
    document.body;

  // Adiciona o módulo sem substituir o conteúdo existente.
  // Evita colocá-lo dentro de formulários já existentes.
  if (principal.tagName.toLowerCase() === "form") {
    principal.insertAdjacentElement("afterend", painel);
  } else {
    principal.appendChild(painel);
  }

  mensagem = add(
    painel,
    "p",
    "wf-sub",
    "Carregando avaliação fotográfica..."
  );

  try {
    const { data: auth, error: erroAuth } =
      await db.auth.getUser();

    if (erroAuth || !auth?.user) {
      throw new Error("Entre na sua conta para continuar.");
    }

    usuario = auth.user;

    if (paginaTreinador) {
      const { data: perfil, error: erroPerfil } =
        await db.from("profiles")
          .select("role")
          .eq("id", usuario.id)
          .single();

      if (erroPerfil || perfil?.role !== "admin") {
        throw new Error("Acesso restrito ao treinador.");
      }

      const id = new URLSearchParams(location.search)
        .get("id");

      if (!id || !/^\d+$/.test(id)) {
        throw new Error("Aluno não selecionado.");
      }

      const { data, error } = await db
        .from("alunos")
        .select("id,nome_completo,sexo")
        .eq("id", Number(id))
        .single();

      if (error) throw error;

      aluno = data;
    } else {
      const { data, error } = await db
        .from("alunos")
        .select("id,nome_completo,sexo")
        .eq("user_id", usuario.id)
        .single();

      if (error) throw error;

      aluno = data;
    }

    if (!aluno) {
      throw new Error(
        "Cadastro de aluno não encontrado."
      );
    }

    await buscarDados();
    renderizar();

  } catch (erro) {
    painel.replaceChildren();

    add(
      painel,
      "p",
      "wf-erro",
      "Não foi possível abrir a avaliação fotográfica: " +
      (erro.message || String(erro))
    );
  }
}

iniciar();
