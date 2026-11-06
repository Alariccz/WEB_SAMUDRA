"use client";

import * as React from "react";
import { Surface } from "./weather-utils/surface";
import { Well } from "./weather-utils/well";
import { useAwake } from "./weather-utils/awake";
import { Led } from "./weather-utils/led";
import { Rule } from "./weather-utils/rule";

/* ─────────────────────────────────────────────────────────
 * WEATHER: a custom block (an object). A raise slab with a dot-matrix sky sunk into a field well.
 *
 *   Weather.Root › Weather.Header (place, summary, LED, clock)
 *                › Weather.Sky (the well and its scene; children sit on its ground) › Weather.Now
 *                › Weather.Hours (dot glyph and temperature per slot)
 *                › Weather.Week (each day's low to high as lit dots on one shared scale)
 *   Weather      all of the above from props, in that order
 *   WeatherTile  Weather.Root(tile) › Weather.Sky(tile) › Weather.Now(tile)
 *
 * The sky is a description, not a picture: a `WeatherSky` names the time of day, the moon's
 * phase, the clouds (where, how big, how dark), rain, snow, thunder, mist, wind (strength and
 * direction), heat and birds, and the scene is drawn from it on the recipe's 8 pitch. `WEATHER_SKIES`
 * holds a sky per `WeatherKind`; spread one and change what you need ({ ...WEATHER_SKIES.snow,
 * wind: 0.9 } is a blizzard). The sun rides its arc to the hour and dawn and dusk warm the horizon;
 * after dark the moon, in its phase, crosses and the stars twinkle. Everything that moves steps one
 * frame every dot.frame; reduced motion, or animate={false}, holds one frame.
 * ───────────────────────────────────────────────────────── */

export type WeatherKind =
  | "clear"
  | "partly"
  | "cloud"
  | "rain"
  | "drizzle"
  | "storm"
  | "snow"
  | "sleet"
  | "mist"
  | "windy"
  | "heat";

/** A cloud in the sky: its centre (0–1 across and down to the horizon), its half-width in dots, and whether it is dark. */
export interface WeatherCloud {
  x: number;
  y: number;
  size: number;
  dark?: boolean;
}

/** What the sky shows. Every field is optional; amounts run 0–1. */
export interface WeatherSky {
  /** The clouds, drifting with the wind. */
  clouds?: WeatherCloud[];
  /** The clouds hide the sun, the moon and the stars. */
  overcast?: boolean;
  /** Rain under the clouds: 0.3 drizzle, 0.6 rain, 1 a downpour. */
  rain?: number;
  /** Snow falling across the sky. */
  snow?: number;
  /** Lightning from the clouds every few seconds. */
  thunder?: boolean;
  /** Bands of mist over the ground. */
  mist?: number;
  /** How hard the wind blows: the clouds drift faster and gusts streak across. */
  wind?: number;
  /** Which way the wind blows (default 1, left to right). */
  windFrom?: 1 | -1;
  /** Heat shimmering off the ground. */
  heat?: number;
  /** Birds crossing a daytime sky. */
  birds?: number;
  /** The moon's age, 0–1 (0 new, 0.5 full). Default: the phase on `date`, or full. */
  moonPhase?: number;
}

/** A sky for each kind; spread one and change what you need. */
export const WEATHER_SKIES: Record<WeatherKind, WeatherSky> = {
  clear: { birds: 2 },
  partly: {
    clouds: [
      { x: 0.18, y: 0.24, size: 3 },
      { x: 0.62, y: 0.42, size: 5 },
    ],
  },
  cloud: {
    overcast: true,
    clouds: [
      { x: 0.1, y: 0.24, size: 4 },
      { x: 0.45, y: 0.4, size: 5, dark: true },
      { x: 0.8, y: 0.2, size: 4 },
      { x: 0.65, y: 0.62, size: 3 },
    ],
  },
  drizzle: {
    overcast: true,
    rain: 0.3,
    clouds: [
      { x: 0.3, y: 0.2, size: 5 },
      { x: 0.75, y: 0.28, size: 4 },
    ],
  },
  rain: {
    overcast: true,
    rain: 0.6,
    clouds: [
      { x: 0.22, y: 0.2, size: 5, dark: true },
      { x: 0.68, y: 0.3, size: 5, dark: true },
    ],
  },
  storm: {
    overcast: true,
    rain: 1,
    thunder: true,
    wind: 0.5,
    clouds: [
      { x: 0.12, y: 0.18, size: 6, dark: true },
      { x: 0.52, y: 0.24, size: 6, dark: true },
      { x: 0.92, y: 0.14, size: 5, dark: true },
    ],
  },
  snow: {
    overcast: true,
    snow: 0.8,
    clouds: [
      { x: 0.25, y: 0.14, size: 5 },
      { x: 0.72, y: 0.2, size: 4 },
    ],
  },
  sleet: {
    overcast: true,
    snow: 0.4,
    rain: 0.4,
    clouds: [
      { x: 0.25, y: 0.16, size: 5, dark: true },
      { x: 0.7, y: 0.22, size: 4 },
    ],
  },
  mist: { mist: 0.8 },
  windy: { wind: 0.9, clouds: [{ x: 0.4, y: 0.26, size: 3 }] },
  heat: { heat: 1 },
};

