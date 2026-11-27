# WAND EXERCISES — protocolo de demonstrações anatômicas

Consulte este documento antes de criar, editar ou atualizar exercícios. Cada variação precisa de ficha técnica, arquivos-fonte editáveis, registro de licença quando houver recursos externos, revisão visual e aprovação biomecânica pelo personal. Preserve exercícios já prescritos, seus IDs, GIFs originais e o acesso pelas telas de biblioteca e treino.

## Padrão vigente — vídeo por exercício e personagem

A produção de vídeos próprios está suspensa temporariamente. Preserve os originais, protótipos e trabalhos associados. A biblioteca será ampliada com vídeos externos curtos no player oficial do YouTube, com prévia, link de origem e edição de mídia sem trocar o ID de exercício. O [lote de 20 exercícios](wand-exercises-lote-youtube.md) aguarda aprovação biomecânica antes de produção. As diretrizes abaixo ficam disponíveis para a retomada dos vídeos próprios.

Novos lotes entram em **Exercícios pendentes de revisão**, na biblioteca do WandCoach. Cadastre com `status_revisao = 'pendente'` e `ativo = false`. A consulta da fila é administrativa e paginada. O catálogo oficial conta itens ativos e a fila tem contagem própria. Aprovar ativa o mesmo registro. Rejeitar mantém o registro inativo. A migração inicial contém os 20 primeiros candidatos e reaproveita a tabela, o controle administrativo e os vínculos existentes. O arquivo SQL anterior do lote é histórico.

Antes de carregar outro lote, compare os nomes normalizados e os links com o catálogo e com os lotes anteriores. Informe os músculos primários e secundários, equipamento, orientações e mídia. O banco impede nomes repetidos entre itens ativos ou pendentes e bloqueia o uso de itens pendentes ou rejeitados na prescrição. Valide a revisão, as permissões e a atualização dos contadores num ambiente de teste antes de aplicar em produção.

As substituições de mídia dos exercícios ativos ficam em outra fila. Preserve a mídia atual até o aceite e atualize apenas o link e a fonte de mídia no mesmo cadastro. O YouTube é a fonte temporária das demonstrações novas e aprovadas. Retenha os GIFs originais e todo o projeto de animação. Veja os [10 candidatos e o procedimento de reversão](wand-exercises-publicacao.md).

Produza um MP4 fluido por exercício e por personagem oficial, com pelo menos uma repetição inteira por câmera fixa e cortes entre repetições. Escolha os ângulos pela técnica e musculatura. As vistas anterior, lateral e posterior devem respeitar os eixos anatômicos. Preserve personagem, roupa preta, fundo preto, acabamento prateado, destaques dourados, equipamento, pegada, apoios, trajetória, ritmo, postura e escápulas em todos os cortes. A produção pode ser 2D, 3D renderizada ou outra técnica que preserve esses critérios.

Use H.264, no mínimo 720p, 30 fps quando a sequência realmente for fluida, sem áudio e com compressão adequada. Extraia a prévia do vídeo aprovado. Carregue somente a prévia até o usuário tocar. Ao abrir, o vídeo começa e repete. Ofereça pausa, velocidade, tela cheia e fechar. Use o componente compartilhado na biblioteca e no treino, preservando o estado do treino. Verifique Android, iOS e desktop antes da aprovação.

O piloto é a remada curvada, com versões feminina e masculina. Priorize lateral para a trajetória e inclinação do tronco e posterior para as costas e a simetria. Submeta os dois vídeos à revisão visual e biomecânica antes dos outros nove. Os GIFs de referência têm duas poses por arquivo. O protótipo 3D anterior usa modelos rejeitados para esta finalidade. Esses arquivos permanecem arquivados e o refinamento MakeHuman fica suspenso. Uma conversão simples ou uma interpolação sem validação de pegada e equipamento não atende ao piloto.

O componente compartilhado está em `wand-exercise-videos.js` e é chamado pela biblioteca e pelo treino por meio de `wand-exercise-media.js` quando há mídias aprovadas. O catálogo de vídeos fica vazio até a aprovação do piloto. As demonstrações existentes permanecem disponíveis.

