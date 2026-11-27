# WAND METHOD — desenvolvimento pelo Codex Cloud

## Ambiente reutilizável

O aplicativo é um PWA estático. O repositório contém o HTML, o JavaScript, os estilos, o manifesto, o service worker, as mídias usadas pelo aplicativo e a suíte padrão. O GitHub Actions usa Node.js 22 em Ubuntu. A suíte padrão roda sem instalar pacotes ou conectar ao Supabase.

1. No ChatGPT web ou desktop, abra **Configurações → Codex Cloud → Ambientes → Criar ambiente**. Conecte a sua conta GitHub e selecione somente `wanderleycs10-lab/Wand-method`.
2. Dê ao ambiente o nome **WAND METHOD** e selecione **Somente eu**. Peça Node.js 22, de acordo com `.nvmrc`. No script de instalação, use `node scripts/codex-setup.mjs` quando a branch escolhida já contiver o arquivo. Se o assistente de ambiente iniciar em `main`, que ainda pode não incluir o script, instrua-o a validar Node.js 22 com `node --version` e a usar o comando de testes abaixo.
3. Mantenha o acesso de rede restrito e os segredos vazios para a suíte padrão. Revise a configuração e selecione **Publicar ambiente**. Essa ação disponibiliza a configuração reutilizável do Codex na sua conta.
4. No celular, abra **Codex**, selecione esse ambiente e indique a branch `dev/design-system-global` para retomar a padronização. Para novas tarefas independentes, comece em uma branch de desenvolvimento baseada em `origin/main`.

Primeira tarefa sugerida para validar a conta: “Abra `wanderleycs10-lab/Wand-method` na branch `dev/design-system-global`. Leia `AGENTS.md` e `docs/design-system-progresso.md`. Confirme o commit, execute os testes e reporte os resultados, sem editar arquivos nem publicar.”