/** One slot of the next hours. `temp` is in the unit you show. */
export interface WeatherHour {
  /** "Now", "12", "15"… */
  label: string;
  /** The hour of day it stands for (0–24), so night hours draw the moon. */
  hour: number;
  kind: WeatherKind;
  temp: number;
}

/** One day of the week. `low` and `high` are in the unit you show. */
export interface WeatherDay {
  /** "Today", "Sun", "Mon"… */
  name: string;
  kind: WeatherKind;
  low: number;
  high: number;
}

/* ── the sky ─────────────────────────────────────────────── */

const PITCH = 8;
const DOT = 6;
const FRAME_MS = 166;
const SUNRISE = 7.5;
const SUNSET = 19.5;
const FULL_MOON = Date.UTC(2026, 8, 26, 16, 49);
const SYNODIC = 29.530589;
const MS_PER_DAY = 86400000;

/** The moon's age on a date, 0–1 (0 new, 0.5 full). */
export function moonAge(date: Date) {
  const age = ((date.getTime() - FULL_MOON) / MS_PER_DAY / SYNODIC + 0.5) % 1;
  return age < 0 ? age + 1 : age;
}

/** The phase's name for an age: "Full moon", "Waxing crescent"… */
export function moonPhaseName(age: number) {
  return [
    "New moon",
    "Waxing crescent",
    "First quarter",
    "Waxing gibbous",
    "Full moon",
    "Waning gibbous",
    "Last quarter",
    "Waning crescent",
  ][Math.round(age * 8) % 8];
}

/** Whether a dot at (dx, dy) of a disc of radius r is lit at a moon age. */
function moonLit(dx: number, r: number, age: number) {
  const lit = (1 - Math.cos(age * 2 * Math.PI)) / 2;
  const nx = dx / r;
  return age < 0.5 ? nx >= 1 - 2 * lit : nx <= -(1 - 2 * lit);
}

export type WeatherSkyLayer =
  | "off"
  | "glow"
  | "star"
  | "moonDark"
  | "moon"
  | "sun"
  | "ray"
  | "heat"
  | "bird"
  | "snow"
  | "rain"
  | "bolt"
  | "cloud"
  | "cloudDark"
  | "fog"
  | "wind"
  | "hill"
  | "hz";
export const WEATHER_SKY_LAYERS: WeatherSkyLayer[] = [
  "off",
  "glow",
  "star",
  "moonDark",
  "moon",
  "sun",
  "ray",
  "heat",
  "bird",
  "snow",
  "rain",
  "bolt",
  "cloud",
  "cloudDark",
  "fog",
  "wind",
  "hill",
  "hz",
];

const SKY_PAINT: Record<WeatherSkyLayer, string> = {
  off: "fill-[#141b2d] opacity-40",
  glow: "fill-[#f59e0b] opacity-80",
  star: "fill-[#38bdf8]",
  moonDark: "fill-[#1e293b] opacity-60",
  moon: "fill-[#e2e8f0]",
  sun: "fill-[#fbbf24]",
  ray: "fill-[#f59e0b]",
  heat: "fill-[#fbbf24] opacity-50",
  bird: "fill-[#0ea5e9]",
  snow: "fill-[#ffffff]",
  rain: "fill-[#38bdf8]",
  bolt: "fill-[#fef08a]",
  cloud: "fill-[#94a3b8]",
  cloudDark: "fill-[#475569]",
  fog: "fill-[#64748b] opacity-70",
  wind: "fill-[#0284c7]",
  hill: "fill-[#0f172a]",
  hz: "fill-[#0284c7]",
};

const wrap = (v: number, n: number) => ((v % n) + n) % n;
const clamp = (v: number | undefined) => Math.min(1, Math.max(0, v ?? 0));

export interface WeatherSceneOptions {
  cols: number;
  rows: number;
  /** The horizon's row; the ground below it is left for words. */
  horizon: number;
  /** The time of day in hours. */
  hour: number;
  sky: WeatherSky;
  /** The frame. */
  tick?: number;
}

