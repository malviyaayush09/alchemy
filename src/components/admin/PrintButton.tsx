"use client";

import { buttonClasses } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClasses("outline", "sm")}>
      Print
    </button>
  );
}
