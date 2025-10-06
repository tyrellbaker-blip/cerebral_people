"use client";

import { useState } from "react";
import { z } from "zod";

const signUpSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
})
.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  signUpAction?: (formData: FormData) => Promise<void>;
}

export default function SignUpForm({ signUpAction }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Validate in real-time
    const result = signUpSchema.safeParse(newFormData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);

      if (signUpAction) {
        await signUpAction(formDataObj);
      }

      setSuccess(true);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    } catch (error) {
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          className="w-full rounded border p-2"
          disabled={isLoading}
        />
        {errors.username && (
          <p className="text-red-600 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded border p-2"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded border p-2"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded border p-2"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-red-600 text-sm">{errors.submit}</p>
      )}

      {success && (
        <p className="text-green-600 text-sm">
          Account created successfully! Redirecting to sign in...
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700 disabled:opacity-50"
      >
        {isLoading ? "Creating account..." : "Sign up"}
      </button>

      <p className="text-sm text-center text-amber-700">
        Already have an account?{" "}
        <a href="/signin" className="text-amber-800 underline hover:text-amber-900">
          Sign in
        </a>
      </p>
    </form>
  );
}