/**
 * One frame of a dot-matrix sky, as an SVG path per layer on an 8 pitch (6 dots). Draw them in
 * WEATHER_SKY_LAYERS order; Weather.Sky does, and you can too for a sky of your own size.
 */
export function weatherScene({
  cols,
  rows,
  horizon: hz,
  hour,
  sky,
  tick = 0,
}: WeatherSceneOptions) {
  const grid = new Map<string, WeatherSkyLayer>();
  const big = cols > 30;
  const put = (x: number, y: number, layer: WeatherSkyLayer) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= cols || y >= hz) return;
    grid.set(`${x},${y}`, layer);
  };
  const h = wrap(hour, 24);
  const day = h >= SUNRISE && h <= SUNSET;
  const td = (h - SUNRISE) / (SUNSET - SUNRISE);
  const tn = wrap(h - SUNSET, 24) / (24 - (SUNSET - SUNRISE));
  const arc = (t: number) => [
    3 + t * (cols - 7),
    hz - 1 - Math.sin(Math.PI * t) * (hz - (big ? 8 : 6)),
  ];
  const rain = clamp(sky.rain),
    snow = clamp(sky.snow),
    mist = clamp(sky.mist),
    wind = clamp(sky.wind),
    heat = clamp(sky.heat);
  const dir = sky.windFrom ?? 1;
  const covered = !!sky.overcast;

  // Dawn and dusk warm the dots along the horizon.
  if (day && (td < 0.1 || td > 0.9) && !covered) {
    for (let y = hz - 4; y < hz; y++)
      for (let x = 0; x < cols; x++) {
        if ((x + y) % 2 === 0 && (y >= hz - 2 || x % 4 === 0))
          put(x, y, "glow");
      }
  }
  if (!day && !covered) {
    for (let s = 0; s < (big ? 14 : 6); s++) {
      if (wrap(tick + s * 3, 9) !== 0)
        put(wrap(s * 17 + 5, cols), wrap(s * 7 + 1, hz - 4), "star");
    }
  }
  if (!covered) {
    if (day) {
      const r = big ? 3.5 : 2.6;
      const [px, py] = arc(td);
      const sx = Math.round(px),
        sy = Math.round(py);
      for (let dx = -4; dx <= 4; dx++)
        for (let dy = -4; dy <= 4; dy++)
          if (dx * dx + dy * dy <= r * r + 0.3) put(sx + dx, sy + dy, "sun");
      const dirs =
        wrap(tick, 4) < 2
          ? [
              [0, -1],
              [0, 1],
              [-1, 0],
              [1, 0],
            ]
          : [
              [-0.72, -0.72],
              [0.72, -0.72],
              [-0.72, 0.72],
              [0.72, 0.72],
            ];
      for (const [ddx, ddy] of dirs)
        for (let k = r + 1.6; k <= r + 2.8; k += 1)
          put(sx + ddx * k, sy + ddy * k, "ray");
      for (
        let b = 0;
        b < Math.min(3, Math.round(sky.birds ?? 0)) && (big || b < 1);
        b++
      ) {
        const bx =
          wrap(
            Math.floor(cols * 0.55) + b * 7 + dir * Math.floor(tick / 2),
            cols + 4,
          ) - 2;
        const by = (big ? 6 : 4) + b * 3;
        const up = wrap(tick, 2) === 0 ? 1 : 0;
        put(bx - 1, by - up, "bird");
        put(bx, by, "bird");
        put(bx + 1, by - up, "bird");
      }
    } else {
      // The moon in its phase: lit dots and the faint rest of the disc.
      const r = big ? 3.2 : 2.3;
      const age = sky.moonPhase ?? 0.5;
      const [qx, qy] = arc(tn);
      const mx = Math.round(qx),
        my = Math.round(qy);
      for (let dx = -4; dx <= 4; dx++)
        for (let dy = -4; dy <= 4; dy++) {
          if (dx * dx + dy * dy > r * r + 0.4) continue;
          put(mx + dx, my + dy, moonLit(dx, r, age) ? "moon" : "moonDark");
        }
    }
  }
  if (heat > 0) {
    for (let x = 1; x < cols; x += Math.max(2, Math.round(6 - heat * 2)))
      for (let y = hz - Math.round(3 + heat * 4); y < hz; y++) {
        if (wrap(y + tick, 3) === 0) put(x + wrap(y + tick, 2), y, "heat");
      }
  }
  if (snow > 0) {
    const flakes = Math.round(snow * (big ? 42 : 15));
    for (let f = 0; f < flakes; f++) {
      const sway =
        Math.round(Math.sin(tick / 3 + f)) +
        dir * Math.round((wind * 3 * Math.floor(tick / 2)) / 2);
      put(
        wrap(f * 13 + sway, cols),
        wrap(f * 7 + Math.floor(tick / 2), hz),
        "snow",
      );
    }
  }

  const drift = dir * tick * (0.25 + wind * 0.7);
  const clouds = (sky.clouds ?? []).map((c) => {
    const w = Math.max(2, Math.round(c.size * (0.55 + (0.45 * cols) / 46)));
    const cx = wrap(Math.round(c.x * cols + drift), cols + 2 * w + 4) - w - 2;
    return {
      cx,
      cy: Math.round(c.y * hz),
      w,
      layer: (c.dark ? "cloudDark" : "cloud") as WeatherSkyLayer,
    };
  });
  if (rain > 0) {
    const step = rain > 0.7 ? 1 : 2;
    const fast = rain > 0.7 ? 2 : 1;
    const gap = rain < 0.4 ? 6 : 4;
    const slant = rain > 0.7 || wind > 0.4;
    for (const { cx, cy, w } of clouds)
      for (let x = cx - w + 1; x <= cx + w - 1; x++) {
        if (wrap(x, step) !== 0) continue;
        for (let y = cy + 2; y < hz; y++)
          if (wrap(y - tick * fast + x * 3, gap) === 0)
            put(x - (slant ? dir * wrap(y, 2) : 0), y, "rain");
      }
  }
  if (
    sky.thunder &&
    clouds.length &&
    wrap(tick, 18) < 3 &&
    wrap(tick, 18) !== 1
  ) {
    const c0 = clouds[1] ?? clouds[0];
    let lx = c0.cx;
    for (let y = c0.cy + 2, step = 0; y < hz; y++, step++) {
      lx += wrap(step, 6) < 3 ? -1 : 1;
      put(lx, y, "bolt");
      put(lx + 1, y, "bolt");
    }
  }
  for (const { cx, cy, w, layer } of clouds) {
    for (let x = cx - w + 1; x <= cx + w - 1; x++) put(x, cy + 1, layer);
    for (let x = cx - w; x <= cx + w; x++) put(x, cy, layer);
    for (let x = cx - w + 1; x <= cx + w - 2; x++) put(x, cy - 1, layer);
    for (let x = cx - 1; x <= cx + 2; x++) put(x, cy - 2, layer);
    put(cx - w + 2, cy - 2, layer);
    put(cx - w + 3, cy - 2, layer);
    put(cx, cy - 3, layer);
    put(cx + 1, cy - 3, layer);
  }
  if (mist > 0) {
    const bands = (big ? [2, 5, 8, 11] : [2, 4, 7]).slice(
      0,
      Math.max(1, Math.round(mist * (big ? 4 : 3))),
    );
    bands.forEach((d, i) => {
      const way = i % 2 ? -1 : 1;
      for (let x = 0; x < cols; x++)
        if (wrap(x + way * Math.floor(tick / 2) + i * 3, 9) < 5)
          put(x, hz - d, "fog");
    });
  }
  if (wind > 0.3) {
    const gusts = Math.round(wind * (big ? 8 : 4));
    for (let g = 0; g < gusts; g++) {
      const wy = 2 + wrap(g * 5, hz - 4),
        len = 3 + (g % 3);
      const wx =
        dir > 0
          ? wrap(g * 17 + tick * 2, cols + 8) - 4
          : cols - (wrap(g * 17 + tick * 2, cols + 8) - 4) - len;
      for (let k = 0; k < len; k++) put(wx + k, wy, "wind");
      put(dir > 0 ? wx + len : wx - 1, wy - 1, "wind");
    }
  }
  // The hills on the horizon.
  for (let x = 0; x < cols; x++) {
    const hill =
      Math.max(0, Math.round(3 - Math.abs(x - cols * 0.8) / 2.4)) +
      Math.max(0, Math.round(1.6 - Math.abs(x - cols * 0.12) / 2.2));
    for (let y = hz - hill; y < hz; y++) grid.set(`${x},${y}`, "hill");
    grid.set(`${x},${hz}`, "hz");
  }

  const out = Object.fromEntries(
    WEATHER_SKY_LAYERS.map((l) => [l, ""]),
  ) as Record<WeatherSkyLayer, string>;
  const o = (PITCH - DOT) / 2;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      out[grid.get(`${x},${y}`) ?? "off"] +=
        `M${x * PITCH + o} ${y * PITCH + o}h${DOT}v${DOT}h-${DOT}Z`;
    }
  return out;
}

