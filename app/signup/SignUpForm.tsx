"use client";

import { useState } from "react";
import { z } from "zod";

// Base schema for all users
const baseSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
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
  dateOfBirth: z.string()
    .min(1, "Date of birth is required"),
  city: z.string()
    .min(1, "City is required"),
  state: z.string()
    .min(2, "State is required")
    .max(2, "State must be 2 letters (e.g., CA, NY)"),
  zip: z.string()
    .min(5, "Zip code must be 5 digits")
    .max(5, "Zip code must be 5 digits")
    .regex(/^\d{5}$/, "Zip code must be exactly 5 digits"),
  pronouns: z.string().optional(),
  profileType: z.enum(["NORMAL", "PARENT", "PT", "DOCTOR"]),
});

// Role-specific fields
const memberSchema = baseSchema.extend({
  cpSubtype: z.string().optional(),
  gmfcs: z.string().optional(),
});

const parentSchema = baseSchema.extend({
  relationshipToCP: z.string().optional(),
});

const professionalSchema = baseSchema.extend({
  licenseNumber: z.string().min(1, "License number is required"),
  licenseState: z.string().min(2, "License state is required").max(2, "State must be 2 letters"),
  npi: z.string().optional(),
  professionalWebsite: z.string().optional(),
});

const signUpSchema = z.union([memberSchema, parentSchema, professionalSchema])
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

interface SignUpFormProps {
  signUpAction?: (formData: FormData) => Promise<{ success: boolean; error?: string } | void>;
}

