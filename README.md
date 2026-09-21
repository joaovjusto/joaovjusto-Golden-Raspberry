# Outsera Front-end Test

Aplicação Angular 22 para consultar a lista de indicados e vencedores da categoria Pior Filme do Golden Raspberry Awards.

## Requisitos

- Node.js 22.22.3+
- pnpm 10+

## Configuração inicial

```bash
corepack enable
corepack pnpm install
```

O projeto fixa a versão recomendada do Node em `.nvmrc`. Com `nvm`, use `nvm use` antes dos comandos.

## Executar localmente

```bash
corepack pnpm start
```

A aplicação fica disponível em http://localhost:4200/.

## Build

```bash
corepack pnpm build
```

## Testes unitários

```bash
corepack pnpm exec nx test outsera-app --watch=false
```

## Checklist de entrega

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm exec nx test outsera-app --watch=false --skip-nx-cache --outputStyle=static
corepack pnpm exec nx build outsera-app --skip-nx-cache --outputStyle=static
```

Para decisões de arquitetura, styling, Spartan UI, internacionalização e critérios de validação, consulte [docs/frontend.md](docs/frontend.md).

## Funcionalidades implementadas

- Dashboard com quatro painéis:
  - anos com mais de um vencedor;
  - top 3 estúdios com mais vitórias;
  - produtores com maior e menor intervalo entre vitórias;
  - busca de vencedores por ano.
- Lista paginada de filmes com filtros por ano e vencedor.
- Estados de carregamento, vazio e erro.
- Serviço HTTP separado dos componentes.
- Rotas com lazy loading.
- Estrutura de código organizada por domínio e serviços.

## Estrutura principal

- src/app/dashboard: dashboard com indicadores e busca.
- src/app/movies: listagem paginada e filtros.
- src/app/core/services/movies-api.service.ts: integração com a API.
- src/app/core/models/movie.ts: modelos compartilhados.

## API consumida

A aplicação usa os endpoints da API da Outsera:

- https://challenge.outsera.tech/api/movies
- /yearsWithMultipleWinners
- /studiosWithWinCount
- /maxMinWinIntervalForProducers
- /winnersByYear

## Observações

- O projeto usa Nx como runner de build e testes.
- A aplicação está preparada para servir via Angular Dev Server em ambiente local.
