"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getContent } from "@/data/content";
import { useLocale } from "@/i18n/LocaleProvider";
import ArchitectureLines from "@/components/ui/ArchitectureLines";
import { SCROLLER_SELECTOR } from "@/lib/motion/scroller";

// Brand story text screen. The image gallery that used to follow it became the "以手成形" carousel (CraftMoments, 2026-10-01).
export default function Manifesto() {
  const { manifesto } = getContent(useLocale());
  const [title, ...body] = manifesto.paragraphs;
  // each character fades in with the scroll; the text itself is read once by screen readers
  const chars = (text: string) => <><span className="sr-only">{text}</span><span aria-hidden="true">{Array.from(text).map((char, j) => <span key={j} className="story-char">{char}</span>)}</span></>;
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const scroller = document.querySelector<HTMLElement>(SCROLLER_SELECTOR);
      if (!scroller) return;
      const chars = el.querySelectorAll<HTMLElement>(".story-char");
      gsap.set(chars, { opacity: .2 });
      gsap.to(chars, {
        opacity: 1, stagger: .035, duration: .15, ease: "none",
        scrollTrigger: { scroller, trigger: el.querySelector(".story-copy"), start: "top 80%", end: "bottom 80%", scrub: true, invalidateOnRefresh: true },
      });
      const brush = el.querySelector(".story-architecture");
      if (brush) gsap.fromTo(brush, { yPercent: 12 }, { yPercent: -18, ease: "none", scrollTrigger: { scroller, trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, el);
    document.fonts.ready.then(() => { if (el.isConnected) ScrollTrigger.refresh(); });
    return () => { media.revert(); };
  }, []);

  return (
    <section id="manifesto" ref={root} className="brand-story" aria-labelledby="story-heading">
      <div className="story-message">
        <div className="story-architecture" aria-hidden="true"><ArchitectureLines variant={2} /><span>LINE / FORM / LIFE</span></div>
        {/* After the text-media block of jakobsencopenhagen.com (user 2026-10-02: 「標題跟內文分開欄位，並將內文字改小一點」): the title in
            the first columns, the paragraphs set in beside it in smaller type, both starting level. */}
        <div className="story-text-column story-copy">
          <h2 id="story-heading" className="story-title tc">{chars(title)}</h2>
          <div className="story-body tc">
            {body.map((text) => <p key={text}>{chars(text)}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}
