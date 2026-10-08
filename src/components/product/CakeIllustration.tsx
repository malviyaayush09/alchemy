import { brand } from "@/config/brand";

/**
 * Drawn stand-in for a cake that has no photograph yet: an entremet on a white
 * stand, coloured and decorated per cake. Pure SVG (no download, no layout
 * shift). It is an illustration, never presented as a photo of the product.
 */

type Topping = "curls" | "raspberries" | "blueberries" | "hazelnuts" | "pistachio" | "fruit" | "flakes" | "saffron" | "heart" | "crumbs" | "flecks" | "dollops";

type Look = {
  body: string;
  top: string;
  band?: string;
  drip?: string;
  layers?: string;
  pullUp?: boolean;
  toppings: Topping[];
};

const looks: Record<string, Look> = {
  "signature-belgian-chocolate": { body: "#4a2a1f", top: "#3b2018", toppings: ["curls"] },
  "nutella-fudge": { body: "#5c3526", top: "#6b3e2b", drip: "#4a2a1f", toppings: ["hazelnuts"] },
  "blueberry-rare-cheesecake": { body: "#f1e4cf", top: "#5d3b6e", band: "#c9a66b", drip: "#5d3b6e", toppings: ["blueberries"] },
  "coconut-pineapple": { body: "#fbf3e2", top: "#f1c74f", toppings: ["fruit", "flakes"] },
  "salted-caramel": { body: "#c48a4a", top: "#a8652a", drip: "#a8652a", toppings: ["flecks", "dollops"] },
  "white-chocolate-raspberry": { body: "#f6eee3", top: "#f8f1e7", toppings: ["dollops", "raspberries"] },
  "berry-heart": { body: "#a8262f", top: "#b82e38", toppings: ["heart", "raspberries", "blueberries"] },
  "russian-medovik": { body: "#d7a15a", top: "#e2b673", layers: "#f6e7c8", toppings: ["crumbs"] },
  "rasmalai-tres-leches": { body: "#fbf1dc", top: "#fff7e8", toppings: ["dollops", "saffron", "pistachio"] },
  "red-velvet-pull-up": { body: "#a3242f", top: "#f6efe4", layers: "#f6efe4", pullUp: true, toppings: ["crumbs"] },
  "raspberry-pistachio-pull-up": { body: "#a7b56a", top: "#f5ece0", layers: "#f5ece0", pullUp: true, toppings: ["raspberries", "pistachio"] },
  "chocolate-pull-up": { body: "#5a3324", top: "#6a3d2a", layers: "#e9d6bd", pullUp: true, toppings: ["curls"] },
};

const fallbackLook: Look = { body: "#5a3324", top: "#4a2a1f", toppings: ["curls"] };

