import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackgroundHero from "../../components/backgroundhero";
import PixelButton from "../../components/pixelbutton";
import { socket } from "../../socket.js";

interface PublicRoom {
  code: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  timeLimit: number;
  pointsToWin: number;
  status: "waiting" | "playing" | "finished";
}

export function Rooms() {
  const navigate = useNavigate();
  const location = useLocation();
  const nickname: string = location.state?.nickname || localStorage.getItem("@CodeSurv:nickname") || "";

  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordModal, setPasswordModal] = useState<{ code: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nickname) {
      navigate("/");
      return;
    }

    socket.emit("room:list");

    const handleList = (data: PublicRoom[]) => {
      setRooms(data);
      setLoading(false);
    };

    const handleJoined = (room: { code: string; players: unknown[] }) => {
      navigate("/lobby", { state: { room, nickname } });
    };

    const handleError = (err: string) => {
      setError(err);
    };

    socket.on("room:list", handleList);
    socket.on("room:joined", handleJoined);
    socket.on("room:error", handleError);

    return () => {
      socket.off("room:list", handleList);
      socket.off("room:joined", handleJoined);
      socket.off("room:error", handleError);
    };
  }, [nickname, navigate]);

  const handleJoinRoom = (room: PublicRoom) => {
    setError("");
    if (room.isPrivate) {
      setPasswordModal({ code: room.code });
      return;
    }
    socket.emit("room:join", { code: room.code, username: nickname, password: null });
  };

  const handleJoinWithPassword = () => {
    if (!passwordModal) return;
    socket.emit("room:join", {
      code: passwordModal.code,
      username: nickname,
      password: passwordInput,
    });
    setPasswordModal(null);
    setPasswordInput("");
  };

  const handleRefresh = () => {
    setLoading(true);
    socket.emit("room:list");
  };

  const filtered = rooms.filter((r) =>
    r.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main>
      <BackgroundHero>
        <div className="flex flex-col gap-6 p-6 bg-black/60 rounded-xl border-4 border-black/80 w-full max-w-5xl backdrop-blur-sm mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-white/20 pb-4">
            <h2 className="text-5xl font-bold font-pixel text-white tracking-widest">SALAS</h2>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/50 border-2 border-white/50 text-white p-2 px-4 font-pixel text-xl outline-none focus:border-white transition-colors w-full md:w-48 placeholder:text-white/50"
              />
              <button
                onClick={handleRefresh}
                className="bg-black/40 border-2 border-white/50 text-white px-3 font-pixel text-xl hover:border-white transition-colors"
                title="Atualizar"
              >
                ↺
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/60 border-2 border-red-500 text-red-300 font-pixel text-lg p-3 text-center">
              Erro: {error}
            </div>
          )}

          <div className="max-h-[50vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-white/50 font-pixel text-2xl">
                Carregando salas...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/50 font-pixel">
                <p className="text-4xl mb-4">☁</p>
                <p className="text-2xl">Nenhuma sala disponível.</p>
                <p className="text-xl mt-1">Crie a sua própria sala!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((room) => (
                  <div
                    key={room.code}
                    onClick={() => handleJoinRoom(room)}
                    className="bg-black/40 border-2 border-white/30 hover:border-purple-400 hover:bg-black/60 cursor-pointer transition-all p-4 flex flex-col gap-3 group relative"
                  >
                    {room.isPrivate && (
                      <span className="absolute top-2 right-2 text-xl" title="Sala com Senha">
                        🔒
                      </span>
                    )}
                    <h3 className="font-pixel text-white text-2xl truncate pr-6 group-hover:text-purple-400">
                      {room.code}
                    </h3>
                    <div className="flex justify-between items-center text-white/70 font-pixel text-lg">
                      <span className={room.playerCount >= room.maxPlayers ? "text-red-400" : ""}>
                        👥 {room.playerCount}/{room.maxPlayers}
                      </span>
                      <span>⏱ {room.timeLimit / 60}m</span>
                    </div>
                    <div className="text-white/50 font-pixel text-base">
                      🏆 {room.pointsToWin} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-2 pt-4 border-t-4 border-white/20">
            <PixelButton tamanho="md" type="button" className="w-full sm:w-auto" onClick={() => navigate("/")}>
              VOLTAR
            </PixelButton>
            <PixelButton
              tamanho="md"
              className="w-full sm:w-auto"
              onClick={() => navigate("/createRoom", { state: { nickname } })}
            >
              CRIAR SALA
            </PixelButton>
          </div>
        </div>

        {/* Modal de senha */}
        {passwordModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black border-4 border-white/30 p-8 flex flex-col gap-4 w-full max-w-sm">
              <h3 className="font-pixel text-white text-2xl text-center">SENHA DA SALA</h3>
              <input
                type="password"
                placeholder="Digite a senha..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinWithPassword()}
                className="bg-black/40 border-2 border-white/50 text-white p-3 font-pixel text-xl outline-none focus:border-white transition-colors placeholder:text-white/30"
                autoFocus
              />
              <div className="flex gap-3">
                <PixelButton tamanho="sm" className="flex-1" onClick={handleJoinWithPassword}>
                  ENTRAR
                </PixelButton>
                <PixelButton
                  tamanho="sm"
                  className="flex-1"
                  onClick={() => { setPasswordModal(null); setPasswordInput(""); }}
                >
                  CANCELAR
                </PixelButton>
              </div>
            </div>
          </div>
        )}
      </BackgroundHero>
    </main>
  );
}
