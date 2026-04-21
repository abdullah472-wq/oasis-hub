import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Clean up any previously registered service workers so old cached bundles
// cannot keep serving a stale app shell after a cPanel deployment.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
  });
}

// Recover from stale chunk errors after a fresh deploy by forcing one reload.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
