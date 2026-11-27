# Revisão de mídia e publicação da biblioteca WAND EXERCISES

Os 10 exercícios legados continuam ativos e exibem os GIFs que já tinham. A fila **Substituições de mídia** permite conferir o candidato e aprová-lo ou rejeitá-lo. Aprovar troca o vídeo no mesmo ID e retém a mídia anterior. Rejeitar mantém a demonstração anterior. A seleção abaixo aceitou incorporação no Chrome pelo player oficial. A validação biomecânica permanece com o WandCoach.

| Exercício | Variação a revisar | Duração | Candidato |
|---|---|---:|---|
| Agachamento livre | Barra nas costas | 25 s | [YouTube](https://www.youtube.com/watch?v=4CBU0uYCVCE) |
| Crucifixo com halteres | Banco reto, pegada neutra | 35 s | [YouTube](https://www.youtube.com/watch?v=dRlG-eC5N0U) |
| Desenvolvimento sentado com halteres | Sentado, pegada pronada | 18 s | [YouTube](https://www.youtube.com/watch?v=SSXS4Z8OkCg) |
| Elevação lateral com halteres | Halteres, execução bilateral | 57 s | [YouTube](https://www.youtube.com/watch?v=4p_m96HXMLk) |
| Panturrilha em pé | Degrau, bilateral, peso corporal | 27 s | [YouTube](https://www.youtube.com/watch?v=jfKTT_hr8bk) |
| Puxada frontal | Polia alta, pegada pronada | 15 s | [YouTube](https://www.youtube.com/watch?v=3oKVLtxQQ6U) |
| Remada curvada com barra | Barra reta, pegada pronada | 28 s | [YouTube](https://www.youtube.com/watch?v=OChKu05590M) |
| Rosca Direta c/Barra W | Barra W, pegada semissupinada | 11 s | [YouTube](https://www.youtube.com/watch?v=fjS0CqDR4v8) |
| Supino reto com barra | Banco reto, barra, pegada pronada | 26 s | [YouTube](https://www.youtube.com/watch?v=CayG6UYqL8g) |
| Triceps na polia | Polia alta, barra reta | 71 s | [YouTube](https://www.youtube.com/watch?v=Rpv1iD4u7Us) |

## Operação e reversão

1. Antes da publicação, verifique os dez IDs ativos, a quantidade de vínculos e as regras de leitura administrativas. A migração deve deixar 20 novos itens inativos e 10 substituições pendentes. O teste de permissão usa transação revertida.
2. O WandCoach usa os cartões **Exercícios pendentes de revisão** e **Substituições de mídia**. Em `Importar lote`, informe um JSON com uma lista de objetos. Campos obrigatórios `nome`, `grupo_muscular`, `equipamento`, `musculos_primarios`, `instrucoes` e `video_url` no formato `https://www.youtube.com/watch?v=ID`. Campos complementares `musculos_secundarios`, `erros_comuns`, `pegada`, `variacao` e `caracteristicas`. O banco admite de 1 a 500 itens por importação. Informe as distinções biomecânicas para manter variações de um mesmo nome.
3. Em caso de incidente, reverta primeiro o commit publicado no GitHub. Mantenha as colunas e os itens ainda pendentes ou rejeitados, que já estão inativos. Isso preserva os IDs e permite reativar a fila posteriormente. Itens já aprovados e prescritos devem ser preservados. Nunca apague o catálogo nem recrie IDs para reverter a interface.
4. Para reverter uma mídia já aplicada, confira a mídia anterior armazenada no próprio exercício e use uma atualização administrativa direcionada a esse ID. Restaure `video_tipo` e `video_url` pelos campos anteriores e limpe `midia_revisada_em` apenas quando voltar ao GIF. As prescrições e séries ficam fora dessa operação. Não execute reversão automaticamente após uma decisão do WandCoach.

A produção de mídias próprias permanece pausada. GIFs, modelos e protótipos são preservados no workspace. MP4 privado no treino do aluno exigirá autorização de leitura pelo vínculo do aluno quando a produção própria for retomada.
