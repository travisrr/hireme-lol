import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { legalDoc, type LegalKind } from "../lib/legal";
import { PAGE_COLUMN } from "../lib/measure";

export function LegalPage({ kind }: { kind: LegalKind }) {
  const doc = legalDoc(kind);
  return (
    <div className="min-h-screen bg-paper">
      <div className={`page-gutter mx-auto ${PAGE_COLUMN}`}>
        <SiteHeader
          query=""
          onQueryChange={() => undefined}
          showSearch={false}
          inColumn
        />
        <main data-lock={kind} className="pb-8 pt-4">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-semibold leading-[1.2] text-ink">
                {doc.title}
              </h1>
              <p className="text-[13px] leading-4 text-mute">{doc.updated}</p>
            </div>
            {doc.blocks.map((block, index) => (
              <section
                key={block.heading ?? `intro-${index}`}
                className="flex flex-col gap-2"
              >
                {block.heading ? (
                  <h2 className="text-[15px] font-semibold leading-5 text-ink">
                    {block.heading}
                  </h2>
                ) : null}
                {block.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[15px] leading-[1.45] text-ink"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </main>
        <SiteFooter inColumn />
      </div>
    </div>
  );
}
