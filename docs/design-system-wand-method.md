# Design System oficial do WAND METHOD

## Hierarquia

O nível 0 é o painel do perfil. O nível 1 é a central principal da funcionalidade. Ambos usam cartões dourados. A partir do nível 2, as superfícies de navegação usam grafite e bordas prateadas. A profundidade expressa o papel da tela. Ícones funcionais, destaques e ações primárias usam dourado.

## Componentes oficiais

- `wand-premium.css` define superfícies, foco, controles e o botão com `data-wand-back`. Aplique `data-wand-level` ao corpo ou a uma subdivisão que possua hierarquia própria. Use `data-wand-route-card` em superfícies que assumem as cores do nível e `data-wand-heading` no título da subárea.
- `wand-navigation.js` e `wand-navigation.css` entregam a ilha fixa e o menu de cada perfil. Preserve o desenho e os atalhos da ilha. Reserve espaço no conteúdo para o último controle permanecer acessível.
- Use os cabeçalhos já aprovados e os cartões horizontais da central. Links internos abrem na mesma aba. Expansões aprovadas mantêm o controle e o chevron à direita, girando para baixo ao abrir.
- Cada tela tem um retorno contextual. Use destino interno explícito e fallback para acesso direto. Vídeo da biblioteca fecha no mesmo estado de pesquisa. A seleção em prescrição retorna à montagem com o rascunho preservado.
- Use as ações primária e secundária existentes. Confirmações definitivas usam `wandMostrarConclusao` nas páginas migradas. Aguarde o reconhecimento do usuário antes de retornar ao destino contextual. Alterações intermediárias mantêm feedback discreto. Preserve exceções como gráficos, execução de treino, aceite público e impressão.

## Inventário dos 50 arquivos HTML rastreados

| Arquivo | Classificação | Estado |
| --- | --- | --- |
| `02_acompanhamento.html` | Nível 2 | Integrada ao tema e à ilha |
| `aceite-contrato.html` | Pública | Inventariada |
| `admin.html` | Nível 0 e telas internas | Integrada ao tema e à ilha |
| `aluno (2).html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-V7-adaptacao-inteligente.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-V8-indicadores-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-V9-adaptacoes-integradas-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-bem-estar-botoes-v2.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-bem-estar-completo-v3.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-bem-estar-separado-v1.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-bemestar-adaptacoes-v5-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-saude-feminina-supabase-v4-1.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-saude-feminina-supabase-v4.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno-WAND-treino-adaptado-v6-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `aluno.html` | Nível 0 e telas internas | Integrada ao tema e à ilha |
| `anamnese.html` | Nível 1 | Integrada ao tema e à ilha |
| `avaliacao-fisica-painel.html` | Nível 2 | Integrada ao tema e à ilha |
| `avaliacao-fisica.html` | Nível 2 | Integrada ao tema e à ilha |
| `avaliacao-fotografica-central.html` | Nível 2 | Integrada ao tema e à ilha |
| `avaliacao-fotografica-painel.html` | Nível 2 | Integrada ao tema e à ilha |
| `avaliacao-postural.html` | Nível 3 | Integrada ao tema e à ilha |
| `bem-estar-coach.html` | Nível 2 | Integrada ao tema e à ilha |
| `biblioteca-exercicios.html` | Nível 2 | Integrada ao tema e à ilha |
| `cadastro-aluno.html` | Nível 2 | Integrada ao tema e à ilha |
| `contrato-aceite.html` | Pública | Inventariada |
| `contratos-admin.html` | Nível 2 | Integrada ao tema e à ilha |
| `contratos-aluno.html` | Nível 1 | Integrada ao tema e à ilha |
| `criar-senha.html` | Pública | Inventariada |
| `gerenciar-treinos.html` | Nível 2 | Integrada ao tema e à ilha |
| `index.html` | Pública | Inventariada |
| `login.html` | Pública | Inventariada |
| `minha-avaliacao-fisica.html` | Nível 2 | Integrada ao tema e à ilha |
| `nova-senha.html` | Pública | Inventariada |
| `perfil-aluno.html` | Nível 2 | Integrada ao tema e à ilha |
| `prescricao-treinos-WAND-FORCE-v1.html` | Arquivo histórico ou protótipo | Inventariada |
| `prescricao-treinos-WAND-FORCE-v2.html` | Arquivo histórico ou protótipo | Inventariada |
| `prescricao-treinos-WAND-FORCE-v3.html` | Arquivo histórico ou protótipo | Inventariada |
| `prescricao-treinos-WAND-FORCE-v4.html` | Arquivo histórico ou protótipo | Inventariada |
| `prescricao-treinos-integrada-v1-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `prescricao-treinos.html` | Nível 2 | Integrada ao tema e à ilha |
| `recuperar-senha.html` | Pública | Inventariada |
| `simulador-contratos.html` | Nível 2 | Integrada ao tema e à ilha |
| `solicitar-cadastro.html` | Pública | Inventariada |
| `treino-presencial.html` | Nível 2 | Integrada ao tema e à ilha |
| `wand-adaptacoes-montagem-v1-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `wand-force.html` | Atalho para treino presencial | Inventariada |
| `wandcoach-adaptacoes-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `wandcoach-adaptacoes-v2-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `wandcoach-adaptacoes-v3-teste.html` | Arquivo histórico ou protótipo | Inventariada |
| `wandcoach-adaptacoes-v4-validade-teste.html` | Arquivo histórico ou protótipo | Inventariada |

### Rotas internas dos painéis

| Perfil | Nível | Áreas |
| --- | --- | --- |
| WandCoach | 0 | Painel principal |
| WandCoach | 1 | Alunos, Treinos, Evoluções, Anamneses, Avaliação Física, Avaliação Fotográfica, Bem-estar, Contratos, Comunicação, Notificações, WAND LEGACY e Menu |
| WandCoach | 2 | Seleção de alunos e modalidades, solicitações, listas por estado, pendências, acompanhamento, níveis do Legacy, catálogo e regras |
| WandCoach | 3+ | Lista por nível do Legacy, detalhe individual, detalhes de pendências, registros e formulários após seleção |
| Aluno | 0 | Painel principal |
| Aluno | 1 | Meus Treinos, Minha Evolução, Bem-estar, Minha Ficha, Avaliações, Notificações, Meu Treinador, Minha Jornada, WAND LEGACY e Menu |
| Aluno | 2 | Treinos e histórico detalhado, evolução selecionada, saúde feminina, adaptação, dados pessoais, contato, segurança, privacidade, autorizações e seções do Legacy |
| Aluno | 3+ | Calendário, registros, sintomas, preferências e detalhes da conta |

Consulte o [registro de continuidade](design-system-progresso.md) para distinguir classificação, execução e validação.
