import { notFound } from "next/navigation";
import { getUserDetails, getUserActivity, getUserAuditLog } from "./actions";
import AdminBadge from "../../components/AdminBadge";
import UserHeader from "./UserHeader";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, activity, auditLog] = await Promise.all([
    getUserDetails(id),
    getUserActivity(id),
    getUserAuditLog(id),
  ]);

  if (!user) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "SUSPENDED":
        return "danger";
      case "SHADOWBANNED":
        return "warning";
      case "DELETED":
        return "default";
      default:
        return "default";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MODERATOR":
        return "warning";
      case "MEMBER":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <UserHeader
        userId={user.id}
        username={user.username}
        currentRole={user.role}
        currentProfileType={user.profile?.profileType || "NORMAL"}
        currentStatus={user.status}
      />

      {/* Basic Information Card */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-ink-900">
            Basic Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-ink-500 mb-1">Full Name</div>
              <div className="text-base text-ink-900 font-medium">
                {user.name || "No name"}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Username</div>
              <div className="text-base text-ink-900 font-medium">
                @{user.username || "no-username"}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Email</div>
              <div className="text-base text-ink-900">{user.email}</div>
              {user.emailVerified ? (
                <div className="text-xs text-green-600 mt-1">
                  ✓ Verified on{" "}
                  {new Date(user.emailVerified).toLocaleDateString()}
                </div>
              ) : (
                <div className="text-xs text-amber-600 mt-1">
                  ⚠ Not verified
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">User ID</div>
              <div className="text-xs text-ink-700 font-mono bg-neutral-100 px-2 py-1 rounded">
                {user.id}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Role</div>
              <div>
                <AdminBadge variant={getRoleColor(user.role) as any}>
                  {user.role}
                </AdminBadge>
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Status</div>
              <div>
                <AdminBadge variant={getStatusColor(user.status) as any}>
                  {user.status}
                </AdminBadge>
              </div>
            </div>
          </div>

          {user.status === "SUSPENDED" && user.suspendedUntil && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-900 mb-1">
                Account Suspended
              </div>
              <div className="text-sm text-red-700">
                Until: {new Date(user.suspendedUntil).toLocaleString()}
              </div>
              {user.suspensionReason && (
                <div className="text-sm text-red-700 mt-1">
                  Reason: {user.suspensionReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auth Metadata Card */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-ink-900">
            Authentication Metadata
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-ink-500 mb-1">Account Created</div>
              <div className="text-base text-ink-900">
                {new Date(user.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Last Updated</div>
              <div className="text-base text-ink-900">
                {new Date(user.updatedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Last Login</div>
              <div className="text-base text-ink-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : "Never"}
              </div>
            </div>
            <div>
              <div className="text-sm text-ink-500 mb-1">Connected Accounts</div>
              <div className="text-base text-ink-900">
                {user.accounts.length} provider(s)
              </div>
              <div className="flex gap-2 mt-2">
                {user.accounts.map((account) => (
                  <span
                    key={account.provider}
                    className="text-xs bg-neutral-100 px-2 py-1 rounded"
                  >
                    {account.provider}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      {user.profile && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <h2 className="text-lg font-semibold text-ink-900">
              Profile Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-ink-500 mb-1">Profile Type</div>
                <div className="text-base text-ink-900 font-medium">
                  {user.profile.profileType}
                </div>
                {user.profile.isVerified && (
                  <div className="text-xs text-blue-600 mt-1">
                    ✓ Verified on{" "}
                    {user.profile.verifiedAt
                      ? new Date(user.profile.verifiedAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                )}
              </div>
              {user.profile.bio && (
                <div className="col-span-2">
                  <div className="text-sm text-ink-500 mb-1">Bio</div>
                  <div className="text-base text-ink-900">{user.profile.bio}</div>
                </div>
              )}
              {user.profile.region && (
                <div>
                  <div className="text-sm text-ink-500 mb-1">Region</div>
                  <div className="text-base text-ink-900">
                    {user.profile.region}
                  </div>
                </div>
              )}
              {(user.profile.city || user.profile.state || user.profile.zip) && (
                <div>
                  <div className="text-sm text-ink-500 mb-1">Location</div>
                  <div className="text-base text-ink-900">
                    {[user.profile.city, user.profile.state, user.profile.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              )}
              {user.profile.cpSubtype && (
                <div>
                  <div className="text-sm text-ink-500 mb-1">CP Subtype</div>
                  <div className="text-base text-ink-900">
                    {user.profile.cpSubtype}
                  </div>
                </div>
              )}
              {user.profile.gmfcs && (
                <div>
                  <div className="text-sm text-ink-500 mb-1">GMFCS Level</div>
                  <div className="text-base text-ink-900">
                    {user.profile.gmfcs}
                  </div>
                </div>
              )}
              {user.profile.mobilityAids &&
                user.profile.mobilityAids.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-sm text-ink-500 mb-1">
                      Mobility Aids
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.mobilityAids.map((aid) => (
                        <span
                          key={aid}
                          className="text-xs bg-neutral-100 px-2 py-1 rounded"
                        >
                          {aid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {user.profile.assistiveTech &&
                user.profile.assistiveTech.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-sm text-ink-500 mb-1">Assistive Tech</div>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.assistiveTech.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-neutral-100 px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {user.profile.commModes && user.profile.commModes.length > 0 && (
                <div className="col-span-2">
                  <div className="text-sm text-ink-500 mb-1">Communication Modes</div>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.commModes.map((mode) => (
                      <span
                        key={mode}
                        className="text-xs bg-neutral-100 px-2 py-1 rounded"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.profile.transport && (
                <div>
                  <div className="text-sm text-ink-500 mb-1">Transportation</div>
                  <div className="text-base text-ink-900">
                    {user.profile.transport}
                  </div>
                </div>
              )}

              {/* Credentials for verified professional profiles */}
              {(user.profile.profileType === "DOCTOR" ||
                user.profile.profileType === "PT") && user.profile.credentials && (
                  <div className="col-span-2">
                    <div className="text-sm text-ink-500 mb-1">
                      Credentials (Encrypted)
                    </div>
                    <div className="text-xs bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-blue-800">
                        🔒 Encrypted credential data stored (not displayed for security)
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Account Statistics Card */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-ink-900">
            Account Statistics
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">
                {user._count.posts}
              </div>
              <div className="text-sm text-ink-500 mt-1">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">
                {user._count.comments}
              </div>
              <div className="text-sm text-ink-500 mt-1">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">
                {user._count.followers}
              </div>
              <div className="text-sm text-ink-500 mt-1">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">
                {user._count.follows}
              </div>
              <div className="text-sm text-ink-500 mt-1">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-ink-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Recent Posts */}
            <div>
              <h3 className="text-sm font-medium text-ink-700 mb-3">
                Recent Posts ({activity.recentPosts.length})
              </h3>
              {activity.recentPosts.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div className="text-sm text-ink-900 line-clamp-2">
                        {post.body}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-ink-500">
                        <span>{post._count.reactions} reactions</span>
                        <span>{post._count.comments} comments</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-ink-500">No posts yet</div>
              )}
            </div>

            {/* Recent Comments */}
            <div>
              <h3 className="text-sm font-medium text-ink-700 mb-3">
                Recent Comments ({activity.recentComments.length})
              </h3>
              {activity.recentComments.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div className="text-sm text-ink-900 line-clamp-2">
                        {comment.body}
                      </div>
                      <div className="text-xs text-ink-500 mt-2">
                        On: {comment.post.body.slice(0, 50)}...
                      </div>
                      <div className="text-xs text-ink-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-ink-500">No comments yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Card */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-lg font-semibold text-ink-900">
            Admin Action History
          </h2>
        </div>
        <div className="p-6">
          {auditLog.length > 0 ? (
            <div className="space-y-3">
              {auditLog.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-ink-900">
                        {log.action}
                      </div>
                      {log.detail && (
                        <div className="text-sm text-ink-600 mt-1">
                          {typeof log.detail === 'object' && log.detail !== null && 'message' in log.detail
                            ? (log.detail as any).message
                            : JSON.stringify(log.detail)}
                        </div>
                      )}
                      <div className="text-xs text-ink-500 mt-2">
                        By: {
                          log.actor?.name || log.actor?.username ||
                          (typeof log.detail === 'object' && log.detail !== null && 'adminName' in log.detail
                            ? `${(log.detail as any).adminName} (Admin)`
                            : "System")
                        }
                      </div>
                    </div>
                    <div className="text-xs text-ink-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {log.ipAddress && (
                    <div className="text-xs text-ink-400 mt-2 font-mono">
                      IP: {log.ipAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-ink-500">
              No admin actions recorded for this user
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions Card */}
      {user.sessions.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <h2 className="text-lg font-semibold text-ink-900">
              Recent Sessions
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {user.sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-ink-500">Session Token</div>
                      <div className="text-xs font-mono text-ink-700 mt-1">
                        {session.sessionToken.slice(0, 32)}...
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-ink-500">Expires</div>
                      <div className="text-xs text-ink-700 mt-1">
                        {new Date(session.expires).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
