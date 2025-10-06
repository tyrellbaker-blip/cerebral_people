import { auth, signOut } from "@/lib/auth";
import Image from "next/image";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-amber-50 border-b border-amber-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href={session ? "/feed" : "/welcome"} className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Cerebral People Logo"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-xl font-semibold text-amber-900">
                Cerebral People
              </span>
            </a>
            <div className="flex items-center gap-6">
              <a href="/about" className="text-amber-800 hover:text-amber-900">
                About
              </a>
              {session && (
                <a href="/profile" className="text-amber-800 hover:text-amber-900">
                  Profile
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/welcome" });
              }}>
                <button className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700">
                  Sign out
                </button>
              </form>
            ) : (
              <>
                <a
                  href="/signin"
                  className="text-amber-800 hover:text-amber-900 font-medium"
                >
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
