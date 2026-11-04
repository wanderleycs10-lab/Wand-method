
/*
 WAND METHOD — ANÁLISE CORPORAL 2.1

 Funciona em:
 - perfil-aluno.html (WandCoach)
 - aluno.html (área do aluno)

 Referência:
 Gallagher et al. (2000), AJCN 72:694-701.
 DOI: 10.1093/ajcn/72.3.694

 Faixas aproximadas derivadas de relações entre
 percentual de gordura, sexo, idade e IMC.

 Não constituem diagnóstico clínico.
*/

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://kvxdnreipuahoaostlle.supabase.co",
  "sb_publishable_8DJWlBHFrh_cULSe3icwJg_t9ZqTBjo"
);

const REFERENCIAS = {
  feminino: [
    { inicio: 20, fim: 39, baixo: 21, alto: 33, muitoAlto: 39 },
    { inicio: 40, fim: 59, baixo: 23, alto: 34, muitoAlto: 40 },
    { inicio: 60, fim: 79, baixo: 24, alto: 36, muitoAlto: 42 }
  ],
  masculino: [
    { inicio: 20, fim: 39, baixo: 8, alto: 20, muitoAlto: 25 },
    { inicio: 40, fim: 59, baixo: 11, alto: 22, muitoAlto: 28 },
    { inicio: 60, fim: 79, baixo: 13, alto: 25, muitoAlto: 30 }
  ]
};

const CORES = {
  baixo: "#6c9de5",
  adequado: "#36c98a",
  elevado: "#d4af37",
  muitoElevado: "#ef7777",
  neutro: "#d4af37"
};

const METRICAS = [
  ["peso", "Peso corporal", "kg"],
  ["percentual_gordura", "Gordura corporal", "%"],
  ["massa_gordura_kg", "Massa de gordura", "kg"],
  ["massa_livre_gordura_kg", "Massa livre de gordura", "kg"],
  ["cintura", "Cintura", "cm"],
  ["quadril", "Quadril", "cm"],
  ["braco_direito", "Braço direito", "cm"],
  ["braco_esquerdo", "Braço esquerdo", "cm"],
  ["coxa_direita", "Coxa direita", "cm"],
  ["coxa_esquerda", "Coxa esquerda", "cm"]
];

const estilo = document.createElement("style");

estilo.textContent = `
.wand-analise {
  --wand-gold:#d4af37;
  margin:20px 0;
  color:#f5f5f5;
  font-family:Arial,sans-serif;
}
.wand-analise * {
  box-sizing:border-box;
}
.wand-analise .wa-painel {
  background:#171717;
  border:1px solid #6c5828;
  border-radius:16px;
  padding:20px;
  margin:15px 0;
}
.wand-analise h2 {
  color:#d4af37;
  font-size:21px;
}
.wand-analise h3 {
  color:#d4af37;
  font-size:17px;
}
.wand-analise p {
  line-height:1.5;
}
.wand-analise .wa-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}
.wand-analise .wa-metrica {
  background:#0e0e0e;
  border:1px solid #383126;
  border-radius:12px;
  padding:15px;
  min-width:0;
}
.wand-analise .wa-rotulo {
  color:#bbb;
  font-size:13px;
  margin-bottom:9px;
}
.wand-analise .wa-numero {
  font-size:26px;
  font-weight:bold;
  overflow-wrap:anywhere;
}
.wand-analise .wa-detalhe {
  font-size:12px;
  color:#bbb;
  margin-top:8px;
  line-height:1.5;
}
.wand-analise .wa-situacao {
  font-weight:bold;
  margin-top:8px;
  font-size:13px;
}
.wand-analise .wa-regua {
  display:flex;
  height:20px;
  overflow:hidden;
  border-radius:7px;
  gap:2px;
  margin-top:9px;
}
.wand-analise .wa-faixa {
  min-width:0;
}
.wand-analise .wa-marcador {
  position:relative;
  height:24px;
}
.wand-analise .wa-seta {
  position:absolute;
  top:0;
  transform:translateX(-50%);
  font-size:19px;
  line-height:24px;
  color:white;
}
.wand-analise .wa-legenda {
  display:flex;
  justify-content:space-between;
  gap:5px;
  font-size:10px;
  color:#bbb;
  margin-top:5px;
}
.wand-analise .wa-grafico {
  display:block;
  width:100%;
  height:auto;
  max-height:180px;
}
.wand-analise .wa-historico {
  background:#0e0e0e;
  border:1px solid #383126;
  border-radius:12px;
  padding:14px;
  margin:12px 0;
}
.wand-analise .wa-aviso {
  background:#211b10;
  border-left:3px solid #d4af37;
  padding:12px;
  border-radius:7px;
  font-size:13px;
  line-height:1.5;
}
.wand-analise .wa-erro {
  color:#ff9999;
}
@media(max-width:480px) {
  .wand-analise .wa-grid {
    gap:8px;
  }
  .wand-analise .wa-metrica {
    padding:11px;
  }
  .wand-analise .wa-numero {
    font-size:22px;
  }
}
`;

