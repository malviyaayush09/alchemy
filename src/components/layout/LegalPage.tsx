import type { LegalDoc } from "@/content/legal";
import { PageHeader } from "./PageHeader";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHeader crumb={doc.title} title={doc.title} intro={doc.summary} />
      <div className="container-x max-w-3xl py-8 lg:py-12">
        <p role="note" className="border border-dashed border-detail bg-paper-soft px-4 py-3 text-[1rem] font-medium text-ink">
          [LEGAL REVIEW NEEDED] This is placeholder text and has not been reviewed by a lawyer. It must be replaced or approved before launch.
        </p>
        <div className="mt-8 space-y-8">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[1.625rem]">{s.heading}</h2>
              <div className="mt-2 space-y-3 text-[1rem] text-body">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
