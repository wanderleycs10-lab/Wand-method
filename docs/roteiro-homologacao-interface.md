# Homologação funcional pela interface

Base visual aprovada em 27/11/2026. Destino exclusivo `kcusxtfvcwqdflszqjes`. A publicação depende de autorização separada. [Inventário de banco e cobertura](inventario-homologacao.md)

## Abrir a versão de teste

1. No Codex Cloud, use o script abaixo com a chave **publicável** do projeto de homologação. Pode obtê-la no painel desse projeto. O script confere o cadastro público e o login anônimo desativados e recusa qualquer outra referência hospedada. Use um navegador com perfil de teste limpo. Não use uma aba do site oficial.
   ```sh
   export WAND_STAGING_REF=kcusxtfvcwqdflszqjes
   # Forneça WAND_STAGING_PUBLIC_KEY pelo ambiente de execução.
   python3 scripts/homologacao-local.py
   ```
2. Abra `http://127.0.0.1:4180/login.html` dentro do navegador do Codex Cloud. O servidor escuta apenas em loopback. Para validar layout mobile, use a janela do navegador em 390 px ou o modo de dispositivo. A prova com um aparelho físico depende de uma prévia privada autenticada autorizada e verificada para este ambiente. Abrir o desktop remoto pelo celular verifica a interação à distância e não substitui a prova em navegador móvel nativo.
3. Antes do login, confirme no painel Rede que Auth, REST e Storage apontam só para `kcusxtfvcwqdflszqjes.supabase.co`. A cópia temporária verifica referências de produção, desativa o service worker e bloqueia funções e rotas de e-mail pelo CSP. Os recursos JavaScript de biblioteca usam o CDN existente. Para registro de evidências, não exporte tokens, cabeçalhos de autenticação ou URLs assinadas.
4. Entre manualmente com `coach@wand.test`, `aluno-a@wand.test` e `aluno-b@wand.test` em contextos separados. Digite as senhas fictícias somente na tela de login desta prévia ou use um cofre de teste com as variáveis documentadas. Não use senha de produção, convite, recuperação ou troca de senha. Antes de registrar, diferencie autenticação bem-sucedida de uma falha em uma RPC ou relação ainda ausente do recorte.
5. Use um sufixo QA único em cada execução, horários e medidas sintéticos e um rascunho próprio por cenário. Os testes pela interface persistem dados em homologação. Registre os IDs para conferência posterior. Uma repetição no mesmo dia pode ser impedida pela regra de Treinos. Não apague registros de outras rodadas.

## Matriz desktop e mobile

Para cada linha, valide a visão indicada, registre a largura ou modelo do aparelho, o tema, a ação e o resultado. Use **1280 px** no desktop e **390 px** no mobile. Em ambos, repita os controles principais em escuro e claro e teste recarga, foco visível, retorno contextual e ausência de rolagem horizontal. No mobile, confirme que a ilha não encobre a última ação e que o teclado não impede o envio de formulários. No desktop, teste Tab, Enter e Escape onde aplicável. Compare a ilha e a hierarquia com a aprovação visual.

| Fluxo | WandCoach | Aluno A e controle B |
| --- | --- | --- |
| Auth, painel e navegação | Entrar, verificar papel, abrir ilha, atalhos e subrota direta, recarregar, voltar e sair. | A e B chegam ao painel próprio. Acesso direto às telas administrativas é negado. Após sair, páginas protegidas exigem login. |
| Treinos e WAND EXERCISES | Criar rascunho, buscar exercício, adicionar e desfazer, configurar séries e publicar ficha ou programa. Reabrir biblioteca a partir da montagem e conferir o retorno com dados preservados. | A vê só a ficha ativa, inicia a sessão, registra carga e repetição, interrompe e retoma no mesmo dia, conclui e abre o histórico. B não vê o treino e não pode abrir ou modificar a sessão. Verificar limite diário e rejeição de ficha fora da validade. |
| Alunos, Minha Ficha e privacidade | Abrir aluno por modalidade, recarregar, voltar à lista de origem, cadastrar e alternar estado de um cadastro QA. | A atualiza campo fictício autorizado, recarrega e consulta a autorização registrada. B não pode ler ou alterar A. Conferir foco, rascunho de formulário e reconhecimento do sucesso. |
| Anamnese e Minha Jornada | Criar pendência ou encontrar a resposta pelo perfil, consultar após envio e voltar à lista. | A percorre o fluxo previsto de aceite e autorização de dados, responde, recarrega e conclui. B não consulta o registro. Negar início sem autorização. |
| Avaliações e Minha Evolução | Solicitar medidas, revisar, liberar parecer e consultar a evolução. Solicitar fotos, abrir resultado por aviso e verificar análise postural com rascunho e parecer. | A envia medidas fictícias. Vê o resultado liberado, mas não o rascunho. Foto depende de consentimento e pedido pendente. B não lê dados, fotos nem avisos de A. Confirmar estado persistido após recarga. |
| Bem-estar, Check-ins e Saúde Feminina | Acompanhar check-in, verificar compartilhamento concedido e revogado, aprovar adaptação individual e retornar à origem. | A registra check-in e ciclo fictício, testa calendário e recarga. Compartilhamento explícito controla a visibilidade para o coach. B não acessa os registros. A vê a adaptação aprovada, preservando o treino original. |
| Contratos, propostas e relatórios | Conferir ordem da central, criar proposta interna, confirmar pagamento fictício e ativar após aceite. Criar relatório, salvar rascunho, publicar e voltar. | A aprecia e aceita proposta fictícia e vê relatório publicado. B não acessa nenhuma das duas entidades. A não vê relatório em rascunho. |
| Notificações e WAND LEGACY | Abrir aviso de avaliação pelo destino correto e marcar leitura. Verificar níveis, detalhe, regra e reconhecimento. Validar crédito ou decidir resgate fictício. | A vê os avisos próprios, saldo, nível e recompensa. Testar tentativa repetida de resgate e estorno. B não vê aviso nem saldo de A. |
| Layout e atalhos | Verificar cabeçalhos, cartões 3D, níveis dourados 0–1 e níveis prateados 2+, ícones dourados, confirmação e ilha. | Repetir as mesmas verificações, conferir preferência de tema ao recarregar e voltar de acesso direto. |

