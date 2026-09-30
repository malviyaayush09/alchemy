import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getTags } from "@/lib/catalog";
import { isUuid } from "@/lib/validate";
import { weightLabel } from "@/lib/types";
import { AdminCheck, AdminField, AdminForm, adminInput } from "@/components/admin/AdminForm";
import { deleteProductImage, makePrimaryImage, saveProduct, uploadProductImage } from "../../actions";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const product = (await getProducts({ includeInactive: true })).find((p) => p.id === id);
  if (!product) notFound();
  const tags = await getTags();

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex min-h-11 items-center text-[0.875rem] text-ink underline underline-offset-4">
        ← Products
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[2rem]">{product.name}</h1>
        {product.isActive ? (
          <Link href={`/cakes/${product.slug}`} className="text-[0.875rem] text-ink underline underline-offset-4">
            View on site
          </Link>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <AdminForm action={saveProduct} className="border border-line bg-paper p-4">
          <input type="hidden" name="id" value={product.id} />
          <AdminField label="Name">
            <input name="name" defaultValue={product.name} required className={adminInput} />
          </AdminField>
          <AdminField label="Description" hint="No ingredient, allergen or health claims unless verified and approved.">
            <textarea name="description" defaultValue={product.description} rows={4} className={`${adminInput} min-h-24`} />
          </AdminField>

          <fieldset className="space-y-3">
            <legend className="text-[0.8125rem] font-medium text-ink">Prices (₹). 0 = &quot;Price on request&quot;, can&apos;t be bought.</legend>
            {product.variants.map((v) => (
              <div key={v.id} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3">
                <span className="text-ink">{weightLabel(v.weightGrams)}</span>
                <input name={`price:${v.id}`} defaultValue={v.pricePaise ? (v.pricePaise / 100).toString() : "0"} inputMode="decimal" className={adminInput} aria-label={`Price for ${weightLabel(v.weightGrams)}`} />
                <label className="flex min-h-11 items-center gap-2 text-[0.875rem] text-ink">
                  <input type="checkbox" name={`available:${v.id}`} defaultChecked={v.isAvailable} className="size-5 accent-[var(--color-ink)]" />
                  Available
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend className="text-[0.8125rem] font-medium text-ink">Tags (drive collections)</legend>
            <div className="mt-1 flex flex-wrap gap-x-5">
              {tags.map((t) => (
                <label key={t.id} className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink">
                  <input type="checkbox" name="tags" value={t.id} defaultChecked={product.tags.includes(t.slug)} className="size-5 accent-[var(--color-ink)]" />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-x-6 sm:grid-cols-2">
            <AdminCheck name="isActive" label="Visible on site" defaultChecked={product.isActive} />
            <AdminCheck name="isSoldOut" label="Sold out" defaultChecked={product.isSoldOut} />
            <AdminCheck name="isFeatured" label="Featured on home" defaultChecked={product.isFeatured} />
          </div>
          <AdminField label="Sort order (lower first)">
            <input name="sortOrder" type="number" inputMode="numeric" defaultValue={product.sortOrder} className={adminInput} />
          </AdminField>
        </AdminForm>

        <section className="space-y-4 border border-line bg-paper p-4" aria-labelledby="imgs">
          <h2 id="imgs" className="text-[1.25rem]">
            Photos
          </h2>
          <ul className="grid grid-cols-3 gap-2">
            {product.images.map((img, i) => (
              <li key={img.id ?? img.src} className="space-y-1">
                <span className="relative block aspect-[4/5] overflow-hidden border border-line">
                  <Image src={img.src} alt={img.alt} fill sizes="120px" className="object-cover" />
                </span>
                <span className="block text-[0.6875rem] text-body">
                  {img.width}×{img.height}
                  {i === 0 ? " · main" : ""}
                </span>
                {img.id ? (
                  <div className="flex flex-col">
                    {i > 0 ? (
                      <form action={makePrimaryImage}>
                        <input type="hidden" name="imageId" value={img.id} />
                        <input type="hidden" name="productId" value={product.id} />
                        <button className="min-h-9 text-[0.75rem] text-ink underline">Make main</button>
                      </form>
                    ) : null}
                    <form action={deleteProductImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <button className="min-h-9 text-[0.75rem] text-danger underline">Remove</button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <AdminForm action={uploadProductImage} submitLabel="Upload photo" encType="multipart/form-data">
            <input type="hidden" name="productId" value={product.id} />
            <AdminField label="Image" hint="JPEG, PNG or WebP, at least 800px wide (1600px+ recommended), under 5 MB.">
              <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="block w-full text-[0.875rem]" />
            </AdminField>
            <AdminField label="Alt text" hint="Describe the photo, e.g. “Hazelnut cake on a white stand”.">
              <input name="alt" className={adminInput} maxLength={160} />
            </AdminField>
          </AdminForm>
        </section>
      </div>
    </div>
  );
}
