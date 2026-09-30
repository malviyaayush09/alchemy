"use client";

/**
 * Callback ref for a bottom sticky bar: publishes its height as --sticky-bar-h
 * so floating UI (WhatsApp button, consent banner) sits above it instead of
 * covering the CTA. Works even when the bar mounts after the first render.
 * (React 19 runs the returned function as the ref's cleanup.)
 */
export function stickyBarRef(el: HTMLElement | null) {
  if (!el) return;
  const root = document.documentElement;
  const sync = () => root.style.setProperty("--sticky-bar-h", getComputedStyle(el).display !== "none" ? `${el.offsetHeight}px` : "0px");
  sync();
  const ro = new ResizeObserver(sync);
  ro.observe(el);
  window.addEventListener("resize", sync);
  return () => {
    ro.disconnect();
    window.removeEventListener("resize", sync);
    root.style.removeProperty("--sticky-bar-h");
  };
}
