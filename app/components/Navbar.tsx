import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={session ? "/feed" : "/welcome"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Cerebral People Logo"
                width={40}
                height={40}
                className="rounded"
              />
              <span className="text-xl font-semibold text-ink-900">
                Cerebral People
              </span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              {session && (
                <>
                  <Link href="/feed" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
                    Feed
                  </Link>
                  <Link href="/people" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
                    People
                  </Link>
                  <Link href="/network" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
                    Network
                  </Link>
                  <Link href="/profile" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
                    Profile
                  </Link>
                </>
              )}
              <Link href="/about" className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/welcome" });
              }}>
                <button className="rounded-[0.75rem] bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors shadow-[0_4px_10px_rgba(255,135,65,.25)]">
                  Sign out
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-ink-700 hover:text-brand-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-[0.75rem] bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition-colors shadow-[0_4px_10px_rgba(255,135,65,.25)]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
