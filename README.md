# MEO Go para TizenBrew – Comando Samsung v2

Módulo **experimental e não oficial** para a Samsung Q60A (Tizen 6.0), com a interface original do MEO Go em `https://tv.meo.pt/pt`.

## O que faz

- Usa o site oficial da MEO, sem criar uma interface ou leitor próprios.
- Adiciona navegação espacial com **setas** e **OK**, seleção com contorno **azul** e scroll vertical/horizontal.
- **Verde**: alterna entre seleção de elementos e cursor livre (setas deslocam o cursor; OK clica).
- **Azul**: abre/fecha painel de diagnóstico de vídeo (HTML5, MSE, EME, AVPlay, user-agent).
- **Voltar**: fecha primeiro o diagnóstico, sai do cursor ou tenta fechar uma janela modal; se não houver nada a fechar, passa a tecla ao site/TizenBrew.
- Em campos de login ou PIN, **OK** procura ativar o campo e o teclado nativo. Não recolhe nem regista credenciais nem PIN.

## Instalação no TizenBrew

1. Cria um **repositório público novo** no GitHub, por exemplo `meogo-tizenbrew`. Não reutilizes o repositório da NOS TV: esse é outro módulo.
2. Coloca `package.json` e `main.js` na **raiz** do novo repositório (podes também carregar este `README.md`).
3. Na Samsung, abre **TizenBrew → Add GitHub Module**.
4. Escreve **teu_utilizador/meogo-tizenbrew** (por exemplo `hwiguel3/meogo-tizenbrew`, caso esse seja o nome do novo repositório) e adiciona-o.
5. Abre **MEO Go - Comando Samsung (v1)**.
6. Nas definições de User-Agent do TizenBrew, começa por **Default**, sem forçar outra versão.

**Importante:** este ZIP é o código-fonte do módulo. Não é um `.wgt` instalável diretamente e não pode ser adicionado à TV com o nome de um repositório GitHub que ainda não existe.

## Testes iniciais recomendados

1. Abre a página e verifica o aparecimento da mensagem `MEO Go v2 | v2 ativa`.
2. Testa as setas, o OK, o scroll e o botão Verde antes do login.
3. Inicia sessão com a tua conta MEO através da página oficial, sem partilhar as credenciais.
4. Tenta reproduzir um canal. Se falhar, carrega no botão Azul e fotografa os resultados técnicos (oculta dados pessoais e URL se tiver parâmetros privados).
5. Se o login redirecionar para um domínio externo, o módulo poderá não controlar essa página até regressares ao MEO Go.

## Limitações

- **Não testado numa Samsung real:** foram verificados apenas a sintaxe JavaScript e o formato do manifesto.
- **Reprodução NÃO garantida:** o motor web integrado do TizenBrew pode não suportar o DRM, codecs, EME ou os mecanismos exigidos pelo player da MEO. O browser nativo Samsung pode comportar-se de forma diferente.
- A MEO indica `tv.meo.pt` para acesso no computador e anuncia compatibilidade com browsers de desktop; **não oferece suporte oficial ao contexto TizenBrew**.
- O módulo não muda os fluxos de streaming, não falsifica licenças DRM, não contorna restrições de subscrição/rede e não armazena credenciais.
- Elementos com UI desenhada em canvas, iframes externos ou controlos não reconhecidos podem exigir o modo cursor.

## Ficheiros

- `package.json`: manifesto TizenBrew (tipo `mods`).
- `main.js`: comportamento da navegação e diagnóstico.
- `README.md`: instruções e limitações.

Versão 0.1.0 – 29/10/2026.
## Atualizacao v0.2.0 – correcao do formulario de login

- Suporte a paginas oficiais de login em subdominios `meo.pt` e `login.telecom.pt` para navegacao com comando apos redirecionamento (quando o TizenBrew injeta o script nessas paginas).
- No campo de **email**, `Baixo` ou `Enter` seleciona diretamente o campo da **password**; no campo password, `Cima` regressa ao email.
- Foco nativo sincronizado com o contorno azul. Nao recolhe nem altera credenciais.
- Se o teclado virtual da Samsung capturar as setas, usar **Voltar** para o fechar e depois **Baixo**.
- Confirmar aviso `MEO Go v2` ao entrar no formulario: se nao aparecer, o script pode nao estar injetado no dominio/iframe de autenticacao.

Teste pendente em Samsung Q60A fisica.

## Modulo independente: MEO AZUL V3

Para evitar a cache da versao 1 no TizenBrew, esta edicao usa um identificador separado:

- **Referencia a adicionar:** `hwiguel3/meogo-tizenbrew@meo-azul-v3`
- **Nome apresentado:** `MEO AZUL V3 - Login Corrigido`
- **Identificador:** `meo-azul-login-v3`
- **Script:** `main_meo_azul_v3.js`
- **Versao:** `0.3.0`

O ramo `main` mantem a versao anterior. Remover do TizenBrew apenas o modulo antigo, sair totalmente do TizenBrew e abrir de novo, depois adicionar a referencia com `@meo-azul-v3`.

A mensagem `MEO AZUL V3 | V3 NOVA ATIVA` confirma que o script novo foi realmente carregado.
No formulario: Baixo/Enter para ir de email a password, Cima para voltar.
Nao foi validado fisicamente na Samsung.


## MEO DRAG V4 — arrasto manual experimental

Instala o ramo novo em **TizenBrew → Add GitHub Module**:

`hwiguel3/meogo-tizenbrew@meo-drag-v4`

Nome esperado: **MEO DRAG V4 - Cursor e Arrasto** (versão 0.4.0). Este ramo tem identificador próprio (`meo-drag-remote-v4`) e novo ficheiro principal (`main_meo_drag_v4.js`) para reduzir problemas de cache das versões anteriores.

### Controlos
- **Verde** ou **Amarelo**: alternar entre seleção azul e modo cursor.
- **Setas**: mover o cursor para cima, baixo, esquerda e direita.
- **OK no modo cursor**: agarrar a peça (enviar `pointerdown`/`mousedown` sintéticos).
- **Setas com a peça agarrada**: tentar arrastar (enviar `pointermove`/`mousemove`); o cursor fica amarelo.
- **OK outra vez**: largar (enviar `pointerup`/`mouseup`).
- **Voltar**: cancelar o arrasto.
- **Vermelho** no modo cursor: clique normal, sem iniciar arrasto.
- **Azul**: diagnóstico do motor de vídeo.

O modo drag é **completamente manual**: o utilizador escolhe a peça e o destino. Não reconhece nem resolve CAPTCHAs. Os eventos JavaScript sintetizados não são eventos de rato confiáveis (têm `isTrusted=false`) e poderão ser ignorados por mecanismos de segurança. Um iframe de outro domínio também impede acesso ao conteúdo a partir deste módulo. Nestes casos, a peça poderá não se mover apesar do cursor amarelo.

Para testar: fecha e reabre o TizenBrew depois de remover o módulo anterior, adiciona a referência com `@meo-drag-v4`, confirma o aviso `MEO DRAG V4`, ativa o cursor com Verde, coloca-o sobre a peça, prime OK para agarrar, move com setas e prime OK para largar.

Esta versão passou validação de sintaxe, mas **ainda não foi testada na Samsung Q60A real**.


## MEO FOCO V5 – recuperação experimental de teclas no CAPTCHA

**Instalar como modulo separado no TizenBrew:** `hwiguel3/meogo-tizenbrew@meo-foco-v5`.

Nome: `MEO FOCO V5 - Cursor CAPTCHA`, versao `0.5.0`, id `meo-foco-v5`, script `main_meo_foco_v5.js`.

**Alteracoes tecnicas:**
- Regista explicitamente Red, Green, Yellow, Blue na API `tizen.tvinputdevice` quando acessivel; falhas de permissao ficam visiveis no painel Azul.
- Ouvinte de `keydown` unico em `window` na fase de captura.
- Quando um iframe de CAPTCHA/autenticacao recebe o foco e estamos num formulario de login, tenta devolver o foco a um elemento invisivel do modulo na pagina principal.
- Se recuperar o foco, **ativa o cursor automaticamente**, sem ser necessario premir Verde. Mostra `MEO FOCO V5 | CAPTCHA/IFRAME: foco recuperado`.
- Preserva as setas, OK para agarrar/largar, Voltar para cancelar e Vermelho para clique normal.

**Teste:**
1. Remover modulos MEO antigos, reiniciar TizenBrew e adicionar `hwiguel3/meogo-tizenbrew@meo-foco-v5`.
2. Confirmar no inicio a mensagem `MEO FOCO V5`.
3. Abrir o CAPTCHA. Esperar que apareca automaticamente o cursor azul. Nao carregar em Verde se o cursor ja apareceu: Verde alterna entre cursor e selecao.
4. Com o cursor no CAPTCHA, confirmar se as setas o deslocam. O modo de arrasto continua a ser manual.
5. Se nao aparecer o cursor, tentar Verde. Se continuar inativo, o iframe pode continuar a capturar as teclas fora do alcance deste modulo.
6. Quando possivel fora do CAPTCHA, premir Azul para inspecionar `Teclas cor` e `Foco atual`.