/* ── small dot glyphs for the hours and the week ─────────── */

type GlyphLayer =
  | "sun"
  | "moon"
  | "cloud"
  | "cloudDark"
  | "rain"
  | "bolt"
  | "fog"
  | "snow"
  | "wind";
const GLYPH_LAYERS: GlyphLayer[] = [
  "sun",
  "moon",
  "cloud",
  "cloudDark",
  "rain",
  "bolt",
  "fog",
  "snow",
  "wind",
];
const GLYPH_PAINT: Record<GlyphLayer, string> = {
  sun: "fill-[#fbbf24]",
  moon: "fill-[#e2e8f0]",
  cloud: "fill-[#94a3b8]",
  cloudDark: "fill-[#64748b]",
  rain: "fill-[#38bdf8]",
  bolt: "fill-[#fef08a]",
  fog: "fill-[#94a3b8]",
  snow: "fill-[#ffffff]",
  wind: "fill-[#0284c7]",
};
// 7 × 7 dots. S sun, M moon, C cloud, D dark cloud, R rain, Z bolt, F fog, N snow, W wind.
const MINI: Record<string, string[]> = {
  sun: [
    "...S...",
    ".S...S.",
    "..SSS..",
    "S.SSS.S",
    "..SSS..",
    ".S...S.",
    "...S...",
  ],
  moon: [
    "..MMM..",
    ".MM....",
    "MM.....",
    "MM.....",
    "MM.....",
    ".MM....",
    "..MMM..",
  ],
  partly: [
    "S.S....",
    ".SSS...",
    "SSSCC..",
    ".SCCCC.",
    "CCCCCCC",
    ".CCCCC.",
    ".......",
  ],
  partlyNight: [
    "MM.....",
    "M......",
    "M..CC..",
    "MMCCCC.",
    "CCCCCCC",
    ".CCCCC.",
    ".......",
  ],
  cloud: [
    ".......",
    "..CC...",
    ".CCCCC.",
    "CCCCCCC",
    "CCCCCCC",
    ".CCCCC.",
    ".......",
  ],
  drizzle: [
    "..CC...",
    ".CCCCC.",
    "CCCCCCC",
    ".CCCCC.",
    ".......",
    ".R...R.",
    "...R...",
  ],
  rain: [
    "..DD...",
    ".DDDDD.",
    "DDDDDDD",
    ".DDDDD.",
    ".......",
    ".R.R.R.",
    "R.R.R..",
  ],
  storm: [
    "..DD...",
    ".DDDDD.",
    "DDDDDDD",
    "..Z...R",
    ".ZZ..R.",
    "..Z....",
    ".Z.....",
  ],
  snow: [
    "N..N..N",
    ".......",
    ".N..N..",
    ".......",
    "N..N..N",
    ".......",
    ".N..N..",
  ],
  sleet: [
    "..DD...",
    ".DDDDD.",
    "DDDDDDD",
    ".DDDDD.",
    ".......",
    ".N.R.N.",
    "R.N.R..",
  ],
  mist: [
    "FFFFF..",
    ".......",
    "..FFFFF",
    ".......",
    "FFFFF..",
    ".......",
    ".FFFFFF",
  ],
  windy: [
    "WWWWW..",
    ".....W.",
    "WWWWW..",
    ".......",
    "WWWWWW.",
    "......W",
    "WWWW...",
  ],
  heat: [
    ".SSS...",
    "SSSSS..",
    ".SSS...",
    ".......",
    "S.S.S.S",
    ".S.S.S.",
    ".......",
  ],
};
const miniLayer: Record<string, GlyphLayer> = {
  S: "sun",
  M: "moon",
  C: "cloud",
  D: "cloudDark",
  R: "rain",
  Z: "bolt",
  F: "fog",
  N: "snow",
  W: "wind",
};

