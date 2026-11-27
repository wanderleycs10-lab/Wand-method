# Padronização global — registro de continuidade

Branch `dev/design-system-global`. Base `85bb8fc`. As mudanças de conteúdo anteriores da biblioteca e a pasta de protótipos foram preservadas.

- [x] Recuperar especificação original, verificar branch, commits e diffs.
- [x] Inventariar 50 arquivos HTML e as famílias de rotas dinâmicas dos dois perfis. Consulte [o inventário](design-system-wand-method.md).
- [x] Integrar nível explícito a 20 arquivos autenticados e acrescentar o botão Voltar compartilhado ao tema.
- [x] Corrigir retornos da biblioteca, das filas e da ficha de exercício. Preservar origem de gerenciamento de treinos ao abrir a montagem.
- [x] Ativar restauração da subárea Bem-estar pelo endereço e registrar as regras no AGENTS.md.
- [x] Adicionar testes de inventário, componentes compartilhados e retorno da biblioteca.
- [x] Exercitar consulta, filtros, filas, detalhe via atualização de página, adição, desfazer e retorno à montagem em 390, 768, 1024 e 1280 px, com dados simulados.
- [x] Exercitar Treinos → Biblioteca → Treinos no WandCoach e Minha Ficha → Dados pessoais → atualização no aluno.
- [x] Exercitar abertura e retorno ao painel nas 11 centrais do WandCoach e nas 10 do aluno, a 390 e 1280 px, com dados simulados.
- [x] Exercitar acesso direto ao calendário, retorno à Saúde Feminina e retorno ao Bem-estar. A automação expôs a perda do fragmento na abertura, corrigida antes da nova execução.
- [x] Preservar os retornos internos da avaliação postural e testar rejeição de destinos externos.
- [x] Restaurar a lista da central fotográfica após atualizar ou voltar do detalhe. Fluxo de autorizações validado no Chrome a 390 px com dados simulados.
- [x] Remover duplicatas de Voltar em cadastro e medidas, e usar Voltar à montagem na biblioteca aberta a partir do treino.
- [x] Migrar nove páginas para o componente compartilhado de conclusão. Testar exibição, foco no botão OK, fechamento e resolução nos dois perfis.
- [x] Comparar as dimensões e a posição da ilha antes e depois nas quatro larguras em ambos os perfis, com valores iguais.
- [ ] Concluir revisão de cada subrota, cabeçalho, formulário, modo claro, conclusão e retorno contextual.
- [ ] Validar rotas de negócios com sessões de teste dos dois perfis. Usar dados isolados.
- [ ] Apresentar prévia e solicitar aprovação antes de merge ou publicação.

## Linha de base

Antes da alteração, `node --test tests/*.test.mjs` registrou 30 sucessos, quatro falhas e um teste ignorado. Três falhas de contratos estáticos de fotografia verificam registro de solicitação, solicitação direta e revisão antes do envio. A quarta é uma expressão regular inválida em `sintaxe-fotografia.test.mjs`.

Com os quatro novos testes, a suíte registra 34 sucessos, as mesmas quatro falhas e um teste ignorado. Chrome exercitou a navegação e os componentes com dados simulados. Uma leitura antecipada do link Voltar durante o teste foi corrigida na automação, esperando a atualização do fragmento. As capturas antes e depois e os roteiros de navegador estão no diretório local ignorado `node_modules` com o prefixo `wand-design-`.

As linhas de páginas autenticadas do inventário confirmam a integração ao tema e à ilha. Os fluxos com teste funcional nesta etapa estão indicados no checklist acima. As demais páginas ainda precisam de revisão visual e funcional individual, inclusive os percursos que dependem de dados e permissões reais.

## Próximo passo

Começar pelas telas autenticadas ainda sem teste de interação no inventário, em especial perfil individual, contratos, notificações, avaliações e WAND LEGACY. Revisar cabeçalhos e confirmações locais, profundidades restantes, acessibilidade e tema claro. O código rastreado das áreas autenticadas usa esquema escuro e ainda não tem tema claro global. Manter as falhas antigas separadas e preservar o CSS e os atalhos da ilha.

