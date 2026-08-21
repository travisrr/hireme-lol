import { useEffect, useState, type FormEvent } from "react";
import { formatUsdFromCents } from "../lib/money";
import { minBidToEnter } from "../lib/ranking";
import { SITE } from "../lib/site";

type JoinDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function JoinDialog({ open, onClose }: JoinDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  if (!open) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-sm border border-line bg-panel p-5 shadow-2xl">
        <p className="font-mono text-[11px] text-money uppercase">
          Founding preview · bidding is not live
        </p>
        <h2 className="mt-2 font-display text-3xl">{SITE.cta}</h2>
        <p className="mt-2 text-sm text-mute">
          When Stripe is wired, this is a one-time bid — not a subscription.
          Entry {formatUsdFromCents(minBidToEnter())}. This form does not charge
          anyone.
        </p>
        {submitted ? (
          <div className="mt-6 border border-money/40 bg-ink p-4">
            <p className="font-mono text-sm text-money">
              Preview only. No bid placed. No payment taken. The live board
              starts empty on {SITE.name}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 font-mono text-xs text-paper underline"
            >
              Back to the mock board
            </button>
          </div>
        ) : (
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <Field label="Name" name="name" placeholder="Your name" />
            <Field label="Handle" name="handle" placeholder="maya" />
            <Field
              label="Headline"
              name="headline"
              placeholder="Staff product designer"
            />
            <Field label="Company" name="company" placeholder="Independent" />
            <Field
              label="One-line pitch"
              name="pitch"
              placeholder="What should someone remember?"
            />
            <Field
              label={`Opening bid (min ${formatUsdFromCents(minBidToEnter())})`}
              name="bid"
              placeholder="5"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="font-mono text-xs text-mute underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-money px-4 py-2 font-mono text-xs font-semibold text-ink uppercase"
              >
                Preview join
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-mono text-[11px] text-mute uppercase">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className="rounded-sm border border-line bg-ink px-3 py-2 text-sm text-paper outline-none placeholder:text-mute/70 focus:border-money"
      />
    </label>
  );
}