## Integrações com controles separados

- **Auth real.** Digitar apenas as senhas fictícias no runtime privado. No DevTools, confirmar a referência da API, login com senha, renovação de sessão e logout. Se usar a automação do [guia de homologação](homologacao-isolada.md), ela deixa um treino identificado como QA e está fixada ao destino isolado. Registrar códigos de resposta sem registrar o conteúdo secreto.
- **Storage privado.** Após o login, usar três imagens criadas para teste e caminhos exclusivos no bucket `avaliacoes-fotograficas`. Com A, testar upload com consentimento e solicitação e gerar URL com prazo curto. Com B, testar listagem, assinatura e exclusão negadas. Verificar leitura antes do vencimento e negativa após expirar, em sessão isolada. Excluir os arquivos fictícios pela API de Storage com a identidade autorizada e confirmar o resultado. Não usar DELETE em `storage.objects`. As evidências devem ocultar os tokens das URLs.
- **E-mail.** A versão isolada bloqueia as rotas de envio no cliente. Para testar entrega, primeiro confirmar no servidor um coletor exclusivo que rejeite destinatários fora de `wand.test`, com credenciais e remetente de teste. Usar somente o coletor com a função de homologação e verificar a negativa usando endereço sentinela fictício. Só depois testar proposta, convite ou recuperação. Não configurar Resend, remetente, SMTP ou serviço de produção. Enquanto o coletor estiver ausente, validar apenas a parte interna de contratos e notificações.
- **Push.** O service worker e as funções externas estão desativados na prévia. Reserve uma origem privada e uma inscrição descartável, com chaves VAPID exclusivas e um coletor de teste. Verifique a negativa de inscrição alheia e ensaie com uma notificação sintética. Somente após confirmar isolamento permita uma entrega ao dispositivo de teste autorizado. Retire a inscrição descartável ao acabar.

## Evidências e liberação

Registre commit, projeto observado, perfil, data, largura, tema, resultado, IDs QA e defeitos com passos para reproduzir. Status separados para SQL, automação no navegador, interface real e entrega externa. A migração candidata de autorização precisa de revisão e aprovação de release antes de qualquer aplicação remota. Um teste que dependa de Auth, arquivo ou coletor indisponível permanece pendente. Nenhuma prévia pública ou publicação é necessária para este roteiro.

### Verificações já executadas

- O frontend temporário passou pela conferência do Auth da homologação. No Chromium, a tela de login carregou a 390 e 1280 px sem rolagem horizontal. A CSP bloqueou, antes de qualquer requisição, chamadas à produção, recuperação de senha e função de e-mail. Nenhuma credencial de usuário foi usada.
- A migração candidata `20261127230708_wand_restringir_autorizacao_painel_coach.sql` consolida 12 funções e quatro políticas. Exige papel administrativo nos fluxos do coach, vínculo na consulta de status das sessões e limita a consulta de elegibilidade de contrato. Foi executada apenas em banco descartável sobre as definições anteriores. Passaram as negativas de acesso de outro aluno e os ensaios positivos de Bem-estar, adaptação, contratos, gestão, ficha, relatórios e Legacy. A suíte do projeto passou 41 de 41 com PGlite.
- Login real, operação de arquivos pela API, e-mail, push, UI autenticada e mobile físico permanecem pendentes.

### Reteste manual do parecer postural

Abra a [prévia privada no navegador do Codex Cloud](http://127.0.0.1:4180/login.html). Se a sessão do ambiente tiver sido encerrada, reinicie o servidor pelo procedimento acima. O endereço de loopback é do desktop do Codex Cloud.

1. Como WandCoach, abra a Análise Postural de A, que possui vínculo por treino, e salve um rascunho com um texto identificado. Recarregue e confirme que o rascunho foi recuperado.
2. Em outro contexto, entre como A e abra **Minha Evolução Física → Evolução corporal → Pareceres posturais**. Confira que o rascunho não aparece. Já existe o parecer fictício `QA a519d51228` para conferir a leitura.
3. Publique como WandCoach. Como A, reabra a seção e confirme a data, o relatório, as prioridades e a estratégia. Recarregue, retorne pelo botão contextual e confira o histórico publicado.
4. Entre como B e confirme que o parecer de A não aparece. Repita a leitura e a navegação nos temas claro e escuro a 1280 e 390 px. Confira foco, expansão por teclado e espaço acima da ilha inferior.
