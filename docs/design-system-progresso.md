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
- [x] Exercitar acesso direto ao calendário, retorno à Saúde Feminina e retorno ao Bem-estar. A automação expôs a perda do fragmento na abertura, corrigida antes da nova execução.
- [x] Preservar os retornos internos da avaliação postural e testar rejeição de destinos externos.
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
