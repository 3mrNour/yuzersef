import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PrintAreaEditor } from "../features/studio/PrintAreaEditor";
import { mockProducts } from "../features/studio/mockProducts";
import type { Rect } from "../features/studio/types";
import { cn } from "../lib/cn";
import { useLanguage } from "../providers/LanguageProvider";

export function DevPrintAreaPage() {
  const { lang } = useLanguage();
  const [productId, setProductId] = useState(mockProducts[0]._id);
  const [viewId, setViewId] = useState(mockProducts[0].views[0].id);
  const [rect, setRect] = useState<Rect>(mockProducts[0].views[0].printArea);

  const product = mockProducts.find((item) => item._id === productId) ?? mockProducts[0];
  const view = product.views.find((item) => item.id === viewId) ?? product.views[0];

  function selectProduct(nextId: string) {
    const next = mockProducts.find((item) => item._id === nextId);
    if (!next) return;
    setProductId(next._id);
    setViewId(next.views[0].id);
    setRect(next.views[0].printArea);
  }

  function selectView(nextId: string) {
    const next = product.views.find((item) => item.id === nextId);
    if (!next) return;
    setViewId(next.id);
    setRect(next.printArea);
  }

  return (
    <>
      <PageHeader
        title="Print area editor"
        intro="Dev-only calibration tool. Pick a product and view, drag the print area, then copy the values into the product data. Changes are not saved."
      />

      <div className="shell py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-6 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-5">
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                Product
              </legend>
              <div className="grid gap-2">
                {mockProducts.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    aria-pressed={item._id === product._id}
                    onClick={() => selectProduct(item._id)}
                    className={cn(
                      "min-h-[44px] rounded-[var(--radius-field)] border px-3 text-start text-sm transition-colors",
                      item._id === product._id
                        ? "border-sand bg-sand/10 text-bone"
                        : "border-bone/15 text-bone/65 hover:border-bone/30 hover:text-bone",
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {product.views.length > 1 ? (
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                  View
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.views.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={item.id === view.id}
                      onClick={() => selectView(item.id)}
                      className={cn(
                        "min-h-[40px] rounded-full border px-4 text-sm transition-colors",
                        item.id === view.id
                          ? "border-sand bg-sand text-forest-950"
                          : "border-bone/20 text-bone/65 hover:border-bone/40 hover:text-bone",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                Normalized rect
              </p>
              <pre
                dir="ltr"
                className="mt-2 overflow-x-auto rounded-[var(--radius-field)] border border-bone/15 bg-forest-950/70 p-3 font-latin text-xs leading-relaxed text-sand"
              >
                {JSON.stringify(rect, null, 2)}
              </pre>
            </div>

            <p className="text-xs leading-relaxed text-bone/45">
              Source: {view.baseImage}
            </p>
          </aside>

          <PrintAreaEditor
            imageUrl={view.baseImage}
            value={rect}
            onChange={setRect}
            lang={lang}
          />
        </div>
      </div>
    </>
  );
}
