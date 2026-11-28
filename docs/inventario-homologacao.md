# Inventário da homologação funcional

Atualizado em 27/11/2026. O destino de homologação é `kcusxtfvcwqdflszqjes`. Este inventário complementa a [classificação de rotas](design-system-wand-method.md), o [guia de ambiente](homologacao-isolada.md) e o [registro de progresso](design-system-progresso.md).

## Base instalada

O catálogo da homologação contém as 17 tabelas do recorte de Treinos, incluindo perfis, alunos, catálogo de exercícios, métodos, programas, sessões, séries, adaptações, avisos internos e `wand_legacy.aviso`. O aviso do Legacy é uma dependência de Treinos. O módulo de gamificação completo e as centrais de notificações ainda precisam de suas funções e tabelas complementares. O projeto está sem buckets e sem extensões de rede ou agendamento e servidores externos identificados. A consulta foi somente de leitura.

O ciclo hospedado de Treinos já passou com papéis e claims SQL. O teste real com sessões emitidas pelo Auth permanece pendente por decisão do responsável. Nenhuma etapa abaixo presume que uma simulação ou consulta de catálogo seja homologação ponta a ponta.

## Dependências, segurança e critérios por área

| Área e fluxo | Dependências a conferir ou importar | Segurança e prova de homologação |
| --- | --- | --- |
| Login, cadastro, ativação e recuperação | Auth, `profiles`, `alunos`, solicitações de cadastro, Edge Function `wand-cadastro-seguro`, Turnstile e rotas de primeiro acesso. Perfil e vínculo estão instalados. | Testar sessão expirada, logout, separação dos papéis e tentativa de autopromoção. Para cadastro, convites e recuperação, usar apenas destinos de teste e um coletor que rejeite destinatários reais. Preservar cadastro público fechado no projeto de homologação. |
| Minha Ficha, perfil individual, privacidade e consentimentos | `alunos`, `profiles`, RPC de dados pessoais, autorizações do aluno e buckets de avatar. | Testar titularidade, campos editáveis e trilha de aceite e revogação. Aluno B não pode ler ou atualizar a ficha de A. Verificar o escopo administrativo real por recurso. A tabela de alunos no esquema de origem tem acesso global para administradores e não prova vínculo individual com um treinador. |
| Anamnese e Minha Jornada | `anamneses`, estado de rascunho e finalização, RPC de início da jornada e consultas de pendências. | Salvar, recarregar, concluir e reabrir como titular e coach autorizado. Negar leitura por outro aluno e verificar que alterações de saúde aparecem apenas para os destinatários permitidos. |
| Avaliação física e Evolução | `avaliacoes_fisicas`, solicitações remotas, RPCs de solicitação, envio e revisão, retificações e relatórios. Gráficos de treino também usam sessões e séries já instaladas. | Alternar entre solicitação, submissão, parecer e liberação. Conferir autoria, versões e acesso ao resultado antes e depois de liberar. Usar apenas medidas sintéticas e testar a tentativa de consulta cruzada. |
| Avaliação fotográfica e análise postural | Consentimentos, pedidos, registros de foto, autorização separada de divulgação, análise postural, histórico, bucket privado e políticas de Storage. Revisar SQL 020, 021 e 022 e a base que esses scripts pressupõem. | Testar consentimento, pedido duplicado, três imagens sintéticas recentes, assinatura e expiração da URL, isolamento de objetos e autoria. O teste em memória cobre conclusão e aviso. A autorização de Storage e as políticas implantadas ainda precisam de prova real. |
| Notificações internas e push | `wand_notificacoes_internas` já existe. Faltam RPCs de lista e leitura das centrais e fontes específicas. Push depende de service worker, inscrições, VAPID e `wand-push-dispatch`. | Confirmar um evento por origem, destinatário, leitura idempotente, persistência e destino contextual. Testar push somente com coletor ou inscrição descartável autorizada. Não usar chaves ou inscrições de produção. |
| Contratos, pagamentos e comunicação | Propostas, planos, aceites, verificações, convites, pagamentos, ativação e RPCs de contrato, além de `wand-enviar-contrato` e Resend no fluxo real. Acompanhamento também usa comunicações e relatórios. | Separar minuta e aceite do envio externo. Validar identidade, expiração e uso único do link, versão do documento, permissões, idempotência e estados de pagamento e ativação. Usar caixa de captura e pagamentos fictícios. WhatsApp e e-mail reais ficam fora dos testes. |
| Bem-estar, saúde feminina e adaptações | Preferências, ciclos, check-ins, consentimentos, solicitações, RPCs de painel e aprovação. Algumas tabelas de adaptação já existem pelo recorte de Treinos. | Ativar e revogar consentimento, ocultar dados sensíveis de pessoas sem permissão e testar registro e exclusão conforme as regras aprovadas. Confirmar que uma resposta de bem-estar não altera automaticamente a prescrição. |
| WAND EXERCISES | Catálogo e métodos já instalados. Fila de revisão precisa de funções complementares e bucket privado para mídia própria. O navegador também usa player externo em exercícios com vídeo incorporado. | Verificar que apenas o WandCoach administrador aprova ou troca mídia. Rejeitar prescrição de exercício pendente, preservar o ID e os vínculos e manter filtros e retorno da biblioteca. Usar mídia sintética e simular o player externo enquanto o acesso real estiver fora do escopo. |
| WAND LEGACY | O recorte contém apenas a tabela de aviso e o trigger usado por Treinos. Faltam os demais objetos de progressão, saldo, missões, recompensas, resgates e reconhecimento. | Conferir crédito único por dia pelo coach responsável, isolamento de XP e energia, autorização de missões, reserva e estorno. Verificar que reconhecimento privado nunca é lido pelo aluno. |
| PWA, navegação, temas e rotas públicas | Manifesto, service worker, componentes globais, ilha, rotas de login e aceite. Prévia de homologação tem service worker desativado. | Verificar login e redirecionamentos só no ambiente isolado, links diretos, retorno contextual e sessão após recarga. Testar atualização do PWA em origem isolada antes de publicar. O Design System aprovado permanece a referência visual. |

