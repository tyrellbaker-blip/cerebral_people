import CredentialsSignInForm from "./CredentialsSignInForm";
import { signInWithCredentials } from "./actions";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-amber-900">
            Welcome Back
          </h1>
          <p className="text-center text-amber-700 mb-6">
            Sign in to connect with the community
          </p>

          {searchParams.registered === "true" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              Account created successfully! You can now sign in.
            </div>
          )}

          <CredentialsSignInForm signInAction={signInWithCredentials} />
        </div>
      </div>
    </div>
  );
}