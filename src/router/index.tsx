import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/home";
import { CreateRoom } from "../pages/createRoom";
import { Rooms } from "../pages/rooms";
import { Lobby } from "../pages/lobby";
import { Game } from "../pages/game";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/createRoom" element={<CreateRoom />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}
