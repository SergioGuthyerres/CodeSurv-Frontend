import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PixelButton from "../../components/pixelbutton";
import BackgroundHero from "../../components/backgroundhero";
import { socket } from "../../socket.js";

export function CreateRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname: string = location.state?.nickname || localStorage.getItem("@CodeSurv:nickname") || "";

  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nickname) {
      navigate("/");
      return;
    }

    const handleCreated = (room: unknown) => {
      navigate("/lobby", { state: { room, nickname } });
    };

    const handleError = (err: string) => {
      setError(err);
      setLoading(false);
    };

    socket.on("room:created", handleCreated);
    socket.on("room:error", handleError);

    return () => {
      socket.off("room:created", handleCreated);
      socket.off("room:error", handleError);
    };
  }, [nickname, navigate]);

  const handleCreateRoom: React.FormEventHandler<HTMLFormElement> = (evento) => {
    evento.preventDefault();
    setError("");
    setLoading(true);

    const dados = new FormData(evento.currentTarget);
    const maxPlayers = Number(dados.get("maxPlayers"));
    const timeLimit = Number(dados.get("timeLimit"));
    const pointsToWin = Number(dados.get("pointsToWin"));
    const rawPassword = dados.get("password") as string;
    const password = isPrivate && rawPassword?.trim() ? rawPassword.trim() : null;

    socket.emit("room:create", {
      username: nickname,
      maxPlayers,
      timeLimit,
      pointsToWin,
      password,
    });
  };

  const inputEstilo =
    "w-full bg-black/40 border-2 border-white/50 text-white p-3 font-pixel text-xl outline-none focus:border-white transition-colors placeholder:text-white/30";

  return (
    <BackgroundHero>
      <div className="flex items-center justify-center min-h-screen text-white px-4 w-full">
        <form
          onSubmit={handleCreateRoom}
          className="flex flex-col gap-6 p-8 bg-black/60 rounded-xl border-4 border-black/80 w-full max-w-3xl backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold font-pixel text-center mb-2 tracking-widest">
            CRIAR SALA
          </h2>

          {error && (
            <div className="bg-red-900/60 border-2 border-red-500 text-red-300 font-pixel text-lg p-3 text-center">
              Erro: {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-pixel text-3xl">Quantidade de Players</label>
            <select name="maxPlayers" className={inputEstilo}>
              <option className="bg-gray-800" value={5}>5 players</option>
              <option className="bg-gray-800" value={10}>10 players</option>
              <option className="bg-gray-800" value={15}>15 players</option>
              <option className="bg-gray-800" value={20}>20 players</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-pixel text-3xl">Tempo da Partida</label>
            <select name="timeLimit" className={inputEstilo}>
              <option className="bg-gray-800" value={120}>2 minutos</option>
              <option className="bg-gray-800" value={180}>3 minutos</option>
              <option className="bg-gray-800" value={300}>5 minutos</option>
              <option className="bg-gray-800" value={600}>10 minutos</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-pixel text-3xl">Pontos para Vencer</label>
            <select name="pointsToWin" className={inputEstilo}>
              <option className="bg-gray-800" value={100}>100 pts</option>
              <option className="bg-gray-800" value={150}>150 pts</option>
              <option className="bg-gray-800" value={200}>200 pts</option>
              <option className="bg-gray-800" value={300}>300 pts</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-2 font-pixel text-xl">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-6 h-6 accent-blue-600 cursor-pointer"
            />
            Sala Privada (Com Senha)
          </label>

          {isPrivate && (
            <div className="flex flex-col gap-2">
              <input
                name="password"
                type="password"
                placeholder="Digite a senha da sala"
                maxLength={32}
                className={inputEstilo}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 relative group bg-[#9ca3af] text-black font-pixel font-bold text-2xl py-3 border-4 border-black transition-transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 border-t-4 border-l-4 border-white/70 pointer-events-none group-active:border-t-transparent group-active:border-l-transparent"></div>
            <div className="absolute inset-0 border-b-4 border-r-4 border-black/30 pointer-events-none group-active:border-b-transparent group-active:border-r-transparent"></div>
            <span className="relative z-10">{loading ? "CRIANDO..." : "CRIAR SALA"}</span>
          </button>

          <PixelButton
            tamanho="sm"
            type="button"
            className="w-full md:w-auto mt-2"
            onClick={() => navigate("/")}
          >
            VOLTAR
          </PixelButton>
        </form>
      </div>
    </BackgroundHero>
  );
}