document.head.appendChild(estilo);

function criar(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

function adicionar(pai, tag, classe, texto) {
  const elemento = criar(tag, classe, texto);
  pai.appendChild(elemento);
  return elemento;
}

function numero(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function formatar(valor, casas = 2) {
  const n = numero(valor);

  return n === null
    ? "—"
    : n.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: casas
      });
}

function dataBR(valor) {
  if (!valor) return "—";

  const partes = String(valor).slice(0, 10).split("-");

  return partes.length === 3
    ? partes.reverse().join("/")
    : "—";
}

function idadeNaData(nascimento, avaliacao) {
  if (!nascimento || !avaliacao) return null;

  const n = String(nascimento).slice(0, 10)
    .split("-").map(Number);

  const a = String(avaliacao).slice(0, 10)
    .split("-").map(Number);

  if (
    n.length !== 3 ||
    a.length !== 3 ||
    [...n, ...a].some(x => !Number.isInteger(x))
  ) return null;

  let idade = a[0] - n[0];

  if (
    a[1] < n[1] ||
    (a[1] === n[1] && a[2] < n[2])
  ) idade--;

  return idade >= 0 ? idade : null;
}

function normalizarSexo(sexo) {
  const s = String(sexo || "")
    .trim().toLowerCase();

  if (["f", "feminino", "mulher"].includes(s)) {
    return "feminino";
  }

  if (["m", "masculino", "homem"].includes(s)) {
    return "masculino";
  }

  return null;
}

function referenciaPara(sexo, idade) {
  const normalizado = normalizarSexo(sexo);

  if (!normalizado || idade === null) {
    return null;
  }

  return REFERENCIAS[normalizado].find(
    faixa => idade >= faixa.inicio &&
             idade <= faixa.fim
  ) || null;
}

function classificar(percentual, referencia) {
  if (percentual === null || !referencia) {
    return {
      nome: "Sem classificação",
      cor: CORES.neutro,
      chave: null
    };
  }

  if (percentual < referencia.baixo) {
    return {
      nome: "Abaixo da faixa de referência",
      cor: CORES.baixo,
      chave: "baixo"
    };
  }

  if (percentual < referencia.alto) {
    return {
      nome: "Faixa de referência",
      cor: CORES.adequado,
      chave: "adequado"
    };
  }

  if (percentual < referencia.muitoAlto) {
    return {
      nome: "Acima da faixa de referência",
      cor: CORES.elevado,
      chave: "elevado"
    };
  }

  return {
    nome: "Muito elevado na referência",
    cor: CORES.muitoElevado,
    chave: "muitoElevado"
  };
}

function obterMedida(avaliacao, campo) {
  const direto = numero(avaliacao[campo]);

  if (direto !== null) return direto;

  const peso = numero(avaliacao.peso);
  const gordura = numero(avaliacao.percentual_gordura);

  if (
    peso === null ||
    gordura === null ||
    gordura < 0 ||
    gordura > 100
  ) return null;

  if (campo === "massa_gordura_kg") {
    return peso * gordura / 100;
  }

  if (campo === "massa_livre_gordura_kg") {
    return peso * (100 - gordura) / 100;
  }

  return null;
}

