"use client";

import { useState } from "react";
import { z } from "zod";

const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface CredentialsSignInFormProps {
  signInAction?: (formData: FormData) => Promise<void>;
}

export default function CredentialsSignInForm({ signInAction }: CredentialsSignInFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("password", formData.password);

      if (signInAction) {
        await signInAction(formDataObj);
      }
    } catch (error) {
      setErrors({ submit: "Invalid username or password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-amber-900 mb-2">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {errors.submit && (
        <p className="text-sm text-red-600" role="alert">
          {errors.submit}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-center text-amber-700">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-amber-800 underline hover:text-amber-900">
          Sign up
        </a>
      </p>
    </form>
  );
}
