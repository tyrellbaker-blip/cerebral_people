import SignUpForm from "./SignUpForm";
import { signUpAction } from "./actions";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-amber-900">Create an account</h1>
            <p className="text-amber-700 mt-2">
              Join the Cerebral People community
            </p>
          </div>
          <SignUpForm signUpAction={signUpAction} />
        </div>
      </div>
    </main>
  );
}
