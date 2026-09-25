import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackgroundHero from "../../components/backgroundhero";
import PixelButton from "../../components/pixelbutton";
import { socket } from "../../socket.js";

interface Player {
  socketId: string;
  username: string;
  score: number;
  isOwner: boolean;
}

interface Room {
  code: string;
  players: Player[];
  maxPlayers: number;
  timeLimit: number;
  pointsToWin: number;
  status: string;
  password: string | null;
}

export function Lobby() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname: string = location.state?.nickname || localStorage.getItem("@CodeSurv:nickname") || "";

  const [room, setRoom] = useState<Room | null>(location.state?.room ?? null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const currentPlayer = room?.players.find((p) => p.socketId === socket.id);
  const isOwner = currentPlayer?.isOwner ?? false;

  useEffect(() => {
    if (!room || !nickname) {
      navigate("/");
      return;
    }

    const handleRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
    };

    const handleGameStarted = (data: { challenge: unknown; roundEndsAt: string }) => {
      navigate("/game", { state: { challenge: data.challenge, roundEndsAt: data.roundEndsAt, room, nickname } });
    };

    const handleError = (err: string) => {
      setError(err);
      setStarting(false);
    };

    const handleInterrupted = () => {
      alert("O jogo foi interrompido porque um jogador saiu.");
      navigate("/");
    };

    socket.on("room:updated", handleRoomUpdated);
    socket.on("game:started", handleGameStarted);
    socket.on("game:error", handleError);
    socket.on("game:interrupted", handleInterrupted);

    return () => {
      socket.off("room:updated", handleRoomUpdated);
      socket.off("game:started", handleGameStarted);
      socket.off("game:error", handleError);
      socket.off("game:interrupted", handleInterrupted);
    };
  }, [room, nickname, navigate]);

  const handleStartGame = () => {
    if (!room) return;
    setStarting(true);
    setError("");
    socket.emit("game:start", { code: room.code });
  };

  const handleLeave = () => {
    socket.emit("room:leave");
    navigate("/");
  };

  if (!room) return null;

  return (
    <main>
      <BackgroundHero>
        <div className="flex flex-col gap-6 p-8 bg-black/60 rounded-xl border-4 border-black/80 w-full max-w-2xl backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-pixel text-white tracking-widest mb-1">LOBBY</h2>
            <p className="font-pixel text-white/60 text-xl">
              Código da sala:{" "}
              <span className="text-white text-2xl tracking-widest">{room.code}</span>
            </p>
          </div>

          <div className="flex justify-between font-pixel text-white/70 text-lg border-b-2 border-white/20 pb-4">
            <span>⏱ {room.timeLimit / 60} min por round</span>
            <span>🏆 {room.pointsToWin} pts para vencer</span>
            {room.password && <span>🔒 Privada</span>}
          </div>

          {error && (
            <div className="bg-red-900/60 border-2 border-red-500 text-red-300 font-pixel text-lg p-3 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="font-pixel text-white/80 text-2xl">
              JOGADORES ({room.players.length}/{room.maxPlayers})
            </h3>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {room.players.map((player) => (
                <div
                  key={player.socketId}
                  className={`flex items-center justify-between p-3 border-2 font-pixel text-xl ${
                    player.socketId === socket.id
                      ? "border-purple-400 bg-purple-900/30 text-white"
                      : "border-white/20 bg-black/30 text-white/80"
                  }`}
                >
                  <span>
                    {player.isOwner && <span className="text-yellow-400 mr-2">👑</span>}
                    {player.username}
                    {player.socketId === socket.id && (
                      <span className="text-white/50 ml-2 text-base">(você)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {isOwner ? (
              <PixelButton
                tamanho="lg"
                className="w-full"
                onClick={handleStartGame}
                disabled={starting || room.players.length < 1}
              >
                {starting ? "INICIANDO..." : "INICIAR JOGO"}
              </PixelButton>
            ) : (
              <div className="font-pixel text-white/60 text-xl text-center py-4">
                Aguardando o dono iniciar a partida...
              </div>
            )}
            <PixelButton tamanho="sm" className="w-full" onClick={handleLeave}>
              SAIR DA SALA
            </PixelButton>
          </div>
        </div>
      </BackgroundHero>
    </main>
  );
}