function criarMetrica(destino, titulo, valor, unidade, cor) {
  const card = criar("div", "wa-metrica");

  adicionar(card, "div", "wa-rotulo", titulo);

  const destaque = adicionar(
    card,
    "div",
    "wa-numero",
    valor === null ? "—" : formatar(valor) + " " + unidade
  );

  if (cor) destaque.style.color = cor;

  destino.appendChild(card);

  return card;
}

function criarRegua(destino, percentual, referencia, classificacao) {
  const painel = criar("div", "wa-painel");

  adicionar(
    painel,
    "h3",
    null,
    "Referência científica de gordura corporal"
  );

  if (!referencia || percentual === null) {
    adicionar(
      painel,
      "p",
      "wa-aviso",
      "Classificação indisponível. É necessário informar sexo, data de nascimento e percentual de gordura, com idade entre 20 e 79 anos."
    );

    destino.appendChild(painel);
    return;
  }

  const limite = Math.max(
    50,
    Math.ceil((percentual + 5) / 10) * 10,
    referencia.muitoAlto + 5
  );

  const faixas = [
    {
      inicio: 0,
      fim: referencia.baixo,
      cor: CORES.baixo
    },
    {
      inicio: referencia.baixo,
      fim: referencia.alto,
      cor: CORES.adequado
    },
    {
      inicio: referencia.alto,
      fim: referencia.muitoAlto,
      cor: CORES.elevado
    },
    {
      inicio: referencia.muitoAlto,
      fim: limite,
      cor: CORES.muitoElevado
    }
  ];

  const marcador = criar("div", "wa-marcador");
  const seta = adicionar(marcador, "span", "wa-seta", "▼");

  seta.style.left =
    Math.max(0, Math.min(100, percentual / limite * 100)) + "%";

  seta.style.color = classificacao.cor;

  painel.appendChild(marcador);

  const regua = criar("div", "wa-regua");

  for (const faixa of faixas) {
    const parte = criar("div", "wa-faixa");

    parte.style.background = faixa.cor;
    parte.style.flex = String(
      Math.max(0.01, faixa.fim - faixa.inicio)
    );

    regua.appendChild(parte);
  }

  painel.appendChild(regua);

  const legenda = criar("div", "wa-legenda");

  for (const texto of [
    "Baixo",
    "Referência",
    "Elevado",
    "Muito elevado"
  ]) {
    adicionar(legenda, "span", null, texto);
  }

  painel.appendChild(legenda);

  const classificacaoTexto = adicionar(
    painel,
    "p",
    "wa-situacao",
    formatar(percentual) + "% — " + classificacao.nome
  );

  classificacaoTexto.style.color = classificacao.cor;

  adicionar(
    painel,
    "p",
    "wa-detalhe",
    "Limites para esta faixa etária: abaixo de " +
    referencia.baixo + "%; referência de " +
    referencia.baixo + "% até menos de " +
    referencia.alto + "%; elevado de " +
    referencia.alto + "% até menos de " +
    referencia.muitoAlto + "%; muito elevado a partir de " +
    referencia.muitoAlto + "%."
  );

  adicionar(
    painel,
    "p",
    "wa-detalhe",
    "Referência: Gallagher et al. (2000), AJCN. " +
    "Faixas aproximadas relacionadas ao IMC, não equivalentes " +
    "a diagnóstico ou classificação de desempenho atlético. " +
    "As estimativas por dobras cutâneas possuem margem de erro."
  );

  destino.appendChild(painel);
}

function encontrarAnterior(avaliacoes, atual, campo) {
  const indice = avaliacoes.indexOf(atual);

  for (let i = indice - 1; i >= 0; i--) {
    const valor = obterMedida(avaliacoes[i], campo);

    if (valor !== null) {
      return {
        avaliacao: avaliacoes[i],
        valor
      };
    }
  }

  return null;
}

