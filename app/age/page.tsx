import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AgePage() {
  async function confirmAge() {
    "use server";

    const cookieStore = await cookies();
    cookieStore.set("over18", "yes", {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    redirect("/welcome");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-amber-900">Adults 18+ Only</h1>
            <p className="text-amber-700">
              This community is for adults and parents of children with cerebral palsy. You must be 18 years or older to continue.
            </p>
          </div>

          <form action={confirmAge} className="space-y-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-600 text-white px-6 py-3 font-medium hover:bg-amber-700"
            >
              I confirm I'm 18 or older
            </button>
          </form>

          <p className="text-xs text-center text-amber-600">
            By continuing, you confirm that you are at least 18 years of age.
          </p>
        </div>
      </div>
    </div>
  );
}
