import { useEffect, useState } from "react";

export const useScreenWidth = () => {
  const [width, setWidth] = useState(window?.innerWidth ?? 0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};
