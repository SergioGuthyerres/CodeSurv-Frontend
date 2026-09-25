import { useNavigate } from "react-router-dom";
import BackgroundHero from "../../components/backgroundhero";
import PixelButton from "../../components/pixelbutton";
import playerIcon from "../../design/playericon.png";
import { useState } from "react";

export function Home() {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("@CodeSurv:nickname") || "";
  });

  const navigate = useNavigate();

  const validateNickname = (minLen = 4): boolean => {
    if (nickname.trim().length < minLen) {
      alert(`Por favor, digite um nickname com pelo menos ${minLen} letras.`);
      return false;
    }
    return true;
  };

  const handleJogar = () => {
    if (!validateNickname()) return;
    navigate("/rooms", { state: { nickname: nickname.trim() } });
  };

  const handleSalas = () => {
    if (!validateNickname()) return;
    navigate("/rooms", { state: { nickname: nickname.trim() } });
  };

  const handleCriarSala = () => {
    if (!validateNickname(4)) return;
    navigate("/createRoom", { state: { nickname: nickname.trim() } });
  };

  return (
    <main>
      <BackgroundHero>
        <div className="flex flex-col items-center justify-center gap-6 mt-10">
          <h1 className="text-5xl md:text-7xl font-bold font-pixel tracking-wider text-center drop-shadow-lg">
            CODESURV
          </h1>

          <div className="bg-black/50 p-6 rounded-2xl border-4 border-black/80 flex flex-col items-center w-full max-w-sm backdrop-blur-sm">
            <div className="flex gap-6 mb-6">
              <div className="w-20 h-20 flex items-center justify-center bg-[#9ca3af] border-4 border-white/30">
                <img src={playerIcon} className="w-full h-full" alt="avatar" />
              </div>
            </div>

            <input
              type="text"
              placeholder="@NICKNAME"
              maxLength={12}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                localStorage.setItem("@CodeSurv:nickname", e.target.value);
              }}
              className="bg-black/40 border-b-4 border-white text-white font-pixel text-2xl text-center outline-none focus:border-blue-400 uppercase w-full p-2 transition-colors placeholder:text-white/50"
            />

            <div className="flex flex-col md:flex-row gap-4 w-full px-4 items-center justify-center p-4">
              <PixelButton tamanho="md" className="w-full md:w-auto" onClick={handleJogar}>
                JOGAR
              </PixelButton>
              <PixelButton tamanho="md" className="w-full md:w-auto" onClick={handleSalas}>
                SALAS
              </PixelButton>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full px-4 items-center justify-center">
              <PixelButton tamanho="md" className="w-full md:w-auto" onClick={handleCriarSala}>
                CRIAR SALA
              </PixelButton>
            </div>
          </div>
        </div>
      </BackgroundHero>
    </main>
  );
}