type ProfileType = "NORMAL" | "PARENT" | "PT" | "DOCTOR";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function SignUpForm({ signUpAction }: SignUpFormProps) {
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    city: "",
    state: "",
    zip: "",
    pronouns: "",
    cpSubtype: "UNKNOWN",
    gmfcs: "UNKNOWN",
    relationshipToCP: "",
    licenseNumber: "",
    licenseState: "",
    npi: "",
    professionalWebsite: "",
    mobilityAids: [] as string[],
    assistiveTech: [] as string[],
    commModes: [] as string[],
    exerciseTolerance: "",
    transport: "",
    bestTimes: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [npiVerifying, setNpiVerifying] = useState(false);
  const [npiVerified, setNpiVerified] = useState(false);
  const [npiError, setNpiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleCheckboxChange = (fieldName: string, value: string) => {
    const currentValues = formData[fieldName as keyof typeof formData] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFormData({ ...formData, [fieldName]: newValues });
  };

  // Verify NPI in real-time for professionals
  const handleVerifyNPI = async () => {
    if (!formData.npi || !formData.firstName || !formData.lastName || !formData.licenseState) {
      setNpiError("Please fill in your name, license state, and NPI first");
      return;
    }

    setNpiVerifying(true);
    setNpiError(null);

    try {
      const response = await fetch("/api/verify/npi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npi: formData.npi,
          firstName: formData.firstName,
          lastName: formData.lastName,
          state: formData.licenseState,
          role: profileType === "PT" ? "PT" : "MD",
        }),
      });

      const data = await response.json();

      if (response.ok && data.match) {
        setNpiVerified(true);
        setNpiError(null);
      } else {
        setNpiVerified(false);
        setNpiError(data.reason || "NPI verification failed");
      }
    } catch (error) {
      setNpiVerified(false);
      setNpiError("Unable to verify NPI at this time");
    } finally {
      setNpiVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!profileType) {
      setErrors({ submit: "Please select your role" });
      return;
    }

    const validationData = {
      ...formData,
      profileType,
    };

    const result = signUpSchema.safeParse(validationData);

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
      formDataObj.append("firstName", formData.firstName);
      formDataObj.append("lastName", formData.lastName);
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("dateOfBirth", formData.dateOfBirth);
      formDataObj.append("city", formData.city);
      formDataObj.append("state", formData.state);
      formDataObj.append("zip", formData.zip);
      formDataObj.append("pronouns", formData.pronouns);
      formDataObj.append("profileType", profileType);

      // Add role-specific fields
      if (profileType === "NORMAL" || profileType === "PARENT") {
        formDataObj.append("cpSubtype", formData.cpSubtype);
        formDataObj.append("gmfcs", formData.gmfcs);
        formDataObj.append("mobilityAids", JSON.stringify(formData.mobilityAids));
        formDataObj.append("assistiveTech", JSON.stringify(formData.assistiveTech));
        formDataObj.append("commModes", JSON.stringify(formData.commModes));
        formDataObj.append("exerciseTolerance", formData.exerciseTolerance);
        formDataObj.append("transport", formData.transport);
        formDataObj.append("bestTimes", JSON.stringify(formData.bestTimes));
        if (profileType === "PARENT") {
          formDataObj.append("relationshipToCP", formData.relationshipToCP);
        }
      } else if (profileType === "PT" || profileType === "DOCTOR") {
        formDataObj.append("licenseNumber", formData.licenseNumber);
        formDataObj.append("licenseState", formData.licenseState);
        formDataObj.append("npi", formData.npi);
        formDataObj.append("professionalWebsite", formData.professionalWebsite);
      }

      if (signUpAction) {
        const result = await signUpAction(formDataObj);

        if (result && !result.success) {
          setErrors({ submit: result.error || "Failed to create account. Please try again." });
          setIsLoading(false);
          return;
        }
      }

      setSuccess(true);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Role selection screen
  if (!profileType) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">Who are you?</h2>
          <p className="text-sm text-amber-700">Select the option that best describes you</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setProfileType("NORMAL")}
            className="w-full p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="font-semibold text-amber-900 mb-1">🧑 I'm a person with CP</div>
            <div className="text-sm text-amber-700">Join as a community member</div>
          </button>

          <button
            type="button"
            onClick={() => setProfileType("PARENT")}
            className="w-full p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="font-semibold text-amber-900 mb-1">👨‍👩‍👧 I'm a parent or caretaker</div>
            <div className="text-sm text-amber-700">Supporting someone with CP</div>
          </button>

          <button
            type="button"
            onClick={() => setProfileType("PT")}
            className="w-full p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="font-semibold text-amber-900 mb-1">🏃 I'm a physical therapist</div>
            <div className="text-sm text-amber-700">Join as a healthcare professional</div>
          </button>

          <button
            type="button"
            onClick={() => setProfileType("DOCTOR")}
            className="w-full p-4 border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors text-left"
          >
            <div className="font-semibold text-amber-900 mb-1">👨‍⚕️ I'm a doctor or nurse practitioner</div>
            <div className="text-sm text-amber-700">Join as a medical professional</div>
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {/* Show selected role with option to go back */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-amber-700">Signing up as: </span>
          <span className="font-semibold text-amber-900">
            {profileType === "NORMAL" && "Person with CP"}
            {profileType === "PARENT" && "Parent/Caretaker"}
            {profileType === "PT" && "Physical Therapist"}
            {profileType === "DOCTOR" && "Doctor/NP"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setProfileType(null)}
          className="text-xs text-amber-600 hover:text-amber-800 underline"
        >
          Change
        </button>
      </div>


      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-amber-900 mb-1">
            First Name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
            required
          />
          {errors.firstName && (
            <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-amber-900 mb-1">
            Last Name *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
            required
          />
          {errors.lastName && (
            <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900 mb-3">
          <strong>Location Information</strong> - We use your location to connect you with people nearby.
          You control who sees this in your privacy settings.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-amber-900 mb-1">
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
              required
            />
            {errors.city && (
              <p className="text-red-600 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-amber-900 mb-1">
              State * <span className="text-xs text-amber-600">(2 letters)</span>
            </label>
            <input
              id="state"
              name="state"
              type="text"
              maxLength={2}
              placeholder="CA"
              value={formData.state}
              onChange={handleChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
              disabled={isLoading}
              required
            />
            {errors.state && (
              <p className="text-red-600 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-amber-900 mb-1">
            Zip Code *
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            maxLength={5}
            placeholder="12345"
            value={formData.zip}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
            required
          />
          {errors.zip && (
            <p className="text-red-600 text-sm mt-1">{errors.zip}</p>
          )}
        </div>
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
      </div>

      {/* Member-specific fields (Person with CP) */}
      {profileType === "NORMAL" && (
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
      )}

      {/* Parent-specific fields */}
      {profileType === "PARENT" && (
        <div>
          <label htmlFor="relationshipToCP" className="block text-sm font-medium text-amber-900 mb-1">
            Your relationship (optional)
          </label>
          <input
            id="relationshipToCP"
            name="relationshipToCP"
            type="text"
            placeholder="e.g., Parent, Spouse, Caregiver"
            value={formData.relationshipToCP}
            onChange={handleChange}
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          />
          <p className="text-xs text-amber-600 mt-1">
            Describe your relationship to the person with CP you're supporting
          </p>
        </div>
      )}

      {/* Additional CP-related fields for both NORMAL and PARENT */}
      {(profileType === "NORMAL" || profileType === "PARENT") && (
        <div className="space-y-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-900">
            Additional Information (all optional)
          </p>

          {/* Mobility Aids */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Mobility Aids
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "NONE", label: "None" },
                { value: "CANE", label: "Cane" },
                { value: "WALKER", label: "Walker" },
                { value: "MANUAL_CHAIR", label: "Manual Wheelchair" },
                { value: "POWER_CHAIR", label: "Power Wheelchair" },
                { value: "ANKLE_FOOT_ORTHOSIS", label: "AFO" },
                { value: "OTHER", label: "Other" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-amber-900">
                  <input
                    type="checkbox"
                    checked={formData.mobilityAids.includes(option.value)}
                    onChange={() => handleCheckboxChange("mobilityAids", option.value)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Assistive Technology */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Assistive Technology
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "SPEECH_DEVICE", label: "Speech Device" },
                { value: "EYETRACKER", label: "Eye Tracker" },
                { value: "SWITCH_CONTROL", label: "Switch Control" },
                { value: "HEADPOINTER", label: "Head Pointer" },
                { value: "VOICE_CONTROL", label: "Voice Control" },
                { value: "SCREEN_READER", label: "Screen Reader" },
                { value: "ALT_KEYBOARD", label: "Alt Keyboard" },
                { value: "OTHER", label: "Other" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-amber-900">
                  <input
                    type="checkbox"
                    checked={formData.assistiveTech.includes(option.value)}
                    onChange={() => handleCheckboxChange("assistiveTech", option.value)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Communication Modes */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Communication Modes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "TYPING", label: "Typing" },
                { value: "VOICE", label: "Voice" },
                { value: "TEXT_TO_SPEECH", label: "Text-to-Speech" },
                { value: "AAC", label: "AAC" },
                { value: "GESTURES", label: "Gestures" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-amber-900">
                  <input
                    type="checkbox"
                    checked={formData.commModes.includes(option.value)}
                    onChange={() => handleCheckboxChange("commModes", option.value)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Exercise Tolerance */}
          <div>
            <label htmlFor="exerciseTolerance" className="block text-sm font-medium text-amber-900 mb-1">
              Exercise Tolerance
            </label>
            <select
              id="exerciseTolerance"
              name="exerciseTolerance"
              value={formData.exerciseTolerance}
              onChange={handleChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            >
              <option value="">Select tolerance level</option>
              <option value="1">1 - Very low</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Moderate</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Very high</option>
            </select>
          </div>

          {/* Primary Transportation */}
          <div>
            <label htmlFor="transport" className="block text-sm font-medium text-amber-900 mb-1">
              Primary Transportation
            </label>
            <select
              id="transport"
              name="transport"
              value={formData.transport}
              onChange={handleChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            >
              <option value="">Select primary transportation</option>
              <option value="PUBLIC_TRANSIT">Public Transit</option>
              <option value="RIDE_SHARE">Ride Share</option>
              <option value="ADAPTED_VAN">Adapted Van</option>
              <option value="PARATRANSIT">Paratransit</option>
              <option value="FAMILY">Family</option>
              <option value="FRIENDS">Friends</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Best Times of Day */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Best Times of Day
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "MORNING", label: "Morning" },
                { value: "AFTERNOON", label: "Afternoon" },
                { value: "EVENING", label: "Evening" },
                { value: "LATE_NIGHT", label: "Late Night" },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm text-amber-900">
                  <input
                    type="checkbox"
                    checked={formData.bestTimes.includes(option.value)}
                    onChange={() => handleCheckboxChange("bestTimes", option.value)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Professional credential fields */}
      {(profileType === "PT" || profileType === "DOCTOR") && (
        <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-900 mb-2">
            Professional Credentials
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-amber-900 mb-1">
              License Number *
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="Your professional license number"
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
              required
            />
            {errors.licenseNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.licenseNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="licenseState" className="block text-sm font-medium text-amber-900 mb-1">
              License State *
            </label>
            <select
              id="licenseState"
              name="licenseState"
              value={formData.licenseState}
              onChange={handleChange}
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
              required
            >
              <option value="">Select state</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.licenseState && (
              <p className="text-red-600 text-sm mt-1">{errors.licenseState}</p>
            )}
          </div>

          <div>
            <label htmlFor="npi" className="block text-sm font-medium text-amber-900 mb-1">
              NPI Number (optional but recommended)
            </label>
            <div className="flex gap-2">
              <input
                id="npi"
                name="npi"
                type="text"
                value={formData.npi}
                onChange={handleChange}
                placeholder="10-digit National Provider Identifier"
                maxLength={10}
                className="flex-1 rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                disabled={isLoading}
              />
              {formData.npi && (
                <button
                  type="button"
                  onClick={handleVerifyNPI}
                  disabled={npiVerifying || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {npiVerifying ? "Verifying..." : "Verify NPI"}
                </button>
              )}
            </div>
            {npiVerified && (
              <p className="text-green-600 text-sm mt-1">✓ NPI verified successfully</p>
            )}
            {npiError && (
              <p className="text-amber-600 text-sm mt-1">{npiError}</p>
            )}
            <p className="text-xs text-amber-600 mt-1">
              Providing your NPI speeds up verification. Find yours at{" "}
              <a
                href="https://npiregistry.cms.hhs.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                npiregistry.cms.hhs.gov
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="professionalWebsite" className="block text-sm font-medium text-amber-900 mb-1">
              Professional Website or Clinic URL (optional)
            </label>
            <input
              id="professionalWebsite"
              name="professionalWebsite"
              type="url"
              value={formData.professionalWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            />
          </div>

          <p className="text-xs text-blue-700">
            Your credentials will be reviewed by our admin team before your professional badge is activated.
          </p>
        </div>
      )}

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