## Continuidade no Codex Cloud

- A preferência Tema claro é opcional, começa no modo escuro e é compartilhada pelos dois perfis no mesmo navegador. A primeira camada cobre superfícies e controles compartilhados nas 20 páginas autenticadas. A ilha e os cabeçalhos com logotipo mantêm o acabamento oficial.
- O perfil do aluno passa a conservar no endereço as subáreas abertas dentro da própria página e apresenta um único Voltar contextual. Propostas na área de contratos do aluno recebem superfície de nível 2. A confirmação de gravação do WAND LEGACY usa o diálogo compartilhado em tela cheia.
- Node.js 22.23.5 registrou 34 sucessos, as mesmas quatro falhas conhecidas de fotografia e um teste ignorado. As falhas antigas são acompanhadas na linha de base acima.

### Revisão visual e funcional

- Foram abertas no Chromium as 20 páginas autenticadas do inventário. Entre páginas e estados de rota foram 51 endereços, incluindo perfil e acompanhamento, seleção de modalidade, notificações, contratos, avaliações, WAND LEGACY e subáreas da Minha Ficha. Cada endereço foi aberto a 320, 390, 768, 1024 e 1280 px e verificado nos dois temas. A varredura das 255 aberturas mediu largura do documento, nível declarado, retornos visíveis, dimensões da ilha e erros JavaScript. Nesses cenários não houve rolagem horizontal da página, mais de um retorno compartilhado visível ou erro JavaScript não tratado.
- As sessões de WandCoach e aluno e os resultados do serviço foram simulados no Chromium. O navegador bloqueou requisições externas e o service worker. Foram exercitados pelo teclado o seletor de tema e o diálogo de sucesso, a retomada do tema após atualizar e entre páginas, a seleção de modalidade com retorno do perfil e restauração do endereço, o retorno do acompanhamento após recarregar e o aceite de contrato fictício.
- A comparação da ilha dos dois painéis com o commit `8d8735c` preservou posição, dimensões e estilos computados do contêiner e dos controles medidos a 390, 768, 1024 e 1280 px. As medições da ilha também coincidiram entre os temas na varredura.
- O axe-core verificou contraste detectável, rótulos, nomes de botões e links, valores ARIA e landmark principal a 390 px nos dois temas. O conjunto usou as 20 páginas do inventário e oito estados prioritários. Foram corrigidas associações de rótulos no formulário de contratos e áreas de baixo contraste no acompanhamento e na prescrição. A nova execução ficou sem violações nas regras selecionadas. Contraste em gradientes, leitor de tela e estados dependentes de dados adicionais requerem verificação manual.
- A prévia entregue nesta rodada reúne capturas de Contratos, Perfil do aluno e WAND LEGACY no WandCoach, e Minha Ficha, Notificações e Meus contratos para o aluno. Cada tela é apresentada em tema escuro e claro a 390 px.

### Falhas preexistentes de fotografia

A suíte padrão com Node.js 22.23.5 continua com 34 sucessos, quatro falhas e um teste ignorado. As falhas são o registro de solicitação pelo WandCoach na tabela esperada, o consentimento na solicitação direta, a revisão de três fotos antes do envio e a expressão regular inválida em `tests/sintaxe-fotografia.test.mjs`. O teste ignorado é o cenário de banco isolado do WAND LEGACY. A execução padrão dispensou acesso ao Supabase.

### Validação que permanece aberta

- A matriz cobriu a abertura de páginas e estados de rota com respostas simuladas. Ainda faltam revisão manual de interações profundas e dos estados condicionados a dados (edição, validações de formulário, erro, vazio, permissão e retornos após gravação), revisão de leitores de tela e das superfícies locais ainda fora do tema compartilhado.
- Fluxos de negócio que dependem de autenticação, permissões, gravação, e-mail e histórico de um serviço real precisam de contas e dados de teste isolados. Nenhuma conexão de produção foi usada nesta rodada.
- A prévia está disponível para aprovação. Merge e publicação aguardam decisão do responsável.

## Integração do histórico da main

