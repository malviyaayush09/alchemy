/**
 * Minimal single-page PDF writer (A4, standard Helvetica fonts, WinAnsi).
 * Enough for a tabular invoice without adding a PDF dependency.
 * Characters outside Latin-1 are replaced with "?"; use "Rs." instead of "₹".
 */
export class PdfPage {
  private ops: string[] = [];
  readonly width = 595.28;
  readonly height = 841.89;

  private static esc(s: string) {
    const latin = [...s].map((c) => (c.charCodeAt(0) <= 255 ? c : "?")).join("");
    return latin.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]+/g, " ");
  }

  /** Approximate Helvetica width (pt) for right-alignment. */
  static measure(s: string, size: number, bold = false) {
    let w = 0;
    for (const c of s) {
      if ("ijl.,:;'|!".includes(c)) w += 0.28;
      else if ("mwMW".includes(c)) w += 0.85;
      else if (c === " ") w += 0.28;
      else if (/[A-Z0-9]/.test(c)) w += 0.66;
      else w += 0.52;
    }
    return w * size * (bold ? 1.05 : 1);
  }

  /** y is measured from the TOP of the page. */
  text(x: number, y: number, s: string, { size = 10, bold = false, align = "left", rgb }: { size?: number; bold?: boolean; align?: "left" | "right"; rgb?: [number, number, number] } = {}) {
    const tx = align === "right" ? x - PdfPage.measure(s, size, bold) : x;
    const color = rgb ? `${rgb.map((v) => (v / 255).toFixed(3)).join(" ")} rg ` : "0 0 0 rg ";
    this.ops.push(`BT ${color}/${bold ? "F2" : "F1"} ${size} Tf ${tx.toFixed(2)} ${(this.height - y).toFixed(2)} Td (${PdfPage.esc(s)}) Tj ET`);
  }

  line(x1: number, y1: number, x2: number, y2: number, width = 0.6, rgb: [number, number, number] = [0, 0, 0]) {
    this.ops.push(`${rgb.map((v) => (v / 255).toFixed(3)).join(" ")} RG ${width} w ${x1} ${this.height - y1} m ${x2} ${this.height - y2} l S`);
  }

  rect(x: number, y: number, w: number, h: number, rgb: [number, number, number]) {
    this.ops.push(`${rgb.map((v) => (v / 255).toFixed(3)).join(" ")} rg ${x} ${this.height - y - h} ${w} ${h} re f`);
  }

  toBuffer(title: string): Buffer {
    const content = this.ops.join("\n");
    const objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width} ${this.height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
      `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
      `<< /Title (${PdfPage.esc(title)}) /Producer (storefront) >>`,
    ];
    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => {
      offsets.push(Buffer.byteLength(out, "latin1"));
      out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = Buffer.byteLength(out, "latin1");
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return Buffer.from(out, "latin1");
  }
}
