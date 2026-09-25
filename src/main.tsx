import { createRoot } from "react-dom/client";
import { Router } from "./router/index.tsx";
import "./main.css";
createRoot(document.getElementById("root")!).render(
  <Router />
);
