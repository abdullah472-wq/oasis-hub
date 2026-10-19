import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash is present (such as navigating to #reviews), do not force scroll to top
    if (hash) {
      return;
    }

    window.scrollTo(0, 0);
    const adminMain = document.getElementById("admin-main");
    if (adminMain) {
      adminMain.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
