import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import Wireframe from "@/imports/Wireframe";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 9112;

function getScale() {
  return typeof window !== "undefined"
    ? Math.min(window.innerWidth / DESIGN_WIDTH, 1)
    : 1;
}

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(getScale);

  // Keep scale in sync with viewport resize
  useEffect(() => {
    const onResize = () => setScale(getScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Always reads live window width so stale closures in click handler aren't a problem
  const scrollToText = (searchText: string) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const allP = Array.from(document.querySelectorAll("p"));
    const target = allP.find((p) => (p.textContent || "").includes(searchText));
    if (target) {
      const liveScale = getScale();
      const scrollerRect = scroller.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset =
        targetRect.top - scrollerRect.top + scroller.scrollTop - 80 * liveScale;
      scroller.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
    }
  };

  // Wire up cursor styles and click-to-scroll navigation
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const clickMap: Record<string, string> = {
      Collections: "Authentic clay creations that make a statement",
      "The Process": "The Journey",
      Inquiry: "Begin your",
      "Discover More": "The Journey",
      "Amma ki Kahaniyan": "Ek Ujli Si Dua Lamp",
      Gharonda: "Gharonda Planter",
      "Personalised Gifts": "Plated Memories",
      Accessories: "Charms",
    };

    Array.from(scroller.querySelectorAll("p")).forEach((p) => {
      if (Object.keys(clickMap).includes((p.textContent || "").trim())) {
        let el: HTMLElement | null = p.parentElement;
        for (let i = 0; i < 6 && el && el !== scroller; i++) {
          el.style.cursor = "pointer";
          el = el.parentElement;
        }
      }
    });

    const handleClick = (e: MouseEvent) => {
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== scroller) {
        if (el.tagName === "P") {
          const text = (el.textContent || "").trim();
          if (clickMap[text]) {
            e.preventDefault();
            scrollToText(clickMap[text]);
            return;
          }
        }
        el = el.parentElement;
      }
    };

    scroller.addEventListener("click", handleClick);
    return () => scroller.removeEventListener("click", handleClick);
  }, []);

  // Wrapper div matches the *scaled* size so the scroller scrolls the right distance
  const scaledWidth = DESIGN_WIDTH * scale;
  const scaledHeight = DESIGN_HEIGHT * scale;

  return (
    <div
      ref={scrollerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Outer wrapper: occupies scaled document size in layout */}
      <div style={{ width: scaledWidth, height: scaledHeight, overflow: "hidden" }}>
        {/* Inner div: full design size, scaled down via transform */}
        <div
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            overflow: "hidden",
          }}
        >
          <Wireframe />
        </div>
      </div>
      <Toaster position="bottom-center" richColors />
    </div>
  );
}
