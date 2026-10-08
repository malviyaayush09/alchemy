import { currentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { displayPhone } from "@/lib/validate";
import { AddressForm } from "@/components/account/AddressForm";
import { deleteAddress, makeDefaultAddress } from "../actions";

export default async function AddressesPage() {
  const user = (await currentUser())!;
  const { data } = await db().from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at");
  const list = data ?? [];
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <section aria-labelledby="saved">
        <h2 id="saved" className="text-[1.5rem]">
          Saved addresses
        </h2>
        {list.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((a) => (
              <li key={a.id} className="border border-line bg-paper-soft p-4">
                <p className="font-medium text-ink">
                  {a.label || "Address"} {a.is_default ? <span className="ml-1 text-[0.8125rem] uppercase tracking-[0.1em] text-body">· Default</span> : null}
                </p>
                <address className="mt-1 text-[1rem] not-italic text-body">
                  {a.name}, {displayPhone(a.phone)}
                  <br />
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  {a.landmark ? ` (near ${a.landmark})` : ""} · {a.pincode}
                </address>
                <div className="mt-2 flex gap-4">
                  {!a.is_default ? (
                    <form action={makeDefaultAddress}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="min-h-11 text-[0.9375rem] text-ink underline underline-offset-4">Make default</button>
                    </form>
                  ) : null}
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="min-h-11 text-[0.9375rem] text-danger underline underline-offset-4">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-body">No saved addresses yet.</p>
        )}
      </section>
      <section aria-labelledby="add">
        <h2 id="add" className="text-[1.5rem]">
          Add an address
        </h2>
        <div className="mt-4">
          <AddressForm defaultName={user.name ?? ""} defaultPhone={user.phone?.replace(/^\+91/, "") ?? ""} />
        </div>
      </section>
    </div>
  );
}
