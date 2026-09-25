import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackgroundHero from "../../components/backgroundhero";
import PixelButton from "../../components/pixelbutton";
import { socket } from "../../socket.js";

interface TestCase {
  input: unknown[];
  expected: unknown;
  isPublic: boolean;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  languages: string[];
  functionSig: { javascript?: string; python?: string };
  testCases: TestCase[];
}

interface Player {
  socketId: string;
  username: string;
  score: number;
  isOwner: boolean;
}

interface Room {
  code: string;
  players: Player[];
  pointsToWin: number;
  timeLimit: number;
}

type Feedback = "correct" | "wrong" | null;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

export function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname: string = location.state?.nickname || localStorage.getItem("@CodeSurv:nickname") || "";

  const [challenge, setChallenge] = useState<Challenge | null>(location.state?.challenge ?? null);
  const [roundEndsAt, setRoundEndsAt] = useState<Date | null>(
    location.state?.roundEndsAt ? new Date(location.state.roundEndsAt) : null,
  );
  const [room, setRoom] = useState<Room | null>(location.state?.room ?? null);
  const [players, setPlayers] = useState<Player[]>(location.state?.room?.players ?? []);

  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [solution, setSolution] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState<{ winner: string; players: Player[] } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showFeedback = (type: Feedback, msg: string) => {
    setFeedback(type);
    setFeedbackMsg(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const startTimer = (endsAt: Date) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0 && timerRef.current) clearInterval(timerRef.current);
    }, 500);
  };

  useEffect(() => {
    if (!room || !challenge || !nickname) {
      navigate("/");
      return;
    }

    if (roundEndsAt) startTimer(roundEndsAt);

    const handleCorrect = (data: { username: string; score: number; players: Player[] }) => {
      setPlayers(data.players);
      if (data.username === nickname) {
        showFeedback("correct", `+${data.score} pts — Correto! 🎉`);
        setSubmitting(false);
      }
    };

    const handleWrong = () => {
      showFeedback("wrong", "Resposta errada. Tente novamente!");
      setSubmitting(false);
    };

    const handleRoundEnd = (data: { challenge: Challenge; roundEndsAt: string; players: Player[] }) => {
      setRoundOver(true);
      setPlayers(data.players);
      setTimeout(() => {
        setChallenge(data.challenge);
        const newEndsAt = new Date(data.roundEndsAt);
        setRoundEndsAt(newEndsAt);
        startTimer(newEndsAt);
        setSolution("");
        setRoundOver(false);
        setSubmitting(false);
      }, 3000);
    };

    const handleGameEnd = (data: { winner: string; players: Player[] }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameOver(data);
    };

    const handleError = (err: string) => {
      showFeedback("wrong", `Erro: ${err}`);
      setSubmitting(false);
    };

    const handleInterrupted = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      alert("O jogo foi interrompido porque um jogador saiu.");
      navigate("/");
    };

    socket.on("game:correct", handleCorrect);
    socket.on("game:wrong", handleWrong);
    socket.on("game:roundEnd", handleRoundEnd);
    socket.on("game:end", handleGameEnd);
    socket.on("game:error", handleError);
    socket.on("game:interrupted", handleInterrupted);

    return () => {
      socket.off("game:correct", handleCorrect);
      socket.off("game:wrong", handleWrong);
      socket.off("game:roundEnd", handleRoundEnd);
      socket.off("game:end", handleGameEnd);
      socket.off("game:error", handleError);
      socket.off("game:interrupted", handleInterrupted);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room, challenge, nickname, navigate, roundEndsAt]);

  const handleSubmit = () => {
    if (!room || !solution.trim() || submitting) return;
    setSubmitting(true);
    socket.emit("game:submit", {
      code: room.code,
      solution: solution.trim(),
      language,
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!room || !challenge) return null;

  // Game over screen
  if (gameOver) {
    return (
      <main>
        <BackgroundHero>
          <div className="flex flex-col items-center gap-8 p-10 bg-black/70 rounded-xl border-4 border-yellow-400/60 w-full max-w-xl backdrop-blur-sm">
            <h2 className="text-5xl font-bold font-pixel text-yellow-400 tracking-widest">FIM DE JOGO</h2>
            <p className="font-pixel text-white text-3xl">
              🏆 {gameOver.winner} venceu!
            </p>
            <div className="w-full flex flex-col gap-2">
              {[...gameOver.players]
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div
                    key={p.socketId}
                    className={`flex justify-between font-pixel text-xl p-3 border-2 ${
                      p.username === nickname ? "border-purple-400 text-white" : "border-white/20 text-white/70"
                    }`}
                  >
                    <span>#{i + 1} {p.username}</span>
                    <span>{p.score} pts</span>
                  </div>
                ))}
            </div>
            <PixelButton tamanho="lg" onClick={() => navigate("/")}>
              VOLTAR AO INÍCIO
            </PixelButton>
          </div>
        </BackgroundHero>
      </main>
    );
  }

  const publicCases = challenge.testCases.filter((tc) => tc.isPublic);

  return (
    <main>
      <BackgroundHero>
        <div className="flex flex-col gap-4 w-full max-w-6xl px-4 py-6 h-screen overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-black/60 border-2 border-white/20 p-3 rounded-lg flex-shrink-0">
            <h1 className="font-pixel text-white text-xl md:text-3xl tracking-widest">CODESURV</h1>
            <div
              className={`font-pixel text-2xl md:text-3xl font-bold ${
                timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              ⏱ {formatTime(timeLeft)}
            </div>
            <div className="font-pixel text-white/70 text-lg">
              Sala: <span className="text-white">{room.code}</span>
            </div>
          </div>

          {/* Round over overlay */}
          {roundOver && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="font-pixel text-white text-4xl text-center p-8">
                <p className="text-6xl mb-4">⏰</p>
                <p>Round encerrado!</p>
                <p className="text-2xl text-white/70 mt-3">Próximo desafio em instantes...</p>
              </div>
            </div>
          )}

          {/* Feedback toast */}
          {feedback && (
            <div
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 font-pixel text-xl px-6 py-3 border-4 ${
                feedback === "correct"
                  ? "bg-green-900/90 border-green-400 text-green-300"
                  : "bg-red-900/90 border-red-400 text-red-300"
              }`}
            >
              {feedbackMsg}
            </div>
          )}

          <div className="flex gap-4 flex-1 overflow-hidden">
            {/* Left panel: challenge + scoreboard */}
            <div className="flex flex-col gap-4 w-72 flex-shrink-0 overflow-y-auto">
              {/* Challenge info */}
              <div className="bg-black/60 border-2 border-white/20 p-4 rounded-lg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-pixel text-white text-xl">{challenge.title}</h2>
                  <span className={`font-pixel text-base ${DIFFICULTY_COLOR[challenge.difficulty]}`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>
                <p className="text-white/80 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {challenge.description}
                </p>
                {publicCases.length > 0 && (
                  <div className="mt-2">
                    <p className="font-pixel text-white/60 text-sm mb-2">EXEMPLOS:</p>
                    {publicCases.map((tc, i) => (
                      <div key={i} className="bg-black/40 border border-white/10 p-2 mb-2 font-mono text-sm">
                        <span className="text-white/50">Input:</span>{" "}
                        <span className="text-white">{JSON.stringify(tc.input)}</span>
                        <br />
                        <span className="text-white/50">Output:</span>{" "}
                        <span className="text-green-400">{JSON.stringify(tc.expected)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scoreboard */}
              <div className="bg-black/60 border-2 border-white/20 p-4 rounded-lg flex flex-col gap-2">
                <h3 className="font-pixel text-white/70 text-lg mb-1">PLACAR</h3>
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <div
                      key={p.socketId}
                      className={`flex justify-between font-pixel text-lg p-2 border ${
                        p.username === nickname ? "border-purple-400 text-white" : "border-white/10 text-white/70"
                      }`}
                    >
                      <span>#{i + 1} {p.username}</span>
                      <span>{p.score}</span>
                    </div>
                  ))}
                <div className="text-white/40 font-pixel text-sm mt-1 text-right">
                  Meta: {room.pointsToWin} pts
                </div>
              </div>
            </div>

            {/* Right panel: editor */}
            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-pixel text-white/60 text-lg">Linguagem:</span>
                {challenge.languages.includes("javascript") && (
                  <button
                    onClick={() => setLanguage("javascript")}
                    className={`font-pixel text-lg px-4 py-1 border-2 transition-colors ${
                      language === "javascript"
                        ? "border-yellow-400 text-yellow-400"
                        : "border-white/30 text-white/50 hover:border-white/60"
                    }`}
                  >
                    JavaScript
                  </button>
                )}
                {challenge.languages.includes("python") && (
                  <button
                    onClick={() => setLanguage("python")}
                    className={`font-pixel text-lg px-4 py-1 border-2 transition-colors ${
                      language === "python"
                        ? "border-blue-400 text-blue-400"
                        : "border-white/30 text-white/50 hover:border-white/60"
                    }`}
                  >
                    Python
                  </button>
                )}
              </div>

              {/* Function signature hint */}
              <div className="bg-black/40 border border-white/10 px-4 py-2 font-mono text-white/50 text-sm flex-shrink-0">
                {challenge.functionSig[language]}
              </div>

              <textarea
                className="flex-1 bg-black/50 border-2 border-white/30 focus:border-purple-400 text-white font-mono text-lg p-4 outline-none resize-none transition-colors"
                placeholder={`// Escreva apenas o corpo da função aqui\nreturn a + b;`}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                spellCheck={false}
              />

              <div className="flex gap-3 flex-shrink-0">
                <PixelButton
                  tamanho="md"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !solution.trim()}
                >
                  {submitting ? "ENVIANDO..." : "SUBMETER"}
                </PixelButton>
              </div>
            </div>
          </div>
        </div>
      </BackgroundHero>
    </main>
  );
}
