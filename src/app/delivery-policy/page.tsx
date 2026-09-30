import type { Metadata } from "next";
import { legalDocs } from "@/content/legal";
import { LegalPage } from "@/components/layout/LegalPage";

const doc = legalDocs["delivery-policy"];
export const metadata: Metadata = { title: doc.title, description: doc.summary, alternates: { canonical: "/delivery-policy" } };

export default function Page() {
  return <LegalPage doc={doc} />;
}
