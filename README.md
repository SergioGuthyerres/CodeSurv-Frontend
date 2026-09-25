<h1 align="center">CodeSurv — Frontend</h1>

<p align="center">
  Interface web do <strong>CodeSurv</strong>, um jogo multiplayer de desafios de programação por salas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO 4">
</p>

---

O jogador entra numa sala, recebe um desafio de lógica e compete com os outros para resolvê-lo
primeiro. Este repositório é só a interface — toda a lógica de jogo, as salas e a execução do
código vivem no [**CodeSurv-Backend**](https://github.com/SergioGuthyerres/CodeSurv-Backend).

## Rodando

Precisa do backend no ar (por padrão em `http://localhost:3000` — veja
[como subir](https://github.com/SergioGuthyerres/CodeSurv-Backend#como-rodar)).

```bash
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`.

| Variável           | Padrão                  | Descrição     |
|--------------------|-------------------------|---------------|
| `VITE_BACKEND_URL` | `http://localhost:3000` | URL do backend |

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run preview    # serve o build localmente
npm run lint       # ESLint
npm run typecheck  # tsc sem emitir
```

## Comunicação com o backend

Toda a conversa com o servidor passa por uma única instância de socket exportada em
`src/socket.js`, apontando para `VITE_BACKEND_URL`. Os eventos são os de sala (`room:*`) e os
de jogo (`game:*`).

O contrato — nomes dos eventos, payloads e códigos de erro — é definido pelo servidor e está
documentado num lugar só, para não divergir entre os dois repositórios:
[**eventos Socket.IO no README do backend**](https://github.com/SergioGuthyerres/CodeSurv-Backend#eventos-socketio).

## Estado atual

Na `main` estão o scaffold (React + Vite + Tailwind) e a conexão com o backend via
Socket.IO. As telas do jogo — home, lista de salas, criação de sala, lobby e partida — estão
implementadas e aguardando revisão nas branches abertas do repositório.

O que ainda não existe não está descrito aqui: vira
[issue](https://github.com/SergioGuthyerres/CodeSurv-Frontend/issues).

## Relacionado

[**CodeSurv-Backend**](https://github.com/SergioGuthyerres/CodeSurv-Backend) — Fastify,
Socket.IO, MongoDB e execução de código em sandbox na Piston.