A comparação de `164a818` com `717abd1` confirmou seis commits exclusivos de desenvolvimento e 23 exclusivos da main. O ancestral comum era `85bb8fc`, também segundo pai do último merge da main. A árvore da main e a desse ancestral têm o mesmo identificador `a33784b54c9e32cf5f8b981cdd07a4e57ad99518`. Portanto, as mudanças de WAND LEGACY, navegação, layout e WAND EXERCISES já faziam parte do desenvolvimento. Os 23 commits exclusivos eram registros de merge dos PRs, sem diferença líquida de arquivos em relação ao ancestral.

A simulação do merge produziu a mesma árvore de `164a818` e não indicou arquivos em conflito. O merge `4825a9a` incorporou a ancestralidade da main na branch de desenvolvimento. A comparação com o primeiro pai ficou vazia, preservando integralmente os arquivos, inclusive a ilha, o tema e os retornos já existentes.

| Commit exclusivo | PR | Branch incorporada |
| --- | --- | --- |
| `191b897` | #1 | `dev/wand-legacy` |
| `b709697` | #2 | `dev/wand-legacy-visual` |
| `3b683fa` | #3 | `dev/wand-legacy-icone` |
| `d5ad215` | #4 | `dev/wand-legacy-cartoes` |
| `f30cc6b` | #5 | `dev/wand-legacy-config-compacta` |
| `16294fa` | #6 | `dev/wand-legacy-logo-aluno` |
| `48c5db7` | #7 | `dev/wand-legacy-fundo-transparente` |
| `c474af7` | #8 | `dev/wand-legacy-detalhe` |
| `6b40565` | #9 | `dev/wand-legacy-reconhecimento` |
| `a3a5dad` | #10 | `dev/wand-legacy-alunos-por-nivel` |
| `05781d7` | #11 | `dev/wand-legacy-chevron` |
| `972aef4` | #12 | `dev/wand-legacy-regras-compactas` |
| `885b6a5` | #13 | `dev/wand-legacy-central-avisos` |
| `4990545` | #14 | `dev/wand-navegacao-compartilhada` |
| `e98d4b9` | #15 | `dev/wand-legacy-indicador` |
| `3709553` | #16 | `dev/wand-layout-aluno-personal` |
| `6520e13` | #17 | `dev/wand-exercises-supino-piloto` |
| `d1fa2bb` | #18 | `dev/wand-supino-modelo-anatomico` |
| `f340c56` | #19 | `dev/wand-exercises-dois-modelos` |
| `9162669` | #20 | `dev/wand-exercises-vistas-pegadas` |
| `b713467` | #21 | `dev/wand-exercises-revisao-oficial` |
| `520f93a` | #22 | `dev/wand-exercises-catalogo-compacto` |
| `717abd1` | #23 | `dev/wand-exercises-consulta-prescricao` |

### Validação após a integração

- O teste de interação isolado percorreu seleção de modalidade, perfil e acompanhamento com atualização e retorno, aceite de contrato fictício, abertura da avaliação fotográfica a partir da notificação do aluno, ida e volta entre níveis e detalhe no WAND LEGACY e confirmação compartilhada pelo teclado.
- O teste da avaliação física exercitou retorno da revisão aos resultados seguido de recarregamento e o percurso perfil → painel de avaliação → formulário → painel → perfil. A revisão física passou a atualizar o endereço no retorno, e a origem passou a acompanhar a abertura do formulário. As alterações são restritas à navegação.
- O Chromium repetiu 255 aberturas nos dois temas, em 20 páginas e 51 endereços, a 320, 390, 768, 1024 e 1280 px. A varredura não registrou erros JavaScript não tratados, rolagem horizontal, duplicação de Voltar compartilhado ou diferença nas medidas da ilha entre temas. A comparação com `8d8735c` confirmou posição, dimensões e estilos computados da ilha em ambos os painéis nas quatro larguras de referência.
- A suíte com Node.js 22.23.5 repetiu 34 sucessos, quatro falhas preexistentes de fotografia (registro da solicitação, consentimento na solicitação direta, revisão das três fotos e expressão regular inválida) e um teste de banco ignorado. As sessões de navegador foram simuladas com requisições externas bloqueadas.
- A revisão técnica da divergência está concluída, e a branch está disponível para homologação. Para publicação ainda faltam a validação de ponta a ponta com contas e dados de teste isolados para gravações, permissões e comunicações, a disposição das quatro falhas de fotografia para o release e a aprovação da prévia. Nenhuma migração foi executada.

