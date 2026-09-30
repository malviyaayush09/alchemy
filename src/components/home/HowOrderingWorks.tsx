import { orderingSteps } from "@/content/home";

export function HowOrderingWorks() {
  return (
    <section aria-labelledby="how-title" className="on-ink bg-ink text-paper">
      <div className="container-x py-10 lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:py-12">
        <h2 id="how-title" className="text-[1.75rem] text-paper lg:text-[2rem]">
          How ordering works
        </h2>
        <ol className="mt-6 divide-y divide-accent/40 border-t border-accent/40 lg:mt-0 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:border-t-0">
          {orderingSteps.map((s) => (
            <li key={s.no} className="flex items-baseline gap-4 py-4 lg:px-8 lg:py-1">
              <span className="font-display text-[1.75rem] leading-none text-accent" aria-hidden="true">
                {s.no}
              </span>
              <div>
                <h3 className="eyebrow text-paper">{s.title}</h3>
                <p className="mt-1 text-[0.875rem] text-paper/85">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
