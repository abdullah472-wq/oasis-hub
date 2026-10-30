import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    const isNewRoute = lastPathnameRef.current !== pathname;
    lastPathnameRef.current = pathname;

    if (!hash) {
      // Normal route change without anchor: scroll cleanly to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const adminMain = document.getElementById("admin-main");
      if (adminMain) {
        adminMain.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      return;
    }

    // Anchor hash navigation (e.g. #reviews, #fee-structure, #boards, #campus-facilities)
    const sectionId = hash.replace(/^#/, "");

    const scrollToAnchor = (smooth = true) => {
      const el = document.getElementById(sectionId);
      if (!el) return false;

      const nav = document.querySelector("nav");
      const navHeight = nav ? Math.min(nav.offsetHeight, 100) : 80;
      const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navHeight - 16);

      window.scrollTo({
        top: targetY,
        behavior: smooth ? "smooth" : "auto",
      });
      return true;
    };

    // Staggered attempts to account for asynchronous data loading & DOM expansion
    const timers = [
      setTimeout(() => scrollToAnchor(!isNewRoute), 30),
      setTimeout(() => scrollToAnchor(true), 150),
      setTimeout(() => scrollToAnchor(true), 400),
      setTimeout(() => scrollToAnchor(true), 800),
      setTimeout(() => scrollToAnchor(true), 1400),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
