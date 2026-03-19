# codesurv-frontend

> Interface web do **CodeSurv** — plataforma de Casual Coding Game com desafios de lógica e algoritmos em tempo real.

---

## Sobre o projeto

O frontend do CodeSurv é uma aplicação React responsável por toda a experiência do jogador: entrar em salas, escrever soluções no editor de código, acompanhar o timer e ver o resultado das rodadas em tempo real.

A comunicação com o backend acontece de duas formas:

- **Socket.IO** — para tudo que é em tempo real (turnos, submissões, resultados)
- **Fetch nativo** — para chamadas HTTP pontuais (listar salas públicas)

---

## Stack

| Tecnologia       | Versão | Uso                       |
| ---------------- | ------ | ------------------------- |
| React            | 18+    | Framework de interface    |
| Vite             | 5+     | Bundler e dev server      |
| Tailwind CSS     | 3+     | Estilização               |
| Socket.IO Client | 4+     | Comunicação em tempo real |
| CodeMirror 6     | 6+     | Editor de código          |

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend do CodeSurv rodando localmente (`http://localhost:3001`)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/codesurv-frontend.git
cd codesurv-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

Edite o `.env` com a URL do backend:

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

---

## Rodando localmente

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Estrutura de pastas

```
src/
├── components/
│   ├── Editor/         # CodeMirror 6 encapsulado como componente React
│   ├── Scoreboard/     # Ranking parcial e pódio final
│   └── Lobby/          # Lista de jogadores e configurações da sala
│
├── pages/
│   ├── Home.jsx        # Tela inicial: username + criar/entrar em sala
│   ├── Lobby.jsx       # Sala de espera antes da partida
│   └── Game.jsx        # Partida ativa: editor + timer + scoreboard
│
├── hooks/
│   ├── useSocket.js    # Listeners de eventos Socket.IO com cleanup automático
│   └── useGame.js      # Estado da partida: rodada, desafio, timer, submissão
│
├── services/
│   └── roomService.js  # Chamadas HTTP para a API REST do backend
│
├── socket.js           # Instância única do Socket.IO (importar em todo lugar)
└── main.jsx            # Entry point da aplicação
```

---

## Fluxo principal

```
Home.jsx
  └── usuário digita username
        ├── "Criar Sala"  → formulário de config → Lobby.jsx (como host)
        └── "Entrar"      → digita código        → Lobby.jsx (como jogador)

Lobby.jsx
  └── aguarda jogadores conectarem
        └── host clica "Iniciar" → Game.jsx

Game.jsx
  └── recebe game:start  → exibe desafio + timer
        └── jogador escreve no Editor → clica "Enviar" → game:submit
              └── recebe game:result  → Scoreboard atualiza
                    └── última rodada → recebe game:end → Pódio
```

---

## Eventos Socket.IO

| Evento            | Direção | Descrição                             |
| ----------------- | ------- | ------------------------------------- |
| `room:create`     | Emite   | Cria nova sala com configurações      |
| `room:join`       | Emite   | Entra em sala existente com código    |
| `room:update`     | Recebe  | Atualização do estado do lobby        |
| `game:start`      | Recebe  | Início de turno com desafio e duração |
| `game:submit`     | Emite   | Envia solução do jogador              |
| `game:result`     | Recebe  | Resultado do turno e pontuações       |
| `game:end`        | Recebe  | Fim da partida com pódio              |
| `room:disconnect` | Recebe  | Notificação de saída de jogador       |

---

## Scripts disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Gera o build de produção em /dist
npm run preview  # Visualiza o build de produção localmente
npm run lint     # Roda o ESLint
```

---

## Variáveis de ambiente

| Variável          | Descrição                       | Exemplo                 |
| ----------------- | ------------------------------- | ----------------------- |
| `VITE_API_URL`    | URL base da API REST do backend | `http://localhost:3001` |
| `VITE_SOCKET_URL` | URL do servidor Socket.IO       | `http://localhost:3001` |

> Todas as variáveis de ambiente no Vite precisam começar com `VITE_` para ficarem acessíveis no código.

---

## Fases de desenvolvimento

- **Fase 1 — MVP:** Sem autenticação. O jogador digita apenas um username na tela inicial.
- **Fase 2:** Cadastro e login com e-mail, senha (bcrypt) e token JWT.
- **Fase 3:** OAuth (Google/GitHub) e perfil com histórico de partidas.

---

## Relacionado

- [codesurv-backend](https://github.com/seu-usuario/codesurv-backend) — API REST e servidor de jogo
