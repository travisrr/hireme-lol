import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { PAGE_COLUMN } from "../lib/measure";
import { HOW_IT_WORKS_STEPS, SITE } from "../lib/site";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader query="" onQueryChange={() => undefined} showSearch={false} />
      <main
        data-lock="how-it-works"
        className={`page-gutter mx-auto ${PAGE_COLUMN} pb-8 pt-6`}
      >
        <h1 className="type-claim text-ink">How it works</h1>
        <ol className="mt-6 grid gap-4">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="type-rank w-6 shrink-0 text-accent">{index + 1}</span>
              <p className="type-body text-ink">{step}</p>
            </li>
          ))}
        </ol>
        <Link to="/join" className="btn-accent mt-8 inline-flex no-underline">
          {SITE.cta}
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
