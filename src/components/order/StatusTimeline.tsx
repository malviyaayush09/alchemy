import { LIFECYCLE, statusLabel, type Order } from "@/lib/orders";
import { formatStamp } from "@/lib/time";

/** Placed → Confirmed → Being Crafted → Out for Delivery → Delivered, with timestamps from the event log. */
export function StatusTimeline({ order }: { order: Order }) {
  const stopped = order.status === "cancelled" || order.status === "refunded";
  const reachedAt = (s: string) => order.events.find((e) => e.toStatus === s)?.createdAt;
  const currentIdx = LIFECYCLE.indexOf(order.status);

  return (
    <div>
      {stopped ? (
        <p className="mb-4 border border-danger px-3 py-2 text-[0.9375rem] text-danger" role="status">
          This order was {statusLabel[order.status].toLowerCase()}
          {reachedAt(order.status) ? ` on ${formatStamp(reachedAt(order.status)!)}` : ""}.
        </p>
      ) : null}
      <ol className="relative space-y-0">
        {LIFECYCLE.map((s, i) => {
          const at = reachedAt(s);
          const done = Boolean(at) || (!stopped && i <= currentIdx);
          const current = !stopped && i === currentIdx;
          return (
            <li key={s} className="relative flex gap-4 pb-6 last:pb-0" aria-current={current ? "step" : undefined}>
              {i < LIFECYCLE.length - 1 ? (
                <span aria-hidden="true" className={`absolute top-5 left-[0.6875rem] h-full w-px ${done && !current ? "bg-ink" : "bg-line"}`} />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${
                  current ? "border-ink bg-accent" : done ? "border-ink bg-ink" : "border-line bg-paper"
                }`}
              >
                {done && !current ? <span className="size-2 rounded-full bg-paper" /> : null}
              </span>
              <div>
                <p className={`text-[1rem] ${done ? "font-medium text-ink" : "text-body"}`}>
                  {statusLabel[s]}
                  <span className="sr-only">{current ? " (current)" : done ? " (done)" : " (upcoming)"}</span>
                </p>
                {at ? <p className="text-[0.9375rem] text-body">{formatStamp(at)}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