## Sequência de trabalho

1. Preparar a próxima parcela de DDL sem dados, por dependência, começando por Anamnese, Avaliações, Storage privado e RPCs de notificações. Revisar grants, RLS, papéis, triggers e funções privilegiadas antes de aplicar exclusivamente na homologação.
2. Homologar esses fluxos e depois Bem-estar e WAND EXERCISES com dados fictícios. Conferir permissões com alunos A e B, acesso de treinador e negativas sem sessão. Examinar persistência e o destino das notificações.
3. Preparar e homologar WAND LEGACY e contratos internos. Só liberar os fluxos de comunicação, convite, recuperação e push depois de comprovar o bloqueio de destinatários e integrações reais no serviço. Repetir o ciclo de Treinos com Auth quando as credenciais fictícias estiverem disponíveis por canal seguro.
4. Consolidar evidências por área e levar a decisão de publicação ao responsável depois das provas de autenticação, gravação e isolamento.

## Execuções sem credenciais de usuário

- Node.js 22.23.5 e PGlite descartável. **41 de 41 testes passaram**, incluindo o caso de banco do WAND LEGACY. Esse caso usa uma base sintética e cobre isolamento e crédito diário. Ele não declara o módulo completo instalado na homologação.
- PostgreSQL em memória com base mínima fictícia. Executei os scripts reais [020](../sql/020_concluir_solicitacao_fotografica.sql), [021](../sql/021_notificar_conclusao_fotografica.sql) e [022](../sql/022_leitura_notificacoes_fotograficas.sql). O pedido permaneceu pendente com consentimento recusado ou fotografia antiga ou de outro aluno. A conclusão com as três posições válidas gerou um aviso único. O destinatário conseguiu marcá-lo como lido uma única vez, outro usuário não conseguiu vê-lo ou marcá-lo e o papel anônimo não conseguiu executar a RPC.
- API hospedada, com chave publicável e sem sessão de usuário. Perfis e alunos retornaram listas vazias com HTTP 200. Notificações internas retornaram HTTP 401. O endpoint de configuração confirmou cadastro público e login anônimo desativados. Essas verificações foram de leitura e restritas à homologação.

## Anamnese, avaliações e notificações na homologação

