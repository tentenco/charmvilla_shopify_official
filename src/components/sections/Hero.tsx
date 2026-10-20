"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/data/content";
import { useT } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/config";
import ArchitectureLines from "@/components/ui/ArchitectureLines";

export default function Hero() {
  const { lang, t } = useT();
  const { hero } = getContent(lang);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const hold = useRef(false);
  const visible = useRef(true);
  const touch = useRef<number | null>(null);
  const studies = [
    { name: t("曲線，盛裝日常。", "A curve holds the everyday."), word: t("形之迴旋", "The spiral"), tone: "clay" },
    { name: t("光影，停留片刻。", "A moment held in light."), word: t("光之穹頂", "The canopy"), tone: "olive" },
    { name: t("秩序，留下手感。", "Geometry meets the hand."), word: t("線之構成", "The geometry"), tone: "gold" },
  ];
  const move = (direction: number) => setActive(value => (value + direction + hero.slides.length) % hero.slides.length);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; }, { threshold: .2 });
    observer.observe(el);
    const timer = window.setInterval(() => {
      if (!paused && !hold.current && visible.current && !document.hidden && !media.matches && !el.contains(document.activeElement)) {
        setActive(value => (value + 1) % 3);
      }
    }, 8000);
    return () => { window.clearInterval(timer); observer.disconnect(); };
  }, [paused]);

  return <section ref={root} id="hero" className={`museum-hero museum-tone--${studies[active].tone}`} aria-label={t("藝術與日常，三件展品", "Art and the everyday, three pieces on show")} aria-roledescription={t("輪播", "carousel")}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
    onPointerMove={event => {
      if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--museum-x", `${(event.clientX - bounds.left - bounds.width / 2) * .012}px`);
      event.currentTarget.style.setProperty("--museum-y", `${(event.clientY - bounds.top - bounds.height / 2) * .012}px`);
    }} onPointerLeave={event => { event.currentTarget.style.setProperty("--museum-x", "0px"); event.currentTarget.style.setProperty("--museum-y", "0px"); }}>
    <div className="museum-architecture" aria-hidden="true" data-hero-reveal="">
      {studies.map((study, i) => <div key={study.tone} className={`museum-drawing museum-tone--${study.tone}`} data-active={active === i}><ArchitectureLines variant={i} /></div>)}
    </div>
    <div className="museum-intro" data-hero-reveal="">
      <p className="museum-kicker">ART / CRAFT / EVERYDAY</p>
      <h1 className="museum-title">Art<br /><span>as Life.</span></h1>
      <p className="museum-subtitle tc">{t("讓日常，成為一件作品。", "A place for art in everyday life.")}</p>
      <p className="museum-description tc">{t("從建築的線條，到掌心的細節。\n在一盞茶、一件器物之間，收藏生活的美。", "From architectural lines to the detail in your hand.\nA little art, in a cup of tea or an everyday object.")}</p>
      <Link href={localeHref(lang, "/collections/all")} className="museum-explore">{t("探索作品", "Explore the collection")}<span aria-hidden="true">↗</span></Link>
    </div>
    <div className="museum-objects" data-hero-reveal="" onPointerEnter={() => { hold.current = true; }} onPointerLeave={() => { hold.current = false; }}
      onTouchStart={event => { touch.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touch.current !== null) { const delta = event.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1); } touch.current = null; }}>
      {hero.slides.map((slide, i) => <figure key={slide.id} className="museum-object" data-active={active === i} aria-hidden={active !== i}>
        <Link href={localeHref(lang, slide.href)} tabIndex={active === i ? 0 : -1} aria-label={t(`探索${slide.label}`, `Explore ${slide.label}`)}>
          <Image src={slide.src} alt={slide.alt} width={slide.w} height={slide.h} sizes="(max-width:767px) 65vw, 32vw" preload={i === 0} loading={i === 0 ? undefined : "eager"} draggable={false} />
        </Link>
        <figcaption><span>{String(i + 1).padStart(2, "0")} / {slide.en}</span><span>{slide.label}</span></figcaption>
      </figure>)}
    </div>
    <div className="museum-bottom" data-hero-reveal="">
      <a className="museum-scroll" href="#manifesto"><span aria-hidden="true">↓</span>{t("沿著線條，走進日常", "Follow the lines into everyday life")}</a>
      <div className="museum-study"><span>FORM {String(active + 1).padStart(2, "0")}</span><p>{studies[active].word}</p></div>
      <div className="museum-controls" aria-label={t("選擇展品", "Choose a piece")}>
        {hero.slides.map((slide, i) => <button key={slide.id} type="button" aria-pressed={active === i} aria-label={t(`觀看${slide.label}`, `View ${slide.label}`)} onClick={() => setActive(i)}><span>{String(i + 1).padStart(2, "0")}</span></button>)}
        <button type="button" className="museum-pause" aria-label={paused ? t("繼續輪播", "Play slideshow") : t("暫停輪播", "Pause slideshow")} onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
      </div>
    </div>
    <span className="museum-edge-label" aria-hidden="true">CHARM VILLA — OBJECTS & SPACES</span>
  </section>;
}