function criarIndicadorEvolucao(
  destino,
  avaliacoes,
  atual,
  referencia
) {
  const card = criar("div", "wa-painel");

  adicionar(card, "h3", null, "Evolução da gordura corporal");

  const anterior = encontrarAnterior(
    avaliacoes,
    atual,
    "percentual_gordura"
  );

  const percentual = obterMedida(
    atual,
    "percentual_gordura"
  );

  if (!anterior || percentual === null) {
    adicionar(
      card,
      "p",
      "wa-aviso",
      "Primeira avaliação disponível. A classificação científica " +
      "já pode ser exibida, mas a evolução precisa de outra " +
      "avaliação comparável."
    );

    destino.appendChild(card);
    return;
  }

  const diferenca = percentual - anterior.valor;

  let cor = CORES.neutro;
  let simbolo = "→";
  let texto = "Estável";

  const tolerancia = 0.1;

  if (diferenca < -tolerancia) {
    simbolo = "↘";
    texto = "Redução de gordura corporal";

    cor = referencia && percentual < referencia.baixo
      ? CORES.muitoElevado
      : CORES.adequado;
  } else if (diferenca > tolerancia) {
    simbolo = "↗";
    texto = "Aumento de gordura corporal";

    cor = referencia && anterior.valor < referencia.baixo
      ? CORES.neutro
      : CORES.muitoElevado;
  }

  const linha = adicionar(
    card,
    "div",
    "wa-numero",
    simbolo + " " +
    (diferenca > 0 ? "+" : "") +
    formatar(diferenca) + " p.p."
  );

  linha.style.color = cor;

  const descricao = adicionar(
    card,
    "p",
    "wa-situacao",
    texto
  );

  descricao.style.color = cor;

  adicionar(
    card,
    "p",
    "wa-detalhe",
    "Anterior: " + formatar(anterior.valor) +
    "% (" + dataBR(anterior.avaliacao.data_avaliacao) +
    ") · Atual: " + formatar(percentual) +
    "% (" + dataBR(atual.data_avaliacao) + ")"
  );

  adicionar(
    card,
    "p",
    "wa-detalhe",
    "A seta representa a mudança medida. A interpretação " +
    "como melhora ou piora depende do objetivo, da faixa " +
    "de referência e do parecer profissional. Pequenas " +
    "variações podem estar dentro do erro de medição."
  );

  destino.appendChild(card);
}

function criarGrafico(destino, avaliacoes, campo, titulo, unidade) {
  const dados = avaliacoes
    .map(a => ({
      data: a.data_avaliacao,
      valor: obterMedida(a, campo)
    }))
    .filter(a => a.valor !== null);

  if (!dados.length) return;

  const painel = criar("div", "wa-historico");

  adicionar(painel, "h3", null, titulo);

  const primeiro = dados[0];
  const ultimo = dados[dados.length - 1];

  adicionar(
    painel,
    "p",
    "wa-detalhe",
    "Inicial: " + formatar(primeiro.valor) +
    " " + unidade + " · Atual: " +
    formatar(ultimo.valor) + " " + unidade
  );

  if (dados.length > 1) {
    const diferenca = ultimo.valor - primeiro.valor;

    adicionar(
      painel,
      "p",
      "wa-detalhe",
      "Variação total: " +
      (diferenca > 0 ? "+" : "") +
      formatar(diferenca) +
      (unidade === "%" ? " p.p." : " " + unidade)
    );
  }

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("viewBox", "0 0 340 160");
  svg.setAttribute("class", "wa-grafico");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Evolução de " + titulo);

  let minimo = Math.min(...dados.map(d => d.valor));
  let maximo = Math.max(...dados.map(d => d.valor));

  const amplitude = Math.max(
    maximo - minimo,
    Math.abs(maximo) * 0.05,
    1
  );

  minimo -= amplitude * 0.2;
  maximo += amplitude * 0.2;

  const pontos = dados.map((d, i) => ({
    x: dados.length === 1
      ? 170
      : 25 + i * 290 / (dados.length - 1),
    y: 135 - (d.valor - minimo) /
      (maximo - minimo) * 105,
    data: d
  }));

  const eixo = document.createElementNS(ns, "line");

  eixo.setAttribute("x1", "20");
  eixo.setAttribute("y1", "135");
  eixo.setAttribute("x2", "320");
  eixo.setAttribute("y2", "135");
  eixo.setAttribute("stroke", "#555");

  svg.appendChild(eixo);

  if (pontos.length > 1) {
    const linha = document.createElementNS(ns, "polyline");

    linha.setAttribute(
      "points",
      pontos.map(p => `${p.x},${p.y}`).join(" ")
    );

    linha.setAttribute("fill", "none");
    linha.setAttribute("stroke", "#d4af37");
    linha.setAttribute("stroke-width", "3");

    svg.appendChild(linha);
  }

  for (const ponto of pontos) {
    const circulo = document.createElementNS(ns, "circle");

    circulo.setAttribute("cx", ponto.x);
    circulo.setAttribute("cy", ponto.y);
    circulo.setAttribute("r", "5");
    circulo.setAttribute("fill", "#d4af37");

    const descricao = document.createElementNS(ns, "title");

    descricao.textContent =
      dataBR(ponto.data.data) + ": " +
      formatar(ponto.data.valor) + " " + unidade;

    circulo.appendChild(descricao);
    svg.appendChild(circulo);
  }

  painel.appendChild(svg);

  adicionar(
    painel,
    "p",
    "wa-detalhe",
    dataBR(primeiro.data) + " → " + dataBR(ultimo.data)
  );

  destino.appendChild(painel);
}

