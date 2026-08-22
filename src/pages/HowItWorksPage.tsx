import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  HOW_IT_WORKS_BEATS,
  HOW_IT_WORKS_CONTACT,
  HOW_IT_WORKS_DOCUMENT_TITLE,
  HOW_IT_WORKS_FAQ,
  HOW_IT_WORKS_LEAD,
  HOW_IT_WORKS_LOOP,
  HOW_IT_WORKS_MONEY,
  HOW_IT_WORKS_SECTIONS,
  HOW_IT_WORKS_TITLE,
  HOW_IT_WORKS_UPDATED,
  type HowItWorksBlock,
} from "../lib/how-it-works";
import { CONTACT_EMAIL } from "../lib/legal";
import { PAGE_COLUMN } from "../lib/measure";
import { SITE } from "../lib/site";

export function HowItWorksPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = HOW_IT_WORKS_DOCUMENT_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <div className={`page-gutter mx-auto ${PAGE_COLUMN}`}>
        <SiteHeader
          query=""
          onQueryChange={() => undefined}
          showSearch={false}
          inColumn
        />
        <main data-lock="how-it-works" className="how-it-works pb-8 pt-4">
          <div className="how-doc">
            <header className="how-hero">
              <h1 className="how-title">{HOW_IT_WORKS_TITLE}</h1>
              <p className="how-updated">{HOW_IT_WORKS_UPDATED}</p>
              <p className="how-lead">{HOW_IT_WORKS_LEAD}</p>
              <p className="how-loop">{HOW_IT_WORKS_LOOP}</p>
            </header>

            <ol className="how-steps">
              {HOW_IT_WORKS_BEATS.map((beat, index) => (
                <li key={beat.title} className="how-step">
                  <span className="how-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="how-step-copy">
                    <p className="how-step-title">{beat.title}</p>
                    <p className="how-body">{beat.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="how-money" aria-label="Bid prices">
              {HOW_IT_WORKS_MONEY.map((item) => (
                <p key={item.label} className="how-money-card">
                  <span className="how-money-value">{item.value}</span>
                  <span className="how-money-label">{item.label}</span>
                </p>
              ))}
            </div>

            {HOW_IT_WORKS_SECTIONS.map((block) => (
              <HowBlock key={block.heading} block={block} />
            ))}

            <section className="how-block">
              <h2 className="how-heading">Questions</h2>
              {HOW_IT_WORKS_FAQ.map((block) => (
                <HowBlock key={block.heading} block={block} nested />
              ))}
            </section>

            <HowBlock block={HOW_IT_WORKS_CONTACT} />

            <Link to="/join" className="btn-accent how-cta no-underline">
              {SITE.cta}
            </Link>
          </div>
        </main>
        <SiteFooter inColumn />
      </div>
    </div>
  );
}

function HowBlock({
  block,
  nested = false,
}: {
  block: HowItWorksBlock;
  nested?: boolean;
}) {
  const Heading = nested ? "h3" : "h2";
  return (
    <section className={nested ? "how-faq" : "how-block"}>
      <Heading className={nested ? "how-faq-title" : "how-heading"}>
        {block.heading}
      </Heading>
      {block.paragraphs.map((paragraph) => (
        <HowBody key={paragraph} text={paragraph} />
      ))}
    </section>
  );
}

function HowBody({ text }: { text: string }) {
  const at = text.indexOf(CONTACT_EMAIL);
  return (
    <p className="how-body">
      {at === -1 ? (
        text
      ) : (
        <>
          {text.slice(0, at)}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline">
            {CONTACT_EMAIL}
          </a>
          {text.slice(at + CONTACT_EMAIL.length)}
        </>
      )}
    </p>
  );
}
