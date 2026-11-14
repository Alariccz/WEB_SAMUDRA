"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  imageUrl?: string;
  href?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  onItemClick?: (item: CarouselItem, index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 460;
const RADIUS_Y = 125;

function getItemPosition(
  index: number,
  activeIndex: number,
  total: number,
  radiusX = RADIUS_X,
  radiusY = RADIUS_Y,
) {
  if (total <= 0) return null;
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * radiusX;
  const y = -Math.cos(angle) * radiusY;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = distance === 0 ? 1 : Math.max(0.72, 1 - (distance / maxDistance) * 0.28);
  const opacity = distance === 0 ? 1 : distance === 1 ? 0.82 : 0.48;
  const rotate = adjustedOffset * 3.2;
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, rotate, zIndex, adjustedOffset };
}

const CIRCULAR_CAROUSEL_STYLES = `
  .cc-root {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 18px 0 8px;
    outline: none;
    user-select: none;
  }

  .cc-track {
    position: relative;
    height: 455px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .cc-track::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 42%;
    width: 480px;
    height: 280px;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      ellipse at center,
      rgba(56, 189, 248, 0.14) 0%,
      transparent 70%
    );
    filter: blur(28px);
    pointer-events: none;
    z-index: 0;
  }

  .cc-card {
    position: absolute;
    left: 50%;
    top: 61%;
    width: 344px;
    height: 336px;
    margin-left: -172px;
    margin-top: -168px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 20px;
    padding: 0;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(255, 255, 255, 0.04) 40%,
      rgba(56, 189, 248, 0.10) 100%
    ), rgba(14, 34, 56, 0.55);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      0 20px 48px rgba(0, 0, 0, 0.35),
      0 0 30px rgba(56, 189, 248, 0.12),
      inset 0 1px 2px 0 rgba(255, 255, 255, 0.45),
      inset 0 -1px 1px 0 rgba(0, 210, 255, 0.22);
    cursor: pointer;
    text-align: left;
    color: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
    transform-origin: center center;
  }

  .cc-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 25%,
      rgba(0, 210, 255, 0.9) 60%,
      transparent 100%
    );
    z-index: 25;
    pointer-events: none;
  }

  .cc-card--active {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow:
      0 24px 56px rgba(0, 0, 0, 0.45),
      0 0 36px rgba(56, 189, 248, 0.18),
      inset 0 1px 2px 0 rgba(255, 255, 255, 0.55),
      inset 0 -1px 1px 0 rgba(0, 210, 255, 0.25);
  }

  .cc-card--inactive {
    filter: brightness(0.78) saturate(0.9);
  }

  .cc-card:hover {
    border-color: rgba(0, 210, 255, 0.7);
    filter: brightness(1.03);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.45),
      0 0 45px rgba(0, 210, 255, 0.35),
      inset 0 1px 2px 0 rgba(255, 255, 255, 0.7);
  }

  .cc-card__graphic {
    position: relative;
    height: 230px;
    flex-shrink: 0;
    overflow: hidden;
    background: #081a2c;
  }

  .cc-card__graphic::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(2, 6, 18, 0.15) 0%, rgba(2, 8, 22, 0.35) 100%);
    pointer-events: none;
  }

  .cc-card__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0.95;
  }

  .cc-card:hover .cc-card__img {
    transform: scale(1.06);
    opacity: 1;
  }

  .cc-card__fade-top {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(2, 7, 18, 0.25) 0%, transparent 40%);
    pointer-events: none;
  }

  .cc-card__fade-bottom {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(2, 8, 20, 0.45) 0%, rgba(2, 8, 20, 0.1) 45%, transparent 100%);
    pointer-events: none;
  }

  .cc-card__content {
    position: relative;
    z-index: 20;
    margin-top: -92px;
    flex: 1;
    padding: 34px 24px 22px;
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 28%, black 45%, black 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 28%, black 45%, black 100%);
    background: linear-gradient(
      180deg,
      rgba(14, 34, 56, 0) 0%,
      rgba(14, 34, 56, 0.45) 25%,
      rgba(12, 30, 50, 0.78) 55%,
      rgba(10, 24, 42, 0.92) 100%
    );
    border-top: none;
    box-shadow: none;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    transition: background 0.3s ease;
  }

  .cc-card:hover .cc-card__content {
    background: linear-gradient(
      180deg,
      rgba(14, 34, 56, 0) 0%,
      rgba(14, 34, 56, 0.52) 25%,
      rgba(12, 30, 50, 0.85) 55%,
      rgba(10, 24, 42, 0.96) 100%
    );
  }

  .cc-card__eyebrow {
    display: block;
    font: 600 11px/1 'JetBrains Mono', monospace;
    color: #38bdf8;
    margin-bottom: 7px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cc-card__title {
    font: 600 19px/1.3 'Inter', sans-serif;
    letter-spacing: -0.015em;
    color: #ffffff;
    margin: 0 0 8px;
    transition: color 0.2s ease;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cc-card:hover .cc-card__title {
    color: #38bdf8;
  }

  .cc-card__desc {
    font: 400 13px/1.6 'Inter', sans-serif;
    color: #b8cadc;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .cc-center {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
    z-index: 1;
  }

  .cc-center__num {
    font-family: 'Inter', sans-serif;
    font-size: 46px;
    font-weight: 300;
    letter-spacing: -0.04em;
    line-height: 1;
    color: rgba(248, 250, 252, 0.94);
    text-shadow: 0 0 32px rgba(0, 210, 255, 0.32);
  }

  .cc-center__total {
    margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(184, 202, 220, 0.78);
  }

  .cc-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    z-index: 6;
    margin-top: 2px;
  }

  .cc-btn {
    display: flex;
    height: 42px;
    width: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid rgba(125, 211, 252, 0.32);
    background: rgba(11, 27, 45, 0.58);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
    color: #e2e8f0;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  }

  .cc-btn:hover {
    background: rgba(14, 116, 144, 0.42);
    border-color: rgba(0, 210, 255, 0.68);
    color: #ffffff;
    box-shadow: 0 0 22px rgba(0, 210, 255, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.28);
  }

  .cc-dots {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .cc-dot {
    height: 7px;
    border-radius: 999px;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cc-dot--active {
    width: 28px;
    background: #00d2ff;
    box-shadow: 0 0 12px rgba(0, 210, 255, 0.75);
  }

  .cc-dot--inactive {
    width: 7px;
    background: rgba(148, 163, 184, 0.32);
  }

  .cc-dot--inactive:hover {
    background: rgba(56, 189, 248, 0.6);
  }

  @media (max-width: 960px) {
    .cc-track {
      height: 410px;
    }
    .cc-card {
      width: 296px;
      height: 304px;
      margin-left: -148px;
      margin-top: -152px;
    }
    .cc-card__graphic {
      height: 204px;
    }
  }

  @media (max-width: 720px) {
    .cc-track {
      height: 375px;
    }
    .cc-card {
      width: 256px;
      height: 274px;
      margin-left: -128px;
      margin-top: -137px;
    }
    .cc-card__graphic {
      height: 184px;
    }
    .cc-card__content {
      margin-top: -80px;
      padding: 28px 18px 18px;
    }
    .cc-card__title {
      font-size: 16px;
    }
    .cc-card__desc {
      font-size: 12px;
    }
    .cc-center__num {
      font-size: 40px;
    }
  }
`;

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  onItemClick,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [compact, setCompact] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (total <= 0) return;
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused || total <= 1) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next, total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  if (!items || total === 0) return null;

  const activeItem = items[activeIndex] || items[0];
  const radiusX = compact ? 175 : RADIUS_X;
  const radiusY = compact ? 88 : RADIUS_Y;

  const handleCardClick = (item: CarouselItem, i: number) => {
    goTo(i);
    onItemClick?.(item, i);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "cc-root relative flex flex-col items-center justify-center gap-8 outline-none",
        className,
      )}
    >
      <style>{CIRCULAR_CAROUSEL_STYLES}</style>

      {/* Circular track */}
      <div className="cc-track relative h-[280px] w-full max-w-lg">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total, radiusX, radiusY);
            if (!pos) return null;

            const isActive = i === activeIndex;

            return (
              <motion.button
                key={item.id}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  rotate: pos.rotate,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleCardClick(item, i)}
                aria-label={`Buka panduan: ${item.title}`}
                aria-selected={isActive}
                role="option"
                className={cn(
                  "cc-card",
                  isActive ? "cc-card--active" : "cc-card--inactive",
                )}
              >
                <div className="cc-card__graphic">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="cc-card__img"
                    />
                  ) : null}
                  <div className="cc-card__fade-top" />
                  <div className="cc-card__fade-bottom" />
                </div>

                <div className="cc-card__content">
                  <span className="cc-card__eyebrow">
                    {item.tag ? `${item.tag} · Panduan Evakuasi` : "Panduan Evakuasi"}
                  </span>
                  <h3 className="cc-card__title">{item.title}</h3>
                  <p className="cc-card__desc">{item.description}</p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Center content */}
        <motion.div
          key={activeItem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="cc-center"
        >
          <span className="cc-center__num">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="cc-center__total">
            of {String(total).padStart(2, "0")}
          </span>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="cc-controls flex items-center gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Langkah sebelumnya"
          className="cc-btn"
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Dot indicators */}
        <div className="cc-dots flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "cc-dot",
                i === activeIndex ? "cc-dot--active" : "cc-dot--inactive",
              )}
              aria-label={`Ke langkah ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Langkah selanjutnya"
          className="cc-btn"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;
