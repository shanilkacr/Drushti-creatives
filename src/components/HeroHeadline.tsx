import { ExtendedLetterO } from "@/components/ExtendedLetterO";
import PillButton from "@/components/PillButton";

/** Server-rendered hero headline and CTA — visible in initial HTML at load. */
export function HeroHeadline() {
  return (
    <>
      <h1 className="font-heading text-[clamp(2.4rem,10.5vw,3.4rem)] sm:text-heading-hero-half uppercase leading-[0.88] tracking-tighter text-white">
        <span className="block">Your people,</span>
        <span className="block">Connected through</span>
        <span className="inline-flex items-baseline justify-center">
          Your st
          <ExtendedLetterO />
          ry
        </span>
      </h1>

      <div className="pointer-events-auto mt-2">
        <PillButton href="/portfolio" variant="light">
          View our work
        </PillButton>
      </div>
    </>
  );
}