O recorte já foi aplicado exclusivamente em `kcusxtfvcwqdflszqjes`, na migração `homologacao_avaliacoes_e_anamnese_privilegios_minimos`. Acrescentou 15 tabelas e 23 funções ao recorte de Treinos. O bucket privado `avaliacoes-fotograficas` tem três políticas próprias, limite de 10 MiB e aceita JPEG, PNG e WebP. As tabelas de propostas e aceites são dependências da regra de entrada da Anamnese. O serviço de contratos e seus envios não foram instalados. No recorte novo, os grants foram reduzidos às operações necessárias. Privilégios amplos de origem, como TRUNCATE e MAINTAIN para papéis do cliente, não foram reproduzidos.

Os ensaios usaram transações com `ROLLBACK`, IDs exclusivos para anamnese, solicitação, avaliação postural e objeto de Storage, e caminhos com UUID por execução. Os consentimentos foram localizados pela chave primária do registro inserido na própria transação. As operações foram restritas aos perfis fictícios existentes.

| Área | Resultado no banco hospedado com papéis e claims SQL |
| --- | --- |
| Anamnese e autorizações | Coach criou anamnese, o titular registrou resposta e autorização de dados e o aluno B não leu a anamnese nem a autorização de A e não conseguiu alterar a resposta. |
| Avaliação física | Coach pediu avaliação, A enviou peso fictício de 72,5 kg, B não validou nem leu o resultado e A visualizou o registro liberado após parecer do coach. |
| Fotografia e consentimento | Negativa de gravação sem consentimento. O titular registrou três posições fictícias com consentimento vigente, o pedido foi concluído e B não leu fotografia ou consentimento de A e não alterou o consentimento. |
| Postura e Storage privado | O coach viu o registro postural criado, o aluno não leu o rascunho e o titular pôde consultar o metadado do objeto. B não leu o objeto e a RLS rejeitou a tentativa de gravar no caminho do titular. |
| Notificações | A fotografia concluída gerou aviso do coach com ID do pedido e ID do aluno. Marcar leitura funcionou uma vez. Os 14 testes de notificações e leitura também passaram, incluindo as verificações de destino na interface. |

O Supabase recusou a tentativa de DELETE direto em `storage.objects` por proteção própria do Storage. O teste usou uma negativa de gravação no caminho do titular e não contornou a proteção. O teste SQL de Storage envolve metadados fictícios. Upload de bytes, assinatura, expiração e exclusão pela API de Storage, login real, e-mail e push continuam pendentes. Antes e depois, as três contas confirmadas e as sete tabelas centrais de Treinos estavam presentes, sem treinos ou sessões residuais e sem anamnese, fotografia ou objeto de Storage deixado pelos ensaios.

## Módulos complementares em homologação

A migração `homologacao_modulos_complementares_acesso_restrito`, aplicada exclusivamente em `kcusxtfvcwqdflszqjes`, acrescentou 22 tabelas e 64 funções. O catálogo final confirmou 54 tabelas com RLS e 105 funções do aplicativo. A configuração inicial do Legacy veio da migração versionada. Os ensaios executaram em PGlite descartável e no banco hospedado, com papéis e claims SQL dos usuários fictícios, IDs próprios para novos registros e `ROLLBACK`. Minha Ficha alterou temporariamente apenas o cadastro da conta fictícia A. Preferências e check-in exigiram ausência de dados prévios no recorte testado.

| Funcionalidade | Evidência de banco no Supabase de homologação |
| --- | --- |
| Bem-estar e Check-ins | A habilitou o bem-estar, gravou um check-in, consultou-o no painel e gerou solicitação de ajuste. |
| Saúde Feminina | A gravou um ciclo fictício. O coach vinculado só viu os detalhes após A habilitar o compartilhamento. B não teve acesso. |
| Adaptação de Treinos | O coach criou e ativou protocolo, aprovou a solicitação de A e o treino alternativo apareceu para A na consulta do dia. |
| Minha Evolução | A concluiu uma sessão fictícia e o histórico do aluno retornou o ID da sessão. A consulta do coach vinculado retornou o mesmo registro. |
| WAND LEGACY e recompensas | Com crédito sintético, o resgate repetido devolveu o mesmo ID. A aprovação e o cancelamento restauraram o estoque. B não pôde consultar o resumo de A. A pontuação por treino e o limite diário continuam cobertos no teste automatizado de banco versionado. |
| Contratos e propostas | O coach criou uma proposta mensal, A aceitou e B não conseguiu aceitar. A ativação foi negada antes do pagamento. Após confirmação fictícia, o coach conseguiu ativar. Nenhuma cobrança ou comunicação externa foi executada. |
| Gestão de alunos | O coach criou e inativou um cadastro novo marcado como QA. |
| Minha Ficha e gerenciamento de conta | A atualizou o próprio nome de teste pela RPC. B não conseguiu ler o cadastro de A. Alteração de senha, e-mail e recuperação continuam fora desta execução. |
| Relatórios do personal e do aluno | O coach criou um relatório. O rascunho ficou oculto do aluno, o relatório publicado ficou disponível para A e B não conseguiu ler nem criar relatório para A. B também foi impedido de chamar a RPC de status de sessões de A. |

