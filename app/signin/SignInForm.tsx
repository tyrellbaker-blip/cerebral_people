"use client";

import { useState } from "react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

interface SignInFormProps {
  signInAction?: (formData: FormData) => Promise<void>;
}

export default function SignInForm({ signInAction }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid email");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);

      if (signInAction) {
        await signInAction(formData);
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="you@example.com"
          disabled={isLoading}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Sign in with Email"}
      </button>

      {success && (
        <p className="text-sm text-green-600" role="status">
          Check your email for a sign-in link!
        </p>
      )}
    </form>
  );
}