### Aprovação da identidade visual

Em 27/11/2026, o responsável aprovou os temas claro e escuro da prévia de integração como padrão oficial e permanente. O registro está no AGENTS.md e no Design System. O botão agora anuncia o tema de destino, os títulos internos revisados usam o componente oficial e a central de Contratos segue a ordem Contrato por aluno, Nova proposta e Todos os contratos.

A nova consulta ao GitHub confirmou a integração em dia com a main (`717abd1`). No Chromium, passaram a troca de tema por teclado com persistência e leitura do rótulo nos dois perfis, a ordem e os três destinos da central de Contratos, os retornos de perfil e avaliação física, o acesso negado ao aluno no painel de avaliação do treinador, o aceite fictício, o destino da notificação e a navegação do WAND LEGACY. A ilha manteve as medidas e os estilos computados nas quatro larguras de referência. A suíte Node.js 22 repetiu 34 sucessos, as quatro falhas preexistentes de fotografia e um teste de banco ignorado.

A varredura visual repetiu 255 aberturas nos dois temas, sem registrar rolagem horizontal, duplicação do Voltar compartilhado, erro JavaScript não tratado ou diferença nas medidas da ilha entre temas. O axe-core não apontou violações nas regras selecionadas nas oito telas prioritárias.

A aprovação é visual. A homologação de gravações, permissões e comunicações com contas e dados isolados em um serviço de teste e a autorização para publicação seguem pendentes. As verificações desta rodada usaram respostas simuladas. Nenhuma migração ou alteração em produção foi realizada.

## Homologação final — correções da suíte e validação isolada

A revisão partiu de `45d82ae`, sucessor de `548bf50` com a aprovação da identidade visual. Não houve nova integração da main. As correções desta rodada estão restritas aos testes e à documentação. A comparação dos arquivos confirma que a ilha, as superfícies dos níveis e os fluxos e regras do aplicativo permanecem iguais.

### Testes automatizados

A suíte padrão foi executada com Node.js 22.23.5 após cada mudança.

| Falha anterior | Causa e correção | Resultado da suíte após a correção |
| --- | --- | --- |
| Sintaxe dos scripts | O extrator de scripts do painel principal do WandCoach tinha barras escapadas duas vezes, impedindo o carregamento do arquivo de testes. A expressão foi alinhada à usada no painel fotográfico, habilitando três testes de sintaxe reais. | 37 passaram, 3 falharam, 1 ignorado |
| Registro de solicitação | A expressão exigia que `.insert` viesse imediatamente após `.from(...)`. O código usa quebra de linha. O teste aceita espaço em branco e continua verificando tabela, aluno, solicitante e estado. | 38 passaram, 2 falharam, 1 ignorado |
| Consentimento na solicitação direta | O texto esperado era antigo. O teste passou a exigir a mensagem existente e continua verificando a condição de autorização e a confirmação de sucesso. | 39 passaram, 1 falhou, 1 ignorado |
| Revisão das três fotografias | O botão aprovado diz “Enviar fotografias”. O teste passou a conferir esse texto e manteve as verificações de rascunho, edição local e bloqueio sem as três posições. | 40 passaram, 0 falharam, 1 ignorado |

Com PGlite e banco descartável em memória, a mesma suíte passou **41 de 41**. Essa execução também verificou isolamento de alunos, permissões do WAND LEGACY e limite diário de crédito de treino, com dados fictícios. Nenhum banco remoto participou.

### Testes funcionais simulados

