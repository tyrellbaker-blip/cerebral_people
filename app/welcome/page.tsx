import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-6">
          <Image
            src="/logo.png"
            alt="Cerebral People Logo"
            width={200}
            height={200}
            className="rounded mx-auto"
          />
          <h1 className="text-4xl font-bold text-amber-900">Welcome to Cerebral People</h1>
          <p className="text-xl text-amber-800">
            A community for adults with cerebral palsy to connect, share ideas,
            and recommend doctors, exercises, diets, and more.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="rounded-lg bg-amber-600 text-white px-6 py-3 font-medium hover:bg-amber-700"
          >
            Get started
          </a>
        </div>
      </div>
    </div>
  );
}
