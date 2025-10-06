"use client";

import { useState } from "react";
import { DEFAULT_VIS } from "@/lib/profile";

interface ProfileEditFormProps {
  profile?: any;
  updateProfileAction: (formData: FormData) => Promise<void>;
}

const FIELDS = [
  "displayName",
  "pronouns",
  "bio",
  "region",
  "cpSubtype",
  "gmfcs",
  "mobilityAids",
  "assistiveTech",
  "commModes",
  "exerciseTolerance",
  "bestTimes",
  "transport",
  "a11yPrefs",
] as const;

export default function ProfileEditForm({ profile, updateProfileAction }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const V = (profile?.visibility as any) || DEFAULT_VIS;
  const a11y = (profile?.a11yPrefs as any) || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateProfileAction(formData);
    } catch (error) {
      alert("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const CheckboxOption = ({ name, value, label, defaultChecked }: any) => (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
      <span className="text-amber-900">{label}</span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-900 border-b border-amber-200 pb-2">
          Basic Information
        </h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-amber-900 mb-1">
            Display Name *
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={profile?.displayName ?? ""}
            required
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="pronouns" className="block text-sm font-medium text-amber-900 mb-1">
            Pronouns
          </label>
          <input
            id="pronouns"
            name="pronouns"
            type="text"
            placeholder="e.g., she/her, he/him, they/them"
            defaultValue={profile?.pronouns ?? ""}
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-amber-900 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="Tell us about yourself..."
            defaultValue={profile?.bio ?? ""}
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-amber-900 mb-1">
            Region / Location
          </label>
          <input
            id="region"
            name="region"
            type="text"
            placeholder="e.g., San Francisco, CA"
            defaultValue={profile?.region ?? ""}
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-amber-600 mt-1">Optional - share as much or as little as you want</p>
        </div>
      </section>

      {/* CP-Specific Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-900 border-b border-amber-200 pb-2">
          CP Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpSubtype" className="block text-sm font-medium text-amber-900 mb-1">
              CP Subtype
            </label>
            <select
              id="cpSubtype"
              name="cpSubtype"
              defaultValue={profile?.cpSubtype ?? "UNKNOWN"}
              className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              defaultValue={profile?.gmfcs ?? "UNKNOWN"}
              className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="UNKNOWN">Prefer not to say</option>
              <option value="I">I - Walks without limitations</option>
              <option value="II">II - Walks with limitations</option>
              <option value="III">III - Walks with assistive devices</option>
              <option value="IV">IV - Self-mobility with limitations</option>
              <option value="V">V - Transported in manual wheelchair</option>
            </select>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-amber-900">Mobility Aids</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CheckboxOption name="mobilityAids" value="NONE" label="None" defaultChecked={profile?.mobilityAids?.includes("NONE")} />
            <CheckboxOption name="mobilityAids" value="CANE" label="Cane" defaultChecked={profile?.mobilityAids?.includes("CANE")} />
            <CheckboxOption name="mobilityAids" value="WALKER" label="Walker" defaultChecked={profile?.mobilityAids?.includes("WALKER")} />
            <CheckboxOption name="mobilityAids" value="MANUAL_CHAIR" label="Manual Wheelchair" defaultChecked={profile?.mobilityAids?.includes("MANUAL_CHAIR")} />
            <CheckboxOption name="mobilityAids" value="POWER_CHAIR" label="Power Wheelchair" defaultChecked={profile?.mobilityAids?.includes("POWER_CHAIR")} />
            <CheckboxOption name="mobilityAids" value="ANKLE_FOOT_ORTHOSIS" label="AFO" defaultChecked={profile?.mobilityAids?.includes("ANKLE_FOOT_ORTHOSIS")} />
            <CheckboxOption name="mobilityAids" value="OTHER" label="Other" defaultChecked={profile?.mobilityAids?.includes("OTHER")} />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-amber-900">Assistive Technology</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CheckboxOption name="assistiveTech" value="SPEECH_DEVICE" label="Speech Device" defaultChecked={profile?.assistiveTech?.includes("SPEECH_DEVICE")} />
            <CheckboxOption name="assistiveTech" value="EYETRACKER" label="Eye Tracker" defaultChecked={profile?.assistiveTech?.includes("EYETRACKER")} />
            <CheckboxOption name="assistiveTech" value="SWITCH_CONTROL" label="Switch Control" defaultChecked={profile?.assistiveTech?.includes("SWITCH_CONTROL")} />
            <CheckboxOption name="assistiveTech" value="HEADPOINTER" label="Head Pointer" defaultChecked={profile?.assistiveTech?.includes("HEADPOINTER")} />
            <CheckboxOption name="assistiveTech" value="VOICE_CONTROL" label="Voice Control" defaultChecked={profile?.assistiveTech?.includes("VOICE_CONTROL")} />
            <CheckboxOption name="assistiveTech" value="SCREEN_READER" label="Screen Reader" defaultChecked={profile?.assistiveTech?.includes("SCREEN_READER")} />
            <CheckboxOption name="assistiveTech" value="ALT_KEYBOARD" label="Alt Keyboard" defaultChecked={profile?.assistiveTech?.includes("ALT_KEYBOARD")} />
            <CheckboxOption name="assistiveTech" value="OTHER" label="Other" defaultChecked={profile?.assistiveTech?.includes("OTHER")} />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-amber-900">Communication Modes</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <CheckboxOption name="commModes" value="TYPING" label="Typing" defaultChecked={profile?.commModes?.includes("TYPING")} />
            <CheckboxOption name="commModes" value="VOICE" label="Voice" defaultChecked={profile?.commModes?.includes("VOICE")} />
            <CheckboxOption name="commModes" value="TEXT_TO_SPEECH" label="Text-to-Speech" defaultChecked={profile?.commModes?.includes("TEXT_TO_SPEECH")} />
            <CheckboxOption name="commModes" value="AAC" label="AAC" defaultChecked={profile?.commModes?.includes("AAC")} />
            <CheckboxOption name="commModes" value="GESTURES" label="Gestures" defaultChecked={profile?.commModes?.includes("GESTURES")} />
          </div>
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="exerciseTolerance" className="block text-sm font-medium text-amber-900 mb-1">
              Exercise Tolerance (1-5)
            </label>
            <input
              id="exerciseTolerance"
              name="exerciseTolerance"
              type="number"
              min={1}
              max={5}
              defaultValue={profile?.exerciseTolerance ?? 3}
              className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-amber-600 mt-1">1 = Very low, 5 = Very high</p>
          </div>

          <div>
            <label htmlFor="transport" className="block text-sm font-medium text-amber-900 mb-1">
              Primary Transportation
            </label>
            <select
              id="transport"
              name="transport"
              defaultValue={profile?.transport ?? "OTHER"}
              className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PUBLIC_TRANSIT">Public Transit</option>
              <option value="RIDE_SHARE">Ride Share</option>
              <option value="ADAPTED_VAN">Adapted Van</option>
              <option value="PARATRANSIT">Paratransit</option>
              <option value="FAMILY">Family</option>
              <option value="FRIENDS">Friends</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-amber-900">Best Times of Day</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CheckboxOption name="bestTimes" value="MORNING" label="Morning" defaultChecked={profile?.bestTimes?.includes("MORNING")} />
            <CheckboxOption name="bestTimes" value="AFTERNOON" label="Afternoon" defaultChecked={profile?.bestTimes?.includes("AFTERNOON")} />
            <CheckboxOption name="bestTimes" value="EVENING" label="Evening" defaultChecked={profile?.bestTimes?.includes("EVENING")} />
            <CheckboxOption name="bestTimes" value="LATE_NIGHT" label="Late Night" defaultChecked={profile?.bestTimes?.includes("LATE_NIGHT")} />
          </div>
        </fieldset>
      </section>

      {/* Accessibility Preferences */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-900 border-b border-amber-200 pb-2">
          Accessibility Preferences
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fontSize" className="block text-sm font-medium text-amber-900 mb-1">
              Font Size
            </label>
            <select
              id="fontSize"
              name="fontSize"
              defaultValue={a11y.fontSize ?? "md"}
              className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <CheckboxOption name="contrast" value="high" label="High Contrast Mode" defaultChecked={a11y.contrast} />
          <CheckboxOption name="reduceMotion" value="true" label="Reduce Motion" defaultChecked={a11y.reduceMotion} />
          <CheckboxOption name="dyslexiaFont" value="true" label="Dyslexia-Friendly Font" defaultChecked={a11y.dyslexiaFont} />
        </div>
      </section>

      {/* Privacy Controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-amber-900 border-b border-amber-200 pb-2">
          Privacy Settings
        </h2>
        <p className="text-sm text-amber-700">Control who can see each field of your profile</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FIELDS.map((field) => (
            <div key={field} className="flex items-center justify-between rounded-lg border border-amber-200 p-3">
              <span className="text-sm font-medium text-amber-900 capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <select
                name={`vis:${field}`}
                defaultValue={(V[field] ?? "PUBLIC") as string}
                className="text-sm rounded border border-amber-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PUBLIC">Public</option>
                <option value="FOLLOWERS">Followers</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-amber-600 text-white px-6 py-3 font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
        <a
          href="/profile"
          className="rounded-lg border border-amber-300 text-amber-800 px-6 py-3 font-medium hover:bg-amber-50 text-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}