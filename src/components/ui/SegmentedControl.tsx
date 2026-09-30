type Option = { value: string; label: string };

type Props = {
  name: string;
  legend: string;
  options: Option[];
  defaultValue?: string;
  /** Visually hide the legend (still read by screen readers). */
  hideLegend?: boolean;
  className?: string;
};

/**
 * Native radio group styled as a segmented control. Works without JavaScript,
 * keyboard arrows move between options, and each segment is at least 44px tall.
 */
export function SegmentedControl({ name, legend, options, defaultValue, hideLegend = true, className = "" }: Props) {
  return (
    <fieldset className={className}>
      <legend className={hideLegend ? "sr-only" : "eyebrow mb-2 text-body"}>{legend}</legend>
      <div className="grid border border-ink" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o, i) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={o.value === (defaultValue ?? options[0]?.value)}
              className="peer sr-only"
            />
            <span
              className={`flex min-h-11 items-center justify-center px-2 text-[0.8125rem] text-ink transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                i > 0 ? "border-l border-ink" : ""
              }`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
