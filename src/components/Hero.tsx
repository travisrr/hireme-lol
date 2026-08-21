import { SITE } from "../lib/site";
import { formatUsdFromCents } from "../lib/money";
import { minBidToEnter } from "../lib/ranking";

type HeroProps = {
  onCta: () => void;
};

export function Hero({ onCta }: HeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:pt-16">
      <p className="font-mono text-[11px] tracking-[0.2em] text-money uppercase">
        One board. One number. One button.
      </p>
      <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.95] text-paper sm:text-7xl">
        {SITE.tagline}
      </h1>
      <p className="mt-5 max-w-xl text-lg text-paper/80">{SITE.deck}</p>
      <p className="mt-3 max-w-xl text-sm text-mute">
        Money buys position and attention. It does not mean you are a better
        professional. We will keep saying that.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCta}
          className="rounded-sm bg-money px-5 py-3 font-mono text-sm font-semibold tracking-wide text-ink uppercase hover:bg-paper"
        >
          {SITE.cta}
        </button>
        <p className="font-mono text-xs text-mute">
          {SITE.micro} Entry {formatUsdFromCents(minBidToEnter())}. +$1 to
          overtake.
        </p>
      </div>
    </section>
  );
}
