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
