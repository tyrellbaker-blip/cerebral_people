"use server";

import { prisma } from "@/lib/prisma";
import { CPSubtype, GMFCS, Prisma, ProfileType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { DEFAULT_VIS } from "@/lib/profile";
import { geocodeZipCode } from "@/lib/geocode";

export async function signUpAction(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const pronouns = formData.get("pronouns") as string;
    const profileType = (formData.get("profileType") as string) || "NORMAL";

    // Role-specific fields
    const cpSubtype = formData.get("cpSubtype") as string;
    const gmfcs = formData.get("gmfcs") as string;
    const relationshipToCP = formData.get("relationshipToCP") as string;

    // CP-related fields (for NORMAL and PARENT)
    const mobilityAidsRaw = formData.get("mobilityAids") as string;
    const assistiveTechRaw = formData.get("assistiveTech") as string;
    const commModesRaw = formData.get("commModes") as string;
    const exerciseTolerance = formData.get("exerciseTolerance") as string;
    const transport = formData.get("transport") as string;
    const bestTimesRaw = formData.get("bestTimes") as string;

    // Parse JSON arrays
    const mobilityAids = mobilityAidsRaw ? JSON.parse(mobilityAidsRaw) : [];
    const assistiveTech = assistiveTechRaw ? JSON.parse(assistiveTechRaw) : [];
    const commModes = commModesRaw ? JSON.parse(commModesRaw) : [];
    const bestTimes = bestTimesRaw ? JSON.parse(bestTimesRaw) : [];

    // Professional credential fields
    const licenseNumber = formData.get("licenseNumber") as string;
    const licenseState = formData.get("licenseState") as string;
    const npi = formData.get("npi") as string;
    const professionalWebsite = formData.get("professionalWebsite") as string;

    // Validate required inputs
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth || !city || !state || !zip) {
      return { success: false, error: "All required fields must be filled" };
    }

    // Validate professional credentials if professional role
    if ((profileType === "PT" || profileType === "DOCTOR") && (!licenseNumber || !licenseState)) {
      return { success: false, error: "License number and state are required for healthcare professionals" };
    }

    // Combine first and last name for display name
    const displayName = `${firstName} ${lastName}`;

    // Verify age is 18+
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    if (actualAge < 18) {
      return { success: false, error: "You must be 18 or older to join" };
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return { success: false, error: "Username already taken. Please choose a different username." };
      }
      if (existingUser.email === email) {
        return { success: false, error: "Email already registered. Please sign in or use a different email." };
      }
    }

    // Check if display name already exists
    const existingProfile = await prisma.profile.findFirst({
      where: { displayName },
    });

    if (existingProfile) {
      return { success: false, error: "Display name already taken. Please choose a different display name." };
    }

    // Geocode the zip code to get lat/long
    const coordinates = await geocodeZipCode(zip);

    if (!coordinates) {
      return { success: false, error: "Unable to verify zip code. Please check your zip code and try again." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare profile data based on profile type
    const profileData: any = {
      displayName,
      pronouns: pronouns || null,
      city,
      state: state.toUpperCase(),
      zip,
      latitude: new Prisma.Decimal(coordinates.lat),
      longitude: new Prisma.Decimal(coordinates.lng),
      profileType: profileType as ProfileType,
      badges: ["18_PLUS"], // All users have confirmed 18+
      visibility: DEFAULT_VIS,
    };

    // Add role-specific data
    if (profileType === "NORMAL" || profileType === "PARENT") {
      // Person with CP or Parent/Caretaker - include CP-related fields
      profileData.cpSubtype = (cpSubtype as CPSubtype) || CPSubtype.UNKNOWN;
      profileData.gmfcs = (gmfcs as GMFCS) || GMFCS.UNKNOWN;
      profileData.mobilityAids = mobilityAids;
      profileData.assistiveTech = assistiveTech;
      profileData.commModes = commModes;
      profileData.exerciseTolerance = exerciseTolerance ? parseInt(exerciseTolerance) : null;
      profileData.transport = transport || null;
      profileData.bestTimes = bestTimes;

      if (profileType === "PARENT" && relationshipToCP) {
        // Parent/Caretaker - store relationship in bio if provided
        profileData.bio = `${relationshipToCP} supporting someone with CP`;
      }
    } else if (profileType === "PT" || profileType === "DOCTOR") {
      // Healthcare professionals - no CP-specific fields
      profileData.cpSubtype = null;
      profileData.gmfcs = null;
    }

    // Create user with profile and verification request if professional
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: displayName, // Combined name for NextAuth compatibility
        dateOfBirth: new Date(dateOfBirth),
        emailVerified: new Date(), // Auto-verify for now
        profile: {
          create: profileData,
        },
        // Create verification request for professionals
        ...(profileType === "PT" || profileType === "DOCTOR" ? {
          verificationRequest: {
            create: {
              role: profileType === "PT" ? "PT" : profileType === "DOCTOR" ? "MD" : "MD",
              licenseNumber,
              licenseState: licenseState.toUpperCase(),
              npi: npi || null,
              websiteUrl: professionalWebsite || null,
              status: "PENDING",
            },
          },
        } : {}),
      },
    });

    console.log(`✅ New user registered: ${username} (${email})`);
    if (profileType === "PT" || profileType === "DOCTOR") {
      console.log(`📋 Verification request created for ${username}`);
    }

    // Redirect to sign in page
    redirect("/signin?registered=true");
  } catch (error) {
    // Re-throw redirect errors (they're not actual errors)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error("Signup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create account. Please try again."
    };
  }
}
