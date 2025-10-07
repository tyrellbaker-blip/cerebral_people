import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "./ProfileEditForm";
import { updateProfileAction } from "./actions";

export default async function ProfileEditPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  const isNewProfile = !user?.profile;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-amber-900">
              {isNewProfile ? "Create Your Profile" : "Edit Profile"}
            </h1>
            <p className="text-amber-700 mt-2">
              {isNewProfile
                ? "Tell us a bit about yourself to get started."
                : "Update your profile information."}
            </p>
          </div>

          <ProfileEditForm
            profile={user?.profile}
            userId={userId}
            currentImage={user?.image}
            updateProfileAction={updateProfileAction}
          />
        </div>
      </div>
    </div>
  );
}
