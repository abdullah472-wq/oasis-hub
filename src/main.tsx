import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  },
  onRegisteredSW(_swUrl, registration) {
    registration?.update();

    window.setInterval(() => {
      registration?.update();
    }, 60 * 60 * 1000);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