function criarAssimetria(destino, avaliacao) {
  const avisos = [];

  for (const [direito, esquerdo, nome] of [
    ["braco_direito", "braco_esquerdo", "braços"],
    ["coxa_direita", "coxa_esquerda", "coxas"]
  ]) {
    const a = obterMedida(avaliacao, direito);
    const b = obterMedida(avaliacao, esquerdo);

    if (a !== null && b !== null) {
      const diferenca = Math.abs(a - b);

      if (diferenca >= 2.5) {
        avisos.push(
          "Diferença entre " + nome + ": " +
          formatar(diferenca) + " cm."
        );
      }
    }
  }

  if (!avisos.length) return;

  const card = criar("div", "wa-painel");

  adicionar(card, "h3", null, "Atenção às assimetrias");

  for (const aviso of avisos) {
    adicionar(card, "p", "wa-aviso", aviso);
  }

  adicionar(
    card,
    "p",
    "wa-detalhe",
    "Diferenças de circunferência devem ser avaliadas " +
    "considerando técnica de medição, dominância e " +
    "histórico individual. Não indicam lesão por si só."
  );

  destino.appendChild(card);
}

function montarPainel(destino, aluno, registros) {
  destino.replaceChildren();

  const avaliacoes = [...registros]
    .sort((a, b) => {
      const dataA = String(a.data_avaliacao || "");
      const dataB = String(b.data_avaliacao || "");

      return dataA.localeCompare(dataB) ||
        Number(a.id) - Number(b.id);
    });

  const atual = [...avaliacoes]
    .reverse()
    .find(a => obterMedida(a, "percentual_gordura") !== null)
    || avaliacoes[avaliacoes.length - 1];

  if (!atual) {
    adicionar(
      destino,
      "p",
      "wa-aviso",
      "Nenhuma avaliação física disponível para análise."
    );
    return;
  }

  const percentual = obterMedida(
    atual,
    "percentual_gordura"
  );

  const idade = idadeNaData(
    aluno.data_nascimento,
    atual.data_avaliacao
  );

  const referencia = referenciaPara(
    aluno.sexo,
    idade
  );

  const classificacao = classificar(
    percentual,
    referencia
  );

  const cabecalho = criar("div", "wa-painel");

  adicionar(
    cabecalho,
    "h2",
    null,
    "Análise da composição corporal"
  );

  adicionar(
    cabecalho,
    "p",
    "wa-detalhe",
    "Avaliação: " + dataBR(atual.data_avaliacao) +
    " · Idade na avaliação: " +
    (idade === null ? "não informada" : idade + " anos")
  );

  const grade = criar("div", "wa-grid");

  criarMetrica(
    grade,
    "Peso corporal",
    obterMedida(atual, "peso"),
    "kg"
  );

  const gorduraCard = criarMetrica(
    grade,
    "Gordura corporal",
    percentual,
    "%",
    classificacao.cor
  );

  const situacao = adicionar(
    gorduraCard,
    "div",
    "wa-situacao",
    classificacao.nome
  );

  situacao.style.color = classificacao.cor;

  const anterior = encontrarAnterior(
    avaliacoes,
    atual,
    "percentual_gordura"
  );

  if (anterior && percentual !== null) {
    const diferenca = percentual - anterior.valor;

    adicionar(
      gorduraCard,
      "div",
      "wa-detalhe",
      (diferenca > 0 ? "↗ +" :
       diferenca < 0 ? "↘ " : "→ ") +
      formatar(diferenca) + " p.p. desde a anterior"
    );
  } else {
    adicionar(
      gorduraCard,
      "div",
      "wa-detalhe",
      "Primeira avaliação disponível"
    );
  }

  criarMetrica(
    grade,
    "Massa de gordura estimada",
    obterMedida(atual, "massa_gordura_kg"),
    "kg"
  );

  criarMetrica(
    grade,
    "Massa livre de gordura estimada",
    obterMedida(atual, "massa_livre_gordura_kg"),
    "kg"
  );

  cabecalho.appendChild(grade);
  destino.appendChild(cabecalho);

  criarRegua(
    destino,
    percentual,
    referencia,
    classificacao
  );

  criarIndicadorEvolucao(
    destino,
    avaliacoes,
    atual,
    referencia
  );

  criarAssimetria(destino, atual);

  const historico = criar("div", "wa-painel");

  adicionar(
    historico,
    "h2",
    null,
    "Gráficos de evolução corporal"
  );

  adicionar(
    historico,
    "p",
    "wa-detalhe",
    "Os gráficos utilizam as avaliações disponíveis. " +
    "Com uma única avaliação, aparece somente um ponto."
  );

  for (const [campo, titulo, unidade] of METRICAS) {
    criarGrafico(
      historico,
      avaliacoes,
      campo,
      titulo,
      unidade
    );
  }

  destino.appendChild(historico);
}

