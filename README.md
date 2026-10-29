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
