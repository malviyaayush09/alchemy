import { orderingSteps } from "@/content/home";

export function HowOrderingWorks() {
  return (
    <section aria-labelledby="how-title" className="on-ink bg-ink text-paper">
      <div className="container-x py-14 lg:py-20">
        <h2 id="how-title" className="text-center text-[2.25rem] text-paper lg:text-[2.75rem]">
          How ordering works
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-12 lg:gap-6">
          {orderingSteps.map((s) => (
            <li key={s.no} className="border border-accent/50 px-6 py-7 lg:px-8 lg:py-9">
              <span className="font-display text-[2.75rem] leading-none text-accent italic" aria-hidden="true">
                {s.no}
              </span>
              <h3 className="mt-3 font-display text-[1.75rem] leading-tight text-paper">{s.title}</h3>
              <p className="mt-2 text-[1.0625rem] text-paper/85">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
