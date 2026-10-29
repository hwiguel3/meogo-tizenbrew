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