async function iniciar() {
  const paginaTreinador =
    location.pathname.endsWith("perfil-aluno.html");

  const destinoOriginal = document.getElementById(
    paginaTreinador ? "avaliacoes" : "listaAvaliacoes"
  );

  if (!destinoOriginal) {
    console.warn(
      "WAND METHOD: área de avaliações não encontrada."
    );
    return;
  }

  const painel = criar("div", "wand-analise");

  painel.id = "wandAnaliseCorporal";

  const secao = destinoOriginal.closest("section");

  if (secao) {
    secao.insertAdjacentElement("afterend", painel);
  } else {
    destinoOriginal.insertAdjacentElement("afterend", painel);
  }

  adicionar(
    painel,
    "p",
    "wa-detalhe",
    "Carregando análise corporal..."
  );

  try {
    const { data: { user }, error: erroUsuario } =
      await supabase.auth.getUser();

    if (erroUsuario || !user) {
      throw new Error("Faça login para visualizar a análise.");
    }

    let aluno;

    if (paginaTreinador) {
      const { data: perfil, error: erroPerfil } =
        await supabase.from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (erroPerfil || perfil?.role !== "admin") {
        throw new Error("Acesso restrito ao treinador.");
      }

      const id = new URLSearchParams(location.search)
        .get("id");

      if (!id || !/^\d+$/.test(id)) {
        throw new Error("Aluno não selecionado.");
      }

      const { data, error } = await supabase
        .from("alunos")
        .select("id,nome_completo,sexo,data_nascimento")
        .eq("id", Number(id))
        .single();

      if (error) throw error;

      aluno = data;
    } else {
      const { data, error } = await supabase
        .from("alunos")
        .select("id,nome_completo,sexo,data_nascimento")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      aluno = data;
    }

    if (!aluno) {
      throw new Error("Cadastro do aluno não encontrado.");
    }

    let consulta = supabase
      .from("avaliacoes_fisicas")
      .select("*")
      .eq("aluno_id", aluno.id)
      .order("data_avaliacao", { ascending: true })
      .order("id", { ascending: true });

    if (!paginaTreinador) {
      consulta = consulta.eq(
        "status_avaliacao",
        "liberada"
      );
    }

    const { data: avaliacoes, error } = await consulta;

    if (error) throw error;

    montarPainel(
      painel,
      aluno,
      avaliacoes || []
    );

  } catch (erro) {
    console.error("WAND METHOD:", erro);

    painel.replaceChildren();

    adicionar(
      painel,
      "p",
      "wa-erro",
      "Não foi possível carregar a análise corporal: " +
      (erro.message || String(erro))
    );
  }
}

iniciar();