const isDay = (hour: number) => {
  const h = wrap(hour, 24);
  return h >= SUNRISE && h <= SUNSET;
};

export interface WeatherGlyphProps extends React.SVGAttributes<SVGSVGElement> {
  kind: WeatherKind;
  /** The hour it stands for: a clear or partly cloudy night draws the moon (default noon). */
  hour?: number;
}

/** A 7 × 7 dot glyph for a kind of weather, in the weather recipe's inks. */
export function WeatherGlyph({
  kind,
  hour = 12,
  className,
  ...props
}: WeatherGlyphProps) {
  const day = isDay(hour);
  const key =
    kind === "clear"
      ? day
        ? "sun"
        : "moon"
      : kind === "partly" && !day
        ? "partlyNight"
        : kind;
  const paths = Object.fromEntries(GLYPH_LAYERS.map((l) => [l, ""])) as Record<
    GlyphLayer,
    string
  >;
  (MINI[key] ?? MINI.cloud).forEach((row, y) =>
    [...row].forEach((c, x) => {
      const l = miniLayer[c];
      if (l) paths[l] += `M${x * 3 + 0.3} ${y * 3 + 0.3}h2.4v2.4h-2.4Z`;
    }),
  );
  return (
    <svg
      aria-hidden
      shapeRendering="crispEdges"
      viewBox="0 0 21 21"
      data-kind={kind}
      className={className ?? "block flex-none"}
      {...props}
    >
      {GLYPH_LAYERS.map((l) =>
        paths[l] ? (
          <path key={l} d={paths[l]} className={GLYPH_PAINT[l]} />
        ) : null,
      )}
    </svg>
  );
}

