# Notas de Engenharia Frontend

## Arquitetura

A aplicação usa componentes standalone do Angular e targets de projeto do Nx. Os componentes de funcionalidade ficam em `src/app/dashboard` e `src/app/movies`; o acesso HTTP está isolado em `src/app/core/services/movies-api.service.ts`.

O Spartan UI é mantido como bibliotecas Helm locais em `libs/ui`. As diretivas geradas usam classes do Tailwind, enquanto `src/styles.scss` concentra o tema compartilhado, a configuração do Tailwind/PostCSS e o pequeno conjunto de overrides globais dos elementos `hlm-*`.

### Fluxo de dados

```text
Dashboard / Movies
	|
	v
MoviesApiService -> API de premiações
	|
	v
Signals -> Angular templates -> Spartan UI primitives
```

Os componentes são responsáveis pela apresentação e pela interação do usuário. O serviço de API concentra as responsabilidades HTTP e os modelos em `core` definem os contratos compartilhados das respostas.

### Decisões

- Componentes standalone do Angular são usados para manter limites claros entre funcionalidades e permitir rotas lazy.
- Signals armazenam o estado da interface; RxJS permanece na fronteira HTTP.
- A paginação é baseada em zero internamente porque esse é o contrato da API.
- A aplicação de um filtro válido sempre reinicia a paginação na página zero.
- Os painéis do dashboard falham de forma independente, evitando que um endpoint indisponível deixe todo o dashboard vazio.
- O código Helm do Spartan permanece local porque seus estilos gerados foram feitos para serem inspecionados e customizados.

## Estilos

O Tailwind controla layout, espaçamento, comportamento responsivo, utilitários tipográficos, navegação, filtros, cards e paginação. Evite adicionar arquivos SCSS de feature para estilos utilitários. O CSS global fica reservado para tokens de design, animações, primitivas de acessibilidade e estilos que segmentam elementos customizados do Spartan.

O Tailwind verifica os templates da aplicação por meio de `@source './app'` em `src/styles.scss`. O plugin do PostCSS está configurado em `.postcssrc.json`.

## Internacionalização

Português (`pt-BR`) é o locale de origem, registrado por meio de `LOCALE_ID` e `registerLocaleData`. Textos de template exibidos ao usuário devem usar os metadados `i18n` do Angular com um `@@messageId` estável. Strings exibidas ao usuário e produzidas pelo TypeScript devem usar `$localize` com o mesmo formato explícito de message ID.

O catálogo fonte em português está versionado em `src/locale/messages.pt-BR.xlf` e o catálogo em inglês em `src/locale/messages.en-US.xlf`. Para extrair ou atualizar o catálogo fonte após alterar textos localizados:

```bash
pnpm extract-i18n
```

O target de extração é nativo deste workspace Nx e requer Node `22.22.3+`, conforme exigido pelo Angular CLI instalado. A versão recomendada está registrada em `.nvmrc` e em `package.json#engines`. O build e os testes da aplicação não dependem da extração em runtime; o locale de origem continua sendo o português.

O catálogo é mantido intencionalmente como artefato de build sob controle de versão, em vez de introduzir um serviço de tradução em runtime para uma aplicação pequena. Para adicionar outro locale, crie um novo catálogo XLIFF e conecte-o à configuração de build do workspace Angular.

## Gates de qualidade

Antes de publicar uma alteração:

1. Instale as dependências usando o lockfile.
2. Execute os testes unitários sem cache.
3. Execute o build de produção sem cache.
4. Verifique `/dashboard` e `/movies` em larguras desktop e mobile.
5. Verifique os estados vazio, loading, erro de API, ano inválido, filtros combinados e paginação.

A suíte atual cobre o contrato de consulta do serviço, o comportamento de falha parcial do dashboard, validação de ano, filtros combinados de filmes, reset da paginação, erros de API e navegação principal. Testes E2E de navegador não fazem parte do escopo atual da aplicação.

## Restrições conhecidas

- A API de premiações é remota, então as verificações com dados reais dependem da disponibilidade da rede.
- O target de extração exige a versão do Node suportada pelo Angular CLI instalado (`22.22.3+`). O fluxo de build/testes usa `pt-BR` como locale de origem.

## Verificação

Execute as verificações de qualidade:

```bash
pnpm install --frozen-lockfile
pnpm test -- --watch=false --skip-nx-cache --outputStyle=static
pnpm build -- --skip-nx-cache --outputStyle=static
```

Os testes dos componentes cobrem resiliência do dashboard, validação de ano, filtros combinados de filmes, reset da paginação, parâmetros de consulta da API e renderização da navegação principal.
