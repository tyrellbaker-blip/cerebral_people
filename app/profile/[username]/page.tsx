import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyVisibility, isFollowing } from "@/lib/profile";
import Link from "next/link";
import Image from "next/image";
import FollowButton from "@/app/components/FollowButton";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const { username } = await params;

  // Fetch the user by username
  const profileUser = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      _count: {
        select: {
          followers: true,
          follows: true,
          posts: true,
        },
      },
    },
  });

  if (!profileUser || !profileUser.profile) {
    notFound();
  }

  const currentUserId = (session.user as any).id as string;

  // Check if this is the current user's profile
  const isOwnProfile = currentUserId === profileUser.id;

  // Check if current user is following this profile
  const isFollowerFlag = isOwnProfile ? false : await isFollowing(currentUserId, profileUser.id);

  const profile = profileUser.profile;

  // Apply privacy filtering
  const visibleData = applyVisibility(
    currentUserId,
    profileUser.id,
    {
      displayName: profile.displayName,
      pronouns: profile.pronouns,
      bio: profile.bio,
      region: profile.region,
      cpSubtype: profile.cpSubtype,
      gmfcs: profile.gmfcs,
      mobilityAids: profile.mobilityAids,
      assistiveTech: profile.assistiveTech,
      commModes: profile.commModes,
      exerciseTolerance: profile.exerciseTolerance,
      bestTimes: profile.bestTimes,
      transport: profile.transport,
      badges: profile.badges,
      photos: profile.photos,
    },
    profile.visibility,
    isFollowerFlag
  );

  const formatEnumValue = (value: string) => {
    return value
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-32"></div>

          <div className="px-8 pb-8">
            {/* Profile Image and Actions */}
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                {profileUser.image ? (
                  <Image
                    src={profileUser.image}
                    alt={visibleData.displayName || username}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-amber-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-amber-700">
                      {(visibleData.displayName || username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {isOwnProfile ? (
                <Link
                  href="/profile/edit"
                  className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 mb-2"
                >
                  Edit Profile
                </Link>
              ) : (
                <div className="mb-2">
                  <FollowButton
                    username={username}
                    isFollowing={isFollowerFlag}
                    isOwnProfile={isOwnProfile}
                  />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-900">
                  {visibleData.displayName || username}
                </h1>
                <p className="text-amber-600">@{username}</p>
                {visibleData.pronouns && (
                  <p className="text-amber-700 text-sm mt-1">{visibleData.pronouns}</p>
                )}
              </div>

              {/* Badges */}
              {visibleData.badges && visibleData.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {visibleData.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formatEnumValue(badge)}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-amber-900">
                    {profileUser._count.posts}
                  </span>
                  <span className="text-amber-700"> posts</span>
                </div>
                <div>
                  <span className="font-bold text-amber-900">
                    {profileUser._count.followers}
                  </span>
                  <span className="text-amber-700"> followers</span>
                </div>
                <div>
                  <span className="font-bold text-amber-900">
                    {profileUser._count.follows}
                  </span>
                  <span className="text-amber-700"> following</span>
                </div>
              </div>

              {/* Bio */}
              {visibleData.bio && (
                <div>
                  <p className="text-amber-900 whitespace-pre-wrap">{visibleData.bio}</p>
                </div>
              )}

              {/* CP Information */}
              {(visibleData.cpSubtype || visibleData.gmfcs || visibleData.region) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {visibleData.cpSubtype && visibleData.cpSubtype !== "UNKNOWN" && (
                    <div>
                      <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                        CP Subtype
                      </h3>
                      <p className="text-amber-900">{formatEnumValue(visibleData.cpSubtype)}</p>
                    </div>
                  )}

                  {visibleData.gmfcs && visibleData.gmfcs !== "UNKNOWN" && (
                    <div>
                      <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                        GMFCS Level
                      </h3>
                      <p className="text-amber-900">{visibleData.gmfcs}</p>
                    </div>
                  )}

                  {visibleData.region && (
                    <div>
                      <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                        Region
                      </h3>
                      <p className="text-amber-900">{visibleData.region}</p>
                    </div>
                  )}

                  {visibleData.transport && visibleData.transport !== "OTHER" && (
                    <div>
                      <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                        Primary Transport
                      </h3>
                      <p className="text-amber-900">{formatEnumValue(visibleData.transport)}</p>
                    </div>
                  )}

                  {visibleData.exerciseTolerance && (
                    <div>
                      <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                        Exercise Tolerance
                      </h3>
                      <p className="text-amber-900">{visibleData.exerciseTolerance}/5</p>
                    </div>
                  )}
                </div>
              )}

              {/* Arrays: Mobility Aids, Assistive Tech, Communication */}
              <div className="space-y-4 pt-2">
                {visibleData.mobilityAids && visibleData.mobilityAids.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">
                      Mobility Aids
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {visibleData.mobilityAids.map((aid, index) => (
                        <span
                          key={index}
                          className="inline-block bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {formatEnumValue(aid)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {visibleData.assistiveTech && visibleData.assistiveTech.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">
                      Assistive Technology
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {visibleData.assistiveTech.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {formatEnumValue(tech)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {visibleData.commModes && visibleData.commModes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">
                      Communication
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {visibleData.commModes.map((mode, index) => (
                        <span
                          key={index}
                          className="inline-block bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {formatEnumValue(mode)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {visibleData.bestTimes && visibleData.bestTimes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">
                      Best Times
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {visibleData.bestTimes.map((time, index) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {formatEnumValue(time)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Section */}
            {visibleData.photos !== undefined && (
              <div className="mt-8 pt-8 border-t border-amber-200">
                <h2 className="text-xl font-bold text-amber-900 mb-4">Photos</h2>
                {visibleData.photos && visibleData.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {visibleData.photos.map((photo, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-amber-600">
                    <p className="text-sm">No photos yet</p>
                  </div>
                )}
              </div>
            )}

            {/* About Section */}
            <div className="mt-8 pt-8 border-t border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-4">About</h2>
              <div className="space-y-2 text-sm text-amber-700">
                <p>
                  Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}