/* ── frames ─────────────────────────────────────────────── */

/** A stepped frame counter; holds at 0 under reduced motion or when `on` is false, and holds still while `awake` is false. */
function useFrames(on: boolean, awake: boolean) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!on || !awake || typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let id: number | undefined;
    const run = () => {
      window.clearInterval(id);
      id = reduced.matches
        ? undefined
        : window.setInterval(() => setTick((t) => t + 1), FRAME_MS);
    };
    run();
    reduced.addEventListener("change", run);
    return () => {
      window.clearInterval(id);
      reduced.removeEventListener("change", run);
    };
  }, [on, awake]);
  return on ? tick : 0;
}

const deg = (n: number) => `${Math.round(n)}°`;
type Size = "large" | "tile";
const SizeContext = React.createContext<Size>("large");

/* ── the parts ──────────────────────────────────────────── */

export interface WeatherRootProps extends React.HTMLAttributes<HTMLElement> {
  /** large: the full widget (400 × 560). tile: the small square (180). */
  size?: Size;
}

/** The slab: a raise surface at the card radius. */
const Root = React.forwardRef<HTMLElement, WeatherRootProps>(
  function WeatherRoot({ size = "large", className, ...props }, ref) {
    return (
      <SizeContext.Provider value={size}>
        <Surface
          ref={ref}
          as="section"
          material="raise"
          radius="card"
          data-size={size}
          className={className ? `flex flex-col p-6 gap-4 bg-[#050b18]/90 border border-cyan-500/20 backdrop-blur-2xl rounded-2xl ${className}` : "flex flex-col p-6 gap-4 bg-[#050b18]/90 border border-cyan-500/20 backdrop-blur-2xl rounded-2xl w-full max-w-[420px]"}
          {...props}
        />
      </SizeContext.Provider>
    );
  },
);

export interface WeatherHeaderProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  place: string;
  summary?: string;
  /** The LED beside "Live" (default true); false shows "Paused" on an idle LED. Null hides the status. */
  live?: boolean | null;
  /** The clock beside the status: "09:00". */
  clock?: string;
}

/** The place, one line of summary, and the status. */
function Header({
  place,
  summary,
  live = true,
  clock,
  className,
  ...props
}: WeatherHeaderProps) {
  return (
    <header className={className ? `flex items-start justify-between gap-4 ${className}` : "flex items-start justify-between gap-4"} {...props}>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-xl font-semibold tracking-tight text-white">{place}</h2>
        {summary && <p className="m-0 text-xs text-gray-400">{summary}</p>}
      </div>
      {live !== null && (
        <div className="flex items-center gap-2 text-xs">
          <Led kind={live ? "live" : "off"} />
          <span className="font-mono text-cyan-400 font-medium">
            {live ? "Live" : "Paused"}
          </span>
          {clock && <span className="font-mono text-gray-400">{clock}</span>}
        </div>
      )}
    </header>
  );
}

const GRID: Record<Size, { cols: number; rows: number; horizon: number }> = {
  large: { cols: 46, rows: 28, horizon: 21 },
  tile: { cols: 21, rows: 21, horizon: 13 },
};

export interface WeatherSkyProps extends React.HTMLAttributes<HTMLElement> {
  /** The time of day in hours (9.5 is 09:30). Moves the sun and the moon. */
  hour: number;
  /** A kind (drawn from WEATHER_SKIES) or a sky of your own. */
  sky: WeatherKind | WeatherSky;
  /** The day, for the moon's phase when the sky names none. */
  date?: Date;
  /** Step the frames (default true). Reduced motion holds one frame regardless. */
  animate?: boolean;
  /** How the sky reads to a screen reader: "Lisbon: sunny, 19°". Without it the sky is decoration. */
  label?: string;
}

