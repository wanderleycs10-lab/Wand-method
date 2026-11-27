# WAND EXERCISES — lote de 20 vídeos para aprovação

Conferência em 26/11/2026. A consulta ao Supabase retornou 10 exercícios existentes, todos ativos. O lote abaixo é distinto desse catálogo. Os vídeos têm de 9 segundos a 2 minutos. O nome, a descrição quando disponível e a variação foram cruzados com o registro proposto. A revisão visual da pegada, da execução e da amplitude cabe ao personal antes da liberação.

| Exercício | Grupo e equipamento | Canal | Duração | Vídeo |
|---|---|---|---:|---|
| Supino inclinado com halteres | Peitoral · Halteres e banco inclinado | Max Euceda | 119 s | [YouTube](https://www.youtube.com/watch?v=IP4oeKh1Sd4) |
| Crucifixo no voador | Peitoral · Máquina voador | MyTrainingPRO | 56 s | [YouTube](https://www.youtube.com/watch?v=1D9x_U6PkY8) |
| Remada baixa com triângulo | Dorsal · Polia baixa e triângulo | StrengthLog | 22 s | [YouTube](https://www.youtube.com/watch?v=SJZKt8Wz3oo) |
| Remada unilateral com halter apoiada | Dorsal · Halter e banco | Max Euceda | 120 s | [YouTube](https://www.youtube.com/watch?v=dFzUjzfih7k) |
| Elevação lateral unilateral na polia | Ombros · Polia baixa e puxador individual | PureGym | 15 s | [YouTube](https://www.youtube.com/watch?v=Z5FA9aq3L6A) |
| Face pull com corda | Ombros · Polia e corda | StrengthLog | 16 s | [YouTube](https://www.youtube.com/watch?v=C0XHJJ4dZQ4) |
| Cadeira adutora | Adutores · Máquina adutora | PureGym | 16 s | [YouTube](https://www.youtube.com/watch?v=CjAVezAggkI) |
| Rosca martelo com halteres | Bíceps · Halteres | National Academy of Sports Medicine (NASM) | 19 s | [YouTube](https://www.youtube.com/watch?v=CFBZ4jN1CMI) |
| Rosca inclinada com halteres | Bíceps · Halteres e banco inclinado | Max Euceda | 120 s | [YouTube](https://www.youtube.com/watch?v=HhHHBj3qTJ4) |
| Tríceps acima da cabeça na polia com corda | Tríceps · Polia e corda | StrengthLog | 18 s | [YouTube](https://www.youtube.com/watch?v=U_qMtEvHuQM) |
| Leg press 45° | Quadríceps · Leg press 45° | Treino Mestre | 56 s | [YouTube](https://www.youtube.com/watch?v=waAxlYvtCcI) |
| Cadeira extensora | Quadríceps · Cadeira extensora | Strong With Stef | 19 s | [YouTube](https://www.youtube.com/watch?v=eSgIvwS36ws) |
| Cadeira flexora | Posterior de coxa · Cadeira flexora | National Academy of Sports Medicine (NASM) | 25 s | [YouTube](https://www.youtube.com/watch?v=G5iP_YcDQdE) |
| Levantamento terra romeno com barra | Posterior de coxa · Barra e anilhas | Barbell Logic | 55 s | [YouTube](https://www.youtube.com/watch?v=amLSSb8cXok) |
| Elevação pélvica com barra | Glúteos · Barra, anilhas e banco | Legion | 60 s | [YouTube](https://www.youtube.com/watch?v=XAO5YepO8DI) |
| Extensão de quadril na polia com tornozeleira | Glúteos · Polia baixa e tornozeleira | QuickCoach | 9 s | [YouTube](https://www.youtube.com/watch?v=Ag6UMYXRZVU) |
| Panturrilha sentada na máquina | Panturrilhas · Máquina de panturrilha sentada | MyTrainingPRO | 58 s | [YouTube](https://www.youtube.com/watch?v=Bx6elAOgxMI) |
| Abdominal ajoelhado na polia com corda | Abdominal · Polia alta, corda e colchonete | Live Lean TV Daily Exercises | 40 s | [YouTube](https://www.youtube.com/watch?v=kc0PRn372lo) |
| Prancha frontal nos antebraços | Abdominal · Colchonete | Hospital for Special Surgery | 24 s | [YouTube](https://www.youtube.com/watch?v=3QZlgJ40LfU) |
| Agachamento búlgaro com halteres | Quadríceps · Halteres e banco | Red Dot Fitness | 23 s | [YouTube](https://www.youtube.com/watch?v=p0ZwhGPfJe8) |

## Revisão técnica

O serviço oficial oEmbed retornou metadados e o iframe correspondente para os 20 vídeos. O player oficial do YouTube aceitou carregar cada vídeo no Chrome local e retornou a duração sem erro de incorporação. O crucifixo inverso inicialmente pesquisado retornou erro de incorporação e foi substituído pela cadeira adutora. A prévia e o fechamento foram testados com iframe simulado em 390 e 1280 pixels. A reprodução integral no domínio publicado e a revisão biomecânica ainda estão pendentes.

Os registros completos estão na [migração da fila de revisão](../supabase/migrations/20261127012107_wand_exercises_fila_revisao.sql). Ela inclui músculos primários e secundários, equipamento, categoria, padrão de movimento, dificuldade, orientação, erros comuns e fonte. O lote entra inativo no Supabase quando a migração for aplicada. Depois, o WandCoach decide quais exercícios disponibilizar. O link cadastrado é enviado ao treino regular e adaptado pelo vínculo existente. A edição troca a mídia do mesmo registro. O bucket atual de MP4 próprio restringe leitura a administradores. Uma troca futura para vídeo privado também precisará disponibilizar o arquivo aos alunos autorizados.

A prévia carrega a miniatura oficial e só cria o iframe após o clique. O player mantém sua identificação e oferece link para a página original. [Player oficial](https://developers.google.com/youtube/player_parameters) · [Termos do YouTube](https://www.youtube.com/t/terms).