/** Mix a #rrggbb colour toward black (amt < 0) or white (amt > 0). */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt));
  return `#${ch.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Geometry (viewBox 400×400): cake cylinder on a stand.
const CX = 200;
const RX = 96;
const RY = 32;
const T = 182; // cake top
const B = 266; // cake bottom
const frontY = (x: number, y: number) => y + RY * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));
const arc = (y: number) => `M${CX - RX},${y} A${RX},${RY} 0 0 0 ${CX + RX},${y}`;

// Fixed scatter positions on the top surface (relative to centre), so every render is identical.
const spots: [number, number][] = [
  [0, 0], [-34, -8], [30, -11], [-14, 13], [18, 14], [-52, 4], [50, 3], [-4, -18], [38, 13], [-38, 14], [8, -6], [-22, -17],
];

function Toppings({ kinds, look }: { kinds: Topping[]; look: Look }) {
  return (
    <g>
      {kinds.map((k) => {
        switch (k) {
          case "dollops":
            return Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const x = CX + Math.cos(a) * 78;
              const y = T + Math.sin(a) * 23;
              return (
                <g key={`d${i}`}>
                  <ellipse cx={x} cy={y} rx="9" ry="7" fill={shade(look.top, 0.55)} />
                  <ellipse cx={x - 2} cy={y - 2.5} rx="4" ry="2.5" fill="#fff" opacity="0.7" />
                </g>
              );
            });
          case "curls":
            return [[-26, -2, -20], [8, -6, 25], [30, 6, -35], [-6, 9, 60], [-40, 8, 10]].map(([dx, dy, r], i) => (
              <g key={`c${i}`} transform={`translate(${CX + dx},${T + dy * 1.4 - 4}) rotate(${r})`}>
                <ellipse rx="20" ry="8" fill={shade(look.top, -0.25)} />
                <ellipse rx="20" ry="8" fill="none" stroke={shade(look.top, 0.25)} strokeWidth="1.4" />
                <ellipse cx="-2" cy="-1.5" rx="9" ry="2.6" fill={shade(look.top, 0.35)} opacity="0.7" />
              </g>
            ));
          case "raspberries":
            return spots.slice(0, 5).map(([dx, dy], i) => (
              <g key={`r${i}`} transform={`translate(${CX + dx * 0.9 + 6},${T + dy * 0.8 - 5})`}>
                <circle r="7.5" fill="#b72a45" />
                {[[-3, -2], [2, -3], [3, 2], [-2, 3], [0, 0]].map(([x, y], j) => (
                  <circle key={j} cx={x} cy={y} r="2" fill="#d4475f" />
                ))}
              </g>
            ));
          case "blueberries":
            return spots.slice(5, 11).map(([dx, dy], i) => (
              <g key={`b${i}`} transform={`translate(${CX + dx * 0.8},${T + dy * 0.8 - 4})`}>
                <circle r="6" fill="#33386e" />
                <circle cx="-2" cy="-2" r="2" fill="#7f86c4" opacity="0.8" />
              </g>
            ));
          case "hazelnuts":
            return spots.slice(0, 7).map(([dx, dy], i) => (
              <g key={`h${i}`} transform={`translate(${CX + dx},${T + dy - 5})`}>
                <ellipse rx="8" ry="7" fill="#9b6a3c" />
                <ellipse cx="0" cy="-5" rx="6" ry="2.5" fill="#6e4524" />
                <ellipse cx="-2.5" cy="-1" rx="2.5" ry="1.6" fill="#c99662" />
              </g>
            ));
          case "pistachio":
            return spots.map(([dx, dy], i) => (
              <ellipse key={`p${i}`} cx={CX + dx * 1.1 + 3} cy={T + dy * 0.9 - 2} rx="4" ry="1.6" transform={`rotate(${(i * 47) % 180} ${CX + dx * 1.1 + 3} ${T + dy * 0.9 - 2})`} fill={i % 2 ? "#8fae4f" : "#b5c96c"} />
            ));
          case "fruit":
            return spots.slice(0, 9).map(([dx, dy], i) => (
              <rect key={`f${i}`} x={CX + dx - 5} y={T + dy - 9} width="10" height="9" rx="1.5" transform={`rotate(${(i * 31) % 60 - 30} ${CX + dx} ${T + dy - 4})`} fill={i % 3 ? "#f2b630" : "#f7d36b"} stroke="#d99a1e" strokeWidth="0.8" />
            ));
          case "flakes":
            return spots.map(([dx, dy], i) => (
              <ellipse key={`k${i}`} cx={CX - dx * 1.2} cy={T - dy * 0.9 + 1} rx="4.5" ry="1.4" transform={`rotate(${(i * 53) % 180} ${CX - dx * 1.2} ${T - dy * 0.9 + 1})`} fill="#fffaf0" />
            ));
          case "saffron":
            return spots.map(([dx, dy], i) => (
              <path key={`s${i}`} d={`M${CX + dx * 1.2},${T + dy} q3,-2 6,${i % 2 ? 1 : -1}`} stroke="#d4701b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            ));
          case "heart":
            return (
              <path
                key="heart"
                d={`M${CX},${T + 6} c-22,-12 -30,-22 -20,-30 c7,-5 16,-2 20,5 c4,-7 13,-10 20,-5 c10,8 2,18 -20,30 z`}
                fill={brand.colors.accent}
                stroke={shade(brand.colors.accent, -0.25)}
                strokeWidth="1"
              />
            );
          case "crumbs":
            return spots.concat(spots.map(([x, y]) => [x * 0.6 + 9, -y * 0.7] as [number, number])).map(([dx, dy], i) => (
              <circle key={`m${i}`} cx={CX + dx} cy={T + dy} r={i % 3 ? 2.2 : 3} fill={i % 2 ? shade(look.body, -0.2) : shade(look.body, 0.15)} />
            ));
          case "flecks":
            return spots.concat(spots.map(([x, y]) => [-x * 0.7, y * 0.6 + 3] as [number, number])).map(([dx, dy], i) => (
              <rect key={`x${i}`} x={CX + dx} y={T + dy} width="2.4" height="2.4" fill="#fffdf8" opacity="0.9" />
            ));
        }
      })}
    </g>
  );
}

export function CakeIllustration({ slug, className = "" }: { slug: string; className?: string }) {
  const look = looks[slug] ?? fallbackLook;
  const id = `ci-${slug}`;
  const band = look.band ?? brand.colors.accent;
  const acetateTop = T - 40;

  return (
    <svg viewBox="40 100 320 280" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-side`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(look.body, -0.35)} />
          <stop offset="0.35" stopColor={look.body} />
          <stop offset="0.6" stopColor={shade(look.body, 0.12)} />
          <stop offset="1" stopColor={shade(look.body, -0.4)} />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx="0.42" cy="0.35" r="0.8">
          <stop offset="0" stopColor={shade(look.top, 0.18)} />
          <stop offset="1" stopColor={shade(look.top, -0.12)} />
        </radialGradient>
        <linearGradient id={`${id}-stand`} x1="0" x2="1">
          <stop offset="0" stopColor="#d9cfc0" />
          <stop offset="0.4" stopColor="#f6f1e8" />
          <stop offset="1" stopColor="#cfc4b3" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#0e1a33" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0e1a33" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-coin`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor={shade(brand.colors.accent, 0.35)} />
          <stop offset="1" stopColor={shade(brand.colors.accent, -0.2)} />
        </radialGradient>
      </defs>

      {/* shadow + stand */}
      <ellipse cx={CX} cy="350" rx="165" ry="24" fill={`url(#${id}-shadow)`} />
      <path d={`M70,296 L70,324 A130,36 0 0 0 330,324 L330,296 Z`} fill={`url(#${id}-stand)`} />
      <ellipse cx={CX} cy="296" rx="130" ry="36" fill="#fbf8f2" />
      <ellipse cx={CX} cy={B + 6} rx={RX + 10} ry={RY + 3} fill="#0e1a33" opacity="0.08" />

      {/* cake body */}
      <path d={`M${CX - RX},${T} L${CX - RX},${B} A${RX},${RY} 0 0 0 ${CX + RX},${B} L${CX + RX},${T} Z`} fill={`url(#${id}-side)`} />
      {look.layers
        ? [0.3, 0.55, 0.8].map((f) => <path key={f} d={arc(T + (B - T) * f)} fill="none" stroke={look.layers} strokeWidth={look.pullUp ? 7 : 3.5} opacity="0.9" />)
        : null}
      {!look.pullUp ? (
        <path d={`${arc(B - 14)} L${CX + RX},${B} A${RX},${RY} 0 0 1 ${CX - RX},${B} Z`} fill={band} opacity="0.95" />
      ) : null}
      <rect x="132" y={T + 8} width="10" height={B - T - 6} fill="#fff" opacity="0.1" />

      {/* glaze cap + drips */}
      <ellipse cx={CX} cy={T} rx={RX} ry={RY} fill={`url(#${id}-top)`} />
      {look.drip
        ? Array.from({ length: 11 }, (_, i) => {
            const x = CX - RX + 14 + i * 16.8;
            const y = frontY(x, T) - 1;
            const len = [14, 26, 10, 32, 18, 12, 28, 16, 22, 11, 20][i];
            return <path key={i} d={`M${x - 6},${y} L${x - 6},${y + len} a6,6 0 0 0 12,0 L${x + 6},${y} Z`} fill={look.drip} />;
          })
        : null}
      <path d={arc(T)} fill="none" stroke={shade(look.top, -0.2)} strokeWidth="1.2" opacity="0.6" />

      <Toppings kinds={look.toppings} look={look} />

      {/* acetate sleeve for pull-up cakes */}
      {look.pullUp ? (
        <g>
          <path d={`M${CX - RX - 3},${acetateTop} L${CX - RX - 3},${B} A${RX + 3},${RY + 1} 0 0 0 ${CX + RX + 3},${B} L${CX + RX + 3},${acetateTop} Z`} fill="#ffffff" opacity="0.16" />
          <ellipse cx={CX} cy={acetateTop} rx={RX + 3} ry={RY + 1} fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.85" />
          <path d={arc(B)} fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
          <line x1={CX - RX - 3} y1={acetateTop} x2={CX - RX - 3} y2={B} stroke="#fff" strokeWidth="1.4" opacity="0.7" />
          <line x1={CX + RX + 3} y1={acetateTop} x2={CX + RX + 3} y2={B} stroke="#fff" strokeWidth="1.4" opacity="0.7" />
          <rect x="120" y={acetateTop + 8} width="6" height={B - acetateTop - 4} fill="#fff" opacity="0.35" />
          <rect x={CX + 52} y={acetateTop - 12} width="18" height="16" rx="2" fill={`url(#${id}-coin)`} />
        </g>
      ) : (
        <g>
          <circle cx={CX} cy={B + 12} r="13" fill={`url(#${id}-coin)`} stroke={shade(brand.colors.accent, -0.3)} strokeWidth="0.8" />
          <path d={`M${CX},${B + 13} c-3,-.4 -7.5,-2.8 -9,-6.8 c2.6,-2.6 5.9,-3.6 8.2,-2.5 l.8,2.9 .8,-2.9 c2.3,-1.1 5.6,-.1 8.2,2.5 c-1.5,4 -6,6.4 -9,6.8 z`} fill={shade(brand.colors.accent, -0.3)} opacity="0.75" />
        </g>
      )}
    </svg>
  );
}