/** The well with its dot-matrix scene; children (Weather.Now) sit on its ground. */
const Sky = React.forwardRef<HTMLElement, WeatherSkyProps>(
  function WeatherSkyPart(
    { hour, sky, date, animate = true, label, className, children, ...props },
    ref,
  ) {
    const size = React.useContext(SizeContext);
    const [watch, awake] = useAwake();
    const tick = useFrames(animate, awake);
    const well = React.useCallback(
      (el: HTMLElement | null) => {
        watch(el);
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [watch, ref],
    );
    const base = typeof sky === "string" ? WEATHER_SKIES[sky] : sky;
    const described: WeatherSky =
      base.moonPhase === undefined && date
        ? { ...base, moonPhase: moonAge(date) }
        : base;
    const g = GRID[size];
    const paths = weatherScene({ ...g, hour, sky: described, tick });
    return (
      <Well
        ref={well as any}
        variant="field"
        role={label ? "img" : undefined}
        aria-label={label}
        data-kind={typeof sky === "string" ? sky : "custom"}
        className={className ? `relative rounded-xl overflow-hidden h-[224px] bg-[#020612] border border-cyan-500/20 ${className}` : "relative rounded-xl overflow-hidden h-[224px] bg-[#020612] border border-cyan-500/20"}
        {...props}
      >
        <svg
          aria-hidden
          shapeRendering="crispEdges"
          viewBox={`0 0 ${g.cols * PITCH} ${g.rows * PITCH}`}
          className="absolute inset-0 block size-full"
        >
          {WEATHER_SKY_LAYERS.map((l) =>
            paths[l] ? (
              <path
                key={l}
                data-layer={l}
                d={paths[l]}
                className={SKY_PAINT[l]}
              />
            ) : null,
          )}
        </svg>
        {children}
      </Well>
    );
  },
);

export interface WeatherNowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** The temperature, in the unit you show. */
  temp: number;
  /** The condition in words: "Sunny". On a tile it is set engraved. */
  condition: string;
  /** One line under it: "Feels 18° · Rain 0% · 9 km/h". */
  readout?: string;
}

/** The temperature in the pixel face on the sky's ground, the condition and one readout beside it. */
function Now({
  temp,
  condition,
  readout,
  className,
  ...props
}: WeatherNowProps) {
  return (
    <div
      className={className ? `absolute inset-x-4 bottom-3 flex items-end justify-between z-10 ${className}` : "absolute inset-x-4 bottom-3 flex items-end justify-between z-10"}
      {...props}
    >
      <span className="font-mono text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{deg(temp)}</span>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-semibold text-cyan-300 drop-shadow">
          {condition}
        </span>
        {readout && <span className="text-xs text-gray-400 font-mono">{readout}</span>}
      </div>
    </div>
  );
}

export interface WeatherHoursProps extends Omit<
  React.OlHTMLAttributes<HTMLOListElement>,
  "children"
> {
  /** Up to six slots, now first. */
  hours: WeatherHour[];
}

/** The next hours: a label, a dot glyph and the temperature in the pixel face per slot. */
function Hours({ hours, className, ...props }: WeatherHoursProps) {
  return (
    <ol
      aria-label="Next hours"
      className={className ? `grid grid-cols-6 m-0 p-0 list-none gap-1 py-1 ${className}` : "grid grid-cols-6 m-0 p-0 list-none gap-1 py-1"}
      {...props}
    >
      {hours.slice(0, 6).map((h, i) => (
        <li
          key={`${h.label}-${i}`}
          aria-label={`${h.label}, ${deg(h.temp)}`}
          className="flex flex-col items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5"
        >
          <span className="text-[11px] font-mono text-gray-400">{h.label}</span>
          <WeatherGlyph
            kind={h.kind}
            hour={h.hour}
            className="size-5"
          />
          <span className="text-xs font-mono font-medium text-white">{deg(h.temp)}</span>
        </li>
      ))}
    </ol>
  );
}

const DAY_PAINT: Record<WeatherKind, string> = {
  clear: "fill-[#fbbf24]",
  partly: "fill-[#38bdf8]",
  heat: "fill-[#f59e0b]",
  cloud: "fill-[#94a3b8]",
  mist: "fill-[#64748b]",
  windy: "fill-[#0284c7]",
  drizzle: "fill-[#38bdf8]",
  rain: "fill-[#0ea5e9]",
  storm: "fill-[#a855f7]",
  sleet: "fill-[#e2e8f0]",
  snow: "fill-[#ffffff]",
};

export interface WeatherWeekProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "children"
> {
  /** Up to seven days, today first. */
  days: WeatherDay[];
  /** The shared scale, one dot a degree, in the unit you show (default 10–30; at most 21 degrees fit). */
  scale?: [number, number];
  /** The temperature now: a dark dot on today's row. */
  now?: number;
}

