import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

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

  const { username } = params;

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

  if (!profileUser) {
    notFound();
  }

  // Check if this is the current user's profile
  const isOwnProfile = session.user.id === profileUser.id;

  // Check if current user is following this profile
  const isFollowing = !isOwnProfile
    ? await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: session.user.id!,
            followeeId: profileUser.id,
          },
        },
      })
    : null;

  const profile = profileUser.profile;

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
                    alt={profile?.displayName || username}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-amber-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-amber-700">
                      {(profile?.displayName || username).charAt(0).toUpperCase()}
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
                <button
                  className={`rounded-lg px-4 py-2 text-sm font-medium mb-2 ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-amber-900">
                  {profile?.displayName || username}
                </h1>
                <p className="text-amber-600">@{username}</p>
                {profile?.pronouns && (
                  <p className="text-amber-700 text-sm mt-1">{profile.pronouns}</p>
                )}
              </div>

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
              {profile?.bio && (
                <div>
                  <p className="text-amber-900 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {profile?.cpSubtype && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                      CP Subtype
                    </h3>
                    <p className="text-amber-900">{profile.cpSubtype}</p>
                  </div>
                )}

                {profile?.location && (
                  <div>
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">
                      Location
                    </h3>
                    <p className="text-amber-900">{profile.location}</p>
                  </div>
                )}

                {profile?.mobilityAids && profile.mobilityAids.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">
                      Mobility Aids
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.mobilityAids.map((aid, index) => (
                        <span
                          key={index}
                          className="inline-block bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm"
                        >
                          {aid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Section */}
            <div className="mt-8 pt-8 border-t border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-4">Photos</h2>
              {profile?.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {profile.photos.map((photo, index) => (
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-square bg-amber-50 rounded-lg flex items-center justify-center">
                    <p className="text-amber-400 text-sm">No photos yet</p>
                  </div>
                </div>
              )}
            </div>

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