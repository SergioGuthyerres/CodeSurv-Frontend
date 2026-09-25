# CodeSurv — Frontend

Interface do CodeSurv, um jogo multiplayer de desafios de programação em tempo real.

## Stack

| Tecnologia       | Versão | Uso                        |
|------------------|--------|----------------------------|
| React            | 19     | Framework de interface     |
| Vite             | 8      | Bundler e dev server       |
| Tailwind CSS     | 4      | Estilização                |
| React Router DOM | 7      | Roteamento                 |
| Socket.IO Client | 4      | Comunicação em tempo real  |

## Pré-requisitos

- Node.js 18+
- Backend do CodeSurv rodando (`http://localhost:3000` por padrão)

## Configuração

```bash
cp .env.example .env
# edite o .env se necessário
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Variáveis de ambiente (`.env`)

| Variável           | Padrão                  | Descrição         |
|--------------------|-------------------------|-------------------|
| `VITE_BACKEND_URL` | `http://localhost:3000` | URL do backend    |

## Fluxo de telas

```
/           → Home: escolha de nickname
/rooms      → Lista de salas abertas (dados reais via socket)
/createRoom → Formulário para criar sala
/lobby      → Sala de espera; dono inicia o jogo
/game       → Editor de código + timer + placar em tempo real
```

### Jornada completa

1. **Home** — usuário digita nickname (persistido no `localStorage`)
2. **JOGAR / SALAS** — lista de salas com `room:list`; clicar entra via `room:join`
3. **CRIAR SALA** — envia `room:create`; ao receber `room:created`, vai para Lobby
4. **Lobby** — exibe jogadores em tempo real via `room:updated`; dono envia `game:start`
5. **Game** — editor com assinatura da função; submete via `game:submit`; placar atualiza a cada `game:correct`
6. Quando um jogador atinge os pontos → tela de Fim de Jogo com ranking final

## Estrutura

```
src/
├── main.tsx                  # Entry point
├── socket.js                 # Instância única do socket (exportada)
├── router/index.tsx          # Definição de rotas
├── components/
│   ├── backgroundhero.tsx    # Layout com vídeo de fundo + overlay
│   └── pixelbutton.tsx       # Botão com efeito pixel/3D
└── pages/
    ├── home/                 # Tela inicial
    ├── rooms/                # Lista de salas
    ├── createRoom/           # Criar sala
    ├── lobby/                # Sala de espera
    └── game/                 # Tela de jogo
```

## Eventos socket

### Emitidos pelo frontend

| Evento        | Quando                                          |
|---------------|-------------------------------------------------|
| `room:list`   | Ao abrir `/rooms`                               |
| `room:join`   | Ao clicar em uma sala                           |
| `room:create` | Ao submeter o formulário de criar sala          |
| `room:leave`  | Ao clicar "Sair da Sala" no lobby               |
| `game:start`  | Dono clica "Iniciar Jogo" no lobby              |
| `game:submit` | Jogador envia solução no editor                 |

### Escutados pelo frontend

| Evento             | Página          | Ação                                       |
|--------------------|-----------------|--------------------------------------------|
| `room:list`        | Rooms           | Atualiza lista de salas                    |
| `room:created`     | CreateRoom      | Navega para `/lobby`                       |
| `room:joined`      | Rooms           | Navega para `/lobby`                       |
| `room:updated`     | Lobby           | Atualiza lista de jogadores                |
| `room:userLeft`    | Lobby           | Remove jogador da lista                    |
| `room:error`       | Rooms/CreateRoom/Lobby | Exibe mensagem de erro             |
| `game:started`     | Lobby           | Navega para `/game` com o desafio          |
| `game:correct`     | Game            | Atualiza placar, mostra feedback positivo  |
| `game:wrong`       | Game            | Mostra feedback negativo                   |
| `game:roundEnd`    | Game            | Mostra tela de transição, carrega novo desafio |
| `game:end`         | Game            | Exibe tela de fim de jogo com ranking      |
| `game:interrupted` | Lobby/Game      | Avisa que o jogo foi interrompido          |
| `game:error`       | Lobby/Game      | Exibe erro ao usuário                      |

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run lint     # lint com ESLint
npm run preview  # preview do build
```

## Fases de desenvolvimento

- **Fase 1 — MVP:** sem autenticação; jogador escolhe um nickname
- **Fase 2:** cadastro/login com e-mail e JWT
- **Fase 3:** OAuth (Google/GitHub) e perfil com histórico de partidas

## Relacionado

- [codesurv-backend](https://github.com/Code-Survivors/Backend) — servidor Fastify + Socket.IO + MongoDB