**Divergências de segurança na homologação.** A revisão automática bloqueou o primeiro lote por falta de verificação explícita de papel e vínculo na RPC de status de sessões. A versão aplicada adicionou verificação administrativa em funções do painel, titularidade na consulta de status e de elegibilidade de contrato, e papel de coach nas políticas de comunicação, relatórios, planos e contratos internos. Grants amplos ao cliente e execução anônima não foram importados no lote. A função de proposta mensal usa `extensions.digest` explicitamente no ambiente de teste. Nenhuma dessas alterações foi aplicada ao banco de produção.

**Testes automatizados.** A suíte Node.js 22 com PGlite passou 41 de 41. Os quatro ensaios transacionais adicionais passaram tanto em PGlite quanto na homologação. Após o rollback, a conferência encontrou as três contas confirmadas e zero treinos, sessões, check-ins, propostas, relatórios ou resgates deixados pelos ensaios. Não foram registradas extensões de rede ou agendamento nem conexões via servidores externos.

**Interface real e integrações.** Os resultados acima são de banco e testes automatizados. Nenhum fluxo autenticado foi executado na interface nesta rodada. Login real, operações de arquivos pela API de Storage, e-mail e push continuam pendentes. Não houve alteração no Design System, em produção ou nos destinos de publicação.

## Homologação com sessões reais pela API

As três contas fictícias passaram pelo Auth do projeto `kcusxtfvcwqdflszqjes`. Os testes usaram sessões emitidas pelo Supabase e requisições restritas ao host de homologação. As rodadas `QA Treinos b8462dfd` e `QA db98532dcd` deixaram registros fictícios para conferência de persistência. As três imagens sintéticas foram removidas após a verificação. A conferência final mostrou três contas, bucket privado, zero objetos com o prefixo do ensaio, zero Edge Functions e nenhuma das extensões consultadas de rede e agendamento. Cadastro público e login anônimo estavam desativados. Os testes usaram exclusivamente Auth por senha, Data API e Storage. E-mail e push não foram acionados.