### Produção audiovisual da remada

O [piloto de transferência de movimento](../prototipos/wand-exercises/remada-motion-control.md) prioriza Kling Motion Control, com Viggle Mix como alternativa. A documentação cobre filmagem, ficha, comparação comercial e critérios de revisão. A produção continua restrita à remada e ao ambiente de testes.

O fluxo de reprodução está aprovado como base funcional. O trabalho desta etapa é audiovisual. Foram inspecionados os quatro GIFs da remada e os oito quadros de referência da biblioteca. Cada GIF tem duas poses com 1,45 s de exibição por pose. Os planos existentes são frontal e três quartos posterior. Eles orientam aparência, paleta e extremos do gesto. Para o piloto, são necessários novos desenhos ou novas tomadas em posterior e lateral ortogonais.

A rota 2D proposta usa uma gravação de referência do movimento, com câmera fixa e enquadramento de barra, mãos e pés, e redesenho quadro a quadro em Krita. Mantenha corpo, mãos e barra em camadas revisáveis. Marque início, subida, topo e descida a partir da gravação e desenhe os intermediários de acordo com as articulações e a trajetória observadas. Revise cada plano com o personal antes de unir uma repetição completa por vista. Exporte os quadros PNG, monte o corte após o retorno à posição inicial e gere o MP4 e a prévia com FFmpeg. [Animação no Krita](https://docs.krita.org/en/user_manual/animation.html) · [Exportação](https://docs.krita.org/en/reference_manual/render_animation.html) · [Licença](https://krita.org/en/about/license/).

O gerador disponível nesta sessão produz imagens isoladas. FFmpeg serve à montagem e à codificação. Nenhum deles fornece continuidade anatômica a partir das imagens atuais. O adaptador identificado localmente foi Intel Iris Xe e não foi confirmado suporte CUDA para os modelos testáveis por linha de comando. Wan2.1 FLF2V permite experimentar geração condicionada por dois quadros em uma máquina com GPU compatível. A licença dos pesos é Apache 2.0. A geração precisa ser revisada por tomada, pois os quadros condicionantes não travam mãos, barra ou pés. [Modelo Wan2.1 FLF2V](https://huggingface.co/Wan-AI/Wan2.1-FLF2V-14B-720P) · [Fluxo ComfyUI](https://github.com/Comfy-Org/docs/blob/main/tutorials/video/wan/wan-flf.mdx).

A produção aguarda quadros intermediários desenhados sob controle ou tomadas que passem na revisão de identidade e biomecânica. Nenhum MP4 novo foi produzido nesta etapa.

## Histórico — produção 3D e apresentação anteriores

As prescrições de tecnologia e de reprodução das seções abaixo descrevem etapas arquivadas. As regras biomecânicas, as fichas e o inventário de fontes continuam como referências.

- Registre nome e variação, equipamento, posições inicial e final, pés, mãos, orientação e largura da pegada, articulações e movimentos, caminho da resistência, amplitude, fases concêntrica e excêntrica, apoios e estabilização, agonistas, sinergistas, estabilizadores e particularidades. Descreva a execução escolhida sem impor amplitude, carga ou postura universais.
- Compartilhe articulações, superfícies musculares, equipamentos, iluminação e câmeras entre as animações. Use uma única animação por exercício e preserve a fonte, as dependências e a receita de exportação. Mantenha o equipamento rígido e mãos vinculadas às empunhaduras. Verifique contato, deslizamento, atravessamento, dedos e alinhamento de punhos. Pegadas pronada, neutra, supinada e mista preservam a orientação definida para cada mão, inclusive quando abertas ou fechadas. Só altere a orientação se a técnica da variação e o equipamento permitirem, como na rosca alternada com supinação ou no desenvolvimento Arnold.
- Preserve apoios de pés e contato com bancos e máquinas. Verifique cabeça, coluna, tronco, pelve, joelhos, cotovelos e punhos, respeitando a movimentação escapular normal. Use modelos feminino e masculino à escolha, sem usar dados do perfil. Mantenha corpo prateado, fundo preto, luz uniforme e equipamento proporcional. Destaque primários em dourado intenso e secundários em bronze ou dourado suave. Registre estabilizadores à parte. Use as mesmas marcações em todas as vistas.
- Justifique vistas pela trajetória, musculatura, articulações, pegada e obstruções. Como ponto de partida, costas, posteriores da coxa, glúteos e panturrilhas priorizam posterior e lateral. Peitoral, bíceps, quadríceps e abdômen priorizam anterior e lateral. Tríceps começa pela lateral e complementa com anterior ou posterior. Ombros dependem da variação. Uma terceira ou quarta vista deve trazer informação nova.
- O visualizador único abre na vista inicial escolhida pela ficha e permanece nela até o usuário interagir. Use azimutes 0°, 90°, 180° e 270° para anterior, lateral direita, posterior e lateral esquerda. A órbita livre aceita ângulos intermediários, toque e mouse, zoom e retorno ao enquadramento inicial. Preserve fase, pausa e velocidade na troca de perspectiva. Remova seletores de tecnologia, cortes, rotação e alternância automáticos.
- Mostre primeiro uma imagem otimizada extraída da animação aprovada, com botão central. Carregue o visualizador sob demanda e libere seus recursos no fechamento, retornando à mesma tela. Use MP4 H.264 720p, 30 fps, sem áudio e em repetição como alternativa automática, preservando a fase ao trocar de vista quando possível. Mantenha os arquivos legados e a identidade global nos dois temas. Reuse o mesmo componente na biblioteca, prescrição, criação, edição, Meus Treinos, execução e treinos presenciais assistidos, sem modificar as séries, cargas, repetições, cronômetros, histórico e progresso.
- Reutilize as bases, gere quadros localmente a partir da animação e renderize por exercício e vista. Registre arquivos concluídos, resultados e bloqueios. Retome o lote pelos arquivos faltantes ou interrompidos. Corrija isoladamente o exercício afetado. Antes de aprovar, revise anatomia, apoios, pegada, amplitude, trajetória, escápulas, colisões, deformações, equipamento, cores, enquadramento, sincronização, continuidade, qualidade e desempenho móvel. Classifique dúvidas como pendentes. A execução demonstrada deve ser aprovada pelo personal.

## Auditoria do lote existente

O catálogo tem dez exercícios mapeados, com dois modelos e duas vistas por exercício. Os 40 GIFs existentes usam duas poses raster por arquivo, em repetição. Esse material permite comparar posições extremas, mas a trajetória, sincronização entre vistas, contato ao longo da repetição e orientação contínua dos punhos requerem revisão em uma animação 3D. Vistas legadas em três quartos precisam ser distinguidas das ortogonais.

| Exercício | Ponto de revisão dos arquivos legados |
|---|---|
| Agachamento livre | Lateral para barra, quadril e tronco. Anterior para alinhamento joelho-pé. Conferir apoios e profundidade da variação. |
| Crucifixo com halteres | Conferir pegada neutra nos dois extremos e ao longo de todo o arco. Verificar a leitura do eixo do banco na vista anterior. |
| Puxada frontal | Revisar a lateral oblíqua, a visibilidade das duas mãos e a descida da barra à frente do corpo. |
| Rosca direta com barra W | Conferir mão nas curvas da barra, pegada semissupinada constante e posição dos cotovelos. |
| Supino reto com barra | Revisar o alinhamento da lateral, a trajetória da barra em relação ao peito e o contato com banco e chão. |
| Tríceps na polia | Conferir pegada pronada, extensão dos cotovelos, caminho do cabo e estabilidade do tronco. |
| Elevação lateral com halteres | Conferir alinhamento das mãos, ângulo do braço em relação ao tronco e destaque do deltoide. |
| Panturrilha em pé | Enquadrar o apoio do antepé e a elevação do calcanhar. Priorizar posterior e lateral para leitura do movimento. |
| Remada curvada com barra | A lateral legada oblíqua dificulta a leitura do tronco e da barra. Revisar pegada, aproximação da barra e escápulas no piloto. |
| Desenvolvimento sentado com halteres | Conferir antebraços e pegada pronada contínua. A lateral pode ocultar a mão mais distante. |

Todos os GIFs e vínculos foram preservados. Os nove exercícios fora do piloto permanecem pendentes de migração para 3D e aprovação.

## Ficha do piloto — remada curvada com barra reta

| Aspecto | Variação demonstrada |
|---|---|
| Equipamento | Barra reta com anilhas rígidas. Pés no chão, sem banco. |
| Base | Pés sob os quadris, joelhos ligeiramente flexionados, quadril para trás, tronco inclinado e cabeça alinhada à coluna. |
| Mãos | Pegada bilateral pronada, um pouco mais larga que os ombros do protótipo. Posições fixas na barra com separação de 0,52 unidade da cena. |
| Posição inicial | Barra suspensa abaixo do tronco, cotovelos próximos da extensão, sem travar. |
| Posição final | Barra próxima à região inferior do tronco, cotovelos flexionados e dirigidos para trás. Amplitude representativa, sujeita à revisão do personal. |
| Articulações e resistência | Extensão de ombro e flexão de cotovelo na subida. Retorno controlado pelas mesmas regiões. A barra sobe e se aproxima do tronco, sem balanço. A movimentação escapular do protótipo depende de ajuste e revisão visual. |
| Fases | Repetição de quatro segundos com subida de 1,4 segundo e descida de 2,6 segundos. Esse ritmo pertence ao piloto. |
| Estabilização | Pés apoiados, inclinação de tronco e posição da pelve mantidas. Revisar cabeça, joelhos, punhos e escápulas na avaliação técnica. |
| Músculos | Latíssimo do dorso em destaque primário. Flexores de cotovelo representados pela região do bíceps em bronze. Trapézio médio, romboides e deltoide posterior participam do movimento e precisam de delimitação individual no modelo final. Eretores da coluna e musculatura do tronco ajudam a sustentar a posição, sem receber automaticamente cor de sinergista. |
| Vistas | Lateral direita principal para observar barra e inclinação do tronco. Posterior complementar para braços, costas e simetria. Anterior para largura da pegada e lateral esquerda para observar o outro braço. |

As referências de exercício e biomecânica ajudam a orientar a revisão da ficha. [ACE — Bent-over row](https://www.acefitness.org/resources/everyone/exercise-library/12/bent-over-row/) · [Fenwick, Brown e McGill — comparação de exercícios de remada](https://pubmed.ncbi.nlm.nih.gov/19197209/).

## Implementação e reprodução

O piloto isolado em `prototipos/wand-exercises` usa uma cena procedural em Three.js, um relógio comum com cinemática dos braços, equipamentos rígidos e pontos de contato incorporados à barra. O código da cena e a função do movimento são as fontes editáveis. A órbita usa OrbitControls. Os filtros permitem ver os destaques juntos ou por grupo. Identificação de músculos individuais, malha anatômica detalhada e validação completa de deformações e colisões seguem em aberto. O protótipo usa geometria própria e aproximações visuais dos músculos.

Blender não estava instalado no ambiente. Pode ser usado em seguida para modelagem, pesos e revisão anatômica, mantendo o arquivo editável e exportando GLB/glTF para o visualizador. O piloto ainda não usa um arquivo GLB, nem usa modelos anatômicos de terceiros. Three.js usa licença MIT. FFmpeg é uma dependência local de renderização e seu executável não integra o material publicado. Confira a licença e a procedência de cada futuro modelo, textura ou equipamento antes de incluir o recurso. [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html) · [Three.js e exportação glTF](https://threejs.org/docs/pages/GLTFExporter.html) · [FFmpeg e codecs](https://ffmpeg.org/ffmpeg-codecs.html).

```powershell
npm ci --prefix prototipos/wand-exercises
npm test --prefix prototipos/wand-exercises
node prototipos/wand-exercises/browser-check.mjs
npm run start --prefix prototipos/wand-exercises
npm run render --prefix prototipos/wand-exercises
npm run render --prefix prototipos/wand-exercises -- lateralDireita
```

Abra `http://127.0.0.1:4176/`. Use `?sem3d` para conferir o vídeo. Se o vídeo estiver indisponível, o visualizador informa a condição e mostra um quadro arquivado. A renderização usa Chrome local e FFmpeg. Os caminhos podem ser definidos com `WAND_CHROME` e `WAND_FFMPEG`. As oito saídas MP4 somam cerca de 580 KB. A exportação aceita seleção de vista para repetir apenas o necessário.

A geometria foi verificada em 121 amostras do ciclo. O Chrome passou nos testes de abertura, órbita, repetição, troca de vista e fechamento em 1280 × 900 e 390 × 844 com toque emulado. O teste sem WebGL verificou o vídeo em 720p, a pausa e a posição ao trocar a vista. Falta medir fluidez em aparelhos físicos e verificar Safari do iOS.

O piloto fica em ambiente local. A aprovação técnica e visual da remada é a próxima etapa, antes de aplicar a arquitetura aos demais exercícios. App publicado e banco de dados permanecem fora deste piloto.

## Padrão definitivo e estado dos personagens

Os dois personagens precisam reproduzir as referências aprovadas com proporções naturais, articulações, dedos detalhados, musculatura individualizada e acabamento prateado. Use dourado brilhante para primários e fosco para secundários. A prévia oficial deverá ser exportada da própria animação aprovada. Os arquivos atuais são imagens raster, sem malha, esqueleto ou pesos recuperáveis. A tela local usa a referência arquivada como prévia temporária e identifica a malha esquemática quando o usuário abre o teste técnico.

O MakeHuman pode servir de base de superfície. Os ativos centrais e as exportações oficiais têm licença CC0. A licença de recursos externos é verificada por arquivo. A ferramenta não entrega automaticamente a aparência aprovada nem as camadas musculares e o rig específico da remada. Nenhum modelo externo foi incorporado ou adquirido. [Licença oficial do MakeHuman](https://www.makehumancommunity.org/about/license.html).

O componente local abre o visualizador só após interação e descarta a instância ao fechar. A integração com telas do aplicativo, as prévias oficiais, os dois personagens e a revisão dos outros nove exercícios aguardam os modelos e a aprovação do piloto.

## Obtenção dos personagens definitivos

O funcionamento da prévia está aprovado. A inspeção do checkout não encontrou arquivos-fonte de personagens em BLEND, FBX, GLB, glTF ou OBJ. As imagens aprovadas orientam silhueta, proporções, acabamento, roupas e cores. Elas não fornecem geometria observável em todos os ângulos, topologia, músculos separados, esqueleto ou pesos de deformação. Blender não foi encontrado no PATH nem na instalação padrão de programas do ambiente.

| Caminho | Licença, custo e adequação |
|---|---|
| Modelagem sob medida em Blender a partir das referências | Blender é gratuito, sob GPL, e pode produzir arquivos comerciais. A escultura e o rig exigem trabalho especializado, com valor sob orçamento. É o caminho recomendado para reproduzir a identidade visual com controle de proporções e materiais. [Blender](https://www.blender.org/about/license/) |
| Base de superfície MakeHuman | Ativos centrais e exportações oficiais sob CC0, sem custo de licença. Pode acelerar a modelagem dos dois corpos. Exige escultura, musculatura individualizada e ajustes do rig para a remada. [MakeHuman](https://www.makehumancommunity.org/about/license.html) |
| Atlas Z-Anatomy | Modelo masculino anatômico gratuito sob CC BY-SA 4.0. Pode orientar a revisão das estruturas. A incorporação de adaptações distribuídas exige atribuição e compartilhamento sob licença compatível. O repositório verificado não fornece o par feminino e masculino pronto para o exercício. [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) · [Creative Commons](https://creativecommons.org/licenses/by-sa/4.0/) |
| Écorché Musclenames Female & Male Anatomy | Os dois corpos são anunciados em OBJ, formato que não entrega esqueleto e pesos. Preços exibidos de US$ 25 na licença Standard e US$ 250 na Extended Commercial. A primeira limita vendas ou visualizações. Antes de comprar, confirmar expressamente com o titular as condições para servir malhas adaptadas ao navegador em um PWA. Exige rig e adaptação visual. [Anúncio](https://www.artstation.com/marketplace/p/OyP7o/corch-musclenames-female-male-anatomy) · [Termos](https://www.artstation.com/marketplace-product-eula) |

### Escopo para modelagem ou contratação

1. Entregar dois arquivos-fonte BLEND editáveis e duas exportações GLB para navegador, com malha deformável, esqueleto e pesos, materiais e texturas, regiões musculares separadas ou máscaras nomeadas por músculo. Documentar dependências e direitos para adaptar, animar, renderizar e distribuir pelo PWA. Solicitar poses neutras nas vistas anterior, posterior e laterais para revisão visual dos dois corpos.
2. Usar proporções, silhueta e acabamento das imagens aprovadas, incluindo mãos detalhadas, prata no corpo, ouro intenso nos primários e ouro fosco nos sinergistas. Revisar a qualidade de escápulas, ombros e cotovelos na transição entre as duas poses. Usar o atlas como referência anatômica quando útil.
3. Validar em ambos os corpos uma repetição da remada, com pés estáveis, pegada pronada sem mudança de largura, mãos em contato contínuo com a barra e revisão visual de atravessamentos. Preservar órbita, vistas, zoom e velocidade. Extrair a prévia e os vídeos de compatibilidade da mesma cena aprovada.

Nenhum recurso externo foi comprado ou instalado nesta etapa. O padrão aprovado depende da entrega e da validação das duas malhas articuladas. A próxima apresentação visual é dos personagens candidatos ao padrão definitivo.

### Primeira base masculina em Blender

A fase seguinte produziu `prototipos/wand-exercises/modelagem/masculino-base.blend` e três vistas ortográficas, anterior, posterior e lateral direita. O arquivo contém a malha paramétrica MPFB com 19.158 vértices de origem, 163 ossos, pesos de deformação e acabamento prateado. Ao reabrir o arquivo, a rotação de um osso do antebraço alterou a malha avaliada. Essa verificação estrutural precede os testes de deformação nas poses da remada.

O ambiente não tinha Blender nem MakeHuman autônomo nas instalações verificadas. Foi usado Blender 4.5.3 LTS portátil, obtido do distribuidor oficial com verificação SHA-256. A extensão MPFB 2.0.18 foi empacotada a partir do repositório oficial e instalada apenas na configuração isolada da ferramenta de desenvolvimento. O MPFB gera a malha sem depender do aplicativo MakeHuman autônomo. A extensão usa GPL e os ativos centrais usados na base usam CC0. [Blender portátil](https://www.blender.org/releases/4-5/) · [MPFB](https://extensions.blender.org/add-ons/mpfb/) · [Licença dos ativos](https://www.makehumancommunity.org/about/license.html).

A base humana é aproveitável para refino, mas o controle paramétrico de musculatura produz volume geral. O padrão visual aprovado ainda exige esculpir ombros, peitorais, braços e costas contra as referências, ajustar a silhueta e o vestuário, separar e nomear máscaras ou malhas por músculo e aplicar os dois tons de dourado. Depois, revise pesos e deformações em ombros, escápulas e punhos nas duas poses da remada. O script `gerar_masculino.py` recria a base com a extensão habilitada no repositório local `user_default`. Nenhuma animação foi adicionada e o visualizador e a biblioteca seguem como estavam.

### Refino masculino para revisão visual

A base articulada foi aprovada para desenvolvimento. A aparência segue em revisão. `masculino-refinado.blend` preserva a base original e acrescenta uma chave de forma editável com volume e contornos localizados. A malha possui 13 máscaras independentes que acompanham a deformação. O material tem um controle primário e outro secundário, de 0 a 1, por região. Por padrão, ambos ficam desligados. As imagens de demonstração usam o peitoral na vista anterior e o latíssimo na vista posterior, com auxiliares em dourado fosco. Os tênis preliminares são malhas separadas, vinculadas aos ossos dos pés. O short é representado por uma região de material sobre a malha.

A comparação dos arquivos reabertos verificou os 163 ossos, as matrizes de repouso, a hierarquia e os pesos idênticos. O ensaio rotacionou isoladamente ossos do braço, antebraço, coxa e perna. Em cada caso, a malha deformou com o mesmo número de vértices avaliados e coordenadas finitas. Esse ensaio não verifica colisões ou a qualidade das deformações da remada em movimento.

As máscaras representam contornos superficiais estimados. Para o acabamento definitivo, ainda é necessário revisar manualmente em Blender suas origens, inserções e transições, especialmente entre deltoide e peitoral, entre dorsal e trapézio e nos contornos da coxa. O short precisa de uma malha própria para reproduzir costuras e caimento, e o calçado precisa de detalhes na parte superior. Preserve a estrutura de animação e aguarde a aprovação visual antes de iniciar o personagem feminino ou novas animações.

### Revisão de método após a comparação visual

A prancha `comparacao-masculino-referencias.jpg` compara o refino anterior com os quadros masculinos de rosca direta, agachamento e puxada frontal. Os quadros legados têm poses, luzes e enquadramentos distintos. A referência posterior está em três quartos. Na frente, o modelo atual perde os limites entre peitoral, deltoide e abdômen. Na lateral, a silhueta de braço, quadríceps e panturrilha tem menos relevo. Nas costas, faltam as transições entre trapézio, dorsal e ombro posterior. O ouro acompanha as zonas suaves do script e herda seus limites difusos.

A deformação por funções elípticas pode ajustar volumes gerais, mas não descreve origens, inserções ou continuidade dos músculos em uma superfície articulada. Interrompemos o uso dessa técnica como acabamento visual. O arquivo `masculino-preparacao-escultura.blend` abre com uma cópia paramétrica em repouso, com três níveis Multires e a deformação elíptica desativada nessa cópia. A malha animável, seu vínculo e os 163 ossos permanecem na mesma cena. Essa cópia serve para escultura e não foi integrada ao visualizador.

O próximo trabalho visual é esculpir os volumes e sulcos visíveis em vários ângulos, revisar a silhueta e pintar as máscaras de cor seguindo a escultura. O mapa de normais transfere detalhe fino para a malha animável no navegador. Deslocamento pode complementar a escultura ou a renderização quando for necessário mudar o relevo real. Nenhum dos mapas cria sozinho os contornos anatômicos. Use o atlas Z-Anatomy como referência visual, sem incorporar sua malha nesta etapa. Qualquer incorporação futura deve registrar atribuição e obrigações CC BY-SA. [Multires e bake no Blender](https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/multiresolution.html) · [Preparação para escultura no MPFB](https://github.com/makehumancommunity/mpfb2/blob/master/docs/ui/operations/sculpt.md) · [Atlas Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy).

Na nova pintura, separe deltoide anterior, lateral e posterior, trapézio superior, médio e inferior, peitoral maior, latíssimo, bíceps, braquial, tríceps, extensores e flexores do antebraço, reto abdominal, oblíquos, glúteo máximo e médio, quadríceps visíveis, posteriores mediais e laterais, gastrocnêmio e sóleo quando visível. Mantenha seleção independente por lado quando o exercício exigir. A delimitação precisa deve ser conferida nas poses, com ouro brilhante para primários e fosco para secundários. Modele short preto como peça separada com pesos e tênis esportivos pretos como geometria própria. Valide áreas de flexão, sobreposição de roupa e firmeza da pegada antes de exportar. Esse estágio ainda não está concluído.