- WandCoach e aluno, com requisições externas e service worker bloqueados no Chromium. Contratos foram verificados pelos três destinos e pelo aceite fictício. A notificação fotográfica abriu a área correspondente. Perfil, acompanhamento, avaliação física e níveis do WAND LEGACY passaram nos percursos de ida e retorno. O painel de avaliação e o de prescrição apresentaram a recusa esperada para o perfil aluno.
- Fotografia: nenhuma inclusão simulada quando o consentimento estava recusado ou já havia pedido pendente. Com autorização, foi conferida a carga da inclusão. Na visão do aluno, imagens sintéticas nas três posições ficaram em prévia sem chamadas de gravação. Após confirmação, o navegador registrou três cargas e três inclusões no serviço simulado.
- Prescrição: adicionar, desfazer, avançar à montagem e voltar da biblioteca em tema escuro e claro. A publicação e a persistência de uma prescrição no serviço de homologação ainda precisam ser verificadas.
- A matriz visual repetiu 255 aberturas em 51 endereços a 320, 390, 768, 1024 e 1280 px, nos dois temas. A comparação de posição, dimensões e estilos computados da ilha passou nos dois painéis nas quatro larguras de referência.

### Testes reais e verificações que dependem do responsável

Não foi identificado um ambiente de homologação autenticado e autorizado para este workspace. Os testes do Chromium usaram respostas simuladas. O banco local em memória comprova o cenário automatizado descrito acima, sem validar autenticação, armazenamento, e-mail ou políticas de um serviço implantado.

1. Indicar e autorizar um serviço de homologação separado da produção, com acesso seguro e configuração própria. Preparar um WandCoach, um aluno fictício vinculado e um aluno fictício fora desse vínculo. Usar apenas imagens sintéticas e caixas de e-mail de teste.
2. Servir o commit candidato com configuração exclusiva desse serviço e confirmar o destino das chamadas antes de entrar. Validar sessão, restrições por perfil e vínculo entre os dois alunos fictícios.
3. Executar proposta, envio, aceite e leitura de notificação; solicitar, enviar e revisar avaliações físicas e fotográficas; salvar, recarregar e publicar uma prescrição fictícia apenas na homologação. Verificar registros persistidos, comunicação de teste, retorno contextual, erros e negativas de acesso, sem inserir dados reais.
4. Registrar as evidências dos dois perfis. Submeter o resultado para aprovação final. Merge na main e publicação dependem de autorização explícita.

### Preparação da homologação real isolada

A configuração versionada do GitHub e do aplicativo e o catálogo somente leitura do Supabase foram inspecionados. O conector mostrou apenas o projeto de produção. O histórico remoto e o repositório têm incrementos de esquema, sem uma base reproduzível completa. A opção inicial é Supabase CLI em Docker local, com usuários fictícios e Mailpit. Neste workspace, o cliente Docker não teve permissão de acesso ao daemon.

O [guia de homologação isolada](homologacao-isolada.md) registra pré-requisitos, migrações, RLS e Storage, os usuários sintéticos, o roteiro e as decisões do responsável. O cliente temporário a 4180 foi verificado com uma chave fictícia em 29 páginas. O Chromium confirmou que a CSP bloqueia uma tentativa de envio a um domínio sentinela antes da requisição. Essa prova cobre o cliente preparado. Ainda é necessário verificar a rede, Auth, banco, Storage, funções e e-mail na pilha autorizada. Nenhum dado real foi lido nas consultas de catálogo e nenhuma configuração remota foi alterada.

### Preparação de homologação hospedada

O caminho prioritário agora é um segundo projeto Supabase Free, separado da produção. A organização WAND METHOD está no plano Free e o conector lista um projeto ativo. A cota publicada de dois projetos indica uma vaga. A criação depende de autorização explícita e confirmação do custo no fluxo da organização. O cliente temporário passou a aceitar um destino hospedado de homologação e a restringir o acesso às rotas necessárias de Auth, REST e Storage. O guia registra a barreira adicional de e-mail no serviço e a dependência do esquema estruturado sem dados. Docker permanece suspenso. Nenhuma configuração remota foi alterada.

A montagem temporária foi validada com configuração fictícia. O Chromium bloqueou, antes da rede, uma gravação para domínio sentinela, a recuperação de senha e a chamada à função de envio. O isolamento no serviço ainda depende do provisionamento e das verificações descritas no guia.