/** The week: each day's low to high as lit dots on one shared scale, coloured by that day's weather. */
function Week({
  days,
  scale = [20, 35],
  now,
  className,
  ...props
}: WeatherWeekProps) {
  const [lo, hi] = scale;
  const span = Math.min(20, Math.max(1, Math.round(hi - lo)));
  const dot = (t: number) =>
    `M${(Math.round(t) - lo) * PITCH + 1} 0h${DOT}v${DOT}h-${DOT}Z`;
  return (
    <ul
      aria-label="The week"
      className={className ? `flex flex-col m-0 p-0 list-none gap-2 ${className}` : "flex flex-col m-0 p-0 list-none gap-2"}
      {...props}
    >
      <li
        aria-hidden
        className="flex items-center justify-between text-[11px] font-mono text-gray-500 pb-1 border-b border-white/5"
      >
        <span className="w-14">7 Hari</span>
        <span className="w-5" />
        <span className="w-8 text-right">Min</span>
        <span className="flex-1 px-3 flex justify-between">
          <span>{deg(lo)}</span>
          <span>{deg(lo + span / 2)}</span>
          <span>{deg(lo + span)}</span>
        </span>
        <span className="w-8 text-left">Maks</span>
      </li>
      {days.slice(0, 7).map((d, i) => {
        let off = "";
        let lit = "";
        for (let t = lo; t <= lo + span; t++) {
          if (t >= d.low && t <= d.high) lit += dot(t);
          else off += dot(t);
        }
        const today = i === 0;
        return (
          <li
            key={`${d.name}-${i}`}
            aria-label={`${d.name}: low ${deg(d.low)}, high ${deg(d.high)}`}
            className="flex items-center justify-between text-xs py-0.5"
          >
            <span
              className={`w-14 font-medium ${today ? "text-cyan-400" : "text-gray-300"}`}
            >
              {d.name}
            </span>
            <WeatherGlyph kind={d.kind} className="size-4" />
            <span className="w-8 text-right font-mono text-gray-400">
              {deg(d.low)}
            </span>
            <svg
              aria-hidden
              shapeRendering="crispEdges"
              viewBox={`0 0 ${(span + 1) * PITCH} ${DOT}`}
              className="block flex-1 mx-3 h-2"
            >
              <path d={off} className="fill-white/10" />
              <path data-part="range" d={lit} className={DAY_PAINT[d.kind]} />
              {today && now !== undefined && (
                <path data-part="now" d={dot(now)} className="fill-white" />
              )}
            </svg>
            <span className="w-8 text-left font-mono font-semibold text-white">
              {deg(d.high)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── the widgets, composed ──────────────────────────────── */

export interface WeatherProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  place: string;
  summary?: string;
  /** The time of day in hours (9.5 is 09:30). Moves the sun and the moon. */
  hour: number;
  /** A kind, or a sky of your own (see WeatherSky). */
  sky: WeatherKind | WeatherSky;
  /** The condition in words: "Sunny". */
  condition: string;
  /** The temperature now, in the unit you show. */
  temp: number;
  feels?: number;
  /** The chance of rain, 0–100. */
  rain?: number;
  /** The wind in words: "9 km/h". */
  wind?: string;
  live?: boolean | null;
  clock?: string;
  /** The day, for the moon's phase. */
  date?: Date;
  hours?: WeatherHour[];
  days?: WeatherDay[];
  scale?: [number, number];
  animate?: boolean;
}

/** The large weather widget: Weather.Root with a header, the sky, the next hours and the week. */
const WeatherWidget = React.forwardRef<HTMLElement, WeatherProps>(
  function Weather(
    {
      place,
      summary,
      hour,
      sky,
      condition,
      temp,
      feels,
      rain,
      wind,
      live,
      clock,
      date,
      hours = [],
      days = [],
      scale,
      animate,
      ...props
    },
    ref,
  ) {
    const readout = [
      feels !== undefined ? `Feels ${deg(feels)}` : null,
      rain !== undefined ? `Rain ${Math.round(rain)}%` : null,
      wind ?? null,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <Root ref={ref} aria-label={`Weather in ${place}`} {...props}>
        <Header place={place} summary={summary} live={live} clock={clock} />
        <Sky
          hour={hour}
          sky={sky}
          date={date}
          animate={animate}
          label={`${place}: ${condition}, ${deg(temp)}`}
        >
          <Now
            temp={temp}
            condition={condition}
            readout={readout || undefined}
          />
        </Sky>
        {hours.length > 0 && <Hours hours={hours} />}
        {days.length > 0 && (
          <>
            <Rule orientation="horizontal" />
            <Week days={days} scale={scale} now={temp} />
          </>
        )}
      </Root>
    );
  },
);

export const Weather = Object.assign(WeatherWidget, {
  Root,
  Header,
  Sky,
  Now,
  Hours,
  Week,
  Glyph: WeatherGlyph,
});

export default Weather;