Fonte: [Configuração de ambientes do Codex Cloud](https://learn.chatgpt.com/docs/environments/cloud-environments).

## Testes e prévia

```sh
node --version
node scripts/codex-setup.mjs
node --test tests/*.test.mjs
```

- A linha de base da branch de padronização tem quatro falhas conhecidas em fotografia. Três são de verificações estáticas do fluxo e uma é de expressão regular inválida na suíte de sintaxe. Um teste de banco fica ignorado na execução padrão. Consulte [a linha de base e o checklist](design-system-progresso.md).
- Para executar também o teste isolado do WAND LEGACY, instale a versão `0.6.0` de `@electric-sql/pglite` em uma pasta temporária, fora do repositório. Execute `WAND_LEGACY_PGLITE=/caminho/temporario/node_modules/@electric-sql/pglite node --test tests/legacy-progressao.test.mjs`. Esse teste utiliza banco descartável em memória.
- Para inspecionar o HTML em um navegador no mesmo ambiente, use `python3 -m http.server 4176 --bind 127.0.0.1` em um checkout sem arquivos privados. A porta é interna ao ambiente. Para fluxos autenticados, use respostas simuladas e dados fictícios ou um Supabase de testes já autorizado. As páginas atuais inicializam o cliente Supabase de produção, então apenas servir o HTML localmente não isola os dados.
- Testes de navegador anteriores usaram Chrome no Windows e scripts ignorados do diretório `node_modules`. Eles são evidência local, e ainda não existe uma suíte de navegador portátil no repositório. No Cloud, use o navegador disponível ou prepare Playwright para Linux quando a tarefa exigir automação. Permita apenas os domínios necessários à prévia, como o CDN usado pela página ou o host do projeto de testes.

## Supabase e credenciais

- O conector autorizado no desktop confirmou que o projeto atual está ativo. O acesso do desktop não confirma a disponibilidade do mesmo conector em um ambiente Cloud. A configuração básica independe dele.
- O frontend usa a credencial publicável do projeto. Chaves secretas, senha do banco e credenciais de teste ficam fora do repositório e do navegador. Quando houver uma integração HTTPS de teste, use o cofre pessoal ou um segredo de rede do ambiente Cloud, limitado ao host de testes. Prefira o conector autorizado quando disponível.
- A Edge Function de contratos lê `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` e `WAND_EMAIL_FROM`. Preserve a configuração existente no Supabase. A suíte padrão e o ambiente Cloud não precisam copiar esses valores.
- As migrações versionadas estão em `supabase/migrations/` e há scripts históricos em `sql/`. O repositório não contém uma configuração local do Supabase nem uma base reconciliada para remontar todo o serviço do zero. O histórico remoto contém versões com carimbo diferente para LEGACY, notificações e os quatro exercícios, além de migrações remotas anteriores. Antes de configurar migração remota, concilie o histórico com revisão humana. A instalação e os testes padrão não aplicam SQL nem copiam dados de alunos.

Referência: [Chaves de API do Supabase](https://supabase.com/docs/guides/api/api-keys).

## Arquivos fora do GitHub

| Conteúdo | Destino |
| --- | --- |
| Logos, ícones, GIFs e PDF já usados pelo PWA | Permanecem versionados nos caminhos atuais. Os maiores arquivos rastreados têm cerca de 1,3 MiB. |
| `prototipos/wand-exercises` com fontes, MP4, imagens de referência e modelos Blender | Preservar a pasta local e copiar as fontes para armazenamento privado que você já utilize, antes de retomar o projeto audiovisual exclusivamente pelo celular. Separe a cópia de `node_modules` e ferramentas baixadas. |
| `prototipos/wand-exercises/node_modules` | Cerca de 1,58 GiB de ferramentas, dependências e arquivos auxiliares. A receita do protótipo inclui FFmpeg de Windows e exige adaptação para Linux antes de ser usada no Cloud. Preserve separadamente qualquer artefato próprio guardado ali. |
| `node_modules/wand-design-*`, capturas e scripts de QA | Evidência local. Reproduza os testes na nuvem ou transfira apenas os arquivos necessários, depois de revisar seu conteúdo. |
| Fotos, contratos, dados de alunos, cópias do banco e credenciais | Permanecem nos serviços autorizados ou em armazenamento privado apropriado. O checkout de desenvolvimento usa dados fictícios em testes. |

Foi preparada uma cópia local das fontes do protótipo em `node_modules/wand-exercises-fontes-2026-11-27.zip`, com cerca de 12,4 MiB. Ela inclui as cenas Blender, os scripts e os arquivos de mídia da pasta do protótipo, excluindo dependências instaladas. SHA-256 `4d34e2986fe6d7fba033ad1315b9400e32618877ab2bc921bdce5f3447d1a21b`. O acesso às fontes com o computador desligado depende de copiar esse arquivo para armazenamento privado acessível pelo celular.

## Retomar uma tarefa e publicar

Antes de mudar de dispositivo, registre no repositório a branch, o commit, os testes e a próxima ação. Envie somente os commits necessários para a branch de desenvolvimento. No Cloud, escolha a mesma branch para recuperar o código, leia o registro de progresso e continue a partir dele. Para manter o contexto e as alterações de uma tarefa Cloud existente, reabra a mesma tarefa no celular. Para transferir o trabalho a outra tarefa, registre as mudanças em commit ou PR.

Pelo Cloud é possível executar testes, revisar alterações e abrir PR no GitHub quando a conta tiver acesso. O domínio oficial está associado ao repositório via `CNAME` e respondeu com HTTP 200 a partir de GitHub.com. Confirme a origem de publicação em **GitHub → Settings → Pages** e acompanhe o histórico de deploy. A publicação do aplicativo e eventuais migrações passam pela aprovação do responsável. Confirme a execução, o commit publicado e a resposta do domínio depois de um deploy autorizado. Nenhum fluxo novo de produção é criado por este guia.
