import clsx from "clsx";

/** Wide hollow pill that replaces the "O" in hero headlines. */
export function ExtendedLetterO({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "relative box-border inline-block shrink-0 rounded-pill border-[0.216em] border-white bg-transparent align-baseline",
        className,
      )}
      style={{
        // Scales down on narrow phones (where the plain `em` value alone
        // could still be wide enough to wrap "Your story" onto its own
        // line) while settling back to the original 2.1em from ~380px up.
        width: "clamp(1.15em, 6vw + 0.8em, 2.1em)",
        height: "0.75cap",
      }}
    />
  );
}