**Limites:** o browser nao encaminha eventos do iframe de outro dominio para o documento principal. A recuperacao de foco nao e garantida no TizenBrew e pode interferir com o teclado virtual do CAPTCHA. Os eventos de arrastamento sintetico têm `isTrusted=false` e podem ser ignorados pelo desafio; o modulo nao descodifica nem resolve automaticamente verificacoes de seguranca. Solucao robusta para um CAPTCHA que requer rato fisico: uma aplicacao Tizen com suporte a ponteiro no `config.xml` do launcher ou outro metodo de verificacao acessivel, e nao apenas uma alteracao ao modulo JavaScript.


## MEO OVERLAY V6 — ponteiro sobre o CAPTCHA (29/10/2026)

Referencia para o TizenBrew: `hwiguel3/meogo-tizenbrew@meo-overlay-v6`

Identidade propria: `meo-overlay-v6`, versao `0.6.0`, script `main_meo_overlay_v6.js`.

**Alteracao:** o cursor deixa de ser um simples filho do `body`. Quando o modo cursor esta ativo, tenta usar o nivel superior de desenho (`popover`, se existir). Caso contrario, desloca o ponteiro para `document.documentElement` com `z-index:2147483647` e `pointer-events:none`. Nao modifica nem esconde o CAPTCHA.

Ao aparecer o CAPTCHA, o cursor devera permanecer visivel (se a janela do CAPTCHA estiver no mesmo plano de desenho da pagina). Premir Verde/Amarelo alterna o modo cursor. No modo cursor, as setas deslocam o ponteiro, OK inicia/termina arrasto manual e Vermelho efetua um clique normal.

**Diagnostico:** apos sair da verificacao, abre o painel Azul e le as linhas `Cursor layer`, `Cursor parent` e `Popover disponivel`. Um motor Tizen antigo podera nao suportar popover.

**Limites:** o iframe do CAPTCHA de outro dominio pode ser desenhado numa camada nativa superior e continuar a esconder este cursor. Mesmo visivel, o arrasto por eventos JavaScript sinteticos pode nao ser aceite pela verificacao (`isTrusted=false`). Para controlar uma verificacao de forma fiavel podera ser necessaria uma camada de input nativa na app TizenBrew ou um rato/touchpad real. Nao e garantido que funcione nesta Samsung.


## Correção 0.6.1 — ponteiro desaparecido na V6

A V6.0 usava `showPopover()` e tentava mover o ponteiro de `body` para `html`. Isto revelou-se incompatível com o comportamento observado na Samsung Q60A: o cursor deixou de ser visível.

A versão **MEO CURSOR 6.1 - Restaurado** retira essas alterações, volta ao método de desenho da V5 (ponteiro dentro de `document.body`) e mantém as correções de login, foco e arrastamento manual. Novo ficheiro principal: `main_meo_cursor_61.js`, com novo identificador `meo-cursor-restaurado-61`.

**Instalação:** remover o módulo antigo do TizenBrew, fechar totalmente a aplicação, abrir e adicionar novamente `hwiguel3/meogo-tizenbrew@meo-overlay-v6`. Confirmar o nome `MEO CURSOR 6.1 - Restaurado` e a mensagem `MEO CURSOR V6.1`.

**Teste:**
1. Abrir o MEO Go antes do CAPTCHA; premir Verde para ver o cursor azul e movê-lo com as setas.
2. Confirmar que, ao voltar a premir Verde, o cursor desaparece (modo seleção azul).
3. Abrir o CAPTCHA. O ponteiro pode continuar **por trás** do desafio: trata-se de um problema distinto, não resolvido por `z-index`.
4. Se o cursor continuar invisível fora do CAPTCHA, abrir Azul e verificar `Ponteiro` e `Cursor ativo` no diagnóstico (se possível).

**Limitação importante:** se o CAPTCHA for apresentado numa camada gráfica ou iframe separado e superior, este módulo JavaScript não consegue garantir que o ponteiro apareça por cima, nem que o CAPTCHA aceite arrastamentos sintéticos. Não esconder o CAPTCHA nem tentar contornar a verificação. Preferir os métodos de acessibilidade suportados pelo próprio CAPTCHA, um rato nativo ou uma aplicação Tizen com suporte a ponteiro nativo, se disponível.
