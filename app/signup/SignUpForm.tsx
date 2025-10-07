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
  displayName: z.string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required"),
  pronouns: z.string().optional(),
  cpSubtype: z.string().optional(),
  gmfcs: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }

  // Verify age is 18+
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

    if (actualAge < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be 18 or older to join",
        path: ["dateOfBirth"],
      });
    }
  }
});

// Type for form validation (not currently used but kept for future use)
// type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  signUpAction?: (formData: FormData) => Promise<void>;
}

export default function SignUpForm({ signUpAction }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    dateOfBirth: "",
    pronouns: "",
    cpSubtype: "UNKNOWN",
    gmfcs: "UNKNOWN",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Validate in real-time
    const result = signUpSchema.safeParse(newFormData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
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
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("displayName", formData.displayName);
      formDataObj.append("dateOfBirth", formData.dateOfBirth);
      formDataObj.append("pronouns", formData.pronouns);
      formDataObj.append("cpSubtype", formData.cpSubtype);
      formDataObj.append("gmfcs", formData.gmfcs);

      if (signUpAction) {
        await signUpAction(formDataObj);
      }

      setSuccess(true);
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        dateOfBirth: "",
        pronouns: "",
        cpSubtype: "UNKNOWN",
        gmfcs: "UNKNOWN",
      });
    } catch {
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-amber-900 mb-1">
          Display Name *
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={formData.displayName}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
        />
        {errors.displayName && (
          <p className="text-red-600 text-sm mt-1">{errors.displayName}</p>
        )}
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-amber-900 mb-1">
          Username *
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
        />
        {errors.username && (
          <p className="text-red-600 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-amber-900 mb-1">
          Date of Birth * <span className="text-xs text-amber-600">(Must be 18+)</span>
        </label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
        />
        {errors.dateOfBirth && (
          <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
        )}
      </div>

      <div>
        <label htmlFor="pronouns" className="block text-sm font-medium text-amber-900 mb-1">
          Pronouns (optional)
        </label>
        <input
          id="pronouns"
          name="pronouns"
          type="text"
          placeholder="e.g., she/her, he/him, they/them"
          value={formData.pronouns}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
        />
        {errors.pronouns && (
          <p className="text-red-600 text-sm mt-1">{errors.pronouns}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cpSubtype" className="block text-sm font-medium text-amber-900 mb-1">
            CP Subtype
          </label>
          <select
            id="cpSubtype"
            name="cpSubtype"
            value={formData.cpSubtype}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          >
            <option value="UNKNOWN">Prefer not to say</option>
            <option value="SPASTIC">Spastic</option>
            <option value="DYSKINETIC">Dyskinetic</option>
            <option value="ATAXIC">Ataxic</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>

        <div>
          <label htmlFor="gmfcs" className="block text-sm font-medium text-amber-900 mb-1">
            GMFCS Level
          </label>
          <select
            id="gmfcs"
            name="gmfcs"
            value={formData.gmfcs}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          >
            <option value="UNKNOWN">Prefer not to say</option>
            <option value="I">Level I - Walks without limitations</option>
            <option value="II">Level II - Walks with limitations</option>
            <option value="III">Level III - Walks using a hand-held mobility device</option>
            <option value="IV">Level IV - Self-mobility with limitations; may use powered mobility</option>
            <option value="V">Level V - Transported in a manual wheelchair</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-1">
          Password *
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-900 mb-1">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          disabled={isLoading}
          required
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
