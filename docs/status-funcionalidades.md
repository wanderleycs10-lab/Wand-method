# WAND METHOD — Estado de implementação e validação
Atualizado em 2026-11-21. Este documento distingue código publicado de testes executados e uso real confirmado.

| Área | Implementação | Evidência de funcionamento | Próxima ação |
| --- | --- | --- | --- |
| Avaliação Fotográfica — solicitação | Código de solicitação e histórico no painel; SQL 19 informado como executado | Ainda sem teste integrado confirmado | Testar solicitação real com conta de teste |
| Avaliação Fotográfica — conclusão | Trigger SQL 20 informado como executado; exige consentimento e frente/lado/costas após o pedido | Contratos estáticos verificados; sem execução ponta a ponta confirmada | Testar envio das três posições em ambiente isolado |
| Avaliação Fotográfica — aviso ao treinador | Trigger SQL 21 informado como executado; consulta no admin e link para fotografias | Código inspecionado; sem confirmação de aviso real | Validar criação e leitura com treinador de teste |
| Avaliação Fotográfica — marcar como lida | SQL 22 informado como executado; botão e RPC no admin | Código inspecionado; sem confirmação de RPC real | Validar RLS, RPC e atualização do contador |
| Anamnese | Recursos existentes no projeto | Não auditado neste ciclo | Inventariar testes e evidências anteriores |
| Avaliação Física | Recursos existentes no projeto | Não auditado neste ciclo | Inventariar testes e evidências anteriores |
| Treinos e WandCoach | Diversas funcionalidades implementadas anteriormente | Validação global pendente | Priorizar funcionalidades críticas por fluxo |

## Critérios de status
- **Implementado**: código publicado e SQL informado como executado, quando aplicável.
- **Validado tecnicamente**: testes executados com resultado registrado.
- **Funcional confirmado**: fluxo ponta a ponta exercitado em ambiente de teste, incluindo autenticação, banco e interface.
- **Concluído**: sem pendências críticas e com validação técnica e funcional confirmadas.

## Observações
- Os testes em `tests/` são predominantemente testes estáticos/contratuais e de sintaxe; não substituem teste com Supabase real.
- Não usar dados, fotos ou consentimentos de alunos reais nos testes.
- Não classificar uma área como concluída somente porque SQL retornou `Success`.

## WAND LEGACY no WandCoach

- Em Conquistas, o personal vê os dez níveis e os alunos vinculados em cada nível, agrupados pelo XP registrado. Ao selecionar um aluno, abre o detalhe dentro do WAND LEGACY. Ao voltar, o nível de origem é reaberto.
- Conquistas concentra também os saldos dos alunos. Nas configurações, os títulos têm inicial maiúscula, o indicador de expansão fica à direita e Salvar usa o padrão dourado. Após a gravação, a confirmação ocupa a tela do aplicativo por alguns segundos e retorna à mesma área.
- O personal vê os dez níveis em cartões compactos na seleção de alunos. Ao abrir o detalhe individual, personal e aluno veem apenas o cartão do nível atual e as insígnias conquistadas.
- O escudo com raio identifica o WAND LEGACY nos menus, cartões e notificações. As insígnias mantêm seus símbolos próprios.
- As configurações do personal usam cartões compactos. O catálogo abre em duas colunas no desktop, e os campos XP e WAND ENERGY aparecem lado a lado em qualquer tela. O formulário abre no próprio cartão.
- A migração `20261126025347_wand_legacy_progressao.sql` cria o registro de gamificação. Os painéis consultam o resumo por aluno, com XP acumulado, WAND ENERGY, nível, prestígio e insígnias concedidas.
- A pontuação de treino depende de confirmação do personal responsável. O servidor verifica a sessão concluída, a prescrição e sua validade, e registra até um treino por aluno e por dia em horário de São Paulo. O primeiro treino validado recebe a pontuação de primeiro treino. Também está implementada a concessão de Centurião e Legado Eterno conforme seus critérios.
- A migração não faz importação de saldos ou concessão retroativa automática. A disponibilidade em produção depende de revisão e aplicação da migração e da publicação dos painéis.
- A Central de recompensas do aluno lista o catálogo inicial e permite solicitar resgates. A energia e o estoque disponível são reservados na solicitação. A aprovação mantém a reserva, a entrega confirma o consumo e o cancelamento anterior à entrega restaura energia e estoque. A operação preserva o XP e não altera cobranças. O personal responsável trata os pedidos no detalhe do aluno.
- O catálogo compartilhado pode ser editado pelo personal com perfil administrativo. As regras de pontuação editadas pelo personal valem para os créditos que ele validar. Créditos anteriores preservam os valores originais.
- O personal responsável atribui metas e missões. O aluno envia a conclusão para análise e o personal valida o crédito. Uma meta de longo prazo validada concede Superação. O reconhecimento por presentes é privado e separado dos resgates. O personal pode alterar a sugestão por aluno, registrar pendência ou entrega e consultar o histórico.
- As metas usam a quantidade de dias prescritos no programa ativo. A primeira sessão validada da semana registra a frequência usada naquela semana. Para a meta mensal, cada semana pertence ao mês da sua quinta-feira. Sem frequência prescrita, o treino pontua e a semana fica sem meta automática. A concessão de Disciplina de Ouro, Inabalável e marcos de consistência depende de sequências de metas alcançadas.
- O detalhe do WandCoach concentra Conquistas, Gastos do aluno, Missões e metas do aluno, Histórico de XP e energia e Reconhecimento de alunos. A validação de treinos fica em Conquistas. A interface não oferece a antiga validação em lote de acompanhamento. A função de crédito continua no banco, sem acionamento pelos formulários atuais de acompanhamento.
- As centrais atuais exibem avisos de XP e energia, insígnias, níveis, missões, resgates e reconhecimento. O reconhecimento permanece restrito ao personal.
- Os dois perfis usam o escudo oficial transparente acima do nível atual. O formulário de missões do personal separa título, categoria e ação em campos rotulados, organizados lado a lado no desktop e empilhados no celular.
- A validação autenticada com o esquema hospedado segue pendente. O projeto de produção não tem branch de homologação, e o Supabase recusou sua criação no plano atual. A migração foi executada em PostgreSQL isolado com um esquema de teste. A publicação segue pendente.

Para testar a migração com dados sintéticos em Postgres isolado, instale `@electric-sql/pglite` para uso local, aponte `WAND_LEGACY_PGLITE` para o diretório do pacote e execute `node --test tests/legacy-progressao.test.mjs`. Sem essa variável, o teste de banco é pulado.
