import { currentUser } from "@/lib/auth/session";
import { displayPhone } from "@/lib/validate";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function ProfilePage() {
  const user = (await currentUser())!;
  return (
    <div className="max-w-md">
      <h2 className="text-[1.5rem]">Profile</h2>
      {user.phone ? (
        <p className="mt-2 text-[0.9375rem] text-body">
          Verified phone: <b className="font-medium text-ink">{displayPhone(user.phone)}</b>
        </p>
      ) : null}
      <div className="mt-4">
        <ProfileForm name={user.name ?? ""} email={user.email ?? ""} emailLocked={!user.phone} />
      </div>
    </div>
  );
}