| Funcionalidade | Resultado pela API autenticada |
| --- | --- |
| Prescrição, publicação, execução e histórico | WandCoach publicou. Aluno A iniciou, registrou 18,5 kg, concluiu e consultou o histórico. B não conseguiu ler nem operar sobre o treino de A. |
| Anamnese | WandCoach abriu a ficha, A gravou respostas e o WandCoach leu a gravação. B não conseguiu ler ou atualizar a ficha. |
| Autorizações e consentimentos | Aceite de dados persistiu. O consentimento fotográfico respondeu ao pedido do WandCoach e manteve a divulgação desautorizada. B não leu os aceites de A. |
| Avaliação física e Minha Evolução | Solicitação, envio de medidas, revisão, liberação e leitura pelo titular passaram. B não viu o pedido nem o resultado e não conseguiu enviar medidas em nome de A. Gráficos aguardam interface. |
| Avaliação fotográfica e Storage | As três posições sintéticas concluíram o pedido. A baixou o arquivo por URL assinada, que expirou. B não leu os metadados nem obteve URL. A exclusão dos três arquivos passou. |
| Análise Postural | WandCoach gravou rascunho e publicou. B não leu o parecer. A também não leu mesmo após a publicação. A única política de leitura verificada é exclusiva para administradores. A entrega do parecer ao titular fica pendente de correção com preservação do sigilo antes da publicação e entre alunos. |
| Notificações internas | Conclusão da fotografia gerou aviso para o WandCoach com os IDs corretos do aluno e do pedido. A marcação de leitura persistiu, a repetição não alterou o estado e B não recebeu o aviso. Clique e destino renderizado aguardam interface. |
| Bem-estar, Check-ins e Saúde Feminina | A gravou e releu check-in e ciclo. A visibilidade do ciclo para o WandCoach respeitou o compartilhamento. B não consultou o ciclo nem o check-in de A. |
| Adaptação de Treinos | WandCoach ativou um protocolo e aprovou a solicitação do check-in. A releu a adaptação do dia e B não a recebeu. |
| WAND LEGACY e recompensas | Crédito por treino sem duplicação, resgate idempotente, débito, aprovação, cancelamento e estorno de saldo e estoque passaram. B não consultou o saldo de A. O ensaio foi corrigido para ler as recompensas estudantis pelo resumo do titular. O catálogo administrativo negou acesso ao aluno como esperado. |
| Contratos e propostas | WandCoach criou proposta, A aceitou, B teve o aceite cruzado recusado e a ativação foi bloqueada antes da confirmação do pagamento fictício. Estado persistido e visível apenas ao destinatário entre os alunos. |
| Gestão de alunos e Minha Ficha | WandCoach cadastrou e inativou um registro sintético. A atualizou a própria ficha e releu a alteração. B não viu os registros protegidos. Operações de conta que exigem entrega externa ficam pendentes. |
| Relatórios do personal e do aluno | WandCoach gravou e publicou relatório. A leu apenas após a publicação. B não conseguiu ler o relatório nem chamar a função exclusiva do WandCoach usada no ensaio. |

A rodada acrescentou evidência da API hospedada à homologação SQL transacional e à suíte de 41 testes registrada anteriormente. A correção do ensaio de recompensas dispensou alteração no aplicativo ou nas políticas. O bloqueio de entrega do parecer postural permanece aberto. As verificações autenticadas de interface, desktop e mobile, com ambos os temas, incluem ilha inferior, hierarquia de cores, contratos, confirmações, navegação contextual, recarga e estados de erro. E-mail e push permanecem reservados a um teste posterior com destinos controlados. A produção, o Cloudflare e a main ficaram fora da rodada.

### Reteste da autorização postural

A causa era a política de leitura exclusiva de administradores. A migração candidata `20261128014047_wand_autorizar_parecer_postural.sql` foi aplicada pelo conector exclusivamente em `kcusxtfvcwqdflszqjes`. Ela substitui as políticas da tabela sem alterar registros existentes. O aluno titular lê somente os pareceres publicados. O WandCoach precisa de papel administrativo e vínculo pelo treino do aluno, conforme a regra existente do WAND LEGACY. Entre os WandCoaches vinculados, o rascunho fica reservado ao autor. Pareceres publicados ficam protegidos contra edição, reabertura ou exclusão pelas contas do aplicativo.

Na API hospedada, com as três sessões fictícias, a rodada `QA a519d51228` confirmou:

- O WandCoach vinculado criou e releu o rascunho. A e B não o leram nem conseguiram publicá-lo.
- Ao publicar, o UUID, a autoria, as datas e o conteúdo ficaram idênticos. O histórico preexistente permaneceu disponível.
- A e o WandCoach releram o parecer publicado. B não acessou o parecer por UUID ou filtro de aluno, nem conseguiu inserir um parecer. O WandCoach teve a criação negada para B, que não tinha vínculo por treino.
- As sessões autenticadas não conseguiram reabrir ou apagar o registro publicado. O ensaio fez alterações apenas no UUID fictício que criou e deixou o parecer para conferência manual.
- A suíte Node.js 22.23.5 com PGlite passou com 41 de 41 testes.

O aluno encontra o relatório, as prioridades e a estratégia em **Minha Evolução Física → Evolução corporal → Pareceres posturais**. A prévia do Codex Cloud escuta em loopback e usa exclusivamente o Supabase de homologação. A rodada não acionou e-mail nem push.

No Chromium com sessões reais, o aluno A abriu o parecer fictício e retornou à central em 1280 e 390 px. Em 390 px, B viu o estado sem pareceres e também retornou à central. A largura do documento coincidiu com a da janela nos três cenários. O teste de publicação pela tela do WandCoach e a revisão manual nos dois temas continuam no roteiro.
