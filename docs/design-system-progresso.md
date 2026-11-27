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
